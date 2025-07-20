# Component: fs-ops

## Component Type
standard

## Documentation Debt
- [ ] Integration test format is preliminary [PLANNED]
- [ ] Error handling strategy needs refinement
- [ ] Consider batching operations for efficiency

## Dependencies

```yaml
dependencies:
  node:fs/promises:
    functions: [writeFile, readFile, unlink, mkdir, rmdir, readdir, stat]
    
  node:path:
    functions: [dirname, resolve, join]
    
  node:util:
    functions: [promisify]
    
  node:child_process:
    functions: [exec]  # for grep functionality
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

### editFile
- **Signature**: `editFile(path: string, oldText: string, newText: string, count?: number) -> Promise<number>`
- **Purpose**: Replace text occurrences in file, returns replacement count

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
  'file_create': createFile,
  'file_write': writeFile,
  'file_edit': editFile,
  'file_delete': deleteFile,
  'file_move': moveFile,
  'file_read': readFileContent,
  'dir_create': createDirectory,
  'dir_delete': deleteDirectory,
  'ls': listDirectory,
  'grep': searchFiles,
  'glob': globFiles
}
```