ok here's what i want 


# BACKGROUND / CONTEXT

i'm going to be building an autonomous AI coding CLI tool where the LLM can read and write code, edit it, run tests, read tests results, change files, edit files, create/delete/modify/search-repalce/move files/dirs, re-run tests, edit the code to fix the code or tests, re-run tests, etc.
# CLADA REQUIREMENTS

what we need rigth now is a way to modify the filesystem and run tests based on LLM desires.  we are building a protocol, a structured language of commands, for the LLM to use to communicate with our locally running clada tool to change the fs adn run tests etc as needed.  

## other rejected considerations

we thougth about having LLM write bash scripts or use unified diff language, but we need it to do more than just search/replace, and also LLMs are known to struggle with syntax.  

## more clada details

so we are building a very simple communication system between the LLM and our machine.  we will teach the LLM how to use our system with brief clear examples to minimize cognitive load for it.  we need a way to parse LLM output to read instructions. and we need a system where LLM can nest quote instruction syntax within commands without screwing stuff up. so we need open/close notation for parsing.  we will use xml for this cos rigid and common


## implementation 

i think we need to find a nice xml parser that works in node.  it needs to be able to parse xml even if its got a bunch of other random text scatered around before, after, between our xml tags. we'll call our special syntax "clada markup language" = cml

so we need to parse the xml, get our tree of commands, and then execute them.  

supported commands:

edit        
    - use search/replace blocks. ideally, matches intended text perfectly.  if that fails we'll try a no-whitespace search to see if htat helps
    - search block can be one complete search block, or it can support two search blocks (search-head and search-tail) to match huge text blocks without having to waste time and tokens listing out every single character in between 
overwrite  
    -(creates file and path if needed)
move       
    - (moves file or dir.  optional rename behavior)
delete     
    - delete file or recursively delete dir
exec        
    - this executes code like running tests.  

## exec 

so this command is a little scary cos its running code that LLM wrote on the machine.  but that's okay. we are accepting this risk.  so we'll need to run it in a thread or whatever. i really dont know.  p sure there's one right way to do this tho.  we need to stream the output from the executed command as its running.  and also have a way to output the entire command output somewhere. 

## git stuff 

clada needs to commit the current code state both before and after taking any action that could change the underlying file system.  clada doens't actually use any LLMs itself so for commit messages, it can optionally take in a commit message if clada is being used by other node code.  otherwise it just uses a timestamp and signs it "💚clada"

clada doesn't do anything else with git. just constantly saving state before and after making changes.  the user can use git to undo or squash stuff. 

## implementation

clada is written in typescript.  a node project. 

## behavior 

- clada can only touch files in (and nested within, recursively) the current dir where its run.
- clada works fine with relative paths or full paths.

## errors

throw an error and abort the given task in these scenarios. and display a helpful error.

also obviously throw and abort when facing any filesystem or OS errors /exceptions

### edit
- if file not found
- if the "search" block matches more than once
    the error message should say somethign about how you need to include more text in your search block(s)
- if the "search" block matches nothing
    error message should mention that the search block(s) must match the intended target text exactly and explictly, char by char

### overwrite
- just filesystem stuff for this one

### move 
- if file not found 

### delete 
- if file not found 

### exec
- just OS stuff, like if theres any reason its not allowed to even run in the first place i guess...

## other behaviors

### edit search resiliency - ignore whitespace

so when trying to replace code, first we try to find an exact match.  if that doesn't match anything, we normalize whitespace and search that way.  aka, we put the file contents in memory as a string var and remove all whitespace, and then remove all whitespace from the search text, and see if anything matches (exactly once).  if so, we then figure out where that match is exactly in the orignal file, and make the replacement. 


# example

here is a large example LLM response that contains every possible command and configuration.

```xml
other file contents to ignore

<tasks>

    text to ignore

<task>
<i>
a brief explanation 
</i>
<path>
Users/stuart/repos/foo/bar/file.txt    
</path>
<c>
overwrite
</c>
<x>
here is 
the  
   new 
file contents ☘️    
</x>
</task>


<task>
<i>
a brief description
</i>
<path>
foo/file2.txt    
</path>
<c>
edit
</c>
<search>
   new 
   wonderful
   fantastic!!!!
        amazing
  file contents ☘️    
</search>
<replace>
   brand new 
replacement 
    contents 🌈
</replace>
</task>

<task>
<i>
a brief description
</i>
<path>
foo/file2.txt    
</path>
<c>
edit
</c>
<search-head>
new 
   wonde   
</search-head>
<search-tail>
ing
  file contents ☘️    
</search-tail>
<replace>
   brand new 
replacement 
    contents 🌈
</replace>
</task>


<task>
<i>
another explanation
</i>
<path>
foo/file2.txt    
</path>
<c>
delete
</c>
</task>


<task>
<i>
this is why we're doing this
</i>
<path>
foo/file2.txt    
</path>
<c>
move
</c>
<x>
foo/bar
</x>
</task>

more meaningless text

<task>
<i>
a brief explanation
</i>
<path>
foo/file2.txt    
</path>
<c>
move
</c>
<x>
foo/bar/file2_new_name.txt 
</x>
</task>


<task>
<i>
another description
</i>
<c>
exec
</c>
<x>
npm run test
</x>
</task>

meaningless text

</tasks>

more file contents to ignore
```

