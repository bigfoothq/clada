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
  const clipboardPattern = /^(📋 Copied to clipboard at|❌ Clipboard copy failed at) .+\n/;
  const startMarker = '=== CLADA RESULTS ===';
  const endMarker = '=== END ===';
  
  // Remove all CLADA sections from the beginning of the file
  // There may be multiple prepended sections from multiple executions
  let strippedContent = content;
  
  // Keep removing CLADA sections from the beginning until none are found
  while (true) {
    // Check for clipboard status line at the very beginning
    const clipboardMatch = strippedContent.match(clipboardPattern);
    let searchStart = 0;
    
    if (clipboardMatch) {
      searchStart = clipboardMatch[0].length;
    }
    
    // Look for CLADA section at the beginning (after optional clipboard line)
    const searchContent = strippedContent.substring(searchStart);
    const startIndex = searchContent.indexOf(startMarker);
    
    // Check if CLADA section is at the beginning
    if (startIndex !== 0 && (!searchContent.startsWith('\n' + startMarker) || startIndex > 50)) {
      // No more CLADA sections at the beginning
      break;
    }
    
    // Find the corresponding END marker
    const endIndex = searchContent.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      break; // Malformed section, stop processing
    }
    
    // Find the newline after the end marker
    const afterEndIndex = searchContent.indexOf('\n', endIndex + endMarker.length);
    if (afterEndIndex === -1) {
      return ''; // File ends with summary
    }
    
    // Skip one more newline if present (blank line after summary)
    const contentStart = searchContent[afterEndIndex + 1] === '\n' ? afterEndIndex + 2 : afterEndIndex + 1;
    
    // Remove this CLADA section
    strippedContent = strippedContent.substring(searchStart + contentStart);
  }
  
  return strippedContent.trim();
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
  // Check not already processing
  if (state.isProcessing) return;
  
  try {
    state.isProcessing = true;
    
    // Read file
    const fullContent = await readFile(filePath, 'utf-8');
    
    // Strip summary section for hashing
    const contentForHash = stripSummarySection(fullContent).trim();
    
    // DIAGNOSTIC: Log stripping results
    console.log('\n=== STRIP SUMMARY ===');
    console.log('Original length:', fullContent.length);
    console.log('Stripped length:', contentForHash.length);
    console.log('Stripped content preview:', contentForHash.substring(0, 150).replace(/\n/g, '\\n'));
    console.log('=== END STRIP ===\n');
    
    // Compute hash of content (excluding summary)
    const currentHash = computeContentHash(contentForHash);
    
    // DIAGNOSTIC: Log hash comparison
    console.log('Current hash:', currentHash);
    console.log('Last hash:', state.lastExecutedHash);
    
    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      console.log('Content unchanged, skipping execution');
      return;
    }
    
    // Execute via orchestrator with full file content
    const clada = new Clada({ gitCommit: false });
    const orchResult = await clada.execute(fullContent);
    console.log('Executed', orchResult.executedActions, 'actions');
    
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
    outputPath: join(dirname(config.filePath), config.outputFilename || '.clada-output-latest.txt')
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