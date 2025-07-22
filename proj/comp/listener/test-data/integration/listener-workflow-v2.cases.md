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
📋 Copied to clipboard

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
=== CLADA RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
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

#### input file
````sh
📋 Copied to clipboard

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
📋 Copied to clipboard

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
=== CLADA RESULTS ===
bad ❌ file_write - Unclosed quoted string
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
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
📋 Copied to clipboard

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
=== CLADA RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== CLADA RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

### successful-file-replace-text

#### Initial Content
````sh
Testing file replacement functionality.
````

#### New Content
````sh
Testing file replacement functionality.

```sh sham
#!SHAM [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/t_listener_replace/config.yaml"
content = <<'EOT_SHAM_fr1'
# Configuration file
database:
  host: localhost
  port: 5432
  name: myapp_dev

server:
  host: localhost
  port: 3000
EOT_SHAM_fr1
#!END_SHAM_fr1
```

```sh sham
#!SHAM [@three-char-SHA-256: fr2]
action = "file_replace_text"
path = "/tmp/t_listener_replace/config.yaml"
old_text = <<'EOT_SHAM_fr2'
database:
  host: localhost
  port: 5432
  name: myapp_dev
EOT_SHAM_fr2
new_text = <<'EOT_SHAM_fr2'
database:
  host: production.example.com
  port: 5432
  name: myapp_prod
EOT_SHAM_fr2
#!END_SHAM_fr2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== CLADA RESULTS ===
fr1 ✅ file_write /tmp/t_listener_replace/config.yaml
fr2 ✅ file_replace_text /tmp/t_listener_replace/config.yaml
=== END ===

Testing file replacement functionality.

```sh sham
#!SHAM [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/t_listener_replace/config.yaml"
content = <<'EOT_SHAM_fr1'
# Configuration file
database:
  host: localhost
  port: 5432
  name: myapp_dev

server:
  host: localhost
  port: 3000
EOT_SHAM_fr1
#!END_SHAM_fr1
```

```sh sham
#!SHAM [@three-char-SHA-256: fr2]
action = "file_replace_text"
path = "/tmp/t_listener_replace/config.yaml"
old_text = <<'EOT_SHAM_fr2'
database:
  host: localhost
  port: 5432
  name: myapp_dev
EOT_SHAM_fr2
new_text = <<'EOT_SHAM_fr2'
database:
  host: production.example.com
  port: 5432
  name: myapp_prod
EOT_SHAM_fr2
#!END_SHAM_fr2
```
````

#### Expected Output File
````sh
=== CLADA RESULTS ===
fr1 ✅ file_write /tmp/t_listener_replace/config.yaml
fr2 ✅ file_replace_text /tmp/t_listener_replace/config.yaml
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== CLADA RESULTS ===
fr1 ✅ file_write /tmp/t_listener_replace/config.yaml
fr2 ✅ file_replace_text /tmp/t_listener_replace/config.yaml
=== END ===

=== OUTPUTS ===
=== END ===
````

### failed-file-replace-text-multiple-matches

#### Initial Content
````sh
Testing multiple match failure.
````

#### New Content
````sh
Testing multiple match failure.

```sh sham
#!SHAM [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/t_listener_multi_match/app.js"
content = <<'EOT_SHAM_fm1'
// Application code
function process() {
  const value = 100;
  console.log(value);
  
  if (value > 50) {
    console.log("High value");
  }
  
  return value;
}

function validate() {
  const value = 200;
  return value > 0;
}
EOT_SHAM_fm1
#!END_SHAM_fm1
```

```sh sham
#!SHAM [@three-char-SHA-256: fm2]
action = "file_replace_text"
path = "/tmp/t_listener_multi_match/app.js"
old_text = <<'EOT_SHAM_fm2'
  const value = 100;
EOT_SHAM_fm2
new_text = <<'EOT_SHAM_fm2'
  const value = 999;
EOT_SHAM_fm2
#!END_SHAM_fm2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== CLADA RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - Search string found 2 times (expected exactly 1)
=== END ===

Testing multiple match failure.

```sh sham
#!SHAM [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/t_listener_multi_match/app.js"
content = <<'EOT_SHAM_fm1'
// Application code
function process() {
  const value = 100;
  console.log(value);
  
  if (value > 50) {
    console.log("High value");
  }
  
  return value;
}

function validate() {
  const value = 200;
  return value > 0;
}
EOT_SHAM_fm1
#!END_SHAM_fm1
```

```sh sham
#!SHAM [@three-char-SHA-256: fm2]
action = "file_replace_text"
path = "/tmp/t_listener_multi_match/app.js"
old_text = <<'EOT_SHAM_fm2'
  const value = 100;
EOT_SHAM_fm2
new_text = <<'EOT_SHAM_fm2'
  const value = 999;
EOT_SHAM_fm2
#!END_SHAM_fm2
```
````

#### Expected Output File
````sh
=== CLADA RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - Search string found 2 times (expected exactly 1)
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== CLADA RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - Search string found 2 times (expected exactly 1)
=== END ===

=== OUTPUTS ===
=== END ===
````

### failed-file-replace-text-no-matches

#### Initial Content
````sh
Testing no match failure.
````

#### New Content
````sh
Testing no match failure.

```sh sham
#!SHAM [@three-char-SHA-256: fn1]
action = "file_write"
path = "/tmp/t_listener_no_match/readme.md"
content = <<'EOT_SHAM_fn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_SHAM_fn1
#!END_SHAM_fn1
```

```sh sham
#!SHAM [@three-char-SHA-256: fn2]
action = "file_replace_text"
path = "/tmp/t_listener_no_match/readme.md"
old_text = <<'EOT_SHAM_fn2'
## Configuration

Configure the app by editing config.json
EOT_SHAM_fn2
new_text = <<'EOT_SHAM_fn2'
## Configuration

Configure the app by editing settings.yaml
EOT_SHAM_fn2
#!END_SHAM_fn2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== CLADA RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - Search string not found
=== END ===

Testing no match failure.

```sh sham
#!SHAM [@three-char-SHA-256: fn1]
action = "file_write"
path = "/tmp/t_listener_no_match/readme.md"
content = <<'EOT_SHAM_fn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_SHAM_fn1
#!END_SHAM_fn1
```

```sh sham
#!SHAM [@three-char-SHA-256: fn2]
action = "file_replace_text"
path = "/tmp/t_listener_no_match/readme.md"
old_text = <<'EOT_SHAM_fn2'
## Configuration

Configure the app by editing config.json
EOT_SHAM_fn2
new_text = <<'EOT_SHAM_fn2'
## Configuration

Configure the app by editing settings.yaml
EOT_SHAM_fn2
#!END_SHAM_fn2
```
````

#### Expected Output File
````sh
=== CLADA RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - Search string not found
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== CLADA RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - Search string not found
=== END ===

=== OUTPUTS ===
=== END ===
````