# Quiz — Making, moving, and destroying

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

Your home directory is completely empty — no `projects` directory, nothing. You want
`~/projects/first-site` to exist. Which single command does it?

- `mkdir ~/projects/first-site`
- `mkdir -r ~/projects/first-site`
- `mkdir -p ~/projects/first-site`
- `touch ~/projects/first-site`

**Correct option index:** 2

**Explanation:**

`mkdir` creates only the last part of the path it is given, so plain
`mkdir ~/projects/first-site` fails with `mkdir: cannot create directory '.../x/y/z': No such file or
directory` because the `projects` parent is missing. `-p` is documented as "no error if existing, make
parent directories as needed", which creates the missing parent and the target in one go. `-r` is the
recursive flag for `cp` and `rm`, not a `mkdir` option. `touch` creates an empty *file*, not a
directory, and it would hit the same missing-parent problem anyway (objective 4).

## Question 2

**Type:** MULTIPLE_CHOICE

You run `ls` in `~/projects/first-site` and see exactly two entries: `index.html` and `archive`, where
`archive` is a directory. You then run `mv index.html archive`. What is the result?

- `index.html` is renamed to `archive`, replacing the directory
- `index.html` is moved into the `archive` directory, still named `index.html`
- `index.html` is copied into `archive`, leaving the original in place
- The command fails because `archive` already exists

**Correct option index:** 1

**Explanation:**

The manual page describes `mv` as "Rename SOURCE to DEST, or move SOURCE(s) to
DIRECTORY", and the deciding factor is the state of the destination: because `archive` already exists
as a directory, this is the *move* case, and the file keeps its own name inside it. It is not a rename
— that only happens when the destination does not exist. It is not a copy, because `mv` never leaves
the original behind; that is `cp`. And it does not fail: an existing destination directory is the
normal case for a move, not an error (objective 6).

## Question 3

**Type:** TRUE_FALSE

You run `ls` in `~/projects/first-site` and the only entry is `index.html`. Running
`mv index.html draft.html` will place `index.html` inside a directory called `draft.html`.

**Correct answer:** false

**Explanation:**

The opposite happens. `draft.html` does not exist, so this is the *rename* case —
`index.html` is simply now called `draft.html`, in the same directory. `mv` only moves a file *into*
something when the destination already exists as a directory, which `ls` just showed you it does not
(objective 6).

## Question 4

**Type:** MULTIPLE_CHOICE

You run `rm index.backup.html`. The shell prints nothing at all and gives you a fresh prompt. What has
happened, and what are your options?

- Nothing happened — a command that prints no output did not run
- The file is in the trash and can be restored from there for thirty days
- The file is gone; `rm` prints nothing on success, and there is no undo and no trash can
- The file is hidden but recoverable by running `rm` again with `-i`

**Correct option index:** 2

**Explanation:**

`rm` succeeds silently, so no output is the *expected* result, not evidence that
nothing happened. There is no trash can and no restore window — that is a phone and desktop-GUI
convention, not something `rm` does. `-i` is documented as "prompt before every removal": it would
have asked you *before* deleting, but it cannot bring anything back afterwards. This is a
professional-scale hazard, not a beginner one — GitLab's public postmortem describes an engineer
running `rm -rf` on the wrong database host and then discovering that "out of 5 backup/replication
techniques deployed none are working reliably or set up in the first place" (objective 5).

## Question 5

**Type:** SHORT_ANSWER

You have a directory genuinely named `My Project` and you want to rename it to `first-site`. You type
`mv My Project first-site` and it does not do what you want. Explain why, and give a command that
works.

separate arguments — `My`, `Project`, and `first-site` — rather than two. `mv` sees two sources and a
destination, not one folder called `My Project`. Either quote the name — `mv "My Project" first-site` —
or escape the space with a backslash — `mv My\ Project first-site`.

**A strong answer covers:** (1) that the shell splits on whitespace and the space made `My` and `Project`
two arguments rather than one name; (2) a working fix using either double quotes around the whole name
or a backslash before the space.

**Sample answer:**

The shell splits the line on whitespace, so `mv My Project first-site` passes three
separate arguments — `My`, `Project`, and `first-site` — rather than two. `mv` sees two sources and a
destination, not one folder called `My Project`. Either quote the name — `mv "My Project" first-site` —
or escape the space with a backslash — `mv My\ Project first-site`.

**A full-credit answer shows:**

(1) that the shell splits on whitespace and the space made `My` and `Project`
two arguments rather than one name; (2) a working fix using either double quotes around the whole name
or a backslash before the space.

**Explanation:**

Whitespace is how the shell decides where one argument ends and the next begins, so a
space inside a real filename has to be protected — either by quoting the whole name or by escaping the
individual space. Learners often assume the command is broken or that the file does not exist; the
command is fine, the argument boundaries are wrong. This is a well-worn trap: the Stack Exchange
question on copying files with spaces in their names has 55,267 views (objective 6).
