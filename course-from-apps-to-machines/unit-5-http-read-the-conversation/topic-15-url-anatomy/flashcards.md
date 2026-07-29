# Flashcards — Anatomy of a URL

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** In `http://192.168.1.42:8000/about/index.html?v=2#top`, which part is the *scheme*, and what does it settle?

**Back:** `http`. It is "the protocol that the browser must use to request the resource" [src 99] — it decides how every character after it is interpreted.

---

**Front:** Which slot of a URL names *which machine* you are addressing, and what two forms can fill it?

**Back:** The host (MDN's *domain*), sitting between `://` and the first `/`. "Usually this is a domain name, but an IP address may also be used" [src 101].

---

**Front:** What does the number after the colon in `192.168.1.42:8000` select?

**Back:** The port — "the technical \"gate\" used to access the resources on the web server" [src 102]. Same machine, different gate.

---

**Front:** `/about/index.html` looks exactly like a folder path. Is it one?

**Back:** Not necessarily. "In the early days of the Web, a path like this represented a physical file location on the Web server. Nowadays, it is mostly an abstraction handled by Web servers without any physical reality." [src 103]

---

**Front:** What is the `?v=2` in `.../index.html?v=2#top` called, and who decides what it means?

**Back:** The query. It carries `name=value` input alongside the path; the machine at the other end decides what to do with it, and the browser passes it along unread.

---

**Front:** Which character opens the fragment identifier, and what is the fragment for?

**Back:** `#`. It names a piece *inside* the retrieved page, so the browser can jump to it once the page has arrived.

---

**Front:** You visit `http://www.example.com/` and type no port. Which gate does the browser knock on?

**Back:** 80 — the standard port of the HTTP protocol, filled in for you because the scheme is `http` [src 102].

---

**Front:** You visit `https://www.example.com/` and type no port. Which gate does the browser knock on?

**Back:** 443 — the standard port for HTTPS [src 102].

---

**Front:** You load `http://192.168.1.42:8000/about/index.html?v=2#top`. Which part of that address does the machine at `192.168.1.42` never receive?

**Back:** The fragment. "The fragment is not sent to the server when the URI is requested; it is processed by the client (e.g., the browser) after the resource is retrieved." [src 104]

---

**Front:** Name the three things `file:///home/you/projects/first-site/index.html` has no room for.

**Back:** A host, a port, and a program listening — nothing is being asked of anyone; the browser reads the disk itself.
