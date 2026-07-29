# A tablet hides the filesystem; a dev machine hands it to you

You have almost certainly never told a phone where a file is. You type three letters into a search box
and the thing appears. That works so well that "where is that file?" stops sounding like a question
with an answer. A desktop or laptop works the other way around: every file sits at exactly one written
address, and the tool you are about to open — the terminal — cannot search on your behalf. It has to
be told where to look. That is the gap this unit closes.

## You are not behind, you are unlocated

College librarians writing in ACRLog in 2024 listed what they watch students struggle with:

> "Not understanding how to navigate Microsoft OneDrive vs computer file directories (or: why doesn't
> my paper show up on the computer?)" · "Saving everything to desktop/not using file directories" ·
> "Unable to use browser (only uses phone applications)"

and, flatly:

> "The technical understanding of computers, programs, and how they work just isn't there in many
> young adults"

That describes a cohort, not you. Nobody taught this because nobody needed it. You need it now, and
it takes one unit.

## What a desktop machine gives you that a tablet does not

Three things, and each one matters later in this course:

1. **Two programs can work on the same file at once.** A text editor holds `index.html` open while a
   browser loads that same file. On a tablet, a file effectively belongs to whichever app made it.
2. **You can install a program that did not come from a store.** In Unit 5 you start a web server
   that nobody packaged or shipped to you.
3. **Every file can be addressed by a *path*.** A path is a file's one written address, spelled from
   the top of the machine downward with `/` between each step — like
   `/home/colin/projects/first-site/index.html`. Search *finds* a file; a path *names* it.

```widget
{
  "type": "compare",
  "title": "The same three questions, asked of each machine",
  "columns": [
    { "label": "Tablet or phone", "tone": "bad" },
    { "label": "Desktop or laptop", "tone": "ok" }
  ],
  "rows": [
    {
      "aspect": "Who owns a file",
      "cells": [
        "Whichever app made it. Another app gets a copy, if it gets anything",
        "Nobody. Two programs can hold the same file open at once"
      ]
    },
    {
      "aspect": "Where a program comes from",
      "cells": [
        "A store, which decides what exists",
        "Anywhere — including a web server nobody packaged or shipped to you"
      ]
    },
    {
      "aspect": "How you find something",
      "cells": [
        "You search, and hope the name you remember is the name it has",
        "You name it: one written address, spelled from the top of the machine down"
      ]
    }
  ],
  "caption": "The third row is the one this whole unit is about. Search *finds* a file; a path *names* it."
}
```

## Where your own work belongs

Each of these systems gives every person one folder that is theirs: the **home directory**. Your work
goes there. Find your row:

| Your platform | Your home directory | The other operating system's files |
| --- | --- | --- |
| macOS | `/Users/<you>` | — |
| Linux (Ubuntu, Fedora, …) | `/home/<you>` | — |
| Windows, via WSL | `/home/<you>` (inside Ubuntu) | under `/mnt/c` |

`<you>` is your username — the short one, no spaces. Apple documents the macOS location:

> "`/Users`—This directory contains one or more user home directories. The user home directory is
> where user-related files are stored."

On Linux it reads `/home/colin` for a user named `colin`.

**Not the Desktop.** The Desktop is where files land when you do not decide where they go — which is
exactly why the librarians above listed "saving everything to desktop" as a literacy problem. From
Unit 2 onward you type your project's address by hand, repeatedly. Pick a place on purpose.

## If you are on Windows: you have two filesystems, and it matters

WSL (Windows Subsystem for Linux) runs a real Ubuntu inside Windows, so you get two worlds. Microsoft
shows the seam directly — your Windows `C:\Users\<user name>\Project` folder

> "will look like this when mounted in a WSL command line: `/mnt/c/Users/<user name>/Project$`."

So `/mnt/c` is the Windows side seen from Linux; `/home/<you>` is the Linux side. Microsoft is
unusually blunt about which one to use:

> "We recommend against working across operating systems with your files, unless you have a specific
> reason for doing so. For the fastest performance speed, store your files in the WSL file system if
> you are working in a Linux command line (Ubuntu, OpenSUSE, etc)"

and gives the contrast as two paths:

> "Use the Linux file system root directory: `/home/<user name>/Project` — Not the Windows file
> system root directory: `/mnt/c/Users/<user name>/Project$`"

```widget
{
  "type": "tree",
  "title": "One machine, two filesystems, seen from a WSL terminal",
  "root": {
    "name": "/",
    "note": "the Linux root — everything WSL sees hangs off here",
    "children": [
      {
        "name": "home/",
        "note": "the Linux side",
        "children": [
          {
            "name": "<you>/",
            "note": "what `~` expands to",
            "children": [
              { "name": "Project/", "tone": "ok", "note": "put your work here — fastest, and the one Microsoft recommends" }
            ]
          }
        ]
      },
      {
        "name": "mnt/",
        "note": "where Windows drives are attached",
        "children": [
          {
            "name": "c/",
            "note": "the Windows `C:` drive, seen from Linux",
            "children": [
              {
                "name": "Users/",
                "children": [
                  {
                    "name": "<user name>/",
                    "children": [
                      { "name": "Project/", "tone": "bad", "note": "the same folder from the Windows side — working here crosses the seam on every file access" }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "caption": "Two real places, one terminal. `/mnt/c` is Windows seen from Linux; `/home/<you>` is Linux itself."
}
```

Decide this now. It is the one setup choice that nags you for the rest of the course.

## Install this before Unit 5, not during it

- **macOS ships no Python.** Type `python3` and you get a dialog box: *"The "python3" command
  requires the command line developer tools. Would you like to install the tools now?"* Say yes, or
  run `xcode-select --install`, which "opens a user interface dialog to request automatic installation
  of the command line developer tools."
- **Windows needs WSL itself.** One command: `wsl --install`. Microsoft's requirement: "You must be
  running Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11". You get Ubuntu
  by default.
- **Linux and WSL are already set.** Ubuntu's WSL package manifest lists `python3`, `curl`, and
  `nano` as present.

## Open a terminal and find your name in it

The terminal is a window where you type instructions instead of tapping them. Open yours:

| Platform | App | Note |
| --- | --- | --- |
| macOS | Terminal | "In the Finder, open the /Applications/Utilities folder, then double-click Terminal." |
| Linux | **Ptyxis** | The default since Ubuntu 25.04 and Fedora Workstation 41 — older tutorials say GNOME Terminal |
| Windows | Windows Terminal | "We recommend using WSL with Windows Terminal" — then open your Ubuntu tab |

A line of text is waiting for you. That is the **prompt**: the machine saying it is ready. On Linux
and WSL the stock one looks like this:

```
colin@seamus:~$
```

Everything before the `@` is the username — here, `colin`. That is the `<you>` in `/home/<you>`. The
last character is a platform tell. Linux and WSL default to the **bash** shell, whose prompt ends in
`$`. macOS has used **zsh** since Catalina — "Starting with macOS Catalina, your Mac uses zsh as the
default login shell and interactive shell" — and zsh prints `%`. So `$` means bash; `%` means a Mac.
If your Mac's prompt does not show your username, Unit 2 hands you a command that prints it.

## Where you now stand, and what is next

You have a terminal open, and you can say your home directory's full path out loud: `/Users/` or
`/home/` followed by the name you just read out of your own prompt. That is the address everything in
this course hangs off.

Here is what you will build: one folder, `projects`, containing one folder, `first-site`, containing
one file, `index.html`. That is `/home/<you>/projects/first-site/index.html` on Linux or WSL, and
`/Users/<you>/projects/first-site/index.html` on a Mac. You will also see it written
`~/projects/first-site/index.html`; Topic 2 explains that shorthand. By the end of this course that
one file loads on your phone, over Wi-Fi, at a real web address.

You cannot create it yet, because you cannot yet write a path the machine will accept. That is the
next topic.
