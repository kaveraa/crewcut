'use strict';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { renderRuleset, parseCommand, LEVELS, readLevel, writeLevel, readConfig, writeConfig, run, subagentMatcher, uninstall } = require('../hooks/crewcut.js');

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

const tempDirs = [];

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewcut-'));
  tempDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
});

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
  assert.equal(payload(out).additionalContext, 'crewcut: lite (default: full; levels: off, lite, full, ultra; language: en)');
  assert.equal(levelIn(dir), 'lite');
});

test('prompt /crewcut reports the default when no level file exists', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut'), { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'lite' });
  assert.equal(payload(out).additionalContext, 'crewcut: lite (default: lite; levels: off, lite, full, ultra; language: en)');
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-mode')));
});

test('prompt /crewcut maximum reports status like a bare /crewcut', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut maximum'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: full (default: full; levels: off, lite, full, ultra; language: en)');
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
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' },
    encoding: 'utf8',
  });
  assert.match(payload(out).additionalContext, /^crewcut: ultra/);
  assert.equal(levelIn(dir), 'ultra');
  const silent = execFileSync(process.execPath, [script, 'prompt'], {
    input: 'garbage',
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' },
    encoding: 'utf8',
  });
  assert.equal(silent, '');
});

test('parseCommand accepts trailing words after a valid level', () => {
  assert.deepEqual(parseCommand('/crewcut ultra please'), { command: 'set', level: 'ultra' });
  assert.deepEqual(parseCommand('/crewcut maximum now'), { command: 'status' });
});

test('session on compact keeps the stored level and does not rewrite it', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const out = run('session', '{"hook_event_name":"SessionStart","source":"compact"}', { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(out).additionalContext, /^CREWCUT ACTIVE - level: ultra\./);
  assert.equal(levelIn(dir), 'ultra');
});

test('session on resume keeps the stored level', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'lite\n');
  const out = run('session', '{"hook_event_name":"SessionStart","source":"resume"}', { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(out).additionalContext, /^CREWCUT ACTIVE - level: lite\./);
  assert.equal(levelIn(dir), 'lite');
});

test('session on compact with a stored off stays silent', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'off\n');
  assert.equal(run('session', '{"source":"compact"}', { CLAUDE_CONFIG_DIR: dir }), '');
  assert.equal(levelIn(dir), 'off');
});

test('session on startup and clear resets a stored level to the default', () => {
  for (const source of ['startup', 'clear']) {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
    const out = run('session', JSON.stringify({ source }), { CLAUDE_CONFIG_DIR: dir });
    assert.match(payload(out).additionalContext, /^CREWCUT ACTIVE - level: full\./);
    assert.equal(levelIn(dir), 'full');
  }
});

test('the script exits 0 when stdout is closed before it writes', async () => {
  const { spawn } = require('node:child_process');
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'hooks', 'crewcut.js');
  const child = spawn(process.execPath, [script, 'session'], {
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.stdout.destroy();
  child.stdin.end('{"source":"startup"}');
  const code = await new Promise((resolve) => child.on('close', resolve));
  assert.equal(code, 0, stderr);
  assert.equal(stderr, '');
});

test('the real ruleset carries the quality guard at every active level', () => {
  const markdown = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'ruleset.md'), 'utf8');
  for (const level of ['lite', 'full', 'ultra']) {
    const text = renderRuleset(level, markdown);
    assert.match(text, /Short never means wrong/, level);
    assert.match(text, /failing test is fixed and rerun/, level);
    assert.match(text, /changed since your last read/, level);
  }
});

function configIn(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'crewcut.json'), 'utf8'));
}

test('parseCommand recognises default and subagents commands', () => {
  assert.deepEqual(parseCommand('/crewcut default ultra'), { command: 'default', level: 'ultra' });
  assert.deepEqual(parseCommand('/crewcut:crewcut default off'), { command: 'default', level: 'off' });
  assert.deepEqual(parseCommand('/crewcut default banana'), { command: 'status' });
  assert.deepEqual(parseCommand('/crewcut default'), { command: 'status' });
  assert.deepEqual(parseCommand('/crewcut subagents off'), { command: 'subagents', enabled: false });
  assert.deepEqual(parseCommand('/crewcut subagents ON'), { command: 'subagents', enabled: true });
  assert.deepEqual(parseCommand('/crewcut subagents maybe'), { command: 'status' });
});

test('readConfig gives an empty object for a missing, invalid or non-object file', () => {
  const dir = tempDir();
  assert.deepEqual(readConfig(dir), {});
  fs.writeFileSync(path.join(dir, 'crewcut.json'), 'not json');
  assert.deepEqual(readConfig(dir), {});
  fs.writeFileSync(path.join(dir, 'crewcut.json'), '[1, 2]');
  assert.deepEqual(readConfig(dir), {});
  fs.writeFileSync(path.join(dir, 'crewcut.json'), String.fromCharCode(0xfeff) + '{"defaultLevel":"lite"}');
  assert.deepEqual(readConfig(dir), { defaultLevel: 'lite' });
});

test('writeConfig merges into the existing file and never throws', () => {
  const dir = tempDir();
  writeConfig(dir, { defaultLevel: 'ultra' });
  writeConfig(dir, { subagents: false });
  assert.deepEqual(configIn(dir), { defaultLevel: 'ultra', subagents: false });
  assert.doesNotThrow(() => writeConfig(badDir(), { defaultLevel: 'lite' }));
});

test('prompt /crewcut default writes the config and leaves the session level alone', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'full\n');
  const out = run('prompt', promptInput('/crewcut default ultra'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: default ultra');
  assert.equal(configIn(dir).defaultLevel, 'ultra');
  assert.equal(levelIn(dir), 'full');
});

test('session uses the configured default, and the environment wins over it', () => {
  const dir = tempDir();
  writeConfig(dir, { defaultLevel: 'lite' });
  const fromFile = run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(fromFile).additionalContext, /^CREWCUT ACTIVE - level: lite\./);
  assert.equal(levelIn(dir), 'lite');
  const fromEnv = run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'ultra' });
  assert.match(payload(fromEnv).additionalContext, /^CREWCUT ACTIVE - level: ultra\./);
  assert.equal(levelIn(dir), 'ultra');
});

test('session ignores an invalid configured default', () => {
  const dir = tempDir();
  writeConfig(dir, { defaultLevel: 'banana' });
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  assert.equal(levelIn(dir), 'full');
});

test('prompt /crewcut alone reports the level and the default', () => {
  const dir = tempDir();
  writeConfig(dir, { defaultLevel: 'ultra' });
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'lite\n');
  const out = run('prompt', promptInput('/crewcut'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: lite (default: ultra; levels: off, lite, full, ultra; language: en)');
});

test('prompt /crewcut subagents off writes the config and acknowledges', () => {
  const dir = tempDir();
  const out = run('prompt', promptInput('/crewcut subagents off'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(out).additionalContext, 'crewcut: subagents off');
  assert.equal(configIn(dir).subagents, false);
  const on = run('prompt', promptInput('/crewcut subagents on'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(on).additionalContext, 'crewcut: subagents on');
  assert.equal(configIn(dir).subagents, true);
});

test('subagent emits the ruleset for the stored level by default', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const out = run('subagent', '{"hook_event_name":"SubagentStart","agent_type":"general-purpose"}', { CLAUDE_CONFIG_DIR: dir });
  const body = payload(out);
  assert.equal(body.hookEventName, 'SubagentStart');
  assert.match(body.additionalContext, /^CREWCUT ACTIVE - level: ultra\./);
  assert.equal(levelIn(dir), 'ultra');
});

test('subagent falls back to the default level when no level is stored', () => {
  const dir = tempDir();
  const out = run('subagent', '{}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'lite' });
  assert.match(payload(out).additionalContext, /^CREWCUT ACTIVE - level: lite\./);
});

test('subagent stays silent when switched off in the config or when the level is off', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  writeConfig(dir, { subagents: false });
  assert.equal(run('subagent', '{}', { CLAUDE_CONFIG_DIR: dir }), '');
  const other = tempDir();
  fs.writeFileSync(path.join(other, 'crewcut-mode'), 'off\n');
  assert.equal(run('subagent', '{}', { CLAUDE_CONFIG_DIR: other }), '');
});

test('the real ruleset carries the commit and pull request rule at every active level', () => {
  const markdown = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'ruleset.md'), 'utf8');
  for (const level of ['lite', 'full', 'ultra']) {
    const text = renderRuleset(level, markdown);
    assert.match(text, /Commits and PRs:/, level);
    assert.match(text, /no AI co-author/, level);
    assert.match(text, /strip any such line/, level);
  }
});

test('the real ruleset carries the modern-by-default rule at every active level', () => {
  const markdown = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'ruleset.md'), 'utf8');
  for (const level of ['lite', 'full', 'ultra']) {
    const text = renderRuleset(level, markdown);
    assert.match(text, /Modern by default:/, level);
    assert.match(text, /versions/, level);
    assert.match(text, /never a feature the version lacks/, level);
  }
});

test('parseCommand turns the review and audit skills into the review state', () => {
  assert.deepEqual(parseCommand('/crewcut-review'), { command: 'review' });
  assert.deepEqual(parseCommand('/crewcut:crewcut-review main..HEAD'), { command: 'review' });
  assert.deepEqual(parseCommand('/crewcut-audit src'), { command: 'review' });
  assert.equal(parseCommand('/crewcut-help'), null);
});

test('prompt /crewcut-review enters the read-only review state for the session', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const out = run('prompt', promptInput('/crewcut-review'), { CLAUDE_CONFIG_DIR: dir });
  const text = payload(out).additionalContext;
  assert.match(text, /^crewcut: review\n\nCREWCUT ACTIVE - level: review\./);
  assert.match(text, /change no file/);
  assert.equal(levelIn(dir), 'review');
  assert.equal(readLevel(dir), 'review');
});

test('review state is kept across compaction, reset on startup, left by a level switch', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'review\n');
  const compact = run('session', '{"source":"compact"}', { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(compact).additionalContext, /^CREWCUT ACTIVE - level: review\./);
  assert.equal(levelIn(dir), 'review');
  const status = run('prompt', promptInput('/crewcut'), { CLAUDE_CONFIG_DIR: dir });
  assert.equal(payload(status).additionalContext, 'crewcut: review (default: full; levels: off, lite, full, ultra; language: en)');
  const sub = run('subagent', '{}', { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(sub).additionalContext, /level: review\./);
  const back = run('prompt', promptInput('/crewcut full'), { CLAUDE_CONFIG_DIR: dir });
  assert.match(payload(back).additionalContext, /^crewcut: full\n\nCREWCUT ACTIVE - level: full\./);
  assert.equal(levelIn(dir), 'full');
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'review\n');
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  assert.equal(levelIn(dir), 'full');
});

test('review is never a default', () => {
  const dir = tempDir();
  writeConfig(dir, { defaultLevel: 'review' });
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir, CREWCUT_DEFAULT_MODE: 'review' });
  assert.equal(levelIn(dir), 'full');
  assert.deepEqual(parseCommand('/crewcut review'), { command: 'status' });
  assert.deepEqual(parseCommand('/crewcut default review'), { command: 'status' });
});

test('session startup nudges once about the statusline when none is configured', () => {
  const dir = tempDir();
  const first = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.match(first, /crewcut-statusline\.js/);
  assert.doesNotMatch(first, /hooks[\\/]statusline\.js/);
  assert.match(first, /"statusLine"/);
  assert.ok(fs.existsSync(path.join(dir, 'crewcut-nudged')));
  assert.ok(fs.existsSync(path.join(dir, 'crewcut-statusline.js')));
  const second = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.doesNotMatch(second, /statusline\.js/);
});

test('session startup does not nudge inside an eval run', () => {
  const dir = tempDir();
  const text = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir, CLAUDE_CODE_EVAL_CONFINED: '1' })).additionalContext;
  assert.match(text, /^CREWCUT ACTIVE/);
  assert.doesNotMatch(text, /statusline\.js/);
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-nudged')));
  const zero = tempDir();
  const again = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: zero, CLAUDE_CODE_EVAL_CONFINED: '0' })).additionalContext;
  assert.match(again, /statusline\.js/);
});

test('session startup does not nudge when a statusline exists, on compact, or when off', () => {
  const withStatus = tempDir();
  fs.writeFileSync(path.join(withStatus, 'settings.json'), '{"statusLine":{"type":"command","command":"x"}}');
  const text = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: withStatus })).additionalContext;
  assert.doesNotMatch(text, /statusline\.js/);
  assert.ok(!fs.existsSync(path.join(withStatus, 'crewcut-nudged')));
  const compact = tempDir();
  fs.writeFileSync(path.join(compact, 'crewcut-mode'), 'full\n');
  assert.doesNotMatch(payload(run('session', '{"source":"compact"}', { CLAUDE_CONFIG_DIR: compact })).additionalContext, /statusline\.js/);
  const off = tempDir();
  assert.equal(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: off, CREWCUT_DEFAULT_MODE: 'off' }), '');
});

test('statusline.js prints the level, the model and the directory', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const script = path.join(__dirname, '..', 'hooks', 'statusline.js');
  const input = JSON.stringify({ model: { display_name: 'Opus' }, workspace: { current_dir: 'C:/work/shop' } });
  const out = execFileSync(process.execPath, [script], { input, env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' }, encoding: 'utf8' });
  assert.equal(out.trim(), 'crewcut: ultra | Opus | shop');
});

test('statusline.js survives empty stdin and a missing level file', () => {
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'hooks', 'statusline.js');
  const out = execFileSync(process.execPath, [script], { input: '', env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' }, encoding: 'utf8' });
  assert.equal(out.trim(), 'crewcut: full');
});

test('the copied statusline script is standalone and gets refreshed at startup', () => {
  const dir = tempDir();
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  const copy = path.join(dir, 'crewcut-statusline.js');
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'lite\n');
  const out = execFileSync(process.execPath, [copy], {
    input: JSON.stringify({ model: { display_name: 'Opus' }, workspace: { current_dir: 'C:/work/shop' } }),
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' },
    encoding: 'utf8',
  });
  assert.equal(out.trim(), 'crewcut: lite | Opus | shop');
  fs.writeFileSync(copy, '// stale');
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  assert.notEqual(fs.readFileSync(copy, 'utf8'), '// stale');
  assert.ok(!fs.existsSync(path.join(tempDir(), 'crewcut-statusline.js')), 'no copy without a session start');
});

test('the real ruleset carries the plain-punctuation rule at every active level', () => {
  const markdown = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'ruleset.md'), 'utf8');
  for (const level of ['lite', 'full', 'ultra']) {
    const text = renderRuleset(level, markdown);
    assert.match(text, /Plain text only:/, level);
    assert.match(text, /no emoji/, level);
    assert.match(text, /write ->/, level);
    assert.match(text, /write -\)/, level);
  }
});

test('statusline.js accepts status JSON with a byte order mark', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const script = path.join(__dirname, '..', 'hooks', 'statusline.js');
  const input = String.fromCharCode(0xfeff) + JSON.stringify({ model: { display_name: 'Opus' }, workspace: { current_dir: 'C:/work/shop' } });
  const out = execFileSync(process.execPath, [script], { input, env: { ...process.env, CLAUDE_CONFIG_DIR: dir, NO_COLOR: '1' }, encoding: 'utf8' });
  assert.equal(out.trim(), 'crewcut: ultra | Opus | shop');
});

test('statusline.js colours the level unless NO_COLOR is set', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'ultra\n');
  const script = path.join(__dirname, '..', 'hooks', 'statusline.js');
  const env = { ...process.env, CLAUDE_CONFIG_DIR: dir };
  delete env.NO_COLOR;
  const coloured = execFileSync(process.execPath, [script], { input: '', env, encoding: 'utf8' });
  const esc = String.fromCharCode(27);
  assert.equal(coloured.trim(), `${esc}[38;5;214mcrewcut: ultra${esc}[0m`);
  const plain = execFileSync(process.execPath, [script], { input: '', env: { ...env, NO_COLOR: '1' }, encoding: 'utf8' });
  assert.equal(plain.trim(), 'crewcut: ultra');
});

test('parseCommand recognises uninstall and nothing that looks like it', () => {
  assert.deepEqual(parseCommand('/crewcut uninstall'), { command: 'uninstall' });
  assert.deepEqual(parseCommand('/crewcut:crewcut uninstall'), { command: 'uninstall' });
  assert.deepEqual(parseCommand('/crewcut uninstall now'), { command: 'status' });
  assert.equal(parseCommand('uninstall crewcut'), null);
});

test('uninstall removes the plugin state and only its own status line entry', () => {
  const dir = tempDir();
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  writeConfig(dir, { defaultLevel: 'lite' });
  const settings = path.join(dir, 'settings.json');
  const command = 'node "' + path.join(dir, 'crewcut-statusline.js') + '"';
  fs.writeFileSync(settings, JSON.stringify({ theme: 'dark', statusLine: { type: 'command', command } }));
  const removed = uninstall(dir);
  assert.deepEqual(removed, ['crewcut-mode', 'crewcut-nudged', 'crewcut-statusline.js', 'crewcut.json', 'statusLine in settings.json']);
  assert.deepEqual(JSON.parse(fs.readFileSync(settings, 'utf8')), { theme: 'dark' });
  for (const name of ['crewcut-mode', 'crewcut-nudged', 'crewcut-statusline.js', 'crewcut.json']) {
    assert.ok(!fs.existsSync(path.join(dir, name)), name);
  }
  assert.deepEqual(uninstall(dir), []);
  const foreign = tempDir();
  fs.writeFileSync(path.join(foreign, 'settings.json'), '{"statusLine":{"type":"command","command":"my-own-script"}}');
  assert.deepEqual(uninstall(foreign), []);
  assert.match(fs.readFileSync(path.join(foreign, 'settings.json'), 'utf8'), /my-own-script/);
});

test('prompt /crewcut uninstall cleans up and asks to finish with the plugin command', () => {
  const dir = tempDir();
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  const text = payload(run('prompt', promptInput('/crewcut uninstall'), { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.match(text, /^crewcut: removed crewcut-mode/);
  assert.match(text, /\/plugin remove crewcut/);
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-mode')));
});

test('the uninstall command line removes the state and reports it', () => {
  const dir = tempDir();
  run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir });
  const script = path.join(__dirname, '..', 'hooks', 'crewcut.js');
  const out = execFileSync(process.execPath, [script, 'uninstall'], { env: { ...process.env, CLAUDE_CONFIG_DIR: dir }, encoding: 'utf8' });
  assert.match(out, /^removed crewcut-mode/);
  assert.ok(!fs.existsSync(path.join(dir, 'crewcut-nudged')));
});

test('subagentMatcher reads the environment first, then the config, and drops a broken pattern', () => {
  const dir = tempDir();
  assert.equal(subagentMatcher({}, dir), null);
  writeConfig(dir, { subagentMatcher: 'reviewer' });
  assert.ok(subagentMatcher({}, dir).test('crewcut-REVIEWER'));
  assert.ok(!subagentMatcher({}, dir).test('Explore'));
  assert.ok(subagentMatcher({ CREWCUT_SUBAGENT_MATCHER: '^explore$' }, dir).test('Explore'));
  assert.equal(subagentMatcher({ CREWCUT_SUBAGENT_MATCHER: '(' }, dir), null);
  assert.equal(subagentMatcher({ CREWCUT_SUBAGENT_MATCHER: '' }, dir), null);
});

test('subagent injects only into matching agent types when a matcher is set, and fails open', () => {
  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'crewcut-mode'), 'full\n');
  const env = { CLAUDE_CONFIG_DIR: dir, CREWCUT_SUBAGENT_MATCHER: 'explore|general' };
  assert.match(payload(run('subagent', '{"agent_type":"Explore"}', env)).additionalContext, /CREWCUT ACTIVE/);
  assert.equal(run('subagent', '{"agent_type":"crewcut-reviewer"}', env), '');
  assert.match(payload(run('subagent', '{}', env)).additionalContext, /CREWCUT ACTIVE/);
  assert.match(payload(run('subagent', '{"agent_type":"Plan"}', { ...env, CREWCUT_SUBAGENT_MATCHER: '[' })).additionalContext, /CREWCUT ACTIVE/);
  const plain = { CLAUDE_CONFIG_DIR: dir };
  assert.equal(run('subagent', '{"agent_type":"claude-code-guide"}', plain), '');
  assert.equal(run('subagent', '{"agent_type":"statusline-setup"}', plain), '');
  assert.match(payload(run('subagent', '{"agent_type":"Explore"}', plain)).additionalContext, /CREWCUT ACTIVE/);
  assert.match(payload(run('subagent', '{"agent_type":"claude-code-guide"}', { ...plain, CREWCUT_SUBAGENT_MATCHER: 'guide' })).additionalContext, /CREWCUT ACTIVE/);
});

test('the script answers within a second when stdin never closes', async () => {
  const { spawn } = require('node:child_process');
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'hooks', 'crewcut.js');
  const started = Date.now();
  const child = spawn(process.execPath, [script, 'session'], { env: { ...process.env, CLAUDE_CONFIG_DIR: dir } });
  let stdout = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stdin.write('{"source":"startup"}');
  const code = await new Promise((resolve) => child.on('close', resolve));
  assert.equal(code, 0);
  assert.ok(Date.now() - started < 4000, 'did not exit on its own');
  assert.match(payload(stdout).additionalContext, /^CREWCUT ACTIVE/);
  assert.equal(levelIn(dir), 'full');
});

test('parseCommand recognises the lang command for the listed languages only', () => {
  assert.deepEqual(parseCommand('/crewcut lang fr'), { command: 'lang', language: 'fr' });
  assert.deepEqual(parseCommand('/crewcut lang ES'), { command: 'lang', language: 'es' });
  assert.deepEqual(parseCommand('/crewcut lang ko'), { command: 'lang', language: 'ko' });
  assert.deepEqual(parseCommand('/crewcut lang zh'), { command: 'lang', language: 'zh' });
  assert.deepEqual(parseCommand('/crewcut lang it'), { command: 'status' });
  assert.deepEqual(parseCommand('/crewcut lang constructor'), { command: 'status' });
});

test('session startup asks the language once, never in an eval run', () => {
  const dir = tempDir();
  const first = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.match(first, /Language, once:/);
  assert.equal(configIn(dir).language, 'en');
  const second = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.doesNotMatch(second, /Language/);
  const evalDir = tempDir();
  const text = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: evalDir, CLAUDE_CODE_EVAL_CONFINED: '1' })).additionalContext;
  assert.doesNotMatch(text, /Language/);
});

test('prompt /crewcut lang stores the language and later rules carry it', () => {
  const dir = tempDir();
  const ack = payload(run('prompt', promptInput('/crewcut lang fr'), { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.match(ack, /^crewcut: language fr\n\nLanguage: write every reply to the user in French/);
  assert.equal(configIn(dir).language, 'fr');
  const session = payload(run('session', '{"source":"startup"}', { CLAUDE_CONFIG_DIR: dir })).additionalContext;
  assert.match(session, /^CREWCUT ACTIVE[\s\S]*in French; code and commits follow the project\.$/m);
  assert.doesNotMatch(session, /Language, once:/);
  assert.match(payload(run('prompt', promptInput('/crewcut ultra'), { CLAUDE_CONFIG_DIR: dir })).additionalContext, /in French/);
  assert.doesNotMatch(payload(run('subagent', '{}', { CLAUDE_CONFIG_DIR: dir })).additionalContext, /in French/);
  assert.equal(run('prompt', promptInput('/crewcut off'), { CLAUDE_CONFIG_DIR: dir }).includes('French'), false);
});
