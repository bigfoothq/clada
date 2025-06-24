# executeRun Covenant

Executes shell commands from CSL RUN blocks with a two-tier security model.

## Function Signature
```typescript
executeRun(command: RunCommand, context: ExecutionContext, options?: {
  prompter?: (question: string) => Promise<string>
}): Promise<Result<{ output: string }, string>>
```

Note: Examples show command strings for clarity, but the function receives a RunCommand object:
```typescript
interface RunCommand {
  type: 'RUN';
  payload: {
    command: string;  // The command string shown in examples
    cwd?: string;     // Optional working directory override
  };
}

interface ExecutionContext {
  cwd: string;  // Current working directory
}
```

## Examples

### Filesystem commands (immediate execution)
- 'ls -la' → {ok: true, value: {output: "total 24\ndrwxr-xr-x  3 user  staff   96 Jan 19 10:00 .\n..."}}
- 'cat package.json' → {ok: true, value: {output: '{"name": "myapp", "version": "1.0.0"}\n'}}
- 'grep -n TODO src/main.js' → {ok: true, value: {output: "5:  // TODO: implement feature\n12:  // TODO: add tests\n"}}
- 'grep -r "TODO" src/ test/' → {ok: true, value: {output: "src/main.js:5:  // TODO: implement\ntest/main.test.js:3:  // TODO: add test\n"}}
- 'find . -name "*.test.js"' → {ok: true, value: {output: "./src/main.test.js\n./utils/helper.test.js\n"}}
- 'find . -type f -maxdepth 2' → {ok: true, value: {output: "./package.json\n./README.md\n./src/main.js\n"}}
- 'git status' → {ok: true, value: {output: "On branch main\nnothing to commit\n"}}
- 'git diff src/main.js' → {ok: true, value: {output: "diff --git a/src/main.js b/src/main.js\n+console.log('new line');\n"}}
- 'git log -n 5 --oneline' → {ok: true, value: {output: "a1b2c3d Add feature X\ne4f5g6h Fix bug in Y\ni7j8k9l Update docs\nm1n2o3p Refactor Z\nq4r5s6t Initial commit\n"}}
- 'git show HEAD:package.json' → {ok: true, value: {output: '{"name": "project", "version": "1.0.0"}\n'}}
- 'pwd' → {ok: true, value: {output: "/project\n"}}
- 'mkdir -p src/components' → {ok: true, value: {output: ""}}
- 'touch README.md' → {ok: true, value: {output: ""}}
- 'cp config.json config.backup.json' → {ok: true, value: {output: ""}}
- 'mv old-name.js new-name.js' → {ok: true, value: {output: ""}}

### Test commands (first time, prompts user)
'npm test' prompts "Allow 'npm test'? (yes/no/always/never): "
- response: 'yes' → {ok: true, value: {output: "Tests passed: 42/42\n"}}
- response: 'always' → {ok: true, value: {output: "[Added to .clada/commands.json]\nTests passed: 42/42\n"}}
- response: 'no' → {ok: false, error: "Command not approved: npm test"}
- response: 'never' → {ok: false, error: "Command blocked: npm test\n[Added to .clada/commands.json]"}

'python -m pytest' prompts "Allow 'python -m pytest'? (yes/no/always/never): "
- response: 'always' → {ok: true, value: {output: "[Added to .clada/commands.json]\n===== 15 passed in 0.42s =====\n"}}

### Previously approved/blocked commands (no prompt)
- 'npm test' (in allowed list) → {ok: true, value: {output: "Tests passed: 42/42\n"}}
- 'npm run build' (in blocked list) → {ok: false, error: "Command blocked: npm run build"}
- 'jest --coverage' (in allowed list) → {ok: true, value: {output: "Coverage: 89.5%\n"}}

### Working directory
- Commands execute in `context.cwd` by default
- `command.payload.cwd` overrides `context.cwd` when present
- 'pwd' with context.cwd: '/home/user' → {ok: true, value: {output: "/home/user\n"}}
- 'pwd' with payload.cwd: '/tmp' → {ok: true, value: {output: "/tmp\n"}}

### Invalid commands and errors
- 'rm -rf /' → {ok: false, error: "Invalid path: /"}
- 'echo "test" | grep test' → {ok: false, error: "Shell operators not allowed"}
- 'cat file.txt > output.txt' → {ok: false, error: "Shell operators not allowed"}
- 'ls && echo done' → {ok: false, error: "Shell operators not allowed"}
- 'ls || echo failed' → {ok: false, error: "Shell operators not allowed"}
- 'cat < input.txt' → {ok: false, error: "Shell operators not allowed"}
- 'echo test >> output.txt' → {ok: false, error: "Shell operators not allowed"}
- 'cat << EOF' → {ok: false, error: "Shell operators not allowed"}
- 'sleep 5 &' → {ok: false, error: "Shell operators not allowed"}
- 'echo $(date)' → {ok: false, error: "Shell operators not allowed"}
- 'echo `date`' → {ok: false, error: "Shell operators not allowed"}
- 'echo $HOME' → {ok: false, error: "Shell operators not allowed"}
- 'ls *.txt' → {ok: false, error: "Shell operators not allowed"}
- 'ls file?.txt' → {ok: false, error: "Shell operators not allowed"}
- 'ls [abc].txt' → {ok: false, error: "Shell operators not allowed"}
- 'echo test; ls' → {ok: false, error: "Shell operators not allowed"}
- '(cd /tmp && ls)' → {ok: false, error: "Shell operators not allowed"}
- '{ echo test; }' → {ok: false, error: "Shell operators not allowed"}
- 'echo "unterminated' → {ok: false, error: "Invalid shell syntax"}
- 'npm test' with cwd: '/nonexistent' → {ok: false, error: "Invalid working directory: /nonexistent"}
- 'cat ../../../etc/passwd' → {ok: false, error: "Invalid path: ../../../etc/passwd"}
- 'cat ./src/main.js' → {ok: true, value: {output: "console.log('hello');\n"}}
- 'ls ../sibling-dir' (within project) → {ok: true, value: {output: "file1.txt\nfile2.txt\n"}}
- 'cat /etc/passwd' (absolute path outside project) → {ok: false, error: "Invalid path: /etc/passwd"}
- 'cat symlink-to-etc/passwd' (symlink escape attempt) → {ok: false, error: "Invalid path: symlink-to-etc/passwd"}
- 'git invalid-subcommand' → {ok: false, error: "Git subcommand not allowed: invalid-subcommand"}
- 'grep' → {ok: false, error: "grep requires pattern"}
- 'mv file1' → {ok: false, error: "mv requires exactly 2 paths"}
- 'ls --invalid-flag' → {ok: false, error: "Unknown flag: --invalid-flag"}
- 'head -n notanumber file.txt' → {ok: false, error: "Invalid number for flag: n"}

### Command execution failures
- 'npm test' (exit code 1) → {ok: false, error: "Command failed with exit code 1", output: "Error: Test failed\n"}
- 'python test.py' (syntax error) → {ok: false, error: "Command failed with exit code 1", output: "SyntaxError: invalid syntax\n"}
- 'python -m pytest' (not installed) → {ok: false, error: "Command failed: python: command not found"}
- 'find / -name "*.txt"' (takes too long) → {ok: false, error: "Command timed out"}
- 'cat /dev/urandom | head -c 20000000' → {ok: false, error: "Shell operators not allowed"}
- 'find / -type f' (output too large) → {ok: false, error: "Output too large"}
- 'yes' (runs forever) → {ok: false, error: "Command timed out"}

### Multi-line commands
- 'echo "line 1\nline 2"' → {ok: true, value: {output: "line 1\nline 2\n"}}
- 'python -c "print(\'hello\')\nprint(\'world\')"' → {ok: true, value: {output: "hello\nworld\n"}}

### Commands file structure
After approving/blocking commands, .clada/commands.json contains:
```json
{
  "allowed": ["npm test", "jest --coverage"],
  "blocked": ["npm run build", "rm -rf node_modules"]
}
```