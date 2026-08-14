# The address of a file

**Unit:** 1 — One file, one address
**Objectives (unit-numbered):**
4. Tell absolute from relative by the first character, and write this file's absolute path starting from `/`.   [obj 4]
5. Write the same location three ways with `~`, `.`, and `..`.   [obj 5]
6. Predict whether `Index.html` and `index.html` are the same file on a default Mac and on Linux.   [obj 6]

## Topic generation prompt

They already have `~/projects/first-site/index.html` open as `file://`. Open on that address. Teach that every file has one written address, and the first character decides the kind: `/` means from the top of the machine (absolute); anything else is from where you are standing (relative). Then the three abbreviations: `~` is home, `.` is here, `..` is the folder above. Work every example against *this* file. Default dialect Linux. One "On a Mac" box: APFS is case-insensitive by default and case-preserving — `Index.html` and `index.html` are the same file, and a site that works on a Mac can 404 on Linux over one capital letter. Do not teach `ls -la` fields. Do not recap why they made the file. Do not quote POSIX `curpath`.

## Grounded facts

- Absolute paths begin with `/` [src 16]
- Bare `cd` (and `~`) goes to `$HOME` [src 17]
- APFS default is case-insensitive [src 6]
- APFS is case-preserving in all variants [src 7]
- Linux filesystems are case-sensitive — proven: two inodes, two contents [src 8]
- WSL Linux FS is case-sensitive; `/mnt/c` is not [src 9]
- Spaces in filenames break unquoted commands [src 167]
- Teach from: `file:///home/you/projects/first-site/index.html` as the string to dissect.

## Requested activities

- READ: 700–1000 words. Open on the `file://` URL they already have. Teach `/` vs not-`/`, then `~` `.` `..` against this file. One Mac case-sensitivity box. `anatomy` widget of the absolute path is earned. Optional `compare` of `/home/you/projects/first-site` vs `projects/first-site` (two columns). Ends ready to look *inside* the file.
- FLASHCARDS: absolute vs relative; `~`; `.`; `..`; case on Mac vs Linux; why `Index.html` 404s on a server. 8–10 cards.
- QUIZ: 5 questions on first-character rule, expanding `~/projects/first-site` from a stated home, predicting `cd ..` from this folder, and the Mac/Linux case trap.

## Handoff

**Inherits:** `~/projects/first-site/index.html` exists, opened at its `file://` URL
**Leaves:** the learner can write this file's address three ways (`/home/you/…`, `~/…`, `./index.html` from inside the folder) and knows case is a trap
**Do not cover:** `ls -la` fields, permissions, bytes vs extension, editor vs browser, the shell's cwd
