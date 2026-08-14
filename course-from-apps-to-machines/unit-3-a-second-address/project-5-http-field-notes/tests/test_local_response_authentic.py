#!/usr/bin/env python3
"""
test_local_response_authentic  —  weight 30  —  ADVERSARIAL

Verifies that `curl_i_local` is a response the learner's own `python3 -m http.server`
actually produced, and not a generic response head pasted from a tutorial.

The shortcut this catches: a learner who never got their server running (or never
bothered) pastes the `HTTP/1.1 200 OK` block that every HTTP tutorial on the internet
opens with. That block is wrong in two ways that cannot be faked by accident:

  * This server hard-codes `protocol_version = "HTTP/1.0"`, so its status line is
    `HTTP/1.0 200 OK`. A pasted tutorial response says `HTTP/1.1`.
  * This server always identifies itself with `Server: SimpleHTTP/0.6 Python/<version>`.
    A tutorial response carries nginx, Apache, cloudflare, or no Server header at all.

Prints PASS or a line beginning FAIL:.
"""

import json
import re
import sys


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(path):
    data = load(path)
    raw = data.get("curl_i_local", "")

    if not isinstance(raw, str) or not raw.strip():
        print("FAIL: curl_i_local is empty. Run `curl -I http://localhost:8000/index.html` "
              "against your own running server and paste the whole response head.")
        return 1

    if "TODO" in raw:
        print("FAIL: curl_i_local still contains the TODO placeholder from the starter.")
        return 1

    lines = [line.strip() for line in raw.splitlines() if line.strip()]

    status_ok = any(line.startswith("HTTP/1.0 200") for line in lines)
    server_line = next((line for line in lines
                        if re.match(r"^Server:\s*SimpleHTTP/", line, re.IGNORECASE)), None)

    if not status_ok:
        wrong_version = next((line for line in lines if line.startswith("HTTP/")), None)
        if wrong_version and wrong_version.startswith("HTTP/1.1"):
            print("FAIL: curl_i_local's status line is '%s'. `python3 -m http.server` answers "
                  "HTTP/1.0 — it hard-codes protocol_version = \"HTTP/1.0\". This response did not "
                  "come from your server." % wrong_version)
        elif wrong_version:
            print("FAIL: curl_i_local's status line is '%s'. Expected a line beginning "
                  "'HTTP/1.0 200'." % wrong_version)
        else:
            print("FAIL: curl_i_local contains no status line at all. The first line of a "
                  "`curl -I` response is <protocol> <status-code> <reason-phrase>.")
        return 1

    if server_line is None:
        present = next((line for line in lines
                        if line.lower().startswith("server:")), None)
        if present:
            print("FAIL: curl_i_local's Server header is '%s'. Your own server always sends "
                  "'Server: SimpleHTTP/0.6 Python/<version>'. This response came from some other "
                  "machine." % present)
        else:
            print("FAIL: curl_i_local has no 'Server: SimpleHTTP/...' header. "
                  "`python3 -m http.server` sends one on every response.")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
