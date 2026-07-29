# Loopback versus the network

**Unit:** 6 — Reachable: from your laptop to the whole house
**Objectives (unit-numbered):**
1. Explain why `http://localhost:8000` fails on your phone but works on your laptop, using `127.0.0.1`'s per-machine meaning.   [obj 1]
2. State what `0.0.0.0` means as a bind address versus `127.0.0.1`, and confirm from the server's own banner which one `python3 -m http.server` uses.   [obj 2]
3. Find your laptop's LAN IP and load `http://<LAN-IP>:8000` on a second device on the same Wi-Fi.   [obj 3]

## Topic generation prompt

**This topic resolves the failure moment from Unit 5, Topic 18. Open on it directly.**

The learner's phone could not load `localhost:8000`. Explain why in one clean stroke: `localhost`
resolves via `/etc/hosts` to `127.0.0.1` [src 68], and `127.0.0.1` means *this machine* on whichever
machine is asking [src 49, 50]. The phone did exactly what it was told — it asked itself. No packet
ever left it. Reconnect this to Topic 12's `/etc/hosts` file, which the learner has already read with
`cat`, so the explanation lands on something they have seen rather than something new.

Then untangle the three strings learners conflate [src 155]: `127.0.0.1` is an address meaning this
machine; `localhost` is a *name* for that address, defined in a text file; `0.0.0.0` is not a
destination at all but a **bind instruction** meaning "accept connections arriving on any interface".
Make the learner check their own banner — it already said `0.0.0.0` [src 108], which means the server
was never the problem and has been reachable the whole time [src 107]. That is a satisfying reversal:
nothing needs fixing on the server side at all; the phone was simply given the wrong address.

Then the fix. Find the LAN IP with the platform commands from Topic 11 — `ip addr` on Linux/WSL,
`networksetup -listallhardwareports` then `ipconfig getifaddr <interface>` on macOS [src 64, 65] —
confirm it falls in an RFC 1918 range [src 47], and type `http://<LAN-IP>:8000` on the phone. Have the
learner watch the access log while they do it: a new line appears with the *phone's* IP, not
`127.0.0.1` [src 115]. That log line is the proof, and it is what Project 6 grades.

Tell WSL learners explicitly that this will probably not work for them yet and send them to Topic 21
[src 136] — do not let them grind. If the phone still fails on macOS or Linux, send them to Topic 20
rather than debugging here.

Do NOT cover firewalls, `Address already in use`, or port 80 (Topic 20). Do NOT cover WSL's networking
(Topic 21). Do NOT cover public IPs or hosting (Topic 21).

## Grounded facts

- `localhost` is defined in `/etc/hosts`: `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4` [src 68]
- `/etc/hosts` is consulted before DNS [src 69]
- Loopback means this machine: RFC 1122 "(g)  { 127, <any> }" / "Internal host loopback address.  Addresses of this form MUST NOT appear outside a host." [src 49]; RFC 6890 `127.0.0.0/8`, "Forwardable | False", "Global | False" [src 50]
- Real loopback interface line: `inet 127.0.0.1/8 scope host lo` [src 51]
- **The server already binds all interfaces**: "By default, the server binds itself to all interfaces." Verified: `LISTEN 0 5 0.0.0.0:8000` [src 107]
- Real banner already showing it: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` [src 108]
- MS states the general rule: "you may need to bind your application to `0.0.0.0` instead of `127.0.0.1`" — `python3 -m http.server` already does [src 139]
- LAN IP commands: `ip addr` (Linux/WSL); macOS `networksetup -listallhardwareports` then `ipconfig getifaddr <interface>` [src 64, 65]
- RFC 1918 ranges to check the address against [src 47]
- Real access-log line showing the requesting client's address: `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -` [src 115]
- **WSL will not work yet**: "This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet adapter with its own unique IP address." [src 136]
- The three-way confusion is evidenced at 379,882 views [src 155]; the phone-can't-reach-localhost cluster at 903,096 views [src 154]
- No real LAN IP capture exists [see SOURCES.md → Ungrounded] — teach the command and output shape, do not fabricate an address block
- Teach from: RFC 1122 §3.2.1.3 [src 49]; the real `/etc/hosts` capture [src 68]; the Python `--bind` documentation [src 107]

## Requested activities

- READ: 1100–1300 words. Resolve the wall immediately. Then the three-way distinction between `127.0.0.1`, `localhost`, and `0.0.0.0`, with the reversal that the server was never misconfigured. Then find the LAN IP per platform, load it on the phone, and watch the phone's address appear in the access log. Route WSL learners to Topic 21 and stuck learners to Topic 20. Must not fabricate a LAN IP capture.
- FLASHCARDS: 10 cards. `127.0.0.1`; `localhost`; `0.0.0.0`; bind address vs destination address as a discriminating pair; why the phone failed; the LAN IP command per platform (3 cards); what the access log proves; RFC 1918 as the check that an address is local.
- QUIZ: 5 questions on explaining the phone failure, distinguishing the three strings, choosing the right LAN IP command per platform, and identifying which access-log line proves a second device connected. Use distractors [src 154] and [src 155].

## Handoff

**Inherits:** The server runs at `http://localhost:8000` on the laptop; the phone cannot reach it and the learner does not yet know why.
**Leaves:** `http://<LAN-IP>:8000` loads on a second device for macOS and Linux learners, with the phone's address visible in the access log. The Unit 5 wall is down. WSL learners have been told plainly that Topic 21 is theirs.
**Do not cover:** Firewalls, port conflicts, port 80 (Topic 20). WSL networking (Topic 21). Public IPs and hosting (Topic 21).
