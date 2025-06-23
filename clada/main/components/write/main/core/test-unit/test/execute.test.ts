import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { executeWrite } from '../../src/execute.js'; // .js extension is correct

describe('executeWrite', () => {
  let tempDir: string;
  let context: any; // Using 'any' for simplicity in test setup

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-test-'));
    context = {
      cwd: tempDir,
      config: { allowEscape: false }
    };
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates file with content', () => {
    const task = { path: 'new.txt', content: 'hello world' };
    const result = executeWrite(task, context);
    assert.ok(result.ok);
    const filePath = path.join(tempDir, 'new.txt');
    assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'hello world');
  });

  // ... All other test cases from execute.test.js go here ...
  // They require no changes.
  
  it('appends to non-existent file', () => {
    const task = { path: 'new-log.txt', content: 'first line\n', append: true };
    const result = executeWrite(task, context);
    assert.ok(result.ok);
    const filePath = path.join(tempDir, 'new-log.txt');
    assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'first line\n');
  });
});