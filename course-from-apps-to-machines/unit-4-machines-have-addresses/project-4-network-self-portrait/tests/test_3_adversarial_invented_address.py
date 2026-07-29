#!/usr/bin/env python3
"""Test 3 (weight 20) -- ADVERSARIAL.

Catches the made-up answer: a plausible-looking 192.168.x.x (or 10.x, or 172.x)
typed from memory or from a tutorial, where the pasted lan_ip_command_output
does not actually contain that address.

Also catches the thinner version of the same shortcut on Linux and WSL: pasting
a bare address instead of real `ip addr` output. A genuine capture contains the
token `inet`, as in the real captured loopback line `inet 127.0.0.1/8 scope host
lo` [src 51]. macOS is exempt from that check, because `ipconfig getifaddr`
"Prints to standard output the IP address for the first network service
associated with the given interface" [src 64] and prints nothing else.

Prints PASS or a definite FAIL string.
"""

import re
import sys


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


def octets(value):
    m = re.fullmatch(r"\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*", value or "")
    if not m:
        return None
    parts = [int(g) for g in m.groups()]
    return parts if all(0 <= p <= 255 for p in parts) else None


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "submission.txt"
    f = load(path)

    raw_ip = (f.get("lan_ip", "") or "").strip()
    if octets(raw_ip) is None:
        print("FAIL: lan_ip=%r is not a parseable IPv4 address" % raw_ip)
        return 1

    out = f.get("lan_ip_command_output", "") or ""
    if not out.strip():
        print(
            "FAIL: lan_ip_command_output is empty -- paste the raw output of the "
            "command you named in lan_ip_command"
        )
        return 1

    if not re.search(r"(?<![\d.])" + re.escape(raw_ip) + r"(?![\d])", out):
        print(
            "FAIL: lan_ip=%s does not appear anywhere in lan_ip_command_output. "
            "The address was not read off this machine" % raw_ip
        )
        return 1

    platform = (f.get("platform", "") or "").strip().lower()
    if platform in ("linux", "wsl"):
        if not re.search(r"(?<![A-Za-z])inet(?![A-Za-z])", out):
            print(
                "FAIL: platform=%s but lan_ip_command_output contains no 'inet' token. "
                "Real `ip addr` output labels every IPv4 address with `inet` -- paste "
                "the whole output, not just the address"
                % (f.get("platform", "") or "").strip()
            )
            return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
