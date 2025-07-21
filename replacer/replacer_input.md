=== PROCESSED: 2025-07-21 00:48:25 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/test-data/execute/basic-operations.md
===

Looking at the current test coverage and implemented tools, here are additional test cases for `/Users/stuart/repos/clada/proj/test-data/execute/basic-operations.md`:

<<<EXPLANATION>>>
Add comprehensive test coverage for all implemented file operations including file_read, file_move, file_replace_text, and file_replace_all_text
<<<FILE>>>
/Users/stuart/repos/clada/proj/test-data/execute/basic-operations.md
<<<SEARCH>>>
## Empty Input

### 005-no-sham-blocks

```
This is just regular text without any SHAM blocks.
```

```json
{
  "success": true,
  "totalBlocks": 0,
  "executedActions": 0,
  "results": [],
  "parseErrors": []
}
```
<<<REPLACE>>>
## Empty Input

### 005-no-sham-blocks

```
This is just regular text without any SHAM blocks.
```

```json
{
  "success": true,
  "totalBlocks": 0,
  "executedActions": 0,
  "results": [],
  "parseErrors": []
}
```

## File Operations

### 006-file-read-success

```sh sham
#!SHAM [@three-char-SHA-256: rd1]
action = "file_write"
path = "/tmp/read-test.txt"
content = "Content to read later"
#!END_SHAM_rd1

#!SHAM [@three-char-SHA-256: rd2]
action = "file_read"
path = "/tmp/read-test.txt"
#!END_SHAM_rd2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "rd1",
    "action": "file_write",
    "params": {
      "path": "/tmp/read-test.txt",
      "content": "Content to read later"
    },
    "success": true,
    "data": {
      "path": "/tmp/read-test.txt",
      "bytesWritten": 21
    }
  }, {
    "seq": 2,
    "blockId": "rd2",
    "action": "file_read",
    "params": {
      "path": "/tmp/read-test.txt"
    },
    "success": true,
    "data": {
      "path": "/tmp/read-test.txt",
      "content": "Content to read later"
    }
  }],
  "parseErrors": []
}
```

### 007-file-move-success

```sh sham
#!SHAM [@three-char-SHA-256: mv1]
action = "file_write"
path = "/tmp/source-file.txt"
content = "File to be moved"
#!END_SHAM_mv1

#!SHAM [@three-char-SHA-256: mv2]
action = "file_move"
old_path = "/tmp/source-file.txt"
new_path = "/tmp/destination-file.txt"
#!END_SHAM_mv2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "mv1",
    "action": "file_write",
    "params": {
      "path": "/tmp/source-file.txt",
      "content": "File to be moved"
    },
    "success": true,
    "data": {
      "path": "/tmp/source-file.txt",
      "bytesWritten": 16
    }
  }, {
    "seq": 2,
    "blockId": "mv2",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/source-file.txt",
      "new_path": "/tmp/destination-file.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/source-file.txt",
      "new_path": "/tmp/destination-file.txt"
    }
  }],
  "parseErrors": []
}
```

### 008-file-replace-text-single

```sh sham
#!SHAM [@three-char-SHA-256: rp1]
action = "file_write"
path = "/tmp/replace-single.txt"
content = "Hello world! This is a test."
#!END_SHAM_rp1

#!SHAM [@three-char-SHA-256: rp2]
action = "file_replace_text"
path = "/tmp/replace-single.txt"
old_text = "world"
new_text = "universe"
#!END_SHAM_rp2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "rp1",
    "action": "file_write",
    "params": {
      "path": "/tmp/replace-single.txt",
      "content": "Hello world! This is a test."
    },
    "success": true,
    "data": {
      "path": "/tmp/replace-single.txt",
      "bytesWritten": 28
    }
  }, {
    "seq": 2,
    "blockId": "rp2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/replace-single.txt",
      "old_text": "world",
      "new_text": "universe"
    },
    "success": true,
    "data": {
      "path": "/tmp/replace-single.txt",
      "replacements": 1
    }
  }],
  "parseErrors": []
}
```

### 009-file-replace-all-text

```sh sham
#!SHAM [@three-char-SHA-256: ra1]
action = "file_write"
path = "/tmp/replace-all.txt"
content = "foo bar foo baz foo"
#!END_SHAM_ra1

#!SHAM [@three-char-SHA-256: ra2]
action = "file_replace_all_text"
path = "/tmp/replace-all.txt"
old_text = "foo"
new_text = "qux"
#!END_SHAM_ra2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "ra1",
    "action": "file_write",
    "params": {
      "path": "/tmp/replace-all.txt",
      "content": "foo bar foo baz foo"
    },
    "success": true,
    "data": {
      "path": "/tmp/replace-all.txt",
      "bytesWritten": 19
    }
  }, {
    "seq": 2,
    "blockId": "ra2",
    "action": "file_replace_all_text",
    "params": {
      "path": "/tmp/replace-all.txt",
      "old_text": "foo",
      "new_text": "qux"
    },
    "success": true,
    "data": {
      "path": "/tmp/replace-all.txt",
      "replacements": 3
    }
  }],
  "parseErrors": []
}
```

### 010-multiline-content-handling

```sh sham
#!SHAM [@three-char-SHA-256: ml1]
action = "file_write"
path = "/tmp/multiline.txt"
content = <<'EOT_SHAM_ml1'
Line one
Line two
Line three
EOT_SHAM_ml1
#!END_SHAM_ml1

#!SHAM [@three-char-SHA-256: ml2]
action = "file_replace_text"
path = "/tmp/multiline.txt"
old_text = <<'EOT_SHAM_ml2'
Line two
EOT_SHAM_ml2
new_text = <<'EOT_SHAM_ml2'
Line TWO (modified)
EOT_SHAM_ml2
#!END_SHAM_ml2
```

```json
{
  "success": true,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "ml1",
    "action": "file_write",
    "params": {
      "path": "/tmp/multiline.txt",
      "content": "Line one\nLine two\nLine three"
    },
    "success": true,
    "data": {
      "path": "/tmp/multiline.txt",
      "bytesWritten": 28
    }
  }, {
    "seq": 2,
    "blockId": "ml2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/multiline.txt",
      "old_text": "Line two",
      "new_text": "Line TWO (modified)"
    },
    "success": true,
    "data": {
      "path": "/tmp/multiline.txt",
      "replacements": 1
    }
  }],
  "parseErrors": []
}
```

### 011-unimplemented-directory-operations

```sh sham
#!SHAM [@three-char-SHA-256: dr1]
action = "dir_create"
path = "/tmp/new-directory"
#!END_SHAM_dr1

#!SHAM [@three-char-SHA-256: ls1]
action = "ls"
path = "/tmp"
#!END_SHAM_ls1
```

```json
{
  "success": false,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "dr1",
    "action": "dir_create",
    "params": {
      "path": "/tmp/new-directory"
    },
    "success": false,
    "error": "Not implemented"
  }, {
    "seq": 2,
    "blockId": "ls1",
    "action": "ls",
    "params": {
      "path": "/tmp"
    },
    "success": false,
    "error": "Not implemented"
  }],
  "parseErrors": []
}
```
<<<END>>>

These test cases provide coverage for:
- File read operations (successful read after write)
- File move operations 
- Single text replacement with file_replace_text
- Multiple text replacements with file_replace_all_text
- Multiline content handling with heredocs
- Unimplemented directory operations showing proper error handling

Note: The test cleanup paths in `execute.test.ts` will need updating to include the new test files created by these cases.