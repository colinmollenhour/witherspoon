# A two-line runbook

**Unit:** 4 — The third address
**Objectives (unit-numbered):**
4. Fix `Address already in use` by finding the owner with `ss` or `lsof` and stopping it.   [obj 4]
5. Explain why `python3 -m http.server 80` hits `Permission denied` while port 8000 works.   [obj 5]
6. Work the three usual causes of "my phone still can't reach it" in order, and write a two-line runbook that starts and stops the server.   [obj 6]

## Topic generation prompt

The phone works. Make it repeatable, and teach the breaks. Two-line runbook: start in `~/projects/first-site` on 8000; stop with Ctrl-C (`Keyboard interrupt received, exiting.`). Diagnostic order as an `order` widget: (1) is the server running, (2) is it the right directory, (3) is the phone using the LAN IP not localhost, then firewall. `Address already in use` is Errno 98 on Linux, 48 on macOS — find the owner, stop it. Port 80 is privileged (below 1024). WSL box: NAT is default; documented fix is `networkingMode=mirrored` in `%UserProfile%\.wslconfig` plus a Hyper-V firewall rule; this combination is **not verified end-to-end by the course** — say so; fallback is a second device that is not a phone, or the Windows browser via localhost forwarding. Hosting closer: a private address stops at your network; a host sells you a public one. Do not recap HTTP.

## Grounded facts

- Port 80 as non-root: `PermissionError: [Errno 13] Permission denied` [src 119]
- Port in use: `OSError: [Errno 98] Address already in use` on Linux; Errno 48 on macOS [src 120]
- Ctrl-C output [src 121]
- Privileged ports below 1024 [src 55]
- `Address already in use` reads as a broken machine [src 158]
- Firewall as second cause [src 156]
- WSL2 LAN not default [src 136]
- NAT still the 2026 default; mirrored is recommended not default [src 137]
- Mirrored mode enables LAN; Win 11 22H2+; `.wslconfig` `[wsl2] networkingMode=mirrored` [src 140, 141]
- Hyper-V firewall rule + VMCreatorId `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}` [src 142, 143]
- Hyper-V firewall on by default for WSL 2.0.9+ [src 144]
- `.wslconfig` location; ~8 second restart [src 148]
- macOS firewall alert wording [src 151]
- Whether macOS firewall is off by default is ungrounded — teach them to check [Ungrounded]
- WSL phone-reachability end-to-end is ungrounded — flag it [Ungrounded]
- RFC 1918 addresses are not globally reachable [src 47, 48]
- Teach from: the errors above, verbatim.

## Requested activities

- READ: 800–1100 words. Runbook first. Then the three breaks. WSL box (honest). One-paragraph hosting closer. `order` widget of the diagnostic ladder is earned. Ends holding a two-line runbook and the same file at its third address.
- FLASHCARDS: start command; stop; Errno 98; port 80; the three checks; what hosting sells. 8–10 cards.
- QUIZ: 5 questions on in-use vs permission, the diagnostic order, and why a friend across town cannot load `192.168.x.x`.

## Handoff

**Inherits:** the page loads on a second device at `http://192.168.x.x:8000`
**Leaves:** a two-line runbook that starts and stops the server; they can diagnose the three usual breaks
**Do not cover:** recap of URL anatomy, `curl -v`, generating the page, new networking theory
