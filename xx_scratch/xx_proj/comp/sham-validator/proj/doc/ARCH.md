 # sham-validator Architecture

## Core Design Decisions

### Schema Management
**Decision**: Load schemas from JSON file at startup
**Rationale**: 
- Single source of truth with unified-design.yaml
- No runtime parsing overhead
- Easy to regenerate when YAML changes
**Trade-off**: Manual sync between YAML and JSON needed

### Validation Strategy
**Decision**: Structural validation only
**Rationale**:
- Fast, predictable validation
- Clear separation from execution concerns
- Semantic validation belongs at execution (e.g., file exists)

### Error Design
```typescript
interface ValidationError {
  code: 'UNKNOWN_ACTION' | 'MISSING_PARAM' | 'INVALID_TYPE' | 'SCHEMA_ERROR'
  action?: string
  param?: string
  expected?: string
  actual?: string
  availableActions?: string[]
  message: string
}
```

**Decision**: Rich error objects over string messages
**Rationale**: LLMs can parse structured errors better than prose

### Type Validation Rules
- `string`: typeof === 'string'
- `integer`: Number.isInteger()
- `boolean`: typeof === 'boolean'
- `enum`: value in allowed set
- Arrays and objects: Deep validation

### Schema Format
```json
{
  "file_create": {
    "parameters": {
      "path": {"type": "string", "required": true},
      "content": {"type": "string", "required": true}
    }
  },
  "exec": {
    "parameters": {
      "code": {"type": "string", "required": true},
      "lang": {"type": "enum", "values": ["python", "javascript", "bash", "ruby"], "required": true},
      "version": {"type": "string", "required": false},
      "cwd": {"type": "string", "required": false}
    }
  }
}
```

### Validation Flow
1. Check action exists in schema
2. Get action schema
3. Check all required params present
4. Validate each param type
5. Return validated block or error

### Edge Cases
- **Extra parameters**: Allowed, pass through unchanged
- **Null values**: Treated as missing for required params
- **Empty strings**: Valid for string type
- **Type coercion**: None - strict type checking

### Performance Considerations
- Schema loaded once at startup
- No async operations
- O(n) where n is parameter count
- Early exit on first error

### Future Considerations
- **Schema versioning**: How to handle schema evolution?
- **Custom validators**: For complex types like paths?
- **Warning vs errors**: Some validations could be warnings?