# Listener Design Updates

## Key Design Decisions

### Output Size Limits
- **MAX_SINGLE_OUTPUT**: 50KB per action output
- **MAX_TOTAL_OUTPUT**: 200KB for all actions combined
- When single action exceeds limit: Return error instead of truncating
- When total exceeds limit: Copy only summary to clipboard, not full output
- Rationale: Truncation confuses LLMs. Better to error clearly.

### Hash Computation
- Hash the file content after stripping prepended summary section
- Look for "=== END ===" to identify summary boundary
- Parse errors won't trigger re-execution (content unchanged)

### Output Display Rules
- Orchestrator returns formatted results
- Listener passes through orchestrator's summary and output sections
- No need to load unified-design.yaml (orchestrator handles display rules)

### Error State Management
- Wrap all processing in try/finally to ensure isProcessing resets
- Prevents stuck state if process crashes mid-execution

### Execution Cooldown
- Add 2-second cooldown after execution completes
- Prevents prepend-trigger-reprocess loop
- Check: `if (Date.now() - state.lastExecutionTime < 2000) return;`

### Component Dependencies
- Listener only depends on orchestrator for execution
- No direct schema or parser dependencies
- Clean separation of concerns

### Clipboard Behavior
- Copy full output if under MAX_TOTAL_OUTPUT
- Copy summary only if total output exceeds limit
- Update first line with clipboard status after copy attempt

### Line Count Display
- Omit line counts from exec output display (not useful for LLM)
- Show actual stdout/stderr content based on output_display rules

## Remaining Open Questions

1. Schema loading timeout handling in listener
2. File path for .clada-output-latest.txt when input file is read-only directory
3. Handling of binary output from exec (detect and error?)

## Implementation Notes

- Use fs.watchFile with 500ms polling (intentional coalescing)
- Single atomic prepend operation (not separate updateFirstLine)
- Error messages remain deterministic (no timestamps)