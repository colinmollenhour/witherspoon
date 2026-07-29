# Request and response

**Unit:** 5 — HTTP: reading the conversation, and joining it
**Objectives (unit-numbered):**
4. Write out a raw `GET / HTTP/1.1` request with a `Host:` header and label its three request-line parts.   [obj 4]
5. Run `curl -v https://example.com` and identify which lines are the request (`>`) and which are the response (`<`).   [obj 5]
6. Use `curl -I` to send a `HEAD` request and explain when you want headers without a body.   [obj 6]

## Topic generation prompt

HTTP is a conversation in plain text, and the learner can now read plain text fluently. Lead with
MDN's licence to teach it that way: HTTP "can be read and understood by humans" [src 76]. Teach the
message shape first — MDN's four-part anatomy [src 79], then the request-line grammar
`<method> <request-target> <protocol>` [src 80] and the status-line grammar
`<protocol> <status-code> <reason-phrase>` [src 81]. Use MDN's three-line request [src 78] as the
worked example because it is short enough to read aloud. Then the `Host` header, and why it exists:
RFC 9112 requires it on every HTTP/1.1 request [src 91], a server must answer 400 without it [src 92],
and RFC 9110 explains that it is what lets one server hold many sites apart [src 93]. That last point
is the interesting one — it is why the same IP can serve a thousand different websites. Then hand them
the instrument: `curl -v`, with the `>` and `<` line markers as the way to see both halves of the
conversation at once. Then `curl -I` for a `HEAD` request — headers without a body — and why that is
useful when you only want to know *about* a resource. Note that requests and responses are discrete
messages rather than a stream [src 75], and that HTTP is stateless [src 77], stated once each.

Do NOT interpret status codes beyond noting where the number sits in the status line — Topic 17 owns
their meaning. Do NOT run a local server (Topic 18).

## Grounded facts

- "HTTP is a protocol for fetching resources such as HTML documents. It is the foundation of any data exchange on the Web and it is a client-server protocol, which means requests are initiated by the recipient, usually the Web browser." [src 74]
- "Clients and servers communicate by exchanging individual messages (as opposed to a stream of data). The messages sent by the client are called requests and the messages sent by the server as an answer are called responses." [src 75]
- "HTTP is generally designed to be human-readable... HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers." [src 76]
- "HTTP is stateless: there is no link between two requests being successively carried out on the same connection." [src 77]
- Minimal real request: `GET / HTTP/1.1` / `Host: developer.mozilla.org` / `Accept-Language: fr` [src 78]
- Four-part anatomy: "1. A _start-line_... 2. An optional set of _HTTP headers_... 3. An empty line indicating the metadata of the message is complete. 4. An optional _body_" [src 79]
- Request-line grammar: `<method> <request-target> <protocol>` [src 80]
- Status-line grammar: `<protocol> <status-code> <reason-phrase>` [src 81]
- Head vs body: "The start-line and headers of the HTTP message are collectively known as the _head_ of the requests, and the part afterwards that contains its content is known as the _body_." [src 83]
- Host is mandatory: "A client MUST send a Host header field... in all HTTP/1.1 request messages." [src 91]
- Missing Host → 400: "A server MUST respond with a 400 (Bad Request) status code to any HTTP/1.1 request message that lacks a Host header field" [src 92]
- What Host is for: "enabling the origin server to distinguish among resources while servicing requests for multiple host names" [src 93]
- Real `curl -I` response headers from a live site: `HTTP/2 200` / `content-type: text/html` / `server: cloudflare` [src 131 context]
- Teach from: MDN "HTTP messages", the anatomy list and both grammars [src 79–81]

## Requested activities

- READ: 1000–1200 words. Message anatomy → request line → status line → the `Host` header and virtual hosting → `curl -v` with `>` and `<` → `curl -I` and HEAD. Use MDN's three-line request [src 78] as the spine of the explanation. Ends with the learner able to read a raw request and response.
- FLASHCARDS: 10 cards. The four parts of an HTTP message; request-line grammar; status-line grammar; `GET`; `HEAD`; the `Host` header; why `Host` is required; `curl -v`; `>` and `<` markers; head vs body as a discriminating pair.
- QUIZ: 5 questions on labelling the parts of a supplied raw request, identifying request vs response lines in `curl -v` output, choosing `curl -I` for a stated goal, and explaining what a server does with a request missing `Host`.

## Handoff

**Inherits:** The learner can read a URL as six labelled parts and knows what `file://` lacks.
**Leaves:** The learner can read a raw HTTP request and response, and can run `curl -v` and `curl -I` against any site.
**Do not cover:** What individual status codes mean (Topic 17). `Content-Type` and `Content-Length` semantics (Topic 17). Running a server (Topic 18).
