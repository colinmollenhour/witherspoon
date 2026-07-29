# Quiz — The shell always stands somewhere

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You open a fresh terminal and run these four commands in order:

```
$ cd ~/projects/first-site
$ cd ..
$ cd -
$ pwd
```

What does that last `pwd` print?

- `/home/you/projects`
- `/home/you/projects/first-site`
- `/home/you`
- Nothing — `cd -` already printed the directory, so `pwd` has no output

**Correct option index:** 1

**Explanation:**

`cd ~/projects/first-site` lands in the project folder. `cd ..` moves one level up
to `/home/you/projects`. `cd -` then returns to the directory you were in immediately before that
move — the project folder — so `pwd` prints `/home/you/projects/first-site`. Option 1 assumes `cd -`
does nothing, or repeats the `cd ..`; it does neither. Option 3 confuses `cd -` with bare `cd`, which
is the form that goes home. Option 4 misreads the fact that `cd -` prints its destination: that print
is a one-off confirmation from `cd`, and it does not silence `pwd`, which always prints the current
working directory (objectives 2, 3).

## Question 2

**Type:** MULTIPLE_CHOICE

Your shell is standing in `~/projects`. You type a command naming `index.html`, and the terminal
answers with a message ending `No such file or directory`. You can see the file in a file manager;
its full path is `~/projects/first-site/index.html`. What is actually wrong?

- The file is corrupted — that message is what a damaged file looks like
- `index.html` does not start with `/`, so the shell looked for it inside `~/projects`, where no such file exists
- `index.html` is a hidden file, so it must be revealed with `ls -a` before any command can read it
- Relative paths work only for directories, so files must always be named with an absolute path

**Correct option index:** 1

**Explanation:**

A path that does not begin with `/` is measured from the current working directory.
Standing in `~/projects`, the name `index.html` means `~/projects/index.html` — which does not exist,
because the file is one level deeper, inside `first-site`. Running `pwd` first would have shown this
immediately. Option 1 is the conclusion people actually reach — "I copy n pasted a pathway for an
existing file and just swapped the file with the one that im being told does not exist" [src 163] —
but the message reports a lookup that found nothing, not damaged bytes. Option 3 confuses this with
hidden dotfiles; `index.html` has no leading dot and is not hidden. Option 4 invents a rule that does
not exist: relative paths name files just as well as directories, they are simply measured from
wherever you are standing (objective 1).

## Question 3

**Type:** MULTIPLE_CHOICE

You were working in `~/projects/first-site`. You then ran `cd /var/log` to look at something else.
Which single command puts you back in `~/projects/first-site`?

- `cd ..`
- `cd -`
- `cd ~`
- `cd`

**Correct option index:** 1

**Explanation:**

`cd -` returns the shell to the directory it was in before the last `cd`, and prints
that directory as confirmation [src 18]. From `/var/log`, `cd ..` moves up one level to `/var`, not
across the filesystem. `cd ~` and bare `cd` both land in your home directory — the specification says
`cd` with no operand "shall behave as if the directory named in the HOME environment variable was
specified" [src 17] — which is close to the project folder but not in it (objectives 2, 3).

## Question 4

**Type:** SHORT_ANSWER

Your terminal shows this prompt:

```
colin@seamus:~$
```

A classmate's terminal shows the same kind of information but ends in `%` instead of `$`. Name the
shell each of you is running, say what the `~` in your prompt is telling you, and state what it would
mean if either prompt ended in `#`.

`%` is zsh, the default shell on macOS. The `~` is the current working directory — the shell is
standing in the home directory right now, and that part of the prompt changes as you `cd` around. A
prompt ending in `#` on either shell means the shell is running as the root user, with permission to
change or delete anything on the machine.

**A grader must see:**

**Sample answer:**

The prompt ending in `$` is bash, the default shell on Linux. The prompt ending in
`%` is zsh, the default shell on macOS. The `~` is the current working directory — the shell is
standing in the home directory right now, and that part of the prompt changes as you `cd` around. A
prompt ending in `#` on either shell means the shell is running as the root user, with permission to
change or delete anything on the machine.

**A full-credit answer shows:**

- `$` identifies bash and `%` identifies zsh
- `~` names the current working directory (the home directory here), not a fixed decoration
- `#` signals root / privileged, on either shell

**Explanation:**

The last character of a stock prompt identifies the shell: bash's `\$` escape renders
as `$`, and prints `#` when the user id is 0 [src 28]; zsh's manual defines its equivalent as "%# — A
'#' if the shell is running with privileges, a '%' if not." [src 30] The tempting mistake is to read
`#` as "a different shell" rather than "the same shell with root powers" — it is a privilege signal,
not a shell name. The `~` before it is the one piece of the prompt that moves with you (objective 3).

## Question 5

**Type:** TRUE_FALSE

Because the prompt already displays your current directory, running `pwd` is redundant.

**Correct answer:** false

**Explanation:**

The reasoning is backwards. A prompt shows the current directory only because it has
been configured to — the stock Linux bash prompt renders `colin@seamus:~$`, where the `~` comes from
one escape among several in the prompt's definition [src 28], and a prompt can be set to show a bare
`$` and nothing else. `pwd` is the command whose entire job is to print the current working
directory, so it answers whether or not the prompt is helpful. Trusting the prompt is fine on your
own machine; trusting it as a rule is how you end up typing a correct path in the wrong place
(objectives 1, 3).
