# Quiz — Reading files without opening an app

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You want to read a 12,000-line file from top to bottom, in the terminal. Which command fits, and
why?

- `cat`, because it prints every line so nothing is skipped
- `less`, because it shows one screenful at a time and waits for you between screens
- `wc -l`, because it counts the lines so you know how far you have to go
- `head`, because the first few lines tell you what kind of file it is

**Correct option index:** 1

**Explanation:**

`less` is a pager: it stops after each screenful, lets you move forward with Space,
scroll back with the arrow keys, and quit with `q` — which is what reading 12,000 lines requires.
`cat` does print every line, but it prints them at full speed and leaves you looking at the last
screenful with no way to scroll back, so "nothing is skipped" is true and useless. `wc -l` gives you
a count, not the contents. `head` gives you the top few lines, not the file. (objective 7)

---

## Question 2

**Type:** MULTIPLE_CHOICE

A `grep -rn` run produced this line:

```
README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),
```

Which file is the match in, and on which line?

- `README.md`, line 179
- `README.md`, line 9
- `readings`, line 179
- No file — `README.md` is just text that happened to match

**Correct option index:** 0

**Explanation:**

`grep -rn` output is three fields split on the *first two* colons: path, then line
number, then the matching line printed whole. So the match is in `README.md` at line 179. "Line 9"
comes from grabbing the `(9)` out of the matched text, which is part of the third field, not a
field of its own. "`readings`" is likewise inside the third field. And the path is real: when you
search a directory tree, the path prefix is the only thing telling you which file each match came
from. (objective 9)

---

## Question 3

**Type:** SHORT_ANSWER

Running `wc /etc/hosts` prints:

``` 7  40 384 /etc/hosts
```

What exactly does `wc -l /etc/hosts` print, and why that value?

words, bytes — so 7 is the line count, 40 is words and 384 is bytes. `-l` keeps only the line count
and drops the other two columns; the filename still appears.

**A grader must see:** (1) the value `7`, not 40 or 384 — the first column is lines; (2) that `-l`
narrows the output to one number rather than adding information; (3) that the filename is still
printed alongside it.

**Sample answer:**

It prints `7 /etc/hosts`. Bare `wc` gives three columns in a fixed order — lines,
words, bytes — so 7 is the line count, 40 is words and 384 is bytes. `-l` keeps only the line count
and drops the other two columns; the filename still appears.

**A full-credit answer shows:**

(1) the value `7`, not 40 or 384 — the first column is lines; (2) that `-l`
narrows the output to one number rather than adding information; (3) that the filename is still
printed alongside it.

**Explanation:**

The three columns are lines, words, bytes, in that order, so reading the wrong
column is the whole trap here — 40 words and 384 bytes describe the same 7-line file. `-l` is a
filter on the output, not a different measurement. (objective 8)

---

## Question 4

**Type:** SHORT_ANSWER

`grep -n "<title>" index.html` prints:

```
4:    <title>My first site</title>
```

`grep -rn "http" ~/projects` prints lines that each begin with a file path. Explain why the second
output carries a path and the first does not, and name the flag that would add the path to the
first.

prefix off — you already know which file you searched and repeating it on every line would be noise.
The second command searches a whole directory tree, so the path is the only thing identifying which
file each match came from, and `grep` prints it. Adding `-H` forces the filename on even for a
single-file search.

**A grader must see:** (1) the difference is one file versus a directory (or many files), not a
broken or inconsistent tool; (2) the reason — with one file the path carries no information; (3) the
flag `-H`.

**Sample answer:**

In the first command you named one single file, so `grep` leaves the `path:`
prefix off — you already know which file you searched and repeating it on every line would be noise.
The second command searches a whole directory tree, so the path is the only thing identifying which
file each match came from, and `grep` prints it. Adding `-H` forces the filename on even for a
single-file search.

**A full-credit answer shows:**

(1) the difference is one file versus a directory (or many files), not a
broken or inconsistent tool; (2) the reason — with one file the path carries no information; (3) the
flag `-H`.

**Explanation:**

The format looks unreliable and is not: the prefix appears exactly when it tells
you something you do not already know. Concluding that different `grep` versions or platforms print
different formats is the tempting wrong answer, and it will send you chasing a version difference
that is not there — BSD grep on macOS behaves the same way. `-H` overrides the default and prints
the filename regardless. (objectives 8, 9)

---

## Question 5

**Type:** TRUE_FALSE

You run `less index.html`. The screen fills with the file, your prompt disappears, and what you type
no longer shows up. The terminal has hung, and the fix is to close the window and open a new one.

**Correct answer:** false

**Explanation:**

The opposite is true — nothing has hung. `less` is a full-screen program that has
taken over the terminal and is waiting for a *command* rather than for text, which is why your
keystrokes do not echo. Press `q` and the program exits and your prompt returns. Reading a
disappeared prompt as a crash is the single most common beginner emergency: "How do I exit Vim?" is
the most-viewed question in Stack Overflow's history at 3,316,707 views, and closing the window is
the wrong instinct every time. (objective 7)
