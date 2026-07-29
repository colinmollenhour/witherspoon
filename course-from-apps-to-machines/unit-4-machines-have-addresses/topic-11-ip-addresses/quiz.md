# Quiz — IP addresses

## Question 1

**Type:** MULTIPLE_CHOICE

Three of these four addresses are the highest address in one of RFC 1918's private blocks. The fourth
is one step past a ceiling and so is an ordinary public address. Which is the public one?

- `10.255.255.255`
- `172.31.255.255`
- `172.32.0.0`
- `192.168.255.255`

**Correct:** `172.32.0.0`

**Explanation:** RFC 1918 writes its middle block as "172.16.0.0 - 172.31.255.255 (172.16/12
prefix)" [src 47], so the block ends at `172.31.255.255`. Count one address further and you land on
`172.32.0.0`, which is outside every private block and therefore public. `172.31.255.255` is the
tempting pick for anyone who reads it as already past the edge — it is the last address *inside* the
block, quoted verbatim in the RFC. `10.255.255.255` and `192.168.255.255` are likewise the verbatim
ceilings of "10.0.0.0 - 10.255.255.255 (10/8 prefix)" and "192.168.0.0 - 192.168.255.255 (192.168/16
prefix)" [src 47] — a run of `255`s looks dramatic but says nothing about whether an address is
private (objective 2).

## Question 2

**Type:** MULTIPLE_CHOICE

Someone posting for help gives his server's address on his home network as `192.168.1.70` [src 154].
Which block does that address belong to?

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `127.0.0.0/8`

**Correct:** `192.168.0.0/16`

**Explanation:** `192.168.1.70` sits inside "192.168.0.0 - 192.168.255.255 (192.168/16 prefix)"
[src 47] — the `/16` means the first two numbers are pinned and the last two vary, which is why every
`192.168.anything.anything` is in this block. `10.0.0.0/8` and `172.16.0.0/12` are the other two
private blocks and are wrong on the first number alone. `127.0.0.0/8` is the trap worth naming: it is
a reserved block, but it is loopback, not a private LAN range — RFC 6890 marks it "Forwardable |
False" and "Global | False" [src 50], so no router ever hands a `127` address to a laptop
(objective 2).

## Question 3

**Type:** MULTIPLE_CHOICE

You are on a MacBook and you need to print the machine's LAN IPv4 address. Which approach works?

- Run `ip addr` and read the `inet` line
- Run `networksetup -listallhardwareports`, find the Wi-Fi device name, then run `ipconfig getifaddr <that name>`
- Run `ipconfig getifaddr en0` straight away, since Wi-Fi is always `en0`
- Run `networksetup -listallhardwareports` on its own and read the address off the Wi-Fi entry

**Correct:** Run `networksetup -listallhardwareports`, find the Wi-Fi device name, then run `ipconfig getifaddr <that name>`

**Explanation:** `ipconfig getifaddr` "Prints to standard output the IP address for the first network
service associated with the given interface" [src 64] — it needs the interface name, so you discover
it first with `networksetup -listallhardwareports`, which "Displays list of hardware ports with
corresponding device name and ethernet address" [src 65]. Going straight to `en0` is the common
failure: Wi-Fi is not reliably `en0`, and Apple Silicon Macs have been observed reporting it as `en2`
[src 65]; guess wrong and "The output will be empty" [src 64] with no error to tell you why.
`ip addr` is a Linux tool and does not exist on macOS at all [src 63]. And
`networksetup -listallhardwareports` alone lists device names and ethernet addresses — it never
prints an IP address (objective 1).

## Question 4

**Type:** TRUE_FALSE

Your laptop is on the Wi-Fi and its page is reachable at `127.0.0.1`. Your phone is on the same
Wi-Fi. **True or false:** typing `127.0.0.1` into the phone's browser will reach the laptop, because
both devices are on the same network and `127.0.0.1` is the address of the machine doing the serving.

**Correct answer:** False

**Explanation:** The opposite is true — the phone reaches *itself*. `127.0.0.1` is loopback, and
RFC 1122 defines the whole `{ 127, <any> }` form as the "Internal host loopback address" whose
"Addresses of this form MUST NOT appear outside a host" [src 49]; RFC 6890 marks the block
"Forwardable | False" and "Global | False" [src 50]. It is not one address several machines share, so
"same network" changes nothing: the request never leaves the handset, and no router would carry it if
it tried. This is the belief people actually hold — "So I want to directly connect to my apache2
server from my android device using **localhost and not the servers IP** (ex 192.168.1.70)" [src 154]
(objective 3).

## Question 5

**Type:** SHORT_ANSWER

Two things about addresses, in your own words. First: your laptop is serving your page and answers to
`127.0.0.1`. Someone types `127.0.0.1` into a browser on a completely different machine — what does
that address point at over there, and why? Second: your laptop's LAN address is `192.168.1.70`. Why
can nobody on the far side of the internet reach your laptop by typing that?

**Sample answer:** On the other machine, `127.0.0.1` points at that machine itself, not at my laptop.
`127.0.0.1` does not name a particular computer — it means "this machine" on whichever machine is
asking, so every machine has one and on every machine it is a different computer. The whole
`127.0.0.0/8` block is loopback: RFC 1122 says addresses of that form "MUST NOT appear outside a
host," and RFC 6890 marks the block not forwardable and not global, so the request never leaves the
machine that made it. As for `192.168.1.70`: that is inside one of RFC 1918's three private blocks,
and anyone may use those blocks "without any coordination with IANA or an Internet registry." Because
nobody registers them, millions of separate home networks have their own `192.168.1.70`. The address
is unique inside my network only, so it identifies no particular machine from outside it and nothing
out on the internet can route to it.

**A grader must see:**
1. `127.0.0.1` on the second machine means *that* machine — the address is relative to whoever is
   asking, not a shared name for one computer (a "no, it goes to my laptop" answer fails).
2. A reason grounded in loopback's definition — must not appear outside a host / not forwardable /
   not global — rather than just "it doesn't work."
3. `192.168.1.70` is private and reusable without registration, so it is unique only inside one
   network and therefore cannot identify a machine from the outside.

**Explanation:** Both halves rest on the same idea: an address is only meaningful inside a scope.
`127.0.0.1`'s scope is one host, which is why it resolves to a different computer for every speaker;
`192.168.1.70`'s scope is one private network, which is why it is ambiguous everywhere else. The
tempting wrong answer to the first half is "the second machine gets an error" — it does not
necessarily get an error, it gets an answer from itself, which is a different and more confusing
outcome (objective 3).
