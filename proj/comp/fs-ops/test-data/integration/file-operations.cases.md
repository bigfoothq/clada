# File Operations Integration Tests

**Status**: [PLANNED] - Preliminary test format, subject to change

## file_write

### 001-simple-file-create

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
  "data": {
    "path": "/tmp/test.txt",
    "bytesWritten": 13
  }
}
```

### 002-create-with-parent-dirs

```sh sham
#!SHAM [@three-char-SHA-256: pdr]
action = "file_write"
path = "/tmp/deeply/nested/dir/file.txt"
content = "Creates parent directories"
#!END_SHAM_pdr
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/deeply/nested/dir/file.txt",
    "bytesWritten": 26,
    "createdDirs": [
      "/tmp/deeply",
      "/tmp/deeply/nested", 
      "/tmp/deeply/nested/dir"
    ]
  }
}
```


### 004-permission-denied

```sh sham
#!SHAM [@three-char-SHA-256: prm]
action = "file_write"
path = "/root/forbidden.txt"
content = "Cannot write here"
#!END_SHAM_prm
```

```json
{
  "success": false,
  "error": "EROFS: EROFS: read-only file system, mkdir '/root'"
}
```

### 005-multiline-content

```sh sham
#!SHAM [@three-char-SHA-256: mlt]
action = "file_write"
path = "/tmp/multiline.txt"
content = <<'EOT_SHAM_mlt'
Line 1
Line 2
Line 3
EOT_SHAM_mlt
#!END_SHAM_mlt
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/multiline.txt",
    "bytesWritten": 20
  }
}
```