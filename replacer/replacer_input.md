=== PROCESSED: 2025-07-22 22:50:38 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/src/types.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/orch/src/index.ts
===

Good call. The scattered console.logs pollute test output and make debugging harder. Better approach: pass debug info through the call chain to where it's needed.

Options:

1. **Return debug data in results** - Extend `OrchestratorResult` and `ParseResult` to include optional debug info
2. **Debug callback/logger** - Pass a debug function through the options
3. **Event emitter pattern** - Emit debug events that test-listener-live can subscribe to

Option 1 seems cleanest - the debug data flows with the results:

<<<EXPLANATION>>>
Add debug info to ParseResult type to flow through the system
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/types.ts
<<<SEARCH>>>
export interface ParseResult {
  actions: CladaAction[];
  errors: ParseError[];
  summary: {
    totalBlocks: number;
    successCount: number;
    errorCount: number;
  };
}
<<<REPLACE>>>
export interface ParseResult {
  actions: CladaAction[];
  errors: ParseError[];
  summary: {
    totalBlocks: number;
    successCount: number;
    errorCount: number;
  };
  debug?: {
    rawInput?: string;
    rawParseResult?: any;
  };
}
<<<END>>>

<<<EXPLANATION>>>
Add debug info to OrchestratorResult (ExecutionResult)
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

Then remove console.logs and populate debug objects instead. test-listener-live can check for debug info and display it.

Alternative: Add a `debugMode` flag that's only set by test-listener-live, keeping console.logs but gating them behind the flag. Simpler but less clean.

Which approach do you prefer?