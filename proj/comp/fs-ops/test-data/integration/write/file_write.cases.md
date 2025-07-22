# file_write Integration Tests

## file_write

### 001-simple-file-create

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/t_simple-file-create/test.txt"
content = "Hello, World!"
#!END_SHAM_abc
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_simple-file-create/test.txt",
    "bytesWritten": 13
  }
}
```

```
Hello, World!
```

### 002-create-with-parent-dirs

```sh sham
#!SHAM [@three-char-SHA-256: pdr]
action = "file_write"
path = "/tmp/t_create-with-parent-dirs/deeply/nested/dir/file.txt"
content = "Creates parent directories"
#!END_SHAM_pdr
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_create-with-parent-dirs/deeply/nested/dir/file.txt",
    "bytesWritten": 26
  }
}
```

```
Creates parent directories
```

### 003-write-with-special-characters

```sh sham
#!SHAM [@three-char-SHA-256: spc]
action = "file_write"
path = "/tmp/t_write-with-special-characters/special-chars.txt"
content = "Line with \"quotes\" and 'apostrophes'"
#!END_SHAM_spc
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_write-with-special-characters/special-chars.txt",
    "bytesWritten": 36
  }
}
```

```
Line with "quotes" and 'apostrophes'
```

### 004-multiline-content

```sh sham
#!SHAM [@three-char-SHA-256: mlt]
action = "file_write"
path = "/tmp/t_multiline-content/multiline.txt"
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
    "path": "/tmp/t_multiline-content/multiline.txt",
    "bytesWritten": 20
  }
}
```

```
Line 1
Line 2
Line 3
```
