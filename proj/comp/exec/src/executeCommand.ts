import { spawn } from 'child_process';
import type { ExecResult } from './types';
import { ExecError } from './types';
import { mapLanguageToCommand } from './mapLanguageToCommand';
import { buildSpawnOptions } from './buildSpawnOptions';
import { formatExecResult } from './formatExecResult';

/**
 * Executes code from parsed SHAM action in specified language
 * @param action - CladaAction with exec action and parameters
 * @returns ExecResult with success status, output, and exit code
 * Never throws - all errors captured in result
 */
export async function executeCommand(action: any): Promise<ExecResult> {
  try {
    // Validate action structure
    if (!action?.parameters?.lang || !action?.parameters?.code === undefined) {
      return formatExecResult(null, '', '', 
        new Error('Invalid action: missing lang or code parameter'));
    }
    
    const { lang, code, cwd } = action.parameters;
    
    // Map language to command (may throw)
    const { command, args } = mapLanguageToCommand(lang, code);
    
    // Build spawn options with validated cwd (may throw)
    const options = await buildSpawnOptions(cwd);
    
    // Execute command and capture results
    return await runProcess(command, args, options);
    
  } catch (error) {
    // Convert exceptions to ExecResult format
    if (error instanceof ExecError) {
      return formatExecResult(null, '', '', error);
    }
    return formatExecResult(null, '', '', 
      error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Spawns child process and captures output with timeout handling
 * @param command - Interpreter command to run
 * @param args - Arguments for the command
 * @param options - Spawn options including cwd and timeout
 * @returns ExecResult with captured output and exit code
 */
async function runProcess(
  command: string, 
  args: string[], 
  options: any
): Promise<ExecResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    
    const child = spawn(command, args, options);
    
    // Capture output streams
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      // TODO: Implement size limit truncation
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      // TODO: Implement size limit truncation
    });
    
    // Handle process completion
    child.on('exit', (code, signal) => {
      if (timedOut) {
        resolve(formatExecResult(null, stdout, stderr, 
          new Error('exec: Process timeout after 30s (TIMEOUT)')));
      } else if (code !== null) {
        resolve(formatExecResult(code, stdout, stderr));
      } else if (signal) {
        resolve(formatExecResult(null, stdout, stderr,
          new Error(`Process killed by signal ${signal}`)));
      }
    });
    
    // Handle spawn errors (command not found, etc)
    child.on('error', (error) => {
      // Check if it's ENOENT (command not found)
      if ((error as any).code === 'ENOENT') {
        resolve(formatExecResult(null, stdout, stderr,
          new Error(`exec: ${command} not found in PATH (ENOENT)`)));
      } else {
        resolve(formatExecResult(null, stdout, stderr, error));
      }
    });
    
    // Timeout handling - Node's timeout option will kill the process
    if (options.timeout) {
      setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        // Force kill after grace period
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 1000);
      }, options.timeout);
    }
  });
}