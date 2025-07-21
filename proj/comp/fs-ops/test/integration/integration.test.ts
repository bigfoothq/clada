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
  '/tmp/special-chars.txt'
];

describe('fs-ops integration tests', () => {
  beforeEach(() => {
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
          
          // Extract test name without number prefix
          const tn = test.name.replace(/^\d{3}-/, '');
          
          // Set up test preconditions based on group and test name
          if (group.name === 'file_delete' && tn === 'delete-existing-file') {
            // Create file to be deleted
            writeFileSync('/tmp/to-delete.txt', 'This file will be deleted');
          } else if (group.name === 'file_move' && tn === 'move-file-simple') {
            // Create source file to be moved
            writeFileSync('/tmp/source.txt', 'Content to move');
          } else if (group.name === 'file_move' && tn === 'move-file-to-new-directory') {
            // Create file to move to new directory
            writeFileSync('/tmp/original.txt', 'Moving to new directory');
          } else if (group.name === 'file_move' && tn === 'move-to-existing-file') {
            // Create both source and destination files
            writeFileSync('/tmp/source-exists.txt', 'Source content');
            writeFileSync('/tmp/dest-exists.txt', 'Will be overwritten');
          } else if (group.name === 'file_replace_text' && tn === 'simple-text-replacement') {
            // Create file with text to replace
            writeFileSync('/tmp/replace-test.txt', 'Hello World');
          } else if (group.name === 'file_replace_text' && tn === 'replace-with-count-limit') {
            // Create file with multiple occurrences
            writeFileSync('/tmp/multi-replace.txt', 'foo bar foo baz foo qux foo');
          } else if (group.name === 'file_replace_text' && tn === 'replace-text-not-found') {
            // Create file without the search text
            writeFileSync('/tmp/no-match.txt', 'This file has no matches');
          } else if (group.name === 'file_replace_text' && tn === 'multiline-replacement') {
            // Create file with multiline content to replace
            writeFileSync('/tmp/multiline-replace.txt', `export function oldName() {
  console.log('oldName');
  return oldName;
}

function oldName() {
  return oldName;
}

const x = oldName();`);
          } else if (group.name === 'file_replace_text' && tn === 'empty-old-text-error') {
            // Create file for empty search test
            writeFileSync('/tmp/empty-search.txt', 'Some content here');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-text-multiple-occurrences') {
            // Create file with multiple occurrences
            writeFileSync('/tmp/multiple-occurrences.txt', 'duplicate text with duplicate word and duplicate again');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-no-count') {
            // Create file for replace all test
            writeFileSync('/tmp/replace-all.txt', 'foo bar foo baz foo');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-count-mismatch') {
            // Create file with specific count of occurrences
            writeFileSync('/tmp/count-mismatch.txt', 'test this test case');
          } else if (group.name === 'file_read' && tn === 'read-existing-file') {
            // Create file to read
            writeFileSync('/tmp/readable.txt', 'This is readable content');
          }
          
          // Parse SHAM to get actions
          let parseResult;
          try {
            console.log(`\nTest: ${test.name}`);
            console.log('SHAM block:', test.shamBlock);
            parseResult = await parseShamResponse(test.shamBlock);
            console.log('Parse result:', parseResult);
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
          
          // Execute the last action (main action, after any setup actions)
          const result = await executeFileOperation(parseResult.actions[parseResult.actions.length - 1]);
          
          // Compare result
          expect(result).toEqual(expectedOutput);
        }, 30000);
      });
    });
  });
});