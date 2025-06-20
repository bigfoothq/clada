20250119

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { executeWrite } = require('../../src/executor');

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
});