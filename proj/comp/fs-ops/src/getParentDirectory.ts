import { dirname, sep } from 'path';

/**
 * Extract parent directory from a file path
 * Handles both Unix and Windows style paths
 * @param filePath - Absolute path to file or directory
 * @returns Parent directory path
 */
export function getParentDirectory(filePath: string): string {
  // Check if it's a Windows path (C:\ or C:/)
  const isWindowsPath = /^[A-Za-z]:[\\/]/.test(filePath);
  
  if (isWindowsPath) {
    // Handle Windows paths manually
    const normalized = filePath.replace(/\//g, '\\');
    const lastSep = normalized.lastIndexOf('\\');
    
    // Handle root paths like C:\
    if (lastSep <= 2) {
      return normalized.substring(0, 3); // Return C:\ 
    }
    
    return normalized.substring(0, lastSep);
  }
  
  // Use native dirname for Unix paths
  return dirname(filePath);
}