# Listener Integration Test Cases

## Basic file write and execution

### Initial file content
```
# My Document

Some content here.
```

### File change with SHAM block
```
# My Document

Some content here.

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/t_listener_workflow/output.txt"
content = "Hello from listener!"
#!END_SHAM_abc
```
```

### Expected clipboard content
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
abc ✅ file_write /tmp/t_listener_workflow/output.txt
=== END ===
```

### Expected .clada-output-latest.txt
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
abc ✅ file_write /tmp/t_listener_workflow/output.txt
=== END ===

=== OUTPUTS ===
=== END ===
```

### Expected file content after prepend
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
abc ✅ file_write /tmp/t_listener_workflow/output.txt
=== END ===

# My Document

Some content here.

```sh sham
#!SHAM [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/t_listener_workflow/output.txt"
content = "Hello from listener!"
#!END_SHAM_abc
```
```

## Multiple actions with mixed results

### File change
```
```sh sham
#!SHAM [@three-char-SHA-256: wr1]
action = "file_write"
path = "/tmp/t_listener_multi/file1.txt"
content = "First file"
#!END_SHAM_wr1
```

```sh sham
#!SHAM [@three-char-SHA-256: rd1]
action = "file_read"
path = "/tmp/t_listener_multi/missing.txt"
#!END_SHAM_rd1
```

```sh sham
#!SHAM [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello world'"
#!END_SHAM_ex1
```
```

### Expected summary
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/file1.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===
```

### Expected full output
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/file1.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===

=== OUTPUTS ===
[ex1] exec bash:
stdout:
Hello world
=== END ===
```

## Parse error handling

### File with parse error
```
```sh sham
#!SHAM [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/t_listener_parse/test.txt"
content = "missing closing quote
#!END_SHAM_bad
```
```

### Expected summary
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
bad ❌ file_write - Unterminated heredoc: Expected EOT_SHAM_bad
=== END ===
```

## No change detection (same hash)

### Initial SHAM
```
```sh sham
#!SHAM [@three-char-SHA-256: nc1]
action = "file_write"
path = "/tmp/t_listener_nochange/test.txt"
content = "Initial content"
#!END_SHAM_nc1
```
```

### Second save with same content
Should not execute again - no output changes

## Output size limits

### Single large output
```
```sh sham
#!SHAM [@three-char-SHA-256: big]
action = "exec"
lang = "python"
code = "print('x' * 60000)"
#!END_SHAM_big
```
```

### Expected summary
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
big ❌ exec python - Output too large: 60001 bytes (max 50000)
=== END ===
```

## Clipboard failure

### When clipboard fails
```
📌 Clipboard copy failed at 10:30:00

=== CLADA RESULTS ===
abc ✅ file_write /tmp/t_listener_clipfail/test.txt
=== END ===
```