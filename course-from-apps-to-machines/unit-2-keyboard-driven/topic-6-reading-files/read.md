# Reading files without opening an app

`~/projects/first-site/index.html` is on disk, and so far the only way you have looked inside it is
to open a text editor: launch the app, wait for the window, find the file, read four lines, close it
again. That is a lot of machinery for one small question. The terminal answers it before an editor
has finished loading — and answers questions an editor cannot, like "which file anywhere under
`~/projects` mentions `http`?"

For every example below, assume your file looks like this. Yours will differ, and that is fine; the
commands are the point, not the contents.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My first site</title>
  </head>
  <body>
    <h1>Hello from my own machine</h1>
  </body>
</html>
```

That is ten lines, with `<title>` on line 4. Keep those two numbers in mind — the commands below
will report them back to you.

## `cat` prints the whole file

```
$ cd ~/projects/first-site
$ cat index.html
<!DOCTYPE html>
<html>
  <head>
    <title>My first site</title>
  </head>
  <body>
    <h1>Hello from my own machine</h1>
  </body>
</html>
$
```

`cat` reads the file and writes its bytes onto your screen, then hands the prompt straight back. No
window opens, nothing waits for you to close it, and the file is unchanged — `cat` only reads.

`cat` is the right tool when the file fits on one screen. Ten lines fits. Ten thousand does not:
`cat` would scroll the whole thing past you at full speed and leave you staring at the last
screenful. For that you need a pager.

## `less` pages a long file — and `q` gets you out

Before you run `less` even once, learn how to leave it.

> **Press `q` to quit `less`.** One key, no Enter needed. That is the entire escape.
>
> `less` takes over the whole screen and your prompt disappears. Typing does not echo. Nothing looks
> like it is working. You are not stuck and nothing is broken — the program is simply waiting for a
> command instead of text. `q` ends it and your prompt comes back.

This is worth taking seriously. The single most-viewed question in Stack Overflow's history is "How
do I exit Vim?" — **3,316,707 views** — and the person asking wrote "I am stuck and cannot escape."
[src 160] Being trapped in a full-screen program is the most common beginner emergency there is.
You now know the way out before you have walked in.

A **pager** is a program that shows a file one screenful at a time and waits for you between
screens:

```
$ less index.html
```

Space moves forward one screenful, the arrow keys scroll a line at a time, and `q` quits. Try it on
`index.html` right now, even though it is far too short to need paging. Nothing new happens except
the pager itself, so the only thing you are practising is `q`.

| Situation | Use | Why |
|---|---|---|
| Short file you want the whole of | `cat` | Prints and returns; the output stays in your scrollback |
| File longer than your screen | `less` | Stops each screenful so you can read it, and lets you go back up |
| You just want the top or bottom | `head` / `tail` | No paging needed at all |

## `head` and `tail` take the ends

Often you do not want the file, only enough of it to know what it is — which the first few lines
usually tell you.

```
$ head -3 index.html
<!DOCTYPE html>
<html>
  <head>
$ tail -2 index.html
  </body>
</html>
```

`head -3` prints the first 3 lines, `tail -2` the last 2. Change the number to change how many.
Both return the prompt immediately, like `cat`.

## `wc` counts what is in a file

`wc` is short for word count, though it counts three things at once. This is a real run against
`/etc/hosts`, a small text file that exists on every Mac and Linux machine:

```
$ wc /etc/hosts
  7  40 384 /etc/hosts
$ wc -l /etc/hosts
7 /etc/hosts
```

Bare `wc` gives you three columns in a fixed order — **lines, words, bytes** — followed by the
filename. So `/etc/hosts` there is 7 lines, 40 words, 384 bytes. `wc -l` keeps only the line count
and drops the other two columns. [src 27]

Run `wc -l index.html` on the example file above and you get `10 index.html`. That is a fact about
your file you did not have to open anything to learn.

## `grep` finds the line you want

`grep` prints every line of a file that contains the text you asked for. Add `-n` and it puts the
line number in front:

```
$ grep -n "<title>" index.html
4:    <title>My first site</title>
```

You just found the `<title>` line of your page, and its line number, without opening an editor.
Quote the search text — `"<title>"` — because the angle brackets mean something special to the shell
if you leave them bare.

## `grep -r` searches a whole folder

`-r` means **recursive**: search this directory, and every directory inside it, and every directory
inside those, all the way down.

```
$ grep -rn "http" ~/projects
```

Here is a real line of `grep -rn` output, captured from a different project folder:

```
README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),
```

Read it as **three fields, split on the first two colons**:

| Field | Value here | Meaning |
|---|---|---|
| path | `README.md` | which file the match is in |
| line | `179` | which line number in that file |
| text | `**Activity types** (9): readings, lectures, …` | the matching line itself, printed whole |

Only the *first two* colons are separators. Every colon after that belongs to the line's own text —
which is why the third field of that example contains colons of its own. Split greedily and you will
mangle the result.

## The prefix that comes and goes

Compare the two outputs above and something looks broken:

```
4:    <title>My first site</title>
README.md:179:**Activity types** (9): readings, …
```

Two fields in one, three in the other. This is not a bug and not a version difference. **When you
point `grep` at one single file, it leaves the `path:` prefix off** — you already know which file you
searched, so repeating it on every line would be noise. Search a directory and the path is the only
thing telling you where each match came from, so it appears. If you want the filename even on a
single-file search, `-H` forces it on. [src 26]

Learners hit this and conclude the output format is unreliable. It is not — it just depends on
whether you gave `grep` one file or a directory.

**On a Mac:** your `grep` is BSD grep rather than the GNU grep on Linux. `-r` ("Recursively search
subdirectories listed.") and `-n` ("Each output line is preceded by its relative line number in the
file") behave identically, so everything above works. Other flags do differ between the two, so
check `man grep` on your own machine before trusting a flag you read somewhere else. [src 25]

## Where this leaves you

You can now read any file under `~/projects` and find any line in it without launching an
application: `cat` for short files, `less` for long ones with `q` to escape, `head` and `tail` for
the ends, `wc -l` to count, and `grep -rn` to search a whole tree and read the `path:line:text` it
gives back.

Reading is half of it. You still cannot *change* `index.html` without an editor — and the next topic
hands you one that lives inside the terminal.
