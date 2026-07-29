# The shell always stands somewhere

**Unit:** 2 — Driving the machine from the keyboard
**Objectives (unit-numbered):**
1. Use `pwd` to print the shell's current working directory and explain why the same `ls` command prints different things in different directories.   [obj 1]
2. Use `cd ~/projects/first-site` and `cd ..` to move to a stated directory and confirm arrival with `pwd`, without opening a file manager.   [obj 2]
3. Use `cd -` to jump back to the previous directory and bare `cd` to return home, and read the current location out of the shell prompt.   [obj 3]

## Topic generation prompt

This is the single most important idea in the unit and the one every prior treatment skips: **the
shell is always standing in exactly one directory**, and every relative path is measured from there.
Open with the real evidence of what it costs not to know this — the learner who pasted a correct path
and got "No such file or directory" and concluded the file was corrupted [src 163]. That is the
symptom; the cwd is the cause. Teach `pwd` as "where am I standing", `ls` as "what is here", and `cd`
as "stand somewhere else", in that order, each demonstrated against `~/projects/first-site/` from
Project 1. Show `ls` producing different output in two directories as proof that the command did not
change — the vantage point did. Then `cd ..`, `cd ~`, and `cd -`, using the real captured behaviour
[src 18] including the detail that `cd -` prints the directory it lands in. Note that `cd` is a shell
builtin rather than a program on disk [src 15], which is why `man cd` behaves oddly — a small fact
that saves a confusing moment later. Finally, read the prompt itself: bash ends in `$`, zsh in `%`,
and the `\$` escape becomes `#` for root [src 28, 30].

Do NOT teach `mkdir`, `touch`, `cp`, `mv`, or `rm` — Topic 5 owns creation and destruction. Do NOT
teach `cat` or `grep` — Topic 6 owns reading. Do NOT teach tab completion — Topic 7 owns it, and it
lands better after the learner has typed some long paths by hand.

## Grounded facts

- `ls` with no argument lists the current directory: "List information about the FILEs (the current directory by default)." [src 14]
- `cd` is a shell builtin defined by POSIX, not a coreutils program: "cd — change the working directory" [src 15]
- Bare `cd` goes to `$HOME` [src 17]
- Real `cd -` behaviour: alternates between the last two directories and **prints the destination**; backed by `$OLDPWD` [src 18]
- Linux prompt: stock PS1 renders `colin@seamus:~$`; the `\$` escape prints `#` when uid is 0 [src 28]
- macOS zsh prompt ends `%`: "%# — A '#' if the shell is running with privileges, a '%' if not." [src 30]
- The cost of not knowing the cwd, evidenced: "I copy n pasted a pathway for an existing file and just swapped the file with the one that im being told does not exist." (21,771 views) [src 163]
- Teach from: The Open Group `cd` specification [src 15, 17]; the real `cd -` capture [src 18]

## Requested activities

- READ: 900–1100 words. Open on [src 163]. Teach `pwd` → `ls` → `cd` against `~/projects/first-site/`. Show the same `ls` giving different output in two places. Cover `cd ..`, `cd ~`, `cd -`, bare `cd`. End by reading the prompt. Ends with the learner able to reach their project folder from anywhere.
- FLASHCARDS: 9 cards. `pwd`; `ls`; `cd`; `cd ..`; `cd -`; bare `cd`; current working directory as a definition; `$` vs `%` prompt endings; why `ls` output changes without the command changing.
- QUIZ: 5 questions on predicting `pwd` output after a sequence of `cd` commands, diagnosing a "No such file or directory" error caused by the wrong cwd, choosing the command to return to the previous directory, and identifying the shell from a prompt string.

## Handoff

**Inherits:** `~/projects/first-site/index.html` exists, built by hand in the GUI during Project 1. The learner can read `ls -la` output and write absolute paths.
**Leaves:** The learner can navigate to `~/projects/first-site/` and confirm arrival with `pwd`, using only the keyboard.
**Do not cover:** Creating, copying, moving, or deleting anything (Topic 5). Reading file contents (Topic 6). Tab completion, `man`, history (Topic 7).
