import type { OrchestratorResult } from '../../orch/src/types.js';

export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);
      
      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }
  
  // Add parse errors
  if (orchResult.parseErrors) {
    for (const error of orchResult.parseErrors) {
      lines.push(`${error.blockId || 'unknown'} ❌ ${error.action || '(parse error)'} - ${error.message}`);
    }
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}

function getPrimaryParamFromResult(result: any): string {
  if (!result.params) return '';
  if (result.params.path) return result.params.path;
  if (result.params.paths) {
    const paths = result.params.paths.trim().split('\n').filter((p: string) => p.trim());
    return `(${paths.length} files)`;
  }
  if (result.params.pattern) return result.params.pattern;
  if (result.params.lang) return result.params.lang;
  if (result.params.old_path) return result.params.old_path;
  return '';
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
  const lines = ['=== CLADA RESULTS ==='];
  
  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);
      
      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }
  
  // Add parse errors
  if (orchResult.parseErrors) {
    for (const error of orchResult.parseErrors) {
      lines.push(`${error.blockId || 'unknown'} ❌ ${error.action || '(parse error)'} - ${error.message}`);
    }
  }
  
  lines.push('=== END ===', '', '=== OUTPUTS ===');
  
  // Add outputs for successful actions based on output_display rules
  if (orchResult.results) {
    for (const result of orchResult.results) {
      if (result.success && result.data && shouldShowOutput(result.action, result.params)) {
        const header = `[${result.blockId}] ${result.action} ${getPrimaryParamFromResult(result)}:`.trim();
        lines.push('', header);
        
        // Format output based on data type
        if (typeof result.data === 'string') {
          lines.push(result.data.trimEnd());
        } else if (result.data.stdout || result.data.stderr) {
          if (result.data.stdout) {
            lines.push(`stdout:\n${result.data.stdout.trimEnd()}`);
          }
          if (result.data.stderr) {
            lines.push(`stderr:\n${result.data.stderr.trimEnd()}`);
          }
        } else {
          lines.push(JSON.stringify(result.data, null, 2));
        }
      }
    }
  }
  
  lines.push('=== END ===');
  return lines.join('\n');
}

/**
 * Check if output should be displayed for an action based on unified-design.yaml rules.
 * This is a simplified check - the real implementation would load from unified-design.yaml.
 */
function shouldShowOutput(action: string, params?: any): boolean {
  // Actions with output_display: never
  const neverShowOutput = ['file_write', 'file_replace_text', 'file_replace_all_text', 'file_append', 'file_delete', 'file_move', 'dir_create', 'dir_delete'];
  if (neverShowOutput.includes(action)) {
    return false;
  }
  
  // Actions with output_display: always
  const alwaysShowOutput = ['file_read', 'files_read', 'ls', 'grep', 'glob'];
  if (alwaysShowOutput.includes(action)) {
    return true;
  }
  
  // Actions with output_display: conditional
  if (action === 'exec') {
    // Check return_output parameter (default is true)
    return params?.return_output !== false;
  }
  
  // Default to showing output for unknown actions
  return true;
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