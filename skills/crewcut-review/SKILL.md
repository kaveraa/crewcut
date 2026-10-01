---
name: crewcut-review
description: >
  Review a diff for over-building and token waste, read-only. Use when the
  user asks for a crewcut review or wants to know what could be cut.
argument-hint: "[git range or files]"
---

# Crewcut review

1. Scope: `$ARGUMENTS` if given (a git range such as `main..HEAD`, or file
   paths); otherwise the uncommitted changes.
2. Produce the diff with one command and do not print it to the user:
   - range: `git diff <range>`
   - files: `git diff -- <files>` plus `git diff --cached -- <files>`
   - no argument: `git diff` plus `git diff --cached`
   If the diff is empty, answer `nothing to review` and stop.
3. Run the `crewcut-reviewer` agent (namespaced `crewcut:crewcut-reviewer`)
   with the diff and the scope as its input.
4. Relay its findings verbatim. Change nothing, add nothing, explain nothing.

The hook has put the session in the read-only `review` state. It stays until
the user types `/crewcut <level>`; do not switch back yourself.
