# Test cases — Network Self-Portrait

Six self-contained parsers. Each takes the submission file as its only argument, prints `PASS` on
success or a definite `FAIL:` string naming the field and the problem, and exits 0 or 1.

```
python3 tests/test_1_private_lan_address.py submission.txt
```

No third-party packages. Each file carries its own copy of the parser, so any test can be run alone.

| # | `name` | `weight` | `expectedOutput` | Adversarial |
| --- | --- | --- | --- | --- |
| 1 | `private_lan_address` | 25 | `PASS` | |
| 2 | `adversarial_loopback_shortcut` | 20 | `PASS` | yes |
| 3 | `adversarial_invented_address` | 20 | `PASS` | yes |
| 4 | `adversarial_platform_command` | 15 | `PASS` | yes |
| 5 | `gateway_and_listeners` | 10 | `PASS` | |
| 6 | `loopback_status_and_timing` | 10 | `PASS` | |
| | **Total** | **100** | | |

---

### 1. `private_lan_address` — weight 25 — `tests/test_1_private_lan_address.py`

**description:** Checks that `lan_ip` parses as four dot-separated octets each 0–255, is not inside
`127.0.0.0/8`, falls inside one of RFC 1918's three private blocks, and that `rfc1918_block` names the
block it actually falls in. **Catches the shortcut of classifying the address by its first octet
alone** — `172.32.4.4` starts with `172` but the block stops at `172.31.255.255` [src 47], so it is a
public address and belongs in none of the three.

### 2. `adversarial_loopback_shortcut` — weight 20 — `tests/test_2_adversarial_loopback_shortcut.py`

**ADVERSARIAL. description:** Catches the learner who submits `127.0.0.1` as their LAN IP — the single
most likely shortcut, because it is the address they have seen most often and the one every tutorial
puts in front of them. Rejects any address in `127.0.0.0/8`, which is loopback in its entirety
[src 49, 50], and rejects `0.0.0.0`, which means "every address this machine has" rather than an
address this machine has. Then closes the back door: it requires `loopback_line` to contain
`127.0.0.1` **and** requires `lan_ip` not to be one of the addresses appearing in `loopback_line`, so
the learner cannot satisfy both fields by copying one capture into both.

### 3. `adversarial_invented_address` — weight 20 — `tests/test_3_adversarial_invented_address.py`

**ADVERSARIAL. description:** Catches the made-up answer — a plausible-looking `192.168.x.x` typed
from memory or lifted from a tutorial — by requiring `lan_ip` to appear verbatim inside
`lan_ip_command_output`. If the address is not in the pasted output, it was not read off this machine.
Also catches the thinner version of the same shortcut on Linux and WSL, where a learner pastes a bare
address instead of real `ip addr` output: a genuine capture labels every IPv4 address with `inet`
[src 51]. macOS is exempt from that second check, because `ipconfig getifaddr` prints the address and
nothing else [src 64].

### 4. `adversarial_platform_command` — weight 15 — `tests/test_4_adversarial_platform_command.py`

**ADVERSARIAL. description:** Catches the macOS learner who submits `ip addr` as their
`lan_ip_command`. That command does not exist on macOS — no `ip(8)` or `ss` man page is in the current
macOS man-page set, because both are Linux iproute2 tools [src 63] — so the submitted output cannot
have come from the machine described. macOS must use `ipconfig getifaddr <device>` [src 64]. The
mirror case is caught too: a Linux or WSL learner submitting the macOS command, or submitting
`ifconfig`, which is no longer installed by default on Linux desktops [src 62].

### 5. `gateway_and_listeners` — weight 10 — `tests/test_5_gateway_and_listeners.py`

**description:** Checks that `gateway` parses as a dotted quad, is not inside `127.0.0.0/8` — nothing
can be routed through a non-forwardable address [src 50] — and is not the same address as `lan_ip`.
Then checks that `listening_ports` is real output containing at least one `address:port` pair whose
port is an integer in 1–65535, the usable range that follows from ports being a 16-bit namespace
[src 36] with port 0 Reserved [src 38]. The exact sentinel `NO LISTENERS FOUND` on the first line is
accepted for a machine that genuinely has nothing listening.

### 6. `loopback_status_and_timing` — weight 10 — `tests/test_6_loopback_status_and_timing.py`

**description:** Checks the three remaining captured fields. `loopback_line` contains `127.0.0.1`, and
on Linux or WSL also carries the `/8` prefix, since the whole block is loopback and the real captured
line reads `inet 127.0.0.1/8 scope host lo` [src 51]. `curl_status` is exactly three digits inside
100–599, the five status classes [src 84]. `refused_vs_timeout` names both exit code `7` and exit code
`28` [src 132, 134] and contains language describing both an immediate failure and a wait — **catching
the learner who names the two codes but never actually watched the clock**, which is the observation
the whole step exists to produce. Depth beyond that is graded by rubric criterion 4, not here.
