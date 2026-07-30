# From Apps to Machines: Files, the Terminal, and the Web Under the Hood

Start with a file you can only open by double-clicking. Finish with that same page loading on your phone across the room — no coding required.

---

## About

If you grew up on a phone or tablet, you never had to know where a file *is*. You searched, and it appeared. That habit works until you open a terminal — then it fails completely. The shell cannot search for you. You have to tell it exactly where to look. That is not a personal failing; it is how a whole generation learned computers. This course closes the gap in a straight line. You start with one file that only you can open, at `file:///home/you/projects/first-site/index.html`. You finish with the same file answering over HTTP on port 8000 — a real `HTTP/1.0 200 OK` — and loading on your phone across the room.

You build one thing and carry it the whole way. Unit 1: create `~/projects/first-site/index.html` with a mouse and notice how many clicks it took. Unit 2: delete it and rebuild it from the keyboard in eight commands or fewer. Unit 3: stop typing it at all and generate it with `>` and `|`. Unit 4: look at the machine itself — its LAN IP, which private range it sits in, and what is listening on which ports. Unit 5: read the HTTP conversation, start `python3 -m http.server 8000`, watch your page come back with a status code — then try your phone, and watch it fail. Unit 6 is why, the fix, and what it takes to go further.

You need a Mac, a Linux machine, or Windows with WSL; a phone on the same Wi-Fi; and no prior experience. You do not need to code, and this course does not teach coding — HTML is just a text file a browser happens to render. Every number, command, error message, and quoted claim traces to a primary source in [`SOURCES.md`](SOURCES.md). Where something could not be checked, the course says so rather than guessing.

---

## What you'll be able to do

**Locate any file** — Write the full path to any file on your machine and walk there from a terminal — no file manager required.

**Drive a machine by keyboard** — Create, move, read, search, and delete files from the shell, and look up any command you do not know instead of memorising it.

**Turn commands into files** — Catch command output with redirection and chain programs with pipes so files are generated rather than typed.

**Read your own network** — Find your machine's LAN IP, name which private range it belongs to, and list every program listening on every port.

**Read an HTTP conversation** — Take any URL apart, run `curl -v` against any site, and tell from a status code whether the problem is yours or the server's.

**Serve and reach a page** — Run a real web server on your machine, load it on a second device on your network, and diagnose it yourself when it does not.

---

## Syllabus

### Unit 1 — Where your stuff actually lives
On a phone, a file hides inside an app. On a laptop, every file has one written address. This unit plants that idea, gets a terminal open, and leaves you holding a real path you can say out loud.

1. **A tablet hides the filesystem; a dev machine hands it to you** — `/Users/you`, `/home/you`, WSL and `/mnt/c`
2. **Paths: every file has an address** — absolute vs relative, `~` `.` `..`, case sensitivity
3. **A file is bytes; the extension is only a hint** — reading `ls -la`, permissions, dotfiles

**Project: Ground Zero** — build `~/projects/first-site/index.html` with the mouse, record its
absolute path and its `file://` URL, and count how many clicks it took.

### Unit 2 — Driving the machine from the keyboard
The shell always stands in exactly one folder. Once you feel that, you can build, move, read, and clean up without reaching for the mouse — and you stop memorising commands you can look up.

4. **The shell always stands somewhere** — `pwd`, `ls`, `cd`, and why `ls` prints differently in different places
5. **Making, moving, and destroying** — `mkdir -p`, `touch`, `cp`, `mv`, `rm` (no trash, no undo)
6. **Reading files without opening an app** — `cat`, `less`, `head`, `wc -l`, `grep -rn`
7. **You are not supposed to memorise this** — Tab, history, `man`, `Ctrl-C`, `which`, `$PATH`

**Project: Cold Start** — delete the folder and rebuild it from nothing, terminal only, in eight
commands or fewer.

### Unit 3 — Text in, text out
Command output used to scroll by and vanish. Now it becomes material you keep: redirect it into files, pipe it between programs, and generate your page instead of typing it.

8. **Editing in place** — `nano`, `code .`, and how to escape `vim`
9. **Redirection** — `>` vs `>>`, stdout vs stderr, `/dev/null`
10. **Pipes** — `|`, and generating the page instead of typing it

**Project: Generated Page** — build `index.html` and a `MANIFEST.txt` entirely from command output.

### Unit 4 — Machines have addresses
Files have addresses. So do machines. Find your LAN IP, see what is listening, and learn the two questions every network failure comes down to: is the machine there, and is anything answering?

11. **IP addresses** — RFC 1918 private ranges, `127.0.0.1`, why NAT hides you
12. **Names become addresses** — DNS, `dig +short`, `/etc/hosts`, why `localhost` resolves
13. **Ports: one address, many doors** — 1–65535, ports 80/443/22, `ss -tlnp`
14. **Poking at the network** — `ping`, `curl`, and telling a closed port from an unreachable host

**Project: Network Self-Portrait** — map your own machine's place on the network and prove loopback
is not your LAN address.

### Unit 5 — HTTP: reading the conversation, and joining it
HTTP is plain text — and by now you read plain text well. Take a URL apart, watch a real request and response, start your own server, and hit the wall that makes Unit 6 necessary.

15. **Anatomy of a URL** — scheme, host, port, path, query, fragment; what `file://` has no room for
16. **Request and response** — `GET / HTTP/1.1`, the `Host:` header, `curl -v`, `curl -I`
17. **Status codes and headers** — 200/301/304/404/500, `Content-Type`, and the DevTools Network tab
18. **Your first server** — `python3 -m http.server 8000`, the access log, and a wall

**Project: HTTP Field Notes** — capture and annotate three real HTTP exchanges, including your own.

### Unit 6 — Reachable: from your laptop to the whole house
Your laptop can already see the page. Your phone cannot — yet. Fix that on your own Wi-Fi, build a short runbook so you can do it again, and see where your home network ends.

19. **Loopback versus the network** — `0.0.0.0` vs `127.0.0.1`, your LAN IP, the phone finally loads it
20. **When it doesn't work** — `Address already in use`, `Permission denied` on port 80, firewalls
21. **WSL, and the shape of real hosting** — mirrored mode, the Hyper-V firewall rule, and what hosting sells

**Capstone: Live on Your Network** — serve the page to a second device and prove it with the server's
own access log, then write the runbook.

---

## FAQ

**What makes this different from the free tutorials?**
Every treatment we surveyed starts one step past where you are and stops one step short of the payoff.
MIT's Missing Semester assumes a Computer Science education in progress and has no networking lecture
at all. CS50 puts you in a browser-based container specifically so you never touch your own machine.
Codecademy and freeCodeCamp teach `pwd` and `cd` as vocabulary inside an in-browser terminal, so you
never find out that the shell has a location. Google's IT certificate teaches networking bottom-up
from cables, three courses before it mentions a filesystem, and never joins the two. MDN's local-server
page is the closest thing that exists, and it opens with "You need to first know how the Internet works,
and what a Web server is" — and never mentions reaching your server from another device. Nobody walks
you across the one bridge that makes all of it click: a file on your disk, opened as `file://`, then
served at `http://localhost:8000`, then loaded on your own phone at `http://192.168.x.x:8000`. Same
file, three addresses. That bridge is this entire course rather than a footnote to a coding curriculum.

**Do I need to know how to code?**
No, and you won't learn to here. `index.html` is treated throughout as a text file that a browser
happens to render — you never learn HTML as a language. What you learn is everything a developer
absorbs *around* the code in their first couple of years and never explicitly teaches anyone.

**What hardware and software do I need?**
A Mac, a Linux machine, or Windows 10 build 19041+ / Windows 11 with WSL set up from the GUI path in
Unit 1 (enable the virtualisation features, then install Windows Terminal and Ubuntu from the
Microsoft Store — WSL is not pre-installed). A phone or second computer on the same Wi-Fi for the
capstone. If you're on macOS, note that macOS ships no Python runtime at all — typing `python3`
pops a dialog asking to install the command line developer tools, so you'll run
`xcode-select --install` before Unit 5. The course tells you this in Unit 1 rather than letting you
discover it at the capstone.

**Is the Windows path as good as the Mac and Linux paths?**
Honestly, no — and the course says so where it matters. WSL 2 runs in a virtual machine with its own
network adapter, so Microsoft's own documentation states that reaching a WSL server from your LAN
"isn't the default case in WSL 2." Unit 6 gives you the documented fix (mirrored networking mode plus a
Hyper-V firewall rule) and turns the whole thing into a lesson about what "the machine's IP address"
even means. But that combination is not demonstrated end-to-end anywhere in Microsoft's docs and we had
no Windows machine to verify it on, so the capstone tells WSL learners that plainly and offers a
defined fallback rather than promising an outcome we can't stand behind.

**Why does the course make me fail on purpose?**
Because the failure is the lesson. At the end of Unit 5 your server works perfectly on your laptop and
your phone cannot load it — after you've done everything correctly. That specific confusion has drawn
well over a million views across Stack Overflow, and meeting it deliberately, with the reason named
out loud, is far better than meeting it alone at 1am and concluding you broke something.

**How is this graded?**
Six projects, each checked by scripts that parse real evidence you captured on your own machine — your
actual `curl` output, your actual access log. The tests are written to catch the plausible shortcuts:
submitting `127.0.0.1` as your LAN IP, pasting a generic `HTTP/1.1 200 OK` from a tutorial instead of
your own server's `HTTP/1.0`, or offering a log line from your own laptop as proof your phone connected.

---

## Grounding

Every load-bearing claim traces to [`SOURCES.md`](SOURCES.md) — 182 ledger rows with verbatim quotes
from RFCs, IANA registries, Python's documentation and CPython source, Apple and Microsoft platform
docs, and real captured terminal output. The **Ungrounded** section at the end of that file lists what
could not be verified and what was done about each item. Nothing in this course is written from
recall alone.
