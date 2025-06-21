20250620

# parseEdit Covenant

## parseEdit(node) → Result<EditCommand, Error>

Extracts edit command from htmlparser2 node.

### Basic exact search/replace

Input:
```xml
<edit path="src/app.js"><search><![CDATA[hello]]></search><replace><![CDATA[goodbye]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "exact", "path": "src/app.js", "search": "hello", "replace": "goodbye", "count": 1}}
```

### Exact search with count

Input:
```xml
<edit path="test.py" count="3"><search><![CDATA[foo]]></search><replace><![CDATA[bar]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "exact", "path": "test.py", "search": "foo", "replace": "bar", "count": 3}}
```

### Range search with start/end

Input:
```xml
<edit path="main.js"><search-start><![CDATA[function calculate(]]></search-start><search-end><![CDATA[}]]></search-end><replace><![CDATA[function compute() { return 42; }]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "range", "path": "main.js", "searchStart": "function calculate(", "searchEnd": "}", "replace": "function compute() { return 42; }", "count": 1}}
```

### Range search with count

Input:
```xml
<edit path="config.xml" count="2"><search-start><![CDATA[<item>]]></search-start><search-end><![CDATA[</item>]]></search-end><replace><![CDATA[<item>replaced</item>]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "range", "path": "config.xml", "searchStart": "<item>", "searchEnd": "</item>", "replace": "<item>replaced</item>", "count": 2}}
```

### CDATA escaping

Input:
```xml
<edit path="data.xml"><search><![CDATA[text with ]]&gt; inside]]></search><replace><![CDATA[new ]]&gt; text]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "exact", "path": "data.xml", "search": "text with ]]&gt; inside", "replace": "new ]]&gt; text", "count": 1}}
```

### Missing path attribute

Input:
```xml
<edit><search><![CDATA[test]]></search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "missing_path_attribute"}
```

### Empty search element

Input:
```xml
<edit path="file.js"><search><![CDATA[]]></search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "empty_search"}
```

### Empty replace element (allowed)

Input:
```xml
<edit path="file.js"><search><![CDATA[old]]></search><replace><![CDATA[]]></replace></edit>
```
Output:
```json
{"ok": true, "value": {"mode": "exact", "path": "file.js", "search": "old", "replace": "", "count": 1}}
```

### Missing search element (exact mode)

Input:
```xml
<edit path="file.js"><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "missing_search_element"}
```

### Missing replace element

Input:
```xml
<edit path="file.js"><search><![CDATA[old]]></search></edit>
```
Output:
```json
{"ok": false, "error": "missing_replace_element"}
```

### Both search and search-start elements

Input:
```xml
<edit path="file.js"><search><![CDATA[old]]></search><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "conflicting_search_modes"}
```

### Range mode missing search-end

Input:
```xml
<edit path="file.js"><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "missing_search_end"}
```

### Range mode missing search-start

Input:
```xml
<edit path="file.js"><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "missing_search_start"}
```

### Invalid count attribute

Input:
```xml
<edit path="file.js" count="abc"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "invalid_count"}
```

### Zero count attribute

Input:
```xml
<edit path="file.js" count="0"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "invalid_count"}
```

### Negative count attribute

Input:
```xml
<edit path="file.js" count="-1"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "invalid_count"}
```

### Empty search-start element

Input:
```xml
<edit path="file.js"><search-start><![CDATA[]]></search-start><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "empty_search_start"}
```

### Empty search-end element

Input:
```xml
<edit path="file.js"><search-start><![CDATA[start]]></search-start><search-end><![CDATA[]]></search-end><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "empty_search_end"}
```

### Mixed content - text outside CDATA in search

Input:
```xml
<edit path="file.js"><search>raw text</search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "malformed_xml"}
```

### Mixed content - text outside CDATA in replace

Input:
```xml
<edit path="file.js"><search><![CDATA[old]]></search><replace>raw text</replace></edit>
```
Output:
```json
{"ok": false, "error": "malformed_xml"}
```

### Mixed content - text and CDATA together

Input:
```xml
<edit path="file.js"><search>text<![CDATA[more]]>text</search><replace><![CDATA[new]]></replace></edit>
```
Output:
```json
{"ok": false, "error": "malformed_xml"}
```