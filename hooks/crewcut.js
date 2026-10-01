'use strict';
// crewcut hook: keeps the active level and injects the ruleset for it.

const LEVELS = ['off', 'lite', 'full', 'ultra'];
const DEFAULT_LEVEL = 'full';
const OFF_PHRASES = ['stop crewcut', 'normal mode'];
const COMMAND = /^\/crewcut(?::crewcut)?(?:\s+(\S+))?$/;
const TAG = /^\[(lite|full|ultra)\]\s?/;

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

module.exports = { LEVELS, DEFAULT_LEVEL, parseCommand, renderRuleset };
