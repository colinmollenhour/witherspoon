#!/bin/bash
# ============================================================================
#  TEST 2 — ADVERSARIAL: the count must be computed        weight: 30
#
#  Catches the learner who resolved TODO B by typing the answer instead of
#  producing it - either leaving `echo "0"` in place, or replacing it with
#  `echo "1"` after looking at their own folder once.
#
#  The folder is seeded with a deliberately awkward number of pages before the
#  script runs: 12 extra .html files plus the generated index.html = 13.
#  Nothing about 13 can be guessed from the starter, and it is not a number
#  anyone reaches by rounding.
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

# --- seed 12 extra pages; index.html will make 13 ---
for n in 01 02 03 04 05 06 07 08 09 10 11 12; do
  echo "<title>page $n</title>" > "$SITE/page-$n.html"
done

cp "$BUILD_SH" "$HOME/build.sh"
chmod +x "$HOME/build.sh"
cd "$HOME" || { echo "FAIL: could not enter the sandbox home"; exit 1; }
./build.sh > "$HOME/run.log" 2>&1
STATUS=$?

if [ "$STATUS" -ne 0 ]; then
  echo "FAIL: build.sh exited with status $STATUS"
  exit 1
fi

if [ ! -s "$SITE/MANIFEST.txt" ]; then
  echo "FAIL: MANIFEST.txt is missing or empty"
  exit 1
fi

# what the folder really holds, computed the same way the script should
REAL=$(cd "$SITE" && ls -la | grep html | wc -l)

COUNT=$(tail -n 1 "$SITE/MANIFEST.txt" | tr -d '[:space:]')
case "$COUNT" in
  ''|*[!0-9]*)
    echo "FAIL: the last line of MANIFEST.txt is not a number: '$COUNT'"
    exit 1
    ;;
esac

if [ "$REAL" -ne 13 ]; then
  echo "FAIL: test setup is wrong - the folder holds $REAL pages, expected 13"
  exit 1
fi

if [ "$COUNT" -ne "$REAL" ]; then
  echo "FAIL: MANIFEST.txt reports $COUNT pages, but the folder holds $REAL - the count was typed, not computed"
  exit 1
fi

echo "PASS"
