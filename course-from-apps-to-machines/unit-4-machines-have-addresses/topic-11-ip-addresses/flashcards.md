# Flashcards — IP addresses

**Card 1**
- **Front:** How long is an IPv4 address, and how is that length written out?
- **Back:** 32 bits, written as four octets separated by dots. RFC 791: "Addresses are fixed length of four octets (32 bits)." [src 52] Eight bits per octet means each of the four numbers runs 0–255.

**Card 2**
- **Front:** RFC 1918 private block — the one that starts with `10`
- **Back:** `     10.0.0.0        -   10.255.255.255  (10/8 prefix)` [src 47]

**Card 3**
- **Front:** RFC 1918 private block — the one that starts with `172`
- **Back:** `     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)` [src 47] The ceiling is `172.31.255.255`, not `172.255.255.255` — one address past it, `172.32.0.0`, is public.

**Card 4**
- **Front:** RFC 1918 private block — the one that starts with `192.168`
- **Back:** `     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)` [src 47]

**Card 5**
- **Front:** What does `127.0.0.1` point at?
- **Back:** This machine — whichever machine is asking. It is not one address several computers share; every machine has its own `127.0.0.1`, and on each one it means that machine.

**Card 6**
- **Front:** What is loopback, and how big is the block?
- **Back:** The whole `127.0.0.0/8` — every address starting `127` [src 49, 50]. RFC 1122: "Internal host loopback address.  Addresses of this form MUST NOT appear outside a host." [src 49] RFC 6890 marks it "Forwardable | False" and "Global | False" [src 50].

**Card 7**
- **Front:** Linux or WSL — print this machine's addresses
- **Back:** `ip addr` (use `ip -4 addr show` for IPv4 only). Not `ifconfig` — Canonical: "We've already stopped installing ifconfig on desktops" [src 62].

**Card 8**
- **Front:** macOS — print one interface's IPv4 address
- **Back:** `ipconfig getifaddr <interface>`, which "Prints to standard output the IP address for the first network service associated with the given interface." [src 64] Empty output means the wrong interface, not a dead network. macOS has no `ip` command at all [src 63].

**Card 9**
- **Front:** macOS — why run `networksetup -listallhardwareports` before you ask for an address?
- **Back:** Because Wi-Fi is not reliably `en0`; Apple Silicon Macs have been observed reporting it as `en2` [src 65]. This command "Displays list of hardware ports with corresponding device name and ethernet address" [src 65], so you read the real device name instead of guessing.

**Card 10**
- **Front:** Private address vs public address — what actually separates them?
- **Back:** A private address (one of RFC 1918's three blocks) may be used by anyone "without any coordination with IANA or an Internet registry" [src 48], so it is unique only inside one network and millions of networks reuse it. A public address is registered, globally unique, and reachable from across the internet.
