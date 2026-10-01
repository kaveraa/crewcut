# crewcut

Short hair, short code. A Claude Code plugin that spends fewer tokens:
the simplest code that works, short answers, few tool calls, and no cut on
safety.

## Measured

Not measured yet. The table below is filled from
`claude plugin eval . --ablation with-without` once the first run is in.

| Case            | Tokens without | Tokens with | Delta |
| --------------- | -------------- | ----------- | ----- |
| date-picker     |                |             |       |
| url-parse       |                |             |       |
| shared-bug      |                |             |       |
| keep-validation |                |             |       |
| explain-bug     |                |             |       |

Every case grades correctness as well as size: a shorter answer that is
wrong scores zero. `keep-validation` asks to simplify a handler at a trust
boundary and fails if any check disappears; `explain-bug` asks a question
and fails if the explanation is cut short.

## The ladder

Claude takes the lowest rung that holds:

1. Needs to exist at all? If not, skip it and say so in one line.
2. Already in this codebase? Reuse it.
3. Standard library does it? Use it.
4. Platform does it natively (HTML, CSS, SQL, OS)? Use it.
5. An installed dependency does it? Use it. Never add one for what a few
   lines do.
6. One line? One line.
7. Only then: the minimum that works.

Bug fix means root cause: find every caller, fix the shared function once.

## Install

From the marketplace:

```
/plugin marketplace add kaveraa/crewcut
/plugin install crewcut@crewcut
```

From a local checkout, for one session:

```
claude --plugin-dir /path/to/crewcut
```

The hooks run `node`, so Node 22 or newer must be on the PATH of the shell
that starts Claude Code. Without it, only the skills work and nothing is
injected at session start.

## Commands and levels

| Command           | Effect                                                |
| ----------------- | ----------------------------------------------------- |
| `/crewcut`        | Show the current level                                |
| `/crewcut off`    | Silence the plugin for this session                   |
| `/crewcut lite`   | Output discipline and a light reading habit           |
| `/crewcut full`   | Default. Output, reading, writing and tool discipline |
| `/crewcut ultra`  | Full, plus one-line answers and no new file or dependency without an explicit request |
| `/crewcut-review` | Read-only review of a diff, see below                 |

A new session starts at `full`; a resumed session and a context compaction
keep the level you chose. Set `CREWCUT_DEFAULT_MODE` to `off`, `lite`, `full`
or `ultra` to change that default. Typing `stop crewcut` or `normal mode` as
a whole message also switches the plugin off.

## Token discipline

- Output: no preamble, no restating the request, no recap, no unrequested
  explanation. Code first.
- Reading: only what the change touches; grep before cat; a line range before
  a whole file; never re-read a file.
- Writing: targeted edits, never a whole-file rewrite; no unrequested tests,
  docs or refactors; one test run at the end.
- Tools: batch independent calls; never print large outputs; no subagent for
  what one read answers.

## Never cut

Validation at trust boundaries, handling that prevents data loss, security,
accessibility basics, existing tests, and anything you explicitly asked for.
Simple is not negligent.

Short never means wrong. A question you ask gets a full answer, a failing
test is fixed and rerun, and a file that changed since the last read is read
again. Fewer tokens is the goal only when the answer stays right.

## /crewcut-review

`/crewcut-review` reviews the uncommitted changes; `/crewcut-review main..HEAD`
or `/crewcut-review src/a.js src/b.js` narrows the scope. A read-only agent
reports one line per finding:

```
src/signup.js:42: stdlib hand-written email check (18 lines) -> one call to the platform email validator
cut: 17 lines
```

The rung names where the code should have stopped: `skip`, `reuse`, `stdlib`,
`native`, `installed`, `one-line`, or `prose` for unrequested comments and
docs. The review changes nothing.

## Limitations

- The hooks need `node` on the PATH.
- The level is stored per user, so concurrent sessions share it.
- Claude Code only.

## Credits

Inspired by ponytail by Dietrich Gebert.

## License

MIT
