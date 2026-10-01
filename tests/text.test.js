'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { renderRuleset, LEVELS } = require('../hooks/crewcut.js');

const root = path.join(__dirname, '..');

// en dash, em dash, curly quotes, nbsp, narrow nbsp, then the arrows block
const bannedPoints = [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x00a0, 0x202f];
const bannedClass = bannedPoints.map((cp) => String.fromCodePoint(cp)).join('')
  + String.fromCodePoint(0x2190) + '-' + String.fromCodePoint(0x21ff);
const bannedChars = new RegExp('[' + bannedClass + ']', 'u');
const emoji = /\p{Extended_Pictographic}/u;

function findBanned(text) {
  const a = bannedChars.exec(text);
  const b = emoji.exec(text);
  if (a && b) return a.index <= b.index ? a : b;
  return a || b;
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

function describe(match) {
  return 'U+' + match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

test('tracked files use plain punctuation', () => {
  const files = git(['ls-files']).split('\n').filter(Boolean);
  const offenders = [];
  for (const file of files) {
    const match = findBanned(fs.readFileSync(path.join(root, file), 'utf8'));
    if (match) offenders.push(`${file}: ${describe(match)}`);
  }
  assert.deepEqual(offenders, []);
});

test('commit messages use plain punctuation and carry no trailer', () => {
  let log;
  try {
    log = git(['log', '--format=%B']);
  } catch {
    return; // no commit yet
  }
  const match = findBanned(log);
  assert.equal(match, null, match && describe(match));
  assert.doesNotMatch(log, /^[A-Za-z-]+: .+$/m, 'trailer line found in a commit message');
});

test('compact ruleset stays under 600 estimated tokens at every level', () => {
  const markdown = fs.readFileSync(path.join(root, 'hooks', 'ruleset.md'), 'utf8');
  for (const level of LEVELS) {
    const tokens = Math.ceil(renderRuleset(level, markdown).length / 4);
    assert.ok(tokens < 600, `${level}: about ${tokens} tokens`);
  }
});

test('rendered ruleset carries no level tag', () => {
  const markdown = fs.readFileSync(path.join(root, 'hooks', 'ruleset.md'), 'utf8');
  for (const level of LEVELS) {
    assert.doesNotMatch(renderRuleset(level, markdown), /^\[(lite|full|ultra)\]/m);
  }
});

test('the crewcut skill stays under 1500 estimated tokens', () => {
  const text = fs.readFileSync(path.join(root, 'skills', 'crewcut', 'SKILL.md'), 'utf8');
  assert.ok(Math.ceil(text.length / 4) < 1500, `about ${Math.ceil(text.length / 4)} tokens`);
});
