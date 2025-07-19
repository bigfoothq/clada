=== PROCESSED: 2025-07-19 18:08:02 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/xd5_ref.md
SUCCESS Block 2: Updated /Users/stuart/repos/clada/xd5_ref.md
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/doc/API.md
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/doc/API.md
===

<<<EXPLANATION>>>
Update XD5 reference to include the new status marker system for dependencies and test data, helping LLMs distinguish between planned design work and implemented components.

<<<FILE>>>
/Users/stuart/repos/clada/xd5_ref.md

<<<SEARCH>>>
## Dependencies
[Provisional - updated via STOP protocol when implementation reveals actual needs]

```yaml
dependencies:
  # Initial hypothesis based on design
  proj/comp/payment:
    functions: [validateCard, processRefund]  # May change
    types: [PaymentResult, CardType]
    errors: [PaymentError]
  
  proj/comp/auth:
    functions: [checkPermission, validateToken]
    types: [User, TokenPayload]
  
  proj/comp/logger:
    functions: [logTransaction]  # Audit requirement
  
  proj/comp/payment-types: "*"  # Wildcard for types-only
  
  external/lodash:
    functions: [groupBy, mapValues]
  
  external/@stripe/stripe-js:
    types: [Stripe, PaymentIntent]
    functions: [loadStripe]
```
<<<REPLACE>>>
## Dependencies
[Provisional - updated via STOP protocol when implementation reveals actual needs]

Mark internal component status: [PLANNED], [IN-PROGRESS], or [IMPLEMENTED]
External dependencies do not need status markers.

```yaml
dependencies:
  # Initial hypothesis based on design
  proj/comp/payment:             # [PLANNED]
    functions: [validateCard, processRefund]  # May change
    types: [PaymentResult, CardType]
    errors: [PaymentError]
  
  proj/comp/auth:                # [IMPLEMENTED]
    functions: [checkPermission, validateToken]
    types: [User, TokenPayload]
  
  proj/comp/logger:              # [IN-PROGRESS]
    functions: [logTransaction]  # Audit requirement
  
  proj/comp/payment-types: "*"   # [IMPLEMENTED] Wildcard for types-only
  
  external/lodash:
    functions: [groupBy, mapValues]
  
  external/@stripe/stripe-js:
    types: [Stripe, PaymentIntent]
    functions: [loadStripe]
```
<<<END>>>

<<<EXPLANATION>>>
Add status markers to test-data references in XD5 to distinguish between aspirational test cases and verified ones.

<<<FILE>>>
/Users/stuart/repos/clada/xd5_ref.md

<<<SEARCH>>>
### {functionName}
- **Signature**: `{functionName}(param: Type) -> ReturnType`
- **Purpose**: Single sentence.
- **Throws**: `{ErrorType}` when {condition}
- **Test-data**: `test-data/{path}/{functionName}.json`
<<<REPLACE>>>
### {functionName}
- **Signature**: `{functionName}(param: Type) -> ReturnType`
- **Purpose**: Single sentence.
- **Throws**: `{ErrorType}` when {condition}
- **Test-data**: `test-data/{path}/{functionName}.json` [PLANNED|IMPLEMENTED]
<<<END>>>

<<<EXPLANATION>>>
Fix the incorrect component name (sham-ast-converter vs sham-action-parser) and add status markers to all dependencies in clada's API.md

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
```yaml
dependencies:
  proj/comp/sham-ast-converter:
    functions: [convertToActions]
    types: [CladaAction, ConversionError]
  
  proj/comp/fs-ops:
    functions: [executeFileOperation]
    types: [FileOpResult]
  
  proj/comp/exec:
    functions: [executeCommand]
    types: [ExecResult]
  
  proj/comp/git-tx:
    functions: [ensureCleanRepo, commitChanges]
    types: [GitError]
  
  proj/comp/context:
    functions: [addPath, removePath, listPaths, clearContext]
    types: [ContextError]
  
  external/nesl-js:
    functions: [parseSHAM]
    types: [ShamParseResult, ShamBlock, ShamError]
```
<<<REPLACE>>>
```yaml
dependencies:
  proj/comp/sham-action-parser:  # [IMPLEMENTED]
    functions: [parseShamResponse]
    types: [ParseResult, CladaAction, ParseError]
  
  proj/comp/fs-ops:              # [PLANNED]
    functions: [executeFileOperation]
    types: [FileOpResult]
  
  proj/comp/exec:                # [PLANNED]
    functions: [executeCommand]
    types: [ExecResult]
  
  proj/comp/git-tx:              # [PLANNED]
    functions: [ensureCleanRepo, commitChanges]
    types: [GitError]
  
  proj/comp/context:             # [PLANNED]
    functions: [addPath, removePath, listPaths, clearContext]
    types: [ContextError]
  
  external/nesl-js:
    functions: [parseSham]
    types: [Block, ParseResult, ParseError]
```
<<<END>>>

<<<EXPLANATION>>>
Update the execute method documentation to indicate its test data is planned but not yet implemented

<<<FILE>>>
/Users/stuart/repos/clada/proj/doc/API.md

<<<SEARCH>>>
- **Test-data**: `test-data/execute/`
<<<REPLACE>>>
- **Test-data**: `test-data/execute/` [PLANNED]
<<<END>>>