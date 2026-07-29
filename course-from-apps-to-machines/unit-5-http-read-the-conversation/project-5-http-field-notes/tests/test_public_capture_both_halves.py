#!/usr/bin/env python3
"""
test_public_capture_both_halves  —  weight 15

Verifies that `curl_v_public` is real `curl -v` output holding BOTH halves of one
conversation: at least one line curl sent (marked `>`) and at least one line curl
received (marked `<`), with a request line among the sent lines and a status line
among the received lines.

`curl -v` is the only instrument in this unit that shows both messages at once. A
capture with only `<` lines is `curl -I` output pasted into the wrong field; a capture
with the markers stripped is a capture that was edited.

Prints PASS or a line beginning FAIL:.
"""

import json
import re
import sys

METHODS = ("GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(path):
    data = load(path)
    raw = data.get("curl_v_public", "")

    if not isinstance(raw, str) or not raw.strip():
        print("FAIL: curl_v_public is empty. Run `curl -v https://example.com` and paste the "
              "complete output.")
        return 1

    if "TODO" in raw:
        print("FAIL: curl_v_public still contains the TODO placeholder from the starter.")
        return 1

    sent, received = [], []
    for line in raw.splitlines():
        stripped = line.strip()
        if stripped.startswith(">"):
            sent.append(stripped[1:].strip())
        elif stripped.startswith("<"):
            received.append(stripped[1:].strip())

    if not sent and not received:
        print("FAIL: curl_v_public contains no '>' lines and no '<' lines. Either -v was not "
              "used, or the markers were removed when the output was cleaned up. Paste the "
              "output exactly as curl printed it.")
        return 1

    if not sent:
        print("FAIL: curl_v_public contains %d received ('<') lines but no sent ('>') lines. "
              "The request half of the conversation is missing." % len(received))
        return 1

    if not received:
        print("FAIL: curl_v_public contains %d sent ('>') lines but no received ('<') lines. "
              "The response half of the conversation is missing." % len(sent))
        return 1

    if not any(line.split(" ")[0] in METHODS and line.endswith(("HTTP/1.0", "HTTP/1.1", "HTTP/2",
                                                                "HTTP/3"))
               for line in sent if line):
        print("FAIL: none of the '>' lines is a request line. A request line is three "
              "space-separated slots: <method> <request-target> <protocol>, for example "
              "'GET / HTTP/1.1'.")
        return 1

    if not any(re.match(r"^HTTP/[0-9.]+\s+[1-5][0-9]{2}", line) for line in received):
        print("FAIL: none of the '<' lines is a status line. A status line is "
              "<protocol> <status-code> <reason-phrase>, and the code is a three-digit number "
              "in the middle slot.")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
