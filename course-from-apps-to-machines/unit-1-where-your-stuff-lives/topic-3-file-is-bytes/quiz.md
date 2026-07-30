# Quiz — A file is bytes; the extension is only a hint

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

`MULTIPLE_CHOICE`

A listing shows this line:

```
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
```

Which statement about it is correct?

- `index.html` is a directory, and it holds 12 entries.
- `12` is the link count and `1` is the size of the file in bytes.
- `index.html` holds 12 bytes, and members of the group `ubuntu` may read it but not change it.
- The `.` after `r--` is a fourth triple, and it marks the file as hidden.

**Correct option index:** 2

**Explanation:**

The fields run type character, three triples, link count, owner, group, size,
modification time, name — so `1` is the link count, `colin` is the owning user, `ubuntu` is the owning
group, and `12` is the size in bytes. The group triple is `r--`: read, no write. A is wrong because
the type character is `-`, not `d`; a `d` would make it a directory. B reverses two fields — the size
sits after the group name, never before the owner. D misreads the trailing dot, which is not a
permission triple at all but an SELinux security-context marker that Fedora and RHEL print and Ubuntu
does not (objective 8).

---

## Question 2

**Type:** TRUE_FALSE

`TRUE_FALSE`

Saving a photo as `holiday.jpg` and then renaming it to `holiday.png` converts the picture into PNG
format, because the extension is what defines the file's type.

**Correct answer:** false

**Explanation:**

The opposite is true. Renaming changes the label only — every byte on disk is
identical before and after, and the size field in a listing does not budge. The reason this
misconception survives is that the icon and the opening program *do* change, which looks like
conversion: "if I save .jpg file with an .png extension (or vice versa) the most programs will open it
as normally" [src 166]. What actually happened is that the desktop read the new hint and launched a
different program against unchanged bytes (objective 7).

---

## Question 3

**Type:** MULTIPLE_CHOICE

`MULTIPLE_CHOICE`

A friend opens a folder they know contains a configuration file, sees nothing listed, and says the
folder is empty. What is the most likely explanation?

- The file's name begins with a dot, so plain listings skip it.
- The file was deleted, since nothing at all appears in the listing.
- The file is encrypted, so it needs a password before it appears.
- The file has no extension, so the desktop has nothing to display it as.

**Correct option index:** 0

**Explanation:**

Names beginning with `.` are dotfiles, and by convention listings omit them until you
ask; the manual describes `-a` as "do not ignore entries starting with ." [src 13]. Configuration
files are dotfiles almost by habit, which is exactly why this folder looks bare. B is the conclusion
people actually jump to — "Why doesn't this show the hidden files/folders?" has 222,790 views [src
162] — but an empty listing is not evidence of deletion. C invents a protection that is not there:
hiding is a naming convention, not encryption. D is false because a missing extension changes which
icon a desktop picks, never whether the name is listed (objective 8).

---

## Question 4

**Type:** MULTIPLE_CHOICE

`MULTIPLE_CHOICE`

Which statement about a file extension is true?

- It is stored separately from the name and fixes the file's real type.
- It is part of the name, and it hints at which program should open the file.
- Deleting it removes the part of the file that records its format.
- It is ignored everywhere except by the desktop's icon chooser.

**Correct option index:** 1

**Explanation:**

The extension is just the tail of the name after the final dot, and its whole job is
to tell the desktop which program to launch. A is the core misconception: nothing stores or enforces
it apart from the name itself. C treats the extension as being inside the file — it is not; the bytes
are untouched by renaming, which is why the size field never changes. D overshoots in the other
direction: once this same `index.html` is served over a real web server in Unit 5, the server reads
the extension and sends `Content-type: text/html` with it [src 114], so the extension is very much
consulted outside your desktop (objectives 7, 9).

---

## Question 5

**Type:** SHORT_ANSWER

`SHORT_ANSWER`

You open `~/projects/first-site/index.html` in a text editor, then open the identical file in a
browser. Describe what each program does with the bytes, and say what that tells you about where a
file's "type" lives.

exactly as stored, so you see the tags like `<h1>` and `</h1>` as literal text on the screen. The
browser reads those same characters as markup — instructions about structure — and draws a page, so
the `<h1>` becomes a large heading and the tag itself is no longer visible. Nothing about the file
differs between the two; the difference is entirely in how each program interprets it. A file is
bytes, and the "type" lives in the program that opens them, not in the file.

**A strong answer covers:**

**Sample answer:**

Both programs read the same unchanged bytes. The text editor shows every character
exactly as stored, so you see the tags like `<h1>` and `</h1>` as literal text on the screen. The
browser reads those same characters as markup — instructions about structure — and draws a page, so
the `<h1>` becomes a large heading and the tag itself is no longer visible. Nothing about the file
differs between the two; the difference is entirely in how each program interprets it. A file is
bytes, and the "type" lives in the program that opens them, not in the file.

**A full-credit answer shows:**

1. That the bytes are identical in both cases — the file did not change.
2. A concrete contrast: the editor displays the tags as text; the browser interprets them and renders
   a page.
3. The conclusion that meaning comes from the interpreting program, not from the file or its
   extension.

**Explanation:**

The point of opening one file twice is that it removes every other variable — same
path, same bytes, same size — leaving only the program. A learner who answers "the editor opens text
files and the browser opens HTML files" has restated the misconception, because it implies two kinds
of file when there is only one (objective 9).
