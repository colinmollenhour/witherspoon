# Status codes and headers

**Unit:** 5 — HTTP: reading the conversation, and joining it
**Objectives (unit-numbered):**
7. Match 200, 301, 304, 404, and 500 to what each tells you about who has the problem — the client or the server.   [obj 7]
8. Read `Content-Type` and `Content-Length` from a response and predict how the browser will treat the body.   [obj 8]
9. Open the browser's DevTools Network tab, reload the page, and read the status, type, and size columns for a request.   [obj 9]

## Topic generation prompt

Status codes are the vocabulary; headers are the metadata. Teach the five classes first [src 84] so
the first digit does the work, then the five specific codes with RFC 9110's own definitions [src 85–89].
The idea worth spending time on is *whose problem is it*: 4xx says the client's request was wrong and
the server answered anyway; 5xx says the server broke. Attack the misconception head-on — many
learners read 404 as "the site is down" [src 171] when in fact receiving a 404 proves the server is
alive and talking to you. Use MDN's beginner framing of 404 [src 90] alongside the RFC definition.
Cover 301 and 304 more briefly: 301 as "it moved permanently" [src 86] and 304 as "you already have
it, use your copy" [src 87], which is why a reloaded page can be fast and show almost no bytes
transferred. Then headers: `Content-Type` [src 94] and `Content-Length` [src 95], and the point that
closes the loop with Unit 1 — this is where a file's extension stops being a hint and becomes a
declaration, because the server *tells* the browser what it is sending rather than leaving it to guess
[src 114]. Finish by moving from `curl` to DevTools: the same information in a different instrument.
Have the learner open the Network tab, reload, and read the status, type, and size columns, then find a
304 on a second reload. Keep the DevTools section instrument-agnostic enough to survive UI changes —
name the columns, not the pixel positions.

Do NOT run a local server (Topic 18). Do NOT cover the `file://` comparison in DevTools — Topic 18
owns that moment, because it needs a working `http://` alongside it.

## Grounded facts

- Five classes: Informational (`100`–`199`), Successful (`200`–`299`), Redirection (`300`–`399`), Client error (`400`–`499`), Server error (`500`–`599`) [src 84]
- 200: "The 200 (OK) status code indicates that the request has succeeded.  The content sent in a 200 response depends on the request method." [src 85]
- 301: "The 301 (Moved Permanently) status code indicates that the target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs." [src 86]
- 304: "The 304 (Not Modified) status code indicates that a conditional GET or HEAD request has been received and would have resulted in a 200 (OK) response if it were not for the fact that the condition evaluated to false." [src 87]
- 404: "The 404 (Not Found) status code indicates that the origin server did not find a current representation for the target resource or is not willing to disclose that one exists." [src 88]
- 500: "The 500 (Internal Server Error) status code indicates that the server encountered an unexpected condition that prevented it from fulfilling the request." [src 89]
- MDN on 404: "The server cannot find the requested resource. In the browser, this means the URL is not recognized... This response code is probably the most well known due to its frequent occurrence on the web." [src 90]
- `Content-Type` "indicates the media type of the associated representation" [src 94]
- `Content-Length` "indicates the associated representation's data length as a decimal non-negative integer number of octets." [src 95]
- The reason phrase is decorative: "purely informational, text description of the status to help a human understand the outcome" [src 82]
- Misconception to attack: "A **404** means the client made a mistake... **The server is working fine** — it just doesn't have what you're looking for." vs "A **500** means the server broke" [src 171]
- A served `.html` file gets `Content-type: text/html` [src 114] — the extension becoming a declaration
- RFC 9110 supersedes RFC 2616 and the 723x series [src 96, 97] — one sentence, for learners who find old material
- Teach from: RFC 9110 §15 definitions [src 85–89]; MDN's status reference [src 84, 90]

## Requested activities

- READ: 1000–1200 words. Five classes → the five codes with RFC definitions → whose-problem-is-it, attacking [src 171] → `Content-Type` and `Content-Length`, closing the Unit 1 extension loop → DevTools Network tab with named columns → finding a 304 on reload. Ends with the learner able to read a response in either instrument.
- FLASHCARDS: 11 cards. The five classes; 200; 301; 304; 404; 500; `Content-Type`; `Content-Length`; 4xx vs 5xx as a discriminating pair; the reason phrase; what a 304 means for bytes transferred.
- QUIZ: 5 questions on assigning blame from a supplied status code, predicting browser behaviour from a `Content-Type`, explaining what a 304 saved, and identifying which code a described situation produces. Use distractor [src 171] — that a 404 means the server is down.

## Handoff

**Inherits:** The learner can read raw requests and responses and run `curl -v` and `curl -I`.
**Leaves:** The learner can read any response's status and headers in either `curl` or DevTools, and knows who to blame for a 4xx versus a 5xx.
**Do not cover:** Running a server (Topic 18). The `file://`-has-no-status-code comparison (Topic 18).
