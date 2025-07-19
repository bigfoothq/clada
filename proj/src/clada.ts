/**
 * Main Clada class - orchestrates SHAM block execution
 */

import type { CladaOptions, ExecutionResult } from './types.js';

export class Clada {
  private _options: Required<CladaOptions>;

  constructor(options: CladaOptions = {}) {
    this._options = {
      repoPath: options.repoPath ?? process.cwd(),
      gitCommit: options.gitCommit ?? true
    };
  }

  /**
   * Parse and execute all SHAM blocks in LLM output
   * @param llmOutput - String containing SHAM blocks
   * @returns Execution results with success/failure details
   */
  async execute(_llmOutput: string): Promise<ExecutionResult> {
    // TODO: Implementation
    console.log(`Executing in repo: ${this._options.repoPath}`);
    throw new Error('Not implemented');
  }
}