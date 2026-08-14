# Read the conversation — then try your phone

**Unit:** 3 — A second address
**Objectives (unit-numbered):**
10. Split `http://192.168.1.42:8000/` into scheme, host, port, and path.   [obj 10]
11. Run `curl -v http://localhost:8000` and spot request lines (`>`) versus response lines (`<`).   [obj 11]
12. Map 200, 404, and 500 to who has the problem — then open `http://localhost:8000` on your phone.   [obj 12]

## Topic generation prompt

The server is already running. Name what they are looking at, then hit the wall. Take `http://localhost:8000/` apart (scheme, host, port, path). Run `curl -v http://localhost:8000` against *their* server and mark `>` vs `<`. Map 200 (ok), 404 (you asked for a missing path), 500 (the server broke). Then: type `http://localhost:8000` on the phone. It fails. **Do not explain why.** The failure-moment callout names the surprise, validates the confusion, gives the one-line model ("localhost means the machine that is asking"), and points at Unit 4. Do not fix it. Do not tell them to use the LAN IP yet.

## Grounded facts

- What a URL is; scheme; authority = domain + port; an IP may replace the domain [src 98–101]
- Port as a gate; `:8000` must be typed [src 102]
- Fragment never reaches the server [src 104]
- HTTP is a client-server protocol for fetching resources; human-readable; requests and responses are discrete [src 74–76]
- Message parts: start-line, headers, blank line, optional body [src 79]
- Request-line `<method> <request-target> <protocol>`; status-line `<protocol> <status-code> <reason-phrase>` [src 80, 81]
- 200 / 404 / 500 meanings [src 85, 88, 89, 90]
- Status classes 2xx / 4xx / 5xx [src 84]
- `Content-Type` and `Content-Length` [src 94, 95]
- Real local response is `HTTP/1.0 200 OK` with `Content-type: text/html` [src 113]
- curl status idiom [src 131]
- Closed port: `curl: (7) Failed to connect… Could not connect to server` [src 132]
- Learners expect `localhost` to work from another device [src 154]
- 404 vs 500 — whose fault [src 171]
- Teach from: `curl -v` against *their* server. For a public contrast, `https://example.com` is fine without inventing headers. Do not invent a full verbose dump.

## Requested activities

- READ: 900–1200 words. Dissect the localhost URL. `curl -v` their server. Status 200/404/500. Then the phone. **Failure-moment callout required** (blockquote): name the surprise → validate → one-line model → Unit 4 will fix it. `anatomy` of `http://localhost:8000/` and/or a `sequence` of browser ↔ server are earned (budget two). Ends on the failed phone.
- FLASHCARDS: scheme; host; `>` vs `<`; 200; 404; 500; what `localhost` just did on the phone (the surprise, not the fix). 8–10 cards.
- QUIZ: 5 questions on URL parts, reading `>`/`<`, 404 vs 500, and what just happened on the phone (they should not yet "know" to type the LAN IP as the answer — the wall is the point).

## Handoff

**Inherits:** the page is served at `http://localhost:8000` on the laptop
**Leaves:** they have read the HTTP conversation for this file; the phone cannot load `http://localhost:8000`
**Do not cover:** `0.0.0.0` vs `127.0.0.1` as the bind fix, using the LAN IP on the phone, firewalls, WSL, runbooks
