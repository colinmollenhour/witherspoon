# Quiz — Pipes: connecting programs to each other

## Question 1

**Type:** MULTIPLE_CHOICE

`~/projects` contains exactly two folders: `first-site` and `notes`. You run:

```
ls -la ~/projects | grep site | wc -l
```

What appears on screen?

- **A.** `1`
- **B.** `2`
- **C.** `first-site`
- **D.** The full `ls -la` listing, followed by `1`

**Correct:** A

**Explanation:** `ls -la ~/projects` prints a line for `first-site`, a line for `notes`, and lines
for `.` and `..`. `grep site` keeps only lines containing `site`, and only the `first-site` line
does, so one line reaches `wc -l`, which prints `1`. `2` is the count of folders in the directory,
not the count of lines that survived `grep` — `notes` is filtered out at stage 2. `first-site` is
what `grep` emits, but `wc -l` counts that line rather than printing it. The full listing never
appears, because `ls`'s stdout went into the pipe instead of to the screen (objective 7).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You want a file you can open tomorrow containing every line under `~/projects` that mentions `http`.
Which command does that?

- **A.** `grep -rn "http" ~/projects | matches.txt`
- **B.** `grep -rn "http" ~/projects > matches.txt`
- **C.** `grep -rn "http" ~/projects | less`
- **D.** `grep -rn "http" ~/projects | wc -l`

**Correct:** B

**Explanation:** `>` is the one that makes a container: it creates `matches.txt` on disk, and the
file is still there tomorrow. Option A puts `|` in front of a filename, so the shell tries to run
`matches.txt` as a program and reports `command not found` — a pipe must be followed by a command.
Option C is the right command for reading long output *now*, but `less` leaves nothing behind once
you press `q`. Option D gives you a count of the matching lines, not the lines themselves, and also
writes no file (objectives 7, 8, 9).

---

## Question 3

**Type:** SHORT_ANSWER

In `ls -la ~/projects | grep site | wc -l`, describe exactly what `wc -l` receives.

**Sample answer:** It receives the text that `grep` printed — only the listing lines that contained
`site`, not the whole `ls` listing — arriving on `wc`'s standard input. It is not given a filename,
which is why it prints only a number instead of a number and a name the way `wc -l /etc/hosts`
prints `7 /etc/hosts`.

**Graders must see:** (1) it receives `grep`'s output, not `ls`'s original listing; (2) that text
arrives on stdin; (3) no file or filename is involved.

**Explanation:** Each stage of a pipeline is handed the previous stage's stdout and nothing else, so
`wc -l` never sees the lines `grep` dropped. Because a pipe carries text rather than a file, `wc` has
no filename to report, which is the visible difference between `wc -l index.html` and
`cat index.html | wc -l` (objective 7).

---

## Question 4

**Type:** TRUE_FALSE

In `ls -la ~/projects | grep site`, the shell first writes the `ls` output to a temporary file, and
`grep` then opens that file.

**Correct:** False

**Explanation:** False — no file is written at any point, temporary or otherwise. Both programs run
at the same time and the text moves from `ls`'s stdout directly into `grep`'s stdin. The temporary
file is what you would need without `|`: redirect with `>`, run `grep` on the file, then delete it.
That is exactly the work the pipe removes (objective 7).

---

## Question 5

**Type:** MULTIPLE_CHOICE

A classmate runs `ls -la ~/projects | grep site | wc -l`, sees `1` on screen, then runs `ls` and
finds no new file. They ask what went wrong. What is the correct diagnosis?

- **A.** Nothing went wrong — no part of that command names a file, so nothing was written.
- **B.** `wc -l` deleted the temporary file when it finished; add `-l` to `ls` to see it.
- **C.** The result went to stderr instead of stdout, so it was never saved.
- **D.** The file is hidden, and `ls -a` will reveal it.

**Correct:** A

**Explanation:** A pipeline connects programs; it never creates a file, and only `>` or `>>` followed
by a filename does. Nothing went wrong. B invents a cleanup step that does not exist — there was no
temporary file to delete. C confuses this with Topic 9's two output streams; the `1` printed
perfectly well on stdout, and a stream has nothing to do with whether a file exists. D is the
dotfile reflex from Unit 1, but a hidden file would still have had to be created by something, and
nothing here creates one. To keep the answer, run the same pipeline with `> count.txt` on the end
(objectives 7, 9).
