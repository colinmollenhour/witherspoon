# Quiz — Loopback versus the network

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

Your laptop is serving `~/projects/first-site/index.html` on port 8000. Your phone is on the same
Wi-Fi. You type `http://localhost:8000` on the phone and get nothing, and the laptop's access log
shows no new line at all. What happened?

- The phone sent the request across the Wi-Fi, but your laptop's server refused it because it accepts requests only from itself
- The phone resolved `localhost` to its own `127.0.0.1`, asked itself for port 8000, and never contacted the laptop
- The phone sent the request, but Wi-Fi cannot carry traffic directly between two devices on the same network
- `localhost` names the one machine on the network that is running a server, and the phone could not work out which machine that was

**Correct option index:** 1

**Explanation:**

The empty access log is the giveaway: the laptop was never asked. The phone resolved
`localhost` from its own `/etc/hosts` line — `127.0.0.1   localhost localhost.localdomain
localhost4 localhost4.localdomain4` — and `127.0.0.1` means *this machine* on whichever machine is
asking. RFC 6890 marks the whole `127.0.0.0/8` block `Forwardable | False`, so the request could not
have left the phone even in principle. The first option describes a server bound to `127.0.0.1`, but
yours is not — its banner says `0.0.0.0`, and the empty log shows nothing arrived to be refused. The
third option is wrong: the same Wi-Fi carries
this traffic fine, as you are about to prove. The fourth is the single most common version of this
misconception — that `localhost` names one shared machine — and it is why the companion Stack Overflow
question has 903,096 views (objective 1).

---

## Question 2

**Type:** MULTIPLE_CHOICE

Your server printed `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` when it started.
What does that line tell you?

- The server is listening on every interface the laptop has, so nothing on the server side needs changing
- The server has no address yet and is waiting for one to be assigned
- `0.0.0.0` is a placeholder for `127.0.0.1`, so the server is reachable only from the laptop itself
- `0.0.0.0` is the address other devices should type into their browser to reach the server

**Correct option index:** 0

**Explanation:**

`0.0.0.0` is a **bind instruction** — it means "accept connections arriving on any
interface" — and the Python documentation confirms it: "By default, the server binds itself to all
interfaces." On Linux you can see the same thing from outside with `ss -ltn`, which reports
`LISTEN 0 5 0.0.0.0:8000`. The second option treats it as an unassigned address; it is not an address
being assigned at all. The third option is the `0.0.0.0`-equals-`127.0.0.1` conflation behind a
question with 379,882 views — they are opposites here, one meaning *every* interface and the other
meaning *only the loopback*. The fourth option confuses a bind address with a destination address:
`0.0.0.0` answers "what do I listen on", never "who do I send to" (objective 2).

---

## Question 3

**Type:** TRUE_FALSE

Because your phone could not reach the server, you need to stop `python3 -m http.server 8000` and
restart it with a flag that binds it to the network instead of to loopback.

**Correct answer:** false

**Explanation:**

The opposite is true — there is nothing to restart, and this is the whole reversal of
this topic. Your banner already read `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`,
and the documentation says "By default, the server binds itself to all interfaces." Microsoft's
networking guide states the general rule that makes people expect a change — "you may need to bind
your application to `0.0.0.0` instead of `127.0.0.1`" — but `python3 -m http.server` already did that
from the first second. The server was never misconfigured; the phone was simply given an address that
means "ask yourself" (objective 2).

---

## Question 4

**Type:** MULTIPLE_CHOICE

You are on a MacBook and need the address to type on your phone. Which sequence gets it?

- `ip addr`, then read the `inet` line on the interface that is not `lo`, the same as on Linux
- `ipconfig getifaddr en0` on its own, because the Wi-Fi interface on a Mac is always called `en0`
- `networksetup -listallhardwareports` to find which device is Wi-Fi, then `ipconfig getifaddr <that device>`
- `ss -ltn`, then read the address out of the `LISTEN 0 5 0.0.0.0:8000` row it prints

**Correct option index:** 2

**Explanation:**

macOS has no `ip` command and no `ss` — both are Linux tools — so the first and
fourth options fail before they start, and `ss` would only tell you what your own server is listening
on, not what address your phone should dial. The second option is right in shape but skips the step
that matters: Wi-Fi is not reliably `en0`, and Apple Silicon Macs have been reported as `en2`. Guess
wrong and `ipconfig getifaddr` gives you nothing, because its output "will be empty if no service is
currently configured or active on the interface" — silence that reads like a broken command.
Discovering the interface first, then asking it, is the sequence that works on any Mac. Check the
result against RFC 1918: a normal home address falls in `10.0.0.0 - 10.255.255.255`,
`172.16.0.0 - 172.31.255.255`, or `192.168.0.0 - 192.168.255.255` (objective 3).

---

## Question 5

**Type:** SHORT_ANSWER

Your phone finally loads the page. A new line appears in the laptop's terminal, next to earlier lines
that look like
`127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -`. Name the exact field that proves
the request came from the phone rather than from the laptop, say what value it must have, and explain
why a `404` line would still count as proof.

`127.0.0.1`, meaning the laptop asked itself. The new line's first field is my phone's LAN address
instead, which is only possible if a request actually crossed the Wi-Fi and reached my laptop's
network interface. It counts as proof even if the status code is `404`, because the status describes
whether the file was found, not whether the connection happened — the server could only write the line
at all because a request arrived and was answered.

**Sample answer:**

The first field of the log line — the client address. On every earlier line it says
`127.0.0.1`, meaning the laptop asked itself. The new line's first field is my phone's LAN address
instead, which is only possible if a request actually crossed the Wi-Fi and reached my laptop's
network interface. It counts as proof even if the status code is `404`, because the status describes
whether the file was found, not whether the connection happened — the server could only write the line
at all because a request arrived and was answered.

**Explanation:**

A strong answer covers three things: that the **first field** is the client's address,
that it holds the phone's address rather than `127.0.0.1`, and that reachability is proved by the
line's *existence and its first field*, not by the status code. The tempting mistake is to hunt for
the `200` and treat any error status as failure — but a `404` line means the request arrived, was
parsed, and was answered, which is exactly the thing being tested. The opposite case is the one that
matters for debugging: **no new line at all** means nothing reached the server, and no change to the
server can fix that. This log line is what Project 6 grades (objective 3).
