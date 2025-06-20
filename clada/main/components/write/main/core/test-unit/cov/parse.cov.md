20250119

# Write Parser Covenant

## parseWrite(node) → {path, content} | {error, message}

Extracts path and content from XML node.

Note: CDATA sections cannot contain the literal string `]]>`. If needed in content, users must split across multiple CDATA sections or use different encoding.

Note: Parser-level errors return descriptive error types, not protocol error codes. Orchestrator maps these to protocol errors.

### Example 1: Simple content
Input:
```xml
<write path="file.txt"><![CDATA[hello]]></write>
```
Output:
```json
{"path": "file.txt", "content": "hello"}
```

### Example 2: Multi-line content
Input:
```xml
<write path="script.sh"><![CDATA[#!/bin/bash
echo "line 1"
echo "line 2"
echo "line 3"]]></write>
```
Output:
```json
{"path": "script.sh", "content": "#!/bin/bash\necho \"line 1\"\necho \"line 2\"\necho \"line 3\""}
```

### Example 3: Empty content
Input:
```xml
<write path="empty.txt"><![CDATA[]]></write>
```
Output:
```json
{"path": "empty.txt", "content": ""}
```

### Example 4: Content with blank lines
Input:
```xml
<write path="doc.md"><![CDATA[# Title

First paragraph.

Second paragraph.]]></write>
```
Output:
```json
{"path": "doc.md", "content": "# Title\n\nFirst paragraph.\n\nSecond paragraph."}
```

### Example 5: Content with XML-like text
Input:
```xml
<write path="config.xml"><![CDATA[<root>
  <item>value</item>
</root>]]></write>
```
Output:
```json
{"path": "config.xml", "content": "<root>\n  <item>value</item>\n</root>"}
```

### Example 6: Missing path
Input:
```xml
<write><![CDATA[content]]></write>
```
Output:
```json
{"error": "malformed_xml", "message": "Missing required attribute: path"}
```

### Example 7: Empty path
Input:
```xml
<write path=""><![CDATA[content]]></write>
```
Output:
```json
{"error": "path_validation", "message": "Empty path attribute"}
```

### Example 8: Non-CDATA content
Input:
```xml
<write path="file.txt">raw content</write>
```
Output:
```json
{"error": "malformed_xml", "message": "Content must be wrapped in CDATA"}
```

### Example 9: Missing content
Input:
```xml
<write path="file.txt"></write>
```
Output:
```json
{"error": "malformed_xml", "message": "Missing content"}
```