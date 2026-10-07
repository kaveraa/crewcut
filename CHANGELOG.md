# Changelog

All notable changes to this project are documented in this file. The format
follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

### Added

- Sonnet 5.5 measured on Next-js-Boilerplate, three arms, three runs, 108
  cells: crewcut LOC -70 %, tokens -11 %, cost -31 %, time -34 %, under
  the baseline on twelve tickets out of twelve, 6.8 turns against 10.4;
  the seven-word prompt -74 %, -17 %, -38 %, -37 %. The lean Sonnet
  baseline of the template tier was the small repository, not the model.

## [0.11.0] - 2026-10-07

### Added

- `/crewcut tests on|off`: off, crewcut writes a test only when the ticket
  asks and never extends one, like the seven-word prompt; `"tests": false`
  in `crewcut.json`, or `CREWCUT_TESTS=off`, which wins. On by default; the
  first session asks once, like the language. Ruleset lines can carry
  several tags. Measured on the Opus template, 36 cells plus 21 safety
  cells: LOC -71 %, tokens -50 %, cost -53 %, time -61 %, 5.9 turns, safe
  21/21, against -70 %, -40 %, -43 %, -49 % with tests on.
- README and README.fr: a "Before and after" section with the date picker
  ticket on Opus, 318 lines and two packages against 10 lines, from
  `examples/date-picker.md`.

### Changed

- Plugin and marketplace descriptions and keywords aligned with the README
  headline.
- README: the seven-word prompt gets its extra line cut from barer
  components; the tests it skips explain crewcut's extra turns and cost,
  since the harness counts test files apart from LOC.

## [0.10.0] - 2026-10-07

### Added

- A barber shop banner at the top of the README files (`assets/banner.svg`).
- `evals/RESULTS.md`: the per-case eval tables and the re-measure of each
  version, moved out of the README.
- `AGENTS.md`: the `full` ruleset as a rules file for agents other than
  Claude Code; a test keeps it in step with `hooks/ruleset.md`.

### Changed

- README and README.fr redesigned: badges, the Opus figures and the two
  install commands first, then how the plugin works, one benchmark table
  per arm across every model and repository with the answer to "why a
  plugin when seven words cut more on Opus" under it, one eval line per
  model, and the levels, commands, settings and rules each in their own
  section. The Haiku chart moved to `benchmarks/agentic/RESULTS.md`.
- Repository and package description aligned with the README headline.

## [0.9.0] - 2026-10-05

### Changed

- The `crewcut:` comment on a cut corner is now opt-in: `/crewcut markers
  on` (or `"markers": true` in `crewcut.json`) adds the rule to the ruleset,
  and the rule only covers a corner with a known ceiling, never a prefix on
  a comment that explains code. Found on a real project: the model wrote
  `// crewcut: ...` in front of an ordinary comment describing the code.
  Off by default, the ruleset loses the line (lite 458, full 573, ultra 554
  estimated tokens; with markers on 483, 599, 580). `/crewcut-debt` says
  so when it finds nothing. The skill drops its "Boundaries" section, which
  repeated the persona line, to stay under 1500 tokens.
- Ruleset trimmed to make room for the opt-in line within the 600-token
  budget: shorter commit, modern-by-default and reading lines, same rules.
- Measure with the marker line out and the grader live, seven cases, three
  runs, Sonnet as judge (Claude Code 2.1.289, no out-of-usage run): Sonnet
  0.97 against 0.85 without, 4.4 turns against 5.8, 0.057 against 0.059
  USD; Opus 0.99 against 0.81, 5.0 turns against 6.0, 0.104 USD in both
  arms. `date-picker` 0.90 against 0.71 on Sonnet, where the baseline adds
  `max` in every run and the plugin in one run out of three; 1.00 against
  0.81 on Opus. README measure paragraphs and `/crewcut-gain` rows updated.

### Fixed

- `date-picker` grader `only-asked-attributes` never matched: the case file
  carried a backspace byte where the regex meant a word boundary, so a
  `max` or `min` attribute in the file passed from 0.6.3 to 0.8.0. The
  pattern now starts with a space, no backslash, and a test refuses any
  control character in tracked text files. The measures above are the
  first with the grader live.

## [0.8.0] - 2026-10-04

### Added

- `crewcut-coder` agent pinned to Opus (Read, Grep, Glob, Edit, Write,
  Bash) for delegated code tasks; it ends with a changed / tests / note
  report for the main session. Search stays with the built-in Explore
  agent, review with `crewcut-reviewer` on Sonnet. Not measured on the eval
  cases, which never start a subagent.

## [0.7.1] - 2026-10-04

### Changed

- Fable 5.1 remeasured on the one-caveat rule, seven cases, three runs,
  Sonnet as judge (Claude Code 2.1.289, no out-of-usage run): 0.98 against
  0.81, 5.7 turns against 8.4, 0.296 against 0.414 USD per run (-29 %).
  README measure paragraphs and the `/crewcut-gain` row updated.

- `url-parse` short-answer: a sentence saying the code was not run no
  longer counts as the one side note; Claude Code asks for it when there is
  no shell. Remeasured on that case, three runs, Sonnet as judge: 3 runs out
  of 3 with the plugin on Sonnet and Opus (1 and 2 before); without it, 1
  on Sonnet and 0 on Opus.

## [0.7.0] - 2026-10-04

### Added

- `/crewcut lang en|es|fr|de|ko|zh`: reply language, stored in `crewcut.json`. The
  first session asks it once (never in an eval run). English adds nothing
  to the ruleset, so the measures are unchanged; another language adds one
  line to the main session, not to subagents.

## [0.6.5] - 2026-10-04

### Changed

- Output rule, ruleset and skill: three sentences at most (what changed,
  where, one caveat only if it changes what the user does next), no offer and
  no `skipped:` line for what the ticket never asked. The `skipped: <what>,
  add when: <condition>` line is kept for a corner the ticket needed and the
  plugin cut. Found on `date-picker`: the judge read that line, and a
  sentence saying no min or max was added, as offers to change the form.
  The ruleset drops "ship the simple version and question the complex
  request", which the skill still carries, to stay under 600 tokens.
- Measure with the new rule, seven cases, three runs, Sonnet as judge
  (Claude Code 2.1.289): Sonnet 0.98 against 0.86 without, 5.4 turns
  against 6.1, 0.064 against 0.066 USD; Opus 0.98 against 0.83, 5.1 turns
  against 6.0, 0.104 against 0.102 USD. `date-picker` passes 3 runs out of
  3 with the plugin on both models against 0 without. `url-parse`
  short-answer stays split with the plugin (Sonnet 1 run out of 3, Opus 2):
  "not run" plus "throws on an invalid URL" is two side notes for the judge.
  README measure paragraphs and `/crewcut-gain` rows updated.

### Added

- `examples/`: five cells of the agentic benchmark on Opus 5.5 (date picker,
  color picker, dropzone, duplicate, safe-path), the diff and the reply of
  the baseline arm next to crewcut's, verbatim, with an index; linked from
  both READMEs.

### Changed

- Judge criteria rewritten as countable elements after reading the traces:
  `date-picker` short-answer caps the reply at four sentences and forbids
  offering a script or another change to the form, while saying the server
  must still accept the field stays allowed; `url-parse`
  short-answer allows one link as an example and at most one side note;
  `keep-validation` honest-answer asks for one explicit statement
  (unchanged, or shorter with the same behaviour) and no offer of tests.

## [0.6.4] - 2026-10-03

### Changed

- Measure on Fable 5.1 with crewcut 0.6.3, 42 clean cells: score 0.97
  against 0.82, turns -29 %, cost -22 %, `date-picker` 3/3 with the plugin
  against 0/3; README, README.fr and the gain card updated.

## [0.6.3] - 2026-10-03

### Changed

- Build the ticket only: "no unasked max or min" joins the examples, after
  Sonnet set a `max` on a date field nobody asked for, with and without the
  plugin. Output: one caveat at most, in one sentence, no bullet list.
  Ruleset at `full` stays under 600 tokens.
- `date-picker` eval: a regex grader checks the file for `max`, `min`,
  `pattern` or `placeholder`; the short-answer judge only measures the
  message (8 lines, no bullets, two sentences of caveat at most).
- Measures on 0.6.3: Sonnet agentic tier over six runs per ticket, lines
  -13 %, tokens 0 %, cost -11 %; evals Sonnet 0.96 against 0.88, Opus 0.98
  against 0.83. The short-answer criterion on `date-picker` fails in both
  arms on both models and is the open target.

## [0.6.2] - 2026-10-03

### Changed

- Opus 5.5 tier on Next-js-Boilerplate (crewcut 0.6.1): lines -82 %, tokens
  -55 %, cost -60 %, time -67 %, under the baseline on all twelve tickets.
- Eval suite re-measured with 0.6.1 on Fable 5.1 (0.96 against 0.81, cost
  -24 %) and Sonnet 5.5 (0.97 against 0.89, cost +6 %). README, `RESULTS.md`
  and `/crewcut-gain` carry the new rows.

## [0.6.1] - 2026-10-03

### Fixed

- Root cause: "fix the shared function once, even if other callers look
  safe". On Sonnet, `shared-bug` is fixed at the root in 3 runs out of 3
  with the plugin, 0 without (was 0 and 0).
- Output: never paste back code you wrote, one caveat at most, in place of
  "Code first", which the model read as "show the code again". On Opus,
  `date-picker` and `url-parse` pass the short-answer grader 3 runs out of
  3; the eval score is 1.00 on every case against 0.84 without the plugin.

### Changed

- Opus tier of the agentic benchmark re-measured with crewcut 0.6.1: lines
  -68 %, tokens -39 %, cost -41 %, safe 21/21, unchanged within noise.

## [0.6.0] - 2026-10-03

### Changed

- The ruleset read back on every turn goes from about 695 to 580 tokens at
  `full` (lite 450, ultra 550): the ladder, the commit, plain-text and
  modern rules and the token lines are shorter; the phrasings that carry the
  measured effect stay word for word. On the Sonnet tier of the agentic
  benchmark: lines -15 %, tokens -5 % (was +7 %), cost -15 %, safe 21/21.
- A question gets a full answer, including where a fix would go. On Opus,
  `explain-bug` passes 3 runs out of 3 again; eval score 0.95 against 0.83.
- Subagents: without a `subagentMatcher`, the built-in `claude-code-guide`
  and `statusline-setup` agents, which never touch code, no longer receive
  the ruleset.

## [0.5.4] - 2026-10-03

### Changed

- Agentic benchmark: Opus 5.5 tier on the FastAPI template (crewcut 0.5.3,
  three arms, three runs): LOC -70 %, tokens -40 %, cost -43 %, time -49 %,
  21 of 21 safety runs. README, `RESULTS.md` and `/crewcut-gain` carry the
  row.

### Fixed

- `benchmarks/agentic/ponytail-harness.patch` now adds the `crewcut` arm to
  the harness, as `RESULTS.md` described; it only carried the model ids, the
  snapshot retries and the `next-*` tasks.

## [0.5.3] - 2026-10-03

### Changed

- README and `/crewcut-gain` add the eval measure on Opus 5.5 (crewcut
  0.5.2): score 0.91 against 0.84, turns -17 %, cost +11 %; `shared-bug`
  fixed at the root 3/3 against 0/3, `explain-bug` loses the fix hint with
  the plugin.

## [0.5.2] - 2026-10-02

### Changed

- `/crewcut-gain` adds the Sonnet 5.5 row of the agentic benchmark (crewcut
  0.5.1: LOC 80 %, tokens 107 %, cost 100 %, time 93 %, safe 21/21).
- `benchmarks/agentic/ponytail-harness.patch`: the exact changes applied to
  ponytail's harness for the measure (crewcut arm, current model ids,
  snapshot retries, the Next.js task set).

## [0.5.1] - 2026-10-02

### Added

- "Build the ticket, not its neighbours" in the ruleset, the skill and the
  README: no optional prop, state, mode, setting or edge case the ticket did
  not name; a second use case is a second ticket; shortest correct form, no
  type alias or helper for a single use. Found on the Sonnet tier, where
  crewcut shipped a hover preview and a disabled prop nobody asked for.
- "Modern by default" names the compact forms to use when they stay clear:
  ternary, optional chaining, destructuring, early return.

## [0.5.0] - 2026-10-02

### Changed

- Reading rule hardened in the ruleset, the skill and the README: grep for
  the symbols the change touches, then ranged reads of those files only; one
  grep beats three reads; never read a file twice; never open a file to
  confirm what grep already showed.
- Tests rule split out and hardened: no test unless the task asks or an
  existing test file covers the touched code, then extend that file; never
  create a test file, even when invited to add tests "if you normally
  would". The old "leave one runnable check behind" line now applies only
  when a test file already exists.
- Plugin and skill descriptions say what was measured: less code, fewer
  reads, no safety cuts, instead of "spend fewer tokens".
- Ruleset budget raised from 600 to 700 estimated tokens.

## [0.4.2] - 2026-10-02

### Changed

- `/crewcut-gain` cites the agentic benchmark (ponytail's harness, two
  repositories, four arms) above the eval cases.

## [0.4.1] - 2026-10-02

### Changed

- README and `/crewcut-gain` show the measure on two working models side by
  side: Fable 5.1 (crewcut 0.4.0) and Sonnet 5.5 (crewcut 0.3.3).

## [0.4.0] - 2026-10-01

### Added

- `/crewcut-debt`: read-only ledger of the `crewcut:` comments, one line per
  corner cut, flagging those without a condition to revisit.
- `/crewcut-gain`: the measured gain as a card, with the honest limit that no
  per-repository saving can be computed.
- `/crewcut uninstall`, and `node hooks/crewcut.js uninstall`: remove the
  files the plugin keeps next to the Claude settings, and the `statusLine`
  entry when it points at crewcut's own script.
- `subagentMatcher` in `crewcut.json` and `CREWCUT_SUBAGENT_MATCHER`: inject
  the rules only into subagents whose type matches a regular expression;
  unknown types and broken patterns still receive the rules.
- Status line colours per level, off with `NO_COLOR`.
- Update and uninstall instructions in the README and the help card.

### Changed

- The hook answers after one second when stdin never closes instead of
  waiting for the hook timeout.
- Hook status messages while the hooks run.

## [0.3.3] - 2026-10-01

### Added

- Eval cases `vat-country` (seven modules, four test files) and `csv-export`
  (twenty source and test files): a bug the plugin should fix by reusing
  what exists, graded on files and tests left intact and on the number of
  files read. All cases re-measured in the README.
- CI badge in the README.

### Changed

- Tests remove their temporary directories when the run ends.

### Fixed

- The status line offer stays silent inside `claude plugin eval` runs, which
  start from a fresh config dir and used to receive it on every run.

## [0.3.2] - 2026-10-01

### Added

- Plain-text rule in the ruleset, the skill and the README: no emoji, no
  arrow symbol, no long dash, no curly quotes in code, comments, commits,
  pull requests and answers.

### Changed

- Ruleset budget raised from 550 to 600 estimated tokens.

### Fixed

- The status line script accepts status JSON that starts with a byte order mark.

## [0.3.1] - 2026-10-01

### Fixed

- The status line command pointed into the plugin cache, whose path carries
  the version and changes on every update. The hook now copies the script to
  `crewcut-statusline.js` next to the Claude settings and refreshes it at
  session start; the offer and the docs use that stable path.

## [0.3.0] - 2026-10-01

### Added

- Read-only `review` state: `/crewcut-review` and `/crewcut-audit` mark the
  session until the next `/crewcut <level>`; `/crewcut` shows it, compaction
  keeps it, subagents receive the read-only rule.
- Status line badge: `hooks/statusline.js` prints the level, the model and
  the working directory; a one-time offer to configure it at session start
  when no status line exists.

## [0.2.2] - 2026-10-01

### Added

- Modern-by-default rule in the ruleset, the skill and the README: check
  the project's versions and use the idioms and features they allow, never
  an old pattern the version has replaced, never a feature the version lacks.

### Changed

- Ruleset budget raised from 500 to 550 estimated tokens (full: 534, ultra: 537).

## [0.2.1] - 2026-10-01

### Added

- Commit and pull request rule in the ruleset, the skill and the README:
  short subject, brief body, no AI mention, no AI co-author, no trailer;
  existing watermarks are removed before committing.

### Changed

- Ruleset budget raised from 450 to 500 estimated tokens (full: 478, ultra: 481).

## [0.2.0] - 2026-10-01

### Added

- `/crewcut default <level>`: a persistent default stored in `crewcut.json`
  next to the Claude settings; `CREWCUT_DEFAULT_MODE` still wins over it.
- SubagentStart hook: every subagent receives the ruleset of the current
  level. `/crewcut subagents off` switches it off.
- `/crewcut-help`: a reference card, loaded only when invoked.
- `/crewcut-audit [path]`: the review over a whole tree, ranked by lines to cut.

### Changed

- `/crewcut` alone now shows the default level next to the current one.

## [0.1.0] - 2026-10-01

### Added

- Levels `off`, `lite`, `full`, `ultra` switched with `/crewcut <level>`.
- Compact ruleset injected at session start and on every level switch.
- `/crewcut-review`: read-only review that names the ladder rung to stop at.
- Evals measuring the token delta with and without the plugin.
- Always-loaded context: about 245 tokens of skill and agent descriptions, plus a ruleset under 450 tokens injected at session start.
- Quality guard in the ruleset, the skill and the reviewer: short never means wrong.
