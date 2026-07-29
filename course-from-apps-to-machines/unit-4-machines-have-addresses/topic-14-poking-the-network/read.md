# Poking at the network

Your machine has a LAN IP, you can turn a name into an address, and `ss -tlnp` tells you which
programs are listening on which ports. Every one of those facts came from *inside* the machine. In
Unit 5 `~/projects/first-site/index.html` stops being a file you double-click and becomes something
served on a port; in Unit 6 a phone across the room has to reach it. Every failure between here and
there is one of two questions — **is that machine there**, and **is anything answering on that
port** — and there is one command for each.

## `ping`: is that machine there?

`ping` sends a small probe to a host and waits for the host to echo it back. `-c 3` means "send
three, then stop"; without `-c`, `ping` runs until you interrupt it.

```
ping -c 3 example.com
```

Learn the *shape* of what comes back: one line per reply — which host answered, and how many
milliseconds the round trip took — then a summary giving how many packets were transmitted, how many
were received, the percentage lost, and the minimum, average, and maximum round-trip time.

No sample of that block appears here: the machine that captured every other command in this course
could not run `ping` at all, and invented millisecond numbers would teach you to recognise a fiction.
Here is what it printed instead:

```
$ ping -c 3 127.0.0.1
ping: socktype: SOCK_RAW
ping: socket: Operation not permitted
ping: => missing cap_net_raw+p capability or setuid?
```

Look at the address: `127.0.0.1`, the machine talking to itself, the one address that cannot be
unreachable. `ping` failed anyway — while at the same moment, on the same machine, `curl` fetched a
page from the public internet.

The reason is in the third line. `ping` does not open an ordinary connection; it sends an ICMP probe —
ICMP being the small control-message protocol networks use for messages like "are you there?". That
needs a **raw socket**, which needs a privilege (`cap_net_raw`) the program did not have. Nothing
about the network was wrong.

Carry this rule attached to the tool:

> **A failed `ping` is not evidence that the network is down.**

The privilege can be missing, as above, and ICMP is routinely dropped on purpose by firewalls,
corporate networks, cloud hosts, and containers. A *successful* ping is evidence; a failed one is
evidence of nothing. Use it as a cheap first look, never a verdict.

## `curl`: is anything answering?

`curl` speaks the same protocol your browser speaks, from the terminal. Plainly:

```
curl https://example.com
```

That prints the response body — raw HTML, unrendered, straight into your terminal. Usually far more
than you want; `-I` asks for the headers only:

```
$ curl -I https://example.com
HTTP/2 200
content-type: text/html
server: cloudflare
```

Read `200` as an opaque number: something answered, and this is the number it answered with. What the
numbers *mean* is Unit 5's job.

Most of the time that number is all you want, and there is an idiom for exactly that:

```
$ curl -s -o /dev/null -w '%{http_code}\n' https://example.com
200
```

| Flag | What it does |
| --- | --- |
| `-s` | silent — no progress meter, no chatter |
| `-o /dev/null` | write the body to `/dev/null`, the system's discard bin — throw it away |
| `-w '%{http_code}\n'` | after the transfer, write out the status code and a newline |

You will type this command more than any other in Unit 6.

## The measurement that matters: refused vs. unreachable

Two failures look alike in the terminal and mean opposite things.

**Nothing is listening on that port.** The host is right there; the port is empty:

```
$ curl http://127.0.0.1:9999
curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server
```

Read that line closely, because it is a trap. The wording is **`Could not connect to server`**, and
the timing is **`after 0 ms`**. The `7` in parentheses is curl's exit code.

The phrase you may have been expecting — "Connection refused" — is not there. It appears only when
you ask for the underlying reason with `-v` (verbose):

```
connect to 127.0.0.1 port 9999 from 127.0.0.1 port 48604 failed: Connection refused
```

The operating system's own name for that refusal is `ECONNREFUSED`: `errno=111 [Errno 111]
Connection refused`.

**The host is not reachable.** Nothing is there, or something is silently discarding your packets:

```
$ curl --max-time 4 http://192.0.2.1/
curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received
```

`192.0.2.1` comes from a block RFC 5737 reserves for documentation, so it is guaranteed never to be a
real host. `--max-time 4` caps the wait at four seconds; without it curl waits far longer. Exit code
`28`.

| | Nothing listening on that port | Host unreachable |
| --- | --- | --- |
| What you see | `curl: (7) … Could not connect to server` | `curl: (28) Operation timed out … with 0 bytes received` |
| Exit code | `7` | `28` |
| Timing | instant — `after 0 ms` | hangs, then gives up |
| Under `-v` | `Connection refused` | nothing comes back at all |
| What it means | the machine is there and said "no" | nothing said anything |

**The timing is the tell** — the part you can read without remembering either message. A machine that
exists with nothing listening refuses immediately; the refusal *is* an answer, and answers are fast. A
machine that is not there, or a firewall quietly discarding your packets, sends nothing, so curl waits
until it gives up. Instant means "wrong port". Slow means "wrong address, or something in the way".

## What you can now do

You have a procedure — the one you will run on every failure in Unit 6:

1. `curl -s -o /dev/null -w '%{http_code}\n' <url>`. A number means something answered — stop.
2. Failed **instantly**? The host is reachable and nothing is listening on that port. Go back to
   `ss -tlnp` and check what is actually bound, and check the port you typed.
3. Failed **slowly**? Wrong address, or something between you and the machine is dropping packets
   without replying.
4. Add `-v` when you want the underlying reason rather than curl's summary.
5. Use `ping` to corroborate a success. Never let a failed `ping` end the investigation.

You can now test any host and any port from the terminal and tell a closed port from an unreachable
host without guessing. What you cannot do yet is make anything answer — every port on your machine
that matters is still empty. Unit 5 fixes that: something has to be *running* before a port can answer
at all, and once it does, that opaque `200` starts to mean something.
