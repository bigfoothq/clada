# Execution Error Test Cases

## Missing interpreter
```sh sham
#!SHAM [@three-char-SHA-256: e1r]
action = "exec"
lang = "cobol"
code = "DISPLAY 'hello'."
#!END_SHAM_e1r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: cobol not found in PATH (ENOENT)"
}
```

## Invalid working directory
```sh sham
#!SHAM [@three-char-SHA-256: e2r]
action = "exec"
lang = "bash"
code = "pwd"
cwd = "/nonexistent/directory/path"
#!END_SHAM_e2r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Working directory does not exist '/nonexistent/directory/path' (ENOENT)"
}
```

## Process timeout
```sh sham
#!SHAM [@three-char-SHA-256: e3r]
action = "exec"
lang = "bash"
code = "sleep 2"
timeout = 200
#!END_SHAM_e3r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```

## Timeout with partial output
```sh sham
#!SHAM [@three-char-SHA-256: e4r]
action = "exec"
lang = "bash"
code = "echo 'Started'; sleep 2; echo 'Never seen'"
timeout = 200
#!END_SHAM_e4r
```

```json
{
  "success": false,
  "stdout": "Started\n",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```
<!-- 
## Large output truncation
```sh sham
#!SHAM [@three-char-SHA-256: e5r]
action = "exec"
lang = "bash"
code = "for i in {1..100000}; do echo 'Line '$i': This is a very long line of output that will eventually exceed our size limit'; done"
#!END_SHAM_e5r
```

```json
{
  "success": true,
  "stdout": "Line 1: This is a very long...[truncated - 1MB limit]...Line 9999: This is a very long",
  "stderr": "",
  "exit_code": 0
}
``` -->

## Permission denied
```sh sham
#!SHAM [@three-char-SHA-256: e6r]
action = "exec"
lang = "bash"
code = "cat /private/etc/sudoers"
#!END_SHAM_e6r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "cat: /private/etc/sudoers: Permission denied\n",
  "exit_code": 1
}
```
<!-- 
## Memory allocation failure
```sh sham
#!SHAM [@three-char-SHA-256: e7r]
action = "exec"
lang = "python"
code = "a = [0] * (10**10)"
#!END_SHAM_e7r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "MemoryError\n",
  "exit_code": 1
}
``` -->

## Interactive command (no stdin)
```sh sham
#!SHAM [@three-char-SHA-256: e8r]
action = "exec"
lang = "python"
code = "name = input('Enter name: '); print(f'Hello {name}')"
timeout = 200
#!END_SHAM_e8r
```

```json
{
  "success": false,
  "stdout": "Enter name: ",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```

## Unsupported language
```sh sham
#!SHAM [@three-char-SHA-256: e9r]
action = "exec"
lang = "rust"
code = "println!(\"Hello\");"
#!END_SHAM_e9r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Unsupported language 'rust' (LANG_UNSUPPORTED)"
}
```

## Empty code
```sh sham
#!SHAM [@three-char-SHA-256: e10r]
action = "exec"
lang = "bash"
code = ""
#!END_SHAM_e10r
```

```json
{
  "success": true,
  "stdout": "",
  "stderr": "",
  "exit_code": 0
}
```