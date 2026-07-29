# Flashcards — Request and response

## Card 1

**Front:** The four parts of an HTTP message, in order.

**Back:** 1. A start-line. 2. An optional set of HTTP headers. 3. An empty line indicating the
metadata of the message is complete. 4. An optional body. Requests and responses are both built this
way.

## Card 2

**Front:** The grammar of a request line.

**Back:** `<method> <request-target> <protocol>` — three space-separated slots, as in
`GET / HTTP/1.1`.

## Card 3

**Front:** The grammar of a status line.

**Back:** `<protocol> <status-code> <reason-phrase>` — the code sits in the middle slot, as in
`HTTP/2 200`.

## Card 4

**Front:** `GET`

**Back:** The method in `GET / HTTP/1.1`. It asks the server to send the resource named by the
request-target; the resource comes back in the response body.

## Card 5

**Front:** `HEAD`

**Back:** The method that asks for the head of the response only — status line and headers, no body.
`curl -I` sends one.

## Card 6

**Front:** What does the `Host` header carry?

**Back:** "the host and port information from the target URI" — the domain and port lifted straight
out of the URL, e.g. `Host: developer.mozilla.org`.

## Card 7

**Front:** Why is `Host` required on every HTTP/1.1 request?

**Back:** Because one server at one IP address can hold many websites. `Host` is what enables "the
origin server to distinguish among resources while servicing requests for multiple host names." RFC
9112: a client MUST send it in all HTTP/1.1 request messages.

## Card 8

**Front:** `curl -v https://example.com`

**Back:** Runs the request with verbose output, so curl prints both halves of the conversation — what
it sent and what came back — instead of only the page.

## Card 9

**Front:** In `curl -v` output, what do `>` and `<` at the start of a line mean?

**Back:** `>` marks a line curl sent (part of the request). `<` marks a line curl received (part of
the response). A line with neither is curl narrating the connection, not HTTP.

## Card 10

**Front:** head vs body

**Back:** The head is the start-line plus the headers — the description of the message. The body is
everything after the empty line — the content itself. The body is optional; the head is not.
