# Unit 1 test — The file and its address

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**What's covered:** Quick check: can you make the page, write its path, and read one `ls -la` line?

**Pass at:** 70%

## Question 1

**Type:** SHORT_ANSWER

A classmate's `ls -la` line is `-rw-r--r--  1 sam sam  12 Jul 29 04:25 index.html`. What do the leading `-` and the `12` tell you?

**Sample answer:**

The leading `-` means this is a regular file, not a directory. The `12` is the size in bytes.

**A full-credit answer shows:**

A strong answer covers: (1) `-` is the type character for a regular file (`d` would be a directory); (2) `12` is the size in bytes.

**Explanation:**

Type character first, size after owner and group. The name at the end is `index.html`. Permissions exist but you only needed those two fields here (objective 8).

## Question 2

**Type:** SHORT_ANSWER

You are standing in `~/projects`. What does `../projects/first-site` refer to, and what does `./first-site` refer to?

**Sample answer:**

`./first-site` is the `first-site` folder inside the current directory, `~/projects`. `../projects/first-site` goes up to home, then back into `projects/first-site` — the same folder, the long way round.

**A full-credit answer shows:**

A strong answer covers: (1) `.` means here, so `./first-site` is `~/projects/first-site`; (2) `..` means the folder above, so the longer path is also `~/projects/first-site`.

**Explanation:**

Both paths name the same folder if you started in `~/projects`. `.` is here; `..` is up one. The first character is not `/`, so both are relative (objectives 4, 5).

## Question 3

**Type:** TRUE_FALSE

`Index.html` and `index.html` are the same file on a default Mac.

**Correct answer:** true

**Explanation:**

Default APFS is case-insensitive (and case-preserving), so those two names land on one file. On Linux they are two files. A site that works on a Mac can 404 on a Linux server over one capital letter (objective 6).

## Question 4

**Type:** MULTIPLE_CHOICE

You just made `~/projects/first-site/index.html` and double-clicked it. The address bar reads `file:///home/sam/projects/first-site/index.html`. What is that URL naming?

- A page on the internet that anyone can open
- This file on this machine, as a path the browser can follow
- A server running on port 80
- The Desktop, because that is where downloads go

**Correct option index:** 1

**Explanation:**

A `file://` URL is the same path you already have, written so a browser can open it. It is not a public address, it is not a server, and the Desktop is the wrong home for this project (objectives 1, 2).

## Question 5

**Type:** MULTIPLE_CHOICE

On Linux, home is `/home/sam`. Which of these is an absolute path to the project page?

- projects/first-site/index.html
- ~/projects/first-site/index.html
- /home/sam/projects/first-site/index.html
- ./index.html

**Correct option index:** 2

**Explanation:**

An absolute path starts with `/`. `~` and `./` are useful abbreviations, and `projects/…` is relative — none of those start from the top of the machine (objective 4).

## Question 6

**Type:** MULTIPLE_CHOICE

You rename `notes.txt` to `notes.html`. The icon changes. What happened to the bytes on disk?

- They were converted into HTML markup
- They were deleted and a new file was written
- They stayed the same — only the name changed
- The browser rewrote them the first time you opened the new name

**Correct option index:** 2

**Explanation:**

The tempting wrong idea is that the extension converts the file. It does not. The name is a hint about which program to launch. The bytes are whatever you typed (objective 7).
