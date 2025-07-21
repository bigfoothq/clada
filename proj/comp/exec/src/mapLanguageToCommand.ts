import { ExecError } from './types';

/**
 * Maps language identifier to interpreter command and arguments
 * @param lang - Language identifier (bash, javascript, python)
 * @param code - Code to execute
 * @returns Command and arguments for child_process.spawn
 * @throws ExecError if language not supported
 */
export function mapLanguageToCommand(lang: string, code: string): { command: string; args: string[] } {
  const interpreters: Record<string, { command: string; args: string[] }> = {
    bash: { command: 'bash', args: ['-c', code] },
    javascript: { command: 'node', args: ['-e', code] },
    python: { command: 'python3', args: ['-c', code] }
  };
  
  const interpreter = interpreters[lang];
  if (!interpreter) {
    throw new ExecError(
      `exec: Unsupported language '${lang}' (LANG_UNSUPPORTED)`,
      'LANG_UNSUPPORTED',
      { lang }
    );
  }
  
  return {
    command: interpreter.command,
    args: interpreter.args
  };
}