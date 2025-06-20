
and as we build out clada, save notes to CDD on how we can improve.  as we try to use it in practice.  main TLDR its impractical to try to design the whole thing at once.  i think honestly we should NOT design the TYPES.md first.  .... do the high level design and arch stuff.  design the cross-cutting API and or public api, then start building a componetn starting w cov... then write test and code... and while writing code, we see what types we actually need.  they emerge from code-writing process as we're trying to write the code to conform to the tests. 

TODO ... here's a thoguth... we need like ... "blind cov" that we write before writing the code... or like bilnd tests too.... so we make an exhaustive set of covs and tests... then write the code to pass the tests... but then once that's all done, we test it against hte blind tests that have been hidden from us during the code development... and hopefully they all pass... if not, we have a major problem and need to see what went wrong.... like in the worst case the code could jsut be a bunch of stupid if then cases to maek sure it always spit out the fixed expectations of the tests.... we could prevent this by having variability in the tests tho.... maybe that shoudl be a core tenet of CDD actually... not fixed intput/output.... non-deterministic tests... is that crazy???  i think its necessary tbh.  to really trust the LLM is writing effective code.... without actually reading the code by myself or another LLM... hmmm....  this is probably too much extra effort... better just to have a few static blind tests... or create a few more after the code is written (blind to the code ofc.... )



#########

need to update cdd.md file structure... it used wrong paths :


https://claude.ai/chat/01b4bdfb-43b1-49e4-98fa-750bec5ad9c8
That path reveals several structural decisions:

```
clada/main/components/write/main/core/test-unit/test/parse.test.js
```

Breaking it down:
- `clada/` - project root (not "chunker")
- `main/` - top-level main directory
- `components/write/` - write component
- `main/core/` - write component has internal main/core structure
- `test-unit/test/` - unit test location

This differs from CDD.md's example structure in two ways:

1. **Extra `main/` at project root** - CDD shows `myproject/shared/` and `myproject/main/`, not `myproject/main/components/`

2. **Component internal structure** - Your path shows components have their own `main/core/` subdirectories, which CDD reserves for parent-level coordination

Two interpretations:
1. You've adapted CDD for your needs
2. There's a misunderstanding of the structure

The CDD example suggests simpler paths:
```
clada/components/write/test-unit/test/parse.test.js
```

But if you've already established this deeper structure, the tests should follow it. The key question: does `write/main/core/` contain the actual parser/executor implementations? If so, the test location makes sense - tests live near the code they test.