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
export { ParseResult, CladaAction, ParseError, ValidationResult, TransformError };

// Cache for action schema
let actionSchemaCache: Map<string, ActionDefinition> | null = null;

/**
 * Parse SHAM blocks from text into validated clada actions
 * Processes all blocks, collecting successes and errors
 */
export async function parseShamResponse(shamText: string): Promise<ParseResult> {
  console.log('[parseShamResponse] Starting with text length:', shamText.length);
  const actions: CladaAction[] = [];
  const errors: ParseError[] = [];

  // Parse SHAM blocks using nesl-js
  let parseResult: NeslParseResult;
  try {
    console.log('[parseShamResponse] About to call parseSham...');
    parseResult = parseSham(shamText);
    console.log('[parseShamResponse] parseSham returned:', parseResult);
    
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
  
  for (const block of blocks) {
    const blockId = block.id || 'unknown';
    console.log('[parseShamResponse] Processing block', blockId, 'with properties:', block.properties);
    
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
  console.log('[parseShamResponse] Returning result with', result.actions.length, 'actions and', result.errors.length, 'errors');
  return result;
}

/**
 * Load and cache action definitions from unified-design.yaml
 */
async function loadActionSchema(): Promise<Map<string, ActionDefinition>> {
  console.log('[loadActionSchema] Called, cache exists?', !!actionSchemaCache);
  if (actionSchemaCache) {
    return actionSchemaCache;
  }

  // Get the directory of this module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Navigate to project root and find unified-design.yaml
  const yamlPath = join(__dirname, '../../../../unified-design.yaml');
  console.log('[loadActionSchema] Attempting to load from:', yamlPath);
  
  try {
    console.log('[loadActionSchema] About to read file...');
    const yamlContent = await readFile(yamlPath, 'utf8');
    console.log('[loadActionSchema] File read complete, size:', yamlContent.length);
    console.log('[loadActionSchema] About to parse YAML...');
    const design = loadYaml(yamlContent) as any;
    console.log('[loadActionSchema] YAML parsed, top keys:', Object.keys(design || {}));
    
    actionSchemaCache = new Map();
    
    // Extract tool definitions
    if (design.tools) {
      for (const [toolName, toolDef] of Object.entries(design.tools)) {
        actionSchemaCache.set(toolName, toolDef as ActionDefinition);
      }
    }
    
    console.log('[loadActionSchema] Schema cached with', actionSchemaCache.size, 'actions');
    return actionSchemaCache;
  } catch (error) {
    console.error('[loadActionSchema] Error:', error);
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