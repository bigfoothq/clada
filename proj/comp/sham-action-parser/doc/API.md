# Component: sham-action-parser

## Component Type
standard

## Documentation Debt
[Must be empty before implementation]

## Dependencies
[Provisional - updated via STOP protocol when implementation reveals actual needs]

```yaml
dependencies:
  external/nesl-js:
    functions: [parseSham]
    types: [Block, ParseResult, ParseError]
  
  external/js-yaml:
    functions: [load]
    types: []
  
  node:fs/promises:
    functions: [readFile]
    types: []
  
  node:path:
    functions: [resolve, join]
    types: []
```

## Exports
```yaml
exports:
  functions: [parseShamResponse, validateShamBlock, transformToAction]
  types: [ParseResult, CladaAction, ParseError, ValidationResult, TransformError]
  classes:
    TransformError:
      extends: Error
```

### parseShamResponse
- **Signature**: `parseShamResponse(shamText: string) -> Promise<ParseResult>`
- **Purpose**: Parse SHAM blocks from text into validated clada actions.
- **Test-data**: `test-data/parseShamResponse.json`

### validateShamBlock
- **Signature**: `validateShamBlock(block: ShamBlock, actionSchema: ActionDefinition) -> ValidationResult`
- **Purpose**: Validate a single SHAM block against action schema.
- **Test-data**: `test-data/validateShamBlock.json`

### transformToAction
- **Signature**: `transformToAction(block: ShamBlock, actionDef: ActionDefinition) -> CladaAction`
- **Purpose**: Transform validated SHAM block into typed clada action.
- **Throws**: `TransformError` when type conversion fails
- **Test-data**: `test-data/transformToAction.json`

## Internal Functions
[Discovered during implementation - not exported]

### loadActionSchema
- **Signature**: `loadActionSchema() -> Promise<Map<string, ActionDefinition>>`
- **Purpose**: Load and parse unified-design.yaml action definitions.

### parseBoolean
- **Signature**: `parseBoolean(value: string) -> boolean`
- **Purpose**: Convert string "true"/"false" to boolean.

### parseInteger  
- **Signature**: `parseInteger(value: string) -> number`
- **Purpose**: Convert numeric string to integer.
- **Throws**: `TransformError` when not a valid integer

### validateAbsolutePath
- **Signature**: `validateAbsolutePath(path: string) -> boolean`
- **Purpose**: Check if string is valid absolute path.

### validateEnum
- **Signature**: `validateEnum(value: string, allowed: string[]) -> boolean`
- **Purpose**: Check if value is in allowed enum values.

## Types

### ParseResult
```typescript
{
  actions: CladaAction[]      // Successfully parsed actions
  errors: ParseError[]        // All errors encountered
  summary: {
    totalBlocks: number
    successCount: number
    errorCount: number
  }
}
```

### CladaAction
```typescript
{
  action: string              // Action name from unified-design
  parameters: Record<string, any>  // Typed parameters
  metadata: {
    blockId: string          // SHAM block ID
    startLine: number
    endLine: number
  }
}
```

### ParseError
```typescript
{
  blockId: string            // Which SHAM block failed
  errorType: 'syntax' | 'validation' | 'type'
  message: string            // Specific error details
  blockStartLine?: number    // Starting line of the SHAM block
  shamContent?: string       // Original SHAM block for context
}
```

### ValidationResult
```typescript
{
  valid: boolean
  actionType?: string        // Identified action if valid
  errors?: string[]          // Validation errors if invalid
}
```

### TransformError
```typescript
class TransformError extends Error {
  parameterName: string
  expectedType: string
  actualValue: string
}
```

### ActionDefinition
```typescript
{
  type: 'read' | 'write' | 'meta' | 'git' | 'dynamic'
  description: string
  parameters: Record<string, ParameterDef>
  returns: Record<string, any>
}
```

### ParameterDef
```typescript
{
  type: string              // 'string' | 'integer' | 'boolean' | 'enum'
  required: boolean
  format?: string           // e.g. 'absolute_path'
  values?: string[]         // for enum type
  default?: any
}
```