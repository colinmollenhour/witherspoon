# Machines have addresses

You can say the address of your page out loud: `~/projects/first-site/index.html`, and you generated
it with commands rather than typing it. But that address means something to exactly one machine — the
one you are sitting at. Hand it to the phone in your pocket and the phone has no idea what `~` is.

So the address has to go up a level: not "where is the file on this machine" but **"which machine"**.
Same idea you already have, one storey higher. A path addresses a file inside a machine; an IP
address addresses a machine inside a network.

## The dotted quad

An IP address is four numbers separated by dots — `192.168.1.70`, `10.0.0.0`, `127.0.0.1`. The shape
comes from the spec that defined it: "Addresses are fixed length of four octets (32 bits)." [src 52]
An **octet** is eight bits, and eight bits count 256 values, so each of the four numbers runs 0 to
255 and no further. `192.168.1.300` is not a large address; it is not an address.

Thirty-two bits is not many, which is why a successor exists — IPv6 "increases the IP address size
from 32 bits to 128 bits" [src 53]. Everything in this course happens over IPv4, so put IPv6 down.

You will also see a trailing slash, like `127.0.0.0/8`. That number counts how many of the 32 bits
are **fixed**: in `/8` the first 8 bits — the first number — are pinned and the other 24 vary freely.

## Three ranges anybody may use

Some addresses are reserved for private networks. Here are all three, verbatim from RFC 1918 [src 47]:

```
     10.0.0.0        -   10.255.255.255  (10/8 prefix)
     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
```

Read the middle one carefully; it is the one people get wrong. The `172` block stops at
`172.31.255.255`, not at `172.255.255.255`. Count one address past that ceiling and you are on
`172.32.0.0`, which is an ordinary public address belonging to somebody on the internet.

What makes these three special is not a technical property but a permission: "An enterprise that
decides to use IP addresses out of the address space defined in this document can do so without any
coordination with IANA or an Internet registry." [src 48] No form, no fee, no registry. That is why
the router in almost every home on earth hands out addresses starting `192.168.` — it picked them
itself, so did every other router, and none of them collided, because none of those networks can see
each other. Which is the catch: `192.168.1.70` on your network and `192.168.1.70` in a friend's flat
are two different machines wearing the same label.

## `127.0.0.1` is not an address you share

This is the one you must get exactly right.

The whole block `127.0.0.0/8` — every address beginning with `127` — is **loopback**. RFC 1122
writes the form as "(g)  { 127, <any> }" and says: "Internal host loopback address.  Addresses of
this form MUST NOT appear outside a host." [src 49] RFC 6890 tabulates the same block and marks it
"Forwardable | False" and "Global | False" [src 50]. Not forwardable: no router will carry it
anywhere. Not global: it has no meaning beyond the machine you are standing on.

Here is a real capture of a real loopback interface, from `ip -4 addr show` [src 51]:

```
inet 127.0.0.1/8 scope host lo
```

Read the fields. `inet` introduces an IPv4 address. `127.0.0.1/8` is the address and its block. `lo`
is the interface name, short for loopback. And `scope host` is the machine saying in its own output
what RFC 6890 says: the scope of this address is *this host*, nothing wider.

The sentence to memorise, worth reading twice:

> **`127.0.0.1` means "this machine" — on whichever machine is asking.**

It is not one address that several computers share. It is not the name of your laptop. It is a word
like *here* or *me*: perfectly precise, and pointing somewhere different depending on who says it.
Every machine has a `127.0.0.1`, and on every machine it is a different computer — its own.

Type `127.0.0.1` into your laptop's browser and the laptop asks itself a question. Type the same four
numbers into your phone's browser and **the phone asks itself** — not your laptop, not the router,
not the internet. The request never leaves the handset. That is not a failure or a firewall or a
typo; it is the address doing exactly what it is defined to do. Park that; it comes back in Unit 5.

## Finding your own machine's address

No single command works everywhere.

| Platform | Command | Note |
| --- | --- | --- |
| Linux, WSL | `ip addr` | `ip -4 addr show` narrows it to IPv4 only |
| macOS | `networksetup -listallhardwareports`, **then** `ipconfig getifaddr <interface>` | Two steps, in that order |

**On Linux and WSL**, run `ip addr`. Output is one block per interface, and you can already read a
line of it, because the capture above *is* one. You will have at least two blocks: `lo`, carrying the
`127.0.0.1/8` line above, and a second interface for your real network connection, whose `inet` line
carries your LAN address — and that one falls inside one of the three RFC 1918 ranges.

This course cannot show you that second line. The machine these materials were captured on had only a
loopback interface, so a real LAN capture does not exist, and inventing a plausible-looking one would
teach you to trust a number no machine ever printed. You have the shape; go read your own.

Older instructions will tell you to run `ifconfig`. Canonical's own words: "We've already stopped
installing ifconfig on desktops (it still gets installed on servers for now)" [src 62]. If it is
missing, nothing is broken — `ip` is the tool.

**On macOS**, `ip` does not exist at all — it is a Linux tool and no `ip` man page ships with macOS
[src 63]. Use `ipconfig getifaddr`, which "Prints to standard output the IP address for the first
network service associated with the given interface." [src 64] It needs an interface name, and that
is where people get stuck: Wi-Fi is *not* reliably `en0` — Apple Silicon Macs have been observed
reporting it as `en2` [src 65]. So run `networksetup -listallhardwareports` first; it "Displays list
of hardware ports with corresponding device name and ethernet address." [src 65] Find the Wi-Fi line,
take its device name, feed that to `ipconfig getifaddr`. Guess wrong and you get silence, not an
error: "The output will be empty if no service is currently configured or active on the interface."
[src 64] Empty output means wrong interface, not no network.

**One warning for WSL users.** WSL 2 "has a virtualized ethernet adapter with its own unique IP
address" [src 136] — typically a NAT'd `172.x` — so `ip addr` inside WSL shows WSL's address, not
your Windows machine's LAN address. That gap is Unit 6's problem.

## Where this leaves you

You can now print your own machine's LAN IPv4 address, say which of RFC 1918's three blocks it sits
in, and state that `127.0.0.1` is a different computer for every speaker.

Which leaves a question hanging. If anybody may use `192.168.x.x` without asking, and millions of
networks did, your address is unique only inside your own network. So what happens when a request
from it has to reach a machine on the far side of the internet, where the same label means somebody
else entirely? Hold that thought — it is the seed of the last thing this course explains.
