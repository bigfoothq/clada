# Execute Test Cases

## Single Action Success

### 001-simple-file-write

```sh nesl
#!NESL [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/001-simple-file-write/test.txt"
content = "Hello, World!"
#!END_NESL_abc
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
      "path": "/tmp/001-simple-file-write/test.txt",
      "content": "Hello, World!"
    },
    "success": true,
    "data": {
      "path": "/tmp/001-simple-file-write/test.txt",
      "bytesWritten": 13
    }
  }],
  "parseErrors": []
}
```

## Multiple Actions Mixed

### 002-mixed-implemented-unimplemented

```sh nesl
#!NESL [@three-char-SHA-256: fw1]
action = "file_write"
path = "/tmp/002-mixed-implemented-unimplemented/first.txt"
content = "First file"
#!END_NESL_fw1

#!NESL [@three-char-SHA-256: ex1]
action = "exec"
code = "echo 'hello'"
lang = "bash"
#!END_NESL_ex1

#!NESL [@three-char-SHA-256: fw2]
action = "file_write"
path = "/tmp/002-mixed-implemented-unimplemented/second.txt"
content = "Second file"
#!END_NESL_fw2
```

```json
{
  "success": true,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [{
    "seq": 1,
    "blockId": "fw1",
    "action": "file_write",
    "params": {
      "path": "/tmp/002-mixed-implemented-unimplemented/first.txt",
      "content": "First file"
    },
    "success": true,
    "data": {
      "path": "/tmp/002-mixed-implemented-unimplemented/first.txt",
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
    "success": true,
    "data": {
      "stdout": "hello\n",
      "stderr": "",
      "exit_code": 0
    }
  }, {
    "seq": 3,
    "blockId": "fw2",
    "action": "file_write",
    "params": {
      "path": "/tmp/002-mixed-implemented-unimplemented/second.txt",
      "content": "Second file"
    },
    "success": true,
    "data": {
      "path": "/tmp/002-mixed-implemented-unimplemented/second.txt",
      "bytesWritten": 11
    }
  }],
  "parseErrors": []
}
```

## Parse Errors

### 003-parse-error-with-valid-action

```sh nesl
#!NESL [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/003-parse-error-with-valid-action/bad.txt"
path = "/tmp/003-parse-error-with-valid-action/duplicate.txt"
#!END_NESL_bad

#!NESL [@three-char-SHA-256: gud]
action = "file_write"
path = "/tmp/003-parse-error-with-valid-action/good.txt"
content = "Valid content"
#!END_NESL_gud
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
      "path": "/tmp/003-parse-error-with-valid-action/good.txt",
      "content": "Valid content"
    },
    "success": true,
    "data": {
      "path": "/tmp/003-parse-error-with-valid-action/good.txt",
      "bytesWritten": 13
    }
  }],
  "parseErrors": [{
    "blockId": "bad",
    "action": "file_write",
    "errorType": "syntax",
    "message": "Duplicate key 'path' in block 'bad'",
    "blockStartLine": 1,
    "neslContent": "#!NESL [@three-char-SHA-256: bad]\naction = \"file_write\"\npath = \"/tmp/003-parse-error-with-valid-action/bad.txt\"\npath = \"/tmp/003-parse-error-with-valid-action/duplicate.txt\"\n#!END_NESL_bad"
  }]
}
```

## Execution Failures

### 004-file-operation-failure

```sh nesl
#!NESL [@three-char-SHA-256: nop]
action = "file_delete"
path = "/tmp/004-file-operation-failure/does-not-exist.txt"
#!END_NESL_nop
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
      "path": "/tmp/004-file-operation-failure/does-not-exist.txt"
    },
    "success": false,
    "error": "ENOENT: no such file or directory, unlink '/tmp/004-file-operation-failure/does-not-exist.txt'"
  }],
  "parseErrors": []
}
```

## Empty Input

### 005-no-nesl-blocks

```
This is just regular text without any NESL blocks.
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

```sh nesl
#!NESL [@three-char-SHA-256: rd1]
action = "file_write"
path = "/tmp/006-file-read-success/read-test.txt"
content = "Content to read later"
#!END_NESL_rd1

#!NESL [@three-char-SHA-256: rd2]
action = "file_read"
path = "/tmp/006-file-read-success/read-test.txt"
#!END_NESL_rd2
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
      "path": "/tmp/006-file-read-success/read-test.txt",
      "content": "Content to read later"
    },
    "success": true,
    "data": {
      "path": "/tmp/006-file-read-success/read-test.txt",
      "bytesWritten": 21
    }
  }, {
    "seq": 2,
    "blockId": "rd2",
    "action": "file_read",
    "params": {
      "path": "/tmp/006-file-read-success/read-test.txt"
    },
    "success": true,
    "data": {
      "path": "/tmp/006-file-read-success/read-test.txt",
      "content": "Content to read later"
    }
  }],
  "parseErrors": []
}
```

### 007-file-move-success

```sh nesl
#!NESL [@three-char-SHA-256: mv1]
action = "file_write"
path = "/tmp/007-file-move-success/source-file.txt"
content = "File to be moved"
#!END_NESL_mv1

#!NESL [@three-char-SHA-256: mv2]
action = "file_move"
old_path = "/tmp/007-file-move-success/source-file.txt"
new_path = "/tmp/007-file-move-success/destination-file.txt"
#!END_NESL_mv2
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
      "path": "/tmp/007-file-move-success/source-file.txt",
      "content": "File to be moved"
    },
    "success": true,
    "data": {
      "path": "/tmp/007-file-move-success/source-file.txt",
      "bytesWritten": 16
    }
  }, {
    "seq": 2,
    "blockId": "mv2",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/007-file-move-success/source-file.txt",
      "new_path": "/tmp/007-file-move-success/destination-file.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/007-file-move-success/source-file.txt",
      "new_path": "/tmp/007-file-move-success/destination-file.txt"
    }
  }],
  "parseErrors": []
}
```

### 008-file-replace-text-single

```sh nesl
#!NESL [@three-char-SHA-256: rp1]
action = "file_write"
path = "/tmp/008-file-replace-text-single/replace-single.txt"
content = "Hello world! This is a test."
#!END_NESL_rp1

#!NESL [@three-char-SHA-256: rp2]
action = "file_replace_text"
path = "/tmp/008-file-replace-text-single/replace-single.txt"
old_text = "world"
new_text = "universe"
#!END_NESL_rp2
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
      "path": "/tmp/008-file-replace-text-single/replace-single.txt",
      "content": "Hello world! This is a test."
    },
    "success": true,
    "data": {
      "path": "/tmp/008-file-replace-text-single/replace-single.txt",
      "bytesWritten": 28
    }
  }, {
    "seq": 2,
    "blockId": "rp2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/008-file-replace-text-single/replace-single.txt",
      "old_text": "world",
      "new_text": "universe"
    },
    "success": true,
    "data": {
      "path": "/tmp/008-file-replace-text-single/replace-single.txt",
      "replacements": 1
    }
  }],
  "parseErrors": []
}
```

### 009-file-replace-all-text

```sh nesl
#!NESL [@three-char-SHA-256: ra1]
action = "file_write"
path = "/tmp/009-file-replace-all-text/replace-all.txt"
content = "foo bar foo baz foo"
#!END_NESL_ra1

#!NESL [@three-char-SHA-256: ra2]
action = "file_replace_all_text"
path = "/tmp/009-file-replace-all-text/replace-all.txt"
old_text = "foo"
new_text = "qux"
#!END_NESL_ra2
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
      "path": "/tmp/009-file-replace-all-text/replace-all.txt",
      "content": "foo bar foo baz foo"
    },
    "success": true,
    "data": {
      "path": "/tmp/009-file-replace-all-text/replace-all.txt",
      "bytesWritten": 19
    }
  }, {
    "seq": 2,
    "blockId": "ra2",
    "action": "file_replace_all_text",
    "params": {
      "path": "/tmp/009-file-replace-all-text/replace-all.txt",
      "old_text": "foo",
      "new_text": "qux"
    },
    "success": true,
    "data": {
      "path": "/tmp/009-file-replace-all-text/replace-all.txt",
      "replacements": 3
    }
  }],
  "parseErrors": []
}
```

### 010-multiline-content-handling

```sh nesl
#!NESL [@three-char-SHA-256: ml1]
action = "file_write"
path = "/tmp/010-multiline-content-handling/multiline.txt"
content = <<'EOT_NESL_ml1'
Line one
Line two
Line three
EOT_NESL_ml1
#!END_NESL_ml1

#!NESL [@three-char-SHA-256: ml2]
action = "file_replace_text"
path = "/tmp/010-multiline-content-handling/multiline.txt"
old_text = <<'EOT_NESL_ml2'
Line two
EOT_NESL_ml2
new_text = <<'EOT_NESL_ml2'
Line TWO (modified)
EOT_NESL_ml2
#!END_NESL_ml2
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
      "path": "/tmp/010-multiline-content-handling/multiline.txt",
      "content": "Line one\nLine two\nLine three"
    },
    "success": true,
    "data": {
      "path": "/tmp/010-multiline-content-handling/multiline.txt",
      "bytesWritten": 28
    }
  }, {
    "seq": 2,
    "blockId": "ml2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/010-multiline-content-handling/multiline.txt",
      "old_text": "Line two",
      "new_text": "Line TWO (modified)"
    },
    "success": true,
    "data": {
      "path": "/tmp/010-multiline-content-handling/multiline.txt",
      "replacements": 1
    }
  }],
  "parseErrors": []
}
```

### 011-file-replace-text-multiple-occurrences-failure

```sh nesl
#!NESL [@three-char-SHA-256: rf1]
action = "file_write"
path = "/tmp/011-file-replace-text-multiple-occurrences-failure/multiple-foo.txt"
content = "foo bar foo baz"
#!END_NESL_rf1

#!NESL [@three-char-SHA-256: rf2]
action = "file_replace_text"
path = "/tmp/011-file-replace-text-multiple-occurrences-failure/multiple-foo.txt"
old_text = "foo"
new_text = "qux"
#!END_NESL_rf2
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
      "path": "/tmp/011-file-replace-text-multiple-occurrences-failure/multiple-foo.txt",
      "content": "foo bar foo baz"
    },
    "success": true,
    "data": {
      "path": "/tmp/011-file-replace-text-multiple-occurrences-failure/multiple-foo.txt",
      "bytesWritten": 15
    }
  }, {
    "seq": 2,
    "blockId": "rf2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/011-file-replace-text-multiple-occurrences-failure/multiple-foo.txt",
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

```sh nesl
#!NESL [@three-char-SHA-256: rc1]
action = "file_write"
path = "/tmp/012-file-replace-all-text-with-count/count-test.txt"
content = "test test test"
#!END_NESL_rc1

#!NESL [@three-char-SHA-256: rc2]
action = "file_replace_all_text"
path = "/tmp/012-file-replace-all-text-with-count/count-test.txt"
old_text = "test"
new_text = "check"
count = "2"
#!END_NESL_rc2
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
      "path": "/tmp/012-file-replace-all-text-with-count/count-test.txt",
      "content": "test test test"
    },
    "success": true,
    "data": {
      "path": "/tmp/012-file-replace-all-text-with-count/count-test.txt",
      "bytesWritten": 14
    }
  }, {
    "seq": 2,
    "blockId": "rc2",
    "action": "file_replace_all_text",
    "params": {
      "path": "/tmp/012-file-replace-all-text-with-count/count-test.txt",
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

```sh nesl
#!NESL [@three-char-SHA-256: ow1]
action = "file_write"
path = "/tmp/013-file-move-overwrite-existing/move-source.txt"
content = "source content"
#!END_NESL_ow1

#!NESL [@three-char-SHA-256: ow2]
action = "file_write"
path = "/tmp/013-file-move-overwrite-existing/move-dest.txt"
content = "will be overwritten"
#!END_NESL_ow2

#!NESL [@three-char-SHA-256: ow3]
action = "file_move"
old_path = "/tmp/013-file-move-overwrite-existing/move-source.txt"
new_path = "/tmp/013-file-move-overwrite-existing/move-dest.txt"
#!END_NESL_ow3
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
      "path": "/tmp/013-file-move-overwrite-existing/move-source.txt",
      "content": "source content"
    },
    "success": true,
    "data": {
      "path": "/tmp/013-file-move-overwrite-existing/move-source.txt",
      "bytesWritten": 14
    }
  }, {
    "seq": 2,
    "blockId": "ow2",
    "action": "file_write",
    "params": {
      "path": "/tmp/013-file-move-overwrite-existing/move-dest.txt",
      "content": "will be overwritten"
    },
    "success": true,
    "data": {
      "path": "/tmp/013-file-move-overwrite-existing/move-dest.txt",
      "bytesWritten": 19
    }
  }, {
    "seq": 3,
    "blockId": "ow3",
    "action": "file_move",
    "params": {
      "old_path": "/tmp/013-file-move-overwrite-existing/move-source.txt",
      "new_path": "/tmp/013-file-move-overwrite-existing/move-dest.txt"
    },
    "success": true,
    "data": {
      "old_path": "/tmp/013-file-move-overwrite-existing/move-source.txt",
      "new_path": "/tmp/013-file-move-overwrite-existing/move-dest.txt",
      "overwrote": true
    }
  }],
  "parseErrors": []
}
```

### 014-empty-old-text-validation

```sh nesl
#!NESL [@three-char-SHA-256: et1]
action = "file_write"
path = "/tmp/014-empty-old-text-validation/empty-replace.txt"
content = "some content"
#!END_NESL_et1

#!NESL [@three-char-SHA-256: et2]
action = "file_replace_text"
path = "/tmp/014-empty-old-text-validation/empty-replace.txt"
old_text = ""
new_text = "replacement"
#!END_NESL_et2

#!NESL [@three-char-SHA-256: et3]
action = "file_replace_all_text"
path = "/tmp/014-empty-old-text-validation/empty-replace.txt"
old_text = ""
new_text = "replacement"
#!END_NESL_et3
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
      "path": "/tmp/014-empty-old-text-validation/empty-replace.txt",
      "content": "some content"
    },
    "success": true,
    "data": {
      "path": "/tmp/014-empty-old-text-validation/empty-replace.txt",
      "bytesWritten": 12
    }
  }, {
    "seq": 2,
    "blockId": "et2",
    "action": "file_replace_text",
    "params": {
      "path": "/tmp/014-empty-old-text-validation/empty-replace.txt",
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
      "path": "/tmp/014-empty-old-text-validation/empty-replace.txt",
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

```sh nesl
#!NESL [@three-char-SHA-256: rnx]
action = "file_read"
path = "/tmp/015-file-read-nonexistent/does-not-exist-read.txt"
#!END_NESL_rnx
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
      "path": "/tmp/015-file-read-nonexistent/does-not-exist-read.txt"
    },
    "success": false,
    "error": "ENOENT: no such file or directory, open '/tmp/015-file-read-nonexistent/does-not-exist-read.txt'"
  }],
  "parseErrors": []
}
```

### 016-file-move-creates-parent-dirs

```sh nesl
#!NESL [@three-char-SHA-256: pd1]
action = "file_write"
path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
content = "moving to new dir"
#!END_NESL_pd1

#!NESL [@three-char-SHA-256: pd2]
action = "file_move"
old_path = "/tmp/016-file-move-creates-parent-dirs/parent-test.txt"
new_path = "/tmp/016-file-move-creates-parent-dirs/new/deeply/nested/moved-file.txt"
#!END_NESL_pd2
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

```sh nesl
#!NESL [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/017-files-read-multiple/first.txt"
content = "First file content"
#!END_NESL_fr1

#!NESL [@three-char-SHA-256: fr2]
action = "file_write"
path = "/tmp/017-files-read-multiple/second.txt"
content = "Second file content"
#!END_NESL_fr2

#!NESL [@three-char-SHA-256: fr3]
action = "files_read"
paths = <<'EOT_NESL_fr3'
/tmp/017-files-read-multiple/first.txt
/tmp/017-files-read-multiple/second.txt
EOT_NESL_fr3
#!END_NESL_fr3
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
      "content": [
        "First file content",
        "Second file content"
      ]
    }
  }],
  "parseErrors": []
}
```

### 018-files-read-with-missing

```sh nesl
#!NESL [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/018-files-read-with-missing/exists.txt"
content = "This file exists"
#!END_NESL_fm1

#!NESL [@three-char-SHA-256: fm2]
action = "files_read"
paths = <<'EOT_NESL_fm2'
/tmp/018-files-read-with-missing/exists.txt
/tmp/018-files-read-with-missing/missing.txt
EOT_NESL_fm2
#!END_NESL_fm2
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
