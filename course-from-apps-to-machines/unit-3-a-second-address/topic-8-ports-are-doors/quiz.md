# Quiz — Ports are doors

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

Port 80 is not privileged. Any program may claim it, just like port 8000.

**Correct answer:** false

**Explanation:**

The opposite is true. Ports below 1024 are privileged, so an ordinary program cannot claim them. 80 sits below that line. 8000 does not, which is why this file will use 8000 rather than 80. (objective 4)

## Question 2

**Type:** SHORT_ANSWER

You run `ss -tlnp` on a quiet machine. What are you listing, and how do you tell whether door 8000 is open?

**Sample answer:**

`ss -tlnp` lists TCP listeners and the process that owns each one. Read the address:port column. If you see `:8000`, that door is open. If that row is missing, nothing is listening on 8000 yet.

**A full-credit answer shows:**

A strong answer covers listing TCP listeners with `ss -tlnp` (or `lsof -iTCP -sTCP:LISTEN -P -n` on a Mac), reading the address:port column, and treating a missing `:8000` as a shut door.

**Explanation:**

The command lists listening TCP sockets and names the process. The column to read is address:port. On a quiet machine `:8000` is probably absent, because you have not opened that door yet. Looking at some other column, or assuming 8000 is always there, misses the measurement. (objective 6)

## Question 3

**Type:** MULTIPLE_CHOICE

You type `http://` and a host, with no port. Which door does the browser knock on?

- 80
- 443
- 8000
- 22

**Correct option index:** 0

**Explanation:**

A bare `http://` URL hides port 80, so that is the door. 443 is the hidden door for `https://`, not `http://`. 8000 is this file's door, and you must type `:8000` because it is not the usual one. 22 is ssh, which a web URL does not assume. (objective 5)
