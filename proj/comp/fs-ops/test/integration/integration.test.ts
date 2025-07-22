import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { marked, Token } from 'marked';
import { parseShamResponse } from '../../../sham-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';

interface TestCase {
  name: string;
  codeBlocks: string[];  // All code blocks for this test
}

interface TestGroup {
  name: string;
  tests: TestCase[];
}

// Recursively find all .cases.md files
function findTestFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTestFiles(fullPath, files);
    } else if (entry.endsWith('.cases.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Read all test case files
const testDir = join(__dirname, '../../test-data/integration');
const testFiles = findTestFiles(testDir).sort();

// Extract test structure from all markdown files
const testGroups: TestGroup[] = [];

testFiles.forEach(filepath => {
  const mdContent = readFileSync(filepath, 'utf8');
  
  // Parse markdown more simply
  const tokens = marked.lexer(mdContent);
  const codeBlocks = tokens.filter(t => t.type === 'code') as Array<Token & { type: 'code', text: string }>;
  
  // Get all headings
  const headings = tokens.filter(t => t.type === 'heading' && 'depth' in t) as Array<Token & { type: 'heading', depth: number, text: string }>;
  
  let currentGroup: TestGroup | null = null;
  let codeBlockIndex = 0;
  
  headings.forEach((heading, i) => {
    if (heading.depth === 2) {
      // New test group
      currentGroup = {
        name: heading.text,
        tests: []
      };
      testGroups.push(currentGroup);
    } else if (heading.depth === 3 && currentGroup) {
      // New test case - collect all code blocks until next heading
      const testCase: TestCase = {
        name: heading.text,
        codeBlocks: []
      };
      
      // Find next heading index or use end of array
      const nextHeadingIndex = headings.findIndex((h, idx) => idx > i && h.depth <= 3);
      const endIndex = nextHeadingIndex === -1 ? tokens.length : tokens.indexOf(headings[nextHeadingIndex]);
      
      // Count code blocks between this heading and the next
      let blocksForThisTest = 0;
      for (let j = tokens.indexOf(heading); j < endIndex && j < tokens.length; j++) {
        if (tokens[j].type === 'code') {
          blocksForThisTest++;
        }
      }
      
      // Collect the code blocks
      for (let j = 0; j < blocksForThisTest && codeBlockIndex < codeBlocks.length; j++) {
        testCase.codeBlocks.push(codeBlocks[codeBlockIndex].text);
        codeBlockIndex++;
      }
      
      if (testCase.codeBlocks.length > 0) {
        currentGroup.tests.push(testCase);
      }
    }
  });
});

describe('fs-ops integration tests', () => {
  let createdPaths: Set<string>;

  beforeEach(() => {
    createdPaths = new Set<string>(); // Fresh set per test
  });

  afterEach(() => {
    // Clean up any test directories that were created
    for (const path of createdPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });


  testGroups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, async () => {
          // Determine which blocks are SHAM vs expected output
          const shamBlocks: string[] = [];
          let jsonResultBlock: string | null = null;
          let fileContentBlock: string | null = null;
          
          // Parse blocks - SHAM blocks contain "action =", JSON blocks start with {
          test.codeBlocks.forEach(block => {
            const trimmed = block.trim();
            if (trimmed.includes('action =') || trimmed.includes('#!SHAM')) {
              shamBlocks.push(block);
            } else if (trimmed.startsWith('{')) {
              jsonResultBlock = block;
            } else {
              // Last non-JSON, non-SHAM block is file content
              fileContentBlock = block;
            }
          });
          
          // Must have at least one SHAM block and a JSON result
          expect(shamBlocks.length).toBeGreaterThan(0);
          expect(jsonResultBlock).toBeTruthy();
          
          const expectedOutput = JSON.parse(jsonResultBlock!);
          
          // Execute all SHAM blocks in sequence
          let lastResult;
          let targetFilePath: string | null = null;
          
          for (const shamBlock of shamBlocks) {
            const parseResult = await parseShamResponse(shamBlock);
            
            if (parseResult.errors.length > 0) {
              console.error('Parse errors:', parseResult.errors);
              throw new Error(`Failed to parse SHAM: ${parseResult.errors.join(', ')}`);
            }
            
            // Execute all actions in this SHAM block
            for (const action of parseResult.actions) {
              lastResult = await executeFileOperation(action);
              
              // Track the file path for content verification
              if (action.parameters?.path) {
                targetFilePath = action.parameters.path;
                
                // Track created paths for cleanup
                const testDirMatch = action.parameters.path.match(/\/tmp\/t_[^\/]+/);
                if (testDirMatch) {
                  createdPaths.add(testDirMatch[0]);
                }
              }
              // Also track old_path for file_move operations
              if (action.parameters?.old_path) {
                const testDirMatch = action.parameters.old_path.match(/\/tmp\/t_[^\/]+/);
                if (testDirMatch) {
                  createdPaths.add(testDirMatch[0]);
                }
              }
            }
          }
          
          // Compare operation result
          expect(lastResult).toEqual(expectedOutput);
          
          // If we have a file content block and the operation succeeded, verify file contents
          if (fileContentBlock && expectedOutput.success && targetFilePath) {
            const actualContent = readFileSync(targetFilePath, 'utf8');
            expect(actualContent).toBe(fileContentBlock);
          }
        }, 30000);
      });
    });
  });
});