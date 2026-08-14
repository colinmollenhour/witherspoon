# Flashcards — Your machine has an address

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** Linux command that prints this machine's IPv4 addresses.

**Back:** `ip -4 addr`. On WSL, run the same command inside Ubuntu.

---

**Front:** You ran `ip -4 addr`. Which `inet` line do you write down?

**Back:** The one that is not `127.0.0.1`. That other number is the LAN address.

---

**Front:** `127.0.0.1`

**Back:** This computer talking to itself. The whole `127.0.0.0/8` block is loopback and must not appear outside a host.

---

**Front:** `10.0.0.0/8`

**Back:** Private block `10.0.0.0`–`10.255.255.255`. First number is `10`.

---

**Front:** `172.16.0.0/12`

**Back:** Private block `172.16.0.0`–`172.31.255.255`. A first number of `172` is not enough — the second must sit between `16` and `31`.
