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

### 011-file-replace-text-multiple-occurrences-failure

```sh sham
#!SHAM [@three-char-SHA-256: rf1]
action = "file_write"
path = "/tmp/multiple-foo.txt"
content = "foo bar foo baz"
#!END_SHAM_rf1

#!SHAM [@three-char-SHA-256: rf2]
action = "file_replace_text"
path = "/tmp/multiple-foo.txt"
old_text = "foo"
new_text = "qux"
#!END_SHAM_rf2
```

```json
{
  "success": false,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "rf1",
    "action": "file_write",
    "params": {
      "path": "/tmp/multiple-foo.txt",
      "content": "foo bar foo baz"
    },
    "success": true,
    "data": {
      "path": "/tmp/multiple-foo.txt",
      "bytesWritten": 15
    }
  }, {
    "seq": 2,
    "blockId": "rf2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/multiple-foo.txt",
      "old_text": "foo",
      "new_text": "qux"
    },
    "success": false,
    "error": "file_replace_text: old_text appears 2 times, must appear exactly once"
  }],
  "parseErrors": []
}
```

### 012-file-replace-all-text-with-count

```sh sham
#!SHAM [@three-char-SHA-256: rc1]
action = "file_write"
path = "/tmp/count-test.txt"
content = "test test test"
#!END_SHAM_rc1

#!SHAM [@three-char-SHA-256: rc2]
action = "file_replace_all_text"
path = "/tmp/count-test.txt"
old_text = "test"
new_text = "check"
count = "2"
#!END_SHAM_rc2
```

```json
{
  "success": false,
  "totalBlocks": 2,
  "executedActions": 2,
  "results": [{
    "seq": 1,
    "blockId": "rc1",
    "action": "file_write",
    "params": {
      "path": "/tmp/count-test.txt",
      "content": "test test test"
    },
    "success": true,
    "data": {
      "path": "/tmp/count-test.txt",
      "bytesWritten": 14
    }
  }, {
    "seq": 2,
    "blockId": "rc2",
    "action": "file_replace_all_text",
    "params": {
      "path": "/tmp/count-test.txt",
      "old_text": "test",
      "new_text": "check",
      "count": 2
    },
    "success": false,
    "error": "file_replace_all_text: expected 2 occurrences but found 3"
  }],
  "parseErrors": []
}
```

### 013-file-move-overwrite-existing

```sh sham
#!SHAM [@three-char-SHA-256: ow1]
action = "file_write"
path = "/tmp/move-source.txt"
content = "source content"
#!END_SHAM_ow1

#!SHAM [@three-char-SHA-256: ow2]
action = "file_write"
path = "/tmp/move-dest.txt"
content = "will be overwritten"
#!END_SHAM_ow2

#!SHAM [@three-char-SHA-256: ow3]
action = "file_move"
old_path = "/tmp/move-source.txt"
new_path = "/tmp/move-dest.txt"
#!END_SHAM_ow3
```

```json
{
  "success": true,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [{
    "seq": 1,
    "blockId": "ow1",
    "action": "file_write",
    "params": {
      "path": "/tmp/move-source.txt",
      "content": "source content"
    },
    "success": true,
    "data": {
      "path": "/tmp/move-source.txt",
      "bytesWritten": 14
    }
  }, {
    "seq": 2,
    "blockId": "ow2",
    "action": "file_write",
    "params": {
      "path": "/tmp/move-dest.txt",
      "content": "will be overwritten"
    },
    "success": true,
    "data": {
      "path": "/tmp/move-dest.txt",
      "bytesWritten": 19
    }
  }, {
    "seq": 3,
    "blockId": "ow3",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/move-source.txt",
      "new_path": "/tmp/move-dest.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/move-source.txt",
      "new_path": "/tmp/move-dest.txt",
      "overwrote": true
    }
  }],
  "parseErrors": []
}
```

### 014-empty-old-text-validation

```sh sham
#!SHAM [@three-char-SHA-256: et1]
action = "file_write"
path = "/tmp/empty-replace.txt"
content = "some content"
#!END_SHAM_et1

#!SHAM [@three-char-SHA-256: et2]
action = "file_replace_text"
path = "/tmp/empty-replace.txt"
old_text = ""
new_text = "replacement"
#!END_SHAM_et2

#!SHAM [@three-char-SHA-256: et3]
action = "file_replace_all_text"
path = "/tmp/empty-replace.txt"
old_text = ""
new_text = "replacement"
#!END_SHAM_et3
```

```json
{
  "success": false,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [{
    "seq": 1,
    "blockId": "et1",
    "action": "file_write",
    "params": {
      "path": "/tmp/empty-replace.txt",
      "content": "some content"
    },
    "success": true,
    "data": {
      "path": "/tmp/empty-replace.txt",
      "bytesWritten": 12
    }
  }, {
    "seq": 2,
    "blockId": "et2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/empty-replace.txt",
      "old_text": "",
      "new_text": "replacement"
    },
    "success": false,
    "error": "file_replace_text: old_text cannot be empty"
  }, {
    "seq": 3,
    "blockId": "et3",
    "action": "file_replace_all_text",
    "params": {
      "path": "/tmp/empty-replace.txt",
      "old_text": "",
      "new_text": "replacement"
    },
    "success": false,
    "error": "file_replace_all_text: old_text cannot be empty"
  }],
  "parseErrors": []
}
```

### 015-file-read-nonexistent

```sh sham
#!SHAM [@three-char-SHA-256: rnx]
action = "file_read"
path = "/tmp/does-not-exist-read.txt"
#!END_SHAM_rnx
```

```json
{
  "success": false,
  "totalBlocks": 1,
  "executedActions": 1,
  "results": [{
    "seq": 1,
    "blockId": "rnx",
    "action": "file_read",
    "params": {
      "path": "/tmp/does-not-exist-read.txt"
    },
    "success": false,
    "error": "ENOENT: no such file or directory, open '/tmp/does-not-exist-read.txt'"
  }],
  "parseErrors": []
}
```

### 016-file-move-creates-parent-dirs

```sh sham
#!SHAM [@three-char-SHA-256: pd1]
action = "file_write"
path = "/tmp/parent-test.txt"
content = "moving to new dir"
#!END_SHAM_pd1

#!SHAM [@three-char-SHA-256: pd2]
action = "file_move"
old_path = "/tmp/parent-test.txt"
new_path = "/tmp/new/deeply/nested/moved-file.txt"
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
      "path": "/tmp/parent-test.txt",
      "content": "moving to new dir"
    },
    "success": true,
    "data": {
      "path": "/tmp/parent-test.txt",
      "bytesWritten": 17
    }
  }, {
    "seq": 2,
    "blockId": "pd2",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/parent-test.txt",
      "new_path": "/tmp/new/deeply/nested/moved-file.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/parent-test.txt",
      "new_path": "/tmp/new/deeply/nested/moved-file.txt"
    }
  }],
  "parseErrors": []
}
```

### 017-unimplemented-directory-operations

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
    "error": "Action not implemented: ls"
  }],
  "parseErrors": []
}
```