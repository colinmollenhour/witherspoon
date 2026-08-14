#!/bin/bash
# ============================================================================
#  TEST 4 — running it twice changes nothing                    weight: 10
#
#  Catches the learner who decided that >> is simply the safe arrow and used
#  it everywhere, including on the line that starts each file. That script is
#  correct exactly once: run it a second time and index.html has four lines
#  and MANIFEST.txt has two of everything.
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

SITE="$HOME/projects/first-site"

cp "$BUILD_SH" "$HOME/build.sh"
chmod +x "$HOME/build.sh"
cd "$HOME" || { echo "FAIL: could not enter the sandbox home"; exit 1; }

./build.sh > "$HOME/run1.log" 2>&1

if [ ! -f "$SITE/index.html" ] || [ ! -f "$SITE/MANIFEST.txt" ]; then
  echo "FAIL: the first run did not produce both index.html and MANIFEST.txt"
  exit 1
fi

PAGE_1=$(wc -l < "$SITE/index.html")
MAN_1=$(wc -l < "$SITE/MANIFEST.txt")

./build.sh > "$HOME/run2.log" 2>&1
STATUS=$?
PAGE_2=$(wc -l < "$SITE/index.html")
MAN_2=$(wc -l < "$SITE/MANIFEST.txt")

if [ "$STATUS" -ne 0 ]; then
  echo "FAIL: the second run of build.sh exited with status $STATUS"
  exit 1
fi

if [ "$PAGE_1" -ne 2 ] || [ "$PAGE_2" -ne 2 ]; then
  echo "FAIL: index.html had $PAGE_1 lines after one run and $PAGE_2 after two, expected 2 and 2"
  exit 1
fi

if [ "$MAN_1" -ne "$MAN_2" ]; then
  echo "FAIL: MANIFEST.txt grew from $MAN_1 lines to $MAN_2 - a file is being started with >> instead of >"
  exit 1
fi

COUNT=$(tail -n 1 "$SITE/MANIFEST.txt" | tr -d '[:space:]')
if [ "$COUNT" != "1" ]; then
  echo "FAIL: after two runs MANIFEST.txt reports '$COUNT' pages, expected 1"
  exit 1
fi

echo "PASS"
