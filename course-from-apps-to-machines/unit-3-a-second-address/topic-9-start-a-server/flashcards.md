# Flashcards — Start a server

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** What command starts the server in this course?

**Back:** `python3 -m http.server 8000`, run inside `~/projects/first-site`.

---

**Front:** What does the startup banner say?

**Back:** `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`

---

**Front:** Which folder does the server serve?

**Back:** The current working directory — wherever you stood when you started it.

---

**Front:** Why is `index.html` special?

**Back:** A request for a directory returns that file if it exists.

---

**Front:** Name the four load-bearing parts of an access-log line.

**Back:** Who asked, when, what they asked (method + path), and the status.
