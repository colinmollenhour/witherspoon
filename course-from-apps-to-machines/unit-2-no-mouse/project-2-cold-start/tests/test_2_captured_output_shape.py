#!/usr/bin/env python3
"""Test 2 of 4 - captured_output_shape (weight 25).

The three captures are real terminal output from the rebuilt folder: pwd is one absolute path
ending in /projects/first-site, ls -la is a long listing containing `.`, `..` and index.html, and
grep_output is in the single-file `line:text` form with the <title> match in it.

Prints PASS, or FAIL: <reason>.

Usage: python3 test_2_captured_output_shape.py [path/to/submission.md]
"""

import pathlib
import re
import sys

DEFAULT = pathlib.Path(__file__).resolve().parents[1] / "starter" / "submission.md"
FIELDS = ("commands", "command_count", "pwd_output", "ls_la_output",
          "grep_output", "project_1_mouse_actions")
PROMPT = re.compile(r"^\s*(?:\d+\s+)?(?:[$%]\s+)?")
HEADING = re.compile(r"^##\s+([a-z0-9_]+)\s*$")
MODE = re.compile(r"^[-dlbcps][rwxsStT-]{9}[.+@]?$")
GREP_LINE = re.compile(r"^\s*(\d+):")


def fail(message):
    print("FAIL: " + message)
    raise SystemExit(0)


def read_fields():
    path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    if not path.is_file():
        fail("no submission file at %s" % path)
    found, current, in_fence = {}, None, False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            match = HEADING.match(line)
            if match:
                current = match.group(1)
                found.setdefault(current, [])
            continue
        if current is not None:
            found[current].append(line)
    return {name: "\n".join(found.get(name, [])).strip() for name in FIELDS}


def output_lines(raw):
    return [PROMPT.sub("", line).rstrip() for line in raw.splitlines() if line.strip()]


def main():
    fields = read_fields()

    # --- pwd_output ---
    pwd = output_lines(fields["pwd_output"])
    if not pwd:
        fail("pwd_output is empty - run pwd inside the rebuilt folder and paste the line")
    if len(pwd) > 1:
        fail("pwd_output has %d lines - pwd prints exactly one" % len(pwd))
    here = pwd[0].strip().rstrip("/")
    if not here.startswith("/"):
        fail("pwd_output %r is not an absolute path - pwd always prints one starting with /" % here)
    if not here.endswith("/projects/first-site"):
        fail("pwd_output ends at %r - you were not standing in the rebuilt folder when you ran pwd"
             % here)

    # --- ls_la_output ---
    listing = output_lines(fields["ls_la_output"])
    if not listing:
        fail("ls_la_output is empty - run ls -la in the rebuilt folder and paste every line")
    last_fields, mode_ok = set(), False
    for line in listing:
        parts = line.split()
        if not parts:
            continue
        last_fields.add(parts[-1])
        if MODE.match(parts[0]):
            mode_ok = True
    if not mode_ok:
        fail("no line of ls_la_output starts with a mode string like -rw-r--r-- or drwxr-xr-x - "
             "this is not `ls -la` output")
    if "." not in last_fields:
        fail("ls_la_output has no `.` entry - that line only appears with -a, so this is `ls -l`")
    if ".." not in last_fields:
        fail("ls_la_output has no `..` entry - paste the whole listing, not the lines you picked")
    if "index.html" not in last_fields:
        fail("ls_la_output has no index.html entry - the file did not land in the rebuilt folder")

    # --- grep_output ---
    grep = output_lines(fields["grep_output"])
    if not grep:
        fail("grep_output is empty - grep found no <title> line, so index.html has no contents; "
             "touch creates the file empty, so restore it from the copy you took")
    for line in grep:
        if line.lstrip().startswith("index.html:"):
            fail("grep_output line %r carries a path: prefix - you searched a directory; point "
                 "grep at the single file index.html" % line.strip())
    matched = [line for line in grep if GREP_LINE.match(line) and "<title>" in line]
    if not matched:
        fail("no line of grep_output is in `<number>: ...<title>...` form - "
             "run grep -n \"<title>\" index.html and paste what it prints")

    print("PASS")


main()
