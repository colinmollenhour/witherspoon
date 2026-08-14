Open the folder that holds your page. That is `~/projects/first-site`. You already know how to write that address.

Find `index.html`. Make a copy of it in the same folder. Name the copy `notes.txt`.

Open `notes.txt` in a text editor. A **text editor** is a program that shows a file as characters. You should see the same heading as `index.html`.

Now rename `notes.txt` to `notes.html`. Watch the icon. Watch which app wants to open it.

Open `notes.html` in the editor again. The heading is still there. The name changed. The text did not.

The suffix after the last dot is the **extension**. It is a hint about which app should open the file. It does not convert the file.

People often treat a rename as a conversion. It is not. The **bytes** — the actual contents on disk — stay put. You now have two names in the same folder. Open both in the editor if you want proof. The heading matches.

> **On a Mac / On Windows.** Your file manager can copy and rename too. The bytes still do not change.

## Read one line

You have two files now: `index.html` and `notes.html`. Look at them the way the machine does.

Type this:

```
ls -la ~/projects/first-site
```

`ls` lists files. With no path it lists the current directory. The path here means you do not have to move first.

`-l` asks for a **long listing** — one row per file, with extra fields. `-a` means do not skip names that start with `.`. Together they print every name, with type, size, and the rest on one line.

Your listing will not match the one below. The owner, the date, and the size will be yours. The fields sit in the same places. Here is a captured `index.html` line, with the folder's own line above it:

```
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
```

Read left to right. The first character is the **type**. `-` means a regular file. `d` means a directory. The `.` line is the folder itself, so it starts with `d`. Your `index.html` line should start with `-`.

Next come three groups of `r`, `w`, and `x`. Those are **permissions** for the owner, the group, and everyone else. You do not need each bit yet. Just see that the three groups are there.

Skip the small integers and the two names that follow. The number `12` on the captured `index.html` line is the **size**, in bytes. On the folder line the size is `120`. That is the folder's own row, not the file. The last field is the **name**.

Find those four things on your own `index.html` line: type, permissions, size, name. The numbers will differ. The order will not.

An extra character may sit after the permission groups. This captured line has a trailing `.`. That mark is an SELinux security-context marker. Plain Ubuntu prints ten characters and no extra dot. Either way, start reading at the type character.

```widget
{
  "type": "anatomy",
  "title": "One `ls -la` line for `index.html`",
  "subject": "Click each piece.",
  "parts": [
    { "text": "-", "label": "type", "note": "A regular file. A `d` here would mean a directory." },
    { "text": "rw-r--r--", "label": "permissions", "note": "Three groups of `r`, `w`, and `x`: owner, group, everyone else. You do not need each bit yet." },
    { "text": ".", "label": "extra mark", "note": "An SELinux marker. Plain Ubuntu prints ten characters and stops." },
    { "text": "   1 colin ubuntu   " },
    { "text": "12", "label": "size", "note": "The file is 12 bytes on this captured line. Yours will be a different number in the same slot." },
    { "text": " Jul 29 04:25 " },
    { "text": "index.html", "label": "name", "note": "The last field. The `.html` is part of the name." }
  ],
  "caption": "Type, permissions, size, name. The rest can wait."
}
```

> **Hidden files.** A name that starts with `.` is hidden. `ls` skips it unless you pass `-a`, so a folder can look empty.

## Same bytes, two readings

Leave the listing. Open `index.html` in the text editor. You see the characters, tags and all.

Open the same `index.html` in the browser. You see the page those characters describe.

You did not make a second file. The bytes on disk are identical. Each program reads them for a different job.

```widget
{
  "type": "compare",
  "columns": [
    { "label": "Text editor" },
    { "label": "Browser" }
  ],
  "rows": [
    { "aspect": "What it shows", "cells": ["The characters, tags and all", "The page those characters describe"] },
    { "aspect": "The bytes on disk", "cells": ["Unchanged", "Unchanged"] },
    { "aspect": "Its job", "cells": ["Let you read and edit the text", "Let you see the page"] }
  ],
  "caption": "One file. Two programs. Two readings."
}
```

The editor is for the text. The browser is for the page. Neither one rewrites the file just because you opened it.

Try it with `notes.html` as well. The editor still shows the same heading. The browser still draws that heading as a page. The rename only changed the name.

## What you carry forward

This file is bytes with a name. The extension is a hint, not a conversion. You can now read one `ls -la` line for *this* `index.html`, and you have opened the same bytes in an editor and a browser.

Next, Unit 2 rebuilds this same page from the keyboard. No mouse. Same folder. Same file.
