import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { orchestrate } from '../../src/orchestrate.js';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Store console output
let consoleOutput: Array<{type: string, message: string}> = [];

// Store original methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

// Mock console methods to capture output
const mockConsoleLog = (...args: any[]) => {
  consoleOutput.push({type: 'log', message: args.join(' ')});
  originalConsoleLog(...args);
};

const mockConsoleWarn = (...args: any[]) => {
  consoleOutput.push({type: 'warn', message: args.join(' ')});
  originalConsoleWarn(...args);
};

const mockConsoleError = (...args: any[]) => {
  consoleOutput.push({type: 'error', message: args.join(' ')});
  originalConsoleError(...args);
};

let processExitCalled = false;
let processExitCode: number | undefined;
const mockProcessExit = (code?: number) => {
  processExitCalled = true;
  processExitCode = code;
  // Don't actually exit during tests
};

describe('orchestrate', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = join(tmpdir(), `clada-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    
    // Reset console output
    consoleOutput = [];
    processExitCalled = false;
    processExitCode = undefined;
    
    // Install console mocks
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
    process.exit = mockProcessExit as any;
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
    
    // Restore console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  it('executes single WRITE operation', async () => {
    const csl = `<---WRITE file="test.txt"--->
Hello
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check that the file was actually created
    assert(existsSync(join(testDir, 'test.txt')));
    assert.equal(readFileSync(join(testDir, 'test.txt'), 'utf8'), 'Hello');
    
    // Check console output
    const logMessages = consoleOutput.filter(o => o.type === 'log');
    assert.equal(logMessages.length, 1);
    assert(logMessages[0].message.includes('[task-1] SUCCESS'));
  });

  it('executes multiple operations', async () => {
    const csl = `<---WRITE file="test.txt"--->
Hello
<---END--->
<---SEARCH file="test.txt" count="1"--->
Hello
<---REPLACE--->
Goodbye
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check that file was created and then modified
    assert(existsSync(join(testDir, 'test.txt')));
    assert.equal(readFileSync(join(testDir, 'test.txt'), 'utf8'), 'Goodbye');
    
    // Check console output shows both operations
    const logMessages = consoleOutput.filter(o => o.type === 'log');
    assert.equal(logMessages.length, 2);
    assert(logMessages[0].message.includes('[task-1] SUCCESS'));
    assert(logMessages[0].message.includes('WRITE'));
    assert(logMessages[1].message.includes('[task-2] SUCCESS'));
    assert(logMessages[1].message.includes('SEARCH'));
  });

  it('executes operations in TASKS block', async () => {
    const csl = `<---TASKS--->
<---WRITE file="a.txt"--->
A
<---END--->
<---WRITE file="b.txt"--->
B
<---END--->
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check both files were created
    assert(existsSync(join(testDir, 'a.txt')));
    assert(existsSync(join(testDir, 'b.txt')));
    assert.equal(readFileSync(join(testDir, 'a.txt'), 'utf8'), 'A');
    assert.equal(readFileSync(join(testDir, 'b.txt'), 'utf8'), 'B');
    
    // Check console output shows sub-numbered tasks
    const logMessages = consoleOutput.filter(o => o.type === 'log');
    assert.equal(logMessages.length, 2);
    assert(logMessages[0].message.includes('[task-1.1] SUCCESS'));
    assert(logMessages[1].message.includes('[task-1.2] SUCCESS'));
  });

  it('skips invalid standalone operation', async () => {
    const csl = `<---WRITE--->
Invalid
<---END--->
<---WRITE file="valid.txt"--->
Valid
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check that only valid file was created
    assert(!existsSync(join(testDir, 'Invalid')));
    assert(existsSync(join(testDir, 'valid.txt')));
    assert.equal(readFileSync(join(testDir, 'valid.txt'), 'utf8'), 'Valid');
    
    // Check console output shows skip and success
    const warnMessages = consoleOutput.filter(o => o.type === 'warn');
    const logMessages = consoleOutput.filter(o => o.type === 'log');
    assert.equal(warnMessages.length, 1);
    assert(warnMessages[0].message.includes('[task-1] SKIP'));
    assert.equal(logMessages.length, 1);
    assert(logMessages[0].message.includes('[task-2] SUCCESS'));
  });

  it('skips entire TASKS block with validation error', async () => {
    const csl = `<---TASKS--->
<---WRITE--->
No file
<---END--->
<---WRITE file="good.txt"--->
Good
<---END--->
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check that no files were created (entire block skipped)
    assert(!existsSync(join(testDir, 'No file')));
    assert(!existsSync(join(testDir, 'good.txt')));
    
    // Check console output shows entire block was skipped
    const warnMessages = consoleOutput.filter(o => o.type === 'warn');
    assert.equal(warnMessages.length, 1);
    assert(warnMessages[0].message.includes('[task-1] SKIP'));
    assert(warnMessages[0].message.includes('TASKS'));
  });

  it('handles execution failure', async () => {
    // Try to write to a path that will fail (parent directory doesn't exist)
    const csl = `<---WRITE file="nonexistent/dir/test.txt"--->
Hello
<---END--->`;
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check file was not created
    assert(!existsSync(join(testDir, 'nonexistent/dir/test.txt')));
    
    // Check console output shows error
    const errorMessages = consoleOutput.filter(o => o.type === 'error');
    assert.equal(errorMessages.length, 1);
    assert(errorMessages[0].message.includes('[task-1] ERROR'));
    assert(errorMessages[0].message.includes('WRITE'));
    assert(errorMessages[0].message.includes('nonexistent/dir/test.txt'));
  });

  it('handles fatal syntax error', async () => {
    const csl = '<---INVALID SYNTAX';
    
    await orchestrate(csl, { workingDir: testDir });
    
    // Check console output shows fatal error
    const errorMessages = consoleOutput.filter(o => o.type === 'error');
    assert.equal(errorMessages.length, 1);
    assert(errorMessages[0].message.includes('[task-1] FATAL'));
    
    // Check process.exit was called
    assert(processExitCalled);
    assert.equal(processExitCode, 1);
  });
});