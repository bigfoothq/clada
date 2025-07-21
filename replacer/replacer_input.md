=== PROCESSED: 2025-07-21 00:30:14 ===
ERROR Block 1: File path is outside repository: /Users/sbarr/repos/clada/proj/test-data/execute/basic-operations.md
===

<<<EXPLANATION>>>
The test expects a syntax error for duplicate keys, but the parser actually accepts duplicate keys and uses the last value. This makes the block valid but missing the required 'content' parameter, resulting in a validation error instead.
<<<FILE>>>
/Users/sbarr/repos/clada/proj/test-data/execute/basic-operations.md
<<<SEARCH>>>
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
<<<REPLACE>>>
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
    "errorType": "validation",
    "message": "Missing required parameter: content",
    "blockStartLine": 1,
    "shamContent": "#!SHAM [@three-char-SHA-256: bad]\naction = \"file_write\"\npath = \"/tmp/duplicate.txt\"\n#!END_SHAM_bad"
  }]
}
```
<<<END>>>