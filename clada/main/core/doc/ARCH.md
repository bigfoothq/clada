# Architecture

## Execution Flow
1. CLI parses arguments
2. Read stdin to string

get commands from csl-parser //TODO update this doc to describe this better

6. Git commit (if enabled)
7. Execute each block sequentially:
   - Execute tasks within block sequentially
   - Abort block on first error
   - Continue to next block regardless
8. Git commit (if enabled)
9. Format and output results

## State Threading
- Working directory changes persist across all tasks
- No isolation between tasks or blocks
- Process environment inherited by all child processes

## Component Integration
- Orchestrator imports each operation component directly
- No dynamic discovery or registration
- Each component exports parse and execute functions