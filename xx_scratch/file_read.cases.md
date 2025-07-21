# File Operation Test Cases

## file_read

### 001-read-existing-file

```sh sham
#!SHAM [@three-char-SHA-256: vwx2]
action = "file_read"
path = "/tmp/readable.txt"
#!END_SHAM_vwx2
```

```json
{
  "success": true,
  "content": "This is readable content"
}
```

### 002-read-non-existent-file

```sh sham
#!SHAM [@three-char-SHA-256: yz12]
action = "file_read"
path = "/tmp/not-there.txt"
#!END_SHAM_yz12
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/not-there.txt'"
}
```