import type { ActionDefinition } from './types.js';
import type { ParseResult, CladaAction, ParseError } from '../../sham-action-parser/src/types.js';
import type { ExecutionResult } from '../../orch/src/types.js';

export function shouldIncludeOutput(result: ExecutionResult, actionSchema: Map<string, ActionDefinition>): boolean {
  const actionDef = actionSchema.get(result.action.action);
  if (!actionDef) return false;
  
  if (actionDef.output_display === 'always') return true;
  if (actionDef.output_display === 'never') return false;
  if (actionDef.output_display === 'conditional') {
    return result.action.parameters.return_output !== false;
  }
  return false;
}

export function formatSummary(parseResult: ParseResult, execResults: ExecutionResult[], timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // Create a unified list of all results with line numbers for sorting
  const allResults: Array<{line: number, text: string}> = [];
  
  // Add execution results
  for (const result of execResults) {
    const line = formatSummaryLine(result);
    allResults.push({
      line: result.action.metadata.startLine,
      text: line
    });
  }
  
  // Add parse errors
  for (const error of parseResult.errors) {
    const line = formatErrorLine(error);
    allResults.push({
      line: error.blockStartLine || 0,
      text: line
    });
  }
  
  // Sort by line number
  allResults.sort((a, b) => a.line - b.line);
  
  // Add sorted results to output
  for (const result of allResults) {
    lines.push(result.text);
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}

function formatSummaryLine(result: ExecutionResult): string {
  const { action, result: execResult } = result;
  const icon = execResult.success ? '✅' : '❌';
  const id = action.metadata.blockId;
  const primaryParam = getPrimaryParam(action);
  
  if (execResult.success) {
    return `${id} ${icon} ${action.action} ${primaryParam}`.trim();
  } else {
    const errorSummary = getErrorSummary(execResult.error);
    return `${id} ${icon} ${action.action} ${primaryParam} - ${errorSummary}`.trim();
  }
}

function formatErrorLine(error: ParseError): string {
  const id = error.blockId;
  const action = error.action || '(parse error)';
  return `${id} ❌ ${action} - ${error.message}`;
}

function getPrimaryParam(action: CladaAction): string {
  // Handle different action types
  if (action.parameters.path) return action.parameters.path;
  if (action.parameters.paths) {
    // Count lines for files_read
    const paths = action.parameters.paths.trim().split('\n').filter((p: string) => p.trim());
    return `(${paths.length} files)`;
  }
  if (action.parameters.pattern) return action.parameters.pattern;
  if (action.parameters.lang) return action.parameters.lang;
  if (action.parameters.old_path) return action.parameters.old_path;
  return '';
}

function getErrorSummary(error?: string): string {
  if (!error) return 'Unknown error';
  
  // Extract key error info
  if (error.includes('File not found')) return 'File not found';
  if (error.includes('Permission denied')) return 'Permission denied';
  if (error.includes('Output too large')) return error; // Keep full message
  
  // For other errors, take first part before details
  const match = error.match(/^[^:]+:\s*([^'(]+)/);
  if (match) return match[1].trim();
  
  return error.split('\n')[0]; // First line only
}

export function formatFullOutput(parseResult: ParseResult, execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const summarySection = formatSummary(parseResult, execResults, new Date());
  const outputsSection = formatOutputsSection(execResults, actionSchema);
  
  return summarySection + '\n' + outputsSection;
}

function formatOutputsSection(execResults: ExecutionResult[], actionSchema: Map<string, ActionDefinition>): string {
  const lines = ['=== OUTPUTS ==='];
  
  // Sort by line number for chronological order
  const sortedResults = [...execResults].sort((a, b) => 
    a.action.metadata.startLine - b.action.metadata.startLine
  );
  
  for (const result of sortedResults) {
    if (!shouldIncludeOutput(result, actionSchema)) continue;
    if (!result.result.success) continue; // Don't show output for failed actions
    
    const header = formatOutputHeader(result);
    const content = formatOutputContent(result);
    
    if (content) {
      lines.push(header, content);
    }
  }
  
  lines.push('=== END ===');
  return lines.join('\n');
}

function formatOutputHeader(result: ExecutionResult): string {
  const id = result.action.metadata.blockId;
  const action = result.action.action;
  const primaryParam = getPrimaryParam(result.action);
  
  return `[${id}] ${action} ${primaryParam}:`.trim();
}

function formatOutputContent(result: ExecutionResult): string {
  const { result: execResult } = result;
  
  // Handle different output types
  if (execResult.content !== undefined) {
    // Trim trailing newline to avoid double spacing
    return execResult.content.trimEnd();
  }
  
  if (execResult.stdout !== undefined || execResult.stderr !== undefined) {
    const parts = [];
    if (execResult.stdout) {
      parts.push(`stdout:\n${execResult.stdout.trimEnd()}`);
    }
    if (execResult.stderr) {
      parts.push(`stderr:\n${execResult.stderr.trimEnd()}`);
    }
    return parts.join('\n');
  }
  
  if (execResult.data !== undefined) {
    // Pretty print JSON data with 2-space indentation
    // JSON.stringify doesn't add trailing newline
    return JSON.stringify(execResult.data, null, 2);
  }
  
  return '';
}