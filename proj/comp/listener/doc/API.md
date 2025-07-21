# Component: listener

## Component Type
standard

## Dependencies
[Provisional - updated via STOP protocol when implementation reveals actual needs]

```yaml
dependencies:
  proj/comp/orch:                                          # [IMPLEMENTED]
    functions: [execute]
    types: [ExecutionResult]
  
  proj/comp/sham-action-parser:                           # [IMPLEMENTED]
    functions: [parseShamResponse]
    types: [ParseResult, CladaAction]
  
  node:fs/promises:
    functions: [readFile, writeFile]
  
  node:fs:
    functions: [watchFile, unwatchFile]
    types: [Stats]
  
  node:path:
    functions: [dirname, join, basename]
  
  node:crypto:
    functions: [createHash]
  
  external/clipboardy:
    functions: [write as writeToClipboard]
```

## Exports

```yaml
exports:
  functions: [startListener, stopListener]
  types: [ListenerConfig, ListenerHandle, ListenerState]
  classes:
    ListenerError:
      extends: Error
```

### startListener
- **Signature**: `startListener(config: ListenerConfig) -> Promise<ListenerHandle>`
- **Purpose**: Begin watching file for SHAM blocks and executing them.
- **Throws**: `ListenerError` when file doesn't exist or can't be accessed
- **Test-data**: `test-data/startListener.json` [PLANNED]

### stopListener
- **Signature**: `stopListener(handle: ListenerHandle) -> Promise<void>`
- **Purpose**: Stop watching file and clean up resources.
- **Test-data**: `test-data/stopListener.json` [PLANNED]

## Types

### ListenerConfig
```typescript
{
  filePath: string           // Absolute path to watch
  debounceMs?: number        // Milliseconds to wait before processing (default: 500)
  outputFilename?: string    // Name for output file (default: ".clada-output-latest.txt")
}
```

### ListenerHandle
```typescript
{
  id: string                 // Unique listener instance ID
  filePath: string           // Path being watched
  stop: () => Promise<void>  // Method to stop this listener
}
```

### ListenerState
```typescript
{
  lastExecutedHash: string   // SHA-256 of previously executed SHAM content
  isProcessing: boolean      // Currently executing actions
  outputPath: string         // Full path to output file
}
```

### ListenerError
```typescript
class ListenerError extends Error {
  code: 'FILE_NOT_FOUND' | 'ACCESS_DENIED' | 'ALREADY_WATCHING'
  path: string
}
```

## Internal Functions
[To be discovered during implementation]

### processFileChange
- **Signature**: `processFileChange(filePath: string, state: ListenerState) -> Promise<void>`
- **Purpose**: Read file, hash content, execute new blocks if changed.

### computeContentHash
- **Signature**: `computeContentHash(actions: CladaAction[]) -> string`
- **Purpose**: Generate hash from parsed action objects for comparison.

### formatSummary
- **Signature**: `formatSummary(results: ExecutionResult[], timestamp?: Date) -> string`
- **Purpose**: Create the summary text block for prepending.

### formatFullOutput
- **Signature**: `formatFullOutput(results: ExecutionResult[]) -> string`
- **Purpose**: Create detailed output including action outputs.

### updateFileWithClipboardStatus
- **Signature**: `updateFileWithClipboardStatus(filePath: string, timestamp: Date) -> Promise<void>`
- **Purpose**: Replace first line with clipboard success indicator.