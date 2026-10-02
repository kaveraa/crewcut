#!/usr/bin/env node
// Grouped bars: each arm's mean as a percent of the no-plugin baseline across LOC,
// tokens, cost and time, plus the safety tier as a line of text. Static SVG, colours
// follow prefers-color-scheme so it reads on a light or dark README.
// Usage: node chart-bars.mjs <features results.json> <safety results.json> <out.svg> [title]
import { readFileSync, writeFileSync } from 'node:fs';

const [, , featPath, safePath, output, title = 'Every metric vs the no-plugin baseline (Claude Code, Haiku 4.5, 12 tasks)'] = process.argv;
if (!featPath || !safePath || !output) { console.error('usage: node chart-bars.mjs <features.json> <safety.json> <out.svg> [title]'); process.exit(2); }
const load = (p) => { const raw = JSON.parse(readFileSync(p, 'utf8')); return Array.isArray(raw) ? raw : raw.results; };
const feat = load(featPath), safe = load(safePath);
const arms = ['baseline', 'caveman', 'crewcut', 'yagni-oneliner'];
const metrics = [
  { key: 'LOC', get: (r) => r.src_loc || 0, fmt: (v) => `${Math.round(v)}` },
  { key: 'tokens', get: (r) => (r.in_tokens || 0) + (r.out_tokens || 0) + (r.cache_tokens || 0), fmt: (v) => `${Math.round(v / 1000)}k` },
  { key: 'cost', get: (r) => r.cost || 0, fmt: (v) => `$${v.toFixed(2)}`, only: (r) => r.cost != null },
  { key: 'time', get: (r) => (r.duration_ms || 0) / 1000, fmt: (v) => `${Math.round(v)}s` },
];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const cells = (rs, arm, m) => rs.filter((r) => r.arm === arm && (!m.only || m.only(r)));
const pct = {}; const base = {};
for (const m of metrics) {
  base[m.key] = mean(cells(feat, 'baseline', m).map(m.get));
  pct[m.key] = Object.fromEntries(arms.map((a) => [a, Math.round(100 * mean(cells(feat, a, m).map(m.get)) / base[m.key])]));
}
const safePct = Object.fromEntries(arms.map((a) => { const c = safe.filter((r) => r.arm === a); return [a, Math.round(100 * mean(c.map((r) => r.safe || 0)))]; }));
const nSafeTasks = new Set(safe.map((r) => r.task)).size;

const W = 860, plotTop = 60, plotBottom = 360, x0 = 85, x1 = 815, groupW = 180, barW = 30, gap = 8;
const maxPct = Math.max(125, ...metrics.flatMap((m) => arms.map((a) => pct[m.key][a])));
const top = Math.ceil(maxPct / 25) * 25;
const sy = (p) => plotBottom - (p / top) * (plotBottom - plotTop);
const cls = { baseline: 'base', caveman: 'caveman', crewcut: 'crewcut', 'yagni-oneliner': 'yagni' };
let s = '';
const add = (l) => { s += l + '\n'; };
add(`<svg viewBox="0 0 ${W} 490" width="${W}" height="490" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${arms.map((a) => `${a}: LOC ${pct.LOC[a]}%, tokens ${pct.tokens[a]}%, cost ${pct.cost[a]}%, time ${pct.time[a]}%, safe ${safePct[a]}%`).join('; ')}">`);
add(`<title>${title}</title>`);
add(`<style>
  text { font: 12px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: #52514e; }
  .ink { fill: #0b0b0b; } .grid { stroke: #8a8985; } .base { fill: #8a8985; }
  .crewcut { fill: #2a78d6; } .caveman { fill: #eb6834; } .yagni { fill: #1baf7a; } .bad { fill: #e34948; }
  text.crewcut, text.caveman, text.yagni, text.base, text.bad { fill: inherit; }
  @media (prefers-color-scheme: dark) {
    text { fill: #c3c2b7; } .ink { fill: #ffffff; } .grid { stroke: #8a8985; } .base { fill: #8a8985; }
    .crewcut { fill: #3987e5; } .caveman { fill: #d95926; } .yagni { fill: #199e70; } .bad { fill: #e66767; }
  }
</style>`);
add(`<text x="${W / 2}" y="24" font-size="15" font-weight="600" text-anchor="middle" class="ink">${title}</text>`);
let lx = 212;
for (const a of arms) { add(`<rect x="${lx}" y="38" width="12" height="12" rx="2" class="${cls[a]}"/><text x="${lx + 17}" y="48">${a}</text>`); lx += a.length * 7 + 40; }
add(`<text x="32" y="${(plotTop + plotBottom) / 2}" text-anchor="middle" transform="rotate(-90 32 ${(plotTop + plotBottom) / 2})">% of baseline (lower is leaner)</text>`);
for (let p = 0; p <= top; p += 25) {
  const dash = p === 100 ? ' stroke-dasharray="4 4" stroke-opacity="0.6"' : ` stroke-opacity="${p === 0 ? 0.6 : 0.18}"`;
  add(`<line x1="${x0}" y1="${sy(p).toFixed(1)}" x2="${x1}" y2="${sy(p).toFixed(1)}" class="grid"${dash}/>`);
  add(`<text x="${x0 - 7}" y="${(sy(p) + 4).toFixed(1)}" font-size="11" text-anchor="end">${p}%</text>`);
}
metrics.forEach((m, i) => {
  const gx = x0 + 23 + i * groupW;
  arms.forEach((a, j) => {
    const p = pct[m.key][a], x = gx + j * (barW + gap), y = sy(p);
    add(`<rect x="${x}" y="${y.toFixed(1)}" width="${barW}" height="${(plotBottom - y).toFixed(1)}" rx="2" class="${cls[a]}"/>`);
    add(`<text x="${x + barW / 2}" y="${(y - 5).toFixed(1)}" font-size="10" text-anchor="middle" class="${cls[a]}"${a === 'crewcut' ? ' font-weight="600"' : ''}>${p}%</text>`);
  });
  const cx = gx + (arms.length * (barW + gap) - gap) / 2;
  add(`<text x="${cx}" y="${plotBottom + 20}" font-size="13" text-anchor="middle">${m.key}</text>`);
  add(`<text x="${cx}" y="${plotBottom + 35}" font-size="10" text-anchor="middle" opacity="0.8">base ${m.fmt(base[m.key])}</text>`);
});
add(`<text x="20" y="418" font-size="11" opacity="0.85">Each bar is that arm's mean over all cells as a percent of the no-plugin baseline (the gray 100% bars). Lower is leaner, cheaper, faster.</text>`);
add(`<line x1="20" y1="438" x2="${x1}" y2="438" class="grid" stroke-opacity="0.25"/>`);
add(`<text x="20" y="460" font-size="11" opacity="0.9">Safety, separate ${nSafeTasks}-task adversarial tier (path traversal, SQL injection, token forgery, malformed input, rate limit). Higher is safer:</text>`);
let sx = 90;
for (const a of arms) {
  const p = safePct[a], bad = p < 100;
  add(`<text x="${sx}" y="478" class="${cls[a]}"${a === 'crewcut' ? ' font-weight="600"' : ''}>${a} ${bad ? `<tspan class="bad" font-weight="600">${p}%</tspan>` : `${p}%`}</text>`);
  sx += 140 + (a.length > 9 ? 20 : 0);
}
add('</svg>');
writeFileSync(output, s);
console.log(`wrote ${output}`, JSON.stringify({ pct, safe: safePct }));
