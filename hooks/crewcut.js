'use strict';
// crewcut hook: keeps the active level and injects the ruleset for it.

const fs = require('fs');
const os = require('os');
const path = require('path');

const LEVELS = ['off', 'lite', 'full', 'ultra'];
const REVIEW = 'review'; // session-only state entered by the review and audit skills
const DEFAULT_LEVEL = 'full';
const LANGUAGES = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ko: 'Korean', zh: 'Simplified Chinese' };
const LEVEL_FILE = 'crewcut-mode';
const CONFIG_FILE = 'crewcut.json';
const NUDGE_FILE = 'crewcut-nudged';
const RULESET_FILE = path.join(__dirname, 'ruleset.md');
const STATUSLINE_FILE = path.join(__dirname, 'statusline.js');
const STATUSLINE_COPY = 'crewcut-statusline.js';
const SETTINGS_FILE = 'settings.json';
const STDIN_GRACE_MS = 1000; // never hang a session on a stdin that never closes
const OFF_PHRASES = ['stop crewcut', 'normal mode'];
const COMMAND = /^\/crewcut(?::crewcut)?(?:\s+(\S+)(?:\s+(\S+))?(?:\s.*)?)?$/;
const READ_ONLY_SKILL = /^\/crewcut(?::crewcut)?-(review|audit)(?:\s.*)?$/;
const TAG = /^\[(lite|full|ultra)\]\s?/;
const KEEP_LEVEL_SOURCES = ['resume', 'compact'];
const BOM = 0xfeff;

const REVIEW_RULES = 'CREWCUT ACTIVE - level: review. Read-only: report findings, change no file, run no '
  + 'command that writes. Back to coding with /crewcut off|lite|full|ultra.';

function normalize(prompt) {
  if (typeof prompt !== 'string') return '';
  return prompt.trim().toLowerCase().replace(/[\s.!?]+$/, '');
}

function parseCommand(prompt) {
  const text = normalize(prompt);
  if (OFF_PHRASES.includes(text)) return { command: 'set', level: 'off' };
  if (READ_ONLY_SKILL.test(text)) return { command: 'review' };
  const match = COMMAND.exec(text);
  if (!match) return null;
  const [, first, second] = match;
  if (first === 'default' && LEVELS.includes(second)) return { command: 'default', level: second };
  if (first === 'subagents' && (second === 'on' || second === 'off')) {
    return { command: 'subagents', enabled: second === 'on' };
  }
  if (first === 'uninstall' && !second) return { command: 'uninstall' };
  if (first === 'lang' && Object.hasOwn(LANGUAGES, second)) return { command: 'lang', language: second };
  if (LEVELS.includes(first)) return { command: 'set', level: first };
  return { command: 'status' };
}

function renderRuleset(level, markdown) {
  if (level === 'off') return '';
  if (level === REVIEW) return REVIEW_RULES;
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

function readJson(file) {
  try {
    const value = JSON.parse(stripBom(fs.readFileSync(file, 'utf8')));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function readConfig(dir) {
  return readJson(path.join(dir, CONFIG_FILE));
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

// Built-in agents that never touch code: no ruleset unless a matcher asks for them.
const NO_CODE_AGENTS = /^(claude-code-guide|statusline-setup)$/i;

// Regex that limits subagent injection to matching agent types; empty means all.
function subagentMatcher(env, dir) {
  const source = env.CREWCUT_SUBAGENT_MATCHER !== undefined
    ? env.CREWCUT_SUBAGENT_MATCHER
    : readConfig(dir).subagentMatcher;
  if (typeof source !== 'string' || source.trim() === '') return null;
  try {
    return new RegExp(source, 'i');
  } catch {
    return null; // a broken pattern never silences the rules
  }
}

// Removes everything the plugin wrote next to the Claude settings.
function uninstall(dir) {
  const removed = [];
  for (const name of [LEVEL_FILE, NUDGE_FILE, STATUSLINE_COPY, CONFIG_FILE]) {
    try {
      fs.unlinkSync(path.join(dir, name));
      removed.push(name);
    } catch {
      // not there: nothing to remove
    }
  }
  try {
    const file = path.join(dir, SETTINGS_FILE);
    const settings = readJson(file);
    const command = settings.statusLine && String(settings.statusLine.command || '');
    if (command && command.includes(STATUSLINE_COPY)) {
      delete settings.statusLine;
      fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
      removed.push('statusLine in ' + SETTINGS_FILE);
    }
  } catch {
    // unreadable settings: left alone
  }
  return removed;
}

function configuredLanguage(dir) {
  const code = readConfig(dir).language;
  return Object.hasOwn(LANGUAGES, code) ? code : 'en';
}

function languageLine(code) {
  return `Language: write every reply to the user in ${LANGUAGES[code]}; code and commits follow the project.`;
}

// English adds nothing, so the measured ruleset stays unchanged by default.
function withLanguage(rules, dir) {
  const code = configuredLanguage(dir);
  return rules && code !== 'en' ? `${rules}\n${languageLine(code)}` : rules;
}

// One-time question at the first session; English is stored so it is never asked again.
function languageOffer(dir) {
  if (readConfig(dir).language !== undefined) return '';
  writeConfig(dir, { language: 'en' });
  const choices = Object.entries(LANGUAGES).map(([code, name]) => `${name} (${code})`).join(', ');
  return `Language, once: ask the user, in one line, which language crewcut should reply in: ${choices}. `
    + `On any but English, set "language" to its code in ${path.join(dir, CONFIG_FILE)} `
    + 'and reply in it from then on. Never ask again.';
}

function readLevel(dir) {
  try {
    const text = fs.readFileSync(path.join(dir, LEVEL_FILE), 'utf8').trim().toLowerCase();
    return LEVELS.includes(text) || text === REVIEW ? text : null;
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
    return renderRuleset(level, level === REVIEW ? '' : fs.readFileSync(RULESET_FILE, 'utf8'));
  } catch {
    return '';
  }
}

// The status line script lives in the config dir under a stable name, because
// the plugin cache path carries the version and changes on every update.
function statuslineCopy(dir) {
  return path.join(dir, STATUSLINE_COPY);
}

function refreshStatuslineCopy(dir) {
  try {
    const source = fs.readFileSync(STATUSLINE_FILE, 'utf8');
    const copy = statuslineCopy(dir);
    let current = null;
    try {
      current = fs.readFileSync(copy, 'utf8');
    } catch {
      // no copy yet
    }
    if (current !== source) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(copy, source);
    }
  } catch {
    // best effort: the status line keeps its last copy
  }
}

// One-time offer to show the level in the status line, when none is configured.
function statuslineNudge(dir) {
  try {
    if (readJson(path.join(dir, 'settings.json')).statusLine) return '';
    const flag = path.join(dir, NUDGE_FILE);
    if (fs.existsSync(flag)) return '';
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(flag, '');
    refreshStatuslineCopy(dir);
    const command = `node "${statuslineCopy(dir)}"`;
    return 'Statusline, once: crewcut can show its level in the status line. Offer the user, in one '
      + `line, to add to ${path.join(dir, 'settings.json')}: "statusLine": { "type": "command", `
      + `"command": ${JSON.stringify(command)} }. Do it only on a yes; never mention it again.`;
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

// An eval run starts from a fresh config dir with nobody to answer the offer.
function isEvalRun(env) {
  const value = String(env.CLAUDE_CODE_EVAL_CONFINED || '').trim().toLowerCase();
  return value !== '' && value !== '0' && value !== 'false';
}

function onSession(input, env, dir) {
  // resume and compact continue a session: keep the level the user chose
  const keep = KEEP_LEVEL_SOURCES.includes(input.source);
  const level = (keep && readLevel(dir)) || defaultLevel(env, dir);
  if (!keep) writeLevel(dir, level);
  const rules = withLanguage(loadRuleset(level), dir);
  if (!rules) return '';
  if (!keep && fs.existsSync(statuslineCopy(dir))) refreshStatuslineCopy(dir);
  const offers = keep || isEvalRun(env) ? [] : [languageOffer(dir), statuslineNudge(dir)];
  return envelope('SessionStart', [rules, ...offers].filter(Boolean).join('\n\n'));
}

function onSubagent(input, env, dir) {
  if (readConfig(dir).subagents === false) return '';
  const matcher = subagentMatcher(env, dir);
  const agentType = typeof input.agent_type === 'string' ? input.agent_type.trim() : '';
  if (matcher ? agentType && !matcher.test(agentType) : NO_CODE_AGENTS.test(agentType)) return '';
  const level = readLevel(dir) || defaultLevel(env, dir);
  return envelope('SubagentStart', loadRuleset(level));
}

function onPrompt(input, env, dir) {
  const command = parseCommand(input.prompt);
  if (!command) return '';
  if (command.command === 'status') {
    const level = readLevel(dir) || defaultLevel(env, dir);
    const text = `crewcut: ${level} (default: ${defaultLevel(env, dir)}; levels: ${LEVELS.join(', ')}; `
      + `language: ${configuredLanguage(dir)})`;
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
  if (command.command === 'lang') {
    writeConfig(dir, { language: command.language });
    return envelope('UserPromptSubmit', `crewcut: language ${command.language}\n\n${languageLine(command.language)}`);
  }
  if (command.command === 'uninstall') {
    const removed = uninstall(dir);
    const what = removed.length ? `removed ${removed.join(', ')}` : 'nothing to remove';
    return envelope('UserPromptSubmit', `crewcut: ${what}. Tell the user to finish with /plugin remove crewcut.`);
  }
  const level = command.command === 'review' ? REVIEW : command.level;
  writeLevel(dir, level);
  const rules = withLanguage(loadRuleset(level), dir);
  const text = rules ? `crewcut: ${level}\n\n${rules}` : `crewcut: ${level}`;
  return envelope('UserPromptSubmit', text);
}

function run(mode, stdinText, env) {
  const input = parseInput(stdinText);
  if (!input) return '';
  const dir = configDir(env);
  if (mode === 'session') return onSession(input, env, dir);
  if (mode === 'subagent') return onSubagent(input, env, dir);
  if (mode === 'prompt') return onPrompt(input, env, dir);
  return '';
}

function main() {
  if (process.argv[2] === 'uninstall') {
    const removed = uninstall(configDir(process.env));
    process.stdout.write((removed.length ? 'removed ' + removed.join(', ') : 'nothing to remove') + '\n');
    return;
  }
  let text = '';
  let done = false;
  const finish = (exitAfter) => {
    if (done) return;
    done = true;
    const output = run(process.argv[2], text, process.env);
    const after = exitAfter ? () => process.exit(0) : undefined;
    if (!output) {
      if (after) after();
      return;
    }
    try {
      process.stdout.write(output + '\n', after);
    } catch {
      if (after) after(); // closed stdout: nothing to do
    }
  };
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { text += chunk; });
  process.stdin.on('error', () => finish(true));
  process.stdout.on('error', () => {});
  process.stdin.on('end', () => finish(false));
  // A shell wrapper can swallow the end of stdin; run with what arrived instead of hanging.
  setTimeout(() => finish(true), STDIN_GRACE_MS).unref();
}

module.exports = {
  LEVELS, LANGUAGES, DEFAULT_LEVEL, parseCommand, renderRuleset, configDir,
  readLevel, writeLevel, readConfig, writeConfig, defaultLevel, run, subagentMatcher, uninstall,
};

if (require.main === module) main();
