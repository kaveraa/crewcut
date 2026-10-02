# crewcut

[![tests](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg)](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml)

Short hair, short code. A Claude Code plugin for the simplest code that
works: less code on every repository and model measured, fewer tokens where
there is something not to read or not to write, short answers, and no cut on
safety.

## Agentic benchmark

Crewcut run through the benchmark ponytail published for itself: twelve
one-line tickets against a real FastAPI + React repository, a headless Claude
Code session per cell, scored on the `git diff` it leaves behind, with the
same controls (caveman for terse prose, the seven-word YAGNI prompt) and seven
safety tasks whose output is executed against adversarial input. Haiku 4.5,
four runs per cell, 2026-10-02.

<p align="center"><img src="assets/benchmark-agentic.svg" width="860" alt="Each arm as a percent of the no-plugin baseline across LOC, tokens, cost and time (Haiku 4.5). Crewcut is the only arm under 100 percent on every metric: LOC 86, tokens 97, cost 96, time 93. Caveman and the yagni prompt rise above 100 on LOC and cost. Safety: baseline, caveman and crewcut 100 percent, yagni-oneliner 96."></p>

**full-stack-fastapi-template** (ponytail's repository and tickets):

| vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **crewcut** | **-14 %** | **-3 %** | **-4 %** | **-7 %** | **100 %** |
| caveman (terse-prose control) | +4 % | +9 % | +6 % | +3 % | 100 % |
| "YAGNI + one-liners" prompt | +12 % | -15 % | +11 % | -5 % | 96 % |

**Next-js-Boilerplate** (same protocol, second repository):

| vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **crewcut** | **-40 %** | **-10 %** | **-13 %** | **-20 %** | **100 %** |
| caveman (terse-prose control) | -15 % | +16 % | +8 % | -4 % | 100 % |
| "YAGNI + one-liners" prompt | -29 % | -23 % | -7 % | -23 % | 96 % |

**Sonnet 5.5** (same template and tickets, three arms, three runs):

| vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **crewcut** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |
| "YAGNI + one-liners" prompt | -31 % | -1 % | -12 % | -14 % | 100 % |

Each cell is that arm's mean over all cells as a percent of the no-plugin
baseline, the same reading as the chart. Crewcut cuts lines on
every repository and model measured and never drops a guard. The cut is
biggest where a native element replaces a component (color picker -67 % on
the template, -58 % on the boilerplate; date picker -39 % and -55 %) and near
zero on irreducible endpoints. The margin follows the baseline: Next.js's
over-builds more, so crewcut is under it on eleven tickets out of twelve;
Sonnet's is already lean, so crewcut trims 8 % of the lines there and the
seven-word prompt, which skips the tests, trims more. Tokens only fall where
the plugin removes turns, which takes a repository big enough that reading
discipline matters; on a small repository with a strong model the ruleset is
read back on every turn for little gain. Method, per-task tables, limits and
how to reproduce:
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md).

## Measured

Two measures of the same seven cases, three runs each, with and without
the plugin, Sonnet as judge
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`,
with `--allow-tools Edit Write`), on two working models. Score is the
share of graders passed. Cost stands in for tokens at a fixed model.

### Fable 5.1 (crewcut 0.4.0, 2026-10-02, Claude Code 2.1.287)

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.092 USD         | 0.070 USD            | 4.0        | 3.0           |
| url-parse       | 0.95       | 0.86          | 0.086 USD         | 0.072 USD            | 3.3        | 3.7           |
| shared-bug      | 1.00       | 0.63          | 0.105 USD         | 0.090 USD            | 5.0        | 6.0           |
| keep-validation | 0.94       | 0.72          | 0.119 USD         | 0.130 USD            | 4.7        | 4.0           |
| explain-bug     | 0.92       | 0.92          | 0.092 USD         | 0.079 USD            | 4.7        | 4.7           |
| vat-country     | 1.00       | 1.00          | 0.106 USD         | 0.160 USD            | 5.0        | 7.7           |
| csv-export      | 1.00       | 0.78          | 0.116 USD         | 0.133 USD            | 7.0        | 11.3          |
| all             | 0.95       | 0.82          | 0.102 USD         | 0.105 USD            | 4.8        | 5.8           |

### Sonnet 5.5 (crewcut 0.3.3, 2026-10-01, Claude Code 2.1.287)

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
  source and test files with a one-line bug: with the plugin, Fable reads
  2.3 files against 5.3 and takes 7 turns against 11.3, Sonnet reads 3.0
  against 4.7 and takes 7 against 11; cost is 13 % and 28 % lower, and the
  score is higher because every run without the plugin read more files
  than the case allows. `vat-country`, seven modules, sits in between:
  fewer files read, fewer turns, cost 34 % lower on Fable and equal on
  Sonnet. The five one-file cases have nothing to cut, and the ruleset is
  a fixed cost there: a few percent more per run on Sonnet, 15 to 30 %
  more on Fable, same or better score.
- Turns go down 17 % on Fable and 18 % on Sonnet. Quality holds or rises:
  0.95 against 0.82 on Fable, 0.88 against 0.87 on Sonnet.
- The root-cause rule depends on the model. On Fable, `shared-bug` is
  fixed in the shared function in 3 runs out of 3 with the plugin against
  0 without; on Sonnet all runs patched the caller instead, arguing that
  the two other callers already pass numbers. `keep-validation` shows the
  same pattern: on Fable the runs without the plugin dropped a check or
  overstated what they kept.
- Honest misses, with or without the plugin, on both models: on
  `date-picker` and `url-parse` the answer stayed longer than the output
  rule asks.

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
| `/crewcut-debt [path]`      | Ledger of the `crewcut:` corners cut on purpose, see below |
| `/crewcut-gain`             | What the plugin saves, as measured on its eval cases  |
| `/crewcut-help`             | Reference card                                        |
| `/crewcut uninstall`        | Remove the plugin's files next to your settings, see below |

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
the working directory, for example `crewcut: ultra | Opus | shop`. The level
is green, amber for `ultra`, blue for `review`, grey for `off`; set
`NO_COLOR=1` to print it plain. At session
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
current level, about 580 tokens each; switch it off to save them, or limit
it to some agent types with a regular expression, case-insensitive, on the
agent type: `"subagentMatcher": "explore|general"` in the file, or the
`CREWCUT_SUBAGENT_MATCHER` environment variable, which wins. A subagent
whose type is unknown, or a pattern that does not compile, still receives
the rules.

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

## /crewcut-debt

Every corner crewcut cuts on purpose carries a comment such as
`// crewcut: no retry, add when the API flakes`. `/crewcut-debt` gathers
them into one list, one line per marker, and flags those that name no
condition to revisit:

```
src/queue.js:18: no retry -> add when: the API flakes
src/report.js:40: full table scan -> no trigger
2 markers, 1 without a trigger
```

It reads and reports only. `/crewcut-gain` prints the measure above as a
card; it never claims a saving on your repository, since the version you did
not build was never written.

## Update and uninstall

Update with `/plugin marketplace update crewcut` then `/reload-plugins`, or
enable auto-update for the marketplace in `/plugin`.

`/plugin remove crewcut` removes the plugin itself. The plugin also keeps a
few files next to your Claude settings: the level of the session, the
`crewcut.json` config, the status line copy and its flag, plus the
`statusLine` entry if you accepted it. Type `/crewcut uninstall` in a
session before removing the plugin and they go away; the `statusLine` entry
is removed only when it points at crewcut's own script. From a shell, the
same cleanup is `node <plugin dir>/hooks/crewcut.js uninstall`.

## Limitations

- The hooks need `node` on the PATH.
- The level is stored per user, so concurrent sessions share it.
- Claude Code only.

## Credits

Inspired by ponytail by Dietrich Gebert.

## License

MIT
