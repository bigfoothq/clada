# File Operations Integration Tests

**Status**: [PLANNED] - Preliminary test format, subject to change

## file_create

### 001-simple-file-create

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_create"
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
action = "file_create"
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

### 003-file-already-exists

```sh sham
#!SHAM [@three-char-SHA-256: dup]
action = "file_create"
path = "/tmp/existing.txt"
content = "This file already exists"
#!END_SHAM_dup
```

```json
{
  "success": false,
  "error": "EEXIST: file already exists, open '/tmp/existing.txt'"
}
```

### 004-permission-denied

```sh sham
#!SHAM [@three-char-SHA-256: prm]
action = "file_create"
path = "/root/forbidden.txt"
content = "Cannot write here"
#!END_SHAM_prm
```

```json
{
  "success": false,
  "error": "EACCES: permission denied, open '/root/forbidden.txt'"
}
```

### 005-multiline-content

```sh sham
#!SHAM [@three-char-SHA-256: mlt]
action = "file_create"
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
    "bytesWritten": 21
  }
}
```