# Quiz — Build it without a mouse

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

`rm scratch-dir` deletes the folder `scratch-dir` the same way `rm scratch.txt` deletes a file.

**Correct answer:** false

**Explanation:**

The opposite is true. By default rm does not remove directories. You need `-r` to delete a folder and its contents. That flag is recursive, and it is permanent: rm has no trash (objective 5).

## Question 2

**Type:** SHORT_ANSWER

The folder `~/projects/first-site` is gone. Write the one command that rebuilds the whole path, including any missing parents, and does not fail if some of it already exists.

**Sample answer:**

mkdir -p ~/projects/first-site

**A full-credit answer shows:**

A strong answer covers `mkdir -p` and the path `~/projects/first-site`. `-p` is required: without it a missing parent is `No such file or directory`, and an existing folder is `File exists`.

**Explanation:**

`mkdir -p ~/projects/first-site` creates every missing parent and stays quiet if the path already exists. That is the one-liner you will use when the project deletes the folder. `touch` can make an empty file afterwards, but it does not build the path (objective 4).

## Question 3

**Type:** MULTIPLE_CHOICE

You type `mkdir ~/projects/first-site/deep/nested`. The folder `deep` does not exist. You did not pass `-p`. What happens?

- The shell prints `No such file or directory` and creates nothing.
- The shell prints `File exists` and creates nothing.
- Both `deep` and `nested` appear, as if you had used `-p`.
- `nested` appears in `first-site` and `deep` is skipped.

**Correct option index:** 0

**Explanation:**

Without `-p`, mkdir will not create missing parents. The error for a missing parent is `No such file or directory`. `File exists` is the other failure: you tried to create a folder that is already there. `-p` is what creates parents and stays quiet when the path exists (objective 4).
