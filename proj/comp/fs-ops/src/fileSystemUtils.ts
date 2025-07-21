import { writeFile, mkdir, stat } from 'fs/promises';
import { dirname } from 'path';

/**
 * Check if a file exists
 * @param path - File path to check
 * @returns true if file exists, false otherwise
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory and all parent directories if they don't exist
 * @param dirPath - Directory path to create
 * @returns Array of directories that were created (not those that already existed)
 */
export async function ensureDirectoryExists(dirPath: string): Promise<string[]> {
  const created: string[] = [];
  const parts = dirPath.split('/').filter(Boolean);
  
  // Handle root for Unix paths
  let currentPath = dirPath.startsWith('/') ? '' : '.';
  
  for (const part of parts) {
    currentPath = currentPath + '/' + part;
    
    try {
      await mkdir(currentPath);
      created.push(currentPath);
    } catch (err: any) {
      // EEXIST is fine - directory already exists
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
  
  return created;
}

/**
 * Write file content and return number of bytes written
 * @param path - File path to write to
 * @param content - Content to write (UTF-8)
 * @returns Number of bytes written
 */
export async function writeFileInternal(path: string, content: string): Promise<number> {
  await writeFile(path, content, 'utf8');
  return Buffer.byteLength(content, 'utf8');
}