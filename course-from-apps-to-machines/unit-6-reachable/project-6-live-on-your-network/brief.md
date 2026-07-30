# Project 6 — Live on Your Network

**Type:** `interactive-form`
**Unit:** 6 — Reachable: from your laptop to the whole house
**This is the capstone.** It finishes the file you started in Unit 1.

## Goal

Serve `~/projects/first-site/index.html` from your machine, load it on your phone over your Wi-Fi, prove it with the server's access log, and write a short runbook you could follow again in six months.

---

## How this works

Nothing here is auto-run. You work on real hardware — your machine, your Wi-Fi, your phone — and
you submit **evidence of what actually happened**. Small parsers read your submission field by
field; a human or model reads your runbook and your account of what went wrong.

You submit one file: `starter/submission.txt`, filled in. It is a plain text file split into fields
by header lines that look like this:

```
=== lan_ip ===
```

Everything between one header and the next is that field's value. Do not delete the headers, do not
reorder them, do not add new ones. If a field is multi-line, just put the lines in.

**Copy your captures. Do not retype them.** Select the text in your terminal and paste it. Retyped
output loses the exact spacing the parsers match on, and a retyped log line is indistinguishable
from an invented one.

### The nine fields

| Field | What goes in it |
| --- | --- |
| `platform` | Exactly one of `macOS`, `Linux`, `WSL` |
| `lan_ip` | The serving machine's LAN IPv4 — the address your phone can reach, one dotted quad, nothing else |
| `phone_url` | The exact URL you typed into the second device's address bar |
| `curl_i_output` | The full output of `curl -I http://127.0.0.1:8000/index.html`, run **on the serving machine** |
| `access_log_lines` | At least two lines pasted from the server's own terminal: one caused by the serving machine, and one whose client address is the second device |
| `second_device_ip` | The address that appears at the start of that second log line |
| `runbook` | Your runbook — start, check, when it fails, stop, teardown |
| `obstacles` | What went wrong, and how you worked out what it was |

---

## Read this first if you are on WSL

**The WSL path is documented by Microsoft step by step. It was not verified end to end by this
course.** No Windows machine was available while this course was built, the combination you are about
to run — mirrored networking mode, plus a Hyper-V firewall rule on port 8000, plus a phone on Wi-Fi —
is not shown as a worked example anywhere in Microsoft's documentation, and Microsoft's own issue
tracker still has an open report (microsoft/WSL issue #10769) about exactly this friction. The Stack
Overflow question "Connecting to WSL2 server via local network" — "None of the above have worked" —
has 364,943 views.

You are being handed a documented procedure, not a promise. This capstone is completable either way,
because there are two accepted paths and you choose after you have tried.

**Path A — the phone (or any second machine) connects.** Follow Topic 21's fix in order, then do
this project exactly as written. If the phone will not cooperate but a second laptop, a tablet, or a
virtual machine **on the same network** will, use that instead — the project never required a phone,
only a second machine with its own address. Its log line is worth exactly as much.

**Path B — nothing else on the network can reach it.** You are then graded on the diagnosis, at full
credit. Fill in every field as normal, with these differences:

- `second_device_ip` is the literal text `WSL-PATH-B` (this is only accepted when `platform` is `WSL`)
- `access_log_lines` still needs at least two real lines from your own server, from your own
  requests on the serving machine — you still have to have had a server running
- `obstacles` must contain the diagnostic record, one item per line, with these exact prefixes:

```
WSL-IP-ADDR: <the address ip addr reported inside WSL>
WSL-IPCONFIG: <the IPv4 address ipconfig.exe reported in the same shell>
```

plus a line containing `networkingMode=mirrored`, a line containing the Hyper-V rule exactly as you
ran it (including `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}` and `-LocalPorts 8000`), and a line:

```
STOPPED AT: <the step where it stopped, and what you saw>
```

Path B is not the easy way out — it asks for more written evidence than Path A does, and a Path B
submission missing the two address readings scores zero on that criterion. It exists so that a
documented-but-unverified path cannot cost you the capstone.

---

## Your tasks

### 1. Serve the right directory

Stand in the project directory before you start the server. The server serves the directory it was
started in: "By default, the server uses the current directory."

```
cd ~/projects/first-site
python3 -m http.server 8000
```

If the terminal prints an error instead of a banner, you are in Topic 20's territory — read the
string, do not retry. `OSError: [Errno 98] Address already in use` (Errno 48 on macOS) means
something already holds the port; find it with `ss -tlnp` on Linux or `lsof -i :8000` on macOS and
stop it. `PermissionError: [Errno 13] Permission denied` means you asked for a port below 1024.

The banner you want:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

`0.0.0.0` is the bind address, and it already says the server accepts connections on every
interface. You will not need to change it.

### 2. Prove it locally, and capture the proof

In a **second terminal**, on the same machine:

```
curl -I http://127.0.0.1:8000/index.html
```

Paste the whole output into `curl_i_output`. This is the capture this course took — yours will
differ in the date, the length, and the Python version, and that is expected:

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Date: Wed, 29 Jul 2026 04:26:16 GMT
Content-type: text/html
Content-Length: 31
Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT
```

Two things in there are graded, and both are fingerprints of *your* server rather than a tutorial's.
`HTTP/1.0` — the start line — because `http.server` answers HTTP/1.0 by default: "For backwards
compatibility, the setting defaults to `'HTTP/1.0'`." And `Content-type: text/html` with **no**
charset, because that is what a real file read off disk gets; the generated directory listing gets
`Content-type: text/html; charset=utf-8` instead. A charset there means you started the server in
the wrong folder and you are looking at a listing, not your page.

### 3. Find the LAN IP

**Linux and WSL:**

```
ip addr
```

Ignore the `lo` block — `inet 127.0.0.1/8 scope host lo` is loopback and is not the answer. You want
the `inet` line on your Wi-Fi interface.

**macOS** has no `ip` command, and Wi-Fi is not reliably `en0`:

```
networksetup -listallhardwareports
ipconfig getifaddr en0
```

Empty output means you named the wrong interface: `getifaddr` "Prints to standard output the IP
address for the first network service associated with the given interface. The output will be empty
if no service is currently configured or active on the interface."

Check the address against RFC 1918's three private blocks, quoted exactly:

```
     10.0.0.0        -   10.255.255.255  (10/8 prefix)
     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
```

Put the dotted quad, and nothing else, in `lan_ip`. No `/24`, no port, no interface name.

### 4. Type the address on the second device

Put the second device on the same Wi-Fi. Then, in its browser:

```
http://<your lan_ip>:8000
```

`:8000` is not optional — the port is only omitted when the server is on the standard one, and yours
is not. `localhost` on the phone means *the phone*; that is the wall Unit 6 opened with.

Put what you actually typed in `phone_url`. It must be `http://` plus the same `lan_ip` you
submitted, plus `:8000`, optionally followed by `/` or `/index.html`.

### 5. Capture the log — this is the whole project

Watch the server's terminal while the second device loads the page. Every request the server answers
writes one line. Here is a real one, from a request the serving machine made to itself:

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -
```

The first field is **the address of whoever asked**. The line your `curl -I` produced in task 2 has
`127.0.0.1` in that field. The line the second device produces has the same shape but a different
first field:

```
<the second device's address> - - [<date> <time>] "GET / HTTP/1.1" 200 -
```

Paste at least two lines into `access_log_lines`: one with `127.0.0.1` in front, and one with the
second device's address in front. Put that second address, on its own, in `second_device_ip`.

> **A line whose client address is `127.0.0.1` proves nothing.**
> It says a program on the serving machine asked the serving machine a question. That is what
> `curl -I` does, and you have already done it. The entire claim of this project is that a *second
> machine* reached your server across a network, and the only thing in the whole submission that can
> prove it is a client address that is not loopback and is not the serving machine's own. The graders
> check exactly that. Do not submit a `curl` you ran on the laptop as your phone.

`"GET / HTTP/1.1"` in the quoted part is the *client's* protocol version echoed back, not your
server's — your server answered HTTP/1.0. You may also see extra lines the browser generated on its
own. Leave them in; they are evidence, not noise.

### 6. Write the runbook

Start from `starter/runbook-skeleton.md` and fill in every heading, then paste the result into the
`runbook` field. Five sections: **Start**, **Check**, **When it fails**, **Stop**, **Teardown**.

The test for a good runbook is not that the commands are right. It is whether a stranger who has
never used your machine could follow it, and whether it tells them what to do when a step does not
produce what it says it will. A list of commands with no failure branch is a transcript, not a
runbook.

At minimum it must carry a line containing `python3 -m http.server` and a line containing `Ctrl-C`
— the server stops with `Ctrl-C`, which prints `Keyboard interrupt received, exiting.`

### 7. Teardown — close what you opened

**You opened a hole in a firewall to do this project. Close it.** A course that walks a beginner
through opening an inbound port and then walks away has taught them half a habit. Write what you
actually did into the `## Teardown` section of the runbook.

**All platforms:** stop the server with `Ctrl-C`. A server left running on `0.0.0.0` serves your
project directory to everyone on that Wi-Fi for as long as the terminal stays open — including on
networks you did not choose, like a café or a campus.

**WSL:** you created a Hyper-V firewall rule named `MyWebServer` and, if you turned on mirrored
mode, you left WSL directly addressable from the LAN. Both should come off when you are done. This
course grounds the command that *creates* that rule and deliberately does not hand you a removal
command it never verified — look it up on the same Microsoft Hyper-V firewall page you used to
create it, run it against the rule name `MyWebServer`, and record the exact command you ran in your
Teardown section. To go back to the default networking, remove the `networkingMode=mirrored` line
from `%UserProfile%\.wslconfig` and restart the subsystem as Topic 21 describes: the change does not
take effect until "the subsystem running your Linux distribution completely stops running and
restarts… This typically takes about 8 seconds after closing ALL instances of the distribution
shell."

**macOS:** if the firewall alert appeared and you allowed it — "an alert message appears asking if
you want to allow or deny the connection over the network or internet" — the Python interpreter was
added to the list of apps allowed to accept incoming connections. Open the same firewall settings
you checked in Topic 20 and take it back off the list. Note what it was named there; it will be the
interpreter, not `first-site`.

**Linux:** this course did not have you run a firewall command, so if you ran one, it is yours to
reverse — write down the exact command you ran and the exact command that undoes it. If you changed
nothing, say so in one line: `No firewall change was made.` That sentence is a real answer and it
scores.

### 8. Notice what the address is worth

Text `phone_url` to someone on a different network and ask them to open it. It will fail. Write one
line in `obstacles`, beginning with `Outside:`, saying what happened and why. You already know the
answer: RFC 1918 addresses may be used by anyone — "An enterprise that decides to use IP addresses
out of the address space defined in this document can do so without any coordination with IANA or an
Internet registry" — so their network has that address too, and it belongs to something else there.

---

## Steps

Each step's completion is checked mechanically against your submitted fields.

- [ ] **1. Serve the right directory.** Start `python3 -m http.server 8000` from
      `~/projects/first-site` and capture the response headers.
      *Completion:* `curl_i_output` contains a line matching `^HTTP/1\.0 200`, a line matching
      `^Content-type: text/html$` with no charset parameter, and a line beginning `Content-Length:`.

- [ ] **2. Prove the capture is your own server.**
      *Completion:* `curl_i_output` contains a line matching `^Server: SimpleHTTP/<version>
      Python/<version>$` and contains no line beginning `HTTP/1.1`.

- [ ] **3. Record the LAN IP.**
      *Completion:* `lan_ip` parses as a dotted-quad IPv4, falls inside one of RFC 1918's three
      ranges, and is not inside `127.0.0.0/8`.

- [ ] **4. Type the exact URL on the second device.**
      *Completion:* `phone_url` equals `http://` + the submitted `lan_ip` + `:8000`, optionally
      followed by `/` or `/index.html`.

- [ ] **5. Capture the second device in the log.**
      *Completion:* `second_device_ip` parses as a dotted-quad IPv4, falls inside an RFC 1918 range,
      is not inside `127.0.0.0/8`, and differs from `lan_ip`; **and** `access_log_lines` contains at
      least two lines matching the access-log shape `<client> - - [<timestamp>] "<request>" <status>
      <size>`, at least one whose client field equals `second_device_ip` and at least one whose
      client field is inside `127.0.0.0/8`.
      *WSL Path B:* `second_device_ip` is exactly `WSL-PATH-B`, `platform` is `WSL`,
      `access_log_lines` contains at least two well-formed lines with at least one client field
      inside `127.0.0.0/8`, and `obstacles` contains lines beginning `WSL-IP-ADDR:`, `WSL-IPCONFIG:`
      and `STOPPED AT:`, plus a line containing `networkingMode=mirrored` and a line containing both
      `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}` and `-LocalPorts 8000`.

- [ ] **6. Write a runbook that starts and stops the server.**
      *Completion:* `runbook` contains at least one line containing `python3 -m http.server` and at
      least one line containing `Ctrl-C` or `Ctrl+C`.

- [ ] **7. Tear down what you opened.**
      *Completion:* `runbook` contains a line beginning `## Teardown` and, below it, at least one
      non-empty line; for `platform: WSL` that section contains the string `MyWebServer`; for
      `platform: macOS` or `Linux` it contains either a named firewall entry or setting that was
      reversed, or the exact sentence `No firewall change was made.`

- [ ] **8. (Noticing) Send the URL off your network.**
      *Completion:* `obstacles` contains a line beginning `Outside:`.

---

## Expected output

When you finish, you should have seen all four of these on your own machine:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Date: Wed, 29 Jul 2026 04:26:16 GMT
Content-type: text/html
Content-Length: 31
Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT
```

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -
<the second device's address> - - [<date> <time>] "GET / HTTP/1.1" 200 -
```

```
Keyboard interrupt received, exiting.
```

The dates, the lengths, the Python version, and the addresses will be yours, not these.

---

## Rules

- Paste captures; never retype them, and never edit them afterwards. Changing one octet of a log
  line to make it look right is the one thing this project is built to detect.
- Do not submit a `curl` you ran on the serving machine as second-device evidence.
- `lan_ip` and `second_device_ip` are bare dotted quads — no port, no prefix length, no scheme.
- Do not add, rename, remove, or reorder the `=== field ===` headers in `submission.txt`.
- `platform` is exactly one of `macOS`, `Linux`, `WSL` — the parsers match it literally.
- `WSL-PATH-B` is only valid when `platform` is `WSL`. On macOS or Linux it is a failed submission,
  not a shortcut.
- Do not put your server on port 80 to make the URL prettier. It will fail with
  `PermissionError: [Errno 13] Permission denied`, and that is the correct behaviour.

---

## Environment

Pinned per platform. Nothing here is `latest`.

**Grading harness** — runs on the submission file only, no network:

| Item | Pin |
| --- | --- |
| Image | `python:3.14.6` |
| Packages | none — standard library only |
| `timeoutMs` | 60000 |

**Your machine — macOS.** macOS ships no Python runtime: "Python 2.7 was removed from macOS in this
update. Developers should use Python 3 or an alternative language instead." Typing `python3` raises
a dialog — "The \"python3\" command requires the command line developer tools. Would you like to
install the tools now?" Accept it, or run `xcode-select --install`, which "Opens a user interface
dialog to request automatic installation of the command line developer tools." macOS has no `ip` and
no `ss`; use `networksetup`, `ipconfig getifaddr`, and `lsof`.

**Your machine — Linux.** Ubuntu 26.04 LTS "Resolute Raccoon". `python3`, `curl`, and `iproute2`
(which provides `ip` and `ss`) are present.

**Your machine — WSL.** If you have not set this up: enable Windows Subsystem for Linux, Virtual
Machine Platform, and Windows Hypervisor Platform in *Turn Windows features on or off*, restart,
install Windows Terminal and Ubuntu from the Microsoft Store
(https://apps.microsoft.com/detail/9pdxgncfsczv). WSL is not pre-installed. You need "Windows 10
version 2004 and higher (Build 19041 and higher) or Windows 11". New installs default to WSL 2. The
default WSL Ubuntu image ships `python3 3.12.3-0ubuntu2`, `curl 8.5.0-2ubuntu10.6`, and `iproute2
6.1.0-1ubuntu6`. Mirrored networking needs "Windows 11 22H2 and higher"; the Hyper-V firewall "will
be turned on by default" on "Windows 11 22H2 and higher, with WSL 2.0.9 and higher", which is why
the rule is required.

**The server itself.** `python3 -m http.server 8000` — port 8000, bound to `0.0.0.0`, answering
HTTP/1.0. Port 8000 is not a registered HTTP port; it is `irdmi` in IANA's registry, and its use for
development servers is pure convention.

---

## Grading

Machine tests live in `tests/` and are worth 100 points between them; the rubric a human or model
grades against is in [`rubric.md`](rubric.md).

One last thing worth saying out loud: `python3 -m http.server` is not what you would put on the
public internet. Python's own documentation says "http.server is not recommended for production. It
only implements basic security checks", and the concrete reason is that
"SimpleHTTPRequestHandler will follow symbolic links when handling requests which makes it possible
for files outside of the specified directory to be served." It was the right tool for this. It is
the wrong tool for that.
