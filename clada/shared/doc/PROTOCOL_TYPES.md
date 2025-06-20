20250119

# Protocol Type Definitions

Types defined by the CML Protocol v1.0.0 specification.

## Error Types

```typescript
type ProtocolError = 
  | 'search_not_found'    // 0 or 2+ matches in edit
  | 'file_not_found'      // Path doesn't exist
  | 'permission_denied'   // Filesystem access denied
  | 'symlink_not_allowed' // Operation through symlink
  | 'exec_timeout'        // Command exceeded timeout
  | 'exec_failed'         // Non-zero exit code
  | 'path_escape'         // Path outside CWD without --allow-escape
  | 'malformed_xml'       // Invalid CML syntax
```

## Result Format

```typescript
type CMLResult = {
  blocks: number
  tasks: number
  succeeded: number
  failed: number
}
```