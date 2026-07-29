# Project 3 — Generated Page

**Unit:** 3 — Text in, text out
**Type:** `code-notebook` (`"language": null` — this project is shell, not a programming language)

## Goal

Write a shell script that builds `~/projects/first-site/index.html` and `~/projects/first-site/MANIFEST.txt`
entirely out of command output, using `>`, `>>` and `|`, so that neither file is ever typed by hand.

## Learning goals

- Write command output to a new file with `>` and append with `>>`, and state which of the two destroys
  the file's existing contents. (objective 4)
- Chain commands with `|` and describe what each stage receives. (objective 7)
- Build `index.html` from command output using `echo` with `>>`, so the file is generated rather than
  typed. (objective 9)

---

## Instructions

### How this runs

There are two code cells and they are **not** run the same way.

**Cell 2 is READ ONLY.** It is the Unit 2 rebuild, carried forward from Project 2, and it runs first, in
the container's own shell. It is the reason `~/projects/first-site/` exists by the time your script
arrives. Do not edit it. Do not delete it — your script starts with `cd ~/projects/first-site` and has
nowhere to go without it.

**Cell 4 is yours.** It is saved verbatim to `~/build.sh`, made executable, and then run as a program:

```
./build.sh
```

Nothing on the outside tells the machine which shell should read that file, so the file says so itself,
on its first line: `#!/bin/bash`. On Ubuntu the two obvious spellings name two different programs —
`echo $SHELL` gives `/usr/bin/bash` [src 28], while `/bin/sh` is a symlink, `/bin/sh -> dash` [src 29].
Leave the first line alone unless you mean to change interpreters, and never delete it.

Everything runs in a fresh `ubuntu:24.04` container. Nothing is installed: `ls`, `grep`, `wc`, `cat`,
`echo` and `mkdir` are already there, and they are all you need. Your home directory starts empty apart
from what cell 2 rebuilds, and it is thrown away when the run ends — so the script has to build the
whole site from nothing, every time.

### Your tasks

1. **Run cell 4 exactly as it is given, before changing anything.** It works. It just tells a lie at the
   end. Read the two blocks it prints and find the lie.
2. **TODO A — finish `index.html`.** The title line is already written for you with `>`. Add the heading
   line `<h1>Hello from the terminal</h1>` with `echo` and the arrow that *adds* to a file instead of
   replacing it. Choose wrong and the title line vanishes, silently, with no warning.
3. **TODO B — make the page count real.** Delete the line that appends a hard-coded `0` and replace it
   with a pipeline that counts: `ls -la` into `grep html` into `wc -l`, with the last stage's output
   appended to `MANIFEST.txt`. A pipe is a connection, not a container — on its own it leaves nothing on
   disk, so the redirect at the end is not optional.
4. **Prove it generalises.** Add four more `.html` files to the folder, run the script again, and watch
   the last line of `MANIFEST.txt` become `5` without you touching the script. If it still says `1`, the
   count is not being computed.

### What the scaffolding is for

The script prints both finished files at the end. That is not decoration — it is the `cat` check from
Topic 9, wired in, so you never have to guess whether a redirect landed.

Watch what the last line of `MANIFEST.txt` looks like once TODO B is done. It is a bare number, sitting
alone. Run `wc -l /etc/hosts` by hand and you get `7 /etc/hosts` [src 27] — the count *and* the name.
The pipeline prints only the number, because `wc` was never given a filename. It was handed text by the
program upstream of it, and text arriving on a pipe came from no file at all. That difference is the
whole shape of a pipeline in one line of output.

Notice, too, that `MANIFEST.txt` already exists when the counting pipeline runs — the header line created
it — and it is still not counted. `grep html` keeps only the lines that mention `html`, and `MANIFEST.txt`
does not. Nothing checked what was *inside* any of those files. The manifest counts names.

### Expected output

After both TODOs are resolved, running the script prints:

```
--- index.html ---
<title>First Site</title>
<h1>Hello from the terminal</h1>
--- MANIFEST.txt ---
MANIFEST for first-site
-rw-r--r-- 1 root root 59 Jul 29 05:01 index.html
pages:
1
```

Three columns of that `ls -la` line depend on the machine and the moment: owner, group, and timestamp.
The rest does not. `-rw-r--r--` is what the default `umask 0022` gives a new file [src 12], and `59` is
the size of the two lines you generated. What is graded is everything else — both HTML lines present, in
that order, and a last line that is a number matching reality.

Run the script as given and you get this instead, which is the incomplete result you start from:

```
--- index.html ---
<title>First Site</title>
--- MANIFEST.txt ---
MANIFEST for first-site
-rw-r--r-- 1 root root 26 Jul 29 05:01 index.html
pages:
0
```

One page in the folder, and the manifest says zero. That is the lie.

### Rules

- Do not edit cell 2. It is marked READ ONLY and the grader runs it verbatim.
- Do not delete the shebang on line 1 of cell 4.
- Do not open `nano`, `vim`, `vi` or `code` from the script, and do not create either file by hand. Both
  files must be produced by commands. The tests read your script, not just your output.
- Do not `apt install` anything. If you reach for a program that is not in the base image, the answer is
  a program you already know.
- A finished script uses the single-arrow redirect exactly twice — once to start `index.html` and once to
  start `MANIFEST.txt`. Every other redirect in the file is `>>`.

---

## Steps

- [ ] **1. Run it before you change it** — Execute cell 2, then cell 4, untouched. Read both printed
      blocks and find the claim that does not match the folder.
      *Criteria:* `build.sh exits with status 0; ~/projects/first-site/index.html has exactly 1 line;
      the last line of ~/projects/first-site/MANIFEST.txt is 0`
- [ ] **2. Resolve TODO A** — Append the heading to `index.html` with `echo` and `>>`.
      *Criteria:* `~/projects/first-site/index.html is non-empty, has exactly 2 lines, contains the
      substring "<title>" and contains the substring "<h1>"`
- [ ] **3. Resolve TODO B** — Replace the hard-coded `0` with a counting pipeline.
      *Criteria:* `build.sh contains at least one non-comment line in which "ls", "|", "wc" and ">>" all
      appear; the last line of MANIFEST.txt equals the output of "ls -la | grep html | wc -l" run in
      ~/projects/first-site`
- [ ] **4. Prove the count generalises** — Create four extra `.html` files in
      `~/projects/first-site/`, re-run the script, and check the manifest.
      *Criteria:* `after 4 additional .html files exist, the last line of MANIFEST.txt is 5`
- [ ] **5. Prove nothing was typed** — Confirm the script itself carries the operators, not just the
      output.
      *Criteria:* `build.sh line 1 begins with "#!" followed by an absolute path; build.sh contains ">>"
      at least once and "|" at least once outside of comments; build.sh does not invoke nano, vim, vi or
      code`
- [ ] **6. Notice what `wc` printed** *(noticing step)* — Compare the last line of `MANIFEST.txt` with
      what `wc -l /etc/hosts` prints by hand [src 27]. One has a filename beside the number and one does
      not. That is the pipe.
      *Criteria:* `the last line of MANIFEST.txt consists only of digits and whitespace — no filename
      appears on it`

---

## Environment

Pinned. Never `latest`.

```json
{
  "image": "ubuntu:24.04",
  "packages": [],
  "compileFlags": [],
  "timeoutMs": 30000
}
```

`ls`, `grep`, `wc`, `cat`, `echo` and `mkdir` are in the base image; `packages` is deliberately empty.
The interpreter is chosen by the script's own shebang, which is the point — `/bin/sh` on this image is a
symlink to dash [src 29], not to the bash you have been typing into [src 28].

---

## Grading

- **Rubric:** see [`rubric.md`](./rubric.md) — 4 criteria, weights summing to 100.
- **Tests:** see [`tests/`](./tests/) — 4 self-contained scripts, weights summing to 100, two of them
  adversarial. Run them all with `BUILD_SH=/path/to/build.sh tests/run-all.sh`.
