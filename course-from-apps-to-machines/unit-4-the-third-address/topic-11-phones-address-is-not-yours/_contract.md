# The phone's address is not yours

**Unit:** 4 — The third address
**Objectives (unit-numbered):**
1. Explain why `http://localhost:8000` fails on the phone but works on the laptop — `127.0.0.1` means this machine only.   [obj 1]
2. Say what `0.0.0.0` means as a bind address versus `127.0.0.1`, and confirm from the server banner which one `python3 -m http.server` uses.   [obj 2]
3. Open `http://192.168.x.x:8000` on a second device on the same Wi-Fi.   [obj 3]

## Topic generation prompt

The phone failed. Now name why, then do the fix. `localhost` / `127.0.0.1` is the machine that is asking — the phone asked itself. The banner already said `0.0.0.0` (all interfaces); the server was willing. Type `http://192.168.x.x:8000` on the phone. Read the access log: a new client address, not `127.0.0.1`. WSL learners: one short box that default NAT often blocks LAN, and Unit 4's last page has the documented path — do not dump mirrored mode here. Do not write the runbook yet. Do not teach port 80.

## Grounded facts

- Loopback must not appear outside a host [src 49]
- Banner binds `0.0.0.0` [src 108]
- Default bind is all interfaces; `--bind 127.0.0.1` is localhost only [src 107]
- Apps must accept LAN connections — bind `0.0.0.0` not `127.0.0.1` [src 139]
- Learners expect localhost from another device [src 154]
- `0.0.0.0` vs `127.0.0.1` vs `localhost` conflated [src 155]
- Firewall is the invisible second cause [src 156]
- WSL2 LAN access is not the default [src 136]
- Windows→WSL localhost forwarding works [src 138]
- Teach from: their own LAN IP (method from Unit 3) and the banner [src 108]. Do not invent a phone IP in a sample log; say the first field will be the phone, not `127.0.0.1`.

## Requested activities

- READ: 700–1000 words. Why the phone failed. Banner = all doors. Type the LAN URL. Read the log. `compare` of `http://localhost:8000` on laptop vs phone vs `http://192.168.x.x:8000` on phone (three columns). Ends with the page on the second device.
- FLASHCARDS: why phone-localhost fails; `0.0.0.0`; `127.0.0.1`; the third URL; what the log's first field is. 8 cards.
- QUIZ: 5 questions on who `localhost` names, what the banner's `0.0.0.0` means, and which URL the phone needs.

## Handoff

**Inherits:** localhost works on the laptop; the phone failed
**Leaves:** the same file loads at `http://192.168.x.x:8000` on a second device; the access log shows that client
**Do not cover:** runbook, `Address already in use`, port 80, Hyper-V, hosting providers
