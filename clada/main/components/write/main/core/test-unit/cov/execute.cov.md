20250119

# Write Executor Covenant

## executeWrite(task, context) → {success} | {error, message}

Creates file at path with content. Returns protocol-compatible result.

Parameters:
- task: {path: string, content: string}
- context: {cwd: string, config: {allowEscape: boolean}}

### Example 1: Basic file creation
Task: 
```json
{"path": "new.txt", "content": "hello world"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```

### Example 2: Multi-line file
Input:
```json
{"path": "script.py", "content": "#!/usr/bin/env python3\n\ndef main():\n    print('hello')\n\nif __name__ == '__main__':\n    main()"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```

### Example 3: Nested directory creation
Input:
```json
{"path": "a/b/c/file.txt", "content": "deep"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```

### Example 4: Overwrite existing file
Precondition: `/app/existing.txt` exists with content "old content"
Input:
```json
{"path": "existing.txt", "content": "new content"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```

### Example 5: Path escape attempt
Input:
```json
{"path": "../escape.txt", "content": "data"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": false, "error": {"type": "path_escape", "message": "Path escapes working directory"}}
```

### Example 6: Absolute path blocked
Input:
```json
{"path": "/etc/passwd", "content": "hacked"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": false, "error": {"type": "path_escape", "message": "Absolute paths not allowed"}}
```

### Example 7: Write through symlink
Precondition: `/app/link.txt` is symlink to `/etc/secret`
Input:
```json
{"path": "link.txt", "content": "data"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": false, "error": {"type": "symlink_not_allowed", "message": "Cannot write through symlink: link.txt"}}
```

### Example 8: Permission denied
Precondition: `/app/readonly/` directory has mode 0555 (no write permission)
Input:
```json
{"path": "readonly/file.txt", "content": "data"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": false, "error": {"type": "permission_denied", "message": "Permission denied: /app/readonly/file.txt"}}
```

### Example 9: Target is directory
Precondition: `/app/existing-dir/` is a directory
Input:
```json
{"path": "existing-dir", "content": "data"}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": false, "error": {"type": "permission_denied", "message": "Cannot write to directory: existing-dir"}}
```

### Example 10: Append to existing file
Precondition: `/app/log.txt` exists with content "line1\n"
Input:
```json
{"path": "log.txt", "content": "line2\n", "append": true}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```
Postcondition: `/app/log.txt` contains "line1\nline2\n"

### Example 11: Append to non-existent file
Input:
```json
{"path": "new-log.txt", "content": "first line\n", "append": true}
```
Context:
```json
{"cwd": "/app", "config": {"allowEscape": false}}
```
Output:
```json
{"ok": true}
```
Postcondition: `/app/new-log.txt` contains "first line\n"