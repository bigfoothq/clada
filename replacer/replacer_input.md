=== PROCESSED: 2025-07-22 22:07:17 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/src/types.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/listener/src/types.ts
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/comp/listener/src/listener.ts
SUCCESS Block 5: Updated /Users/stuart/repos/clada/use-listener/test-listener-live.ts
===

The issue is that `test-listener-live.ts` only starts the listener - it doesn't have visibility into the orchestrator results or parse errors. The debug logging happens inside the listener/formatter code, but those console.logs might be getting swallowed or you're not seeing them in the terminal.

Here are two approaches to debug this:

<<<EXPLANATION>>>
Add a debug mode to the listener configuration that enables verbose logging of parse errors and orchestrator results

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/types.ts

<<<SEARCH>>>
export interface ListenerConfig {
  filePath: string;
  debounceMs?: number;
  outputFilename?: string;
}
<<<REPLACE>>>
export interface ListenerConfig {
  filePath: string;
  debounceMs?: number;
  outputFilename?: string;
  debug?: boolean;
}
<<<END>>>

<<<EXPLANATION>>>
Pass debug flag through state and use it to control debug output in processFileChange

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts

<<<SEARCH>>>
export async function startListener(config: ListenerConfig): Promise<ListenerHandle> {
  // Validate config
  if (!config.filePath) {
    throw new Error('listener: filePath is required');
  }
  if (!config.filePath.startsWith('/')) {
    throw new Error('listener: filePath must be absolute');
  }
  if (config.debounceMs !== undefined && config.debounceMs < 100) {
    throw new Error('listener: debounceMs must be at least 100');
  }
  
  // Check file exists
  try {
    await access(config.filePath, constants.F_OK);
  } catch (error) {
    throw new ListenerError('FILE_NOT_FOUND', config.filePath);
  }
  
  // Check not already watching
  if (activeListeners.has(config.filePath)) {
    throw new ListenerError('ALREADY_WATCHING', config.filePath);
  }
  
  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: join(dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt')
  };
<<<REPLACE>>>
export async function startListener(config: ListenerConfig): Promise<ListenerHandle> {
  // Validate config
  if (!config.filePath) {
    throw new Error('listener: filePath is required');
  }
  if (!config.filePath.startsWith('/')) {
    throw new Error('listener: filePath must be absolute');
  }
  if (config.debounceMs !== undefined && config.debounceMs < 100) {
    throw new Error('listener: debounceMs must be at least 100');
  }
  
  // Check file exists
  try {
    await access(config.filePath, constants.F_OK);
  } catch (error) {
    throw new ListenerError('FILE_NOT_FOUND', config.filePath);
  }
  
  // Check not already watching
  if (activeListeners.has(config.filePath)) {
    throw new ListenerError('ALREADY_WATCHING', config.filePath);
  }
  
  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: join(dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt'),
    debug: config.debug || false
  };
<<<END>>>

<<<EXPLANATION>>>
Add debug flag to ListenerState interface

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/types.ts

<<<SEARCH>>>
export interface ListenerState {
  lastExecutedHash: string;
  isProcessing: boolean;
  outputPath: string;
  actionSchema: Map<string, ActionDefinition>;
}
<<<REPLACE>>>
export interface ListenerState {
  lastExecutedHash: string;
  isProcessing: boolean;
  outputPath: string;
  actionSchema?: Map<string, ActionDefinition>;
  debug?: boolean;
}
<<<END>>>

<<<EXPLANATION>>>
Add debug logging in processFileChange to show raw orchestrator results when debug is enabled

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/listener.ts

<<<SEARCH>>>
    // Execute via orchestrator with full file content
    const clada = new Clada({ gitCommit: false });
    const orchResult = await clada.execute(fullContent);
    // console.log('Executed', orchResult.executedActions, 'actions');
<<<REPLACE>>>
    // Execute via orchestrator with full file content
    const clada = new Clada({ gitCommit: false });
    const orchResult = await clada.execute(fullContent);
    
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
<<<END>>>

<<<EXPLANATION>>>
Enable debug mode in test-listener-live.ts

<<<FILE>>>
/Users/stuart/repos/clada/use-listener/test-listener-live.ts

<<<SEARCH>>>
  // Start the listener
  console.log('Starting listener...');
  const handle = await startListener({
    filePath: TEST_FILE,
    debounceMs: 500,
    outputFilename: '.my-test-output.txt'
  });
<<<REPLACE>>>
  // Start the listener
  console.log('Starting listener...');
  const handle = await startListener({
    filePath: TEST_FILE,
    debounceMs: 500,
    outputFilename: '.my-test-output.txt',
    debug: true
  });
<<<END>>>

This will show you exactly what the orchestrator is returning. If you're still not seeing any output, the issue might be:

1. The SHAM blocks aren't being detected at all by the parser
2. The parser is silently failing before creating parse errors
3. The content hash check is preventing reprocessing

You could also temporarily add a console.log at the very start of `processFileChange` to confirm it's being called at all.