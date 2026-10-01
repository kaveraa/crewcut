'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderRuleset, parseCommand, LEVELS } = require('../hooks/crewcut.js');

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
