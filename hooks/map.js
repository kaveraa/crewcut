'use strict';
// crewcut map: one line per folder with the names the project already defines,
// so "in this codebase? reuse it" costs no grep. No parser, no dependency: a
// file list and one regex per language, cut to a character budget.
// Tests, vendored and generated files are left out; shared folders come first.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_BUDGET = 1500;
const MAX_FILES = 3000;
const NAMES_PER_FILE = 10;
const WALK_DEPTH = 5;
const MAX_FILE_BYTES = 512 * 1024;

const SOURCE = /\.(js|jsx|mjs|cjs|ts|tsx|py|go|rs|rb|php|java|kt|cs|swift)$/;
const SKIP_DIR = /(^|\/)(node_modules|\.git|dist|build|out|vendor|venv|\.venv|__pycache__|coverage|\.next|target|migrations|fixtures|tests?|__tests__|spec|e2e|storage|public)(\/|$)/;
const SKIP_FILE = /(^|\/)(test_[^/]*|[^/]*(_test|\.test|\.spec|\.min|\.d|\.generated)\.[a-z]+)$/;
const SHARED_DIR = /(^|\/)(lib|libs|utils?|helpers?|services?|components?|hooks|core|common|shared|api|models?|domain|support)(\/|$)/i;
const IDENT = /^[A-Za-z_$][\w$]*$/;
// A path is text the repository controls and the map lands in the session
// context: only plain path characters pass, so no folder name smuggles a line in.
const SAFE_PATH = /^[\w.@+-]+(\/[\w.@+-]+)*$/;

// One entry per language family: the regexes that catch a top-level definition.
// A default export is left out: nothing imports it by that name.
const PATTERNS = {
  js: [
    /^export\s+(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum|abstract\s+class)\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s*\{([^}]*)\}/gm,
    /^module\.exports\s*=\s*\{([^}]*)\}/gm,
    /^(?:module\.)?exports\.([A-Za-z_$][\w$]*)\s*=/gm,
  ],
  py: [/^(?:async\s+)?def\s+([A-Za-z]\w*)/gm, /^class\s+([A-Za-z]\w*)/gm],
  go: [/^func\s+(?:\([^)]*\)\s*)?([A-Z]\w*)/gm, /^type\s+([A-Z]\w*)/gm],
  rs: [/^pub(?:\([^)]*\))?\s+(?:async\s+)?(?:fn|struct|enum|trait|type|mod)\s+([A-Za-z_]\w*)/gm],
  rb: [/^(?:class|module)\s+([A-Z][\w:]*)/gm, /^def\s+(?:self\.)?([a-z_]\w*[?!]?)/gm],
  php: [/^(?:abstract\s+|final\s+|readonly\s+)*(?:class|interface|trait|enum)\s+([A-Za-z_]\w*)/gm, /^function\s+([A-Za-z_]\w*)/gm],
  typed: [/^\s*(?:public\s+|internal\s+|open\s+)?(?:static\s+|final\s+|abstract\s+|sealed\s+|data\s+)*(?:class|interface|enum|record|struct|protocol|object|trait)\s+([A-Za-z_]\w*)/gm],
};
const FAMILY = {
  js: 'js', jsx: 'js', mjs: 'js', cjs: 'js', ts: 'js', tsx: 'js',
  py: 'py', go: 'go', rs: 'rs', rb: 'rb', php: 'php', java: 'typed', kt: 'typed', cs: 'typed', swift: 'typed',
};

function listFiles(root) {
  try {
    const out = execFileSync('git', ['ls-files', '-z'], {
      cwd: root, encoding: 'utf8', timeout: 2000, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
    const files = out.split('\0').filter(Boolean);
    if (files.length) return files;
  } catch {
    // not a git checkout, or git missing: walk instead
  }
  const files = [];
  const walk = (dir, depth) => {
    if (depth > WALK_DEPTH || files.length >= MAX_FILES) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const rel = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (!SKIP_DIR.test(rel + '/')) walk(path.join(dir, entry.name), depth + 1);
      } else {
        files.push(rel);
      }
    }
  };
  walk(root, 0);
  return files;
}

function namesIn(file, text) {
  const family = FAMILY[path.extname(file).slice(1)];
  const names = [];
  for (const re of PATTERNS[family] || []) {
    for (const match of text.matchAll(re)) {
      for (const raw of match[1].split(',')) {
        // "a as b" exports the second name; "default" says nothing
        const name = raw.trim().split(/\s+as\s+/).pop().trim();
        if (IDENT.test(name) && name !== 'default' && !name.startsWith('_') && !names.includes(name)) names.push(name);
      }
      if (names.length >= NAMES_PER_FILE) return names;
    }
  }
  return names;
}

function isSource(file) {
  return SAFE_PATH.test(file) && SOURCE.test(file) && !SKIP_DIR.test(file) && !SKIP_FILE.test(file);
}

// Folders that other code imports from go first: when the budget cuts the
// list, the names worth reusing are the ones that stay.
function byFolderPriority(a, b) {
  const sa = SHARED_DIR.test(a) ? 0 : 1;
  const sb = SHARED_DIR.test(b) ? 0 : 1;
  return sa - sb || a.localeCompare(b);
}

function buildMap(root, budget = DEFAULT_BUDGET) {
  const files = listFiles(root).filter(isSource).slice(0, MAX_FILES);
  const folders = new Map();
  for (const file of files) {
    let text;
    try {
      const full = path.join(root, file);
      const stat = fs.lstatSync(full);
      if (!stat.isFile() || stat.size > MAX_FILE_BYTES) continue; // a symlink, a pipe or a bundle
      text = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const names = namesIn(file, text);
    if (!names.length) continue;
    const folder = path.posix.dirname(file);
    const list = folders.get(folder) || [];
    for (const name of names) if (!list.includes(name)) list.push(name);
    folders.set(folder, list);
  }
  if (!folders.size) return '';
  const header = 'Already in this codebase (reuse before writing):';
  const lines = [header];
  let used = header.length;
  let left = 0;
  for (const folder of [...folders.keys()].sort(byFolderPriority)) {
    const line = `${folder === '.' ? '' : folder + '/'}: ${folders.get(folder).join(', ')}`;
    if (used + line.length + 1 > budget) {
      left += 1;
      continue;
    }
    lines.push(line);
    used += line.length + 1;
  }
  if (left) lines.push(`(${left} more folder${left > 1 ? 's' : ''} not listed)`);
  return lines.length > 1 ? lines.join('\n') : '';
}

module.exports = { buildMap, isSource, namesIn, DEFAULT_BUDGET };

if (require.main === module) {
  const root = process.argv[2] || process.cwd();
  const budget = Number(process.env.CREWCUT_MAP_CHARS) || DEFAULT_BUDGET;
  const map = buildMap(path.resolve(root), budget);
  if (map) process.stdout.write(map + '\n');
}
