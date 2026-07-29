# Paths: every file has an address

Your terminal is open and you know your home directory's absolute path. The thing you are going to
build over this course has a name already: `~/projects/first-site/index.html`. That string is not a
description of the file — it is the file's address, and it is written in a grammar with about four
pieces of punctuation in it. Learn the grammar now and you will never again have to guess where
something lives.

## The one rule that does the most work

The Open Group publishes the specification that defines how Unix-like systems — macOS, Linux, and the
Linux running inside WSL — interpret a directory you name. Its rule for the very first character is
this:

> "If the directory operand begins with a &lt;slash&gt; character, set curpath to the operand and
> proceed to step 7."

Strip the jargon and it says: **look at the first character.** If it is `/`, stop looking anywhere
else — the path is **absolute**, measured from the root of the whole machine. The root is the single
directory that contains every other directory, and its name is just `/`. If the first character is
anything else, the path is **relative**, measured from wherever your terminal happens to be standing
right now.

That is the whole distinction. One character. An absolute path means the same thing typed anywhere on
the machine; a relative path means something different depending on where you are.

## Your project, written out in full

Here is `~/projects/first-site/index.html` with nothing abbreviated:

| Platform | The full absolute path |
| --- | --- |
| macOS | `/Users/you/projects/first-site/index.html` |
| Linux | `/home/you/projects/first-site/index.html` |
| WSL | `/home/you/projects/first-site/index.html` |

Read one of them left to right and it is a set of directions from the top of the machine: start at
`/`, go into `Users` (or `home`), go into your personal folder, go into `projects`, go into
`first-site`, and there is the file `index.html`. Six pieces, no ambiguity. WSL matches Linux because
WSL *is* Linux — the Windows `C:` drive is a separate thing mounted at `/mnt/c`, and your project is
not going there.

```widget
{
  "type": "anatomy",
  "title": "Your project's address, one piece at a time",
  "subject": "Click any piece of the path to see what it does.",
  "parts": [
    { "text": "/", "label": "root", "note": "The one directory that contains every other directory on the machine. Because the path *starts* here, it is **absolute** — it means the same thing typed from anywhere." },
    { "text": "home", "label": "all users", "note": "Where Linux and WSL keep every user account's directory. macOS calls this `Users` instead. Nothing of yours lives directly here — only the folders belonging to each account." },
    { "text": "/" },
    { "text": "you", "label": "your account", "note": "Your personal directory, and what `~` expands to. `HOME` holds this value, which is why `~` can differ per person and per platform while meaning the same thing." },
    { "text": "/" },
    { "text": "projects", "label": "yours", "note": "An ordinary directory you made. Nothing about the system requires it — the machine does not know or care that this is where you keep work." },
    { "text": "/" },
    { "text": "first-site", "label": "yours", "note": "The directory holding this one project. Everything the site is made of will live inside here." },
    { "text": "/" },
    { "text": "index.html", "label": "the file", "note": "The last piece, and the only one that is not a directory. The `.html` on the end is part of the name — not a separate property of the file." }
  ],
  "caption": "Six pieces separated by slashes. Read left to right, they are directions from the top of the machine."
}
```

## `~` is an abbreviation, not a place

`~` (a tilde) is shorthand for your home directory. It exists because that path is long, differs per
platform, and differs per person. The same specification explains where the value comes from:

> "If no directory operand is given and the HOME environment variable is set to a non-empty value,
> the cd utility shall behave as if the directory named in the HOME environment variable was
> specified as the directory operand."

`HOME` is a stored value — `/Users/you` on a Mac, `/home/you` on Linux and WSL — and `~` expands to
it before anything else happens. So:

| You write | On macOS it means | On Linux and WSL it means |
| --- | --- | --- |
| `~` | `/Users/you` | `/home/you` |
| `~/projects` | `/Users/you/projects` | `/home/you/projects` |
| `~/projects/first-site/index.html` | `/Users/you/projects/first-site/index.html` | `/home/you/projects/first-site/index.html` |

`~` does not start with `/`, but it expands into something that does, so it lands you at an absolute
location. Nothing special lives behind the tilde. It is typing shorthand.

## `.` and `..` are movement

These two only make sense once you say where you are standing. Say your terminal is standing in
`/home/you/projects/first-site`. Then:

| You write | It resolves to |
| --- | --- |
| `index.html` | `/home/you/projects/first-site/index.html` |
| `./index.html` | `/home/you/projects/first-site/index.html` — identical; `.` means *here* |
| `..` | `/home/you/projects` — one level up |
| `../..` | `/home/you` — two levels up |
| `../../projects/first-site` | `/home/you/projects/first-site` — up twice, back down twice |
| `/index.html` | `/index.html` — a file at the root of the machine, which does not exist |

That last row is the one to sit with. Adding a single `/` to the front did not tidy the path up; it
pointed it at a completely different place.

```widget
{
  "type": "terminal",
  "title": "Predict each answer before you reveal it",
  "host": "you@laptop",
  "cwd": "~/projects/first-site",
  "lines": [
    { "cmd": "pwd", "out": "/home/you/projects/first-site", "note": "`pwd` prints where the shell is standing right now. Every relative path below is measured from this line." },
    { "cmd": "cd ..", "cwd": "~/projects" },
    { "cmd": "pwd", "out": "/home/you/projects", "note": "`..` moved up one level, and the prompt moved with it. The shell is standing somewhere else now, so the same relative path typed twice would mean two different files." },
    { "cmd": "cd ../..", "cwd": "/home" },
    { "cmd": "pwd", "out": "/home", "note": "Two levels up from `/home/you/projects`. Keep going and you run out of levels at `/` — the root has no parent, and `cd ..` there does nothing." }
  ],
  "caption": "The same relative path means a different file depending on the answer to `pwd`."
}
```

## One slash, permanent consequences

`rm` is the command that deletes files, and `-r` tells it to delete a directory and everything inside
it. Here is a real post from someone who got the first character wrong:

> "I used `rm -r /home/` instead of `rm -r home/` as root. Is there anything I can do to restore my
> /home/ dir? ... Unfortunately I have no backups."

`home/` is relative — a directory named `home` sitting inside wherever they were standing. `/home/`
is absolute — the top-level directory holding every user account's files on that machine. Same four
letters. The slash was the whole difference. There is no recycle bin behind this; the question has
been viewed 56,565 times by people looking for a way back.

## Capital letters are not decoration

Here are two files created in one directory on Linux. An **inode** is the number a filesystem uses
internally to identify a file — different number, different file:

| Filename | inode | Contents |
| --- | --- | --- |
| `index.html` | `4924918` | `lowercase file` |
| `Index.html` | `4924919` | `UPPERCASE file` |

Two inodes, two sets of contents. On Linux, `Index.html` and `index.html` are simply two different
files that happen to look similar to you.

Do the same thing on a Mac and you get one file. Apple's own APFS documentation says the filesystem
is "available in case-sensitive and case-insensitive variants on macOS, with case-insensitive being
the default." Case-insensitive means it will not distinguish `Index.html` from `index.html` when
matching a name. But APFS also "preserves both case and normalization of the filename on disk in all
variants" — **case-preserving**. So the capital `I` you typed stays visible in the Finder forever,
while the filesystem quietly treats it as the same name as the lowercase one. That combination is
exactly what makes the bug invisible.

WSL learners get both behaviours on one machine: files in the WSL Linux filesystem "are treated as
case-sensitive by default", while "NTFS-formatted drives mounted to a WSL distribution" — that is
`/mnt/c` — "will be case-insensitive by default."

The practical consequence lands later in this course and lands hard. If your page refers to
`Logo.png` and the file on disk is called `logo.png`, it works perfectly on your Mac and returns a
404 the moment it is served from Linux. Nothing changed except which filesystem was asked the
question.

## Where this leaves you

You can now write out your own project's address in full, starting from `/`, on your own platform —
and you can say whether your filesystem would treat `Index.html` and `index.html` as one file or two.
The address is settled. The next question is what is actually sitting at the end of it: what a file
*is*, once you stop trusting the icon.
