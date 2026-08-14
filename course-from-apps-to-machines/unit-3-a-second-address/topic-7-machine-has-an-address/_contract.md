# Your machine has an address

**Unit:** 3 — A second address
**Objectives (unit-numbered):**
1. Print your machine's LAN IPv4 address with `ip -4 addr` on Linux or WSL, or `ipconfig getifaddr` on a Mac.   [obj 1]
2. Place a given address in one of RFC 1918's three private blocks: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.   [obj 2]
3. Say what `127.0.0.1` means, and why a `192.168.x.x` address stops at your network.   [obj 3]

## Topic generation prompt

The file is generated. Leave it on disk and look at the machine that holds it. Have them run the LAN-IP command and write the address down — they will need it later. Teach three facts: every machine on the Wi-Fi has a private address from RFC 1918; `127.0.0.1` is this computer talking to itself and must not appear on the wire; a `192.168` (or `10.` or `172.16–31.`) address is not reachable from the public internet. Do **not** mention phones. Do **not** start a server. Do not teach DNS or `/etc/hosts`. Default Linux: `ip -4 addr`. "On a Mac" box: `networksetup -listallhardwareports` then `ipconfig getifaddr <iface>` — Wi-Fi is not always `en0`. Worked examples use `192.168.1.42` as a documented-shape example, or the real loopback line `inet 127.0.0.1/8 scope host lo` — never invent a LAN capture.

## Grounded facts

- RFC 1918 private blocks: `10/8`, `172.16/12`, `192.168/16` [src 47]
- Private addressing needs no IANA coordination [src 48]
- Loopback is the whole `127/8`; must not appear outside a host [src 49]
- Loopback CIDR `127.0.0.0/8`, Forwardable False [src 50]
- Real loopback output: `inet 127.0.0.1/8 scope host lo` [src 51]
- IPv4 is 32 bits / four octets [src 52]
- A socket address is address + 16-bit port [src 54]
- macOS has no `ip` or `ss` [src 63]
- macOS LAN command is `ipconfig getifaddr` [src 64]
- macOS Wi-Fi is not reliably `en0` [src 65]
- No real LAN IPv4 was captured in research — teach the method, never invent an address [Ungrounded]
- Teach from: [src 51] for loopback; RFC 1918 ranges for classification.

## Requested activities

- READ: 700–1000 words. Run the command. Classify their address. Contrast `127.0.0.1`. `compare` of `127.0.0.1` vs a `192.168.x.x` (two columns: who can use it, does it leave the machine). Ends with their LAN IP written down; next, doors on that address.
- FLASHCARDS: LAN IP; `127.0.0.1`; the three RFC 1918 blocks; why a private address stops at the router. 8 cards.
- QUIZ: 5 questions on classifying `10.0.0.5` / `192.168.1.42` / `127.0.0.1` / `8.8.8.8`, and what loopback means.

## Handoff

**Inherits:** `index.html` is generated and sitting in `first-site`
**Leaves:** same file; the learner has printed and classified the LAN IP of the machine that holds it
**Do not cover:** ports, `ss`, HTTP, the server, phones, DNS, NAT as a deep topic (one sentence is enough)
