=== PROCESSED: 2025-07-21 20:57:35 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json
===

The tests show we need to update all test cases to remove blank lines. Let me update them all at once:

<<<EXPLANATION>>>
Update all test cases to remove blank lines between output sections for simpler format

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json

<<<SEARCH>>>
      "expected": "\n=== CLADA RESULTS ===\nrd1 ✅ file_read /tmp/test.txt\n=== END ===\n\n=== OUTPUTS ===\n\n[rd1] file_read /tmp/test.txt:\nHello, world!\nThis is a test file.\n\n=== END ==="
<<<REPLACE>>>
      "expected": "\n=== CLADA RESULTS ===\nrd1 ✅ file_read /tmp/test.txt\n=== END ===\n\n=== OUTPUTS ===\n[rd1] file_read /tmp/test.txt:\nHello, world!\nThis is a test file.\n=== END ==="
<<<END>>>

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json

<<<SEARCH>>>
      "expected": "\n=== CLADA RESULTS ===\naaa ✅ file_read /tmp/a.txt\nbbb ✅ file_write /tmp/b.txt\nccc ✅ exec javascript\n=== END ===\n\n=== OUTPUTS ===\n\n[aaa] file_read /tmp/a.txt:\nContent A\n\n[ccc] exec javascript:\nstdout:\n42\n\n=== END ==="
<<<REPLACE>>>
      "expected": "\n=== CLADA RESULTS ===\naaa ✅ file_read /tmp/a.txt\nbbb ✅ file_write /tmp/b.txt\nccc ✅ exec javascript\n=== END ===\n\n=== OUTPUTS ===\n[aaa] file_read /tmp/a.txt:\nContent A\n[ccc] exec javascript:\nstdout:\n42\n=== END ==="
<<<END>>>

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json

<<<SEARCH>>>
      "expected": "\n=== CLADA RESULTS ===\nok1 ✅ file_read /tmp/exists.txt\nerr ❌ file_read /tmp/missing.txt - File not found\n=== END ===\n\n=== OUTPUTS ===\n\n[ok1] file_read /tmp/exists.txt:\nFound content\n\n=== END ==="
<<<REPLACE>>>
      "expected": "\n=== CLADA RESULTS ===\nok1 ✅ file_read /tmp/exists.txt\nerr ❌ file_read /tmp/missing.txt - File not found\n=== END ===\n\n=== OUTPUTS ===\n[ok1] file_read /tmp/exists.txt:\nFound content\n=== END ==="
<<<END>>>

<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/listener/test-data/unit/formatFullOutput.json

<<<SEARCH>>>
      "expected": "\n=== CLADA RESULTS ===\nls1 ✅ ls /tmp\n=== END ===\n\n=== OUTPUTS ===\n\n[ls1] ls /tmp:\n[\n  {\n    \"name\": \"file1.txt\",\n    \"type\": \"file\",\n    \"size\": 1024,\n    \"modified\": \"2024-01-01T00:00:00Z\"\n  },\n  {\n    \"name\": \"dir1\",\n    \"type\": \"directory\",\n    \"size\": 4096,\n    \"modified\": \"2024-01-01T00:00:00Z\"\n  }\n]\n\n=== END ==="
<<<REPLACE>>>
      "expected": "\n=== CLADA RESULTS ===\nls1 ✅ ls /tmp\n=== END ===\n\n=== OUTPUTS ===\n[ls1] ls /tmp:\n[\n  {\n    \"name\": \"file1.txt\",\n    \"type\": \"file\",\n    \"size\": 1024,\n    \"modified\": \"2024-01-01T00:00:00Z\"\n  },\n  {\n    \"name\": \"dir1\",\n    \"type\": \"directory\",\n    \"size\": 4096,\n    \"modified\": \"2024-01-01T00:00:00Z\"\n  }\n]\n=== END ==="
<<<END>>>

Run tests to verify:

```bash
npx vitest run proj/comp/listener/test/unit/formatFullOutput.test.ts proj/comp/listener/test/unit/formatSummary.test.ts
```