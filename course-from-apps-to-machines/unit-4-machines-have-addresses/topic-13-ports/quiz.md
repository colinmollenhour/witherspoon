# Quiz — Ports: one address, many doors

**Passing score:** 70

## Question 1

**Type:** MULTIPLE_CHOICE

**Q:** Four people are handing you a link to a page on their machine. In which case must the URL carry an explicit `:port` to reach the server?

- `http://example.com/` — the server is listening on port 80
- `https://example.com/` — the server is listening on port 443
- **`http://example.com/` — the server is listening on port 8000**
- `http://example.com/notes/index.html` — the server is listening on port 80

**Explanation:** MDN states the rule directly: the port "is usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS)... Otherwise it is mandatory." [src 102] A server on 8000 is not on `http://`'s default of 80, so the browser's assumption would be wrong and the number has to be typed. The first and second options are the two default cases — the port is present in both, just filled in by the browser rather than by you. The fourth option is a trap about the path: a path of any length changes nothing about the port, and 80 is still `http://`'s default (objective 8).

## Question 2

**Type:** TRUE_FALSE

**Q:** `http://` and `https://` are two flavours of the same protocol, so they use the same port — the difference between them has nothing to do with port numbers.

**Correct answer:** False

**Explanation:** The opposite is true. The registry gives them separate rows and separate numbers: `http,80,tcp,World Wide Web HTTP` [src 42] and `https,443,tcp,http protocol over TLS/SSL` [src 43]. This misconception is common enough that "Serve http (port 80) and https (port 443) on same VirtualHost" is a heavily-viewed standing question [src 172] — the very framing of which shows they are two ports on one server, not one shared port. It is exactly because the numbers differ that a browser can fill in 443 for `https://` and 80 for `http://` without asking you (objectives 7, 8).

## Question 3

**Type:** MULTIPLE_CHOICE

**Q:** Which IANA band does port 8000 fall into?

- System Ports / Well Known Ports, 0–1023
- **User Ports / Registered Ports, 1024–49151**
- Dynamic Ports / Private or Ephemeral Ports, 49152–65535
- No band — 8000 sits outside the assignable range

**Explanation:** 8000 is between 1024 and 49151, so it is a User / Registered Port — "the User Ports, also known as the Registered Ports, from 1024-49151 (assigned by IANA)" [src 40] — and it is genuinely registered, as `irdmi` [src 45]. It is not a System Port: those stop at 1023 [src 39], which is why 80, 443, and 22 are in that band and 8000 is not. It is not Dynamic: that band starts at 49152 and is "never assigned" [src 41]. And it is well inside the assignable range, which runs to 65535 because the namespace is 16 bits [src 36] (objective 7).

## Question 4

**Type:** SHORT_ANSWER

**Q:** You run `ss -tlnp` on your Linux machine and one line comes back:

```
LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
```

Which port is taken, which program has it, and what would it mean if the last column were blank instead?

**Sample answer:** Port 8000 is taken — it is the number after the colon in the local address column, `0.0.0.0:8000`. The program holding it is `python3`, running as process id 8. `LISTEN` means it is waiting for connections rather than currently talking to anyone. If the last column were blank, it would not mean "no program" — `ss -p` only fills in process details for processes you own, and leaves other users' rows blank unless you run it with `sudo`.

**A grader must see:**
- the port read as 8000, from the address:port column (not from the `5` or the `8`)
- the process identified as `python3`
- a blank Process column explained as an ownership/permission limit, not as an empty port

**Explanation:** The port is the part after the colon in the local address column; the `0` and `5` are queue counters and `pid=8` is a process id, both of which get misread as port numbers by people scanning for the first number they see. The Process column is populated for processes you own without `sudo` and blank for other users' [src 59], so a blank there means "not yours to see" (objective 9).

## Question 5

**Type:** MULTIPLE_CHOICE

**Q:** You are on a Mac and want to know which programs are listening on which ports. What do you do?

- Run `ss -tlnp`
- Run `sudo ss -tlnp`, since listing other programs needs privileges
- **Run `lsof -iTCP -sTCP:LISTEN -P -n`**
- Count the network sockets on the machine — a Mac with one Ethernet jack can only hold one listening port at a time

**Explanation:** `ss` is a Linux tool and has no macOS man page at all [src 63], so neither the plain nor the `sudo` version can run — `sudo` grants privileges, it does not conjure a command that was never installed. `lsof -iTCP -sTCP:LISTEN -P -n` is the macOS equivalent, with `-P` inhibiting "the conversion of port numbers to port names" and `-n` inhibiting "the conversion of network numbers to host names" [src 66] so you read raw numbers. The last option is the physical-socket confusion: a port is a 16-bit number, not a jack, so the machine has 65535 usable ones whether it has six Ethernet sockets or none [src 36, 38] (objective 9).
