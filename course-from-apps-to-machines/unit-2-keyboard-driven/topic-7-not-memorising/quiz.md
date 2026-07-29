# Quiz — You are not supposed to memorise this

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

You type a command and the shell answers:

```
zsh: command not found: brew
```

You know for a fact that a colleague installed this program on the machine last week. What has the shell actually told you?

- The program's files were deleted, so it has to be installed again
- The program is broken and needs to be repaired before it will run
- The shell searched the directories in `$PATH` and found no program by that name
- You are standing in the wrong directory, so `cd` to the program's folder and try again

**Correct option index:** 2

**Explanation:**

`command not found` is a statement about `$PATH` and nothing else: the shell walks that list of directories in order, finds no program with that name, and stops. It says nothing about whether the program exists on the disk. Assuming the files were deleted is the most-viewed misreading there is — "bash: pip: command not found" alone has 2,426,531 views — and reinstalling can leave you exactly where you started. "Broken and needs repair" is a guess the error does not support. Changing directory does not help either: the shell looks for bare command names in `$PATH`, not in your current directory (objective 12)

---

## Question 2

**Type:** TRUE_FALSE

**Statement:** Seeing `bash: pip: command not found` proves the program is not installed on the machine, so the correct first step is always to install it again.

**Correct answer:** false

**Explanation:**

The opposite is closer to the truth: the message means the shell did not *look* in the right place, not that the program is absent. The program is frequently sitting on the disk in a directory that is simply not in `$PATH`. The first step is to find out which case you are in — run `which <name>` and see whether it prints a path — because reinstalling into the same unlisted directory reproduces the identical error (objective 12)

---

## Question 3

**Type:** MULTIPLE_CHOICE

You are about to run `ls` and cannot remember whether the flag that shows dotfiles is `-a` or `-A`. You want the answer on the same screen as your prompt, without anything taking over the terminal. What do you run?

- `man ls`
- `ls --help`
- `which ls`
- `history`

**Correct option index:** 1

**Explanation:**

`ls --help` prints a short summary of the options — including the line `-a    do not ignore entries starting with .` — and hands your prompt straight back, which is exactly the stated need. `man ls` would also contain the answer, but it opens the full manual, takes over the whole screen, and requires `q` to leave; that is the right tool for understanding a command, not for a five-second flag reminder. `which ls` tells you where the `ls` program lives on disk, not what its flags do. `history` lists commands you have already run, which will not help with a flag you have never used (objective 11)

---

## Question 4

**Type:** MULTIPLE_CHOICE

You copy this line out of a tutorial, paste it at your prompt, and press Enter:

```
$ ls -la ~/projects/first-site
```

The shell reports that it cannot find a command. What is wrong?

- The path `~/projects/first-site` needs to be written out in full instead of using `~`
- The `-la` options have to be given separately, as `-l -a`
- The leading `$` is the tutorial's prompt, not part of the command, and has to be deleted before running
- `$` marks a value the shell has to be told about first, so the command cannot run until you set it

**Correct option index:** 2

**Explanation:**

"The `$` character in tutorials indicates a command prompt. It is not meant to be typed in." Pasting it makes `$` the first word, so the shell treats *that* as the command name, searches `$PATH`, and fails — the `command not found` you already know how to read, aimed at a character you never meant to send. This is common enough that a tool exists purely to strip it: `undollar`, for when "Often when copy-pasting terminal commands from the internet you'll inadvertently end up also having copied the dollar sign at the beginning (especially if you triple-click to select)." The `~` shortcut and the clumped `-la` options are both perfectly valid and are not what failed here, and `$` in this position is not a value you need to set — it is a prompt character that was never meant to be copied. Note the same trap wears a different costume on macOS, where the zsh prompt ends in `%` (objective 12)

---

## Question 5

**Type:** SHORT_ANSWER

You run a command against a huge folder and it starts pouring output down the screen and will not stop. You realise you pointed it at the wrong path and want to rerun it against `~/projects/first-site` instead — without retyping the whole thing. Describe the two keystrokes you use, in order, and what each one does.


**A grader must see:**

**Sample answer:**

First press `Ctrl-C` — hold Ctrl and press C — which interrupts the running command and gives the prompt back. Then press the Up arrow, which brings that same command back onto the prompt so I can edit the wrong path (using Tab to complete `~/projects/first-site`) and press Enter to rerun it.

**A full-credit answer shows:**

1. `Ctrl-C` named as the interrupt for a command that is *running* — not `q`, which only quits a program that is sitting there waiting for you.
2. The Up arrow named as the way to recall the previous command for editing, rather than retyping it.
3. The order: stop it first, then recall it.

**Explanation:**

These are two different problems solved by two different keys, and learners routinely reach for the wrong one. `Ctrl-C` interrupts something that is actively running; `q` is the exit key for a program that has taken the screen and is waiting on you, like `man` or `less`, and it will do nothing for a command mid-flood. Once the prompt is back, the Up arrow means the fix costs one edited character instead of a retyped line — and `history` covers anything further back than a few presses (objectives 10, 12)

---
