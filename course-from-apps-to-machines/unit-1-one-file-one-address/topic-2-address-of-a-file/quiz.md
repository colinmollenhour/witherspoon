# Quiz — The address of a file

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

On a default Mac, `Index.html` and `index.html` are two different files.

**Correct answer:** false

**Explanation:**

The opposite is true. Default APFS is case-insensitive, so those two names are the same file. It is case-preserving: it remembers the capitals you typed, but a change of case does not create a second file. Linux is the one that treats them as two files (objective 6).

## Question 2

**Type:** SHORT_ANSWER

Your home is `/home/you`. Write the absolute path of `~/projects/first-site/index.html`.

**Sample answer:**

/home/you/projects/first-site/index.html

**A full-credit answer shows:**

A strong answer covers the expansion of `~` to `/home/you`, keeps `/projects/first-site/index.html` after that, starts with `/`, and uses lowercase `index.html`.

**Explanation:**

`~` is home. Home here is `/home/you`, so the shell rewrites the path as `/home/you/projects/first-site/index.html`. The rest of the path is unchanged. The result starts with `/`, so it is absolute (objective 5).

## Question 3

**Type:** MULTIPLE_CHOICE

You type `projects/first-site/index.html`. Is this path absolute or relative, and why?

- Relative, because it does not start with `/`
- Absolute, because it names every folder down to the file
- Absolute, because it includes the filename `index.html`
- Relative, because it does not start with `~`

**Correct option index:** 0

**Explanation:**

The first character is `p`, not `/`, so the path is relative. Naming several real folders does not make a path absolute — `/home/` and `home/` are different kinds, and only the leading slash decides. `~` is a shortcut for home, not the test for relative. A filename at the end is just the last piece of the address (objective 4).
