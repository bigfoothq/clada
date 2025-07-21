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