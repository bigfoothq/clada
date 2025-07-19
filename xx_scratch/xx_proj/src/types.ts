/**
 * Type definitions for Clada
 */

export interface CladaOptions {
  repoPath?: string;       // Default: process.cwd()
  gitCommit?: boolean;     // Default: true
}

export interface ExecutionResult {
  success: boolean;              // False if any action failed
  totalBlocks: number;          // Count of SHAM blocks found
  executedActions: number;      // Count of actions attempted
  results: ActionResult[];      // All execution results
  parseErrors: ParseError[];    // SHAM parsing errors
  gitCommit?: string;          // Commit SHA if successful
  fatalError?: string;         // Git or system failure
}

export interface ActionResult {
  seq: number;                  // Execution order
  blockId: string;             // SHAM block ID
  action: string;              // Action type
  params: Record<string, any>; // All SHAM properties including 'action'
  success: boolean;
  error?: string;              // Error message if failed
  data?: any;                  // Action-specific output
}

export interface ParseError {
  blockId?: string;            // If error is block-specific
  error: any;                  // From parser (ShamError type)
}