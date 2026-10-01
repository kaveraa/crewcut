'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

// em dash, en dash, curly quotes, arrows, nbsp, narrow nbsp, emoji
const banned = /[–—‘’“”←-⇿  ]|\p{Extended_Pictographic}/u;

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

function describe(match) {
  return 'U+' + match.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

test('tracked files use plain punctuation', () => {
  const files = git(['ls-files']).split('\n').filter(Boolean);
  const offenders = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const match = banned.exec(text);
    if (match) offenders.push(`${file}: ${describe(match[0])}`);
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
  const match = banned.exec(log);
  assert.equal(match, null, match && describe(match[0]));
  assert.doesNotMatch(log, /^[A-Za-z-]+: .+$/m, 'trailer line found in a commit message');
});
