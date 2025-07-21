# file_delete Integration Tests

## file_delete

### 001-delete-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: del]
action = "file_delete"
path = "/tmp/t_delete-existing-file/to-delete.txt"
#!END_SHAM_del
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_delete-existing-file/to-delete.txt"
  }
}
```

### 002-delete-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: dnf]
action = "file_delete"
path = "/tmp/t_delete-nonexistent-file/does-not-exist.txt"
#!END_SHAM_dnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, unlink '/tmp/t_delete-nonexistent-file/does-not-exist.txt'"
}
```
