#!/usr/bin/env python3
"""Test 1 of 4 — weight 30.

Checks that the submission is complete and internally consistent: all five fields
present and non-empty, `platform` is one of the three supported words, the
`absolute_path` ends where the project asked it to end and carries the home prefix
that matches the declared platform, and `mouse_actions` parses as the required
`actions=<n> apps=<n>` pair.

Expected output: PASS
Usage: python3 test_1_fields_and_home.py [path/to/submission.txt]
"""

import os
import re
import sys

TAIL = "/projects/first-site/index.html"
REQUIRED = ["platform", "absolute_path", "file_url", "mouse_actions", "ls_la_line"]
PLATFORMS = {"macos": "macOS", "linux": "Linux", "wsl": "WSL"}
PLACEHOLDERS = ("<you>", "<your count>", "<n>", "<integer>")


def default_submission():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, os.pardir, "starter", "submission.txt"))


def load(path):
    fields = {}
    try:
        handle = open(path, encoding="utf-8")
    except OSError as exc:
        fail("cannot read the submission file at %s (%s)" % (path, exc.__class__.__name__))
    with handle:
        for raw in handle:
            line = raw.rstrip("\n").rstrip("\r")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if ":" not in line:
                continue
            key, _, value = line.partition(":")
            key = key.strip()
            if not re.fullmatch(r"[a-z_]+", key):
                continue
            fields[key] = value.strip()
    return fields


def fail(message):
    print("FAIL: " + message)
    raise SystemExit(1)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else default_submission()
    fields = load(path)

    for name in REQUIRED:
        if name not in fields:
            fail("field '%s' is missing from the submission; all five field names must stay exactly "
                 "as given in starter/submission.txt" % name)
        if not fields[name]:
            fail("field '%s' is empty; every field needs a value you read off your own screen" % name)
        for token in PLACEHOLDERS:
            if token in fields[name]:
                fail("field '%s' still contains the template placeholder '%s'" % (name, token))
        if fields[name][0] in "$%":
            fail("field '%s' starts with '%s' — that is the shell prompt, not your output; the '$' is "
                 "a command prompt and is not meant to be typed in" % (name, fields[name][0]))

    key = fields["platform"].strip().lower()
    if key not in PLATFORMS:
        fail("platform is '%s'; it must be exactly one of macOS, Linux, WSL" % fields["platform"])
    platform = PLATFORMS[key]

    path_value = fields["absolute_path"]
    if " " in path_value or "\t" in path_value:
        fail("absolute_path contains a space; name the folders 'projects' and 'first-site' with no "
             "spaces so the path can be typed as one argument later")
    if not path_value.endswith(TAIL):
        fail("absolute_path is '%s'; it must end with the exact string '%s'" % (path_value, TAIL))

    if platform == "macOS":
        if not path_value.startswith("/Users/"):
            fail("platform is macOS but absolute_path does not start with '/Users/'; macOS home "
                 "directories live under /Users")
    else:
        if path_value.startswith("/mnt/"):
            fail("platform is %s but absolute_path is under /mnt/, which is the Windows side seen "
                 "from Linux; Microsoft recommends storing your files in the WSL file system, so this "
                 "belongs at /home/<you>%s" % (platform, TAIL))
        if not path_value.startswith("/home/"):
            fail("platform is %s but absolute_path does not start with '/home/'; Linux and WSL home "
                 "directories live under /home" % platform)

    match = re.fullmatch(r"actions\s*=\s*(\d+)\s+apps\s*=\s*(\d+)", fields["mouse_actions"])
    if match is None:
        fail("mouse_actions is '%s'; it must read exactly 'actions=<n> apps=<n>' with two whole "
             "numbers" % fields["mouse_actions"])
    actions, apps = int(match.group(1)), int(match.group(2))
    if actions < 1:
        fail("mouse_actions reports actions=0; creating two folders and a file takes at least one "
             "action")
    if apps < 1:
        fail("mouse_actions reports apps=0; you used at least one application")

    print("PASS")


if __name__ == "__main__":
    main()
