# Orchestrate Covenant

## orchestrate(cslText, context) → Promise<void>

Parses CSL text and executes operations in order. Skips invalid operations while continuing with valid ones.

Parameters:
- cslText: string containing CSL operations
- context: {workingDir: string}

### Example 1: Single valid WRITE operation
Input:
```
<---WRITE file="test.txt"--->
hello world
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/test.txt` with content "hello world"
- Logs: `[task-1] SUCCESS: WRITE completed`

### Example 2: Multiple WRITE operations execute in order
Input:
```
<---WRITE file="first.txt"--->
one
<---END--->
<---WRITE file="second.txt"--->
two
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/first.txt` with content "one"
- Creates `/tmp/test/second.txt` with content "two"
- Logs: `[task-1] SUCCESS: WRITE completed`
- Logs: `[task-2] SUCCESS: WRITE completed`

### Example 3: Invalid operation is skipped
Input:
```
<---WRITE file="good.txt"--->
valid
<---END--->
<---WRITE--->
missing file attribute
<---END--->
<---WRITE file="also-good.txt"--->
more valid
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/good.txt` with content "valid"
- Creates `/tmp/test/also-good.txt` with content "more valid"
- Logs: `[task-1] SUCCESS: WRITE completed`
- Logs: `[task-2] SKIP: WRITE - Missing required attribute: file`
- Logs: `[task-3] SUCCESS: WRITE completed`

### Example 4: TASKS block with all valid operations
Input:
```
<---TASKS--->
<---WRITE file="one.txt"--->
1
<---END--->
<---WRITE file="two.txt"--->
2
<---END--->
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/one.txt` with content "1"
- Creates `/tmp/test/two.txt` with content "2"
- Logs: `[task-1.1] SUCCESS: WRITE completed`
- Logs: `[task-1.2] SUCCESS: WRITE completed`

### Example 5: TASKS block skipped if any operation invalid
Input:
```
<---TASKS--->
<---WRITE file="one.txt"--->
1
<---END--->
<---WRITE--->
missing file
<---END--->
<---WRITE file="three.txt"--->
3
<---END--->
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- No files created
- Logs: `[task-1] SKIP: TASKS - Contains validation errors`

### Example 6: Execution error handling
Input:
```
<---WRITE file="../escape.txt"--->
content
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- No file created
- Logs: `[task-1] ERROR: WRITE - Path escapes working directory`

### Example 7: Fatal syntax error
Input:
```
<---WRITE file="test.txt"
unclosed tag
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Logs: `[FATAL] Syntax Error: Unexpected end of input while parsing WRITE operation`
- Process exits with code 1

### Example 8: Mixed WRITE operations with append
Input:
```
<---WRITE file="log.txt"--->
line 1
<---END--->
<---WRITE file="log.txt" append="true"--->
line 2
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/log.txt` with content "line 1\nline 2"
- Logs: `[task-1] SUCCESS: WRITE completed`
- Logs: `[task-2] SUCCESS: WRITE completed`

### Example 9: SEARCH operation not implemented
Input:
```
<---WRITE file="test.txt"--->
content
<---END--->
<---SEARCH file="test.txt"--->
old
<---REPLACE--->
new
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates `/tmp/test/test.txt` with content "content"
- Logs: `[task-1] SUCCESS: WRITE completed`
- No log for task-2 (SEARCH operation skipped - executeEdit not implemented)

### Example 10: Empty CSL text
Input: ``
Context: `{workingDir: "/tmp/test"}`
Side effects: None

### Example 11: Mixed operations with TASKS block
Input:
```
<---WRITE file="first.txt"--->
content
<---END--->
<---TASKS--->
<---WRITE file="second.txt"--->
content2
<---END--->
<---WRITE file="third.txt"--->
content3
<---END--->
<---END--->
<---WRITE file="fourth.txt"--->
content4
<---END--->
```
Context: `{workingDir: "/tmp/test"}`
Side effects:
- Creates all four files
- Logs: `[task-1] SUCCESS: WRITE completed`
- Logs: `[task-2.1] SUCCESS: WRITE completed`
- Logs: `[task-2.2] SUCCESS: WRITE completed`
- Logs: `[task-3] SUCCESS: WRITE completed`