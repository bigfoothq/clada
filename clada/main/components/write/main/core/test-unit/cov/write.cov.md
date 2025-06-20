20250119

# Write Operation Covenant

## parseWrite

Extracts path and content from write XML node.

Examples:
- `<write path="file.txt"><![CDATA[hello]]></write>` → `{path: "file.txt", content: "hello"}`
- `<write path="empty.txt"><![CDATA[]]></write>` → `{path: "empty.txt", content: ""}`
- `<write path="nested/file.txt"><![CDATA[multi\nline]]></write>` → `{path: "nested/file.txt", content: "multi\nline"}`

## executeWrite

Creates file with content, creating parent directories as needed.

Examples:
- `{path: "new.txt", content: "data"}` with cwd="/app" → creates /app/new.txt
- `{path: "dir/file.txt", content: ""}` → creates dir/ if needed, then empty file
- `{path: "../escape.txt", content: "x"}` without allowEscape → error: "path_escape"