# Component: clada

## Component Type
standard

## Dependencies

```yaml
dependencies:
  proj/comp/sham-ast-converter:
    functions: [convertToAction]
    types: [ConversionError]
  
  proj/comp/sham-validator:
    functions: [validateAction]
    types: [ValidationError, ValidationResult]
  
  proj/comp/fs-ops:
    functions: [createFile, writeFile, deleteFile, moveFile, readFile,
                createDir, deleteDir, listDir, searchFiles, globFiles]
    types: [FileOpResult]
  
  proj/comp/exec:
    functions: [executeCommand]
    types: [ExecResult]
  
  proj/comp/git-tx:
    functions: [ensureCleanRepo, commitChanges]
    types: [GitError]
  
  external/nesl-js:
    functions: [parseSHAM]
    types: [ShamParseResult, ShamBlock, ShamError]
```

## Exports

```yaml
exports:
  classes:
    Clada:
      methods: [execute]
  types: 
    - ExecutionResult
    - ActionResult  
    - ParseError
    - CladaOptions
```

### Clada (class)
- **Purpose**: Main orchestrator executing SHAM blocks from LLM output
- **Constructor**: `new Clada(options?: CladaOptions)`

### execute
- **Signature**: `async execute(llmOutput: string): Promise<ExecutionResult>`
- **Purpose**: Parse and execute all SHAM blocks in LLM output, commit results
- **Process**: 
  1. Ensure clean git state
  2. Parse SHAM blocks
  3. Convert to actions
  4. Execute all valid actions
  5. Commit changes with summary
- **Throws**: Never - all errors captured in ExecutionResult
- **Test-data**: `test-data/execute/`

### ExecutionResult (type)
```typescript
interface ExecutionResult {
  success: boolean              // False if any action failed
  totalBlocks: number          // Count of SHAM blocks found
  executedActions: number      // Count of actions attempted
  results: ActionResult[]      // All execution results
  parseErrors: ParseError[]    // SHAM parsing errors
  gitCommit?: string          // Commit SHA if successful
  fatalError?: string         // Git or system failure
}
```

### ActionResult (type)
```typescript
interface ActionResult {
  seq: number                  // Execution order
  blockId: string             // SHAM block ID
  action: string              // Action type (duplicated from params for clarity)
  params: Record<string, any> // All SHAM properties including 'action'
  success: boolean
  error?: string              // Error message if failed
  data?: any                  // Action-specific output
}
```

### ParseError (type)
```typescript
interface ParseError {
  blockId?: string            // If error is block-specific
  error: ShamError            // From parser
}
```

### CladaOptions (type)
```typescript
interface CladaOptions {
  repoPath?: string           // Default: process.cwd()
  gitCommit?: boolean         // Default: true
}
```

## Internal Architecture

### Execution Flow
```
execute(llmOutput)
  → parseSHAM(llmOutput) → ShamParseResult
  → for each valid block:
    → convertToAction(block) → Record<string, any> | null
    → if valid action (has 'action' field):
      → route to appropriate executor
      → capture result
  → commitChanges(results)
  → return ExecutionResult
```

### Action Routing
Direct function mapping:
- `file_create` → `createFile(params)`
- `file_write` → `writeFile(params)`
- `file_delete` → `deleteFile(params)`
- `file_move` → `moveFile(params)`
- `file_read` → `readFile(params)`
- `dir_create` → `createDir(params)`
- `dir_delete` → `deleteDir(params)`
- `ls` → `listDir(params)`
- `grep` → `searchFiles(params)`
- `glob` → `globFiles(params)`
- `exec` → `executeCommand(params)`

### Error Handling
- Parser errors: Skip block, record error
- Conversion errors: Skip action, record error
- Execution errors: Continue execution, record error
- Git errors: Fatal, abort with fatalError