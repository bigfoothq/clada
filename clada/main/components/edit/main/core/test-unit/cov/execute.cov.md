20250620

# executeEdit Covenant

## Basic exact replacement
// Given: test.txt contains "hello world hello"
executeEdit(
{mode: 'exact', path: 'test.txt', search: 'hello', replace: 'hi', count: 1}, context)
→
{ok: true, value: undefined}
// Then: test.txt contains "hi world hello"

## Exact replacement with count
// Given: data.txt contains "foo bar foo baz foo"
executeEdit(
{mode: 'exact', path: 'data.txt', search: 'foo', replace: 'qux', count: 2}, context)
→
{ok: true, value: undefined}
// Then: data.txt contains "qux bar qux baz foo"

## Replace all occurrences (high count)
// Given: app.js contains "var x = 1; var y = 2; var z = 3;"
executeEdit(
{mode: 'exact', path: 'app.js', search: 'var', replace: 'let', count: 10}, context)
→
{ok: true, value: undefined}
// Then: app.js contains "let x = 1; let y = 2; let z = 3;"

## Range replacement
// Given: func.js contains "function old() { return 1; } function keep() { return 2; }"
executeEdit(
{mode: 'range', path: 'func.js', searchStart: 'function old()', searchEnd: '}', replace: 'function new() { return 42; }', count: 1}, context)
→
{ok: true, value: undefined}
// Then: func.js contains "function new() { return 42; } function keep() { return 2; }"

## Range replacement with count
// Given: list.xml contains "<item>A</item><item>B</item><item>C</item>"
executeEdit(
{mode: 'range', path: 'list.xml', searchStart: '<item>', searchEnd: '</item>', replace: '<item>X</item>', count: 2}, context)
→
{ok: true, value: undefined}
// Then: list.xml contains "<item>X</item><item>X</item><item>C</item>"

## Case sensitive matching
// Given: case.txt contains "Hello HELLO hello"
executeEdit(
{mode: 'exact', path: 'case.txt', search: 'hello', replace: 'bye', count: 1}, context)
→
{ok: true, value: undefined}
// Then: case.txt contains "Hello HELLO bye"

## Multiline exact search
// Given: multi.txt contains "line1\nline2\nline3"
executeEdit(
{mode: 'exact', path: 'multi.txt', search: 'line1\nline2', replace: 'merged', count: 1}, context)
→
{ok: true, value: undefined}
// Then: multi.txt contains "merged\nline3"

## Multiline range search
// Given: block.js contains "if (true) {\n  console.log('yes');\n}\nother code"
executeEdit(
{mode: 'range', path: 'block.js', searchStart: 'if (true) {', searchEnd: '}', replace: '// removed', count: 1}, context)
→
{ok: true, value: undefined}
// Then: block.js contains "// removed\nother code"

## File not found
// Given: missing.txt does not exist
executeEdit(
{mode: 'exact', path: 'missing.txt', search: 'x', replace: 'y', count: 1}, context)
→
{ok: false, error: 'file_not_found'}

## Match count mismatch - exact mode
// Given: few.txt contains "one two three"
executeEdit(
{mode: 'exact', path: 'few.txt', search: 'four', replace: 'x', count: 1}, context)
→
{ok: false, error: 'match_count_mismatch'}

## Match count mismatch - not enough matches
// Given: count.txt contains "a b a c"
executeEdit(
{mode: 'exact', path: 'count.txt', search: 'a', replace: 'x', count: 3}, context)
→
{ok: false, error: 'match_count_mismatch'}

## Match count mismatch - range mode
// Given: range.txt contains "<div>content</div>"
executeEdit(
{mode: 'range', path: 'range.txt', searchStart: '<span>', searchEnd: '</span>', replace: 'x', count: 1}, context)
→
{ok: false, error: 'match_count_mismatch'}

## Range incomplete - missing end
// Given: bad.txt contains "start but no end"
executeEdit(
{mode: 'range', path: 'bad.txt', searchStart: 'start', searchEnd: 'finish', replace: 'x', count: 1}, context)
→
{ok: false, error: 'search_range_incomplete'}

## Non-overlapping matches
// Given: overlap.txt contains "aaaa"
executeEdit(
{mode: 'exact', path: 'overlap.txt', search: 'aa', replace: 'bb', count: 2}, context)
→
{ok: true, value: undefined}
// Then: overlap.txt contains "bbbb"

## Empty file
// Given: empty.txt contains ""
executeEdit(
{mode: 'exact', path: 'empty.txt', search: 'x', replace: 'y', count: 1}, context)
→
{ok: false, error: 'match_count_mismatch'}

## Replace with empty string
// Given: delete.txt contains "keep this remove this keep this"
executeEdit(
{mode: 'exact', path: 'delete.txt', search: 'remove this ', replace: '', count: 1}, context)
→
{ok: true, value: undefined}
// Then: delete.txt contains "keep this keep this"

## Path with subdirectory
// Given: sub/dir/file.txt contains "content"
executeEdit(
{mode: 'exact', path: 'sub/dir/file.txt', search: 'content', replace: 'new content', count: 1}, context)
→
{ok: true, value: undefined}
// Then: sub/dir/file.txt contains "new content"

## Symlink rejection
// Given: link.txt is a symlink
executeEdit(
{mode: 'exact', path: 'link.txt', search: 'x', replace: 'y', count: 1}, context)
→
{ok: false, error: 'symlink_not_allowed'}

## Range is lazy (nearest end)
// Given: nested.js contains "{ outer { inner } still outer }"
executeEdit(
{mode: 'range', path: 'nested.js', searchStart: '{', searchEnd: '}', replace: '[block]', count: 1}, context)
→
{ok: true, value: undefined}
// Then: nested.js contains "[block] still outer }"

## Range with nested markers
// Given: html.html contains "<div>outer <div>inner</div> text</div>"
executeEdit(
{mode: 'range', path: 'html.html', searchStart: '<div>', searchEnd: '</div>', replace: '<span>content</span>', count: 1}, context)
→
{ok: true, value: undefined}
// Then: html.html contains "<span>content</span> text</div>"

## Multiple range replacements
// Given: multi.xml contains "START first END middle START second END final"
executeEdit(
{mode: 'range', path: 'multi.xml', searchStart: 'START', searchEnd: 'END', replace: 'X', count: 2}, context)
→
{ok: true, value: undefined}
// Then: multi.xml contains "X middle X final"

## Preserve file endings
// Given: endings.txt contains "hello\r\nworld\n"
executeEdit(
{mode: 'exact', path: 'endings.txt', search: 'hello', replace: 'hi', count: 1}, context)
→
{ok: true, value: undefined}
// Then: endings.txt contains "hi\r\nworld\n"

## UTF-8 handling
// Given: utf8.txt contains "café and naïve"
executeEdit(
{mode: 'exact', path: 'utf8.txt', search: 'café', replace: 'coffee', count: 1}, context)
→
{ok: true, value: undefined}
// Then: utf8.txt contains "coffee and naïve"

## Path escape attempt
// Given: any file operation
executeEdit(
{mode: 'exact', path: '../../../etc/passwd', search: 'root', replace: 'hacked', count: 1}, context)
→
{ok: false, error: 'path_escape'}