# Quiz — Generate the page

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

`>>` wipes the file first, then writes the new text.

**Correct answer:** false

**Explanation:**

The opposite is true. `>` wipes, then writes. `>>` appends: it adds to the end and leaves what was already there. Mixing them up either deletes the page or glues new lines onto yesterday's markup. (objective 7)

## Question 2

**Type:** TRUE_FALSE

A page you type into nano is a generated page, because the file ends up on disk.

**Correct answer:** false

**Explanation:**

The opposite is true. Generated means the shell wrote the bytes — `echo` through `>` and `>>`. Nano puts the same path on disk by you typing. The file existing is not the test; who wrote the bytes is. (objective 9)

## Question 3

**Type:** SHORT_ANSWER

Write the two commands that generate a two-line `index.html` at `~/projects/first-site/index.html` from `echo`, without opening an editor.

**Sample answer:**

```
echo '<h1>Ground Zero</h1>' > ~/projects/first-site/index.html
echo '<p>Generated.</p>' >> ~/projects/first-site/index.html
```

**A full-credit answer shows:**

A strong answer covers two commands: `echo` with `>` to start `~/projects/first-site/index.html`, then `echo` with `>>` to add a second line. The markup can vary; the operators cannot. An answer that opens nano, or that uses `>` on both lines, is not generating the page as taught.

**Explanation:**

The file is generated when `echo` writes the markup. `>` starts the file; `>>` adds the next line. Typing the same tags in nano is editing, not generating. Using `>` twice would wipe the heading when the paragraph is written. (objective 9)
