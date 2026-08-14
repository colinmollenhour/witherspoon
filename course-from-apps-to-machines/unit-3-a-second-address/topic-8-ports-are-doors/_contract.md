# Ports are doors

**Unit:** 3 — A second address
**Objectives (unit-numbered):**
4. Name the usable TCP port range 1–65535, and what ports 80, 443, and 8000 usually mean.   [obj 4]
5. Read `host:port` in a URL and name the port when it is omitted.   [obj 5]
6. List which programs are listening with `ss -tlnp` on Linux or WSL, or `lsof -iTCP -sTCP:LISTEN -P -n` on a Mac, and read the address:port column.   [obj 6]

## Topic generation prompt

They have a LAN IP. An address is not enough — a port is the door. Teach 1–65535, then 80 / 443 / 8000 (8000 is convention, not a registered HTTP port). A URL hides 80 and 443; `:8000` must be typed. Then list listeners. Default Linux: `ss -tlnp`. Show the captured line for a python server *as what they will see after the next topic* — they should run `ss` **now** and notice 8000 is probably empty. "On a Mac" box: `lsof`. One box: `localhost` is a name for `127.0.0.1`, written in `/etc/hosts` — not a DNS course. Do not start the server. Do not teach ping.

## Grounded facts

- Ports are a 16-bit namespace 0–65535; bindable 1–65535 [src 36, 38]
- Port 80 = http, 443 = https, 22 = ssh [src 42, 43, 44]
- Port 8000 is `irdmi`, not HTTP — dev-server use is convention [src 45]
- Privileged ports below 1024 [src 55]
- Real `ss -tlnp` line: `LISTEN 0 5 0.0.0.0:8000 0.0.0.0:* users:(("python3",pid=8,fd=4))` [src 58]
- `ss` flags: `-t` TCP, `-l` listening, `-n` numeric, `-p` process [src 60]
- macOS listening command is `lsof` with `-P -n` [src 66]
- Real `/etc/hosts` localhost line [src 68]
- `/etc/hosts` is consulted before DNS [src 69]
- Port as a "gate"; `:8000` must be typed [src 102]
- `0.0.0.0` vs `127.0.0.1` vs `localhost` are conflated [src 155]
- Teach from: [src 58] as the line they will match later. Do not start python in this topic.

## Requested activities

- READ: 700–1000 words. Ports, then `ss -tlnp` on their quiet machine. `anatomy` of `192.168.1.42:8000` or of the [src 58] line is earned. localhost box. Ends knowing 8000 is the door they will open next.
- FLASHCARDS: port; 80; 443; 8000; omitted port in `http://`; `ss -tlnp`; `localhost`. 8–10 cards.
- QUIZ: 5 questions on omitted ports, what 8000 is, reading `0.0.0.0:8000` vs `127.0.0.1:8000`, and privileged 80.

## Handoff

**Inherits:** they have their LAN IP written down
**Leaves:** they can name port 8000 as the door this file will use, and have listed what (if anything) is listening
**Do not cover:** `python3 -m http.server`, HTTP status codes, `curl`, phones
