# Making, moving, and destroying

**Unit:** 2 — Driving the machine from the keyboard
**Objectives (unit-numbered):**
4. Create the whole project path in one command with `mkdir -p ~/projects/first-site` and create an empty file with `touch index.html`.   [obj 4]
5. Use `cp`, `mv`, and `rm` to duplicate, rename, and delete a file, and state that `rm` does not move anything to a trash can and has no undo.   [obj 5]
6. Predict the difference between `mv a b` when `b` does not exist (a rename) and when `b` is an existing directory (a move into it), and quote a filename containing a space.   [obj 6]

## Topic generation prompt

Rebuild the running example from nothing, by keyboard. This is where the learner first feels the
speed difference: Project 1 took roughly fourteen mouse actions across three applications; this takes
two commands. Teach `mkdir -p` first and explain both of its behaviours from the real capture [src 19]
— it creates missing parents *and* it is silent when the target already exists, which is why it is the
safe default. Show both failure messages without `-p` verbatim [src 19]. Then `touch`, then `cp` (with
`-r` required for directories [src 21]), then `mv` — making the point that `mv` is one command doing
two conceptual jobs, rename and move, distinguished only by whether the destination already exists as
a directory [src 20]. Then `rm`. Give `rm` the weight it deserves without melodrama: quote the manpage
fact that it refuses directories by default [src 22], the meaning of `-r` and `-f` [src 23], and use
the GitLab postmortem [src 165] to make the point that this is a professional-scale hazard rather than
a beginner one. Introduce `-i` as the training-wheels flag [src 24]. Close on quoting: the shell splits
on whitespace, so `cd My Project` passes two arguments [src 167] — teach `"My Project"` and `My\ Project`.

Do NOT teach `>` or `>>` — Unit 3 owns redirection, and using it here steals Topic 9's demonstration.
Do NOT teach `cat` or `grep` (Topic 6).

## Grounded facts

- `mkdir -p`: "-p, --parents" → "no error if existing, make parent directories as needed". Real failures without it: `mkdir: cannot create directory '.../x/y/z': No such file or directory` and `mkdir: cannot create directory '.../a': File exists` [src 19]
- `mv` is rename and move: "mv - move (rename) files" / "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY." [src 20]
- `cp` needs `-r` for directories: "-R, -r, --recursive" → "copy directories recursively" [src 21]
- `rm` refuses directories by default: "rm removes each specified file. By default, it does not remove directories." [src 22]
- `rm` flags: "-f, --force" → "ignore nonexistent files and arguments, never prompt"; "-i" → "prompt before every removal"; "-r, -R, --recursive" → "remove directories and their contents recursively" [src 23]
- Safety flags: "-i, --interactive" → "prompt before overwrite"; "-n, --no-clobber" → "do not overwrite an existing file" [src 24]
- `rm` at professional scale: GitLab's postmortem — an engineer ran `rm -rf` on the wrong database host; "out of 5 backup/replication techniques deployed none are working reliably or set up in the first place" [src 165]
- Spaces in filenames, evidenced (55,267 views) [src 167]
- Teach from: Ubuntu manpages for `mkdir`, `cp`, `mv`, `rm` [src 19–24]

## Requested activities

- READ: 1000–1200 words. Rebuild `~/projects/first-site/` from nothing with `mkdir -p` and `touch`, explicitly comparing the command count to Project 1's mouse actions. Then `cp`, `mv`, `rm`, then quoting. Use [src 165] once, factually. Ends with the folder rebuilt and the learner knowing `rm` is final.
- FLASHCARDS: 12 cards. `mkdir`; `mkdir -p`; `touch`; `cp`; `cp -r`; `mv` as rename; `mv` as move; `rm`; `rm -r`; `rm -i`; the two ways to handle a space in a filename; what `rm` does NOT do.
- QUIZ: 5 questions on choosing between `mkdir` and `mkdir -p` for a nested path, predicting whether `mv a b` renames or moves given a stated state of `b`, identifying what happens to a file after `rm`, and fixing an unquoted command containing a space.

## Handoff

**Inherits:** The learner can navigate to any directory with `cd` and confirm with `pwd`.
**Leaves:** The learner can create, copy, rename, and delete files and folders from the keyboard, and has rebuilt `~/projects/first-site/` from an empty home directory.
**Do not cover:** Redirection `>` and `>>` (Unit 3, Topic 9). Reading file contents (Topic 6). Tab completion and history (Topic 7).
