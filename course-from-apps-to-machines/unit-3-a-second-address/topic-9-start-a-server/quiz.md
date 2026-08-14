# Quiz — Start a server

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

The same `index.html` opened as `file://` has a status code, just like `http://localhost:8000`.

**Correct answer:** false

**Explanation:**

The opposite is true. `file://` is the browser reading a path. There is no status code and no log line. `http://` is a conversation (objective 9).

## Question 2

**Type:** SHORT_ANSWER

A log line reads `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET / HTTP/1.1" 200 -`. What did the client ask for, and what happened?

**Sample answer:**

The client asked for `/` with GET. The server answered 200 — it found the page.

**A full-credit answer shows:**

A strong answer covers: (1) method GET; (2) path `/`; (3) status 200 meaning success.

**Explanation:**

Method, path, status. Match those three to the click you just made (objective 8).

## Question 3

**Type:** MULTIPLE_CHOICE

You start `python3 -m http.server 8000` in your home directory instead of in `~/projects/first-site`. What does `http://localhost:8000` show?

- The project page, because the server searches the disk for `index.html`
- A listing of home (or home's own `index.html`) — the server serves the folder it was started in
- An error, because the server refuses to start outside a project
- The same thing as `file:///home/you/projects/first-site/index.html`

**Correct option index:** 1

**Explanation:**

The server serves the current working directory. Start it in `first-site` or you are serving the wrong folder (objective 7).
