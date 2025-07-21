# Error Message Migration - In Progress

## Status: ACTIVE MIGRATION

We are migrating from Node.js-specific error strings to semantic, LLM-optimized messages.

### Before (Node.js coupling)
```
"ENOENT: no such file or directory, unlink '/tmp/ghost.txt'"
"EACCES: permission denied, open '/root/file.txt'"
```

### After (Semantic messages)
```
"Cannot delete '/tmp/ghost.txt': file does not exist"
"Cannot write to '/root/file.txt': permission denied"
```

## Migration Scope

- [x] formatNodeError exists but will be replaced
- [ ] Create toSemanticError function
- [ ] Update all operation handlers
- [ ] Update all test expectations
- [ ] Remove formatNodeError

## Why This Migration

1. **Platform independence**: EROFS/EACCES/EPERM → "permission denied"
2. **LLM clarity**: Codes like ENOENT meaningless to AI
3. **Stability**: Node.js error format changes won't break us
4. **Testability**: Test semantics, not implementation details

## During Migration

Some tests may use old format, some new. Check ERROR_MIGRATION.md timestamp.