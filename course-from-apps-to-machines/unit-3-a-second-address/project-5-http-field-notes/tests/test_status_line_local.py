#!/usr/bin/env python3
"""
test_status_line_local  —  weight 10

Verifies that `status_line_local` is exactly `HTTP/1.0 200 OK` and that it is the first
non-empty line of `curl_i_local` — that the learner copied the status line out of their
own capture rather than writing down what they expected it to say.

Prints PASS or a line beginning FAIL:.
"""

import json
import sys

EXPECTED = "HTTP/1.0 200 OK"


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(path):
    data = load(path)
    value = data.get("status_line_local", "")
    capture = data.get("curl_i_local", "")

    if not isinstance(value, str) or not value.strip():
        print("FAIL: status_line_local is empty. Copy the first line of your curl_i_local "
              "capture.")
        return 1

    if "TODO" in value:
        print("FAIL: status_line_local still contains the TODO placeholder from the starter.")
        return 1

    normalised = " ".join(value.split())

    if normalised != EXPECTED:
        print("FAIL: status_line_local is '%s'. Expected '%s' — the three slots of a status line "
              "are <protocol> <status-code> <reason-phrase>, and this server answers HTTP/1.0."
              % (normalised, EXPECTED))
        return 1

    first = next((line.strip() for line in str(capture).splitlines() if line.strip()), "")
    if " ".join(first.split()) != EXPECTED:
        print("FAIL: status_line_local says '%s' but the first non-empty line of curl_i_local is "
              "'%s'. Copy the status line out of your own capture." % (EXPECTED, first))
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
