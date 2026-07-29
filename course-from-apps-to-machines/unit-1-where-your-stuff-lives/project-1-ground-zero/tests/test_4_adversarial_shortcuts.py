#!/usr/bin/env python3
"""Test 4 of 4 — weight 25. ADVERSARIAL.

This test exists to catch four specific shortcuts, each of which produces a
submission that LOOKS finished while proving nothing about the learner's machine:

  (a) a RELATIVE path submitted as if it were absolute — for example
      'projects/first-site/index.html' or './first-site/index.html'. A path is
      absolute only when its first character is '/'.
  (b) a '~'-ABBREVIATED path — '~/projects/first-site/index.html'. '~' is an
      abbreviation the shell expands to $HOME; this field wants what it expands to.
  (c) a WINDOWS-STYLE path — 'C:\\Users\\you\\projects\\first-site\\index.html', a
      drive letter, or any backslash used as a separator.
  (d) a file_url that is actually an http:// URL copied from a tutorial, including
      'http://localhost:8000/' and 'http://127.0.0.1:8000/', or a bare filesystem
      path pasted where a URL belongs. Double-clicking a file on disk does not
      produce an http:// URL — that comes later in the course, from a server the
      learner has not started yet.

Expected output: PASS
Usage: python3 test_4_adversarial_shortcuts.py [path/to/submission.txt]
"""

import os
import re
import sys

DRIVE_LETTER = re.compile(r"^[A-Za-z]:")


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


def check_path(value):
    if value.startswith("~"):
        fail("absolute_path is '%s', which is a '~'-abbreviated path. '~' is shorthand your shell "
             "expands to your home directory; this field wants the expanded form — /Users/<you>/... "
             "or /home/<you>/..." % value)

    if DRIVE_LETTER.match(value):
        fail("absolute_path is '%s', which is a Windows drive-letter path. This course works in the "
             "POSIX filesystem: on WSL your project belongs at /home/<you>/projects/first-site/"
             "index.html, not on a lettered drive" % value)

    if "\\" in value:
        fail("absolute_path is '%s' and uses backslashes as separators. POSIX paths separate their "
             "steps with '/'" % value)

    if not value.startswith("/"):
        fail("absolute_path is '%s', which is a RELATIVE path — it has no leading '/', so it is "
             "measured from wherever you happen to be standing rather than from the root of the "
             "machine. An absolute path begins with '/'" % value)

    segments = value.split("/")
    if "." in segments or ".." in segments:
        fail("absolute_path is '%s' and still contains a '.' or '..' segment. Those are relative "
             "movements; resolve them and submit the plain absolute path" % value)

    if "//" in value:
        fail("absolute_path is '%s' and contains an empty path segment ('//')" % value)


def check_url(value, submitted_path):
    lowered = value.lower()

    if value == submitted_path:
        fail("file_url is identical to absolute_path — a filesystem path with no scheme is not a URL. "
             "The address bar shows a scheme first")

    if lowered.startswith("http://") or lowered.startswith("https://"):
        fail("file_url is '%s', which is an http URL. Double-clicking a file on disk opens it through "
             "the file:// scheme; an http:// address means a server answered, and you have not "
             "started one. Copy what YOUR address bar said" % value)

    for authority in ("://localhost", "://127.0.0.1", "://0.0.0.0"):
        if authority in lowered:
            fail("file_url points at '%s', which is a running web server, not a file opened from "
                 "disk. This project has no server in it" % authority.lstrip(":/"))

    if not lowered.startswith("file://"):
        for token in ("localhost", "127.0.0.1", "0.0.0.0", ":8000"):
            if token in lowered:
                fail("file_url is '%s', which names a web server rather than a file on disk. Nothing "
                     "in this project starts a server; copy what YOUR address bar said" % value)
        if value.startswith("~") or value.startswith("/") or DRIVE_LETTER.match(value):
            fail("file_url is '%s', which is a filesystem path rather than a URL. The address bar "
                 "shows a scheme first — 'file://' followed by the path" % value)
        fail("file_url is '%s' and does not begin with the file:// scheme; that is not the address "
             "bar's text" % value)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else default_submission()
    fields = load(path)

    submitted_path = fields.get("absolute_path", "")
    url = fields.get("file_url", "")

    if not submitted_path:
        fail("field 'absolute_path' is missing or empty")
    if not url:
        fail("field 'file_url' is missing or empty")

    check_path(submitted_path)
    check_url(url, submitted_path)

    print("PASS")


if __name__ == "__main__":
    main()
