=== PROCESSED: 2025-07-21 11:54:48 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts
SUCCESS Block 3: Created /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/files-read.cases.md
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/test-data/execute/basic-operations.md
SUCCESS Block 5: Updated /Users/stuart/repos/clada/proj/test/execute.test.ts
SUCCESS Block 6: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
SUCCESS Block 7: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
SUCCESS Block 8: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
===

Looking at this task, I need to implement a new `files_read` action that reads multiple files and concatenates them with clear delimiters. Let me analyze the requirements and existing code patterns.

## Key Observations:

1. **New Action**: `files_read` (note: it's `files_read` not `file_read` - plural)
2. **Input Format**: Multi-line string with one absolute path per line
3. **Output Format**: Concatenated content with headers like `=== /path/to/file.txt ===`
4. **Error Handling**: Should handle missing files gracefully

## Current State Analysis:

Looking at the existing code:
- `file_read` already exists for single file reading
- The action handlers are in `fs-ops/src/index.ts`
- Error formatting is handled by `formatNodeError`
- The unified-design.yaml shows this should be `files_read` (plural)

## Implementation Approach:

1. **Parse the multi-line paths parameter** - Split by newlines, trim, filter empty lines
2. **Read each file** - Collect successes and errors
3. **Format output** - Use the `=== /path/to/file.txt ===` delimiter format
4. **Error handling** - If any file fails, return error with details about which files failed

## Design Decisions:

1. **Partial Success**: Should we fail entirely if one file is missing, or return what we can read? Looking at the schema, it returns either content OR error, suggesting all-or-nothing behavior.

2. **Delimiter Format**: The example shows `=== /path/to/file.txt ===` which matches the format used in the test data files provided.

3. **Empty Lines**: The spec says "Empty lines are ignored" so we need to filter those out.

Let me implement this following the existing patterns in the codebase.

<<<EXPLANATION>>>
Adding the new files_read handler to support reading multiple files at once. This handler will parse the multi-line paths parameter, read each file, and concatenate them with clear delimiters.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts

<<<SEARCH>>>
/**
 * Handle file_read action - reads file content
 */
async function handleFileRead(action: CladaAction): Promise<FileOpResult> {
  const { path } = action.parameters;
  
  try {
    const content = await readFile(path, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        content
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
<<<REPLACE>>>
/**
 * Handle file_read action - reads file content
 */
async function handleFileRead(action: CladaAction): Promise<FileOpResult> {
  const { path } = action.parameters;
  
  try {
    const content = await readFile(path, 'utf8');
    
    return {
      success: true,
      data: {
        path,
        content
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}

/**
 * Handle files_read action - reads multiple files and concatenates with delimiters
 * Parses multi-line paths parameter, one absolute path per line
 * Returns concatenated content with === /path/to/file === delimiters
 */
async function handleFilesRead(action: CladaAction): Promise<FileOpResult> {
  const { paths } = action.parameters;
  
  // Parse the multi-line paths string
  const pathList = paths
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);  // Remove empty lines
  
  if (pathList.length === 0) {
    return {
      success: false,
      error: 'files_read: No paths provided'
    };
  }
  
  // Read all files, collecting content and errors
  const results: Array<{ path: string; content?: string; error?: string }> = [];
  
  for (const filePath of pathList) {
    try {
      const content = await readFile(filePath, 'utf8');
      results.push({ path: filePath, content });
    } catch (error: any) {
      // Collect error for this file
      const errorMsg = formatNodeError(error, filePath, 'open');
      results.push({ path: filePath, error: errorMsg });
    }
  }
  
  // Check if any files failed to read
  const failedFiles = results.filter(r => r.error);
  if (failedFiles.length > 0) {
    // Return error listing all failed files
    const errorDetails = failedFiles
      .map(f => `  ${f.path}: ${f.error}`)
      .join('\n');
    return {
      success: false,
      error: `files_read: Failed to read ${failedFiles.length} file(s):\n${errorDetails}`
    };
  }
  
  // All files read successfully - concatenate with delimiters
  const concatenated = results
    .map(r => {
      const header = `=== ${r.path} ===`;
      return `${header}\n${r.content}`;
    })
    .join('\n\n');
  
  return {
    success: true,
    data: {
      paths: pathList,
      content: concatenated
    }
  };
}
<<<END>>>

<<<EXPLANATION>>>
Adding the files_read action to the action handlers mapping so it can be executed when called.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts

<<<SEARCH>>>
// Action handler mapping
const actionHandlers: Record<string, (action: CladaAction) => Promise<FileOpResult>> = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'dir_create': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'dir_delete': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'ls': async (action) => {
    return { success: false, error: 'Action not implemented: ls' };
  },
  'grep': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'glob': async (action) => {
    return { success: false, error: 'Not implemented' };
  }
};
<<<REPLACE>>>
// Action handler mapping
const actionHandlers: Record<string, (action: CladaAction) => Promise<FileOpResult>> = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'files_read': handleFilesRead,
  'dir_create': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'dir_delete': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'ls': async (action) => {
    return { success: false, error: 'Action not implemented: ls' };
  },
  'grep': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'glob': async (action) => {
    return { success: false, error: 'Not implemented' };
  }
};
<<<END>>>

Now let's create test cases for the new `files_read` action:

<<<EXPLANATION>>>
Creating test cases for the files_read action to ensure it works correctly with multiple files, handles errors appropriately, and formats output as expected.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/files-read.cases.md

<<<OVERWRITE>>>
# Files Read Integration Tests

**Status**: [IMPLEMENTED] - Test cases for files_read action

## files_read

### 001-read-multiple-files

```sh sham
#!SHAM [@three-char-SHA-256: rm1]
action = "file_write"
path = "/tmp/files-read-test/file1.txt"
content = "Content of file 1"
#!END_SHAM_rm1

#!SHAM [@three-char-SHA-256: rm2]
action = "file_write"
path = "/tmp/files-read-test/file2.txt"
content = "Content of file 2"
#!END_SHAM_rm2

#!SHAM [@three-char-SHA-256: rm3]
action = "file_write"
path = "/tmp/files-read-test/subdir/file3.txt"
content = "Content of file 3 in subdirectory"
#!END_SHAM_rm3

#!SHAM [@three-char-SHA-256: rm4]
action = "files_read"
paths = <<'EOT_SHAM_rm4'
/tmp/files-read-test/file1.txt
/tmp/files-read-test/file2.txt
/tmp/files-read-test/subdir/file3.txt
EOT_SHAM_rm4
#!END_SHAM_rm4
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-test/file1.txt",
      "/tmp/files-read-test/file2.txt",
      "/tmp/files-read-test/subdir/file3.txt"
    ],
    "content": "=== /tmp/files-read-test/file1.txt ===\nContent of file 1\n\n=== /tmp/files-read-test/file2.txt ===\nContent of file 2\n\n=== /tmp/files-read-test/subdir/file3.txt ===\nContent of file 3 in subdirectory"
  }
}
```

### 002-read-with-empty-lines

```sh sham
#!SHAM [@three-char-SHA-256: el1]
action = "file_write"
path = "/tmp/files-read-empty-lines/first.txt"
content = "First file"
#!END_SHAM_el1

#!SHAM [@three-char-SHA-256: el2]
action = "file_write"
path = "/tmp/files-read-empty-lines/second.txt"
content = "Second file"
#!END_SHAM_el2

#!SHAM [@three-char-SHA-256: el3]
action = "files_read"
paths = <<'EOT_SHAM_el3'
/tmp/files-read-empty-lines/first.txt

/tmp/files-read-empty-lines/second.txt

EOT_SHAM_el3
#!END_SHAM_el3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-empty-lines/first.txt",
      "/tmp/files-read-empty-lines/second.txt"
    ],
    "content": "=== /tmp/files-read-empty-lines/first.txt ===\nFirst file\n\n=== /tmp/files-read-empty-lines/second.txt ===\nSecond file"
  }
}
```

### 003-read-with-missing-file

```sh sham
#!SHAM [@three-char-SHA-256: mf1]
action = "file_write"
path = "/tmp/files-read-missing/exists.txt"
content = "This file exists"
#!END_SHAM_mf1

#!SHAM [@three-char-SHA-256: mf2]
action = "files_read"
paths = <<'EOT_SHAM_mf2'
/tmp/files-read-missing/exists.txt
/tmp/files-read-missing/does-not-exist.txt
/tmp/files-read-missing/also-missing.txt
EOT_SHAM_mf2
#!END_SHAM_mf2
```

```json
{
  "success": false,
  "error": "files_read: Failed to read 2 file(s):\n  /tmp/files-read-missing/does-not-exist.txt: ENOENT: no such file or directory, open '/tmp/files-read-missing/does-not-exist.txt'\n  /tmp/files-read-missing/also-missing.txt: ENOENT: no such file or directory, open '/tmp/files-read-missing/also-missing.txt'"
}
```

### 004-read-empty-paths

```sh sham
#!SHAM [@three-char-SHA-256: ep1]
action = "files_read"
paths = <<'EOT_SHAM_ep1'


EOT_SHAM_ep1
#!END_SHAM_ep1
```

```json
{
  "success": false,
  "error": "files_read: No paths provided"
}
```

### 005-read-single-file

```sh sham
#!SHAM [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/files-read-single/only.txt"
content = "Only file content"
#!END_SHAM_sf1

#!SHAM [@three-char-SHA-256: sf2]
action = "files_read"
paths = "/tmp/files-read-single/only.txt"
#!END_SHAM_sf2
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-single/only.txt"
    ],
    "content": "=== /tmp/files-read-single/only.txt ===\nOnly file content"
  }
}
```

### 006-read-files-with-special-content

```sh sham
#!SHAM [@three-char-SHA-256: sc1]
action = "file_write"
path = "/tmp/files-read-special/quotes.txt"
content = "File with \"quotes\" and 'apostrophes'"
#!END_SHAM_sc1

#!SHAM [@three-char-SHA-256: sc2]
action = "file_write"
path = "/tmp/files-read-special/multiline.txt"
content = <<'EOT_SHAM_sc2'
Line 1
Line 2
Line 3
EOT_SHAM_sc2
#!END_SHAM_sc2

#!SHAM [@three-char-SHA-256: sc3]
action = "files_read"
paths = <<'EOT_SHAM_sc3'
/tmp/files-read-special/quotes.txt
/tmp/files-read-special/multiline.txt
EOT_SHAM_sc3
#!END_SHAM_sc3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-special/quotes.txt",
      "/tmp/files-read-special/multiline.txt"
    ],
    "content": "=== /tmp/files-read-special/quotes.txt ===\nFile with \"quotes\" and 'apostrophes'\n\n=== /tmp/files-read-special/multiline.txt ===\nLine 1\nLine 2\nLine 3"
  }
}
```
<<<END>>>

Now let's add test cases to the main execute test to ensure files_read works in the full pipeline:

<<<EXPLANATION>>>
Adding test cases for files_read to the execute test suite to ensure it works correctly through the full SHAM parsing and execution pipeline.

<<<FILE>>>
/Users/stuart/repos/clada/proj/test-data/execute/basic-operations.md

<<<SEARCH>>>
### 016-file-move-creates-parent-dirs

```sh sham
#!SHAM [@three-char-SHA-256: pd1]
action = "file_write"
path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
content = "moving to new dir"
#!END_SHAM_pd1

#!SHAM [@three-char-SHA-256: pd2]
action = "file_move"
old_path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
new_path = "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
#!END_SHAM_pd2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "pd1",
    "action": "file_write",
    "params": {
      "path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "content": "moving to new dir"
    },
    "success": true,
    "data": {
      "path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "bytesWritten": 17
    }
  }, {
    "seq": 2,
    "blockId": "pd2",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "new_path": "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "new_path": "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
    }
  }],
  "parseErrors": []
}
```
<<<REPLACE>>>
### 016-file-move-creates-parent-dirs

```sh sham
#!SHAM [@three-char-SHA-256: pd1]
action = "file_write"
path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
content = "moving to new dir"
#!END_SHAM_pd1

#!SHAM [@three-char-SHA-256: pd2]
action = "file_move"
old_path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
new_path = "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
#!END_SHAM_pd2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "pd1",
    "action": "file_write",
    "params": {
      "path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "content": "moving to new dir"
    },
    "success": true,
    "data": {
      "path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "bytesWritten": 17
    }
  }, {
    "seq": 2,
    "blockId": "pd2",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "new_path": "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/016-file-move-creates-parent-dirs/parent-test.txt",
      "new_path": "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
    }
  }],
  "parseErrors": []
}
```

### 017-files-read-multiple

```sh sham
#!SHAM [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/017-files-read-multiple/first.txt"
content = "First file content"
#!END_SHAM_fr1

#!SHAM [@three-char-SHA-256: fr2]
action = "file_write"
path = "/tmp/017-files-read-multiple/second.txt"
content = "Second file content"
#!END_SHAM_fr2

#!SHAM [@three-char-SHA-256: fr3]
action = "files_read"
paths = <<'EOT_SHAM_fr3'
/tmp/017-files-read-multiple/first.txt
/tmp/017-files-read-multiple/second.txt
EOT_SHAM_fr3
#!END_SHAM_fr3
```

```json
{
  "success": true,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [{
    "seq": 1,
    "blockId": "fr1",
    "action": "file_write",
    "params": {
      "path": "/tmp/017-files-read-multiple/first.txt",
      "content": "First file content"
    },
    "success": true,
    "data": {
      "path": "/tmp/017-files-read-multiple/first.txt",
      "bytesWritten": 18
    }
  }, {
    "seq": 2,
    "blockId": "fr2",
    "action": "file_write",
    "params": {
      "path": "/tmp/017-files-read-multiple/second.txt",
      "content": "Second file content"
    },
    "success": true,
    "data": {
      "path": "/tmp/017-files-read-multiple/second.txt",
      "bytesWritten": 19
    }
  }, {
    "seq": 3,
    "blockId": "fr3",
    "action": "files_read",
    "params": {
      "paths": "/tmp/017-files-read-multiple/first.txt\n/tmp/017-files-read-multiple/second.txt"
    },
    "success": true,
    "data": {
      "paths": [
        "/tmp/017-files-read-multiple/first.txt",
        "/tmp/017-files-read-multiple/second.txt"
      ],
      "content": "=== /tmp/017-files-read-multiple/first.txt ===\nFirst file content\n\n=== /tmp/017-files-read-multiple/second.txt ===\nSecond file content"
    }
  }],
  "parseErrors": []
}
```

### 018-files-read-with-missing

```sh sham
#!SHAM [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/018-files-read-with-missing/exists.txt"
content = "This file exists"
#!END_SHAM_fm1

#!SHAM [@three-char-SHA-256: fm2]
action = "files_read"
paths = <<'EOT_SHAM_fm2'
/tmp/018-files-read-with-missing/exists.txt
/tmp/018-files-read-with-missing/missing.txt
EOT_SHAM_fm2
#!END_SHAM_fm2
```

```json
{
  "success": false,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "fm1",
    "action": "file_write",
    "params": {
      "path": "/tmp/018-files-read-with-missing/exists.txt",
      "content": "This file exists"
    },
    "success": true,
    "data": {
      "path": "/tmp/018-files-read-with-missing/exists.txt",
      "bytesWritten": 16
    }
  }, {
    "seq": 2,
    "blockId": "fm2",
    "action": "files_read",
    "params": {
      "paths": "/tmp/018-files-read-with-missing/exists.txt\n/tmp/018-files-read-with-missing/missing.txt"
    },
    "success": false,
    "error": "files_read: Failed to read 1 file(s):\n  /tmp/018-files-read-with-missing/missing.txt: ENOENT: no such file or directory, open '/tmp/018-files-read-with-missing/missing.txt'"
  }],
  "parseErrors": []
}
```
<<<END>>>

Now let's update the test file to include the new test directories:

<<<EXPLANATION>>>
Adding the new test directories for files_read tests to the cleanup lists in the execute test.

<<<FILE>>>
/Users/stuart/repos/clada/proj/test/execute.test.ts

<<<SEARCH>>>
const testFiles = [
  '/tmp/test.txt',
  '/tmp/first.txt',
  '/tmp/second.txt',
  '/tmp/bad.txt',
  '/tmp/duplicate.txt',
  '/tmp/good.txt',
  '/tmp/does-not-exist.txt',
  '/tmp/read-test.txt',
  '/tmp/source-file.txt',
  '/tmp/destination-file.txt',
  '/tmp/replace-single.txt',
  '/tmp/replace-all.txt',
  '/tmp/multiline.txt',
  '/tmp/multiple-foo.txt',
  '/tmp/count-test.txt',
  '/tmp/move-source.txt',
  '/tmp/move-dest.txt',
  '/tmp/empty-replace.txt',
  '/tmp/parent-test.txt'
];

const testDirs = [
  '/tmp/new',
  '/tmp/007-file-move-success',
  '/tmp/016-file-move-creates-parent-dirs'
];
<<<REPLACE>>>
const testFiles = [
  '/tmp/test.txt',
  '/tmp/first.txt',
  '/tmp/second.txt',
  '/tmp/bad.txt',
  '/tmp/duplicate.txt',
  '/tmp/good.txt',
  '/tmp/does-not-exist.txt',
  '/tmp/read-test.txt',
  '/tmp/source-file.txt',
  '/tmp/destination-file.txt',
  '/tmp/replace-single.txt',
  '/tmp/replace-all.txt',
  '/tmp/multiline.txt',
  '/tmp/multiple-foo.txt',
  '/tmp/count-test.txt',
  '/tmp/move-source.txt',
  '/tmp/move-dest.txt',
  '/tmp/empty-replace.txt',
  '/tmp/parent-test.txt'
];

const testDirs = [
  '/tmp/new',
  '/tmp/007-file-move-success',
  '/tmp/016-file-move-creates-parent-dirs',
  '/tmp/017-files-read-multiple',
  '/tmp/018-files-read-with-missing'
];
<<<END>>>

Finally, let's update the fs-ops API documentation to include the new files_read action:

<<<EXPLANATION>>>
Updating the fs-ops API documentation to reflect the implementation of files_read action.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md

<<<SEARCH>>>
## Status
[PARTIALLY IMPLEMENTED] - Only file operations implemented. Directory operations, search operations pending.
<<<REPLACE>>>
## Status
[PARTIALLY IMPLEMENTED] - File operations including files_read implemented. Directory operations, search operations pending.
<<<END>>>

<<<EXPLANATION>>>
Adding files_read to the exports section of the API documentation.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md

<<<SEARCH>>>
## Exports

```yaml
exports:
  functions: [executeFileOperation]
  types: [FileOpResult]
  classes:
    FileOpError:
      extends: Error
```
<<<REPLACE>>>
## Exports

```yaml
exports:
  functions: [executeFileOperation]
  types: [FileOpResult]
  classes:
    FileOpError:
      extends: Error
```
<<<END>>>

<<<EXPLANATION>>>
Adding files_read to the action mapping documentation.

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md

<<<SEARCH>>>
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
<<<REPLACE>>>
## Action Mapping

```typescript
const actionHandlers = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'files_read': handleFilesRead,
  'dir_create': createDirectory,
  'dir_delete': deleteDirectory,
  'ls': listDirectory,
  'grep': searchFiles,
  'glob': globFiles
}
```
<<<END>>>

## Summary

I've successfully implemented the `files_read` action with the following features:

1. **Multi-line Path Parsing**: Splits the `paths` parameter by newlines, trims whitespace, and filters out empty lines
2. **Batch Reading**: Attempts to read all specified files
3. **Error Handling**: If any file fails to read, returns a detailed error listing all failed files
4. **Output Formatting**: Concatenates successful reads with the specified delimiter format `=== /path/to/file ===`
5. **Test Coverage**: Added comprehensive test cases covering:
   - Multiple file reads
   - Empty lines in paths
   - Missing files
   - Empty paths input
   - Single file read
   - Special content (quotes, multiline)

The implementation follows the existing patterns in the codebase and maintains consistency with the error handling approach used by other file operations.