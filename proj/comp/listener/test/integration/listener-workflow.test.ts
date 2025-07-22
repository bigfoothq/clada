import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { startListener } from '../../src/listener.js';
import type { ListenerHandle } from '../../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Helper to wait for initial processing
async function waitForInitialProcessing(testFile: string): Promise<void> {
  await pollForContent(testFile, content => 
    content.includes('=== CLADA RESULTS ==='), 
    1500
  );
}

// Helper to read and normalize timestamps in output
function normalizeTimestamp(content: string): string {
  return content.replace(/at \d{1,2}:\d{2}:\d{2}/g, 'at 10:30:00');
}

describe('listener workflow integration', () => {
  let handle: ListenerHandle | null = null;
  const testDir = '/tmp/t_listener_integration';
  const testFile = join(testDir, 'test.md');
  const outputFile = join(testDir, '.clada-output-latest.txt');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (handle) {
      await handle.stop();
      handle = null;
    }
    await rm(testDir, { recursive: true, force: true });
  });

  it('processes SHAM blocks and updates files', async () => {
    // Create initial file
    const initialContent = '# My Document\n\nSome content here.\n';
    await writeFile(testFile, initialContent);

    // Start listener with short debounce for faster tests
    handle = await startListener({ filePath: testFile, debounceMs: 100 });
    
    // Wait for initial processing to complete
    await waitForInitialProcessing(testFile);

    // Wait for debounce to settle  
    await new Promise(resolve => setTimeout(resolve, 150));

    // Add SHAM block
    const withSham = initialContent + `
\`\`\`sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "${testDir}/output.txt"
content = "Hello from listener!"
#!END_SHAM_abc
\`\`\`
`;
    await writeFile(testFile, withSham);
    
    // Poll for SHAM execution results
    await pollForContent(testFile, content => 
      content.includes('abc ✅ file_write') && 
      content.includes('📋 Copied to clipboard')
    );

    // Poll for output file creation
    const outputContent = await pollForContent(
      join(testDir, 'output.txt'), 
      content => content === 'Hello from listener!'
    );
    expect(outputContent).toBe('Hello from listener!');

    // Poll for .clada-output-latest.txt
    const cladaOutput = await pollForContent(
      outputFile,
      content => content.includes('abc ✅ file_write') && content.includes('=== OUTPUTS ===')
    );
    const normalizedOutput = normalizeTimestamp(cladaOutput);
    expect(normalizedOutput).toContain('📋 Copied to clipboard at 10:30:00');
    expect(normalizedOutput).toContain('abc ✅ file_write');
    expect(normalizedOutput).toContain('=== OUTPUTS ===');

    // File should have results prepended
    const updatedContent = await readFile(testFile, 'utf-8');
    const normalizedContent = normalizeTimestamp(updatedContent);
    expect(normalizedContent).toContain('📋 Copied to clipboard at 10:30:00');
    expect(normalizedContent).toContain('abc ✅ file_write');
    expect(normalizedContent).toContain('```'); // Original SHAM block preserved
  });

  it('handles multiple actions with mixed results', async () => {
    // Create initial empty file
    await writeFile(testFile, '');

    // Start listener with short debounce for faster tests
    handle = await startListener({ filePath: testFile, debounceMs: 100 });
    
    // Wait for initial processing
    await waitForInitialProcessing(testFile);
    
    // Wait for debounce to settle
    await new Promise(resolve => setTimeout(resolve, 600));

    const content = `
\`\`\`sh sham
#!SHAM [@three-char-SHA-256: wr1]
action = "file_write"
path = "${testDir}/file1.txt"
content = "First file"
#!END_SHAM_wr1
\`\`\`

\`\`\`sh sham
#!SHAM [@three-char-SHA-256: rd1]
action = "file_read"
path = "${testDir}/missing.txt"
#!END_SHAM_rd1
\`\`\`

\`\`\`sh sham
#!SHAM [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello world'"
#!END_SHAM_ex1
\`\`\`
`;
    await writeFile(testFile, content);
    
    // Poll for results
    await pollForContent(testFile, content => 
      content.includes('wr1 ✅ file_write') &&
      content.includes('rd1 ❌ file_read') &&
      content.includes('ex1 ✅ exec')
    );

    // Check results
    const updatedContent = await readFile(testFile, 'utf-8');
    const normalized = normalizeTimestamp(updatedContent);
    
    expect(normalized).toContain('wr1 ✅ file_write');
    expect(normalized).toContain('rd1 ❌ file_read');
    expect(normalized).toContain('File not found');
    expect(normalized).toContain('ex1 ✅ exec bash');

    // Check full output file
    const fullOutput = await readFile(outputFile, 'utf-8');
    expect(fullOutput).toContain('[ex1] exec bash:');
    expect(fullOutput).toContain('Hello world');
  });

  it('does not re-execute unchanged SHAM blocks', async () => {
    // Create initial empty file
    await writeFile(testFile, '');

    // Start listener with short debounce for faster tests
    handle = await startListener({ filePath: testFile, debounceMs: 100 });
    
    // Wait for initial processing
    await waitForInitialProcessing(testFile);
    
    // Wait for debounce to settle
    await new Promise(resolve => setTimeout(resolve, 600));

    const content = `
\`\`\`sh sham
#!SHAM [@three-char-SHA-256: nc1]
action = "file_write"
path = "${testDir}/counter.txt"
content = "1"
#!END_SHAM_nc1
\`\`\`
`;
    await writeFile(testFile, content);
    
    // Poll for initial execution
    await pollForContent(testFile, content => 
      content.includes('nc1 ✅ file_write')
    );

    // Verify file was created
    const counterContent1 = await readFile(join(testDir, 'counter.txt'), 'utf-8');
    expect(counterContent1).toBe('1');

    // Get current file content (with prepended results)
    const prependedContent = await readFile(testFile, 'utf-8');

    // Simulate editing file but keeping SHAM blocks the same
    // Just add a comment outside SHAM
    const editedContent = prependedContent + '\n<!-- Comment added -->\n';
    await writeFile(testFile, editedContent);
    
    // Wait a bit to ensure any processing would have started
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Change the counter file to detect if action re-executed
    await writeFile(join(testDir, 'counter.txt'), '2');

    // Trigger another save with same SHAM content
    await writeFile(testFile, editedContent + ' ');
    
    // Wait to ensure no re-processing happens
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Counter should still be 2 (not overwritten back to 1)
    const counterContent2 = await readFile(join(testDir, 'counter.txt'), 'utf-8');
    expect(counterContent2).toBe('2');
  });

  it('handles parse errors gracefully', async () => {
    // Create initial empty file
    await writeFile(testFile, '');

    // Start listener with short debounce for faster tests
    handle = await startListener({ filePath: testFile, debounceMs: 100 });
    
    // Wait for initial processing
    await waitForInitialProcessing(testFile);
    
    // Wait for debounce to settle
    await new Promise(resolve => setTimeout(resolve, 600));

    const content = `
\`\`\`sh sham
#!SHAM [@three-char-SHA-256: bad]
action = "file_write"
path = "${testDir}/test.txt"
content = "missing closing quote
#!END_SHAM_bad
\`\`\`
`;
    await writeFile(testFile, content);
    
    // Poll for error to appear
    await pollForContent(testFile, content => 
      content.includes('bad ❌') && 
      content.includes('Unclosed quoted string')
    );

    // Check error was reported
    const updatedContent = await readFile(testFile, 'utf-8');
    expect(updatedContent).toContain('bad ❌');
    expect(updatedContent).toContain('Unclosed quoted string');
  });
});