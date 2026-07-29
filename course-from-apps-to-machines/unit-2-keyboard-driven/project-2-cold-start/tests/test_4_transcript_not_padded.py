#!/usr/bin/env python3
"""Test 4 of 4 - transcript_not_padded (weight 20). ADVERSARIAL.

Catches the learner who pads or trims the transcript instead of reporting what they ran. Three
shortcuts:

  (a) command_count does not match the number of command lines in the learner's own commands
      field - a count trimmed to fit the eight-command budget, or padded to look like more work.
  (b) A line in commands is terminal output rather than a command: it does not begin with a word
      that could be a command name.
  (c) `history` or `clear` is counted as part of the rebuild. history is how the transcript is read
      back; it is not work the rebuild required.

Prints PASS, or FAIL: <reason>.

Usage: python3 test_4_transcript_not_padded.py [path/to/submission.md]
"""

import pathlib
import re
import sys

DEFAULT = pathlib.Path(__file__).resolve().parents[1] / "starter" / "submission.md"
FIELDS = ("commands", "command_count", "pwd_output", "ls_la_output",
          "grep_output", "project_1_mouse_actions")
PROMPT = re.compile(r"^\s*(?:\d+\s+)?(?:[$%]\s+)?")
HEADING = re.compile(r"^##\s+([a-z0-9_]+)\s*$")
COMMAND_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_.\-]*$")
NOT_WORK = ("history", "clear")


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


def main():
    fields = read_fields()

    lines = command_lines(fields["commands"])
    if not lines:
        fail("the commands field is empty - paste the transcript, one command per line")

    for i, line in enumerate(lines):
        first = line.split()[0]
        if not COMMAND_NAME.match(first):
            fail("line %d of commands starts with %r, which is not a command name - "
                 "this line is output, not something you ran: %r" % (i + 1, first, line))
        if first in NOT_WORK:
            fail("line %d of commands is %r - that is not part of the rebuild; remove it and "
                 "recount" % (i + 1, first))

    raw_count = fields["command_count"]
    if not re.fullmatch(r"\d+", raw_count):
        fail("command_count must be a single whole number, got %r" % raw_count)
    declared = int(raw_count)

    if declared != len(lines):
        fail("command_count says %d but the commands field holds %d command lines - "
             "the count has to be the transcript's own line count" % (declared, len(lines)))

    raw_mouse = fields["project_1_mouse_actions"]
    if not re.fullmatch(r"\d+", raw_mouse):
        fail("project_1_mouse_actions must be a single whole number, got %r - it is the count you "
             "recorded in Project 1, not a range or an estimate" % raw_mouse)
    if int(raw_mouse) < 1:
        fail("project_1_mouse_actions is %s - Project 1 took more than zero mouse actions"
             % raw_mouse)

    print("PASS")


main()
