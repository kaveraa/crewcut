#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-http-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" }
}
EOF
mkdir -p src
cat > src/retry.js <<'EOF'
export async function fetchWithRetry(url, options = {}, attempts = 4) {
  let delay = 200;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 100));
      delay = Math.min(delay * 2, 5000);
    }
  }
  throw lastError;
}
EOF
