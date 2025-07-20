# fs-ops Architecture

## Design Philosophy

**Defensive Operations with Clear Errors**: Every operation should handle common failure cases gracefully and return descriptive errors that help the LLM understand what went wrong.

## Key Design Decisions

### Parent Directory Creation
- `file_create` automatically creates parent directories
- `file_write` fails if parent directory doesn't exist
- This distinction helps LLM understand intent

### Text Replacement Strategy  
- Use exact string matching for `file_edit`
- Count parameter limits replacements (default: 1)
- Return actual number of replacements made
- No regex support (keep it simple, predictable)

### Error Handling
- Never throw - return errors in result object
- Include original error codes (ENOENT, EACCES)
- Add context about what operation was attempted
- Preserve stack traces for debugging

### Path Resolution
- All paths must be absolute (validated by parser)
- No path traversal validation (security is out of scope for v1)
- Symlinks followed transparently

### Directory Operations
- `dir_delete` only removes empty directories
- No recursive deletion option (safety)
- `ls` returns flat listing with type info

### Search Operations
- `grep` uses simple substring matching
- Include patterns use glob syntax
- Results include line numbers
- Large file handling: streaming for files >10MB

## Performance Considerations

- File operations are synchronous from caller perspective
- No caching of file contents
- No watch/monitor capabilities
- Each operation is independent

## Encoding

- All text files assumed UTF-8
- Binary files not supported in v1
- Line endings preserved as-is

## Limits

- Max file size: 10MB (from unified-design.yaml)
- No limit on number of operations
- No timeout on individual operations

## Future Considerations

- Batch operations for efficiency
- Binary file support
- File watching/monitoring
- Atomic write operations (write to temp, rename)
- Path validation against allowlist