# File Operation Test Cases

## file_replace_all_text

### 001-file-replace-all-text-no-count

```sh sham
#!SHAM [@three-char-SHA-256: pqr2]
action = "file_replace_all_text"
path = "/tmp/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_pqr2
```

```json
{
  "success": true,
  "replacements_made": 3
}
```

### 002-file-replace-all-text-count-mismatch

```sh sham
#!SHAM [@three-char-SHA-256: stu2]
action = "file_replace_all_text"
path = "/tmp/count-mismatch.txt"
old_text = "test"
new_text = "exam"
count = 3
#!END_SHAM_stu2
```

```json
{
  "success": false,
  "error": "Expected 3 replacements but found 2"
}
```