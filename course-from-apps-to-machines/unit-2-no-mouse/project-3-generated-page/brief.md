# Project 3 — Generated Page

**Type:** `code-notebook`
**Unit:** 2 — No mouse

## Goal

Write a shell script that builds `~/projects/first-site/index.html` and `MANIFEST.txt` entirely from command output using `>`, `>>`, and `|`. Neither file gets typed by hand.

---

## How this works

Two code cells, run differently.

**Cell 2 is read-only.** It rebuilds `~/projects/first-site/` so your script has somewhere to stand. Do not edit it.

**Cell 4 is yours.** It is saved as `~/build.sh` and run as `./build.sh`. Leave the first line `#!/bin/bash` alone.

## Your tasks

Open `starter/cell-4-build.sh`.

1. **Run it once as given.** You will see a title-only page and a manifest that claims `0` pages.
2. **TODO A.** Append `<h1>Hello from the terminal</h1>` to `index.html` with `echo` and `>>`. The wrong arrow wipes the title.
3. **TODO B.** Delete `echo "0" >> MANIFEST.txt`. Replace it with a real count: `ls -la | grep html | wc -l`, appended to the manifest.
4. **Run it again.** `cat` at the bottom should show both lines of the page and a count that is not the character `0`.

## What the scaffolding is for

The title line is already written with `>`. That is the only wipe. Everything you add must use `>>` or a pipe, or you throw the title away. The fake `0` is there so a script that "runs" is not the same as a script that counted.

## Expected output

```
--- index.html ---
<title>First Site</title>
<h1>Hello from the terminal</h1>
--- MANIFEST.txt ---
MANIFEST for first-site
-rw-r--r-- … index.html
pages:
2
```

Your `ls` line will not match that one. The count will match how many `html` lines `grep` kept.

## Rules

- Do not type the heading into an editor. The script has to print it.
- Do not edit cell 2 or `tests/`.
- Do not change the shebang unless you mean to change interpreters.

See `rubric.md` for how this is scored.
