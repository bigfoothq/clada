
## Debugging process 

### mostly future concerns

so the workflow is we write the cov, then the test, then the code.  and the we run the tests and we'll probably get errors we have to sort through.  VERY IMPORTANT:  during this debugging process, DO NOT ALLOW EDITS ON THE TESTS THEMSELVES.  except under explicit manual human approval.  only stuff like getting things to like compile or import properly etc.  but any changes to business logic kinda stuff may ONLY happen to the implemented code file, not the test.  any automated pipeline must explicity block changes to the tests during this debugging process.

and for each round of debugging edits, afterwards, we need to summarize the step and store it in a log in the file system.  high level what all the problems were, what we theorized the underlying cause was, and how we attempted to fix it.  save several types of debugging logs actually ... one log per test.. well actually idk the best way to organize these.  probably per test.  cos each test prob have its own dependencies and quirks.  but at some point it might make sense to store a higher level log of debugging efforts... but for now lets just keep them as siblings to the actual tests.  but where to put them?  i think they should be right there in the src dir.  cos they're like WIP stuff, jus tlike the src implementation.  not frozen like cov and test.  this is a good idea. 

also we need a meta view on debugging... always be analyzing the last 4 debug logs... if we seem to be going in circles, then tell the LLM to take a step back and focus on diagnosing.  if we try 2 different fixes for the same problem and it still fails.  or if we do like 3 fixes and the overall number of fialures isn't shrinking.  

be tracking the number of test failures per debug round.  remind the LLM to check stuff online if needed.  and once the test is passing, do a couple round of cleanup to remove any old debug stuff or do DRY refactoring.  then another round of debugging prob.  this whole iteration per single test.  dont run multiple tests at a time.  granular. 

remind it to "wdyt? focus on diagnosing.  think carefully and iteratively.  a few times in a row"  bully it into really thinking long and hard about each failure.  the iterative thinking.  hone the prompt for this.  single-shot thoughts typically fail for debugging stuff.  

if we really arent making progress with debugging, tell it to take a hgue step back and think about everything from a high level.  dont change the test ofc, but consider if we are approaching anything in the wrong way fundamentally.  or need to make any high level changes to our design or arch.  to focus on highest level goal for the project even it means we actually do need to change our cov.  but still dont change the cov or test w/o human approval