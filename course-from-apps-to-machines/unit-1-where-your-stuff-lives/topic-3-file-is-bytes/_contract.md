# A file is bytes; the extension is only a hint

**Unit:** 1 — Where your stuff actually lives
**Objectives (unit-numbered):**
7. Rename `notes.txt` to `notes.html` and explain why the bytes on disk are unchanged even though the icon and the opening app change.   [obj 7]
8. Read a real `ls -la` line and name each field: type character, the three `rwx` triples, link count, owner, group, size, and modification time.   [obj 8]
9. Distinguish the file from the app that opens it by opening the same `index.html` in a text editor and in a browser and describing what each one does with the identical bytes.   [obj 9]

## Topic generation prompt

Kill the belief that the extension *is* the file type. Use the real evidence that this belief is
widespread [src 166] rather than asserting that learners hold it. The demonstration is the running
example itself: `index.html` is a plain text file — open it in a text editor and you see the tags;
open it in a browser and you see a page. Same bytes, two programs, two behaviours [src 166]. Then
seed the idea the course collects in Unit 5: on a real HTTP server the extension is not ignored — the
server maps it to a `Content-Type` header, which is how the browser is *told* what it received rather
than guessing [src 114]. Name that as a forward reference; do not explain headers here. Next, dotfiles:
use the real evidence that hidden files read as "my folder is empty" [src 162], then show the actual
captured `ls -la` block [src 10] and walk it field by field, including the dotfile row. Explain the
permission string as three triples, and flag honestly that some systems print an extra character after
it — the SELinux context dot [src 11] — so a learner on Fedora is not confused by an 11-character
string. Mention that new files default to `644` and directories to `755` because of the umask [src 12].

Do NOT teach `chmod` or how to change permissions — reading them is the objective. Do NOT teach `cat`,
`ls` as a command to run repeatedly, or any navigation; Unit 2 owns command usage. Here `ls -la`
output is being *read*, not *driven*.

## Grounded facts

- Real `ls -la` capture to teach from, verbatim: `drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .` / `-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env` / `-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html` / `drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects` [src 10]
- An 11th character may follow the permission string: it is an SELinux context marker on Fedora/RHEL; plain Ubuntu prints 10 characters [src 11]
- Ubuntu default `umask 0022` → files `644`, directories `755` [src 12]
- `-a` → "do not ignore entries starting with ." ; `-l` → "use a long listing format" [src 13]
- Extension-renaming misconception, evidenced: "if I save .jpg file with an .png extension (or vice versa) the most programs will open it as normally" [src 166]
- Hidden-file misconception, evidenced: "Why doesn't this show the hidden files/folders?" (222,790 views) [src 162]
- Forward reference only: a served `.html` file gets `Content-type: text/html` [src 114]
- Teach from: the real `ls -la` capture [src 10]; Ubuntu `ls` manpage [src 13]

## Requested activities

- READ: 900–1100 words. Rename demonstration first, then the file-vs-app distinction using the running example's `index.html`, then dotfiles and the annotated real `ls -la` block [src 10]. Must include the SELinux-dot caveat [src 11] so cross-platform learners are not confused. Ends with the learner able to read any `ls -la` line.
- FLASHCARDS: 10 cards. The `d` vs `-` type character; the three permission triples; `r`, `w`, `x` (one card each); what `-a` reveals; why a dotfile is hidden; extension vs content as a discriminating pair; owner vs group.
- QUIZ: 5 questions on reading a supplied `ls -la` line for a specific field, predicting what happens to the bytes when a file is renamed, deciding why a folder looks empty, and identifying which of four statements about extensions is true.

## Handoff

**Inherits:** The learner can write absolute paths and knows whether their filesystem is case-sensitive.
**Leaves:** The learner can read an `ls -la` line, knows the extension is a hint rather than a fact, and knows `index.html` is plain text that a browser interprets. Ready to build the folder by hand in Project 1.
**Do not cover:** Changing permissions with `chmod`. Any navigation or file-manipulation command (Unit 2). `Content-Type` beyond a one-line forward reference (Unit 5, Topic 17).
