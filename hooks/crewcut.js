'use strict';
// crewcut hook: keeps the active level and injects the ruleset for it.

const fs = require('fs');
const os = require('os');
const path = require('path');

const LEVELS = ['off', 'lite', 'full', 'ultra'];
const DEFAULT_LEVEL = 'full';
const LEVEL_FILE = 'crewcut-mode';
const CONFIG_FILE = 'crewcut.json';
const RULESET_FILE = path.join(__dirname, 'ruleset.md');
const OFF_PHRASES = ['stop crewcut', 'normal mode'];
const COMMAND = /^\/crewcut(?::crewcut)?(?:\s+(\S+)(?:\s+(\S+))?(?:\s.*)?)?$/;
const TAG = /^\[(lite|full|ultra)\]\s?/;
const KEEP_LEVEL_SOURCES = ['resume', 'compact'];
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
  const [, first, second] = match;
  if (first === 'default' && LEVELS.includes(second)) return { command: 'default', level: second };
  if (first === 'subagents' && (second === 'on' || second === 'off')) {
    return { command: 'subagents', enabled: second === 'on' };
  }
  if (LEVELS.includes(first)) return { command: 'set', level: first };
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

function stripBom(text) {
  return text.charCodeAt(0) === BOM ? text.slice(1) : text;
}

function readConfig(dir) {
  try {
    const value = JSON.parse(stripBom(fs.readFileSync(path.join(dir, CONFIG_FILE), 'utf8')));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeConfig(dir, fields) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const merged = { ...readConfig(dir), ...fields };
    fs.writeFileSync(path.join(dir, CONFIG_FILE), JSON.stringify(merged, null, 2) + '\n');
  } catch {
    // best effort: without a config file the defaults apply
  }
}

function defaultLevel(env, dir) {
  const fromEnv = String(env.CREWCUT_DEFAULT_MODE || '').trim().toLowerCase();
  if (LEVELS.includes(fromEnv)) return fromEnv;
  const fromFile = String(readConfig(dir).defaultLevel || '').trim().toLowerCase();
  return LEVELS.includes(fromFile) ? fromFile : DEFAULT_LEVEL;
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
    const value = JSON.parse(stripBom(String(text)));
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function envelope(eventName, text) {
  if (!text) return '';
  return JSON.stringify({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } });
}

function onSession(input, env, dir) {
  // resume and compact continue a session: keep the level the user chose
  const keep = KEEP_LEVEL_SOURCES.includes(input.source);
  const level = (keep && readLevel(dir)) || defaultLevel(env, dir);
  if (!keep) writeLevel(dir, level);
  return envelope('SessionStart', loadRuleset(level));
}

function onSubagent(env, dir) {
  if (readConfig(dir).subagents === false) return '';
  const level = readLevel(dir) || defaultLevel(env, dir);
  return envelope('SubagentStart', loadRuleset(level));
}

function onPrompt(input, env, dir) {
  const command = parseCommand(input.prompt);
  if (!command) return '';
  if (command.command === 'status') {
    const level = readLevel(dir) || defaultLevel(env, dir);
    const text = `crewcut: ${level} (default: ${defaultLevel(env, dir)}; levels: ${LEVELS.join(', ')})`;
    return envelope('UserPromptSubmit', text);
  }
  if (command.command === 'default') {
    writeConfig(dir, { defaultLevel: command.level });
    return envelope('UserPromptSubmit', `crewcut: default ${command.level}`);
  }
  if (command.command === 'subagents') {
    writeConfig(dir, { subagents: command.enabled });
    return envelope('UserPromptSubmit', `crewcut: subagents ${command.enabled ? 'on' : 'off'}`);
  }
  writeLevel(dir, command.level);
  const rules = loadRuleset(command.level);
  const text = rules ? `crewcut: ${command.level}\n\n${rules}` : `crewcut: ${command.level}`;
  return envelope('UserPromptSubmit', text);
}

function run(mode, stdinText, env) {
  const input = parseInput(stdinText);
  if (!input) return '';
  const dir = configDir(env);
  if (mode === 'session') return onSession(input, env, dir);
  if (mode === 'subagent') return onSubagent(env, dir);
  if (mode === 'prompt') return onPrompt(input, env, dir);
  return '';
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

module.exports = {
  LEVELS, DEFAULT_LEVEL, parseCommand, renderRuleset, configDir,
  readLevel, writeLevel, readConfig, writeConfig, run,
};

if (require.main === module) main();
