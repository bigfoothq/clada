import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { orchestrate } from '../../src/orchestrate.js';

// Mock the component execute functions
const mockExecuteWrite = mock.fn();
const mockExecuteEdit = mock.fn();

// Mock console methods to verify output
const mockConsoleLog = mock.fn();
const mockConsoleWarn = mock.fn();
const mockConsoleError = mock.fn();
const mockProcessExit = mock.fn();

// Store original methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

// Mock the imports before they're used
mock.module('../../components/write/main/core/src/execute.js', {
  namedExports: {
    executeWrite: mockExecuteWrite
  }
});

mock.module('../../components/edit/main/core/src/execute.js', {
  namedExports: {
    executeEdit: mockExecuteEdit
  }
});

describe('orchestrate', () => {
  beforeEach(() => {
    // Reset mocks
    mockExecuteWrite.mock.resetCalls();
    mockExecuteEdit.mock.resetCalls();
    mockConsoleLog.mock.resetCalls();
    mockConsoleWarn.mock.resetCalls();
    mockConsoleError.mock.resetCalls();
    mockProcessExit.mock.resetCalls();
    
    // Install console mocks
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
    process.exit = mockProcessExit as any;
  });

  it('executes single WRITE operation', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ ok: true }));
    
    const csl = `<---WRITE FILE="test.txt"--->
Hello
<---/WRITE--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 1);
    assert.deepEqual(mockExecuteWrite.mock.calls[0].arguments[0], {
      path: 'test.txt',
      content: 'Hello',
      append: false
    });
    assert.equal(mockConsoleLog.mock.callCount(), 1);
    assert(mockConsoleLog.mock.calls[0].arguments[0].includes('[SUCCESS]'));
  });

  it('executes multiple operations', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ ok: true }));
    mockExecuteEdit.mock.mockImplementation(() => ({ ok: true }));
    
    const csl = `<---WRITE FILE="test.txt"--->
Hello
<---/WRITE--->
<---SEARCH FILE="test.txt"--->
Hello
<---REPLACE--->
Goodbye
<---/SEARCH--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 1);
    assert.equal(mockExecuteEdit.mock.callCount(), 1);
    assert.equal(mockConsoleLog.mock.callCount(), 2);
  });

  it('executes operations in TASKS block', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ ok: true }));
    
    const csl = `<---TASKS VERSION="1.0"--->
<---WRITE FILE="a.txt"--->
A
<---/WRITE--->
<---WRITE FILE="b.txt"--->
B
<---/WRITE--->
<---/TASKS--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 2);
    assert.deepEqual(mockExecuteWrite.mock.calls[0].arguments[0], {
      path: 'a.txt',
      content: 'A',
      append: false
    });
    assert.deepEqual(mockExecuteWrite.mock.calls[1].arguments[0], {
      path: 'b.txt',
      content: 'B',
      append: false
    });
  });

  it('skips invalid standalone operation', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ ok: true }));
    
    const csl = `<---WRITE--->
Invalid
<---/WRITE--->
<---WRITE FILE="valid.txt"--->
Valid
<---/WRITE--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 1);
    assert.deepEqual(mockExecuteWrite.mock.calls[0].arguments[0], {
      path: 'valid.txt',
      content: 'Valid',
      append: false
    });
    assert.equal(mockConsoleWarn.mock.callCount(), 1);
    assert(mockConsoleWarn.mock.calls[0].arguments[0].includes('[SKIP]'));
  });

  it('skips entire TASKS block with validation error', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ ok: true }));
    
    const csl = `<---TASKS VERSION="1.0"--->
<---WRITE--->
No file
<---/WRITE--->
<---WRITE FILE="good.txt"--->
Good
<---/WRITE--->
<---/TASKS--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 0);
    assert.equal(mockConsoleWarn.mock.callCount(), 1);
    assert(mockConsoleWarn.mock.calls[0].arguments[0].includes('[SKIP]'));
    assert(mockConsoleWarn.mock.calls[0].arguments[0].includes('TASKS block'));
  });

  it('handles execution failure', async () => {
    mockExecuteWrite.mock.mockImplementation(() => ({ 
      ok: false, 
      error: 'Permission denied' 
    }));
    
    const csl = `<---WRITE FILE="test.txt"--->
Hello
<---/WRITE--->`;
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockExecuteWrite.mock.callCount(), 1);
    assert.equal(mockConsoleError.mock.callCount(), 1);
    assert(mockConsoleError.mock.calls[0].arguments[0].includes('[ERROR]'));
    assert(mockConsoleError.mock.calls[0].arguments[0].includes('Permission denied'));
  });

  it('handles fatal syntax error', async () => {
    const csl = '<---INVALID SYNTAX';
    
    await orchestrate(csl, { workingDir: '/tmp' });
    
    assert.equal(mockConsoleError.mock.callCount(), 1);
    assert(mockConsoleError.mock.calls[0].arguments[0].includes('[FATAL]'));
    assert.equal(mockProcessExit.mock.callCount(), 1);
    assert.equal(mockProcessExit.mock.calls[0].arguments[0], 1);
  });
  
  // Restore original methods after tests
  after(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });
});