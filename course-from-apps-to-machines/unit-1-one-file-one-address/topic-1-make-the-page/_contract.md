# Make the page

**Unit:** 1 — One file, one address
**Objectives (unit-numbered):**
1. Create `~/projects/first-site/index.html` with the file manager and a text editor, then open it by double-clicking.   [obj 1]
2. Read the `file://` URL in the address bar and say what it names.   [obj 2]
3. Find home on your machine — `/Users/<you>` on a Mac, `/home/<you>` on Linux or inside WSL — and put the project there, not on the Desktop.   [obj 3]

## Topic generation prompt

This is the first page of the course. Open on the action: they make a folder, type one line of HTML, double-click the file, and read the address bar. They touch `~/projects/first-site/index.html` in the first 150 words. Then name what they just saw: a file is a thing with a place, and the browser wrote that place as a `file://` URL. Define *home*, *path*, *file manager*, and `file://` in one short sentence each, in a first-hour glossary table at the end of the doing, not before it. Default dialect is Linux (`/home/you/projects/first-site/index.html`, `file:///home/you/...`). One short "On your machine" box: Mac home is `/Users/<you>`; WSL home is `/home/<you>` on the Linux side — put the project there, not under `/mnt/c`. Do not install WSL in this topic. Do not teach absolute vs relative, `ls -la`, or the extension-is-a-hint idea. Do not open on a literacy survey, a three-platform treatise, or why tablets hide files.

## Grounded facts

- macOS home lives under `/Users` [src 1]
- Linux home is `/home/<user>` [src 2]
- WSL: Windows drives mount at `/mnt/c` [src 3]
- WSL: store project files in the Linux filesystem, not `/mnt/c` [src 4]
- WSL: MS contrast — `/home/<user>/Project` not `/mnt/c/Users/<user>/Project` [src 5]
- Terminal.app is in `/Applications/Utilities` [src 31]
- Windows Terminal is MS's recommended WSL host [src 33]
- A `file://` URL works only on your computer [src 168]
- Learners ask why not just double-click the HTML file [src 169]
- WSL install needs Windows 10 2004+ / Win 11; default distro Ubuntu [src 152]
- WSL 2 is the default version [src 153]
- Ubuntu from the Microsoft Store [src 183]
- WSL optional features must be on first [src 184]
- Prior-art gap (FAQ only, not the reading): Missing Semester, CS50, MDN local server, Codecademy, Google IT, Odin [src 177–182]
- Teach from: the file they just made. No invented `ls` output.

## Requested activities

- READ: 700–900 words. First action in the opening: make the folders, type `<h1>Ground Zero</h1>`, save as `index.html`, double-click, read the address bar. Then a first-hour glossary (home, path, file manager, `file://`, terminal). One "On your machine" box. `tree` widget of `home/you/projects/first-site/index.html` is earned. Ends with the file open and the `file://` URL visible. Length target 800.
- FLASHCARDS: home on Linux vs Mac; why not Desktop; what `file://` names; WSL `/mnt/c` vs `/home`; what they just built. 8 cards.
- QUIZ: 5 questions on where to put the project, what the address bar is naming, and the WSL `/mnt/c` trap.

## Handoff

**Inherits:** nothing — the file does not exist yet
**Leaves:** `~/projects/first-site/index.html` exists, opened in a browser at `file:///home/you/projects/first-site/index.html` (or the Mac/WSL equivalent)
**Do not cover:** absolute vs relative, `~` `.` `..`, case sensitivity, `ls -la`, bytes vs extension, the shell
