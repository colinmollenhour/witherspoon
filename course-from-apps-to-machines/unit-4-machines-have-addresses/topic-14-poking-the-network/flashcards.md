# Flashcards — Poking at the network

## Card 1

**Front:** `ping -c 3 example.com` — what is `-c 3` for, and what does the last part of the output
tell you?

**Back:** `-c 3` sends three probes and stops (without it, `ping` runs until you interrupt it). The
summary at the end gives packets transmitted, packets received, the percentage lost, and the minimum,
average, and maximum round-trip time in milliseconds.

## Card 2

**Front:** `curl https://example.com`

**Back:** Fetches the URL from the terminal and prints the response body — raw, unrendered HTML.

## Card 3

**Front:** Print *only* the status code a URL answers with, nothing else.

**Back:** `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` → `200`. `-s` silences the
progress meter, `-o /dev/null` throws the body away, `-w '%{http_code}\n'` writes out the code.

## Card 4

**Front:** `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server`

**Back:** Exit code 7. The host is reachable and refused the connection — nothing is listening on
that port.

## Card 5

**Front:** `curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`

**Back:** Exit code 28. Nothing answered at all — the host is unreachable, or something between you
and it is silently discarding packets.

## Card 6

**Front:** Your `curl` failed. You did not read the message. What single observation tells you
whether the port was closed or the host was unreachable?

**Back:** How long it took. Instant failure = the machine is there and refused (wrong port). Slow
failure ending in a timeout = nothing answered (wrong address, or something in the way).

## Card 7

**Front:** `ping` to a machine fails. What have you proved about that machine?

**Back:** Nothing. A failed `ping` is not evidence that the network is down — only a *successful*
`ping` is evidence of anything. Keep testing with `curl`.

## Card 8

**Front:** You want the operating system's actual reason for a refused connection, not curl's
summary. What do you add?

**Back:** `-v` (verbose). Only there does the phrase appear:
`connect to 127.0.0.1 port 9999 from 127.0.0.1 port 48604 failed: Connection refused`.

## Card 9

**Front:** Why does `ping` fail so often on machines whose networking is perfectly fine?

**Back:** It sends ICMP over a raw socket. The privilege can be missing —
`ping: socket: Operation not permitted` / `missing cap_net_raw+p capability or setuid?` — and ICMP is
deliberately dropped by firewalls, corporate networks, cloud hosts, and containers.
