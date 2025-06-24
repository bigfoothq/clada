## Purpose

Clada executes filesystem and runtime commands embedded in LLM output using CSL (Clada Syntax Language), a purpose-built language parsed by a dedicated state-machine parser. It provides deterministic filesystem access and shell command execution for LLM coding agents.

## System Overview

**Input**: Text from stdin containing CSL blocks, parsed by `csl-parser`.

**Execution Model**: 
- Follows the execution model of `csl-parser`:
  - Fatal syntax errors halt all execution.
  - Semantic validation errors are collected; valid operations can still run.
  - Operations within a `<---TASKS--->` block are atomic: if one fails validation, the entire block is skipped.

**Command Types**:
- **File content ops**: 
  - `<---WRITE--->`: Creates/overwrites files
  - `<---SEARCH--->`: Edit operations with mandatory match validation. The `count` parameter specifies the EXACT number of matches expected - if actual matches differ, the operation fails. This ensures the LLM's understanding matches the file content before making changes.  
- **Shell commands**: `<---RUN--->` wrapping whitelisted shell commands
- **Test commands**: Require first-use approval

**Security**:
- No shell interpretation (`execFile` only)
- Path validation prevents traversal
- Resource limits: 5s timeout, 10MB output per command
- Test commands stored in `.clada/allowed-commands.json`

**Git Integration**: Automatic pre/post commits (disable with `--no-git`)

**Output**: Task status prefixed with `[task-N]` where N is the operation number. Format: `[task-N] STATUS: OPERATION - details`. TASKS blocks use sub-numbering like `[task-N.M]`. Status values: SUCCESS, ERROR, SKIP, FATAL.


# CSL cheatsheet

# CSL (Clada Syntax Language) Specification

## Syntax

### Markers
- Start delimiter: `<---` (default, configurable via parser options)
- End delimiter: `--->` (default, configurable via parser options)
- Format: `<---OPERATION attributes--->`
- Must start at beginning of line
- Operation names are case-sensitive (WRITE, RUN, SEARCH, TASKS must be uppercase)
- Attribute names are case-sensitive
- No spaces allowed within operation name or delimiters

### Operations

#### WRITE
Writes content to a file.
```
<---WRITE file="path/to/file.txt"--->
content to write
<---END--->

<---WRITE file="data.csv" append="true"--->
additional content
<---END--->
```

#### RUN
Executes a shell command.
```
<---RUN--->
echo "hello"
<---END--->

<---RUN dir="/working/directory"--->
python script.py
<---END--->
```

#### SEARCH
Finds and replaces content in files.

Single replacement:
```
<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->
```

Multiple replacements:
```
<---SEARCH file="app.js" count="3"--->
oldValue
<---REPLACE--->
newValue
<---END--->


<---SEARCH file="app.js" count="all"--->
oldValue
<---REPLACE--->
newValue
<---END--->
```

Range replacement (inclusive):
```
<---SEARCH file="main.py"--->
def process_data(
<---TO--->
    return result
<---REPLACE--->
def process_data(data, options=None):
    if options is None:
        options = {}
    return process(data, options)
<---END--->
```

#### TASKS
Groups multiple operations.
```
<---TASKS--->
<---WRITE file="src/app.js"--->
console.log("hello");
<---END--->
<---RUN--->
npm install
<---END--->
<---END--->

<---TASKS version="2.0"--->
operations...
<---END--->
```
