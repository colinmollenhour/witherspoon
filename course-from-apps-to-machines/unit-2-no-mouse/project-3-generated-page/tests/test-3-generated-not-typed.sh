#!/bin/bash
# ============================================================================
#  TEST 3 — ADVERSARIAL: the page was generated, not typed     weight: 20
#
#  Catches the learner who produced a correct index.html by opening it in nano
#  or VS Code and typing the two lines, then left build.sh as a stub. The
#  artifacts would look right; the script would not contain the operators that
#  are the actual subject of this unit.
#
#  Reads the script source with every comment line stripped, so a `>>` sitting
#  inside a comment cannot pass the test on its own.
#
#  Prints exactly: PASS
# ============================================================================

BUILD_SH="${BUILD_SH:-$HOME/build.sh}"

if [ ! -f "$BUILD_SH" ]; then
  echo "FAIL: no build.sh found at $BUILD_SH"
  exit 1
fi

FIRST=$(head -n 1 "$BUILD_SH")
case "$FIRST" in
  '#!'/*)
    ;;
  *)
    echo "FAIL: first line is not a shebang naming an absolute path: '$FIRST'"
    exit 1
    ;;
esac

CODE=$(grep -v '^[[:space:]]*#' "$BUILD_SH")

if ! printf '%s\n' "$CODE" | grep -q '>[[:space:]]*index\.html'; then
  echo "FAIL: nothing in build.sh redirects into index.html"
  exit 1
fi

if ! printf '%s\n' "$CODE" | grep -q '>>[[:space:]]*index\.html'; then
  echo "FAIL: build.sh never appends to index.html with >>"
  exit 1
fi

if ! printf '%s\n' "$CODE" | grep -q '>>[[:space:]]*MANIFEST\.txt'; then
  echo "FAIL: build.sh never appends to MANIFEST.txt with >>"
  exit 1
fi

if ! printf '%s\n' "$CODE" | grep -q '|'; then
  echo "FAIL: build.sh contains no pipe"
  exit 1
fi

if ! printf '%s\n' "$CODE" | grep -q 'wc'; then
  echo "FAIL: build.sh never calls wc"
  exit 1
fi

if printf '%s\n' "$CODE" | grep -qE '(^|[[:space:]])(nano|vim|vi|code)([[:space:]]|$)'; then
  echo "FAIL: build.sh launches an editor - the page must be built from command output"
  exit 1
fi

echo "PASS"
