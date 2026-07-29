#!/usr/bin/env python3
"""Test 2 (weight 20) -- ADVERSARIAL.

Catches the single most likely shortcut: submitting 127.0.0.1 as the LAN IP,
because it is the address the learner has seen most often. Also catches
0.0.0.0 (the bind-any placeholder, not an address the machine has) and the
subtler version where lan_ip is simply a copy of whatever is in loopback_line.

127.0.0.0/8 is loopback in its entirety: RFC 1122 form "(g)  { 127, <any> }",
"Internal host loopback address.  Addresses of this form MUST NOT appear
outside a host." [src 49]; RFC 6890 marks the block "Forwardable | False" and
"Global | False" [src 50].

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


def addresses_in(text):
    found = []
    for m in re.finditer(r"(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?![\d])", text or ""):
        if octets(m.group(1)) is not None:
            found.append(m.group(1))
    return found


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "submission.txt"
    f = load(path)

    raw_ip = (f.get("lan_ip", "") or "").strip()
    o = octets(raw_ip)
    if o is None:
        print("FAIL: lan_ip=%r is not a parseable IPv4 address" % raw_ip)
        return 1

    if o[0] == 127:
        print(
            "FAIL: lan_ip=%s is a loopback address (127.0.0.0/8). Every machine has one "
            "and on every machine it means a different computer -- its own. It is not "
            "this machine's address on the LAN, and RFC 6890 marks the block "
            "Forwardable=False, Global=False" % raw_ip
        )
        return 1

    if raw_ip == "0.0.0.0":
        print(
            "FAIL: lan_ip=0.0.0.0 is the bind-any placeholder meaning 'every address "
            "this machine has', not an address this machine has"
        )
        return 1

    loop = f.get("loopback_line", "") or ""
    if "127.0.0.1" not in loop:
        print(
            "FAIL: loopback_line does not contain 127.0.0.1 -- the portrait needs the "
            "loopback address captured from your own machine to contrast with lan_ip"
        )
        return 1

    if raw_ip in addresses_in(loop):
        print(
            "FAIL: lan_ip=%s also appears in loopback_line. Loopback and the LAN "
            "address are two different addresses doing two different jobs; they cannot "
            "be the same value" % raw_ip
        )
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
