# Changelog

All notable changes to this project are documented in this file. The format
follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

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
