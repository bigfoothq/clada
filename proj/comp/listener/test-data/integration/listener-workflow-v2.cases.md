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

```sh nesl
#!NESL [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/t_listener_simple/output.txt"
content = "Hello from NESL!"
#!END_NESL_sf1
```
````


#### input file
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

Just a simple text file.
Nothing special here.

```sh nesl
#!NESL [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/t_listener_simple/output.txt"
content = "Hello from NESL!"
#!END_NESL_sf1
```
````

#### output file
````sh
=== LOAF RESULTS ===
sf1 ✅ file_write /tmp/t_listener_simple/output.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
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

```sh nesl
#!NESL [@three-char-SHA-256: wr1]
action = "file_write"
path = "/tmp/t_listener_multi/created.txt"
content = "This will succeed"
#!END_NESL_wr1
```

```sh nesl
#!NESL [@three-char-SHA-256: rd1]
action = "file_read"
path = "/tmp/t_listener_multi/missing.txt"
#!END_NESL_rd1
```

```sh nesl
#!NESL [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello from bash'"
#!END_NESL_ex1
```
````

#### input file
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
wr1 ✅ file_write /tmp/t_listener_multi/created.txt
rd1 ❌ file_read /tmp/t_listener_multi/missing.txt - File not found
ex1 ✅ exec bash
=== END ===

Empty file to start.

```sh nesl
#!NESL [@three-char-SHA-256: wr1]
action = "file_write"
path = "/tmp/t_listener_multi/created.txt"
content = "This will succeed"
#!END_NESL_wr1
```

```sh nesl
#!NESL [@three-char-SHA-256: rd1]
action = "file_read"
path = "/tmp/t_listener_multi/missing.txt"
#!END_NESL_rd1
```

```sh nesl
#!NESL [@three-char-SHA-256: ex1]
action = "exec"
lang = "bash"
code = "echo 'Hello from bash'"
#!END_NESL_ex1
```
````

#### output file
````sh
=== LOAF RESULTS ===
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
=== LOAF RESULTS ===
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

```sh nesl
#!NESL [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/t_listener_parse/test.txt"
content = "missing closing quote
#!END_NESL_bad
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
bad ❌ file_write ERROR: Unclosed quoted string (line 4)
=== END ===

Testing parse errors.

```sh nesl
#!NESL [@three-char-SHA-256: bad]
action = "file_write"
path = "/tmp/t_listener_parse/test.txt"
content = "missing closing quote
#!END_NESL_bad
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
bad ❌ file_write ERROR: Unclosed quoted string (line 4)
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
bad ❌ file_write ERROR: Unclosed quoted string (line 4)
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

```sh nesl
#!NESL [@three-char-SHA-256: nc1]
action = "file_write"
path = "/tmp/t_listener_nochange/counter.txt"
content = "1"
#!END_NESL_nc1
```

Adding a comment outside NESL blocks.
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

Testing hash-based execution.

```sh nesl
#!NESL [@three-char-SHA-256: nc1]
action = "file_write"
path = "/tmp/t_listener_nochange/counter.txt"
content = "1"
#!END_NESL_nc1
```

Adding a comment outside NESL blocks.
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
nc1 ✅ file_write /tmp/t_listener_nochange/counter.txt
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
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

```sh nesl
#!NESL [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/t_listener_replace/config.yaml"
content = <<'EOT_NESL_fr1'
# Configuration file
database:
  host: localhost
  port: 5432
  name: myapp_dev

server:
  host: localhost
  port: 3000
EOT_NESL_fr1
#!END_NESL_fr1
```

```sh nesl
#!NESL [@three-char-SHA-256: fr2]
action = "file_replace_text"
path = "/tmp/t_listener_replace/config.yaml"
old_text = <<'EOT_NESL_fr2'
database:
  host: localhost
  port: 5432
  name: myapp_dev
EOT_NESL_fr2
new_text = <<'EOT_NESL_fr2'
database:
  host: production.example.com
  port: 5432
  name: myapp_prod
EOT_NESL_fr2
#!END_NESL_fr2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
fr1 ✅ file_write /tmp/t_listener_replace/config.yaml
fr2 ✅ file_replace_text /tmp/t_listener_replace/config.yaml
=== END ===

Testing file replacement functionality.

```sh nesl
#!NESL [@three-char-SHA-256: fr1]
action = "file_write"
path = "/tmp/t_listener_replace/config.yaml"
content = <<'EOT_NESL_fr1'
# Configuration file
database:
  host: localhost
  port: 5432
  name: myapp_dev

server:
  host: localhost
  port: 3000
EOT_NESL_fr1
#!END_NESL_fr1
```

```sh nesl
#!NESL [@three-char-SHA-256: fr2]
action = "file_replace_text"
path = "/tmp/t_listener_replace/config.yaml"
old_text = <<'EOT_NESL_fr2'
database:
  host: localhost
  port: 5432
  name: myapp_dev
EOT_NESL_fr2
new_text = <<'EOT_NESL_fr2'
database:
  host: production.example.com
  port: 5432
  name: myapp_prod
EOT_NESL_fr2
#!END_NESL_fr2
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
fr1 ✅ file_write /tmp/t_listener_replace/config.yaml
fr2 ✅ file_replace_text /tmp/t_listener_replace/config.yaml
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
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

```sh nesl
#!NESL [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/t_listener_multi_match/app.js"
content = <<'EOT_NESL_fm1'
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
  const value = 100;
  return value > 0;
}
EOT_NESL_fm1
#!END_NESL_fm1
```

```sh nesl
#!NESL [@three-char-SHA-256: fm2]
action = "file_replace_text"
path = "/tmp/t_listener_multi_match/app.js"
old_text = <<'EOT_NESL_fm2'
  const value = 100;
EOT_NESL_fm2
new_text = <<'EOT_NESL_fm2'
  const value = 999;
EOT_NESL_fm2
#!END_NESL_fm2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - old_text appears 2 times, must appear exactly once
=== END ===

Testing multiple match failure.

```sh nesl
#!NESL [@three-char-SHA-256: fm1]
action = "file_write"
path = "/tmp/t_listener_multi_match/app.js"
content = <<'EOT_NESL_fm1'
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
  const value = 100;
  return value > 0;
}
EOT_NESL_fm1
#!END_NESL_fm1
```

```sh nesl
#!NESL [@three-char-SHA-256: fm2]
action = "file_replace_text"
path = "/tmp/t_listener_multi_match/app.js"
old_text = <<'EOT_NESL_fm2'
  const value = 100;
EOT_NESL_fm2
new_text = <<'EOT_NESL_fm2'
  const value = 999;
EOT_NESL_fm2
#!END_NESL_fm2
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - old_text appears 2 times, must appear exactly once
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
fm1 ✅ file_write /tmp/t_listener_multi_match/app.js
fm2 ❌ file_replace_text /tmp/t_listener_multi_match/app.js - old_text appears 2 times, must appear exactly once
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

```sh nesl
#!NESL [@three-char-SHA-256: fn1]
action = "file_write"
path = "/tmp/t_listener_no_match/readme.md"
content = <<'EOT_NESL_fn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_NESL_fn1
#!END_NESL_fn1
```

```sh nesl
#!NESL [@three-char-SHA-256: fn2]
action = "file_replace_text"
path = "/tmp/t_listener_no_match/readme.md"
old_text = <<'EOT_NESL_fn2'
## Configuration

Configure the app by editing config.json
EOT_NESL_fn2
new_text = <<'EOT_NESL_fn2'
## Configuration

Configure the app by editing settings.yaml
EOT_NESL_fn2
#!END_NESL_fn2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - old_text not found in file
=== END ===

Testing no match failure.

```sh nesl
#!NESL [@three-char-SHA-256: fn1]
action = "file_write"
path = "/tmp/t_listener_no_match/readme.md"
content = <<'EOT_NESL_fn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_NESL_fn1
#!END_NESL_fn1
```

```sh nesl
#!NESL [@three-char-SHA-256: fn2]
action = "file_replace_text"
path = "/tmp/t_listener_no_match/readme.md"
old_text = <<'EOT_NESL_fn2'
## Configuration

Configure the app by editing config.json
EOT_NESL_fn2
new_text = <<'EOT_NESL_fn2'
## Configuration

Configure the app by editing settings.yaml
EOT_NESL_fn2
#!END_NESL_fn2
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - old_text not found in file
=== END ===

=== OUTPUTS ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
fn1 ✅ file_write /tmp/t_listener_no_match/readme.md
fn2 ❌ file_replace_text /tmp/t_listener_no_match/readme.md - old_text not found in file
=== END ===

=== OUTPUTS ===
=== END ===
````

### file-read-formatting

#### Initial Content
````sh
Testing file read output formatting.
````

#### New Content
````sh
Testing file read output formatting.

```sh nesl
#!NESL [@three-char-SHA-256: rf1]
action = "file_write"
path = "/tmp/t_listener_read/sample.py"
content = <<'EOT_NESL_rf1'
#!/usr/bin/env python3
"""Sample Python file for testing."""

def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
EOT_NESL_rf1
#!END_NESL_rf1
```

```sh nesl
#!NESL [@three-char-SHA-256: rf2]
action = "file_read"
path = "/tmp/t_listener_read/sample.py"
#!END_NESL_rf2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
rf1 ✅ file_write /tmp/t_listener_read/sample.py
rf2 ✅ file_read /tmp/t_listener_read/sample.py
=== END ===

Testing file read output formatting.

```sh nesl
#!NESL [@three-char-SHA-256: rf1]
action = "file_write"
path = "/tmp/t_listener_read/sample.py"
content = <<'EOT_NESL_rf1'
#!/usr/bin/env python3
"""Sample Python file for testing."""

def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
EOT_NESL_rf1
#!END_NESL_rf1
```

```sh nesl
#!NESL [@three-char-SHA-256: rf2]
action = "file_read"
path = "/tmp/t_listener_read/sample.py"
#!END_NESL_rf2
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
rf1 ✅ file_write /tmp/t_listener_read/sample.py
rf2 ✅ file_read /tmp/t_listener_read/sample.py
=== END ===

=== OUTPUTS ===

[rf2] file_read:
=== START FILE: /tmp/t_listener_read/sample.py ===
#!/usr/bin/env python3
"""Sample Python file for testing."""

def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
=== END FILE: /tmp/t_listener_read/sample.py ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
rf1 ✅ file_write /tmp/t_listener_read/sample.py
rf2 ✅ file_read /tmp/t_listener_read/sample.py
=== END ===

=== OUTPUTS ===

[rf2] file_read:
=== START FILE: /tmp/t_listener_read/sample.py ===
#!/usr/bin/env python3
"""Sample Python file for testing."""

def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
=== END FILE: /tmp/t_listener_read/sample.py ===
=== END ===
````

### file-read-numbered-formatting

#### Initial Content
````sh
Testing file read numbered output formatting.
````

#### New Content
````sh
Testing file read numbered output formatting.

```sh nesl
#!NESL [@three-char-SHA-256: rn1]
action = "file_write"
path = "/tmp/t_listener_read_num/config.yaml"
content = <<'EOT_NESL_rn1'
# Application Configuration
app:
  name: MyApp
  version: 1.0.0
  debug: true

database:
  host: localhost
  port: 5432
  name: myapp_db
  
logging:
  level: info
  file: /var/log/myapp.log
EOT_NESL_rn1
#!END_NESL_rn1
```

```sh nesl
#!NESL [@three-char-SHA-256: rn2]
action = "file_read_numbered"
path = "/tmp/t_listener_read_num/config.yaml"
#!END_NESL_rn2
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
rn1 ✅ file_write /tmp/t_listener_read_num/config.yaml
rn2 ✅ file_read_numbered /tmp/t_listener_read_num/config.yaml
=== END ===

Testing file read numbered output formatting.

```sh nesl
#!NESL [@three-char-SHA-256: rn1]
action = "file_write"
path = "/tmp/t_listener_read_num/config.yaml"
content = <<'EOT_NESL_rn1'
# Application Configuration
app:
  name: MyApp
  version: 1.0.0
  debug: true

database:
  host: localhost
  port: 5432
  name: myapp_db
  
logging:
  level: info
  file: /var/log/myapp.log
EOT_NESL_rn1
#!END_NESL_rn1
```

```sh nesl
#!NESL [@three-char-SHA-256: rn2]
action = "file_read_numbered"
path = "/tmp/t_listener_read_num/config.yaml"
#!END_NESL_rn2
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
rn1 ✅ file_write /tmp/t_listener_read_num/config.yaml
rn2 ✅ file_read_numbered /tmp/t_listener_read_num/config.yaml
=== END ===

=== OUTPUTS ===

[rn2] file_read_numbered:
=== START FILE: [numbered] /tmp/t_listener_read_num/config.yaml ===
 1: # Application Configuration
 2: app:
 3:   name: MyApp
 4:   version: 1.0.0
 5:   debug: true
 6: 
 7: database:
 8:   host: localhost
 9:   port: 5432
10:   name: myapp_db
11:   
12: logging:
13:   level: info
14:   file: /var/log/myapp.log
=== END FILE: [numbered] /tmp/t_listener_read_num/config.yaml ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
rn1 ✅ file_write /tmp/t_listener_read_num/config.yaml
rn2 ✅ file_read_numbered /tmp/t_listener_read_num/config.yaml
=== END ===

=== OUTPUTS ===

[rn2] file_read_numbered:
=== START FILE: [numbered] /tmp/t_listener_read_num/config.yaml ===
 1: # Application Configuration
 2: app:
 3:   name: MyApp
 4:   version: 1.0.0
 5:   debug: true
 6: 
 7: database:
 8:   host: localhost
 9:   port: 5432
10:   name: myapp_db
11:   
12: logging:
13:   level: info
14:   file: /var/log/myapp.log
=== END FILE: [numbered] /tmp/t_listener_read_num/config.yaml ===
=== END ===
````

### files-read-formatting

#### Initial Content
````sh
Testing files read output formatting with multiple files.
````

#### New Content
````sh
Testing files read output formatting with multiple files.

```sh nesl
#!NESL [@three-char-SHA-256: mr1]
action = "file_write"
path = "/tmp/t_listener_multi_read/README.md"
content = <<'EOT_NESL_mr1'
# Project Documentation

This is the main README file.

## Features
- Feature 1
- Feature 2
- Feature 3
EOT_NESL_mr1
#!END_NESL_mr1
```

```sh nesl
#!NESL [@three-char-SHA-256: mr2]
action = "file_write"
path = "/tmp/t_listener_multi_read/main.py"
content = <<'EOT_NESL_mr2'
#!/usr/bin/env python3

def main():
    print("Hello from main!")

if __name__ == "__main__":
    main()
EOT_NESL_mr2
#!END_NESL_mr2
```

```sh nesl
#!NESL [@three-char-SHA-256: mr3]
action = "file_write"
path = "/tmp/t_listener_multi_read/.gitignore"
content = <<'EOT_NESL_mr3'
*.pyc
__pycache__/
.env
venv/
EOT_NESL_mr3
#!END_NESL_mr3
```

```sh nesl
#!NESL [@three-char-SHA-256: mr4]
action = "files_read"
paths = <<'EOT_NESL_mr4'
/tmp/t_listener_multi_read/README.md
/tmp/t_listener_multi_read/main.py
/tmp/t_listener_multi_read/.gitignore
EOT_NESL_mr4
#!END_NESL_mr4
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
mr1 ✅ file_write /tmp/t_listener_multi_read/README.md
mr2 ✅ file_write /tmp/t_listener_multi_read/main.py
mr3 ✅ file_write /tmp/t_listener_multi_read/.gitignore
mr4 ✅ files_read (3 files)
=== END ===

Testing files read output formatting with multiple files.

```sh nesl
#!NESL [@three-char-SHA-256: mr1]
action = "file_write"
path = "/tmp/t_listener_multi_read/README.md"
content = <<'EOT_NESL_mr1'
# Project Documentation

This is the main README file.

## Features
- Feature 1
- Feature 2
- Feature 3
EOT_NESL_mr1
#!END_NESL_mr1
```

```sh nesl
#!NESL [@three-char-SHA-256: mr2]
action = "file_write"
path = "/tmp/t_listener_multi_read/main.py"
content = <<'EOT_NESL_mr2'
#!/usr/bin/env python3

def main():
    print("Hello from main!")

if __name__ == "__main__":
    main()
EOT_NESL_mr2
#!END_NESL_mr2
```

```sh nesl
#!NESL [@three-char-SHA-256: mr3]
action = "file_write"
path = "/tmp/t_listener_multi_read/.gitignore"
content = <<'EOT_NESL_mr3'
*.pyc
__pycache__/
.env
venv/
EOT_NESL_mr3
#!END_NESL_mr3
```

```sh nesl
#!NESL [@three-char-SHA-256: mr4]
action = "files_read"
paths = <<'EOT_NESL_mr4'
/tmp/t_listener_multi_read/README.md
/tmp/t_listener_multi_read/main.py
/tmp/t_listener_multi_read/.gitignore
EOT_NESL_mr4
#!END_NESL_mr4
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
mr1 ✅ file_write /tmp/t_listener_multi_read/README.md
mr2 ✅ file_write /tmp/t_listener_multi_read/main.py
mr3 ✅ file_write /tmp/t_listener_multi_read/.gitignore
mr4 ✅ files_read (3 files)
=== END ===

=== OUTPUTS ===

[mr4] files_read:
Reading 3 files:
- /tmp/t_listener_multi_read/README.md
- /tmp/t_listener_multi_read/main.py
- /tmp/t_listener_multi_read/.gitignore

=== START FILE: /tmp/t_listener_multi_read/README.md ===
# Project Documentation

This is the main README file.

## Features
- Feature 1
- Feature 2
- Feature 3
=== END FILE: /tmp/t_listener_multi_read/README.md ===

=== START FILE: /tmp/t_listener_multi_read/main.py ===
#!/usr/bin/env python3

def main():
    print("Hello from main!")

if __name__ == "__main__":
    main()
=== END FILE: /tmp/t_listener_multi_read/main.py ===

=== START FILE: /tmp/t_listener_multi_read/.gitignore ===
*.pyc
__pycache__/
.env
venv/
=== END FILE: /tmp/t_listener_multi_read/.gitignore ===
=== END ===
````

#### clipboard
````sh
=== LOAF RESULTS ===
mr1 ✅ file_write /tmp/t_listener_multi_read/README.md
mr2 ✅ file_write /tmp/t_listener_multi_read/main.py
mr3 ✅ file_write /tmp/t_listener_multi_read/.gitignore
mr4 ✅ files_read (3 files)
=== END ===

=== OUTPUTS ===

[mr4] files_read:
Reading 3 files:
- /tmp/t_listener_multi_read/README.md
- /tmp/t_listener_multi_read/main.py
- /tmp/t_listener_multi_read/.gitignore

=== START FILE: /tmp/t_listener_multi_read/README.md ===
# Project Documentation

This is the main README file.

## Features
- Feature 1
- Feature 2
- Feature 3
=== END FILE: /tmp/t_listener_multi_read/README.md ===

=== START FILE: /tmp/t_listener_multi_read/main.py ===
#!/usr/bin/env python3

def main():
    print("Hello from main!")

if __name__ == "__main__":
    main()
=== END FILE: /tmp/t_listener_multi_read/main.py ===

=== START FILE: /tmp/t_listener_multi_read/.gitignore ===
*.pyc
__pycache__/
.env
venv/
=== END FILE: /tmp/t_listener_multi_read/.gitignore ===
=== END ===
````

### listener-parsing-errors

#### Initial Content
````sh
Testing multiple parse error types.
````

#### New Content
````sh
Testing multiple parse error types.

```sh nesl
#!NESL [@three-char-SHA-256: pe1]
action = "file_write"
path = "/tmp/t_parse_errors/test1.txt"
content = "missing closing quote
#!END_NESL_pe1
```

```sh nesl
#!NESL [@three-char-SHA-256: pe2]
action := "file_read"
path = "/tmp/t_parse_errors/test2.txt"
#!END_NESL_pe2
```

```sh nesl
#!NESL [@three-char-SHA-256: pe3]
just some random text without assignment
#!END_NESL_pe3
```

```sh nesl
#!NESL [@three-char-SHA-256: pe4]
action = "file_write"
path = <<EOT_NESL_pe4
/tmp/test.txt
EOT_NESL_pe4
#!END_NESL_pe4
```

```sh nesl
#!NESL [@three-char-SHA-256: pe5]
action = "exec"
lang = "bash"
code = "echo 'test'" extra stuff
#!END_NESL_pe5
```

```sh nesl
#!NESL [@three-char-SHA-256: 1234567890]
action = "exec"
lang = "bash"
code = "echo 'test'"
#!END_NESL_1234567890
```
````

#### Expected Prepended Results
````sh
📋 Copied to clipboard

=== LOAF RESULTS ===
pe1 ❌ file_write ERROR: Unclosed quoted string (line 4)
pe2 ❌ -          ERROR: Invalid assignment operator ':=' - only '=' is allowed (line 12)
pe3 ❌ -          ERROR: Invalid line format in block 'pe3': not a valid key-value assignment or empty line (line 19)
pe4 ❌ file_write ERROR: 3 syntax errors (line 25)
                    - Value must be a quoted string or heredoc
                    - Invalid line format in block 'pe4': not a valid key-value assignment or empty line (2 occurrences)
pe5 ❌ exec       ERROR: Unexpected content after quoted value (line 34)
unknown ❌ -          ERROR: Block ID must be exactly 3 characters (line 42)
=== END ===

Testing multiple parse error types.

```sh nesl
#!NESL [@three-char-SHA-256: pe1]
action = "file_write"
path = "/tmp/t_parse_errors/test1.txt"
content = "missing closing quote
#!END_NESL_pe1
```

```sh nesl
#!NESL [@three-char-SHA-256: pe2]
action := "file_read"
path = "/tmp/t_parse_errors/test2.txt"
#!END_NESL_pe2
```

```sh nesl
#!NESL [@three-char-SHA-256: pe3]
just some random text without assignment
#!END_NESL_pe3
```

```sh nesl
#!NESL [@three-char-SHA-256: pe4]
action = "file_write"
path = <<EOT_NESL_pe4
/tmp/test.txt
EOT_NESL_pe4
#!END_NESL_pe4
```

```sh nesl
#!NESL [@three-char-SHA-256: pe5]
action = "exec"
lang = "bash"
code = "echo 'test'" extra stuff
#!END_NESL_pe5
```

```sh nesl
#!NESL [@three-char-SHA-256: 1234567890]
action = "exec"
lang = "bash"
code = "echo 'test'"
#!END_NESL_1234567890
```
````

#### Expected Output File
````sh
=== LOAF RESULTS ===
pe1 ❌ file_write ERROR: Unclosed quoted string (line 4)
pe2 ❌ -          ERROR: Invalid assignment operator ':=' - only '=' is allowed (line 12)
pe3 ❌ -          ERROR: Invalid line format in block 'pe3': not a valid key-value assignment or empty line (line 19)
pe4 ❌ file_write ERROR: 3 syntax errors (line 25)
                    - Value must be a quoted string or heredoc
                    - Invalid line format in block 'pe4': not a valid key-value assignment or empty line (2 occurrences)
pe5 ❌ exec       ERROR: Unexpected content after quoted value (line 34)
unknown ❌ -          ERROR: Block ID must be exactly 3 characters (line 42)
=== END ===

=== OUTPUTS ===
=== END ===
````

#### Expected Clipboard
````sh
=== LOAF RESULTS ===
pe1 ❌ file_write ERROR: Unclosed quoted string (line 4)
pe2 ❌ -          ERROR: Invalid assignment operator ':=' - only '=' is allowed (line 12)
pe3 ❌ -          ERROR: Invalid line format in block 'pe3': not a valid key-value assignment or empty line (line 19)
pe4 ❌ file_write ERROR: 3 syntax errors (line 25)
                    - Value must be a quoted string or heredoc
                    - Invalid line format in block 'pe4': not a valid key-value assignment or empty line (2 occurrences)
pe5 ❌ exec       ERROR: Unexpected content after quoted value (line 34)
unknown ❌ -          ERROR: Block ID must be exactly 3 characters (line 42)
=== END ===

=== OUTPUTS ===
=== END ===
````
