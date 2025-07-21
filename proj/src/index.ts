import type { CladaAction, ParseResult, ParseError } from '../comp/sham-action-parser/src/index.js';
import { parseShamResponse } from '../comp/sham-action-parser/src/index.js';
import type { FileOpResult } from '../comp/fs-ops/src/index.js';

export interface ExecutionResult {
  success: boolean;
  totalBlocks: number;
  executedActions: number;
  results: ActionResult[];
  parseErrors: ParseError[];
  fatalError?: string;
}

export interface ActionResult {
  seq: number;
  blockId: string;
  action: string;
  params: Record<string, any>;
  success: boolean;
  error?: string;
  data?: any;
}

export interface CladaOptions {
  repoPath?: string;
  gitCommit?: boolean;
}

export class Clada {
  private options: CladaOptions;
  private executors: Map<string, (action: CladaAction) => Promise<FileOpResult>> | null = null;

  constructor(options: CladaOptions = {}) {
    this.options = {
      repoPath: options.repoPath || process.cwd(),
      gitCommit: options.gitCommit ?? true
    };
  }

  /**
   * Parse and execute all SHAM blocks in LLM output
   * Executes all valid actions sequentially, collecting both successes and failures
   */
  async execute(llmOutput: string): Promise<ExecutionResult> {
    try {
      // Parse SHAM blocks
      const parseResult = await parseShamResponse(llmOutput);
      
      // Initialize executors if needed
      if (!this.executors) {
        try {
          await this.initializeExecutors();
        } catch (error) {
          return {
            success: false,
            totalBlocks: parseResult.summary.totalBlocks,
            executedActions: 0,
            results: [],
            parseErrors: parseResult.errors,
            fatalError: `Failed to initialize executors: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }
      
      // Execute each valid action sequentially
      const results: ActionResult[] = [];
      let seq = 1;
      
      for (const action of parseResult.actions) {
        const result = await this.executeAction(action, seq++);
        results.push(result);
      }
      
      // Calculate overall success
      const allActionsSucceeded = results.every(r => r.success);
      const noParseErrors = parseResult.errors.length === 0;
      
      return {
        success: allActionsSucceeded && noParseErrors,
        totalBlocks: parseResult.summary.totalBlocks,
        executedActions: results.length,
        results,
        parseErrors: parseResult.errors
      };
      
    } catch (error) {
      // Only truly unexpected errors should reach here
      return {
        success: false,
        totalBlocks: 0,
        executedActions: 0,
        results: [],
        parseErrors: [],
        fatalError: `Unexpected error in execute: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Initialize action executors with dynamic imports
   * Treats import failures as fatal errors
   */
  private async initializeExecutors(): Promise<void> {
    this.executors = new Map();
    
    // Import fs-ops executor
    const fsOpsModule = await import('../comp/fs-ops/src/index.js');
    const { executeFileOperation } = fsOpsModule;
    
    // Map file operations
    const fileOps = [
      'file_write',
      'file_read',
      'file_delete',
      'file_move',
      'file_replace_text',
      'file_replace_all_text',
      'file_append',
      'dir_create',
      'dir_delete',
      'ls',
      'grep',
      'glob'
    ];
    
    for (const op of fileOps) {
      this.executors.set(op, executeFileOperation);
    }
    
    // Exec operations will return "not implemented" for now
    this.executors.set('exec', async (action) => ({
      success: false,
      error: 'Action not implemented: exec'
    }));
  }

  /**
   * Execute a single action and format the result
   * Never throws - all errors returned in ActionResult
   */
  private async executeAction(action: CladaAction, seq: number): Promise<ActionResult> {
    const executor = this.executors?.get(action.action);
    
    if (!executor) {
      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: false,
        error: `Unknown action: ${action.action}`
      };
    }
    
    try {
      // Add default cwd for exec actions if not specified
      const enhancedAction = action.action === 'exec' && !action.parameters.cwd
        ? { ...action, parameters: { ...action.parameters, cwd: this.options.repoPath } }
        : action;
      
      const result = await executor(enhancedAction);
      
      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: result.success,
        ...(result.error && { error: result.error }),
        ...(result.data && { data: result.data })
      };
      
    } catch (error) {
      // Executors should never throw, but handle just in case
      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: false,
        error: `Unexpected executor error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}