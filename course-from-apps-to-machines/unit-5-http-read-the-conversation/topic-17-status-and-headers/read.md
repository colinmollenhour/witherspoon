# Status codes and headers

You can run `curl -v` against any site and split the conversation into the lines you sent and the
lines that came back. In every response there is one number you have been reading past: the middle
of the status line, `<protocol> <status-code> <reason-phrase>` [src 81]. That number is the server's
one-word verdict on your request.

## The first digit does the work

There are hundreds of status codes and you will never memorise them. You do not have to: the first
digit sorts every code into one of five classes [src 84].

| Class | Range | What it tells you |
| --- | --- | --- |
| Informational | `100`–`199` | Hold on — this is not the final answer yet |
| Successful | `200`–`299` | You asked, and you got it |
| Redirection | `300`–`399` | Look somewhere else, or use the copy you already have |
| Client error | `400`–`499` | Your request was wrong |
| Server error | `500`–`599` | The server broke |

The first digit tells you *who has the problem*; the other two tell you *what* it is. So a code you
have never seen before is still half-readable on sight.

The words next to the number — `OK`, `Not Found` — are the **reason phrase**: "a brief, purely
informational, text description of the status to help a human understand the outcome of a request"
[src 82]. Nothing acts on them. Software reads the number.

## Five codes, in the words of the specification

HTTP's semantics live in RFC 9110, which you can read yourself. The five you will actually meet,
quoted from it:

**`200 OK`** — "The 200 (OK) status code indicates that the request has succeeded. The content sent
in a 200 response depends on the request method." [src 85] The one you are working toward producing
from your own machine.

**`301 Moved Permanently`** — "The 301 (Moved Permanently) status code indicates that the target
resource has been assigned a new permanent URI and any future references to this resource ought to
use one of the enclosed URIs." [src 86] It moved, for good, and the response carries the new address
— which is why your browser can land somewhere other than what you typed.

**`304 Not Modified`** — "The 304 (Not Modified) status code indicates that a conditional GET or HEAD
request has been received and would have resulted in a 200 (OK) response if it were not for the fact
that the condition evaluated to false." [src 87] Unpacked: your browser asked "send this *only if* it
changed since the copy I have", and the server answered "it did not — use yours." A 304 has no body.

**`404 Not Found`** — "The 404 (Not Found) status code indicates that the origin server did not find a
current representation for the target resource or is not willing to disclose that one exists."
[src 88] MDN, plainer: "The server cannot find the requested resource. In the browser, this means the
URL is not recognized... This response code is probably the most well known due to its frequent
occurrence on the web." [src 90]

**`500 Internal Server Error`** — "The 500 (Internal Server Error) status code indicates that the
server encountered an unexpected condition that prevented it from fulfilling the request." [src 89]

One footnote for when you read elsewhere: RFC 9110 replaced RFC 2616 and the whole 7230–7235 series
[src 96, src 97], so anything citing "RFC 2616" has been superseded twice.

## Whose problem is it?

> **Wait — doesn't a 404 mean the site is down?**
>
> The most common misreading in all of HTTP. The correction, stated flatly: "A **404** means the
> client made a mistake (like requesting a page that doesn't exist)." — "**The server is working
> fine** — it just doesn't have what you're looking for." Contrast: "A **500** means the server
> broke" [src 171].
>
> Look at what had to happen for that 404 to reach your screen. The server was running. It accepted
> your connection, read your request line, understood the path you asked for, looked, found nothing,
> composed a reply, and sent it back. **A 404 is proof that the server is alive and talking to you.**
> A dead server does not answer 404 — a dead server does not answer at all.

That distinction decides who you go and fix.

| | `4xx` | `5xx` |
| --- | --- | --- |
| Whose fault | The client's request | The server |
| Did the server answer? | Yes | Yes |
| What you change | Your URL, your method, your headers | Something on the server |
| Typical fix | Retype the path | Read the server's own log |

## Headers: what the server says *about* the body

The status line says what happened; the headers say what is arriving. Two carry most of the weight.

`Content-Type` "indicates the media type of the associated representation" [src 94] — what kind of
thing the body is. `Content-Length` "indicates the associated representation's data length as a
decimal non-negative integer number of octets" [src 95] — how many bytes are coming. An octet is a
byte.

A real response head for a served file called `index.html` [src 113]:

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Date: Wed, 29 Jul 2026 04:26:16 GMT
Content-type: text/html
Content-Length: 31
Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT
```

`Content-Length: 31` says thirty-one bytes of body follow, so the receiver knows exactly when the
message ends. `Content-type: text/html` says: treat those bytes as HTML.

**This closes the loop that opened in Unit 1.** There you learned that a file is bytes and the
`.html` on the end is only a *hint* your desktop takes seriously — nothing enforces it, and renaming
a file changes the label, not the contents. Over HTTP that changes. The server reads the extension
once, at its end, and turns it into `Content-type: text/html` [src 114] — a **declaration**
travelling next to the bytes. The browser is no longer guessing; it is told. The extension stopped
being a hint the moment it became a header.

## The same response, a different instrument

All of this is visible in `curl -I`, and also in the browser you already have. Open your developer
tools, find the **Network** panel, and reload the page. You get one row per request, and among the
columns are:

| Column | What it holds | What you learned above |
| --- | --- | --- |
| Status | The status code | The first digit says whose problem it is |
| Type | The kind of thing that came back | Derived from `Content-Type` |
| Size | Bytes transferred | Compare it against `Content-Length` |

Panels get redesigned; those columns persist. Learn the column names, not their positions.

Now make 304 real. Reload a second time and read the Status column again. Some rows change from
`200` to `304`, and their Size collapses — the head arrived, the body did not, because the server
said "use your copy." That is why a second visit to a page feels instant.

## Where this leaves you

You can read any response's verdict in either instrument — `curl -I` or the Network panel — and say
who is responsible for it. `4xx` sends you back to your own request, `5xx` sends you to the server,
and either one proves the server answered.

One thing you have never done: been the server. Every response you have read was composed by someone
else's machine. Next you serve `~/projects/first-site/index.html` from your own, and produce a real
`200 OK` with your name on it.
