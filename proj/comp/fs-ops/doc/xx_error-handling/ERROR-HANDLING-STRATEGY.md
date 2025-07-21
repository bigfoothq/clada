# fs-ops Error Handling Strategy

## Goals
1. **LLM-readable errors** - Clear, actionable messages that help the LLM understand what went wrong
2. **Consistent format** - Predictable structure across all operations
3. **Context preservation** - Include enough information to debug without re-querying

## Error Message Format

### Base Format
```
{operation}: {what_failed}, {context}
```

### Enhanced Format for Ambiguous Errors
When ENOENT could mean multiple things, we add clarification:

```javascript
// For file_move when destination directory doesn't exist:
"file_move: Cannot create parent directory '/tmp/new-dir' (ENOENT)"

// For file_move when source doesn't exist:
"file_move: Source file not found '/tmp/ghost.txt' (ENOENT)"

// For permission errors:
"file_write: Permission denied writing to '/etc/passwd' (EACCES)"
```

## Implementation Strategy

### 1. Error Enhancement Functions

```typescript
function enhanceFileNotFoundError(
  operation: string,
  error: NodeError,
  context: { source?: string; destination?: string; path?: string }
): string {
  // Check if it's a destination directory issue
  if (operation === 'file_move' && context.destination) {
    const destDir = dirname(context.destination);
    if (!await fileExists(destDir)) {
      return `${operation}: Cannot create parent directory '${destDir}' (ENOENT)`;
    }
  }
  
  // Default format matching Node.js style
  return formatNodeError(error, context.path || context.source, operation);
}
```

### 2. Operation-Specific Error Handlers

Each operation should have custom error handling that provides the most useful context:

```typescript
async function handleFileMove(action: CladaAction): Promise<FileOpResult> {
  const { old_path, new_path } = action.parameters;
  
  try {
    // Pre-check source exists for better error
    if (!await fileExists(old_path)) {
      return {
        success: false,
        error: `file_move: Source file not found '${old_path}' (ENOENT)`
      };
    }
    
    // Pre-create destination directory
    const destDir = getParentDirectory(new_path);
    const createdDirs = await ensureDirectoryExists(destDir);
    
    // Check if we're overwriting
    const overwrote = await fileExists(new_path);
    
    // Perform the move
    await rename(old_path, new_path);
    
    const result: FileOpResult = {
      success: true,
      data: {
        old_path,
        new_path
      }
    };
    
    if (createdDirs.length > 0) {
      result.data.createdDirs = createdDirs;
    }
    if (overwrote) {
      result.data.overwrote = true;
    }
    
    return result;
    
  } catch (error: any) {
    // This should rarely happen given our pre-checks
    return {
      success: false,
      error: formatNodeError(error, old_path, 'file_move')
    };
  }
}
```

### 3. Consistent Error Context

All errors should include:
- **Operation name** - What was attempted
- **Resource path(s)** - What files/directories were involved  
- **Error code** - Node.js error code when available
- **Actionable hint** - When we can infer the issue

## Updated Test Expectations

Based on the spike findings:

```json
// Delete non-existent file
{
  "success": false,
  "error": "ENOENT: no such file or directory, unlink '/tmp/does-not-exist.txt'"
}

// Move non-existent file (with enhancement)
{
  "success": false,
  "error": "file_move: Source file not found '/tmp/ghost.txt' (ENOENT)"
}

// Move to non-existent directory (pre-creating dirs)
{
  "success": true,
  "data": {
    "old_path": "/tmp/original.txt",
    "new_path": "/tmp/new-dir/moved.txt",
    "createdDirs": ["/tmp/new-dir"]
  }
}
```

## Benefits

1. **LLM can distinguish** between "source doesn't exist" vs "can't create destination"
2. **Predictable format** helps LLM parse and understand errors
3. **Pre-flight checks** catch common issues with clearer messages
4. **Graceful handling** of directory creation matches LLM expectations

## Next Steps

1. Update `formatNodeError` to handle more cases
2. Create operation-specific error enhancers
3. Update test expectations based on spike results
4. Document error format in API.md for consistency