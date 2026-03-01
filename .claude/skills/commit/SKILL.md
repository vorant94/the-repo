---
name: commit
description: commits changed in the repo using git VCS
disable-model-invocation: true
tools: AskUserQuestion, Read, Grep, Glob
---

## Commit current changes in the repo:

1. Explore the full list of changes that are both staged and not staged for commit to include what you did during the session and any potential changes made by user manually
   - if you find any changes that you yourself hadn't done, AskUserQuestion whether he wants to include them in the commit or not
2. Come up with a short and descriptive commit message including a general title and summary list of included changes
3. There may be changes that were made "along the way", that aren't necessarily directly related to initial task itself. Don't forget to mention them as well if there are any
4. Commit the changes

## Other important rules

- Gitignore generated/output files by default
- DO NOT ADD YOURSELF AS A CO-AUTHOR OF A COMMIT!!!
