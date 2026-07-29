# A tablet hides the filesystem; a dev machine hands it to you

**Unit:** 1 — Where your stuff actually lives
**Objectives (unit-numbered):**
1. Name the folder your own work belongs in on your platform — `/Users/<you>` on macOS, `/home/<you>` on Linux, or `/home/<you>` inside WSL with Windows drives at `/mnt/c` — and state why it is not the Desktop.   [obj 1]
2. List three things a desktop OS lets you do that a tablet does not: run two programs against the same file, install a program that did not come from a store, and address any file by a path.   [obj 2]
3. Open a terminal on your platform — Terminal.app on macOS, Ptyxis or your distro's terminal on Linux, or Ubuntu via Windows Terminal on WSL — and read your username out of the prompt.   [obj 3]

## Topic generation prompt

This is the first thing the learner reads. Open on the actual gap, not on encouragement: on a phone
or tablet, a file has no address — you search for it and it appears. On a dev machine every file sits
at exactly one path, and the terminal cannot search on your behalf; it must be told where to look.
Use the ACRLog quotes [src 173] to show this is a documented, widespread gap and not a personal
failing — the learner should finish this section feeling *located*, not behind. Then give the
three-platform map: `/Users/<you>`, `/home/<you>`, and WSL's split world where the Linux home is
`/home/<you>` and the Windows drive hangs off `/mnt/c` [src 1, 2, 3]. For WSL learners, quote
Microsoft's own recommendation to keep project files on the Linux side [src 4, 5] — this is the one
setup decision that will bite them for the rest of the course. Close by having them open a terminal
and read their own username in the prompt, naming the correct terminal app per platform [src 31, 32,
33] — note Ptyxis, not GNOME Terminal, is now the Linux default [src 32]. State the platform
prerequisites plainly here so nobody discovers them in Unit 5: macOS learners will need
`xcode-select --install` because macOS ships no Python [src 127, 128, 129]; Windows learners need
WSL, which is not pre-installed — direct non-terminal users to install **Ubuntu from the Microsoft
Store** (https://apps.microsoft.com/detail/9pdxgncfsczv) rather than `wsl --install` [src 152, 183].

Do NOT teach any command other than opening a terminal and reading the prompt. `pwd`, `ls`, and `cd`
belong to Unit 2 and teaching them here wrecks that unit's opening.

## Grounded facts

- macOS home: "`/Users`—This directory contains one or more user home directories." [src 1]
- Linux home: `/home/colin`, from `getent passwd` [src 2]
- WSL mount point: "the Windows file system C:\ drive ... will look like this when mounted in a WSL command line: `/mnt/c/Users/<user name>/Project$`" [src 3]
- WSL guidance, verbatim: "We recommend against working across operating systems with your files... For the fastest performance speed, store your files in the WSL file system if you are working in a Linux command line" [src 4, 5]
- Terminal.app: "In the Finder, open the /Applications/Utilities folder, then double-click Terminal." [src 31]
- Linux default terminal is **Ptyxis** (Ubuntu 25.04+, Fedora 41+), NOT GNOME Terminal [src 32]
- WSL: "We recommend using WSL with Windows Terminal" [src 33]
- Prompt shapes: Linux bash ends `$`; macOS zsh ends `%` [src 28, 30]
- macOS ships no Python; `python3` opens a dialog: "The \"python3\" command requires the command line developer tools. Would you like to install the tools now?" Fix: `xcode-select --install` [src 127, 128, 129]
- WSL is not pre-installed. Preferred path for this course: install Ubuntu from the Microsoft Store — "Install a complete Ubuntu terminal environment in minutes with Windows Subsystem for Linux (WSL)." [src 183]. Version requirement: "Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11" [src 152]
- The documented gap: "Unable to use browser (only uses phone applications)"; "The technical understanding of computers, programs, and how they work just isn't there in many young adults" [src 173]
- Teach from: ACRLog 2024 digital-literacy post [src 173]; Microsoft WSL filesystems page [src 4]

## Requested activities

- READ: 900–1100 words. Open on the search-vs-address gap using [src 173]. Give the three-platform home-directory map and the WSL `/mnt/c` split. State the per-platform setup prerequisites. End with the learner having a terminal open and having read their own username in the prompt. Must NOT introduce `pwd`/`ls`/`cd`. Ends by naming the running example: over this course they will build one folder, `~/projects/first-site/`, containing one file, `index.html`, and carry it all the way to a URL their phone can load.
- FLASHCARDS: 8 cards. Home directory path per platform (3 confusable cards); `/mnt/c` vs `/home` on WSL; terminal app per platform; what `$` vs `%` at the end of a prompt tells you; one card on why the Desktop is a bad place for project files.
- QUIZ: 5 questions on choosing the right home path for a stated platform, deciding where a WSL learner should put a project folder and why, identifying which capability is desktop-only, and reading a platform off a prompt string.

## Handoff

**Inherits:** Nothing. The running example does not exist yet.
**Leaves:** The learner has a terminal open on their own machine, knows their home directory's absolute path, and knows that `~/projects/first-site/index.html` is what they are going to build.
**Do not cover:** Any shell command beyond opening the terminal (Unit 2 owns those). Path syntax — `~`, `.`, `..`, absolute vs relative — belongs to Topic 2. Permissions belong to Topic 3.
