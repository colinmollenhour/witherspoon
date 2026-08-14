# Unit 2 test — Keyboard and generated files

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**What's covered:** Quick check: can you stand in the folder, rebuild it, and generate the page with `>` and `|`?

**Pass at:** 70%

## Question 1

**Type:** SHORT_ANSWER

You are in `~/projects/first-site`. What does bare `cd` do, and what does `cd -` do after that?

**Sample answer:**

Bare `cd` goes home (`$HOME`). `cd -` then jumps back to `~/projects/first-site` and prints that path.

**A full-credit answer shows:**

A strong answer covers: (1) bare `cd` goes to home; (2) `cd -` returns to the previous directory and prints it.

**Explanation:**

Bare `cd` is home. `cd -` toggles and prints the destination. Confirm with `pwd` (objective 3).

## Question 2

**Type:** SHORT_ANSWER

What does `ls -la | grep html | wc -l` do, in order?

**Sample answer:**

`ls -la` lists the folder. `grep html` keeps the lines that mention html. `wc -l` counts those lines. Nothing is written to disk unless you add `>` or `>>`.

**A full-credit answer shows:**

A strong answer covers: (1) list; (2) filter lines containing html; (3) count those lines; (4) the pipe does not write a file by itself.

**Explanation:**

Each stage reads what the previous stage printed. The pipe is a connection, not a save (objective 8).

## Question 3

**Type:** TRUE_FALSE

`mkdir ~/projects/first-site/deep/nested` without `-p` fails if `deep` does not exist. `mkdir -p` of the same path succeeds.

**Correct answer:** true

**Explanation:**

`-p` makes parent directories as needed and does not complain if they already exist. Without it you get `No such file or directory` (objective 4).

## Question 4

**Type:** TRUE_FALSE

`rm` puts deleted files in the Trash, so you can undo a bad delete from the file manager.

**Correct answer:** false

**Explanation:**

The opposite is true. `rm` has no trash and no undo. Copy the file out first if you still need it (objective 5).

## Question 5

**Type:** MULTIPLE_CHOICE

You run `ls` in `/home/sam` and then `cd projects/first-site` and `ls` again. The listing changes. What changed?

- The `ls` program was updated between the two runs
- The shell is standing in a different folder, so the same command lists different files
- `cd` rewrites `ls` to add a hidden flag
- The first `ls` listed the whole disk and the second listed one folder

**Correct option index:** 1

**Explanation:**

The command did not change. The vantage point did. `pwd` would print a different path after the `cd` (objectives 1, 2).

## Question 6

**Type:** MULTIPLE_CHOICE

`b` already exists and is a directory. What does `mv a b` do?

- Renames `a` to `b`, overwriting the directory
- Moves `a` into `b`, so the result is `b/a`
- Copies `a` to `b` and leaves `a` in place
- Deletes `b` and then renames `a`

**Correct option index:** 1

**Explanation:**

When the destination is an existing directory, `mv` moves into it. When `b` does not exist, `mv a b` is a rename. That pair is the whole trap (objective 6).
