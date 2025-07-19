 # Component: sham-validator

## Component Type
standard

## Dependencies

```yaml
dependencies:
  external/nesl-js:
    types: [ShamBlock]
```

## Exports

```yaml
exports:
  functions: [validateAction]
  types: [ValidationError, ValidationResult]
```

### validateAction
- **Signature**: `validateAction(block: ShamBlock, schemas: ActionSchemas): ValidationResult`
- **Purpose**: Validates SHAM block against action schemas, ensuring action exists and has required parameters with correct types.
- **Returns**: `{ valid: true, block: ShamBlock } | { valid: false, error: ValidationError }`
- **Test-data**: `test-data/validateAction.json`

### ValidationError (type)
```typescript
interface ValidationError {
  code: 'UNKNOWN_ACTION' | 'MISSING_PARAM' | 'INVALID_TYPE' | 'SCHEMA_ERROR'
  action?: string              // The action that failed validation
  param?: string              // The parameter that failed (if applicable)
  expected?: string           // Expected type/value
  actual?: string            // Actual type/value received
  availableActions?: string[] // For UNKNOWN_ACTION errors
  message: string            // Human-readable error message
}
```

### ValidationResult (type)
```typescript
type ValidationResult = 
  | { valid: true; block: ShamBlock }
  | { valid: false; error: ValidationError }
```

### ActionSchemas (type)
```typescript
interface ActionSchemas {
  [actionName: string]: ActionSchema
}

interface ActionSchema {
  parameters: {
    [paramName: string]: ParameterSchema
  }
}

interface ParameterSchema {
  type: 'string' | 'integer' | 'boolean' | 'enum'
  required: boolean
  values?: string[]  // For enum type
}
```

## Internal Functions

### checkActionExists
- **Signature**: `checkActionExists(action: string, schemas: ActionSchemas): boolean`
- **Purpose**: Verify action name exists in schemas
- **Test-data**: `test-data/checkActionExists.json`

### validateParamType
- **Signature**: `validateParamType(value: any, paramSchema: ParameterSchema): boolean`
- **Purpose**: Check if value matches expected type (string/integer/boolean/enum)
- **Test-data**: `test-data/validateParamType.json`

### getRequiredParams
- **Signature**: `getRequiredParams(actionSchema: ActionSchema): string[]`
- **Purpose**: Extract list of required parameter names
- **Test-data**: `test-data/getRequiredParams.json`

### getMissingParams
- **Signature**: `getMissingParams(properties: Record<string, any>, requiredParams: string[]): string[]`
- **Purpose**: Find required params not present in properties (null/undefined counts as missing)
- **Test-data**: `test-data/getMissingParams.json`