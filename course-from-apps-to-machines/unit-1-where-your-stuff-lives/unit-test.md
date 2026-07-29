# Unit 1 test — Where your stuff actually lives

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Assesses:** Assesses locating your home directory on macOS, Linux, and WSL and knowing why the Desktop is the wrong place; naming what a desktop OS gives you that a tablet does not; reading a terminal prompt for your username and your platform; classifying a path as absolute or relative and writing one out; rewriting a location with `~`, `.`, and `..`; predicting case-sensitivity collisions across platforms; knowing that renaming an extension leaves the bytes alone; reading every field of an `ls -la` line; and telling a file apart from the program that opens it.

**Passing score:** 70%

## Question 1

**Type:** MULTIPLE_CHOICE

You are on a Mac and your username is `colin`. You are about to create the `projects` folder that will
hold this course's work for the next six units. Where does it belong?

- `/home/colin/projects`
- `/Users/colin/projects`
- `/Users/colin/Desktop/projects`
- `/mnt/c/Users/colin/projects`

**Correct option index:** 1

**Explanation:**

Apple states the rule in one line: "`/Users`—This directory contains one or more user
home directories. The user home directory is where user-related files are stored." So a Mac user named
`colin` has `/Users/colin`, and the project folder goes directly inside it. `/home/colin` is the Linux
and WSL location, not a Mac's — it comes from `getent passwd`, which reads
`colin:x:1000:1000:Ubuntu:/home/colin:/usr/bin/bash`. `/mnt/c` is WSL's mount point for the Windows
`C:\` drive — Microsoft shows `C:\Users\<user name>\Project` appearing as
`/mnt/c/Users/<user name>/Project$` — and it does not exist on a Mac at all. The Desktop option is the
one worth arguing with: it *is* inside your home directory, and it is still wrong. It is where files
land when nobody decides where they go, which is why college librarians list "Saving everything to
desktop/not using file directories" as a documented literacy gap. From Unit 2 onward you type this
address by hand, repeatedly (objective 1).

## Question 2

**Type:** MULTIPLE_CHOICE

Which of these is something a desktop or laptop lets you do that a tablet does not?

- Search for a file by typing part of its name
- Keep a text editor and a browser both working on the same `index.html` at the same time
- Open a web page and follow a link on it
- Install an app and then delete it later

**Correct option index:** 1

**Explanation:**

A desktop OS gives you three things a tablet withholds: two programs can work on the
same file at once, you can install a program that did not come from a store, and every file can be
addressed by a path. Holding `index.html` open in an editor while a browser loads that same file is the
first of those, and you use it in Project 1. Searching by name is the thing a phone does *best* — it is
the reason "where is this file?" stops sounding like a question with an answer. Opening a web page and
installing or deleting an app are both things a tablet does perfectly well; neither distinguishes the
platforms (objective 2).

## Question 3

**Type:** MULTIPLE_CHOICE

*(Synthesis — Topics 1 and 2.)* You open a terminal and the first thing waiting for you is:

```
colin@seamus:~$
```

Which reading of that line is correct?

- The username is `seamus`, so the home directory is `/home/seamus`
- The username is `colin` and the shell is bash, so the home directory is `/home/colin`
- The username is `colin` and the home directory is `/Users/colin`
- The username is `colin$`, because the `$` is the last character of the name

**Correct option index:** 1

**Explanation:**

The stock prompt is built from `\u@\h:\w\$`, which renders as `colin@seamus:~$` — the
username comes *before* the `@` and the machine's name after it, so `seamus` is the host, not the
person. The final `$` is the second half of the answer: Linux and WSL default to bash, whose prompt
ends in `$`, so this is a `/home/<you>` machine. The `/Users/colin` option puts the right username on
the wrong platform — macOS "uses zsh as the default login shell and interactive shell" starting with
Catalina, and zsh prints `%`, not `$`. The last option folds the prompt into the name; the `$`
"is a command prompt. It is not meant to be typed in", which is exactly why it gets copy-pasted into
places it does not belong (objectives 1, 3).

## Question 4

**Type:** TRUE_FALSE

A prompt that ends in `%` is telling you the shell is running with administrative privileges.

**Correct answer:** false

**Explanation:**

It says the opposite. The zsh manual defines the escape as "%# — A '#' if the shell is
running with privileges, a '%' if not" — so `%` is the *unprivileged* case, and it is simply what a Mac
looks like by default, because "Starting with macOS Catalina, your Mac uses zsh as the default login
shell and interactive shell." Bash draws the same distinction with the same logic: its `\$` escape
"prints `#` when uid is 0", and `$` otherwise. The character to watch for is `#`, not `%` (objective 3).

## Question 5

**Type:** MULTIPLE_CHOICE

Your terminal is standing somewhere you have not checked. You need to hand someone a path to your
`index.html` that means the same file no matter where anybody's terminal happens to be standing. Which
one qualifies?

- `~/projects/first-site/index.html`
- `projects/first-site/index.html`
- `/home/colin/projects/first-site/index.html`
- `../first-site/index.html`

**Correct option index:** 2

**Explanation:**

One character decides this: the first one. The specification is blunt — "If the
directory operand begins with a <slash> character, set curpath to the operand" — so only
`/home/colin/projects/first-site/index.html` is absolute, measured from the root of the machine and
identical everywhere. `~/projects/first-site/index.html` is the closest trap: `~` looks like a fixed
place but is an abbreviation for `$HOME`, so it resolves to a different directory for every person who
reads it. `projects/first-site/index.html` looks complete and is not — with no leading slash it only
works if you are standing in the home directory. `../first-site/index.html` needs you to be standing in
a sibling directory. This distinction has permanent consequences: someone ran `rm -r /home/` instead of
`rm -r home/` as root and reported "Unfortunately I have no backups" (objective 4).

## Question 6

**Type:** SHORT_ANSWER

Your terminal is standing in `/home/colin/projects/first-site`, and your username is `colin`. Write the
location of `/home/colin/projects/first-site/index.html` three more ways — once using `~`, once using
`.`, and once using `..` — and say what each of the three symbols stands in for.

**Sample answer:**

- Using `~`: `~/projects/first-site/index.html`. `~` is an abbreviation for my home directory,
  `/home/colin`, so the shell expands it back into that path before anything else happens.
- Using `.`: `./index.html`. `.` means *the directory I am standing in right now*, which is
  `/home/colin/projects/first-site`, so this resolves to the same file.
- Using `..`: `../first-site/index.html`. `..` means *one level up* — from `first-site` that is
  `/home/colin/projects` — and then I walk back down into `first-site` and name the file.

All four spellings name one file. Only the first one, `/home/...`, is true from anywhere; the `.` and
`..` versions depend entirely on where I am standing, and the `~` version depends on who I am.

**Explanation:**

A grader must see:

(1) three distinct correct rewrites — a `~` form, a `.` form, and a `..` form —
that all resolve to `/home/colin/projects/first-site/index.html` from the stated starting directory;
(2) `~` identified as an abbreviation for the home directory rather than as a folder of its own;
(3) `.` identified as the current directory and `..` as exactly one level up, not "the top".

The specification grounds `~` directly: bare `cd` behaves "as if the directory named in
the HOME environment variable was specified as the directory operand", and `~` is that same value spelled
out inline. The common wrong answer treats `..` as "go back to the start" and writes
`../projects/first-site/index.html`, which from `first-site` lands in `/home/colin/projects/projects/`.
`..` moves exactly one level per use (objective 5).

## Question 7

**Type:** TRUE_FALSE

You rename `notes.txt` to `notes.html`. The icon changes and the file now opens in a browser, which
means the file's contents have been converted into HTML.

**Correct answer:** false

**Explanation:**

The opposite is true — nothing inside the file moved. Renaming edits the name and only
the name; every byte on disk is identical before and after, which you can see in the size field of an
`ls -la` line refusing to budge. What changed is the *hint*: the desktop read the new extension and
launched a different program against unchanged bytes. This misconception is widespread and it survives
precisely because the visible result looks like conversion — "if I save .jpg file with an .png extension
(or vice versa) the most programs will open it as normally." A real conversion rewrites the bytes and
the size changes (objective 7).

## Question 8

**Type:** MULTIPLE_CHOICE

Here is real `ls -la` output:

```
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects
```

Which statement about the `.env` row is correct?

- `.env` is a regular file of 14 bytes, and only its owner may read or write it
- `.env` has 14 links and is 1 byte long
- `.env` is a directory, which is why its permission string differs from `index.html`'s
- `.env` has mode `rw-------` because that is the mode Ubuntu's default umask gives every new file

**Correct option index:** 0

**Explanation:**

The fields run type character, three `rwx` triples, link count, owner, group, size in
bytes, modification time, name. So `-` says regular file, `1` is the link count, `colin` owns it,
`ubuntu` is the group, and `14` is the size. Its triples are `rw-`, `---`, `---`: the owner reads and
writes, group and other get nothing. The second option swaps the link count and the size, which sit on
opposite sides of the owner and group names. The third option ignores the type character — `.` and
`projects` start with `d` and *are* directories; `.env` starts with `-` and is not. The fourth option
misapplies a real fact: Ubuntu's default `umask 0022` gives new files `644`, which is `rw-r--r--` — the
mode `index.html` actually has in this listing. `.env` has been tightened past the default, not left at
it. One more thing worth naming: the trailing `.` after each permission string is an SELinux
security-context marker that Fedora and RHEL print; plain Ubuntu prints ten characters and no dot, and
neither is a fourth triple (objective 8).

## Question 9

**Type:** MULTIPLE_CHOICE

You open `~/projects/first-site/index.html` in a text editor and see the literal characters
`<h1>Ground Zero</h1>`. Without saving or closing anything, you open the same file in a browser and see
the words *Ground Zero* rendered as a large heading, with no angle brackets anywhere. What happened?

- The browser wrote out a converted copy with the tags stripped
- The text editor added the tags in order to display the file
- Nothing in the file changed; two programs interpreted identical bytes differently
- The file holds two versions, and the extension decides which one each program is given

**Correct option index:** 2

**Explanation:**

Opening one file twice removes every other variable — same path, same bytes, same size
— which leaves the program as the only thing that differed. The editor shows you every character exactly
as stored, so the tags appear as text; the browser reads those same characters as markup and draws a
page. Neither program wrote anything: the browser is reading, and the editor did not invent `<h1>` any
more than it invented the word `Ground`. The fourth option is the misconception restated as machinery —
there is one file and one set of bytes, and the extension is a hint about which program to launch, not a
switch selecting between stored versions. A file is bytes; its "type" lives in whatever opens it
(objective 9).

## Question 10

**Type:** SHORT_ANSWER

*(Synthesis — Topics 2 and 3.)* A classmate working on Linux runs `ls -la` inside
`~/projects/first-site` and the listing contains this line:

```
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
```

plus a second line identical in shape whose final field reads `Index.html`.

(a) Say what the `-`, the `1`, and the `12` each tell you.
(b) Explain why that listing is possible on Linux, and say what your classmate would have ended up with
had they created the second file on a Mac with the default filesystem.

**Sample answer:**

(a) The leading `-` is the type character and says this is a regular file; a `d`
there would mean a directory. The `1` is the link count. The `12` is the size in bytes — the field that
sits after the owner `colin` and the group `ubuntu`.

(b) Linux filesystems are case-sensitive, so `index.html` and `Index.html` are two genuinely separate
files that happen to differ by one letter. That is provable rather than assumed: on Linux the two names
carry distinct inode numbers `4924918` and `4924919` and hold different contents, `lowercase file` and
`UPPERCASE file`. On a Mac with the default filesystem, only one line would have appeared. APFS is
"available in case-sensitive and case-insensitive variants on macOS, with case-insensitive being the
default", so the second save would have landed on the first file. The capital `I` would still have been
visible on screen, because APFS "preserves both case and normalization of the filename on disk in all
variants" — case-preserving is not the same as case-sensitive, and that gap is exactly what makes this
confusing.

**Explanation:**

A grader must see:

(1) all three fields named correctly — type character, link count, size in bytes;
(2) Linux identified as case-sensitive, giving two distinct files; (3) a default Mac identified as
case-insensitive, giving one file, with the capital letter still displayed.

These two topics have to be held at once, because the listing is the evidence and the
filesystem's case rule is the explanation. A learner who reads the fields correctly but assumes case
behaves the same everywhere concludes the Mac would also show two files; a learner who knows the case
rule but misreads `1` as the size cannot say what they are looking at. The practical stake is the one
Topic 2 named: a site built on a Mac, where `Index.html` and `index.html` are quietly the same file, can
404 on a Linux server over a single capital letter. A WSL learner gets both behaviours on one machine —
the Linux filesystem is case-sensitive while `/mnt/c` is not (objectives 6, 8).
