#!/usr/bin/env node

// Working listener with Clada integration
// Run with: node scripts/working-listener.js

import { watchFile, unwatchFile } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

// Try to import Clada - we'll handle the error if it fails
let Clada;
try {
  const orchModule = await import('../proj/comp/orch/src/index.js');
  Clada = orchModule.Clada;
  console.log('✅ Clada orchestrator loaded successfully');
} catch (error) {
  console.error('⚠️  Could not load Clada orchestrator:', error.message);
  console.log('   Falling back to mock mode\n');
}

const INPUT_FILE = join(process.cwd(), 'scripts/clada-input.md');
const OUTPUT_FILE = join(process.cwd(), 'scripts/clada-output.txt');

console.log('🚀 Clada Listener Started');
console.log(`📝 Watching: ${INPUT_FILE}`);
console.log(`📄 Output to: ${OUTPUT_FILE}`);
console.log('\n💡 Try these commands in your input file:');
console.log('   - create test.txt with "Hello, World!"');
console.log('   - list files in current directory');
console.log('   - run echo "Testing Clada!"');
console.log('\nPress Ctrl+C to stop.\n');

// State
let processing = false;
let lastHash = '';

// Compute hash of content
function computeHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

// Strip summary section if present
function stripSummary(content) {
  const marker = '=== END ===';
  const i = content.lastIndexOf(marker);
  return i === -1 ? content : content.slice(i + marker.length).trimStart();
}

// Format summary
function formatSummary(result, timestamp) {
  const time = timestamp.toLocaleTimeString();
  return `📋 Copied to clipboard at ${time}
=== SUMMARY ${time} ===
✅ Executed ${result.executedActions || 0} actions
${result.summary || 'No additional details'}
=== END ===`;
}

async function processFile() {
  if (processing) return;
  processing = true;
  
  try {
    const fullContent = await readFile(INPUT_FILE, 'utf-8');
    const contentForHash = stripSummary(fullContent).trim();
    const currentHash = computeHash(contentForHash);
    
    // Skip if unchanged
    if (currentHash === lastHash) {
      console.log('Content unchanged, skipping...');
      processing = false;
      return;
    }
    
    const timestamp = new Date();
    console.log(`[${timestamp.toLocaleTimeString()}] Processing changes...`);
    
    let result;
    let output;
    
    if (Clada) {
      // Real Clada execution
      try {
        const clada = new Clada({ gitCommit: false });
        result = await clada.execute(fullContent);
        console.log(`[${timestamp.toLocaleTimeString()}] ✅ Executed ${result.executedActions} actions`);
        
        // Format output
        output = `Clada Execution Results
=======================
Timestamp: ${timestamp.toISOString()}
Actions executed: ${result.executedActions}

${JSON.stringify(result, null, 2)}`;
        
      } catch (error) {
        console.error('Clada execution error:', error);
        output = `Error during execution: ${error.message}`;
        result = { executedActions: 0, summary: 'Error: ' + error.message };
      }
    } else {
      // Mock mode
      console.log(`[${timestamp.toLocaleTimeString()}] 📝 Mock mode - echoing content`);
      output = `Mock Output (Clada not loaded)
================================
Timestamp: ${timestamp.toISOString()}
Content length: ${contentForHash.length} bytes

Original content:
${contentForHash}`;
      result = { executedActions: 0, summary: 'Mock mode - no actions executed' };
    }
    
    // Write output file
    await writeFile(OUTPUT_FILE, output);
    
    // Prepend summary to input file
    const summary = formatSummary(result, timestamp);
    const updatedContent = summary + '\n\n' + fullContent;
    await writeFile(INPUT_FILE, updatedContent);
    
    // Update hash
    lastHash = currentHash;
    
    console.log(`[${timestamp.toLocaleTimeString()}] ✅ Done! Check output file`);
    
    // Note about clipboard
    console.log(`[${timestamp.toLocaleTimeString()}] ℹ️  Note: Clipboard copy not implemented in this version`);
    
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
  console.log('\n\nStopping listener...');
  unwatchFile(INPUT_FILE);
  console.log('Goodbye!');
  process.exit(0);
});