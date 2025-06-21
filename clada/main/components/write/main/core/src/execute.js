20250121

import fs from 'node:fs';
import path from 'node:path';

/**
 * Executes write operation to create or overwrite file
 * @param {Object} task - Task with path and content properties
 * @param {Object} context - Execution context with cwd and config
 * @returns {{ok: true} | {ok: false, error: {type: string, message: string}}}
 */
export function executeWrite(task, context) {
  const { path: filePath, content } = task;
  const { cwd, config } = context;

  // Handle path validation
  if (!config.allowEscape) {
    if (path.isAbsolute(filePath)) {
      return {
        ok: false,
        error: { type: 'path_escape', message: 'Absolute paths not allowed' }
      };
    }

    const resolved = path.resolve(cwd, filePath);
    if (!resolved.startsWith(cwd + path.sep) && resolved !== cwd) {
      return {
        ok: false,
        error: { type: 'path_escape', message: 'Path escapes working directory' }
      };
    }
  }

  const fullPath = path.resolve(cwd, filePath);

  // Check if path exists and is symlink before any operations
  if (fs.existsSync(fullPath)) {
    try {
      const stats = fs.lstatSync(fullPath);
      if (stats.isSymbolicLink()) {
        return {
          ok: false,
          error: { type: 'symlink_not_allowed', message: `Cannot write through symlink: ${filePath}` }
        };
      }
      if (stats.isDirectory()) {
        return {
          ok: false,
          error: { type: 'permission_denied', message: `Cannot write to directory: ${filePath}` }
        };
      }
    } catch (error) {
      // If lstat fails, continue to write attempt
    }
  }

  try {
    // Create parent directories if needed
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    if (task.append) {
      fs.appendFileSync(fullPath, content, 'utf8');
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
    }

    return { ok: true };
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return {
        ok: false,
        error: { type: 'permission_denied', message: `Permission denied: ${fullPath}` }
      };
    }
    return {
      ok: false,
      error: { type: 'unknown', message: error.message }
    };
  }
}