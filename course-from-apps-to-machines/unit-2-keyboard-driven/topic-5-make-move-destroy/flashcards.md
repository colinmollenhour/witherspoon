# Flashcards — Making, moving, and destroying

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `mkdir first-site`

**Back:** Creates one directory named `first-site` inside the directory the shell is currently standing in. It creates only the last part of the path and no parents above it.

---

**Front:** You need `~/projects/first-site` but neither `projects` nor `first-site` exists yet. One command?

**Back:** `mkdir -p ~/projects/first-site` — the manual page: "-p, --parents" → "no error if existing, make parent directories as needed".

---

**Front:** Why is `mkdir -p` safe to run a second time, when plain `mkdir` is not?

**Back:** `-p` includes "no error if existing", so re-running it on a directory that already exists succeeds silently. Plain `mkdir` fails with `mkdir: cannot create directory '.../a': File exists`.

---

**Front:** `touch index.html`

**Back:** Creates `index.html` if it does not exist, with zero bytes in it. It does not put any content in the file.

---

**Front:** `cp index.html index.backup.html`

**Back:** Copies the file: the original stays where it is and a second copy appears under the new name.

---

**Front:** You run `cp` on a *directory* and it refuses. What is missing?

**Back:** The recursive flag: "-R, -r, --recursive" → "copy directories recursively". `cp -r first-site first-site-backup`.

---

**Front:** `mv a b` where `b` does not exist

**Back:** A rename. `a` is now called `b`, in the same place. The manual page calls this "Rename SOURCE to DEST".

---

**Front:** `mv a b` where `b` already exists as a directory

**Back:** A move. `a` keeps its own name and ends up inside `b`. The manual page calls this "move SOURCE(s) to DIRECTORY".

---

**Front:** `rm index.backup.html` — and it prints nothing

**Back:** The file is gone. `rm` prints nothing on success; silence means it worked.

---

**Front:** Name three things `rm` does **not** do.

**Back:** It does not move the file to a trash can or recycle bin, it does not offer an undo, and by default it does not remove directories at all: "By default, it does not remove directories."

---

**Front:** `rm -r` versus `rm -i`

**Back:** `-r` is "remove directories and their contents recursively" — it makes `rm` more powerful. `-i` is "prompt before every removal" — it makes `rm` ask you first.

---

**Front:** A folder is genuinely named `My Project`, with a space. Two ways to pass that to `mv`?

**Back:** Quote the whole name — `mv "My Project" first-site` — or backslash each space — `mv My\ Project first-site`. Unquoted, the shell splits on whitespace and passes two arguments.
