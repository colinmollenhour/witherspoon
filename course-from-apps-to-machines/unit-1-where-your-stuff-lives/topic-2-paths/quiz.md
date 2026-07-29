# Quiz — Paths: every file has an address

---

## Question 1

**Type:** MULTIPLE_CHOICE

Four people describe the same `index.html` in your `first-site` folder. Which one points at that file
identically no matter which directory your terminal is standing in?

- `projects/first-site/index.html`
- `./index.html`
- `/home/you/projects/first-site/index.html`
- `../first-site/index.html`

**Correct option index:** 2

**Explanation:** `/home/you/projects/first-site/index.html` begins with `/`, so it is absolute —
measured from the root of the machine and identical everywhere. The specification is blunt about it:
"If the directory operand begins with a &lt;slash&gt; character, set curpath to the operand."
`projects/first-site/index.html` looks complete but has no leading slash, so it only works if you
happen to be standing in your home directory. `./index.html` explicitly means *here*, so it points
somewhere different in every directory. `../first-site/index.html` only resolves correctly if you are
standing in a sibling of `first-site`. Length and detail do not make a path absolute; the first
character does (objective 4).

---

## Question 2

**Type:** SHORT_ANSWER

Your terminal is standing in `/home/you/projects/first-site`. Write out the absolute path that
`../../projects/first-site/index.html` resolves to, and show the two steps you took to get there.

**Sample answer:** It resolves to `/home/you/projects/first-site/index.html`. Step one: the first `..`
goes up one level from `/home/you/projects/first-site` to `/home/you/projects`. Step two: the second
`..` goes up again to `/home/you`. From there `projects/first-site/index.html` walks back down, ending
at `/home/you/projects/first-site/index.html` — the same file I started next to.

**Explanation:** A grader must see three things: that the first `..` gives `/home/you/projects`, that
`../..` gives `/home/you`, and that the final absolute path is
`/home/you/projects/first-site/index.html`. The tempting mistake is to treat `../..` as "go to the
root" and answer `/projects/first-site/index.html` — but `..` moves exactly one level per use, and
two levels up from `first-site` is your home directory, not `/`. Notice also that a long-winded
relative path can land right back where it started (objective 5).

---

## Question 3

**Type:** TRUE_FALSE

On a Mac with the default filesystem, saving a file called `Index.html` next to an existing
`index.html` gives you two separate files, because the capital `I` is still visible in the Finder.

**Correct answer:** false

**Explanation:** The opposite is true, and the visible capital is exactly what makes this misleading.
APFS is "available in case-sensitive and case-insensitive variants on macOS, with case-insensitive
being the default" — so the two names are not distinguished, and you end up with one file. APFS also
"preserves both case and normalization of the filename on disk in all variants", which is why the
capital `I` you typed stays on screen and convinces you there are two. Do the same thing on Linux and
you really do get two files, with distinct inodes `4924918` and `4924919` holding `lowercase file` and
`UPPERCASE file` (objective 6).

---

## Question 4

**Type:** MULTIPLE_CHOICE

You create `first-site/Index.html` in a directory that already contains `first-site/index.html`.
Which statement is correct?

- The same file on a default Mac, and the same file on Linux
- Two different files on a default Mac, and the same file on Linux
- The same file on a default Mac, and two different files on Linux
- The same file everywhere, because a filename is only a label the operating system shows you

**Correct option index:** 2

**Explanation:** A default Mac runs case-insensitive APFS, so the two names match and you have one
file; Linux filesystems are case-sensitive, so you have two — proven by the two inode numbers
`4924918` and `4924919` with different contents. The first option assumes case-insensitivity is
universal, which is the assumption that produces a site working on a Mac and 404-ing on a Linux
server. The second option has the platforms backwards. The fourth option confuses *case-preserving*
with *case-insensitive*: the filesystem does store the capitals you typed, but on Linux it also uses
them to tell files apart. A WSL learner gets both behaviours on one machine — the Linux filesystem is
case-sensitive while `/mnt/c` is not (objective 6).

---

## Question 5

**Type:** MULTIPLE_CHOICE

You are logged in with full administrative rights and about to run `rm -r` — the command that deletes
a directory and everything inside it. Which of these four arguments destroys every user account's
files on the machine rather than something you can rebuild?

- `home/`
- `./first-site/`
- `/home/`
- `~/projects/first-site/`

**Correct option index:** 2

**Explanation:** `/home/` begins with `/`, so it is absolute and names the top-level directory holding
every user's files. Someone did exactly this: "I used `rm -r /home/` instead of `rm -r home/` as
root... Unfortunately I have no backups." `home/` has no leading slash, so it is relative and only
touches a directory named `home` inside wherever you are standing. `./first-site/` and
`~/projects/first-site/` are both bad days — they delete your running example — but they are scoped to
one project you can retype, and `~` expands to your own home directory, not to everyone's. One
character of punctuation separates the recoverable options from the unrecoverable one (objectives 4,
5).
