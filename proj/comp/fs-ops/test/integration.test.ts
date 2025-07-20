import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { marked, Token } from 'marked';
import { parseShamResponse } from '../../sham-action-parser/src/index.js';
import { executeFileOperation } from '../src/index.js';

// Read test data
const testPath = join(__dirname, '../test-data/integration/file-operations.md');
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
  '/tmp/multiline.txt'
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