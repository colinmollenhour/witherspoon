# When it doesn't work

**Unit:** 6 — Reachable: from your laptop to the whole house
**Objectives (unit-numbered):**
4. Diagnose `OSError: [Errno 98] Address already in use` by finding the owning process with `ss -tlnp` or `lsof -i :8000` and stopping it.   [obj 4]
5. Explain why `python3 -m http.server 80` fails with `PermissionError: [Errno 13] Permission denied` while port 8000 succeeds.   [obj 5]
6. Work through the three usual causes of "my phone still can't reach it" — wrong address, firewall, or wrong directory — using an ordered diagnostic rather than guessing.   [obj 6]

## Topic generation prompt

Turn the learner into someone who debugs rather than someone who retries. Build an ordered diagnostic
and teach each failure by its exact error text, because recognising the string is most of the skill.

Start with `Address already in use` — 1.8 million views' worth of confusion [src 158] — and show the
real error [src 120], noting the errno differs by platform (98 on Linux, 48 on macOS). The fix is the
skill from Topic 13: `ss -tlnp` or `lsof` to find the owner [src 58, 66], then stop it. Then port 80:
show the real `PermissionError: [Errno 13] Permission denied` [src 119] and explain it with the
privileged-port rule [src 55] and the 1024 threshold [src 56]. Be careful with scope — that sysctl is
Linux-specific; state the rule as a long-standing Unix convention and do not imply macOS has the same
knob. Then the wrong-directory failure, which is the sneakiest because it looks like success: the
server starts fine but serves a directory listing instead of the page, because it serves the directory
it was started in [src 110] and found no `index.html` [src 112]. Then the firewall. Be honest here:
whether the macOS firewall is on by default could not be confirmed from Apple's documentation, so teach
the learner to *check their own machine's state* rather than asserting a default, and describe the
approval dialog they may see [src 151] and the fact that it names the Python interpreter rather than
their project. For Windows, state that inbound traffic is blocked unless a rule matches [src 149] and
that an unidentified Wi-Fi network defaults to the more restrictive public profile [src 150].

Close with the ordered procedure, using Topic 14's instruments: is the server running (`ss`/`lsof`), is
it serving the right directory (`curl -I` on the laptop), is the phone using the LAN IP rather than
`localhost`, and does the failure look like a refusal or a timeout [src 132, 134] — the timing tell
distinguishes "nothing listening" from "something is dropping the packets", which is usually the
firewall.

Do NOT cover WSL specifically (Topic 21). Do NOT cover public IPs or hosting (Topic 21).

## Grounded facts

- **Real port-conflict error**: `OSError: [Errno 98] Address already in use` on Linux; **Errno 48** on macOS; exit code 1 [src 120]
- Evidenced confusion: "Node / Express: EADDRINUSE, Address already in use" — 1,833,924 views [src 158]
- **Real privileged-port error**: `PermissionError: [Errno 13] Permission denied`, raised from `self.socket.bind(self.server_address)`; exit code 1 [src 119]
- The rule: "The port numbers below 1024 are called privileged ports (or sometimes: reserved ports).  Only a privileged process... may bind(2) to these sockets." [src 55]
- The threshold is a Linux tunable defaulting to 1024: `net.ipv4.ip_unprivileged_port_start = 1024` [src 56] — **Linux-specific; macOS has no such sysctl** [see SOURCES.md → Ungrounded]
- Finding the owner: real `ss -tlnp` output `LISTEN 0 5 0.0.0.0:8000 0.0.0.0:* users:(("python3",pid=8,fd=4))` [src 58]; `-p` fills in for your own processes without sudo [src 59]; macOS uses `lsof` [src 66]
- Wrong directory: the server serves the directory it was started in [src 110] and falls back to a directory listing when there is no `index.html` [src 112]
- macOS firewall alert: "When your Mac detects an attempt to connect to an app you haven't added to the list and given access to, an alert message appears asking if you want to allow or deny the connection over the network or internet." [src 151]; the alert names the interpreter binary, not the project
- **Whether the macOS firewall is off by default is NOT confirmed by Apple** [see SOURCES.md → Ungrounded] — teach checking, not asserting
- Windows: "The default behavior of Windows Firewall is to: - block all incoming traffic, unless solicited or matching a *rule*" [src 149]; the public profile "is the default profile for unidentified networks" [src 150]
- The firewall is the invisible cause, evidenced: "First I switched off the firewall then I was able to request the site from another device." (71,123 views) [src 156]
- Refusal vs timeout as the diagnostic tell [src 132, 134]; curl 8.x says "Could not connect to server" at top level, with "Connection refused" only under `-v` [src 132]
- `Ctrl-C` stops the server: `Keyboard interrupt received, exiting.` [src 121]
- Teach from: the real error captures [src 119, 120]; `ip(7)` on privileged ports [src 55]

## Requested activities

- READ: 1100–1300 words. `Address already in use` → port 80 → wrong directory → firewall (checked, not asserted) → the ordered diagnostic. Every failure introduced by its exact error string. Must not claim the macOS firewall's default state or imply the Linux sysctl is cross-platform. Ends with the learner holding a repeatable procedure.
- FLASHCARDS: 10 cards. `Address already in use`; Errno 98 vs 48; `PermissionError: [Errno 13]`; the 1024 threshold; `ss -tlnp` to find an owner; `lsof -i :8000`; the directory-listing symptom; refusal vs timeout as a discriminating pair; `Ctrl-C`; the first question to ask when the phone can't connect.
- QUIZ: 5 questions on matching an error string to its cause, diagnosing a directory listing appearing instead of the page, deciding what an instant failure versus a hang implies, and choosing the command that identifies which process holds a port. Use distractors [src 158] — that the port is "broken" — and [src 156] — that the IP must be wrong when the firewall is the cause.

## Handoff

**Inherits:** The page loads on a second device via the LAN IP, or the learner arrived here because it did not.
**Leaves:** The learner can diagnose the four common server failures by their error text and has an ordered procedure for "the phone can't reach it".
**Do not cover:** WSL's NAT networking and its fix (Topic 21). Public IPs, NAT, and hosting (Topic 21).
