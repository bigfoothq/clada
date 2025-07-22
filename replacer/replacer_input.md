=== PROCESSED: 2025-07-22 15:58:16 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 4: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 5: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 6: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 7: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 8: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 9: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 10: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 11: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 12: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
SUCCESS Block 13: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
ERROR Block 14: No match found in /Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
SUCCESS Block 15: Updated /Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
===

I'll help you edit the file to add file creation SHAM blocks to each test case, similar to the pattern in `file_replace_lines.cases.md`. Let me analyze the files and create the necessary edits.

Looking at the pattern in `file_replace_lines.cases.md`, I can see that each test case that needs a pre-existing file has an initial SHAM block with `action = "file_write"` to create the file before the actual test action.

Let me create the edits:

<<<EXPLANATION>>>
Adding file creation SHAM blocks to each test case in file_replace_text.cases.md that requires pre-existing files, following the pattern from file_replace_lines.cases.md
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 001-simple-text-replacement

```sh sham
#!SHAM [@three-char-SHA-256: rpl]
action = "file_replace_text"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
old_text = "Hello"
new_text = "Goodbye"
#!END_SHAM_rpl
```
<<<REPLACE>>>
### 001-simple-text-replacement

```sh sham
#!SHAM [@three-char-SHA-256: st1]
action = "file_write"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
content = "Hello World"
#!END_SHAM_st1
```

```sh sham
#!SHAM [@three-char-SHA-256: rpl]
action = "file_replace_text"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
old_text = "Hello"
new_text = "Goodbye"
#!END_SHAM_rpl
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for replace-with-count-limit test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 002-replace-with-count-limit

```sh sham
#!SHAM [@three-char-SHA-256: cnt]
action = "file_replace_all_text"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
old_text = "foo"
new_text = "bar"
count = "2"
#!END_SHAM_cnt
```
<<<REPLACE>>>
### 002-replace-with-count-limit

```sh sham
#!SHAM [@three-char-SHA-256: rc1]
action = "file_write"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
content = "foo bar foo baz foo qux foo"
#!END_SHAM_rc1
```

```sh sham
#!SHAM [@three-char-SHA-256: cnt]
action = "file_replace_all_text"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
old_text = "foo"
new_text = "bar"
count = "2"
#!END_SHAM_cnt
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for replace-text-not-found test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 003-replace-text-not-found

```sh sham
#!SHAM [@three-char-SHA-256: nfr]
action = "file_replace_text"
path = "/tmp/t_replace-text-not-found/no-match.txt"
old_text = "nonexistent"
new_text = "replacement"
#!END_SHAM_nfr
```
<<<REPLACE>>>
### 003-replace-text-not-found

```sh sham
#!SHAM [@three-char-SHA-256: nf1]
action = "file_write"
path = "/tmp/t_replace-text-not-found/no-match.txt"
content = "This file has no matches"
#!END_SHAM_nf1
```

```sh sham
#!SHAM [@three-char-SHA-256: nfr]
action = "file_replace_text"
path = "/tmp/t_replace-text-not-found/no-match.txt"
old_text = "nonexistent"
new_text = "replacement"
#!END_SHAM_nfr
```
<<<END>>>

<<<EXPLANATION>>>
Test 004 doesn't need a file creation block since it's testing replacement in a nonexistent file. Moving to test 005 for multiline-replacement
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 005-multiline-replacement

```sh sham
#!SHAM [@three-char-SHA-256: mlr]
action = "file_replace_text"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
old_text = <<'EOT_SHAM_mlr'
export function oldName() {
  console.log('oldName');
  return oldName;
}
EOT_SHAM_mlr
new_text = <<'EOT_SHAM_mlr'
export function newName() {
  console.log('newName');
  return newName;
}
EOT_SHAM_mlr
#!END_SHAM_mlr
```
<<<REPLACE>>>
### 005-multiline-replacement

```sh sham
#!SHAM [@three-char-SHA-256: ml1]
action = "file_write"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
content = <<'EOT_SHAM_ml1'
export function oldName() {
  console.log('oldName');
  return oldName;
}

function oldName() {
  return oldName;
}

const x = oldName();
EOT_SHAM_ml1
#!END_SHAM_ml1
```

```sh sham
#!SHAM [@three-char-SHA-256: mlr]
action = "file_replace_text"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
old_text = <<'EOT_SHAM_mlr'
export function oldName() {
  console.log('oldName');
  return oldName;
}
EOT_SHAM_mlr
new_text = <<'EOT_SHAM_mlr'
export function newName() {
  console.log('newName');
  return newName;
}
EOT_SHAM_mlr
#!END_SHAM_mlr
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for empty-old-text-error test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 006-empty-old-text-error

```sh sham
#!SHAM [@three-char-SHA-256: emt]
action = "file_replace_text"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
old_text = ""
new_text = "something"
#!END_SHAM_emt
```
<<<REPLACE>>>
### 006-empty-old-text-error

```sh sham
#!SHAM [@three-char-SHA-256: em1]
action = "file_write"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
content = "Some content here"
#!END_SHAM_em1
```

```sh sham
#!SHAM [@three-char-SHA-256: emt]
action = "file_replace_text"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
old_text = ""
new_text = "something"
#!END_SHAM_emt
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for file-replace-text-multiple-occurrences test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 007-file-replace-text-multiple-occurrences

```sh sham
#!SHAM [@three-char-SHA-256: mul]
action = "file_replace_text"
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
old_text = "duplicate"
new_text = "unique"
#!END_SHAM_mul
```
<<<REPLACE>>>
### 007-file-replace-text-multiple-occurrences

```sh sham
#!SHAM [@three-char-SHA-256: mo1]
action = "file_write"
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
content = "duplicate text with duplicate word and duplicate again"
#!END_SHAM_mo1
```

```sh sham
#!SHAM [@three-char-SHA-256: mul]
action = "file_replace_text"
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
old_text = "duplicate"
new_text = "unique"
#!END_SHAM_mul
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for file-replace-all-text-no-count test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 008-file-replace-all-text-no-count

```sh sham
#!SHAM [@three-char-SHA-256: all]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_all
```
<<<REPLACE>>>
### 008-file-replace-all-text-no-count

```sh sham
#!SHAM [@three-char-SHA-256: ra1]
action = "file_write"
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
content = "foo bar foo baz foo"
#!END_SHAM_ra1
```

```sh sham
#!SHAM [@three-char-SHA-256: all]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_SHAM_all
```
<<<END>>>

<<<EXPLANATION>>>
Adding file creation block for file-replace-all-text-count-mismatch test
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 009-file-replace-all-text-count-mismatch

```sh sham
#!SHAM [@three-char-SHA-256: mis]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
old_text = "test"
new_text = "check"
count = "5"
#!END_SHAM_mis
```
<<<REPLACE>>>
### 009-file-replace-all-text-count-mismatch

```sh sham
#!SHAM [@three-char-SHA-256: cm1]
action = "file_write"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
content = "test this test case"
#!END_SHAM_cm1
```

```sh sham
#!SHAM [@three-char-SHA-256: mis]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
old_text = "test"
new_text = "check"
count = "5"
#!END_SHAM_mis
```
<<<END>>>

<<<EXPLANATION>>>
Test 010 already has file creation blocks, skipping to test 011
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 011-whitespace-sensitive-replacement

```sh sham
#!SHAM [@three-char-SHA-256: ws1]
action = "file_write"
path = "/tmp/t_whitespace-sensitive-replacement/indented.txt"
content = <<'EOT_SHAM_ws1'
class FileProcessor {
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}
EOT_SHAM_ws1
#!END_SHAM_ws1

#!SHAM [@three-char-SHA-256: ws2]
<<<REPLACE>>>
### 011-whitespace-sensitive-replacement

```sh sham
#!SHAM [@three-char-SHA-256: ws1]
action = "file_write"
path = "/tmp/t_whitespace-sensitive-replacement/indented.txt"
content = <<'EOT_SHAM_ws1'
class FileProcessor {
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}
EOT_SHAM_ws1
#!END_SHAM_ws1
```

```sh sham
#!SHAM [@three-char-SHA-256: ws2]
<<<END>>>

<<<EXPLANATION>>>
Test 012 already has file creation blocks, skipping to test 013
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 013-exact-newline-matching

```sh sham
#!SHAM [@three-char-SHA-256: nl1]
action = "file_write"
path = "/tmp/t_exact-newline-matching/newlines.txt"
content = <<'EOT_SHAM_nl1'
function one() {
  return 1;
}


function two() {
  return 2;
}
EOT_SHAM_nl1
#!END_SHAM_nl1

#!SHAM [@three-char-SHA-256: nl2]
<<<REPLACE>>>
### 013-exact-newline-matching

```sh sham
#!SHAM [@three-char-SHA-256: nl1]
action = "file_write"
path = "/tmp/t_exact-newline-matching/newlines.txt"
content = <<'EOT_SHAM_nl1'
function one() {
  return 1;
}


function two() {
  return 2;
}
EOT_SHAM_nl1
#!END_SHAM_nl1
```

```sh sham
#!SHAM [@three-char-SHA-256: nl2]
<<<END>>>

<<<EXPLANATION>>>
Test 014 already has file creation blocks, skipping to test 015
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 015-trailing-whitespace-sensitivity

```sh sham
#!SHAM [@three-char-SHA-256: tw1]
action = "file_write"
path = "/tmp/t_trailing-whitespace-sensitivity/trailing.txt"
content = "function test() {  \n  return true;\n}\n"
#!END_SHAM_tw1

#!SHAM [@three-char-SHA-256: tw2]
<<<REPLACE>>>
### 015-trailing-whitespace-sensitivity

```sh sham
#!SHAM [@three-char-SHA-256: tw1]
action = "file_write"
path = "/tmp/t_trailing-whitespace-sensitivity/trailing.txt"
content = "function test() {  \n  return true;\n}\n"
#!END_SHAM_tw1
```

```sh sham
#!SHAM [@three-char-SHA-256: tw2]
<<<END>>>

<<<EXPLANATION>>>
Test 016 already has file creation blocks, skipping to test 017
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test-data/integration/write/replace/file_replace_text.cases.md
<<<SEARCH>>>
### 017-file-replace-text-section-not-found

```sh sham
#!SHAM [@three-char-SHA-256: sn1]
action = "file_write"
path = "/tmp/t_file-replace-text-section-not-found/readme.md"
content = <<'EOT_SHAM_sn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_SHAM_sn1
#!END_SHAM_sn1

#!SHAM [@three-char-SHA-256: sn2]
<<<REPLACE>>>
### 017-file-replace-text-section-not-found

```sh sham
#!SHAM [@three-char-SHA-256: sn1]
action = "file_write"
path = "/tmp/t_file-replace-text-section-not-found/readme.md"
content = <<'EOT_SHAM_sn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_SHAM_sn1
#!END_SHAM_sn1
```

```sh sham
#!SHAM [@three-char-SHA-256: sn2]
<<<END>>>

<<<EXPLANATION>>>
Now removing the file creation logic from the test runner since it's now handled in the test case files themselves
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
<<<SEARCH>>>
  // Helper function to create test files and track paths
  const createTestFile = (testName: string, filename: string, content: string): void => {
    const testDir = `/tmp/t_${testName}`;
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, filename), content);
    createdPaths.add(testDir);
  };


  testGroups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, async () => {
          const expectedOutput = JSON.parse(test.expectedBlock);
          
          // Extract test name without number prefix
          const tn = test.name.replace(/^\d{3}-/, '');
          



          // Set up test preconditions based on group and test name
          if (group.name === 'file_delete' && tn === 'delete-existing-file') {
            createTestFile('delete-existing-file', 'to-delete.txt', 'This file will be deleted');
          } else if (group.name === 'file_move' && tn === 'move-file-simple') {
            createTestFile('move-file-simple', 'source.txt', 'Content to move');
          } else if (group.name === 'file_move' && tn === 'move-file-to-new-directory') {
            createTestFile('move-file-to-new-directory', 'original.txt', 'Moving to new directory');
          } else if (group.name === 'file_move' && tn === 'move-to-existing-file') {
            createTestFile('move-to-existing-file', 'source-exists.txt', 'Source content');
            createTestFile('move-to-existing-file', 'dest-exists.txt', 'Will be overwritten');
          } else if (group.name === 'file_replace_text' && tn === 'simple-text-replacement') {
            createTestFile('simple-text-replacement', 'replace-test.txt', 'Hello World');
          } else if (group.name === 'file_replace_text' && tn === 'replace-with-count-limit') {
            createTestFile('replace-with-count-limit', 'multi-replace.txt', 'foo bar foo baz foo qux foo');
          } else if (group.name === 'file_replace_text' && tn === 'replace-text-not-found') {
            createTestFile('replace-text-not-found', 'no-match.txt', 'This file has no matches');
          } else if (group.name === 'file_replace_text' && tn === 'multiline-replacement') {
            createTestFile('multiline-replacement', 'multiline-replace.txt', `export function oldName() {
  console.log('oldName');
  return oldName;
}

function oldName() {
  return oldName;
}

const x = oldName();`);
          } else if (group.name === 'file_replace_text' && tn === 'empty-old-text-error') {
            createTestFile('empty-old-text-error', 'empty-search.txt', 'Some content here');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-text-multiple-occurrences') {
            createTestFile('file-replace-text-multiple-occurrences', 'multiple-occurrences.txt', 'duplicate text with duplicate word and duplicate again');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-no-count') {
            createTestFile('file-replace-all-text-no-count', 'replace-all.txt', 'foo bar foo baz foo');
          } else if (group.name === 'file_replace_text' && tn === 'file-replace-all-text-count-mismatch') {
            createTestFile('file-replace-all-text-count-mismatch', 'count-mismatch.txt', 'test this test case');
          } else if (group.name === 'file_read' && tn === 'read-existing-file') {
            createTestFile('read-existing-file', 'readable.txt', 'This is readable content');
          } else if (group.name === 'file_replace_text' && tn === 'complex-multiline-multiple-occurrences') {
            createTestFile('complex-multiline-multiple-occurrences', 'listener.txt', `async function startListener(config) {
  const watcher = createWatcher();
  console.log('Starting listener');
  return watcher;
}

async function stopListener(watcher) {
  await watcher.close();
  console.log('Stopped listener');
}

async function startListener(altConfig) {
  // Different implementation
  return createAltWatcher();
}`);
          } else if (group.name === 'file_replace_text' && tn === 'whitespace-sensitive-replacement') {
            createTestFile('whitespace-sensitive-replacement', 'indented.txt', `class FileProcessor {
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}`);
          } else if (group.name === 'file_replace_text' && tn === 'partial-match-should-not-replace') {
            createTestFile('partial-match-should-not-replace', 'partial.txt', `export function validateInput(data) {
  if (!data) throw new Error('Invalid input');
  return true;
}

export function validateInputWithLogging(data) {
  console.log('Validating:', data);
  if (!data) throw new Error('Invalid input');
  return true;
}`);
          } else if (group.name === 'file_replace_text' && tn === 'exact-newline-matching') {
            createTestFile('exact-newline-matching', 'newlines.txt', `function one() {
  return 1;
}


function two() {
  return 2;
}`);
          } else if (group.name === 'file_replace_text' && tn === 'complex-code-block-replacement') {
            createTestFile('complex-code-block-replacement', 'complex.txt', `const handler = {
  async process(data) {
    const result = await transform(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.value;
  },
  
  validate(data) {
    return data != null;
  }
};`);
          } else if (group.name === 'file_replace_text' && tn === 'trailing-whitespace-sensitivity') {
            createTestFile('trailing-whitespace-sensitivity', 'trailing.txt', "function test() {  \n  return true;\n}\n");
          }










          // Parse SHAM to get actions
<<<REPLACE>>>
  testGroups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, async () => {
          const expectedOutput = JSON.parse(test.expectedBlock);
          
          // Parse SHAM to get actions
<<<END>>>

<<<EXPLANATION>>>
Also need to remove the createTestFile helper function declaration since it's no longer needed
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
<<<SEARCH>>>
describe('fs-ops integration tests', () => {
  let createdPaths: Set<string>;

  beforeEach(() => {
    createdPaths = new Set<string>(); // Fresh set per test

    // Clean up any existing test files
    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });

  afterEach(() => {
    for (const path of createdPaths) {
      rmSync(path, { recursive: true, force: true });
    }
    // Clean up after tests
    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });


  // Helper function to create test files and track paths
  const createTestFile = (testName: string, filename: string, content: string): void => {
    const testDir = `/tmp/t_${testName}`;
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, filename), content);
    createdPaths.add(testDir);
  };
<<<REPLACE>>>
describe('fs-ops integration tests', () => {
  let createdPaths: Set<string>;

  beforeEach(() => {
    createdPaths = new Set<string>(); // Fresh set per test

    // Clean up any existing test files
    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });

  afterEach(() => {
    for (const path of createdPaths) {
      rmSync(path, { recursive: true, force: true });
    }
    // Clean up after tests
    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } catch (err) {
        // Silently continue
      }
    }
  });
<<<END>>>

<<<EXPLANATION>>>
Update the test runner to track created directories from executed SHAM actions for cleanup
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/fs-ops/test/integration/integration.test.ts
<<<SEARCH>>>
          // Execute all actions in sequence, capturing the last result
          let result;
          for (const action of parseResult.actions) {
            result = await executeFileOperation(action);
          }
<<<REPLACE>>>
          // Execute all actions in sequence, capturing the last result
          let result;
          for (const action of parseResult.actions) {
            result = await executeFileOperation(action);
            
            // Track created paths for cleanup
            if (action.action === 'file_write' && action.path) {
              const testDirMatch = action.path.match(/\/tmp\/t_[^\/]+/);
              if (testDirMatch) {
                createdPaths.add(testDirMatch[0]);
              }
            }
          }
<<<END>>>

These edits will:
1. Add file creation SHAM blocks to each test case in `file_replace_text.cases.md` that needs pre-existing files
2. Remove all the file creation logic from the test runner since it's now handled by the SHAM blocks in the test case files
3. Update the test runner to track directories created by SHAM actions for proper cleanup

The test cases will now be self-contained with their file setup, making them easier to understand and maintain.