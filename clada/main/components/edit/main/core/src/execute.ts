// Execute edit operations
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';

// Define the structure of the incoming command
interface BaseEditCommand {
  path: string;
  count: number;
  replace: string;
}

interface ExactEditCommand extends BaseEditCommand {
  mode: 'exact';
  search: string;
}

interface RangeEditCommand extends BaseEditCommand {
  mode: 'range';
  searchStart: string;
  searchEnd: string;
}

type EditCommand = ExactEditCommand | RangeEditCommand;

// Define the context and a generic Result type for error handling
interface ExecutionContext {
  workingDir: string;
}

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E; [key: string]: any };

/**
 * Executes a file edit operation based on a parsed command.
 * @param {EditCommand} editCommand - The typed edit command object.
 * @param {ExecutionContext} context - The execution context.
 * @returns {Result<undefined, string>} A result object.
 */
export function executeEdit(editCommand: EditCommand, context: ExecutionContext): Result<undefined, string> {
  const { path: relativePath, count } = editCommand;
  const { workingDir } = context;

  // --- 1. Path Validation ---
  const fullPath = resolve(workingDir, relativePath);

  if (isAbsolute(relativePath) || !fullPath.startsWith(workingDir)) {
    return { ok: false, error: 'path_escape' };
  }

  // --- 2. Read File and Check Stats ---
  let content: string;
  try {
    const stats = lstatSync(fullPath);
    if (stats.isSymbolicLink()) {
      return { ok: false, error: 'symlink_not_allowed' };
    }
    content = readFileSync(fullPath, 'utf8');
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return { ok: false, error: 'file_not_found' };
    }
    return { ok: false, error: err.message };
  }

  // --- 3. Perform Search and Replace ---
  let newContent: string;
  if (editCommand.mode === 'exact') {
    const { search, replace } = editCommand;
    const parts = content.split(search);
    const found = parts.length - 1;

    if (found !== count) {
      return { ok: false, error: 'match_count_mismatch', expected: count, found };
    }
    newContent = (count > 0) ? parts.join(replace) : content;

  } else { // Range mode
    const { searchStart, searchEnd, replace } = editCommand;
    const ranges: { start: number; end: number }[] = [];
    let cursor = 0;

    while (ranges.length < count) {
      const startIndex = content.indexOf(searchStart, cursor);
      if (startIndex === -1) break;

      const endIndex = content.indexOf(searchEnd, startIndex + searchStart.length);
      if (endIndex === -1) {
        return { ok: false, error: 'search_range_incomplete' };
      }
      
      const fullEndIndex = endIndex + searchEnd.length;
      ranges.push({ start: startIndex, end: fullEndIndex });
      cursor = fullEndIndex;
    }
    
    if (ranges.length !== count) {
      return { ok: false, error: 'match_count_mismatch', expected: count, found: ranges.length };
    }

    let tempContent = content;
    for (let i = ranges.length - 1; i >= 0; i--) {
      const { start, end } = ranges[i];
      tempContent = tempContent.substring(0, start) + replace + tempContent.substring(end);
    }
    newContent = tempContent;
  }

  // --- 4. Write new content to file ---
  try {
    writeFileSync(fullPath, newContent, 'utf8');
  } catch (err: any) {
    return { ok: false, error: 'write_failed', message: err.message };
  }

  return { ok: true, value: undefined };
}