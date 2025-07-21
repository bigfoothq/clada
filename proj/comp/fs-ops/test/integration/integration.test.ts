import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { marked, Token } from 'marked';
import { parseShamResponse } from '../../../sham-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';

// Read test data
const testPath = join(__dirname, '../../test-data/integration/file-operations.cases.md');
const mdContent = readFileSync(testPath, 'utf8');

// Parse markdown to extract test cases
const tokens: Token[] = marked.lexer(mdContent);
const codeBlocks = tokens.filter(t => t.type === 'code') as Array<Token & {type: 'code', text: string}>;
const testNames = tokens
  .filter(t => t.type === 'heading' && 'depth' in t && t.depth === 3)
  .map(t => (t as any).text as string);

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
  '/tmp/moveable.txt'
];

describe('fs-ops integration tests', () => {
  beforeEach(() => {
    // Clean up any existing test files
    testPaths.forEach(path => {
      if (existsSync(path)) {
        rmSync(path, { recursive: true, force: true });
      }
    });
  });

  afterEach(() => {
    // Clean up after tests
    testPaths.forEach(path => {
      if (existsSync(path)) {
        rmSync(path, { recursive: true, force: true });
      }
    });
  });

  testNames.forEach((name, i) => {
    const baseIndex = i * 2;
    it(name, async () => {
      const shamInput = codeBlocks[baseIndex].text;
      const expectedOutput = JSON.parse(codeBlocks[baseIndex + 1].text);
      
      // Set up test preconditions based on test name
      if (name === '003-file-already-exists') {
        // Create the file that should already exist
        writeFileSync('/tmp/existing.txt', 'This file already exists');
      } else if (name === '006-delete-existing-file') {
        // Create file to be deleted
        writeFileSync('/tmp/to-delete.txt', 'This file will be deleted');
      } else if (name === '009-move-file-simple') {
        // Create source file to be moved
        writeFileSync('/tmp/source.txt', 'Content to move');
      } else if (name === '010-move-file-to-new-directory') {
        // Create file to move to new directory
        writeFileSync('/tmp/original.txt', 'Moving to new directory');
      } else if (name === '012-move-to-existing-file') {
        // Create both source and destination files
        writeFileSync('/tmp/source-exists.txt', 'Source content');
        writeFileSync('/tmp/dest-exists.txt', 'Will be overwritten');
      } else if (name === '014-move-permission-denied-destination') {
        // Create source file
        writeFileSync('/tmp/moveable.txt', 'Content to move');
      }
      
      // Parse SHAM to get actions
      const parseResult = await parseShamResponse(shamInput);
      
      // Should have exactly one action
      expect(parseResult.actions).toHaveLength(1);
      expect(parseResult.errors).toHaveLength(0);
      
      // Execute the action
      const result = await executeFileOperation(parseResult.actions[0]);
      
      // Compare result
      expect(result).toEqual(expectedOutput);
    });
  });
});