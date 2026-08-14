# Rubric — HTTP Field Notes

Four criteria. Integer weights summing to **100**.

| # | Criterion | Weight |
| --- | --- | --- |
| 1 | Three genuine, complete captures | 30 |
| 2 | Annotations explain what each line *does* | 25 |
| 3 | The `file://` comparison names both absences | 25 |
| 4 | The phone result is reported as an observation | 20 |
| | **Total** | **100** |

---

### 1. Three genuine, complete captures — 30

`curl_v_public` is raw `curl -v` output containing both `>` lines and `<` lines, with the request
line and the `Host:` header both present among the `>` lines and a status line among the `<` lines.
`curl_i_redirect` is a `curl -I` response head whose status line carries a code between `300` and
`399`. `curl_i_local` is a `curl -I` response head from the learner's own
`python3 -m http.server`: its status line is `HTTP/1.0 200 OK` and it carries a
`Server: SimpleHTTP/0.6 Python/…` header. `status_line_local` is `HTTP/1.0 200 OK` and matches the
first line of `curl_i_local`. `content_type_local` is `text/html` with nothing after it.

Deduct for: a capture that has been tidied, truncated mid-header, or reflowed; a `curl_v_public`
with the `>`/`<` markers stripped; a `curl_i_local` whose header set does not match its own status
line (for example `HTTP/1.1` next to `Server: SimpleHTTP/`, which is not a response any single
server produced); a `content_type_local` that does not appear in `curl_i_local`.

### 2. Annotations explain what each line *does* — 25 *(craft)*

At least six distinct lines, each verbatim from one of the three captures, each with a WHAT IT IS
half naming the line's structural job (request line, request header, status line, response header)
and a WHAT IT DOES half stating what changes because that line is present.

Full credit requires that the WHAT IT DOES half is **not a restatement of the line**. Compare:

> **Restatement, no credit:** "`Host: example.com` is the host header and it says the host is
> example.com."
>
> **Full credit:** "`Host: example.com` tells the machine at the other end *which* of the sites it
> hosts this request is for. Without it an HTTP/1.1 request is answered `400`, because a bare
> `GET /` is unanswerable when one address holds many sites."

Full credit also requires **spread**: the six lines are not all response headers from one capture.
A set covering a request line, a request header, a status line, and headers from more than one
response scores above a set of six headers lifted from `curl_i_local` alone.

Deduct for: any annotated line that cannot be found in the submitted captures; two annotations that
say the same thing about two lines; a WHAT IT DOES half that only re-labels the line ("this is the
date", "this is the length").

### 3. The `file://` comparison names both absences — 25

The comparison states that loading `file:///home/you/projects/first-site/index.html` produces **no
status line** and **no response headers**, and that loading the identical file at
`http://localhost:8000/index.html` produces both — quoting or naming at least one header from the
learner's own `curl_i_local` capture as the contrast.

Full credit requires the *reason*, not only the observation: nothing answered, so there is nothing
to have a status. A status code is a server's verdict on a request; with no server there was no
request, no verdict, and no headers describing a response that never existed. The browser read the
disk itself.

Deduct for: describing the difference as "fewer headers" or "the headers are hidden" rather than as
an absence of the whole category; claiming the `file://` load returned `200`; attributing the
difference to DevTools rather than to what was on the wire.

### 4. The phone result is reported as an observation — 20

The learner actually tried `http://localhost:8000` on a phone on the same Wi-Fi and wrote down what
happened: that the page did not load, while the laptop beside it loaded the same URL, and — the
detail that earns the top of this band — whether a new line appeared in the server's terminal.

Full credit requires the report to be **honest and unresolved**: what was typed, what was seen, and
what the server's log did or did not show. Stating what `localhost` resolved to on the phone is
credited. A submission that reports a fix, or that reports the page loading on the phone, does not
receive this criterion — the first has skipped ahead of the material, and the second did not happen.

Deduct for: an empty or one-word entry; a guess written without trying it; a report that repeats the
`file://` comparison instead of describing the phone.
