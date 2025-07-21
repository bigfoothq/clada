# File Operation Test Cases

## file_replace_text

### 001-simple-text-replacement

```sh sham
#!SHAM [@three-char-SHA-256: 567]
action = "file_replace_text"
path = "/tmp/replace-test.txt"
old_text = "Hello"
new_text = "Hi"
#!END_SHAM_567
```

```json
{
  "success": true,
  "replacements_made": 1
}
```

### 002-replace-with-count-limit

```sh sham
#!SHAM [@three-char-SHA-256: 890]
action = "file_replace_text"
path = "/tmp/multi-replace.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_890
```

```json
{
  "success": true,
  "replacements_made": 1
}
```

### 003-replace-text-not-found

```sh sham
#!SHAM [@three-char-SHA-256: abc2]
action = "file_replace_text"
path = "/tmp/no-match.txt"
old_text = "xyz"
new_text = "abc"
#!END_SHAM_abc2
```

```json
{
  "success": false,
  "error": "Text not found: \"xyz\""
}
```

### 004-replace-file-not-found

```sh sham
#!SHAM [@three-char-SHA-256: def2]
action = "file_replace_text"
path = "/tmp/does-not-exist-replace.txt"
old_text = "old"
new_text = "new"
#!END_SHAM_def2
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/does-not-exist-replace.txt'"
}
```

### 005-multiline-replacement

```sh sham
#!SHAM [@three-char-SHA-256: ghi2]
action = "file_replace_text"
path = "/tmp/multiline-replace.txt"
old_text = <<'EOT_SHAM_ghi2'
export function oldName() {
  console.log('oldName');
  return oldName;
}
EOT_SHAM_ghi2
new_text = <<'EOT_SHAM_ghi2'
export function newName() {
  console.log('newName');
  return newName;
}
EOT_SHAM_ghi2
#!END_SHAM_ghi2
```

```json
{
  "success": true,
  "replacements_made": 1
}
```

### 006-empty-old-text-error

```sh sham
#!SHAM [@three-char-SHA-256: jkl2]
action = "file_replace_text"
path = "/tmp/empty-search.txt"
old_text = ""
new_text = "something"
#!END_SHAM_jkl2
```

```json
{
  "success": false,
  "error": "old_text cannot be empty"
}
```

### 007-file-replace-text-multiple-occurrences

```sh sham
#!SHAM [@three-char-SHA-256: mno2]
action = "file_replace_text"
path = "/tmp/multiple-occurrences.txt"
old_text = "duplicate"
new_text = "unique"
#!END_SHAM_mno2
```

```json
{
  "success": false,
  "error": "Text found 3 times, but expected exactly 1 occurrence"
}
```