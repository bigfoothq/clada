=== PROCESSED: 2025-07-21 22:10:26 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/test/integration/listener-workflow.test.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
===

Looking at the test failure, the issue is clear: the listener is not detecting the SHAM blocks in the updated file content. The logs show:

1. Initial content has no SHAM blocks → orchestrator returns 0 blocks
2. Test adds SHAM content and waits
3. File change is detected but SHAM blocks aren't found

The problem is in `stripSummarySection`. When the listener processes the file change, it's stripping the prepended summary from the previous run, but the test is writing fresh content without any prepended summary. This causes `stripSummarySection` to incorrectly strip content.

Let me trace through what's happening:
- Test writes: `# My Document\n\nSome content here.\n\n```sh sham...`
- `stripSummarySection` looks for `=== CLADA RESULTS ===` 
- It doesn't find it within the first 100 chars, so returns full content
- But wait... the logs show the content is being processed correctly

Actually, looking more carefully at the logs, the real issue is that the orchestrator is being called with the original content (34 chars) instead of the updated content with SHAM blocks. The file watcher is triggering, but it's reading the old content.

This is a race condition. The test writes the file and immediately waits, but the file watcher's debounced handler might be reading the file before the write is fully flushed.

<<<EXPLANATION>>>
Add a small delay after writing the file to ensure the filesystem write is complete before the file watcher reads it. This is a common issue with file watching tests.
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test/integration/listener-workflow.test.ts
<<<SEARCH>>>
    await writeFile(testFile, withSham);
    console.log('SHAM content written, waiting for processing');
    await waitForProcessing(1500); // Wait longer for fs.watchFile interval (500ms) + debounce (500ms) + processing
<<<REPLACE>>>
    await writeFile(testFile, withSham);
    console.log('SHAM content written, waiting for processing');
    // Small delay to ensure write is flushed before file watcher reads
    await new Promise(resolve => setTimeout(resolve, 100));
    await waitForProcessing(1500); // Wait longer for fs.watchFile interval (500ms) + debounce (500ms) + processing
<<<END>>>

<<<EXPLANATION>>>
The orchestrator is correctly returning empty results because it's not finding SHAM blocks. We need to verify the content being passed to the orchestrator. Let's also add more detailed logging to understand what content the listener is actually reading after the file change.
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
<<<SEARCH>>>
    // Read file
    const fullContent = await readFile(filePath, 'utf-8');
    
    // DIAGNOSTIC: Log file content
    console.log('File content:', fullContent);
<<<REPLACE>>>
    // Read file
    const fullContent = await readFile(filePath, 'utf-8');
    
    // DIAGNOSTIC: Log file content
    console.log('=== FILE READ ===');
    console.log('File path:', filePath);
    console.log('File content length:', fullContent.length);
    console.log('File content preview (first 200 chars):', fullContent.substring(0, 200));
    console.log('File contains SHAM?', fullContent.includes('#!SHAM'));
    console.log('=== END FILE READ ===');
<<<END>>>