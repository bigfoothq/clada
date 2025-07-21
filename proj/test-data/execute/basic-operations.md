# Execute Test Cases

## Single Action Success

### 001-simple-file-write

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/test.txt"
content = "Hello, World!"
#!END_SHAM_abc
```

```json
{
  "success": true,
  "totalBlocks": 1,
  "executedActions": 1,
  "results": [{
    "seq": 1,
    "blockId": "abc",
    "action": "file_write",
    "params": {
      "path": "/tmp/test.txt",
      "content": "Hello, World!"
    },
    "success": true,
    "data": {
      "path": "/tmp/test.txt",
      "bytesWritten": 13
    }
  }],
  "parseErrors": []
}
```

## Multiple Actions Mixed

### 002-mixed-implemented-unimplemented

```sh sham
#!SHAM [@three-char-SHA-256: fw1]
action = "file_write"
path = "/tmp/first.txt"
content = "First file"
#!END_SHAM_fw1

#!SHAM [@three-char-SHA-256: ex1]
action = "exec"
code = "echo 'hello'"
lang = "bash"
#!END_SHAM_ex1

#!SHAM [@three-char-SHA-256: fw2]
action = "file_write"
path = "/tmp/second.txt"
content = "Second file"
#!END_SHAM_fw2
```

```json
{
  "success": false,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [{
    "seq": 1,
    "blockId": "fw1",
    "action": "file_write",
    "params": {
      "path": "/tmp/first.txt",
      "content": "First file"
    },
    "success": true,
    "data": {
      "path": "/tmp/first.txt",
      "bytesWritten": 10
    }
  }, {
    "seq": 2,
    "blockId": "ex1",
    "action": "exec",
    "params": {
      "code": "echo 'hello'",
      "lang": "bash"
    },
    "success": false,
    "error": "Action not implemented: exec"
  }, {
    "seq": 3,
    "blockId": "fw2",
    "action": "file_write",
    "params": {
      "path": "/tmp/second.txt",
      "content": "Second file"
    },
    "success": true,
    "data": {
      "path": "/tmp/second.txt",
      "bytesWritten": 11
    }
  }],
  "parseErrors": []
}
```

## Parse Errors

### 003-parse-error-with-valid-action

```sh sham
#!SHAM [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/bad.txt"
path = "/tmp/duplicate.txt"
#!END_SHAM_bad

#!SHAM [@three-char-SHA-256: gud]
action = "file_write"
path = "/tmp/good.txt"
content = "Valid content"
#!END_SHAM_gud
```

```json
{
  "success": false,
  "totalBlocks": 2,
  "executedActions": 1,
  "results": [{
    "seq": 1,
    "blockId": "gud",
    "action": "file_write",
    "params": {
      "path": "/tmp/good.txt",
      "content": "Valid content"
    },
    "success": true,
    "data": {
      "path": "/tmp/good.txt",
      "bytesWritten": 13
    }
  }],
  "parseErrors": [{
    "blockId": "bad",
    "action": "file_write",
    "errorType": "syntax",
    "message": "Duplicate key 'path' in block 'bad'",
    "blockStartLine": 1,
    "shamContent": "#!SHAM [@three-char-SHA-256: bad]\naction = \"file_write\"\npath = \"/tmp/bad.txt\"\npath = \"/tmp/duplicate.txt\"\n#!END_SHAM_bad"
  }]
}
```

## Execution Failures

### 004-file-operation-failure

```sh sham
#!SHAM [@three-char-SHA-256: nop]
action = "file_delete"
path = "/tmp/does-not-exist.txt"
#!END_SHAM_nop
```

```json
{
  "success": false,
  "totalBlocks": 1,
  "executedActions": 1,
  "results": [{
    "seq": 1,
    "blockId": "nop",
    "action": "file_delete",
    "params": {
      "path": "/tmp/does-not-exist.txt"
    },
    "success": false,
    "error": "ENOENT: no such file or directory, unlink '/tmp/does-not-exist.txt'"
  }],
  "parseErrors": []
}
```

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