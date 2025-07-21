# Component: fs-ops

## Component Type
standard

## Documentation Debt
- [ ] Integration test format is preliminary [IMPLEMENTED]
- [ ] Error handling strategy needs refinement
- [ ] Consider batching operations for efficiency

## Dependencies

```yaml
dependencies:
  node:fs/promises:
    functions: [writeFile, unlink, mkdir, rename, stat]
    # Note: removed unused - readFile, rmdir, readdir (not yet implemented)
    
  node:path:
    functions: [dirname]
    # Note: removed unused - resolve, join (not yet needed)
    
  # Removed node:util - not used
  # Removed node:child_process - grep not yet implemented
```

## Exports

```yaml
exports:
  functions: [executeFileOperation]
  types: [FileOpResult, FileOpError]
```

### executeFileOperation
- **Signature**: `executeFileOperation(action: CladaAction) -> Promise<FileOpResult>`
- **Purpose**: Execute file system operations from parsed SHAM actions
- **Throws**: Never - all errors captured in FileOpResult
- **Test-data**: `test-data/integration/file-operations.md` [PLANNED]

### FileOpResult (type)
```typescript
interface FileOpResult {
  success: boolean
  data?: any           // Operation-specific return data
  error?: string       // Error message if failed
}
```

### FileOpError (type)
```typescript
interface FileOpError extends Error {
  code: string         // e.g., 'ENOENT', 'EACCES'
  path?: string        // File path involved
  operation: string    // Which operation failed
}
```

## Internal Functions

### createFile
- **Signature**: `createFile(path: string, content: string) -> Promise<void>`
- **Purpose**: Create new file with content, creating parent directories as needed

### writeFile  
- **Signature**: `writeFile(path: string, content: string) -> Promise<void>`
- **Purpose**: Overwrite existing file content

### replaceText
- **Signature**: `replaceText(content: string, oldText: string, newText: string, count?: number) -> {result: string, replacements: number}`
- **Purpose**: Pure function to replace text occurrences in string content

### deleteFile
- **Signature**: `deleteFile(path: string) -> Promise<void>`
- **Purpose**: Remove file

### moveFile
- **Signature**: `moveFile(oldPath: string, newPath: string) -> Promise<void>`
- **Purpose**: Move or rename file

### readFileContent
- **Signature**: `readFileContent(path: string) -> Promise<string>`
- **Purpose**: Read file content as UTF-8 string

### createDirectory
- **Signature**: `createDirectory(path: string) -> Promise<void>`
- **Purpose**: Create directory, including parent directories

### deleteDirectory
- **Signature**: `deleteDirectory(path: string) -> Promise<void>`
- **Purpose**: Remove directory (must be empty)

### listDirectory
- **Signature**: `listDirectory(path: string) -> Promise<DirEntry[]>`
- **Purpose**: List directory contents with metadata

### searchFiles
- **Signature**: `searchFiles(pattern: string, path: string, include?: string) -> Promise<GrepResult[]>`
- **Purpose**: Search for pattern in files (grep-like)

### globFiles
- **Signature**: `globFiles(pattern: string, basePath: string) -> Promise<string[]>`
- **Purpose**: Find files matching glob pattern

## Action Mapping

```typescript
const actionHandlers = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'dir_create': createDirectory,
  'dir_delete': deleteDirectory,
  'ls': listDirectory,
  'grep': searchFiles,
  'glob': globFiles
}
```