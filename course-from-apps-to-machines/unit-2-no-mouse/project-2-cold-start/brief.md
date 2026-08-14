# Project 2 — Cold Start

**Type:** `interactive-form`
**Unit:** 2 — No mouse

## Goal

Delete `~/projects/first-site/` and rebuild it from the keyboard in eight commands or fewer. Prove the rebuild with four pieces of real terminal output.

---

## How this works

You really delete the folder from Project 1, and you really put it back. Fill the six fenced blocks in `starter/submission.md`. The tests find fields by those `##` headings — do not rename them.

Linux and WSL prompts end `$`. A Mac prompt ends `%`. Neither character is part of the command. Strip it if you paste from the screen.

`touch` makes an empty file. If you delete `index.html` without a copy, the `<title>` line from Project 1 is gone for good. **Copy the file out first.**

## Your tasks

1. **Copy `index.html`** somewhere outside `~/projects/first-site/`. This is the first line of your transcript.
2. **Delete the folder** — `~/projects/first-site` itself, not just the file. `rm` needs `-r` for a directory. Read the path twice.
3. **Rebuild the path** with one `mkdir -p ~/projects/first-site`.
4. **Put `index.html` back** from the copy. An empty `touch`ed file has no `<title>`.
5. **Stay inside eight commands.**
6. **Capture `pwd`** from inside the rebuilt folder.
7. **Capture `ls -la`** of that folder — the whole listing.
8. **Capture `grep -n "<title>" index.html`.** Quote the search text.
9. **Write `project_1_mouse_actions`** from Project 1, and look at it next to `command_count`.

## What the scaffolding is for

`starter/reference-project-1.md` is read-only: it is what you are rebuilding. The six fields have to agree with each other — a `pwd` in the wrong folder will not match an `ls` of the right one.

## Expected output

`commands` is eight lines or fewer. `pwd_output` ends with `/projects/first-site`. `ls_la_output` includes a row for `index.html`. `grep_output` looks like `1:<title>…`.

## Rules

- Keyboard only. No file manager after you open the terminal.
- Do not run `history` or `clear` as part of the rebuild.
- Do not edit `tests/`.

See `rubric.md` for how this is scored.
