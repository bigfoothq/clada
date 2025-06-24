## Purpose

Clada executes filesystem and runtime commands embedded in LLM output using CSL (Clada Syntax Language), a purpose-built language parsed by a dedicated state-machine parser. It provides deterministic filesystem access and shell command execution for LLM coding agents.

## System Overview

**Input**: Text from stdin containing CSL blocks, parsed by `csl-parser`.

**Execution Model**: 
- Follows the execution model of `csl-parser`:
  - Fatal syntax errors halt all execution.
  - Semantic validation errors are collected; valid operations can still run.
  - Operations within a `<---TASKS--->` block are atomic: if one fails validation, the entire block is skipped.

**Command Types**:
- **File content ops**: `<---WRITE--->`, `<---SEARCH--->`
- **Shell commands**: `<---RUN--->` wrapping whitelisted shell commands
- **Test commands**: Require first-use approval

**Security**:
- No shell interpretation (`execFile` only)
- Path validation prevents traversal
- Resource limits: 5s timeout, 10MB output per command
- Test commands stored in `.clada/allowed-commands.json`

**Git Integration**: Automatic pre/post commits (disable with `--no-git`)

**Output**: Task status prefixed with `[task-N]` where N is the operation number. Format: `[task-N] STATUS: OPERATION - details`. TASKS blocks use sub-numbering like `[task-N.M]`. Status values: SUCCESS, ERROR, SKIP, FATAL.