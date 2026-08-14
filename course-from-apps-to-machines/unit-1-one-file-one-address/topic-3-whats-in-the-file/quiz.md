# Quiz — What's actually in the file

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

Renaming `notes.txt` to `notes.html` converts the file into HTML.

**Correct answer:** false

**Explanation:**

The opposite is true. A rename changes only the name. The bytes on disk stay put, which is why the heading is still there when you open `notes.html` in the editor. The `.html` extension is a hint about which app should open the file, not a conversion (objective 7).

## Question 2

**Type:** SHORT_ANSWER

Read this captured line and name the type, the permissions field, the size, and the name.

`-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html`

**Sample answer:**

Type is a regular file (`-`). Permissions are `rw-r--r--`. Size is 12 bytes. Name is `index.html`.

**A full-credit answer shows:**

A strong answer covers all four fields: type as a file (or `-`), the `rw-r--r--` permissions, size 12, and the name `index.html`.

**Explanation:**

Left to right: `-` is the type (a regular file), `rw-r--r--` is the three permission groups, `12` is the size in bytes, and `index.html` is the name. The tempting misses are calling `1` the size, or reading `d` from the folder line above it (objective 8).

## Question 3

**Type:** MULTIPLE_CHOICE

You open the same `index.html` in a text editor and in a browser. What is true?

- Same bytes: editor shows the text, browser draws the page
- The browser converts the file into HTML first
- Each program opens a different copy on disk
- Opening it in the browser rewrites the bytes

**Correct option index:** 0

**Explanation:**

It is one file. The editor shows the characters; the browser draws the page those characters describe. The browser does not convert the file first — the bytes are already the page. You did not make a second copy, and opening the file does not rewrite it (objective 9).
