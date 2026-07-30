# Quiz — Status codes and headers

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You type a URL, and `curl -I` comes back with `404 Not Found`. What have you just learned about the
machine at the other end?

- The server is down, and nothing you type will work until it comes back up
- The server is running and answered you — it just has nothing at the path you asked for
- Your connection dropped somewhere between sending the request and getting a reply
- The server broke part-way through building the page, which is why nothing came back

**Correct option index:** 1

**Explanation:**

A `404` is a `4xx`, and a `4xx` says the *client's* request was wrong: "The 404 (Not
Found) status code indicates that the origin server did not find a current representation for the
target resource." For that reply to reach you, the server had to be running, accept your connection,
read your request, look, and compose an answer — so receiving a 404 proves the server is alive. The
first option is the most common misreading on the web, and the correction is blunt: "**The server is
working fine** — it just doesn't have what you're looking for." The third option describes something
that produces no status code at all, because a dropped connection means no response arrives. The
fourth option describes a `500`: "the server encountered an unexpected condition that prevented it
from fulfilling the request" — that is the `5xx` case, where the server, not you, is at fault
(objective 7).

---

## Question 2

**Type:** MULTIPLE_CHOICE

A server answers a request for `index.html` with this head:

```
HTTP/1.0 200 OK
Content-type: text/html
Content-Length: 31
```

What does the browser do with the body?

- Reads exactly 31 bytes and renders them as a web page, because the server declared them HTML
- Downloads them as a file to save, because the URL ended in `.html`
- Keeps the connection open waiting for more, because `Content-Length` is only an estimate
- Guesses from the `.html` on the end of the URL, since headers describe the transfer, not the content

**Correct option index:** 0

**Explanation:**

`Content-Type` "indicates the media type of the associated representation" — the
server is *declaring* that the body is HTML, so the browser renders it. `Content-Length` "indicates
the associated representation's data length as a decimal non-negative integer number of octets", so
31 is exact, not an estimate — which rules out the third option, since the browser knows precisely
where the message ends. The second and fourth options both fall back on the file extension, and that
is the habit this topic breaks: in Unit 1 the `.html` was only a hint to your desktop, but over HTTP
the server reads that extension once and turns it into a header. From the browser's side the
declaration is what counts, and the URL's spelling does not (objective 8).

---

## Question 3

**Type:** SHORT_ANSWER

You load a page with the Network panel open and note the Status and Size columns for one row. You
reload, and that row now reads `304` with a much smaller Size. Explain what your browser asked for,
what the server replied, and what was saved.

changed since the copy I already have." The server checked, found it unchanged, and replied `304 Not
Modified`: the request "would have resulted in a 200 (OK) response if it were not for the fact that
the condition evaluated to false." Because a 304 carries no body, only the head crossed the network,
which is why the Size column collapsed — and the browser drew the page from the copy it already had,
so it appeared instantly.

**Sample answer:**

On the reload my browser sent a conditional request — "send this only if it has
changed since the copy I already have." The server checked, found it unchanged, and replied `304 Not
Modified`: the request "would have resulted in a 200 (OK) response if it were not for the fact that
the condition evaluated to false." Because a 304 carries no body, only the head crossed the network,
which is why the Size column collapsed — and the browser drew the page from the copy it already had,
so it appeared instantly.

**Explanation:**

A strong answer covers three things: that the second request was *conditional*, that the
server answered `304` because nothing had changed, and that the saving came from the body not being
sent — the head still travelled, which is why Size drops to almost nothing rather than to zero. The
common wrong answer is that the browser skipped the request entirely; it did not, or there would be
no row and no status code to read. `304` sits in the Redirection class (`300`–`399`), which is why it
is not an error even though it is not a `200` (objectives 7, 9).

---

## Question 4

**Type:** MULTIPLE_CHOICE

A site reorganises. The address you have bookmarked should never be used again, and every future
request ought to go to a new one instead. You request the old address and your browser ends up
showing the new one without asking you. Which status code did the old address return?

- `200`
- `301`
- `304`
- `404`

**Correct option index:** 1

**Explanation:**

`301` is the only code that matches the description: the target resource "has been
assigned a new permanent URI and any future references to this resource ought to use one of the
enclosed URIs" — and the new address rides along in the response, which is what lets the browser go
there on its own. `200` means "the request has succeeded" and nothing moved. `304` means nothing
changed and you should use the copy you already have — no new address is involved. `404` would mean
the server "did not find a current representation for the target resource", which is what you get
when a site moves things *without* leaving a 301 behind. Notice that `301` and `304` share a first
digit: both are Redirection (`300`–`399`), and neither is an error (objective 7).

---

## Question 5

**Type:** TRUE_FALSE

A response whose status line reads `HTTP/1.0 200 Not Found` would be treated as an error by your
browser, because the words after the number are what software acts on.

**Correct answer:** false

**Explanation:**

The opposite is true — the words are the part that gets ignored. The reason phrase
is "a brief, purely informational, text description of the status to help a human understand the
outcome of a request." Software reads the number, so a `200` is a success no matter what text follows
it, and the browser would render the body normally. This is why the first digit is the thing worth
memorising: it carries the whole who-has-the-problem verdict, while the phrase next to it is a
courtesy to you (objective 7).
