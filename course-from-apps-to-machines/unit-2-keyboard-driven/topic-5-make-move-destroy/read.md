# Making, moving, and destroying

## Fourteen actions, or two

In Project 1 you built `~/projects/first-site/index.html` with the mouse. It took roughly fourteen
separate actions spread across three applications — a file manager to make the folders, a text editor
to make the file, a browser to open it. Topic 4 taught you to walk to that folder with `cd` and
confirm where you are standing with `pwd`. But you still cannot *build* anything without reaching for
the mouse.

Pretend the folder is gone. New laptop, borrowed machine, empty home directory. Rebuild it.

## `mkdir` makes one directory

`mkdir` is short for *make directory*. The word after the command is its **argument** — the thing you
are telling the command to act on.

```
$ mkdir projects
```

That creates a single directory named `projects` inside whatever directory the shell is currently
standing in. (The `$` is the prompt the shell prints. You type what comes after it.)

Now try the whole path at once, on a machine where `~/projects` does not exist yet:

```
mkdir: cannot create directory '.../x/y/z': No such file or directory
```

That is a real capture. `mkdir` creates the **last** part of the path you hand it and nothing else —
it will not invent the missing parents above it.

There is a second refusal. Run `mkdir` on a name that already exists:

```
mkdir: cannot create directory '.../a': File exists
```

Two commands' worth of nuisance, and both are solved by one **flag** — a short switch, starting with a
dash, that changes how a command behaves. The `mkdir` manual page says:

> `-p, --parents` — no error if existing, make parent directories as needed

Read that slowly, because it is doing two jobs. *Make parent directories as needed* kills the first
error. *No error if existing* kills the second. So:

```
$ mkdir -p ~/projects/first-site
```

works whether `~/projects` exists or not, and works again the second, fifth, and hundredth time you
run it. A command you can re-run safely without checking the state first is the safe default. Use
`-p` unless you specifically want the error.

## `touch` makes an empty file

```
$ cd ~/projects/first-site
$ touch index.html
```

`touch` creates the file if it is not there. It creates it **empty** — zero bytes, no HTML inside.
Putting content into it from the keyboard is Unit 3's job. Right now you only need the file to exist
at the right path.

## The measurement

|                       | Project 1 (mouse)          | Now (keyboard)             |
| --------------------- | -------------------------- | -------------------------- |
| Applications involved | three                      | one                        |
| Actions               | roughly fourteen           | two                        |
| To do it a second time| repeat all fourteen        | paste the same two lines   |

The two commands, in full:

```
mkdir -p ~/projects/first-site
touch ~/projects/first-site/index.html
```

That is the whole of Project 1's folder structure, rebuilt from an empty home directory. The commands
also travel: paste those two lines into a message and the person at the other end gets exactly your
folder. Fourteen mouse actions cannot be pasted anywhere.

## `cp` copies, and needs `-r` for directories

```
$ cp index.html index.backup.html
```

`cp SOURCE DEST` — the original stays, the copy appears. Hand it a directory and it refuses until you
add the recursive flag:

> `-R, -r, --recursive` — copy directories recursively

*Recursively* means: the directory, everything inside it, and everything inside those things.

```
$ cp -r ~/projects/first-site ~/projects/first-site-backup
```

## `mv` is one command doing two jobs

The manual page opens like this:

> `mv - move (rename) files`

and describes itself like this:

> Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.

One command, two meanings — and nothing in what you type tells you which one you get. The deciding
factor is the state of the filesystem when you press Enter:

- **`mv a b` where `b` does not exist** → a **rename**. `a` is now called `b`, in the same place.
- **`mv a b` where `b` already exists as a directory** → a **move**. `a` keeps its name and lands
  inside `b`.

So `mv index.backup.html archive` renames your backup to `archive`, or drops it inside `archive` —
entirely depending on whether `archive` is already a directory. When you are not sure, run `ls`
first. The command is not ambiguous; your knowledge of the folder is what is missing.

Both `mv` and `cp` will overwrite an existing destination without asking. Two flags change that:

> `-i, --interactive` — prompt before overwrite
> `-n, --no-clobber` — do not overwrite an existing file

## `rm` removes

> `rm removes each specified file. By default, it does not remove directories.`

```
$ rm index.backup.html
```

It prints nothing. Silence means it worked.

Directories need the recursive flag, exactly as with `cp`:

> `-r, -R, --recursive` — remove directories and their contents recursively

Here are the facts, once. `rm` does not move anything to a trash can, a recycle bin, or a recently-
deleted album. There is no undo and no thirty-day window. The phone habit of deleting a photo and
getting it back later does not apply here.

This is not a beginner's hazard that you grow out of. An engineer at GitLab ran `rm -rf` against the
wrong database host and destroyed live production data. The company's public postmortem
records what they found next: "out of 5 backup/replication techniques deployed none are working
reliably or set up in the first place." The person typing was a professional. What failed alongside
the typing was the backups.

Two flags decide how much protection you get:

> `-f, --force` — ignore nonexistent files and arguments, never prompt
> `-i` — prompt before every removal

`-f` removes the last thing standing between you and the mistake. `-i` asks you to confirm each file.
Use `-i` while you are learning: one keystroke per file, in exchange for a second look.

## Spaces are not part of a filename unless you say so

The shell splits the line you typed on whitespace and hands the pieces over as separate arguments. So
`cd My Project` does not pass one name with a space in it — it passes two arguments, `My` and
`Project`. This is one of the most-searched beginner traps there is; the Stack Exchange question about
copying files with spaces in their names has 55,267 views.

Two fixes, both correct:

```
$ mv "My Project" first-site
$ mv My\ Project first-site
```

Wrap the whole name in double quotes, or put a backslash immediately before each space to strip the
space of its splitting power. Pick one and stay consistent.

## Where you stand now

`~/projects/first-site/index.html` exists again, and this time you built it from an empty home
directory without touching the mouse. You can copy a file, copy a folder with `-r`, rename with `mv`,
move with `mv`, and delete with `rm` — knowing that the last one is final.

What you cannot yet do is look inside `index.html` from the shell. You made an empty file and you have
been taking its emptiness on trust. Next you learn to read a file's contents without opening an
application.
