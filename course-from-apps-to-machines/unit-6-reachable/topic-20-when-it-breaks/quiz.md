# Quiz — When it doesn't work

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You run `python3 -m http.server 8000` in `~/projects/first-site`. Instead of the banner you get
`OSError: [Errno 98] Address already in use` and the command exits with code 1. What does this tell
you about your machine?

- Port 8000 is damaged and will not work again until you restart the laptop
- Some program on this machine is already holding port 8000
- Port 8000 is below the privileged threshold, so you need elevated rights to use it
- Your firewall is blocking incoming connections on port 8000

**Correct option index:** 1

**Explanation:**

A port is a numbered slot and exactly one program may hold it at a time, so this error
is a statement about ownership: something already has 8000, very often a server you started in another
terminal tab and forgot. "The port is damaged, reboot" is the most common misreading — nearly two
million people have read a single Stack Overflow question about this error, usually looking for a way
to kill something rather than repair anything, and nothing is broken. The privileged-port answer
describes a different error entirely, `PermissionError: [Errno 13] Permission denied`, and 8000 is above
1024 anyway. A firewall blocks connections arriving from elsewhere; it does not stop your own program
from claiming a port, and it would produce no message here at all (objective 4).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You are on Linux and need to know *which program* is holding port 8000 so you can stop it. Which
command answers that question?

- `ss -tln`
- `curl -I http://localhost:8000/index.html`
- `ss -tlnp`
- `python3 -m http.server 8001`

**Correct option index:** 2

**Explanation:**

`-p` is the flag that adds the process column, giving you output like
`users:(("python3",pid=8,fd=4))` — the program's name and its PID, which is exactly what you need to go
stop it. You do not need `sudo` for processes you own. `ss -tln` shows that *a* listening socket exists
on `0.0.0.0:8000` but leaves you no way to identify the owner, which is the whole question. `curl -I`
proves the server answers and tells you what it is serving, but says nothing about which process it is.
Starting a second server on 8001 sidesteps the problem instead of diagnosing it, and leaves the
forgotten server still running (objective 4).

---

## Question 3

**Type:** MULTIPLE_CHOICE

Your server started cleanly — `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`, no error.
On your phone, the LAN address loads a page listing file names, including a folder called `projects`.
What is the most likely explanation?

- The firewall is letting the connection through but stripping out the HTML
- You started the server in your home directory, so it is serving that directory and found no `index.html` there
- The phone should be using `localhost:8000` rather than the LAN address
- Port 8000 is not IANA-registered for HTTP, so the browser will not render HTML received on it

**Correct option index:** 1

**Explanation:**

`http.server` serves the directory it was started in — "By default, the server uses the
current directory" — and when a request maps to a directory with no `index.html`, "a directory listing
is generated." Seeing `projects` in the listing is the giveaway: you are one level above `first-site`.
This failure is dangerous precisely because it looks like success. The firewall option is wrong because
a firewall either lets a connection through intact or drops it; it does not edit pages. `localhost` on
a phone means the phone itself, so switching to it would make things worse, not better. And a port
number carries no meaning about content — the page arrived and rendered fine, which proves the transport
worked (objective 6).

---

## Question 4

**Type:** TRUE_FALSE

Your phone sits on a white screen for several seconds and then reports that it could not connect.
Because the failure took a while rather than happening instantly, the most likely cause is that the
server was never started.

**Correct answer:** false

**Explanation:**

The opposite is true, and the timing is the tell. When nothing is listening, the reply
is instant: `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server`,
exit code 7, with `Connection refused` visible under `-v` — the machine is reachable and answers "no"
immediately. A delay before failure looks like
`curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`, exit code 28, meaning
nobody answered at all. Packets left and vanished, which is what a firewall dropping traffic looks like
from the outside — and what a wrong address looks like too. Long wait means *something is swallowing
the packets*, not *nothing was started* (objective 6).

---

## Question 5

**Type:** SHORT_ANSWER

`python3 -m http.server 80` fails with `PermissionError: [Errno 13] Permission denied` while
`python3 -m http.server 8000` starts normally, on the same machine, in the same folder, as the same
user. Explain the difference.

below 1024 are privileged: `ip(7)` says "The port numbers below 1024 are called privileged ports (or
sometimes: reserved ports).  Only a privileged process ... may bind(2) to these sockets." Port 80 is
under that line, so my ordinary user account is refused at the moment Python calls
`self.socket.bind(self.server_address)` — which is why the error is raised there and the command exits
with code 1. Port 8000 is above 1024, so no special rights are needed. The 1024 split is a long-standing
Unix convention; on Linux the boundary is even readable as a setting,
`net.ipv4.ip_unprivileged_port_start = 1024`, though that particular knob is Linux-only and macOS has
no equivalent.

**Sample answer:**

The number is the only thing that changed, and it is the number that matters. Ports
below 1024 are privileged: `ip(7)` says "The port numbers below 1024 are called privileged ports (or
sometimes: reserved ports).  Only a privileged process ... may bind(2) to these sockets." Port 80 is
under that line, so my ordinary user account is refused at the moment Python calls
`self.socket.bind(self.server_address)` — which is why the error is raised there and the command exits
with code 1. Port 8000 is above 1024, so no special rights are needed. The 1024 split is a long-standing
Unix convention; on Linux the boundary is even readable as a setting,
`net.ipv4.ip_unprivileged_port_start = 1024`, though that particular knob is Linux-only and macOS has
no equivalent.

**Explanation:**

A grader must see three things: that the cause is the port number being below 1024,
not anything about the folder or the file; that the failure happens at bind time and so has nothing to
do with read permissions on `index.html`; and that 8000 works simply because it is above the threshold.
Mentioning that the 1024 rule is a Unix convention while the sysctl is Linux-specific is the mark of a
precise answer. The tempting wrong answer is "port 80 needs `sudo` because it is the real HTTP port" —
being the registered HTTP port is not what makes it privileged; being below 1024 is (objective 5).

---
