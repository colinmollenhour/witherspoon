# Flashcards — The shell always stands somewhere

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** You have lost track of where your shell is. Which command answers "where am I standing?"

**Back:** `pwd` — it prints the current working directory as an absolute path and changes nothing.

---

**Front:** What does `ls`, typed with no argument at all, list?

**Back:** The current directory. Its manual states the default: "List information about the FILEs
(the current directory by default)." [src 14]

---

**Front:** `cd ~/projects/first-site`

**Back:** Moves the shell into the project folder, starting from your home directory — so it works
from anywhere on the machine.

---

**Front:** `cd ..`

**Back:** Moves the shell one directory up, into the parent of where you are standing.

---

**Front:** `cd -`

**Back:** Moves the shell back to the directory it was in before the last `cd`, and prints the
directory it lands in [src 18].

---

**Front:** `cd` typed alone, with no path after it

**Back:** Moves the shell to your home directory: "If no directory operand is given and the HOME
environment variable is set to a non-empty value, the cd utility shall behave as if the directory
named in the HOME environment variable was specified as the directory operand." [src 17]

---

**Front:** Current working directory (cwd)

**Back:** The one directory your shell is standing in right now, and the point every path not
starting with `/` is measured from.

---

**Front:** A prompt ending `$` versus a prompt ending `%` versus a prompt ending `#`

**Back:** `$` is bash (the Linux default), `%` is zsh (the macOS default), and `#` on either means the
shell is running as root [src 28, 30].

---

**Front:** You run `ls` in `~/projects` and again in `~/projects/first-site` and get two different lists. What changed?

**Back:** The vantage point, not the command — `ls` reports on wherever the shell is standing, and
`cd` moved it between the two runs.
