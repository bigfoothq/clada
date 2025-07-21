# file_read Integration Tests

## file_read

### 001-read-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: rdf]
action = "file_read"
path = "/tmp/t_read-existing-file/readable.txt"
#!END_SHAM_rdf
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-existing-file/readable.txt",
    "content": "This is readable content"
  }
}
```

### 002-read-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: rnx]
action = "file_read"
path = "/tmp/t_read-nonexistent-file/not-there.txt"
#!END_SHAM_rnx
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_read-nonexistent-file/not-there.txt'"
}
```
