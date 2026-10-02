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
  controls on Haiku, LOC: caveman 104 % and 85 %, yagni prompt 112 % and 71 %

  eval cases (seven, three runs each, same model with and without)

                   Fable 5.1                        Sonnet 5.5
  score            0.95 with   0.82 without         0.88 with   0.87 without
  turns            4.8  with   5.8  without  -17 %  5.0  with   6.1  without  -18 %
  cost per run     0.102 USD   0.105 USD     -3 %   0.063 USD   0.067 USD     -6 %

  This repo has no baseline: the version you did not build was never written,
  so no per-repo saving can be honestly computed.
  Counted instead:  /crewcut-debt   the corners cut on purpose
                    /crewcut-audit  what could still be cut
```
