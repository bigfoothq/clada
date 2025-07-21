# File Operation Test Cases

## file_delete

### 001-delete-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: mno]
action = "file_delete"
path = "/tmp/to-delete.txt"
#!END_SHAM_mno
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/to-delete.txt"
  }
}
```

### 002-delete-non-existent-file

```sh sham
#!SHAM [@three-char-SHA-256: pqr]
action = "file_delete"
path = "/tmp/does-not-exist.txt"
#!END_SHAM_pqr
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, unlink '/tmp/does-not-exist.txt'"
}
```