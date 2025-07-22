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


  // Helper function to create test files and track paths
  const createTestFile = (testName: string, filename: string, content: string): void => {
    const testDir = `/tmp/t_${testName}`;
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, filename), content);
    createdPaths.add(testDir);
  };


  testGroups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, async () => {
          const expectedOutput = JSON.parse(test.expectedBlock);
          
          // Extract test name without number prefix
          const tn = test.name.replace(/^\d{3}-/, '');
          



          // Set up test preconditions based on group and test name
          if (group.name === 'file_delete' && tn === 'delete-existing-file') {
            createTestFile('delete-existing-file', 'to-delete.txt', 'This file will be deleted');
          } else if (group.name === 'file_move' && tn === 'move-file-simple') {
            createTestFile('move-file-simple', 'source.txt', 'Content to move');
          } else if (group.name === 'file_move' && tn === 'move-file-to-new-directory') {
            createTestFile('move-file-to-new-directory', 'original.txt', 'Moving to new directory');
          } else if (group.name === 'file_move' && tn === 'move-to-existing-file') {
            createTestFile('move-to-existing-file', 'source-exists.txt', 'Source content');
            createTestFile('move-to-existing-file', 'dest-exists.txt', 'Will be overwritten');
          } else if (group.name === 'file_replace_text' && tn === 'simple-text-replacement') {
            createTestFile('simple-text-replacement', 'replace-test.txt', 'Hello World');
          } else if (group.name === 'file_replace_text' && tn === 'replace-with-count-limit') {
            createTestFile('replace-with-count-limit', 'multi-replace.txt', 'foo bar foo baz foo qux foo');
          } else if (group.name === 'file_replace_text' && tn === 'replace-text-not-found') {
            createTestFile('replace-text-not-found', 'no-match.txt', 'This file has no matches');
          } else if (group.name === 'file_replace_text' && tn === 'multiline-replacement') {
            createTestFile('multiline-replacement', 'multiline-replace.txt', `export function oldName() {
  console.log('oldName');
  return oldName;
}

function oldName() {
  return oldName;
}

const x = oldName();`);
          } else if (group.name === 'file_replace_text' && tn === 'empty-old-text-error') {
            createTestFile('empty-old-text-error', 'empty-search.txt', 'Some content here');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-text-multiple-occurrences') {
            createTestFile('file-replace-text-multiple-occurrences', 'multiple-occurrences.txt', 'duplicate text with duplicate word and duplicate again');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-no-count') {
            createTestFile('file-replace-all-text-no-count', 'replace-all.txt', 'foo bar foo baz foo');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-count-mismatch') {
            createTestFile('file-replace-all-text-count-mismatch', 'count-mismatch.txt', 'test this test case');
          } else if (group.name === 'file_read' && tn === 'read-existing-file') {
            createTestFile('read-existing-file', 'readable.txt', 'This is readable content');
          } else if (group.name === 'file_replace_text' && tn === 'complex-multiline-multiple-occurrences') {
            createTestFile('complex-multiline-multiple-occurrences', 'listener.txt', `async function startListener(config) {
  const watcher = createWatcher();
  console.log('Starting listener');
  return watcher;
}

async function stopListener(watcher) {
  await watcher.close();
  console.log('Stopped listener');
}

async function startListener(altConfig) {
  // Different implementation
  return createAltWatcher();
}`);
          } else if (group.name === 'file_replace_text' && tn === 'whitespace-sensitive-replacement') {
            createTestFile('whitespace-sensitive-replacement', 'indented.txt', `class FileProcessor {
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}`);
          } else if (group.name === 'file_replace_text' && tn === 'partial-match-should-not-replace') {
            createTestFile('partial-match-should-not-replace', 'partial.txt', `export function validateInput(data) {
  if (!data) throw new Error('Invalid input');
  return true;
}

export function validateInputWithLogging(data) {
  console.log('Validating:', data);
  if (!data) throw new Error('Invalid input');
  return true;
}`);
          } else if (group.name === 'file_replace_text' && tn === 'exact-newline-matching') {
            createTestFile('exact-newline-matching', 'newlines.txt', `function one() {
  return 1;
}


function two() {
  return 2;
}`);
          } else if (group.name === 'file_replace_text' && tn === 'complex-code-block-replacement') {
            createTestFile('complex-code-block-replacement', 'complex.txt', `const handler = {
  async process(data) {
    const result = await transform(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.value;
  },
  
  validate(data) {
    return data != null;
  }
};`);
          } else if (group.name === 'file_replace_text' && tn === 'trailing-whitespace-sensitivity') {
            createTestFile('trailing-whitespace-sensitivity', 'trailing.txt', "function test() {  \n  return true;\n}\n");
          }










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
          }
          
          // Compare result
          expect(result).toEqual(expectedOutput);
        }, 30000);
      });
    });
  });
});