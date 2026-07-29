# Flashcards — Reading files without opening an app

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `cat index.html`

**Back:** Prints the whole file to the screen and hands the prompt straight back. Nothing opens; the
file is only read, never changed.

---

**Front:** `less index.html`

**Back:** Opens the file in a pager — one screenful at a time, waiting for you between screens.
Space moves forward, the arrow keys scroll.

---

**Front:** You are inside `less`, the screen is full, and your prompt is gone. How do you get out?

**Back:** Press `q`. One key, no Enter. Your prompt comes back.

---

**Front:** `cat` or `less` — when is each one right?

**Back:** `cat` when the file fits on one screen. `less` when the file is longer than the screen,
because `cat` would scroll all of it past you and leave you at the last screenful with no way back
up.

---

**Front:** `head -3 index.html`

**Back:** Prints the first 3 lines of the file. Change the number to change how many.

---

**Front:** `tail -2 index.html`

**Back:** Prints the last 2 lines of the file.

---

**Front:** `wc /etc/hosts` prints ` 7 40 384 /etc/hosts`. What are the three numbers, in order?

**Back:** Lines, words, bytes — so 7 lines, 40 words, 384 bytes.

---

**Front:** `wc -l /etc/hosts`

**Back:** Prints `7 /etc/hosts` — the line count only, with the words and bytes columns dropped.

---

**Front:** `grep -n "<title>" index.html`

**Back:** Prints every line of `index.html` containing `<title>`, with `-n` putting the line number
in front of each one.

---

**Front:** What does `-r` add to `grep`, as in `grep -rn "http" ~/projects`?

**Back:** Recursion — it searches that directory, every directory inside it, and so on all the way
down, instead of a single named file.
