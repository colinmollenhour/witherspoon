# Flashcards — The phone's address is not yours

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** Why `http://localhost:8000` fails on the phone.

**Back:** `localhost` is the machine that is asking. The phone asked itself.

---

**Front:** `127.0.0.1`

**Back:** Loopback. This machine only. It must not appear outside a host.

---

**Front:** `0.0.0.0` as a bind address

**Back:** All interfaces. The server will answer on every address this machine has.

---

**Front:** How you confirm `python3 -m http.server` binds all interfaces.

**Back:** The banner: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`

---

**Front:** What `--bind 127.0.0.1` would do.

**Back:** Listen on loopback only. Other devices could not connect, even with the LAN IP.
