=== PROCESSED: 2025-07-22 19:04:48 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/test/unit/stopListener.test.ts
===

Looking at this intermittent test failure, I can see the issue. The test "allows watching again after stop" is failing because the listener hasn't had enough time to process the file change before the assertion is made.

Here's what's happening:

1. The test writes new content with a SHAM block
2. Waits 600ms 
3. Immediately checks if the content contains "=== CLADA RESULTS ==="
4. Sometimes the listener hasn't finished processing yet, so the assertion fails

The fix is to increase the wait time or use a more robust polling mechanism. Here's the issue and fix:

<<<EXPLANATION>>>
The test is racing - 600ms isn't always enough time for the listener to process the file change and prepend the CLADA results. This causes intermittent failures.
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test/unit/stopListener.test.ts
<<<SEARCH>>>
    // Verify new listener works
    await writeFile(testFile, '```sh sham\n#!SHAM [@three-char-SHA-256: tst]\naction = "exec"\nlang = "bash"\ncode = "echo test"\n#!END_SHAM_tst\n```');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const content = await readFile(testFile, 'utf-8');
    expect(content).toContain('=== CLADA RESULTS ===');
<<<REPLACE>>>
    // Verify new listener works
    await writeFile(testFile, '```sh sham\n#!SHAM [@three-char-SHA-256: tst]\naction = "exec"\nlang = "bash"\ncode = "echo test"\n#!END_SHAM_tst\n```');
    
    // Poll for the processed content (up to 2 seconds)
    const startTime = Date.now();
    let content = '';
    while (Date.now() - startTime < 2000) {
      content = await readFile(testFile, 'utf-8');
      if (content.includes('=== CLADA RESULTS ===')) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    expect(content).toContain('=== CLADA RESULTS ===');
<<<END>>>

This change replaces the fixed 600ms wait with a polling mechanism that:
- Checks every 100ms if the file has been processed
- Times out after 2 seconds (which should be more than enough)
- Exits early as soon as the expected content appears

This approach is both faster (exits as soon as ready) and more reliable (waits longer if needed).