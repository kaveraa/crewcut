# Examples

The same ticket, the same model, the same repository, once without crewcut and once with it. These are
cells taken from the agentic benchmark on Claude Opus 5.5 (ponytail's harness with a crewcut arm, one
headless Claude Code session per cell, crewcut 0.6.4, 2026-10-03): each page shows the diff the session
left behind and its last reply, verbatim, baseline first. One run per arm, so read them as what the
plugin does, not as a measure; the measure, over three runs and three model tiers, is in
[benchmarks/agentic/RESULTS.md](../benchmarks/agentic/RESULTS.md).

| Example | Without (lines) | With (lines) | What changes |
|---|--:|--:|---|
| [Date picker](date-picker.md) | 318 | 10 | two new packages, a calendar and a popover, against the browser's date input |
| [Color picker](color-picker.md) | 182 | 25 | hex field, presets and validation, against the browser's color input |
| [File upload dropzone](dropzone.md) | 181 | 51 | type, size and count checks nobody asked for, against a labelled file input; the one gap is marked in the code |
| [Duplicate an item](duplicate.md) | 23 | 20 | an endpoint that is mostly irreducible: the same size in both arms, the difference is the test file and a reused helper |
| [Safe upload path](safe-path.md) | 15 | 11 | a security task: both arms keep every guard and pass the adversarial run; crewcut skips the unasked test file |

Lines are source lines added as the harness counts them, tests apart. To make your own, follow the
"Reproduce" section of RESULTS.md and keep the run directory: each cell holds the working tree and the
session's JSON output.
