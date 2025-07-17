#!/usr/bin/env node

import { orchestrate } from './orchestrate.js';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Test script to see actual file output from orchestrate
 * Run with: node --import tsx clada/main/core/src/test-newlines.ts
 */

async function testNewlines() {
  const testDir = await fs.mkdtemp(join(tmpdir(), 'clada-nl-test-'));
  console.log(`Test directory: ${testDir}\n`);

  const testCSL = `<---WRITE file="test1.txt"--->
hello world
<---END--->
<---WRITE file="test2.txt"--->
line 1
<---END--->
<---WRITE file="test2.txt" append="true"--->
line 2
<---END--->`;

  console.log('Input CSL:');
  console.log(testCSL);
  console.log('\n' + '='.repeat(50) + '\n');

  // Run orchestrate
  await orchestrate(testCSL, { workingDir: testDir });

  // Check the output files
  console.log('\nFile contents:');
  
  const test1Content = await fs.readFile(join(testDir, 'test1.txt'), 'utf8');
  console.log('test1.txt:');
  console.log('- Raw:', JSON.stringify(test1Content));
  console.log('- Length:', test1Content.length);
  console.log('- Ends with \\n:', test1Content.endsWith('\n'));

  const test2Content = await fs.readFile(join(testDir, 'test2.txt'), 'utf8');
  console.log('\ntest2.txt:');
  console.log('- Raw:', JSON.stringify(test2Content));
  console.log('- Length:', test2Content.length);
  console.log('- Has newline between lines:', test2Content.includes('\n'));

  // What the tests expect
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('Test expectations:');
  console.log('- test1.txt should be:', JSON.stringify('hello world\n'));
  console.log('- test2.txt should be:', JSON.stringify('line 1\nline 2\n'));
  
  console.log('\nActual vs Expected:');
  console.log('- test1.txt matches:', test1Content === 'hello world\n');
  console.log('- test2.txt matches:', test2Content === 'line 1\nline 2\n');

  // Cleanup
  await fs.rm(testDir, { recursive: true });
}

testNewlines().catch(console.error);