'use strict';
// crewcut statusline: prints the level, the model and the working directory.
// Claude Code pipes its status JSON on stdin; every field is optional here.

const path = require('path');
const { configDir, readLevel, defaultLevel } = require('./crewcut.js');

function render(input, env) {
  const dir = configDir(env);
  const parts = [`crewcut: ${readLevel(dir) || defaultLevel(env, dir)}`];
  const model = input && input.model && input.model.display_name;
  if (model) parts.push(String(model));
  const cwd = input && input.workspace && input.workspace.current_dir;
  if (cwd) parts.push(path.basename(String(cwd).replace(/[\\/]+$/, '')) || String(cwd));
  return parts.join(' | ');
}

function main() {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { text += chunk; });
  process.stdin.on('error', () => {});
  process.stdout.on('error', () => {});
  process.stdin.on('end', () => {
    let input = null;
    try {
      input = JSON.parse(text);
    } catch {
      // no status JSON: print the level alone
    }
    process.stdout.write(render(input, process.env) + '\n');
  });
}

module.exports = { render };

if (require.main === module) main();
