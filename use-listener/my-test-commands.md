📋 Copied to clipboard


=== OUTPUTS ===

[rs2] file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md:
{
  "path": "/Users/stuart/repos/clada/use-listener/test-files/ham.md",
  "content": " 1: \n 2: The Tragedy of Hamlet, Prince of Denmark\n 3: Shakespeare homepage | Hamlet | Entire play\n 4: ACT I\n 5: SCENE I. Elsinore. A platform before the castle.\n 6: FRANCISCO at his post. Enter to him BERNARDO\n 7: BERNARDO"
}
=== END ===




=== OUTPUTS ===

[rs2] file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md:
=== START FILE: [numbered] /Users/stuart/repos/clada/use-listener/test-files/ham.md: ===
 1: 
 2: The Tragedy of Hamlet, Prince of Denmark
 3: Shakespeare homepage | Hamlet | Entire play
 4: ACT I
 5: SCENE I. Elsinore. A platform before the castle.
 6: FRANCISCO at his post. Enter to him BERNARDO
 7: BERNARDO
=== END FILE: [numbered] /Users/stuart/repos/clada/use-listener/test-files/ham.md: ===
=== END ===

=== CLADA RESULTS ===
rs2 ✅ file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md
=== END ===

📋 Copied to clipboard

=== CLADA RESULTS ===
rs2 ✅ file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md
=== END ===


```sh sham
#!SHAM [@three-char-SHA-256: rs2]
action = "file_read_numbered"
path = "/Users/stuart/repos/clada/use-listener/test-files/ham.md"
#!END_SHAM_rs2
```
=== CLADA RESULTS ===
rs2 ✅ file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md
=== END ===

=== OUTPUTS ===

[rs2] file_read_numbered /Users/stuart/repos/clada/use-listener/test-files/ham.md:
{
  "path": "/Users/stuart/repos/clada/use-listener/test-files/ham.md",
  "content": " 1: \n 2: The Tragedy of Hamlet, Prince of Denmark\n 3: Shakespeare homepage | Hamlet | Entire play\n 4: ACT I\n 5: SCENE I. Elsinore. A platform before the castle.\n 6: FRANCISCO at his post. Enter to him BERNARDO\n 7: BERNARDO"
}
=== END ===