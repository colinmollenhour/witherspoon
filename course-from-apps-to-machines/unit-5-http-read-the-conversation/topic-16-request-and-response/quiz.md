# Quiz — Request and response

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

A client sends this request:

```http
GET / HTTP/1.1
Host: developer.mozilla.org
Accept-Language: fr
```

Which part of that message is the **request-target**?

- `GET`
- `/`
- `HTTP/1.1`
- `developer.mozilla.org`

**Correct option index:** 1

**Explanation:**

The request line has the grammar `<method> <request-target> <protocol>`, so reading
`GET / HTTP/1.1` left to right gives method `GET`, request-target `/`, protocol `HTTP/1.1`. `/` is the
answer — it names which resource on the server is wanted, and it is the path part of the URL.
`GET` is the method, the verb, not the target. `HTTP/1.1` is the protocol version both sides agree to
speak. `developer.mozilla.org` is the tempting one, because in a URL the domain comes before the path
— but here it is not on the request line at all; it is the value of a header on the next line
(objective 4).

## Question 2

**Type:** MULTIPLE_CHOICE

You run `curl -v https://example.com` and want to confirm that the request you just sent carried a
`Host:` header. Which line in the output answers that?

- A line beginning `<` that reads `Host: example.com`
- A line beginning `>` that reads `Host: example.com`
- The first line beginning `<`, which is the status line
- A line beginning with neither `>` nor `<`, describing the connection

**Correct option index:** 1

**Explanation:**

In `curl -v` output, `>` marks lines curl **sent** and `<` marks lines curl
**received**. `Host:` is a request header, so it must appear on a `>` line. A `<` `Host:` line would
mean the server sent it back to you, which is not what you are checking. The first `<` line is the
status line — that is the server's answer, and it tells you nothing about what you sent. Lines with no
marker are curl narrating the connection setup; they are not part of either HTTP message
(objectives 4, 5).

## Question 3

**Type:** SHORT_ANSWER

An HTTP/1.1 request arrives at a server with a valid request line but no `Host` header. What must the
server do, and what problem does the `Host` requirement exist to solve?

server MUST respond with 400 to any HTTP/1.1 request message that lacks a `Host` header field, and a
client MUST send one in all HTTP/1.1 request messages. The rule exists because one server at one IP
address can host many different websites. The connection only carries an address and a port, so
without `Host` there is no way to tell which of those sites the bare `/` refers to. `Host` supplies
"the host and port information from the target URI," letting the origin server distinguish among
resources while servicing requests for multiple host names.

**A strong answer covers:** (1) the server responds 400 / Bad Request — not that it guesses or ignores the
problem; (2) that `Host` is mandatory on every HTTP/1.1 request, not optional; (3) the reason — one
server/one address can serve multiple host names, and `Host` is what tells them apart.

**Sample answer:**

The server must respond with a `400` (Bad Request) status code — RFC 9112 says a
server MUST respond with 400 to any HTTP/1.1 request message that lacks a `Host` header field, and a
client MUST send one in all HTTP/1.1 request messages. The rule exists because one server at one IP
address can host many different websites. The connection only carries an address and a port, so
without `Host` there is no way to tell which of those sites the bare `/` refers to. `Host` supplies
"the host and port information from the target URI," letting the origin server distinguish among
resources while servicing requests for multiple host names.

**A full-credit answer shows:**

(1) the server responds 400 / Bad Request — not that it guesses or ignores the
problem; (2) that `Host` is mandatory on every HTTP/1.1 request, not optional; (3) the reason — one
server/one address can serve multiple host names, and `Host` is what tells them apart.

**Explanation:**

The common wrong answer is that the server falls back to a default site or returns
the page anyway, because in a browser you never see this failure — browsers always send `Host`. The
requirement is absolute in both directions: the client MUST send it, and the server MUST answer 400
without it (objective 4).

## Question 4

**Type:** MULTIPLE_CHOICE

A video file is published at a URL. You want to know whether it is still there and what the server
says about it, and you specifically do not want to download the file. What do you run?

- `curl https://example.com/clip.mp4`
- `curl -v https://example.com/clip.mp4`
- `curl -I https://example.com/clip.mp4`
- Open the URL in a browser tab

**Correct option index:** 2

**Explanation:**

`curl -I` sends a `HEAD` request, and the response comes back as head only — status
line and headers, no body — which is exactly "tell me about it, don't send it." Plain `curl` sends a
`GET`, and a `GET` response carries the resource in its body, so the whole video comes down. `curl -v`
adds the `>` and `<` conversation markers but it is still a `GET`; you see more, and you still download
everything. Opening the URL in a browser is the worst of the four: it fetches the body and hides the
headers you actually wanted (objective 6).

## Question 5

**Type:** TRUE_FALSE

A `GET` request has no body, so the empty line after the last header can be left out.

**Correct answer:** false

**Explanation:**

The opposite is true — the empty line is what makes the message complete. MDN's
anatomy lists four parts: a start-line, an optional set of headers, "an empty line indicating the
metadata of the message is complete," and an optional body. The *body* is the optional part, not the
empty line. Without it the reader has no way to know the headers have ended, because another
`Name: value` line could always be next. The head of the message is the start-line plus the headers;
the empty line is the boundary that closes it (objective 4).
