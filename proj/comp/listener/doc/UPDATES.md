# Listener Design Updates

## Key Design Decisions

### Output Size Limits
- **MAX_SINGLE_OUTPUT**: 50KB per action output
- **MAX_TOTAL_OUTPUT**: 200KB for all actions combined
- When single action exceeds limit: Return error instead of truncating
- When total exceeds limit: Copy only summary to clipboard, not full output
- Rationale: Truncation confuses LLMs. Better to error clearly.

### Hash Computation
- Hash the entire parse result (actions + errors) as JSON
- Parse errors create new hashes → re-execution on fix
- This is intentional: LLM gets feedback about what went wrong

### Output Display Rules
- Listener loads unified-design.yaml at startup
- Checks each action's output_display rule (always/never/conditional)
- For conditional: Check action.parameters.return_output (default true)
- Orchestrator returns everything; listener curates for LLM

### Error State Management
- Wrap all processing in try/finally to ensure isProcessing resets
- Prevents stuck state if process crashes mid-execution

### Execution Cooldown
- Add 2-second cooldown after execution completes
- Prevents prepend-trigger-reprocess loop
- Check: `if (Date.now() - state.lastExecutionTime < 2000) return;`

### Component Dependencies
- Listener directly loads unified-design.yaml (circular deps are fine)
- No need for separate action-registry component
- Both sham-action-parser and listener load schema independently

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