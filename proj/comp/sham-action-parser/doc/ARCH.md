# SHAM Action Parser - Architecture

## Design Philosophy

**Maximize Execution, Minimize Regeneration**: Parse and validate each SHAM block independently. Execute all valid actions while collecting detailed errors for invalid ones. This avoids expensive LLM token usage for full response regeneration.

## Processing Pipeline

1. **SHAM Parsing** (via nesl-js)
   - Input: Raw text with SHAM blocks
   - Output: Parsed blocks with string properties
   - Preserves: Block IDs, line numbers, raw content

2. **Action Validation** (per block)
   - Validate `action` field exists and matches known clada actions
   - Check required parameters for specific action type
   - Continue processing even if some blocks fail

3. **Type Transformation** (per valid block)
   - Convert string values to appropriate types
   - Validate constraints (path formats, enum values, etc.)
   - Preserve original SHAM metadata

4. **Result Aggregation**
   - Collect all successful action objects
   - Collect all errors with context
   - Return comprehensive ParseResult

## Error Handling Strategy

Each block processed independently with errors collected in structured format:
- `blockId`: SHAM block identifier
- `blockStartLine`: Starting line number of the SHAM block in original text
- `errorType`: Category (syntax, validation, type)
- `message`: Specific error details
- `shamContent`: Original SHAM block for LLM reference

## Type Conversions

All SHAM values are strings, requiring conversion:
- **Booleans**: "true"/"false" → boolean
- **Integers**: Numeric strings → number
- **Paths**: Validate absolute path format
- **Enums**: Validate against allowed values
- **Arrays**: Not supported in SHAM (would need special syntax)

## Action Mapping

SHAM actions map directly to clada tool names from unified-design.yaml:
- Must use exact tool names (e.g., `file_create`, not `create_file`)
- No aliasing or fuzzy matching to avoid ambiguity

## Constraints

- SHAM doesn't support complex types (objects, arrays)
- All values are strings requiring parsing
- No nested structures
- Heredoc strings preserve internal formatting

## Dependencies on Other Components

- Requires action schema definitions (types, required params)
- Will need shared error types with response formatter
- Path validation utilities