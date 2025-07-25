import { Loaf } from '../../proj/comp/orch/src/index.js';
import { writeFile, readFile, rm } from 'fs/promises';

const testContent = `# My Document

Some content here.

\`\`\`sh nesl
#!NESL [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/debug_orch/output.txt"
content = "Hello from listener!"
#!END_NESL_abc
\`\`\`
`;

async function debugOrchestrator() {
  console.log('=== Testing Orchestrator Directly ===');
  console.log('Input content:');
  console.log(testContent);
  console.log('\n=== Calling Orchestrator ===');

  try {
    const loaf = new Loaf({ gitCommit: false });
    const result = await loaf.execute(testContent);

    console.log('\nOrchestrator result:');
    console.log(JSON.stringify(result, null, 2));

    // Check if output file was created
    try {
      const output = await readFile('/tmp/debug_orch/output.txt', 'utf-8');
      console.log('\nOutput file content:');
      console.log(output);
    } catch (e) {
      console.log('\nOutput file not created');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugOrchestrator();