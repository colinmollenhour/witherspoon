# Unit 5 test — Reading and producing an HTTP conversation

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Assesses:** Assesses whether you can take a URL apart into its six labelled slots and say which slot the server never receives; write a raw HTTP/1.1 request with its compulsory header; split `curl -v` output into the half you sent and the half you received; choose `curl -I` when you want headers without a body; assign blame from a status code; read `Content-Type`, `Content-Length`, and the DevTools Network columns; start `python3 -m http.server 8000` and read its access log; and show that the same page over `file://` has no status code and no headers while over `http://` it has both.

**Passing score:** 70%

## Question 1

**Type:** MULTIPLE_CHOICE

You are handed this URL:

```
http://192.168.1.42:8000/about/index.html?v=2#top
```

Which line names its port and its path correctly?

- Port `8000`, path `/about/index.html`
- Port `192.168.1.42`, path `8000/about/index.html`
- Port `8000`, path `/about/index.html?v=2`
- Port `443`, path `/about/index.html#top`

**Correct option index:** 0

**Explanation:**

The authority is "separated from the scheme by the character pattern `://`" and
"includes both the _domain_... and the _port_... separated by a colon" — so `192.168.1.42` is the
host and `8000` is the port. The path runs from the first `/` after the authority up to the first
`?`, which makes it `/about/index.html`. The second option swaps host and port: everything before
the colon is the machine, everything after it is the gate on that machine. The third option swallows
the query into the path — `?v=2` is a separate slot, and everything after the first `?` belongs to
it. The fourth option invents a port that is not written down: `443` is the default the browser
supplies for `https`, and this URL both is `http` and states its port explicitly, so nothing is
being defaulted at all. It also drags `#top` into the path, where it never belongs (objective 1).

## Question 2

**Type:** MULTIPLE_CHOICE

Your browser requests `http://192.168.1.42:8000/about/index.html?v=2#top`. Which parts of that URL
does the machine at `192.168.1.42` actually learn about?

- The path and the query, but not the fragment
- All six parts — the whole URL is sent across verbatim
- The path only; the query and the fragment are both handled by the browser
- The path, the query and the fragment; the scheme is the only part left behind

**Correct option index:** 0

**Explanation:**

MDN is blunt about this: "It is worth noting that the part after the **#**, also
known as the **fragment identifier**, is never sent to the server with the request," and again, "The
fragment is not sent to the server when the URI is requested; it is processed by the client (e.g.,
the browser) after the resource is retrieved." Your browser cuts the URL at the `#`, asks for
everything to the left, waits for the whole response, and only then jumps to the piece named `top`.
The second option is the everyday assumption — the fragment is visibly in your address bar, you can
copy it and bookmark it, so it feels like it travels — and it is exactly wrong. The third option
demotes the query along with it, but `?v=2` does cross: it rides with the path as part of what is
being asked for. The fourth option keeps the fragment and drops the scheme, which reverses the truth
twice over: the scheme decided *how* to make the request in the first place, and the fragment is the
one part that stays home. Two URLs differing only after the `#` are, to the far machine, the same
URL (objective 2).

## Question 3

**Type:** TRUE_FALSE

You message a friend this line so they can look at the page you made:

```
file:///home/you/projects/first-site/index.html
```

As long as your friend is on the same Wi-Fi as you, that link will open your page on their phone.

**Correct answer:** false

**Explanation:**

The opposite is true, and being on the same Wi-Fi has nothing to do with it. That
line is not an address *of your page* — it is an instruction to open
`/home/you/projects/first-site/index.html` **on the reader's own disk**, where no such file exists.
It is a documented, ordinary student failure: "If the address contains a drive letter (usually
C://), you've accidentally linked to a file on your computer, not on the server" — "**Such a link
will work only on your computer.**" Put the two URL forms side by side and three slots in the
`file://` one are empty: a host, a port, and a program listening. They are not omitted, there is no
room for them, because nothing is being asked of anyone. The `file` scheme means *read something off
a disk* — and the only disk in reach is the reader's (objective 3).

## Question 4

**Type:** SHORT_ANSWER

Write out, in full, the smallest valid HTTP/1.1 request that asks a server named
`developer.mozilla.org` for its home page. Then name the three slots of its first line, in order,
and say what happens if the second line is left out.

**Sample answer:**

```http
GET / HTTP/1.1
Host: developer.mozilla.org
```

The first line is the request line, and its grammar is `<method> <request-target> <protocol>`: the
method is `GET` (fetch the resource), the request-target is `/` (which resource — the path part of
the URL), and the protocol is `HTTP/1.1` (which version of this grammar both sides are speaking).
The second line is the `Host` header, and it is compulsory: "A client MUST send a Host header
field... in all HTTP/1.1 request messages." Leave it out and the answer is not a warning — "A server
MUST respond with a 400 (Bad Request) status code to any HTTP/1.1 request message that lacks a Host
header field." After the header comes an empty line, marking the end of the head; a `GET` has no
body, because it is asking, not sending.

**Explanation:**

A grader must see three things. First, a request line with the three slots in the
right order — `GET`, then the target, then the version — not `HTTP/1.1 GET /` and not `GET
developer.mozilla.org HTTP/1.1`, since the target is the path, and the host travels in a header.
Second, a `Host:` header naming the site. Third, `400` as the consequence of omitting it. Credit the
empty line if it is mentioned: it is one of the four parts of every HTTP message, not formatting.
The reason `Host` earns that status is worth stating — it "provides the host and port information
from the target URI, enabling the origin server to distinguish among resources while servicing
requests for multiple host names," which is how one machine at one address holds a thousand websites
apart (objective 4).

## Question 5

**Type:** MULTIPLE_CHOICE

You run `curl -v https://example.com` and these three lines appear in the output:

```
> GET / HTTP/1.1
> Host: example.com
< HTTP/2 200
```

Which reading is correct?

- curl sent the two `>` lines; the `<` line came back from example.com
- curl sent the `<` line; the two `>` lines are what came back
- All three lines came back from example.com — `curl -v` prints the response in more detail, not the request
- The `>` lines are curl narrating the connection to itself; only the `<` line is part of an HTTP message

**Correct option index:** 0

**Explanation:**

`-v` is verbose: curl shows you the conversation instead of only the result, and it
marks every line by direction. A line beginning `>` is a line curl **sent** — part of the request.
A line beginning `<` is a line curl **received** — part of the response. So the request line and the
compulsory `Host:` header went out, and `HTTP/2 200` came back as the status line. The second option
inverts the markers, which is the single most common way to misread this output; read the arrows as
pointing away from you and toward you. The third option imagines that a request is invisible, but
seeing both halves at once is the entire reason to use `-v`. The fourth option confuses the marked
lines with the unmarked ones: lines with neither `>` nor `<` are curl talking about itself, and
those are not part of either HTTP message — but `>` lines certainly are (objective 5).

## Question 6

**Type:** MULTIPLE_CHOICE

You want to find out whether a very large video file is still at a URL, and what the server says
that file is, without downloading it. Which command, and why?

- `curl -I <url>` — it sends a `HEAD` request, so the status line and the headers come back with no body at all
- `curl -v <url>` — verbose mode prints the headers *instead of* the body
- `curl <url>` — the body is only downloaded if you redirect the output to a file
- `curl -I <url>` — it downloads the whole file and then throws away everything but the first line

**Correct option index:** 0

**Explanation:**

`curl -I` sends a `HEAD` request: the same question as a `GET`, but asking only for
the description of the resource rather than its contents. You get a status line, then the response
headers, and then nothing — which is precisely what you want when the question is *about* the
resource. The second option misreads `-v`: verbose adds the request and curl's own narration to what
you already get, it does not suppress the body. The third option is wishful — without redirection
the body still crosses the network, it just lands on your screen. The fourth option keeps the right
command with the wrong mechanism, and the difference matters: with `HEAD` the bytes never leave the
server, so nothing is downloaded to discard. Head describes, body carries; `-I` asks for the head
(objective 6).

## Question 7

**Type:** MULTIPLE_CHOICE

Three different paths on the same website answer `200`, `404`, and `500`. What can you conclude?

- The server is running in all three cases; the `404` says your path was wrong, and the `500` says something broke inside the server
- The server is down for the `404` and running for the other two
- The `404` and the `500` both mean the server broke; only the `200` proves it is alive
- The `404` is the server's fault and the `500` is yours — those two digits run the opposite way to what people expect

**Correct option index:** 0

**Explanation:**

The first digit says whose problem it is. `4xx` is a client error — your request was
wrong — and `5xx` is a server error. RFC 9110: "The 404 (Not Found) status code indicates that the
origin server did not find a current representation for the target resource," against "The 500
(Internal Server Error) status code indicates that the server encountered an unexpected condition
that prevented it from fulfilling the request." The second option is the most common misreading in
all of HTTP, and it is backwards: look at what had to happen for that `404` to reach your screen —
the server accepted your connection, read your request line, understood the path, looked, found
nothing, composed a reply, and sent it. "**The server is working fine** — it just doesn't have what
you're looking for." A `404` is proof the server is alive and talking to you; a dead server does not
answer `404`, it does not answer at all. The third option makes the same error about `404` while
getting `500` right by accident. The fourth simply swaps the two classes (objective 7).

## Question 8

**Type:** MULTIPLE_CHOICE

*(synthesis)*

`curl -I http://localhost:8000/index.html` gives you this:

```
Content-type: text/html
Content-Length: 31
```

You then open your browser's DevTools, go to the Network panel, and reload the page twice. On the
second reload, the Status column for that row reads `304` and the Size column collapses. What
happened?

- The browser asked for the file *only if* it had changed; it had not, so the head came back with no body — the 31 bytes never crossed the second time
- The file shrank to zero bytes between the two reloads, which is what the Size column is reporting
- `Content-Length: 31` was wrong, and the browser corrected it on the second attempt
- A `304` means the request failed, so nothing was transferred and nothing was displayed

**Correct option index:** 0

**Explanation:**

`Content-Length` "indicates the associated representation's data length as a
decimal non-negative integer number of octets" — a promise that 31 bytes of body follow the empty
line, so the receiver knows exactly where the message ends. `Content-Type` is the other half of the
declaration: `text/html` tells the browser to treat those bytes as HTML rather than guess from the
name in the URL. On the second reload you got "The 304 (Not Modified) status code... a conditional
GET or HEAD request has been received and would have resulted in a 200 (OK) response if it were not
for the fact that the condition evaluated to false" — your browser asked "send it only if it changed
since the copy I already have," and the server said it had not. The head arrived; the body did not.
That is why the Size column collapses and why a second visit feels instant. The second option reads
the Size column as the file's size on disk rather than as bytes transferred — the file is untouched
at 31 bytes. The third invents a correction that no status code performs. The fourth puts `304` in
the wrong class entirely: `3xx` is Redirection, not failure, and the page is on your screen the whole
time — displayed from the copy you already had (objectives 8, 9).

## Question 9

**Type:** MULTIPLE_CHOICE

You run these two commands:

```
cd ~/projects/first-site
python3 -m http.server 8000
```

then visit `http://localhost:8000/nope` in your browser. The terminal prints:

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -
```

Which reading of that line is correct?

- Method `GET`, path `/nope`, status `404` — the server looked inside `~/projects/first-site` for `nope`, did not find it, and said so
- Method `GET`, path `/nope`, status `404` — the server crashed on the request and wrote the crash into its log
- The `HTTP/1.1` in that line is the server's own version, so this response went out as HTTP/1.1
- The trailing `-` is the size of the response, so the server sent zero bytes back

**Correct option index:** 0

**Explanation:**

The `cd` is what makes the first option true: "By default, the server uses the
current directory," and "The request is mapped to a local file by interpreting the request as a path
relative to the current working directory." So `/nope` was looked for inside `~/projects/first-site`,
was not there, and produced a `404` — a client error, written down and answered. The second option
mistakes a `404` for a crash; a crash is `5xx`, and this server neither crashed nor stopped, as the
next request will show. The third option misreads the quoted request line: that version is copied out
of what your *browser* sent and echoed back, while the response itself went out as HTTP/1.0, which
this server hard-codes as `protocol_version = "HTTP/1.0"`. Two versions in play, one line of output,
neither of them a mistake. The fourth option reads the trailing `-` as a byte count, but that field
is always `-` on this server — it is `-` on a `200` too, and the 404 page it just sent has a body
(objectives 10, 11).

## Question 10

**Type:** MULTIPLE_CHOICE

*(synthesis)*

Your server is running in `~/projects/first-site`. You open the same `index.html` two ways on your
laptop — by double-clicking it, so the address bar reads
`file:///home/you/projects/first-site/index.html`, and at `http://localhost:8000/index.html`. Then
you pick up your phone, confirm it is on the same Wi-Fi, and type `http://localhost:8000` into its
browser. It does not load. Which set of observations is correct?

- The `file://` load has no status line and no response headers; the `http://` load has `HTTP/1.0 200 OK` plus `Content-type` and `Content-Length`; and the phone's `localhost` named the phone itself, so nothing ever reached the laptop
- Both loads show `200 OK` and differ only in how many headers they carry, since `file://` sends a shorter set; and the phone failed because the laptop received the request and refused it
- The `file://` load shows `HTTP/1.0 200 OK` with no headers under it; the `http://` load shows the same status line with headers; and the phone failed because the request had to go through the router
- The `file://` load has no headers and the `http://` load does; and the phone failed because `localhost`, `127.0.0.1` and `0.0.0.0` all name the one machine everyone on a network shares, so the phone reached the laptop and was turned away

**Correct option index:** 0

**Explanation:**

There is no status code over `file://` because there is no *status*. A status code
is a server's verdict on a request, and nothing was asked: your browser opened the file off your disk
the way a text editor opens a file. No request, no verdict, no headers to describe a response that
never existed — the three slots the `file://` URL has no room for are a host, a port, and a program
listening. Load the identical bytes at `http://localhost:8000/index.html` and all of it appears:
`HTTP/1.0 200 OK`, `Server:`, `Date:`, `Content-type: text/html`, `Content-Length:`,
`Last-Modified:`. The second option treats the difference as *fewer* headers rather than a missing
category, and it also assumes the phone's request arrived somewhere; it did not. The third invents a
status line for a load that had no server in it. The fourth is the most expensive version of the
mistake — treating `localhost`, `127.0.0.1` and `0.0.0.0` as interchangeable names for one shared
machine — and it sends people back to re-check a server that was working the entire time. `localhost`
is not the name of your laptop. It is the name each machine uses for **itself**, so your phone asked
*itself*, found nothing listening on port 8000, and stopped. No packet left the phone, which is why
your laptop's access log shows no line for the attempt. What your laptop needs is a name that means
*your laptop* from somewhere else, and it does not have one yet (objectives 3, 10, 12).
