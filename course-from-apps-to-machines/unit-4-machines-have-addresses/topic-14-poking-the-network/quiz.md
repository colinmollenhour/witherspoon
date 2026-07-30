# Quiz — Poking at the network

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You are on the machine that will serve `~/projects/first-site/index.html`, checking a port before you
use it. You run `curl http://127.0.0.1:9999` and the terminal comes straight back — no pause at all —
with:

```
curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server
```

What has this told you?

- The machine is reachable, and nothing is listening on port 9999
- The machine is switched off or on a different network
- A firewall is silently discarding your packets before they arrive
- The name in the URL could not be resolved to an address

**Correct option index:** 0

**Explanation:**

`after 0 ms` and exit code `7` mean the machine answered — it answered "no". A
refusal is an answer, and answers come back instantly, so the host is definitely there and port 9999
is definitely empty. A machine that is switched off or on a different network cannot answer at all,
so it would produce a slow timeout ending in `curl: (28) Operation timed out`, not an instant
refusal; the same is true of a firewall silently discarding packets, which is exactly the case where
nothing comes back and curl has to wait until it gives up. Name resolution is not involved here at
all — `127.0.0.1` is already an address, so there was nothing to resolve. (objective 12)

## Question 2

**Type:** TRUE_FALSE

You run `ping -c 3 127.0.0.1` on a machine and get:

```
ping: socktype: SOCK_RAW
ping: socket: Operation not permitted
ping: => missing cap_net_raw+p capability or setuid?
```

This proves that networking on that machine is broken.

**Correct answer:** false

**Explanation:**

The opposite is true — this output tells you nothing about the network. The address
tested was `127.0.0.1`, the machine talking to itself, which cannot be unreachable; on the machine
where this was captured, `curl` fetched a page from the public internet at the same moment. The third
line names the real cause: `ping` sends ICMP over a raw socket and the required `cap_net_raw`
privilege was missing. ICMP is also routinely dropped on purpose by firewalls, corporate networks,
cloud hosts, and containers. A *successful* `ping` is evidence; a failed one is not. (objective 10)

## Question 3

**Type:** MULTIPLE_CHOICE

You want one line in your terminal containing only the status code a URL answers with — no HTML, no
headers, no progress meter. Which command does that?

- `curl https://example.com`
- `curl -s https://example.com`
- `curl -I https://example.com`
- `curl -s -o /dev/null -w '%{http_code}\n' https://example.com`

**Correct option index:** 3

**Explanation:**

Three flags do three jobs: `-s` silences the progress meter, `-o /dev/null` sends the
response body to the system's discard bin, and `-w '%{http_code}\n'` writes out the status code and a
newline — leaving `200` and nothing else. `curl https://example.com` prints the whole response body,
raw HTML and all. `curl -s https://example.com` only suppresses the progress meter; the body still
floods your terminal. `curl -I https://example.com` is closest and still wrong: it prints a block of
headers — `HTTP/2 200`, `content-type: text/html`, `server: cloudflare` — which is more than the
code. (objective 11)

## Question 4

**Type:** MULTIPLE_CHOICE

Which of these lines will you see **only** if you add `-v` to your curl command?

- `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server`
- `connect to 127.0.0.1 port 9999 from 127.0.0.1 port 48604 failed: Connection refused`
- `curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`
- `200`

**Correct option index:** 1

**Explanation:**

"Connection refused" is the operating system's underlying reason, and curl reports it
only under `-v`. This matters because the phrase is the one most people go looking for: in ordinary
output curl summarises the same event as `Could not connect to server`, so anyone hunting for
"Connection refused" without `-v` will never find it. The `(28)` timeout line and the `(7)` line are
both ordinary top-level output, and `200` is what the `%{http_code}` idiom prints on success — none of
them needs `-v`. (objectives 11, 12)

## Question 5

**Type:** SHORT_ANSWER

You are testing a machine you believe is at `192.0.2.1`. You run `curl --max-time 4
http://192.0.2.1/`, the terminal sits there doing nothing for about four seconds, and then prints
`curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`. A `ping` to the same
address also fails. State what the curl result tells you, and what the failed ping adds to it.

code 28 and zero bytes received, which is the unreachable-host signature rather than the refused-port
one — a machine that was there with an empty port would have refused instantly with
`curl: (7) … Could not connect to server` after 0 ms. So the address is wrong, or something between
me and the machine is discarding packets without replying. The failed `ping` adds nothing: `ping`
needs a privileged raw socket and ICMP is commonly dropped on purpose, so it fails on plenty of
machines whose networking is fine. Only a successful `ping` would have been evidence.

**A strong answer covers:** (1) the slow timeout / exit 28 / "0 bytes received" read as *nothing answered*,
i.e. unreachable rather than a closed port, with the instant `(7)` refusal named as the contrast;
(2) the conclusion that the address is wrong or packets are being dropped in between; (3) that the
failed `ping` contributes no evidence, with a reason (raw-socket privilege or ICMP being blocked).

**Sample answer:**

The curl result says nothing answered at all: it hung and then timed out with exit
code 28 and zero bytes received, which is the unreachable-host signature rather than the refused-port
one — a machine that was there with an empty port would have refused instantly with
`curl: (7) … Could not connect to server` after 0 ms. So the address is wrong, or something between
me and the machine is discarding packets without replying. The failed `ping` adds nothing: `ping`
needs a privileged raw socket and ICMP is commonly dropped on purpose, so it fails on plenty of
machines whose networking is fine. Only a successful `ping` would have been evidence.

**A full-credit answer shows:**

(1) the slow timeout / exit 28 / "0 bytes received" read as *nothing answered*,
i.e. unreachable rather than a closed port, with the instant `(7)` refusal named as the contrast;
(2) the conclusion that the address is wrong or packets are being dropped in between; (3) that the
failed `ping` contributes no evidence, with a reason (raw-socket privilege or ICMP being blocked).

**Explanation:**

The timing is the discriminator: refusals are instant because a refusal is an answer,
while an unreachable host produces silence that curl can only end with a timeout. Reading the failed
`ping` as confirmation is the tempting mistake — two failures feel like more evidence than one, but a
`ping` that never had the privilege to send, or whose ICMP was dropped by a firewall, fails
identically whether or not the host exists. (objectives 10, 12)
