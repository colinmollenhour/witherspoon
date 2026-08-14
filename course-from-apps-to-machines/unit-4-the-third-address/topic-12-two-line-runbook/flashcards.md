# Flashcards — A two-line runbook

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** Start command in the two-line runbook.

**Back:** `cd ~/projects/first-site`, then `python3 -m http.server 8000`.

---

**Front:** Stop the server.

**Back:** Ctrl-C. It prints `Keyboard interrupt received, exiting.`

---

**Front:** `OSError: [Errno 98] Address already in use` — what now?

**Back:** Door 8000 is taken. Find the owner with `ss -tlnp` and stop it. The machine is not broken.

---

**Front:** Same in-use error on a Mac. Which number, and which command?

**Back:** Errno 48. Find the owner with `lsof -iTCP -sTCP:LISTEN -P -n`.

---

**Front:** Why does `python3 -m http.server 80` print `PermissionError: [Errno 13] Permission denied`?

**Back:** Port 80 is privileged — below 1024. An ordinary program cannot claim it. Use 8000.
