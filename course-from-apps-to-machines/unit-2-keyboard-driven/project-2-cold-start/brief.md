# Project 2 — Cold Start

**Type:** `interactive-form`
**Unit:** 2 — Driving the machine from the keyboard

## Goal

Wipe `~/projects/first-site/` and rebuild it from the keyboard in eight commands or fewer. Prove the rebuild with four pieces of real terminal output.

---

## How this works

You work on **your own machine**, in your own terminal. Nothing runs in a sandbox and nothing is
simulated. You will really delete the folder you built in Project 1, and you will really put it back.

There is no grader watching your screen. What gets graded is a **submission file** — six named fields
that you fill in by pasting real output out of your terminal. Open
`starter/submission.md`, fill in the six fenced blocks, and save it.

Three things about the machine you are on:

- **Your shell differs by platform.** Linux and WSL default to bash, whose prompt ends in `$`. macOS
  defaults to zsh, whose prompt ends in `%` — the zsh manual defines it as "%# — A '#' if the shell
  is running with privileges, a '%' if not." Every command in this project works identically on both.
- **The `$` or `%` at the start of a pasted command line is the prompt, not part of the command.**
  "The `$` character in tutorials indicates a command prompt. It is not meant to be typed in." Strip
  it. The tests strip a leading `$` or `%` from your transcript too, so a stray one will not fail you
   — but a pasted one that you then *run* will give you `command not found`.
- **Your home directory has a different absolute path on each platform.** macOS puts home directories
  under `/Users`; Linux uses `/home/<user>`. That is why every check below tests how a path *ends*,
  not what it is in full. On WSL, keep the folder in the Linux filesystem under `~`, not under
  `/mnt/c` — Microsoft's own guidance is "Use the Linux file system root directory:
  `/home/<user name>/Project` — Not the Windows file system root directory:
  `/mnt/c/Users/<user name>/Project$`".

### The one thing you cannot do yet

`index.html` has a `<title>` line in it. You put it there in Project 1 with a text editor, and this
unit has taught you nothing that types text *into* a file — that is Unit 3's job. `touch` creates
the file **empty**.

So if you delete `index.html` without keeping a copy, you cannot get its contents back. `rm` has no
trash can and no undo. This is not a beginner's problem: GitLab's public postmortem describes an
engineer running `rm -rf` against the wrong database host, after which the team found that "out of 5
backup/replication techniques deployed none are working reliably or set up in the first place."

**Copy the file out before you destroy anything.** That is step 1, and it is the whole discipline
`rm` demands, compressed into one command.

---

## Your tasks

1. **Take the copy.** `cp` `index.html` somewhere outside `~/projects/first-site/`. This must be the
   first thing in your transcript.
2. **Destroy the folder.** `rm` refuses directories by default — "rm removes each specified file. By
   default, it does not remove directories" — so this needs the recursive flag: "-r, -R,
   `--recursive` — remove directories and their contents recursively". Delete
   `~/projects/first-site` itself, not just the file inside it. Read the path twice before you press
   Enter.
3. **Rebuild the path in one command.** Use `mkdir -p`, documented as "-p, --parents" → "no error if
   existing, make parent directories as needed". A chain of single-level `mkdir`s does the same job
   in more commands, and plain `mkdir` fails with `mkdir: cannot create directory '.../a': File
   exists` the second time you run it. `-p` is the form you can re-run.
4. **Put `index.html` back.** `cp` it in from the copy you took in step 1, or `touch` it and accept
   an empty file — but an empty file has no `<title>` line, and step 8 asks you to find one.
5. **Stay inside the budget: eight commands or fewer,** counting everything in your transcript.
6. **Capture `pwd`** from inside the rebuilt folder.
7. **Capture `ls -la`** of the rebuilt folder. `-a` is documented as "do not ignore entries starting
   with ." and `-l` as "use a long listing format" — you need both.
8. **Capture `grep -n "<title>" index.html`.** Quote the search text; the angle brackets mean
   something else to the shell if you leave them bare.
9. **Fill in `project_1_mouse_actions`** with the number of mouse actions you counted in Project 1,
   and compare it against your own `command_count`.

---

## What the scaffolding is for

`starter/reference-project-1.md` is marked **READ ONLY**. It carries forward what Project 1 left on
your disk — the folder, the file, and the `file://` address you opened it with — so that "rebuild it"
has a definition you can check against rather than a memory.

The six fields in `starter/submission.md` are not busywork. They are four different kinds of
evidence, and they have to agree with each other:

| Field | What it proves |
| --- | --- |
| `commands` | That the rebuild happened in a stated order, deletion first |
| `command_count` | That the whole thing fit in the budget |
| `pwd_output` | That you were standing in the rebuilt folder, not near it |
| `ls_la_output` | That `index.html` really landed there, and that you can see dotfiles |
| `grep_output` | That the file has contents, at a line number you did not have to guess |
| `project_1_mouse_actions` | The number this project exists to be compared against |

**Then do the comparison yourself.** Project 1 built this folder with a file manager, a text editor,
and a browser — three applications. Write down the number of mouse actions that took. Write down
your `command_count`. The gap between those two numbers is the entire reason this unit exists, and
it is the last thing this project asks you to notice.

There is a second gap, harder to see and worth more. Your eight lines can be pasted into a message
and re-run by someone else on a different machine. A count of mouse actions cannot be pasted
anywhere.

---

## Expected output

Your four captures should have these shapes. The exact numbers, dates, user and group names are
yours and will differ.

```
$ pwd
/home/you/projects/first-site
```

```
$ ls -la
drwxr-xr-x.   3 you group  120 Jul 29 04:25 .
drwxr-xr-x.   4 you group   80 Jul 29 04:25 ..
-rw-r--r--.   1 you group   12 Jul 29 04:25 index.html
```

```
$ grep -n "<title>" index.html
4:    <title>My first site</title>
```

Three details in there that surprise people:

- **The `.` and `..` lines.** `.` is the folder itself and `..` is its parent. They only appear
  because of `-a`. Without it the folder can look empty when it is not.
- **The trailing dot on `drwxr-xr-x.`** is an SELinux security-context marker on Fedora and RHEL
  hosts. Plain Ubuntu and Debian print ten characters with no dot. Both are correct.
- **`grep` printed `4:` and not `index.html:4:`.** When you point `grep` at one single file it leaves
  the `path:` prefix off — you already know which file you searched. Point it at a directory and the
  path appears. Your `grep_output` must be the single-file form.

---

## Steps

- [ ] **1. Copy the file out first** — `commands` contains a line whose first word is `cp` and one of
      whose arguments names a file under `~/projects/first-site`, and that line appears before any
      `rm` line.
- [ ] **2. Delete the folder, not just the file** — `commands` contains a line whose first word is
      `rm`, carrying `-r`, `-R`, or `--recursive`, with an argument ending in `projects/first-site`
      or equal to `first-site`.
- [ ] **3. The deletion comes before the rebuild** — the index of that `rm` line in `commands` is
      lower than the index of the first `mkdir` line.
- [ ] **4. Rebuild the path in one command** — `commands` contains a line whose first word is
      `mkdir`, carrying `-p` or `--parents`, with an argument ending in `projects/first-site`.
- [ ] **5. Put `index.html` back** — `commands` contains a line after the `mkdir` line whose first
      word is `cp` or `touch` and one of whose arguments ends in `index.html`.
- [ ] **6. Stay inside the budget** — `command_count` parses as a positive integer, is 8 or fewer,
      and equals the number of non-empty command lines in `commands`.
- [ ] **7. Prove where you were standing** — `pwd_output` is exactly one non-empty line and ends with
      `/projects/first-site`.
- [ ] **8. Prove what is in the folder** — `ls_la_output` contains a line whose last whitespace-
      separated field is `index.html`, and a line whose last field is `.`.
- [ ] **9. Prove the file has contents** — `grep_output` contains at least one line matching
      `^[0-9]+:` that also contains `<title>`, and no line beginning with `index.html:`.
- [ ] **10. Compare the two numbers** *(noticing step)* — `project_1_mouse_actions` and
      `command_count` both parse as positive integers, and your submission records both.

---

## Rules

- Do not edit `starter/reference-project-1.md`. It is the record of what you are rebuilding.
- Do not rename, reorder, or delete the six `##` headings in `starter/submission.md`, and keep every
  value inside its fenced block. The tests find your fields by those headings.
- Do not include `history` or `clear` in the `commands` field. `history` is how you *read the
  transcript back*; it is not part of the rebuild, and leaving it in will fail the count check.
- One command per line in `commands`. No blank-line padding, no output lines pasted in among the
  commands.
- Do not edit anything under `tests/`.
- Everything you need is in Unit 2. Redirection (`>`), pipes (`|`), and text editors are Unit 3 and
  are not required here — and if you use them, the eight-command budget will make you regret it.

---

## Grading

Graded three ways: the ten steps above, the machine tests in `tests/`, and the rubric in
[`rubric.md`](rubric.md).

## Environment

Nothing here is pinned to a moving target.

```json
{
  "learnerMachine": {
    "shell": {
      "linux": "bash — prompt ends in $",
      "wsl": "bash — prompt ends in $",
      "macos": "zsh — prompt ends in %"
    },
    "linuxReference": "Ubuntu 26.04 LTS \"Resolute Raccoon\", released 2026-04-23",
    "manualPages": "Ubuntu manpages, noble 24.04 LTS, section 1 — the text `man mkdir` shows",
    "grep": "GNU grep on Linux and WSL; BSD grep on macOS — -r and -n behave identically",
    "homeDirectory": "/home/<user> on Linux and WSL; under /Users on macOS",
    "wslFilesystem": "the Linux filesystem under ~, not /mnt/c",
    "fileManager": "not used"
  },
  "grader": {
    "image": "python:3.14.6",
    "packages": [],
    "timeoutMs": 30000
  }
}
```
