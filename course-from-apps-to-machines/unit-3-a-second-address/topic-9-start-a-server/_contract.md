# Start a server

**Unit:** 3 — A second address
**Objectives (unit-numbered):**
7. Start `python3 -m http.server 8000` inside `~/projects/first-site` and open `http://localhost:8000`.   [obj 7]
8. Read an access-log line and match method, path, and status to what you just did.   [obj 8]
9. Show that the same page over `file://` has no status code, while over `http://` it has one.   [obj 9]

## Topic generation prompt

Do this, then name it. `cd ~/projects/first-site`, run `python3 -m http.server 8000`, open `http://localhost:8000`. They should see their page. Read the banner (`Serving HTTP on 0.0.0.0 port 8000`) and one access-log line. Contrast the old `file://` tab — no status code there. Mac box: if `python3` pops a dialog, `xcode-select --install`. Do **not** try the phone yet. Do not teach `curl -v` or status-code classes — next topic owns the conversation. Do not explain `0.0.0.0` vs loopback as the phone fix.

## Grounded facts

- Default port 8000; binds all interfaces [src 106, 107]
- Startup banner: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` [src 108]
- Speaks HTTP/1.0 by default; live line `HTTP/1.0 200 OK` [src 109]
- Serves the current working directory [src 110]
- URL path maps to a local file path [src 111]
- `index.html` / `index.htm` are the index pages [src 112]
- Real `curl -I`: `HTTP/1.0 200 OK` / `Server: SimpleHTTP/0.6 Python/3.14.6` / `Content-type: text/html` / `Content-Length: 31` [src 113]
- Real access-log line: `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -` [src 115]
- Access log is stderr; banner is stdout [src 116]
- Log echoes the client's version; response is HTTP/1.0 [src 117]
- Ctrl-C: `Keyboard interrupt received, exiting.` [src 121]
- Not for production; follows symlinks [src 122, 123]
- macOS ships no Python; `python3` prompts for CLT; fix is `xcode-select --install` [src 127, 128, 129]
- Ubuntu/WSL ships python3 [src 130]
- Learners ask why a local server is needed [src 169]
- `file://` is believed shareable [src 168]
- Docs as of 13 Aug 2026 are Python 3.14.7; CLI contract unchanged. Use the captured 3.14.6 `Server:` line; do not invent a 3.14.7 response.
- Teach from: [src 108], [src 113], [src 115].

## Requested activities

- READ: 800–1100 words. Start the server in `first-site`. Open localhost. Read the log. Contrast `file://`. `anatomy` of the [src 115] log line (or a `200` variant they will see — if you show a 200 log line, derive it from [src 115]'s shape with `"GET / HTTP/1.1" 200 -` and say the status is the one they got). Ends with the page at `http://localhost:8000` on the laptop.
- FLASHCARDS: the start command; why the cwd matters; the banner; one log line; `file://` has no status. 8 cards.
- QUIZ: 5 questions on starting in the wrong directory, reading a log line, and `file://` vs `http://`.

## Handoff

**Inherits:** they know their LAN IP and that 8000 is the door; the server is not running
**Leaves:** `python3 -m http.server 8000` is serving `index.html` at `http://localhost:8000` on the laptop
**Do not cover:** `curl -v`, status-code classes, the phone, `0.0.0.0` as the phone fix, WSL LAN
