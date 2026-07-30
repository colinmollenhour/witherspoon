# Project 1 — Ground Zero

**Type:** `interactive-form`
**Unit:** 1 — Where your stuff actually lives

## Goal

Create `~/projects/first-site/index.html` on your own machine using nothing but the graphical file
manager and a text editor, then state exactly where it lives, exactly what URL the browser shows when
you double-click it, and exactly what it cost you in clicks.

---

## Instructions

### How this runs

You do the work on **your own machine**. Nothing is uploaded, and no sandbox does any of this for you —
there is no cloud environment where `~/projects/first-site/index.html` could exist. What you hand in is
**captured evidence**: five named fields in `starter/submission.txt`, filled in with values you read off
your own screen.

Open `starter/submission.txt`, keep it open beside you, and fill each field as you finish the step that
produces it. The grading scripts in `tests/` read that file, split each line at its **first** colon, and
check the values. That means:

- The field names on the left of the colon are fixed. Do not rename, reorder, or delete them.
- Values on the right may contain colons — `file:///…` and the `04:25` in a timestamp are both fine.
- A line starting with `#` is a comment and is ignored.

The five fields:

| Field | What goes in it |
| --- | --- |
| `platform` | Exactly one of `macOS`, `Linux`, `WSL` |
| `absolute_path` | The full absolute path of your `index.html`, starting with `/` |
| `file_url` | The exact text in the browser's address bar after you double-click the file |
| `mouse_actions` | `actions=<n> apps=<n>` — how many distinct clicks/drags/typed names, and how many separate applications |
| `ls_la_line` | The single `ls -la` line for your `index.html`, copied character for character |

### Your tasks

1. **Decide where home is.** macOS: `/Users/<you>`. Linux and WSL: `/home/<you>`. Apple states it
   plainly — "`/Users`—This directory contains one or more user home directories. The user home
   directory is where user-related files are stored." Write your platform into `platform`.
2. **Make two folders, by hand, in the file manager.** Inside your home directory make `projects`, and
   inside that make `first-site`. Not on the Desktop. Type both names; do not accept `untitled folder`.
3. **Make the file, in a text editor.** Create a new plain-text document, type a single line of HTML —
   an `<h1>` heading with any text you like — and save it into `first-site` as `index.html`. Lowercase
   `i`. Watch that your editor does not append `.txt`.
4. **Write the address down in full.** Fill `absolute_path` with the whole path from `/` to
   `index.html`. `/Users/…` or `/home/…` — never `~`, never a `C:\` drive letter, never
   `projects/first-site/index.html` on its own.
5. **Double-click the file and read the address bar.** The browser opens it. Copy what the address bar
   actually says into `file_url`. Copy it; do not retype it from memory and do not tidy it up.
6. **Run one command.** This is the only terminal step in the project:

   ```
   ls -la ~/projects/first-site
   ```

   `-l` is documented as "use a long listing format" and `-a` as "do not ignore entries starting with
   .". Find the row for `index.html`, copy that **one line** — the whole line, from the permission
   string to the filename — into `ls_la_line`.
7. **Count what it cost.** Go back over what you just did and count two numbers, then write them as
   `actions=<n> apps=<n>` into `mouse_actions`.

### If you are on WSL

Your project belongs on the Linux side. Microsoft is explicit: *"We recommend against working across
operating systems with your files, unless you have a specific reason for doing so. For the fastest
performance speed, store your files in the WSL file system if you are working in a Linux command
line (Ubuntu, OpenSUSE, etc)"* — and gives the contrast as two paths: *"Use the Linux file system root
directory: `/home/<user name>/Project` — Not the Windows file system root directory:
`/mnt/c/Users/<user name>/Project$`"*.

So `absolute_path` is `/home/<you>/projects/first-site/index.html`. A submission under `/mnt/c` fails.

Your graphical file manager and your Linux home sit on opposite sides of exactly the seam Topic 1
described. Whatever route you find to get a file manager and an editor onto the Linux side, take it —
and **count every application it takes** in `apps=`. If it takes you four applications where a Mac user
needs two, that is not you failing the project; that is the project's measurement working.

Your `file_url` may carry extra prefix material before `/home/<you>/…`. Copy it exactly as shown. The
test only requires that it begins `file://` and ends with your `absolute_path`.

### What the scaffolding is for

**The `mouse_actions` field is the whole point of this project.** Everything you just did — the
folder-inside-a-folder, the typed names, the Save-As dialog, the extension you had to fight, the switch
from file manager to editor to browser — Unit 2 does in two commands, typed, without leaving one window.
That comparison only lands if you have a real number to compare against, and only you can measure it.
Count honestly. An inflated number is worth nothing to you in Unit 2, and a deflated one is worth less.

**The `file_url` field is a seed.** You are about to see a URL that begins `file://`. It is a real URL
and it works — on your machine. A teaching resource that documents this exact student failure puts it
bluntly: *"Such a link will work only on your computer."* Learners ask the obvious question — *"It seems
I can simply click on an HTML file (say, index.html) and the app will display in my browser, so why go
through all of the trouble of setting up a localhost?"* — and Units 5 and 6 answer it. For now, just
record what you see. In Unit 6 that same file answers on `http://` instead, and a phone can load it.

**The `ls_la_line` field is Topic 3's objective in one line.** You are not being asked to run commands —
that is Unit 2. You are being asked to *read* one line of output and hand it over intact.

### Expected output

`starter/submission.txt`, filled in. A Linux submission looks like this, field for field:

```
platform: Linux
absolute_path: /home/colin/projects/first-site/index.html
file_url: file:///home/colin/projects/first-site/index.html
mouse_actions: actions=<your count> apps=<your count>
ls_la_line: -rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
```

The two counts are yours to measure; the shape `actions=<n> apps=<n>` is fixed. Every other value is a
value you read off your own screen — on a Mac the same submission reads
`/Users/<you>/projects/first-site/index.html` and `file:///Users/<you>/projects/first-site/index.html`.

About that `ls -la` line: the fields run **type character, three `rwx` triples, link count, owner, group,
size in bytes, modification time, name**. If yours shows an eleventh character right after the ten
permission characters — a trailing `.` — that is an SELinux security-context marker that Fedora and RHEL
print and plain Ubuntu does not. Leave it in. The tests accept ten or eleven.

Running the tests locally:

```
python3 tests/test_1_fields_and_home.py
python3 tests/test_2_url_matches_path.py
python3 tests/test_3_ls_la_line.py
python3 tests/test_4_adversarial_shortcuts.py
```

Each prints `PASS`, or one line beginning `FAIL:` that names what is wrong.

### Rules

- **No terminal for tasks 1–5.** File manager and text editor only. `ls -la` in task 6 is the single
  exception, and you run it once.
- **Do not paste the prompt.** If you copy `$` or `%` from the start of a terminal line, you have copied
  the machine's prompt, not your output. The `$` "is a command prompt. It is not meant to be typed in."
- **Do not reformat `ls_la_line`.** Keep the runs of spaces. Keep the trailing dot if you have one. One
  line only — not the `total` line, not the whole listing.
- **No `~` in `absolute_path`.** `~` is an abbreviation your shell expands; this field wants the thing it
  expands to.
- **Read `file_url`, do not construct it.** A URL you assembled from a tutorial is not evidence of
  anything that happened on your machine.
- **Do not edit `tests/`.**

---

## Steps

- [ ] **1 — Name your platform and locate home.**
      Choose `macOS`, `Linux`, or `WSL` and identify your home directory's absolute path.
      *Completion criteria:* `platform` is exactly one of `macOS`, `Linux`, `WSL` (case-insensitive);
      and `absolute_path` starts with `/Users/` when `platform` is macOS, or with `/home/` when
      `platform` is Linux or WSL, and does not start with `/mnt/`.

- [ ] **2 — Build `projects/first-site` in the graphical file manager.**
      Two nested folders inside home, both named by you, neither on the Desktop.
      *Completion criteria:* `absolute_path` ends with the exact string
      `/projects/first-site/index.html` and contains no space character.

- [ ] **3 — Create `index.html` in a text editor and save it into `first-site`.**
      Plain text, one `<h1>` line, lowercase filename, no appended `.txt`.
      *Completion criteria:* the last whitespace-separated field of `ls_la_line` is exactly
      `index.html`, and the fifth whitespace-separated field parses as an integer greater than `0`.

- [ ] **4 — Record the absolute path.**
      The full address from `/` down, with nothing abbreviated.
      *Completion criteria:* `absolute_path` starts with `/`, contains no `~`, no `\`, and no path
      segment equal to `.` or `..`.

- [ ] **5 — Double-click the file and copy the address bar into `file_url`.**
      *Completion criteria:* `file_url` starts with `file://` and ends with the value of
      `absolute_path`.

- [ ] **6 — Run `ls -la ~/projects/first-site` once and copy the `index.html` line.**
      *Completion criteria:* the first whitespace-separated field of `ls_la_line` is 10 or 11
      characters long, its first character is `-`, and characters 2–10 match the pattern
      `[-r][-w][-xsS][-r][-w][-xsS][-r][-w][-xtT]`.

- [ ] **7 — Notice the cost.** *(noticing step — carry this number into Unit 2)*
      Count every distinct click, drag, and typed name, and every separate application you switched
      between. Unit 2 rebuilds this exact folder and file in two typed commands; write your number down
      so you can compare it there.
      *Completion criteria:* `mouse_actions` matches the pattern `actions=<integer> apps=<integer>`,
      with both integers greater than or equal to `1`.

---

## Test cases

| # | Name | Weight | What it checks |
| --- | --- | --- | --- |
| 1 | `test_1_fields_and_home.py` | 30 | All five fields present and non-empty; `platform` is one of the three; `absolute_path` is space-free, ends with `/projects/first-site/index.html`, and its home prefix matches the declared platform (`/Users/` for macOS, `/home/` for Linux and WSL, never `/mnt/`); `mouse_actions` parses as `actions=<n> apps=<n>` with both ≥ 1. |
| 2 | `test_2_url_matches_path.py` | 25 | `file_url` begins `file://` and ends with `absolute_path`; on macOS and Linux it must equal `file://` + `absolute_path` exactly. Catches a URL that points at a different file than the one submitted. |
| 3 | `test_3_ls_la_line.py` | 20 | `ls_la_line` is a single long-listing row for a **regular file**: 10-or-11-character mode string starting `-`, valid `rwx` triples, numeric link count, positive numeric size, at least eight fields, and a final field of exactly `index.html`. |
| 4 | `test_4_adversarial_shortcuts.py` | 25 | **Adversarial.** Catches the four plausible shortcuts: (a) a **relative** path such as `projects/first-site/index.html` submitted as if it were absolute; (b) a **`~`-abbreviated** path such as `~/projects/first-site/index.html`; (c) a **Windows drive-letter or backslash** path such as `C:\Users\you\projects\first-site\index.html`; and (d) a `file_url` that is actually an **`http://` URL copied from a tutorial** — including `http://localhost:8000/`, `http://127.0.0.1:8000/`, and any bare path pasted where a URL belongs. |

Weights sum to **100**.

---

## Environment

Pinned to the learner's own machine — this project cannot run anywhere else.

| Item | Pin |
| --- | --- |
| Platform | Exactly one of the three rows below. No other OS is supported. |
| macOS | Catalina or later — the release from which "your Mac uses zsh as the default login shell and interactive shell", which is why the prompt ends in `%`. |
| Linux | Ubuntu 26.04 LTS "Resolute Raccoon", released 2026-04-23, or the equivalent current release of your distribution. |
| Windows + WSL | "You must be running Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11"; enable Windows Subsystem for Linux, Virtual Machine Platform, and Windows Hypervisor Platform in *Turn Windows features on or off*, restart, then install Windows Terminal and Ubuntu from the Microsoft Store — WSL is not pre-installed. |
| Tools used | The platform's own graphical file manager (on macOS, the Finder) and its own plain-text editor. Nothing is downloaded or installed for this project. |
| Grading runtime | Python 3.14.6 |
| Test timeout | 10000 ms per test |

**macOS learners, do this now, not in Unit 5.** macOS ships no Python runtime — typing `python3` raises
a dialog: *"The "python3" command requires the command line developer tools. Would you like to install
the tools now?"* Say yes, or run `xcode-select --install`, which "opens a user interface dialog to
request automatic installation of the command line developer tools." Unit 5 needs it; this project does
not, which makes now the cheap time to fix it.

---

## Grading

Machine tests are 100 points as tabled above. The human/model rubric is a separate 100 points —
see [`rubric.md`](rubric.md).
