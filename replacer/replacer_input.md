=== PROCESSED: 2025-07-21 15:56:38 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
===

Right. The implementation's consistent shape is correct. Need to update test expectations to match.

Already fixed the "invalid language" test case above. Need to check if other test cases have the same inconsistency:

Looking at the test data files:
- `formatExecResult.json` - already includes all fields consistently
- `executeCommand.json` - just fixed the one case
- `buildSpawnOptions.json` - doesn't deal with ExecResult
- `mapLanguageToCommand.json` - doesn't deal with ExecResult

The integration tests might have similar issues. Let me check the expected outputs in the `.cases.md` files for any that expect errors without stdout/stderr fields.

<<<EXPLANATION>>>
Update integration test expectation for missing interpreter to include stdout/stderr
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
<<<SEARCH>>>
```json
{
  "success": false,
  "error": "exec: python3 not found in PATH (ENOENT)"
}
```
<<<REPLACE>>>
```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: python3 not found in PATH (ENOENT)"
}
```
<<<END>>>

<<<EXPLANATION>>>
Update integration test expectation for invalid working directory
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
<<<SEARCH>>>
```json
{
  "success": false,
  "error": "exec: Working directory does not exist '/nonexistent/directory/path' (ENOENT)"
}
```
<<<REPLACE>>>
```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Working directory does not exist '/nonexistent/directory/path' (ENOENT)"
}
```
<<<END>>>

<<<EXPLANATION>>>
Update integration test expectation for unsupported language
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/integration/exec_errors.cases.md
<<<SEARCH>>>
```json
{
  "success": false,
  "error": "exec: Unsupported language 'rust' (LANG_UNSUPPORTED)"
}
```
<<<REPLACE>>>
```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Unsupported language 'rust' (LANG_UNSUPPORTED)"
}
```
<<<END>>>

That should align all test expectations with the consistent ExecResult shape.