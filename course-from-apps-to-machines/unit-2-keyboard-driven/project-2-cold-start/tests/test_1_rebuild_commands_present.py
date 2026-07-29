#!/usr/bin/env python3
"""Test 1 of 4 - rebuild_commands_present (weight 30).

Every field is filled in, the budget parses, and the four commands that make a cold-start
rebuild are all present in the transcript: the backup copy, the recursive delete, the one-command
`mkdir -p`, and the command that puts index.html back.

Prints PASS, or FAIL: <reason>.

Usage: python3 test_1_rebuild_commands_present.py [path/to/submission.md]
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


def positive_int(raw, field):
    if not re.fullmatch(r"\d+", raw):
        fail("%s must be a single whole number, got %r" % (field, raw))
    value = int(raw)
    if value < 1:
        fail("%s must be a positive integer, got %d" % (field, value))
    return value


def main():
    fields = read_fields()

    for name in FIELDS:
        if not fields[name]:
            fail("field %r is empty - fill in every fenced block in submission.md" % name)

    count = positive_int(fields["command_count"], "command_count")
    if count > 8:
        fail("command_count is %d - the budget is 8 commands or fewer" % count)
    positive_int(fields["project_1_mouse_actions"], "project_1_mouse_actions")

    lines = command_lines(fields["commands"])
    if not lines:
        fail("the commands field has no command lines in it")

    rm_idx = None
    mkdir_idx = None
    backup_idx = None
    restore_idx = None

    for i, line in enumerate(lines):
        tokens = words(line)
        if not tokens:
            continue
        name, args = tokens[0], arguments(tokens)
        if name == "rm" and rm_idx is None:
            rm_idx = i
        if name == "mkdir" and mkdir_idx is None:
            if any(a.endswith("projects/first-site") for a in args) \
                    and has_flag(tokens, ("p",), ("--parents",)):
                mkdir_idx = i
        if name == "cp" and backup_idx is None and (rm_idx is None or i < rm_idx):
            if any(a.endswith("index.html") or "first-site" in a for a in args):
                backup_idx = i
        if name in ("cp", "touch") and mkdir_idx is not None and i > mkdir_idx:
            if restore_idx is None and any(a.endswith("index.html") for a in args):
                restore_idx = i

    if backup_idx is None:
        fail("no cp line taking index.html out of ~/projects/first-site before the first rm - "
             "without a copy there is no way to get the <title> line back")
    if rm_idx is None:
        fail("no rm line in the transcript - the folder was never deleted")
    if mkdir_idx is None:
        fail("no `mkdir -p` line naming a path ending in projects/first-site")
    if restore_idx is None:
        fail("no cp or touch line naming index.html after the mkdir - the folder was rebuilt empty")

    if count != len(lines):
        fail("command_count is %d but the commands field holds %d command lines"
             % (count, len(lines)))

    print("PASS")


main()
