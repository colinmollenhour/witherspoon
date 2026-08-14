Open a terminal. Type `pwd` and press Enter.

One line comes back. It is an absolute path — the folder the shell is standing in right now.

The **shell** is the program that reads what you type and runs it. It always stands in exactly one folder. That folder is the **current working directory**. Every name without a leading `/` is measured from there. Until you ask, you do not know where you stand. That is why `pwd` exists.

Your page already lives at `~/projects/first-site/index.html`. The shell is probably not in that folder yet.

Type this and press Enter:

```
cd ~/projects/first-site
```

If the path feels long, press Tab after a few letters. The shell finishes a unique name.

Now type `pwd` again. On Linux it prints `/home/you/projects/first-site`.

## The shell moves. The file does not.

`pwd` means print working directory. It names the folder. It changes nothing.

`cd` means change directory. It is a **shell builtin**: a command the shell itself performs, not a separate program. It moves the shell. It does not move the file.

An **absolute path** begins with `/`. `pwd` always prints one, so you can read it from anywhere.

`~` is a short name for your home folder. `~/projects/first-site` starts from home, so `cd` can find it no matter where you stood.

A **relative path** does not begin with `/`. `index.html` is relative. So is `first-site`. Each is a name measured from the folder you stand in.

Walk it once and predict each line before you reveal it.

```widget
{
  "type": "terminal",
  "title": "Stand in the project, then step up",
  "host": "you@laptop",
  "cwd": "~",
  "caption": "`pwd` names the folder. `cd` moves the shell. The file stays put.",
  "lines": [
    { "cmd": "cd ~/projects/first-site", "cwd": "~/projects/first-site" },
    { "cmd": "pwd", "out": "/home/you/projects/first-site", "note": "An absolute path. Relative names you type next are measured from here." },
    { "cmd": "cd ..", "cwd": "~/projects" },
    { "cmd": "pwd", "out": "/home/you/projects", "note": "`..` is the parent. One level up. `index.html` lives one level down." }
  ]
}
```

## Same command, new folder

Stand in the project again if you have moved:

```
cd ~/projects/first-site
```

Confirm with `pwd`. Then type `ls`. With no extra words, `ls` lists the current directory. Your `index.html` is one of the names here.

Now type `cd ..` and press Enter. `..` means the parent folder — one level up.

Type `ls` again. Same command. Different names. The command did not change. The vantage point did.

That is the whole idea. `ls` does not search the machine. It reports the folder you stand in. Change folder and you change the report. If you expected `index.html` in the second listing and it is gone, you moved. The file did not.

```widget
{
  "type": "compare",
  "title": "Same `ls`, two standpoints",
  "columns": [
    { "label": "In `first-site`", "tone": "ok" },
    { "label": "In `projects`", "tone": "bad" }
  ],
  "rows": [
    { "aspect": "What `ls` lists", "cells": ["this folder", "this folder — different names"] },
    { "aspect": "`index.html`", "cells": ["here", "not in this folder"] },
    { "aspect": "A command that names `index.html`", "cells": ["finds the file", "`No such file or directory`"] }
  ],
  "caption": "The command did not change. The folder you stand in did."
}
```

Type `pwd`. You are in `/home/you/projects`. `index.html` is not here. It is still inside `first-site`.

This is why a good path can still fail. Stand in the wrong folder and type a relative name. The shell replies `No such file or directory`. The file is fine. You are standing somewhere else.

People often read that message as a broken file. It is a lookup that found nothing. The bytes on disk did not change when you typed `cd ..`. Only your vantage point did.

Run `pwd` before you decide the file is gone. If the path is not the folder you meant, move with `cd` and try the name again.

## Home, back, and the prompt

Look at the **prompt** — the text the shell prints before your cursor. On Linux it ends `$`. That `$` is not part of the command. Do not type it.

> **On a Mac.** The default shell is zsh, and the prompt ends `%`. Do not type the `%`. After the same `cd`, `pwd` prints `/Users/you/projects/first-site`.

The prompt often shows a short form of your folder before that mark. After `cd`, that text changes. Read your location from it as a glance. Use `pwd` when you want the full path.

Type `cd` with nothing after it. Bare `cd` goes to `$HOME` — your home folder. On Linux, `pwd` now prints `/home/you`. Look at the prompt: it should now show `~`.

Type `cd -`. This toggles. It returns you to the last folder and prints that path. After the step above, that path is `/home/you/projects`. The prompt updates to match.

`cd -` is the one `cd` that talks. The others stay quiet and leave the prompt to show the move. Run it twice and you swap back again.

Get back to the project from anywhere:

```
cd ~/projects/first-site
```

Confirm with `pwd`. Stay there.

The mouse is not required. You can stand in this folder from any starting point. Next you will rebuild it from the keyboard.
