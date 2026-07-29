# Flashcards — A file is bytes; the extension is only a hint

**Card 1**
Front: In `ls -la`, the very first character of a line is `d` instead of `-`. What is that line?
Back: A directory — a folder. `-` in that position means a regular file.

**Card 2**
Front: What are the nine characters after the type character in `-rw-r--r--`, and in what order?
Back: Three permission triples, always owner, then group, then others.

**Card 3**
Front: In a permission triple, what does `r` allow?
Back: Reading the file's contents.

**Card 4**
Front: In a permission triple, what does `w` allow?
Back: Changing the file's contents.

**Card 5**
Front: In a permission triple, what does `x` allow?
Back: Running the file as a program — and on a directory, entering it.

**Card 6**
Front: What does the `-a` flag on `ls` reveal?
Back: Entries starting with `.` — the manual says "do not ignore entries starting with ." [src 13]

**Card 7**
Front: Why is `.env` missing from a plain listing of the folder it sits in?
Back: Its name starts with a dot, so listings skip it by convention. It is not protected or encrypted.

**Card 8**
Front: You rename `notes.txt` to `notes.html`. What changed on disk, and what did not?
Back: Only the name changed. The bytes and the size are identical; the icon and opening app changed
because the desktop reads the extension as a hint.

**Card 9**
Front: In `-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html`, who is `colin` and who is
`ubuntu`?
Back: `colin` is the owning user; `ubuntu` is the owning group.

**Card 10**
Front: Your permission string is 11 characters and ends in a dot, but your friend's is 10. Who is
broken?
Back: Neither. The 11th character is an SELinux security-context marker on Fedora/RHEL; plain
Ubuntu and Debian print 10 characters. [src 11]
