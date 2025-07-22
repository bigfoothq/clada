import { watchFile, unwatchFile, Stats } from 'fs';
import { readFile, writeFile, access, constants } from 'fs/promises';
import { dirname, join } from 'path';
import { write as writeToClipboard } from 'clipboardy';

import type { ListenerConfig, ListenerHandle, ListenerState } from './types.js';
import { ListenerError } from './errors.js';
import { Clada } from '../../orch/src/index.js';
import { formatSummary, formatFullOutput } from './formatters.js';
import { computeContentHash } from './utils.js';

// Module-level state for tracking active listeners
const activeListeners = new Map<string, ListenerHandle>();
// Strip prepended summary section if present
function stripSummarySection(content: string): string {
  const startMarker = '=== CLADA RESULTS ===';
  const endMarker = '=== END ===';
  
  // Check if content starts with a CLADA results section
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1 || startIndex > 100) {
    // No CLADA section at the beginning of file
    return content;
  }
  
  // Find the corresponding END marker
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    return content; // Malformed section, keep content as-is
  }
  
  // Find the newline after the end marker
  const afterEndIndex = content.indexOf('\n', endIndex + endMarker.length);
  if (afterEndIndex === -1) {
    return ''; // File ends with summary
  }
  
  // Skip one more newline if present (blank line after summary)
  const contentStart = content[afterEndIndex + 1] === '\n' ? afterEndIndex + 2 : afterEndIndex + 1;
  return content.substring(contentStart);
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
    const fullContent = await readFile(filePath, 'utf-8');
    
    // DIAGNOSTIC: Log file content
    console.log('File content:', fullContent);
    
    // Strip summary section for hashing
    const contentForHash = stripSummarySection(fullContent);
    console.log('Full content length:', fullContent.length);
    console.log('Content for hash length:', contentForHash.length);
    console.log('First 100 chars of content for hash:', contentForHash.substring(0, 100));
    
    // Compute hash of content (excluding summary)
    const currentHash = computeContentHash(contentForHash);
    
    // DIAGNOSTIC: Log hash comparison
    console.log('Content for hash:', contentForHash);
    console.log('Current hash:', currentHash);
    console.log('Last hash:', state.lastExecutedHash);
    
    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      console.log('Hash unchanged, skipping execution');
      console.log('This suggests stripSummarySection might be removing too much content');
      return;
    }
    
    // Execute via orchestrator with full file content
    console.log('\n=== ORCHESTRATOR CALL ===');
    console.log('Content length:', fullContent.length);
    console.log('Content preview:', fullContent.substring(0, 200));
    console.log('Content includes SHAM?', fullContent.includes('#!SHAM'));
    console.log('Content includes backticks?', fullContent.includes('```'));
    
    const clada = new Clada({ gitCommit: false });
    const orchResult = await clada.execute(fullContent);
    
    // DIAGNOSTIC: Log orchestrator result
    console.log('Orchestrator returned:', JSON.stringify(orchResult, null, 2));
    console.log('=== END ORCHESTRATOR CALL ===\n');
    
    // Format outputs
    const timestamp = new Date();
    const summary = formatSummary(orchResult, timestamp);
    const fullOutput = formatFullOutput(orchResult);
    
    // Copy to clipboard
    let clipboardSuccess = false;
    try {
      await writeToClipboard(fullOutput);
      clipboardSuccess = true;
    } catch (error) {
      console.error('listener: Clipboard write failed:', error);
    }
    
    // Format clipboard status
    const clipboardStatus = formatClipboardStatus(clipboardSuccess, timestamp);
    
    // Write output file with clipboard status
    const outputContent = clipboardStatus + '\n' + fullOutput;
    await writeFile(state.outputPath, outputContent);
    
    // Prepend to input file with clipboard status
    const prepend = clipboardStatus + '\n' + summary;
    const updatedContent = prepend + '\n' + fullContent;
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
  
  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: join(dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt'),
    lastExecutionTime: 0
  };
  
  // Set up debounced handler
  const debouncedProcess = debounce(
    () => {
      console.log('Debounced process executing');
      processFileChange(config.filePath, state);
    },
    config.debounceMs || 500
  );
  
  // Start watching
  watchFile(config.filePath, { interval: 500 }, (curr: Stats, prev: Stats) => {
    if (curr.mtime !== prev.mtime) {
      console.log('File change detected, triggering debounced process');
      debouncedProcess();
    }
  });
  
  // Process initial content
  debouncedProcess();
  
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