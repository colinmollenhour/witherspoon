# Build it without a mouse

**Unit:** 2 — No mouse
**Objectives (unit-numbered):**
4. Build the whole project path with `mkdir -p ~/projects/first-site` and create an empty file with `touch index.html`.   [obj 4]
5. Copy, rename, and delete with `cp`, `mv`, and `rm` — and know `rm` has no trash.   [obj 5]
6. Quote a filename that contains a space, and predict `mv a b` when `b` is missing vs when `b` is a directory.   [obj 6]

## Topic generation prompt

They can already stand in the folder. Now build with keys. Teach `mkdir -p` (parents, idempotent), `touch`, `cp`, `mv` (rename vs move-into), `rm` (no trash, no undo). Practise on a scratch file *inside* `first-site` (`scratch.txt`) so the real `index.html` survives until the project. One box: Tab finishes a long path; Up arrow recalls the last command — you are not supposed to memorise this. Quote `"my file.html"` when there is a space. Default Linux. Do not teach `>` or `|`. Do not teach `nano`.

## Grounded facts

- `mkdir -p` creates parents and is idempotent; without `-p` you get `No such file or directory` / `File exists` [src 19]
- `mv` is both rename and move [src 20]
- `cp` needs `-r` for directories [src 21]
- `rm` refuses directories by default [src 22]
- `rm` flags: `-f` never prompt, `-i` prompt, `-r` recursive [src 23]
- `mv`/`cp` `-i` / `-n` [src 24]
- `rm` has no trash — GitLab incident as the professional-scale example (one sentence, not a case study) [src 165]
- `rm -r /home/` vs `home/` [src 164]
- Spaces break unquoted names [src 167]
- Teach from: `mkdir -p ~/projects/first-site` as the one-liner that rebuilds the path.

## Requested activities

- READ: 700–1000 words. `mkdir -p`, `touch scratch.txt`, `cp`, `mv`, `rm scratch.txt`. `compare` of `mv a b` when `b` missing vs `b` is a directory (two columns). Tab/history as a box. Ends able to rebuild the folder; the project will delete and rebuild for real.
- FLASHCARDS: `mkdir -p`; `touch`; `cp` vs `mv`; `rm` has no undo; quoting spaces; Tab. 8 cards.
- QUIZ: 5 questions on `mkdir` without `-p`, `mv` rename vs move, `rm` of a directory, and quoting a space.

## Handoff

**Inherits:** the shell can stand in `~/projects/first-site`
**Leaves:** they can rebuild the path with `mkdir -p` and know `rm` is permanent; `index.html` is still there
**Do not cover:** `>`, `>>`, `|`, `echo`, `nano`, `vim`, `cat`, `grep`
