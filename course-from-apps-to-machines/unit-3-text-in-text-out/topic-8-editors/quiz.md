# Quiz — Editing in place: nano, VS Code, and how to escape vim

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You are at a prompt in `~/projects/first-site/`. You need to fix one misspelled word inside
`index.html` and get straight back to the prompt. Which is the right tool for this edit?

- `code .`, because a real editor is always the correct choice over a terminal one
- `nano index.html`, because the change is one line and you are already in the directory
- `vim index.html`, because vim is the fastest editor once you know it
- `which nano`, because that is the command that opens the file for editing

**Correct option index:** 1

**Explanation:**

`nano index.html` opens the file in the terminal window you are already in, and
`Ctrl-O` then `Ctrl-X` puts you back at the same prompt in the same directory — the shortest path for
a one-line fix. `code .` is the right call for an afternoon of work across many files, but launching a
whole graphical application to correct one word is the slow path, and it opens the folder rather than
taking you to the word. `vim` is taught in this course only as something to escape, never as an editor
to choose. `which nano` checks whether nano is installed on the machine; it locates a program on disk
and never opens a file (objective 1).

---

## Question 2

**Type:** MULTIPLE_CHOICE

A command you ran dropped you into vim. You did not ask for this, you have typed some junk into the
buffer by accident, and you want your shell prompt back without saving anything. What do you do?

- Press `Ctrl-X`, the way you exit nano
- Press `Ctrl-C` until the program stops
- Press `Esc`, then type `:q!` and press Enter
- Close the terminal window and open a new one

**Correct option index:** 2

**Explanation:**

`Esc` leaves whatever mode you are in and returns to the mode where keystrokes are
read as commands; `:` then starts a command, `q` quits, and `!` says do it even though there are
unsaved changes — which is exactly what you want, since the junk you typed is not worth keeping.
`Ctrl-X` is nano's exit and does not mean the same thing in vim. `Ctrl-C` interrupts a running command
but does not get you out of an editor holding the terminal. Closing the window works but throws away
your shell, your directory, and your history along with it — and the fact that "How do I exit Vim?" is
the most-viewed question on Stack Overflow, at 3,316,707 views, is exactly why the two-step escape is
worth memorising instead (objective 3).

---

## Question 3

**Type:** MULTIPLE_CHOICE

You are in `~/projects/first-site/`, which contains `index.html`. You run `code .`. What appears?

- Only `index.html`, because it is the only file in the folder
- A file-picker dialog asking you which file in `first-site/` you want to open
- The whole `first-site/` folder, with a sidebar listing everything inside it, including `index.html`
- An empty editor window, because `.` is not a filename

**Correct option index:** 2

**Explanation:**

`.` is the current directory, so `code .` says *open this folder* — the editor loads
`first-site/` as a project and shows its contents in a sidebar. Answering "only `index.html`" mistakes
what happens to be in the folder today for what the command is asking for; add a second file tomorrow
and it appears too. There is no file-picker step, because you have already told the editor what to
open. And the window is not empty: `.` is a perfectly valid path — it is the directory you are
standing in, which is precisely the thing an editor wants, because a project is a directory tree and
not a file (objective 2).

---

## Question 4

**Type:** TRUE_FALSE

nano's bottom bar shows `^O Write Out`. To save your file, you type a caret character followed by the
letter O.

**Correct answer:** false

**Explanation:**

The opposite is true — `^` is not a character you type at all. It is shorthand for
the Control key, so `^O` means hold Control and press O. Typing a literal `^` and an `O` just inserts
those two characters into `index.html`, which is the one thing you did not want. Reading the bar
correctly is what makes the rest of it usable: `^X Exit` is Control and X in exactly the same way
(objective 1).

---

## Question 5

**Type:** SHORT_ANSWER

You sit down at a Mac, `cd` into `~/projects/first-site/`, and run `which nano`. You get nothing back.
What has this told you, and what are your two options for editing `index.html` now?

locates a program on disk, so no path means no program. It does not mean I typed the command wrong or
that the file is missing. This is why the check exists: nano ships by default on Ubuntu and Fedora, but
its presence on current macOS is not something to assume. My options are to run `code .` and edit
`index.html` in Visual Studio Code, or to fall back on `vi`, which Unix-like systems ship as a matter
of course — and if I end up in `vi` and want out, `Esc` then `:q!` gets me back to the prompt.

**A grader must see:**

**Sample answer:**

Nothing back from `which nano` means nano is not installed on this machine — `which`
locates a program on disk, so no path means no program. It does not mean I typed the command wrong or
that the file is missing. This is why the check exists: nano ships by default on Ubuntu and Fedora, but
its presence on current macOS is not something to assume. My options are to run `code .` and edit
`index.html` in Visual Studio Code, or to fall back on `vi`, which Unix-like systems ship as a matter
of course — and if I end up in `vi` and want out, `Esc` then `:q!` gets me back to the prompt.

**A full-credit answer shows:**

1. Empty output from `which` means the program is not installed — not a typo and not a missing file.
2. `code .` named as the working editor alternative (opening the folder, not the bare file).
3. `vi` named as the fallback that is there when nothing else is, with `Esc` then `:q!` as the way out.

**Explanation:**

`which` reports whether a program exists on disk, so silence is a real answer, not an
error. Assuming nano is present everywhere is the trap this check is built to catch: it is standard on
Ubuntu and Fedora, but this course could not confirm it on current macOS, so you verify rather than
promise. Both fallbacks stay open to you — `code .` for actual editing, and `vi` as the editor you can
count on being there, with a guaranteed way out (objectives 1, 2, 3).
