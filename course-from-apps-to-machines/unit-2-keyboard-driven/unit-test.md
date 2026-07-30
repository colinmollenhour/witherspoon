# Unit 2 test — Driving the machine from the keyboard

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**What's covered:** Can you tell where the shell is standing, move with `cd` / `cd ..` / `cd -` / bare `cd`, build a path with `mkdir -p` and `touch`, use `cp` / `mv` / `rm` (no trash, no undo), read files with `cat`, `less`, `head`, `wc`, and `grep`, and look things up with Tab, `history`, `--help`, and `man`?.

**Pass at:** 70%

## Question 1

**Type:** MULTIPLE_CHOICE

Your prompt reads `you@laptop:~/projects$`. You run `cat index.html` and get a message ending in
`No such file or directory`. You can see `index.html` in a file manager window, and you copied the
name straight out of it. What is the first thing to do?

- Add a leading `/` to the name, because a path without one is incomplete
- Run `pwd`, then `cd ~/projects/first-site`, and run the command again
- Reinstall `cat`, because the error means the program is not working
- Open the file in a text editor to check whether it has been corrupted

**Correct option index:** 1

**Explanation:**

`index.html` has no leading `/`, so it is a relative path — measured from wherever
the shell is standing. The prompt says `~/projects`, and the file lives one level down in
`~/projects/first-site`, so from here that name resolves to nothing. `pwd` answers "where am I
standing" and `cd ~/projects/first-site` fixes the vantage point without touching the path you typed.
Adding a leading `/` does not complete the path, it makes it absolute and points at `/index.html` at
the root of the whole machine — somewhere else again. The file is not corrupted: that is exactly the
conclusion behind a question with 21,771 views, whose asker wrote "I copy n pasted a pathway for an
existing file and just swapped the file with the one that im being told does not exist." And `cat`
is not broken — `No such file or directory` is a statement about a path that did not resolve, not
about a program that failed (objectives 1, 2).

## Question 2

**Type:** MULTIPLE_CHOICE

You run these four commands in order, in a fresh terminal:

```
cd /etc
cd /var/log
cd -
cd -
```

What appeared on screen, and where are you standing at the end?

- Nothing appeared; you are in `/var/log`
- `/etc` appeared, then `/var/log`; you are in `/var/log`
- `/var/log` appeared, then `/etc`; you are in `/etc`
- Nothing appeared; you are in your home directory, because `-` means "go back home"

**Correct option index:** 1

**Explanation:**

`cd -` is the one form of `cd` that prints something: it echoes the directory it
moved you to, because you never named one. The shell keeps the previous location in `$OLDPWD`, so the
first `cd -` returns you to `/etc` and prints `/etc`, and the second toggles back to `/var/log` and
prints that — run it twice and you are where you started. The first option assumes `cd` is always
silent, which is true of every other form but not this one. The third has the sequence reversed:
that is what you would see starting from `/var/log`. The fourth confuses `cd -` with bare `cd`,
which the specification defines separately — "If no directory operand is given and the HOME
environment variable is set to a non-empty value, the cd utility shall behave as if the directory
named in the HOME environment variable was specified as the directory operand" — and which prints
nothing. If you want a second opinion on where you ended up, the prompt carries the current directory
too, though only `pwd` is guaranteed to (objective 3).

## Question 3

**Type:** MULTIPLE_CHOICE

Your home directory is completely empty — there is no `projects` directory at all. You need
`~/projects/first-site` to exist with an empty `index.html` inside it, and you want the pair of
commands to still work if you run it a second time. Which pair?

- `mkdir ~/projects/first-site` then `touch ~/projects/first-site/index.html`
- `mkdir -r ~/projects/first-site` then `touch ~/projects/first-site/index.html`
- `mkdir -p ~/projects/first-site` then `touch ~/projects/first-site/index.html`
- `mkdir -p ~/projects/first-site` then `cat ~/projects/first-site/index.html`

**Correct option index:** 2

**Explanation:**

The `-p` flag is documented as "-p, --parents" → "no error if existing, make parent
directories as needed", which is two jobs in one switch: it invents the missing `projects` parent,
and it stays silent when the directory is already there, which is what makes the pair safe to re-run.
Plain `mkdir` creates only the last part of the path, so on an empty home directory it fails with
`mkdir: cannot create directory '.../x/y/z': No such file or directory`, and even once the parent
exists it fails the second time with `mkdir: cannot create directory '.../a': File exists`. `-r` is
the recursive flag belonging to `cp` and `rm`, not a `mkdir` option. And `cat` only reads a file and
prints it to the screen — it never creates one; `touch` is what makes the empty file (objective 4).

## Question 4

**Type:** TRUE_FALSE

You run `rm index.backup.html` and the shell prints nothing at all. Because nothing was printed and
no program had the file open, it is still recoverable from the trash for thirty days, the same way a
deleted photo is on a phone.

**Correct answer:** false

**Explanation:**

The opposite is true, in both halves. Printing nothing is how `rm` reports
*success* — silence means it worked, not that nothing happened. And there is no trash can, no
recycle bin, and no undo: the delete-and-restore-later behaviour is a phone and desktop-GUI
convention, not something `rm` does. This is not a hazard you grow out of, either. GitLab's public
postmortem describes an engineer running `rm -rf` against the wrong database host, after which the
team found that "out of 5 backup/replication techniques deployed none are working reliably or set up
in the first place". The only protection is in front of the command, not behind it: `-i` is
documented as "prompt before every removal", so it asks you before deleting each file. Nothing asks
afterwards (objective 5).

## Question 5

**Type:** MULTIPLE_CHOICE

`ls` shows you two entries: a directory genuinely named `My Project`, and an existing directory named
`archive`. You want `My Project` to be renamed to `first-site`. Which command does exactly that?

- `mv My Project first-site`
- `mv "My Project" archive`
- `mv "My Project" first-site`
- `mv My\ Project archive`

**Correct option index:** 2

**Explanation:**

Two separate decisions have to be right. First, the shell splits the line on
whitespace, so `mv My Project first-site` passes three arguments — `My`, `Project`, `first-site` —
rather than two; wrapping the name in double quotes, or putting a backslash before the space, is
what keeps it a single argument. That trap alone has 55,267 views on Stack Exchange. Second, the
destination decides which job `mv` is doing: "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY".
`archive` already exists as a directory, so both options aimed at it *move* the folder inside
`archive` under its own name — the backslash in the fourth option escapes the space perfectly and
still lands in the wrong place. `first-site` does not exist yet, which is the rename case. Only the
third option gets the quoting and the destination right at the same time (objective 6).

## Question 6

**Type:** MULTIPLE_CHOICE

A file under `~/projects` is a few thousand lines long. You want to read it from the top, one
screenful at a time, stopping between screens. Which command does that, and how do you get your
prompt back when you are finished?

- `cat` — it stops at each screenful, and Enter continues
- `less` — press `q` to quit
- `head` — press `q` to quit
- `cat` — the whole file scrolls past and you scroll the window back up; there is nothing to quit

**Correct option index:** 1

**Explanation:**

`less` is a pager: it shows one screenful, waits for you, moves forward on Space,
and ends on `q`, handing the prompt back. `cat` never stops for anything — it writes the file's bytes
to the screen and returns the prompt immediately, which is precisely why it is the wrong tool at a
few thousand lines; the first option credits it with paging it does not do, and the fourth describes
what `cat` really does but not what you asked for. `head` prints only the first few lines and returns
at once, so there is nothing to quit — it never took the screen. Learning `q` before you start is the
point: the most-viewed question in Stack Overflow's history is "How do I exit Vim?" at 3,316,707
views, from someone who wrote "I am stuck and cannot escape" (objective 7).

## Question 7

**Type:** MULTIPLE_CHOICE

You rebuild the folder from nothing with `mkdir -p ~/projects/first-site`, then `cd` into it and run
`touch index.html`. Immediately afterwards you run `wc -l index.html`. What does it print?

- `0 index.html`
- `10 index.html`
- `0 0 0 index.html`
- `wc: index.html: No such file or directory`

**Correct option index:** 0

**Explanation:**

Two facts have to meet. `touch` creates the file **empty** — zero bytes, nothing
inside — because nothing in this unit types text into a file. And `wc -l` keeps only the line count
and the filename, dropping the other columns, exactly as `wc -l /etc/hosts` prints `7 /etc/hosts`.
An empty file therefore gives `0 index.html`. `10 index.html` is what the finished page you built by
hand would give, and it is the tempting answer because the folder and the filename are identical to
before — the name came back, the contents did not. `0 0 0 index.html` has the shape of *bare* `wc`,
which prints three columns in a fixed order — lines, words, bytes — as in `wc /etc/hosts` →
`  7  40 384 /etc/hosts`; `-l` is what drops two of them. And the file does exist: `touch` created it
one command ago, so there is nothing for `wc` to fail to find (objectives 4, 8).

## Question 8

**Type:** MULTIPLE_CHOICE

You run `grep -rn "http" ~/projects` and one line of the output is:

```
README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),
```

Then you run `grep -n "<title>" index.html` and get back `4:    <title>My first site</title>`.
Which account of the two shapes is correct?

- The first is three fields split on the first two colons — path, line number, matching text — and the second has no path field because pointing `grep` at one single file leaves the prefix off
- The first is `path:line:text`; the second lost its path field because that search failed to find the filename
- Both are `path:line:text`; in the second, the file being searched is called `4`
- The two shapes come from different versions of `grep`, so the output format cannot be relied on

**Correct option index:** 0

**Explanation:**

`-n` puts the line number in front of every match, and `-r` searches a whole tree —
which is when the path is the only thing telling you where a match came from, so a directory search
prints `path:line:text`. Split it on the *first two* colons only: every colon after that belongs to
the matched line's own text, which is why the example's third field contains several more. Point
`grep` at one file and the prefix is dropped, because you already know which file you searched; `-H`
forces it back on. The second search did not fail — it found the match on line 4. `4` is a line
number, not a filename. And this is not a version difference: GNU grep on Linux and BSD grep on macOS
both document `-r` as "Recursively search subdirectories listed." and `-n` as "Each output line is
preceded by its relative line number in the file", and both behave this way (objectives 8, 9).

## Question 9

**Type:** TRUE_FALSE

Your terminal answers `bash: pip: command not found`. That message means the program is not
installed on this machine, so the fix is to install it again.

**Correct answer:** false

**Explanation:**

The opposite reading is the correct one, and this is the most-searched version of
the mistake there is — "bash: pip: command not found" has 2,426,531 views and "zsh: command not
found: brew" another 1,105,124. The literal meaning is narrower than "not installed": the shell
walked its list of directories, `$PATH`, and found no program of that name in any of them. A program
sitting on the disk in a directory that is not on that list produces this exact message, and
reinstalling leaves you where you started. `which python3` searches the same `$PATH` the shell does
and prints the absolute path of the program that would actually run, which settles it in one command
— and if `which` prints a path while the command still fails, the problem was never `$PATH`. Notice
also which shell is speaking: bash puts the name in the middle of the message and zsh puts it at the
end, the same way their prompts end in `$` and `%` (objective 12).

## Question 10

**Type:** SHORT_ANSWER

You are about to type `grep -n "<title>" ~/projects/first-site/index.html` for the fourth time this
session, and you cannot remember which of `ls`'s two flags is the one that shows hidden entries.
Name (a) the keystroke that stops you typing that long path out by hand, (b) the keystroke that
brings a command you already ran back to the prompt, (c) the two ways to ask `ls` what its flags do
— saying which one you would use here and why — and (d) the key that gets you out of the second one.

**Sample answer:**

(a) **Tab.** I type `~/pro`, press Tab, and the shell fills in the rest, because
it only completes names that are really on the disk — so if Tab does nothing, either the name is not
there or I am not standing where I think I am. (b) The **Up arrow** brings back the last command,
ready to run again or edit; for anything older, `history` prints the list of what I have run.
(c) `ls --help` prints a short summary and hands the prompt straight back — among its lines are
`-a    do not ignore entries starting with .` and `-l    use a long listing format`, which answers
the question directly. `man ls` opens the full manual page instead. I would use `--help` here,
because this is a reminder about a flag, not a question about what `ls` is for. (d) **`q`** quits
`man`, the same key that quits `less`.

**Explanation:**

A strong answer covers:

(1) Tab named for completion, with some sign the learner knows Tab only
completes names that exist; (2) the Up arrow and/or `history` for recall; (3) both `--help` and
`man`, with `--help` chosen for a quick flag reminder and a reason given; (4) `q` as the way out of
`man`.

This question joins the two halves of the unit's ending: the long paths and flags
you met while reading and searching files, and the machinery that means you never have to hold them
in your head. Tab is a correctness tool rather than a typing shortcut — the shell completes only
names that are really there, so a Tab that does nothing has already told you something useful. Up
and `history` mean you never retype a command you have already run. And every command carries its own
documentation in two sizes: `--help` for a flag reminder, `man` for what the command is actually for,
with `q` as the exit — the same escape key as `less`, and the one whose absence produced the
most-viewed question in Stack Overflow's history (objectives 10, 11).
