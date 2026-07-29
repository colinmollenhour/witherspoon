# Pipes: connecting programs to each other

**Unit:** 3 — Text in, text out
**Objectives (unit-numbered):**
7. Chain commands with `|`, for example `ls -la ~/projects | grep site | wc -l`, and describe what each stage receives.   [obj 7]
8. Page long output with `| less` instead of scrolling the terminal.   [obj 8]
9. Build part of `index.html` from command output using `echo` with `>>`, so the file is generated rather than typed.   [obj 9]

## Topic generation prompt

The pipe is the one new idea in this topic — everything either side of it is already familiar from
Topics 6 and 9, which is deliberate. Teach `|` as "send this program's stdout into that program's
stdin", and make the first example one the learner can verify by eye:
`ls -la ~/projects | grep site | wc -l`. Walk the three stages and say what the intermediate text
looks like at each boundary. Emphasise that no file is created anywhere in that chain — the pipe is a
connection, not a container, which is the distinction from Topic 9's `>`. Make that comparison
explicit, because learners conflate them. Then `| less` as the practical everyday use, reconnecting to
Topic 6's pager. Then the payoff that advances the running example: generate content into
`index.html` with `echo ... >> index.html` rather than typing it into an editor, so the learner sees a
file being *produced* by commands. This is the state Project 3 grades. Keep the HTML trivially simple —
a title line and a heading — because HTML is not the subject; the point is that a file is just bytes a
program can write, which closes the loop with Topic 3.

Do NOT teach HTML structure, tags, or styling. Do NOT teach the web server (Unit 5).

## Grounded facts

- Real `grep` output shape at a pipe boundary: `README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),` [src 25]
- Real `wc -l` output: `7 /etc/hosts` [src 27]
- Real `ls -la` output to pipe from [src 10]
- `index.html` is why the filename matters — the server will look for exactly this name [src 112]; forward reference only, one sentence
- A file is bytes; the extension is a hint (Topic 3's idea, now demonstrated by writing HTML with `echo`) [src 166]
- Teach from: the running example; the real captures [src 10, 25, 27]

## Requested activities

- READ: 800–1000 words. `|` introduced against the three-stage example with each boundary explained. Explicit contrast with `>` from Topic 9 (connection vs container). Then `| less`. Then generating `index.html` content with `echo` and `>>`. Ends with `index.html` containing generated content, ready for Project 3.
- FLASHCARDS: 8 cards. `|`; stdin; the `|` vs `>` discriminating pair; `| less`; `echo`; `echo >> file`; what a pipe does NOT create; the three stages of a chained command.
- QUIZ: 5 questions on predicting the output of a three-stage pipeline, choosing `|` vs `>` for a stated goal, identifying what the second command in a pipeline receives, and spotting why a pipeline produced no file.

## Handoff

**Inherits:** The learner can redirect output into files and knows stdout from stderr.
**Leaves:** `~/projects/first-site/index.html` now contains content produced by commands rather than typed by hand. The learner can chain programs together.
**Do not cover:** HTML as a language. The web server, HTTP, or anything network-related (Units 4–6).
