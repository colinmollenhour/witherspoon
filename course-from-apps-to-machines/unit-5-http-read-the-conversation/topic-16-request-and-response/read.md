# Request and response

Your page still lives at `~/projects/first-site/index.html`, and you still open it by double-clicking:
the browser reads the file off your own disk and paints it. Nobody asked for anything, and nobody
answered. Two topics from now you will type `http://localhost:8000` instead, and something running on
your machine will answer you — with a message. Before you can debug a conversation, you have to be
able to read one.

## HTTP is a conversation, in text you can read

MDN defines it plainly: "HTTP is a protocol for fetching resources such as HTML documents. It is the
foundation of any data exchange on the Web and it is a client-server protocol, which means requests
are initiated by the recipient, usually the Web browser." The **client** is the side that asks — your
browser, or the `curl` command you are about to run. The **server** is the side that answers.

Three properties of that protocol matter right now.

It is made of discrete messages. "Clients and servers communicate by exchanging individual messages
(as opposed to a stream of data). The messages sent by the client are called **requests** and the
messages sent by the server as an answer are called **responses**." A request is a thing you can print
out, not a pipe you tap.

It is readable. "HTTP is generally designed to be human-readable... HTTP messages can be read and
understood by humans, providing easier testing for developers, and reduced complexity for newcomers."
That is your licence for this whole unit. You spent Unit 2 getting fluent at reading text in a
terminal. HTTP *is* text. There is nothing else under it to decode.

And it forgets. "HTTP is stateless: there is no link between two requests being successively carried
out on the same connection." Each message stands alone.

## Every HTTP message has the same four parts

Requests and responses look different at the top, but they are built the same way. MDN's anatomy:

1. A **start-line**
2. An optional set of **HTTP headers**
3. An **empty line** indicating the metadata of the message is complete
4. An optional **body** containing data associated with the message

Part 3 is a part, not formatting. The empty line is how the reader knows the description of the
message has ended and the content, if any, begins.

That split has a name: "The start-line and headers of the HTTP message are collectively known as the
**head** of the requests, and the part afterwards that contains its content is known as the **body**."
Head describes; body carries. Hold on to that pair — the last command in this topic depends on it.

## Reading a request

Here is a complete, real HTTP request. It is three lines long:

```http
GET / HTTP/1.1
Host: developer.mozilla.org
Accept-Language: fr
```

Line 1 is the start-line. In a request it is called the **request line**, and its grammar is exactly
three space-separated slots:

```
<method> <request-target> <protocol>
```

| Slot | Value here | What it says |
| --- | --- | --- |
| method | `GET` | What to do. `GET` fetches the resource. |
| request-target | `/` | Which resource. This is the *path* part of the URL you took apart in Topic 15. |
| protocol | `HTTP/1.1` | Which version of this grammar both sides agree to speak. |

Lines 2 and 3 are headers. A header is a `Name: value` pair, one per line. `Accept-Language: fr` is a
preference: this client would like French if French exists.

Then comes the empty line — invisible here, but present — and after it nothing, because a `GET`
request has no body. It is asking, not sending.

## `Host:` — why one server can hold a thousand sites

Look at line 2 again. Of all the headers you will ever meet, that one is compulsory. RFC 9112: "A
client MUST send a Host header field... in all HTTP/1.1 request messages." And leaving it out is not
a warning: "A server MUST respond with a 400 (Bad Request) status code to any HTTP/1.1 request message
that lacks a Host header field."

Why is one header treated as non-negotiable? RFC 9110 answers it: the `Host` header "provides the host
and port information from the target URI, enabling the origin server to distinguish among resources
while servicing requests for multiple host names."

Read that against Unit 4. A connection is made to an **address and a port** — a number, and 80 or 443.
By the time your bytes arrive at the far end, the *name* you typed has already done its job and gone.
And one machine at one address can be the home of many different websites. A bare `GET /` would be
unanswerable: which site's `/`?

`Host:` is the line that says which one. It is the reason the same server, on the same IP address, can
hold a thousand websites apart and never mix them up. When you serve `first-site` and point your
browser at `http://localhost:8000`, the request your browser writes will carry `Host: localhost:8000`
— the host and the port, straight out of the URL, exactly as the RFC describes.

## Reading a response

The answer comes back in the same four parts. Only the start-line differs: in a response it is called
the **status line**, and it also has three slots.

```
<protocol> <status-code> <reason-phrase>
```

A real one, captured from a live site:

```http
HTTP/2 200
```

Protocol `HTTP/2`. Status code `200`. No reason phrase — MDN notes that the text after the code is
"a brief, purely informational, text description of the status," and here it simply is not sent. For
now, all you need is the *position*: the number is the middle slot of the first line. What the number
means is the next topic's whole job.

## Hearing both halves: `curl -v`

Run this:

```
curl -v https://example.com
```

`-v` is verbose: curl shows you the conversation instead of only the result. Every line is marked:

- A line beginning with **`>`** is a line curl **sent** — it is part of the request.
- A line beginning with **`<`** is a line curl **received** — it is part of the response.
- A line with neither marker is curl talking about itself, narrating the connection. It is not part of
  either HTTP message.

Read it as a drill, in this order. Find the first `>` line: that is the request line, and you can name
its three slots. Find the `>` line just below it starting `Host:` — that is the compulsory header,
carrying the name you typed. Then find the first `<` line: that is the status line, with the code in
the middle. The `<` lines after it are the response headers, and after those, the body — the HTML.

Four parts, twice, in the order the anatomy promised.

## Headers without a body: `curl -I`

Sometimes you want the head and not the body. `curl -I` sends a **`HEAD`** request instead of a `GET`:
same question, but asking only for the description of the resource, not its contents. Real output:

```http
HTTP/2 200
content-type: text/html
server: cloudflare
```

A status line, then headers, and no body at all — no HTML, however large that page is. That is what
you want when the question is *about* the resource rather than what is in it: is anything there, what
does the server say it is, who is serving it. It is also what you want when the body would be a video
and you have no interest in downloading it. What each of those headers means is next topic.

## Where this leaves you

You can write a raw `GET / HTTP/1.1` request with a `Host:` header and name every part of it, and you
can run `curl -v` against any site on the internet and say which lines are your question and which are
the answer. What you cannot yet do is *interpret* the answer: `200` sits in the middle of that status
line and you have taken it on faith. Next: what that number is claiming, and what the headers
underneath it say about the body they introduce.
