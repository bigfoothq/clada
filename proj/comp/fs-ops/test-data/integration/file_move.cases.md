# file_move Integration Tests

## file_move

### 001-move-file-simple

```sh sham
#!SHAM [@three-char-SHA-256: cr1]
action = "file_write"
path = "/tmp/t_move-file-simple/source.txt"
content = "Content to be moved"
#!END_SHAM_cr1
```

```sh sham
#!SHAM [@three-char-SHA-256: mvs]
action = "file_move"
old_path = "/tmp/t_move-file-simple/source.txt"
new_path = "/tmp/t_move-file-simple/destination.txt"
#!END_SHAM_mvs
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/t_move-file-simple/source.txt",
    "new_path": "/tmp/t_move-file-simple/destination.txt"
  }
}
```

### 002-move-file-to-new-directory

```sh sham
#!SHAM [@three-char-SHA-256: cr2]
action = "file_write"
path = "/tmp/t_move-file-to-new-directory/original.txt"
content = "File to move to new directory"
#!END_SHAM_cr2
```

```sh sham
#!SHAM [@three-char-SHA-256: mvd]
action = "file_move"
old_path = "/tmp/t_move-file-to-new-directory/original.txt"
new_path = "/tmp/t_move-file-to-new-directory/new-dir/moved.txt"
#!END_SHAM_mvd
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/t_move-file-to-new-directory/original.txt",
    "new_path": "/tmp/t_move-file-to-new-directory/new-dir/moved.txt"
  }
}
```

### 003-move-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: mnf]
action = "file_move"
old_path = "/tmp/t_move-nonexistent-file/ghost.txt"
new_path = "/tmp/t_move-nonexistent-file/nowhere.txt"
#!END_SHAM_mnf
```

```json
{
  "success": false,
  "error": "file_move: Source file not found '/tmp/t_move-nonexistent-file/ghost.txt' (ENOENT)"
}
```

### 004-move-to-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: cr4a]
action = "file_write"
path = "/tmp/t_move-to-existing-file/source-exists.txt"
content = "Source file content"
#!END_SHAM_cr4a
```

```sh sham
#!SHAM [@three-char-SHA-256: cr4b]
action = "file_write"
path = "/tmp/t_move-to-existing-file/dest-exists.txt"
content = "Destination file to be overwritten"
#!END_SHAM_cr4b
```

```sh sham
#!SHAM [@three-char-SHA-256: mef]
action = "file_move"
old_path = "/tmp/t_move-to-existing-file/source-exists.txt"
new_path = "/tmp/t_move-to-existing-file/dest-exists.txt"
#!END_SHAM_mef
```

```json
{
  "success": true,
  "data": {
    "old_path": "/tmp/t_move-to-existing-file/source-exists.txt",
    "new_path": "/tmp/t_move-to-existing-file/dest-exists.txt",
    "overwrote": true
  }
}
```