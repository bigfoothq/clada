=== PROCESSED: 2025-07-22 22:57:30 ===
ERROR Block 1: No match found in /Users/stuart/repos/clada/proj/comp/orch/src/index.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
ERROR Block 4: No match found in /Users/stuart/repos/clada/proj/comp/orch/src/index.ts
SUCCESS Block 5: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
===

Looking at the actual listener implementation, I can see the flow. The debug info needs to be passed through from the parser to the orchestrator to the listener. Here's the complete solution:

<<<EXPLANATION>>>
Add debug info to ExecutionResult type (it's not called OrchestratorResult in the actual code)
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/orch/src/index.ts
<<<SEARCH>>>
export interface ExecutionResult {
  success: boolean;
  totalBlocks: number;
  executedActions: number;
  results: ActionResult[];
  parseErrors: ParseError[];
  fatalError?: string;
}
<<<REPLACE>>>
export interface ExecutionResult {
  success: boolean;
  totalBlocks: number;
  executedActions: number;
  results: ActionResult[];
  parseErrors: ParseError[];
  fatalError?: string;
  debug?: {
    parseDebug?: any;
  };
}
<<<END>>>

<<<EXPLANATION>>>
Capture debug info in parseSham without console.logs
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
<<<SEARCH>>>
  // Parse SHAM blocks using nesl-js
  let parseResult: NeslParseResult;
  try {
    // console.log('\n=== DEBUG: parseSham input ===');
    // console.log('Input length:', shamText.length);
    // console.log('Contains #!SHAM:', shamText.includes('#!SHAM'));
    // console.log('Input preview:', shamText.substring(0, 300).replace(/\n/g, '\\n'));
    
    parseResult = parseSham(shamText);
<<<REPLACE>>>
  // Parse SHAM blocks using nesl-js
  let parseResult: NeslParseResult;
  const debugInfo = {
    inputLength: shamText.length,
    containsSHAM: shamText.includes('#!SHAM'),
    inputPreview: shamText.substring(0, 300)
  };
  
  try {
    parseResult = parseSham(shamText);
<<<END>>>

<<<EXPLANATION>>>
Return debug info in ParseResult
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
<<<SEARCH>>>
  const result = {
    actions,
    errors,
    summary: {
      totalBlocks: blocks.length,
      successCount: actions.length,
      errorCount: errors.length
    }
  };
  return result;
<<<REPLACE>>>
  const result = {
    actions,
    errors,
    summary: {
      totalBlocks: blocks.length,
      successCount: actions.length,
      errorCount: errors.length
    },
    debug: {
      rawInput: debugInfo,
      rawParseResult: parseResult
    }
  };
  return result;
<<<END>>>

<<<EXPLANATION>>>
Pass debug info through orchestrator execute method
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/orch/src/index.ts
<<<SEARCH>>>
      return {
        success: allActionsSucceeded && noParseErrors,
        totalBlocks: parseResult.summary.totalBlocks,
        executedActions: results.length,
        results,
        parseErrors: parseResult.errors
      };
<<<REPLACE>>>
      return {
        success: allActionsSucceeded && noParseErrors,
        totalBlocks: parseResult.summary.totalBlocks,
        executedActions: results.length,
        results,
        parseErrors: parseResult.errors,
        debug: {
          parseDebug: parseResult.debug
        }
      };
<<<END>>>

<<<EXPLANATION>>>
Add debug output in listener when debug mode is enabled
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
<<<SEARCH>>>
    // Debug logging
    if (state.debug) {
      console.log('\n=== DEBUG: Orchestrator Result ===');
      console.log('Executed actions:', orchResult.executedActions);
      console.log('Results:', orchResult.results?.length || 0);
      console.log('Parse errors:', orchResult.parseErrors?.length || 0);
      if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
        console.log('Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
      }
      console.log('=== END DEBUG ===\n');
    }
<<<REPLACE>>>
    // Debug logging
    if (state.debug) {
      console.log('\n=== DEBUG: Orchestrator Result ===');
      console.log('Executed actions:', orchResult.executedActions);
      console.log('Results:', orchResult.results?.length || 0);
      console.log('Parse errors:', orchResult.parseErrors?.length || 0);
      if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
        console.log('Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
      }
      
      // Add parse debug info if available
      if (orchResult.debug?.parseDebug) {
        const pd = orchResult.debug.parseDebug;
        console.log('\n--- Parse Debug ---');
        console.log('Input:', pd.rawInput);
        console.log('Parse result:', {
          blocks: pd.rawParseResult?.blocks?.length || 0,
          errors: pd.rawParseResult?.errors?.length || 0
        });
        if (pd.rawParseResult?.errors?.length > 0) {
          console.log('Nesl-js errors:', JSON.stringify(pd.rawParseResult.errors, null, 2));
        }
      }
      console.log('=== END DEBUG ===\n');
    }
<<<END>>>

This approach:
1. Removes all console.logs from the parser that pollute test output
2. Captures debug info in structured objects
3. Passes debug data through the result chain
4. Only outputs debug info in test-listener-live when debug mode is enabled

The debug info now flows: `parseSham` → `ParseResult.debug` → `ExecutionResult.debug` → listener debug output.