# Your first server

**Unit:** 5 — HTTP: reading the conversation, and joining it
**Objectives (unit-numbered):**
10. Start a server with `python3 -m http.server 8000` from inside `~/projects/first-site` and load `http://localhost:8000` in your browser.   [obj 10]
11. Read the server's access log line and match its method, path, and status code to the action you just took.   [obj 11]
12. Show that the same page loaded over `file://` has no status code and no response headers, while over `http://` it has both.   [obj 12]

## Topic generation prompt

**This topic carries the course's designed failure moment. Write it exactly as staged.**

The learner has spent a unit reading other people's HTTP. Now they make their own. Start the server
from inside `~/projects/first-site` and show the real banner [src 108]. Load `http://localhost:8000`
and let the win land — this is the first time their file has had a real URL. Then read the access log
line [src 115] field by field and match it to what they just did, noting it goes to stderr while the
banner went to stdout [src 116], which is the payoff for Topic 9. Point out the small surprise that the
log echoes the client's `HTTP/1.1` while the server answers `HTTP/1.0` [src 117, 109]. Then
`curl -I http://localhost:8000/index.html` and walk the real response [src 113] — and be exact:
`Content-type: text/html` with **no** charset for a real file [src 114]. Then close the `file://` loop
from Topic 15: run the same page both ways and show that `file://` produces no status line and no
headers at all, because nothing answered — there was no server to answer. Explain why `index.html`
specifically [src 112] and why the server serves the directory it was started in [src 110, 111].

**Then the wall.** Tell the learner to pick up their phone, connect to the same Wi-Fi, and type
`http://localhost:8000`. It fails. Write the callout — name the surprise before they blame themselves,
validate that they did everything correctly, give the one-line mental model, and point at Unit 6
without fixing it here:

> **Wait — the laptop loads it. Why doesn't the phone?**
> You did everything right. The server is running, it is bound to every interface, and your laptop
> loads the page perfectly. But `localhost` does not mean "the computer running the server" — it means
> **"the computer that is asking."** Your phone typed `localhost`, so your phone asked *itself*, found
> nothing listening, and gave up. It never sent a single packet to your laptop. Unit 6 gives your
> laptop an address your phone can actually reach.

Do NOT fix it. Do NOT mention `0.0.0.0`, the LAN IP, or firewalls beyond what the callout says. Do NOT
cover errors like `Address already in use` or port 80 — Topic 20 owns those. This is the largest single
evidence cluster in the research [src 154, 155, 156, 157]; the wall is real and it must be left standing.

## Grounded facts

- Real startup banner (stdout): `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` [src 108]
- Default port 8000; "The server listens to port 8000 by default." [src 106]
- Default bind is all interfaces: "By default, the server binds itself to all interfaces." Verified `ss -ltn` → `LISTEN 0 5 0.0.0.0:8000` [src 107]
- Serves the current working directory [src 110]; "The request is mapped to a local file by interpreting the request as a path relative to the current working directory." [src 111]
- Why `index.html`: "the directory is checked for an index page as specified by `index_pages`. If found, the file's contents are returned; otherwise a directory listing is generated" — defaults to `("index.html", "index.htm")` [src 112]
- **Real access-log line**: `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -` [src 115]
- Log → stderr, banner → stdout; timestamp is local time with no timezone; size field is always `-` [src 116]
- The log echoes the client's HTTP/1.1 while the response is HTTP/1.0 [src 117]
- Server speaks HTTP/1.0 by default: `protocol_version = "HTTP/1.0"` [src 109]
- **Real full `curl -I` response**: `HTTP/1.0 200 OK` / `Server: SimpleHTTP/0.6 Python/3.14.6` / `Date: Wed, 29 Jul 2026 04:26:16 GMT` / `Content-type: text/html` / `Content-Length: 31` / `Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT` [src 113]
- **A real `.html` file gets `Content-type: text/html` with NO charset**; only the generated directory listing gets `; charset=utf-8` [src 114]
- Production warning: "http.server is not recommended for production. It only implements basic security checks." [src 122]; the concrete reason is symlink following [src 123]
- macOS learners need `xcode-select --install` first — macOS ships no Python [src 127, 128, 129]
- `python3`, not `python`; Python 2's `SimpleHTTPServer` is gone [src 125]
- The wall is real and heavily evidenced: 903,096 + 379,882 + 364,943 + 71,123 views [src 154, 155, 156, 157]
- Teach from: Python `http.server` docs, Command-line interface section [src 106, 107, 110]; the real captures [src 108, 113, 115]

## Requested activities

- READ: 1200–1400 words. Start the server → the win on localhost → the access log field by field → `curl -I` with the real response → the `file://` comparison showing no status code → why `index.html` → **then the phone wall and the callout, written as specified above**. Must end on the unresolved wall. Must not introduce `0.0.0.0` as a solution or mention LAN IPs.
- FLASHCARDS: 10 cards. `python3 -m http.server 8000`; the default port; what directory it serves; why `index.html` is special; the access-log fields; stderr vs stdout for log and banner; `HTTP/1.0` in the response; `Content-type: text/html`; what `file://` has no status code for; `Ctrl-C` to stop.
- QUIZ: 5 questions on predicting what the server serves given a stated starting directory, reading a supplied access-log line, explaining why a `file://` load shows no headers, and identifying what `localhost` resolves to on a second device. Use distractors [src 154] and [src 155] — that `localhost` names one shared machine, and that `0.0.0.0` and `127.0.0.1` are interchangeable.

## Handoff

**Inherits:** The learner can read status codes and headers in curl and DevTools. `index.html` exists and is generated by commands.
**Leaves:** `~/projects/first-site/index.html` is served at `http://localhost:8000` and returns a real `200 OK` with headers — **but the learner's phone cannot load it, and does not yet know why.** This is the cliffhanger Unit 6 lands on.
**Do not cover:** `0.0.0.0` vs `127.0.0.1` as binding (Topic 19). LAN IPs (Topic 19). Firewalls, `Address already in use`, port 80 (Topic 20). WSL networking (Topic 21).
