# Quiz — Your machine has an address

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

The line `inet 127.0.0.1/8 scope host lo` from `ip -4 addr` is this machine's address on the Wi-Fi.

**Correct answer:** false

**Explanation:**

The opposite is true. That line is loopback: this computer talking to itself. `scope host` and `lo` mark it as this host only, and loopback must not appear outside a host. The LAN address is a different `inet` line — one that is not `127.0.0.1`. Write that other number down (objectives 1, 3).

## Question 2

**Type:** SHORT_ANSWER

What does `127.0.0.1` mean, and why does a `192.168.x.x` address stop at your network?

**Sample answer:**

`127.0.0.1` is loopback: this computer talking to itself. It must not appear outside a host, so it is not a Wi-Fi address. A `192.168.x.x` address is private — it sits in `192.168.0.0/16`. Anyone may use that block on their own network, with no public registration, so the number is not unique on the internet and is not reachable from outside. Traffic that leaves is rewritten by the router.

**A full-credit answer shows:**

A strong answer covers (1) that `127.0.0.1` means this computer talking to itself and must not leave the host, and (2) that a `192.168` address is private — usable on the local network, not reachable from the public internet — so it stops at the router.

**Explanation:**

`127.0.0.1` is this computer talking to itself; the whole `127.0.0.0/8` block is loopback and must not leave the host. A `192.168.x.x` address is in `192.168.0.0/16`, one of the three private blocks anyone may use without registration. Those numbers are for the local network only, so they stop at the router. An answer that treats `127.0.0.1` as the Wi-Fi address, or that treats `192.168` as publicly reachable, has swapped the two kinds of local (objective 3).

## Question 3

**Type:** MULTIPLE_CHOICE

You wrote down `10.0.0.5` from an `inet` line. Which private block is it in?

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `127.0.0.0/8`

**Correct option index:** 0

**Explanation:**

`10.0.0.5` starts with `10`, so it sits in `10.0.0.0/8` (`10.0.0.0`–`10.255.255.255`). `172.16.0.0/12` needs a first number of `172` and a second number from `16` to `31`. `192.168.0.0/16` needs the first two numbers to be `192.168`. `127.0.0.0/8` is loopback, not a private LAN block — `10.0.0.5` is not this computer talking to itself (objective 2).
