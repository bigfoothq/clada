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

 

/**
 * Format file read output in a human-readable way
 */
function formatFileReadOutput(result: any): string[] {
  const lines: string[] = [];
  
  if (result.action === 'file_read') {
    // Simple file read
    lines.push(`=== START FILE: ${result.data.path} ===`);
    lines.push(result.data.content || '[empty file]');
    lines.push(`=== END FILE: ${result.data.path} ===`);
  } else if (result.action === 'file_read_numbered') {
    // Numbered file read
    lines.push(`=== START FILE: [numbered] ${result.data.path} ===`);
    lines.push(result.data.content || '[empty file]');
    lines.push(`=== END FILE: [numbered] ${result.data.path} ===`);
  } else if (result.action === 'files_read') {
    // Multiple files read
    const files = result.data.files || [];
    lines.push(`Reading ${files.length} files:`);
    
    // List all files first
    for (const file of files) {
      lines.push(`- ${file.path}`);
    }
    
    // Then show content of each file
    for (const file of files) {
      lines.push('');
      lines.push(`=== START FILE: ${file.path} ===`);
      lines.push(file.content || '[empty file]');
      lines.push(`=== END FILE: ${file.path} ===`);
    }
  }
  
  return lines;
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
        
        // Special formatting for file read operations
        if (['file_read', 'file_read_numbered', 'files_read'].includes(result.action)) {
          const formattedOutput = formatFileReadOutput(result);
          lines.push(...formattedOutput);
        } else if (typeof result.data === 'string') {
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

 