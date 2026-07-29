# Flashcards — Pipes: connecting programs to each other

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `|`

**Back:** Sends the stdout of the program on its left into the stdin of the program on its right, while both run.

---

**Front:** stdin

**Back:** The text a program reads when you do not hand it a filename — what arrives through a pipe.

---

**Front:** The thing you want the output to go to is a program, not a filename. `|` or `>`?

**Back:** `|`. `>` expects a filename, so it would create a file named after that program instead of running it.

---

**Front:** `history | less`

**Back:** Pages a command's output one screen at a time instead of letting it scroll away; `q` quits.

---

**Front:** `echo`

**Back:** Prints its argument to stdout and does nothing else.

---

**Front:** `echo "<h1>Hello from the terminal</h1>" >> index.html`

**Back:** Adds that exact line to the end of `index.html` without opening an editor and without erasing what is already there.

---

**Front:** What does a pipeline leave behind when it finishes?

**Back:** Nothing — not even a temporary file. The connection only exists while the programs are running.

---

**Front:** Name what each stage of `ls -la ~/projects | grep site | wc -l` is handed.

**Back:** `ls` is handed a path; `grep` is handed `ls`'s listing lines; `wc -l` is handed only the lines `grep` kept.
