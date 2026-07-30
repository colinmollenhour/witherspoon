# Project 4 — Network Self-Portrait

**Type:** `interactive-form`
**Unit:** 4 — Machines have addresses

## Goal

Sketch your machine on the network: LAN IPv4 and which private block it sits in, the default gateway, what is listening where, and proof from your own screen that loopback and the LAN address are not the same thing.

---

## Instructions

### How this works

There is no sandbox and no cloud machine. **You run every command on your own machine**, in your own
terminal, and paste what it prints into a submission file. That is the whole point: the only machine
whose network position you can portray is the one you are sitting at.

Copy `starter/submission.txt` to a working file and fill it in. It has two kinds of field:

- **Single-line fields**, written as `name: value` — one line, no fences, no quotes.
- **Block fields**, opened and closed by a marker line like `--- listening_ports ---`. Paste raw
  command output between the markers. Do not retype it, do not tidy it, do not truncate it.

The tests parse that file. They are strict about format and strict about consistency: several of them
cross-check one field against another, so a value you typed from memory rather than read off your
screen will be caught.

**Every command below has a platform.** Pick your row and stay in it. `macOS`, `Linux`, and `WSL` are
the three the tests accept, spelled exactly like that.

| What you need | Linux / WSL | macOS |
| --- | --- | --- |
| LAN IPv4 address | `ip addr` (or `ip -4 addr show`) | `networksetup -listallhardwareports`, **then** `ipconfig getifaddr <device>` |
| Default gateway | `ip route` | `netstat -r` |
| Listening ports | `ss -tlnp` | `lsof -iTCP -sTCP:LISTEN -P -n` |
| Loopback evidence | the `inet 127.0.0.1/8` line from `ip addr` | the `127.0.0.1` line from `cat /etc/hosts` |
| Status code | `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` | same |

macOS has neither `ip` nor `ss` — no `ip(8)` or `ss` man page exists in the current macOS man-page set
[src 63]. That is why the macOS column is different, and it is the single most common way this
project gets failed: a macOS learner copies `ip addr` out of a Linux tutorial, gets
`command not found`, and submits it anyway. One test exists purely to catch that.

### Your tasks

1. **State your platform.** `platform:` is exactly one of `macOS`, `Linux`, `WSL`.

2. **Print your LAN IPv4 address.**

   On **Linux or WSL**, run `ip addr`. You will get one block per interface. One of them is `lo`,
   carrying the loopback line you already know from Topic 11 [src 51]:

   ```
   inet 127.0.0.1/8 scope host lo
   ```

   Another block is your real network connection. Its `inet` line has the same shape — the word
   `inet`, then a dotted-quad address, then a slash and a prefix length — and *that* address is your
   LAN IP. It will start with `10.`, `172.`, or `192.168.` [src 47].

   This brief does not print an example of that second line. The machine every other capture in this
   course came from had only a loopback interface, so no real LAN capture exists, and a made-up one
   would teach you to trust a number no machine ever printed. You have the shape. Go read your own.

   On **macOS**, run `networksetup -listallhardwareports` first. It "Displays list of hardware ports
   with corresponding device name and ethernet address" [src 65]. Find the Wi-Fi entry, take its
   device name, and feed that to `ipconfig getifaddr`, which "Prints to standard output the IP address
   for the first network service associated with the given interface" [src 64]. Do not assume `en0`
   — Apple Silicon Macs have been observed reporting Wi-Fi as `en2` [src 65]. Empty output means you
   named the wrong interface: "The output will be empty if no service is currently configured or
   active on the interface" [src 64].

   Put the address in `lan_ip:`, the exact command you ran in `lan_ip_command:`, and paste the
   command's **raw output** into the `--- lan_ip_command_output ---` block.

   *WSL note:* WSL 2 "has a virtualized ethernet adapter with its own unique IP address" [src 136] —
   typically a NAT'd `172.x`. So `ip addr` inside WSL shows WSL's own address, not your Windows
   machine's LAN address. Submit what `ip addr` shows you. The gap between the two is Unit 6's
   problem, not this project's.

3. **Classify the address.** Put the RFC 1918 block it falls in into `rfc1918_block:`, written exactly
   as one of these three strings, quoted verbatim from RFC 1918 [src 47]:

   ```
        10.0.0.0        -   10.255.255.255  (10/8 prefix)
        172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
        192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
   ```

   Accepted values: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.

   Read the middle one carefully — it stops at `172.31.255.255`. `172.20.4.4` is in that block;
   `172.32.4.4` is not in any of them.

4. **Find your default gateway.** This is the one command in this project the readings did not cover,
   so here is where it comes from. `netstat`'s own manual page says: "This program is mostly obsolete.
   Replacement for netstat is  ss.   Replacement for netstat -r is ip route." [src 61] That sentence
   names both tools you need: `ip route` on Linux and WSL, and `netstat -r` on macOS, which ships
   `netstat` [src 67].

   Run it and look for the **default route** — the entry the machine uses when no more specific route
   matches. It names an address: that is your gateway, the machine your packets are handed to on their
   way off your network. Put it in `gateway:`.

   No sample output is printed here either, for the same reason as step 2.

5. **List what is listening.** On Linux or WSL, `ss -tlnp` — `-t` TCP, `-l` listening, `-n` don't
   resolve service names, `-p` show the process [src 60]. A real captured line [src 58]:

   ```
   LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
   ```

   On macOS, `lsof -iTCP -sTCP:LISTEN -P -n`, where `-P` "inhibits the conversion of port numbers to
   port names for network files" and `-n` "inhibits the conversion of network numbers to host names
   for network files" [src 66].

   Paste the whole output into `--- listening_ports ---`, header row included. Blank entries in the
   process column are normal: `ss -p` fills that column in for processes you own and leaves it blank
   for other users' [src 59]. Blank means "not yours to see", not "no program".

   If your listing genuinely has no rows — possible on a bare WSL install — put the single line
   `NO LISTENERS FOUND` in the block instead, followed by whatever the command did print.

6. **Capture your loopback evidence.** Paste one line into `--- loopback_line ---`.

   On **Linux or WSL**, the loopback `inet` line from `ip addr`. It carries `127.0.0.1/8` — the whole
   `127.0.0.0/8` block is loopback, not just the one address [src 49, 50].

   On **macOS**, `cat /etc/hosts` and take the line that begins with `127.0.0.1`. macOS keeps that
   file at the same path — hosts(5), "hosts — host name data base" [src 70]. The real captured line
   from the course machine [src 68] shows the shape:

   ```
   127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
   ```

   The point of this field is the contrast. Your machine has two addresses in this portrait and they
   do different jobs: `127.0.0.1` means *this machine, on whichever machine is asking*, and RFC 6890
   marks the whole block "Forwardable | False" and "Global | False" [src 50]. Your LAN IP is the one
   another device on your network could actually aim at. They must not be the same value, and a test
   checks that.

7. **Get a status code.** Run the idiom [src 131]:

   ```
   curl -s -o /dev/null -w '%{http_code}\n' https://example.com
   ```

   `-s` silences the progress meter, `-o /dev/null` throws the body away, and `-w '%{http_code}\n'`
   writes the status code and a newline. Put the number it prints into `curl_status:` — just the
   digits.

8. **Break it two ways and time both.** Run these two commands and watch the clock.

   ```
   curl http://127.0.0.1:9999
   curl --max-time 4 http://192.0.2.1/
   ```

   The first aims at your own machine on a port where nothing is listening. The captured result
   [src 132]:

   ```
   curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server
   ```

   The second aims at `192.0.2.1`, an address RFC 5737 reserves for documentation, so it is
   guaranteed never to be a real host [src 134]:

   ```
   curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received
   ```

   Write your own observation into `--- refused_vs_timeout ---`. Name both exit codes — `7` and `28`
   — and describe **how the timing differed on your machine**, not what the definitions say. If port
   `9999` happens to be in use on your machine, pick another unused high number and say which.

   One warning worth repeating: the phrase "Connection refused" is **not** in the first line. It
   appears only under `-v` [src 132]. If you write that you saw it in the plain output, you did not.

### What the scaffolding is for

The submission template is not a worksheet — it is a **cross-check**. Each field is cheap to fake on
its own, and almost impossible to fake consistently:

- `lan_ip` has to appear inside `lan_ip_command_output`, so the address must have come off a real
  screen.
- `lan_ip_command` has to be the command your stated `platform` actually has, so a macOS learner
  cannot submit a Linux command.
- `rfc1918_block` has to match the block `lan_ip` genuinely falls in, so classification cannot be
  guessed independently of the address.
- `lan_ip` and `loopback_line` have to disagree, which is the whole thesis of the project.

That is deliberate, and it is what "evidence" means for the rest of this course. In Unit 6 you will
be diagnosing a page that a phone cannot load, and the difference between *what you read* and *what
you assumed* is going to be the difference between fixing it in a minute and not fixing it at all.

Notice too what this portrait does **not** tell you. It says what your machine's address is and what
is listening on it. It says nothing about whether any of that is reachable from another device.
Listening is not reachable — hold that gap.

### Expected output

A completed submission run against the tests prints exactly six lines:

```
PASS
PASS
PASS
PASS
PASS
PASS
```

Anything else is a definite failure string naming the field and the problem, for example:

```
FAIL: lan_ip=127.0.0.1 is inside 127.0.0.0/8 (loopback) — that is this machine talking to itself, not its address on the LAN
```

### Rules

- Do not edit the marker lines in the template (`--- name ---`). The parser keys on them.
- Do not edit the field names. Values only.
- Paste raw output. Do not retype, reformat, translate, or truncate a captured block.
- Do not run anything as `sudo` for this project. `ss -p` already shows your own processes without it
  [src 59], and the blank rows are part of what you are meant to see.
- Do not start a web server. Nothing in this project requires one, and Unit 5 owns that.
- If a command genuinely does not exist on your platform, that is a finding, not a failure — write
  what happened rather than substituting a command from another platform's column.

---

## Steps

- [ ] **1. Declare your platform** — `platform` is exactly one of `macOS`, `Linux`, `WSL` (case-insensitive).
- [ ] **2. Capture the LAN address command and its output** — `lan_ip_command` is non-empty and `lan_ip_command_output` is non-empty; on Linux or WSL `lan_ip_command_output` contains the token `inet`.
- [ ] **3. Record the LAN address** — `lan_ip` parses as four dot-separated octets each 0–255, and `lan_ip` appears as a whole address inside `lan_ip_command_output`.
- [ ] **4. Prove it is not loopback** — `lan_ip` is NOT within `127.0.0.0/8`, and `lan_ip` is not `0.0.0.0`.
- [ ] **5. Place it in a private block** — `lan_ip` falls within one of `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
- [ ] **6. Classify it correctly** — `rfc1918_block` is one of the three block strings and matches the block `lan_ip` actually falls in.
- [ ] **7. Use a platform-appropriate command** — if `platform` is `macOS`, `lan_ip_command` contains `ipconfig getifaddr` and contains neither `ip addr`/`ip -4`/`ip a` nor `ss`; if `platform` is `Linux` or `WSL`, `lan_ip_command` contains the word `ip` followed by whitespace and does not contain `ipconfig`.
- [ ] **8. Record the default gateway** — `gateway` parses as four dot-separated octets each 0–255, is NOT within `127.0.0.0/8`, and is not equal to `lan_ip`.
- [ ] **9. Record what is listening** — `listening_ports` is non-empty and either contains at least one `address:port` pair whose port is an integer 1–65535, or its first line is exactly `NO LISTENERS FOUND`.
- [ ] **10. Record the loopback line** — `loopback_line` contains `127.0.0.1`; if `platform` is `Linux` or `WSL` it also contains `/8`.
- [ ] **11. Record the status code** — `curl_status` is exactly three digits and falls in 100–599.
- [ ] **12. Time the two failures (noticing step — do this last)** — `refused_vs_timeout` names both `7` and `28` as standalone numbers and contains both a word describing an immediate failure and a word describing a wait, so that the timing difference you observed is stated rather than the definitions restated.

---

## Rubric

See [`rubric.md`](rubric.md). Four criteria, weights summing to 100, with 25 points reserved for
whether your refused-vs-timeout observation shows you actually watched the clock.

## Tests

See [`tests/testcases.md`](tests/testcases.md) for the manifest — name, weight, expected output, and
the shortcut each test is designed to catch — and the six `.py` files beside it for the parsers.

---

## Environment

Nothing here is `latest`. Every version is the one the ledger records.

### Grader

| Setting | Value |
| --- | --- |
| Runtime | Python `3.14.6`, the current stable release, published 10 June 2026 [src 126] |
| Packages | none — every test is self-contained and uses only `re` and `sys` |
| Invocation | `python3 tests/test_N_<name>.py <path-to-submission.txt>` |
| Timeout | 10000 ms per test |
| Expected output | `PASS` on stdout, exit status 0 |

### Learner machine, by platform

| Tool | Linux / WSL | macOS |
| --- | --- | --- |
| `ip` | Ships. Provided by `iproute2 6.1.0-1ubuntu6` in the Ubuntu WSL image manifest [src 130] | **Absent.** No `ip(8)` man page exists in the current macOS man-page set [src 63] |
| `ss` | Ships, same `iproute2` package [src 130] | **Absent** [src 63] |
| `ifconfig` | **Not installed by default.** Canonical: "We've already stopped installing ifconfig on desktops (it still gets installed on servers for now)" [src 62] | not used by this project |
| `ipconfig getifaddr` | not available | Ships [src 64] |
| `networksetup` | not available | Ships [src 65] |
| `lsof` | not used by this project | Ships [src 66] |
| `netstat` | Present but "mostly obsolete" on Linux [src 61] — use `ss` and `ip route` instead | Ships; used here for `netstat -r` [src 61, 67] |
| `curl` | Ships. `curl 8.5.0-2ubuntu10.6` in the Ubuntu WSL image manifest [src 130] | Ships. Apple does not publish a component version, so none is pinned here |
| `dig` | **Not preinstalled.** `/usr/bin/dig` comes from `bind9-dnsutils`; install with `sudo apt install bind9-dnsutils`. `dnsutils` is only a "Transitional package for bind9-dnsutils" [src 73] | Ships, alongside `host` and `nslookup`; it was rumoured removed in recent releases and was not [src 71]. Note Apple's caveat: "The dig command does not use the host name and address resolution or the DNS query routing mechanisms used by other processes running on macOS." [src 72] |

`dig` is not required by any field in this submission, but it is the fourth tool of this unit and the
row above is the install answer you will need the moment you reach for it on Debian, Ubuntu, or WSL.

Reference distribution for the Linux/WSL column: Ubuntu 26.04 LTS "Resolute Raccoon", released
2026-04-23 [src 35]. Package versions above are those listed in the Ubuntu WSL image manifest
[src 130].

### Addresses used by the failure-timing step

| Address | Why it is safe to point at |
| --- | --- |
| `127.0.0.1` port `9999` | Loopback — the request never leaves your machine [src 49] |
| `192.0.2.1` | RFC 5737 TEST-NET, reserved for documentation, guaranteed never to be a real host [src 134] |
