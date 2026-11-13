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
one run out of three), 1.00 against 0.81 on Opus. With crewcut 0.12.0
(2026-11-13, Claude Code 2.1.323) and the codebase map at session start:
Sonnet 0.96 against 0.86, 4.5 turns against 6.2 (-27 %), 0.061 against
0.064 USD (-5 %); Opus 0.97 against 0.80, 4.9 turns against 5.7, 0.106
against 0.104 USD. The same seven cases the same day with the map off:
Sonnet 0.97, 4.7 turns, 0.060 USD; Opus 0.99, 5.0 turns, 0.107 USD. The
map adds 56 to 115 tokens where the fixture has source files and nothing on
the one-file cases, and the totals move within noise either way: it trims
reads and turns on `vat-country` (Sonnet 1.0 file against 1.3, 5.7 turns
against 6.0; Opus 6.3 turns against 7.3) and the one-file cases, where it
is empty, lose a run on `date-picker` and `explain-bug` in one draw and not
in the other. Its case is a repository of hundreds of files, outside this
suite. With crewcut 0.13.0 (2026-11-13, Claude Code 2.1.323), the Modern
line pointed at the official docs, the comment line and the `~` marker:
Sonnet 0.99 against 0.87, 4.5 turns against 6.0 (-25 %), 0.057 USD in both
arms; Opus 1.00 against 0.81, 5.2 turns against 5.6, 0.106 against 0.101
USD. No case grades the three rules themselves: the measure shows nothing
was lost. The map on Next-js-Boilerplate (115 files, three tickets, four
runs, Sonnet, crewcut arm): 11.4 turns with the map against 11.5 without,
29 lines against 30, 245k tokens against 264k, 0.208 against 0.211 USD:
within noise on a repository this size. With crewcut 0.14.0 (2026-11-13,
Claude Code 2.1.323), shorter skill descriptions and the declared versions
at session start, on four models: Fable 5.2 0.99 against 0.82, 4.4 turns
against 6.1, 0.211 against 0.214 USD; Opus 5.5 1.00 against 0.81, 5.2 turns
against 5.7, 0.105 against 0.102 USD; Sonnet 5.5 0.98 against 0.86, 4.4
turns against 6.2, 0.059 USD in both arms; Haiku 5.5 0.96 against 0.79, 5.4
turns against 7.0, 0.012 against 0.021 USD. `shared-bug` is fixed in the
shared function in 3 runs out of 3 with the plugin on all four, 0 without.
Haiku misses `short-answer` on `date-picker` in all three runs with the
plugin, and the reuse of the money helper once on `csv-export`. With
crewcut 0.15.0 (2026-11-13, Claude Code 2.1.323), the rule that names what
a change could expose or destroy for users and six tightened wordings:
Sonnet 0.99 against 0.85, 4.5 turns against 6.2, 0.060 against 0.063 USD;
Opus 0.98 against 0.79, 5.3 turns against 5.8, 0.109 against 0.106 USD.
Nothing was lost on the seven cases; the rule itself is measured on
ponytail 5's benchmark, in `benchmarks/agentic/RESULTS.md`.

## The owner's rules as graders, Opus as judge (crewcut 0.15.3, 2026-11-13)

Twenty-four graders added to the seven cases, for the rules that had none:
no long dash, curly quote, arrow, symbol or emoji in the last message
(`plain-text-answer`, every case) or in the edited file
(`plain-text-in-code`); the word crewcut nowhere in the edited file
(`no-crewcut-in-code`); no block comment and no two comment lines in a row
(`comments-one-line`, three cases); every comment gives a reason
(`comments-say-why`, judged, two cases). The first four are regular
expressions: free, and the same on every run.

The judge is now Opus 5.5 (`--judge-model opus`), on every judged grader,
old and new. Scores before this section were judged by Sonnet and had fewer
graders: they do not compare with these.

| Model | Score with | without | Turns with | without | Session cost with | without |
|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.98 | 0.87 | 4.4 | 6.1 | 0.202 USD | 0.193 USD |
| Opus 5.5 | 1.00 | 0.80 | 5.3 | 6.0 | 0.092 USD | 0.089 USD |
| Sonnet 5.5 | 0.99 | 0.88 | 4.6 | 6.0 | 0.045 USD | 0.042 USD |
| Haiku 5.5 | 0.98 | 0.87 | 5.6 | 6.9 | 0.003 USD | 0.003 USD |

Seven cases, three runs, Claude Code 2.1.323, no out-of-usage run, 23.33 USD
with the judge. One Opus run without the plugin failed to start on
`explain-bug` (a process spawn error) and has no grader.

**The cost column changed meaning.** The harness reports one cost per run
that includes the judge. Every "cost per run" published before this section
carried it: about 0.01 to 0.02 USD with Sonnet as judge, more without the
plugin because longer answers cost more to judge. On Haiku that was most of
the figure: 0.012 against 0.021 USD was 0.003 against 0.003 USD of session.
The column above is the session alone. On these small cases the plugin
costs the same or a little more per session (its ruleset is read on every
turn) and saves turns.

**What the new graders show.** With the plugin, every model passes all of
them, but for one Haiku answer with a banned character. Without it:

| Grader, runs passed without the plugin | Fable | Opus | Sonnet | Haiku |
|---|--:|--:|--:|--:|
| plain-text-answer | 18 / 21 | 18 / 20 | 21 / 21 | 18 / 21 |
| comments-say-why | 6 / 6 | 3 / 6 | 6 / 6 | 6 / 6 |

The three other graders pass in every run of both arms: no model writes a
banned character in code, a block comment or the plugin's name on these
cases. They are guards for the day a ruleset or a model changes that. No
grader covers "current practice" (it needs a case built on an API that
changed between two versions) nor the commit rules (the sessions have no
shell).

## An eighth case for "current practice": zod-email (crewcut 0.15.5, 2026-11-13)

The rule "follow the installed versions' current docs" had no case. This
one has a manifest that declares zod 4 and a signup schema with two fields;
the ticket asks for an email field. Zod 4 made the string formats top-level
calls and deprecated the chained method: `z.email()` is current,
`z.string().email()` is the habit. Nothing in the file shows the current
form. Ten graders, all regular expressions: the current call is there, no
chained `.email(` is, the two fields are untouched, no file, no dependency,
plus the plain text guards.

| Model | Score with | without | Current API with | without | Turns with | without |
|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 1.00 | 1.00 | 3 / 3 | 3 / 3 | 4.0 | 5.0 |
| Opus 5.5 | 1.00 | 1.00 | 3 / 3 | 3 / 3 | 3.3 | 4.0 |
| Sonnet 5.5 | 1.00 | 0.80 | 3 / 3 | 0 / 3 | 3.0 | 3.0 |
| Haiku 5.5 | 1.00 | 0.80 | 3 / 3 | 0 / 3 | 3.3 | 3.0 |

Three runs per arm, 1.61 USD. Fable and Opus write for zod 4 on their own.
Sonnet and Haiku write the deprecated form in every run without the plugin
and the current one in every run with it.

**Rule or versions line?** The session start also carries "Versions this
project declares: zod ^4.1.5", added in 0.14.0 without a measure. With that
line taken out of a local copy of the hook, and the trace checked to prove
it was gone, the plugin arm writes the current form in 2 runs out of 3 on
Sonnet and 2 out of 3 on Haiku. So the rule does most of it and the line
closes the gap: 4 out of 6 without it, 12 out of 12 with it, 0 out of 6
with no plugin. Three runs per cell: an indication, not a measure.

`CREWCUT_MAP=off` in the shell does not reach the hook during
`claude plugin eval`: a first attempt at this control still had the line
in every trace. Check the trace before reading an ablation of the map.

The table of the previous section is over the seven older cases; the next
full measure counts eight.

## Eight cases (crewcut 0.15.6, 2026-11-13)

| Model | Score with | without | Turns with | without | Session cost with | without |
|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.98 | 0.89 | 4.3 | 6.0 | 0.197 USD | 0.189 USD |
| Opus 5.5 | 0.99 | 0.86 | 4.8 | 5.7 | 0.089 USD | 0.086 USD |
| Sonnet 5.5 | 0.99 | 0.87 | 4.4 | 5.6 | 0.043 USD | 0.040 USD |
| Haiku 5.5 | 0.98 | 0.86 | 5.3 | 6.4 | 0.003 USD | 0.003 USD |

This table is not a new run. It joins the seven cases of the section before
last and `zod-email`, measured two hours apart on the same day, with the
same judge, the same Claude Code and the same plugin code: between crewcut
0.15.3 and 0.15.6 only the version string, the examples, the README and the
eval cases changed, none of which reaches a session. One case was run
again: `explain-bug` on Opus, whose first measure had lost a run without
the plugin to a process spawn error; with three runs its score without the
plugin is higher, which is most of the move from 0.80 to 0.86 on that row.
48 runs per model, none in error, none out of usage.

With the plugin, what still fails: on Fable, `date-picker` `short-answer`
twice and `shared-bug` `root-cause-stated` three times (the fix is in the
shared function in every run, the judge wants the cause said more plainly);
on Opus and Sonnet, `explain-bug` `full-explanation` once each; on Haiku,
`date-picker` `short-answer` three times and one banned character in an
answer.

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

## A ninth case for long text and comments: explain-retry (crewcut 0.15.7, 2026-11-13)

On the older cases the plain text and comment graders passed almost
everywhere, in both arms: short tasks do not invite long prose or comment
blocks. This case does. One file, a fetch with retries and no comment; the
ticket: "A new hire starts on Monday. Explain in your answer how
fetchWithRetry in src/retry.js works, step by step, and add the comments
the code needs." Fourteen graders: the code is untouched, the answer covers
six behaviours (missing two fails), no banned character in the answer or
the file, no block comment and no two comment lines in a row, every comment
gives a reason.

| Runs passed, with / without the plugin | Fable | Opus | Sonnet | Haiku |
|---|--:|--:|--:|--:|
| Score | 1.00 / 0.79 | 0.94 / 0.70 | 0.88 / 0.73 | 0.88 / 0.70 |
| full-explanation | 3 / 3 | 3 / 3 | 3 / 3 | 3 / 3 |
| plain-text-answer | 3 / 0 | 3 / 0 | 1 / 0 | 3 / 0 |
| comments-one-line | 3 / 0 | 3 / 0 | 3 / 0 | 2 / 0 |
| comments-say-why | 3 / 2 | 1 / 0 | 1 / 0 | 0 / 0 |

Three runs per arm, 4.46 USD with the judge. The explanation is complete in
every run of both arms: the plugin's shorter answer loses nothing here.

**Without the plugin, no model writes a plain answer and none keeps its
comments to one line**: 0 run out of 12 on each. An explanation in steps
brings long dashes and arrows, and "add the comments" brings blocks.

**With the plugin, two weak spots.** Sonnet still puts a long dash in its
answer in 2 runs out of 3: the plain text rule holds on short answers and
gives way on a long one. And `comments-say-why` passes in 5 runs out of 12
with the plugin. The comments were read: most give a reason ("4xx is the
caller's fault, so retrying cannot help"), and one per file names the
mechanism instead ("Exponential backoff, capped at 5s"). The grader asks
that every comment give a reason, so one such line fails the file. That is
what "why only" says; the rule is not yet followed to the letter.

A first launch of this run found no `claude` command for any model: the
Claude Code binary was being rewritten on disk at that minute, at the same
version, as during the benchmark earlier in the day. No session had
started; the run was launched again.

## Nine cases (crewcut 0.15.7, 2026-11-13)

| Model | Score with | without | Turns with | without | Session cost with | without |
|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.98 | 0.88 | 4.3 | 5.7 | 0.203 USD | 0.192 USD |
| Opus 5.5 | 0.99 | 0.85 | 4.7 | 5.4 | 0.090 USD | 0.087 USD |
| Sonnet 5.5 | 0.98 | 0.86 | 4.4 | 5.3 | 0.044 USD | 0.041 USD |
| Haiku 5.5 | 0.97 | 0.84 | 5.2 | 6.0 | 0.003 USD | 0.003 USD |

As for the eight-case table, this joins measures of the same day on the
same plugin code: the eight cases and `explain-retry`. 54 runs per model,
none in error.

## Two rules reworded on explain-retry (crewcut 0.16.0, 2026-11-13)

`explain-retry` showed two rules giving way with the plugin on: Sonnet kept
a long dash in 2 answers out of 3, and one comment per file named the
mechanism instead of the reason. Three wordings were tried, five runs per
model, plugin arm only, the traces kept and read.

| Wording | Sonnet, plain answer | Sonnet, comments why | Haiku, comments why |
|---|--:|--:|--:|
| 0.15.8: "long dash (write -)" and "why only, one plain line" | 1 / 3 | 1 / 3 | 0 / 3 |
| "em or en dash", "gives the reason; never what the code does" | 2 / 5 | 0 / 5 | 0 / 5 |
| the same, "only a reason the code cannot show; in doubt, none" | 3 / 5 | 3 / 5 | 0 / 5 |
| the same, "(write -, ranges too: 0-100)" and "never a summary of what a function or a line does" | 5 / 5 | 5 / 5 | 4 / 5 |

The traces gave the two levers. Sonnet's dash was not in its prose but in a
range of numbers, "0 to 100 ms" written with an en dash: naming the case in
the rule ended it. Haiku opened each function with a comment that sums it
up: forbidding the summary ended that. Naming the dash "em or en" and
asking for "the reason" did nothing on their own.

The two lines as shipped, a little tighter than the last row:

    Plain text only, long answers too: no emoji, arrow (write ->), em or en dash (write -, 0-100 too) or curly quotes.
    Comments: only a reason the code cannot show, one plain line; never a summary of a function or a line; in doubt, none.

They take the ruleset from 598 to 628 estimated tokens at its heaviest
level, over the 600 ceiling the test held. Nothing could be cut elsewhere
without touching a wording already measured, so the ceiling is now 630.

The nine cases with the plugin, three runs, Opus as judge. The arm without
the plugin does not see the ruleset: it is the one of the previous section.

| Model | Score with | was | without | Turns with | without | Session cost with | without |
|---|--:|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.99 | 0.98 | 0.88 | 4.6 | 5.7 | 0.201 USD | 0.192 USD |
| Opus 5.5 | 1.00 | 0.99 | 0.85 | 5.0 | 5.4 | 0.093 USD | 0.087 USD |
| Sonnet 5.5 | 1.00 | 0.98 | 0.86 | 4.5 | 5.3 | 0.044 USD | 0.041 USD |
| Haiku 5.5 | 0.98 | 0.97 | 0.84 | 5.1 | 6.0 | 0.003 USD | 0.003 USD |

No case lost ground beyond one grader in one run. On `explain-retry`, the
plugin now scores 1.00 on Opus and Sonnet and 0.97 on Haiku. Sonnet passes
every grader of every case. What still fails with the plugin: Fable,
`date-picker` `short-answer` twice and `shared-bug` `root-cause-stated`
twice; Opus, `csv-export` `root-cause-stated` once; Haiku, five graders
once each. 12.42 USD for this table, 7.09 USD for the three trials. Six
Fable runs did not start (a process spawn error, twice that day already)
and their two cases were run again.

## The cause of a bug in the answer (crewcut 0.17.0, 2026-11-13)

Three graders kept failing with the plugin on. Read side by side, the
failing and the passing answers gave two different stories.

On `shared-bug` and `csv-export`, `root-cause-stated` failed when the
answer described the fix and left the cause to be inferred: "formatPrice
now converts numeric strings to numbers". The ruleset asked for "what
changed, where" and nothing more, and Fable, the model that holds the
three sentences most strictly, spent them on the fix and two caveats. The
Output line now reads "what changed (a bug: its cause first), where".

| Plugin arm, `root-cause-stated` | Before | After |
|---|--:|--:|
| Fable 5.2, `shared-bug` | 1 / 3 | 5 / 5 |
| Opus 5.5, `csv-export` | 2 / 3 | 5 / 5 |

On `date-picker`, every `short-answer` failure carried the same
sentence: the field was made required like the others, "drop required if
it should be optional". The passing answers made the same choice and said
it as a fact, or did not say it. The grader was written against offers of
a script or of a computed max date; naming a choice the ticket left open
and how to undo it is not one, so the grader now allows it. This is a
change of the measure, not of the plugin, and the arm without the plugin
was run again on that case with the new grader.

The clause takes the ruleset to 634 estimated tokens at its heaviest
level; the ceiling goes from 630 to 640.

The nine cases with the plugin, three runs, Opus as judge. The arm without
the plugin is the one of the earlier sections, `date-picker` excepted.

| Model | Score with | was | without | Turns with | without | Session cost with | without |
|---|--:|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 1.00 | 0.99 | 0.88 | 4.6 | 5.7 | 0.203 USD | 0.192 USD |
| Opus 5.5 | 1.00 | 1.00 | 0.84 | 4.8 | 5.4 | 0.092 USD | 0.087 USD |
| Sonnet 5.5 | 0.97 | 1.00 | 0.86 | 4.3 | 5.3 | 0.043 USD | 0.041 USD |
| Haiku 5.5 | 0.97 | 0.98 | 0.84 | 5.2 | 6.0 | 0.003 USD | 0.003 USD |

Fable and Opus pass every grader of every run. Sonnet and Haiku came out
lower than in the previous section, so both were run a second time, with
the new wording and with the one of 0.16.0:

| Score with the plugin, nine cases, three runs | 0.16.0 wording | 0.17.0 wording |
|---|--:|--:|
| Sonnet 5.5, first suite | 1.00 | 0.97 |
| Sonnet 5.5, second suite | 0.97 | 0.98 |
| Haiku 5.5, first suite | 0.98 | 0.97 |
| Haiku 5.5, second suite | 0.99 | 0.99 |

The same graders fail under both wordings: on Sonnet `explain-bug`
`full-explanation` and `url-parse` `short-answer`, twice each in a
suite, when the session reads one file less. The spread between two suites
of the same wording is as wide as the gap between the wordings: a suite of
three runs does not separate 0.97 from 1.00 on these two models, and the
1.00 published for Sonnet in 0.16.0 was the high end of that spread. Three
cases checked on five runs with the new wording: Sonnet `explain-bug` 4
out of 5, Haiku `csv-export` 4 out of 5, Haiku `explain-bug` 5 out of 5.

About 26 USD in all. Three Sonnet runs did not start in the first suite
(the same process spawn error) and their two cases were run again.
