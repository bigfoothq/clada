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


### 004-write-with-special-characters

```sh sham
#!SHAM [@three-char-SHA-256: spc]
action = "file_write"
path = "/tmp/special-chars.txt"
content = "Line with \"quotes\" and 'apostrophes'"
#!END_SHAM_spc
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/special-chars.txt",
    "bytesWritten": 36
  }
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

## file_delete

### 006-delete-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: del]
action = "file_delete"
path = "/tmp/to-delete.txt"
#!END_SHAM_del
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/to-delete.txt"
  }
}
```

### 007-delete-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: dnf]
action = "file_delete"
path = "/tmp/does-not-exist.txt"
#!END_SHAM_dnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, unlink '/tmp/does-not-exist.txt'"
}
```

## file_move

### 008-move-file-simple

```sh sham
#!SHAM [@three-char-SHA-256: mvs]
action = "file_move"
old_path = "/tmp/source.txt"
new_path = "/tmp/destination.txt"
#!END_SHAM_mvs
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/source.txt",
    "new_path": "/tmp/destination.txt"
  }
}
```

### 009-move-file-to-new-directory

```sh sham
#!SHAM [@three-char-SHA-256: mvd]
action = "file_move"
old_path = "/tmp/original.txt"
new_path = "/tmp/new-dir/moved.txt"
#!END_SHAM_mvd
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/original.txt",
    "new_path": "/tmp/new-dir/moved.txt",
    "createdDirs": ["/tmp/new-dir"]
  }
}
```

### 010-move-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: mnf]
action = "file_move"
old_path = "/tmp/ghost.txt"
new_path = "/tmp/nowhere.txt"
#!END_SHAM_mnf
```

```json
{
  "success": false,
  "error": "file_move: Source file not found '/tmp/ghost.txt' (ENOENT)"
}
```

### 011-move-to-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: mef]
action = "file_move"
old_path = "/tmp/source-exists.txt"
new_path = "/tmp/dest-exists.txt"
#!END_SHAM_mef
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/source-exists.txt",
    "new_path": "/tmp/dest-exists.txt",
    "overwrote": true
  }
}
```