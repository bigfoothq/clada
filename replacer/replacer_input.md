=== PROCESSED: 2025-07-21 00:10:14 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/sham-action-parser/doc/API.md
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/doc/API.md
SUCCESS Block 5: Updated /Users/stuart/repos/clada/proj/doc/API.md
SUCCESS Block 6: Updated /Users/stuart/repos/clada/proj/doc/API.md
SUCCESS Block 7: Updated /Users/stuart/repos/clada/proj/doc/API.md
===

<<<EXPLANATION>>>
Update sham-action-parser API.md to reflect actual exports found in audit

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/sham-action-parser/doc/API.md

<<<SEARCH>>>
## Exports
```yaml
exports:
  functions: [parseShamResponse, validateShamBlock, transformToAction]
  types: [ParseResult, CladaAction, ParseError, ValidationResult, TransformError]
  errors: [TransformError]
```
<<<REPLACE>>>
## Exports
```yaml
exports:
  functions: [parseShamResponse, validateShamBlock, transformToAction]
  types: [ParseResult, CladaAction, ParseError, ValidationResult, TransformError]
  classes:
    TransformError:
      extends: Error
```
<<<END>>>

<<<EXPLANATION>>>
Update fs-ops API.md to reflect actual exports and mark as partially implemented

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md

<<<SEARCH>>>
# Component: fs-ops

## Component Type
standard

## Documentation Debt
- [ ] Integration test format is preliminary [IMPLEMENTED]
- [ ] Error handling strategy needs refinement
- [ ] Consider batching operations for efficiency
<<<REPLACE>>>
# Component: fs-ops

## Component Type
standard

## Status
[PARTIALLY IMPLEMENTED] - Only file operations implemented. Directory operations, search operations pending.

## Documentation Debt
- [ ] Integration test format is preliminary [IMPLEMENTED]
- [ ] Error handling strategy needs refinement
- [ ] Consider batching operations for efficiency
<<<END>>>

<<<EXPLANATION>>>
Update fs-ops exports to match actual implementation

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md

<<<SEARCH>>>
## Exports

```yaml
exports:
  functions: [executeFileOperation]
  types: [FileOpResult, FileOpError]
```
<<<REPLACE>>>
## Exports

```yaml
exports:
  functions: [executeFileOperation]
  types: [FileOpResult]
  classes:
    FileOpError:
      extends: Error
```
<<<END>>>

<<<EXPLANATION>>>
Update main project API.md dependencies to include all required types from sham-action-parser

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
  proj/comp/sham-action-parser:  # [IMPLEMENTED]
    functions: [parseShamResponse]
    types: [ParseResult, CladaAction, ParseError]
<<<REPLACE>>>
  proj/comp/sham-action-parser:  # [IMPLEMENTED]
    functions: [parseShamResponse]
    types: [ParseResult, CladaAction, ParseError, ValidationResult, TransformError]
<<<END>>>

<<<EXPLANATION>>>
Update fs-ops dependency to show partial implementation status

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
  proj/comp/fs-ops:              # [PLANNED]
    functions: [executeFileOperation]
    types: [FileOpResult]
<<<REPLACE>>>
  proj/comp/fs-ops:              # [PARTIALLY IMPLEMENTED]
    functions: [executeFileOperation]
    types: [FileOpResult]
    classes:
      FileOpError:
        extends: Error
<<<END>>>

<<<EXPLANATION>>>
Update main project exports to match actual implementation

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
## Exports

```yaml
exports:
  classes:
    Clada:
      methods: [execute]
  types: 
    - ExecutionResult
    - ActionResult  
    - ParseError
    - CladaOptions
```
<<<REPLACE>>>
## Exports

```yaml
exports:
  classes:
    Clada:
      constructor: [options?: CladaOptions]
      methods: [execute]
  types: 
    - ExecutionResult
    - ActionResult  
    - CladaOptions
  # Note: ParseError is re-exported from sham-action-parser
```
<<<END>>>

<<<EXPLANATION>>>
Update test-data path from PLANNED to IMPLEMENTED

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
- **Test-data**: `test-data/execute/` [PLANNED]
<<<REPLACE>>>
- **Test-data**: `test-data/execute/basic-operations.md` [IMPLEMENTED]
<<<END>>>