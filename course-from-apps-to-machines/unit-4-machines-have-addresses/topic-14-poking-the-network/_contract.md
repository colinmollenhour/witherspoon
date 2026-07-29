# Poking at the network

**Unit:** 4 — Machines have addresses
**Objectives (unit-numbered):**
10. Test reachability with `ping -c 3 <host>` and read the round-trip time and packet-loss summary, and explain why a failed `ping` does not prove the network is down.   [obj 10]
11. Fetch a URL from the terminal with `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` and read the status code it prints.   [obj 11]
12. Distinguish "nothing is listening on that port" from "the host is unreachable" by comparing an instant failure against a slow timeout.   [obj 12]

## Topic generation prompt

Give the learner the two instruments they will use to diagnose everything in Units 5 and 6. Teach
`ping` first, and teach it with its limitation attached rather than as a reliability test: in the
research environment `ping` failed even against `127.0.0.1` [src 135] because raw sockets were blocked,
while `curl` to the internet succeeded on the same machine at the same moment. That is not an exotic
edge case — it is the normal state inside containers, on locked-down corporate machines, and behind
firewalls that drop ICMP. So the rule to teach is: **a failed ping is not evidence the network is
down.** Then `curl`, first as a plain fetch and then in the status-code-only form [src 131], which is
the idiom they will reuse throughout Unit 6. Then the diagnostic that carries the most weight: the
difference between a refused connection and an unreachable host. Show both real captures [src 132, 134]
and teach the *timing* as the tell — refused comes back instantly (exit 7), unreachable hangs and then
times out (exit 28). Be precise about the wording, because this is a trap: curl 8.x prints "Could not
connect to server" at the top level, and the phrase "Connection refused" appears only under `-v` [src
132]. A course that told learners to look for "Connection refused" in ordinary output would be teaching
them to look for a string they will not see. Mention the underlying errno 111 [src 133] once, as the
name for the thing.

Do NOT teach HTTP semantics — status codes are read here as opaque numbers; Unit 5 owns what they
mean. Do NOT start a server (Unit 5).

## Grounded facts

- `ping` fails in restricted environments, real capture: `ping: socktype: SOCK_RAW` / `ping: socket: Operation not permitted` / `ping: => missing cap_net_raw+p capability or setuid?` — failing even for `127.0.0.1`, while `curl` to the internet succeeded on the same machine [src 135]
- curl status-code idiom: `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` → `200` [src 131]
- **curl 8.x closed-port wording**: `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server` (exit 7). "Connection refused" appears **only** under `-v`: `connect to 127.0.0.1 port 9999 from 127.0.0.1 port 48604 failed: Connection refused` [src 132]
- Underlying errno: `errno=111 [Errno 111] Connection refused` (ECONNREFUSED) [src 133]
- Unreachable is a timeout, not a refusal: `curl --max-time 4 http://192.0.2.1/` → `curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`, exit 28. `192.0.2.1` is RFC 5737 TEST-NET. [src 134]
- Real `curl -I https://example.com` headers, if a full response is shown: `HTTP/2 200` / `content-type: text/html` / `server: cloudflare` [src 131 context, src 21 of the A3c set]
- No real `ping` round-trip output was capturable [see SOURCES.md → Ungrounded] — teach the output's shape, do not fabricate a timing block
- Teach from: the real refused-vs-timeout captures [src 132, 134]

## Requested activities

- READ: 900–1100 words. `ping` with its limitation attached [src 135]. `curl` plain, then the status-code idiom [src 131]. Then refused vs unreachable using both real captures and the timing tell. Must state the curl 8.x wording correctly and must not fabricate ping timing output. Ends with the learner holding a diagnostic procedure they will reuse in Unit 6.
- FLASHCARDS: 9 cards. `ping`; `curl`; the `%{http_code}` idiom; exit 7; exit 28; refused vs timeout as a discriminating pair; what a failed ping does NOT prove; `-v` for the underlying reason; ICMP being commonly blocked.
- QUIZ: 5 questions on diagnosing whether a port is closed or a host is unreachable from a described symptom, explaining why a failed ping is inconclusive, choosing the command that prints only a status code, and identifying which curl output requires `-v`.

## Handoff

**Inherits:** The learner can list listening ports and knows what a port is.
**Leaves:** The learner can test any host and port from the terminal and tell a closed port from an unreachable host. Ready for Project 4, the network self-portrait.
**Do not cover:** What status codes mean (Unit 5, Topic 17). Starting a server (Unit 5, Topic 18).
