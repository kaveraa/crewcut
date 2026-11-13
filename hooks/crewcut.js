'use strict';
// crewcut hook: keeps the active level and injects the ruleset for it.

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const LEVELS = ['off', 'lite', 'full', 'ultra'];
const DEFAULT_LEVEL = 'full';
const LANGUAGES = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ko: 'Korean', zh: 'Simplified Chinese' };
const LEVEL_FILE = 'crewcut-mode'; // shared copy, read by the status line
const LEVELS_DIR = 'crewcut-levels'; // one file per project, keyed by its path
const CONFIG_FILE = 'crewcut.json';
const NUDGE_FILE = 'crewcut-nudged';
const RULESET_FILE = path.join(__dirname, 'ruleset.md');
const MAP_FILE = path.join(__dirname, 'map.js');
const MAP_TIMEOUT_MS = 3000; // the map is a bonus: never hold the rules for it
const MATCHER_TIMEOUT_MS = 100; // a pathological pattern must not stall the hook
const STATUSLINE_FILE = path.join(__dirname, 'statusline.js');
const STATUSLINE_COPY = 'crewcut-statusline.js';
const SETTINGS_FILE = 'settings.json';
const STDIN_GRACE_MS = 1000; // never hang a session on a stdin that never closes
const OFF_PHRASES = ['stop crewcut', 'normal mode'];
const COMMAND = /^\/crewcut(?::crewcut)?(?:\s+(\S+)(?:\s+(\S+))?(?:\s.*)?)?$/;
const TAG = /^\[(lite|full|ultra|markers|tests|notests)\]\s?/;
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
  if (['markers', 'tests', 'test', 'map'].includes(first) && (second === 'on' || second === 'off')) {
    return { command: first === 'test' ? 'tests' : first, enabled: second === 'on' };
  }
  if (first === 'uninstall' && !second) return { command: 'uninstall' };
  if (first === 'lang' && Object.hasOwn(LANGUAGES, second)) return { command: 'lang', language: second };
  if (LEVELS.includes(first)) return { command: 'set', level: first };
  return { command: 'status' };
}

// options.markers keeps the [markers] line: the ~ comment on a cut
// corner, off by default because models put it on plain comments too.
function renderRuleset(level, markdown, options = {}) {
  if (level === 'off') return '';
  const holds = {
    markers: options.markers === true,
    tests: options.tests !== false,
    notests: options.tests === false,
  };
  const kept = [];
  for (let line of String(markdown).split(/\r?\n/)) {
    let keep = true;
    for (let tag = TAG.exec(line); tag; tag = TAG.exec(line)) {
      keep &&= tag[1] === level || holds[tag[1]] === true;
      line = line.slice(tag[0].length);
    }
    if (keep) kept.push(line);
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
    fs.rmSync(path.join(dir, LEVELS_DIR), { recursive: true });
    removed.push(LEVELS_DIR);
  } catch {
    // no per-project levels
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

// One-time question at the first session; on is stored so it is never asked again.
function testsOffer(dir) {
  if (readConfig(dir).tests !== undefined) return '';
  writeConfig(dir, { tests: true });
  return 'Tests, once: ask the user, in one line, whether crewcut should keep extending the test file that '
    + 'covers the code it touches (on, the default) or write a test only when the ticket asks (off: on Opus, '
    + '-50 % tokens and -53 % cost against -40 % and -43 % with tests on, same lines). '
    + `On off, set "tests" to false in ${path.join(dir, CONFIG_FILE)}. Never ask again.`;
}

// Claude Code names the project in CLAUDE_PROJECT_DIR: the level lives per
// project, so two sessions in two repositories stop overwriting each other.
// The shared file is still written for the status line (last write wins).
function levelFiles(dir, env = {}) {
  const files = [];
  const project = String(env.CLAUDE_PROJECT_DIR || '').trim();
  if (project) {
    const key = crypto.createHash('sha256').update(path.resolve(project)).digest('hex').slice(0, 24);
    files.push(path.join(dir, LEVELS_DIR, key));
  }
  files.push(path.join(dir, LEVEL_FILE));
  return files;
}

function readLevel(dir, env = {}) {
  for (const file of levelFiles(dir, env)) {
    try {
      const text = fs.readFileSync(file, 'utf8').trim().toLowerCase();
      if (LEVELS.includes(text)) return text;
    } catch {
      // not there: try the next file
    }
  }
  return null;
}

function writeLevel(dir, level, env = {}) {
  for (const file of levelFiles(dir, env)) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, level + '\n');
    } catch {
      // best effort: a missing level file only means the default applies
    }
  }
}

function rulesetOptions(dir, env) {
  const config = readConfig(dir);
  const tests = env.CREWCUT_TESTS === 'off' ? false : env.CREWCUT_TESTS === 'on' ? true : config.tests !== false;
  return { markers: config.markers === true, tests };
}

function loadRuleset(level, options) {
  try {
    return renderRuleset(level, fs.readFileSync(RULESET_FILE, 'utf8'), options);
  } catch {
    return '';
  }
}

// The codebase map: what the project already defines, so "reuse it" costs no
// search. On by default; CREWCUT_MAP=off or "map": false in the config drops it.
function mapEnabled(env, dir) {
  const fromEnv = String(env.CREWCUT_MAP || '').trim().toLowerCase();
  if (['off', '0', 'false'].includes(fromEnv)) return false;
  if (['on', '1', 'true'].includes(fromEnv)) return true;
  return readConfig(dir).map !== false;
}

function codebaseMap(env) {
  const root = String(env.CLAUDE_PROJECT_DIR || '').trim() || process.cwd();
  try {
    return execFileSync(process.execPath, [MAP_FILE, root], {
      encoding: 'utf8', timeout: MAP_TIMEOUT_MS, maxBuffer: 64 * 1024, stdio: ['ignore', 'pipe', 'ignore'], env,
    }).trim();
  } catch {
    return ''; // no map is never a reason to hold the rules
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
  const level = (keep && readLevel(dir, env)) || defaultLevel(env, dir);
  if (!keep) writeLevel(dir, level, env);
  const rules = withLanguage(loadRuleset(level, rulesetOptions(dir, env)), dir);
  if (!rules) return '';
  if (!keep && fs.existsSync(statuslineCopy(dir))) refreshStatuslineCopy(dir);
  const map = mapEnabled(env, dir) ? codebaseMap(env) : '';
  const offers = keep || isEvalRun(env) ? [] : [languageOffer(dir), testsOffer(dir), statuslineNudge(dir)];
  return envelope('SessionStart', [rules, map, ...offers].filter(Boolean).join('\n\n'));
}

// A user pattern runs under a time limit: one that backtracks forever would
// otherwise hold the hook, and a doubt injects the rules rather than not.
function matches(matcher, agentType) {
  try {
    return vm.runInNewContext('re.test(s)', { re: matcher, s: agentType }, { timeout: MATCHER_TIMEOUT_MS });
  } catch {
    return true;
  }
}

function onSubagent(input, env, dir) {
  if (readConfig(dir).subagents === false) return '';
  const matcher = subagentMatcher(env, dir);
  const agentType = typeof input.agent_type === 'string' ? input.agent_type.trim() : '';
  if (matcher ? agentType && !matches(matcher, agentType) : NO_CODE_AGENTS.test(agentType)) return '';
  const level = readLevel(dir, env) || defaultLevel(env, dir);
  return envelope('SubagentStart', loadRuleset(level, rulesetOptions(dir, env)));
}

function onPrompt(input, env, dir) {
  const command = parseCommand(input.prompt);
  if (!command) return '';
  if (command.command === 'status') {
    const level = readLevel(dir, env) || defaultLevel(env, dir);
    const text = `crewcut: ${level} (default: ${defaultLevel(env, dir)}; levels: ${LEVELS.join(', ')}; `
      + `language: ${configuredLanguage(dir)}; tests: ${rulesetOptions(dir, env).tests ? 'on' : 'off'}; `
      + `map: ${mapEnabled(env, dir) ? 'on' : 'off'})`;
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
  if (command.command === 'markers' || command.command === 'tests') {
    writeConfig(dir, { [command.command]: command.enabled });
    const state = `crewcut: ${command.command} ${command.enabled ? 'on' : 'off'}`;
    const rules = loadRuleset(readLevel(dir, env) || defaultLevel(env, dir), rulesetOptions(dir, env));
    return envelope('UserPromptSubmit', rules ? `${state}\n\n${rules}` : state);
  }
  if (command.command === 'map') {
    writeConfig(dir, { map: command.enabled });
    const state = `crewcut: map ${command.enabled ? 'on' : 'off'}`;
    const map = command.enabled ? codebaseMap(env) : '';
    return envelope('UserPromptSubmit', map ? `${state}\n\n${map}` : state);
  }
  if (command.command === 'uninstall') {
    const removed = uninstall(dir);
    const what = removed.length ? `removed ${removed.join(', ')}` : 'nothing to remove';
    return envelope('UserPromptSubmit', `crewcut: ${what}. Tell the user to finish with /plugin remove crewcut.`);
  }
  const level = command.level;
  writeLevel(dir, level, env);
  const rules = withLanguage(loadRuleset(level, rulesetOptions(dir, env)), dir);
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
  // The write is synchronous and the exit explicit: an asynchronous write can
  // die with the process on a pipe, and a timer left unreferenced never fires
  // on a stdin that stays open.
  const finish = () => {
    if (done) return;
    done = true;
    const output = run(process.argv[2], text, process.env);
    if (output) {
      try {
        fs.writeSync(1, output + '\n');
      } catch {
        // closed stdout: nothing to do
      }
    }
    process.exit(0);
  };
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { text += chunk; });
  process.stdin.on('error', finish);
  process.stdin.on('end', finish);
  // A shell wrapper can swallow the end of stdin; run with what arrived instead of hanging.
  setTimeout(finish, STDIN_GRACE_MS);
}

module.exports = {
  LEVELS, LANGUAGES, DEFAULT_LEVEL, parseCommand, renderRuleset, configDir,
  readLevel, writeLevel, levelFiles, readConfig, writeConfig, defaultLevel, run, subagentMatcher, uninstall,
  mapEnabled,
};

if (require.main === module) main();
