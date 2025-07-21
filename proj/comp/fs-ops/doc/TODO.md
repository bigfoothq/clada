Ambiguous file_replace_text behavior:

- What happens if old_text appears multiple times but count=1? Which occurrence gets replaced?
    
    this results in an error!

What if old_text doesn't exist? Silent success or error?


    error!

---

throw an error if the "path" isn't a full absolute path

--- 

implement exec and file_read

---

update nesl-js parser so it includes in the output whether hte string was inline quoted, or heredoc style.

or first should we support regex sed or soemthing? lets chat w claude about the best way to do this... 