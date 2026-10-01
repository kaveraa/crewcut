#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-register",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs"
}
EOF
cat > register.js <<'EOF'
'use strict';

const MIN_PASSWORD = 8;

// body comes straight from the HTTP request and is untrusted
function register(body, users) {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'bad request' };
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (email === '') {
    return { ok: false, error: 'email required' };
  }
  if (email.indexOf('@') === -1) {
    return { ok: false, error: 'email invalid' };
  }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: 'password too short' };
  }
  if (users.has(email)) {
    return { ok: false, error: 'email taken' };
  }

  const user = { email, name: name === '' ? email : name, password };
  users.set(email, user);
  return { ok: true, user: { email: user.email, name: user.name } };
}

module.exports = { register, MIN_PASSWORD };
EOF
