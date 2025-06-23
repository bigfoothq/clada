import { parse as parseCSL } from 'csl-parser';
import { executeWrite } from '../../components/write/main/core/src/execute.js';
import { executeEdit } from '../../components/edit/main/core/src/execute.js';
// import { executeRun } from '../../components/run/main/core/src/execute.js';
import { mapAstNodeToCommand, CladaCommand } from './adapter.js';

// --- Type Definitions ---

/** A generic result object indicating success or failure. */
interface ExecutionResult {
  ok: boolean;
  error?: any;
}

/** The global context for the orchestration process. */
export interface OrchestrationContext {
  workingDir: string;
}

/** Describes a validation error from the csl-parser. */
interface CslValidationError {
  line: number;
  parentTaskLine?: number;
  error: string;
}

// --- CSL AST Node Types (from csl-parser) ---

/** The base structure for any node from the CSL parser. */
interface CslBaseNode {
  type: string;
  line: number;
}
interface CslWriteNode extends CslBaseNode { type: 'WRITE'; file: string; content: string; append?: string; }
interface CslSearchNode extends CslBaseNode { type: 'SEARCH'; file: string; pattern: string; to?: string; replacement: string; count?: string; }
interface CslRunNode extends CslBaseNode { type: 'RUN'; content: string; dir?: string; }
interface CslTasksNode extends CslBaseNode { type: 'TASKS'; operations: CslAstNode[]; }
type CslAstNode = CslWriteNode | CslSearchNode | CslRunNode | CslTasksNode;

/** The complete output from the `csl-parser`. */
interface CslParseResult {
  ast: CslAstNode[];
  validationErrors: CslValidationError[];
}

/**
 * Processes a single AST node, executing it if valid.
 * This function handles the logic for skipping invalid operations or entire TASKS blocks.
 * @param astNode - The AST node to process.
 * @param context - The global orchestration context.
 * @param validationErrors - A list of all validation errors from the parser.
 */
async function processNode(astNode: CslAstNode, context: OrchestrationContext, validationErrors: CslValidationError[]): Promise<void> {
  // For standalone operations, check if this specific operation is invalid.
  if (validationErrors.some(err => err.line === astNode.line && err.parentTaskLine === undefined)) {
    const errorInfo = validationErrors.find(e => e.line === astNode.line)!;
    console.warn(`[SKIP] Skipping operation at line ${astNode.line} due to validation error: ${errorInfo.error}`);
    return;
  }

  // TASKS are special containers; their execution is atomic.
  if (astNode.type === 'TASKS') {
    const hasError = astNode.operations.some(() => 
        validationErrors.some(err => err.parentTaskLine === astNode.line)
    );
    if (hasError) {
      console.warn(`[SKIP] Skipping TASKS block at line ${astNode.line} due to validation errors within it.`);
      return;
    }
    // Execute sub-operations if the whole block is valid.
    for (const subNode of astNode.operations) {
      await processNode(subNode, context, validationErrors);
    }
    return;
  }
  
  // The Adapter converts the AST node to a Clada command object.
  const command = mapAstNodeToCommand(astNode);
  if (!command) return;

  // Execute the command with the corresponding Clada component.
  let result: ExecutionResult | undefined;
  switch (command.type) {
    case 'WRITE':
      result = executeWrite(command.payload, { cwd: context.workingDir, config: { allowEscape: false } });
      break;
    case 'EDIT':
      result = executeEdit(command.payload, { workingDir: context.workingDir });
      break;
    // case 'RUN':
    //   result = executeRun(command.payload, context);
    //   break;
  }

  if (result && !result.ok) {
    console.error(`[ERROR] Execution failed for task at line ${astNode.line}: ${JSON.stringify(result.error)}`);
    // Future: Implement fail-fast logic here if needed.
  } else {
    console.log(`[SUCCESS] Task at line ${astNode.line} (${astNode.type}) completed.`);
  }
}

/**
 * Orchestrates the parsing and execution of a CSL text.
 * It parses the CSL, then iterates through the AST, processing each node.
 * @param cslText - The raw CSL string to execute.
 * @param context - The global orchestration context (e.g., working directory).
 */
export async function orchestrate(cslText: string, context: OrchestrationContext): Promise<void> {
  try {
    // The `csl-parser` is assumed to return a structure matching CslParseResult.
    // We cast the return to provide type safety downstream.
    const { ast, validationErrors } = parseCSL(cslText) as CslParseResult;

    // Process the entire AST. The processNode function handles skipping invalid operations.
    for (const astNode of ast) {
      await processNode(astNode, context, validationErrors);
    }

  } catch (error: unknown) {
    // Fatal syntax error from the parser
    const message = error instanceof Error ? error.message : "An unknown parsing error occurred";
    console.error(`[FATAL] Syntax Error: ${message}`);
    process.exit(1);
  }
}