=== PROCESSED: 2025-07-22 21:41:19 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
===

Looking at the test failure, the issue is clear: the current `formatSummary` function doesn't match the expected output format for parse errors. The test expects a specific format with:

1. Aligned columns using spacing
2. "ERROR:" prefix for error messages  
3. Special handling for multiple errors on the same block (grouping with count and sub-bullets)
4. Line number information in parentheses
5. Action shown as "-" when no action is detected

Let me analyze the expected format more carefully:

```
pe1 ❌ file_write   ERROR: Unclosed quoted string (line 4)
pe2 ❌ -            ERROR: Invalid assignment operator ':=' - only '=' is allowed (line 12)
pe3 ❌ -            ERROR: Invalid line format: not a valid key-value assignment or empty line (line 19)
pe4 ❌ file_write   ERROR: 3 syntax errors (line 25)
                    - Value must be a quoted string or heredoc
                    - Invalid line format (2 occurrences)
pe5 ❌ exec         ERROR: Unexpected content after quoted value (line 34)
```

The key patterns:
- Fixed-width columns: blockId (3 chars) + space + ❌ + space + action (padded to ~10 chars) + space + ERROR: + message
- When action is unknown/missing, use "-"
- When multiple errors exist for same block, show count and list unique errors with occurrence counts
- Line numbers shown as "(line X)" at end of first error line

<<<EXPLANATION>>>

Update formatSummary to match the expected test output format with proper column alignment, ERROR: prefix, grouped error handling, and line number formatting

<<<FILE>>>

/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts

<<<SEARCH>>>
export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // DEBUG: Log raw orchestrator result for parse errors
  if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
    console.log('DEBUG: Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
  }
  
  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);
      
      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }
  
  // Add parse errors
  if (orchResult.parseErrors) {
    for (const error of orchResult.parseErrors) {
      lines.push(`${error.blockId || 'unknown'} ❌ ${error.action || '(parse error)'} - ${error.message}`);
    }
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}
<<<REPLACE>>>
export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // DEBUG: Log raw orchestrator result for parse errors
  if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
    console.log('DEBUG: Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
  }
  
  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);
      
      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }
  
  // Add parse errors - group by blockId
  if (orchResult.parseErrors) {
    const errorsByBlock = new Map<string, any[]>();
    
    // Group errors by blockId
    for (const error of orchResult.parseErrors) {
      const blockId = error.blockId || 'unknown';
      if (!errorsByBlock.has(blockId)) {
        errorsByBlock.set(blockId, []);
      }
      errorsByBlock.get(blockId)!.push(error);
    }
    
    // Format grouped errors
    for (const [blockId, errors] of errorsByBlock) {
      const firstError = errors[0];
      const action = firstError.action || '-';
      const lineInfo = firstError.blockStartLine ? ` (line ${firstError.blockStartLine})` : '';
      
      // Pad action to 10 characters for alignment
      const paddedAction = action.padEnd(10);
      
      if (errors.length === 1) {
        // Single error
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${firstError.message}${lineInfo}`);
      } else {
        // Multiple errors - count unique messages
        const messageCount = new Map<string, number>();
        for (const error of errors) {
          const msg = error.message;
          messageCount.set(msg, (messageCount.get(msg) || 0) + 1);
        }
        
        // First line shows total count
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${errors.length} syntax errors${lineInfo}`);
        
        // Sub-bullets for each unique error type
        const indent = ' '.repeat(20); // Align with ERROR: column
        for (const [msg, count] of messageCount) {
          if (count > 1) {
            lines.push(`${indent}- ${msg} (${count} occurrences)`);
          } else {
            lines.push(`${indent}- ${msg}`);
          }
        }
      }
    }
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}
<<<END>>>

<<<EXPLANATION>>>

Update formatFullOutput to use the same parse error formatting logic as formatSummary for consistency

<<<FILE>>>

/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts

<<<SEARCH>>>
  // Add parse errors - group by blockId
  if (orchResult.parseErrors) {
    const errorsByBlock = new Map<string, any[]>();
    
    for (const error of orchResult.parseErrors) {
      const blockId = error.blockId || 'unknown';
      if (!errorsByBlock.has(blockId)) {
        errorsByBlock.set(blockId, []);
      }
      errorsByBlock.get(blockId)!.push(error);
    }
    
    // Format grouped errors
    for (const [blockId, errors] of errorsByBlock) {
      const firstError = errors[0];
      const action = firstError.action || 'parse';
      const lineInfo = firstError.blockStartLine ? `, line ${firstError.blockStartLine}` : '';
      
      if (errors.length === 1) {
        // Single error - simple format
        lines.push(`${blockId} ❌ ${action}${lineInfo} - ${firstError.errorType}: ${firstError.message}`);
      } else {
        // Multiple errors - list them
        lines.push(`${blockId} ❌ ${action}${lineInfo} - ${errors.length} errors:`);
        const uniqueMessages = [...new Set(errors.map(e => `  ${e.errorType}: ${e.message}`))];
        lines.push(...uniqueMessages);
      }
    }
  }
<<<REPLACE>>>
  // Add parse errors - group by blockId
  if (orchResult.parseErrors) {
    const errorsByBlock = new Map<string, any[]>();
    
    // Group errors by blockId
    for (const error of orchResult.parseErrors) {
      const blockId = error.blockId || 'unknown';
      if (!errorsByBlock.has(blockId)) {
        errorsByBlock.set(blockId, []);
      }
      errorsByBlock.get(blockId)!.push(error);
    }
    
    // Format grouped errors
    for (const [blockId, errors] of errorsByBlock) {
      const firstError = errors[0];
      const action = firstError.action || '-';
      const lineInfo = firstError.blockStartLine ? ` (line ${firstError.blockStartLine})` : '';
      
      // Pad action to 10 characters for alignment
      const paddedAction = action.padEnd(10);
      
      if (errors.length === 1) {
        // Single error
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${firstError.message}${lineInfo}`);
      } else {
        // Multiple errors - count unique messages
        const messageCount = new Map<string, number>();
        for (const error of errors) {
          const msg = error.message;
          messageCount.set(msg, (messageCount.get(msg) || 0) + 1);
        }
        
        // First line shows total count
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${errors.length} syntax errors${lineInfo}`);
        
        // Sub-bullets for each unique error type
        const indent = ' '.repeat(20); // Align with ERROR: column
        for (const [msg, count] of messageCount) {
          if (count > 1) {
            lines.push(`${indent}- ${msg} (${count} occurrences)`);
          } else {
            lines.push(`${indent}- ${msg}`);
          }
        }
      }
    }
  }
<<<END>>>