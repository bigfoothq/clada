# Tests

## general

### 001-single-valid-file-create-action

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_create"
path = "/tmp/test.txt"
content = <<'EOT_SHAM_abc'
Hello world!
EOT_SHAM_abc
#!END_SHAM_abc
````

```json
{
  "actions": [{
    "action": "file_create",
    "parameters": {
      "path": "/tmp/test.txt",
      "content": "Hello world!"
    },
    "metadata": {
      "blockId": "abc",
      "startLine": 2,
      "endLine": 8
    }
  }],
  "errors": [],
  "summary": {
    "totalBlocks": 1,
    "successCount": 1,
    "errorCount": 0
  }
}
```

---

### 002-multiple-blocks-with-one-invalid

```sh sham
#!SHAM [@three-char-SHA-256: gd1]
action = "file_create"
path = "/tmp/good.txt"
content = "valid"
#!END_SHAM_gd1

#!SHAM [@three-char-SHA-256: bad]
action = "unknown_action"
path = "/tmp/bad.txt"
#!END_SHAM_bad
```

```json
{
  "actions": [{
    "action": "file_create",
    "parameters": {
      "path": "/tmp/good.txt",
      "content": "valid"
    },
    "metadata": {
      "blockId": "gd1",
      "startLine": 2,
      "endLine": 6
    }
  }],
  "errors": [{
    "blockId": "bad",
    "errorType": "validation",
    "message": "Unknown action: unknown_action",
    "line": 8,
    "shamContent": "#!SHAM [@three-char-SHA-256: bad]\naction = \"unknown_action\"\npath = \"/tmp/bad.txt\"\n#!END_SHAM_bad"
  }],
  "summary": {
    "totalBlocks": 2,
    "successCount": 1,
    "errorCount": 1
  }
}
```

---

### 003-missing-required-parameter

```sh sham
#!SHAM [@three-char-SHA-256: miss]
action = "file_create"
content = "missing path"
#!END_SHAM_miss
```

```json
{
  "actions": [],
  "errors": [{
    "blockId": "miss",
    "errorType": "validation",
    "message": "Missing required parameter: path",
    "line": 2,
    "shamContent": "#!SHAM [@three-char-SHA-256: miss]\naction = \"file_create\"\ncontent = \"missing path\"\n#!END_SHAM_miss"
  }],
  "summary": {
    "totalBlocks": 1,
    "successCount": 0,
    "errorCount": 1
  }
}
```

---

### 004-type-conversion-with-boolean-and-integer

```sh sham
#!SHAM [@three-char-SHA-256: typ]
action = "exec"
code = "print('hi')"
lang = "python"
cwd = "/tmp"
#!END_SHAM_typ
```

```json
{
  "actions": [{
    "action": "exec",
    "parameters": {
      "code": "print('hi')",
      "lang": "python",
      "cwd": "/tmp"
    },
    "metadata": {
      "blockId": "typ",
      "startLine": 2,
      "endLine": 7
    }
  }],
  "errors": [],
  "summary": {
    "totalBlocks": 1,
    "successCount": 1,
    "errorCount": 0
  }
}
```
