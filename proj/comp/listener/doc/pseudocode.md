# Listener Pseudocode

## Main Entry Points

```javascript
// listener/src/index.ts

async function startListener(config: ListenerConfig): Promise<ListenerHandle> {
  // Validate config
  validateListenerConfig(config);
  
  // Check file exists
  await ensureFileExists(config.filePath);
  
  // Check not already watching
  if (activeListeners.has(config.filePath)) {
    throw new ListenerError('ALREADY_WATCHING', config.filePath);
  }
  
  // Load action schema once at startup
  const actionSchema = await loadActionSchema();
  
  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: path.join(path.dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt'),
    lastExecutionTime: 0,
    actionSchema: actionSchema
  };
  
  // Set up debounced handler
  const debouncedProcess = debounce(
    () => processFileChange(config.filePath, state),
    config.debounceMs || 500
  );
  
  // Start watching
  const watcher = fs.watchFile(config.filePath, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      debouncedProcess();
    }
  });
  
  // Create handle
  const handle: ListenerHandle = {
    id: generateId(),
    filePath: config.filePath,
    stop: async () => {
      fs.unwatchFile(config.filePath);
      debouncedProcess.cancel();
      activeListeners.delete(config.filePath);
    }
  };
  
  // Track active listener
  activeListeners.set(config.filePath, handle);
  
  return handle;
}

async function stopListener(handle: ListenerHandle): Promise<void> {
  await handle.stop();
}
```

## Core Processing Logic

```javascript
// listener/src/processFileChange.ts

async function processFileChange(filePath: string, state: ListenerState): Promise<void> {
  // Check cooldown
  if (Date.now() - state.lastExecutionTime < 2000) {
    return; // Still in 2s cooldown period
  }
  
  // Check not already processing
  if (state.isProcessing) return;
  
  try {
    state.isProcessing = true;
    
    // Read file
    const content = await readFile(filePath, 'utf-8');
    
    // Parse SHAM blocks
    const parseResult = await parseShamResponse(content);
    
    // Compute hash of entire parse result (actions + errors)
    const currentHash = computeContentHash(parseResult);
    
    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      return;
    }
    
    // Execute via orchestrator (only valid actions)
    const execResults = await execute(parseResult.actions);
    
    // Check output sizes
    const sizeCheckResult = checkOutputSizes(execResults);
    if (!sizeCheckResult.valid) {
      // Add size errors to results
      execResults.push(...sizeCheckResult.errors);
    }
    
    // Format outputs
    const timestamp = new Date();
    const summary = formatSummary(parseResult, execResults, timestamp);
    const fullOutput = sizeCheckResult.valid ? 
      formatFullOutput(parseResult, execResults, state.actionSchema) : 
      summary + '\n\n[Full output too large for clipboard]';
    
    // Write output file
    await writeFile(state.outputPath, fullOutput);
    
    // Copy to clipboard (full output or just summary)
    const clipboardContent = sizeCheckResult.valid ? fullOutput : summary;
    const clipboardSuccess = await copyToClipboard(clipboardContent);
    
    // Prepend to input file with clipboard status
    const clipboardStatus = formatClipboardStatus(clipboardSuccess, timestamp);
    const prepend = `${clipboardStatus}\n${summary}`;
    await prependToFile(filePath, prepend);
    
    // Update state
    state.lastExecutedHash = currentHash;
    state.lastExecutionTime = Date.now();
    
  } catch (error) {
    console.error('listener: Error processing file change:', error);
  } finally {
    state.isProcessing = false;
  }
}
```

## Output Formatting Functions

```javascript
// listener/src/formatters.ts

function formatSummary(parseResult: ParseResult, execResults: ExecutionResult[], timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // Add execution results
  for (const result of execResults) {
    const line = formatSummaryLine(result);
    lines.push(line);
  }
  
  // Add parse errors
  for (const error of parseResult.errors) {
    const line = formatErrorLine(error);
    lines.push(line);
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}

function formatSummaryLine(result: ExecutionResult): string {
  const { action, result: execResult } = result;
  const icon = execResult.success ? '✅' : '❌';
  const id = action.metadata.blockId;
  const primaryParam = getPrimaryParam(action);
  
  if (execResult.success) {
    return `${id} ${icon} ${action.action} ${primaryParam}`;
  } else {
    const errorSummary = getErrorSummary(execResult.error);
    return `${id} ${icon} ${action.action} ${primaryParam} - ${errorSummary}`;
  }
}

function formatFullOutput(parseResult: ParseResult, execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const summarySection = formatSummary(parseResult, execResults, new Date());
  const outputsSection = formatOutputsSection(execResults, actionSchema);
  
  return summarySection + '\n' + outputsSection;
}

function formatOutputsSection(execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const lines = ['=== OUTPUTS ==='];
  
  for (const result of execResults) {
    if (!shouldIncludeOutput(result, actionSchema)) continue;
    
    const header = formatOutputHeader(result);
    const content = formatOutputContent(result);
    lines.push('', header, content);
  }
  
  lines.push('=== END ===');
  return lines.join('\n');
}

function shouldIncludeOutput(result: ExecutionResult, actionSchema: Map<string, ActionDefinition>): boolean {
  const actionDef = actionSchema.get(result.action.action);
  if (!actionDef) return false;
  
  if (actionDef.output_display === 'always') return true;
  if (actionDef.output_display === 'never') return false;
  if (actionDef.output_display === 'conditional') {
    return result.action.parameters.return_output !== false;
  }
  return false;
}
```

## Utility Functions

```javascript
// listener/src/utils.ts

function computeContentHash(parseResult: ParseResult): string {
  const hashData = JSON.stringify({
    actions: parseResult.actions,
    errors: parseResult.errors
  });
  return createHash('sha256').update(hashData).digest('hex');
}

function checkOutputSizes(execResults: ExecutionResult[]): SizeCheckResult {
  const MAX_SINGLE_OUTPUT = 50_000;
  const MAX_TOTAL_OUTPUT = 200_000;
  let totalSize = 0;
  const errors: ExecutionResult[] = [];
  
  for (const result of execResults) {
    if (!result.result.success) continue;
    
    const outputSize = getOutputSize(result);
    if (outputSize > MAX_SINGLE_OUTPUT) {
      // Convert to error result
      errors.push({
        action: result.action,
        result: {
          success: false,
          error: `Output too large: ${outputSize} bytes (max ${MAX_SINGLE_OUTPUT})`
        }
      });
    } else {
      totalSize += outputSize;
    }
  }
  
  return {
    valid: totalSize <= MAX_TOTAL_OUTPUT && errors.length === 0,
    totalSize,
    errors
  };
}

function getOutputSize(result: ExecutionResult): number {
  let size = 0;
  if (result.result.content) size += result.result.content.length;
  if (result.result.stdout) size += result.result.stdout.length;
  if (result.result.stderr) size += result.result.stderr.length;
  if (result.result.data) size += JSON.stringify(result.result.data).length;
  return size;
}

async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await writeToClipboard(content);
    return true;
  } catch (error) {
    console.error('listener: Clipboard write failed:', error);
    return false;
  }
}

async function prependToFile(filePath: string, prepend: string): Promise<void> {
  const original = await readFile(filePath, 'utf-8');
  const updated = prepend + '\n' + original;
  await writeFile(filePath, updated);
}

function getPrimaryParam(action: CladaAction): string {
  // TODO: Get from actionDef.primary_param
  // For now, use heuristics
  if (action.parameters.path) return action.parameters.path;
  if (action.parameters.paths) return formatMultilinePaths(action.parameters.paths);
  if (action.parameters.pattern) return action.parameters.pattern;
  if (action.parameters.lang) return action.parameters.lang;
  return '';
}

function formatClipboardStatus(success: boolean, timestamp: Date): string {
  const time = timestamp.toLocaleTimeString();
  return success ?
    `📋 Copied to clipboard at ${time}` :
    `❌ Clipboard copy failed at ${time}`;
}

async function loadActionSchema(): Promise<Map<string, ActionDefinition>> {
  const schemaPath = join(dirname(fileURLToPath(import.meta.url)), '../../../../unified-design.yaml');
  const content = await readFile(schemaPath, 'utf-8');
  const parsed = loadYaml(content);
  
  const schema = new Map<string, ActionDefinition>();
  for (const [name, def] of Object.entries(parsed.tools)) {
    schema.set(name, def as ActionDefinition);
  }
  return schema;
}
```

## Error Handling

```javascript
// listener/src/errors.ts

class ListenerError extends Error {
  constructor(
    public code: 'FILE_NOT_FOUND' | 'ACCESS_DENIED' | 'ALREADY_WATCHING',
    public path: string,
    message?: string
  ) {
    super(message || `listener: ${code} '${path}'`);
    this.name = 'ListenerError';
  }
}

async function ensureFileExists(filePath: string): Promise<void> {
  try {
    await access(filePath, F_OK);
  } catch (error) {
    throw new ListenerError('FILE_NOT_FOUND', filePath);
  }
}

function validateListenerConfig(config: ListenerConfig): void {
  if (!config.filePath) {
    throw new Error('listener: filePath is required');
  }
  if (!path.isAbsolute(config.filePath)) {
    throw new Error('listener: filePath must be absolute');
  }
  if (config.debounceMs && config.debounceMs < 100) {
    throw new Error('listener: debounceMs must be at least 100');
  }
}
```

## State Management

```javascript
// Module-level state
const activeListeners = new Map<string, ListenerHandle>();

// Per-listener state
interface ListenerState {
  lastExecutedHash: string;
  isProcessing: boolean;
  outputPath: string;
  lastExecutionTime: number;
  actionSchema: Map<string, ActionDefinition>;
}
```