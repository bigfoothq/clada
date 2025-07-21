# file_replace_text Integration Tests

## file_replace_text

### 001-simple-text-replacement

```sh sham
#!SHAM [@three-char-SHA-256: rpl]
action = "file_replace_text"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
old_text = "Hello"
new_text = "Goodbye"
#!END_SHAM_rpl
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_simple-text-replacement/replace-test.txt",
    "replacements": 1
  }
}
```

### 002-replace-with-count-limit

```sh sham
#!SHAM [@three-char-SHA-256: cnt]
action = "file_replace_all_text"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
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
path = "/tmp/t_replace-text-not-found/no-match.txt"
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
path = "/tmp/t_replace-in-nonexistent-file/does-not-exist-replace.txt"
old_text = "text"
new_text = "other"
#!END_SHAM_rnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_replace-in-nonexistent-file/does-not-exist-replace.txt'"
}
```

### 005-multiline-replacement

```sh sham
#!SHAM [@three-char-SHA-256: mlr]
action = "file_replace_text"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
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
    "path": "/tmp/t_multiline-replacement/multiline-replace.txt",
    "replacements": 1
  }
}
```

### 006-empty-old-text-error

```sh sham
#!SHAM [@three-char-SHA-256: emt]
action = "file_replace_text"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
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
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
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
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_all
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_file-replace-all-text-no-count/replace-all.txt",
    "replacements": 3
  }
}
```

### 009-file-replace-all-text-count-mismatch

```sh sham
#!SHAM [@three-char-SHA-256: mis]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
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
