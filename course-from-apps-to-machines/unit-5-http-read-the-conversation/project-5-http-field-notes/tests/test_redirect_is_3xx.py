#!/usr/bin/env python3
"""
test_redirect_is_3xx  —  weight 10

Verifies that `curl_i_redirect` is a response head whose status line carries a code in
the Redirection class, 300-399 — a third exchange whose first digit is neither 2 nor 4.

The point of the field is that the learner had to go and find one. Screening candidates
with `curl -s -o /dev/null -w '%{http_code}\\n' <url>` is the intended method; the
result must be a real capture, so this test also rejects a status line that is present
without any headers under it.

Prints PASS or a line beginning FAIL:.
"""

import json
import re
import sys

CLASSES = {
    1: "Informational (100-199) — not the final answer yet",
    2: "Successful (200-299) — you asked, and you got it",
    4: "Client error (400-499) — your request was wrong",
    5: "Server error (500-599) — the server broke",
}


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(path):
    data = load(path)
    raw = data.get("curl_i_redirect", "")

    if not isinstance(raw, str) or not raw.strip():
        print("FAIL: curl_i_redirect is empty. Find a URL that answers with a code between 300 "
              "and 399 and paste the `curl -I` response head.")
        return 1

    if "TODO" in raw:
        print("FAIL: curl_i_redirect still contains the TODO placeholder from the starter.")
        return 1

    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    status = next((line for line in lines if re.match(r"^HTTP/[0-9.]+\s", line)), None)

    if status is None:
        print("FAIL: curl_i_redirect has no status line. The first line of a `curl -I` response "
              "begins with the protocol, for example 'HTTP/1.1 301 Moved Permanently'.")
        return 1

    match = re.match(r"^HTTP/[0-9.]+\s+([0-9]{3})", status)
    if match is None:
        print("FAIL: curl_i_redirect's status line is '%s' and carries no three-digit status "
              "code in the middle slot." % status)
        return 1

    code = int(match.group(1))
    if not 300 <= code <= 399:
        family = CLASSES.get(code // 100, "an unrecognised class")
        print("FAIL: curl_i_redirect's status code is %d, which is %s. This field wants a "
              "Redirection code, 300-399. Screen candidate URLs with "
              "`curl -s -o /dev/null -w '%%{http_code}\\n' <url>` until one prints a number "
              "beginning with 3." % (code, family))
        return 1

    header_lines = [line for line in lines
                    if line is not status and re.match(r"^[A-Za-z][A-Za-z0-9-]*:\s*\S", line)]
    if not header_lines:
        print("FAIL: curl_i_redirect has a %d status line but no response headers under it. "
              "Paste the whole response head, not just the first line." % code)
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
