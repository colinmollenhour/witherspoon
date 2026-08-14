# Unit 3 test — Addresses, ports, and the first server

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**What's covered:** Quick check: can you name your LAN IP, start the server, read a status code, and say what just happened on the phone?

**Pass at:** 70%

## Question 1

**Type:** SHORT_ANSWER

Place `172.18.4.10` in an RFC 1918 block.

**Sample answer:**

`172.16.0.0/12` (addresses `172.16.0.0`–`172.31.255.255`).

**A full-credit answer shows:**

A strong answer names the `172.16.0.0/12` block (or the range 172.16–172.31).

**Explanation:**

The middle private block is `172.16/12`, not `172/8`. `172.18` sits inside it (objective 2).

## Question 2

**Type:** SHORT_ANSWER

An `ss -tlnp` line ends with `0.0.0.0:8000` and `users:(("python3",pid=8,fd=4))`. What is listening, and on which door?

**Sample answer:**

`python3` is listening on port 8000 on all interfaces (`0.0.0.0`).

**A full-credit answer shows:**

A strong answer covers: (1) the process is `python3`; (2) the port is 8000; (3) `0.0.0.0` means all interfaces, not just loopback.

**Explanation:**

Address:port is the door. The process column names the program. `0.0.0.0` is every interface, which matters in the next unit (objective 6).

## Question 3

**Type:** SHORT_ANSWER

A log line reads `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -`. What did the client ask for, and what happened?

**Sample answer:**

The client asked for `/nope` with GET. The server answered 404 — that path is not a file in the folder being served.

**A full-credit answer shows:**

A strong answer covers: (1) method GET; (2) path `/nope`; (3) status 404, meaning the path was missing.

**Explanation:**

Method, path, status. 404 is the client's wrong path, not a crashed server (objectives 8, 12).

## Question 4

**Type:** SHORT_ANSWER

Split `http://192.168.1.42:8000/` into scheme, host, port, and path.

**Sample answer:**

scheme `http`, host `192.168.1.42`, port `8000`, path `/`.

**A full-credit answer shows:**

A strong answer names all four: `http`, `192.168.1.42`, `8000`, `/`.

**Explanation:**

The IP is allowed in the host slot. `:8000` is the door. `/` is the path the server maps to its folder (objective 10).

## Question 5

**Type:** TRUE_FALSE

The same `index.html` opened as `file://` has no status code. Opened as `http://localhost:8000` it has one.

**Correct answer:** true

**Explanation:**

`file://` is the browser reading a path. `http://` is a conversation: request, status, headers, body. That is why the server exists (objective 9).

## Question 6

**Type:** TRUE_FALSE

In `curl -v` output, a line starting with `>` is something the server sent to you.

**Correct answer:** false

**Explanation:**

The opposite is true. `>` is a line you sent (the request). `<` is a line the server sent (the response) (objective 11).
