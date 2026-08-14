# Project 5 — HTTP Field Notes

**Type:** `interactive-form`
**Unit:** 3 — A second address

## Goal

Capture three real HTTP exchanges — a public site, a redirect, and your own server — then show what `file://` lacks that all of them have. Report what your phone does with `http://localhost:8000`. Do not fix it.

---

## How this works

Run the commands, paste what comes back, do not tidy it. Fill `starter/field-notes.md`, then copy each block into `starter/submission.json`.

| Command | You get |
| --- | --- |
| `curl -v <url>` | the whole conversation: `>` sent, `<` received |
| `curl -I <url>` | status line and headers, no body |

## Your tasks

1. **TODO A.** `curl -v https://example.com`. Paste the complete output.
2. **TODO B.** `curl -I` a URL that answers with a 3xx. Paste the head and the URL you used.
3. **TODO C.** Start `python3 -m http.server 8000` in `~/projects/first-site` if it is not already running. `curl -I http://localhost:8000/index.html`. Paste the complete head.
4. **TODO D.** The first line of TODO C, on its own.
5. **TODO E.** The `Content-Type` value from TODO C. Value only.
6. **TODO F.** Annotate at least six lines from A, B, or C, in this shape:

```
- LINE: `Server: SimpleHTTP/0.6 Python/3.14.6`
  SOURCE: curl_i_local
  WHAT IT IS: a response header
  WHAT IT DOES: names the software that answered
```

7. **TODO G.** What `file://` has no room for, and what `http://localhost:8000/index.html` has instead. At least 30 words.
8. **TODO H.** Type `http://localhost:8000` on your phone. Write what happened, and what the server's terminal did. At least 20 words. Report it. Do not fix it.

## What the scaffolding is for

The local capture has to look like *your* server — `HTTP/1.0` and a `SimpleHTTP` server header, not a generic `HTTP/1.1 200 OK` from a tutorial. TODO H is the wall Unit 4 exists to climb.

## Expected output

TODO D looks like `HTTP/1.0 200 OK`. TODO E looks like `text/html`. TODO A still has its `>` and `<` markers.

## Rules

- Paste captures. Do not retype them.
- Do not delete the `>` / `<` markers.
- Do not edit `tests/`.

See `rubric.md` for how this is scored.
