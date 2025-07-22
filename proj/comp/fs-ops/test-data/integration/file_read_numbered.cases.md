# file_read_numbered Integration Tests

## file_read_numbered

### 001-read-single-line

```sh sham
#!SHAM [@three-char-SHA-256: rs1]
action = "file_write"
path = "/tmp/t_read-single-line/numbered.txt"
content = <<'EOT_SHAM_rs1'
Line 1
Line 2
Line 3
Line 4
Line 5
EOT_SHAM_rs1
#!END_SHAM_rs1

#!SHAM [@three-char-SHA-256: rs2]
action = "file_read_numbered"
path = "/tmp/t_read-single-line/numbered.txt"
lines = "3"
#!END_SHAM_rs2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-single-line/numbered.txt",
    "content": "3: Line 3"
  }
}
```

### 002-read-line-range

```sh sham
#!SHAM [@three-char-SHA-256: rr1]
action = "file_write"
path = "/tmp/t_read-line-range/numbered.txt"
content = <<'EOT_SHAM_rr1'
First line
Second line
Third line
Fourth line
Fifth line
Sixth line
Seventh line
EOT_SHAM_rr1
#!END_SHAM_rr1

#!SHAM [@three-char-SHA-256: rr2]
action = "file_read_numbered"
path = "/tmp/t_read-line-range/numbered.txt"
lines = "3-5"
#!END_SHAM_rr2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-line-range/numbered.txt",
    "content": "3: Third line\n4: Fourth line\n5: Fifth line"
  }
}
```

### 003-read-with-custom-delimiter

```sh sham
#!SHAM [@three-char-SHA-256: cd1]
action = "file_write"
path = "/tmp/t_read-with-custom-delimiter/numbered.txt"
content = <<'EOT_SHAM_cd1'
import os
import sys

def main():
    print("Hello, World!")
    
if __name__ == "__main__":
    main()
EOT_SHAM_cd1
#!END_SHAM_cd1

#!SHAM [@three-char-SHA-256: cd2]
action = "file_read_numbered"
path = "/tmp/t_read-with-custom-delimiter/numbered.txt"
lines = "4-7"
delimiter = "    "
#!END_SHAM_cd2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-with-custom-delimiter/numbered.txt",
    "content": "4    def main():\n5        print(\"Hello, World!\")\n6        \n7    if __name__ == \"__main__\":"
  }
}
```

### 004-read-with-empty-delimiter

```sh sham
#!SHAM [@three-char-SHA-256: ed1]
action = "file_write"
path = "/tmp/t_read-with-empty-delimiter/numbered.txt"
content = <<'EOT_SHAM_ed1'
apple
banana
cherry
date
EOT_SHAM_ed1
#!END_SHAM_ed1

#!SHAM [@three-char-SHA-256: ed2]
action = "file_read_numbered"
path = "/tmp/t_read-with-empty-delimiter/numbered.txt"
lines = "2-3"
delimiter = ""
#!END_SHAM_ed2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-with-empty-delimiter/numbered.txt",
    "content": "2banana\n3cherry"
  }
}
```

### 005-read-out-of-range-lines

```sh sham
#!SHAM [@three-char-SHA-256: or1]
action = "file_write"
path = "/tmp/t_read-out-of-range-lines/numbered.txt"
content = <<'EOT_SHAM_or1'
Only
Three
Lines
EOT_SHAM_or1
#!END_SHAM_or1

#!SHAM [@three-char-SHA-256: or2]
action = "file_read_numbered"
path = "/tmp/t_read-out-of-range-lines/numbered.txt"
lines = "2-10"
#!END_SHAM_or2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Requested lines 2-10 but file only has 3 lines",
  "data": {
    "path": "/tmp/t_read-out-of-range-lines/numbered.txt",
    "content": "2: Three\n3: Lines"
  }
}
```

### 006-read-single-line-file

```sh sham
#!SHAM [@three-char-SHA-256: sl1]
action = "file_write"
path = "/tmp/t_read-single-line-file/numbered.txt"
content = "Just one line"
#!END_SHAM_sl1

#!SHAM [@three-char-SHA-256: sl2]
action = "file_read_numbered"
path = "/tmp/t_read-single-line-file/numbered.txt"
lines = "1"
#!END_SHAM_sl2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-single-line-file/numbered.txt",
    "content": "1: Just one line"
  }
}
```

### 007-read-empty-file

```sh sham
#!SHAM [@three-char-SHA-256: ef1]
action = "file_write"
path = "/tmp/t_read-empty-file/numbered.txt"
content = ""
#!END_SHAM_ef1

#!SHAM [@three-char-SHA-256: ef2]
action = "file_read_numbered"
path = "/tmp/t_read-empty-file/numbered.txt"
lines = "1"
#!END_SHAM_ef2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-empty-file/numbered.txt",
    "content": ""
  }
}
```

### 008-invalid-line-format

```sh sham
#!SHAM [@three-char-SHA-256: if1]
action = "file_write"
path = "/tmp/t_invalid-line-format/numbered.txt"
content = "Some content"
#!END_SHAM_if1

#!SHAM [@three-char-SHA-256: if2]
action = "file_read_numbered"
path = "/tmp/t_invalid-line-format/numbered.txt"
lines = "abc"
#!END_SHAM_if2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Invalid line specification 'abc'"
}
```

### 009-invalid-line-range

```sh sham
#!SHAM [@three-char-SHA-256: ir1]
action = "file_write"
path = "/tmp/t_invalid-line-range/numbered.txt"
content = "Some content"
#!END_SHAM_ir1

#!SHAM [@three-char-SHA-256: ir2]
action = "file_read_numbered"
path = "/tmp/t_invalid-line-range/numbered.txt"
lines = "5-3"
#!END_SHAM_ir2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Invalid line range '5-3' (start must be <= end)"
}
```

### 010-read-nonexistent-file

```sh sham
#!SHAM [@three-char-SHA-256: nf1]
action = "file_read_numbered"
path = "/tmp/t_read-nonexistent-file/does-not-exist.txt"
lines = "1-5"
#!END_SHAM_nf1
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_read-nonexistent-file/does-not-exist.txt'"
}
```

### 011-read-completely-out-of-range

```sh sham
#!SHAM [@three-char-SHA-256: co1]
action = "file_write"
path = "/tmp/t_read-completely-out-of-range/numbered.txt"
content = <<'EOT_SHAM_co1'
Line 1
Line 2
EOT_SHAM_co1
#!END_SHAM_co1

#!SHAM [@three-char-SHA-256: co2]
action = "file_read_numbered"
path = "/tmp/t_read-completely-out-of-range/numbered.txt"
lines = "5-10"
#!END_SHAM_co2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Requested lines 5-10 but file only has 2 lines",
  "data": {
    "path": "/tmp/t_read-completely-out-of-range/numbered.txt",
    "content": ""
  }
}
```

### 012-read-all-lines-missing-parameter

```sh sham
#!SHAM [@three-char-SHA-256: al1]
action = "file_write"
path = "/tmp/t_read-all-lines-missing-parameter/numbered.txt"
content = <<'EOT_SHAM_al1'
First line
Second line
Third line
Fourth line
Fifth line
EOT_SHAM_al1
#!END_SHAM_al1

#!SHAM [@three-char-SHA-256: al2]
action = "file_read_numbered"
path = "/tmp/t_read-all-lines-missing-parameter/numbered.txt"
#!END_SHAM_al2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-all-lines-missing-parameter/numbered.txt",
    "content": "1: First line\n2: Second line\n3: Third line\n4: Fourth line\n5: Fifth line"
  }
}
```

### 013-read-large-line-numbers

```sh sham
#!SHAM [@three-char-SHA-256: ll1]
action = "file_write"
path = "/tmp/t_read-large-line-numbers/numbered.txt"
content = <<'EOT_SHAM_ll1'
Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10
Line 11
Line 12
EOT_SHAM_ll1
#!END_SHAM_ll1

#!SHAM [@three-char-SHA-256: ll2]
action = "file_read_numbered"
path = "/tmp/t_read-large-line-numbers/numbered.txt"
lines = "9-11"
#!END_SHAM_ll2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-large-line-numbers/numbered.txt",
    "content": " 9: Line 9\n10: Line 10\n11: Line 11"
  }
}
```