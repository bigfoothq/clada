# Adapter Covenant

## mapAstNodeToCommand

Maps CSL AST nodes to Clada command objects.

### WRITE operations
- `mapAstNodeToCommand({type: 'WRITE', file: 'test.txt', content: 'hello', line: 1})` → `{type: 'WRITE', payload: {path: 'test.txt', content: 'hello', append: false}}`
- `mapAstNodeToCommand({type: 'WRITE', file: 'log.txt', content: 'data', append: 'true', line: 2})` → `{type: 'WRITE', payload: {path: 'log.txt', content: 'data', append: true}}`
- `mapAstNodeToCommand({type: 'WRITE', file: 'out.txt', content: '', append: 'false', line: 3})` → `{type: 'WRITE', payload: {path: 'out.txt', content: '', append: false}}`

### SEARCH operations (exact mode)
- `mapAstNodeToCommand({type: 'SEARCH', file: 'app.js', pattern: 'foo', replacement: 'bar', line: 4})` → `{type: 'EDIT', payload: {mode: 'exact', path: 'app.js', search: 'foo', replace: 'bar', count: 1}}`
- `mapAstNodeToCommand({type: 'SEARCH', file: 'main.py', pattern: 'old', replacement: 'new', count: '3', line: 5})` → `{type: 'EDIT', payload: {mode: 'exact', path: 'main.py', search: 'old', replace: 'new', count: 3}}`

### SEARCH operations (range mode)
- `mapAstNodeToCommand({type: 'SEARCH', file: 'config.json', pattern: '{', to: '}', replacement: '{}', line: 6})` → `{type: 'EDIT', payload: {mode: 'range', path: 'config.json', searchStart: '{', searchEnd: '}', replace: '{}', count: 1}}`
- `mapAstNodeToCommand({type: 'SEARCH', file: 'test.md', pattern: '<!--', to: '-->', replacement: '', count: '2', line: 7})` → `{type: 'EDIT', payload: {mode: 'range', path: 'test.md', searchStart: '<!--', searchEnd: '-->', replace: '', count: 2}}`

### RUN operations
- `mapAstNodeToCommand({type: 'RUN', content: 'echo hello', line: 8})` → `{type: 'RUN', payload: {command: 'echo hello'}}`
- `mapAstNodeToCommand({type: 'RUN', content: 'npm test', dir: '/app', line: 9})` → `{type: 'RUN', payload: {command: 'npm test', cwd: '/app'}}`

### TASKS operations
- `mapAstNodeToCommand({type: 'TASKS', line: 10, operations: []})` → `null`

### Invalid count handling
- `mapAstNodeToCommand({type: 'SEARCH', file: 'test.js', pattern: 'x', replacement: 'y', count: 'invalid', line: 11})` → `{type: 'EDIT', payload: {mode: 'exact', path: 'test.js', search: 'x', replace: 'y', count: 1}}`