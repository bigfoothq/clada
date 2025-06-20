20250119

# Orchestrator API

Minimal contracts for component interaction.

## Component Interface

Each component exports:

```typescript
// Parse XML node into task data
function parse(node: any): {type: string, [key: string]: any}

// Execute task with current context
function execute(task: any, context: {cwd: string}): {success: boolean, error?: string}
```