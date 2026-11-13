# Examples

The same ticket, the same model, the same repository, once without crewcut and once with it. These are
cells of ponytail's agentic benchmark on Claude Opus 5.5, run with its harness unchanged (one headless
Claude Code session per cell, crewcut 0.15.4, 2026-11-13): each page shows the diff the session left
behind and its last reply, verbatim, baseline first. One run per arm, so read them as what the plugin
does, not as a measure; the measure, over five runs and 39 tasks, is in
[benchmarks/agentic/RESULTS.md](../benchmarks/agentic/RESULTS.md).

| Example | Without (lines) | With (lines) | What changes |
|---|--:|--:|---|
| [Date picker](date-picker.md) | 399 | 10 | a calendar built by hand in two files, with its own keyboard grid, against the browser's date input |
| [Color picker](color-picker.md) | 121 | 21 | a controlled component in three parts, against the browser's color input |
| [File upload dropzone](dropzone.md) | 335 | 37 | a full dropzone with its own picking and listing, against a labelled file input that takes drops |
| [Duplicate an item](duplicate.md) | 20 | 19 | an endpoint that is mostly irreducible: the same size in both arms, tests in both; crewcut took two more turns and cost more on this run |
| [Safe upload path](safe-path.md) | 29 | 8 | a security task: both arms pass the adversarial run; crewcut skips the unasked test file |

Lines are source lines added as the harness counts them, tests apart. To make your own, follow the
"Reproduce" section of RESULTS.md and keep the run directory: each cell holds the working tree and the
session's JSON output.
