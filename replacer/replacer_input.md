=== PROCESSED: 2025-07-22 14:05:12 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/unified-design.yaml
===

Looking at the code, I need to add `file_read_numbered` to the unified-design.yaml schema so the SHAM parser recognizes it as a valid action. The fs-ops component already has the implementation, but the parser validates against the schema.

<<<EXPLANATION>>>

Add file_read_numbered tool definition to unified-design.yaml so the SHAM parser recognizes it as a valid action

<<<FILE>>>

/Users/stuart/repos/clada/unified-design.yaml

<<<SEARCH>>>
  file_read:
    type: read
    executor: fs-ops
    description: Read single file content
    accessibility: [llm]
    output_display: always
    primary_param: path
    parameters:
      path: {type: string, required: true, format: absolute_path}
    returns: {success: boolean, content?: string, error?: string}
<<<REPLACE>>>
  file_read:
    type: read
    executor: fs-ops
    description: Read single file content
    accessibility: [llm]
    output_display: always
    primary_param: path
    parameters:
      path: {type: string, required: true, format: absolute_path}
    returns: {success: boolean, content?: string, error?: string}

  file_read_numbered:
    type: read
    executor: fs-ops
    description: Read file content with line numbers for specified line range
    accessibility: [llm]
    output_display: always
    primary_param: path
    parameters:
      path: {type: string, required: true, format: absolute_path}
      lines: {type: string, required: false, description: "Line range: single '4' or range '23-43'. If omitted, reads all lines."}
      delimiter: {type: string, required: false, default: ": ", description: "Delimiter between line number and content"}
    returns: {success: boolean, content?: string, error?: string}
<<<END>>>

This addition defines `file_read_numbered` as a valid tool in the schema with:
- `type: read` - it's a read operation
- `executor: fs-ops` - handled by the fs-ops component
- Parameters matching the implementation: `path` (required), `lines` (optional), `delimiter` (optional with default)
- Returns matching the standard format

The SHAM parser loads this schema and will now recognize `file_read_numbered` as a valid action, allowing the tests to pass.