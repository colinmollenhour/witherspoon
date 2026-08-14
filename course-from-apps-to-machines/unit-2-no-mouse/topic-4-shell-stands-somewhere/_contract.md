# The shell stands somewhere

**Unit:** 2 — No mouse
**Objectives (unit-numbered):**
1. Print where the shell is standing with `pwd` and say why the same `ls` prints different things in different folders.   [obj 1]
2. Move with `cd ~/projects/first-site` and `cd ..`, then confirm with `pwd`.   [obj 2]
3. Jump home with bare `cd` and back with `cd -`, and read your location from the prompt.   [obj 3]

## Topic generation prompt

The file is on disk. Open a terminal and stand in it. The one idea: the shell is always in exactly one folder, and every relative path is measured from there. Teach `pwd` (where am I), `ls` (what is here), `cd` (stand somewhere else), in that order, against `~/projects/first-site`. Show the same `ls` producing different output in two directories — the command did not change; the vantage point did. Then `cd ..`, bare `cd`, `cd -`. Default Linux prompt ends `$`. One box: Mac zsh ends `%`; do not paste the `$` or `%`. Do not teach `mkdir`/`rm`. Do not teach tab completion as a topic — one sentence is enough if they type a long path.

## Grounded facts

- `cd` is a shell builtin [src 15]
- Absolute paths begin with `/` [src 16]
- Bare `cd` goes to `$HOME` [src 17]
- `cd -` toggles and prints the destination [src 18]
- `ls` with no argument lists the current directory [src 14]
- Linux default shell is bash; prompt ends `$` [src 28]
- macOS default shell is zsh; prompt ends `%` [src 30]
- The `$` in tutorials is a prompt, not typed [src 161]
- Cwd mismatch reads as "the file is corrupted" [src 163]
- Teach from: they already have `~/projects/first-site`. Any `terminal` widget must use `/home/you/projects/first-site` (generic `you`, not a real username) and only commands whose output shape is grounded — `pwd` printing that path is arithmetic from [src 2]+the project path, not a new capture.

## Requested activities

- READ: 700–1000 words. Open the terminal, `pwd`, `cd ~/projects/first-site`, `pwd` again, `ls`, `cd ..`, `ls` again. `terminal` widget of that walk is earned. One Mac `%` box. Ends standing in the project folder, ready to build without a mouse.
- FLASHCARDS: `pwd`; `ls`; `cd`; `cd ..`; `cd -`; bare `cd`; `$` vs `%`; why `ls` changes. 8 cards.
- QUIZ: 5 questions on predicting `pwd` after a `cd` sequence, diagnosing "No such file or directory" as the wrong cwd, and `cd -`.

## Handoff

**Inherits:** `index.html` exists; they have read its `ls -la` line
**Leaves:** the shell is standing in `~/projects/first-site` and they can get there from anywhere with `cd`
**Do not cover:** `mkdir`, `touch`, `cp`, `mv`, `rm`, `>`, `|`, editors
