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
    "bytesWritten": 26
  }
}
```


### 003-write-with-special-characters

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

### 004-multiline-content

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

### 001-delete-existing-file

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

### 002-delete-nonexistent-file

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

## file_replace_text

### 001-simple-text-replacement

```sh sham
#!SHAM [@three-char-SHA-256: rpl]
action = "file_replace_text"
path = "/tmp/replace-test.txt"
old_text = "Hello"
new_text = "Goodbye"
#!END_SHAM_rpl
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/replace-test.txt",
    "replacements": 1
  }
}
```

### 002-replace-with-count-limit

```sh sham
#!SHAM [@three-char-SHA-256: cnt]
action = "file_replace_all_text"
path = "/tmp/multi-replace.txt"
old_text = "foo"
new_text = "bar"
count = "2"
#!END_SHAM_cnt
```

```json
{
  "success": false,
  "error": "file_replace_all_text: expected 2 occurrences but found 4"
}
```

### 003-replace-text-not-found

```sh sham
#!SHAM [@three-char-SHA-256: nfr]
action = "file_replace_text"
path = "/tmp/no-match.txt"
old_text = "nonexistent"
new_text = "replacement"
#!END_SHAM_nfr
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text not found in file"
}
```

### 004-replace-in-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: rnf]
action = "file_replace_text"
path = "/tmp/does-not-exist-replace.txt"
old_text = "text"
new_text = "other"
#!END_SHAM_rnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/does-not-exist-replace.txt'"
}
```

### 005-multiline-replacement

```sh sham
#!SHAM [@three-char-SHA-256: mlr]
action = "file_replace_text"
path = "/tmp/multiline-replace.txt"
old_text = <<'EOT_SHAM_mlr'
export function oldName() {
  console.log('oldName');
  return oldName;
}
EOT_SHAM_mlr
new_text = <<'EOT_SHAM_mlr'
export function newName() {
  console.log('newName');
  return newName;
}
EOT_SHAM_mlr
#!END_SHAM_mlr
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/multiline-replace.txt",
    "replacements": 1
  }
}
```

### 006-empty-old-text-error

```sh sham
#!SHAM [@three-char-SHA-256: emt]
action = "file_replace_text"
path = "/tmp/empty-search.txt"
old_text = ""
new_text = "something"
#!END_SHAM_emt
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text cannot be empty"
}
```

### 007-file-replace-text-multiple-occurrences

```sh sham
#!SHAM [@three-char-SHA-256: mul]
action = "file_replace_text"
path = "/tmp/multiple-occurrences.txt"
old_text = "duplicate"
new_text = "unique"
#!END_SHAM_mul
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text appears 3 times, must appear exactly once"
}
```

### 008-file-replace-all-text-no-count

```sh sham
#!SHAM [@three-char-SHA-256: all]
action = "file_replace_all_text"
path = "/tmp/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_all
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/replace-all.txt",
    "replacements": 3
  }
}
```

### 009-file-replace-all-text-count-mismatch

```sh sham
#!SHAM [@three-char-SHA-256: mis]
action = "file_replace_all_text"
path = "/tmp/count-mismatch.txt"
old_text = "test"
new_text = "check"
count = "5"
#!END_SHAM_mis
```

```json
{
  "success": false,
  "error": "file_replace_all_text: expected 5 occurrences but found 2"
}
```

## file_read

### 001-read-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: rdf]
action = "file_read"
path = "/tmp/readable.txt"
#!END_SHAM_rdf
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/readable.txt",
    "content": "This is readable content"
  }
}
```

### 002-read-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: rnx]
action = "file_read"
path = "/tmp/not-there.txt"
#!END_SHAM_rnx
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/not-there.txt'"
}
```

## file_move

### 001-move-file-simple

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

### 002-move-file-to-new-directory

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
    "new_path": "/tmp/new-dir/moved.txt"
  }
}
```

### 003-move-nonexistent-file

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

### 004-move-to-existing-file

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