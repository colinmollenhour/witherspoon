# What's actually in the file

**Unit:** 1 — One file, one address
**Objectives (unit-numbered):**
7. Rename a copy of the page from `.txt` to `.html` and say why the bytes on disk did not change.   [obj 7]
8. Read one `ls -la` line for `index.html` and name type, permissions, size, and name.   [obj 8]
9. Open the same `index.html` in a text editor and a browser, and say what each does with the identical bytes.   [obj 9]

## Topic generation prompt

They can already write the address. Now look at the thing itself. Have them duplicate `index.html` to `notes.txt` (or type the same heading into a new `notes.txt`), rename it to `notes.html`, and notice the icon and the opening app change while the text inside does not. Then one real `ls -la` of `~/projects/first-site`. Teach the load-bearing fields only: type character (`-` vs `d`), size, name. Mention the three `rwx` triples exist; do not tour every bit. Open the same `index.html` in an editor and a browser — same bytes, two readings. Hidden files (`.` prefix, `-a`) as a two-sentence box. Do not teach `pwd`/`cd`. Do not teach umask.

## Grounded facts

- Real `ls -la` teaching block: `drwxr-xr-x. 3 colin ubuntu 120 Jul 29 04:25 .` / `-rw-r--r--. 1 colin ubuntu 12 Jul 29 04:25 index.html` [src 10]
- An 11th character may follow the permission string (SELinux `.`); Ubuntu prints 10 [src 11]
- `ls -a` reveals dotfiles; `-l` is long listing [src 13]
- `ls` with no argument lists the current directory [src 14]
- Renaming the extension is believed to convert the file [src 166]
- Hidden dotfiles read as "the folder is empty" [src 162]
- Teach from: the captured `ls -la` line in [src 10]. Use that exact line in any `anatomy` or `terminal` widget — do not invent a new listing.

## Requested activities

- READ: 700–1000 words. Do the rename. Then `ls -la ~/projects/first-site`. Then editor vs browser. `anatomy` of the [src 10] `index.html` line is earned. `compare` of editor vs browser (two columns) is earned. Ends: they know this file is bytes with a name, and Unit 2 will rebuild it without a mouse.
- FLASHCARDS: type character; size field; `-a`; extension is a hint; editor vs browser; why `notes.html` still has the same text. 8 cards.
- QUIZ: 5 questions on reading the [src 10] line, the rename misconception, and what the browser does with the same bytes.

## Handoff

**Inherits:** the learner can write this file's address three ways
**Leaves:** they have read a real `ls -la` line for *this* `index.html` and opened the same bytes in an editor and a browser
**Do not cover:** `pwd`, `cd`, `mkdir`, permissions as a security lesson, umask, the shell prompt
