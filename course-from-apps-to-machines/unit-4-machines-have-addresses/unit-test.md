# Unit 4 test — Machines have addresses

**Title:** Addresses, names, ports, and reachability

**Description:** Assesses whether you can find and classify your own machine's LAN IPv4 address, say
what `127.0.0.1` means and why a private address is not reachable across the internet, resolve a
hostname and explain where `localhost` is actually defined, read the resolution order, place a port
number in the right range and name what 80, 443, and 22 are for, read a `host:port` and the port
implied when it is omitted, list what is listening on your machine, and tell a closed port from an
unreachable host without guessing.

10 questions: 7 multiple choice, 2 true/false, 1 short answer. Questions 3 and 8 are synthesis
questions, each requiring two topics at once.

---

## Question 1

**Type:** `MULTIPLE_CHOICE`

You are sitting at a MacBook and you need its LAN IPv4 address. Which approach actually works?

- A. Run `ip addr` and read the `inet` line on the Wi-Fi interface.
- B. **Run `networksetup -listallhardwareports`, read the Device name on the Wi-Fi entry, then run `ipconfig getifaddr <that device>`.**
- C. Run `ipconfig getifaddr en0`, since Wi-Fi is always `en0` on a Mac.
- D. Run `ss -tlnp` and read the address in the Local Address:Port column.

**Explanation:** B is the macOS procedure, and it is two steps for a reason. `ipconfig getifaddr`
"Prints to standard output the IP address for the first network service associated with the given
interface" — but you have to hand it the right interface, and `networksetup -listallhardwareports`
"Displays list of hardware ports with corresponding device name and ethernet address", which is where
that name comes from. A fails because macOS has no `ip` command at all: no `ip(8)` man page exists in
the current macOS man-page set, because `ip` is a Linux iproute2 tool. C fails on exactly the
assumption it states — Wi-Fi is not reliably `en0`; Apple Silicon Macs have been observed reporting it
as `en2`, and guessing wrong gives you silence rather than an error, since "The output will be empty
if no service is currently configured or active on the interface." D fails twice over: `ss` does not
exist on macOS either, and `ss` lists which programs are listening on which ports, not which addresses
the machine has (objective 1).

---

## Question 2

**Type:** `MULTIPLE_CHOICE`

Which of these addresses falls inside one of RFC 1918's three private blocks?

- A. `172.32.4.4`
- B. **`172.20.4.4`**
- C. `192.170.1.5`
- D. `127.0.0.1`

**Explanation:** RFC 1918 lists exactly three blocks: "10.0.0.0 - 10.255.255.255 (10/8 prefix)",
"172.16.0.0 - 172.31.255.255 (172.16/12 prefix)", and "192.168.0.0 - 192.168.255.255 (192.168/16
prefix)". B is inside the middle one, because 20 falls between 16 and 31. A is the trap: it starts
with `172`, but the block stops at `172.31.255.255`, so `172.32.4.4` is an ordinary public address
belonging to somebody on the internet. C is the same trap in the third block — private means
`192.168`, not `192.anything`, so `192.170.1.5` is public. D is a real reserved address but not an
RFC 1918 one: `127.0.0.0/8` is loopback, and RFC 6890 records it under the name "Loopback" with
"Forwardable | False" and "Global | False" (objective 2).

---

## Question 3 — SYNTHESIS

**Type:** `MULTIPLE_CHOICE`

Your laptop's `/etc/hosts` contains the line `127.0.0.1   localhost localhost.localdomain localhost4
localhost4.localdomain4`. You pick up your phone, open its browser, and type `http://localhost/`.
What does the phone try to reach?

- A. **The phone itself. `localhost` and `127.0.0.1` both mean "this machine" on whichever machine is asking, so the request never leaves the handset.**
- B. Your laptop, because `localhost` was defined on the laptop in `/etc/hosts` and that definition applies to the whole network.
- C. Nothing — the lookup fails, because `localhost` only resolves on machines that have an `/etc/hosts` file.
- D. Whichever machine on the network most recently claimed the name `localhost` from the router.

**Explanation:** A is right, and it is the whole point of both topics at once. `/etc/hosts` maps
`127.0.0.1` to the name `localhost`, and `127.0.0.0/8` is loopback: RFC 1122 writes the form as
"(g)  { 127, <any> }" and says "Internal host loopback address.  Addresses of this form MUST NOT
appear outside a host." So `localhost` is not one shared machine; it is a word like *here*, pointing
somewhere different depending on who says it. B is the misconception this question exists to break —
the laptop's `/etc/hosts` is a file on the laptop's disk, and nothing publishes it to anyone else; it
is also the single most common wrong expectation people bring to a local server. C is wrong because
the phone resolves the name using its own configuration and reaches itself; the failure you see is a
connection failure, not a lookup failure. D invents a claiming mechanism that does not exist — no
router hands out `localhost`, and no name is ever needed for an address that means "me" (objectives
3, 5).

---

## Question 4

**Type:** `MULTIPLE_CHOICE`

On Ubuntu under WSL, you run `which dig` and it prints nothing at all. What is going on?

- A. **`dig` is not preinstalled on Debian, Ubuntu, or WSL. `/usr/bin/dig` comes from the package `bind9-dnsutils`; install it with `sudo apt install bind9-dnsutils`.**
- B. DNS resolution is broken on this machine and must be repaired before any name will resolve.
- C. `dig` was removed from modern operating systems, so `nslookup` is now the only option.
- D. `which` only reports shell builtins, so `dig` is installed but invisible to that check.

**Explanation:** A is right: `dpkg -S /usr/bin/dig` traces the binary to `bind9-dnsutils`, and it is
absent from the Ubuntu WSL image manifest, so a fresh WSL install simply does not have it. Older
tutorials say `dnsutils`, which still works but is only a "Transitional package for bind9-dnsutils".
B confuses a missing tool with a broken service — nothing about name resolution is affected by whether
a diagnostic program is installed. C is a rumour that was checked and is false: `dig(1)` is present in
the current macOS man-page set alongside `host(1)` and `nslookup(1)`, and no DNS-tool removal appears
in the macOS 15 or macOS 26 release notes. D inverts what `which` does — it searches your path for
executables, which is exactly why silence from it is the right signal to act on, and it is the same
habit as running `which nano` before relying on `nano` (objective 4).

---

## Question 5

**Type:** `TRUE_FALSE`

**Statement:** `/etc/hosts` is a fallback. The system asks a DNS server first, and only reads
`/etc/hosts` if the DNS lookup comes back with nothing.

**Answer:** False

**Explanation:** The opposite is true. The order is configured on Linux in `/etc/nsswitch.conf`, and
the real captured line reads `hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname`.
Those are the sources to try, in order, and `files` — meaning `/etc/hosts` — comes *before* `dns`.
That single ordering explains both of the things you can observe: `localhost` resolves with Wi-Fi
switched off, because the answer is found on the first source tried and nothing is ever asked of
anyone; and a name written into `/etc/hosts` outranks the entire internet for that name, because DNS
is never consulted once the file has answered. If the order were the way the statement describes,
neither of those would happen (objective 6).

---

## Question 6

**Type:** `MULTIPLE_CHOICE`

A tutorial tells you: "Use port 8000 — it is the standard port reserved for web development." Which
correction is accurate?

- A. **Port 8000 is registered as `irdmi`, with no RFC reference and nothing to do with HTTP. The registered web ports are 80 for http and 443 for https, and 22 is ssh. Serving a web page on 8000 is convention only.**
- B. Port 8000 is IANA-assigned to HTTP development, but only within the Dynamic band 49152–65535.
- C. Port numbers run only from 1 to 1023, so 8000 is not a valid port at all.
- D. 8000 is correct as the standard development port. 80 is for SSH and 443 is for HTTP.

**Explanation:** A is right, and the registry row is the evidence:
`irdmi,8000,tcp,iRDMI,[Gil_Shafriri],[Gil_Shafriri],,,,,,` — a service called `irdmi`, no RFC, no
mention of HTTP or of development. The registered rows for the three numbers you will see forever are
`http,80,tcp,World Wide Web HTTP`, `https,443,tcp,http protocol over TLS/SSL`, and
`ssh,22,tcp,The Secure Shell (SSH) Protocol`. IANA also states outright that "THE FACT THAT NETWORK
TRAFFIC IS FLOWING TO OR FROM A REGISTERED PORT DOES NOT MEAN THAT IT IS \"GOOD\" TRAFFIC, NOR THAT
IT NECESSARILY CORRESPONDS TO THE ASSIGNED SERVICE" — the registry is a phone book, not a lock.
B is wrong on both halves: 8000 sits in the User / Registered Ports, "from 1024-49151", not the
Dynamic Ports, "from 49152-65535 (never assigned)". C is wrong about the range: ports are a 16-bit
namespace, so the numbers run 0–65535, and since port 0 is Reserved the usable range is 1–65535;
0–1023 is merely the System / Well Known band. D swaps 22 and 80 (objective 7).

---

## Question 7

**Type:** `MULTIPLE_CHOICE`

You open `https://developer.mozilla.org` every day without typing a port, and you are about to open
`http://192.168.1.70:8000/` on your phone. Which statement is correct?

- A. **Both URLs use a port. The second uses 443, supplied by the browser because that is `https://`'s default; the first must state `:8000` because 8000 is not `http://`'s default.**
- B. http and https share a single port, so neither URL strictly needs one and `:8000` is optional.
- C. The first URL needs `:8000` only because it uses an IP address instead of a domain name; a URL with a domain name never needs a port.
- D. The second URL uses no port at all — ports apply only to non-web protocols such as SSH.

**Explanation:** A restates MDN's rule: "The port indicates the technical \"gate\" used to access the
resources on the web server. It is usually omitted if the web server uses the standard ports of the
HTTP protocol (80 for HTTP and 443 for HTTPS) to grant access to its resources. Otherwise it is
mandatory." Nothing unusual is happening in the first URL; the second is hiding a number. B is the
misconception that http and https share a port — they do not, and they never have: the registry
assigns 80 to `http` and 443 to `https`, which is precisely why servers have to be configured for both
separately. C confuses two independent things: MDN notes that "an IP address may also be used" in
place of the domain, and that substitution has no effect whatsoever on whether a port is required —
`http://example.com:8000/` needs the port for the same reason. D is wrong because every connection has
a port on both ends; a socket address is "a combination of an IP interface address and a 16-bit port
number", so there is no such thing as a connection without one (objective 8).

---

## Question 8 — SYNTHESIS

**Type:** `MULTIPLE_CHOICE`

On your laptop, `ss -tlnp` prints this line:

```
LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
```

From your phone, you run a fetch against the laptop's LAN IP on port 8000. It fails with curl exit
code 28, after waiting out the full `--max-time 4` and receiving 0 bytes. What do those two facts
together support?

- A. **A program — `python3`, pid 8 — is listening on port 8000 on every address the machine has. Because the failure was slow rather than instant, the phone's packets are not reaching that program, rather than arriving and finding the port empty.**
- B. Nothing is listening on 8000. The `LISTEN` line describes a connection that has already been closed.
- C. The port is closed on the laptop, which is why curl waited the full four seconds before the refusal came back.
- D. `0.0.0.0` means loopback only, so the phone should have used `127.0.0.1` instead — `0.0.0.0`, `127.0.0.1`, and `localhost` all name the same thing anyway.

**Explanation:** A reads both instruments correctly. In the `ss` line, `LISTEN` is the state — waiting
for connections, not currently talking to anyone — `0.0.0.0:8000` is the local address and port, and
`users:(("python3",pid=8,fd=4))` names the process holding it. Meanwhile the timing is the tell:
exit 28 with 0 bytes after the full timeout is the shape of a host that never answered, not of a port
that refused. A refusal is an *answer*, and answers are fast — the captured refusal reads
`curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server`. B contradicts
the `ss` output it is given: `LISTEN` is a live listening socket, and a closed connection would not
appear in `ss -tlnp` at all. C gets the pairing backwards — a refusal is exit 7 and comes back
instantly; four seconds of silence is not a refusal. D conflates three different things: `0.0.0.0` is
a stand-in for "any address this machine has" rather than loopback, `127.0.0.1` means "this machine"
on whichever machine is asking — so from the phone it would reach the phone — and `localhost` is a
name in `/etc/hosts` pointing at `127.0.0.1`. They are not interchangeable (objectives 9, 12).

---

## Question 9

**Type:** `TRUE_FALSE`

**Statement:** You run `ping -c 3` against your router and get no replies at all. That proves the
router is unreachable from your machine.

**Answer:** False

**Explanation:** It proves nothing of the kind. `ping` does not open an ordinary connection — it sends
an ICMP probe, which needs a raw socket, which needs a privilege. On the machine every capture in this
course came from, `ping -c 3 127.0.0.1` produced `ping: socktype: SOCK_RAW` / `ping: socket: Operation
not permitted` / `ping: => missing cap_net_raw+p capability or setuid?` — a failure against the one
address that cannot possibly be unreachable — while `curl` fetched a page from the public internet at
the same moment on the same machine. That is the normal state inside containers, on locked-down work
machines, and behind any firewall that drops ICMP on purpose. The asymmetry is the rule worth keeping:
a *successful* ping is real evidence, and a failed one is evidence of nothing. Use it as a cheap first
look, never as a verdict (objective 10).

---

## Question 10

**Type:** `SHORT_ANSWER`

Write the single command that fetches `https://example.com` and prints only its HTTP status code, and
say what each of its three flags does.

**Sample answer:**

```
curl -s -o /dev/null -w '%{http_code}\n' https://example.com
```

It prints `200`. `-s` is silent mode, which suppresses the progress meter and other chatter.
`-o /dev/null` writes the response body to `/dev/null`, the system's discard bin, so the HTML never
reaches the terminal. `-w '%{http_code}\n'` writes out the status code after the transfer, followed by
a newline. One line in, one number out.

**A grader must see all three of these:**

1. The command itself, with all three flags and a URL — `curl -s -o /dev/null -w '%{http_code}\n' <url>`.
2. `-o /dev/null` identified as discarding the body, not as saving it or as silencing curl.
3. `-w '%{http_code}\n'` identified as what prints the status code — this is the flag doing the actual
   work, and an answer that credits `-s` or `-o` with printing the number has the roles reversed.

**Explanation:** Plain `curl https://example.com` dumps the whole response body into your terminal,
and `curl -I` gives you the headers, which is still more than you want when the only thing you are
asking is "did anything answer, and what did it say". This idiom strips the output down to the one
number, which is why it is the command you will type more than any other when you start diagnosing
whether a page is reachable. Read the number as opaque for now — that something answered is the
finding here; what the code *means* is Unit 5's subject (objective 11).
