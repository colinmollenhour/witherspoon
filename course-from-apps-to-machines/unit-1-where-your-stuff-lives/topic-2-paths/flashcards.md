# Flashcards — Paths: every file has an address

---

**Front:** What single thing makes a path absolute?

**Back:** Its first character is `/`. The path is then measured from the root of the whole machine and
means the same thing no matter where your terminal is standing.

---

**Front:** Your terminal is standing in `/home/you/projects`. What does the path
`first-site/index.html` point at?

**Back:** `/home/you/projects/first-site/index.html` — no leading `/`, so it is measured from where
you are standing right now.

---

**Front:** `~`

**Back:** Shorthand for your home directory, the value stored in `HOME`: `/Users/you` on macOS,
`/home/you` on Linux and WSL.

---

**Front:** `.`

**Back:** The directory you are standing in right now. `./index.html` and `index.html` are the same
address.

---

**Front:** `..`

**Back:** The parent directory — one level up. From `/home/you/projects/first-site`, `..` is
`/home/you/projects`.

---

**Front:** `/home` versus `home`

**Back:** `/home` is absolute — the top-level directory holding every user account's files. `home` is
relative — a directory named `home` inside wherever you happen to be standing.

---

**Front:** On a Mac with the default filesystem, are `Index.html` and `index.html` one file or two?

**Back:** One. APFS is "available in case-sensitive and case-insensitive variants on macOS, with
case-insensitive being the default."

---

**Front:** On Linux, what proves that `Index.html` and `index.html` are two separate files?

**Back:** They have different inode numbers — `4924918` and `4924919` — and different contents
(`lowercase file` versus `UPPERCASE file`).

---

**Front:** Case-preserving versus case-insensitive — what is the difference?

**Back:** Case-preserving means the capitals you typed are stored and shown back to you.
Case-insensitive means the filesystem will not distinguish those capitals when matching a name. APFS
is both, which is why the bug is invisible.

---

**Front:** `/mnt/c` on WSL

**Back:** The Windows `C:` drive mounted into the Linux filesystem. It is case-insensitive, unlike
the WSL Linux filesystem around it, which is case-sensitive.
