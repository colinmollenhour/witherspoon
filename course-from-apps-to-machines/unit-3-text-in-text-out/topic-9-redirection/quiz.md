# Quiz — Redirection: making files out of command output

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You run these four commands in order, from `~/projects/first-site/`:

```
$ ls -la ~ > notes.txt
$ wc /etc/hosts >> notes.txt
$ wc /etc/hosts > notes.txt
$ cat notes.txt
```

What does the last command print?

- The four `ls -la` lines, followed by `  7  40 384 /etc/hosts`
- `  7  40 384 /etc/hosts` twice, on two lines
- `  7  40 384 /etc/hosts`, once
- Nothing — the third command emptied the file and `wc` has no output to write

**Correct option index:** 2

**Explanation:**

The third command uses `>`, which truncates `notes.txt` to empty before `wc` writes,
so everything the first two commands put there is destroyed and only the final `wc` line survives. The
first option assumes `>` appends like `>>` — it does not; that is the whole difference between the two
operators. The second option assumes the third command stacked another copy underneath the `>>` line,
which again treats `>` as appending. The fourth option is right that `>` empties the file first but
wrong that `wc` produces nothing: `wc /etc/hosts` writes `  7  40 384 /etc/hosts` to stdout, and that
line lands in the freshly emptied file (objective 4).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You redirect a command that fails, then read the file back:

```
$ mkdir ~/projects/first-site/x/y/z > notes.txt
mkdir: cannot create directory '.../x/y/z': No such file or directory
$ cat notes.txt
$
```

Why did the message appear on the screen while `notes.txt` came out empty?

- Plain `>` captures only stdout, and error messages travel on stderr — a separate stream
- The redirect failed, because you cannot redirect into a folder that does not exist
- `mkdir` never produces any output at all, so there was nothing for `>` to capture
- The shell prints a command's errors first and only applies the redirect afterwards

**Correct option index:** 0

**Explanation:**

A command has two output streams: stdout for results and stderr for messages about
what went wrong. `>` points stdout at the file and leaves stderr aimed at your screen, which is why
you saw the error and why the file is empty — `mkdir` wrote nothing to stdout. The second option
confuses the missing directory (`x/y/z`, the thing `mkdir` failed on) with the redirect target
(`notes.txt`, which is in a folder that exists and was created successfully). The third option is
wrong because the error message *is* output — it just is not stdout. The fourth option invents an
ordering rule; redirection is not a timing trick, it is two different destinations (objective 5).

---

## Question 3

**Type:** SHORT_ANSWER

Your `notes.txt` already holds a directory listing you want to keep. Write the command that adds the
output of `wc /etc/hosts` to the bottom of it, and say in one sentence what would have happened if you
had used the other redirect operator.

empty before `wc` ran, destroying the listing and leaving only the single `wc` line, with no warning
and no way to undo it.

**A full-credit answer shows:** (1) `>>` as the operator, with the command written correctly; (2) that
`>>` adds at the end and preserves the existing contents; (3) that `>` would have erased the listing
first.

**Sample answer:**

`wc /etc/hosts >> notes.txt` — using `>` instead would have truncated `notes.txt` to
empty before `wc` ran, destroying the listing and leaving only the single `wc` line, with no warning
and no way to undo it.

**A full-credit answer shows:**

(1) `>>` as the operator, with the command written correctly; (2) that
`>>` adds at the end and preserves the existing contents; (3) that `>` would have erased the listing
first.

**Explanation:**

`>>` appends and `>` truncates, and the only way to tell which you need is to ask
whether the target file already contains something you want. Here it does, so `>>` is the only safe
choice (objective 4).

---

## Question 4

**Type:** MULTIPLE_CHOICE

What does `ls -la ~ > /dev/null` accomplish?

- The listing is saved into a file called `/dev/null` that you can read back later
- The listing is thrown away — nothing is stored and nothing prints on the screen
- The command is cancelled before it runs, so the listing is never produced
- The listing prints on the screen as usual, and a copy is stored as a backup

**Correct option index:** 1

**Explanation:**

`/dev/null` discards everything written to it, so the redirect runs normally and the
output simply goes nowhere. The first option treats `/dev/null` as an ordinary file; it is not, and
reading it back gives you nothing. The third option confuses discarding the *output* with skipping the
*command* — `ls` still runs and still does its work. The fourth option describes a copy-and-also-show
behaviour that plain `>` never has: redirecting always takes the output off the screen (objective 6).

---

## Question 5

**Type:** TRUE_FALSE

Adding `> /dev/null` to a command that fails will hide its error message.

**Correct answer:** false

**Explanation:**

It is the other way round from what most people expect: `> /dev/null` discards stdout,
and an error message is not on stdout — it is on stderr, so it sails past the redirect and prints on
your screen exactly as before. To silence the error you need `2> /dev/null`, which points stream 2 at
the wastebasket instead. The tempting reading is that a redirect catches "the output", singular; there
are two streams, and each operator only aims one of them (objectives 5, 6).
