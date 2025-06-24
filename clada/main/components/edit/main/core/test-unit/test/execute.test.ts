20250620

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { executeEdit } from '../../src/execute';
import { mkdirSync, rmSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('executeEdit', () => {
  let testDir: string;
  let context: { workingDir: string };

  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = join(tmpdir(), `clada-edit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    context = { workingDir: testDir };
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  it('performs basic exact replacement', () => {
    writeFileSync(join(testDir, 'test.txt'), 'hello world hello');
    const result = executeEdit({ mode: 'exact', path: 'test.txt', search: 'hello', replace: 'hi', count: 2 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'test.txt'), 'utf8'), 'hi world hi');
  });

  it('performs exact replacement with count', () => {
    writeFileSync(join(testDir, 'data.txt'), 'foo bar foo baz foo');
    const result = executeEdit({ mode: 'exact', path: 'data.txt', search: 'foo', replace: 'qux', count: 3 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'data.txt'), 'utf8'), 'qux bar qux baz qux');
  });

  it('returns error when count exceeds matches', () => {
    writeFileSync(join(testDir, 'app.js'), 'var x = 1; var y = 2; var z = 3;');
    const result = executeEdit({ mode: 'exact', path: 'app.js', search: 'var', replace: 'let', count: 10 }, context);
    assert.deepEqual(result, { ok: false, error: 'match_count_mismatch', expected: 10, found: 3 });
  });

  it('performs range replacement', () => {
    writeFileSync(join(testDir, 'func.js'), 'function old() { return 1; } function keep() { return 2; }');
    const result = executeEdit({ mode: 'range', path: 'func.js', searchStart: 'function old()', searchEnd: '}', replace: 'function new() { return 42; }', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'func.js'), 'utf8'), 'function new() { return 42; } function keep() { return 2; }');
  });

  it('performs range replacement with count', () => {
    writeFileSync(join(testDir, 'list.xml'), '<item>A</item><item>B</item><item>C</item>');
    const result = executeEdit({ mode: 'range', path: 'list.xml', searchStart: '<item>', searchEnd: '</item>', replace: '<item>X</item>', count: 2 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'list.xml'), 'utf8'), '<item>X</item><item>X</item><item>C</item>');
  });

  it('performs case sensitive matching', () => {
    writeFileSync(join(testDir, 'case.txt'), 'Hello HELLO hello');
    const result = executeEdit({ mode: 'exact', path: 'case.txt', search: 'hello', replace: 'bye', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'case.txt'), 'utf8'), 'Hello HELLO bye');
  });

  it('performs multiline exact search', () => {
    writeFileSync(join(testDir, 'multi.txt'), 'line1\nline2\nline3');
    const result = executeEdit({ mode: 'exact', path: 'multi.txt', search: 'line1\nline2', replace: 'merged', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'multi.txt'), 'utf8'), 'merged\nline3');
  });

  it('performs multiline range search', () => {
    writeFileSync(join(testDir, 'block.js'), 'if (true) {\n  console.log(\'yes\');\n}\nother code');
    const result = executeEdit({ mode: 'range', path: 'block.js', searchStart: 'if (true) {', searchEnd: '}', replace: '// removed', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'block.js'), 'utf8'), '// removed\nother code');
  });

  it('returns error for file not found', () => {
    const result = executeEdit({ mode: 'exact', path: 'missing.txt', search: 'x', replace: 'y', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'file_not_found' });
  });

  it('returns error for match count mismatch - exact mode', () => {
    writeFileSync(join(testDir, 'few.txt'), 'one two three');
    const result = executeEdit({ mode: 'exact', path: 'few.txt', search: 'four', replace: 'x', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'match_count_mismatch', expected: 1, found: 0 });
  });

  it('returns error for match count mismatch - not enough matches', () => {
    writeFileSync(join(testDir, 'count.txt'), 'a b a c');
    const result = executeEdit({ mode: 'exact', path: 'count.txt', search: 'a', replace: 'x', count: 3 }, context);
    assert.deepEqual(result, { ok: false, error: 'match_count_mismatch', expected: 3, found: 2 });
  });

  it('returns error for match count mismatch - range mode', () => {
    writeFileSync(join(testDir, 'range.txt'), '<div>content</div>');
    const result = executeEdit({ mode: 'range', path: 'range.txt', searchStart: '<span>', searchEnd: '</span>', replace: 'x', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'match_count_mismatch', expected: 1, found: 0 });
  });

  it('returns error for range incomplete - missing end', () => {
    writeFileSync(join(testDir, 'bad.txt'), 'start but no end');
    const result = executeEdit({ mode: 'range', path: 'bad.txt', searchStart: 'start', searchEnd: 'finish', replace: 'x', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'search_range_incomplete' });
  });

  it('handles non-overlapping matches', () => {
    writeFileSync(join(testDir, 'overlap.txt'), 'aaaa');
    const result = executeEdit({ mode: 'exact', path: 'overlap.txt', search: 'aa', replace: 'bb', count: 2 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'overlap.txt'), 'utf8'), 'bbbb');
  });

  it('returns error for empty file', () => {
    writeFileSync(join(testDir, 'empty.txt'), '');
    const result = executeEdit({ mode: 'exact', path: 'empty.txt', search: 'x', replace: 'y', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'match_count_mismatch', expected: 1, found: 0 });
  });

  it('replaces with empty string', () => {
    writeFileSync(join(testDir, 'delete.txt'), 'keep this remove this keep this');
    const result = executeEdit({ mode: 'exact', path: 'delete.txt', search: 'remove this ', replace: '', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'delete.txt'), 'utf8'), 'keep this keep this');
  });

  it('handles path with subdirectory', () => {
    mkdirSync(join(testDir, 'sub', 'dir'), { recursive: true });
    writeFileSync(join(testDir, 'sub', 'dir', 'file.txt'), 'content');
    const result = executeEdit({ mode: 'exact', path: 'sub/dir/file.txt', search: 'content', replace: 'new content', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'sub', 'dir', 'file.txt'), 'utf8'), 'new content');
  });

  it('performs lazy range matching (nearest end)', () => {
    writeFileSync(join(testDir, 'nested.js'), '{ outer { inner } still outer }');
    const result = executeEdit({ mode: 'range', path: 'nested.js', searchStart: '{', searchEnd: '}', replace: '[block]', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'nested.js'), 'utf8'), '[block] still outer }');
  });

  it('handles range with nested markers', () => {
    writeFileSync(join(testDir, 'html.html'), '<div>outer <div>inner</div> text</div>');
    const result = executeEdit({ mode: 'range', path: 'html.html', searchStart: '<div>', searchEnd: '</div>', replace: '<span>content</span>', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'html.html'), 'utf8'), '<span>content</span> text</div>');
  });

  it('performs multiple range replacements', () => {
    writeFileSync(join(testDir, 'multi.xml'), 'START first END middle START second END final');
    const result = executeEdit({ mode: 'range', path: 'multi.xml', searchStart: 'START', searchEnd: 'END', replace: 'X', count: 2 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'multi.xml'), 'utf8'), 'X middle X final');
  });

  it('preserves file endings', () => {
    writeFileSync(join(testDir, 'endings.txt'), 'hello\r\nworld\n');
    const result = executeEdit({ mode: 'exact', path: 'endings.txt', search: 'hello', replace: 'hi', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'endings.txt'), 'utf8'), 'hi\r\nworld\n');
  });

  it('handles UTF-8 content', () => {
    writeFileSync(join(testDir, 'utf8.txt'), 'café and naïve');
    const result = executeEdit({ mode: 'exact', path: 'utf8.txt', search: 'café', replace: 'coffee', count: 1 }, context);
    assert.deepEqual(result, { ok: true, value: undefined });
    assert.equal(readFileSync(join(testDir, 'utf8.txt'), 'utf8'), 'coffee and naïve');
  });

  it('prevents path escape attempts', () => {
    const result = executeEdit({ mode: 'exact', path: '../../../etc/passwd', search: 'root', replace: 'hacked', count: 1 }, context);
    assert.deepEqual(result, { ok: false, error: 'path_escape' });
  });
});