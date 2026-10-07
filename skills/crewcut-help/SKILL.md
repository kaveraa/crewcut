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
  /crewcut lang <code>       reply language (en es fr de ko zh), asked once
  /crewcut markers on|off    "crewcut:" comment on each corner cut (off by default)
  /crewcut tests on|off      off: a test only when the ticket asks (on by default, asked once)
  /crewcut-review [scope]    read-only review of a diff: what to cut
  /crewcut-audit [path]      read-only audit of a whole tree: what to cut
  /crewcut-debt [path]       read-only ledger of the "crewcut:" markers
  /crewcut-gain              what the plugin saves, as measured on its evals
  /crewcut-help              this card
  /crewcut uninstall         remove the plugin's files next to your settings,
                             then finish with /plugin remove crewcut

Also: "stop crewcut" or "normal mode" as a whole message = /crewcut off.
A resumed session and a context compaction keep the level you chose.
/crewcut-review and /crewcut-audit put the session in the read-only
"review" state until the next /crewcut <level>.

Settings
  CREWCUT_DEFAULT_MODE       env var, wins over the config file
  ~/.claude/crewcut.json     { "defaultLevel": "...", "subagents": true|false,
                               "markers": true|false, "tests": true|false,
                               "subagentMatcher": "<regex on the agent type>" }
  CREWCUT_SUBAGENT_MATCHER   env var, wins over subagentMatcher in the file
  CREWCUT_TESTS=on|off       env var, wins over tests in the file
  ~/.claude/crewcut-mode     the level of the current session (per user)
  statusline                 "statusLine": { "type": "command",
                             "command": "node \"~/.claude/crewcut-statusline.js\"" }
                             (the hook keeps that copy up to date; NO_COLOR=1
                             turns its colours off)

Update
  /plugin marketplace update crewcut  then  /reload-plugins
```
