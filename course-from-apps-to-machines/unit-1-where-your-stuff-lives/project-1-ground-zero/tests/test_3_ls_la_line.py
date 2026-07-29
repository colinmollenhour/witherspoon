#!/usr/bin/env python3
"""Test 3 of 4 — weight 20.

Checks that `ls_la_line` is one row of long-listing output describing a REGULAR
FILE named index.html: a 10- or 11-character mode string beginning with '-', three
valid rwx triples, a whole-number link count, a whole-number size greater than
zero, at least eight whitespace-separated fields, and a final field of exactly
'index.html'.

An eleventh character after the ten permission characters is accepted: on Fedora
and RHEL a trailing '.' is an SELinux security-context marker, and plain Ubuntu
prints ten characters and no dot.

Expected output: PASS
Usage: python3 test_3_ls_la_line.py [path/to/submission.txt]
"""

import os
import re
import sys

TRIPLES = re.compile(r"[-r][-w][-xsS][-r][-w][-xsS][-r][-w][-xtT]")


def default_submission():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, os.pardir, "starter", "submission.txt"))


def fail(message):
    print("FAIL: " + message)
    raise SystemExit(1)


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


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else default_submission()
    fields = load(path)

    line = fields.get("ls_la_line", "")
    if not line:
        fail("field 'ls_la_line' is missing or empty; run 'ls -la ~/projects/first-site' and copy the "
             "index.html row")

    if line[0] in "$%":
        fail("ls_la_line starts with '%s' — that is the shell prompt, not the listing; the '$' is a "
             "command prompt and is not meant to be typed in" % line[0])

    if line.startswith("ls ") or line.startswith("ls -"):
        fail("ls_la_line contains the command you typed, not the line it printed; copy the output row "
             "for index.html")

    if line.lower().startswith("total"):
        fail("ls_la_line is the 'total' summary line, not a file's row; copy the row that ends in "
             "index.html")

    parts = line.split()
    if len(parts) < 8:
        fail("ls_la_line has only %d whitespace-separated fields; a long listing row has at least "
             "eight: mode, link count, owner, group, size, and the modification time and name"
             % len(parts))

    mode = parts[0]
    if len(mode) not in (10, 11):
        fail("the first field of ls_la_line is '%s' (%d characters); a mode string is 10 characters, "
             "or 11 when the system appends a security-context marker" % (mode, len(mode)))

    if mode[0] == "d":
        fail("the type character of ls_la_line is 'd', so you copied a DIRECTORY's row; index.html is "
             "a regular file and its row starts with '-'")
    if mode[0] != "-":
        fail("the type character of ls_la_line is '%s'; a regular file's row starts with '-'" % mode[0])

    if TRIPLES.fullmatch(mode[1:10]) is None:
        fail("characters 2-10 of the mode string are '%s', which is not three valid rwx triples; copy "
             "the line without editing it" % mode[1:10])

    if not parts[1].isdigit():
        fail("the second field of ls_la_line is '%s'; that position is the link count and must be a "
             "whole number" % parts[1])

    name = parts[-1]
    if name == "Index.html":
        fail("ls_la_line ends in 'Index.html' with a capital I; the project asks for 'index.html'. "
             "On Linux and on the WSL Linux filesystem those are two different files")
    if name != "index.html":
        fail("ls_la_line ends in '%s'; it must be the row for 'index.html'" % name)

    if not parts[4].isdigit():
        fail("the fifth field of ls_la_line is '%s'; that position is the size in bytes and must be a "
             "whole number — the fields run mode, link count, owner, group, size" % parts[4])

    if int(parts[4]) <= 0:
        fail("ls_la_line reports a size of 0 bytes, so index.html was saved empty; type a line of "
             "HTML into it and save again")

    print("PASS")


if __name__ == "__main__":
    main()
