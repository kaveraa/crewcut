---
name: crewcut-audit
description: >
  Audit a whole tree for over-building and token waste, read-only. Use when
  the user asks for a crewcut audit, wants to know what could be deleted from
  a repository, or asks where the bloat is.
argument-hint: "[path]"
---

# Crewcut audit

1. Scope: `$ARGUMENTS` if given (a directory inside the project), else the
   project root. Do not read the files yourself.
2. Run the `crewcut-reviewer` agent (namespaced `crewcut:crewcut-reviewer`)
   in audit mode: tell it the directory to audit and that there is no diff.
3. Relay its findings verbatim. Change nothing, add nothing, explain nothing.

The hook has put the session in the read-only `review` state. It stays until
the user types `/crewcut <level>`; do not switch back yourself.
