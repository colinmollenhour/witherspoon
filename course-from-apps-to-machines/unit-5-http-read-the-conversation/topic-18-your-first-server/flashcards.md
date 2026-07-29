# Flashcards — Your first server

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `python3 -m http.server 8000`

**Back:** Starts a web server that serves the folder your terminal is standing in. It prints
`Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` and then stays running until you stop
it.

---

**Front:** You run `python3 -m http.server` with no number after it. What port does it use?

**Back:** 8000. "The server listens to port 8000 by default."

---

**Front:** Which folder does `python3 -m http.server` serve?

**Back:** The current working directory — the folder you had `cd`'d into when you started it. "The
request is mapped to a local file by interpreting the request as a path relative to the current
working directory."

---

**Front:** Why does `http://localhost:8000/` show your page even though you never typed a filename?

**Back:** A URL path ending in a directory makes the server look for an index page, and `index_pages`
"Defaults to `("index.html", "index.htm")`." If no index page is there, it generates a directory
listing instead.

---

**Front:** Name the six fields in `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -`

**Back:** Client address, two obsolete identity fields (always `-`), local timestamp with no timezone,
the client's request line in quotes, the status code, and a size field that is always `-`.

---

**Front:** The server's startup banner and its per-request log lines go to two different places. Which is which?

**Back:** The banner goes to stdout; every access-log line goes to stderr. Redirecting one still leaves
the other on your screen.

---

**Front:** Your log line says `"GET /nope HTTP/1.1"` but `curl -I` showed `HTTP/1.0 200 OK`. Which version does the server actually speak?

**Back:** HTTP/1.0 — hard-coded as `protocol_version = "HTTP/1.0"`. The `HTTP/1.1` in the log is copied
straight out of the client's request line, not the server's answer.

---

**Front:** `curl -I http://localhost:8000/index.html` — what exactly is in the `Content-type` header?

**Back:** `Content-type: text/html`, with no charset. A real `.html` file read off disk gets nothing
more; only the server's own generated directory listing carries `; charset=utf-8`.

---

**Front:** Why does a page opened over `file://` have no status code and no response headers?

**Back:** Because nothing answered. No server was asked, so there was no request, no verdict on it,
and no response to describe. The browser read the disk itself.

---

**Front:** How do you stop a running `python3 -m http.server`, and what does it print?

**Back:** Press `Ctrl-C`. It prints `Keyboard interrupt received, exiting.` and returns your shell
prompt.
