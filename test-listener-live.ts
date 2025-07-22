#!/usr/bin/env tsx

import { startListener, stopListener } from './proj/comp/listener/src/index.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const TEST_FILE = join(process.cwd(), 'my-test-commands.md');

async function main() {
  // Create initial test file if it doesn't exist
  try {
    await writeFile(TEST_FILE, `# Test Commands

Try adding SHAM blocks below this line:

\`\`\`sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "ls"
path = "."
#!END_SHAM_abc
\`\`\`

`, { flag: 'wx' }); // wx = write only if doesn't exist
    console.log(`Created test file: ${TEST_FILE}`);
  } catch (e) {
    console.log(`Using existing test file: ${TEST_FILE}`);
  }

  // Start the listener
  console.log('Starting listener...');
  const handle = await startListener({
    filePath: TEST_FILE,
    debounceMs: 500,
    outputFilename: '.my-test-output.txt'
  });
  
  console.log(`
🎧 Listener started!
📝 Edit file: ${TEST_FILE}
📋 Output will be copied to clipboard
📄 Full output saved to: .my-test-output.txt

Press Ctrl+C to stop
`);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nStopping listener...');
    await stopListener(handle);
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch(console.error);