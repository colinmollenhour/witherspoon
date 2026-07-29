# Flashcards — You are not supposed to memorise this

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** You have typed `cd ~/pro` and you do not want to type the rest of `~/projects/first-site/`.

**Back:** Press **Tab**. The shell completes the name from what actually exists on the disk — and completes nothing if the name is not there.

---

**Front:** You ran a long command, it failed on one wrong character, and you do not want to retype it.

**Back:** Press the **Up arrow** to bring the command back at the prompt, then edit that character and press Enter.

---

**Front:** `history`

**Back:** Prints the commands you have run in this shell, for anything further back than a few presses of Up.

---

**Front:** `--help`, as in `ls --help`

**Back:** The quick answer — prints a short summary of the command's options to the screen and gives you your prompt straight back.

---

**Front:** `man`, as in `man ls`

**Back:** The full answer — opens the command's manual page, which takes over the whole screen.

---

**Front:** A manual page has filled your screen and is sitting there waiting for you. What do you press?

**Back:** `q` — the exit key for `man`, the same one that quits `less`.

---

**Front:** A command is still running: scrolling output forever, or not coming back. What do you press?

**Back:** `Ctrl-C` — hold Ctrl and press C. It interrupts the running program and returns your prompt.

---

**Front:** `which python3`

**Back:** Prints the absolute path of the program the shell would actually run for that name, by searching the same `$PATH` the shell searches.

---

**Front:** `$PATH`

**Back:** The list of directories the shell searches, in order, when you type a bare command name. A name not found in any of them produces `command not found`.

---

**Front:** A tutorial shows `$ ls -la ~/projects/first-site`. What is the leading `$`?

**Back:** The prompt, not part of the command — "The `$` character in tutorials indicates a command prompt. It is not meant to be typed in." Delete it before running (or `%`, on zsh).
