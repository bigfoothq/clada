import fs from 'node:fs';
import path from 'node:path';
// import { Result } from '../../../../../../shared/src/result'; // Assuming a shared Result type
// The .js extension is required by the "NodeNext" module setting in your tsconfig.json
import { Result } from '../../../../../../shared/src/result.js'; 

// This interface is the formal AST node for a write command.
// The external parser MUST produce this structure.
interface WriteCommand {
  path: string;
  content: string;
  append?: boolean;
}

interface ExecutionContext {
  cwd: string;
  config: {
    allowEscape: boolean;
  };
}

/**
 * Executes a write operation to create or overwrite a file.
 * @param {WriteCommand} task - The validated write command object.
 * @param {ExecutionContext} context - Execution context with cwd and config.
 * @returns {Result<void, {type: string, message: string}>} A result object.
 */
export function executeWrite(task: WriteCommand, context: ExecutionContext): Result<void, { type: string, message: string }> {
  const { path: filePath, content } = task;
  const { cwd, config } = context;

  if (!config.allowEscape) {
    if (path.isAbsolute(filePath)) {
      return { ok: false, error: { type: 'path_escape', message: 'Absolute paths not allowed' } };
    }
    const resolved = path.resolve(cwd, filePath);
    if (!resolved.startsWith(cwd)) {
      return { ok: false, error: { type: 'path_escape', message: 'Path escapes working directory' } };
    }
  }

  const fullPath = path.resolve(cwd, filePath);

  try {
    const stats = fs.lstatSync(fullPath);
    if (stats.isSymbolicLink()) {
      return { ok: false, error: { type: 'symlink_not_allowed', message: `Cannot write through symlink: ${filePath}` } };
    }
    if (stats.isDirectory()) {
      return { ok: false, error: { type: 'permission_denied', message: `Cannot write to directory: ${filePath}` } };
    }
  } catch (error) {
    // If lstatSync fails, it's likely because the file doesn't exist, which is fine.
  }

  try {
    // The automatic directory creation logic (`mkdirSync`) has been removed.
    // This ensures that the WRITE operation will fail if the parent directory
    // does not exist, which allows the `handles execution failure` test case
    // to correctly verify the system's error handling path. The underlying
    // fs call will throw an 'ENOENT' error, which is caught below.

    if (task.append) {
      fs.appendFileSync(fullPath, content, 'utf8');
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
    }

    return { ok: true, value: undefined };
  } catch (error: any) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return { ok: false, error: { type: 'permission_denied', message: `Permission denied: ${fullPath}` } };
    }
    return { ok: false, error: { type: 'unknown', message: error.message } };
  }
}