# Flashcards — A tablet hides the filesystem; a dev machine hands it to you

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** You are on a Mac. What is the absolute path of your home directory — the folder your own work belongs in?

**Back:** `/Users/<you>`. Apple: "`/Users`—This directory contains one or more user home directories."

---

**Front:** You are on Linux, or in the Ubuntu shell inside WSL. What is the absolute path of your home directory?

**Back:** `/home/<you>` — for a user named `colin`, `/home/colin`.

---

**Front:** Inside WSL, your Windows folder `C:\Users\<user name>\Project` shows up at what path?

**Back:** `/mnt/c/Users/<user name>/Project` — `/mnt/c` is the Windows C: drive seen from Linux.

---

**Front:** You are on WSL and about to create your project folder. `/home/<you>/projects` or `/mnt/c/Users/<you>/projects`, and on whose authority?

**Back:** `/home/<you>/projects`. Microsoft: "For the fastest performance speed, store your files in
the WSL file system if you are working in a Linux command line".

---

**Front:** Which app do you open to get a terminal, on each of the three platforms?

**Back:** macOS — Terminal ("In the Finder, open the /Applications/Utilities folder, then double-click
Terminal"). Linux — **Ptyxis**, the default since Ubuntu 25.04 and Fedora Workstation 41, not GNOME
Terminal. Windows — **Windows Terminal** from the Microsoft Store (not Command Prompt), then an
Ubuntu tab: "We recommend using WSL with Windows Terminal".

---

**Front:** Your prompt's last character is `$` in one window and `%` in another. What does each tell you?

**Back:** `$` — the bash shell, the default on Linux and WSL. `%` — zsh, the default on macOS since
Catalina.

---

**Front:** Why is the Desktop the wrong place to keep your project folder?

**Back:** It is where files go when you have not decided where they go — the documented literacy
failure "saving everything to desktop/not using file directories". From Unit 2 on you type your
project's address by hand, so it needs to be a place you chose.

---

**Front:** What must each platform install so this course can run — and when?

**Back:** Windows — WSL now (not pre-installed; needed for the rest of Unit 1): enable Windows
Subsystem for Linux, Virtual Machine Platform, and Windows Hypervisor Platform, restart, then
install Windows Terminal and Ubuntu from the Microsoft Store. macOS — command line developer tools
via `xcode-select --install` (needed by Unit 5; install in Unit 1 while setting up). Linux — nothing
once the distro is installed; `python3`, `curl`, and `nano` are already there.
