import { CladaAction, TransformError, ActionDefinition } from './types.js';
import type { Block } from 'nesl-js';

/**
 * Transform validated SHAM block into typed clada action
 * Converts string values to proper types based on schema
 */
export function transformToAction(
  block: Block,
  actionDef: ActionDefinition
): CladaAction {
  const action = block.properties.action;
  const parameters: Record<string, any> = {};

  // Process each parameter defined in the schema
  for (const [paramName, paramDef] of Object.entries(actionDef.parameters || {})) {
    // Skip if parameter not provided and has a default
    if (!(paramName in block.properties)) {
      if ('default' in paramDef) {
        parameters[paramName] = paramDef.default;
      }
      continue;
    }

    const rawValue = block.properties[paramName];

    try {
      // Convert based on parameter type
      switch (paramDef.type) {
        case 'string':
          parameters[paramName] = rawValue;
          // Validate format if specified
          if (paramDef.format === 'absolute_path' && !validateAbsolutePath(rawValue)) {
            throw new TransformError(
              `Invalid absolute path: ${rawValue}`,
              paramName,
              'absolute_path',
              rawValue
            );
          }
          break;

        case 'integer':
          parameters[paramName] = parseInteger(rawValue);
          break;

        case 'boolean':
          parameters[paramName] = parseBoolean(rawValue);
          break;

        case 'enum':
          if (!paramDef.values || !paramDef.values.includes(rawValue)) {
            throw new TransformError(
              `Invalid enum value: ${rawValue}. Allowed: ${paramDef.values?.join(', ')}`,
              paramName,
              'enum',
              rawValue
            );
          }
          parameters[paramName] = rawValue;
          break;

        default:
          // Default to string for unknown types
          parameters[paramName] = rawValue;
      }
    } catch (error) {
      if (error instanceof TransformError) {
        // Update parameter name in error
        error.parameterName = paramName;
        throw error;
      }
      throw new TransformError(
        `Failed to transform parameter ${paramName}: ${error}`,
        paramName,
        paramDef.type,
        rawValue
      );
    }
  }

  return {
    action,
    parameters,
    metadata: {
      blockId: block.id,
      startLine: block.startLine,
      endLine: block.endLine
    }
  };
}

// Helper functions for type conversion and validation

function parseBoolean(value: string): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new TransformError(
    `Invalid boolean value: ${value}`,
    'unknown',
    'boolean',
    value
  );
}

function parseInteger(value: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num.toString() !== value.trim()) {
    throw new TransformError(
      `Invalid integer value: ${value}`,
      'unknown',
      'integer',
      value
    );
  }
  return num;
}

function validateAbsolutePath(path: string): boolean {
  // Unix/Linux/Mac absolute paths start with /
  // Windows absolute paths like C:\ or \\server\share
  return /^(\/|[A-Za-z]:\\|\\\\)/.test(path);
}