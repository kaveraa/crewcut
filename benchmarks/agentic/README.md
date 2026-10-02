# Agentic benchmark

A real agent doing real work: one headless Claude Code session per (task,
arm, run) on a fresh clone of a pinned public repository, scored on the diff
it leaves behind. The baseline is the same agent with no plugin, so any
difference is the plugin's effect, not a chatty bare model.

- Repository: [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)
  (MIT), pinned in `tasks.json`. Next 16, React 19, Drizzle, zod,
  react-hook-form: forms to over-build on the front, CRUD on the back.
- Tasks: one-line tickets in `tasks.json`, written for this benchmark. Two
  kinds: `over-build room` (the agent chooses how much to build) and
  `surgical room` (one handler, little room, does minimizing drop a check).
- Arms, the same controls as ponytail's agentic benchmark: `baseline` (no
  plugin), `crewcut` (this checkout as `--plugin-dir`), `caveman` (a checkout
  of JuliusBrussee/caveman as `--plugin-dir`: terse prose, builds normally,
  so it tells brevity apart from the lazy-code discipline), `yagni` (the
  seven-word prompt "Follow YAGNI principles, and prefer one-liner
  solutions." appended to the system prompt, no plugin).
- Isolation: `--setting-sources project,local` keeps the user's installed
  plugins out of every arm; exactly one plugin is loaded per arm. `--check`
  reads the session init event and prints which plugins each arm loaded.
- Tools: Read, Edit, Write, MultiEdit, Glob, Grep. No shell: agents write
  code, they do not install or run it. 40 turns at most.
- Metrics per session: lines added in `git diff`, files created, Read calls,
  turns, tokens (input, cache and output), cost in USD, wall time.

## Run

```
git clone https://github.com/ixartz/Next-js-Boilerplate target && git -C target checkout <commit from tasks.json>
git clone https://github.com/JuliusBrussee/caveman caveman
node run.mjs --target target --caveman caveman --check
node run.mjs --target target --caveman caveman --runs 4 --model haiku -j 3
```

Raw results land in `results/` (ignored by git); the summary table prints at
the end. Cost: about 0.16 USD per session on Haiku 4.5.
