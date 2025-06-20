
# Covenant-Driven Development Guide

## Philosophy

Covenant-Driven Development (CDD) enables 100% LLM-generated codebases through frozen behavioral contracts.

**Core Principles:**

**Mortal Bonds**: Covenants are frozen specs. When requirements change, create new covenants and rewrite (never refactor) all dependent code. This prevents specification drift.  During initial development, however, documentation will be sequentially grown and modified. 

**One File, One Thought**: Each file is self-contained, sized for LLM context windows. Filesystem structure provides navigation—no cross-references needed.

**Test-Driven Structure**: Unit tests live with code, integration tests at boundaries. Tests generated from covenants become frozen truth.

**Hierarchical Visibility**: Parents visible to children, siblings isolated. Components see shared utilities and parent docs, not each other.

**Single Source of Truth**: Each piece of information lives in exactly one place.

This enables LLMs to read, write, test, and maintain entire codebases through clear boundaries and immutable contracts.

## Filesystem Structure

```
myproject/
├── shared/                           # Dependency-free utilities
│   ├── doc/
│   │   ├── ABSTRACT.md              # purpose (< 60 words) and overview (< 300 words)
│   │   ├── API.md                   # Public functions available
│   │   └── TYPES.md                 # Shared data structures
│   ├── src/
│   │   ├── validation.js
│   │   └── formatting.js
│   └── test-unit/
│       ├── cov/
│       │   ├── validation.cov.md    # Frozen behavior contracts
│       │   └── formatting.cov.md
│       └── test/
│           ├── validation.test.js   # Generated from covenants
│           └── formatting.test.js
│
└── main/
    ├── core/                        # Parent-level documentation and logic
    │   ├── doc/
    │   │   ├── ABSTRACT.md          # purpose (< 60 words) and overview (< 300 words)
    │   │   ├── STORY.md             # End-to-end user journeys
    │   │   ├── ARCH.md              # Component interactions
    │   │   ├── API.md               # External interfaces
    │   │   ├── TYPES.md             # Core data structures
    │   │   ├── concepts/            # Domain concepts
    │   │   │   └── authorization.md
    │   │   └── work/
    │   │       ├── background.md
    │   │       └── adr/ ...
    │   ├── src/
    │   │   ├── orchestrator.js      # Main coordination logic
    │   │   └── router.js
    │   └── test-unit/
    │       ├── cov/
    │       │   ├── orchestrator.cov.md
    │       │   └── router.cov.md
    │       └── test/
    │           ├── orchestrator.test.js
    │           └── router.test.js
    │
    ├── components/
    │   ├── auth/                    # Example component
    │   │   ├── shared/              # Component-local utilities
    │   │   │   ├── doc/
    │   │   │   ├── src/
    │   │   │   └── test-unit/
    │   │   └── main/
    │   │       ├── core/
    │   │       │   ├── doc/
    │   │       │   │   ├── ABSTRACT.md
    │   │       │   │   ├── STORY.md
    │   │       │   │   ├── ARCH.md
    │   │       │   │   ├── API.md
    │   │       │   │   └── concepts/
    │   │       │   │       └── tokens.md
    │   │       │   ├── src/
    │   │       │   └── test-unit/
    │   │       ├── components/      # Nested subcomponents
    │   │       │   ├── jwt/
    │   │       │   └── oauth/
    │   │       └── test-intn/       # Auth integration tests
    │   │
    │   └── storage/                 # Another component
    │       └── main/ ...
    │
    └── test-intn/                   # System integration tests
        ├── cov/
        │   └── end-to-end.cov.md
        └── test/
            └── end-to-end.test.js
```

## Visibility Rules

The structure enforces natural visibility boundaries:

1. **Shared visibility**: 
   - `shared/` directories contain dependency-free utilities
   - Visible to all code at their level and below
   - Cannot depend on components

2. **Core visibility**:
   - `core/` documentation is visible to all components at that level
   - Components can see parent `core/doc/` but not sibling components
   - Core cannot see into components

3. **Component isolation**:
   - Components are isolated from siblings
   - Can only see their own content and parent core docs
   - Nested components inherit parent component context

4. **Test boundaries**:
   - `test-unit/` tests individual functions in isolation
   - `test-intn/` tests interactions between components
   - Tests live as close as possible to what they test

## Workflow

- Iterate:
   1. **Explore** → Create rough ideas in optional work directories
   2. **Define** → Write documentation in `doc/` directories
   3. **Hone** → iteratively build documentation for all required components until everything makes sense for the entire component
   4. **Specify** → Create covenants in `test-unit/cov/` with examples
   5. **Generate Tests** → Create tests from covenants in `test-unit/test/`
   6. **Implement** → Write code in `src/` to pass frozen tests
   7. **Integrate** → Add integration tests in `test-intn/`

repeat steps 1-7 as needed while developing the tool to precise specifications and as high level requirements change   

# covenant

the covs.  its like a high level code instructions.... like specificy function signatures or class interface for code we need to make, and then list some example inputs /outputs that we expect

$$$$$$$$$$$$$$$$$$

## Types in CDD Workflow

**Problem**: Types files (TYPES.md) create circular dependencies when written before implementation. You need code to know what types you need, but feel you need types to write code.

**Solution**: Types emerge from implementation, not precede it.

### When to Write TYPES.md

1. **Never during initial development** - Write inline types in implementation files
2. **After first working version** - Extract truly shared types 
3. **Only for cross-component contracts** - Not internal implementation details

### Type Development Workflow

```
1. Write covenant (behavior spec)
   edit.cov.md: "parseEdit extracts path, search, replace from XML node"
   
2. Implement with inline types
   // edit/src/parser.ts
   export function parseEdit(node: any) {  // 'any' is fine initially
     return {
       path: node.getAttribute('path'),
       search: extractCDATA(node, 'search'),
       replace: extractCDATA(node, 'replace')
     }
   }

3. Add types where needed
   type EditFields = {path: string, search: string, replace: string}
   export function parseEdit(node: any): EditFields { ... }

4. Extract shared types after multiple components exist
   // Only if edit, write, move all need TaskBase
   // shared/doc/TYPES.md
   type TaskBase = {globalIndex: number, blockIndex?: number}
```

### Anti-patterns

- Writing types for entire execution flow before any code exists
- Predicting all error cases and states upfront  
- Creating "complete" type hierarchies speculatively
- Conflating behavioral contracts (covenants) with implementation types

### Critical Insight

Covenants describe **what** (behavior), not **how** (implementation). Types are implementation details that emerge during coding, not architectural decisions that precede it.

**Counter-argument**: Strong typing from the start catches design flaws early. However, in practice this leads to over-engineering and analysis paralysis, as seen in your TYPES.md iterations. Better to have working code with loose types than perfect types with no code.

> how do you feel about this?  is it what we've learned? would this approach have helped us?

## Assessment

This approach would have prevented the specific pain we experienced, but it's incomplete.

## What Actually Happened

1. We conflated **protocol types** (CML's 8 errors) with **implementation types** (internal error handling)
2. We tried to model the entire execution pipeline abstractly instead of building one operation
3. We got trapped debating `Element` vs `rawXml` without any code using either

## Would This Have Helped?

Partially. Starting with `write` component would have revealed:
- No need for complex error hierarchies initially
- `node: any` works fine until you need specific methods
- Most "shared" types aren't actually shared

But it misses key insights:

## Missing Guidance

1. **Protocol boundaries need types first** - The CML protocol defines exact input/output shapes. These contracts should be typed immediately, not discovered.

2. **Component interfaces require early typing** - If orchestrator will call `parseEdit()`, that signature matters upfront.

3. **The real problem wasn't timing** - It was scope. We tried typing the entire application flow instead of component boundaries.

## Better Framing

Instead of "types emerge from code," distinguish:
- **Contract types**: Protocol boundaries, component interfaces → Define early
- **Implementation types**: Internal state, helpers → Emerge from code
- **Shared types**: Cross-component data → Extract after duplication appears

Our mistake wasn't writing types early - it was writing the wrong types (implementation details) instead of the right types (component contracts).

> ok so try again with a new section to add to CDD.md to help future users based on what we've learned.


## Types in CDD: Contract vs Implementation

**Problem**: Type definitions can create analysis paralysis when scope is unclear. Writing types for unwritten code forces premature decisions about implementation details.

**Solution**: Distinguish contract types from implementation types.

### Contract Types (Define Early)

1. **Protocol boundaries** - External interfaces that won't change
   ```typescript
   // shared/doc/PROTOCOL_TYPES.md
   type ProtocolError = 'search_not_found' | 'file_not_found' | ...
   type CMLResult = {blocks: number, tasks: number, ...}
   ```

2. **Component interfaces** - How components interact
   ```typescript
   // edit/doc/API.md
   function parseEdit(node: XMLNode): ParsedEdit | ParseError
   function executeEdit(task: ParsedEdit, ctx: Context): Result
   ```

3. **Shared data structures** - Cross-component contracts
   ```typescript
   // shared/doc/TYPES.md  
   type ExecutionContext = {cwd: string, config: Config}
   ```

### Implementation Types (Emerge from Code)

- Internal state representations
- Helper function signatures  
- Intermediate processing types
- Error class hierarchies

### Workflow

1. **Define contract types** from protocol/API specifications
2. **Implement with inline types** using `any` for unknowns
3. **Refine types** as implementation reveals requirements
4. **Extract shared types** only after duplication appears across components

### Anti-pattern Recognition

You're over-engineering types when:
- Debating internal representations before writing code
- Creating abstract type hierarchies without concrete usage
- Trying to model entire execution flows upfront
- Spending more time on types than implementation

### Key Insight

Contract types are promises to other components - define them early. Implementation types are internal details - let them emerge. This distinction prevents both under-typing (missing contracts) and over-typing (premature abstraction).

##############

## Incremental Development

When building new systems, resist documenting all components upfront. Instead:

### Component-First Iteration
1. Pick ONE component (simplest first)
2. Write minimal docs (ABSTRACT.md only)
3. Write minimal covenant (3-5 examples)
4. Generate tests
5. Implement until tests pass
6. Extract shared types/utilities only after duplication appears
7. Repeat for next component

### Documentation Debt
- Keep a `doc/DEBT.md` listing known gaps
- Fill documentation after implementation stabilizes
- Shared docs (ARCH.md, TYPES.md) emerge from patterns, not speculation

### Integration Points
- Define component interfaces minimally (function signatures only)
- Let orchestration patterns emerge from component integration
- Refactor shared contracts after 2-3 components exist

This prevents analysis paralysis while maintaining CDD's architectural clarity.