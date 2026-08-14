#!/bin/bash
# ============================================================================
#  Runs every test case against a submitted build.sh and prints the score.
#
#      BUILD_SH=/path/to/build.sh ./run-all.sh
#
#  Defaults to $HOME/build.sh, which is where the runner puts code cell 4.
#  Each test is self-contained and prints PASS or a FAIL line explaining what
#  it caught. Weights sum to 100.
# ============================================================================

HERE="$(cd "$(dirname "$0")" && pwd)"
export BUILD_SH="${BUILD_SH:-$HOME/build.sh}"

TOTAL=0

run_case() {
  name="$1"
  weight="$2"
  out=$(bash "$HERE/$name" 2>&1)
  if [ "$out" = "PASS" ]; then
    TOTAL=$((TOTAL + weight))
    echo "[$weight/$weight] $name"
  else
    echo "[0/$weight] $name"
    echo "         $out"
  fi
}

run_case test-1-canonical.sh 40
run_case test-2-awkward-count.sh 30
run_case test-3-generated-not-typed.sh 20
run_case test-4-rerun.sh 10

echo "score: $TOTAL/100"
