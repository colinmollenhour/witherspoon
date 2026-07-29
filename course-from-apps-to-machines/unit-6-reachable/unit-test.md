# Unit 6 test — Reachable: from your laptop to the whole house

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Assesses:** Assesses why `localhost` fails on a second device and what the access log proves about it; `0.0.0.0` as a bind instruction versus `127.0.0.1` as an address, read off the server's own banner; finding the LAN IP per platform and loading it from a second device; diagnosing `Address already in use` and finding the process that owns a port; why port 80 is refused and 8000 is not; the ordered diagnostic for "the phone still can't reach it", including refusal versus timeout; why a WSL 2 server is unreachable by default; the mirrored-mode fix and the Hyper-V firewall rule it requires; and why a private address stops at your front door, with what hosting would add.

**Passing score:** 70%

## Question 1

**Type:** MULTIPLE_CHOICE

Your laptop is serving your page. Your phone is on the same Wi-Fi. You type `http://localhost:8000`
into the phone's browser and get an error page. Before you change anything, you look at the terminal
on the laptop where the server is running. What do you expect to find there?

- A new log line whose first field is your phone's address, followed by `404`, because the laptop answered but had nothing at that path
- A new log line beginning `127.0.0.1`, because the phone's request arrives at the laptop as loopback
- No new line at all, because the phone answered its own question and no packet ever left it
- A new log line showing the request was refused, because the laptop's firewall rejected it before the server could reply

**Correct option index:** 2

**Explanation:**

The log stays silent, and that silence is the diagnosis. `localhost` is resolved from
a local file before any network lookup happens, and it maps to `127.0.0.1`, which RFC 1122 describes
as the "Internal host loopback address" whose "Addresses of this form MUST NOT appear outside a
host." Your phone therefore asked *itself* for port 8000, found nothing listening, and stopped. The
first option imagines a request that arrived; nothing arrived. The second treats `127.0.0.1` as a
shared address that travels between machines — it never leaves the machine that spoke it, and RFC
6890 marks the whole `127.0.0.0/8` block `Forwardable | False`. The fourth invents a firewall event,
but a firewall on the laptop could only act on packets that reached the laptop, and this server never
wrote a line because it was never asked anything (objective 1).

## Question 2

**Type:** MULTIPLE_CHOICE

Your server's terminal shows `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`. A
classmate looks at it and says: "There's your problem — it's bound to `0.0.0.0`, so it only talks to
itself. Restart it bound to your LAN IP and the phone will work." What is wrong with that advice?

- `0.0.0.0` is a bind instruction meaning "accept connections arriving on any interface", so the server already accepts the phone's connections and nothing needs changing
- Nothing is wrong; the server must be rebound before any other machine can connect to it
- `0.0.0.0`, `127.0.0.1` and `localhost` are three spellings of the same thing, so rebinding changes nothing either way
- The banner prints `0.0.0.0` as a placeholder; the server is really bound to `127.0.0.1`, so the fix is right but for the wrong reason

**Correct option index:** 0

**Explanation:**

`0.0.0.0` is not a destination and never was — it answers "what should I listen on",
not "who should I talk to". Python's documentation is flat about the default: "By default, the server
binds itself to all interfaces", and `ss -ltn` confirms it from outside the server with
`LISTEN 0 5 0.0.0.0:8000`. The server has been reachable from the phone since the moment it started;
the phone was handed the wrong address. The second option gets the mechanism backwards. The third is
the three-way conflation that a single Stack Overflow question has drawn 379,882 views: an address, a
name for that address, and a bind instruction are three different kinds of thing. The fourth invents a
lie in the banner — the banner is reporting the real bind address, which is why re-reading it is a
useful thing to do (objective 2).

## Question 3

**Type:** SHORT_ANSWER

In Unit 4 you ran `cat /etc/hosts` on your laptop and read this line:

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
```

and you checked the resolution order, where `files` comes before `dns`:

```
hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname
```

A classmate on a Mac has just typed `http://localhost:8000` into their phone and got nothing. Using
those two facts from Unit 4, explain what their phone actually did. Then say what they should type
instead, and name the commands that would find it on their machine.

**Sample answer:**

Their phone has its own copy of that mapping, and because `files` is consulted
before `dns`, the phone answered the name itself instead of asking the network: `localhost` became
`127.0.0.1`, which means "this machine" on whichever machine is asking. So the phone looked for port
8000 on the phone, found nothing, and gave up — no packet went to the laptop, and the laptop's access
log has no line for the attempt. What they need is an address that means *the laptop* from somewhere
else: the laptop's LAN IPv4, typed as `http://<that address>:8000`, with `:8000` included because the
server is not on a standard port. On a Mac they find it with `networksetup -listallhardwareports` to
identify the Wi-Fi interface, then `ipconfig getifaddr en0` — substituting whatever interface the
first command named, because Wi-Fi is not reliably `en0` — and the result should fall in one of RFC
1918's private ranges.

**Explanation:**

A grader must see four things. First, that `/etc/hosts` is consulted *before* DNS,
which is why the phone never asked the network. Second, that `127.0.0.1` is per-machine — the phone
resolved the name to itself, not to the laptop. Third, the replacement: the laptop's LAN IPv4 with
`:8000` still attached, since the port is only omitted for the standard ones. Fourth, the macOS
commands in the right order, with the reason there are two: `ipconfig getifaddr` needs an interface
name, "The output will be empty if no service is currently configured or active on the interface", and
Apple Silicon Macs have been observed reporting Wi-Fi as `en2`. An answer that reaches for `ip addr`
here has missed that macOS has no `ip` command at all (objectives 1, 3).

## Question 4

**Type:** MULTIPLE_CHOICE

You come back to your laptop, `cd ~/projects/first-site`, run `python3 -m http.server 8000`, and get
no banner — just `OSError: [Errno 98] Address already in use`, and the command exits. A friend on a
Mac hits the same wall, with the same words after a different number: `[Errno 48]`. What is the right
next move?

- Use port 8001 instead, since 8000 has been broken and will need time to recover
- Find which process is holding the port — `ss -tlnp` on Linux, `lsof -i :8000` on macOS — and stop it
- Re-run the command with `sudo`, since "already in use" is the operating system denying you access to the port
- Restart the machine, since two platforms reporting different numbers for one condition means the network stack is in an inconsistent state

**Correct option index:** 1

**Explanation:**

The error is a statement about ownership: exactly one program may hold a given port
at a time, and something already holds 8000 — most often a server you started in another tab and
forgot. So you ask who. `ss -tlnp` answers it directly:
`LISTEN 0 5 0.0.0.0:8000 0.0.0.0:* users:(("python3",pid=8,fd=4))` — the flags read as a sentence,
`-t` TCP, `-l` listening, `-n` no name translation, `-p` show the process — and no `sudo` is needed,
because `-p` fills that column in for processes you own. Then `Ctrl-C` in that process's terminal
frees the port. The first option is the "the port is broken" reading behind a question with 1,833,924
views; ports do not break, and moving to 8001 leaves the old server still running. The third confuses
this with the *other* error, `PermissionError: [Errno 13] Permission denied`, which is about privilege
and would not be fixed by a port that is simply occupied. The fourth over-reads the errno difference:
98 on Linux and 48 on macOS are two operating systems' internal codes for the same condition, which is
exactly why you match on the words and not the number (objective 4).

## Question 5

**Type:** TRUE_FALSE

`python3 -m http.server 80` fails with `PermissionError: [Errno 13] Permission denied` because the
file permissions on `index.html` are too restrictive for a port that low, while port 8000 works
because it does not check them.

**Correct answer:** false

**Explanation:**

No file is involved. Python raises that error from `self.socket.bind(self.server_address)`
— the moment the program asks the operating system for the port, before any request has arrived and
before `index.html` has been opened at all — and exits with code 1. The rule is about the port number:
Linux's `ip(7)` manual states that "The port numbers below 1024 are called privileged ports (or
sometimes: reserved ports).  Only a privileged process (on Linux: a process that has the
CAP_NET_BIND_SERVICE capability in the user namespace governing its network namespace) may bind(2) to
these sockets." The threshold, 1024, is a long-standing Unix convention; on Linux it is also a kernel
setting you can read as `net.ipv4.ip_unprivileged_port_start = 1024`, though that particular knob does
not exist on macOS. 8000 is above 1024, which is the entire reason this course serves there
(objective 5).

## Question 6

**Type:** MULTIPLE_CHOICE

Your phone shows nothing. You work the ordered procedure on your laptop and everything passes:
`ss -tlnp` shows `0.0.0.0:8000` listening, `curl -I http://127.0.0.1:8000/index.html` returns
`HTTP/1.0 200 OK` with a `Content-Length`, and the phone's address bar reads `http://192.168.1.42:8000`
— exactly the address the laptop reports for its Wi-Fi interface. You then `curl` that same URL from a
second laptop on the same Wi-Fi. It sits there, and then:
`curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`. What does that point
at?

- The address must be wrong, because a failure to connect always means the address does not name the right machine
- Nothing is listening on 8000, since a timeout is what a closed port produces
- The server is serving the wrong directory, which is why the second laptop receives no content
- Something is dropping the packets instead of answering — with the first three checks already passed, a firewall is the remaining suspect

**Correct option index:** 3

**Explanation:**

The tell is *how long the failure took*, not what it said. A machine that is reachable
with nothing listening answers immediately to say no:
`curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server`, exit code 7,
with `Connection refused` visible under `-v`. A hang and then exit 28 means nobody answered at all —
the packets went out and vanished, which is what dropping looks like from the outside. The second
option has the timing exactly backwards. The first is the reflex that sends people back to re-checking
an address that was right all along; one Super User answer ends "First I switched off the firewall then
I was able to request the site from another device." The third is ruled out by check 2: a wrong
directory still answers, with a `404` or a directory listing, and answering is precisely what did not
happen here (objective 6).

## Question 7

**Type:** MULTIPLE_CHOICE

You are running your server inside WSL. You work the whole ordered procedure and every check passes:
`ss -tlnp` shows `0.0.0.0:8000`, `curl -I` inside WSL returns `HTTP/1.0 200 OK`, your Windows browser
loads `http://localhost:8000` perfectly, and the phone's address bar holds the address `ip addr`
reported inside WSL. The phone still gets nothing. What is actually going on?

- WSL cannot run network servers, so the checks passing is coincidental
- `ip addr` inside WSL reported the virtual machine's own address, not the address your phone can reach, and nothing arriving from outside is routed into WSL by default
- The server is bound to `127.0.0.1` and has to be rebound to `0.0.0.0` before any other machine can connect
- Windows loading `localhost` proves the network path is fine, so the remaining fault must be on the phone

**Correct option index:** 1

**Explanation:**

WSL 2 runs Linux in a virtual machine with its own network, so "what is this
machine's IP address?" has two correct answers on that computer and you were handed the wrong one.
Microsoft says it directly: "This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet
adapter with its own unique IP address. Currently, to enable this workflow you will need to go through
the same steps as you would for a regular virtual machine." That is also why two of your checks were
never going to catch it: Windows forwards `localhost` inward — "you can access it from a Windows app
(like your Edge or Chrome internet browser) using `localhost` (just like you normally would)" — and
`curl` inside WSL never leaves the virtual machine. The first option is wrong and the checks prove it:
a server is running and answering. The third is the reflex fix that does nothing here, because
`python3 -m http.server` already "binds itself to all interfaces" — exactly what Microsoft says a
LAN-reachable app needs. The fourth reads a passing `localhost` test as evidence about the LAN, which
is the mistake behind a question with 364,943 views: `localhost` and the LAN are different paths, and
only one of them was ever tested (objectives 6, 7).

## Question 8

**Type:** MULTIPLE_CHOICE

You put this in `%UserProfile%\.wslconfig`:

```
[wsl2]
networkingMode=mirrored
```

You restart the subsystem, wait for it to fully stop and come back, and now `ip addr` inside WSL
reports the same address `ipconfig.exe` does. The phone still cannot load the page. What is the
documented next step?

- Nothing further is documented — mirrored mode alone makes WSL LAN-reachable, so re-check the URL on the phone
- Run `netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=(wsl hostname -i)` from an admin prompt
- In a PowerShell window with admin privileges, run `New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 8000`
- Restart the server with a `--bind` flag naming the Windows address, since the addresses now match

**Correct option index:** 2

**Explanation:**

There is a second firewall in front of the virtual machine, and "on machines running
Windows 11 22H2 and higher, with WSL 2.0.9 and higher, the Hyper-V firewall feature will be turned on
by default" — so mirrored mode gets the addressing right and still leaves inbound traffic blocked.
Microsoft's documented rule, to be run "in PowerShell window with admin privileges", is verbatim:
`New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound
-VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 80` — the example
opens 80, and the one thing you change is the port your server is actually on. The braced string is
the WSL VMCreatorId, `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`; a mistyped GUID makes a rule that
silently matches nothing. The first option stops one step short of the documented procedure. The
second is the Windows 10 fallback for machines that cannot use mirrored mode at all, and it carries a
second error Microsoft flags explicitly: "`wsl hostname -i` is your local machine (127.0.1.1 is a
placeholder diagnostic address), whereas `wsl hostname -I` will return your local machine's IP address
as seen by other machines" — lowercase forwards to a placeholder. The fourth changes a binding that
was never wrong (objective 8).

## Question 9

**Type:** SHORT_ANSWER

Your page finally loads on your phone at `http://192.168.1.42:8000`. You text that exact URL to a
friend across town and ask them to open it. They get nothing — no page, and no new line in your access
log. Explain why, and name what a hosting provider would sell you that would change the answer.

**Sample answer:**

`192.168.1.42` is in RFC 1918 private space — `192.168.0.0 - 192.168.255.255
(192.168/16 prefix)` — and anyone may use those addresses without coordination, so they are not
unique. My friend's phone asked their own network for `192.168.1.42` and got an honest answer about a
completely different machine on their side of town, probably not a web server at all. Nothing failed:
the address simply means something local, and it means a different thing there. NAT is what lets my
laptop reach outward from behind such an address, but there is nothing for their network to translate
inward, and nobody outside can name my laptop in the first place. A hosting provider would sell three
things: a publicly routable address that is mine alone, a persistent name that keeps pointing at it,
and a machine that stays running when my laptop's lid closes.

**Explanation:**

A grader must see three elements. First, that the failure is about *private
addressing*, not about a typo, a firewall, or the server being off — the RFC 1918 quote and the
no-coordination consequence, "An enterprise that decides to use IP addresses out of the address space
defined in this document can do so without any coordination with IANA or an Internet registry", which
is why the same address exists on their network too. Second, the direction of NAT: outward works,
inward has nothing to remember. Third, all three things hosting supplies — a public address, a
persistent name, and a machine that stays up; naming only the address misses that a laptop that sleeps
is equally fatal. The common wrong answer is that a `192.168.x.x` address is globally reachable and
something is merely blocking it, which reverses the whole point: nothing is blocking it, because it was
never a request for my machine. Worth adding, though not required: `python3 -m http.server` is not what
you would put on that public machine anyway — "http.server is not recommended for production. It only
implements basic security checks" (objectives 3, 9).
