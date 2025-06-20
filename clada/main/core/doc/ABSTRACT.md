## Purpose

Clada executes filesystem and runtime commands embedded in LLM output using a hybrid approach: XML (CML) for file content modifications, shell commands for everything else. Requires exact string matching for edits, includes test command approval system, and provides atomic Git wrapping. Built for LLM coding agents needing deterministic filesystem access without shell injection vulnerabilities.

## System Overview

**Input**: Mixed text from stdin containing CML blocks and/or shell commands in `<run>` tags.

**Execution Model**: 
- Within `<tasks>` blocks: Sequential, fail-fast
- Across blocks: Independent execution  
- Standalone tasks: Execute independently
- Malformed XML aborts that block only

**Command Types**:
- **File content ops**: `<write>`, `<edit>` - XML-only
- **Everything else**: `<run>` wrapping whitelisted shell commands
- **Test commands**: Require first-use approval

**Security**:
- No shell interpretation (execFile only)
- Path validation prevents traversal
- Resource limits: 5s timeout, 10MB output per command
- Test commands stored in `.clada/allowed-commands.json`

**Git Integration**: Automatic pre/post commits, no rollback (disable with `--no-git`)

**Output**: Task status prefixed with `[task-N]`, final XML result summary