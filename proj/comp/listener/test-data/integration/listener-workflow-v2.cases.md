# Listener Workflow Integration Tests v2

## listener-workflow-v2

### simple-file-write

#### input file

````sh
Just a simple text file.
Nothing special here.
````

#### input file
````sh
Just a simple text file.
Nothing special here.

```sh sham
#!SHAM [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/t_listener_simple/output.txt"
content = "Hello from SHAM!"
#!END_SHAM_sf1
```
````


#### input file
````sh

📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

Just a simple text file.
Nothing special here.

```sh sham
#!SHAM [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/t_listener_simple/output.txt"
content = "Hello from SHAM!"
#!END_SHAM_sf1
```
````

#### output file
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

### multiple-actions-mixed-results

#### input file

````sh
Empty file to start.
````

#### input file
````sh
```sh
#!SHAM [@three-char-SHA-256: wr1]
action = "file_write"
path = "/tmp/t_listener_multi/created.txt"
content = "This will succeed"
#!END_SHAM_wr1
```

```sh sham
#!SHAM [@three-char-SHA-256: rd1]
action = "file_read"
path = "/tmp/t_listener_multi/missing.txt"
#!END_SHAM_rd1
```

```sh sham
#!SHAM [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello from bash'"
#!END_SHAM_ex1
```
````

#### input file
````sh
```
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/created.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===

Empty file to start.

```sh sham
#!SHAM [@three-char-SHA-256: wr1]
action = "file_write"
path = "/tmp/t_listener_multi/created.txt"
content = "This will succeed"
#!END_SHAM_wr1
```

```sh sham
#!SHAM [@three-char-SHA-256: rd1]
action = "file_read"
path = "/tmp/t_listener_multi/missing.txt"
#!END_SHAM_rd1
```

```sh sham
#!SHAM [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello from bash'"
#!END_SHAM_ex1
```
````

#### output file
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/created.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===

=== OUTPUTS ===

[ex1] exec bash:
stdout:
Hello from bash
=== END ===
````

#### clipboard
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/created.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===

=== OUTPUTS ===

[ex1] exec bash:
stdout:
Hello from bash
=== END ===
````

### parse-error-handling

#### Initial Content
````sh
Testing parse errors.
````

#### New Content
````sh
Testing parse errors.

```sh sham
#!SHAM [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/t_listener_parse/test.txt"
content = "missing closing quote
#!END_SHAM_bad
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
bad ❌ file_write - Unclosed quoted string
=== END ===

Testing parse errors.

```sh sham
#!SHAM [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/t_listener_parse/test.txt"
content = "missing closing quote
#!END_SHAM_bad
```
````

#### Expected Output File
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
bad ❌ file_write - Unclosed quoted string
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
bad ❌ file_write - Unclosed quoted string
=== END ===

=== OUTPUTS ===
=== END ===
````

### no-reexecution-on-same-content

#### Initial Content
````sh
Testing hash-based execution.
````

#### New Content
````sh
Testing hash-based execution.

```sh sham
#!SHAM [@three-char-SHA-256: nc1]
action = "file_write"
path = "/tmp/t_listener_nochange/counter.txt"
content = "1"
#!END_SHAM_nc1
```

Adding a comment outside SHAM blocks.
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

Testing hash-based execution.

```sh sham
#!SHAM [@three-char-SHA-256: nc1]
action = "file_write"
path = "/tmp/t_listener_nochange/counter.txt"
content = "1"
#!END_SHAM_nc1
```

Adding a comment outside SHAM blocks.
````

#### Expected Output File
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
📋 Copied to clipboard at 10:30:00

=== CLADA RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

=== OUTPUTS ===
=== END ===
````