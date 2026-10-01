'use strict';
// crewcut statusline: prints the level, the model and the working directory.
// Standalone on purpose: the hook copies this file next to the Claude settings
// so the status line command keeps working across plugin updates.
// Claude Code pipes its status JSON on stdin; every field is optional here.

const fs = require('fs');
const os = require('os');
const path = require('path');

const LEVELS = ['off', 'lite', 'full', 'ultra', 'review'];

function configDir(env) {
  return env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function readText(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  } catch {
    return '';
  }
}

function level(env) {
  const dir = configDir(env);
  const stored = readText(path.join(dir, 'crewcut-mode')).trim().toLowerCase();
  if (LEVELS.includes(stored)) return stored;
  const fromEnv = String(env.CREWCUT_DEFAULT_MODE || '').trim().toLowerCase();
  if (LEVELS.includes(fromEnv) && fromEnv !== 'review') return fromEnv;
  try {
    const fromFile = String(JSON.parse(readText(path.join(dir, 'crewcut.json'))).defaultLevel || '').toLowerCase();
    if (LEVELS.includes(fromFile) && fromFile !== 'review') return fromFile;
  } catch {
    // no usable config file
  }
  return 'full';
}

function render(input, env) {
  const parts = [`crewcut: ${level(env)}`];
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
