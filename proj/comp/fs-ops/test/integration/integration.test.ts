import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { marked, Token } from 'marked';
import { parseShamResponse } from '../../../sham-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';

// Read test data
const testPath = join(__dirname, '../../test-data/integration/file-operations.cases.md');
const mdContent = readFileSync(testPath, 'utf8');

// Parse markdown to extract test cases with hierarchy
const tokens: Token[] = marked.lexer(mdContent);

interface TestCase {
  name: string;
  shamBlock: string;
  expectedBlock: string;
}

interface TestGroup {
  name: string;
  tests: TestCase[];
}

// Extract test structure from markdown
const testGroups: TestGroup[] = [];
let currentGroup: TestGroup | null = null;
let currentTest: Partial<TestCase> | null = null;
let codeBlockIndex = 0;

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
  '/tmp/count-mismatch.txt'
];

describe('fs-ops integration tests', () => {
  beforeEach(async () => {
    console.log('[beforeEach] Starting cleanup');
    // Clean up any existing test files
    testPaths.forEach(path => {
      if (existsSync(path)) {
        console.log('[beforeEach] Removing:', path);
        rmSync(path, { recursive: true, force: true });
      }
    });
    console.log('[beforeEach] Cleanup complete');
    // Small delay to ensure filesystem operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    console.log('[afterEach] Starting cleanup');
    // Clean up after tests
    testPaths.forEach(path => {
      if (existsSync(path)) {
        console.log('[afterEach] Removing:', path);
        rmSync(path, { recursive: true, force: true });
      }
    });
    console.log('[afterEach] Cleanup complete');
    // Add small delay to ensure fs operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  testGroups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, async () => {
          console.log(`Starting test: ${test.name}`);
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
            parseResult = await parseShamResponse(test.shamBlock);
          } catch (error) {
            console.error('Parse error:', error);
            throw error;
          }
          
          console.log('Parse complete, got', parseResult.actions.length, 'actions');
          
          // Should have exactly one action
          expect(parseResult.actions).toHaveLength(1);
          expect(parseResult.errors).toHaveLength(0);
          
          console.log('About to execute action:', parseResult.actions[0]);
          
          // Execute the action
          const result = await executeFileOperation(parseResult.actions[0]);
          
          console.log('Execution complete, result:', result);
          
          // Compare result
          expect(result).toEqual(expectedOutput);
          console.log('Test assertion complete');
        }, 30000);
      });
    });
  });
  
  // Debug test to verify Vitest is working
  it('simple sync test', () => {
    console.log('Simple test running');
    expect(1).toBe(1);
    console.log('Simple test complete');
  });
});