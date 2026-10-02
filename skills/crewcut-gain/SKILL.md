---
name: crewcut-gain
description: Show what crewcut saves, as measured on its eval cases. One-shot display, changes nothing.
disable-model-invocation: true
---

Print the card below verbatim, as a code block, and stop. Do not change the
level, do not write any file, do not add commentary.

```
crewcut gain                   measured on the plugin's eval cases, not on this repo

  seven cases, three runs each, same model with and without

                   Fable 5.1                        Sonnet 5.5
  score            0.95 with   0.82 without         0.88 with   0.87 without
  turns            4.8  with   5.8  without  -17 %  5.0  with   6.1  without  -18 %
  cost per run     0.102 USD   0.105 USD     -3 %   0.063 USD   0.067 USD     -6 %

  twenty-file case (csv-export)
  files read       2.3  with   5.3  without         3.0  with   4.7  without
  turns            7    with   11.3 without         7    with   11   without
  cost per run     0.116 USD   0.133 USD     -13 %  0.063 USD   0.088 USD     -28 %

  one-file cases: nothing to cut, the ruleset is a fixed cost there

  This repo has no baseline: the version you did not build was never written,
  so no per-repo saving can be honestly computed.
  Counted instead:  /crewcut-debt   the corners cut on purpose
                    /crewcut-audit  what could still be cut
```
