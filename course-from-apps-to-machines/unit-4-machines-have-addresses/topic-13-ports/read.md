# Ports: one address, many doors

You already know a "port": the physical socket on the side of a laptop — USB-C, HDMI, headphone.
That is the wrong one here. A network port is not a hole in a case; nothing plugs into it. It is
**a number**, and a machine with no sockets at all — a phone on Wi-Fi — has just as many ports as a
desktop with six jacks on the back. The jack is hardware. The port is a number.

Here is why the number has to exist. You can now find the machine that holds
`~/projects/first-site/index.html` — you know its LAN IP, and you know how a name becomes an
address. But that machine is running dozens of programs at once, and nothing in an address says
*which program* should receive the packet. The port is that second half of the delivery instruction.
Linux's own manual states the pair outright: "An IP socket address is defined as a combination of an
IP interface address and a 16-bit port number." [src 54] Address = which machine. Port = which
program on it.

## Why the numbers stop at 65535

The range falls out of one design decision. RFC 6335: "TCP, UDP, UDP-Lite, SCTP, and DCCP use
16-bit namespaces for their port number registries." [src 36] The TCP header reserves exactly that
much room per field: "Source Port: 16 bits" [src 37].

Sixteen bits hold 2^16 = 65,536 distinct values. Counting from zero, that is 0 through 65535. Port 0
is listed by IANA as `Reserved` [src 38], which leaves **1–65535** as the range a program can
actually take. If you ever see a "port 70000", it is a typo — the field is physically too small to
hold it.

## The three bands

IANA — the body that keeps the registry — splits the range into three:

> "o  the System Ports, also known as the Well Known Ports, from 0-1023 (assigned by IANA)" [src 39]
> "o  the User Ports, also known as the Registered Ports, from 1024-49151 (assigned by IANA)" [src 40]
> "o  the Dynamic Ports, also known as the Private or Ephemeral Ports, from 49152-65535 (never assigned)" [src 41]

| Band | Range | Assigned by IANA? | What lives here |
| --- | --- | --- | --- |
| System / Well Known | 0–1023 | Yes | The long-standing services — 80, 443, 22 |
| User / Registered | 1024–49151 | Yes | Everything else that asked for a number, including 8000 |
| Dynamic / Private / Ephemeral | 49152–65535 | Never | Short-lived numbers, handed out and thrown away |

Note the third row: "never assigned" means nobody owns those. There is nothing to look up.

## Three numbers you will see for the rest of your life

Straight from the registry rows:

- `http,80,tcp,World Wide Web HTTP` [src 42]
- `https,443,tcp,http protocol over TLS/SSL` [src 43]
- `ssh,22,tcp,The Secure Shell (SSH) Protocol` [src 44]

All three sit in the System band, and all three are convention with real standards weight behind
them.

## Port 8000 has nothing to do with the web

You are about to spend an entire unit typing `8000`, so learn the honest version now. Look it up in
the same registry and you get:

```
irdmi,8000,tcp,iRDMI,[Gil_Shafriri],[Gil_Shafriri],,,,,,
```

That is the whole row [src 45]. The service is called `irdmi`. There is no RFC reference, and
nothing in the row mentions HTTP, the web, or development. Every tutorial that calls 8000 "the
development port" is describing a habit, not a standard.

IANA makes the general point in capital letters:

> "THE FACT THAT NETWORK TRAFFIC IS FLOWING TO OR FROM A REGISTERED PORT DOES NOT MEAN THAT IT IS
> \"GOOD\" TRAFFIC, NOR THAT IT NECESSARILY CORRESPONDS TO THE ASSIGNED SERVICE." [src 46]

A registration forces nobody to obey it. Web traffic runs happily on 8000, and something that is
not `irdmi` at all can sit there. The registry is a phone book, not a lock.

## Why you will type `:8000` but never type `:443`

The port lives in the URL, right after the host, separated by a colon: `host:port`. MDN:

> "The port indicates the technical \"gate\" used to access the resources on the web server. It is
> usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and
> 443 for HTTPS) to grant access to its resources. Otherwise it is mandatory." [src 102]

Every `https://` URL you have ever opened *had* a port — 443 — and the browser filled it in because
the scheme's default matched. Same for `http://` and 80. The moment a server sits anywhere else, the
default is wrong and you must say the number yourself. That is the entire reason
`http://<LAN-IP>:8000` carries a visible `:8000` while `https://developer.mozilla.org` never shows
`:443`. Nothing special is happening in the first URL; the second is hiding a number.

## Seeing what is listening right now

A program that has claimed a port is **listening** on it: waiting for connections. On Linux or WSL,
`ss` lists these. The flags: `-t` TCP, `-l` listening, `-n` don't resolve service names to words,
`-p` show the process [src 60]. So:

```
ss -tlnp
```

A real line of its output, captured from a machine that had something claiming 8000 [src 58]:

```
LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
```

Read it left to right:

| Field | Value here | Meaning |
| --- | --- | --- |
| State | `LISTEN` | Waiting for connections, not currently talking to anyone |
| Recv-Q | `0` | Nothing queued up unread |
| Send-Q | `5` | How many pending connections this socket will hold |
| Local Address:Port | `0.0.0.0:8000` | The address it accepts on, and — after the colon — **the port** |
| Peer Address:Port | `0.0.0.0:*` | Who it will accept from; `*` is "any port" |
| Process | `users:(("python3",pid=8,fd=4))` | The program holding it: `python3`, process id 8 |

The `0.0.0.0` on the left is a stand-in for "any address this machine has" rather than one specific
address [src 107]. Whether another device can actually reach it is a separate question, and not this
unit's.

One thing worth saying plainly: the Process column fills in for programs *you* own, without `sudo`,
and stays blank for other users' [src 59]. A blank there means "not yours to see", not "no program".

On macOS there is no `ss` at all — it is a Linux tool and no such man page exists [src 63]. The
equivalent is:

```
lsof -iTCP -sTCP:LISTEN -P -n
```

`-iTCP` selects TCP, `-sTCP:LISTEN` keeps only listening sockets, and the last two stop `lsof`
prettifying the numbers: `-P` "inhibits the conversion of port numbers to port names for network
files" and `-n` "inhibits the conversion of network numbers to host names for network files"
[src 66]. Without `-P` you would see `http` where you wanted `80`.

## Where this leaves you

Run one of those two commands and you can list every port your machine is listening on, name the
program behind each, and place each number in its IANA band. You know `:8000` is a habit with no
standards backing, and `:443` is invisible only because the browser fills it in.

Listening is not the same as reachable, though. A program can be listening on 8000 while a device
across the room gets nothing at all. Next you learn how to ask a machine whether anything is
actually answering.
