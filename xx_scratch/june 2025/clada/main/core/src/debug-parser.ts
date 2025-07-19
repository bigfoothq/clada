<<<END>>>

<<<FILE>>>

clada/main/core/src/debug-parser-newlines.ts

<<<SEARCH>>>
#!/usr/bin/env node
<<<REPLACE>>>

import { parse } from 'csl-parser';

/**
 * Diagnostic script to understand CSL parser behavior with newlines
 * Run with: node --import tsx clada/main/core/src/debug-parser.ts
 */

const testCases = [
  {
    name: "Single line content",
    csl: `<---WRITE file="test.txt"--->
hello world
<---END--->`
  },
  {
    name: "Content with explicit newline at end",
    csl: `<---WRITE file="test.txt"--->
hello world\n<---END--->`
  },
  {
    name: "Multi-line content", 
    csl: `<---WRITE file="test.txt"--->
line 1
line 2
<---END--->`
  },
  {
    name: "Empty line after content",
    csl: `<---WRITE file="test.txt"--->
hello world

<---END--->`
  },
  {
    name: "No newline before closing tag",
    csl: `<---WRITE file="test.txt"--->
hello world<---END--->`
  }
];

console.log('=== CSL Parser Newline Investigation ===\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('CSL input:');
  console.log(JSON.stringify(testCase.csl));
  console.log();
  
  try {
    const result = parse(testCase.csl);
    const writeOp = result.ast[0];
    
    if (writeOp && writeOp.type === 'WRITE') {
      console.log('Parser output:');
      console.log('- Content:', JSON.stringify(writeOp.content));
      console.log('- Content length:', writeOp.content.length);
      console.log('- Ends with \\n:', writeOp.content.endsWith('\n'));
      console.log('- Character codes at end:', 
        writeOp.content.slice(-3).split('').map(c => c.charCodeAt(0)));
    }
  } catch (error) {
    console.log('Parse error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
});

// Also test the specific cases from our failing tests
console.log('=== Specific Test Case Analysis ===\n');

const failingTests = [
  {
    name: "Test expecting 'hello world\\n'",
    csl: `<---WRITE file="test.txt"--->
hello world
<---END--->`
  },
  {
    name: "Append test first write",
    csl: `<---WRITE file="log.txt"--->
line 1
<---END--->`
  },
  {
    name: "Append test second write", 
    csl: `<---WRITE file="log.txt" append="true"--->
line 2
<---END--->`
  }
];

failingTests.forEach((testCase) => {
  console.log(`Failing test: ${testCase.name}`);
  const result = parse(testCase.csl);
  const writeOp = result.ast[0];
  
  if (writeOp && writeOp.type === 'WRITE') {
    console.log('Expected by test:', JSON.stringify(testCase.name.match(/'([^']+)'/)?.[1] || 'unknown'));
    console.log('Actual from parser:', JSON.stringify(writeOp.content));
    console.log('Match:', writeOp.content === (testCase.name.match(/'([^']+)'/)?.[1] || 'unknown'));
  }
  console.log();
});