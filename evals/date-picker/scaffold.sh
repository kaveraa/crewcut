#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-signup",
  "version": "1.0.0",
  "private": true
}
EOF
cat > index.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sign up</title>
</head>
<body>
  <form action="/signup" method="post">
    <label for="name">Name</label>
    <input id="name" name="name" type="text" required>

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" minlength="8" required>

    <button type="submit">Create account</button>
  </form>
</body>
</html>
EOF
