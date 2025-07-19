=== PROCESSED: 2025-07-19 16:07:13 ===
ERROR Block 1: File not found: `/Users/stuart/repos/clada/unified-design.yaml`
===

<<<EXPLANATION>>>

Fix indentation error in `unified-design.yaml` that causes test failures. The `returns` block under the `ls` tool has an inline object description that violates YAML syntax. Replace it with a quoted string to maintain compatibility with your schema parser and resolve the parsing issue.

<<<FILE>>>

`/Users/stuart/repos/clada/unified-design.yaml`

<<<SEARCH>>>
returns:
success: boolean
data?: array of {name: string, type: file|directory, size: integer, modified: timestamp}
error?: string
<<<REPLACE>>>
returns:
success: boolean
data?: "array of {name: string, type: file|directory, size: integer, modified: timestamp}"
error?: string
<<<END>>>
