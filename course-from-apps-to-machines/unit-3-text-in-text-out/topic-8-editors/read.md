# Editing in place: nano, VS Code, and how to escape vim

You are standing in `~/projects/first-site/`. `index.html` is right there — you can list it, read it,
search it. Now you need to change one line inside it, and the only route you know is to leave: switch
to the desktop, hunt down the folder, double-click the file, wait for an app to open, edit, save,
switch back. That round trip costs more than the edit does, and it throws away the one advantage you
spent two topics earning — you are already standing exactly where the file is.

The terminal has editors of its own. You need two of them, and one escape route.

## Check first: `which nano`

`nano` is a text editor that runs inside the terminal window you already have open. Before you build
a habit on it, find out whether your machine actually has it. `which` locates a program on disk — you
met it in Topic 7:

```
which nano
```

If nano is installed, you get a path back. If you get nothing back, nano is not on this machine, and
the last section of this page is for you.

Whether you get a path depends on which machine you are sitting at, and this is not a formality:

| Platform | Is `nano` there? |
| --- | --- |
| Ubuntu | Yes, by default — `Priority: standard`, and both `ubuntu-standard` and `ubuntu-wsl` depend on it [src 34] |
| Ubuntu on WSL | Yes — the default image contains `nano 7.2-2ubuntu0.1` [src 130] |
| Fedora | Yes — `nano-default-editor` is in `@standard`, and it sets `$EDITOR` [src 34] |
| macOS | **Unconfirmed.** Run the check and believe your own machine. |

Nobody is being coy about that last row. This course could not confirm that nano ships on current
macOS, so it will not tell you that it does. Check, then rely. That habit outlives the editor.

## nano: the ten-second fix

```
nano index.html
```

The file fills the window. Type where you want to type. Arrow keys move the cursor. There is no mode
to enter, nothing to click, and no menu. It behaves the way you expect a text box to behave.

The one part that is not obvious is the row of shortcuts pinned to the bottom of the screen, which
includes these two:

```
^O Write Out          ^X Exit
```

`^` is not a character you type. It is shorthand for the Control key. `^O` means *hold Control and
press O*. That single piece of notation is the only thing standing between you and this editor — once
you can read it, the bottom bar stops being noise and becomes the manual, permanently on screen.

Two of those shortcuts do the entire job:

- **`Ctrl-O` — Write Out.** This is save. nano then asks you to confirm the filename it is about to
  write; the name is already filled in, so press Enter. "Write Out" is a strange word for save, which
  is precisely why reading the bar beats guessing.
- **`Ctrl-X` — Exit.** This closes nano and hands your prompt back. If you have unsaved changes, nano
  asks whether to save them first rather than discarding them silently.

So the whole edit, start to finish:

```
nano index.html          ← new: opens the file in the terminal
                         ← change your line
Ctrl-O                   ← new: save
Enter                    ← confirm the filename
Ctrl-X                   ← new: quit
```

One command and three keystrokes. You never changed directory, never touched the mouse, and the shell
you come back to is the same shell, in the same place, with the same history.

## `code .` — and why the dot is a folder

nano is right for one line. It is wrong for an afternoon. When you are moving between files, renaming
things, and want to see the whole project at once, you want Visual Studio Code, and the command that
opens it is `code`. Check for it the same way you checked for nano: `which code`.

Then, from inside `~/projects/first-site/`:

```
code .
```

`.` is the current directory. So that command does not say "open a file". It says **open this
folder** — and the editor opens with a sidebar listing everything inside `first-site/`, `index.html`
included.

That is not a convenience. It is the design. A project is a directory tree, not a file. In Unit 1 you
came at this from the other side: `index.html` is not a loose object floating on a screen but a thing
sitting at a path, inside a folder, inside your home directory. Editors were built by people who
already believed that. Open the folder and the editor knows what else exists and what the file sits
next to. Open one bare file and the editor knows nothing but that file — the same blindness you had
before Unit 1.

## vim: the fire exit

Sooner or later you will land in `vim` without asking for it. Something on the machine needs a line of
text from you, launches whatever editor it was configured to launch, and that editor is vim. You start
typing, the wrong things happen, and it is not obvious that quitting is even available.

You are in extremely good company. "How do I exit Vim?" has **3,316,707 views** and is the most-viewed
question on Stack Overflow [src 160] — more viewed than any question about any language, framework, or
bug. This is not your failure. It is the single most common moment in the history of the profession.

The way out:

1. Press **`Esc`**. This leaves whatever mode you are in and returns to the mode where keys are
   commands rather than text.
2. Type **`:q!`** and press Enter. `:` starts a command, `q` is quit, and `!` means *do it anyway*,
   discarding unsaved changes.

That is all you are learning about vim here. It is a fire exit, not a room.

## If `which nano` came up empty

Then `vi` is your floor. It is the editor that Unix-like systems ship as a matter of course — the one
you can count on finding when nothing else is installed — and this course does not teach its editing
model. What matters is that `Esc` then `:q!` gets you out of it too, so landing there is never a trap.
For real editing on a machine without nano, use `code .`.

## Where this leaves you

You can now change any line of `~/projects/first-site/index.html` without leaving the terminal, and
you can escape any editor you fall into. What you cannot yet do is stop typing. Everything in that
file got there because your fingers put it there — and a machine that can list, read, and search files
can also *produce* them. Next: how to take what a command prints and put it into a file, so the page
is generated rather than typed.
