# files_read Integration Tests

## files_read

### 001-read-multiple-files

```sh sham
#!SHAM [@three-char-SHA-256: rm1]
action = "file_write"
path = "/tmp/files-read-test/file1.txt"
content = "Content of file 1"
#!END_SHAM_rm1

#!SHAM [@three-char-SHA-256: rm2]
action = "file_write"
path = "/tmp/files-read-test/file2.txt"
content = "Content of file 2"
#!END_SHAM_rm2

#!SHAM [@three-char-SHA-256: rm3]
action = "file_write"
path = "/tmp/files-read-test/subdir/file3.txt"
content = "Content of file 3 in subdirectory"
#!END_SHAM_rm3

#!SHAM [@three-char-SHA-256: rm4]
action = "files_read"
paths = <<'EOT_SHAM_rm4'
/tmp/files-read-test/file1.txt
/tmp/files-read-test/file2.txt
/tmp/files-read-test/subdir/file3.txt
EOT_SHAM_rm4
#!END_SHAM_rm4
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-test/file1.txt",
      "/tmp/files-read-test/file2.txt",
      "/tmp/files-read-test/subdir/file3.txt"
    ],
    "content": "=== /tmp/files-read-test/file1.txt ===\nContent of file 1\n\n=== /tmp/files-read-test/file2.txt ===\nContent of file 2\n\n=== /tmp/files-read-test/subdir/file3.txt ===\nContent of file 3 in subdirectory"
  }
}
```

### 002-read-with-empty-lines

```sh sham
#!SHAM [@three-char-SHA-256: el1]
action = "file_write"
path = "/tmp/files-read-empty-lines/first.txt"
content = "First file"
#!END_SHAM_el1

#!SHAM [@three-char-SHA-256: el2]
action = "file_write"
path = "/tmp/files-read-empty-lines/second.txt"
content = "Second file"
#!END_SHAM_el2

#!SHAM [@three-char-SHA-256: el3]
action = "files_read"
paths = <<'EOT_SHAM_el3'
/tmp/files-read-empty-lines/first.txt

/tmp/files-read-empty-lines/second.txt

EOT_SHAM_el3
#!END_SHAM_el3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-empty-lines/first.txt",
      "/tmp/files-read-empty-lines/second.txt"
    ],
    "content": "=== /tmp/files-read-empty-lines/first.txt ===\nFirst file\n\n=== /tmp/files-read-empty-lines/second.txt ===\nSecond file"
  }
}
```

### 003-read-with-missing-file

```sh sham
#!SHAM [@three-char-SHA-256: mf1]
action = "file_write"
path = "/tmp/files-read-missing/exists.txt"
content = "This file exists"
#!END_SHAM_mf1

#!SHAM [@three-char-SHA-256: mf2]
action = "files_read"
paths = <<'EOT_SHAM_mf2'
/tmp/files-read-missing/exists.txt
/tmp/files-read-missing/does-not-exist.txt
/tmp/files-read-missing/also-missing.txt
EOT_SHAM_mf2
#!END_SHAM_mf2
```

```json
{
  "success": false,
  "error": "files_read: Failed to read 2 file(s):\n  /tmp/files-read-missing/does-not-exist.txt: ENOENT: no such file or directory, open '/tmp/files-read-missing/does-not-exist.txt'\n  /tmp/files-read-missing/also-missing.txt: ENOENT: no such file or directory, open '/tmp/files-read-missing/also-missing.txt'"
}
```

### 004-read-empty-paths

```sh sham
#!SHAM [@three-char-SHA-256: ep1]
action = "files_read"
paths = <<'EOT_SHAM_ep1'


EOT_SHAM_ep1
#!END_SHAM_ep1
```

```json
{
  "success": false,
  "error": "files_read: No paths provided"
}
```

### 005-read-single-file

```sh sham
#!SHAM [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/files-read-single/only.txt"
content = "Only file content"
#!END_SHAM_sf1

#!SHAM [@three-char-SHA-256: sf2]
action = "files_read"
paths = "/tmp/files-read-single/only.txt"
#!END_SHAM_sf2
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-single/only.txt"
    ],
    "content": "=== /tmp/files-read-single/only.txt ===\nOnly file content"
  }
}
```

### 006-read-files-with-special-content

```sh sham
#!SHAM [@three-char-SHA-256: sc1]
action = "file_write"
path = "/tmp/files-read-special/quotes.txt"
content = "File with \"quotes\" and 'apostrophes'"
#!END_SHAM_sc1

#!SHAM [@three-char-SHA-256: sc2]
action = "file_write"
path = "/tmp/files-read-special/multiline.txt"
content = <<'EOT_SHAM_sc2'
Line 1
Line 2
Line 3
EOT_SHAM_sc2
#!END_SHAM_sc2

#!SHAM [@three-char-SHA-256: sc3]
action = "files_read"
paths = <<'EOT_SHAM_sc3'
/tmp/files-read-special/quotes.txt
/tmp/files-read-special/multiline.txt
EOT_SHAM_sc3
#!END_SHAM_sc3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/files-read-special/quotes.txt",
      "/tmp/files-read-special/multiline.txt"
    ],
    "content": "=== /tmp/files-read-special/quotes.txt ===\nFile with \"quotes\" and 'apostrophes'\n\n=== /tmp/files-read-special/multiline.txt ===\nLine 1\nLine 2\nLine 3"
  }
}
```