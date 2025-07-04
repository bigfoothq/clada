import type { Operation } from 'csl-parser';


// --- Clada Command Types ---

/** A command for the `write` component. */
export interface WriteCommand {
  type: 'WRITE';
  payload: {
    path: string;
    content: string;
    append: boolean;
  };
}

/** The payload for an `edit` command that finds an exact string match. */
interface EditPayloadExact {
  mode: 'exact';
  path: string;
  search: string;
  replace: string;
  count: number;
}

/** The payload for an `edit` command that finds a range between two strings. */
interface EditPayloadRange {
  mode: 'range';
  path: string;
  searchStart: string;
  searchEnd: string;
  replace: string;
  count: number;
}

/** A command for the `edit` component. */
export interface EditCommand {
  type: 'EDIT';
  payload: EditPayloadExact | EditPayloadRange;
}

/** A command for the `run` component. */
export interface RunCommand {
  type: 'RUN';
  payload: {
    command: string;
    cwd?: string;
  };
}

/** A union of all possible Clada command types. */
export type CladaCommand = WriteCommand | EditCommand | RunCommand;


/**
 * Maps a CSL AST node to a clada command object.
 * This function serves as the bridge between the csl-parser's output and the
 * internal command structure of the clada execution components.
 * @param astNode - A single node from the csl-parser AST.
 * @returns A clada command object or null if the node type does not map to a command.
 */
export function mapAstNodeToCommand(astNode: Operation): CladaCommand | null {
  switch (astNode.type) {
    case 'WRITE':
      return {
        type: 'WRITE',
        payload: {
          path: astNode.file,
          content: astNode.content,
          // CSL `append` is a string "true", Clada `executeWrite` expects a boolean
          append: astNode.append === 'true',
        },
      };

    case 'SEARCH': {
      // CSL `count` is a string (e.g., "3"), Clada expects a number. Default to 1.
      const count = astNode.count ? parseInt(astNode.count, 10) : 1;
      
      const isRangeSearch = !!astNode.to;

      if (isRangeSearch) {
        return {
          type: 'EDIT',
          payload: {
            mode: 'range',
            path: astNode.file,
            replace: astNode.replacement,
            count: isNaN(count) ? 1 : count,
            searchStart: astNode.pattern,
            searchEnd: astNode.to,
          },
        };
      } else {
        return {
          type: 'EDIT',
          payload: {
            mode: 'exact',
            path: astNode.file,
            replace: astNode.replacement,
            count: isNaN(count) ? 1 : count,
            search: astNode.pattern,
          },
        };
      }
    }

    case 'RUN':
      return {
        type: 'RUN',
        payload: {
          command: astNode.content,
          // `dir` attribute from CSL can be used to set the cwd for this command
          cwd: astNode.dir, 
        },
      };
    
    // TASKS nodes are handled by the orchestrator loop, not mapped to a single command.
    case 'TASKS':
      return null;

    default:
      console.warn(`[Adapter] Unsupported AST node type: ${astNode.type}`);
      return null;
  }
}