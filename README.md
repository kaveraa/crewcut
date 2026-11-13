# crewcut

<p align="center"><img src="https://raw.githubusercontent.com/kaveraa/crewcut/acdf351/assets/banner.svg" alt="crewcut" width="100%"></p>

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

<p align="center"><img src="assets/readme/numbers.png" width="880" alt="Opus 5.5, with and without the plugin. Same agent, same tickets, a fraction of the code: 82 percent less code, 55 percent fewer tokens, 60 percent lower cost, 67 percent less time. 100 percent of the safety tasks still pass. Twelve one-line tickets on Next-js-Boilerplate, headless Claude Code sessions, scored on the git diff, against the same model with no plugin."></p>

## Install

```
/plugin marketplace add kaveraa/crewcut
/plugin install crewcut@crewcut
```

From a local checkout, for one session: `claude --plugin-dir /path/to/crewcut`.

The hooks run `node`, so Node 22 or newer must be on the PATH of the shell
that starts Claude Code. Without it, only the skills work.

Any other agent that reads a rules file (Codex, Cursor, Copilot, Gemini
CLI, OpenCode and the rest): copy [AGENTS.md](AGENTS.md) into your project.
It is the `full` ruleset; the levels, the review, the audit and the ledger
stay with the Claude Code plugin.

## Before and after

<p align="center"><img src="assets/readme/beforeafter.png" width="880" alt="Ticket: add a date picker component to the frontend. Without crewcut: 318 lines, 2 new packages, 14 turns, 0.37 USD. With crewcut: 10 lines, no package, 5 turns, 0.11 USD. The whole component is a function that returns the repository's Input with type date. Same repository, same model, Opus 5.5, one headless session each."></p>

Without the plugin, Opus installs a calendar and a popover, writes a wrapper
component, a stylesheet and a usage page, and tells you to run `bun install`.
With it, the reply says what the component wraps, that it works with
`react-hook-form` like the other inputs, that nothing was run, and that the
styled calendar would cost two packages if you want it.

Both diffs and both replies, verbatim, with four other tickets:
[examples/](examples/).

## How it works

<p align="center"><img src="assets/readme/ladder.png" width="880" alt="How it works. Read what the change touches, then take the lowest rung that holds. 1, not needed: skip it and say so in one line. 2, already in this codebase: reuse it. 3, in the standard library: use it. 4, native to the platform, HTML, CSS, SQL, the OS: use it. 5, an installed dependency: use it, never add one. 6, one line: one line. 7, else the minimum that works. Never cut: trust-boundary validation, data-loss handling, security, accessibility, existing tests."></p>

At session start, and in every subagent, Claude receives one ruleset: a
senior who reads everything and writes almost nothing.

- **Build the ticket, not its neighbours.** No optional prop, state, mode or
  edge case the ticket did not name. A second use case is a second ticket.
- **Bug fix means root cause.** Find every caller, fix the shared function
  once, even when the other callers look safe today.
- **Short never means wrong.** A question gets a full answer, a failing test
  is fixed and rerun, a file that changed since the last read is read again.
- **Current practice.** Claude follows what the official docs of the
  installed versions recommend today, and reads them when unsure.
- **Clean output.** Comments say why, in one plain line. No emoji, no arrow
  symbol, no long dash. No AI mention or co-author in commits and pull
  requests.

With the ruleset, the session start carries a map of what the project
already defines, one line per folder with its exported names, and the
versions that `package.json` and `composer.json` declare. Reusing a helper
and writing for the versions in use then cost no search.
`/crewcut map off` drops both.

The full ruleset: [The rules](#the-rules).

## Measured

<p align="center"><img src="assets/readme/evals.png" width="880" alt="Eval suite, seven cases, three runs each. Shorter, and more often right. Opus 5.5: 1.00 with crewcut, 0.81 for the same model with no plugin. Sonnet 5.5: 0.98 with, 0.86 without. Score is the share of graders passed. Every case grades correctness as well as size: a shorter answer that is wrong scores zero."></p>

**Eval suite.** The plugin's own seven cases, three runs each, with and
without the plugin, Sonnet as judge. Every case grades correctness as well
as size.

| Model | crewcut | Score with | without | Turns with | without | Cost per run with | without |
|---|---|--:|--:|--:|--:|--:|--:|
| Opus 5.5 | 0.14.0 | 1.00 | 0.81 | 5.2 | 5.7 | 0.105 USD | 0.102 USD |
| Sonnet 5.5 | 0.14.0 | 0.98 | 0.86 | 4.4 | 6.2 | 0.059 USD | 0.059 USD |

A bug in a shared function is fixed at its root in 3 runs out of 3 with the
plugin, 0 without: every run without it patched the caller. Per-case tables
and every re-measure: [evals/RESULTS.md](evals/RESULTS.md).

**Agentic benchmark.** Twelve one-line tickets against a real repository, a
headless Claude Code session per cell, scored on the `git diff` it leaves
behind, plus seven safety tasks whose output is executed against
adversarial input. Each cell is a percent of the same model with no plugin.

| crewcut vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| **Opus 5.5, Next-js-Boilerplate** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| **Opus 5.5, full-stack-fastapi-template** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| **Sonnet 5.5, Next-js-Boilerplate** | **-70 %** | **-11 %** | **-31 %** | **-34 %** | **100 %** |
| **Haiku 4.5, Next-js-Boilerplate** | **-63 %** | **-48 %** | **-46 %** | **-40 %** | **100 %** |
| **Haiku 4.5, full-stack-fastapi-template** | **-9 %** | **-30 %** | **-30 %** | **-20 %** | **100 %** |
| **Sonnet 5.5, full-stack-fastapi-template** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |

The cut follows how much the baseline over-builds, which depends on the
repository as much as on the model: it is biggest where a native element
replaces a component, near zero on irreducible endpoints. Tokens fall only
where the plugin removes turns: on Opus, from 12.1 to 7.5 per ticket.

<p align="center"><img src="assets/benchmark-opus-next.svg" width="860" alt="Each arm as a percent of the no-plugin baseline across LOC, tokens, cost and time (Opus 5.5, Next-js-Boilerplate). Crewcut: LOC 18, tokens 45, cost 40, time 33. Crewcut with tests off: 17, 43, 37, 31. The yagni prompt: 12, 38, 34, 28. Safety: every arm 100 percent."></p>

<details>
<summary>Tests off, and the seven-word prompt control</summary>

The same arm with `/crewcut tests off`, a test only when the ticket asks:

| crewcut, tests off, vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -83 % | -57 % | -63 % | -69 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -71 % | -50 % | -53 % | -61 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -69 % | -7 % | -27 % | -33 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -60 % | -55 % | -52 % | -48 % | 100 % |
| Haiku 4.5, full-stack-fastapi-template | -20 % | -38 % | -35 % | -26 % | 100 % |
| Sonnet 5.5, full-stack-fastapi-template | -17 % | -15 % | -26 % | -24 % | 100 % |

The seven-word prompt "Follow YAGNI principles, and prefer one-liner
solutions." in the same runs:

| "YAGNI + one-liners" prompt vs no-plugin baseline | LOC | tokens | cost | time | safe |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -88 % | -62 % | -66 % | -72 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -72 % | -44 % | -49 % | -56 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -74 % | -17 % | -38 % | -37 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -29 % | -23 % | -7 % | -23 % | 96 % |
| Haiku 4.5, full-stack-fastapi-template | +12 % | -15 % | +11 % | -5 % | 96 % |
| Sonnet 5.5, full-stack-fastapi-template | -31 % | -1 % | -12 % | -14 % | 100 % |

<p align="center"><img src="assets/benchmark-opus-tests.svg" width="860" alt="Tests on against tests off, each arm as a percent of the no-plugin baseline (Opus 5.5, full-stack-fastapi-template). Crewcut with tests on: LOC 30, tokens 60, cost 57, time 51. Crewcut with tests off: 29, 50, 47, 39. The yagni prompt: 28, 56, 51, 44. Safety: every arm 100 percent."></p>

Caveman, the terse-prose control, cuts no code (+4 % LOC on the template):
short prose is not short code.

</details>

The harness is the one ponytail published for its own benchmark, with a
`crewcut` arm added; the Haiku rows are the crewcut 0.11.3 re-measure. Method,
per-task tables, limits and how to reproduce:
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md).

## Levels and commands

| Level   | What Claude gets                                                        |
| ------- | ----------------------------------------------------------------------- |
| `off`   | Nothing, for this session                                               |
| `lite`  | Output discipline and a light reading habit                             |
| `full`  | Default. Output, reading, writing and tool discipline                   |
| `ultra` | Full, plus one-line answers and no new file or dependency without an explicit request |

A new session starts at the default level, `full` unless you changed it; a
resumed session and a context compaction keep the level you chose. Typing
`stop crewcut` or `normal mode` as a whole message also switches the plugin
off.

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

## Review, audit and debt

`/crewcut-review` reviews the uncommitted changes, or the last commit when
there are none; a git range, a PR link or file paths set the scope. A
read-only agent on Sonnet reads the diff and the code it touches, callers
included, in this order: correct, safe, holds at the load the project
expects, tested, fast, lean. Every finding comes with a concrete case, the
smallest fix and what happens if it is skipped, numbered so you can say
"fix 2 and 4":

```
What this does: adds a nightly job that closes the day and bills its orders.

Must fix
1. Orders land on the wrong day (billing/close_day.py:40-52)
   What: the job stamps each order with the server clock, which runs in UTC.
   Problem: an order placed at 00:30 in Berlin is billed on the day before.
   Fix: take the date once in the shop's time zone; one line, nothing else moves.
   If skipped: late orders carry the wrong date and accounting corrects them by hand.

Should fix
2. No test on the billing total (billing/close_day.py:60)
   ...

Verdict: fix 1 first.
cut: 14 lines
```

`/crewcut-audit` runs the same review over a whole tree, entry points and
main flows first, twenty findings at most. Both report and change nothing.

With `/crewcut markers on`, a corner cut on purpose carries a comment such
as `// ~ no retry, add when the API flakes`. The sign is discreet: crewcut
never writes its name in your code. `/crewcut-debt` gathers the markers and
flags those that name no condition to revisit:

```
src/queue.js:18: no retry -> add when: the API flakes
src/report.js:40: full table scan -> no trigger
2 markers, 1 without a trigger
```

## Reference

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
explicitly asked for. Simple is not negligent.

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

**Why a plugin when the seven-word prompt cuts more on Opus?** Because the
prompt cuts blind. It ships barer components and skips the tests: on Opus
it writes tests in 31 % of the cells against 50 % for crewcut on the
template. On Haiku it writes more code than no prompt at all, and once
drops a guard, the per-client check of a rate limiter. Crewcut kept every
guard on every safety cell of every tier, names what never gets cut, and
fixes a bug at its root rather than at the caller. If you would rather have
the prompt's savings, `/crewcut tests off` keeps everything else.

**Does it follow new models?** Yes. The ruleset is injected whatever the
model of the session, and the two agents name theirs by alias. The figures
above are another matter: each one holds for the model it was measured on,
named in its row.

**Does it claim a saving on my repository?** No. `/crewcut-gain` prints the
measured figures; the version you did not build was never written.

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

- The hooks need `node` on the PATH.
- Two sessions in the same project share one level; the status line shows
  the level set last, whatever the project.
- The map lists top-level definitions found by one regular expression per
  language (JavaScript and TypeScript, Python, Go, Rust, Ruby, PHP, Java,
  Kotlin, C#, Swift); nested or dynamic definitions are not in it. The
  versions come from `package.json` and `composer.json` only.
- The hooks, levels, review, audit and ledger are Claude Code only; other
  agents get the ruleset through `AGENTS.md`.
- A cloud session (claude.ai/code) does not load a plugin installed with
  `/plugin`, nor one a repository turns on in `.claude/settings.json`, and
  has no `/plugin` command. Installing crewcut there is being tested.

## Credits and license

Inspired by ponytail by Dietrich Gebert. MIT license.
