# Python Execution Test Cases

## Basic print
```sh nesl
#!NESL [@three-char-SHA-256: p1y]
action = "exec"
lang = "python"
code = "print('Hello from Python')"
#!END_NESL_p1y
```

```json
{
  "success": true,
  "stdout": "Hello from Python\n",
  "stderr": "",
  "exit_code": 0
}
```

## Multi-line with loops
```sh nesl
#!NESL [@three-char-SHA-256: p2y]
action = "exec"
lang = "python"
code = <<'EOT_NESL_p2y'
numbers = [1, 2, 3]
for n in numbers:
    print(f"Number: {n}")
EOT_NESL_p2y
#!END_NESL_p2y
```

```json
{
  "success": true,
  "stdout": "Number: 1\nNumber: 2\nNumber: 3\n",
  "stderr": "",
  "exit_code": 0
}
```

## Import and use module
```sh nesl
#!NESL [@three-char-SHA-256: p3y]
action = "exec"
lang = "python"
code = <<'EOT_NESL_p3y'
import json
data = {"status": "ok", "items": [1, 2, 3]}
print(json.dumps(data))
EOT_NESL_p3y
#!END_NESL_p3y
```

```json
{
  "success": true,
  "stdout": "{\"status\": \"ok\", \"items\": [1, 2, 3]}\n",
  "stderr": "",
  "exit_code": 0
}
```

## Syntax error
```sh nesl
#!NESL [@three-char-SHA-256: p4y]
action = "exec"
lang = "python"
code = "print('unclosed string"
#!END_NESL_p4y
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "{SYNTAX_ERROR_WITH_TRACEBACK}",
  "exit_code": 1
}
```

## Exception handling
```sh nesl
#!NESL [@three-char-SHA-256: p5y]
action = "exec"
lang = "python"
code = <<'EOT_NESL_p5y'
try:
    1 / 0
except ZeroDivisionError:
    print("Caught division by zero")
EOT_NESL_p5y
#!END_NESL_p5y
```

```json
{
  "success": true,
  "stdout": "Caught division by zero\n",
  "stderr": "",
  "exit_code": 0
}
```

## Sys.exit with code
```sh nesl
#!NESL [@three-char-SHA-256: p6y]
action = "exec"
lang = "python"
code = <<'EOT_NESL_p6y'
import sys
print("Exiting with code 5")
sys.exit(5)
EOT_NESL_p6y
#!END_NESL_p6y
```

```json
{
  "success": false,
  "stdout": "Exiting with code 5\n",
  "stderr": "",
  "exit_code": 5
}
```

## Working directory
```sh nesl
#!NESL [@three-char-SHA-256: p7y]
action = "exec"
lang = "python"
code = <<'EOT_NESL_p7y'
import os
print(os.getcwd())
EOT_NESL_p7y
cwd = "/tmp"
#!END_NESL_p7y
```

```json
{
  "success": true,
  "stdout": "/tmp\n",
  "stderr": "",
  "exit_code": 0
}
```