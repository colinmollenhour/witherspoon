# Editing in place: nano, VS Code, and how to escape vim

**Unit:** 3 — Text in, text out
**Objectives (unit-numbered):**
1. Edit `index.html` with `nano`, save with `Ctrl-O`, and exit with `Ctrl-X`, after confirming nano is present with `which nano`.   [obj 1]
2. Open the whole project folder with `code .` and explain why editors open folders rather than single files.   [obj 2]
3. Exit `vim` with `Esc` then `:q!` when you land in it by accident.   [obj 3]

## Topic generation prompt

Two editors and one escape hatch. Teach `nano` as the ten-second fix — the learner is already in the
terminal at `~/projects/first-site/`, and opening a GUI app to change one line is the slow path. Show
the on-screen shortcut bar and teach `Ctrl-O` then `Ctrl-X` explicitly, since `^O` notation is not
obvious to someone who has never used it. **Have the learner run `which nano` first** [src 34]: nano
ships by default on Ubuntu and Fedora, and `ubuntu-wsl` depends on it, but its presence on current
macOS could not be confirmed — so teach the check, and give `vi` as the guaranteed fallback rather
than promising nano exists everywhere. Then `code .` for real work, and the point that matters: an
editor opens a *folder*, because a project is a directory tree and not a file — which is the same idea
the learner met in Unit 1 arriving from the other direction. Then `vim`, taught purely as an escape
hatch. Do not teach vim as an editor. Give `Esc` then `:q!` and say plainly that this is the
most-viewed question in Stack Overflow's history at over three million views [src 160] — that framing
turns an embarrassing moment into a shared one.

Do NOT teach `>` or `>>` (Topic 9) or `|` (Topic 10). Do NOT teach HTML — `index.html` is a text file
being edited, and its contents are not the subject.

## Grounded facts

- `nano` ships by default on Ubuntu (`Priority: standard`; `ubuntu-standard` and `ubuntu-wsl` depend on it) and Fedora (`nano-default-editor` in `@standard`, sets `$EDITOR`) [src 34]
- `nano` is present in the default Ubuntu WSL image: `nano 7.2-2ubuntu0.1` [src 130]
- nano's presence on current macOS is **unconfirmed** — `nano.1` returns 404 on the current Xcode man-page mirror while `pico.1` is present. Teach `which nano` as the check; `vi` is the safe fallback. [see SOURCES.md → Ungrounded]
- "How do I exit Vim?" — 3,316,707 views, the most-viewed question on Stack Overflow [src 160]
- `which` locates a program on disk [src 28 context, Topic 7]
- Teach from: the running example `~/projects/first-site/index.html`

## Requested activities

- READ: 800–1000 words. `which nano` check first, then nano with `Ctrl-O`/`Ctrl-X`, then `code .` and the folder-not-file point, then vim's escape hatch. Must not promise nano exists on macOS. Ends with the learner able to change one line of `index.html` without leaving the terminal.
- FLASHCARDS: 8 cards. `nano`; `Ctrl-O`; `Ctrl-X`; `code .`; `Esc` then `:q!`; `which nano`; why editors open folders; `vi` as the always-present fallback.
- QUIZ: 5 questions on choosing nano vs VS Code for a stated task, recovering from being stuck in vim, predicting what `code .` opens, and deciding what to do when `which nano` returns nothing.

## Handoff

**Inherits:** The learner can navigate, read, and search files from the terminal, and knows `which` and `Ctrl-C` from Topic 7.
**Leaves:** The learner can edit `~/projects/first-site/index.html` in place from the terminal and can escape any editor they land in.
**Do not cover:** Redirection (Topic 9), pipes (Topic 10), HTML as a language.
