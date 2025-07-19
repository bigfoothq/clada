// #!/usr/bin/env node

// import { parse } from 'csl-parser';

// const multiNewlineTests = [
//   {
//     name: "Two empty lines",
//     csl: `<---WRITE file="test.txt"--->
// hello world

// <---END--->`
//   },
//   {
//     name: "Three empty lines", 
//     csl: `<---WRITE file="test.txt"--->
// hello world


// <---END--->`
//   },
//   {
//     name: "Many trailing newlines",
//     csl: `<---WRITE file="test.txt"--->
// hello world




// <---END--->`
//   },
//   {
//     name: "Mixed content with multiple newlines",
//     csl: `<---WRITE file="test.txt"--->
// line 1

// line 2


// <---END--->`
//   }
// ];

// console.log('=== CSL Parser Multiple Newline Test ===\n');

// multiNewlineTests.forEach((test, i) => {
//   console.log(`Test ${i + 1}: ${test.name}`);
//   const result = parse(test.csl);
//   const writeOp = result.ast[0];
  
//   if (writeOp?.type === 'WRITE') {
//     console.log('Content:', JSON.stringify(writeOp.content));
//     console.log('Length:', writeOp.content.length);
//     const newlineCount = (writeOp.content.match(/\n/g) || []).length;
//     console.log('Total newlines:', newlineCount);
//     console.log('Trailing newlines:', writeOp.content.length - writeOp.content.trimEnd().length);
//   }
//   console.log();
// });