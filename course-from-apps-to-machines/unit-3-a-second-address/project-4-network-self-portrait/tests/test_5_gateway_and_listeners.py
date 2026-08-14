#!/usr/bin/env python3
"""Test 5 (weight 10) -- STRUCTURAL.

The gateway is a real address, distinct from the machine's own, and the
listening-ports capture actually contains an address:port pair with a port in
the usable range.

Ports are a 16-bit namespace [src 36, 37] so the numbers run 0-65535; port 0 is
Reserved [src 38], leaving 1-65535 as the range a program can take. A real
captured `ss -tlnp` line looks like [src 58]:

    LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))

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


# an address:port pair as printed by ss (1.2.3.4:8000, 0.0.0.0:8000, [::]:8000)
# or by lsof (*:8000, 127.0.0.1:631)
SOCKET = re.compile(
    r"(?:\d{1,3}(?:\.\d{1,3}){3}|\*|\[[0-9A-Fa-f:%.]*\]):(\d{1,5})(?![\d])"
)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "submission.txt"
    f = load(path)

    gw = (f.get("gateway", "") or "").strip()
    g = octets(gw)
    if g is None:
        print(
            "FAIL: gateway=%r is not four dot-separated octets each 0-255" % gw
        )
        return 1
    if g[0] == 127:
        print(
            "FAIL: gateway=%s is inside 127.0.0.0/8 (loopback). A loopback address is "
            "not forwardable, so nothing can be routed through it" % gw
        )
        return 1

    lan = (f.get("lan_ip", "") or "").strip()
    if octets(lan) is not None and gw == lan:
        print(
            "FAIL: gateway=%s is the same address as lan_ip. The gateway is the machine "
            "your packets are handed to on the way off your network, not this machine"
            % gw
        )
        return 1

    listeners = f.get("listening_ports", "") or ""
    lines = [ln for ln in listeners.splitlines() if ln.strip()]
    if not lines:
        print(
            "FAIL: listening_ports is empty -- paste the raw output of `ss -tlnp` "
            "(Linux/WSL) or `lsof -iTCP -sTCP:LISTEN -P -n` (macOS)"
        )
        return 1

    if lines[0].strip() == "NO LISTENERS FOUND":
        print("PASS")
        return 0

    ports = [int(m.group(1)) for m in SOCKET.finditer(listeners)]
    usable = [p for p in ports if 1 <= p <= 65535]
    if not usable:
        print(
            "FAIL: listening_ports contains no address:port pair with a port in 1-65535 "
            "-- paste the raw output, header row and all, or use the exact sentinel "
            "line NO LISTENERS FOUND if there were genuinely no rows"
        )
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
