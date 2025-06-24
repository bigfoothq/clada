import { parse as parseCSL, ParseResult, Operation, ValidationError } from 'csl-parser';
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

/**
 * Extracts a detail string from an operation node for output formatting.
 * @param astNode - The AST node to extract details from.
 * @returns A formatted detail string (e.g., " - filename.txt" or empty string).
 */
function getOperationDetail(astNode: Operation): string {
  // Access properties through index signature since Operation type is flexible
  const node = astNode as any;
  
  switch (astNode.type) {
    case 'WRITE':
    case 'SEARCH':
      return node.file ? ` - ${node.file}` : '';
    case 'RUN':
      // For RUN commands, we could show a truncated version of the command
      // but for now just indicate it's a command
      return node.content ? ' - command' : '';
    case 'TASKS':
      return ''; // TASKS blocks don't need additional detail
    default:
      return '';
  }
}

/**
 * Processes a single AST node, executing it if valid.
 * This function handles the logic for skipping invalid operations or entire TASKS blocks.
 * @param astNode - The AST node to process.
 * @param context - The global orchestration context.
 * @param validationErrors - A list of all validation errors from the parser.
 * @param taskNumber - The task number for output formatting (e.g., "1" or "1.2")
 */
async function processNode(
  astNode: Operation, 
  context: OrchestrationContext, 
  validationErrors: ValidationError[],
  taskNumber: string
): Promise<void> {
  // For standalone operations, check if this specific operation is invalid.
  if (validationErrors.some(err => err.line === astNode.line && err.parentTaskLine === undefined)) {
    const errorInfo = validationErrors.find(e => e.line === astNode.line)!;
    console.warn(`[task-${taskNumber}] SKIP: ${astNode.type} - ${errorInfo.error}`);
    return;
  }

  // TASKS are special containers; their execution is atomic.
  if (astNode.type === 'TASKS') {
    // Access operations through the index signature since Operation type is flexible
    const operations = astNode.operations as Operation[] | undefined;
    if (operations) {
      const hasError = operations.some(() => 
          validationErrors.some(err => err.parentTaskLine === astNode.line)
      );
      if (hasError) {
        console.warn(`[task-${taskNumber}] SKIP: TASKS - validation errors within block`);
        return;
      }
      // Execute sub-operations if the whole block is valid.
      for (let i = 0; i < operations.length; i++) {
        await processNode(operations[i], context, validationErrors, `${taskNumber}.${i + 1}`);
      }
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
    const detail = getOperationDetail(astNode);
    console.error(`[task-${taskNumber}] ERROR: ${astNode.type}${detail} - ${JSON.stringify(result.error)}`);
    // Future: Implement fail-fast logic here if needed.
  } else if (result) {
    const detail = getOperationDetail(astNode);
    console.log(`[task-${taskNumber}] SUCCESS: ${astNode.type}${detail}`);
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
    // Parse CSL text using csl-parser
    const { ast, validationErrors } = parseCSL(cslText);

    // Process the entire AST. The processNode function handles skipping invalid operations.
    for (let i = 0; i < ast.length; i++) {
      await processNode(ast[i], context, validationErrors, String(i + 1));
    }

  } catch (error: unknown) {
    // Fatal syntax error from the parser
    const message = error instanceof Error ? error.message : "An unknown parsing error occurred";
    console.error(`[task-1] FATAL: ${message}`);
    process.exit(1);
  }
}