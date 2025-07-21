=== PROCESSED: 2025-07-21 17:27:59 ===
SUCCESS Block 1: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
SUCCESS Block 2: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
SUCCESS Block 3: Updated /Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
===

I need to update all test cases that expect the spawn options, not just the first one:

<<<EXPLANATION>>>
Add detached property to all expected spawn options in test data
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
<<<SEARCH>>>
      "expected": {
        "cwd": "{PROCESS_CWD}",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true
      }
<<<REPLACE>>>
      "expected": {
        "cwd": "{PROCESS_CWD}",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true,
        "detached": true
      }
<<<END>>>

<<<EXPLANATION>>>
Add detached property to custom cwd test case
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
<<<SEARCH>>>
      "expected": {
        "cwd": "/tmp",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true
      }
<<<REPLACE>>>
      "expected": {
        "cwd": "/tmp",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true,
        "detached": true
      }
<<<END>>>

<<<EXPLANATION>>>
Add detached property to relative path test case
<<<FILE>>>
/Users/stuart/repos/clada/proj/comp/exec/test-data/unit/buildSpawnOptions.json
<<<SEARCH>>>
      "expected": {
        "cwd": "{RESOLVED_PATH}",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true
      }
<<<REPLACE>>>
      "expected": {
        "cwd": "{RESOLVED_PATH}",
        "env": "{PROCESS_ENV}",
        "shell": false,
        "windowsHide": true,
        "detached": true
      }
<<<END>>>