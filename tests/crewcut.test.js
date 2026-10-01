'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { renderRuleset, parseCommand, LEVELS, readLevel, writeLevel, run } = require('../hooks/crewcut.js');

const sample = [
  'HEAD {level}',
  'always',
  '[lite] lite only',
  '[full] full only',
  '[ultra] ultra only',
  'tail',
  '',
].join('\n');

test('LEVELS lists the four levels in order', () => {
  assert.deepEqual(LEVELS, ['off', 'lite', 'full', 'ultra']);
});

test('renderRuleset keeps untagged lines and the active tag only', () => {
  assert.equal(renderRuleset('lite', sample), 'HEAD lite\nalways\nlite only\ntail');
  assert.equal(renderRuleset('full', sample), 'HEAD full\nalways\nfull only\ntail');
  assert.equal(renderRuleset('ultra', sample), 'HEAD ultra\nalways\nultra only\ntail');
});

test('renderRuleset gives nothing for off', () => {
  assert.equal(renderRuleset('off', sample), '');
});

test('renderRuleset handles CRLF input without leaving a carriage return behind', () => {
  const crlf = sample.replace(/\n/g, '\r\n');
  assert.equal(renderRuleset('full', crlf), 'HEAD full\nalways\nfull only\ntail');
});

test('parseCommand recognises the command with and without the plugin prefix', () => {
  assert.deepEqual(parseCommand('/crewcut ultra'), { command: 'set', level: 'ultra' });
  assert.deepEqual(parseCommand('/crewcut:crewcut lite'), { command: 'set', level: 'lite' });
  assert.deepEqual(parseCommand('/crewcut off'), { command: 'set', level: 'off' });
});

test('parseCommand tolerates whitespace, capitals and trailing punctuation', () => {
  assert.deepEqual(parseCommand('  /Crewcut ULTRA! '), { command: 'set', level: 'ultra' });
  assert.deepEqual(parseCommand('/crewcut full.'), { command: 'set', level: 'full' });
});

test('parseCommand reports status for no argument or an unknown one', () => {
  assert.deepEqual(parseCommand('/crewcut'), { command: 'status' });
  assert.deepEqual(parseCommand('/crewcut maximum'), { command: 'status' });
});

test('parseCommand treats the two deactivation phrases as /crewcut off', () => {
  assert.deepEqual(parseCommand('stop crewcut'), { command: 'set', level: 'off' });
  assert.deepEqual(parseCommand('Normal mode.'), { command: 'set', level: 'off' });
});

test('parseCommand ignores ordinary prompts, even ones that mention crewcut', () => {
  assert.equal(parseCommand('fix the login bug'), null);
  assert.equal(parseCommand('what does /crewcut ultra do?'), null);
  assert.equal(parseCommand('add a normal mode toggle'), null);
  assert.equal(parseCommand(''), null);
  assert.equal(parseCommand(undefined), null);
  assert.equal(parseCommand(42), null);
});

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'crewcut-'));
}

function badDir() {
  return path.join(os.tmpdir(), String.fromCharCode(0) + 'bad');
}

function levelIn(dir) {
  return fs.readFileSync(path.join(dir, 'crewcut-mode'), 'utf8').trim();
}

function promptInput(text) {
  return JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt: text });
}

function payload(output) {
  return JSON.parse(output).hookSpecificOutput;
}

test('readLevel returns null for a missing, empty or invalid level file', () => {
  const dir = tempDir();
  assert.equal(readLevel(dir), null);
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), '');
  assert.equal(readLevel(dir), null);
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'banana\n');
  assert.equal(readLevel(dir), null);
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ULTRA\r\n');
  assert.equal(readLevel(dir), 'ultra');
});

test('writeLevel creates the directory and never throws', () => {
  const dir = path.join(tempDir(), 'nested', 'deeper');
  writeLevel(dir, 'lite');
  assert.equal(levelIn(dir), 'lite');
  assert.doesNotThrow(() => writeLevel(badDir(), 'full'));
});

test('session writes the default level and emits the full ruleset', () => {
  const dir = tempDir();
  const out = run('session', '{"hook_event_name":"SessionStart","source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  const body = payload(out);
  assert.equal(body.hookEventName, 'SessionStart');
  assert.match(body.additionalContext, /^CREWCUT ACTIVE - level: full\./);
  assert.match(body.additionalContext, /The ladder/);
  assert.doesNotMatch(body.additionalContext, /^\[/m);
  assert.equal(levelIn(dir), 'full');
});

test('session honours CREWCUT_DEFAULT_MODE', () => {
  const dir = tempDir();
  const out = run('session', '{}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'ultra' });
  assert.match(payload(out).additionalContext, /one read per file/);
  assert.doesNotMatch(payload(out).additionalContext, /a line range before a whole file/);
  assert.equal(levelIn(dir), 'ultra');
});

test('session with CREWCUT_DEFAULT_MODE=off writes off and emits nothing', () => {
  const dir = tempDir();
  assert.equal(run('session', '{}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'off' }), '');
  assert.equal(levelIn(dir), 'off');
});

test('session ignores an invalid CREWCUT_DEFAULT_MODE', () => {
  const dir = tempDir();
  run('session', '{}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'maximum' });
  assert.equal(levelIn(dir), 'full');
});

test('session still emits the ruleset when the level file cannot be written', () => {
  const out = run('session', '{}', { CLAUDE_CONFIG_DIR: badDir() });
  assert.match(payload(out).additionalContext, /CREWCUT ACTIVE/);
});

test('prompt /crewcut ultra switches the level and emits the ultra ruleset', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut ultra'), { CLAUDE_CONFIG_DIR: dir });
  const body = payload(out);
  assert.equal(body.hookEventName, 'UserPromptSubmit');
  assert.match(body.additionalContext, /^crewcut: ultra\n\nCREWCUT ACTIVE - level: ultra\./);
  assert.equal(levelIn(dir), 'ultra');
});

test('prompt /crewcut:crewcut lite works like /crewcut lite', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut:crewcut lite'), { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(out).additionalContext, /^crewcut: lite\n\nCREWCUT ACTIVE - level: lite\./);
  assert.match(payload(out).additionalContext, /prefer grep to reading whole files/);
  assert.doesNotMatch(payload(out).additionalContext, /Writing:/);
  assert.equal(levelIn(dir), 'lite');
});

test('prompt /crewcut off writes off and emits only the acknowledgement', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut off'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: off');
  assert.equal(levelIn(dir), 'off');
});

test('prompt deactivation phrases behave like /crewcut off', () => {
  for (const phrase of ['stop crewcut', 'Normal mode.']) {
    const dir = tempDir();
    const out = run('prompt', promptInput(phrase), { CLAUDE_CONFIG_DIR: dir });
    assert.equal(payload(out).additionalContext, 'crewcut: off');
    assert.equal(levelIn(dir), 'off');
  }
});

test('prompt /crewcut alone reports the stored level and writes nothing', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'lite\n');
  const out = run('prompt', promptInput('/crewcut'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: lite (levels: off, lite, full, ultra)');
  assert.equal(levelIn(dir), 'lite');
});

test('prompt /crewcut reports the default when no level file exists', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut'), { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'lite' });
  assert.equal(payload(out).additionalContext, 'crewcut: lite (levels: off, lite, full, ultra)');
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-mode')));
});

test('prompt /crewcut maximum reports status like a bare /crewcut', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut maximum'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: full (levels: off, lite, full, ultra)');
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-mode')));
});

test('prompt with an ordinary message emits nothing', () => {
  const dir = tempDir();
  assert.equal(run('prompt', promptInput('fix the login bug'), { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('prompt', promptInput('what does /crewcut ultra do?'), { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('prompt', promptInput('add a normal mode toggle'), { CLAUDE_CONFIG_DIR: dir }), '');
});

test('run tolerates a BOM, invalid JSON, empty stdin and a missing prompt field', () => {
  const dir = tempDir();
  const bom = String.fromCharCode(0xfeff) + promptInput('/crewcut off');
  assert.equal(payload(run('prompt', bom, { CLAUDE_CONFIG_DIR: dir })).additionalContext, 'crewcut: off');
  assert.equal(run('prompt', 'not json', { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('prompt', '', { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('prompt', '{"hook_event_name":"UserPromptSubmit"}', { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('session', 'not json', { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(run('unknown', '{}', { CLAUDE_CONFIG_DIR: dir }), '');
});

test('the script runs end to end as a child process', () => {
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'hooks', 'crewcut.js');
  const out = execFileSync(process.execPath, [script, 'prompt'], {
    input: promptInput('/crewcut ultra'),
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    encoding: 'utf8',
  });
  assert.match(payload(out).additionalContext, /^crewcut: ultra/);
  assert.equal(levelIn(dir), 'ultra');
  const silent = execFileSync(process.execPath, [script, 'prompt'], {
    input: 'garbage',
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    encoding: 'utf8',
  });
  assert.equal(silent, '');
});
