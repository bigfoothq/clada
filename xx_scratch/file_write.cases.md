# File Operation Test Cases

## file_write

### 001-create-simple-file

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/test.txt"
content = "Hello World"
#!END_SHAM_abc
```

```json
{
  "success": true
}
```

### 002-create-file-in-new-directory

```sh sham
#!SHAM [@three-char-SHA-256: def]
action = "file_write"
path = "/tmp/deeply/nested/dir/file.txt"
content = "Content in nested directory"
#!END_SHAM_def
```

```json
{
  "success": true
}
```

### 003-overwrite-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: ghi]
action = "file_write"
path = "/tmp/existing.txt"
content = "New content"
#!END_SHAM_ghi
```

```json
{
  "success": true
}
```

### 004-write-multiline-content

```sh sham
#!SHAM [@three-char-SHA-256: jkl]
action = "file_write"
path = "/tmp/multiline.txt"
content = <<'EOT_SHAM_jkl'
Line 1
Line 2
Line 3
EOT_SHAM_jkl
#!END_SHAM_jkl
```

```json
{
  "success": true
}
```

### 005-write-content-with-special-characters

```sh sham
#!SHAM [@three-char-SHA-256: spc]
action = "file_write"
path = "/tmp/special-chars.txt"
content = <<'EOT_SHAM_spc'
Special chars: "quotes" 'single' \backslash
$dollar @at #hash
EOT_SHAM_spc
#!END_SHAM_spc
```

```json
{
  "success": true
}
```