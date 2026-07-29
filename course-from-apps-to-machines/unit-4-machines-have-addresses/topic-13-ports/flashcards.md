# Flashcards — Ports: one address, many doors

## Card 1

**Front:** In networking, what *is* a port — given that the ports you already know are the sockets on the side of a laptop?

**Back:** A number, not a socket. Nothing plugs into it. It rides inside the packet alongside the IP address and says which program on the machine should receive it — "An IP socket address is defined as a combination of an IP interface address and a 16-bit port number." [src 54]

## Card 2

**Front:** Why do port numbers stop at 65535, and what is the usable range?

**Back:** Ports are a 16-bit namespace [src 36], and 16 bits hold 2^16 = 65,536 values — 0 through 65535. Port 0 is `Reserved` [src 38], so the usable range is **1–65535**.

## Card 3

**Front:** IANA band: 0–1023

**Back:** "the System Ports, also known as the Well Known Ports, from 0-1023 (assigned by IANA)" [src 39]

## Card 4

**Front:** IANA band: 1024–49151

**Back:** "the User Ports, also known as the Registered Ports, from 1024-49151 (assigned by IANA)" [src 40]

## Card 5

**Front:** IANA band: 49152–65535

**Back:** "the Dynamic Ports, also known as the Private or Ephemeral Ports, from 49152-65535 (never assigned)" [src 41] — nobody owns these; there is nothing to look up.

## Card 6

**Front:** Ports 80 and 443 — which scheme does each belong to, per the registry?

**Back:** `http,80,tcp,World Wide Web HTTP` [src 42] and `https,443,tcp,http protocol over TLS/SSL` [src 43]. Two different ports, one per scheme.

## Card 7

**Front:** Port 22

**Back:** `ssh,22,tcp,The Secure Shell (SSH) Protocol` [src 44]

## Card 8

**Front:** What is port 8000 actually registered as?

**Back:** `irdmi` — the row reads `irdmi,8000,tcp,iRDMI,[Gil_Shafriri],[Gil_Shafriri],,,,,,` with no RFC reference and no mention of HTTP [src 45]. Its use for development servers is pure convention with zero standards backing.

## Card 9

**Front:** A URL is missing its `:port`. When does that make it wrong?

**Back:** Only when the server is not on the scheme's default. MDN: the port "is usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS)... Otherwise it is mandatory." [src 102]

## Card 10

**Front:** Linux or WSL — list every program listening on a port, with the process names

**Back:** `ss -tlnp` — `-t` TCP, `-l` listening, `-n` no name resolution, `-p` show the process [src 60]. The Process column is filled in for your own processes without `sudo` and blank for other users' [src 59].

## Card 11

**Front:** macOS — list every program listening on a port

**Back:** `lsof -iTCP -sTCP:LISTEN -P -n`. `ss` does not exist on macOS [src 63]. `-P` "inhibits the conversion of port numbers to port names" and `-n` "inhibits the conversion of network numbers to host names" [src 66], so you see `8000` rather than a service name.
