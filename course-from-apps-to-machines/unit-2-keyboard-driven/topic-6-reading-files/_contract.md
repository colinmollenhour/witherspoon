# Reading files without opening an app

**Unit:** 2 — Driving the machine from the keyboard
**Objectives (unit-numbered):**
7. Print `index.html` with `cat`, page a long file with `less`, quit `less` with `q`, and take the first lines with `head`.   [obj 7]
8. Count the lines in a file with `wc -l` and find matching lines with `grep -n "<title>" index.html`.   [obj 8]
9. Search a whole folder with `grep -rn "http" ~/projects` and read the `path:line:text` output format.   [obj 9]

## Topic generation prompt

The learner has been opening `index.html` in a text editor to see what is in it. Show them that a
terminal reads files faster than any app can launch. Teach `cat` on the running example's
`index.html` first — it is short, so `cat` is the right tool and the output is the file they built.
Then motivate `less` by contrast: `cat` on a long file floods the screen. Teach `q` to quit
immediately and prominently — this is the same class of trap as being stuck in `vim`, which is the
most-viewed question in Stack Overflow's history [src 160], and the learner should meet the escape
hatch before the trap. Then `head`, `tail`, and `wc`, showing the real three-column output of bare
`wc` (lines, words, bytes) against `wc -l` [src 27]. Then `grep`: first on one file to find the
`<title>` line, then recursively across `~/projects`. Show the real captured `path:line:text` output
[src 25] and teach reading it as three fields. Include the genuinely surprising detail that searching
a *single* file omits the `path:` prefix while searching a directory includes it [src 26] — learners
hit this and assume the output format is inconsistent. Note for macOS learners that their `grep` is
BSD grep, and that while `-r` and `-n` behave identically, other flags differ [src 25 context].

Do NOT teach `|` — Unit 3, Topic 10 owns pipes and needs `grep` and `wc` to be already familiar so the
pipe itself is the only new idea. Do NOT teach `>` or `>>` (Topic 9).

## Grounded facts

- Real `grep -rn` output shape: `README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),` [src 25]
- Searching a single file omits the `path:` prefix; `-H` forces it [src 26]
- Real `wc` output: `wc /etc/hosts` → `  7  40 384 /etc/hosts` (lines, words, bytes); `wc -l /etc/hosts` → `7 /etc/hosts` [src 27]
- Real `head` output shape, from `head -3 /etc/hosts` [src 68]
- Being trapped in an editor/pager is the most-viewed Stack Overflow question ever: "How do I exit Vim?" — 3,316,707 views [src 160]
- macOS grep is BSD grep; `-r` "Recursively search subdirectories listed." and `-n` "Each output line is preceded by its relative line number in the file" behave as on Linux [src 25]
- Teach from: the real `grep -rn` capture [src 25]; the real `wc` capture [src 27]

## Requested activities

- READ: 900–1100 words. `cat` on `index.html` first, then `less` (with `q` taught immediately), `head`/`tail`, `wc`, then `grep` on one file and then recursively. Use the real captured outputs [src 25, 27]. Must include the single-file-vs-directory prefix surprise [src 26]. Ends with the learner able to find any line in any file under `~/projects` without opening an app.
- FLASHCARDS: 10 cards. `cat`; `less`; `q`; `head`; `tail`; `wc`; `wc -l`; `grep`; `grep -n`; `grep -r`. Include the confusable pair `cat` vs `less` (when each is right).
- QUIZ: 5 questions on choosing `cat` vs `less` for a stated file size, reading a supplied `grep -rn` output line for its three fields, predicting `wc -l` output for a described file, and explaining why one `grep` output has a `path:` prefix and another does not.

## Handoff

**Inherits:** The learner can create and navigate to files from the keyboard; `~/projects/first-site/index.html` exists.
**Leaves:** The learner can read and search any file under `~/projects` from the terminal, and can find the `<title>` line of `index.html` without opening an editor.
**Do not cover:** Pipes (Unit 3, Topic 10) or redirection (Topic 9). Editing files — Topic 8 owns that.
