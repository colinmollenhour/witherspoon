Look at the address bar. The page is already open.

Copy what you see. On Linux it should be:

`file:///home/you/projects/first-site/index.html`

That string is this file's address. An **address** is the written location of one file.

The bar shows three slashes because `file://` sits against a path that starts with `/`. You will write that path three ways before you leave this page.

## The first character

A **path** is the address of a file or a folder on the machine.

Look at the part after `file://`. It begins with `/`.

```widget
{
  "type": "anatomy",
  "title": "The address already in your bar",
  "subject": "Click any piece of the string.",
  "parts": [
    { "text": "file://", "label": "how it opened", "note": "The browser opened a file on this machine, not a page on the internet." },
    { "text": "/", "label": "root", "note": "The top of the machine. Every absolute path starts here." },
    { "text": "home", "label": "accounts", "note": "Where Linux keeps each account's folder." },
    { "text": "/" },
    { "text": "you", "label": "this account", "note": "Your home. `~` is a short name for this same folder." },
    { "text": "/" },
    { "text": "projects", "label": "projects folder", "note": "The folder that holds this site." },
    { "text": "/" },
    { "text": "first-site", "label": "this site", "note": "The folder that holds the page." },
    { "text": "/" },
    { "text": "index.html", "label": "the file", "note": "The page itself. Spell every letter exactly." }
  ],
  "caption": "After `file://`, the rest is the file's absolute path. It starts at `/`."
}
```

An **absolute path** starts with `/`. It is a route from the top of the machine. That top is **root** — the folder that contains every other folder.

If the first character is not `/`, the path is **relative**. A relative path starts from where you are standing.

```widget
{
  "type": "compare",
  "title": "Same folders, two kinds of address",
  "columns": [
    { "label": "`/home/you/projects/first-site`" },
    { "label": "`projects/first-site`" }
  ],
  "rows": [
    { "aspect": "First character", "cells": ["`/` — so **absolute**", "`p` — so **relative**"] },
    { "aspect": "Starts from", "cells": ["the top of the machine", "where you are standing"] },
    { "aspect": "Always this folder?", "cells": ["yes", "only if you are already in `/home/you`"] }
  ],
  "caption": "The first character decides the kind. The rest of the words can look the same."
}
```

`/home/you/projects/first-site` always names this folder. `projects/first-site` names a `projects` folder under wherever you are now.

Write the file's absolute path:

`/home/you/projects/first-site/index.html`

That is the same place the browser already showed you. `file://` is how the browser opened it. The path after those slashes is the address on disk.

Drop the first `/` and you get `home/you/projects/first-site/index.html`. That looks complete. It is not. It starts with `h`, so it is relative. It only names this file if you are already standing at root.

## Three short names

You will not type the full path every time. Three marks stand in for pieces of it.

**`~` is home.** Home is this account's folder. On Linux that folder is `/home/you`. So the same file is:

`~/projects/first-site/index.html`

The **shell** is the program that reads what you type. It replaces `~` with home first. The result starts with `/`. Bare `cd`, with no folder after it, goes home too.

Look at the address bar again. Strip `file://`. Cover `/home/you` with your thumb. What remains is `/projects/first-site/index.html`. Put `~` in front of that remainder. You have just written the home form.

**`.` is here.** It names the folder you are standing in. From inside `first-site`, the page is:

`./index.html`

You do not name `projects` or `home` in that spelling. You are already inside the folder that holds the file, so the file's name is enough. The `.` makes that starting point explicit.

**`..` is the folder above.** From inside `first-site`, `..` is `projects`. `cd` means change folder. From inside `first-site`, `cd ..` puts you in `projects`.

You can stack the mark. `../..` is two folders up.

From one folder above `first-site`, the same file is `../first-site/index.html`. From two folders above, it is `../../projects/first-site/index.html`. Same file. Different starting points.

The first-character rule still holds. `./index.html` starts with `.`, so it is relative. `../first-site/index.html` starts with `.` too. `~/projects/first-site` starts with `~`. The shell expands `~` to home, and that result is absolute.

## A space will split a name

If a folder name has a space, an unquoted command treats it as two names. Keep this folder as `first-site`. If you must use a space, put quotes around the whole path.

## Case is a trap

On Linux, `Index.html` and `index.html` are two files. Both can sit in one folder, with different contents.

Your page is `index.html`. Ask for `Index.html` and Linux looks for a different name. The letters look similar to you. To the machine they do not match.

> **On a Mac.** APFS is the Mac filesystem. A **filesystem** is how the machine stores names and files. The default is case-insensitive: `Index.html` and `index.html` are the same file. It is also case-preserving: it remembers the capitals you typed, but a change of case does not make a new file. A site that works on a Mac as `Index.html` can 404 on Linux over that one letter. A **404** means the name was not found.

> **On Windows / WSL.** The Linux filesystem is case-sensitive, like Linux. The Windows drive at `/mnt/c` is not. Keep the project in the Linux home, and type the name exactly.

## Three ways, one file

Write the address now:

- from the top: `/home/you/projects/first-site/index.html`
- from home: `~/projects/first-site/index.html`
- from inside the folder: `./index.html`

The first character tells you which kind you wrote. `/` is from the top. `~` is from home. `.` is from here.

Keep the letters exact. The name is `index.html`, not `Index.html`.

You know where the file lives. Next you look at what is inside it.
