
# Covenant-Driven Development Guide

## Philosophy

Covenant-Driven Development (CDD) enables 100% LLM-generated codebases through frozen behavioral contracts.

**Core Principles:**

**Mortal Bonds**: Covenants are frozen specs. When requirements change, create new covenants and rewrite (never refactor) all dependent code. This prevents specification drift.

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
│   │   ├── PURPOSE.md               # Why shared utilities exist
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
    │   │   ├── PURPOSE.md           # System purpose (5 lines max)
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
    │   │       │   │   ├── PURPOSE.md
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

1. **Explore** → Create rough ideas in optional work directories
2. **Define** → Write documentation in `doc/` directories
3. **Specify** → Create covenants in `test-unit/cov/` with examples
4. **Generate Tests** → Create tests from covenants in `test-unit/test/`
5. **Implement** → Write code in `src/` to pass frozen tests
6. **Integrate** → Add integration tests in `test-intn/`
