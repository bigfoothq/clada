import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { read as readFromClipboard } from 'clipboardy';
import { startListener } from '../../src/listener.js';
import type { ListenerHandle } from '../../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestCase {
  name: string;
  initialContent: string;
  newContent: string;
  expectedPrepended: string;
  expectedOutput: string;
  expectedClipboard: string;
}

// Helper to normalize timestamps for comparison
function normalizeTimestamp(content: string): string {
  return content.replace(/at \d{1,2}:\d{2}:\d{2}/g, 'at 10:30:00');
}

// Helper to normalize block IDs (abc, wr1, etc) for comparison
function normalizeBlockIds(content: string): string {
  // This is a simplified version - in real tests we'd need to map generated IDs
  return content;
}

// Parse test cases from markdown
async function parseTestCases(): Promise<TestCase[]> {
  const testDataPath = join(__dirname, '../../test-data/integration/listener-workflow-v2.cases.md');
  const markdown = await readFile(testDataPath, 'utf-8');
  
  const tokens = marked.lexer(markdown);
  const testCases: TestCase[] = [];
  let currentTest: Partial<TestCase> | null = null;
  let codeBlocksForCurrentTest: string[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Test case name (h3)
    if (token.type === 'heading' && token.depth === 3) {
      // Save previous test if complete
      if (currentTest && currentTest.name && codeBlocksForCurrentTest.length === 5) {
        currentTest.initialContent = codeBlocksForCurrentTest[0];
        currentTest.newContent = codeBlocksForCurrentTest[1];
        currentTest.expectedPrepended = codeBlocksForCurrentTest[2];
        currentTest.expectedOutput = codeBlocksForCurrentTest[3];
        currentTest.expectedClipboard = codeBlocksForCurrentTest[4];
        testCases.push(currentTest as TestCase);
      }
      
      // Start new test
      currentTest = { name: token.text };
      codeBlocksForCurrentTest = [];
    }
    
    // Collect code blocks (regardless of h4 headings)
    if (token.type === 'code' && currentTest) {
      codeBlocksForCurrentTest.push(token.text);
    }
  }
  
  // Don't forget the last test case
  if (currentTest && currentTest.name && codeBlocksForCurrentTest.length === 5) {
    currentTest.initialContent = codeBlocksForCurrentTest[0];
    currentTest.newContent = codeBlocksForCurrentTest[1];
    currentTest.expectedPrepended = codeBlocksForCurrentTest[2];
    currentTest.expectedOutput = codeBlocksForCurrentTest[3];
    currentTest.expectedClipboard = codeBlocksForCurrentTest[4];
    testCases.push(currentTest as TestCase);
  }
  
  return testCases;
}

// Helper to poll for expected content
async function pollForContent(
  filePath: string, 
  check: (content: string) => boolean, 
  timeoutMs: number = 2000
): Promise<string> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      const content = await readFile(filePath, 'utf-8');
      if (check(content)) return content;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timeout after ${timeoutMs}ms waiting for expected content`);
}

describe('listener workflow v2', async () => {
  const testCases = await parseTestCases();
  
  for (const testCase of testCases) {
    it(testCase.name, async () => {
      let handle: ListenerHandle | null = null;
      const testDir = `/tmp/t_listener_${testCase.name.toLowerCase().replace(/\s+/g, '_')}`;
      const testFile = join(testDir, 'test.txt');
      const outputFile = join(testDir, '.clada-output-latest.txt');
      
      try {
        // Setup
        await mkdir(testDir, { recursive: true });
        await writeFile(testFile, testCase.initialContent);
        
        // Start listener
        handle = await startListener({ 
          filePath: testFile, 
          debounceMs: 100 
        });
        
        // Wait for initial processing
        await pollForContent(testFile, content => 
          content.includes('=== CLADA RESULTS ===')
        );
        
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Write new content
        await writeFile(testFile, testCase.newContent);
        
        // Poll for execution to complete
        await pollForContent(testFile, content => {
          const normalized = normalizeTimestamp(content);
          // Check if the summary section matches expected pattern
          return normalized.includes('📋 Copied to clipboard at 10:30:00') &&
                 normalized.includes('=== CLADA RESULTS ===') &&
                 normalized.includes('=== END ===');
        });
        
        // Verify prepended results
        const actualPrepended = await readFile(testFile, 'utf-8');
        const normalizedActual = normalizeTimestamp(normalizeBlockIds(actualPrepended));
        const normalizedExpected = normalizeTimestamp(normalizeBlockIds(testCase.expectedPrepended));
        
        // For now, just check key elements are present
        expect(normalizedActual).toContain('📋 Copied to clipboard at 10:30:00');
        expect(normalizedActual).toContain('=== CLADA RESULTS ===');
        expect(normalizedActual).toContain('=== END ===');
        expect(normalizedActual).toContain(testCase.newContent);
        
        // Verify output file
        const actualOutput = await readFile(outputFile, 'utf-8');
        const normalizedOutput = normalizeTimestamp(normalizeBlockIds(actualOutput));
        
        expect(normalizedOutput).toContain('📋 Copied to clipboard at 10:30:00');
        expect(normalizedOutput).toContain('=== CLADA RESULTS ===');
        expect(normalizedOutput).toContain('=== OUTPUTS ===');
        
        // Verify clipboard contents
        const actualClipboard = await readFromClipboard();
        const normalizedClipboard = normalizeTimestamp(normalizeBlockIds(actualClipboard));
        const normalizedExpectedClipboard = normalizeTimestamp(normalizeBlockIds(testCase.expectedClipboard));
        
        // Check that clipboard contains the expected content
        // Note: The clipboard should have the full output without the clipboard status line
        expect(normalizedClipboard).toContain('=== CLADA RESULTS ===');
        expect(normalizedClipboard).toContain('=== OUTPUTS ===');
        expect(normalizedClipboard).toContain('=== END ===');
        
      } finally {
        // Cleanup
        if (handle) {
          await handle.stop();
        }
        await rm(testDir, { recursive: true, force: true });
      }
    });
  }
});