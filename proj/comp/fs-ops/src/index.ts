/**
 * fs-ops - File system operations executor for clada
 * 
 * Handles all file and directory operations from parsed SHAM actions
 */

import type { CladaAction } from '../../sham-action-parser/src/index.js';
import { writeFile, mkdir, unlink, rename, readFile } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError } from './formatNodeError.js';
import { fileExists } from './fileSystemUtils.js';
import { replaceText } from './replaceText.js';

export interface FileOpResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FileOpError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'FileOpError';
  }
}

/**
 * Execute a file system operation from a parsed SHAM action
 * Never throws - all errors returned in result
 */
export async function executeFileOperation(action: CladaAction): Promise<FileOpResult> {
  try {
    const handler = actionHandlers[action.action];
    
    if (!handler) {
      return {
        success: false,
        error: `Unknown action: ${action.action}`
      };
    }
    
    return await handler(action);
    
  } catch (error: any) {
    // This should never happen - handlers should catch their own errors
    return {
      success: false,
      error: `Unexpected error in executeFileOperation: ${error.message}`
    };
  }
}

/**
 * Handle file_move action - moves/renames a file
 * Creates parent directories for destination if needed
 * Overwrites destination if it exists
 */
async function handleFileMove(action: CladaAction): Promise<FileOpResult> {
  const { old_path, new_path } = action.parameters;
  
  try {
    // Pre-flight check for better error messages
    const sourceExists = await fileExists(old_path);
    if (!sourceExists) {
      return {
        success: false,
        error: `file_move: Source file not found '${old_path}' (ENOENT)`
      };
    }
    
    // Check if destination exists (for overwrote flag)
    const destExists = await fileExists(new_path);
    
    // Create parent directories for destination
    const parentDir = dirname(new_path);
    await mkdir(parentDir, { recursive: true });
    
    // Move the file
    await rename(old_path, new_path);
    
    const result: FileOpResult = {
      success: true,
      data: {
        old_path,
        new_path
      }
    };
    
    if (destExists) {
      result.data.overwrote = true;
    }
    
    return result;
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, old_path, 'rename', new_path)
    };
  }
}

/**
 * Handle file_delete action - removes a file
 */
async function handleFileDelete(action: CladaAction): Promise<FileOpResult> {
  const { path } = action.parameters;
  
  try {
    await unlink(path);
    
    return {
      success: true,
      data: {
        path
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'unlink')
    };
  }
}

/**
 * Handle file_write action - writes/creates/overwrites a file with content
 * Automatically creates parent directories if needed
 */
async function handleFileWrite(action: CladaAction): Promise<FileOpResult> {
  const { path, content } = action.parameters;
  
  try {
    // Create parent directories if needed
    const parentDir = dirname(path);
    await mkdir(parentDir, { recursive: true });
    
    // Write file
    await writeFile(path, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        bytesWritten
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}

/**
 * Handle file_read action - reads file content
 */
async function handleFileRead(action: CladaAction): Promise<FileOpResult> {
  const { path } = action.parameters;
  
  try {
    const content = await readFile(path, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        content
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}

/**
 * Handle file_replace_text action - replaces EXACTLY ONE occurrence
 * Fails if old_text appears 0 or 2+ times
 */
async function handleFileReplaceText(action: CladaAction): Promise<FileOpResult> {
  const { path, old_text, new_text } = action.parameters;
  
  try {
    // Read existing file content
    const content = await readFile(path, 'utf8');
    
    // Count occurrences first
    let count = 0;
    let searchIndex = 0;
    while (true) {
      const index = content.indexOf(old_text, searchIndex);
      if (index === -1) break;
      count++;
      searchIndex = index + 1;
    }
    
    // Validate exactly one occurrence
    if (count === 0) {
      return {
        success: false,
        error: `file_replace_text: old_text not found in file`
      };
    }
    if (count > 1) {
      return {
        success: false,
        error: `file_replace_text: old_text appears ${count} times, must appear exactly once`
      };
    }
    
    // Replace the single occurrence
    const { result, replacements } = replaceText(content, old_text, new_text, 1);
    
    // Write updated content back
    await writeFile(path, result, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        replacements
      }
    };
    
  } catch (error: any) {
    // Special case for empty old_text validation error
    if (error.message === 'old_text cannot be empty') {
      return {
        success: false,
        error: 'file_replace_text: old_text cannot be empty'
      };
    }
    
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}

/**
 * Handle file_replace_all_text action - replaces all occurrences
 * If count provided, validates exact match
 */
async function handleFileReplaceAllText(action: CladaAction): Promise<FileOpResult> {
  const { path, old_text, new_text, count } = action.parameters;
  
  try {
    // Read existing file content
    const content = await readFile(path, 'utf8');
    
    // If count specified, validate it matches actual occurrences
    if (count !== undefined) {
      // Count actual occurrences
      let actualCount = 0;
      let searchIndex = 0;
      while (true) {
        const index = content.indexOf(old_text, searchIndex);
        if (index === -1) break;
        actualCount++;
        searchIndex = index + 1;
      }
      
      if (actualCount !== count) {
        return {
          success: false,
          error: `file_replace_all_text: expected ${count} occurrences but found ${actualCount}`
        };
      }
    }
    
    // Replace all occurrences
    const { result, replacements } = replaceText(content, old_text, new_text);
    
    // Write updated content back
    await writeFile(path, result, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        replacements
      }
    };
    
  } catch (error: any) {
    // Special case for empty old_text validation error
    if (error.message === 'old_text cannot be empty') {
      return {
        success: false,
        error: 'file_replace_all_text: old_text cannot be empty'
      };
    }
    
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}

// Internal function stubs for each operation

async function createFile(path: string, content: string): Promise<void> {
  throw new Error('Not implemented');
}

 

async function replaceTextInFile(path: string, oldText: string, newText: string, count?: number): Promise<number> {
  throw new Error('Not implemented');
}

async function deleteFile(path: string): Promise<void> {
  throw new Error('Not implemented');
}

async function moveFile(oldPath: string, newPath: string): Promise<void> {
  throw new Error('Not implemented');
}

async function readFileContent(path: string): Promise<string> {
  throw new Error('Not implemented');
}

async function createDirectory(path: string): Promise<void> {
  throw new Error('Not implemented');
}

async function deleteDirectory(path: string): Promise<void> {
  throw new Error('Not implemented');
}

interface DirEntry {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
}

async function listDirectory(path: string): Promise<DirEntry[]> {
  throw new Error('Not implemented');
}

interface GrepResult {
  file: string;
  line_number: number;
  line: string;
}

async function searchFiles(pattern: string, path: string, include?: string): Promise<GrepResult[]> {
  throw new Error('Not implemented');
}

async function globFiles(pattern: string, basePath: string): Promise<string[]> {
  throw new Error('Not implemented');
}

// Action handler mapping
const actionHandlers: Record<string, (action: CladaAction) => Promise<FileOpResult>> = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'dir_create': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'dir_delete': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'ls': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'grep': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'glob': async (action) => {
    return { success: false, error: 'Not implemented' };
  }
};