import type { OrchestratorResult } from '../../orch/src/types.js';

export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  // Extract summary section from orchestrator's output
  const output = orchResult.formattedOutput || '';
  const startIndex = output.indexOf('=== CLADA RESULTS ===');
  const endIndex = output.indexOf('=== END ===');
  
  if (startIndex === -1 || endIndex === -1) {
    return '\n=== CLADA RESULTS ===\n=== END ===\n';
  }
  
  // Extract summary including the markers
  const summary = output.substring(startIndex - 1, endIndex + '=== END ==='.length + 1);
  return summary;
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
  if (error.includes('no such file or directory')) return 'File not found';
  if (error.includes('Permission denied')) return 'Permission denied';
  if (error.includes('Output too large')) return error; // Keep full message
  
  // For other errors, take first part before details
  const match = error.match(/^[^:]+:\s*([^'(]+)/);
  if (match) return match[1].trim();
  
  return error.split('\n')[0]; // First line only
}

export function formatFullOutput(orchResult: OrchestratorResult): string {
  // Return the full formatted output from orchestrator
  return orchResult.formattedOutput || '';
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