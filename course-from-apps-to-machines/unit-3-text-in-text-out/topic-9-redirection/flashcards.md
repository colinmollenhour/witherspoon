# Flashcards — Redirection: making files out of command output

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `ls -la ~ > notes.txt` — what does the `>` do?

**Back:** Sends the command's normal output into `notes.txt` instead of the screen, creating the file
if it does not exist.

---

**Front:** `>>`

**Back:** Appends — writes the output at the end of the file and keeps everything already in it.

---

**Front:** You run `wc /etc/hosts > notes.txt` on a `notes.txt` that already has four lines of `ls` output in it. What happens to those four lines?

**Back:** They are destroyed. `>` empties (truncates) an existing file before writing, with no prompt
and no warning. `>>` would have kept them.

---

**Front:** stdout

**Back:** Stream 1 — a command's normal results, and the only stream that plain `>` captures.

---

**Front:** stderr

**Back:** Stream 2 — a command's messages about what went wrong, kept separate so they reach a human
even when the results are being redirected.

---

**Front:** `2>`

**Back:** Redirects the error stream (stderr) to a file, leaving normal output alone.

---

**Front:** `/dev/null`

**Back:** A special file that discards everything written to it — the deliberate way to throw output
away instead of storing or showing it.

---

**Front:** You typed a redirect. How do you confirm the output actually landed in the file?

**Back:** Read the file back — `cat notes.txt` to see its contents, or `wc notes.txt` for its line,
word, and byte counts.

---

**Front:** A command printed a message on your screen even though you redirected it with `>`, and the target file came out empty. What does that tell you?

**Back:** The message travelled on stderr, not stdout — so the command reported a problem rather than
producing a result, and `>` never touched it.
