#!/usr/bin/env python3
"""
test_02_second_device_is_not_loopback  —  weight 30  —  ADVERSARIAL (the main one)

Catches the two shortcuts that would let a learner submit this project without a second
machine ever having touched the server:

  1. Submitting a loopback address as `second_device_ip`. A client address inside
     127.0.0.0/8 is, by RFC 1122, an "Internal host loopback address" whose "Addresses of
     this form MUST NOT appear outside a host" — RFC 6890 lists 127.0.0.0/8 as
     "Forwardable | False", "Global | False". A log line with that client address records
     the serving machine asking itself a question, which is exactly what the `curl -I` in
     task 2 does. It is evidence of a working server and no evidence at all of a network.
     This is by far the most likely shortcut and it fails here.

  2. Submitting `lan_ip` back as `second_device_ip` — reading the serving machine's own
     address off the screen instead of reading the second device's address out of the log.

It also enforces that `lan_ip` itself is a real private address, and handles the WSL
Path B submission (`second_device_ip` = WSL-PATH-B), which is accepted only on WSL and
only with the full diagnostic record in `obstacles`.

Self-contained: standard library only. Usage:
    python3 test_02_second_device_is_not_loopback.py path/to/submission.txt
Prints PASS, or a single definite failure line beginning FAIL:.
"""

import ipaddress
import os
import re
import sys

HEADER = re.compile(r"^===\s*([a-z_]+)\s*===\s*$")
PLATFORMS = ("macOS", "Linux", "WSL")
SENTINEL = "WSL-PATH-B"
WSL_VMCREATORID = "{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}"

# RFC 1918, section 3, verbatim ranges:
#      10.0.0.0        -   10.255.255.255  (10/8 prefix)
#      172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
#      192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
PRIVATE = [ipaddress.ip_network(n) for n in ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16")]
LOOPBACK = ipaddress.ip_network("127.0.0.0/8")


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


def as_ipv4(value, field):
    if not value:
        fail("%s is empty" % field)
    if "\n" in value.strip():
        fail("%s contains more than one line — it must be a single dotted quad and nothing "
             "else" % field)
    token = value.strip()
    try:
        addr = ipaddress.ip_address(token)
    except ValueError:
        fail("%s is %r, which is not an IPv4 address. Submit a bare dotted quad — no port, no "
             "prefix length, no scheme, no interface name" % (field, token))
    if addr.version != 4:
        fail("%s is %r, an IPv6 address. This project is graded on the IPv4 address your second "
             "device used" % (field, token))
    return addr


def check_path_b(f):
    if f.get("platform") != "WSL":
        fail("second_device_ip is %r, which is accepted only when platform is WSL. On macOS and "
             "Linux there is no fallback: capture the second device's address from the access "
             "log" % SENTINEL)
    obstacles = f.get("obstacles", "")
    lines = [ln.strip() for ln in obstacles.split("\n")]

    ipaddr_lines = [ln for ln in lines if ln.startswith("WSL-IP-ADDR:")]
    ipconfig_lines = [ln for ln in lines if ln.startswith("WSL-IPCONFIG:")]
    if not ipaddr_lines:
        fail("WSL Path B needs a line in obstacles beginning `WSL-IP-ADDR:` giving the address "
             "`ip addr` reported inside WSL — the two-command comparison is the diagnosis")
    if not ipconfig_lines:
        fail("WSL Path B needs a line in obstacles beginning `WSL-IPCONFIG:` giving the IPv4 "
             "address `ipconfig.exe` reported in the same shell — the two-command comparison is "
             "the diagnosis")

    def first_quad(text):
        m = re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", text)
        return m.group(0) if m else None

    a, b = first_quad(ipaddr_lines[0]), first_quad(ipconfig_lines[0])
    if a is None:
        fail("the WSL-IP-ADDR: line contains no IPv4 address — paste the address `ip addr` "
             "reported")
    if b is None:
        fail("the WSL-IPCONFIG: line contains no IPv4 address — paste the address "
             "`ipconfig.exe` reported")

    if not any("networkingMode=mirrored" in ln for ln in lines):
        fail("obstacles has no line containing `networkingMode=mirrored` — Path B requires "
             "evidence that the documented fix was applied before it stopped")

    rule = [ln for ln in lines if WSL_VMCREATORID in ln]
    if not rule:
        fail("obstacles has no line containing the WSL VMCreatorId "
             "%s — paste the Hyper-V firewall rule exactly as you ran it" % WSL_VMCREATORID)
    if not any("-LocalPorts 8000" in ln for ln in rule):
        fail("the Hyper-V rule line does not end `-LocalPorts 8000` — Microsoft's documented "
             "example opens 80, and the one thing you change is the port your server is on")

    stopped = [ln for ln in lines if ln.startswith("STOPPED AT:")]
    if not stopped or len(stopped[0]) <= len("STOPPED AT:") + 10:
        fail("obstacles has no usable `STOPPED AT:` line — name the step it stopped at and what "
             "you saw there. That sentence is what Path B is graded on")

    print("PASS")
    sys.exit(0)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SUBMISSION", "submission.txt")
    try:
        f = parse(path)
    except OSError as exc:
        fail("cannot read the submission file %r (%s)" % (path, exc.strerror))

    platform = f.get("platform", "")
    if platform not in PLATFORMS:
        fail("platform is %r — it must be exactly one of macOS, Linux, WSL" % platform)

    second_raw = f.get("second_device_ip", "").strip()
    if second_raw == SENTINEL:
        check_path_b(f)

    lan = as_ipv4(f.get("lan_ip", ""), "lan_ip")
    if lan in LOOPBACK:
        fail("lan_ip is %s, which is inside 127.0.0.0/8 — that is the loopback line from `ip "
             "addr` (`inet 127.0.0.1/8 scope host lo`), not your Wi-Fi interface" % lan)
    if not any(lan in net for net in PRIVATE):
        fail("lan_ip is %s, which is not in any RFC 1918 private range (10/8, 172.16/12, "
             "192.168/16) — a home network address falls in one of those three" % lan)

    second = as_ipv4(second_raw, "second_device_ip")
    if second in LOOPBACK:
        fail("second_device_ip is %s, inside 127.0.0.0/8. That is a loopback address: the client "
             "was the serving machine talking to itself, which is what your own `curl -I` does. "
             "RFC 1122 is explicit that such addresses \"MUST NOT appear outside a host\", so no "
             "second device can ever appear in the log with one. Find the log line whose first "
             "field is not 127.x" % second)
    if second == lan:
        fail("second_device_ip equals lan_ip (%s) — that is the serving machine's own address "
             "read back. The second device has its own address, and it is the first field of the "
             "log line your phone caused, not the address you typed into it" % second)
    if not any(second in net for net in PRIVATE):
        fail("second_device_ip is %s, which is not in any RFC 1918 private range (10/8, "
             "172.16/12, 192.168/16) — a device on your own Wi-Fi has a private address" % second)

    print("PASS")


if __name__ == "__main__":
    main()
