# Quiz — Make the page

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

On WSL, keep `first-site` under `/mnt/c/Users/you` so Windows can see the files easily.

**Correct answer:** false

**Explanation:**

The opposite is true. `/mnt/c` is the Windows `C:` drive mounted in WSL. Keep the project in the Linux filesystem, at `/home/you/…`, not under `/mnt/c/Users/you`. (objective 3)

## Question 2

**Type:** SHORT_ANSWER

You are about to send a friend the address from your bar. Why will that `file://` URL fail on their machine?

**Sample answer:**

It names a file on my computer only. Their machine does not have my `/home/you/projects/first-site/index.html`, so the same address cannot open it.

**A full-credit answer shows:**

A strong answer covers two things: a `file://` URL works only on this computer, and it names a local path the friend does not have.

**Explanation:**

A `file://` URL names a file on your computer only. A friend does not have your `/home/you/projects/first-site/index.html`, so the same address cannot open it on their machine. (objective 2)

## Question 3

**Type:** MULTIPLE_CHOICE

You are on Linux. Where do you create `projects/first-site/index.html`?

- `/home/you/projects/first-site/`
- The Desktop
- `/mnt/c/Users/you/projects/first-site/`
- `/Users/you/projects/first-site/`

**Correct option index:** 0

**Explanation:**

Home on Linux is `/home/you`, so the project belongs at `/home/you/projects/first-site/`. The Desktop is a different folder; this course will not look there. `/mnt/c/Users/you/…` is a Windows drive as seen from WSL, not Linux home. `/Users/you/…` is home on a Mac, not on Linux. (objective 3)
