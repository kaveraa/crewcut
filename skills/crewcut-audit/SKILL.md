---
name: crewcut-audit
description: >
  Audit a whole tree like the senior who just inherited it: bugs, security
  holes, what breaks at the real load, risky code without tests, slow paths,
  and what to delete, merge or split. Ranked, each finding with its case
  and fix. Read-only, changes nothing. Use when the user asks for an audit,
  a crewcut audit, a health check of the repository, or where the bloat is.
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
