#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-links",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs"
}
EOF
cat > links.js <<'EOF'
'use strict';

const links = [
  'https://example.com/docs/start',
  'http://blog.example.org:8080/post/1?ref=home',
  'https://www.example.net/',
];

function describe(link) {
  return `${link} (${hostOf(link)})`;
}

module.exports = { links, describe };
EOF
