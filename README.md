# crewcut

Short hair, short code. A Claude Code plugin that spends fewer tokens:
the simplest code that works, short answers, few tool calls, and no cut on
safety.

## Measured

Measured on 2026-10-01 with Claude Code 2.1.287, default model, Sonnet as
judge: five cases, three runs each, with and without the plugin
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`).
Score is the share of graders passed. Cost stands in for tokens at a fixed
model; one run of these cases is about 36 000 tokens of context, of which
the plugin adds about 700.

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.083 USD         | 0.069 USD            | 3.7        | 3.0           |
| url-parse       | 0.90       | 0.86          | 0.077 USD         | 0.069 USD            | 3.3        | 3.7           |
| shared-bug      | 1.00       | 0.63          | 0.094 USD         | 0.091 USD            | 5.0        | 6.3           |
| keep-validation | 0.94       | 0.94          | 0.118 USD         | 0.110 USD            | 4.3        | 4.0           |
| explain-bug     | 0.92       | 0.83          | 0.080 USD         | 0.083 USD            | 4.0        | 5.7           |
| all             | 0.92       | 0.82          | 0.090 USD         | 0.084 USD            | 4.1        | 4.5           |

What it says:

- Quality goes up: 0.92 against 0.82 overall. On `shared-bug` the plugin
  fixed the shared function in 3 runs out of 3; without it, all 3 runs
  patched the caller instead.
- Tokens do not go down on tasks this small: cost per run is 7 % higher
  with the plugin, because the ruleset and the skill descriptions are a
  fixed cost and these tasks have nothing to cut. Turns go down 10 %.
- The savings crewcut is built for come from the reading, writing and tool
  discipline on larger tasks, which these cases do not measure yet. A
  larger case is the next thing to add.
- Honest misses: on `date-picker` the answer stayed longer than the output
  rule asks, with or without the plugin.

Every case grades correctness as well as size: a shorter answer that is
wrong scores zero. `keep-validation` asks to simplify a handler at a trust
boundary and fails if any check disappears; `explain-bug` asks a question
and fails if the explanation is cut short.

## The ladder

Claude takes the lowest rung that holds:

1. Needs to exist at all? If not, skip it and say so in one line.
2. Already in this codebase? Reuse it.
3. Standard library does it? Use it.
4. Platform does it natively (HTML, CSS, SQL, OS)? Use it.
5. An installed dependency does it? Use it. Never add one for what a few
   lines do.
6. One line? One line.
7. Only then: the minimum that works.

Bug fix means root cause: find every caller, fix the shared function once.

## Install

From the marketplace:

```
/plugin marketplace add kaveraa/crewcut
/plugin install crewcut@crewcut
```

From a local checkout, for one session:

```
claude --plugin-dir /path/to/crewcut
```

The hooks run `node`, so Node 22 or newer must be on the PATH of the shell
that starts Claude Code. Without it, only the skills work and nothing is
injected at session start.

## Commands and levels

| Command                     | Effect                                                |
| --------------------------- | ----------------------------------------------------- |
| `/crewcut`                  | Show the current level and the default                |
| `/crewcut off`              | Silence the plugin for this session                   |
| `/crewcut lite`             | Output discipline and a light reading habit           |
| `/crewcut full`             | Default. Output, reading, writing and tool discipline |
| `/crewcut ultra`            | Full, plus one-line answers and no new file or dependency without an explicit request |
| `/crewcut default <level>`  | Set the level new sessions start at                   |
| `/crewcut subagents on|off` | Inject the rules into subagents too (on by default)   |
| `/crewcut-review [scope]`   | Read-only review of a diff, see below                 |
| `/crewcut-audit [path]`     | Same review over a whole tree, ranked by lines to cut |
| `/crewcut-help`             | Reference card                                        |

A new session starts at the default level, `full` unless you changed it; a
resumed session and a context compaction keep the level you chose. Typing
`stop crewcut` or `normal mode` as a whole message also switches the plugin
off.

`/crewcut-review` and `/crewcut-audit` put the session in a read-only
`review` state until you switch to a level again: `/crewcut` shows it, a
compaction keeps it, and subagents started meanwhile receive the read-only
rule instead of the ruleset.

## Status line

The plugin ships `hooks/statusline.js`, which prints the level, the model
and the working directory, for example `crewcut: ultra | Opus | shop`. On
the first session start without a status line configured, Claude offers
once to add it to your settings; say yes, or add it yourself:

```json
"statusLine": { "type": "command", "command": "node \"<plugin dir>/hooks/statusline.js\"" }
```

Settings live in `crewcut.json` next to your Claude settings (`~/.claude`, or
`CLAUDE_CONFIG_DIR`): `{ "defaultLevel": "ultra", "subagents": true }`. The
`CREWCUT_DEFAULT_MODE` environment variable wins over the file. With
`subagents` on, every subagent Claude starts receives the ruleset of the
current level, about 430 tokens each; switch it off to save them.

## Token discipline

- Output: no preamble, no restating the request, no recap, no unrequested
  explanation. Code first.
- Reading: only what the change touches; grep before cat; a line range before
  a whole file; never re-read a file.
- Writing: targeted edits, never a whole-file rewrite; no unrequested tests,
  docs or refactors; one test run at the end.
- Tools: batch independent calls; never print large outputs; no subagent for
  what one read answers.

## Modern by default

Claude checks the versions the project runs, language, runtime, framework
and libraries, and uses the idioms and features those versions allow, with
the current best practice for that stack. Never an old pattern the version
has replaced, never a feature the version lacks.

## Commits and pull requests

One short subject line, a brief body only when it adds something. No AI
mention, no AI co-author, no generated-with line, no trailer. Any such
watermark found in a message, a PR description or a file is removed before
the commit or the PR goes out. A pull request description says what changed,
why, and how it was checked, in a few lines.

## Never cut

Validation at trust boundaries, handling that prevents data loss, security,
accessibility basics, existing tests, and anything you explicitly asked for.
Simple is not negligent.

Short never means wrong. A question you ask gets a full answer, a failing
test is fixed and rerun, and a file that changed since the last read is read
again. Fewer tokens is the goal only when the answer stays right.

## /crewcut-review

`/crewcut-review` reviews the uncommitted changes; `/crewcut-review main..HEAD`
or `/crewcut-review src/a.js src/b.js` narrows the scope. A read-only agent
reports one line per finding:

```
src/signup.js:42: stdlib hand-written email check (18 lines) -> one call to the platform email validator
cut: 17 lines
```

The rung names where the code should have stopped: `skip`, `reuse`, `stdlib`,
`native`, `installed`, `one-line`, or `prose` for unrequested comments and
docs. The review changes nothing.

## Limitations

- The hooks need `node` on the PATH.
- The level is stored per user, so concurrent sessions share it.
- Claude Code only.

## Credits

Inspired by ponytail by Dietrich Gebert.

## License

MIT
