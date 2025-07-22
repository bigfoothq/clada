import { startListener } from '../proj/comp/listener/src/index.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  try {
    // Create an input file path (using your existing one)
    const inputFile = join(process.cwd(), 'scripts/clada-input.md');
    
    // Create the input file if it doesn't exist
    try {
      await writeFile(inputFile, '# Clada Commands\n\nType your commands here and save the file!\n\n', { flag: 'wx' });
      console.log(`Created new input file: ${inputFile}`);
    } catch (error) {
      // File already exists, that's fine
      console.log(`Using existing input file: ${inputFile}`);
    }
    
    // Start the listener
    const handle = await startListener({
      filePath: inputFile,
      debounceMs: 500,  // Wait 500ms after changes before processing
      outputFilename: 'clada-output.txt'  // Will be created in same directory
    });
    
    console.log(`\n✅ Listener started!`);
    console.log(`📝 Input file: ${inputFile}`);
    console.log(`📄 Output will be saved to: ${join(process.cwd(), 'scripts/clada-output.txt')}`);
    console.log(`\n🎯 Try adding these commands to the file:`);
    console.log(`   - create hello.txt with "Hello from Clada!"`);
    console.log(`   - list files in current directory`);
    console.log(`   - run echo "Testing the listener!"`);
    console.log(`\nℹ️  Save the file to trigger processing`);
    console.log(`Press Ctrl+C to stop...\n`);
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n\nStopping listener...');
      await handle.stop();
      console.log('Listener stopped. Goodbye!');
      process.exit(0);
    });
    
    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();