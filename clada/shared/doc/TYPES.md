# Type Definitions

## Task Types
```typescript
// Base fields for all tasks
type TaskBase = {
  blockIndex?: number      // <tasks> block index (undefined = standalone)
  taskIndex: number        // 0-based internal (display adds 1)
  node: Element           // DOM node for --error-detail=full
}

type EditTask = TaskBase & {
  type: 'edit'
  path: string
  search: string
  replace: string
}

type WriteTask = TaskBase & {
  type: 'write'
  path: string
  content: string
}

type MoveTask = TaskBase & {
  type: 'move'
  from: string
  to: string
}

type RemoveTask = TaskBase & {
  type: 'remove'
  path: string
}

type RunTask = TaskBase & {
  type: 'run'
  command: string
  dir?: string
}

type Task = EditTask | WriteTask | MoveTask | RemoveTask | RunTask
```

## Result Types
```typescript
type Result<T> = 
  | {ok: true, value: T}
  | {ok: false, error: ErrorCode, message: string}

type ErrorCode = 
  // CML Protocol errors
  | 'search_not_found'
  | 'file_not_found' 
  | 'permission_denied'
  | 'symlink_not_allowed'
  | 'exec_timeout'
  | 'exec_failed'
  | 'path_escape'
  | 'malformed_xml'
  // Additional internal errors
  | 'empty_path'
  | 'invalid_utf8'
  | 'lock_timeout'
  | 'git_failed'

type TaskResult = {
  taskIndex: number
} & (
  | {ok: true}
  | {ok: false, error: ErrorCode, message: string}
)

type BlockResult = {
  blockIndex: number
  status: 'success' | 'failed'
  tasks: TaskResult[]
}

type ExecutionResult = {
  blocks: BlockResult[]
  totalTasks: number
  succeeded: number
  failed: number
}
```

## State Types
```typescript
type ExecutionState = {
  cwd: string            // Current working directory (only mutable state)
}

type OutputHandler = {
  write(taskIndex: number, text: string): void  // Handles [task-N:exec] prefixing
  error(taskIndex: number, error: ErrorCode, message: string): void
}
```

## Configuration Types
```typescript
type RunResult = {
  exitCode: number
  truncated: boolean
}

type Config = {
  timeout: number        // Per-command timeout in ms
  totalTimeout?: number  // Overall execution timeout in ms
  maxOutput: number      // Bytes per task
  outputMode: 'stream' | 'buffer' | 'silent'
  git: boolean
  gitAuthor: string
  allowEscape: boolean
  lockFile?: string
  lockTimeout: number    // ms
  errorDetail: 'minimal' | 'full' | 'debug'
}
```

##############

## Critical issues

**1. `node: Element` type doesn't exist**
- Need to import DOM types or use `any`
- Alternative: Store raw XML string for error display

**2. `OutputHandler` interface incomplete**
- Missing `success(taskIndex: number, message: string)` for non-run tasks
- No way to handle stdout vs stderr distinction
- Protocol shows `[task-N]` and `[task-N:exec]` prefixes - need different handling

**3. `RunResult` in wrong section**
- It's a result type, not configuration
- Missing connection to `TaskResult` union

**4. Missing critical types**
- Parser output format (extracted tasks + remaining text?)
- Error details for `--error-detail=full` mode
- Lock file structure

## Alternative framing

Instead of complex type hierarchies, consider protocol-driven minimalism:

```typescript
type Task = {
  type: string
  xml: string  // For error reporting
  index: number
  block?: number
  [key: string]: any  // Operation-specific fields
}

type Output = (line: string) => void
```

Parse lazily, validate at execution. Types become documentation rather than enforcement.

**Counter-proposal**: Current types mostly correct but need:
1. Import Element type properly
2. Move RunResult to correct section
3. Add `OutputHandler.success()` method
4. Define XML parser return type

The structured approach helps catch errors at compile time vs runtime. Worth the complexity for a tool handling filesystem operations.

############

## Round 1

**Previous analysis**: Identified `Element` type issue, incomplete `OutputHandler`, misplaced `RunResult`. Suggested lazy parsing alternative.

**Document review**: 
- Protocol: `[task-1] Success: created file.txt` and `[task-2:exec] npm install output...`
- ABSTRACT: "htmlparser2 parses entire input as XML with `xmlMode: true`"
- htmlparser2 returns custom DOM-like objects, not standard DOM Element

**Critical analysis**: 
- `node: Element` is wrong - htmlparser2 has own node types
- `OutputHandler` conflates success messages with stdout streaming
- Protocol shows two distinct output patterns: status messages vs exec output

**Self-reflection**: Trying to create universal OutputHandler when protocol has different output modes per operation type.

## Round 2

**Re-examination**: Task storage of DOM node creates circular reference issues in error reporting. Need serializable types for clean error output.

**Document details**:
- Protocol: "Output Format" section shows structured result XML at end
- "Line-buffered with `[task-N:exec]` prefix per line"
- Git operations are "best-effort" - no result type needed

**Analysis**: 
- Output is two-phase: streaming during execution, structured XML after
- `RunResult` unnecessary - TaskResult with exit code in message suffices
- Missing: How to accumulate output for `--output-mode=buffer`

**Self-reflection**: Over-abstracting output handling. Just use console.log with prefixes.

## Round 3

**Final review**: Types should mirror protocol's simplicity.

**Document findings**:
- Protocol defines 8 error types exactly
- Task numbering: 0-based internal, 1-based display
- No type information in protocol - just field presence

**Analysis**: TypeScript types are development aid, not runtime validation. Keep minimal.

**Self-reflection**: Structured types help catch integration errors between components. Worth complexity.

## Unresolved Uncertainties & Decisions

1. **DOM node storage**
   - Store `rawXml: string` instead of node reference
   - Simpler serialization, no circular refs

2. **Output handling**
   - Direct console.log/error in operations
   - Orchestrator adds prefixes via stdout interception

3. **Additional error codes**
   - Remove `empty_path`, `invalid_utf8`, `lock_timeout`, `git_failed`
   - Map internal errors to protocol's 8 types

4. **Type imports**
   - Use `any` for htmlparser2 nodes in parser
   - Task types contain only primitives

5. **RunResult**
   - Delete it
   - Exit codes go in error message string

## Final Types

```typescript
type Task = {
  type: 'edit' | 'write' | 'move' | 'remove' | 'run'
  rawXml: string          // For --error-detail=full
  taskIndex: number       // 0-based
  blockIndex?: number
  // Operation fields via discriminated union
}

type TaskResult = {
  taskIndex: number
} & (
  | {ok: true}
  | {ok: false, error: ErrorCode, message: string}
)

// Only 8 protocol error codes
type ErrorCode = 'search_not_found' | 'file_not_found' | 'permission_denied' 
  | 'symlink_not_allowed' | 'exec_timeout' | 'exec_failed' | 'path_escape' 
  | 'malformed_xml'
```

## Summary

Current TYPES.md overengineered. Protocol defines exactly 8 error types and simple output format. Internal abstractions (OutputHandler, RunResult, extra error codes) add complexity without value. Store raw XML strings, use console directly, map all errors to protocol's 8 types.

############

Replace. Current structure has fundamental misunderstandings:

1. **Element type doesn't exist** - htmlparser2 returns custom objects
2. **Extra error codes violate protocol** - Only 8 defined
3. **OutputHandler abstraction unnecessary** - Console.log suffices
4. **RunResult redundant** - Exit codes go in message strings

## New TYPES.md

```typescript
# Type Definitions

## Task Types
```typescript
type TaskBase = {
  type: 'edit' | 'write' | 'move' | 'remove' | 'run'
  rawXml: string          // For --error-detail=full
  taskIndex: number       // 0-based (display adds 1)
  blockIndex?: number     // undefined = standalone task
}

type Task = TaskBase & (
  | {type: 'edit', path: string, search: string, replace: string}
  | {type: 'write', path: string, content: string}
  | {type: 'move', from: string, to: string}
  | {type: 'remove', path: string}
  | {type: 'run', command: string, dir?: string}
)
```

## Result Types
```typescript
type Result<T> = 
  | {ok: true, value: T}
  | {ok: false, error: ErrorCode, message: string}

// Exactly 8 protocol-defined errors
type ErrorCode = 
  | 'search_not_found'
  | 'file_not_found' 
  | 'permission_denied'
  | 'symlink_not_allowed'
  | 'exec_timeout'
  | 'exec_failed'
  | 'path_escape'
  | 'malformed_xml'

type TaskResult = {
  taskIndex: number
} & (
  | {ok: true}
  | {ok: false, error: ErrorCode, message: string}
)

type BlockResult = {
  blockIndex: number
  status: 'success' | 'failed'
  tasks: TaskResult[]
}
```

## State Types
```typescript
type ExecutionState = {
  cwd: string            // Only mutable state
}
```

## Configuration Types
```typescript
type Config = {
  timeout: number        // ms
  totalTimeout?: number  
  maxOutput: number      // bytes
  outputMode: 'stream' | 'buffer' | 'silent'
  git: boolean
  gitAuthor: string
  allowEscape: boolean
  lockFile?: string
  lockTimeout: number
  errorDetail: 'minimal' | 'full' | 'debug'
}
```
```

**Alternative**: Keep hierarchical types but fix errors. This flat discriminated union is cleaner but loses TypeScript narrowing on task.type.

##############

## Round 1

**Previous stance**: Flatten to discriminated union, remove Element type, reduce to 8 protocol errors.

**Document analysis**:
- Protocol shows `<task index="3" status="error">` in result XML - needs per-task status tracking
- ABSTRACT: "DomUtils extracts all `<tasks>` elements" - implies keeping DOM nodes through parsing phase
- Protocol: "Error: search_not_found in app.js (found 2 matches)" - error messages need context

**Critical analysis**: Flattened union loses type narrowing. When you have `task: Task`, TypeScript can't narrow fields based on `task.type` check with flat union. Hierarchical preserves narrowing.

**Self-reflection**: Oversimplified. DOM nodes useful during parsing phase, just don't persist to execution.

## Round 2

**Re-examination**: "8 protocol errors" claim wrong. Protocol defines error types for output, but internal operations need finer distinctions that map to protocol errors.

**Document evidence**:
- Git operations can fail - need internal tracking even if mapped to generic error
- Lock acquisition can timeout - distinct from exec_timeout
- Path validation has empty path case - maps to path_escape but semantically different

**Analysis**: Two-layer error design needed: internal errors for debugging, protocol errors for output. Internal `empty_path` maps to protocol `path_escape`.

**Self-reflection**: Conflating internal design with external protocol. Need translation layer.

## Round 3

**Final review**: `rawXml` storage problematic for large files. Protocol allows huge `<write>` content blocks.

**Document check**:
- "Memory scales with input size" - already accepting memory cost
- `--error-detail=full` shows task XML - need some representation
- `--max-output=10MB` suggests large content expected

**Analysis**: Storing full XML for every task wasteful. Alternative: store just enough for error display (first/last 100 chars + length).

**Self-reflection**: Perfect error messages less important than memory efficiency.

## Unresolved & Decisions

1. **Task type structure**
   - **Keep hierarchical** - TypeScript narrowing worth complexity
   - Flat union breaks type safety

2. **Error layering**
   - **Internal error types** → Protocol error codes
   - Example: `EmptyPathError` → `path_escape`
   - Enables better debugging while conforming to protocol

3. **XML storage for errors**
   - **Store truncated**: `xmlPreview: string` (first 200 chars)
   - Full XML only for `--error-detail=debug`

4. **DOM node handling**
   - **Parser phase**: Keep nodes for extraction
   - **Execution phase**: Only primitives
   - Never store nodes in Task objects

5. **Missing execution details**
   - Need `stdout?: string` in TaskResult for buffered mode
   - Need `startedAt?: number` for timeout calculations

## Final Recommendation

```typescript
# Type Definitions

## Task Types
```typescript
type TaskCommon = {
  taskIndex: number       // 0-based internal
  blockIndex?: number     // undefined = standalone
  xmlPreview: string      // First 200 chars for errors
}

type EditTask = TaskCommon & {
  type: 'edit'
  path: string
  search: string
  replace: string
}

// ... other task types maintain structure

type Task = EditTask | WriteTask | MoveTask | RemoveTask | RunTask
```

## Result Types
```typescript
// Internal errors (rich types)
class EmptyPathError extends Error {}
class InvalidUtf8Error extends Error {}
// ... etc

// Protocol errors (exact 8)
type ErrorCode = 'search_not_found' | 'file_not_found' | 'permission_denied' 
  | 'symlink_not_allowed' | 'exec_timeout' | 'exec_failed' | 'path_escape' 
  | 'malformed_xml'

// Translation layer
function toProtocolError(error: Error): ErrorCode {
  if (error instanceof EmptyPathError) return 'path_escape'
  if (error instanceof InvalidUtf8Error) return 'file_not_found'
  // ... etc
}

type TaskResult = {
  taskIndex: number
  stdout?: string        // For buffered mode
} & (
  | {ok: true}
  | {ok: false, error: ErrorCode, message: string}
)
```

## Summary

Original types closer to correct than "simplified" version. Need:
1. Hierarchical task types for TypeScript narrowing
2. Two-layer error design (internal → protocol)
3. Truncated XML storage for memory efficiency
4. Optional stdout in results for buffered mode

Flat unions and "only 8 errors" are false simplifications that lose type safety and debugging capability.

###################
###################
###################
###################
###################


## Assessment

We're overthinking. The attachment shows analysis paralysis - multiple rounds debating `Element` vs `rawXml`, whether to have 8 or more error codes, etc. Meanwhile, basic execution flow types are missing.

## Core Problems

1. **Wrong focus**: Debating implementation details before modeling the domain
2. **Missing basics**: No types for parser output, execution planning, or result accumulation
3. **Premature optimization**: Worrying about memory for XML storage before having working types
4. **Protocol confusion**: Mixing internal design with external constraints

## Path Forward

**Option A: Domain-first**
```typescript
// Start with what we're modeling
type CMLDocument = {
  blocks: TaskBlock[]
  standaloneTasks: Task[]
}

type TaskBlock = {
  version?: string
  tasks: Task[]
}

// Then execution flow
type ExecutionPlan = {
  document: CMLDocument
  context: ExecutionContext
}
```

**Option B: Protocol-driven**
Start from the output format and work backwards:
```typescript
// What must we produce?
type ProtocolResult = {
  blocks: number
  tasks: number
  succeeded: number
  failed: number
  blockDetails: BlockDetail[]
}

// What do we need to track to produce this?
```

## Recommendation

1. **Stop iterating on details**. The `Element` vs `rawXml` debate doesn't matter until we have the overall structure.

2. **Write types for the happy path first**:
   - Parse input → Execute tasks → Generate output
   - Add error handling after basic flow works

3. **Test-driven**: Write example inputs/outputs from CML_Protocol.md, then design types that can represent those transformations.

## Alternative Framing

Instead of a types file, write the execution pipeline as code with inline types:
```typescript
function execute(input: string): string {
  const parsed = parse(input)  // forces us to type parser output
  const plan = plan(parsed)     // forces execution plan types
  const result = run(plan)      // forces result types
  return format(result)         // forces output types
}
```

Then extract types after the flow is clear.

**The current approach is backwards** - trying to define all types upfront without coding the actual transformation pipeline.

## Next Steps

1. **Delete current TYPES.md thinking**. It's overthinking details before basics.

2. **Write the simplest valid types that enable execution**:

```typescript
// Parser output
type ParsedDocument = {
  blocks: ParsedBlock[]
  standaloneTasks: ParsedTask[]
}

type ParsedBlock = {
  index: number
  tasks: ParsedTask[]
}

type ParsedTask = {
  type: 'edit' | 'write' | 'move' | 'remove' | 'run'
  globalIndex: number  // 0-based across document
  blockIndex?: number  // undefined if standalone
  [key: string]: any   // operation-specific fields
}

// Execution
type ExecutionResult = {
  ok: boolean
  error?: string
  protocolError?: ProtocolError
}

// Just the 8 protocol errors
type ProtocolError = 'search_not_found' | 'file_not_found' | 'permission_denied' 
  | 'symlink_not_allowed' | 'exec_timeout' | 'exec_failed' | 'path_escape' 
  | 'malformed_xml'
```

3. **Implement parser.js first** using these minimal types. The parser will reveal what types are actually needed.

4. **Add types as parser reveals needs**:
- Need to store XML for errors? Add it when implementing `--error-detail`
- Need execution context? Add it when implementing state persistence
- Need output accumulation? Add it when implementing buffered mode

The current approach tries to predict all needs upfront. Instead: implement, discover requirements, type what's needed.

**Critical insight**: Your CML_Protocol.md is complete. It defines all behavior. Types should be the minimal set that enables implementing that protocol, discovered through implementation, not predicted through analysis.

##########

No, that's not the final TYPES.md - it's just the starting point. Several issues:

1. **ParsedTask type is too loose** - `[key: string]: any` breaks TypeScript's value proposition. Need proper discriminated union:

```typescript
type ParsedTask = 
  | {type: 'edit', globalIndex: number, blockIndex?: number, path: string, search: string, replace: string}
  | {type: 'write', globalIndex: number, blockIndex?: number, path: string, content: string}
  | {type: 'move', globalIndex: number, blockIndex?: number, from: string, to: string}
  | {type: 'remove', globalIndex: number, blockIndex?: number, path: string}
  | {type: 'run', globalIndex: number, blockIndex?: number, command: string, dir?: string}
```

2. **ExecutionResult too simple** - protocol shows task-level results need tracking:

```typescript
type TaskResult = {
  globalIndex: number
  success: boolean
  errorType?: ProtocolError
  errorMessage?: string
}
```

3. **Missing execution context** - ABSTRACT.md states "Working directory changes persist":

```typescript
type ExecutionContext = {
  cwd: string
  config: Config
}
```

4. **Missing final output structure** - need types that map to the XML result format shown in protocol.

But yes, this incremental approach is better than the analysis paralysis in the attachment. Start with these, implement parser, discover what's missing through implementation rather than speculation.

###########

```typescript
# Type Definitions

## Parser Output
```typescript
type ParsedDocument = {
  blocks: ParsedBlock[]
  standaloneTasks: ParsedTask[]
}

type ParsedBlock = {
  index: number
  tasks: ParsedTask[]
  version?: string
}

type ParsedTask = 
  | {type: 'edit', globalIndex: number, blockIndex?: number, path: string, search: string, replace: string}
  | {type: 'write', globalIndex: number, blockIndex?: number, path: string, content: string}
  | {type: 'move', globalIndex: number, blockIndex?: number, from: string, to: string}
  | {type: 'remove', globalIndex: number, blockIndex?: number, path: string}
  | {type: 'run', globalIndex: number, blockIndex?: number, command: string, dir?: string}
```

## Execution Types
```typescript
type ExecutionContext = {
  cwd: string
  config: Config
}

type Config = {
  timeout: number          // ms
  maxOutput: number        // bytes
  outputMode: 'stream' | 'buffer' | 'silent'
  git: boolean
  gitAuthor: string
  allowEscape: boolean
  errorDetail: 'minimal' | 'full' | 'debug'
}

type TaskResult = {
  globalIndex: number
  success: boolean
  errorType?: ProtocolError
  errorMessage?: string
}

type BlockResult = {
  index: number
  status: 'success' | 'failed'
  taskResults: TaskResult[]
}
```

## Protocol Types
```typescript
type ProtocolError = 
  | 'search_not_found'
  | 'file_not_found' 
  | 'permission_denied'
  | 'symlink_not_allowed'
  | 'exec_timeout'
  | 'exec_failed'
  | 'path_escape'
  | 'malformed_xml'

type FinalResult = {
  blocks: number
  tasks: number
  succeeded: number
  failed: number
  blockResults: BlockResult[]
}
```
```

**Missing but deferrable**:
- XML storage for error details
- Output accumulation for buffered mode  
- Git operation results
- Lock file handling

**Critical flaw**: No Result<T,E> pattern despite architecture decision stating "never throw". Add when implementing components.