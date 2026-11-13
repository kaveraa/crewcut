# crewcut

<p align="center"><img src="assets/banner.png" alt="crewcut: short hair, short code. A Claude Code plugin." width="100%"></p>

<p align="center">
<a href="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml"><img src="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
<a href="https://github.com/kaveraa/crewcut/releases"><img src="https://img.shields.io/github/v/release/kaveraa/crewcut?label=release" alt="release"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/kaveraa/crewcut" alt="MIT"></a>
</p>

<p align="center"><b>English</b> - <a href="https://github.com/kaveraa/crewcut/blob/main/README.fr.md">Français</a></p>

<p align="center">
<b>Short hair, short code.</b><br>
A Claude Code plugin for the simplest code that works: less code, fewer tokens, short answers, and no cut on safety.
</p>

<p align="center"><img src="assets/readme/numbers.png" width="880" alt="Opus 5.5, with and without the plugin. Same agent, same tasks, less than half the code: 58 percent less code, 56 percent fewer output tokens, 34 percent lower cost, 53 percent less time. 30 of 30 security runs pass, with the plugin as without it. Ponytail 5's benchmark, its harness unchanged: 39 tasks, 5 runs each, 390 headless Claude Code sessions. Median per task, geometric mean over the tasks."></p>

## Install

<p align="center"><img src="assets/readme/install.png" width="880" alt="Install: two commands, then it is on. /plugin marketplace add kaveraa/crewcut, then /plugin install crewcut@crewcut. The hooks run node, so Node 22 or newer must be on the PATH; without it, only the skills work. For one session from a local checkout: claude --plugin-dir /path/to/crewcut. Other agents: copy AGENTS.md into your project, the full ruleset for any agent that reads a rules file."></p>

```
/plugin marketplace add kaveraa/crewcut
/plugin install crewcut@crewcut
```

Any other agent that reads a rules file: copy [AGENTS.md](AGENTS.md) into
your project.

## Before and after

<p align="center"><img src="assets/readme/beforeafter.png" width="880" alt="Ticket: add a date picker component to the frontend. Without crewcut: 399 lines, 2 new files, a calendar built by hand, 16 turns, 0.47 USD. With crewcut: 10 lines, 1 new file, 5 turns, 0.09 USD. The whole component is a function that returns the repository Input with type date. Same repository, same model, Opus 5.5, one headless session each."></p>

Both diffs and both replies, verbatim, with four other tickets:
[examples/](examples/).

## How it works

<p align="center"><img src="assets/readme/ladder.png" width="880" alt="How it works. Read what the change touches, then take the lowest rung that holds. 1, not needed: skip it and say so in one line. 2, already in this codebase: reuse it. 3, in the standard library: use it. 4, native to the platform, HTML, CSS, SQL, the OS: use it. 5, an installed dependency: use it, never add one. 6, one line: one line. 7, else the minimum that works. Never cut: trust-boundary validation, data-loss handling, security, accessibility, existing tests."></p>

<p align="center"><img src="assets/readme/rules.png" width="880" alt="The ruleset, at every session start: a senior who reads everything and writes almost nothing. Build the ticket only: no optional prop, state, mode or edge case it did not name. Fix the root cause: find every caller, fix the shared function once. Short never means wrong: a question gets a full answer, a failing test is fixed and rerun. Current practice: follow what the official docs of the installed versions recommend today. Clean output: comments say why in one plain line, no emoji, no arrow, no long dash, no AI trace in commits. With it, a map of the names the project already defines and the versions it declares."></p>

The full ruleset is in [The rules](#the-rules), under Reference.

## Measured

<p align="center"><img src="assets/readme/evals.png" width="880" alt="Eval suite, seven cases, three runs each. Shorter, and more often right. Fable 5.2: 0.98 with crewcut, 0.87 for the same model with no plugin. Opus 5.5: 1.00 with, 0.80 without. Sonnet 5.5: 0.99 with, 0.88 without. Haiku 5.5: 0.98 with, 0.87 without. Score is the share of graders passed. Every case grades correctness as well as size: a shorter answer that is wrong scores zero."></p>

<p align="center"><img src="assets/readme/pt5.png" width="880" alt="Ponytail 5's benchmark, crewcut 0.14.0 against no plugin, Opus 5.5, 39 tasks, 5 runs. Lines of code minus 58 percent, 95 percent interval minus 68 to minus 47, better on 32 tasks and worse on 1. Code information minus 52 percent. Output tokens minus 56 percent. Cost minus 34 percent, interval minus 44 to minus 24. Time minus 53 percent. Turns minus 19 percent. Hidden checks: 85 of 90 passed, 86 without the plugin. Six security tasks: 30 of 30 in both arms. Privacy task: 0 of 5, then 8 of 10 after the rule that names what a change could expose. Ponytail 5 published for itself: code minus 53 percent, output tokens minus 45, cost minus 26, time minus 41. Two runs a month apart, intervals overlap."></p>

<p align="center"><img src="assets/readme/chart.png" width="880" alt="Ponytail 5's benchmark, Opus 5.5, 39 tasks, 5 runs: what is left of the no-plugin baseline once crewcut is on. Code 42 percent, code information 48, output tokens 44, cost 66, time 47, turns 81. A mark on each bar gives what Ponytail 5 published for itself: 47, 59, 55, 74, 59 and 78. The two plugins were measured a month apart and their intervals overlap."></p>

<p align="center"><img src="assets/readme/benchmark.png" width="880" alt="The October harness, three models, two repositories, against the same model with no plugin. Code, tokens, cost, time, safe. Opus 5.5 on Next-js-Boilerplate: minus 82, minus 55, minus 60, minus 67 percent, 100 percent safe. Opus 5.5 on full-stack-fastapi-template: minus 70, minus 40, minus 43, minus 49, 100 safe. Sonnet 5.5 on Next-js-Boilerplate: minus 70, minus 11, minus 31, minus 34, 100 safe. Haiku 4.5 on Next-js-Boilerplate: minus 63, minus 48, minus 46, minus 40, 100 safe. Haiku 4.5 on the template: minus 9, minus 30, minus 30, minus 20, 100 safe. Sonnet 5.5 on the template: minus 8, plus 9, plus 2, minus 2, 100 safe."></p>

<p align="center"><img src="assets/readme/controls.png" width="880" alt="Same runs, two controls: code and cost against no plugin, for crewcut, crewcut with tests off, and the seven-word YAGNI prompt. The prompt cuts as much on Opus and Sonnet, writes more code than no prompt on the Haiku template, and is safe on 96 percent of the Haiku safety cells where crewcut is safe on all of them."></p>

The first table is ponytail 5's benchmark, run with its harness unchanged;
the two below it come from the harness of October, on three models and two
repositories. Every figure holds for the model named in its row. Method, per-task tables,
limits and how to reproduce:
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md) and
[evals/RESULTS.md](evals/RESULTS.md).

<details>
<summary>The figures as text</summary>

Eval suite, seven cases, three runs each, Opus 5.5 as judge. The cost is the
session alone, without the judge:

| Model | crewcut | Score with | without | Turns with | without | Cost per run with | without |
|---|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.15.3 | 0.98 | 0.87 | 4.4 | 6.1 | 0.202 USD | 0.193 USD |
| Opus 5.5 | 0.15.3 | 1.00 | 0.80 | 5.3 | 6.0 | 0.092 USD | 0.089 USD |
| Sonnet 5.5 | 0.15.3 | 0.99 | 0.88 | 4.6 | 6.0 | 0.045 USD | 0.042 USD |
| Haiku 5.5 | 0.15.3 | 0.98 | 0.87 | 5.6 | 6.9 | 0.003 USD | 0.003 USD |

Ponytail 5's benchmark, Opus 5.5, 39 tasks, 5 runs, crewcut 0.14.0 against
no plugin:

| | change | 95 % interval | tasks better / worse |
|---|--:|--:|--:|
| Lines of code | -58 % | -68 to -47 | 32 / 1 |
| Code information (gzip) | -52 % | -61 to -41 | 34 / 1 |
| Output tokens | -56 % | -64 to -47 | 38 / 1 |
| Cost | -34 % | -44 to -24 | 32 / 7 |
| Time | -53 % | -59 to -46 | 39 / 0 |
| Turns | -19 % | -26 to -11 | 21 / 4 |

The October harness, crewcut against the same model with no plugin:

| crewcut vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **Opus 5.5, Next-js-Boilerplate** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| **Opus 5.5, full-stack-fastapi-template** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| **Sonnet 5.5, Next-js-Boilerplate** | **-70 %** | **-11 %** | **-31 %** | **-34 %** | **100 %** |
| **Haiku 4.5, Next-js-Boilerplate** | **-63 %** | **-48 %** | **-46 %** | **-40 %** | **100 %** |
| **Haiku 4.5, full-stack-fastapi-template** | **-9 %** | **-30 %** | **-30 %** | **-20 %** | **100 %** |
| **Sonnet 5.5, full-stack-fastapi-template** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |

The same arm with `/crewcut tests off`:

| crewcut, tests off, vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -83 % | -57 % | -63 % | -69 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -71 % | -50 % | -53 % | -61 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -69 % | -7 % | -27 % | -33 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -60 % | -55 % | -52 % | -48 % | 100 % |
| Haiku 4.5, full-stack-fastapi-template | -20 % | -38 % | -35 % | -26 % | 100 % |
| Sonnet 5.5, full-stack-fastapi-template | -17 % | -15 % | -26 % | -24 % | 100 % |

The prompt "Follow YAGNI principles, and prefer one-liner solutions.":

| "YAGNI + one-liners" prompt vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -88 % | -62 % | -66 % | -72 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -72 % | -44 % | -49 % | -56 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -74 % | -17 % | -38 % | -37 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -29 % | -23 % | -7 % | -23 % | 96 % |
| Haiku 4.5, full-stack-fastapi-template | +12 % | -15 % | +11 % | -5 % | 96 % |
| Sonnet 5.5, full-stack-fastapi-template | -31 % | -1 % | -12 % | -14 % | 100 % |

</details>

## Levels and commands

<p align="center"><img src="assets/readme/commands.png" width="880" alt="Levels and commands. Four levels: off, nothing for this session; lite, output discipline and a light reading habit; full, the default, output, reading, writing and tools; ultra, full plus one-line answers and no new file unasked. Commands: /crewcut level, /crewcut default level, /crewcut tests on or off, /crewcut map on or off, /crewcut subagents on or off, /crewcut lang code, /crewcut markers on or off, /crewcut-review, /crewcut-audit, /crewcut-debt, /crewcut-gain, /crewcut-help, /crewcut uninstall."></p>

A new session starts at the default level, `full` unless you changed it; a
resumed session keeps the level you chose. Typing `stop crewcut` as a whole
message also switches the plugin off.

<details>
<summary>Levels and commands as text</summary>

| Level   | What Claude gets                                                        |
| ------- | ----------------------------------------------------------------------- |
| `off`   | Nothing, for this session                                               |
| `lite`  | Output discipline and a light reading habit                             |
| `full`  | Default. Output, reading, writing and tool discipline                   |
| `ultra` | Full, plus one-line answers and no new file or dependency without an explicit request |

| Command                     | Effect                                                |
| --------------------------- | ----------------------------------------------------- |
| `/crewcut`                  | Show the current level and the default                |
| `/crewcut <level>`          | Switch to `off`, `lite`, `full` or `ultra`            |
| `/crewcut default <level>`  | Set the level new sessions start at                   |
| `/crewcut subagents on\|off` | Inject the rules into subagents too (on by default)   |
| `/crewcut lang <code>`      | Reply in `en`, `es`, `fr`, `de`, `ko` or `zh`; asked once at the first session |
| `/crewcut tests on\|off`     | Off: write a test only when the ticket asks, never extend one (on by default; asked once at the first session) |
| `/crewcut map on\|off`       | Map of the project's own names and its declared versions at session start (on by default) |
| `/crewcut markers on\|off`   | `// ~` comment on each corner cut (off by default)     |
| `/crewcut-review [scope]`   | Read-only review of a change: bugs, risk, load, tests, speed, what to cut |
| `/crewcut-audit [path]`     | The same over a whole tree, ranked                    |
| `/crewcut-debt [path]`      | Ledger of the `// ~` markers                          |
| `/crewcut-gain`             | What the plugin saves, as measured above              |
| `/crewcut-help`             | Reference card                                        |
| `/crewcut uninstall`        | Remove the plugin's files next to your settings       |

</details>

## Review, audit and debt

<p align="center"><img src="assets/readme/review.png" width="880" alt="An example of the /crewcut-review format. What this does, then findings grouped as must fix and should fix, each with what, problem, fix and if skipped, a verdict and the lines to cut. In order: correct, safe, holds at the load, tested, fast, lean. Read-only. /crewcut-audit runs the same review over a whole tree, twenty findings at most."></p>

`/crewcut-review` takes the uncommitted changes, a git range, a PR link or
file paths. With `/crewcut markers on`, a corner cut on purpose carries a
discreet `// ~ no retry, add when the API flakes`, and `/crewcut-debt`
lists them. crewcut never writes its name in your code.

## Reference

<p align="center"><img src="assets/readme/settings.png" width="880" alt="Settings, in crewcut.json next to your Claude settings. Six keys, and the environment variable wins over the file. defaultLevel, CREWCUT_DEFAULT_MODE: level new sessions start at. subagents: the ruleset in subagents, about 500 tokens each. subagentMatcher, CREWCUT_SUBAGENT_MATCHER: regular expression on the agent type. tests, CREWCUT_TESTS: off, a test only when the ticket asks. map, CREWCUT_MAP: off, no map and no versions at session start. markers: a discreet comment on each corner cut."></p>

<details>
<summary>Settings</summary>

Settings live in `crewcut.json` next to your Claude settings (`~/.claude`,
or `CLAUDE_CONFIG_DIR`):

```json
{ "defaultLevel": "ultra", "subagents": true, "markers": false, "map": true }
```

| Key               | Environment variable      | Effect                                              |
| ----------------- | ------------------------- | --------------------------------------------------- |
| `defaultLevel`    | `CREWCUT_DEFAULT_MODE`    | Level new sessions start at                         |
| `subagents`       |                           | Inject the ruleset into subagents (about 500 tokens each) |
| `subagentMatcher` | `CREWCUT_SUBAGENT_MATCHER` | Case-insensitive regular expression on the agent type, for example `explore\|general` |
| `markers`         |                           | `// ~` comment on each corner cut                   |
| `tests`           | `CREWCUT_TESTS`           | `false` or `off`: write a test only when the ticket asks |
| `map`             | `CREWCUT_MAP`             | `false` or `off`: no map and no versions at session start; `CREWCUT_MAP_CHARS` sets the map's size, 1500 by default |

The environment variable wins over the file. A subagent whose type is
unknown, or a pattern that does not compile, still receives the rules.
Without a pattern, the two built-in agents that never touch code,
`claude-code-guide` and `statusline-setup`, receive nothing; a pattern that
names them brings them back.

</details>

<details>
<summary>Status line</summary>

The plugin ships a status line that prints the level, the model and the
working directory, for example `crewcut: ultra | Opus | shop`. The level is
green, amber for `ultra`, grey for `off`; set `NO_COLOR=1` to print it
plain. On the first start without a status line configured, Claude offers
once to add it to your settings; say yes, or add it yourself:

```json
"statusLine": { "type": "command", "command": "node \"C:/Users/you/.claude/crewcut-statusline.js\"" }
```

At session start the hook copies the script to `crewcut-statusline.js` next
to your Claude settings, under a path that survives plugin updates. The
level is kept per project (`crewcut-levels/` next to your settings, one
file per project off the default), so two sessions in two repositories keep
their own; the status line reads the shared `crewcut-mode`, which carries
the level set last.

</details>

<details>
<summary>Code agent</summary>

The plugin ships `crewcut-coder`, a code agent on Opus with Read, Grep,
Glob, Edit, Write and Bash. Claude delegates a code task to it (implement,
fix, refactor, write a test) when the session runs on a lighter model or
the main context should stay small; you can also ask for it by name. It
gets the crewcut rules like any subagent and ends with a short report:
files changed, test result. Search stays with Claude Code's built-in
Explore agent, review with `crewcut-reviewer` on Sonnet. A task it handles
is billed at Opus rates, even in a Sonnet session.

Both agents name their model by alias, so they follow each new Opus and
Sonnet release without an update of the plugin.

</details>

<details>
<summary id="the-rules">The rules</summary>

What the ruleset says, beyond the ladder above.

**Token discipline**

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

**Never cut.** Validation at trust boundaries, handling that prevents data
loss, security, accessibility basics, existing tests, and anything you
explicitly asked for. Simple is not negligent. Before writing, Claude names
what the change could expose or destroy for users.

**Modern by default.** Claude checks the versions the project runs,
language, runtime, framework and libraries, and follows what their official
docs recommend today, including the compact forms when they stay clear:
ternary, optional chaining, destructuring, early return. Unsure of an API,
or a version newer than it knows: it reads the docs or the installed source
instead of guessing. Never a deprecated pattern, never a feature the version
lacks.

**Comments.** The why only, in one plain line.

**Plain text only.** In code, comments, commits, pull requests and answers:
no emoji, no emoticon, no arrow symbol (`->` instead), no long dash (`-`
instead), no curly quotes (`"` instead). Any found in text Claude touches is
replaced.

**Commits and pull requests.** One short subject line, a brief body only
when it adds something. No AI mention, no AI co-author, no generated-with
line, no trailer; any such watermark found in a message, a PR description
or a file is removed before the commit or the PR goes out. A pull request
description says what changed, why, and how it was checked, in a few lines.

</details>

## FAQ

<p align="center"><img src="assets/readme/faq.png" width="880" alt="FAQ. Why a plugin when a seven-word prompt cuts as much on Opus? The prompt cuts blind: it skips the tests, writes more code than no prompt on Haiku, and once drops the per-client check of a rate limiter. crewcut names what never gets cut and fixes a bug at its root; for the prompt's savings, /crewcut tests off keeps everything else. Does it follow new models? Yes: the ruleset is injected whatever the model, and the two agents name theirs by alias; each figure holds for the model it was measured on. Does it claim a saving on my repository? No: /crewcut-gain prints the measured figures, the version you did not build was never written."></p>

## Update and uninstall

Update with `/plugin marketplace update crewcut` then `/reload-plugins`, or
enable auto-update for the marketplace in `/plugin`.

Type `/crewcut uninstall` in a session, then `/plugin remove crewcut`. The
first removes the files the plugin keeps next to your Claude settings (the
session level and the per-project levels, `crewcut.json`, the status line
copy and its flag, plus the `statusLine` entry when it points at crewcut's
own script); the second removes the plugin itself. From a shell, the same
cleanup is `node <plugin dir>/hooks/crewcut.js uninstall`.

## Limitations

<p align="center"><img src="assets/readme/limits.png" width="880" alt="Limitations. The hooks need node on the PATH. Two sessions in the same project share one level, and the status line shows the level set last. The map lists top-level definitions found by one regular expression per language, ten languages, and the versions come from package.json and composer.json only. The hooks, levels, review, audit and ledger are Claude Code only; other agents get the ruleset through AGENTS.md. A cloud session on claude.ai/code does not load a plugin installed with /plugin."></p>

## Credits and license

Inspired by ponytail by Dietrich Gebert. MIT license.
