# crewcut

[![tests](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg)](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml)

Short hair, short code. A Claude Code plugin that spends fewer tokens:
the simplest code that works, short answers, few tool calls, and no cut on
safety.

## Measured

Measured on 2026-10-01 with crewcut 0.3.3, Claude Code 2.1.287, Sonnet 5.5
as the working model and Sonnet as judge: seven cases, three runs each, with
and without the plugin
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`,
with `--allow-tools Edit Write`). Score is the share of graders passed. Cost
stands in for tokens at a fixed model.

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.052 USD         | 0.044 USD            | 4.3        | 4.0           |
| url-parse       | 0.90       | 0.90          | 0.060 USD         | 0.055 USD            | 4.0        | 4.0           |
| shared-bug      | 0.62       | 0.62          | 0.050 USD         | 0.049 USD            | 3.0        | 6.0           |
| keep-validation | 0.89       | 0.89          | 0.095 USD         | 0.110 USD            | 4.0        | 4.3           |
| explain-bug     | 0.92       | 0.92          | 0.051 USD         | 0.047 USD            | 4.0        | 4.0           |
| vat-country     | 1.00       | 1.00          | 0.072 USD         | 0.074 USD            | 8.7        | 9.7           |
| csv-export      | 1.00       | 0.89          | 0.063 USD         | 0.088 USD            | 7.0        | 11.0          |
| all             | 0.88       | 0.87          | 0.063 USD         | 0.067 USD            | 5.0        | 6.1           |

What it says:

- The savings show up with the size of the project. `csv-export` is twenty
  source and test files with a one-line bug: with the plugin, 3.0 files
  read against 4.7, 7 turns against 11, cost 28 % lower, and a score of
  1.00 against 0.89 because every run without the plugin read more files
  than the case allows. `vat-country`, seven modules, sits in between: 2.3
  files read against 2.7, one turn fewer, same cost. The five one-file
  cases have nothing to cut, and the ruleset is a fixed cost there: a few
  percent more per run, same score.
- Turns go down 18 % overall. Quality is equal: 0.88 against 0.87.
- Honest misses, with or without the plugin: on `shared-bug` all runs
  patched the caller instead of the shared function, arguing that the two
  other callers already pass numbers; on `date-picker` and `url-parse` the
  answer stayed longer than the output rule asks.
- An earlier measure of 0.1.0, five cases on another default model, gave
  0.92 against 0.82 with `shared-bug` fixed at the root in 3 runs out of
  3 against 0. The gap the plugin makes depends on the model it runs on.

Every case grades correctness as well as size: a shorter answer that is
wrong scores zero. `keep-validation` asks to simplify a handler at a trust
boundary and fails if any check disappears; `explain-bug` asks a question
and fails if the explanation is cut short; `vat-country` and `csv-export`
fail if an existing test or an untouched module changes.

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

The plugin ships a status line script that prints the level, the model and
the working directory, for example `crewcut: ultra | Opus | shop`. At session
start the hook copies it to `crewcut-statusline.js` next to your Claude
settings, under a path that survives plugin updates, and refreshes the copy
when the plugin changes. On the first start without a status line
configured, Claude offers once to add it to your settings; say yes, or add
it yourself:

```json
"statusLine": { "type": "command", "command": "node \"C:/Users/you/.claude/crewcut-statusline.js\"" }
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

## Plain text only

In code, comments, commits, pull requests and answers: no emoji, no
emoticon, no arrow symbol (`->` instead), no long dash (`-` instead), no
curly quotes (`"` instead). Any found in text Claude touches is replaced.

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
