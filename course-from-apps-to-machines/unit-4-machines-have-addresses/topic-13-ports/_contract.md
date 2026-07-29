# Ports: one address, many doors

**Unit:** 4 — Machines have addresses
**Objectives (unit-numbered):**
7. State the usable TCP port range 1–65535, explain why it is 16 bits, and name what ports 80, 443, and 22 are conventionally used for.   [obj 7]
8. Read the `host:port` part of a URL and state the port implied when it is omitted — 80 for `http://`, 443 for `https://`.   [obj 8]
9. List which programs are listening on which ports with `ss -tlnp` on Linux or WSL, or `lsof -iTCP -sTCP:LISTEN -P -n` on macOS, and read the address:port column.   [obj 9]

## Topic generation prompt

A port answers the question an address alone cannot: *which program on that machine*. Open there,
because the word "port" collides with the only meaning this audience knows — a physical socket [src
A4-16 / row 172 context] — and that collision must be broken explicitly in the first paragraph. Teach
the range from its cause: ports are a 16-bit namespace [src 36, 37], so the numbers run 0–65535, with 0
reserved [src 38], making 1–65535 the usable range. Then IANA's three bands quoted verbatim [src 39, 40,
41] and the conventional assignments for 80, 443, and 22 from the registry rows themselves [src 42, 43,
44]. Include the fact that makes this real rather than trivia: **port 8000 is registered as `irdmi`,
not HTTP** [src 45], and IANA states outright that a registration implies nothing about what actually
flows on a port [src 46]. The dev-server convention the learner is about to rely on has no standards
backing whatsoever, and saying so is more honest and more memorable than presenting 8000 as "the
development port". Then the URL connection, quoting MDN's "technical 'gate'" passage and the rule that
the port is mandatory unless it is the scheme's default [src 102] — this is exactly why they will type
`:8000` in Unit 5 and why they never type `:443`. Close with `ss -tlnp` and the real captured output
[src 58], noting that the process column fills in for your own processes without sudo but stays blank
for other users' [src 59]. Give the macOS equivalent [src 66] and note `ss` does not exist there [src 63].

Do NOT teach `ping` or `curl` (Topic 14). Do NOT start a server (Unit 5) — here the learner is only
observing what is already listening.

## Grounded facts

- 16-bit namespace: "TCP, UDP, UDP-Lite, SCTP, and DCCP use 16-bit namespaces for their port number registries." [src 36]; "Source Port:  16 bits" [src 37]
- Port 0 is Reserved [src 38] → usable range 1–65535
- "o  the System Ports, also known as the Well Known Ports, from 0-1023 (assigned by IANA)" [src 39]
- "o  the User Ports, also known as the Registered Ports, from 1024-49151 (assigned by IANA)" [src 40]
- "o  the Dynamic Ports, also known as the Private or Ephemeral Ports, from 49152-65535 (never assigned)" [src 41]
- IANA rows: `http,80,tcp,World Wide Web HTTP` [src 42]; `https,443,tcp,http protocol over TLS/SSL` [src 43]; `ssh,22,tcp,The Secure Shell (SSH) Protocol` [src 44]
- **Port 8000 is `irdmi`, not HTTP**: `irdmi,8000,tcp,iRDMI,[Gil_Shafriri],[Gil_Shafriri],,,,,,` — no RFC reference [src 45]
- IANA: "THE FACT THAT NETWORK TRAFFIC IS FLOWING TO OR FROM A REGISTERED PORT DOES NOT MEAN THAT IT IS \"GOOD\" TRAFFIC, NOR THAT IT NECESSARILY CORRESPONDS TO THE ASSIGNED SERVICE." [src 46]
- MDN on the port in a URL: "The port indicates the technical \"gate\" used to access the resources on the web server. It is usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS)... Otherwise it is mandatory." [src 102]
- Real `ss -tlnp` output: `LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))` [src 58]
- `ss -p` shows your own processes without sudo; other users' rows are blank [src 59]
- ss flags: `-t` TCP, `-l` listening, `-n` numeric, `-p` process [src 60]
- macOS: `lsof` `-P` "inhibits the conversion of port numbers to port names"; `-n` "inhibits the conversion of network numbers to host names" [src 66]; `ss` does not exist on macOS [src 63]
- A socket address is address + 16-bit port [src 54]
- Teach from: RFC 6335 §6 [src 39–41]; the IANA registry rows [src 42–46]; the real `ss` capture [src 58]

## Requested activities

- READ: 1000–1200 words. Break the physical-port collision first. Range from 16 bits. IANA's three bands verbatim. 80/443/22. The `irdmi` fact about 8000. The URL connection via [src 102]. Then `ss -tlnp` with the real capture and the macOS equivalent. Ends with the learner able to list what is listening on their own machine.
- FLASHCARDS: 11 cards. Port as a number not a socket; 16 bits → 1–65535; the three IANA bands (one card each); 80; 443; 22; 8000's real registration; `ss -tlnp`; `lsof` for macOS; when a URL requires an explicit port.
- QUIZ: 5 questions on deciding whether a URL needs an explicit port, identifying which IANA band a port falls in, reading a supplied `ss -tlnp` line, and choosing the right listing command per platform. Use distractor [src 172] — that http and https share a port — and the physical-socket misconception.

## Handoff

**Inherits:** The learner knows their LAN IP and can resolve names to addresses.
**Leaves:** The learner can list every listening port on their machine and knows why `:8000` will have to be typed but `:443` never is.
**Do not cover:** `ping`, `curl`, reachability testing (Topic 14). Starting a server (Unit 5).
