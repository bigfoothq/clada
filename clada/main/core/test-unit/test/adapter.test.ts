import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapAstNodeToCommand } from '../../src/adapter.js';

describe('mapAstNodeToCommand', () => {
  describe('WRITE operations', () => {
    it('maps basic WRITE operation without append', () => {
      const result = mapAstNodeToCommand({
        type: 'WRITE',
        file: 'test.txt',
        content: 'hello',
        line: 1
      });
      assert.deepEqual(result, {
        type: 'WRITE',
        payload: {
          path: 'test.txt',
          content: 'hello',
          append: false
        }
      });
    });

    it('maps WRITE operation with append=true', () => {
      const result = mapAstNodeToCommand({
        type: 'WRITE',
        file: 'log.txt',
        content: 'data',
        append: 'true',
        line: 2
      });
      assert.deepEqual(result, {
        type: 'WRITE',
        payload: {
          path: 'log.txt',
          content: 'data',
          append: true
        }
      });
    });

    it('maps WRITE operation with empty content and append=false', () => {
      const result = mapAstNodeToCommand({
        type: 'WRITE',
        file: 'out.txt',
        content: '',
        append: 'false',
        line: 3
      });
      assert.deepEqual(result, {
        type: 'WRITE',
        payload: {
          path: 'out.txt',
          content: '',
          append: false
        }
      });
    });
  });

  describe('SEARCH operations (exact mode)', () => {
    it('maps basic SEARCH operation without count', () => {
      const result = mapAstNodeToCommand({
        type: 'SEARCH',
        file: 'app.js',
        pattern: 'foo',
        replacement: 'bar',
        line: 4
      });
      assert.deepEqual(result, {
        type: 'EDIT',
        payload: {
          mode: 'exact',
          path: 'app.js',
          search: 'foo',
          replace: 'bar',
          count: 1
        }
      });
    });

    it('maps SEARCH operation with count', () => {
      const result = mapAstNodeToCommand({
        type: 'SEARCH',
        file: 'main.py',
        pattern: 'old',
        replacement: 'new',
        count: '3',
        line: 5
      });
      assert.deepEqual(result, {
        type: 'EDIT',
        payload: {
          mode: 'exact',
          path: 'main.py',
          search: 'old',
          replace: 'new',
          count: 3
        }
      });
    });
  });

  describe('SEARCH operations (range mode)', () => {
    it('maps SEARCH operation with to parameter', () => {
      const result = mapAstNodeToCommand({
        type: 'SEARCH',
        file: 'config.json',
        pattern: '{',
        to: '}',
        replacement: '{}',
        line: 6
      });
      assert.deepEqual(result, {
        type: 'EDIT',
        payload: {
          mode: 'range',
          path: 'config.json',
          searchStart: '{',
          searchEnd: '}',
          replace: '{}',
          count: 1
        }
      });
    });

    it('maps SEARCH range operation with count', () => {
      const result = mapAstNodeToCommand({
        type: 'SEARCH',
        file: 'test.md',
        pattern: '<!--',
        to: '-->',
        replacement: '',
        count: '2',
        line: 7
      });
      assert.deepEqual(result, {
        type: 'EDIT',
        payload: {
          mode: 'range',
          path: 'test.md',
          searchStart: '<!--',
          searchEnd: '-->',
          replace: '',
          count: 2
        }
      });
    });
  });

  describe('RUN operations', () => {
    it('maps basic RUN operation', () => {
      const result = mapAstNodeToCommand({
        type: 'RUN',
        content: 'echo hello',
        line: 8
      });
      assert.deepEqual(result, {
        type: 'RUN',
        payload: {
          command: 'echo hello'
        }
      });
    });

    it('maps RUN operation with dir', () => {
      const result = mapAstNodeToCommand({
        type: 'RUN',
        content: 'npm test',
        dir: '/app',
        line: 9
      });
      assert.deepEqual(result, {
        type: 'RUN',
        payload: {
          command: 'npm test',
          cwd: '/app'
        }
      });
    });
  });

  describe('TASKS operations', () => {
    it('returns null for TASKS node', () => {
      const result = mapAstNodeToCommand({
        type: 'TASKS',
        line: 10,
        operations: []
      });
      assert.equal(result, null);
    });
  });

  describe('Invalid count handling', () => {
    it('defaults to 1 for invalid count', () => {
      const result = mapAstNodeToCommand({
        type: 'SEARCH',
        file: 'test.js',
        pattern: 'x',
        replacement: 'y',
        count: 'invalid',
        line: 11
      });
      assert.deepEqual(result, {
        type: 'EDIT',
        payload: {
          mode: 'exact',
          path: 'test.js',
          search: 'x',
          replace: 'y',
          count: 1
        }
      });
    });
  });
});