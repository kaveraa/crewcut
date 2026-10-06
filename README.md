# crewcut

<p align="center"><img src="https://raw.githubusercontent.com/kaveraa/crewcut/a34f3f3/assets/banner.svg" alt="crewcut" width="100%"></p>

[![tests](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg)](https://github.com/kaveraa/crewcut/actions/workflows/tests.yml)

**English** - [Français](https://github.com/kaveraa/crewcut/blob/main/README.fr.md)

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

Crewcut 0.5.1, re-measured on the Sonnet tier after the "build the ticket
only" rule, crewcut arm only: LOC -20 %, tokens +7 %, cost 0 %, time -7 %.
Crewcut 0.6.0, with the ruleset read back on every turn cut from about 695
to 580 tokens: LOC -15 %, tokens -5 %, cost -15 %, time -6 %, safe 21/21.
On Sonnet, crewcut now spends fewer tokens than the baseline. Crewcut 0.6.3,
six runs per ticket: LOC -13 %, tokens 0 %, cost -11 %, time 0 %; two draws
of three runs gave LOC -10 % and -17 %, which is the noise band on this tier.

**Opus 5.5** (same template and tickets, three arms, three runs, crewcut 0.5.3):

| vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **crewcut** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| "YAGNI + one-liners" prompt | -72 % | -44 % | -49 % | -56 % | 100 % |

Crewcut 0.6.1 on the Opus tier, crewcut arm only: LOC -68 %, tokens -39 %,
cost -41 %, time -45 %, safe 21/21, the same as 0.5.3 within noise.

**Opus 5.5 on Next-js-Boilerplate** (same tickets as above, three arms, three runs, crewcut 0.6.1):

| vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **crewcut** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| "YAGNI + one-liners" prompt | -88 % | -62 % | -66 % | -72 % | 100 % |

Each cell is that arm's mean over all cells as a percent of the no-plugin
baseline, the same reading as the chart. Crewcut cuts lines on
every repository and model measured and never drops a guard. The cut is
biggest where a native element replaces a component (color picker -67 % on
the template, -58 % on the boilerplate; date picker -39 % and -55 %) and near
zero on irreducible endpoints. The margin follows the baseline: Next.js's
over-builds more, so crewcut is under it on eleven tickets out of twelve;
Sonnet's is already lean, so crewcut trims 8 % of the lines there and the
seven-word prompt, which skips the tests, trims more; Opus's over-builds the
most (a 369-line date picker with two new dependencies against crewcut's
10-line native input), so crewcut cuts 70 % of the lines there. Tokens only
fall where the plugin removes turns: on Opus they drop from 12.1 to 7.5 per
ticket and the bill falls 43 %; on a small repository with a model that does
not over-build, the ruleset is read back on every turn, so its size is the
cost: 0.6.0 cut it by a sixth and Sonnet went from +7 % to -5 % in tokens.
Method, per-task tables, limits and how to reproduce:
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md). Five of
those cells with the diff and the reply of each arm, verbatim: [examples/](examples/).

## Measured

Three measures of the same seven cases, three runs each, with and without
the plugin, Sonnet as judge
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`,
with `--allow-tools Edit Write`), on three working models. Score is the
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

### Opus 5.5 (crewcut 0.5.2, 2026-10-03, Claude Code 2.1.287)

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.101 USD         | 0.081 USD            | 4.0        | 3.0           |
| url-parse       | 0.86       | 0.86          | 0.097 USD         | 0.075 USD            | 4.0        | 3.3           |
| shared-bug      | 1.00       | 0.62          | 0.098 USD         | 0.088 USD            | 4.0        | 5.3           |
| keep-validation | 1.00       | 0.89          | 0.144 USD         | 0.117 USD            | 5.3        | 4.7           |
| explain-bug     | 0.75       | 0.92          | 0.093 USD         | 0.091 USD            | 4.3        | 5.0           |
| vat-country     | 1.00       | 1.00          | 0.120 USD         | 0.122 USD            | 6.3        | 8.0           |
| csv-export      | 0.96       | 0.78          | 0.135 USD         | 0.141 USD            | 7.3        | 13.0          |
| all             | 0.91       | 0.84          | 0.113 USD         | 0.102 USD            | 5.0        | 6.0           |

Re-measured with crewcut 0.6.0 (2026-10-03, Claude Code 2.1.288): score 0.95
against 0.83, turns 5.3 against 5.9, cost per run 0.107 against 0.099 USD;
`explain-bug` 1.00 against 0.83. Re-measured with crewcut 0.6.1: score 1.00
on every case against 0.84 without, turns 5.0 against 5.7, cost per run
0.106 against 0.100 USD. With crewcut 0.6.3 and the reworked `date-picker`
graders (below): 0.98 against 0.83, turns 5.2 against 5.9, cost per run
0.101 against 0.099 USD; `date-picker` 0.86 in both arms.

Crewcut 0.6.1 on the other two models (2026-10-03, Claude Code 2.1.288):
Fable 5.1 scores 0.96 against 0.81, in 6.2 turns against 9.0, at 0.309
against 0.404 USD per run (-24 %); Sonnet 5.5 scores 0.97 against 0.89, in
5.7 turns against 6.3, at 0.066 against 0.062 USD (+6 %). Sonnet with
crewcut 0.6.3: 0.96 against 0.88, 5.4 turns against 6.0, 0.061 against
0.062 USD. Fable with crewcut 0.6.3 (2026-10-03, Claude Code 2.1.287,
42 clean cells): 0.97 against 0.82, 6.5 turns against 9.1 (-29 %), 0.296
against 0.378 USD (-22 %); `csv-export` reads 3.3 files against 9.0,
`vat-country` 3.0 against 11.0, and `date-picker` passes 3 runs out of 3
with the plugin against 0 without. Fable's runs cost about three times the
0.4.0 measure in both arms, so only the ratio compares. With crewcut 0.6.5
and the one-caveat output rule (2026-10-04, Claude Code 2.1.289): Sonnet
0.98 against 0.86, 5.4 turns against 6.1, 0.064 against 0.066 USD (-3 %);
Opus 0.98 against 0.83, 5.1 turns against 6.0, 0.104 against 0.102 USD
(+2 %); `date-picker` passes 3 runs out of 3 with the plugin on both,
against 0 without. Fable on the same rule (crewcut 0.7.0, 2026-10-04,
Claude Code 2.1.289, 42 clean cells): 0.98 against 0.81, 5.7 turns against
8.4 (-32 %), 0.296 against 0.414 USD (-29 %); `date-picker` and
`url-parse` pass 3 runs out of 3 with the plugin, `shared-bug` 0.96
against 0.62. With crewcut 0.9.0 (2026-10-05, Claude Code 2.1.289), the
marker line out of the ruleset and the `date-picker` attribute grader live
for the first time (below): Sonnet 0.97 against 0.85, 4.4 turns against
5.8 (-24 %), 0.057 against 0.059 USD (-3 %); Opus 0.99 against 0.81, 5.0
turns against 6.0, 0.104 USD in both arms. `date-picker` 0.90 against 0.71
on Sonnet (the baseline adds a `max` attribute in every run, the plugin in
one run out of three), 1.00 against 0.81 on Opus.

What it says:

- The savings show up with the size of the project. `csv-export` is twenty
  source and test files with a one-line bug: with the plugin, Fable reads
  2.3 files against 5.3 and takes 7 turns against 11.3, Sonnet reads 3.0
  against 4.7 and takes 7 against 11, Opus reads 2.0 against 6.3 and takes
  7.3 against 13; cost is 13 %, 28 % and 4 % lower, and the score is higher
  because every run without the plugin read more files than the case
  allows. `vat-country`, seven modules, sits in between: fewer files read,
  fewer turns, cost 34 % lower on Fable and equal on Sonnet and Opus. The
  five one-file cases have nothing to cut, and the ruleset is a fixed cost
  there: a few percent more per run on Sonnet, 15 to 30 % more on Fable and
  Opus, same or better score.
- Turns go down 17 % on Fable and Opus and 18 % on Sonnet. Quality holds
  or rises: 0.95 against 0.82 on Fable, 0.88 against 0.87 on Sonnet, 0.91
  against 0.84 on Opus. Cost per run over the whole suite is 3 % and 6 %
  lower on Fable and Sonnet, 11 % higher on Opus, where the one-file cases
  weigh more.
- The root-cause rule depends on the model. On Fable and Opus,
  `shared-bug` is fixed in the shared function in 3 runs out of 3 with the
  plugin against 0 without; on Sonnet all runs patched the caller instead,
  arguing that the two other callers already pass numbers. Since 0.6.1 the
  rule says "even if other callers look safe", and Sonnet fixes the shared
  function in 3 runs out of 3 with the plugin, 0 without.
  `keep-validation` shows the same pattern: on Fable and Opus the runs
  without the plugin dropped a check or overstated what they kept.
- Honest misses, with or without the plugin, on all three models: on
  `date-picker` and `url-parse` the answer stayed longer than the output
  rule asks. On Opus with the plugin, `explain-bug` loses a grader in 3
  runs out of 3: the explanation is complete, but it no longer says where
  a fix would go, which the case asks for. The output rule cut a sentence
  the question needed. Fixed in 0.6.0: a question gets a full answer,
  including where a fix would go, and the case passes 3 runs out of 3.
  `date-picker` and `url-parse` passed in 0.6.1 on Opus once the output
  rule forbade pasting back the code just written and allowed one caveat.
  In 0.6.1 `url-parse` passes on Sonnet and in 2 runs out of 3 on Fable,
  `date-picker` passes on Fable; on Sonnet `date-picker` failed in both
  arms, and the answers said why: a `max` attribute set to today's date
  that nobody asked for, then two caveats about it. 0.6.3 adds "no unasked
  max or min" to the ticket rule and "in one sentence, no bullet list" to
  the caveat rule, and splits the grader: a regex now checks the file for
  `max`, `min`, `pattern` or `placeholder` (it seemed to pass 3 runs out of
  3 in both arms on Sonnet and Opus; 0.9.0 found that the case file carried
  a backspace byte where the regex meant a word boundary, so the check never
  matched until then, and Sonnet's baseline in fact adds `max` in every
  run), and the short-answer judge only measures
  the message: 8 lines at most, no bullets, two sentences of caveat at
  most. That last criterion still failed in both arms on both models: the
  models reported what they did not verify and whether the field should be
  required, three sentences where the rule asks one. 0.6.5 first rewrote
  the criterion as countable elements (four sentences at most, no offer of
  a script or of another change to the form), and the plugin arm still
  scored 0.90 on each model: the misses were a `skipped: min/max` line and
  a sentence saying no min or max was added, both read as offers. It then
  rewrote the output rule: three sentences at most, one caveat only if it changes what
  the user does next, no offer and no skipped line for what the ticket
  never asked. `date-picker` now passes 3 runs out of 3 with the plugin on
  Sonnet and Opus, 0 without. On `url-parse` the plugin arm answered in
  three sentences, but "I have not run it" plus "it throws on an invalid
  URL" counted as two side notes where the judge allows one. Saying the code
  was not run is what Claude Code asks when there is no shell, so the
  criterion no longer counts it as the side note. Remeasured on that case
  alone: 3 runs out of 3 with the plugin on Sonnet and Opus; without it, 1
  on Sonnet (two caveats, or all three links) and 0 on Opus (code block,
  bullets).

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

Bug fix means root cause: find every caller, fix the shared function once,
even when the other callers look safe today.

Build the ticket, not its neighbours: no optional prop, state, mode, setting
or edge case the ticket did not name (no hover preview, no disabled, no size
variants, no max nobody asked for). A second use case is a second ticket.
Shortest correct form: no type alias or helper for a single use.

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
| `/crewcut lang <code>`      | Reply in English, Spanish, French, German, Korean or simplified Chinese (`en`, `es`, `fr`, `de`, `ko`, `zh`); asked once at the first session |
| `/crewcut markers on|off`   | `crewcut:` comment on each corner cut (off by default) |
| `/crewcut-review [scope]`   | Read-only review of a diff, see below                 |
| `/crewcut-audit [path]`     | Same review over a whole tree, ranked by lines to cut |
| `/crewcut-debt [path]`      | Ledger of the `crewcut:` markers, see below           |
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
`CLAUDE_CONFIG_DIR`): `{ "defaultLevel": "ultra", "subagents": true, "markers": false }`.
The `CREWCUT_DEFAULT_MODE` environment variable wins over the file. With
`subagents` on, every subagent Claude starts receives the ruleset of the
current level, about 500 tokens each; switch it off to save them, or limit
it to some agent types with a regular expression, case-insensitive, on the
agent type: `"subagentMatcher": "explore|general"` in the file, or the
`CREWCUT_SUBAGENT_MATCHER` environment variable, which wins. A subagent
whose type is unknown, or a pattern that does not compile, still receives
the rules. Without a pattern, the two built-in agents that never touch code,
`claude-code-guide` and `statusline-setup`, receive nothing; a pattern that
names them brings them back.

## Token discipline

- Output: no preamble, no recap, no unrequested explanation. Never paste
  back code just written. Three sentences at most: what changed, where, and
  one caveat only if it changes what you do next; no offer and no "skipped"
  line for what the ticket never asked; no bullet list.
- Reading: grep for the symbols the change touches, then read only those
  files, by line range; one grep beats three reads; never read a file twice;
  never open a file to confirm what grep already showed.
- Writing: targeted edits, never a whole-file rewrite; no unrequested docs or
  refactors; one test run at the end.
- Tests: none unless the task asks or an existing test file covers the
  touched code, then extend that file; never create a test file on your own,
  even when invited to add tests "if you normally would".
- Tools: batch independent calls; never print large outputs; no subagent for
  what one read answers.

## Modern by default

Claude checks the versions the project runs, language, runtime, framework
and libraries, and uses the idioms those versions allow, including the
compact forms when they stay clear: ternary, optional chaining,
destructuring, early return. Never an old pattern the version has replaced,
never a feature the version lacks.

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

## Code agent

The plugin ships `crewcut-coder`, a code agent pinned to Opus with Read,
Grep, Glob, Edit, Write and Bash. Claude delegates a code task to it
(implement, fix, refactor, write a test) when the session runs on a lighter
model or the main context should stay small; you can also ask for it by
name. It gets the crewcut rules like any subagent and ends with a short
report: files changed, test result. Search stays with Claude Code's
built-in Explore agent, review with `crewcut-reviewer` on Sonnet. A task it
handles is billed at Opus rates, even in a Sonnet session.

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

With `/crewcut markers on`, every corner crewcut cuts on purpose carries a
comment such as `// crewcut: no retry, add when the API flakes`, and only a
corner with a known ceiling: never as a prefix on a comment that explains
code. Markers are off by default, because on a real project the models put
the prefix on ordinary comments too, and a plugin's name has no place in
your code unless you asked for the ledger. `/crewcut-debt` gathers the
markers into one list, one line per marker, and flags those that name no
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
- A cloud session (claude.ai/code) does not load a plugin installed with
  `/plugin`, nor one a repository turns on in `.claude/settings.json`, and
  has no `/plugin` command. Installing crewcut there is being tested.

## Credits

Inspired by ponytail by Dietrich Gebert.

## License

MIT
