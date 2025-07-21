=== PROCESSED: 2025-07-21 00:45:20 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
===

Looking at the test failure, there's a trailing newline discrepancy in the `shamContent` field. The test expects the content to end with `#!END_SHAM_bad"` but the actual output includes an additional newline: `#!END_SHAM_bad\n"`.

The issue is in `/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts` in the `reconstructShamBlock` function. It's joining lines with `\n` which adds a trailing newline:

```typescript
return lines.join('\n');
```

This creates a string that ends with a newline after the last line.

## The Fix

<<<EXPLANATION>>>
Remove trailing newline from reconstructed SHAM blocks to match expected test output
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
<<<SEARCH>>>
  // End line
  lines.push(`#!END_SHAM_${block.id || 'unknown'}`);
  
  return lines.join('\n');
<<<REPLACE>>>
  // End line
  lines.push(`#!END_SHAM_${block.id || 'unknown'}`);
  
  return lines.join('\n');
<<<END>>>

Wait, that won't fix it. The issue is that `join('\n')` naturally doesn't add a trailing newline. The problem must be elsewhere.

Looking more carefully at the test data structure - the expected JSON shows the shamContent as a single line with escaped newlines:

```
"shamContent": "#!SHAM [@three-char-SHA-256: bad]\naction = \"file_write\"\npath = \"/tmp/bad.txt\"\npath = \"/tmp/duplicate.txt\"\n#!END_SHAM_bad"
```

But the actual output has an extra newline at the very end. Let me trace through the parser flow to understand where this is coming from.

Actually, I think the issue might be in how nesl-js is providing the block context. The `parseError.context` might already include a trailing newline. Let's fix this by trimming the reconstructed content:

<<<EXPLANATION>>>
Ensure reconstructed SHAM blocks don't have trailing newlines by checking the error context construction
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
<<<SEARCH>>>
      errors.push({
        blockId: parseError.blockId || 'unknown',
        action: block?.properties?.action,
        errorType: 'syntax',
        message: parseError.message,
        blockStartLine: block?.startLine || parseError.line,
        shamContent: `#!SHAM [@three-char-SHA-256: ${parseError.blockId}]\n${parseError.context}`
      });
<<<REPLACE>>>
      errors.push({
        blockId: parseError.blockId || 'unknown',
        action: block?.properties?.action,
        errorType: 'syntax',
        message: parseError.message,
        blockStartLine: block?.startLine || parseError.line,
        shamContent: parseError.context 
          ? `#!SHAM [@three-char-SHA-256: ${parseError.blockId}]\n${parseError.context}`.trimEnd()
          : reconstructShamBlock(block || { id: parseError.blockId, properties: {} })
      });
<<<END>>>

This approach:
1. Uses the error context from nesl-js when available
2. Trims any trailing whitespace/newlines
3. Falls back to reconstruction if no context provided