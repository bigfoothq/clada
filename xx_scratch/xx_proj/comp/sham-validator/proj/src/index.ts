// Types from API.md
export interface ValidationError {
  code: 'UNKNOWN_ACTION' | 'MISSING_PARAM' | 'INVALID_TYPE' | 'SCHEMA_ERROR';
  action?: string;
  param?: string;
  expected?: string;
  actual?: string;
  availableActions?: string[];
  message: string;
}

export type ValidationResult = 
  | { valid: true; block: any }
  | { valid: false; error: ValidationError };

export interface ActionSchemas {
  [actionName: string]: {
    parameters: {
      [paramName: string]: {
        type: 'string' | 'integer' | 'boolean' | 'enum';
        required: boolean;
        values?: string[];
      }
    }
  }
}

// Internal functions (exported for testing)
export function checkActionExists(action: string, schemas: ActionSchemas): boolean {
  throw new Error('Not implemented');
}

export function validateParamType(value: any, paramSchema: ParameterSchema): boolean {
  throw new Error('Not implemented');
}

export function getRequiredParams(actionSchema: ActionSchema): string[] {
  throw new Error('Not implemented');
}

export function getMissingParams(properties: Record<string, any>, requiredParams: string[]): string[] {
  throw new Error('Not implemented');
}

// Main validation function
export function validateAction(_block: any, _schemas: ActionSchemas): ValidationResult {
  throw new Error('Not implemented');
}

// Type additions
export interface ActionSchema {
  parameters: {
    [paramName: string]: ParameterSchema
  }
}

export interface ParameterSchema {
  type: 'string' | 'integer' | 'boolean' | 'enum';
  required: boolean;
  values?: string[];
}