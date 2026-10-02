#!/usr/bin/env node
// Draw "the cut": per task, the baseline bar hatched, the crewcut bar solid on top,
// the controls as thin strands underneath. Reads means.json, writes a static SVG that
// follows the viewer's colour scheme (prefers-color-scheme, works inside <img>).
// Usage: node chart.mjs results/<run>/means.json ../../assets/benchmark-cut.svg
import { readFileSync, writeFileSync } from 'node:fs';

const [, , input, output, key = 'features'] = process.argv;
if (!input || !output) { console.error('usage: node chart.mjs <means.json> <out.svg> [key]'); process.exit(2); }
const features = JSON.parse(readFileSync(input, 'utf8'))[key];
const names = { datepicker: 'date picker', colorpicker: 'color picker', command: 'command palette', rating: 'star rating', bulkdelete: 'bulk delete',
  csv: 'CSV export', get: 'GET count', reset: 'reset count', log: 'increment log' };
const label = (t) => { const k = t.replace(/^(tmpl|next)-(fe|be)-/, ''); return names[k] || k; };
const order = ['datepicker', 'colorpicker', 'dropzone', 'wizard', 'rating', 'command',
  'archive', 'search', 'csv', 'bulkdelete', 'duplicate', 'count', 'get', 'reset', 'pagination', 'log'];
const tasks = Object.keys(features.rows).sort((a, b) => order.indexOf(a.replace(/^(tmpl|next)-(fe|be)-/, '')) - order.indexOf(b.replace(/^(tmpl|next)-(fe|be)-/, '')));
const max = Math.max(...tasks.flatMap((t) => Object.values(features.rows[t]).map((a) => a.src_loc)));
const scale = Math.ceil(max / 50) * 50;

const W = 920, x0 = 150, x1 = 700, rowH = 58, top = 56;
const H = top + tasks.length * rowH + 40;
const sx = (v) => x0 + (v / scale) * (x1 - x0);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let s = '';
const add = (line) => { s += line + '\n'; };

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Lines added per task: the baseline bar hatched, the crewcut bar solid, caveman and the yagni prompt as thin lines">`);
add(`<title>Lines added per task, Claude Code on Haiku 4.5, four runs per cell</title>`);
add(`<style>
  text { font: 12px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: #52514e; }
  .t { fill: #0b0b0b; font-weight: 600; font-size: 13px; }
  .v { fill: #0b0b0b; font-variant-numeric: tabular-nums; }
  .pct { fill: #0b0b0b; font-weight: 700; font-size: 15px; }
  .hatch { stroke: #8a8985; }
  .frame { stroke: #8a8985; fill: none; }
  .cut { stroke: #0b0b0b; }
  .crewcut { fill: #2a78d6; } .caveman { stroke: #eb6834; } .yagni { stroke: #1baf7a; }
  .onbar { fill: #ffffff; font-weight: 600; }
  @media (prefers-color-scheme: dark) {
    text { fill: #c3c2b7; } .t, .v, .pct { fill: #ffffff; }
    .cut { stroke: #ffffff; } .crewcut { fill: #3987e5; } .caveman { stroke: #d95926; } .yagni { stroke: #199e70; }
  }
</style>`);
add(`<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatch" x1="0" y1="0" x2="0" y2="8" stroke-width="2"/></pattern></defs>`);
add(`<text x="${x0}" y="22" class="t">Lines added per task, mean of 4 runs</text>`);
add(`<text x="${x0}" y="40">hatched: what the baseline wrote and crewcut did not. Thin lines: caveman (orange) and the yagni prompt (green).</text>`);

tasks.forEach((t, i) => {
  const r = features.rows[t], y = top + i * rowH, b = r.baseline.src_loc, c = r.crewcut.src_loc;
  const pct = Math.round((c / b - 1) * 100);
  add(`<text x="${x0 - 12}" y="${y + 17}" text-anchor="end" class="t">${esc(label(t))}</text>`);
  add(`<rect x="${x0}" y="${y}" width="${(sx(b) - x0).toFixed(1)}" height="26" rx="5" fill="url(#hatch)"/>`);
  add(`<rect x="${x0}" y="${y}" width="${(sx(b) - x0).toFixed(1)}" height="26" rx="5" class="frame"/>`);
  add(`<rect x="${x0}" y="${y}" width="${(sx(c) - x0).toFixed(1)}" height="26" rx="5" class="crewcut"/>`);
  add(`<line x1="${sx(c).toFixed(1)}" x2="${sx(c).toFixed(1)}" y1="${y - 6}" y2="${y + 32}" class="cut" stroke-width="2" stroke-dasharray="3 3"/>`);
  if (sx(c) - x0 > 86) add(`<text x="${x0 + 8}" y="${y + 17}" class="onbar">crewcut ${Math.round(c)}</text>`);
  else add(`<text x="${sx(c) + 6}" y="${y - 9}" class="v">crewcut ${Math.round(c)}</text>`);
  add(`<text x="${(Math.max(sx(b), sx(c)) + 8).toFixed(1)}" y="${y + 17}" class="v">baseline ${Math.round(b)}</text>`);
  add(`<text x="${x1 + 150}" y="${y + 17}" text-anchor="end" class="pct">${pct > 0 ? '+' : ''}${pct} %</text>`);
  [['caveman', r.caveman.src_loc], ['yagni', r['yagni-oneliner'].src_loc]].forEach(([a, v], k) => {
    const yy = y + 34 + k * 7;
    add(`<line x1="${x0}" x2="${sx(v).toFixed(1)}" y1="${yy}" y2="${yy}" class="${a}" stroke-width="3" stroke-linecap="round"/>`);
  });
});
add(`<text x="${x1 + 150}" y="${H - 14}" text-anchor="end">crewcut against the baseline; a negative number is code not written</text>`);
add('</svg>');
writeFileSync(output, s);
console.log(`wrote ${output} (${tasks.length} tasks, scale ${scale} lines)`);
