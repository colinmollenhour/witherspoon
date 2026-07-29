# Redirection: making files out of command output

**Unit:** 3 — Text in, text out
**Objectives (unit-numbered):**
4. Write command output to a new file with `>` and append with `>>`, and state which of the two destroys the file's existing contents.   [obj 4]
5. Distinguish stdout from stderr by running a failing command with `>` and observing that the error still appears on screen.   [obj 5]
6. Discard unwanted output with `> /dev/null` and explain a situation where that is the right thing to do.   [obj 6]

## Topic generation prompt

Until now every command has printed to the screen and the output has been thrown away. Redirection is
the moment the learner realises a command's output is *material* — something that can become a file.
Teach `>` first, on the running example: `ls -la ~/projects/first-site > listing.txt`, then `cat
listing.txt` to prove the output landed. Then `>>` and the difference that matters — `>` truncates,
`>>` appends — and be blunt that `>` on an existing file destroys it with no warning, the same class
of hazard as `rm` from Unit 2. Then the genuinely non-obvious idea: there are **two** output streams.
Run a command that fails while redirecting stdout, and show that the error still appears on screen
because it went to stderr, not stdout. This is not trivia — it is exactly why the web server's access
log in Unit 5 behaves the way it does, since that log goes to stderr while the startup banner goes to
stdout [src 116]. Name that forward reference in one sentence. Then `/dev/null` as the deliberate
discard, and `2>` as the way to redirect the error stream.

Do NOT teach `|` — Topic 10 owns pipes and must be able to introduce them as the one new idea. Do NOT
generate `index.html` from command output; Topic 10's handoff owns that.

## Grounded facts

- The web server's access log goes to **stderr** while its startup banner goes to **stdout** — the concrete payoff for learning the distinction [src 116]
- Real access-log line, for the forward reference only: `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -` [src 115]
- Real `ls -la` output that redirection will capture [src 10]
- Real `wc` output for verifying a redirected file: `wc /etc/hosts` → `  7  40 384 /etc/hosts` [src 27]
- Teach from: the running example `~/projects/first-site/`; the real `ls -la` capture [src 10]

## Requested activities

- READ: 800–1000 words. `>` on the running example, verified with `cat`. Then `>>`. Then the truncation hazard. Then stdout vs stderr, demonstrated with a failing command. Then `/dev/null` and `2>`. One sentence of forward reference to the Unit 5 access log [src 116]. Ends with the learner able to turn any command's output into a file.
- FLASHCARDS: 9 cards. `>`; `>>`; the truncation difference as a discriminating pair; stdout; stderr; `2>`; `/dev/null`; how to check a redirect worked; which stream an error uses.
- QUIZ: 5 questions on predicting a file's contents after a `>` then `>>` sequence, explaining why an error still printed despite a redirect, choosing `>` vs `>>` for a stated goal, and identifying what `> /dev/null` accomplishes.

## Handoff

**Inherits:** The learner can edit files in place and read them back from the terminal.
**Leaves:** The learner can capture any command's output into a file under `~/projects/first-site/` and knows errors travel on a separate stream.
**Do not cover:** Pipes (Topic 10). The web server itself (Unit 5) — only the one-sentence stderr forward reference.
