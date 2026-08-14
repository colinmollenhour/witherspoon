#!/usr/bin/env python3
"""Test 2 of 4 — weight 25.

Checks that `file_url` and `absolute_path` name the SAME file. The URL must begin
with the file:// scheme and end with the submitted absolute path. On macOS and
Linux the two must line up exactly — file:// followed by the path. On WSL the URL
is allowed to carry extra prefix material before the Linux path, because the
browser and the file sit on opposite sides of the Windows/Linux seam; only the
scheme and the tail are required there.

Percent-encoding in the address bar is decoded before comparison.

Expected output: PASS
Usage: python3 test_2_url_matches_path.py [path/to/submission.txt]
"""

import os
import re
import sys
from urllib.parse import unquote

REQUIRED = ["platform", "absolute_path", "file_url"]


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

    for name in REQUIRED:
        if not fields.get(name):
            fail("field '%s' is missing or empty; this test needs platform, absolute_path and "
                 "file_url" % name)

    platform = fields["platform"].strip().lower()
    if platform not in ("macos", "linux", "wsl"):
        fail("platform is '%s'; it must be exactly one of macOS, Linux, WSL" % fields["platform"])

    raw_url = fields["file_url"]
    url = unquote(raw_url)
    target = fields["absolute_path"]

    if not url.startswith("file://"):
        fail("file_url is '%s'; the address bar after double-clicking a file on disk begins with "
             "'file://'" % raw_url)

    if url.rstrip("/") == "file:":
        fail("file_url is just the scheme with no path; copy the whole address bar")

    if not url.endswith(target):
        fail("file_url does not end with absolute_path — the URL and the path name different files. "
             "url='%s' path='%s'" % (raw_url, target))

    if platform in ("macos", "linux"):
        expected = "file://" + target
        if url != expected:
            fail("on %s the address bar shows the scheme followed directly by the absolute path; "
                 "expected '%s' but got '%s'" % (fields["platform"], expected, raw_url))

    print("PASS")


if __name__ == "__main__":
    main()
