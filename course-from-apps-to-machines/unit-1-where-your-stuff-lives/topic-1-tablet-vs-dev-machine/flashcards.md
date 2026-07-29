# Flashcards — A tablet hides the filesystem; a dev machine hands it to you

---

**Front:** You are on a Mac. What is the absolute path of your home directory — the folder your own
work belongs in?

**Back:** `/Users/<you>`. Apple: "`/Users`—This directory contains one or more user home directories."

---

**Front:** You are on Linux, or in the Ubuntu shell inside WSL. What is the absolute path of your home
directory?

**Back:** `/home/<you>` — for a user named `colin`, `/home/colin`.

---

**Front:** Inside WSL, your Windows folder `C:\Users\<user name>\Project` shows up at what path?

**Back:** `/mnt/c/Users/<user name>/Project` — `/mnt/c` is the Windows C: drive seen from Linux.

---

**Front:** You are on WSL and about to create your project folder. `/home/<you>/projects` or
`/mnt/c/Users/<you>/projects`, and on whose authority?

**Back:** `/home/<you>/projects`. Microsoft: "For the fastest performance speed, store your files in
the WSL file system if you are working in a Linux command line".

---

**Front:** Which app do you open to get a terminal, on each of the three platforms?

**Back:** macOS — Terminal ("In the Finder, open the /Applications/Utilities folder, then double-click
Terminal"). Linux — **Ptyxis**, the default since Ubuntu 25.04 and Fedora Workstation 41, not GNOME
Terminal. Windows — Windows Terminal: "We recommend using WSL with Windows Terminal".

---

**Front:** Your prompt's last character is `$` in one window and `%` in another. What does each tell
you?

**Back:** `$` — the bash shell, the default on Linux and WSL. `%` — zsh, the default on macOS since
Catalina.

---

**Front:** Why is the Desktop the wrong place to keep your project folder?

**Back:** It is where files go when you have not decided where they go — the documented literacy
failure "saving everything to desktop/not using file directories". From Unit 2 on you type your
project's address by hand, so it needs to be a place you chose.

---

**Front:** What do you have to install before Unit 5 can work, on each platform?

**Back:** macOS — the command line developer tools, via `xcode-select --install`, because macOS ships
no Python. Windows — WSL itself, via `wsl --install`, needing "Windows 10 version 2004 and higher
(Build 19041 and higher) or Windows 11". Linux/WSL — nothing; `python3`, `curl`, and `nano` are
already there.
