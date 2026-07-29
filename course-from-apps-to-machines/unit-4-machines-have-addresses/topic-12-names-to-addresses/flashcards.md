# Flashcards — Names become addresses

### Card 1

**Front:** You want the IP address a hostname resolves to, printed on its own with no report around
it. What do you run?

**Back:** `dig +short <hostname>` — for example `dig +short example.com`. `+short` strips dig's
report down to the answer: one address per line, nothing else.

---

### Card 2

**Front:** `which dig`

**Back:** The check you run before relying on `dig`. A printed path means it is installed; no output
means it is not.

---

### Card 3

**Front:** `which dig` printed nothing on Ubuntu or WSL. What installs it?

**Back:** `sudo apt install bind9-dnsutils` — the package that provides `/usr/bin/dig` on
Debian, Ubuntu, and WSL. (`dnsutils` is only a transitional package name [src 73].)

---

### Card 4

**Front:** `/etc/hosts`

**Back:** A plain text file on your own machine mapping addresses to hostnames — one address, then
every name that means it. Read it with `cat /etc/hosts`. macOS keeps it at the same path [src 70].

---

### Card 5

**Front:** `localhost`

**Back:** A name for `127.0.0.1`, defined by the line `127.0.0.1   localhost ...` in `/etc/hosts`
[src 68]. It means *this machine* — the one doing the resolving.

---

### Card 6

**Front:** `hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname` — what is this line
saying, and where does it live?

**Back:** The resolution order, configured in `/etc/nsswitch.conf`: sources are tried left to right,
so `files` (`/etc/hosts`) is consulted before `dns` [src 69].

---

### Card 7

**Front:** Hostname vs IP address — which is which?

**Back:** A hostname is a label for a machine (`example.com`, `localhost`); an IP address is the
machine's actual address (`127.0.0.1`). Only addresses move packets, so every hostname must be
resolved into one first.

---

### Card 8

**Front:** Wi-Fi is off and the Ethernet cable is unplugged. Why does `localhost` still resolve?

**Back:** Because it is answered from disk, not from the network — `files` is tried before `dns`,
and the `127.0.0.1   localhost` line in `/etc/hosts` ends the lookup before any query is sent.
