#!/usr/bin/env python3
"""Test 1 (weight 25) -- CORRECTNESS.

lan_ip is a well-formed dotted quad inside one of RFC 1918's three private
blocks, and rfc1918_block names the block it is actually in.

RFC 1918 blocks, verbatim [src 47]:
     10.0.0.0        -   10.255.255.255  (10/8 prefix)
     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)

Prints PASS or a definite FAIL string.
"""

import re
import sys

BLOCKS = ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16")


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


def block_of(o):
    if o[0] == 10:
        return "10.0.0.0/8"
    if o[0] == 172 and 16 <= o[1] <= 31:
        return "172.16.0.0/12"
    if o[0] == 192 and o[1] == 168:
        return "192.168.0.0/16"
    return None


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "submission.txt"
    f = load(path)

    raw_ip = f.get("lan_ip", "")
    if not raw_ip:
        print("FAIL: lan_ip is empty -- no LAN IPv4 address was submitted")
        return 1

    o = octets(raw_ip)
    if o is None:
        print(
            "FAIL: lan_ip=%r is not four dot-separated octets each 0-255 "
            "(IPv4 is four octets, 32 bits)" % raw_ip
        )
        return 1

    if o[0] == 127:
        print(
            "FAIL: lan_ip=%s is inside 127.0.0.0/8 (loopback) -- that is this machine "
            "talking to itself, not its address on the LAN" % raw_ip
        )
        return 1

    actual = block_of(o)
    if actual is None:
        print(
            "FAIL: lan_ip=%s is not inside any RFC 1918 private block "
            "(10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) -- note the 172 block "
            "ends at 172.31.255.255" % raw_ip
        )
        return 1

    claimed = (f.get("rfc1918_block", "") or "").strip().rstrip(".")
    if claimed not in BLOCKS:
        print(
            "FAIL: rfc1918_block=%r is not one of 10.0.0.0/8, 172.16.0.0/12, "
            "192.168.0.0/16" % f.get("rfc1918_block", "")
        )
        return 1

    if claimed != actual:
        print(
            "FAIL: rfc1918_block=%s but lan_ip=%s is actually inside %s"
            % (claimed, raw_ip, actual)
        )
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
