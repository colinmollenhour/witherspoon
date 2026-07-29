#!/usr/bin/env python3
"""
test_annotations_cover_six  —  weight 10

Verifies that `annotations` holds at least six entries, that each one quotes a DISTINCT
line, that every quoted line appears verbatim somewhere in the three submitted captures,
and that each entry has a non-empty WHAT IT IS and a WHAT IT DOES of at least 8 words.

This test cannot judge whether an annotation is any good — that is the rubric's craft
criterion. It can prove the annotated lines were really captured, which is what stops
six invented headers from scoring.

Prints PASS or a line beginning FAIL:.
"""

import json
import re
import sys

MINIMUM = 6
MIN_DOES_WORDS = 8
CAPTURE_FIELDS = ("curl_v_public", "curl_i_redirect", "curl_i_local")


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def parse(raw):
    """Split the annotations blob into entries keyed by LINE."""
    entries = []
    current = None
    for line in raw.splitlines():
        stripped = line.strip()
        match = re.match(r"^-?\s*LINE:\s*`(.+?)`\s*$", stripped)
        if match:
            current = {"line": match.group(1), "is": "", "does": ""}
            entries.append(current)
            continue
        if current is None:
            continue
        is_match = re.match(r"^WHAT IT IS:\s*(.*)$", stripped, re.IGNORECASE)
        if is_match:
            current["is"] = is_match.group(1).strip()
            current["_last"] = "is"
            continue
        does_match = re.match(r"^WHAT IT DOES:\s*(.*)$", stripped, re.IGNORECASE)
        if does_match:
            current["does"] = does_match.group(1).strip()
            current["_last"] = "does"
            continue
        if re.match(r"^SOURCE:", stripped, re.IGNORECASE):
            current["_last"] = None
            continue
        if stripped and current.get("_last"):
            current[current["_last"]] = (current[current["_last"]] + " " + stripped).strip()
    return entries


def main(path):
    data = load(path)
    raw = data.get("annotations", "")

    if not isinstance(raw, str) or not raw.strip():
        print("FAIL: annotations is empty. Annotate at least %d lines from your captures."
              % MINIMUM)
        return 1

    if "TODO" in raw:
        print("FAIL: annotations still contains TODO placeholders from the starter.")
        return 1

    entries = parse(raw)

    if len(entries) < MINIMUM:
        print("FAIL: found %d annotation entries, need at least %d. Each entry starts with a "
              "line of the form:  - LINE: `<the captured line>`" % (len(entries), MINIMUM))
        return 1

    seen = set()
    for entry in entries:
        if entry["line"] in seen:
            print("FAIL: the line `%s` is annotated more than once. The %d entries must quote %d "
                  "DISTINCT lines." % (entry["line"], MINIMUM, MINIMUM))
            return 1
        seen.add(entry["line"])

    haystack = "\n".join(str(data.get(field, "")) for field in CAPTURE_FIELDS)

    for entry in entries:
        if entry["line"] not in haystack:
            print("FAIL: the annotated line `%s` does not appear in curl_v_public, "
                  "curl_i_redirect, or curl_i_local. Annotate lines you actually captured, and "
                  "copy them character for character." % entry["line"])
            return 1
        if not entry["is"]:
            print("FAIL: the entry for `%s` has an empty WHAT IT IS. Name the line's job: "
                  "request line, request header, status line, response header."
                  % entry["line"])
            return 1
        words = len(entry["does"].split())
        if words < MIN_DOES_WORDS:
            print("FAIL: the entry for `%s` has a WHAT IT DOES of %d word(s); at least %d are "
                  "required. Say what changes because that line is there, not what the line says."
                  % (entry["line"], words, MIN_DOES_WORDS))
            return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
