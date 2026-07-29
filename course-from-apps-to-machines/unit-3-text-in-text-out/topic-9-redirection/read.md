# Redirection: making files out of command output

Every command you have run so far has printed to the screen, and the screen is a bucket with a hole
in it — scroll far enough, close the window, and the output is gone forever. Meanwhile everything
inside `~/projects/first-site/` got there because you typed it by hand in an editor. Those two facts
are about to stop being true at the same time. A command's output is *material*: one character turns
it into a file.

## `>` sends output to a file instead of the screen

The `>` character is the **redirect operator**. Put it after a command, follow it with a filename, and
the output that would have hit your screen lands in that file instead.

```
$ cd ~/projects/first-site
$ ls -la ~ > notes.txt
```

Nothing prints. That is not a failure — that *is* the effect. The listing went into `notes.txt`. Prove
it with `cat`, which prints a file to the screen:

```
$ cat notes.txt
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects
```

That is a real capture. This particular machine happens to have a stray `index.html` sitting loose in
its home directory alongside the `projects` folder; yours will differ. The shape is the point. You
have just created a file that nobody typed.

## `>>` adds to the end instead of replacing

`>` has a sibling. `>>` **appends** — it writes to the end of the file and leaves what was already
there alone. Add a second command's output underneath the first:

```
$ wc /etc/hosts >> notes.txt
$ cat notes.txt
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects
  7  40 384 /etc/hosts
```

Two commands, one file. `wc` counts lines, words, and bytes, so `  7  40 384 /etc/hosts` says
`/etc/hosts` holds 7 lines, 40 words, 384 bytes. It is now stacked under the listing, and both are
still there.

## The difference that will cost you something

| Operator | If the file does not exist | If the file already exists |
| --- | --- | --- |
| `>` | creates it | **empties it first**, then writes |
| `>>` | creates it | writes at the end, keeps everything |

Watch what "empties it first" means:

```
$ wc /etc/hosts > notes.txt
$ cat notes.txt
  7  40 384 /etc/hosts
```

The four listing lines are gone. Not archived, not in a trash folder — gone. There was no prompt, no
"are you sure", no warning of any kind. This is the same class of hazard as `rm` in Unit 2, and it
catches people the same way: the command you *meant* to type was `>>`, and the one you typed was `>`.
Emptying an existing file this way is called **truncating** it.

Before you type `>`, ask one question: does that file already contain something I want?

## There are two output streams, not one

Now the part that is genuinely not obvious. Run a command that fails, and redirect its output:

```
$ mkdir ~/projects/first-site/x/y/z > notes.txt
mkdir: cannot create directory '.../x/y/z': No such file or directory
```

You redirected the output. The error appeared on your screen anyway. And `notes.txt`:

```
$ cat notes.txt
$
```

Empty. Two surprises in one transcript, and both have the same cause.

A command has **two** separate output streams. **stdout** ("standard output") is stream 1 — normal
results, the stuff you asked for. **stderr** ("standard error") is stream 2 — messages about what went
wrong. They are separate on purpose, so that when you capture a command's results, its complaints
still reach a human. `>` redirects stdout and nothing else, so the error rode stream 2 straight past
it to your screen. And `notes.txt` is empty because the shell creates and truncates the target file
*before* the command runs — `mkdir` then wrote nothing to stdout, so nothing arrived.

This is not trivia you will file away and never use. In Unit 5 you start a web server whose startup
banner goes to stdout while every line of its access log goes to stderr, and knowing which is which is
what lets you keep one and silence the other.

## `2>` captures the error stream

Since stderr is stream 2, `2>` is how you point it somewhere:

```
$ mkdir ~/projects/first-site/x/y/z 2> errors.txt
$ cat errors.txt
mkdir: cannot create directory '.../x/y/z': No such file or directory
```

Now the message is in a file and your screen stayed clean. (`>` is really shorthand for `1>`. Nobody
writes the `1`.)

## `/dev/null` is the deliberate wastebasket

Sometimes you do not want the output in a file *or* on the screen — you want it gone. `/dev/null` is a
special file that discards everything written to it and never grows:

```
$ mkdir ~/projects/first-site/x/y/z 2> /dev/null
$
```

Silence. The command still ran and still failed; you just declined to hear about it.

When is that the right thing to do? When you have already decided the failure is acceptable. A setup
line that runs `mkdir` on a folder that may or may not exist will complain every time it already does,
and that complaint is noise you have consciously chosen to ignore — `2> /dev/null` says so out loud.
The rule of thumb: discard output you have understood, never output you have not read yet.

## Where this leaves you

You can now turn any command's output into a file: `>` to create or replace, `>>` to add to the end,
`2>` for the error stream, `/dev/null` to throw it away. Your `~/projects/first-site/` folder can hold
files that no human typed. But notice what you keep doing — writing output to a file so that the *next*
command can read that file. The file in the middle is doing nothing except being a file. The next topic
removes it.
