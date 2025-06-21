20250119

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { executeWrite } from '../../src/execute.js';

describe('executeWrite', () => {
  let tempDir;
  let context;

  beforeEach(() => {
    // Create isolated temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-test-'));
    context = {
      cwd: tempDir,
      config: { allowEscape: false }
    };
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates file with content', () => {
    const task = { path: 'new.txt', content: 'hello world' };
    
    const result = executeWrite(task, context);
    assert.ok(result.ok);
    
    const filePath = path.join(tempDir, 'new.txt');
    assert.ok(fs.existsSync(filePath));
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'hello world');
  });

  it('creates nested directories as needed', () => {
    const task = { path: 'a/b/c/file.txt', content: 'deep' };
    
    const result = executeWrite(task, context);
    assert.ok(result.ok);
    
    const filePath = path.join(tempDir, 'a/b/c/file.txt');
    assert.ok(fs.existsSync(filePath));
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'deep');
  });

  it('overwrites existing files', () => {
    const filePath = path.join(tempDir, 'existing.txt');
    fs.writeFileSync(filePath, 'old content');
    
    const task = { path: 'existing.txt', content: 'new content' };
    const result = executeWrite(task, context);
    
    assert.ok(result.ok);
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'new content');
  });

  it('blocks path traversal without allowEscape', () => {
    const task = { path: '../escape.txt', content: 'data' };
    
    const result = executeWrite(task, context);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'path_escape');
    assert.match(result.error.message, /Path escapes working directory/);
  });

  it('blocks absolute paths without allowEscape', () => {
    const task = { path: '/etc/passwd', content: 'hacked' };
    
    const result = executeWrite(task, context);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'path_escape');
    assert.match(result.error.message, /Absolute paths not allowed/);
  });

  it('errors on write through symlink', () => {
    const linkPath = path.join(tempDir, 'link.txt');
    const targetPath = '/etc/secret';
    fs.symlinkSync(targetPath, linkPath);
    
    const task = { path: 'link.txt', content: 'data' };
    const result = executeWrite(task, context);
    
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'symlink_not_allowed');
    assert.match(result.error.message, /Cannot write through symlink: link.txt/);
  });

  it('errors on permission denied', function() {
    // Skip on Windows as permission model differs
    if (process.platform === 'win32') {
      this.skip();
      return;
    }
    
    const readonlyDir = path.join(tempDir, 'readonly');
    fs.mkdirSync(readonlyDir);
    fs.chmodSync(readonlyDir, 0o555); // no write permission
    
    const task = { path: 'readonly/file.txt', content: 'data' };
    const result = executeWrite(task, context);
    
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'permission_denied');
    assert.match(result.error.message, /Permission denied/);
    
    // Cleanup: restore permissions before afterEach
    fs.chmodSync(readonlyDir, 0o755);
  });

  it('errors on target is directory', () => {
    const dirPath = path.join(tempDir, 'existing-dir');
    fs.mkdirSync(dirPath);
    
    const task = { path: 'existing-dir', content: 'data' };
    const result = executeWrite(task, context);
    
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'permission_denied');
    assert.match(result.error.message, /Cannot write to directory: existing-dir/);
  });

  it('appends to existing file', () => {
    const filePath = path.join(tempDir, 'log.txt');
    fs.writeFileSync(filePath, 'line1\n');
    
    const task = { path: 'log.txt', content: 'line2\n', append: true };
    const result = executeWrite(task, context);
    
    assert.ok(result.ok);
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'line1\nline2\n');
  });

  it('appends to non-existent file', () => {
    const task = { path: 'new-log.txt', content: 'first line\n', append: true };
    
    const result = executeWrite(task, context);
    assert.ok(result.ok);
    
    const filePath = path.join(tempDir, 'new-log.txt');
    assert.ok(fs.existsSync(filePath));
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'first line\n');
  });
});