# You are not supposed to memorise this

**Unit:** 2 — Driving the machine from the keyboard
**Objectives (unit-numbered):**
10. Complete a long path with the Tab key and recall an earlier command with the Up arrow or `history`.   [obj 10]
11. Find what a command does with `ls --help` and `man ls`, and quit `man` with `q`.   [obj 11]
12. Interrupt a running command with `Ctrl-C`, locate a program on disk with `which python3`, and explain a `command not found` error in terms of `$PATH` rather than a failed install.   [obj 12]

## Topic generation prompt

Close the unit by removing the fear that this all has to be memorised. Tab completion first, because
it is the highest-value keystroke in the course and the learner has just spent two topics typing
`~/projects/first-site/` by hand — that friction is what makes Tab land. Then Up-arrow and `history`.
Then self-service documentation: `--help` for the quick answer, `man` for the full one, with `q` to
quit taught in the same breath [src 160]. Then `Ctrl-C`, which the learner will need constantly from
Unit 5 onward to stop the web server — introduce it here so it is already a reflex when the server
appears. Then `which` and `$PATH`. Spend real time on `command not found`: it is the second-most-viewed
class of question in this whole harvest [src 159], and the correct mental model is that the program is
installed but the shell did not look in that directory. Finish with the `$` copy-paste trap [src 161]
— the dollar sign in a tutorial is the prompt, not part of the command, and a real tool exists purely
to strip it. That single fact prevents a whole category of stuck.

Do NOT teach environment variables in general, `export`, or shell config files — Unit 3, Topic 10's
neighbourhood, and this topic only needs `$PATH` as the explanation for `command not found`. Do NOT
teach pipes or redirection.

## Grounded facts

- `command not found` misread as "not installed", evidenced: "bash: pip: command not found" — 2,426,531 views; "zsh: command not found: brew" — 1,105,124 views [src 159]
- The `$` prompt copy-paste trap: "The `$` character in tutorials indicates a command prompt. It is not meant to be typed in." A tool exists solely for this: "Often when copy-pasting terminal commands from the internet you'll inadvertently end up also having copied the dollar sign at the beginning (especially if you triple-click to select)" [src 161]
- Quitting a pager/editor is a genuine trap: "How do I exit Vim?" — 3,316,707 views [src 160]
- Real `man ls` output opens: `LS(1)  User Commands  LS(1)` / `NAME` / `       ls - list directory contents` / `SYNOPSIS` / `       ls [OPTION]... [FILE]...` [src 14]
- The prompt ends `$` on bash, `%` on zsh — so the character to ignore differs by platform [src 28, 30]
- `python3` is the correct command; bare `python` may not exist at all [src 125]
- Teach from: the `ls` manpage SYNOPSIS as the shape of every command [src 14]

## Requested activities

- READ: 900–1100 words. Tab completion → history → `--help` and `man` (with `q`) → `Ctrl-C` → `which` and `$PATH` → the `$` copy-paste trap. Use the real `man ls` header [src 14] to teach the NAME/SYNOPSIS shape shared by every command. Ends with the learner able to answer their own questions about an unfamiliar command.
- FLASHCARDS: 10 cards. Tab; Up arrow; `history`; `--help`; `man`; `q`; `Ctrl-C`; `which`; `$PATH`; what the leading `$` in a tutorial means.
- QUIZ: 5 questions on diagnosing `command not found` correctly (installed but not on `$PATH`), choosing `--help` vs `man` for a stated need, identifying the keystroke to stop a running command, and spotting what is wrong with a pasted command that begins with `$`.

## Handoff

**Inherits:** The learner can create, navigate, read, and search from the keyboard.
**Leaves:** The learner can look up any command themselves, interrupt anything with `Ctrl-C`, and read a `command not found` error correctly. Ready for Project 2, the cold-start rebuild.
**Do not cover:** Editors (Topic 8). Redirection and pipes (Topics 9, 10). Shell config files.
