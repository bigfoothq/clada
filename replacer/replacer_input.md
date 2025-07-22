=== PROCESSED: 2025-07-21 21:57:38 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
===

The function `getPrimaryParam` already exists in the file. Let me fix the duplicate declaration:

<<<EXPLANATION>>>
Remove duplicate getPrimaryParam function and fix imports
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
<<<SEARCH>>>
import type { OrchestratorResult } from '../../orch/src/types.js';

export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  const lines = ['', '=== CLADA RESULTS ==='];
  
  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParam(result);
      
      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${result.error}`.trim());
      }
    }
  }
  
  // Add parse errors
  if (orchResult.parseErrors) {
    for (const error of orchResult.parseErrors) {
      lines.push(`${error.blockId || 'unknown'} ❌ (parse error) - ${error.error.message || error.error}`);
    }
  }
  
  lines.push('=== END ===', '');
  return lines.join('\n');
}

function getPrimaryParam(result: any): string {
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
<<<REPLACE>>>
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
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${result.error}`.trim());
      }
    }
  }
  
  // Add parse errors
  if (orchResult.parseErrors) {
    for (const error of orchResult.parseErrors) {
      lines.push(`${error.blockId || 'unknown'} ❌ (parse error) - ${error.error.message || error.error}`);
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
<<<END>>>

<<<EXPLANATION>>>
Also need to fix formatFullOutput to handle actual orchestrator response
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/src/formatters.ts
<<<SEARCH>>>
export function formatFullOutput(orchResult: OrchestratorResult): string {
  // Return the full formatted output from orchestrator
  return orchResult.formattedOutput || '';
}
<<<REPLACE>>>
export function formatFullOutput(orchResult: OrchestratorResult): string {
  const summary = formatSummary(orchResult, new Date());
  
  const lines = [summary.trim(), '', '=== OUTPUTS ==='];
  
  // Add outputs for successful actions
  if (orchResult.results) {
    for (const result of orchResult.results) {
      if (result.success && result.data) {
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
<<<END>>>

Now run the test again to see the file content being passed to orchestrator.