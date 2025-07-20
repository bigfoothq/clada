# fs-ops Design & Implementation Notes

**Status**: TEMPORARY - Implementation planning document

## Pseudocode for executeFileOperation

```javascript
async function executeFileOperation(action: CladaAction): Promise<FileOpResult> {
  try {
    // Get handler for action type
    const handler = actionHandlers[action.action];
    
    if (!handler) {
      return {
        success: false,
        error: `Unknown action: ${action.action}`
      };
    }
    
    // Call handler with action
    return await handler(action);
    
  } catch (error) {
    // This should never happen - handlers should catch their own errors
    return {
      success: false,
      error: `Unexpected error in executeFileOperation: ${error.message}`
    };
  }
}

// Individual handlers extract params and call internal functions
async function handleFileCreate(action: CladaAction): Promise<FileOpResult> {
  const { path, content } = action.parameters;
  
  try {
    // Check if file already exists
    const exists = await fileExists(path);
    if (exists) {
      return {
        success: false,
        error: `EEXIST: file already exists, open '${path}'`
      };
    }
    
    // Create parent directories if needed
    const parentDir = dirname(path);
    const createdDirs = await ensureDirectoryExists(parentDir);
    
    // Write file
    const bytesWritten = await writeFileInternal(path, content);
    
    const result: FileOpResult = {
      success: true,
      data: {
        path,
        bytesWritten
      }
    };
    
    if (createdDirs.length > 0) {
      result.data.createdDirs = createdDirs;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      error: formatNodeError(error, path, 'file_create')
    };
  }
}
```

## Extracted Pure Functions Needed

### Core File Operations
- `writeFileInternal(path: string, content: string): Promise<number>` - Returns bytes written
- `fileExists(path: string): Promise<boolean>` - Check if file exists
- `ensureDirectoryExists(path: string): Promise<string[]>` - Creates dirs, returns created paths
- `formatNodeError(error: any, path: string, operation: string): string` - Format Node errors consistently ✅

### Path Utilities (Pure)
- `getParentDirectory(path: string): string` - Extract parent dir from path ✅
- `normalizePath(path: string): string` - Normalize path separators
- `getCreatedDirectories(targetPath: string, existingPaths: Set<string>): string[]` - Determine which dirs were created

### Content Utilities (Pure)
- `getByteLength(content: string): number` - Calculate UTF-8 byte length ✅
- `replaceText(content: string, oldText: string, newText: string, count?: number): {result: string, replacements: number}` - Replace text occurrences ✅

### Directory Listing (Pure)
- `formatDirEntry(name: string, stats: Stats): DirEntry` - Format stat info into our type

## Implementation Progress

### Completed Pure Functions
1. ✅ `getParentDirectory` - Path extraction
2. ✅ `getByteLength` - UTF-8 byte counting
3. ✅ `replaceText` - Text replacement with count
4. ✅ `formatNodeError` - Error message formatting

## Implementation Order

1. **Path utilities** (pure functions, easy to test)
2. **Content utilities** (pure functions)
3. **Core file operations** (async, need mocking for tests)
4. **Action handlers** (integrate everything)

## Error Handling Strategy

- All internal functions throw native errors
- Handlers catch and format errors into FileOpResult
- Preserve original error codes (ENOENT, EACCES, etc.)
- Add context about what operation was attempted

## Test Data Structure Ideas

For pure functions:
```json
{
  "cases": [
    {
      "name": "extract parent from simple path",
      "input": ["/tmp/test.txt"],
      "expected": "/tmp"
    }
  ]
}
```

For async functions (need to mock fs):
```json
{
  "cases": [
    {
      "name": "file exists returns true",
      "input": ["/tmp/exists.txt"],
      "mockFs": {
        "/tmp/exists.txt": "content"
      },
      "expected": true
    }
  ]
}
```

## Notes

- Integration tests show we need to handle:
  - Creating parent directories automatically
  - Proper error messages matching Node.js format
  - Byte counting for content
  - Permission errors