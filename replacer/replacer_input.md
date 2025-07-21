=== PROCESSED: 2025-07-21 19:08:27 ===
SUCCESS Block 1: Created /Users/stuart/repos/clada/proj/comp/listener/doc/ABSTRACT.md
SUCCESS Block 2: Created /Users/stuart/repos/clada/proj/comp/listener/doc/API.md
SUCCESS Block 3: Created /Users/stuart/repos/clada/proj/comp/listener/doc/ARCH.md
===

## Edit Instructions

<<<EXPLANATION>>>
Create ABSTRACT.md for the listener component - defines purpose and high-level behavior
<<<FILE>>>
proj/comp/listener/doc/ABSTRACT.md
<<<OVERWRITE>>>
# File Listener

Watches a file for SHAM blocks, executes them via orchestrator, and prepends results while managing output to clipboard and separate file.

## Overview

The listener component provides continuous monitoring of a designated input file for SHAM action blocks. When file content changes, it detects new or modified SHAM blocks by content hash comparison, executes them through the orchestrator component, and manages the output flow. Results are formatted as a summary prepended to the input file, with full output written to a companion file and copied to clipboard.

The component handles the complete lifecycle: detecting changes via file system events, parsing content to extract SHAM blocks, determining which blocks are new based on content hashing, executing actions in order, formatting results into summary and detailed views, and coordinating the three output destinations (input file prepend, output file, clipboard). It includes debouncing to handle rapid file saves and provides clear visual feedback when operations complete.

The design prioritizes developer experience with clear status indicators, handles common failure modes gracefully (permission errors, clipboard failures), and maintains a simple state model tracking only the hash of previously executed blocks.
<<<END>>>

<<<EXPLANATION>>>
Create API.md defining the component's public interface and dependencies
<<<FILE>>>
proj/comp/listener/doc/API.md
<<<OVERWRITE>>>
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
<<<END>>>

<<<EXPLANATION>>>
Create ARCH.md documenting key design decisions and implementation details
<<<FILE>>>
proj/comp/listener/doc/ARCH.md
<<<OVERWRITE>>>
# Listener Architecture

## Design Philosophy

**Minimal State, Maximum Reliability**: Track only what's necessary (content hash), handle failures gracefully, provide clear feedback. No complex state machines or recovery logic.

## Key Design Decisions

### File Watching Strategy
- Use `fs.watchFile` with polling (more reliable than fs.watch)
- Poll interval: 500ms default
- Stat-based change detection
- Single watcher per file (error if duplicate)

**Rationale**: fs.watch has platform inconsistencies. Polling is battery-hungry but reliable for single-file monitoring.

### Content Hashing
- Hash parsed CladaAction objects after successful parsing
- Use SHA-256 of JSON.stringify(actions)
- Empty array hash for parse failures
- Hash comparison determines execution

**Edge case**: Parse errors reset hash, causing re-execution of all blocks on fix.

### Debouncing
- File change starts debounce timer
- Subsequent changes reset timer
- Only process after quiet period
- Default: 500ms

**Rationale**: Editors often write multiple times. Prevents redundant execution during typing.

### Output Coordination

**Three destinations, specific order**:
1. Write `.clada-output-latest.txt` (same directory)
2. Prepend summary to input file (with blank first line)
3. Copy full output to clipboard
4. Update first line with clipboard status

**Failure handling**:
- Output file fails: Continue, log error
- Prepend fails: Abort (can't update user's file)
- Clipboard fails: Note in first line
- All operations independent

### Summary Format
```
[blank line for clipboard status]
=== CLADA RESULTS ===
{id} ✅ {action} {primary_param}
{id} ❌ {action} {primary_param} - {error_summary}
=== END ===
```

### Full Output Format
```
=== CLADA RESULTS ===
[same as summary]
=== OUTPUTS ===
[{id}] {action} {primary_param}:
{output content}

[{id}] {action} {primary_param}:
{output content}
=== END ===
```

### Output Display Rules
Read from unified-design.yaml per action:
- `output_display: always` - Include in OUTPUTS section
- `output_display: never` - Summary only
- `output_display: conditional` - Check return_output parameter

### Truncation
- 50KB limit per action output
- UTF-8 aware truncation
- Show first 25KB + last 25KB
- Clear truncation message

### Race Condition Acceptance
**Problem**: User edits during processing
**Solution**: Document-only. No locking or conflict resolution.
**Rationale**: Toy project, complex solutions not warranted.

### Process Lifecycle
1. **Watch** - fs.watchFile on config.filePath
2. **Detect** - mtime change triggers debounced handler
3. **Read** - Load file content
4. **Parse** - Extract SHAM blocks via parser
5. **Hash** - Compute hash of parsed actions
6. **Compare** - Skip if hash matches lastExecutedHash
7. **Execute** - Call orchestrator.execute()
8. **Format** - Generate summary and full output
9. **Write** - Output file, prepend summary, clipboard
10. **Update** - First line with clipboard status

## Error Messages

Formatted for developer clarity:
- "listener: File not found '{path}'"
- "listener: Already watching '{path}'"
- "listener: Permission denied writing output '{path}'"
- "listener: Clipboard write failed"

## Testing Strategy

- Mock file system operations
- Mock orchestrator execution
- Test debouncing with rapid changes
- Test clipboard failures
- Test concurrent listeners rejection

## Future Considerations

- Multiple file watching
- WebSocket for remote monitoring
- Configurable output formats
- Action filtering/selection
- Execution history
- Git integration for change tracking
<<<END>>>