#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-signup-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "dependencies": {
    "zod": "^4.1.5"
  }
}
EOF
mkdir -p src/schemas
cat > src/schemas/signup.js <<'EOF'
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(18),
});
EOF
