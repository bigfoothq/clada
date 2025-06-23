
## Debugging process 

### more LLM based workflow stuff

#### debugging

so the workflow is we write the cov, then the test, then the code.  and the we run the tests and we'll probably get errors we have to sort through.  VERY IMPORTANT:  during this debugging process, DO NOT ALLOW EDITS ON THE TESTS THEMSELVES.  except under explicit manual human approval.  only stuff like getting things to like compile or import properly etc.  but any changes to business logic kinda stuff may ONLY happen to the implemented code file, not the test.  any automated pipeline must explicity block changes to the tests during this debugging process.

and for each round of debugging edits, afterwards, we need to summarize the step and store it in a log in the file system.  high level what all the problems were, what we theorized the underlying cause was, and how we attempted to fix it.  save several types of debugging logs actually ... one log per test.. well actually idk the best way to organize these.  probably per test.  cos each test prob have its own dependencies and quirks.  but at some point it might make sense to store a higher level log of debugging efforts... but for now lets just keep them as siblings to the actual tests.  but where to put them?  i think they should be right there in the src dir.  cos they're like WIP stuff, jus tlike the src implementation.  not frozen like cov and test.  this is a good idea. 

also we need a meta view on debugging... always be analyzing the last 4 debug logs... if we seem to be going in circles, then tell the LLM to take a step back and focus on diagnosing.  if we try 2 different fixes for the same problem and it still fails.  or if we do like 3 fixes and the overall number of fialures isn't shrinking.  

be tracking the number of test failures per debug round.  remind the LLM to check stuff online if needed.  and once the test is passing, do a couple round of cleanup to remove any old debug stuff or do DRY refactoring.  then another round of debugging prob.  this whole iteration per single test.  dont run multiple tests at a time.  granular. 

remind it to "wdyt? focus on diagnosing.  think carefully and iteratively.  a few times in a row"  bully it into really thinking long and hard about each failure.  the iterative thinking.  hone the prompt for this.  single-shot thoughts typically fail for debugging stuff.  

if we really arent making progress with debugging, tell it to take a hgue step back and think about everything from a high level.  dont change the test ofc, but consider if we are approaching anything in the wrong way fundamentally.  or need to make any high level changes to our design or arch.  to focus on highest level goal for the project even it means we actually do need to change our cov.  but still dont change the cov or test w/o human approval

#### the [cov -> test] process

... when creating tests, make sure to stipualte "dont use any shared code" unless we really want that.  and if so we need to make sure it has access to the actual shared code.  or at least the code's cov or interfaces or something... this brings up a good question... should shared code have an "API.md" file?  so implementing code can just read the api instead of needing the full code in context.... proably...

once we think think the covs and tests are complete:

    check out our new "edit" component tests. just created from the covs, which are also pretty new. how do these tests look? appropriate? faithful to covs? reasonable for clada? we just updated the edit component covs. need to update tests to match. make sure each test implements each cov behavior completely and faithfully. probably missing some tests rn

    the tests might be complete actually.  possibly time to write the edit comp src code

    wdyt?  do 3 rounds of this complete process: [thoroughly re-read your previous answers as a startingn point, then scour the docs for relevant backgorund info, then do critical analysis, then self reflection]  and then at the end, list out all the unresolved uncertainties, make executive deicions for them, and then reflect on those to share final decisions and any remaining uncertainties.  summarize your final thoughts and summary at the end.  check online as you go as needed

after basically every response:

    feel good about this?

... make decision tree from this.  like if it says "yes" or "yes with caveats" or "no" ... if not "yes" we need to do the 3x deep thougth rounds followed by prob more thoughts where encouraged to take a step back, think about whats best here and for main proj, and consider chnaging covs etc... and then something like:

    so in summary do you think we should change the tests more or leave them as is? 50 WOL

but make it always very clear to the LLM whether its certain changes were implemented or not.  even if we're sharing updated docs with it.  it might not read the new/changed files. 

#### the [test -> code] process

    how does this execute.test.ts look?  is it faithfully adhereing to its cov?  think closely and critically and incrementally 

    we need to write the parse.js file for the edit component.  do not use any shared code. brainstorm first.  dont write any code yet
        (give it the complete file tree)

^ we need to either follow up change the prompt so the end is clear about if it knows what to do or has questions first

    ok generate the code now.  either the whole file or just part of it, whatever you feel comfortable accurately creating within one response.

...

    feel good about this?

...

    so should we edit it further or go ahead and run it as is?

#### running/debugging tests 

dont even give claude/llm the test ! just give it the cov and the src code.  so no risk of editing the test.    
... eh htis is prob no good.  its needing to see the test code for debugging rn.  we just need strict blocks against editnig the test.  require human to intervene

#### post debugging success

    our "edit" parse code is now passing the tests.  but the concern is that we might have tests that are unfortunatley just validating whatever bad code there is.  think from a high level for whats best for the project, and then carefully examing the covs for this test, and then make sure the tests are actualy testing it, and make sure the code looks good for it too.