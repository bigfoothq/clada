20250620


# CML Protocol v0.0.1

## Architecture Overview

**Component-based design**:
- Three components: edit, write, run
- Each component exports: `parse[Operation]()`, `execute[Operation]()`
- Direct imports in orchestrator, no discovery mechanism
- Result<T,E> error propagation: `{ok: true, value} | {ok: false, error}`
- Never throw exceptions internally

**Execution philosophy**:
- Shell commands for everything except file content modification
- XML only for: creating files (`<write>`), editing files (`<edit>`)
- All shell commands wrapped in `<run>` tags

## Execution Model

- Tasks within `<tasks>` blocks execute sequentially. First error aborts remaining tasks in that block.
- Multiple `<tasks>` blocks execute independently. Block 2 runs even if block 1 fails.
- Standalone tasks (outside blocks) execute independently.
- All tasks share filesystem state. No isolation. No rollback on failure.
- Tasks numbered sequentially from 1 across entire document.
- Each `<run>` executes in fresh shell with independent working directory.
- **Git wraps**: Pre/post commits with timestamped messages (unless `--no-git`)
- Exit code: 0 (success) or 1 (any failure).
- Unknown elements in versioned blocks: skip. Unknown version: abort.
- Version attribute optional, applies only to containing block
- Git operations abort execution on any failure

## Shell Commands via Run

**Whitelisted commands** (see LLM_COMMANDS_APPROACH):
- **File operations**: `mv`, `rm`, `cp`, `mkdir`, `touch`
- **Reading**: `cat`, `head`, `tail`, `grep`, `find`, `ls`, `pwd`, `tree`, `wc`, `diff`, `file`, `stat`, `realpath`, `xxd`
- **Git**: `git status`, `git diff`, `git log`, `git show`, `git branch`, `git stash`, `git ls-files`

**Security**: Direct execution via execFile, no shell interpretation, 5s timeout, 10MB output limitd commands** (via LLM_COMMANDS_APPROACH):
- **Exploration**: `cat`, `head`, `tail`, `grep`, `find`, `ls`, `pwd`, `tree`, `wc`, `diff`, `file`, `stat`, `realpath`, `xxd`
- **Git inspection**: `git status`, `git diff`, `git log`, `git show`, `git branch`, `git stash`, `git ls-files`
- **No state changes**: `mv`, `rm`, `cp`, `mkdir`, `touch` are NOT allowed via shell

**Security model**:
- No shell interpretation - commands execute directly via execFile
- Path validation prevents directory traversal
- Resource limits: 5s timeout, 10MB output per command
- Argument parsing validates flags and counts
- No pipes, redirects, or shell metacharacters

## Test Command Approval System

For `<run>` commands not in CML whitelist:
- First execution prompts for human approval
- Approved commands stored in `.clada/allowed-commands.json`
- Exact string match only (no patterns/wildcards initially)
- Project-specific, version-controlled whitelist
- Subsequent identical commands execute without prompting

```json
{
  "commands": [
    "npm test",
    "python -m pytest",
    "jest --coverage"
  ],
  "added": {
    "npm test": "2024-01-20T10:30:00Z"
  }
}
```

## CML Commands (Write Operations)

### edit
```xml
<edit path="file.js" count="3">
  <search><![CDATA[exact text]]></search>
  <replace><![CDATA[new text]]></replace>
</edit>

<!-- For large blocks, match only start/end to save tokens -->
<edit path="file.js"  count="2">
  <search-start><![CDATA[function calculate(]]></search-start>
  <search-end><![CDATA[return result;
}]]></search-end>
  <replace><![CDATA[new implementation]]></replace>
</edit>
```
- Match must occur exactly `count` times (default: 1)
- Case sensitive
- Use `<search>` for exact match or `<search-start>`/`<search-end>` for partial
- Content containing `]]>` must escape as `]]&gt;` within CDATA
- **Errors**: `match_count_mismatch`, `file_not_found`, `symlink_not_allowed`

for range search:
- Non-overlapping matches only
- lazy search
- also supports "count", defaulting to 1

### write
```xml
<write path="file.txt"><![CDATA[content]]></write>
<write path="file.txt" append="true"><![CDATA[additional content]]></write>
```
- Creates parent directories
- Default: overwrites existing files
- `append="true"`: appends to existing files
- UTF-8 only, BOM stripped, invalid sequences abort
- File permissions: system defaults (umask/inherited) (DEPRECATED - use shell commands)
```xml
<move from="old.txt" to="new.txt"/>
```
- **Deprecated**: Use `<run><![CDATA[mv old.txt new.txt]]></run>` instead
- Still supported for backward compatibility
- **Errors**: `file_not_found`, `permission_denied`

### remove (DEPRECATED - use shell commands)
```xml
<remove path="file.txt"/>
```
- **Deprecated**: Use `<run><![CDATA[rm -rf file.txt]]></run>` instead
- Still supported for backward compatibility
- **Errors**: `file_not_found`

### run
```xml
<run><![CDATA[npm test]]></run>
<run dir="/app"><![CDATA[npm install]]></run>
```
- Execute any whitelisted shell command
- Test commands require approval (see Test Command Approval)
- Inherits environment
- Streams output with `[task-N:exec]` prefix
- `dir` affects single command only
- Output truncated at `--max-output` with `[output truncated]` marker
- **Errors**: `exec_timeout`, `exec_failed`, `command_not_allowed`

## Path Resolution

- Paths resolved via `path.resolve(workingDir, p)`
- Validated via `path.relative(workingDir, resolved)`
- Rejected if relative path starts with `..`
- Windows paths normalized to forward slashes
- Absolute paths rejected unless `--allow-escape`
- Symbolic links: error on read/write through them
- Move/remove of symlinks themselves permitted

## Memory and Resource Limits

- Maximum input size: 50MB
- Per-command timeout: 30s (configurable)
- Per-task output buffer: 10MB (configurable)
- Shell command timeout: 5s (hardcoded)
- Shell command output: 10MB (hardcoded)

## Usage Guidelines for LLMs

**Use XML tags only for**:
- Creating new files: `<write>`
- Modifying file contents: `<edit>`

**Use shell commands via <run> for everything else**:
- File operations: `mv`, `rm`, `cp`, `mkdir`, `touch`
- Reading: `cat`, `head`, `tail`, `grep`, `find`, `ls`
- All other filesystem and git operations

**Rule**: If modifying file contents, use XML. Otherwise, use shell.

## Configuration

| Flag | Default | Description |
|------|---------|-------------|
| `--timeout` | 30s | Per-command timeout |
| `--total-timeout` | none | Batch execution limit |
| `--max-output` | 10MB | Per-task buffer |
| `--output-mode` | stream | stream/buffer/silent |
| `--no-git` | false | Disable git commits |
| `--git-author` | clada | Commit author |
| `--allow-escape` | false | Allow paths outside CWD |
| `--lock-file` | none | Execution lock path |
| `--lock-timeout` | 10s | Lock acquisition timeout |
| `--error-detail` | minimal | minimal/full/debug |

## Error Types

| Type | Meaning | Recovery |
|------|---------|----------|
| `match_count_mismatch` | Found X matches, expected Y | Adjust count attribute |
| `file_not_found` | Path missing | Check path |
| `permission_denied` | Access denied | Check permissions |
| `symlink_not_allowed` | Operation through symlink | Use real path |
| `exec_timeout` | Command exceeded limit | Increase timeout |
| `exec_failed` | Non-zero exit | Check command |
| `path_escape` | Path outside CWD | Use --allow-escape |
| `malformed_xml` | Invalid syntax | Fix CML |
| `input_too_large` | Input exceeds 50MB | Split into batches |
| `git_operation_failed` | Git command failed | Check git status |
| `command_not_allowed` | Run command not whitelisted | Approve command |

## Output Format

```
[task-1] Success: created file.txt
[task-2:exec] npm install output...
[output truncated]
[task-3] Error: match_count_mismatch in app.js (found 2 matches, expected 1)

<result blocks="2" tasks="5" succeeded="4" failed="1">
  <block index="0" status="success" tasks="3"/>
  <block index="1" status="failed" tasks="2">
    <task index="3" status="error">
      <error type="match_count_mismatch">Found 2 matches, expected 1</error>
    </task>
  </block>
</result>
```

## Example

```xml
<!-- Create and modify files with XML -->
<tasks version="1.1">
  <write path="src/app.js"><![CDATA[console.log("hello");]]></write>
  <edit path="src/app.js" count="1">
    <search><![CDATA["hello"]]></search>
    <replace><![CDATA["world"]]></replace>
  </edit>
</tasks>

<!-- Use shell for everything else -->
<tasks>
  <run><![CDATA[mkdir -p dist]]></run>
  <run><![CDATA[cp src/app.js dist/]]></run>
  <run><![CDATA[cd dist && node app.js]]></run>
  <run><![CDATA[rm -rf temp/]]></run>
</tasks>
```

## Implementation Notes

### Output Behavior
- Line-buffered with `[task-N:exec]` prefix per line
- stderr/stdout merged

### Task Numbering
- Display: 1-based (`[task-1]` = first task)
- XML result: 0-based (`<task index="0">` = first task)

### Edge Cases
- Empty search/replace: error
- Within CDATA: escape `]]>` as `]]&gt;`

### Component Structure
- Flat shared utilities in `shared/src/`
- No nested component structure
- Components import only what they need
- Explicit imports > filesystem scanning

