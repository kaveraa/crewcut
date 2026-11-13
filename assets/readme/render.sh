#!/usr/bin/env bash
# Renders each card in src/ to a PNG next to this script, at twice its size.
# Usage: CHROME=/path/to/chrome ./render.sh
set -e
here="$(cd "$(dirname "$0")" && pwd)"
chrome="${CHROME:-google-chrome}"
for page in "$here"/src/*.html; do
  name="$(basename "$page" .html)"
  height="$("$chrome" --headless=new --disable-gpu --window-size=880,900 --dump-dom "file://$page" 2>/dev/null | grep -o 'data-h="[0-9]*"' | grep -o '[0-9]*')"
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --force-device-scale-factor=2 --window-size=880,"$height" --screenshot="$here/$name.png" "file://$page" >/dev/null 2>&1
  echo "$name ${height}px"
done
"$chrome" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --force-device-scale-factor=2 --window-size=1280,400 --screenshot="$here/../banner.png" "file://$here/../banner.html" >/dev/null 2>&1
echo "banner 400px"
