# Quiz — Read the conversation — then try your phone

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

A 500 means you asked for a page that does not exist.

**Correct answer:** false

**Explanation:**

The opposite is true. A missing path is 404 — you asked, and the server is working. 500 means the server hit an unexpected condition and could not fulfil the request. (objective 12)

## Question 2

**Type:** SHORT_ANSWER

Split `http://192.168.1.42:8000/` into scheme, host, port, and path.

**Sample answer:**

scheme `http`, host `192.168.1.42`, port `8000`, path `/`

**A full-credit answer shows:**

A strong answer covers all four pieces: scheme `http`, host `192.168.1.42` (an IP in the host slot), port `8000`, and path `/`.

**Explanation:**

`://` joins the scheme to the authority. The authority is host plus port, so `192.168.1.42` is the host and `8000` is the gate. `http` is the scheme, not the machine. The final `/` is the path, not decoration. An IP may replace a domain in the host slot. (objective 10)

## Question 3

**Type:** MULTIPLE_CHOICE

You run `curl -v http://localhost:8000` against your server. Which lines did the server send?

- Lines that start with `>`
- Lines that start with `<`
- `curl: (7) Failed to connect… Could not connect to server`
- Only the HTML body, with no prefix

**Correct option index:** 1

**Explanation:**

curl marks the response with `<` — status-line, headers, and the start of the body. `>` is the request you sent, so those lines are yours. `curl: (7)` is what you get when nothing is listening: there is no HTTP conversation at all. The HTML is part of the response, but it is not the only thing the server sent, and verbose mode prefixes the head with `<`. (objective 11)
