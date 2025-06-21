20250620

# executeEdit Covenant

## executeEdit(editCommand, context) → Result<void, Error>

Executes file edit operation. Context provides workingDir for path resolution.
Context structure: `{workingDir: string}`

Note: Both exact and range modes find non-overlapping matches only.

### Basic exact replacement
// Given: test.txt contains "hello world hello"
Input:
```json
{"mode": "exact", "path": "test.txt", "search": "hello", "replace": "hi", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: test.txt contains "hi world hello"

### Exact replacement with count
// Given: data.txt contains "foo bar foo baz foo"
Input:
```json
{"mode": "exact", "path": "data.txt", "search": "foo", "replace": "qux", "count": 2}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: data.txt contains "qux bar qux baz foo"

### Count exceeds matches - error
// Given: app.js contains "var x = 1; var y = 2; var z = 3;"
Input:
```json
{"mode": "exact", "path": "app.js", "search": "var", "replace": "let", "count": 10}
```
Output:
```json
{"ok": false, "error": "match_count_mismatch", "expected": 10, "found": 3}
```

### Range replacement
// Given: func.js contains "function old() { return 1; } function keep() { return 2; }"
Input:
```json
{"mode": "range", "path": "func.js", "searchStart": "function old()", "searchEnd": "}", "replace": "function new() { return 42; }", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: func.js contains "function new() { return 42; } function keep() { return 2; }"

### Range replacement with count
// Given: list.xml contains "<item>A</item><item>B</item><item>C</item>"
Input:
```json
{"mode": "range", "path": "list.xml", "searchStart": "<item>", "searchEnd": "</item>", "replace": "<item>X</item>", "count": 2}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: list.xml contains "<item>X</item><item>X</item><item>C</item>"

### Case sensitive matching
// Given: case.txt contains "Hello HELLO hello"
Input:
```json
{"mode": "exact", "path": "case.txt", "search": "hello", "replace": "bye", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: case.txt contains "Hello HELLO bye"

### Multiline exact search
// Given: multi.txt contains "line1\nline2\nline3"
Input:
```json
{"mode": "exact", "path": "multi.txt", "search": "line1\nline2", "replace": "merged", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: multi.txt contains "merged\nline3"

### Multiline range search
// Given: block.js contains "if (true) {\n  console.log('yes');\n}\nother code"
Input:
```json
{"mode": "range", "path": "block.js", "searchStart": "if (true) {", "searchEnd": "}", "replace": "// removed", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: block.js contains "// removed\nother code"

### File not found
// Given: missing.txt does not exist
Input:
```json
{"mode": "exact", "path": "missing.txt", "search": "x", "replace": "y", "count": 1}
```
Output:
```json
{"ok": false, "error": "file_not_found"}
```

### Match count mismatch - exact mode
// Given: few.txt contains "one two three"
Input:
```json
{"mode": "exact", "path": "few.txt", "search": "four", "replace": "x", "count": 1}
```
Output:
```json
{"ok": false, "error": "match_count_mismatch", "expected": 1, "found": 0}
```

### Match count mismatch - not enough matches
// Given: count.txt contains "a b a c"
Input:
```json
{"mode": "exact", "path": "count.txt", "search": "a", "replace": "x", "count": 3}
```
Output:
```json
{"ok": false, "error": "match_count_mismatch", "expected": 3, "found": 2}
```

### Match count mismatch - range mode
// Given: range.txt contains "<div>content</div>"
Input:
```json
{"mode": "range", "path": "range.txt", "searchStart": "<span>", "searchEnd": "</span>", "replace": "x", "count": 1}
```
Output:
```json
{"ok": false, "error": "match_count_mismatch", "expected": 1, "found": 0}
```

### Range incomplete - missing end
// Given: bad.txt contains "start but no end"
Input:
```json
{"mode": "range", "path": "bad.txt", "searchStart": "start", "searchEnd": "finish", "replace": "x", "count": 1}
```
Output:
```json
{"ok": false, "error": "search_range_incomplete"}
```

### Non-overlapping matches
// Given: overlap.txt contains "aaaa"
Input:
```json
{"mode": "exact", "path": "overlap.txt", "search": "aa", "replace": "bb", "count": 2}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: overlap.txt contains "bbbb"

### Empty file
// Given: empty.txt contains ""
Input:
```json
{"mode": "exact", "path": "empty.txt", "search": "x", "replace": "y", "count": 1}
```
Output:
```json
{"ok": false, "error": "match_count_mismatch", "expected": 1, "found": 0}
```

### Replace with empty string
// Given: delete.txt contains "keep this remove this keep this"
Input:
```json
{"mode": "exact", "path": "delete.txt", "search": "remove this ", "replace": "", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: delete.txt contains "keep this keep this"

### Path with subdirectory
// Given: sub/dir/file.txt contains "content"
Input:
```json
{"mode": "exact", "path": "sub/dir/file.txt", "search": "content", "replace": "new content", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: sub/dir/file.txt contains "new content"

### Symlink rejection
// Given: link.txt is a symlink
Input:
```json
{"mode": "exact", "path": "link.txt", "search": "x", "replace": "y", "count": 1}
```
Output:
```json
{"ok": false, "error": "symlink_not_allowed"}
```

### Range is lazy (nearest end)
// Given: nested.js contains "{ outer { inner } still outer }"
Input:
```json
{"mode": "range", "path": "nested.js", "searchStart": "{", "searchEnd": "}", "replace": "[block]", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: nested.js contains "[block] still outer }"

### Range with nested markers
// Given: html.html contains "<div>outer <div>inner</div> text</div>"
Input:
```json
{"mode": "range", "path": "html.html", "searchStart": "<div>", "searchEnd": "</div>", "replace": "<span>content</span>", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: html.html contains "<span>content</span> text</div>"

### Multiple range replacements
// Given: multi.xml contains "START first END middle START second END final"
Input:
```json
{"mode": "range", "path": "multi.xml", "searchStart": "START", "searchEnd": "END", "replace": "X", "count": 2}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: multi.xml contains "X middle X final"

### Preserve file endings
// Given: endings.txt contains "hello\r\nworld\n"
Input:
```json
{"mode": "exact", "path": "endings.txt", "search": "hello", "replace": "hi", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: endings.txt contains "hi\r\nworld\n"

### UTF-8 handling
// Given: utf8.txt contains "café and naïve"
Input:
```json
{"mode": "exact", "path": "utf8.txt", "search": "café", "replace": "coffee", "count": 1}
```
Output:
```json
{"ok": true, "value": undefined}
```
// Then: utf8.txt contains "coffee and naïve"

### Path escape attempt
// Given: any file operation
Input:
```json
{"mode": "exact", "path": "../../../etc/passwd", "search": "root", "replace": "hacked", "count": 1}
```
Output:
```json
{"ok": false, "error": "path_escape"}
```