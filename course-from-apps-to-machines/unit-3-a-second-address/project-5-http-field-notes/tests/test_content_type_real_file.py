#!/usr/bin/env python3
"""
test_content_type_real_file  —  weight 25  —  ADVERSARIAL

Verifies that `content_type_local` is exactly `text/html`, with nothing after it, and
that `curl_i_local` contains no charset anywhere.

The shortcut this catches is the subtle one, and it catches a whole missing project.

`python3 -m http.server` sends `Content-type: text/html` — no charset — when it reads a
real `.html` file off the disk. It sends `Content-type: text/html; charset=utf-8` only
for pages it *generates* itself: the directory listing, and the 404 page.

So a submission whose Content-Type carries `charset=utf-8` did not capture a served
file. It captured a directory listing. And the server only generates a directory
listing when it looked inside the folder for an index page — "the directory is checked
for an index page as specified by `index_pages`", defaulting to `("index.html",
"index.htm")` — and did not find one.

Which means the learner never created `~/projects/first-site/index.html`: the file this
entire course has been building, the file the server exists to serve. They started a
server in an empty or wrong directory, pointed curl at `/`, got a page the server wrote
on the spot, and pasted it. One header, seven characters long, proves the artifact is
missing.

Prints PASS or a line beginning FAIL:.
"""

import json
import sys


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(path):
    data = load(path)
    value = data.get("content_type_local", "")
    capture = data.get("curl_i_local", "")

    if not isinstance(value, str) or not value.strip():
        print("FAIL: content_type_local is empty. Copy the value of the Content-Type header "
              "out of your curl_i_local capture.")
        return 1

    if "TODO" in value:
        print("FAIL: content_type_local still contains the TODO placeholder from the starter.")
        return 1

    normalised = value.strip().lower()

    if normalised.startswith("content-type:"):
        print("FAIL: content_type_local is '%s'. Copy the header's VALUE only — no header name, "
              "no colon." % value.strip())
        return 1

    if "charset" in normalised:
        print("FAIL: content_type_local is '%s'. A real .html file read off your disk gets "
              "'text/html' with no charset. The charset appears only on pages this server "
              "GENERATES — the directory listing and the 404 page. You captured a directory "
              "listing, which means the server looked in the folder for index.html and did not "
              "find one. Create ~/projects/first-site/index.html, then capture "
              "`curl -I http://localhost:8000/index.html` again." % value.strip())
        return 1

    if normalised != "text/html":
        print("FAIL: content_type_local is '%s'. Expected exactly 'text/html'." % value.strip())
        return 1

    if isinstance(capture, str) and "charset" in capture.lower():
        print("FAIL: content_type_local says 'text/html' but curl_i_local contains a charset. "
              "Those two cannot both have come from the same response. Recapture, and copy the "
              "value out of the capture rather than typing it.")
        return 1

    if isinstance(capture, str) and "text/html" not in capture.lower():
        print("FAIL: content_type_local says 'text/html' but no Content-Type header carrying "
              "'text/html' appears in curl_i_local. Copy the value out of your own capture.")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
