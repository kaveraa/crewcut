'use strict';
// crewcut hook: keeps the active level and injects the ruleset for it.

const fs = require('fs');
const os = require('os');
const path = require('path');

const LEVELS = ['off', 'lite', 'full', 'ultra'];
const DEFAULT_LEVEL = 'full';
const LEVEL_FILE = 'crewcut-mode';
const RULESET_FILE = path.join(__dirname, 'ruleset.md');
const OFF_PHRASES = ['stop crewcut', 'normal mode'];
const COMMAND = /^\/crewcut(?::crewcut)?(?:\s+(\S+)(?:\s.*)?)?$/;
const KEEP_LEVEL_SOURCES = ['resume', 'compact'];
const TAG = /^\[(lite|full|ultra)\]\s?/;
const BOM = 0xfeff;

function normalize(prompt) {
  if (typeof prompt !== 'string') return '';
  return prompt.trim().toLowerCase().replace(/[\s.!?]+$/, '');
}

function parseCommand(prompt) {
  const text = normalize(prompt);
  if (OFF_PHRASES.includes(text)) return { command: 'set', level: 'off' };
  const match = COMMAND.exec(text);
  if (!match) return null;
  if (match[1] && LEVELS.includes(match[1])) return { command: 'set', level: match[1] };
  return { command: 'status' };
}

function renderRuleset(level, markdown) {
  if (level === 'off') return '';
  const kept = [];
  for (const line of String(markdown).split(/\r?\n/)) {
    const tag = TAG.exec(line);
    if (!tag) kept.push(line);
    else if (tag[1] === level) kept.push(line.slice(tag[0].length));
  }
  return kept.join('\n').replace(/\{level\}/g, level).trim();
}

function configDir(env) {
  return env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function defaultLevel(env) {
  const wanted = String(env.CREWCUT_DEFAULT_MODE || '').trim().toLowerCase();
  return LEVELS.includes(wanted) ? wanted : DEFAULT_LEVEL;
}

function readLevel(dir) {
  try {
    const text = fs.readFileSync(path.join(dir, LEVEL_FILE), 'utf8').trim().toLowerCase();
    return LEVELS.includes(text) ? text : null;
  } catch {
    return null;
  }
}

function writeLevel(dir, level) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, LEVEL_FILE), level + '\n');
  } catch {
    // best effort: a missing level file only means the default applies
  }
}

function loadRuleset(level) {
  try {
    return renderRuleset(level, fs.readFileSync(RULESET_FILE, 'utf8'));
  } catch {
    return '';
  }
}

function parseInput(text) {
  try {
    const raw = String(text);
    const value = JSON.parse(raw.charCodeAt(0) === BOM ? raw.slice(1) : raw);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function envelope(eventName, text) {
  if (!text) return '';
  return JSON.stringify({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } });
}

function run(mode, stdinText, env) {
  const input = parseInput(stdinText);
  if (!input) return '';
  const dir = configDir(env);
  if (mode === 'session') {
    // resume and compact continue a session: keep the level the user chose
    const keep = KEEP_LEVEL_SOURCES.includes(input.source);
    const level = (keep && readLevel(dir)) || defaultLevel(env);
    if (!keep) writeLevel(dir, level);
    return envelope('SessionStart', loadRuleset(level));
  }
  if (mode !== 'prompt') return '';
  const command = parseCommand(input.prompt);
  if (!command) return '';
  if (command.command === 'status') {
    const level = readLevel(dir) || defaultLevel(env);
    return envelope('UserPromptSubmit', `crewcut: ${level} (levels: ${LEVELS.join(', ')})`);
  }
  writeLevel(dir, command.level);
  const rules = loadRuleset(command.level);
  const text = rules ? `crewcut: ${command.level}\n\n${rules}` : `crewcut: ${command.level}`;
  return envelope('UserPromptSubmit', text);
}

function main() {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { text += chunk; });
  process.stdin.on('error', () => {});
  process.stdout.on('error', () => {});
  process.stdin.on('end', () => {
    const output = run(process.argv[2], text, process.env);
    if (output) {
      try {
        process.stdout.write(output + '\n');
      } catch {
        // closed stdout: nothing to do
      }
    }
  });
}

module.exports = { LEVELS, DEFAULT_LEVEL, parseCommand, renderRuleset, configDir, readLevel, writeLevel, run };

if (require.main === module) main();
