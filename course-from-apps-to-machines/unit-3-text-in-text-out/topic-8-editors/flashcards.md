# Flashcards — Editing in place: nano, VS Code, and how to escape vim

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `nano`

**Back:** A text editor that runs inside your terminal window, so you can change a file without leaving the directory you are standing in.

---

**Front:** You have just finished changing a line in nano. What saves it?

**Back:** `Ctrl-O` — shown on the bottom bar as `^O Write Out`. nano then asks you to confirm the filename; press Enter.

---

**Front:** `Ctrl-X` in nano

**Back:** Exit — closes nano and gives you your shell prompt back. With unsaved changes, nano asks whether to save before it leaves.

---

**Front:** A command dropped you into vim and typing is doing strange things. Get out.

**Back:** Press `Esc`, then type `:q!` and press Enter — quit, discarding unsaved changes.

---

**Front:** `code .`

**Back:** Opens Visual Studio Code on the current directory — the whole folder, with a sidebar listing everything in it.

---

**Front:** Why do editors open a *folder* rather than a single file?

**Back:** Because a project is a directory tree, not a file. Given the folder, the editor knows what else exists and what a file sits next to; given one bare file, it knows nothing else.

---

**Front:** `which nano`

**Back:** The check to run before relying on nano. A path back means it is installed; nothing back means it is not on this machine.

---

**Front:** `vi`

**Back:** The editor Unix-like systems ship as a matter of course — the one you fall back on when `which nano` comes up empty and you cannot count on anything else being installed.
