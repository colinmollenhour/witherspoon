# Names become addresses

**Unit:** 4 — Machines have addresses
**Objectives (unit-numbered):**
4. Resolve a hostname to an IP address with `dig +short example.com`, after installing it with `sudo apt install bind9-dnsutils` if `which dig` finds nothing.   [obj 4]
5. Find the `127.0.0.1 localhost` line in `/etc/hosts` and explain why `localhost` resolves without any network request.   [obj 5]
6. State the resolution order — `/etc/hosts` is consulted before DNS — and name the file that configures it.   [obj 6]

## Topic generation prompt

Names are a convenience layer over the addresses from Topic 11; nothing new is happening at the
network level. Teach `dig +short` as the tool that shows the answer with nothing else attached. Handle
availability honestly and per-platform: `dig` ships on macOS [src 71] — this was checked specifically
because it was rumoured removed, and it was not — but it is **not** preinstalled on Debian, Ubuntu, or
WSL, where it comes from `bind9-dnsutils` [src 73]. Teach `which dig` as the check, mirroring Topic 8's
`which nano` habit. For macOS learners, add Apple's caveat that `dig` deliberately bypasses the system
resolver, so its answer can differ from what other apps see [src 72]. Then the file that makes
`localhost` work: show the real `/etc/hosts` contents [src 68] and the `127.0.0.1 localhost` line. This
is the moment to connect two things the learner already has — `127.0.0.1` from Topic 11 and a filesystem
path from Unit 1 — and show that a name they have typed a hundred times is resolved by a plain text
file they can read with `cat`. Then resolution order, proved from the real `nsswitch.conf` line [src 69]
where `files` precedes `dns`. That ordering is why `localhost` needs no network and why editing
`/etc/hosts` can override the entire internet for one name.

The research environment had DNS blocked, so **no real `dig` answer was captured** — teach the command
and the shape of its output without presenting an invented response. Do not fabricate an IP for
`example.com`.

Do NOT teach ports (Topic 13), `ping` or `curl` (Topic 14), or HTTP (Unit 5).

## Grounded facts

- Real `/etc/hosts` contents: `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4` and `::1         localhost localhost.localdomain localhost6 localhost6.localdomain6` [src 68]
- Real resolution order: `hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname` — `files` precedes `dns` [src 69]
- macOS ships `dig`, `host`, and `nslookup`; it was NOT removed in macOS 15 or 26 [src 71]
- macOS caveat: "The dig command does not use the host name and address resolution or the DNS query routing mechanisms used by other processes running on macOS." [src 72]
- `dig` is NOT preinstalled on Debian/Ubuntu/WSL: it comes from `bind9-dnsutils`; `dnsutils` is a transitional package [src 73]
- macOS has `/etc/hosts` at the same path: hosts(5) "hosts — host name data base" [src 70]
- `127.0.0.1` is loopback [src 49, 50]
- No live `dig` answer was capturable in the research environment [see SOURCES.md → Ungrounded]
- Teach from: the real `/etc/hosts` capture [src 68]; the real `nsswitch.conf` line [src 69]

## Requested activities

- READ: 800–1000 words. `which dig` check and per-platform install. `dig +short` and what it shows. The real `/etc/hosts` file, read with `cat`. Resolution order from the real `nsswitch.conf` line. Ends with the learner understanding that `localhost` is a name in a text file, not a network destination. Must NOT invent a `dig` response.
- FLASHCARDS: 8 cards. `dig +short`; `/etc/hosts`; `localhost`; the resolution order (files then DNS); `bind9-dnsutils`; `which dig`; hostname vs IP address as a discriminating pair; why `localhost` needs no network.
- QUIZ: 5 questions on predicting whether a lookup hits `/etc/hosts` or DNS, explaining why `localhost` resolves with the network unplugged, choosing the install command for a stated platform, and identifying what `dig +short` returns.

## Handoff

**Inherits:** The learner knows their LAN IP and what `127.0.0.1` means.
**Leaves:** The learner can resolve a name to an address and knows `localhost` is defined in `/etc/hosts` on their own machine.
**Do not cover:** Ports (Topic 13). `ping`/`curl` (Topic 14). HTTP (Unit 5).
