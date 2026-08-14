# Project 4 — Network Self-Portrait

**Type:** `interactive-form`
**Unit:** 3 — A second address

## Goal

Map your machine on the network: its LAN IPv4 and which private block it sits in, the default gateway, what is listening, and proof from your screen that loopback is not the LAN address.

---

## How this works

Run every command on **your** machine. Fill `starter/submission.txt`. Single-line fields are `name: value`. Block fields sit between `--- name ---` markers. Paste output; do not tidy it.

Pick your platform and stay in that column:

| What you need | Linux / WSL | macOS |
| --- | --- | --- |
| LAN IPv4 | `ip addr` or `ip -4 addr show` | `networksetup -listallhardwareports`, then `ipconfig getifaddr <device>` |
| Default gateway | `ip route` | `netstat -r` |
| Listening ports | `ss -tlnp` | `lsof -iTCP -sTCP:LISTEN -P -n` |
| Loopback evidence | the `inet 127.0.0.1/8` line from `ip addr` | the `127.0.0.1` line from `cat /etc/hosts` |
| Status code | `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` | same |

A Mac has no `ip` or `ss`. Do not paste a Linux command that failed.

## Your tasks

1. `platform:` — exactly `macOS`, `Linux`, or `WSL`.
2. Print the LAN IPv4. Put the address in `lan_ip:` and the command in `lan_ip_command:`.
3. Name the RFC 1918 block: `10.0.0.0/8`, `172.16.0.0/12`, or `192.168.0.0/16`.
4. Record the default gateway.
5. Record the `curl` status code from the command above.
6. Paste the raw LAN-address command output between `--- lan_ip_command_output ---`.
7. Paste the raw listeners output between `--- listening_ports ---`.
8. Paste one loopback line between `--- loopback_line ---`.
9. Run a refused connection (`curl http://127.0.0.1:9999`) and a timed-out one (`curl --max-time 4 http://192.0.2.1/`). Paste both, and notice which one returns instantly.

## What the scaffolding is for

Several fields are checked against each other. `lan_ip` must appear in the command output you pasted. `127.0.0.1` is not a LAN address.

## Expected output

`lan_ip` is four numbers with dots, in a private block, and not `127.0.0.1`. `curl_status` is `200`.

## Rules

- Use the command for your platform.
- Do not invent a LAN address.
- Do not edit `tests/`.

See `rubric.md` for how this is scored.
