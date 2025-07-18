# Run Component

## Purpose
Executes shell commands from CSL `RUN` blocks using a two-tier security model that prevents shell injection while allowing controlled filesystem access. Designed for LLM-generated commands where mistakes are expected but malicious intent is not.

## Overview

### Two-Tier Security Model
1. **Filesystem commands**: Hardcoded whitelist in `COMMAND_SPECS` including `cat`, `ls`, `grep`, `find`, `git`, etc. These execute immediately without prompts.
2. **Test commands**: Everything else (e.g., `npm test`, `pytest`, `jest`) requires user approval on first use.

### no sandboxing

the allowlist/denylist + execFile approach IS the security model. We're running real commands on the real filesystem, just with careful validation.

### Approval System
- Unknown commands prompt user: "Allow 'npm test'? (yes/no/always/never):"
- `yes` - Run once only
- `always` - Run and save to `.clada/commands.json`
- `no` - Don't run
- `never` - Don't run and save to `.clada/commands.json`
- Previously approved/blocked commands skip prompts


### commands.json

TODO we need to convert this to a system that would never need to quote char escaping i think.  i think toml.  but idk. LLMs are bad at char escaping. 

{
  "allowed": ["npm test", "jest --coverage"],
  "blocked": ["rm -rf /", "npm run deploy:prod"]
}

### Command Execution
- **Parser**: `shell-quote` handles proper argument parsing and quote handling
- **Validation**: Rejects shell operators (pipes, redirects), validates paths stay within working directory
- **Execution**: `execFile` only - no shell interpretation prevents injection attacks
- **Limits**: 5 second timeout, 10MB max output per command
- **Special handling**: Git subcommands have their own validation rules

### Error Handling
- Invalid shell syntax
- Disallowed commands or git subcommands
- Path traversal attempts
- Failed execution (non-zero exit codes)
- Timeouts and oversized output

See `concepts/LLM_COMMANDS_APPROACH.md` for detailed implementation and security rationale.