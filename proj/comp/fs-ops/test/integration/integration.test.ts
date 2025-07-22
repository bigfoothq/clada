import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked, Token } from 'marked';
import { parseShamResponse } from '../../../sham-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';

interface TestCase {
  name: string;
  shamBlock: string;
  expectedBlock: string;
}

interface TestGroup {
  name: string;
  tests: TestCase[];
}

// Read all test case files
const testDir = join(__dirname, '../../test-data/integration');
const testFiles = readdirSync(testDir)
  .filter(f => f.endsWith('.cases.md'))
  .sort();

// Extract test structure from all markdown files
const testGroups: TestGroup[] = [];

testFiles.forEach(filename => {
  const testPath = join(testDir, filename);
  const mdContent = readFileSync(testPath, 'utf8');
  
  let currentGroup: TestGroup | null = null;
  let currentTest: Partial<TestCase> | null = null;
  
  // Parse markdown to extract test cases with hierarchy
  const tokens: Token[] = marked.lexer(mdContent);
  
  tokens.forEach(token => {
    if (token.type === 'heading' && 'depth' in token) {
      if (token.depth === 2) {
        // New test group (e.g., "file_write")
        currentGroup = {
          name: (token as any).text,
          tests: []
        };
        testGroups.push(currentGroup);
      } else if (token.depth === 3 && currentGroup) {
        // New test case
        currentTest = {
          name: (token as any).text
        };
      }
    } else if (token.type === 'code' && currentTest && currentGroup) {
      const codeBlock = token as Token & {type: 'code', text: string};
      if (!currentTest.shamBlock) {
        currentTest.shamBlock = codeBlock.text;
      } else if (!currentTest.expectedBlock) {
        currentTest.expectedBlock = codeBlock.text;
        // Test case complete
        currentGroup.tests.push(currentTest as TestCase);
        currentTest = null;
      }
    }
  });
});

// Test cleanup paths
const testPaths = [
  '/tmp/test.txt',
  '/tmp/deeply',
  '/tmp/existing.txt',
  '/tmp/multiline.txt',
  '/tmp/to-delete.txt',
  '/tmp/does-not-exist.txt',
  '/tmp/source.txt',
  '/tmp/destination.txt',
  '/tmp/original.txt',
  '/tmp/new-dir',
  '/tmp/ghost.txt',
  '/tmp/nowhere.txt',
  '/tmp/source-exists.txt',
  '/tmp/dest-exists.txt',
  '/tmp/moveable.txt',
  '/tmp/replace-test.txt',
  '/tmp/multi-replace.txt',
  '/tmp/no-match.txt',
  '/tmp/does-not-exist-replace.txt',
  '/tmp/multiline-replace.txt',
  '/tmp/empty-search.txt',
  '/tmp/readable.txt',
  '/tmp/not-there.txt',
  '/tmp/multiple-occurrences.txt',
  '/tmp/replace-all.txt',
  '/tmp/count-mismatch.txt',
  '/tmp/special-chars.txt',
  '/tmp/numbered.txt',
  '/tmp/listener.txt',
  '/tmp/indented.txt',
  '/tmp/partial.txt',
  '/tmp/newlines.txt',
  '/tmp/complex.txt',
  '/tmp/trailing.txt'
];

describe('fs-ops integration tests', () => {
  let createdPaths: Set<string>;

  beforeEach(() => {
    createdPaths = new Set<string>(); // Fresh set per test

    // Clean up any existing test files
    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });

  afterEach(() => {
    for (const path of createdPaths) {
      rmSync(path, { recursive: true, force: true });
    }
    // Clean up after tests
    for (const path of testPaths) {
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
          const expectedOutput = JSON.parse(test.expectedBlock);
          
          // Parse SHAM to get actions
          let parseResult;
          try {
            parseResult = await parseShamResponse(test.shamBlock);
            // Force a minimal action to test downstream code
            if (parseResult.actions.length === 0 && test.shamBlock.includes('action =')) {
              console.log('WARNING: Parser returned no actions, check parser implementation');
            }
          } catch (error) {
            console.log('Parse error:', error);
            throw error;
          }
          
          // Should have at least one action
          expect(parseResult.actions.length).toBeGreaterThan(0);
          expect(parseResult.errors).toHaveLength(0);
          
          // Execute all actions in sequence, capturing the last result
          let result;
          for (const action of parseResult.actions) {
            result = await executeFileOperation(action);
            
            // Track created paths for cleanup
            if (action.action === 'file_write' && action.path) {
              const testDirMatch = action.path.match(/\/tmp\/t_[^\/]+/);
              if (testDirMatch) {
                createdPaths.add(testDirMatch[0]);
              }
            }
          }
          
          // Compare result
          expect(result).toEqual(expectedOutput);
        }, 30000);
      });
    });
  });
});