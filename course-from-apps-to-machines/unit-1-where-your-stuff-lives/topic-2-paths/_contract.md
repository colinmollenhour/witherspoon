# Paths: every file has an address

**Unit:** 1 — Where your stuff actually lives
**Objectives (unit-numbered):**
4. Classify any given path as absolute or relative by looking at its first character, and write the absolute path of a file starting from `/`.   [obj 4]
5. Rewrite the same location three ways using `~`, `.`, and `..`, and predict what each resolves to from a stated starting directory.   [obj 5]
6. Predict whether `Index.html` and `index.html` are the same file on a default Mac (yes — APFS is case-insensitive) and on Linux or the WSL Linux filesystem (no).   [obj 6]

## Topic generation prompt

Teach the path as an address with a grammar. Start from the single rule that does the most work: a
path beginning with `/` is absolute and is measured from the root of the whole machine; anything else
is relative and is measured from wherever you happen to be standing. Build `~/projects/first-site/`
as the worked example and write it out in full on each platform —
`/Users/you/projects/first-site/index.html` and `/home/you/projects/first-site/index.html` — so `~` is
visibly an abbreviation, not a special place [src 17]. Then `.` and `..`, shown as movement between
two named directories rather than as definitions. Ground the absolute/relative distinction in real
consequences with the `rm -r /home/` vs `rm -r home/` story [src 164] — one leading slash, and the
difference between deleting a folder and deleting everyone's data. Do not moralise; state it once and
move on. Then case sensitivity: prove it with the real inode capture [src 8] showing `index.html` and
`Index.html` as two distinct files with different inode numbers on Linux, contrasted with Apple's own
statement that APFS is case-insensitive by default but case-preserving [src 6, 7]. WSL learners get
the extra wrinkle that their Linux home is case-sensitive while `/mnt/c` is not [src 9]. Land the
practical consequence: a site that works on a Mac can 404 on a Linux server purely over a capital
letter.

Do NOT cover `ls`, `cd`, or any other command — Unit 2 owns those. Do not cover permissions or
dotfiles; Topic 3 owns them.

## Grounded facts

- Absolute paths are defined by the leading slash: "If the directory operand begins with a <slash> character, set curpath to the operand" [src 16]
- `~` is an abbreviation for `$HOME`: "If no directory operand is given and the HOME environment variable is set to a non-empty value, the cd utility shall behave as if the directory named in the HOME environment variable was specified" [src 17]
- Case sensitivity proof, real capture: `index.html` inode `4924918`, `Index.html` inode `4924919`, contents `lowercase file` vs `UPPERCASE file` [src 8]
- APFS: "available in case-sensitive and case-insensitive variants on macOS, with case-insensitive being the default" [src 6]
- APFS "preserves both case and normalization of the filename on disk in all variants" [src 7]
- WSL: Linux FS case-sensitive, `/mnt/c` case-insensitive [src 9]
- The absolute/relative slash, with consequences: "I used `rm -r /home/` instead of `rm -r home/` as root... Unfortunately I have no backups." (56,565 views) [src 164]
- Teach from: The Open Group `cd` specification for the absolute-path rule [src 16, 17]; Apple's APFS FAQ [src 6, 7]

## Requested activities

- READ: 900–1100 words. Build `~/projects/first-site/index.html` as a full absolute path on each platform. Teach `/`, `~`, `.`, `..` in that order. Use the real inode capture [src 8] to prove case sensitivity rather than asserting it. End with the learner able to write out their own project's absolute path.
- FLASHCARDS: 10 cards. Absolute vs relative (the leading-slash rule); `~`, `.`, `..` (one card each, cue → meaning); `/home` vs `home`; APFS case-insensitive vs Linux case-sensitive; case-preserving vs case-insensitive as a discriminating pair; what `/mnt/c` is on WSL.
- QUIZ: 5 questions on classifying a given path as absolute or relative, resolving a `../..` path from a stated cwd, predicting whether two differently-cased filenames collide on a named platform, and identifying which of four paths would be catastrophic to pass to `rm -r`.

## Handoff

**Inherits:** A terminal is open; the learner knows their home directory's absolute path.
**Leaves:** The learner can write the absolute path of `~/projects/first-site/index.html` on their own platform and can say whether their filesystem is case-sensitive.
**Do not cover:** Any command (Unit 2). Permissions, dotfiles, and file types (Topic 3). Creating the folder — that is Project 1.
