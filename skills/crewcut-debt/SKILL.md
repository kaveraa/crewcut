---
name: crewcut-debt
description: >
  List every corner cut on purpose, read-only. Use when the user asks what
  crewcut skipped, where the shortcuts are, or for the crewcut debt or ledger.
argument-hint: "[path]"
---

# Crewcut debt

Every corner cut on purpose carries a `crewcut:` comment naming the limit and
the condition to revisit it. This command gathers them so a shortcut stays a
choice instead of becoming the design by neglect.

1. Scope: `$ARGUMENTS` if given (a directory inside the project), else the
   project root.
2. Find the markers with one Grep call for `crewcut:` inside a comment
   (`//`, `#`, `--`, `/*`, `*`, `<!--`), skipping dependencies, build
   output and lock files. Do not print the raw matches.
3. Answer with a line for each marker, files in path order:

   `<file>:<line>: <what was cut> -> add when: <condition>`

   Take both parts from the comment. A marker that names no condition gets
   `-> no trigger` instead; those are the ones that silently rot.
4. End with exactly one line: `<N> markers, <M> without a trigger`, or
   `no crewcut debt` when nothing was found.

Change nothing. Write the ledger to a file only when the user asks for it.
