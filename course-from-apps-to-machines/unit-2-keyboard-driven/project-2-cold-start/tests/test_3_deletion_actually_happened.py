#!/usr/bin/env python3
"""Test 3 of 4 - deletion_actually_happened (weight 25). ADVERSARIAL.

Catches the learner who never actually deleted anything and submitted the commands they would
have run. Three shortcuts, all of which produce a plausible-looking transcript:

  (a) There is no rm line at all - the Project 1 folder was still on disk the whole time.
  (b) The rm deletes only index.html, not the folder, so `mkdir` had nothing to recreate.
  (c) The rm appears after the mkdir, so the transcript rebuilds a folder it has not destroyed yet.

It also catches the transcript that could not have run as written: a bare `mkdir` (no -p) aimed at
~/projects/first-site with no earlier rm of that folder would have hit the directory left over from
Project 1 and printed `mkdir: cannot create directory '.../a': File exists`.

Prints PASS, or FAIL: <reason>.

Usage: python3 test_3_deletion_actually_happened.py [path/to/submission.md]
"""

import pathlib
import re
import sys

DEFAULT = pathlib.Path(__file__).resolve().parents[1] / "starter" / "submission.md"
FIELDS = ("commands", "command_count", "pwd_output", "ls_la_output",
          "grep_output", "project_1_mouse_actions")
PROMPT = re.compile(r"^\s*(?:\d+\s+)?(?:[$%]\s+)?")
HEADING = re.compile(r"^##\s+([a-z0-9_]+)\s*$")


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


def command_lines(raw):
    out = []
    for line in raw.splitlines():
        stripped = PROMPT.sub("", line).strip()
        if stripped:
            out.append(stripped)
    return out


def words(line):
    return line.replace('"', " ").replace("'", " ").split()


def has_flag(tokens, shorts, longs):
    for token in tokens[1:]:
        if token in longs:
            return True
        if token.startswith("--") or not token.startswith("-") or len(token) < 2:
            continue
        if any(short in token[1:] for short in shorts):
            return True
    return False


def arguments(tokens):
    return [t.rstrip("/") for t in tokens[1:] if not t.startswith("-")]


def is_the_folder(arg):
    return arg.endswith("projects/first-site") or arg == "first-site"


def main():
    fields = read_fields()
    lines = command_lines(fields["commands"])
    if not lines:
        fail("the commands field is empty - nothing to check")

    mkdir_idx, mkdir_has_p = None, False
    folder_rm, file_only_rm = [], []

    for i, line in enumerate(lines):
        tokens = words(line)
        if not tokens:
            continue
        name, args = tokens[0], arguments(tokens)
        if name == "mkdir" and mkdir_idx is None and any(is_the_folder(a) for a in args):
            mkdir_idx = i
            mkdir_has_p = has_flag(tokens, ("p",), ("--parents",))
        if name == "rm":
            if any(is_the_folder(a) for a in args) and has_flag(tokens, ("r", "R"), ("--recursive",)):
                folder_rm.append(i)
            elif args:
                file_only_rm.append(i)

    if mkdir_idx is None:
        fail("no mkdir line names a path ending in projects/first-site - the folder was never "
             "rebuilt, so nothing here is a cold start")

    if not folder_rm:
        if not mkdir_has_p:
            fail("line %d is a bare `mkdir` aimed at projects/first-site with no earlier rm of "
                 "that folder - the Project 1 directory was still there, so this command would "
                 "have printed `mkdir: cannot create directory '.../a': File exists` rather than "
                 "succeeding" % (mkdir_idx + 1))
        if file_only_rm:
            fail("line %d deletes a file but no line deletes the folder ~/projects/first-site "
                 "itself - rm refuses directories by default, so a folder deletion needs -r"
                 % (file_only_rm[0] + 1))
        fail("no `rm -r` line names ~/projects/first-site - the folder was never deleted, so the "
             "rebuild started from the folder that was already there")

    before = [i for i in folder_rm if i < mkdir_idx]
    if not before:
        fail("the rm of ~/projects/first-site is at line %d but the mkdir is at line %d - this "
             "transcript rebuilds the folder before destroying it, which is not a cold start"
             % (folder_rm[0] + 1, mkdir_idx + 1))

    print("PASS")


main()
