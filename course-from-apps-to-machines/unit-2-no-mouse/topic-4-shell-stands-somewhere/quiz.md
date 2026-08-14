# Quiz — The shell stands somewhere

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

When the shell prints `No such file or directory`, the file on disk is corrupted.

**Correct answer:** false

**Explanation:**

The message means a lookup found nothing from where you are standing. A relative name is measured from the current folder, so the same file is missing from one vantage point and present from another. Run `pwd` before you decide the file is damaged. (objective 1)

## Question 2

**Type:** SHORT_ANSWER

You have wandered off. How do you stand in the project folder from anywhere, and how do you prove it?

**Sample answer:**

Type `cd ~/projects/first-site`, then `pwd`. The printed path ends in `/projects/first-site`.

**A full-credit answer shows:**

A strong answer covers the `cd` to `~/projects/first-site` (an absolute `/home/you/…` form is also fine) and a `pwd` check whose path ends in `/projects/first-site`. Mentioning the prompt as a glance is extra, not a substitute for `pwd`.

**Explanation:**

`cd ~/projects/first-site` works from any starting folder because it starts from home, not from where you stand. `pwd` is the proof: it prints the absolute path and changes nothing. The prompt may already show the folder, but `pwd` is the command whose job is to name it. (objective 2)

## Question 3

**Type:** MULTIPLE_CHOICE

You run these commands in order:

```
cd ~/projects/first-site
cd ..
pwd
```

What does the last command print on Linux?

- /home/you/projects/first-site
- /home/you/projects
- /home/you
- ~/projects

**Correct option index:** 1

**Explanation:**

`cd ~/projects/first-site` lands in the project folder. `cd ..` then stands in the parent, so `pwd` prints `/home/you/projects`. The first option is where you were before `..`. The third treats `..` as going home — that is bare `cd`, not `cd ..`. The fourth uses `~`, but `pwd` always prints an absolute path beginning with `/`. (objectives 1, 2)
