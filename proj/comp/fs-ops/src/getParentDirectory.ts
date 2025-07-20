import { dirname } from 'path';

/**
 * Extract parent directory from a file path
 * @param filePath - Absolute path to file or directory
 * @returns Parent directory path
 */
export function getParentDirectory(filePath: string): string {
  return dirname(filePath);
}