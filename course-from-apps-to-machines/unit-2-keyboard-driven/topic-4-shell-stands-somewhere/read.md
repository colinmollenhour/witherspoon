# The shell always stands somewhere

Someone types a command with a path in it, gets back `No such file or directory`, and describes the
problem like this:

> "I copy n pasted a pathway for an existing file and just swapped the file with the one that im
> being told does not exist."

The file exists. They can see it. The path is spelled correctly — they pasted it. That question has
21,771 views [src 163], which tells you how many people reach the same conclusion: the file must be
corrupted, or the machine is lying.

The machine is not lying. The message is not about the file at all. It is about where the shell was
standing when it read the path.

## The one idea

Your shell — the program inside the terminal window that reads what you type — is always standing in
exactly one directory. That directory is called the **current working directory**, usually shortened
to **cwd**. There is always exactly one, it is never "none", and it changes only when you change it.

Every path you type that does not begin with `/` is measured from there. So `index.html` does not
mean "the file called index.html". It means "the file called index.html *in the directory I am
standing in right now*". Move the shell, and that same name points somewhere else — or nowhere.

Three questions, three commands. Learn them in this order:

| Question | Command | What it does |
| --- | --- | --- |
| Where am I standing? | `pwd` | Prints the current working directory as an absolute path |
| What is here? | `ls` | Lists what is in the current working directory |
| Stand somewhere else | `cd <path>` | Changes the current working directory |

`pwd` is short for *print working directory*. It takes no arguments, changes nothing, and answers the
only question that matters when a path is misbehaving.

`ls` is short for *list*. Its manual page states the default plainly: "List information about the
FILEs (the current directory by default)." [src 14] With no argument, `ls` is not a general question
about your machine. It is a question about one directory — the one you are standing in.

## Proof: the same command, two answers

You built `~/projects/first-site/index.html` by hand in Project 1. Walk into it with the shell and
watch `ls` change its mind:

```
$ cd ~/projects
$ pwd
/home/you/projects
$ ls
first-site
$ cd first-site
$ pwd
/home/you/projects/first-site
$ ls
index.html
```

Look at what changed between the two `ls` lines. Not the command — same two letters, typed
identically. Not the disk — nothing was created, moved, or renamed. Only where the shell was standing
when it was asked.

That is the whole lesson, and it is also the answer to the error at the top of this page. From
`~/projects/first-site`, the relative path `index.html` resolves to a real file. From `~/projects`,
one directory higher, the same relative path resolves to nothing, and the shell replies with a
message ending in `No such file or directory`. The path was correct. The vantage point was not. When
you see that message, your first move is `pwd`, not a rewrite of the path.

## Five ways to say where to stand

`cd` is short for *change directory*. It accepts several kinds of destination, and the differences
between them are worth more than the command itself.

| Command | Where you end up |
| --- | --- |
| `cd ~/projects/first-site` | The project folder, from anywhere — `~` is your home directory |
| `cd first-site` | Into `first-site`, but only if it is inside where you are standing now |
| `cd ..` | One directory up — the parent of where you are |
| `cd` (bare) | Your home directory |
| `cd -` | The directory you were in *before* the last `cd` |

Bare `cd` is not a typo or a no-op. The specification says so directly: "If no directory operand is
given and the HOME environment variable is set to a non-empty value, the cd utility shall behave as
if the directory named in the HOME environment variable was specified as the directory operand."
[src 17] That is also where `~` gets its meaning. `cd` and `cd ~` land in the same place.

`cd -` is the one that surprises people, because it is the only form that prints something. Here it
is bouncing between two real directories:

```
$ cd /etc
$ cd /var/log
$ cd -
/etc
$ cd -
/var/log
```

Each `cd -` moves you *and* echoes the directory it moved you to [src 18]. That output is not an
error — it is `cd` confirming the swap, since you did not name a destination. The shell keeps the
previous location in a variable called `$OLDPWD`, which is why `cd -` toggles: run it twice and you
are back where you started.

## Why `cd` is not a program

`ls` is a program on disk. `cd` is not — it is built into the shell. The specification is exact about
why: "The cd utility shall change the working directory of the current shell execution
environment." [src 15] The *current shell* — not a program the shell starts. A separate program would
get its own working directory, change that, then exit, taking the change with it. Nothing would move.

You need this only so that when `cd` behaves oddly later — `man cd` in particular does not do what
you expect — you read it as a category difference, not a broken install.

## Read the prompt

The shell has been telling you where you are the whole time. A stock Linux bash prompt renders like
this [src 28]:

```
colin@seamus:~$
```

Four pieces: `colin` is the username, `seamus` is the machine's name, `~` is the current working
directory, and `$` ends the prompt. Walk into the project folder and that middle part follows you.

The last character identifies your shell. Linux defaults to bash, which ends its prompt with `$`
[src 28]. macOS defaults to zsh, whose manual defines the ending as: "%# — A '#' if the shell is
running with privileges, a '%' if not." [src 30] So `%` means zsh, and `#` — on either shell — means
you are running as the root user, able to delete anything on the machine. Bash matches: its `\$`
escape prints `#` when the user id is 0 [src 28].

That final character is printed *to* you; it is not part of the command. Pasting it back in is a
common enough mistake that a tool exists solely to strip it [src 161].

A prompt showing `~` is convenient but not trustworthy — prompts can be configured to show anything,
or nothing. `pwd` always answers.

## Where this leaves you

You can now reach `~/projects/first-site` from anywhere on the machine without touching a file
manager: `cd ~/projects/first-site`, then `pwd` to confirm you arrived. Try it from far away — `cd /`,
then back — and watch the prompt follow you.

What you cannot yet do is *make* anything. Project 1 built that folder and that file by clicking
through a file manager. Next you rebuild it from nothing, by keyboard, in a handful of commands — and
find out what happens when you delete the wrong one.
