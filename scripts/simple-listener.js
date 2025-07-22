#!/usr/bin/env node

// Simple test script to get the listener working
// Run with: node scripts/simple-listener.js

import { watchFile, unwatchFile } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const INPUT_FILE = join(process.cwd(), 'scripts/clada-input.md');
const OUTPUT_FILE = join(process.cwd(), 'scripts/clada-output.txt');

console.log('🚀 Simple Listener Test');
console.log(`📝 Watching: ${INPUT_FILE}`);
console.log(`📄 Output to: ${OUTPUT_FILE}`);
console.log('\nEdit the input file and save to see changes!');
console.log('Press Ctrl+C to stop.\n');

// Simple file watcher
let processing = false;

async function processFile() {
  if (processing) return;
  processing = true;
  
  try {
    const content = await readFile(INPUT_FILE, 'utf-8');
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] File changed! Content length: ${content.length} bytes`);
    
    // For now, just echo the content to the output file
    // You can replace this with actual Clada processing later
    const output = `Processed at ${timestamp}\n\n${content}`;
    await writeFile(OUTPUT_FILE, output);
    
    console.log(`[${timestamp}] ✅ Wrote output file`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    processing = false;
  }
}

// Start watching
watchFile(INPUT_FILE, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    processFile();
  }
});

// Initial process
processFile();

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nStopping...');
  unwatchFile(INPUT_FILE);
  process.exit(0);
});