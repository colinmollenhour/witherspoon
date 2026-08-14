# Project 3 — Generated Page · Rubric

Four criteria. Integer weights summing to **100**.

| # | Criterion | Weight |
|---|---|---:|
| 1 | The page is generated, not typed | 30 |
| 2 | The page count is computed, not asserted | 30 |
| 3 | The script declares its own interpreter | 15 |
| 4 | Craft — the script reads like a build | 25 |
| | **Total** | **100** |

---

### 1. The page is generated, not typed — 30

TODO A is resolved with a single `echo` whose output is appended to `index.html` using `>>`. The
finished `index.html` is exactly two lines: the `<title>` line written earlier with `>`, still present
and still first, followed by the `<h1>` heading. The `>` on the title line has not been changed to `>>`,
so a second run of the script produces the same two-line file rather than a four-line one. No editor is
invoked anywhere in the script, and the HTML is not created by any means other than command output.

*Full credit:* two lines, correct order, one `>` and one `>>`, and re-running the script changes nothing.
*Partial:* correct output but both lines appended with `>>`, so the file grows on every run.
*No credit:* `index.html` has one line (TODO A unresolved), or the heading was typed into the file by
hand and the script does not produce it.

### 2. The page count is computed, not asserted — 30

TODO B is resolved with a pipeline — `ls -la` into `grep` into `wc -l` — whose output is appended to
`MANIFEST.txt` with `>>`. No literal number survives anywhere in the script as a stand-in for the count.
The distinguishing evidence is behavioural: change how many `.html` files the folder holds, run the
script again without touching it, and the last line of `MANIFEST.txt` changes to match. A script that is
correct only for the folder the learner happened to have is not correct.

*Full credit:* the count tracks reality for any number of pages, including numbers the learner never saw.
*Partial:* the pipeline is present and correct but its output is not redirected, so the number prints to
the screen and `MANIFEST.txt` ends without it — the connection/container confusion, caught but understood.
*No credit:* the last line of `MANIFEST.txt` comes from an `echo` of a fixed number.

### 3. The script declares its own interpreter — 15

Line 1 is a shebang naming an absolute path to a shell, and it is intact. This is worth grading because
the two obvious answers are not the same program: the shell the learner has been typing into all unit is
bash, `echo $SHELL` → `/usr/bin/bash` [src 28], while `/bin/sh` on Ubuntu is a symlink, `/bin/sh -> dash`
[src 29]. A file that is run directly, as `./build.sh` is, has no other way to say which of those should
read it.

*Full credit:* line 1 is `#!/bin/bash` (or another explicit absolute path to a shell the script's contents
suit), unmodified or deliberately and consistently changed.
*No credit:* the shebang is deleted, indented off line 1, or reduced to a bare word such as `bash` with no
`#!` and no path.

### 4. Craft — the script reads like a build — 25

The script is something another person could pick up. Both `TODO A` and `TODO B` comment blocks are gone,
resolved rather than left sitting above the new code. The placeholder `echo "0" >> MANIFEST.txt` is
deleted, not commented out and abandoned below the real line. The three section comments still describe
what the sections now do rather than what they used to. No dead commands, no duplicated work, no second
copy of a line left behind from an experiment. The two files are each started exactly once with `>` and
extended with `>>` after that, so the intent of every arrow is legible at a glance.

*Full credit:* nothing in the file is stale, contradictory, or left over.
*Partial:* correct and readable, but TODO markers or commented-out placeholder lines survive.
*No credit:* the working lines have to be found among abandoned ones.

---

## Test cases

Machine-graded, separately from the rubric above. Four self-contained scripts in [`tests/`](./tests/),
each printing exactly `PASS` or a definite `FAIL:` line naming what it caught. Weights sum to **100**.

| Test | Weight | Catches |
|---|---:|---|
| `test-1-canonical.sh` | 40 | Correctness on a clean machine: both files exist, `index.html` is two lines with a `<title>` and an `<h1>`, and the manifest's last line is `1`. |
| `test-2-awkward-count.sh` | 30 | **Adversarial.** The learner who typed the count instead of computing it. Seeds the folder with 12 extra pages so the true answer is 13 — a number nothing in the starter hints at, and not one anybody reaches by rounding — then asserts the manifest matches. |
| `test-3-generated-not-typed.sh` | 20 | **Adversarial.** The learner who opened `index.html` in an editor, typed the two lines, and left `build.sh` a stub. Reads the script source with comments stripped and asserts a shebang on line 1, a `>` into `index.html`, a `>>` into `index.html`, a `>>` into `MANIFEST.txt`, a pipe, a call to `wc`, and no editor invocation. |
| `test-4-rerun.sh` | 10 | The learner who concluded that `>>` is simply the safe arrow and used it everywhere. Runs the script twice and asserts `index.html` is still two lines and `MANIFEST.txt` has not grown. |

Run them all:

```
BUILD_SH=/path/to/build.sh tests/run-all.sh
```
