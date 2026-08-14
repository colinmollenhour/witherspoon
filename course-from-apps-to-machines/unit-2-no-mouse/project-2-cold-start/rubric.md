# Rubric — Project 2: Cold Start

Four criteria. Integer weights, summing to exactly **100**.

| # | Criterion | Weight |
| --- | --- | --- |
| 1 | The rebuild really happened, in the right order | 30 |
| 2 | The evidence is genuine and self-consistent | 25 |
| 3 | The transcript is economical | 20 |
| 4 | The comparison is made, in honest numbers | 25 |
| | **Total** | **100** |

---

### 1. The rebuild really happened, in the right order (30)

The `commands` transcript reads, in this order: a `cp` that takes `index.html` out of
`~/projects/first-site` before anything is destroyed; an `rm` carrying `-r`, `-R`, or `--recursive`
whose argument is the folder `~/projects/first-site` itself rather than a file inside it; a `mkdir`
that recreates the path; and a `cp` or `touch` that puts `index.html` back. Full credit requires the
`rm` to appear **before** the `mkdir` — a transcript that creates before it destroys did not start
from nothing. Deduct if the deletion targets only `index.html`, if the backup copy is missing or
taken after the `rm`, or if the folder is rebuilt at a path other than `~/projects/first-site`.

### 2. The evidence is genuine and self-consistent (25)

`pwd_output` is a single absolute path line ending in `/projects/first-site`. `ls_la_output` is a
real long listing: one line per entry, each beginning with a ten- or eleven-character mode string,
including a `.` line and a `..` line — which only appear because `-a` was used — and a line whose
last field is `index.html`. `grep_output` is in the single-file `line:text` form with a leading line
number and no `index.html:` prefix, and the matched text contains `<title>`. Full credit requires the
three captures to describe the **same folder**: a `pwd` from one directory and an `ls -la` from
another is the exact confusion this unit exists to remove. Deduct for invented, hand-typed, or
reformatted output, and for a `grep_output` that is empty because `index.html` was recreated with
`touch` and never refilled.

### 3. The transcript is economical *(craft)* (20)

`command_count` is 8 or fewer and the path is created by a single `mkdir -p`, not by a chain of
single-level `mkdir`s. Full credit also requires the transcript to read like it was typed with the
keyboard's help rather than in full: no near-duplicate lines that differ only by a typo and its
retry, no path typed out and then corrected on the next line, no `cd` to a directory the shell was
already standing in, and no command repeated because its output was not read the first time. Tab
completion and the Up arrow leave exactly this signature — long paths spelled right the first time,
and no line typed twice. Deduct for redundant `cd`s, for `ls` runs that serve no proof, and for a
transcript so padded that it fits the budget only by leaving out work that must have happened.

### 4. The comparison is made, in honest numbers (25)

`project_1_mouse_actions` holds the count actually recorded during Project 1 — clicks, drags,
double-clicks, and menu selections across the file manager, the text editor, and the browser — not a
number invented at submission time to make the comparison look good. `command_count` equals the
number of command lines in the `commands` field, with nothing dropped to fit the budget and nothing
added that was not run. Full credit requires both fields to be positive integers measured in the
units they claim: mouse actions on one side, whole commands on the other. Deduct if `command_count`
disagrees with the transcript's own line count, if either field is left as a guess or a range, or if
`history` or `clear` lines were counted as part of the rebuild.

---

## Machine tests

The tests in `tests/` are graded separately from this rubric. Their weights also sum to 100:

| Test | Weight |
| --- | --- |
| `test_1_rebuild_commands_present.py` | 30 |
| `test_2_captured_output_shape.py` | 25 |
| `test_3_deletion_actually_happened.py` *(adversarial)* | 25 |
| `test_4_transcript_not_padded.py` *(adversarial)* | 20 |
| **Total** | **100** |
