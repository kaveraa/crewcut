---
name: crewcut-gain
description: Show what crewcut saves, as measured on its eval cases. One-shot display, changes nothing.
disable-model-invocation: true
---

Print the card below verbatim, as a code block, and stop. Do not change the
level, do not write any file, do not add commentary.

```
crewcut gain                   measured on public repos and eval cases, not on this repo

  agentic benchmark (ponytail's harness, 12 tickets per row, 4 arms on Haiku)
  percent of the no-plugin baseline, lower is leaner

                                   LOC   tokens   cost   time   safe
  FastAPI template, Haiku 4.5      86 %    97 %   96 %   93 %   28/28
  Next.js boilerplate, Haiku 4.5   60 %    90 %   87 %   80 %   28/28
  FastAPI template, Sonnet 5.5     85 %    95 %   85 %   94 %   21/21
  FastAPI template, Opus 5.5       32 %    61 %   59 %   55 %   21/21
  Next.js boilerplate, Opus 5.5    18 %    45 %   40 %   33 %   21/21
  controls on Haiku, LOC: caveman 104 % and 85 %, yagni prompt 112 % and 71 %

  eval cases (seven, three runs each, same model with and without)

                 score with / without   turns with / without   cost per run with / without
  Fable 5.1      0.96 / 0.81            6.2 / 9.0     -31 %    0.309 / 0.404 USD    -24 %
  Sonnet 5.5     0.97 / 0.89            5.7 / 6.3     -10 %    0.066 / 0.062 USD     +6 %
  Opus 5.5       1.00 / 0.84            5.0 / 5.7     -12 %    0.106 / 0.100 USD     +6 %

  This repo has no baseline: the version you did not build was never written,
  so no per-repo saving can be honestly computed.
  Counted instead:  /crewcut-debt   the corners cut on purpose
                    /crewcut-audit  what could still be cut
```
