---
name: crewcut-audit
description: >
  Read-only audit of a whole tree: bugs, security, load, untested risk, slow
  paths, what to delete. Use when the user asks for an audit, a health check
  of the repository, or where the bloat is.
argument-hint: "[path]"
---

# Crewcut audit

1. Scope: `$ARGUMENTS` if given (a directory inside the project), else the
   project root. Do not read the files yourself.
2. Run the `crewcut-reviewer` agent (namespaced `crewcut:crewcut-reviewer`)
   in audit mode: tell it the directory to audit and that there is no diff.
3. Relay its report verbatim. Change nothing, add nothing, explain nothing.

The report is what the user asked for: it is given in full, whatever the
level. The level itself does not change.
