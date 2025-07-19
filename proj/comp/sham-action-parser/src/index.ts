/**
 * SHAM Action Parser - Parses SHAM blocks into validated clada actions
 */

import { ParseResult, CladaAction, ParseError, ValidationResult, TransformError } from './types';
import { validateShamBlock } from './validateShamBlock';
import { transformToAction } from './transformToAction';

// Re-export types for consumers
export { ParseResult, CladaAction, ParseError, ValidationResult, TransformError };

/**
 * Parse SHAM blocks from text into validated clada actions
 * Processes all blocks, collecting successes and errors
 */
export async function parseShamResponse(_shamText: string): Promise<ParseResult> {
  throw new Error('Not implemented');
}

// Re-export functions for consumers
export { validateShamBlock, transformToAction };