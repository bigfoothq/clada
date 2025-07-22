import { watchFile, unwatchFile, Stats } from 'fs';
import { readFile, writeFile, access, constants } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { write as writeToClipboard } from 'clipboardy';

import type { ListenerConfig, ListenerHandle, ListenerState, ActionDefinition } from './types.js';
import { ListenerError } from './errors.js';
import { parseShamResponse } from '../../sham-action-parser/src/index.js';
import { execute } from '../../orch/src/index.js';
import { formatSummary, formatFullOutput } from './formatters.js';
import { computeContentHash, checkOutputSizes } from './utils.js';

// Module-level state for tracking active listeners
const activeListeners = new Map<string, ListenerHandle>();

// Load action schema from unified-design.yaml
async function loadActionSchema(): Promise<Map<string, ActionDefinition>> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const schemaPath = join(__dirname, '../../../../unified-design.yaml');
  
  // Add timeout to schema loading
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Schema loading timeout after 5s')), 5000);
  });
  
  const loadPromise = (async () => {
    const content = await readFile(schemaPath, 'utf-8');
    const parsed = loadYaml(content) as any;
    
    const schema = new Map<string, ActionDefinition>();
    for (const [name, def] of Object.entries(parsed.tools)) {
      schema.set(name, def as ActionDefinition);
    }
    return schema;
  })();
  
  return Promise.race([loadPromise, timeoutPromise]);
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
  
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  
  return debounced as T & { cancel: () => void };
}

// Generate unique ID for listener instance
function generateId(): string {
  return `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format clipboard status line
function formatClipboardStatus(success: boolean, timestamp: Date): string {
  const time = timestamp.toLocaleTimeString();
  return success ?
    `📋 Copied to clipboard at ${time}` :
    `❌ Clipboard copy failed at ${time}`;
}

// Process file changes
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
    let clipboardSuccess = false;
    try {
      await writeToClipboard(clipboardContent);
      clipboardSuccess = true;
    } catch (error) {
      console.error('listener: Clipboard write failed:', error);
    }
    
    // Prepend to input file with clipboard status
    const clipboardStatus = formatClipboardStatus(clipboardSuccess, timestamp);
    const prepend = `${clipboardStatus}\n${summary}`;
    
    // Read current content and prepend
    const originalContent = await readFile(filePath, 'utf-8');
    const updatedContent = prepend + '\n' + originalContent;
    await writeFile(filePath, updatedContent);
    
    // Update state
    state.lastExecutedHash = currentHash;
    state.lastExecutionTime = Date.now();
    
  } catch (error) {
    console.error('listener: Error processing file change:', error);
  } finally {
    state.isProcessing = false;
  }
}

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
  
  // Load action schema once at startup
  const actionSchema = await loadActionSchema();
  
  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: join(dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt'),
    lastExecutionTime: 0,
    actionSchema: actionSchema
  };
  
  // Set up debounced handler
  const debouncedProcess = debounce(
    () => processFileChange(config.filePath, state),
    config.debounceMs || 500
  );
  
  // Start watching
  watchFile(config.filePath, { interval: 500 }, (curr: Stats, prev: Stats) => {
    if (curr.mtime !== prev.mtime) {
      debouncedProcess();
    }
  });
  
  // Create handle
  const handle: ListenerHandle = {
    id: generateId(),
    filePath: config.filePath,
    stop: async () => {
      unwatchFile(config.filePath);
      debouncedProcess.cancel();
      activeListeners.delete(config.filePath);
    }
  };
  
  // Track active listener
  activeListeners.set(config.filePath, handle);
  
  return handle;
}

export async function stopListener(handle: ListenerHandle): Promise<void> {
  await handle.stop();
}