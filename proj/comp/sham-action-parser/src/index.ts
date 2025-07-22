/**
 * SHAM Action Parser - Parses SHAM blocks into validated clada actions
 */

import { ParseResult, CladaAction, ParseError, ValidationResult, TransformError, ActionDefinition } from './types.js';
import { validateShamBlock } from './validateShamBlock.js';
import { transformToAction } from './transformToAction.js';
import { parseSham, type Block, type ParseResult as NeslParseResult } from 'nesl-js';
import { load as loadYaml } from 'js-yaml';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Re-export types for consumers
export type { ParseResult, CladaAction, ParseError, ValidationResult, TransformError };

// Cache for action schema
let actionSchemaCache: Map<string, ActionDefinition> | null = null;

/**
 * Clear the action schema cache - useful for testing
 * Forces reload of unified-design.yaml on next parse
 */
export function clearActionSchemaCache(): void {
  actionSchemaCache = null;
}

/**
 * Parse SHAM blocks from text into validated clada actions
 * Processes all blocks, collecting successes and errors
 */
export async function parseShamResponse(shamText: string): Promise<ParseResult> {
  const actions: CladaAction[] = [];
  const errors: ParseError[] = [];

  // Debug logging for specific test cases
  // const isDebugging = shamText.includes('move-to-existing-file');
  // if (isDebugging) {
  //   console.log('DEBUG parseShamResponse: Input text length:', shamText.length);
  //   console.log('DEBUG parseShamResponse: Contains SHAM blocks:', shamText.includes('#!SHAM'));
  //   console.log('DEBUG parseShamResponse: Number of #!SHAM occurrences:', (shamText.match(/#!SHAM/g) || []).length);
  //   console.log('DEBUG parseShamResponse: Number of #!END_SHAM occurrences:', (shamText.match(/#!END_SHAM/g) || []).length);
  // }

  // Parse SHAM blocks using nesl-js
  let parseResult: NeslParseResult;
  try {
   
    parseResult = parseSham(shamText);
    
    // if (isDebugging) {
    //   console.log('DEBUG parseShamResponse: parseSham returned:', parseResult);
    //   if (parseResult) {
    //     console.log('DEBUG parseShamResponse: blocks:', parseResult.blocks?.length || 0);
    //     console.log('DEBUG parseShamResponse: errors:', parseResult.errors?.length || 0);
    //   }
    // }
    
    // Handle case where parseSham returns undefined or null
    if (!parseResult) {
      parseResult = { blocks: [], errors: [] };
    }
  } catch (error) {
    return {
      actions: [],
      errors: [{
        blockId: 'unknown',
        errorType: 'syntax',
        message: `Failed to parse SHAM: ${error}`,
        shamContent: shamText
      }],
      summary: {
        totalBlocks: 0,
        successCount: 0,
        errorCount: 1
      }
    };
  }

  // Process syntax errors from nesl-js parser
  if (parseResult.errors && parseResult.errors.length > 0) {
    for (const parseError of parseResult.errors) {
      // Find the block this error belongs to
      const block = parseResult.blocks?.find(b => b.id === parseError.blockId);
      
      errors.push({
        blockId: parseError.blockId || 'unknown',
        action: block?.properties?.action,
        errorType: 'syntax',
        message: parseError.message,
        blockStartLine: block?.startLine || parseError.line,
        shamContent: parseError.context 
          ? `#!SHAM [@three-char-SHA-256: ${parseError.blockId}]\n${parseError.context}`.trimEnd()
          : reconstructShamBlock(block || { id: parseError.blockId, properties: {} })
      });
    }
  }

  // Load action schema
  const actionSchema = await loadActionSchema();

  // Process each SHAM block
  const blocks = parseResult.blocks || [];
  
  // If no blocks found, return empty result
  if (blocks.length === 0) {
    return {
      actions: [],
      errors: [],
      summary: {
        totalBlocks: 0,
        successCount: 0,
        errorCount: 0
      }
    };
  }
  
  // Track blocks with syntax errors to skip them
  const blocksWithSyntaxErrors = new Set(
    parseResult.errors?.map(e => e.blockId) || []
  );
  
  for (const block of blocks) {
    const blockId = block.id || 'unknown';
    
    // Skip blocks that already have syntax errors
    if (blocksWithSyntaxErrors.has(blockId)) {
      continue;
    }
    
    try {
      // Get action type from block
      const actionType = block.properties?.action;
      const actionDef = actionType ? actionSchema.get(actionType) : undefined;

 

      // Validate block
      const validation = validateShamBlock(block, actionDef ?? null);
      
      if (!validation.valid) {
        errors.push({
          blockId,
          action: actionType,
          errorType: 'validation',
          message: validation.errors?.[0] || 'Validation failed',
          blockStartLine: block.startLine,
          shamContent: reconstructShamBlock(block)
        });
        continue;
      }

      // Transform to action
      try {
        const action = transformToAction(block, actionDef!);
        actions.push(action);
      } catch (error) {
        if (error instanceof TransformError) {
          errors.push({
            blockId,
            action: actionType,
            errorType: 'type',
            message: error.message,
            blockStartLine: block.startLine,
            shamContent: reconstructShamBlock(block)
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      errors.push({
        blockId,
        action: block.properties?.action,
        errorType: 'validation',
        message: `Unexpected error: ${error}`,
        blockStartLine: block.startLine,
        shamContent: reconstructShamBlock(block)
      });
    }
  }

  const result = {
    actions,
    errors,
    summary: {
      totalBlocks: blocks.length,
      successCount: actions.length,
      errorCount: errors.length
    }
  };
  return result;
}

/**
 * Load and cache action definitions from unified-design.yaml
 */
async function loadActionSchema(): Promise<Map<string, ActionDefinition>> {
 
  if (actionSchemaCache) {
    return actionSchemaCache;
  }

  // Get the directory of this module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Navigate to project root and find unified-design.yaml
  const yamlPath = join(__dirname, '../../../../unified-design.yaml');
  
  try {
    // Add timeout to file read operation
    const yamlContent = await Promise.race([
      readFile(yamlPath, 'utf8'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('YAML read timeout')), 5000)
      )
    ]);
    const design = loadYaml(yamlContent) as any;
    
    actionSchemaCache = new Map();
    
    // Extract tool definitions
    if (design.tools) {
      for (const [toolName, toolDef] of Object.entries(design.tools)) {
        actionSchemaCache.set(toolName, toolDef as ActionDefinition);
      }
    }
    
 
    
    return actionSchemaCache;
  } catch (error) {
    throw new Error(`Failed to load unified-design.yaml: ${error}`);
  }
}

/**
 * Reconstruct SHAM block text for error context
 */
function reconstructShamBlock(block: Block): string {
  const lines: string[] = [];
  
  // Start line
  lines.push(`#!SHAM [@three-char-SHA-256: ${block.id || 'unknown'}]`);
  
  // Properties
  for (const [key, value] of Object.entries(block.properties || {})) {
    if (key.startsWith('@')) continue; // Skip annotations
    
    if (typeof value === 'string' && value.includes('\n')) {
      // Multi-line value with heredoc
      lines.push(`${key} = <<'EOT_SHAM_${block.id}'`);
      lines.push(value);
      lines.push(`EOT_SHAM_${block.id}`);
    } else {
      // Single line value - use JSON.stringify to handle quotes properly
      lines.push(`${key} = ${JSON.stringify(value)}`);
    }
  }
  
  // End line
  lines.push(`#!END_SHAM_${block.id || 'unknown'}`);
  
  return lines.join('\n');
}

// Re-export functions for consumers
export { validateShamBlock, transformToAction };