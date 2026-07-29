# You are not supposed to memorise this

You have typed `~/projects/first-site/` by hand in three topics now, and picked up a dozen commands
on the way. If you are quietly worried that the price of using a computer this way is holding all of
it in your head — stop. Nobody does. What experienced people have instead is a handful of keystrokes
that make the machine do the remembering, and one correct way of reading the error that scares
beginners most.

## Tab finishes the typing for you

Type this much and stop:

```
cd ~/pro
```

Now press the **Tab** key — the wide key above Caps Lock. The shell fills in the rest of the folder
name, because it can see what is on the disk. Type `fir`, Tab again, and you have
`~/projects/first-site/`.

Tab is not a shortcut for fast typists, it is a correctness tool: **the shell only completes names
that exist**. If Tab does nothing, that name is not there, or you are not standing where you think
you are. A typo you never type is a typo you never debug.

If several names start the same way, the shell fills in as far as they agree and stops; press Tab
again to see the candidates. Use Tab on every path from now on.

## Up brings back what you already ran

Press the **Up arrow**. The last command you ran appears at the prompt, ready to run again or edit.
Press Up repeatedly to walk further back, Down to come forward, Left and Right to fix one character
in the line. For anything older, run `history`, which prints the commands you have run in this shell.
You are not remembering commands. You are scrolling them.

## Two ways to ask a command what it does

Every command carries its own documentation, in two forms.

**`--help` is the quick answer.** It prints and gives you the prompt straight back:

```
ls --help
```

Among the lines are these two, which you have been using without reading:

```
-a    do not ignore entries starting with .
-l    use a long listing format
```

**`man` is the full answer.** `man` is short for *manual*. Run:

```
man ls
```

and the top of the page looks like this:

```
LS(1)                          User Commands                          LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...
```

Read that `SYNOPSIS` line carefully, because **every command has this same shape**: the name, then
options, then the things to act on. Square brackets mean *optional*; `...` means *as many as you
like*. So `ls -la ~/projects/first-site` is one name, one clump of OPTIONs, one FILE — and bare `ls`
is legal because both parts are bracketed. Read a SYNOPSIS and you can drive a command you have never
met.

**`man` takes over the whole screen, and you get out with `q`.** Press it now. "How do I exit Vim?"
is the most-viewed question in Stack Overflow's history at 3,316,707 views, and it exists because a
program took the screen and nobody told the asker the exit key. `q` is your exit key here, exactly as
it was for `less`.

Rule of thumb: `--help` to remind yourself of a flag, `man` to understand what the command does.

## Ctrl-C stops a running command

`q` quits a program that is sitting there *waiting for you*. **`Ctrl-C`** — hold Ctrl and press C —
interrupts a program that is *running*: scrolling forever, searching somewhere enormous, or simply
not coming back. It stops and you get your prompt back.

Learn it now, because from Unit 5 onward you will start a program *designed* never to finish on its
own, and `Ctrl-C` is how you end it. One warning: in a terminal `Ctrl-C` interrupts, it does not
copy. Check your terminal's own copy shortcut before you assume.

## `command not found` does not mean "not installed"

This is the one to get right. Two of the most-viewed questions in the area are people misreading it:

| The error | Views on that question |
|---|---|
| `bash: pip: command not found` | 2,426,531 |
| `zsh: command not found: brew` | 1,105,124 |

Each shell words it differently and names itself — `bash` puts the command in the middle, `zsh` at
the end — so the error also tells you which shell you are in, like the `$` and `%` on your prompt.

The natural reading is "this isn't installed, so I should install it again." That is often wrong, and
reinstalling can leave you exactly where you started. The literal meaning is narrower: **the shell
looked in its list of directories and found no program by that name there.**

That list is a value the shell carries, called `$PATH`. Print it with `echo $PATH` and you get a run
of directory paths separated by colons. When you type a bare word like `python3`, the shell walks the
list in order and runs the first match. If the program is on the disk but sits in a directory that is
not on the list, the shell never sees it — and says `command not found`, which sounds like absence
but only means *not looked-in*.

To see where a command actually lives, ask:

```
which python3
```

`which` searches the same `$PATH` the shell does and prints the absolute path of the program it would
run. On a recent Mac, `python3` is documented as living at `/usr/bin/python3`; on your machine, run
it and read the answer rather than assuming one. Note that `python3` is the command that exists — a
bare `python` may not be on the machine at all, so `which python3` and `which python` can honestly
disagree. And if `which` prints a path while the command still fails, your problem is not `$PATH`,
which has just saved you an hour of reinstalling.

## The `$` in a tutorial is not part of the command

Last trap, and it costs beginners whole evenings. Tutorials write commands like this:

```
$ ls -la ~/projects/first-site
```

That leading `$` is the prompt — the same `$` your bash prompt ends with, or `%` on zsh. As one guide
states it: "The `$` character in tutorials indicates a command prompt. It is not meant to be typed
in." Copy the line including the `$`, paste, press Enter, and the shell tries to run a command named
`$` and reports it cannot find it — the very `command not found` you just learned to read, pointing
at a character you never meant to send.

It happens often enough that someone wrote a tool for nothing else, `undollar`, for when "Often when
copy-pasting terminal commands from the internet you'll inadvertently end up also having copied the
dollar sign at the beginning (especially if you triple-click to select)." You do not need the tool.
You need the habit: **look at the first character of anything you paste. If it is `$` or `%`, delete
it.**

## Where this leaves you

You can now meet a command you have never seen, learn what it does with `--help` or `man`, read its
SYNOPSIS to know what to type after it, leave the manual with `q`, stop it with `Ctrl-C`, and find
where it lives with `which` — and read `command not found` as a statement about `$PATH` rather than a
verdict on your installation.

You are not memorising this course; you are looking things up. Next comes the one thing you cannot
look your way out of: changing what is inside `index.html` without leaving the keyboard.
