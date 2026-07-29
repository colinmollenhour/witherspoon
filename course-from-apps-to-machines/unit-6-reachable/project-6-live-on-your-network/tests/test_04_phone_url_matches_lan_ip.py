#!/usr/bin/env python3
"""
test_04_phone_url_matches_lan_ip  —  weight 15  —  ADVERSARIAL

Catches the submission whose `phone_url` is not the address that was submitted as the
serving machine's, in the three shapes that actually happen:

  * `http://localhost:8000` — the misconception this whole unit exists to remove.
    `localhost` names whichever machine is asking, so on the phone it names the phone.
  * `http://<lan_ip>` with the port dropped. The port "is usually omitted if the web
    server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS)
    ... Otherwise it is mandatory." This server is on 8000.
  * a host that is not the `lan_ip` submitted alongside it — the two fields have to
    describe the same machine or the submission is not self-consistent.

Applies identically on the WSL Path B route: the URL was still typed into the device.

Self-contained: standard library only. Usage:
    python3 test_04_phone_url_matches_lan_ip.py path/to/submission.txt
Prints PASS, or a single definite failure line beginning FAIL:.
"""

import os
import re
import sys

HEADER = re.compile(r"^===\s*([a-z_]+)\s*===\s*$")
PLATFORMS = ("macOS", "Linux", "WSL")
URL = re.compile(r"^http://([^/:\s]+):(\d+)(/[^\s]*)?$")


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

    if f.get("platform", "") not in PLATFORMS:
        fail("platform is %r — it must be exactly one of macOS, Linux, WSL" % f.get("platform", ""))

    lan = f.get("lan_ip", "").strip()
    url = f.get("phone_url", "").strip()

    if not lan:
        fail("lan_ip is empty")
    if not url:
        fail("phone_url is empty — submit exactly what you typed into the second device")
    if "\n" in url:
        fail("phone_url contains more than one line — submit the single URL you typed")

    if url.startswith("file://"):
        fail("phone_url is a file:// URL — that addresses a file on the machine doing the "
             "opening, so it can only ever work on the machine the file is on. The second device "
             "must be given an http:// URL naming the serving machine's LAN address")

    m = URL.match(url)
    if not m:
        if re.match(r"^https://", url):
            fail("phone_url is %r — your server speaks HTTP, not HTTPS. The scheme must be "
                 "http://" % url)
        if re.match(r"^http://[^/:\s]+(/[^\s]*)?$", url):
            fail("phone_url is %r — the port is missing. A browser only omits the port for the "
                 "standard ones (80 for HTTP, 443 for HTTPS); on 8000 it is mandatory, so the URL "
                 "must be http://%s:8000" % (url, lan))
        fail("phone_url is %r — it must be http://<lan_ip>:8000, optionally followed by / or "
             "/index.html" % url)

    host, port, path_part = m.group(1), m.group(2), m.group(3)

    if host.lower() in ("localhost", "localhost.localdomain", "localhost4", "127.0.0.1"):
        fail("phone_url names %r. On the second device that names the second device: /etc/hosts "
             "maps localhost to 127.0.0.1, and 127.0.0.1 means \"this machine\" on whichever "
             "machine is asking. Nothing was sent to your server. Use http://%s:8000"
             % (host, lan))

    if host != lan:
        fail("phone_url names %r but lan_ip is %r — the two fields must describe the same "
             "machine" % (host, lan))

    if port != "8000":
        fail("phone_url uses port %s but the project serves on 8000 — `python3 -m http.server` "
             "listens on port 8000 by default" % port)

    if path_part not in (None, "", "/", "/index.html"):
        fail("phone_url ends with %r — submit the URL that loaded your page: the bare address, / "
             "or /index.html" % path_part)

    print("PASS")


if __name__ == "__main__":
    main()
