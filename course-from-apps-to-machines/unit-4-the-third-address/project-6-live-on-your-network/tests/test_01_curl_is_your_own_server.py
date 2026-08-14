#!/usr/bin/env python3
"""
test_01_curl_is_your_own_server  —  weight 20  —  ADVERSARIAL

Catches: a `curl_i_output` copied from a tutorial, a blog post, or another web server
instead of captured from the learner's own `python3 -m http.server`.

The tells are documented and specific to this server:
  * the response start-line is `HTTP/1.0 200 OK` — `http.server` sets
    `protocol_version = "HTTP/1.0"` and the docs say "For backwards compatibility, the
    setting defaults to 'HTTP/1.0'." Almost every pasted example on the web is HTTP/1.1.
  * the `Server:` header is built as "SimpleHTTP/" + version and "Python/" + version,
    e.g. `Server: SimpleHTTP/0.6 Python/3.14.6`. Nginx, Apache and Caddy do not say that.
  * a stored `.html` file gets `Content-type: text/html` with NO charset parameter. The
    charset only appears on pages the server generates itself, so
    `Content-type: text/html; charset=utf-8` here means a directory listing was captured —
    the server was started in the wrong directory.

Self-contained: standard library only. Usage:
    python3 test_01_curl_is_your_own_server.py path/to/submission.txt
Prints PASS, or a single definite failure line beginning FAIL:.
"""

import os
import re
import sys

HEADER = re.compile(r"^===\s*([a-z_]+)\s*===\s*$")
PLATFORMS = ("macOS", "Linux", "WSL")


def parse(path):
    fields, cur = {}, None
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            m = HEADER.match(line)
            if m:
                cur = m.group(1)
                fields[cur] = []
                continue
            if line.startswith(";;"):
                continue
            if cur is not None:
                fields[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in fields.items()}


def fail(msg):
    print("FAIL: " + msg)
    sys.exit(1)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SUBMISSION", "submission.txt")
    try:
        f = parse(path)
    except OSError as exc:
        fail("cannot read the submission file %r (%s)" % (path, exc.strerror))

    platform = f.get("platform", "")
    if platform not in PLATFORMS:
        fail("platform is %r — it must be exactly one of macOS, Linux, WSL" % platform)

    body = f.get("curl_i_output", "")
    if not body:
        fail("curl_i_output is empty — run `curl -I http://127.0.0.1:8000/index.html` on the "
             "serving machine and paste the whole output")

    lines = [ln.rstrip("\r") for ln in body.split("\n") if ln.strip()]

    start = lines[0]
    if start.startswith("HTTP/1.1"):
        fail("the response start-line is %r — python3 -m http.server answers HTTP/1.0 by default, "
             "so this capture did not come from your server" % start)
    if not re.match(r"^HTTP/1\.0 200\b", start):
        if re.match(r"^HTTP/1\.0 (\d{3})", start):
            code = re.match(r"^HTTP/1\.0 (\d{3})", start).group(1)
            fail("the response start-line is %r — a %s is not a served file. A 404 means the server "
                 "is looking in the wrong directory for index.html" % (start, code))
        fail("the first line of curl_i_output is %r — it must be the response start-line, "
             "beginning `HTTP/1.0 200`" % start)

    for ln in lines:
        if ln.startswith("HTTP/1.1"):
            fail("curl_i_output contains the line %r — python3 -m http.server never answers "
                 "HTTP/1.1, so this capture is not from your server" % ln)

    server = [ln for ln in lines if ln.lower().startswith("server:")]
    if not server:
        fail("curl_i_output has no Server: header — your server always sends one, shaped "
             "`Server: SimpleHTTP/<version> Python/<version>`")
    if not re.match(r"^Server:\s*SimpleHTTP/\S+\s+Python/\S+\s*$", server[0]):
        fail("the Server: header is %r — your server sends `SimpleHTTP/<version> "
             "Python/<version>`, so this capture came from a different web server" % server[0])

    ctype = [ln for ln in lines if ln.lower().startswith("content-type:")]
    if not ctype:
        fail("curl_i_output has no Content-type header — a served index.html always carries one")
    value = ctype[0].split(":", 1)[1].strip()
    if "charset" in value.lower():
        fail("Content-type is %r — the charset parameter appears only on pages the server "
             "generates itself, so this is a directory listing, not your index.html. Start the "
             "server from ~/projects/first-site" % value)
    if value != "text/html":
        fail("Content-type is %r — a served .html file gets exactly `text/html`" % value)

    clen = [ln for ln in lines if ln.lower().startswith("content-length:")]
    if not clen or not clen[0].split(":", 1)[1].strip().isdigit():
        fail("curl_i_output has no Content-Length header with a numeric value — without it there "
             "is no evidence a file of any size was served")

    print("PASS")


if __name__ == "__main__":
    main()
