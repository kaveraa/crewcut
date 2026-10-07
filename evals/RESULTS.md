# Eval suite, per case and per version

The plugin's own eval suite, every measure since 0.3.3. The README keeps the
latest line per model; this file keeps the per-case tables and what each
rule changed. Per-version totals are also in [CHANGELOG.md](../CHANGELOG.md).

Three measures of the same seven cases, three runs each, with and without
the plugin, Sonnet as judge
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`,
with `--allow-tools Edit Write`), on three working models. Score is the
share of graders passed. Cost stands in for tokens at a fixed model.

## Fable 5.1 (crewcut 0.4.0, 2026-10-02, Claude Code 2.1.287)

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.092 USD         | 0.070 USD            | 4.0        | 3.0           |
| url-parse       | 0.95       | 0.86          | 0.086 USD         | 0.072 USD            | 3.3        | 3.7           |
| shared-bug      | 1.00       | 0.63          | 0.105 USD         | 0.090 USD            | 5.0        | 6.0           |
| keep-validation | 0.94       | 0.72          | 0.119 USD         | 0.130 USD            | 4.7        | 4.0           |
| explain-bug     | 0.92       | 0.92          | 0.092 USD         | 0.079 USD            | 4.7        | 4.7           |
| vat-country     | 1.00       | 1.00          | 0.106 USD         | 0.160 USD            | 5.0        | 7.7           |
| csv-export      | 1.00       | 0.78          | 0.116 USD         | 0.133 USD            | 7.0        | 11.3          |
| all             | 0.95       | 0.82          | 0.102 USD         | 0.105 USD            | 4.8        | 5.8           |

## Sonnet 5.5 (crewcut 0.3.3, 2026-10-01, Claude Code 2.1.287)

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.052 USD         | 0.044 USD            | 4.3        | 4.0           |
| url-parse       | 0.90       | 0.90          | 0.060 USD         | 0.055 USD            | 4.0        | 4.0           |
| shared-bug      | 0.62       | 0.62          | 0.050 USD         | 0.049 USD            | 3.0        | 6.0           |
| keep-validation | 0.89       | 0.89          | 0.095 USD         | 0.110 USD            | 4.0        | 4.3           |
| explain-bug     | 0.92       | 0.92          | 0.051 USD         | 0.047 USD            | 4.0        | 4.0           |
| vat-country     | 1.00       | 1.00          | 0.072 USD         | 0.074 USD            | 8.7        | 9.7           |
| csv-export      | 1.00       | 0.89          | 0.063 USD         | 0.088 USD            | 7.0        | 11.0          |
| all             | 0.88       | 0.87          | 0.063 USD         | 0.067 USD            | 5.0        | 6.1           |

## Opus 5.5 (crewcut 0.5.2, 2026-10-03, Claude Code 2.1.287)

| Case            | Score with | Score without | Cost per run with | Cost per run without | Turns with | Turns without |
| --------------- | ---------- | ------------- | ----------------- | -------------------- | ---------- | ------------- |
| date-picker     | 0.83       | 0.83          | 0.101 USD         | 0.081 USD            | 4.0        | 3.0           |
| url-parse       | 0.86       | 0.86          | 0.097 USD         | 0.075 USD            | 4.0        | 3.3           |
| shared-bug      | 1.00       | 0.62          | 0.098 USD         | 0.088 USD            | 4.0        | 5.3           |
| keep-validation | 1.00       | 0.89          | 0.144 USD         | 0.117 USD            | 5.3        | 4.7           |
| explain-bug     | 0.75       | 0.92          | 0.093 USD         | 0.091 USD            | 4.3        | 5.0           |
| vat-country     | 1.00       | 1.00          | 0.120 USD         | 0.122 USD            | 6.3        | 8.0           |
| csv-export      | 0.96       | 0.78          | 0.135 USD         | 0.141 USD            | 7.3        | 13.0          |
| all             | 0.91       | 0.84          | 0.113 USD         | 0.102 USD            | 5.0        | 6.0           |

Re-measured with crewcut 0.6.0 (2026-10-03, Claude Code 2.1.288): score 0.95
against 0.83, turns 5.3 against 5.9, cost per run 0.107 against 0.099 USD;
`explain-bug` 1.00 against 0.83. Re-measured with crewcut 0.6.1: score 1.00
on every case against 0.84 without, turns 5.0 against 5.7, cost per run
0.106 against 0.100 USD. With crewcut 0.6.3 and the reworked `date-picker`
graders (below): 0.98 against 0.83, turns 5.2 against 5.9, cost per run
0.101 against 0.099 USD; `date-picker` 0.86 in both arms.

Crewcut 0.6.1 on the other two models (2026-10-03, Claude Code 2.1.288):
Fable 5.1 scores 0.96 against 0.81, in 6.2 turns against 9.0, at 0.309
against 0.404 USD per run (-24 %); Sonnet 5.5 scores 0.97 against 0.89, in
5.7 turns against 6.3, at 0.066 against 0.062 USD (+6 %). Sonnet with
crewcut 0.6.3: 0.96 against 0.88, 5.4 turns against 6.0, 0.061 against
0.062 USD. Fable with crewcut 0.6.3 (2026-10-03, Claude Code 2.1.287,
42 clean cells): 0.97 against 0.82, 6.5 turns against 9.1 (-29 %), 0.296
against 0.378 USD (-22 %); `csv-export` reads 3.3 files against 9.0,
`vat-country` 3.0 against 11.0, and `date-picker` passes 3 runs out of 3
with the plugin against 0 without. Fable's runs cost about three times the
0.4.0 measure in both arms, so only the ratio compares. With crewcut 0.6.5
and the one-caveat output rule (2026-10-04, Claude Code 2.1.289): Sonnet
0.98 against 0.86, 5.4 turns against 6.1, 0.064 against 0.066 USD (-3 %);
Opus 0.98 against 0.83, 5.1 turns against 6.0, 0.104 against 0.102 USD
(+2 %); `date-picker` passes 3 runs out of 3 with the plugin on both,
against 0 without. Fable on the same rule (crewcut 0.7.0, 2026-10-04,
Claude Code 2.1.289, 42 clean cells): 0.98 against 0.81, 5.7 turns against
8.4 (-32 %), 0.296 against 0.414 USD (-29 %); `date-picker` and
`url-parse` pass 3 runs out of 3 with the plugin, `shared-bug` 0.96
against 0.62. With crewcut 0.9.0 (2026-10-05, Claude Code 2.1.289), the
marker line out of the ruleset and the `date-picker` attribute grader live
for the first time (below): Sonnet 0.97 against 0.85, 4.4 turns against
5.8 (-24 %), 0.057 against 0.059 USD (-3 %); Opus 0.99 against 0.81, 5.0
turns against 6.0, 0.104 USD in both arms. `date-picker` 0.90 against 0.71
on Sonnet (the baseline adds a `max` attribute in every run, the plugin in
one run out of three), 1.00 against 0.81 on Opus.

What it says:

- The savings show up with the size of the project. `csv-export` is twenty
  source and test files with a one-line bug: with the plugin, Fable reads
  2.3 files against 5.3 and takes 7 turns against 11.3, Sonnet reads 3.0
  against 4.7 and takes 7 against 11, Opus reads 2.0 against 6.3 and takes
  7.3 against 13; cost is 13 %, 28 % and 4 % lower, and the score is higher
  because every run without the plugin read more files than the case
  allows. `vat-country`, seven modules, sits in between: fewer files read,
  fewer turns, cost 34 % lower on Fable and equal on Sonnet and Opus. The
  five one-file cases have nothing to cut, and the ruleset is a fixed cost
  there: a few percent more per run on Sonnet, 15 to 30 % more on Fable and
  Opus, same or better score.
- Turns go down 17 % on Fable and Opus and 18 % on Sonnet. Quality holds
  or rises: 0.95 against 0.82 on Fable, 0.88 against 0.87 on Sonnet, 0.91
  against 0.84 on Opus. Cost per run over the whole suite is 3 % and 6 %
  lower on Fable and Sonnet, 11 % higher on Opus, where the one-file cases
  weigh more.
- The root-cause rule depends on the model. On Fable and Opus,
  `shared-bug` is fixed in the shared function in 3 runs out of 3 with the
  plugin against 0 without; on Sonnet all runs patched the caller instead,
  arguing that the two other callers already pass numbers. Since 0.6.1 the
  rule says "even if other callers look safe", and Sonnet fixes the shared
  function in 3 runs out of 3 with the plugin, 0 without.
  `keep-validation` shows the same pattern: on Fable and Opus the runs
  without the plugin dropped a check or overstated what they kept.
- Honest misses, with or without the plugin, on all three models: on
  `date-picker` and `url-parse` the answer stayed longer than the output
  rule asks. On Opus with the plugin, `explain-bug` loses a grader in 3
  runs out of 3: the explanation is complete, but it no longer says where
  a fix would go, which the case asks for. The output rule cut a sentence
  the question needed. Fixed in 0.6.0: a question gets a full answer,
  including where a fix would go, and the case passes 3 runs out of 3.
  `date-picker` and `url-parse` passed in 0.6.1 on Opus once the output
  rule forbade pasting back the code just written and allowed one caveat.
  In 0.6.1 `url-parse` passes on Sonnet and in 2 runs out of 3 on Fable,
  `date-picker` passes on Fable; on Sonnet `date-picker` failed in both
  arms, and the answers said why: a `max` attribute set to today's date
  that nobody asked for, then two caveats about it. 0.6.3 adds "no unasked
  max or min" to the ticket rule and "in one sentence, no bullet list" to
  the caveat rule, and splits the grader: a regex now checks the file for
  `max`, `min`, `pattern` or `placeholder` (it seemed to pass 3 runs out of
  3 in both arms on Sonnet and Opus; 0.9.0 found that the case file carried
  a backspace byte where the regex meant a word boundary, so the check never
  matched until then, and Sonnet's baseline in fact adds `max` in every
  run), and the short-answer judge only measures
  the message: 8 lines at most, no bullets, two sentences of caveat at
  most. That last criterion still failed in both arms on both models: the
  models reported what they did not verify and whether the field should be
  required, three sentences where the rule asks one. 0.6.5 first rewrote
  the criterion as countable elements (four sentences at most, no offer of
  a script or of another change to the form), and the plugin arm still
  scored 0.90 on each model: the misses were a `skipped: min/max` line and
  a sentence saying no min or max was added, both read as offers. It then
  rewrote the output rule: three sentences at most, one caveat only if it changes what
  the user does next, no offer and no skipped line for what the ticket
  never asked. `date-picker` now passes 3 runs out of 3 with the plugin on
  Sonnet and Opus, 0 without. On `url-parse` the plugin arm answered in
  three sentences, but "I have not run it" plus "it throws on an invalid
  URL" counted as two side notes where the judge allows one. Saying the code
  was not run is what Claude Code asks when there is no shell, so the
  criterion no longer counts it as the side note. Remeasured on that case
  alone: 3 runs out of 3 with the plugin on Sonnet and Opus; without it, 1
  on Sonnet (two caveats, or all three links) and 0 on Opus (code block,
  bullets).

Every case grades correctness as well as size: a shorter answer that is
wrong scores zero. `keep-validation` asks to simplify a handler at a trust
boundary and fails if any check disappears; `explain-bug` asks a question
and fails if the explanation is cut short; `vat-country` and `csv-export`
fail if an existing test or an untouched module changes.

