# When it doesn't work

Your page is loading on your phone at `http://<your-LAN-IP>:8000` — or it was, and now it isn't. This
topic is the four ways `python3 -m http.server` fails on the way to that phone, and the ordered
procedure that tells you which one you are looking at. Each failure announces itself with an exact
string. Recognising the string *is* most of the skill; everything after it is mechanical.

## `Address already in use`

You start the server in `~/projects/first-site` and instead of the banner you get:

```
OSError: [Errno 98] Address already in use
```

The command stops with exit code 1. On a Mac the number differs — `[Errno 48]` — but the words after it
are identical. **Match on the words, not the number.** The number is your operating system's internal
code for the condition; the sentence is the condition.

Nearly two million people have read one Stack Overflow question about this error, and it is usually
taken to mean *the port is broken*. It is not. A **port** is a numbered slot on your machine, and
exactly one program may hold a given slot at a time. The error is a fact about ownership — something
already holds 8000, usually a server you started in another terminal tab and forgot.

So find the owner. On Linux:

```
$ ss -tlnp
LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
```

The flags read as a sentence: `-t` TCP, `-l` only listening sockets, `-n` don't translate numbers into
service names, `-p` show the process. The last column is the answer: the program is `python3` and its
**PID** (process ID — the number the operating system uses to refer to one running program) is 8. No
`sudo` needed; `-p` fills that column in for processes you own, and leaves it blank for other people's.

macOS has no `ss` — it is a Linux tool. Use `lsof -i :8000` there, adding `-P` to stop it renaming port
numbers into service names and `-n` to stop it renaming addresses into hostnames.

Now stop the owner: switch to its terminal and press `Ctrl-C`. It prints
`Keyboard interrupt received, exiting.` and 8000 is free.

## `Permission denied` on port 80

Port 80 is the official HTTP port, so it is tempting to try. On your own account it fails:

```
PermissionError: [Errno 13] Permission denied
```

Python raises it from the line `self.socket.bind(self.server_address)` — the moment the program asks the
operating system for the port — and exits with code 1. This is not a bug, and not about file
permissions on `index.html`. It is a rule about the port number. Linux's `ip(7)` manual states it:

> "The port numbers below 1024 are called privileged ports (or sometimes: reserved ports).  Only a
> privileged process (on Linux: a process that has the CAP_NET_BIND_SERVICE capability in the user
> namespace governing its network namespace) may bind(2) to these sockets."

The threshold is 1024, and that split is a long-standing Unix convention: a port everyone's software
trusts should not be claimable by any program a normal user runs. On Linux the boundary is a kernel
setting you can read — `net.ipv4.ip_unprivileged_port_start = 1024`. That setting is
**Linux-specific**; macOS has no such knob, so don't go looking for it there. Take 1024 as the
convention, and the Linux value as the one place it is written down as a number.

8000 is above 1024. That is the entire reason this course uses it.

## The one that looks like success

Here nothing fails. The banner appears exactly as it should:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

No error, no exit code. Then the phone shows a list of file names instead of your site.

> **Wait — the server started. Why am I looking at a list of files?**
> Because the server is doing what it was told, and you told it something other than you meant.
> `http.server` serves **the directory it was started in**: "By default, the server uses the current
> directory." If you were standing in your home directory when you ran it, that is what the phone is
> browsing. And when a request maps to a directory, it "is checked for an index page as specified by
> `index_pages`" — defaulting to `("index.html", "index.htm")` — and "if found, the file's contents are
> returned; otherwise a directory listing is generated." A listing means: *I looked here, and there was
> no `index.html` here.*

Confirm it from the laptop, without touching the phone:

```
$ curl -I http://localhost:8000/index.html
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Content-type: text/html
Content-Length: 31
```

`200 OK` with a `Content-Length` means the file is really there. A `404` means the server is looking in
the wrong place. There is even a fingerprint in the header: a real `.html` file returns
`Content-type: text/html`, while the generated listing returns `Content-type: text/html; charset=utf-8`.

The fix is to `cd ~/projects/first-site` before starting, or to pass `--directory` and name it.

## The firewall

A **firewall** is software that decides which incoming connections your machine accepts. It is the
invisible cause: when it blocks you, nothing on your laptop reports anything. The server sits there
happily and the packets never arrive.

Do not assume its state — **check your machine's**. On Windows, Microsoft documents the behaviour: "The
default behavior of Windows Firewall is to: - block all incoming traffic, unless solicited or matching
a *rule* - allow all outgoing traffic, unless matching a *rule*." And a Wi-Fi network your machine
hasn't identified gets the strictest treatment: the public profile "is the default profile for
unidentified networks." Check which profile you are on with `Get-NetConnectionProfile`.

On macOS, be honest about what is knowable: Apple documents the firewall's settings and its alert, but
does not publish whether it is on by default. Open your Mac's firewall settings and read the state off
the screen rather than guessing. If it is on and you have never allowed this program, you get the
dialog Apple describes: "When your Mac detects an attempt to connect to an app you haven't added to the
list and given access to, an alert message appears asking if you want to allow or deny the connection
over the network or internet." Notice what it names — the Python interpreter, not `first-site` and not
your page. It reads like a dialog about something you didn't start. It isn't.

One Super User post ends: "First I switched off the firewall then I was able to request the site from
another device." Their address had been right all along.

## The ordered procedure

Guessing wastes the most time when three causes produce the same blank browser. Ask these in order;
each answer eliminates a class.

| # | Question | How you answer it | What a "no" means |
| --- | --- | --- | --- |
| 1 | Is the server running? | `ss -tlnp` (Linux) or `lsof -i :8000` (macOS) — look for `0.0.0.0:8000` | It exited. Read its last line: `Address already in use` or `Permission denied`. |
| 2 | Is it serving the right directory? | `curl -I http://localhost:8000/index.html` on the laptop | A `404`, or a listing — you started it in the wrong folder. |
| 3 | Is the phone using the LAN IP? | Read the phone's address bar | `localhost` on a phone means *the phone*. It must be the laptop's LAN address, plus `:8000`. |
| 4 | Refusal or timeout? | `curl` the address the phone is using | See below — this is a timing question. |

Step 4 separates the last two causes, and the tell is **how long the failure takes**, not what it says:

- **Instant failure.** `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to
  server`, exit code 7. Add `-v` and the real reason appears: `Connection refused`. Something answered
  immediately to say no — the machine is reachable, nothing is listening on that port.
- **A hang, then failure.** `curl: (28) Operation timed out after 4002 milliseconds with 0 bytes
  received`, exit code 28. Nobody answered at all. The packets went out and vanished, which is what a
  firewall dropping traffic looks like from outside — and what a wrong address looks like too.

Instant means *nothing listening*. A hang means *something is swallowing the packets*. Running that
check before changing anything is the difference between debugging and retrying.

```widget
{
  "type": "order",
  "title": "Work the ladder, not a hunch",
  "prompt": "Three different causes produce the same blank browser. Put the four checks in the order that eliminates a whole class each time.",
  "items": [
    "Is the server still running at all? — `ss -tlnp`",
    "Is it serving the right directory? — `curl -I http://localhost:8000/index.html`",
    "Is the phone using the laptop's LAN IP, not `localhost`?",
    "Refusal or timeout? — time how long `curl` takes to fail"
  ],
  "caption": "Cheapest and most local first. Every step you can answer on the laptop comes before any step that needs the phone."
}
```

You can now name each failure by its own text, find the process that owns a port, and work a fixed
order instead of a hunch. One case stays out of scope: if your Linux runs inside Windows through WSL,
every step above can pass while the phone still gets nothing. That is the next topic.
