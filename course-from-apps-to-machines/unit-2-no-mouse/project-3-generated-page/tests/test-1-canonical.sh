#!/bin/bash
# ============================================================================
#  TEST 1 — canonical run                                        weight: 40
#
#  Does the script build both files correctly on a clean machine?
#  Runs the READ ONLY reference cell, then the learner's build.sh, in a
#  throwaway HOME, and checks the two artifacts.
#
#  Prints exactly: PASS
# ============================================================================

BUILD_SH="${BUILD_SH:-$HOME/build.sh}"

if [ ! -f "$BUILD_SH" ]; then
  echo "FAIL: no build.sh found at $BUILD_SH"
  exit 1
fi

SANDBOX="$(mktemp -d)"
export HOME="$SANDBOX"

# --- the READ ONLY reference cell, verbatim ---
mkdir -p "$HOME/projects/first-site"

cp "$BUILD_SH" "$HOME/build.sh"
chmod +x "$HOME/build.sh"
cd "$HOME" || { echo "FAIL: could not enter the sandbox home"; exit 1; }
./build.sh > "$HOME/run.log" 2>&1
STATUS=$?

SITE="$HOME/projects/first-site"

if [ "$STATUS" -ne 0 ]; then
  echo "FAIL: build.sh exited with status $STATUS"
  exit 1
fi

if [ ! -s "$SITE/index.html" ]; then
  echo "FAIL: index.html is missing or empty"
  exit 1
fi

if ! grep -q "<title>" "$SITE/index.html"; then
  echo "FAIL: index.html has no title element"
  exit 1
fi

if ! grep -q "<h1>" "$SITE/index.html"; then
  echo "FAIL: index.html has no h1 heading - TODO A is unresolved"
  exit 1
fi

LINES=$(wc -l < "$SITE/index.html")
if [ "$LINES" -ne 2 ]; then
  echo "FAIL: index.html has $LINES lines, expected 2"
  exit 1
fi

if [ ! -s "$SITE/MANIFEST.txt" ]; then
  echo "FAIL: MANIFEST.txt is missing or empty"
  exit 1
fi

COUNT=$(tail -n 1 "$SITE/MANIFEST.txt" | tr -d '[:space:]')
case "$COUNT" in
  ''|*[!0-9]*)
    echo "FAIL: the last line of MANIFEST.txt is not a number: '$COUNT'"
    exit 1
    ;;
esac

if [ "$COUNT" -ne 1 ]; then
  echo "FAIL: MANIFEST.txt reports $COUNT pages, but the folder holds 1"
  exit 1
fi

echo "PASS"
