#!/usr/bin/env node
// Agentic benchmark: one headless Claude Code session per (task, arm, run) on a
// fresh clone of a pinned public repo, scored on the diff it leaves behind.
// Usage: node run.mjs --target <pristine clone> [--caveman <plugin dir>]
//        [--arms baseline,crewcut,caveman,yagni] [--tasks id,id] [--runs 2]
//        [--model haiku] [-j 3] [--check]
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const target = arg('--target');
if (!target) { console.error('--target <pristine clone> is required'); process.exit(2); }
const caveman = arg('--caveman');
const crewcut = join(here, '..', '..');
const arms = arg('--arms', 'baseline,crewcut,yagni' + (caveman ? ',caveman' : '')).split(',');
const runs = Number(arg('--runs', 2));
const model = arg('--model', 'haiku');
const jobs = Number(arg('-j', 3));
const check = process.argv.includes('--check');
const spec = JSON.parse(readFileSync(join(here, 'tasks.json'), 'utf8'));
const wanted = arg('--tasks');
const tasks = spec.tasks.filter((t) => !wanted || wanted.split(',').includes(t.id));
const pluginDir = { baseline: null, crewcut, caveman, yagni: null };
// The seven-word control from ponytail's benchmark (Colin Eberhardt, ponytail issue 126).
const YAGNI = 'Follow YAGNI principles, and prefer one-liner solutions.';

const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

function session(cwd, prompt, arm) {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--model', model,
    '--setting-sources', 'project,local', '--no-session-persistence', '--max-turns', '40',
    '--allowedTools', 'Read', 'Edit', 'Write', 'MultiEdit', 'Glob', 'Grep'];
  if (pluginDir[arm]) args.push('--plugin-dir', pluginDir[arm]);
  if (arm === 'yagni') args.push('--append-system-prompt', JSON.stringify(YAGNI));
  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { cwd, shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', () => {
      const events = out.split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const result = events.find((e) => e.type === 'result');
      if (!result) return reject(new Error(`no result event (${arm}): ${err.slice(-400)}`));
      const tools = {};
      for (const e of events) {
        if (e.type !== 'assistant') continue;
        for (const b of e.message?.content || []) if (b.type === 'tool_use') tools[b.name] = (tools[b.name] || 0) + 1;
      }
      const init = events.find((e) => e.type === "system" && e.subtype === "init");
      const plugins = (init?.plugins || []).filter((p) => p.path !== "builtin").map((p) => `${p.name}@${p.version || "?"}`);
      resolve({ result, tools, plugins });
    });
    child.stdin.end(prompt);
  });
}

function diffStats(cwd) {
  sh('git', ['add', '-A'], cwd);
  const lines = sh('git', ['diff', '--cached', '--numstat'], cwd).trim().split(/\r?\n/).filter(Boolean);
  let added = 0;
  let removed = 0;
  const files = [];
  for (const l of lines) {
    const [a, r, f] = l.split('\t');
    added += Number(a) || 0;
    removed += Number(r) || 0;
    files.push(f);
  }
  const newFiles = sh('git', ['diff', '--cached', '--name-only', '--diff-filter=A'], cwd).trim().split(/\r?\n/).filter(Boolean);
  return { added, removed, files, newFiles };
}

async function cell(task, arm, run) {
  const ws = mkdtempSync(join(tmpdir(), 'crewcut-bench-'));
  try {
    sh('git', ['clone', '-q', target, ws]);
    const t0 = Date.now();
    const { result, tools } = await session(ws, task.ticket, arm);
    const diff = diffStats(ws);
    const u = result.usage || {};
    return {
      task: task.id,
      arm,
      run,
      ...diff,
      tools,
      turns: result.num_turns,
      costUsd: result.total_cost_usd,
      seconds: Math.round((Date.now() - t0) / 1000),
      tokensIn: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0),
      tokensOut: u.output_tokens || 0,
      error: result.is_error ? String(result.result) : null,
      answer: String(result.result || '').slice(0, 2000),
    };
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
}

async function pool(items, worker) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await worker(items[k]);
      const r = out[k];
      console.error(`  done ${r.task} ${r.arm} #${r.run}: +${r.added} loc, ${r.turns} turns, ${(r.costUsd || 0).toFixed(3)} USD`);
    }
  }));
  return out;
}

if (check) {
  // Isolation: each arm must load exactly its own plugin and nothing else (builtins aside).
  for (const arm of arms) {
    const ws = mkdtempSync(join(tmpdir(), 'crewcut-bench-'));
    sh('git', ['clone', '-q', target, ws]);
    const { plugins } = await session(ws, 'Reply with the word ok.', arm);
    console.log(`${arm}: plugins loaded = ${plugins.join(', ') || 'none'}${arm === 'yagni' ? ', system prompt appended' : ''}`);
    rmSync(ws, { recursive: true, force: true });
  }
  process.exit(0);
}

const cells = [];
for (const task of tasks) for (const arm of arms) for (let run = 1; run <= runs; run++) cells.push({ task, arm, run });
console.error(`${cells.length} sessions: ${tasks.length} tasks x ${arms.length} arms x ${runs} runs, model ${model}, -j ${jobs}`);
const started = new Date().toISOString();
const results = await pool(cells, (c) => cell(c.task, c.arm, c.run));

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const rows = [];
for (const task of tasks) {
  for (const arm of arms) {
    const rs = results.filter((r) => r.task === task.id && r.arm === arm && !r.error);
    if (!rs.length) continue;
    rows.push({
      task: task.id,
      arm,
      n: rs.length,
      loc: mean(rs.map((r) => r.added)),
      newFiles: mean(rs.map((r) => r.newFiles.length)),
      reads: mean(rs.map((r) => r.tools.Read || 0)),
      turns: mean(rs.map((r) => r.turns)),
      tokens: mean(rs.map((r) => r.tokensIn + r.tokensOut)),
      cost: mean(rs.map((r) => r.costUsd)),
      seconds: mean(rs.map((r) => r.seconds)),
    });
  }
}
const out = { startedAt: started, model, repo: spec.repo, commit: spec.commit, arms, runs, rows, results };
mkdirSync(join(here, 'results'), { recursive: true });
const file = join(here, 'results', `${started.replace(/[:.]/g, '-')}-${model}.json`);
writeFileSync(file, JSON.stringify(out, null, 2));
console.log('\n| task | arm | n | LOC added | new files | Read | turns | tokens | cost USD | s |');
console.log('|---|---|--:|--:|--:|--:|--:|--:|--:|--:|');
for (const r of rows) {
  console.log(`| ${r.task} | ${r.arm} | ${r.n} | ${r.loc.toFixed(0)} | ${r.newFiles.toFixed(1)} | ${r.reads.toFixed(1)} | ${r.turns.toFixed(1)} | ${Math.round(r.tokens / 1000)}k | ${r.cost.toFixed(3)} | ${r.seconds.toFixed(0)} |`);
}
const errors = results.filter((r) => r.error);
if (errors.length) console.log(`\n${errors.length} errored session(s): ${errors.map((e) => `${e.task}/${e.arm}#${e.run}`).join(', ')}`);
console.log(`\nraw: ${file}`);
