# file_move Integration Tests

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