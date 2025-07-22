=== PROCESSED: 2025-07-21 20:50:30 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
===

Looking at the test failures, I see two issues:

1. **Extra blank line in stderr output** - The test expects no blank line between stdout and stderr sections
2. **Missing blank line at end of OUTPUTS section** - Tests expect a blank line before `=== END ===`

Let me fix the formatOutputContent function:

<<<EXPLANATION>>>
Fix the formatting of stdout/stderr output to match expected format without extra blank line, and ensure blank line before === END ===

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts

<<<SEARCH>>>
function formatOutputContent(result: ExecutionResult): string {
  const { result: execResult } = result;
  
  // Handle different output types
  if (execResult.content !== undefined) {
    return execResult.content;
  }
  
  if (execResult.stdout !== undefined || execResult.stderr !== undefined) {
    const parts = [];
    if (execResult.stdout) {
      parts.push(`stdout:\n${execResult.stdout}`);
    }
    if (execResult.stderr) {
      parts.push(`stderr:\n${execResult.stderr}`);
    }
    return parts.join('\n\n');
  }
  
  if (execResult.data !== undefined) {
    // Pretty print JSON data with 2-space indentation
    return JSON.stringify(execResult.data, null, 2);
  }
  
  return '';
}
<<<REPLACE>>>
function formatOutputContent(result: ExecutionResult): string {
  const { result: execResult } = result;
  
  // Handle different output types
  if (execResult.content !== undefined) {
    return execResult.content;
  }
  
  if (execResult.stdout !== undefined || execResult.stderr !== undefined) {
    const parts = [];
    if (execResult.stdout) {
      parts.push(`stdout:\n${execResult.stdout}`);
    }
    if (execResult.stderr) {
      parts.push(`stderr:\n${execResult.stderr}`);
    }
    // Join with single newline, not double
    return parts.join('\n');
  }
  
  if (execResult.data !== undefined) {
    // Pretty print JSON data with 2-space indentation
    return JSON.stringify(execResult.data, null, 2);
  }
  
  return '';
}
<<<END>>>

<<<EXPLANATION>>>
Fix the formatOutputsSection to ensure there's always a blank line before === END ===

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts

<<<SEARCH>>>
function formatOutputsSection(execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const lines = ['=== OUTPUTS ==='];
  
  // Sort by line number for chronological order
  const sortedResults = [...execResults].sort((a, b) => 
    a.action.metadata.startLine - b.action.metadata.startLine
  );
  
  for (const result of sortedResults) {
    if (!shouldIncludeOutput(result, actionSchema)) continue;
    if (!result.result.success) continue; // Don't show output for failed actions
    
    const header = formatOutputHeader(result);
    const content = formatOutputContent(result);
    
    if (content) {
      lines.push('', header, content);
    }
  }
  
  lines.push('=== END ===');
  return lines.join('\n');
}
<<<REPLACE>>>
function formatOutputsSection(execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const lines = ['=== OUTPUTS ==='];
  
  // Sort by line number for chronological order
  const sortedResults = [...execResults].sort((a, b) => 
    a.action.metadata.startLine - b.action.metadata.startLine
  );
  
  for (const result of sortedResults) {
    if (!shouldIncludeOutput(result, actionSchema)) continue;
    if (!result.result.success) continue; // Don't show output for failed actions
    
    const header = formatOutputHeader(result);
    const content = formatOutputContent(result);
    
    if (content) {
      lines.push('', header, content);
    }
  }
  
  // Always add blank line before === END ===
  lines.push('', '=== END ===');
  return lines.join('\n');
}
<<<END>>>

Now let's run the formatFullOutput tests again to verify the fixes:

```bash
npx vitest run proj/comp/listener/test/unit/formatFullOutput.test.ts
```