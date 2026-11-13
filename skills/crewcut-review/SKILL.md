---
name: crewcut-review
description: >
  Read-only review of a change: bugs, security, load, missing tests, slow
  paths, what to cut. Use when the user asks for a review or what could be cut.
argument-hint: "[git range, PR link or files]"
---

# Crewcut review

1. Scope: `$ARGUMENTS` if given (a git range such as `main..HEAD`, a PR
   link, or file paths); otherwise the uncommitted changes, or the last
   commit when there are none.
2. Produce the diff with one command and do not print it to the user:
   - range: `git diff <range>`; a PR link: `gh pr diff <number>`
   - files: `git diff -- <files>` plus `git diff --cached -- <files>`
   - no argument: `git diff` plus `git diff --cached`, then `git show` of
     the last commit if both are empty
   If there is still nothing, answer `nothing to review` and stop.
3. Run the `crewcut-reviewer` agent (namespaced `crewcut:crewcut-reviewer`)
   with the diff and the scope as its input.
4. Relay its report verbatim. Change nothing, add nothing, explain nothing.

The report is what the user asked for: it is given in full, whatever the
level. The level itself does not change.
