# Quiz — A two-line runbook

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

`python3 -m http.server 80` fails for the same reason a second server on 8000 fails: the door is already taken.

**Correct answer:** false

**Explanation:**

Port 80 fails with `PermissionError: [Errno 13] Permission denied` because ports below 1024 are privileged. An ordinary program cannot claim them. A second server on 8000 fails with `Address already in use` (Errno 98, or 48 on a Mac). Those are different doors and different errors. 8000 works because it sits above the privileged line. (objective 5)

## Question 2

**Type:** SHORT_ANSWER

Write the two-line runbook that starts and stops the server, then list the three usual checks when the phone still cannot reach it, in order.

**Sample answer:**

Start: `cd ~/projects/first-site` then `python3 -m http.server 8000`. Stop: Ctrl-C (`Keyboard interrupt received, exiting.`). Checks: (1) is the server running, (2) is it the right directory, (3) is the phone using the LAN IP, not localhost.

**A full-credit answer shows:**

A strong answer covers starting from `~/projects/first-site` on port 8000, stopping with Ctrl-C, and the three usual checks in that order (server running, right directory, LAN IP not localhost). Firewall after those three is welcome but not required. A start command from the wrong folder, or firewall as the first check, is not enough.

**Explanation:**

The runbook is start from `~/projects/first-site` on 8000, and stop with Ctrl-C. The three usual causes are: server running, right directory, phone using the LAN IP not localhost. Firewall comes after those three. (objective 6)

## Question 3

**Type:** MULTIPLE_CHOICE

You start a second `python3 -m http.server 8000` and see `OSError: [Errno 98] Address already in use`. What do you do?

- Find who owns port 8000 with `ss` or `lsof`, then stop that process
- Switch to port 80, which is always free
- The machine is broken; reinstall Python
- Ignore it — the first server must have crashed

**Correct option index:** 0

**Explanation:**

Errno 98 means the door is taken, usually by a leftover server. `ss -tlnp` (or `lsof` on a Mac) names the owner; stop it, then start again. Port 80 is a different failure — `Permission denied`, not in-use. The wording sounds like a broken machine, but the owner is an ordinary process. The first server is still holding the door, which is why the second start failed. (objective 4)
