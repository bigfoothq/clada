## Purpose

Clada executes supported filesystem and runtime commands embedded in LLM output. Supports text edit with whitespace normalization for resilient search, file create/move/delete, and process execution with streamed output. Git commits wrap operations atomically. Built for LLM coding agents that need deterministic filesystem access without parsing shell syntax.

## System Overview 

**Input**: Clada reads mixed text from stdin containing one or more CML blocks.

**Extraction**: htmlparser2 parses entire input as XML with `xmlMode: true`. DomUtils extracts all `<tasks>` elements, preserving nested tags and mixed content.

**Parsing**: fast-xml-parser validates each extracted fragment. Malformed XML aborts that block only.

**Execution Model**: 
- Within `<tasks>` block: Sequential, fail-fast. First error aborts remaining tasks in that block.
- Across blocks: Independent execution. Failures in one block don't affect others.
- Standalone tasks (outside any `<tasks>`): Execute independently.

**State Persistence**: Each task inherits cumulative filesystem state. Working directory changes persist. No isolation between tasks.

**Git Integration** (if `--git` flag, default on):
- Pre: `git add -A && git commit -m "[clada:pre] $(date -Iseconds)"`  
- Post: `git add -A && git commit -m "[clada:post] $(date -Iseconds)"`
- No automatic rollback. Manual recovery via `git log` and `git reset`.

**Command Execution**:
- Edit: Exact match only. Search-head/tail for large blocks.
- Overwrite/Move/Delete: Standard filesystem operations.
- Exec: Spawns with inherited stdio. Output prefixed `[task-N:exec]`.

**Configuration Flags**:
- `--timeout=30s`: Per-exec timeout (default: 30s)
- `--total-timeout=5m`: Batch limit (default: none)
- `--max-output=10MB`: Per-task buffer (default: 10MB)
- `--output-mode=stream|buffer|silent` (default: stream)
- `--no-git`: Disable Git integration
- `--git-author="name"`: Commit author (default: "clada")
- `--allow-escape`: Disable path containment
- `--lock-file=/path`: Concurrency protection (default: none)
- `--lock-timeout=10s`: Lock acquisition timeout
- `--error-detail=minimal|full|debug` (default: minimal)

**Output Format**:
```
[task-1] Success: created file.txt
[task-2:exec] npm install output...
[block-1] Error: search_not_found in file.js
[task-3] Success: moved file.txt
<result blocks="2" tasks="3" succeeded="2" failed="1"/>
```

**Critical Limitations**:
- No dependency declaration between blocks
- Memory scales with input size
- Binary file support undefined

