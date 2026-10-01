---
name: crewcut-help
description: Reference card for crewcut levels, commands and settings. One-shot display, changes nothing.
disable-model-invocation: true
---

Print the card below verbatim, as a code block, and stop. Do not change the
level, do not write any file, do not add commentary.

```
crewcut: short hair, short code

Levels
  off     plugin silent for this session
  lite    output discipline, light reading habit
  full    output, reading, writing and tool discipline (default)
  ultra   full, plus one-line answers; no new file or dependency unasked

Commands
  /crewcut                   show the current level and the default
  /crewcut <level>           switch for this session
  /crewcut default <level>   set the default for new sessions
  /crewcut subagents on|off  inject the rules into subagents (on by default)
  /crewcut-review [scope]    read-only review of a diff: what to cut
  /crewcut-audit [path]      read-only audit of a whole tree: what to cut
  /crewcut-help              this card

Also: "stop crewcut" or "normal mode" as a whole message = /crewcut off.
A resumed session and a context compaction keep the level you chose.

Settings
  CREWCUT_DEFAULT_MODE       env var, wins over the config file
  ~/.claude/crewcut.json     { "defaultLevel": "...", "subagents": true|false }
  ~/.claude/crewcut-mode     the level of the current session (per user)
```
