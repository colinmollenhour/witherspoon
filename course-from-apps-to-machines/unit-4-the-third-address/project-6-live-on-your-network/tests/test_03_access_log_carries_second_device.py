#!/usr/bin/env python3
"""
test_03_access_log_carries_second_device  —  weight 25

Verifies that the submitted address is actually backed by the server's own output, rather
than typed into the `second_device_ip` field on its own.

Every request `python3 -m http.server` answers writes one line to stderr, shaped exactly
like this real capture:

    127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -

The first field is the address of whoever asked. This test requires at least two lines in
that shape: one whose client field is inside 127.0.0.0/8 (the request the serving machine
made to itself with `curl -I`) and one whose client field is exactly `second_device_ip`.
Both together are the claim — that one machine served, and a different machine fetched.

The size field being `-` is not a defect: this server always writes `-` there.
`HTTP/1.1` inside the quoted request line is not a defect either: that is the client's
version echoed back, while the response itself is HTTP/1.0.

Self-contained: standard library only. Usage:
    python3 test_03_access_log_carries_second_device.py path/to/submission.txt
Prints PASS, or a single definite failure line beginning FAIL:.
"""

import ipaddress
import os
import re
import sys

HEADER = re.compile(r"^===\s*([a-z_]+)\s*===\s*$")
LOGLINE = re.compile(r'^(\S+) - - \[([^\]]+)\] "([^"]*)" (\d{3}) (\S+)\s*$')
PLATFORMS = ("macOS", "Linux", "WSL")
SENTINEL = "WSL-PATH-B"
LOOPBACK = ipaddress.ip_network("127.0.0.0/8")


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

    body = f.get("access_log_lines", "")
    if not body:
        fail("access_log_lines is empty — the log is the proof this whole project turns on")

    raw_lines = [ln.rstrip("\r") for ln in body.split("\n") if ln.strip()]
    parsed, unparsed = [], []
    for ln in raw_lines:
        m = LOGLINE.match(ln.strip())
        if m:
            parsed.append((m.group(1), m.group(3), m.group(4)))
        else:
            unparsed.append(ln.strip())

    if len(parsed) < 2:
        hint = (" The first line that is not in that shape is %r." % unparsed[0]) if unparsed else ""
        fail("access_log_lines has %d line(s) in the server's log shape "
             "`<client> - - [<timestamp>] \"<request>\" <status> <size>`, and at least 2 are "
             "required.%s Paste the lines from the server's terminal without editing them."
             % (len(parsed), hint))

    clients = []
    for client, _req, _status in parsed:
        try:
            clients.append(ipaddress.ip_address(client))
        except ValueError:
            fail("a log line starts with %r, which is not an IP address — the first field of "
                 "every line this server writes is the client's address" % client)

    loopback_lines = [c for c in clients if c.version == 4 and c in LOOPBACK]
    if not loopback_lines:
        fail("no submitted log line has a client address inside 127.0.0.0/8 — the `curl -I "
             "http://127.0.0.1:8000/index.html` you ran on the serving machine wrote one, and it "
             "is the baseline the second device's line is contrasted against")

    second_raw = f.get("second_device_ip", "").strip()

    if second_raw == SENTINEL:
        if platform != "WSL":
            fail("second_device_ip is %r, which is accepted only when platform is WSL" % SENTINEL)
        if not any(ln.strip().startswith("STOPPED AT:") for ln in f.get("obstacles", "").split("\n")):
            fail("WSL Path B needs a `STOPPED AT:` line in obstacles saying where the documented "
                 "procedure stopped and what you saw")
        non_loopback = [str(c) for c in clients if not (c.version == 4 and c in LOOPBACK)]
        if non_loopback:
            fail("this submission claims WSL Path B (nothing on the network could reach the "
                 "server) but access_log_lines contains a line from %s, which is not the serving "
                 "machine. If a second machine reached it, submit that address as "
                 "second_device_ip instead" % non_loopback[0])
        print("PASS")
        return

    try:
        second = ipaddress.ip_address(second_raw)
    except ValueError:
        fail("second_device_ip is %r, which is not an IP address" % second_raw)

    matching = [c for c in clients if c == second]
    if not matching:
        seen = ", ".join(sorted({str(c) for c in clients}))
        fail("second_device_ip is %s but no submitted log line has that client address. The "
             "addresses actually present are: %s. The number in that field must be copied out of "
             "the log, not typed in from somewhere else" % (second, seen))

    if second.version == 4 and second in LOOPBACK:
        fail("the line matching second_device_ip has client %s, inside 127.0.0.0/8 — that is the "
             "serving machine asking itself, not a second device" % second)

    print("PASS")


if __name__ == "__main__":
    main()
