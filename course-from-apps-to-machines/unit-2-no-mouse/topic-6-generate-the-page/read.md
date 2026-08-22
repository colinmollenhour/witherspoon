The folder is back. `~/projects/first-site/index.html` is still there from Unit 1. Open a terminal. Stand in the folder and print the file.

```bash
cd ~/projects/first-site
cat index.html
```

That is the page you typed. Now stop typing it. A page you type once is a page you retype after every wipe. You already rebuilt the folder from the keyboard. The page should be rebuilt the same way. The shell can write the bytes for you.

A program that prints text sends that text to **stdout**. Stdout is the stream that lands in your terminal unless you send it somewhere else. `echo` writes its argument to stdout, then stops.

Type this, then press Enter.

```bash
echo '<h1>Ground Zero</h1>' > ~/projects/first-site/index.html
```

`echo` would have printed that heading. The `>` sent the heading to the file instead. Single quotes keep the tags as text. The shell does not try to read them as markup.

`>` **wipes** first, then writes. Wipe means: empty the file, then put the new text in. Whatever you typed last unit is gone.

Print the file.

```bash
cat index.html
```

You should see only the heading. The old page is not sitting in a bin. The bytes were replaced. That is why `>` is the start of a generated file, not a way to add a line.

`>>` **appends**. Append means: add to the end, and leave what was already there.

```bash
echo '<p>Generated.</p>' >> ~/projects/first-site/index.html
```

```widget
{
  "type": "compare",
  "title": "Two arrows, two jobs",
  "columns": [
    { "label": "`>`" },
    { "label": "`>>`" }
  ],
  "rows": [
    { "aspect": "The file first", "cells": ["Wiped empty", "Left as it is"] },
    { "aspect": "Then", "cells": ["The new text is written", "The new text is added at the end"] },
    { "aspect": "On this page", "cells": ["Starts `index.html`", "Adds the next line"] }
  ],
  "caption": "`>` starts the file. `>>` grows it. Same path, two different jobs."
}
```

Print it again.

```bash
cat index.html
```

Two lines. The heading from `>`, then the paragraph from `>>`. You did not type those tags into an editor. The shell generated them. Run the same two commands tomorrow and you get the same file. That is the point of generating, not typing.

Run the first `echo` with `>` again and the paragraph vanishes. Wipe, then write. That is the whole difference. Use `>` once, at the start. Use `>>` for every line after that. Swap them and you either wipe the page or append to yesterday's markup.

![Simulation of one file written twice. Cat prints the page from Unit 1. Echo on its own prints the heading to the terminal; adding a redirect empties index.html first and only then writes the heading into the empty file. A double arrow appends a paragraph without emptying anything. Running the first line again empties the file a second time, so the appended paragraph is gone, and the ledger of line counts reads one, zero, one, two, zero, one.](assets/viz/wipe-then-write.svg "Play it, or step through the phases. The empty frame is the whole difference between the two arrows.")

A **pipe** (`|`) hands one program's stdout to the next program as input. The next program reads what this one printed. Nothing extra is written to disk. That is the other fork from stdout. `>` puts the printout in a file. `|` hands the printout to another program. Both steal the text from the screen. Only `>` leaves a file behind.

```bash
ls ~/projects | wc -l
```

`ls` lists names. `wc -l` counts lines. The `|` means: do not print the listing; give it to `wc`.

When `wc -l` is given a file, the shape is a count and a name.

```
7 /etc/hosts
```

That seven is a capture of `/etc/hosts`, not a number for your folder. Your `ls` count is yours. Read the number your shell prints. Do not copy the seven.

```widget
{
  "type": "flow",
  "direction": "row",
  "title": "A pipe is a hand-off",
  "steps": [
    {
      "label": "`ls ~/projects`",
      "sub": "prints names",
      "detail": "Each name is a line of **stdout**. Without a pipe those lines hit the terminal."
    },
    {
      "label": "`|`",
      "sub": "hands them on",
      "detail": "The next program reads what this one printed. Nothing is written to disk."
    },
    {
      "label": "`wc -l`",
      "sub": "counts the lines",
      "detail": "You read the number it prints. That number is yours — do not copy a count from another file."
    }
  ],
  "caption": "The listing never lands on the screen. `wc` is the only thing that prints."
}
```

A pipe can have a second stage. `grep` is one you will meet later. Given one file it prints `line:text`. Given a directory it prints `path:line:text`. You do not need `grep` to build this page. The pipe you just ran is enough: list, then count.

If a line on disk needs a small edit, open an editor. Check you have one first.

```bash
which nano
```

A path means **nano** is on this machine. Nano is a small text editor. Ubuntu and Fedora ship it by default.

**On a Mac.** Do not assume `nano` is there. Trust `which nano`, not a memory of older Macs.

**On Windows / WSL.** Run `which nano` here too. Do not assume the name is present.

> **Edit in place, or leave.**
>
> `nano index.html` — `Ctrl-O` writes the file, `Ctrl-X` leaves.
>
> If you land in **vim** instead, you are in a full-screen editor that swallows ordinary keys. Press `Esc`, type `:q!`, then Enter. That leaves without saving.

`command not found` after a name means that name is not on your path. People read that as "not installed". Either way, you cannot run it until `which` prints a path.

You do not need nano for this page. The two `echo` lines already built it. Nano is the escape hatch for a typo already on disk. The page itself should stay generated. If you rebuild the folder later, you rebuild the page with `echo`, not with the mouse.

Print what you made.

```bash
cat index.html
```

Two lines. Generated bytes. Same path as Unit 1. Different origin. Last unit the file existed because you typed it. Now it exists because the shell wrote it.

The folder is rebuilt from the keyboard. The page is generated, not mouse-typed. Next you look at the machine itself — the box that holds this file.
