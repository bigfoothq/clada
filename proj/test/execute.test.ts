import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked, Token } from 'marked';
import { Clada } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testPath = join(__dirname, '../test-data/execute/basic-operations.md');
const mdContent = readFileSync(testPath, 'utf8');

const tokens = marked.lexer(mdContent);
const codeBlocks = tokens.filter(t => t.type === 'code') as Array<Token & {type: 'code', text: string, lang?: string}>;
const testNames = tokens
  .filter(t => t.type === 'heading' && 'depth' in t && t.depth === 3)
  .map(t => (t as any).text as string);

const testPaths = [
  '/tmp/test.txt',
  '/tmp/first.txt',
  '/tmp/second.txt',
  '/tmp/bad.txt',
  '/tmp/duplicate.txt',
  '/tmp/good.txt',
  '/tmp/does-not-exist.txt'
];

describe('Clada.execute()', () => {
  let clada: Clada;

  beforeEach(() => {
    clada = new Clada();
    testPaths.forEach(path => existsSync(path) && rmSync(path));
  });

  afterEach(() => {
    testPaths.forEach(path => existsSync(path) && rmSync(path));
  });

  testNames.forEach((name, i) => {
    const baseIndex = i * 2;
    it(name, async () => {
      const input = codeBlocks[baseIndex].text;
      const expected = JSON.parse(codeBlocks[baseIndex + 1].text);
      const result = await clada.execute(input);
      expect(result).toEqual(expected);
    });
  });
});