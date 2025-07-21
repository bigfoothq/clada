# File Operation Test Cases

## file_move

### 001-move-file-simple

```sh sham
#!SHAM [@three-char-SHA-256: stu]
action = "file_move"
old_path = "/tmp/source.txt"
new_path = "/tmp/destination.txt"
#!END_SHAM_stu
```

```json
{
  "success": true
}
```

### 002-move-file-to-new-directory

```sh sham
#!SHAM [@three-char-SHA-256: vwx]
action = "file_move"
old_path = "/tmp/original.txt"
new_path = "/tmp/new-dir/moved.txt"
#!END_SHAM_vwx
```

```json
{
  "success": true
}
```

### 003-move-non-existent-file

```sh sham
#!SHAM [@three-char-SHA-256: yz1]
action = "file_move"
old_path = "/tmp/ghost.txt"
new_path = "/tmp/nowhere.txt"
#!END_SHAM_yz1
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, rename '/tmp/ghost.txt' -> '/tmp/nowhere.txt'"
}
```

### 004-move-to-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: 234]
action = "file_move"
old_path = "/tmp/source-exists.txt"
new_path = "/tmp/dest-exists.txt"
#!END_SHAM_234
```

```json
{
  "success": true
}
```