# Pipes: connecting programs to each other

`~/projects/first-site/index.html` exists, you have edited it by hand, and you can now turn any
command's output into a file with `>` and `>>`. But look at what it costs to answer a small question
like *how many folders under `~/projects` have "site" in the name*: save a listing to a file, search
the file, count the results — three commands, and now you are holding a file you never wanted.

## The idea

The pipe character `|` connects two running programs. It takes what the program on its left prints —
its **standard output**, or stdout, the stream you redirected in the last topic — and hands it to the
program on its right as that program's **standard input**, or **stdin**: the text a program reads
when you do not hand it a filename.

That is the whole new idea. Everything on either side of a `|` is a command you already know.

```
ls -la ~/projects | grep site | wc -l
```

Two pipes, three programs, one number.

## What each stage receives

**Stage 1 — `ls -la ~/projects`** prints one line per entry. Here is a real `ls -la` capture taken one
level up — in the folder that *contains* `projects` — so you can see the shape of the text that
leaves this stage:

```
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects
```

Permissions first, name last, one entry per line. Run it on `~/projects` and you get the same shape
with different names. That is what the first pipe carries: lines of text. Not a table, not a file —
text.

**Stage 2 — `grep site`** receives those lines on its stdin. Notice there is no filename after
`grep`. In Unit 2 you always gave it something to search; here it is handed text, so it searches
what arrives, printing the lines containing `site` and dropping the rest.

`grep` labels each match with where it came from. Search a directory and you get `path:line:text`,
like this real capture:

```
README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),
```

Search one file and the `path:` part disappears — there is only one path it could be. Search text
arriving on a pipe and both disappear, because that text came from no file at all.

Right now `~/projects` holds one thing, `first-site`, and its line is the only one containing `site`.
So exactly one line leaves stage 2.

**Stage 3 — `wc -l`** counts lines. Given a filename it prints the count *and* the name —
`wc -l /etc/hosts` prints `7 /etc/hosts`. Given text on stdin there is no name to print, so you get
the number alone. One line arrived, so the pipeline prints `1`.

Verify it by eye: run `mkdir -p ~/projects/second-site`, re-run the same pipeline, and the answer
becomes `2` — two folders match `site`, two lines survive stage 2, `wc -l` counts two. Then
`rm -r ~/projects/second-site` to put things back.

## A connection, not a container

This is the distinction people get wrong. `>` makes a **container**; `|` makes a **connection**.

| | `>` | `\|` |
|---|---|---|
| What follows it | a filename | a command |
| What it makes | a file on disk | a link between two running programs |
| Where the text goes | into the file | into the next program's stdin |
| When it finishes | the file is still there | nothing is left behind |
| How you check | `cat listing.txt` | there is nothing to `cat` |

Nothing in `ls -la ~/projects | grep site | wc -l` creates a file — not even a temporary one that
gets cleaned up. The three programs run at the same time and text flows between them while they run.
Run `ls` afterwards and your folder is exactly as it was.

Two mistakes follow from confusing them. `ls -la ~/projects > grep site` makes the shell read `>` as
"the next word is a filename", so it creates a file called `grep` and treats `site` as one more thing
for `ls` to list — no searching happens at all. `grep -rn "http" ~/projects | matches.txt` makes the
shell try to *run* `matches.txt` as a program, and it reports `command not found`.

The rule is short: if what comes next is a program, use `|`. If it is a filename, use `>`.

## The everyday use: `| less`

You know `less` as the pager that shows a long file one screen at a time, and `q` as the way out. A
pipe lets you page *any* command's output, not just a file:

```
history | less
grep -rn "http" ~/projects | less
```

`less` normally takes a filename; here it takes text on stdin and behaves identically — arrow keys to
move, `q` to quit. This is the fix for output that scrolls off the top of the screen, and nothing is
written to disk.

## The payoff: a file that nobody typed

Everything so far has read or counted. Now produce something. `echo` is a program whose entire job is
to print its argument to stdout — useless alone, useful the moment you point that stdout somewhere.

```
cd ~/projects/first-site
echo "<title>First Site</title>" > index.html
echo "<h1>Hello from the terminal</h1>" >> index.html
```

The only change from the last topic is where the content comes from: before, `>` captured a listing
you asked for; now it captures a line you dictated. Note the two different arrows. The first does
exactly what Topic 9 warned about — `>` truncates, so whatever you hand-edited into `index.html` is
gone, deliberately. The second uses `>>` so it adds rather than replaces.

Check the result:

```
cat index.html
wc -l index.html
```

`cat` prints the two lines back. `wc -l` prints `2 index.html` — count, then name, the same shape as
`7 /etc/hosts`. Now pipe it instead: `cat index.html | wc -l` prints just the number, with no
filename beside it, because `wc` was never told a filename. It was handed text.

Those two lines are a title and a heading, and that is all the HTML this course needs from you. The
point is not the tags — it is that `index.html` is a file of bytes and a program just wrote them.
Nothing checked that the bytes were HTML; the `.html` is a hint about what is inside, not a rule the
machine enforces — the idea from Unit 1, now happening in front of you. The *name* matters later:
when a directory is requested, the web server in Unit 5 looks for a file called exactly `index.html`.

## Where this leaves you

`~/projects/first-site/index.html` now contains content produced by commands rather than typed by
hand, and you can chain any programs you know into a single line. That is the state Project 3 grades:
a page you generated. The next question is not what is *in* the file — it is how anything outside
this machine could ever ask for it, which means the machine needs an address.
