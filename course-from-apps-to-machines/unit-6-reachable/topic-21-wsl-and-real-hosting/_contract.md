# WSL, and the shape of real hosting

**Unit:** 6 — Reachable: from your laptop to the whole house
**Objectives (unit-numbered):**
7. Explain why a server running inside WSL 2 is not reachable from your phone by default, using WSL 2's separate virtual network adapter.   [obj 7]
8. Apply the documented WSL fix — `networkingMode=mirrored` in `.wslconfig` plus a Hyper-V firewall rule for the port — and verify with `ip addr` inside WSL against `ipconfig.exe`.   [obj 8]
9. Explain why texting `http://192.168.1.42:8000` to a friend across town fails, using RFC 1918 private addressing and NAT, and state what a hosting provider actually sells you.   [obj 9]

## Topic generation prompt

Two jobs: rescue WSL learners, then close the course by naming what comes next.

**Part one — WSL.** Frame it as a teaching moment rather than a defect: WSL 2 is a virtual machine
with its own network, so "the machine's IP" is genuinely an ambiguous question. Quote Microsoft
directly that LAN access is not the default [src 136], and make the ambiguity visible with the
two-command diagnostic — `ip addr` inside WSL shows a NAT'd `172.x` address [src 137], while
`ipconfig.exe` run from the same shell shows the Windows LAN IP [src 147]. Interop making that second
command possible is itself worth a sentence. Then the fix, in order: `networkingMode=mirrored` in
`%UserProfile%\.wslconfig` [src 140, 141, 148], `wsl --shutdown` and the eight-second wait [src 148],
then the Hyper-V firewall rule for port 8000 [src 142] with the WSL VMCreatorId [src 143], which is
required because that firewall is on by default [src 144]. Give the `netsh portproxy` route [src 145]
as the Windows 10 fallback only, and warn that the WSL VM's IP changes across restarts so the rule goes
stale. Mention `hostname -I` versus `-i` [src 146] since Microsoft flags it explicitly.

**Be honest about the limits.** Every step is documented by Microsoft, but the combination was not
verified end to end by this course and no Windows machine was available to test it; Microsoft's own
issue tracker still has an open report about exactly this friction. Say so plainly and give the
diagnostic sequence rather than promising success. A learner who is told the truth and given a
procedure is better served than one who is promised a result that may not arrive.

**Part two — the closing beat.** The learner now has `http://192.168.1.42:8000` working on their phone.
Have them text that URL to a friend across town. It fails. This is the second, deliberate cliffhanger
and it resolves the course rather than opening a new unit. Explain it with what they already know:
`192.168.x.x` is RFC 1918 private space [src 47], usable by anyone without coordination [src 48], so
every home network on Earth has that address and it means nothing outside the one they are standing in.
Then name what a hosting provider actually sells: a machine with a publicly routable address, a
persistent name pointing at it, and a server that stays running when the laptop lid closes. Close by
being straight that `python3 -m http.server` is not the thing to put on the public internet [src 122],
and give the concrete reason [src 123] rather than a vague caution. End the course on capability, not
on a sales pitch for a next course: they can now build a file, find it, serve it, and reach it.

Do NOT teach deployment, cloud providers, DNS registration, or tunnelling tools. Naming what hosting
is is in scope; teaching it is not.

## Grounded facts

- **WSL 2 LAN access is not the default**: "This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet adapter with its own unique IP address. Currently, to enable this workflow you will need to go through the same steps as you would for a regular virtual machine. (We are looking into ways to improve this experience.)" [src 136]
- NAT is still the 2026 default; `networkingMode` default = `NAT` [src 137]
- Windows→WSL localhost forwarding does work, which is why two of three checks pass [src 138]
- `python3 -m http.server` already binds `0.0.0.0`, so the server is not the problem [src 107, 139]
- **Mirrored mode enables LAN access**: "On machines running Windows 11 22H2 and higher you can set `networkingMode=mirrored` under `[wsl2]` in the `.wslconfig` file" — benefits include "Connect to WSL directly from your local area network (LAN)" [src 140]
- Mirrored mode is GA, in the main `[wsl2]` table, and is not the default [src 141]
- **Required Hyper-V firewall rule**: `New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 80` [src 142]
- WSL VMCreatorId: `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}` [src 143]
- Hyper-V firewall is on by default for WSL [src 144]
- Windows 10 fallback: `netsh interface portproxy add v4tov4 listenport=<port> listenaddress=0.0.0.0 connectport=<port> connectaddress=(wsl hostname -I)` [src 145]
- `hostname -I` vs `-i`: "`wsl hostname -i` is your local machine (127.0.1.1 is a placeholder diagnostic address), whereas `wsl hostname -I` will return your local machine's IP address as seen by other machines" [src 146]
- `ipconfig.exe` runs from inside WSL via interop [src 147]
- `.wslconfig` does not exist by default and lives in `%UserProfile%`; changes need `wsl --shutdown` and about eight seconds [src 148]
- Windows Firewall blocks inbound by default [src 149]; unidentified networks default to the public profile [src 150]
- **This combination was not verified end to end** [see SOURCES.md → Ungrounded] — state this to the learner
- RFC 1918 private ranges [src 47] and no-coordination-needed [src 48]
- The WSL wall is heavily evidenced: 364,943 views [src 157]
- Not for production: "http.server is not recommended for production. It only implements basic security checks." [src 122]; the concrete reason is symlink following [src 123]
- Teach from: Microsoft's WSL networking page [src 136, 140, 142]; RFC 1918 §3 [src 47]

## Requested activities

- READ: 1200–1400 words. Part one: the WSL ambiguity, the two-command diagnostic, the mirrored-mode fix in order, the Windows 10 fallback, and an explicit statement of what was not verified. Part two: the friend-across-town failure, RFC 1918 and NAT, what hosting actually sells, and the production warning with its real reason. Ends on capability.
- FLASHCARDS: 10 cards. Why WSL 2 differs; `ip addr` vs `ipconfig.exe` inside WSL; `networkingMode=mirrored`; `.wslconfig` location; `wsl --shutdown`; the Hyper-V firewall rule; `hostname -I` vs `-i`; private vs public IP as a discriminating pair; what NAT does; what a hosting provider sells.
- QUIZ: 5 questions on explaining why a WSL server is unreachable, choosing the correct command to find the Windows LAN IP from inside WSL, explaining why a private IP fails across the internet, and identifying what hosting provides that a laptop does not. Use distractors [src 157] and the private-IP-is-globally-reachable misconception.

## Handoff

**Inherits:** The page loads on a second device on the LAN (or, for WSL learners, has not yet).
**Leaves:** WSL learners have a documented path and an honest account of its limits. Every learner knows why a private address stops at the front door and what hosting would add. The course's running example is complete: one file, built by hand, rebuilt by keyboard, generated by commands, served over HTTP, and loaded on a second device.
**Do not cover:** Deployment, cloud providers, DNS registration, tunnelling tools, HTTPS certificates.
