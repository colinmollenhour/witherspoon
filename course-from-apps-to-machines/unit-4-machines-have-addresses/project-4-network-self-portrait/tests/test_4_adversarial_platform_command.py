#!/usr/bin/env python3
"""Test 4 (weight 15) -- ADVERSARIAL.

Catches the cross-platform copy-paste: a macOS learner submitting `ip addr`.
No `ip(8)` or `ss` man page exists in the current macOS man-page set -- both are
Linux iproute2 tools [src 63] -- so that command cannot have produced output on
the machine described. The macOS command is `ipconfig getifaddr <interface>`
[src 64], found via `networksetup -listallhardwareports` [src 65].

The mirror case is caught too: a Linux or WSL learner submitting the macOS
command, or `ifconfig`, which is no longer installed by default [src 62].

Prints PASS or a definite FAIL string.
"""

import re
import sys

PLATFORMS = {"macos": "macOS", "linux": "Linux", "wsl": "WSL"}


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

    raw_platform = (f.get("platform", "") or "").strip()
    key = raw_platform.lower()
    if key not in PLATFORMS:
        print(
            "FAIL: platform=%r is not one of macOS, Linux, WSL" % raw_platform
        )
        return 1

    cmd = (f.get("lan_ip_command", "") or "").strip()
    if not cmd:
        print("FAIL: lan_ip_command is empty -- state the exact command you ran")
        return 1

    low = cmd.lower()
    uses_ip_tool = re.search(r"(?<![A-Za-z-])ip\s+(addr|a\b|-4|-o\b|link)", low) is not None
    uses_ss = re.search(r"(?<![A-Za-z-])ss(?![A-Za-z])", low) is not None
    uses_ipconfig_getifaddr = "ipconfig getifaddr" in low
    uses_ifconfig = "ifconfig" in low

    if key == "macos":
        if uses_ip_tool:
            print(
                "FAIL: platform=macOS but lan_ip_command=%r uses the `ip` command. "
                "macOS has no `ip` -- no ip(8) man page exists in the current macOS "
                "man-page set. Use `ipconfig getifaddr <device>`, after finding the "
                "device with `networksetup -listallhardwareports`" % cmd
            )
            return 1
        if uses_ss:
            print(
                "FAIL: platform=macOS but lan_ip_command=%r uses `ss`. macOS has no "
                "`ss` either -- and `ss` lists listening sockets, not addresses" % cmd
            )
            return 1
        if not uses_ipconfig_getifaddr:
            print(
                "FAIL: platform=macOS but lan_ip_command=%r does not use "
                "`ipconfig getifaddr`, which is the macOS command that prints a "
                "LAN IPv4 address" % cmd
            )
            return 1
    else:
        if uses_ipconfig_getifaddr:
            print(
                "FAIL: platform=%s but lan_ip_command=%r uses `ipconfig getifaddr`, "
                "which is the macOS command" % (PLATFORMS[key], cmd)
            )
            return 1
        if not uses_ip_tool:
            if uses_ifconfig:
                print(
                    "FAIL: platform=%s but lan_ip_command=%r uses `ifconfig`, which is "
                    "no longer installed by default on Linux desktops. Use `ip addr`"
                    % (PLATFORMS[key], cmd)
                )
                return 1
            print(
                "FAIL: platform=%s but lan_ip_command=%r is not an `ip` command such "
                "as `ip addr` or `ip -4 addr show`" % (PLATFORMS[key], cmd)
            )
            return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
