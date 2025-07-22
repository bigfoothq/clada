import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { startListener } from '../../src/listener.js';
import type { ListenerHandle } from '../../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper to wait for file changes to be processed
async function waitForProcessing(ms: number = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
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

    // Start listener
    handle = await startListener({ filePath: testFile });
    await waitForProcessing(600); // Let it initialize (must exceed 500ms debounce)

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
    await waitForProcessing(); // Wait for debounce + processing

    // Check output file was created
    const outputContent = await readFile(join(testDir, 'output.txt'), 'utf-8');
    expect(outputContent).toBe('Hello from listener!');

    // Check .clada-output-latest.txt was created
    const cladaOutput = await readFile(outputFile, 'utf-8');
    const normalizedOutput = normalizeTimestamp(cladaOutput);
    expect(normalizedOutput).toContain('📋 Copied to clipboard at 10:30:00');
    expect(normalizedOutput).toContain('abc ✅ file_write');
    expect(normalizedOutput).toContain('=== OUTPUTS ===');

    // Check file was prepended with results
    const updatedContent = await readFile(testFile, 'utf-8');
    const normalizedContent = normalizeTimestamp(updatedContent);
    expect(normalizedContent).toContain('📋 Copied to clipboard at 10:30:00');
    expect(normalizedContent).toContain('abc ✅ file_write');
    expect(normalizedContent).toContain(withSham); // Original content preserved
  });

  it('handles multiple actions with mixed results', async () => {
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

    // Start listener
    handle = await startListener({ filePath: testFile });
    await waitForProcessing();

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

    // Start listener
    handle = await startListener({ filePath: testFile });
    await waitForProcessing();

    // Verify file was created
    const counterContent1 = await readFile(join(testDir, 'counter.txt'), 'utf-8');
    expect(counterContent1).toBe('1');

    // Get current file content (with prepended results)
    const prependedContent = await readFile(testFile, 'utf-8');

    // Simulate editing file but keeping SHAM blocks the same
    // Just add a comment outside SHAM
    const editedContent = prependedContent + '\n<!-- Comment added -->\n';
    await writeFile(testFile, editedContent);
    await waitForProcessing();

    // Change the counter file to detect if action re-executed
    await writeFile(join(testDir, 'counter.txt'), '2');

    // Trigger another save with same SHAM content
    await writeFile(testFile, editedContent + ' ');
    await waitForProcessing();

    // Counter should still be 2 (not overwritten back to 1)
    const counterContent2 = await readFile(join(testDir, 'counter.txt'), 'utf-8');
    expect(counterContent2).toBe('2');
  });

  it('handles parse errors gracefully', async () => {
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

    // Start listener
    handle = await startListener({ filePath: testFile });
    await waitForProcessing();

    // Check error was reported
    const updatedContent = await readFile(testFile, 'utf-8');
    expect(updatedContent).toContain('bad ❌');
    expect(updatedContent).toContain('Unterminated heredoc');
  });
});