#!/usr/bin/env python3
"""Test 6 (weight 10) -- EVIDENCE.

Three captured pieces of evidence are present and well-formed:

  * loopback_line carries 127.0.0.1, and on Linux/WSL the /8 prefix too -- the
    whole 127.0.0.0/8 block is loopback, not just the one address [src 49, 50],
    and the real captured interface line reads `inet 127.0.0.1/8 scope host lo`
    [src 51].
  * curl_status is three digits in 100-599, the five status classes [src 84].
    The idiom is `curl -s -o /dev/null -w '%{http_code}\\n' https://example.com`
    [src 131].
  * refused_vs_timeout names both exit codes -- 7 for the connection nothing
    accepted, 28 for the host that never answered [src 132, 134] -- and states
    the timing contrast rather than restating the definitions.

Prints PASS or a definite FAIL string.
"""

import re
import sys

FAST = (
    "instant", "instantly", "immediate", "immediately", "at once", "straight away",
    "right away", "0 ms", "0ms", "no wait", "no delay", "zero ms",
)
SLOW = (
    "timeout", "timed out", "time out", "slow", "slowly", "hung", "hang", "waited",
    "waiting", "delay", "seconds", "gave up", "gives up", "4002", "max-time",
)


def load(path):
    fields, block, buf = {}, None, []
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    for line in text.splitlines():
        marker = re.match(r"^-{3}\s*([a-z0-9_]+)\s*-{3}\s*$", line)
        if marker:
            if block is not None:
                fields[block] = "\n".join(buf).strip()
            block, buf = marker.group(1), []
            continue
        if block is not None:
            if not line.lstrip().startswith("#"):
                buf.append(line)
            continue
        pair = re.match(r"^([a-z0-9_]+):\s*(.*)$", line)
        if pair:
            fields[pair.group(1)] = pair.group(2).strip()
    if block is not None:
        fields[block] = "\n".join(buf).strip()
    return fields


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "submission.txt"
    f = load(path)
    platform = (f.get("platform", "") or "").strip().lower()

    loop = f.get("loopback_line", "") or ""
    if "127.0.0.1" not in loop:
        print(
            "FAIL: loopback_line does not contain 127.0.0.1 -- on Linux/WSL take the "
            "loopback inet line from `ip addr`; on macOS take the 127.0.0.1 line from "
            "`cat /etc/hosts`"
        )
        return 1
    if platform in ("linux", "wsl") and "/8" not in loop:
        print(
            "FAIL: platform=%s but loopback_line has no /8 prefix. The real interface "
            "line reads `inet 127.0.0.1/8 scope host lo` -- the whole 127.0.0.0/8 block "
            "is loopback, not just the single address"
            % (f.get("platform", "") or "").strip()
        )
        return 1

    status = (f.get("curl_status", "") or "").strip()
    if not re.fullmatch(r"\d{3}", status):
        print(
            "FAIL: curl_status=%r is not exactly three digits -- submit only the number "
            "printed by curl -s -o /dev/null -w '%%{http_code}\\n' https://example.com"
            % status
        )
        return 1
    if not 100 <= int(status) <= 599:
        print(
            "FAIL: curl_status=%s is outside 100-599, the five HTTP status classes. "
            "A 000 means curl never got a response at all" % status
        )
        return 1

    note = f.get("refused_vs_timeout", "") or ""
    low = note.lower()
    if len(low.strip()) < 80:
        print(
            "FAIL: refused_vs_timeout is too short to be an observation -- name both "
            "exit codes and say how long each command took on your machine"
        )
        return 1
    if not re.search(r"(?<![\d.])7(?![\d])", note):
        print(
            "FAIL: refused_vs_timeout does not name exit code 7, the code curl returns "
            "when the host is there and nothing is listening on that port"
        )
        return 1
    if not re.search(r"(?<![\d.])28(?![\d])", note):
        print(
            "FAIL: refused_vs_timeout does not name exit code 28, the code curl returns "
            "when the operation times out with no reply at all"
        )
        return 1
    if not any(w in low for w in FAST):
        print(
            "FAIL: refused_vs_timeout does not describe the fast failure -- say how "
            "quickly the refused connection came back on your machine"
        )
        return 1
    if not any(w in low for w in SLOW):
        print(
            "FAIL: refused_vs_timeout does not describe the slow failure -- say how "
            "long the unreachable host took before curl gave up"
        )
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
