=== PROCESSED: 2025-07-21 22:08:24 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
===

The diagnostic output reveals the critical issue:

```
Content length: 34
Content preview: # My Document

Some content here.

Content includes SHAM? false
Content includes backticks? false
```

The orchestrator is receiving only the initial content (34 characters), not the content with SHAM blocks. The second `Debounced process executing` log appears after "File change detected", but we don't see the diagnostics from that second execution.

This indicates the second processFileChange call isn't completing or isn't running the orchestrator at all. The issue is likely the hash comparison - after the first execution, `lastExecutedHash` is set to the hash of the initial content, and when the file changes, it might still be seeing the same hash.

Let's verify by checking what happens in the second execution:

<<<EXPLANATION>>>
Add diagnostics to trace the second execution after file change to see why orchestrator isn't processing the SHAM content

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts

<<<SEARCH>>>
    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      console.log('Hash unchanged, skipping execution');
      return;
    }
<<<REPLACE>>>
    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      console.log('Hash unchanged, skipping execution');
      console.log('This suggests stripSummarySection might be removing too much content');
      return;
    }
<<<END>>>

Actually, let's also check what stripSummarySection is doing to the content:

<<<EXPLANATION>>>
Add logging to see how stripSummarySection processes the content after the first execution prepends results

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts

<<<SEARCH>>>
    // Strip summary section for hashing
    const contentForHash = stripSummarySection(fullContent);
    
    // Compute hash of content (excluding summary)
    const currentHash = computeContentHash(contentForHash);
<<<REPLACE>>>
    // Strip summary section for hashing
    const contentForHash = stripSummarySection(fullContent);
    console.log('Full content length:', fullContent.length);
    console.log('Content for hash length:', contentForHash.length);
    console.log('First 100 chars of content for hash:', contentForHash.substring(0, 100));
    
    // Compute hash of content (excluding summary)
    const currentHash = computeContentHash(contentForHash);
<<<END>>>

The pattern suggests that after the first execution prepends a summary, stripSummarySection might be incorrectly stripping the SHAM content along with the summary, resulting in the same hash as before.