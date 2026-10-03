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
  FastAPI template, Sonnet 5.5     80 %   107 %  100 %   93 %   21/21
  FastAPI template, Opus 5.5       30 %    60 %   57 %   51 %   21/21
  controls on Haiku, LOC: caveman 104 % and 85 %, yagni prompt 112 % and 71 %

  eval cases (seven, three runs each, same model with and without)

                 score with / without   turns with / without   cost per run with / without
  Fable 5.1      0.95 / 0.82            4.8 / 5.8     -17 %    0.102 / 0.105 USD     -3 %
  Sonnet 5.5     0.88 / 0.87            5.0 / 6.1     -18 %    0.063 / 0.067 USD     -6 %
  Opus 5.5       0.91 / 0.84            5.0 / 6.0     -17 %    0.113 / 0.102 USD    +11 %

  This repo has no baseline: the version you did not build was never written,
  so no per-repo saving can be honestly computed.
  Counted instead:  /crewcut-debt   the corners cut on purpose
                    /crewcut-audit  what could still be cut
```
