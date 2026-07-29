# Flashcards — When it doesn't work

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `Address already in use`

**Back:** Another program already holds that port — one program per port at a time. It is a statement
about ownership, not about the port being broken.

---

**Front:** The same failure prints `[Errno 98]` on your Linux laptop and `[Errno 48]` on your friend's Mac. Which part do you match on?

**Back:** The words — `Address already in use`. The number is the operating system's internal code and
differs by platform; the sentence is the condition.

---

**Front:** `PermissionError: [Errno 13] Permission denied`, raised from `self.socket.bind(self.server_address)`

**Back:** The program asked for a port it is not allowed to have. It fails at the moment of binding the
port, so it is nothing to do with file permissions on `index.html`.

---

**Front:** 1024

**Back:** The privileged-port threshold. Below it, `ip(7)`: "Only a privileged process ... may bind(2)
to these sockets." Above it — like 8000 — any normal user's program can bind.

---

**Front:** In `users:(("python3",pid=8,fd=4))`, which number do you need, and what is it?

**Back:** `pid=8` — the process ID, the operating system's handle for the one running program that
currently owns the port.

---

**Front:** You are on a Mac and `ss -tlnp` prints nothing useful. Why, and what do you run instead?

**Back:** `ss` is a Linux tool that does not exist on macOS. Run `lsof -i :8000` — with `-P` to keep
port numbers as numbers and `-n` to keep addresses as addresses.

---

**Front:** The phone shows a list of file names instead of your page. What has the server told you?

**Back:** "I looked in the directory I was started in, and there was no `index.html` there." The
listing is generated only when no index page is found.

---

**Front:** `curl` fails **instantly** with exit code 7 vs. `curl` **hangs** and then fails with exit code 28

**Back:** Instant = something answered "no" (`Connection refused`) — nothing is listening on that port.
A hang = nobody answered at all — packets are being dropped, which usually means a firewall.

---

**Front:** `Ctrl-C`

**Back:** Stops the running server and frees its port. It prints
`Keyboard interrupt received, exiting.`

---

**Front:** Your phone can't reach the page. What do you check first, before touching anything?

**Back:** Whether the server is still running at all — `ss -tlnp` or `lsof -i :8000`, looking for
`0.0.0.0:8000`. If it exited, its last line names the reason.
