# Activity specs

Given to each topic subagent in Stage 5. Write only the activities the contract requests.

Universal rules:

- Use the running example. A topic that introduces a fresh toy example has failed.
- **Use only the figures, API signatures, and claims in your contract's Grounded facts block.**
  Introducing a number of your own is fabrication, and it fails gate G11. If you need a fact you do
  not have, say so in your status line rather than inventing it — arithmetic derived from grounded
  figures is fine if you show the derivation.
- **Do not paste the ledger.** Teach the claim in your own voice. Allowed quotes: an error message,
  a command's own output, or a single sentence that *is* the object of study. Banned: `[src N]`,
  view-count rhetoric, researcher / librarian / RFC-preamble blockquotes, journal volume and page,
  and literature combat ("the canonical textbook has a hole", a vendor course-catalogue count).
  Year-of-origin and the name of a theorem may stay. The verbatim quotes live in `SOURCES.md`.
- Second person, present tense, no throat-clearing. Never open with "In this lesson, we will…".
- **Voice, sentence craft, define-on-first-use, first-hour glossary, trainer-not-seminar:** see
  `outline-contract.md` → Learner-facing voice. Do not restate those rules here.
- Write the **default dialect** the spine named. Variants are an "On a Mac / On Windows" box of a
  few lines, not a restated platform table.
- Respect the contract's **Do not cover** list. Overlap is a defect, not thoroughness.

---

## READ

600–1200 words. The load-bearing activity.

**Structure**

1. **The concrete situation** — where the running example stands, and the problem now visible. Two to
   four sentences. No preamble. No sentence over ~25 words. **A typed, clicked, or opened action in
   the first ~150 words of every reading**, not only topic 1. "The file does not exist yet — the
   project creates it" is a defect: they do it here, and the project is where they *prove* it.
2. **The idea** — the smallest correct explanation. Define terms at first use, inline. One idea per
   sentence.
3. **The artifact** — the code listing, script, transcript, or worked example, with the change from
   the previous topic marked.
4. **The measurement** — what it produces now, with real numbers, compared to the previous state.
5. **The handoff** — one short paragraph landing exactly where the contract's `Leaves` says, and
   opening the question the next topic answers.

**Rules**

- Show the diff, not just the destination. "You only need two changes: add `__global__`, and rename
  to `.cu`" teaches more than the finished file.
- Explain *why it is slow / wrong / hard* before showing the fix.
- Tables for comparisons of three or more things.
- A code listing longer than ~30 lines must be excerpted with the unchanged parts elided.

**Interactive visual aids.** The site builder renders ```` ```widget ```` fences in a reading into
interactive figures. Write them here, inline, at the paragraph each one illustrates — placement is
the reason they live in the markdown and not in `course.json`.

````markdown
```widget
{ "type": "anatomy", "title": "…", "parts": [ { "text": "/", "label": "root", "note": "…" } ] }
```
````

**Budget: at most two per topic**, and only where one of these shapes is actually present. Pick by
what the learner must *do*, not by variety.

| The reading contains | Use |
| --- | --- |
| A literal string with named parts — a path, a URL, a command, a log line, an `ls` row | `anatomy` |
| Stages handing off to each other | `flow` |
| Two or three things with the same questions asked of each | `compare` — **two or three columns, never four or five** |
| Commands whose output is worth predicting before revealing | `terminal` |
| A taxonomy of four or more shapes, or vocabulary worth pairing | `match` |
| An order that is itself the lesson | `order` |
| Messages between two or more parties | `sequence` |
| A nested structure | `tree` |
| A spatial layout a widget cannot carry — topology, a cut link, a state machine with cycles, two timelines on one axis | a `figure` (hand SVG), not a five-column `compare` |

`anatomy` is the highest-value widget **for a string that is a grammar**. It is the wrong widget for
a system, a topology, or a decision table. A `compare` with five fat cells is still a wall of text;
use `match` or a figure. If none of the shapes fit, write none; a widget that is merely *about* the
topic is decoration, and the site's gates warn on inflation.

**Figures.** When the idea is spatial, author a ```` ```figure ```` fence pointing at
`assets/img/…`, with `alt`, `caption`, and explicit `width` / `height`. Prefer a hand SVG with
selectable labels over a generated raster — image models garble text. Do not spend both widget
slots on string dissection and then skip the picture the topic actually needed.

**Everything inside a widget obeys the Grounded facts block**, exactly like prose. An invented `ls`
output or a plausible-looking IP inside a `terminal` widget is the same fabrication as inventing it
in a paragraph, and it is harder to catch in review. A malformed widget fails the site build with
your file named, so get the shape right — the full catalogue and every field is in the `course-site`
skill's `references/widgets.md`.

**The failure-moment callout** (only in the topic the spine designates) — a blockquote that names the
surprise before the learner blames themselves:

> **Wait — why is the GPU SLOWER than the CPU?**
> […] That feels backwards. […] **It is — but only when you actually use it.** […] So this result
> isn't a bug. That's the whole point: **a GPU is a bus, not a Ferrari.**

Name the surprise → validate the confusion → give the one-line mental model → point at the unit that
fixes it. Do not fix it here.

---

## QUIZ

Default 5 questions. Mix of `MULTIPLE_CHOICE`, `TRUE_FALSE`, `SHORT_ANSWER`.

**Emit these as structured data into the topic's `quiz.questions[]` in `course.json`** — the same
shape `units[].test.questions[]` uses. Do not hand-write `quiz.md`; it is rendered from the JSON by
the template's `render-views` command, and anything you write there is overwritten. The answer key
is a field, not something a later tool infers from prose.

**Every question**

- Tests a **decision or discrimination**, not recall of a sentence from the reading.
- Is grounded in concrete specifics — real numbers, a real snippet, a real situation.
- Carries an `explanation` that says why the right answer is right, why the tempting wrong one is
  wrong, and **ends with `(objective N)` or `(objectives N, M)`**.

**Multiple choice** — 4 options. Distractors are plausible failure modes a real learner holds, not
filler. Every distractor should be traceable to a specific misconception.

> **Q:** Which of the following problems is the best candidate for GPU acceleration?
> - Running the main game loop of a single-player video game
> - Sorting a list of 200 employee names alphabetically
> - **Applying a brightness filter to every pixel across a batch of 10,000 images**
> - Parsing a configuration file line by line to extract settings
>
> **Explanation:** Applying a brightness filter to every pixel is a data-parallel workload: the same
> operation runs independently on millions of data points. […] Parsing a configuration file, sorting
> a 200-item list, and running a single-threaded game loop all involve sequential or branching logic
> where parallelism offers little benefit (objective 2).

Note the explanation walks *each* distractor. Do that.

**True/false** — state the *misconception* and mark it false, more often than stating a fact and
marking it true. Explanation opens by naming the reversal: *"The opposite is true."*

**Short answer** — supply a `sampleAnswer` that would earn full credit, and put the two or three
elements a full-credit answer must cover in `graderNotes`. Phrase those notes for the learner
("A strong answer covers…"), not for a proctor ("A grader must see…") — the site shows them when
the learner self-marks. Short answers cannot be auto-graded without a backend; `graderNotes` is
what makes self-marking honest rather than a guess.

**Explanations** use the same learner-facing voice. Prefer *"A strong answer covers…"* over
*"A grader must see…"* when listing required elements.

Ban: "all of the above", "none of the above", negated stems ("which is NOT…") unless the negation is
the actual skill, and any question answerable by pattern-matching the longest option.

---

## FLASHCARDS

8–12 cards unless the contract says otherwise.

**Emit these into the topic's `flashcards[]` in `course.json`**, same as QUIZ. `flashcards.md` is a
rendered view, not the source.

- Front: a term, a cue, or a situation. Back: one definition or one action. Never both directions of
  the same pair as two cards.
- No two cards may be answerable by the same sentence.
- Include the discriminating pairs the reading drew — *direct dial vs. main line*, *host code vs.
  device code*, `threadIdx` *vs.* `blockIdx`. Confusable pairs are the highest-value cards.
- Never card something the quiz already tests verbatim.

---

## LECTURE

8–14 slides. The default second activity for `academic` courses.

Per slide: a title, 3–5 bullets (≤12 words each), and **speaker notes** of 2–4 sentences that say
what the bullets do not.

- At least two **fully worked examples**, one step per slide, with the step under discussion
  highlighted.
- Where learners reliably go wrong, give the mistake its own slide — e.g. `-3^2` vs `(-3)^2`.
- No slide restates a slide. No slide is a wall of prose.

Format as markdown: `## Slide N — Title`, bullets, then `**Notes:**`.

---

## PODCAST

Two voices, ~10 minutes (~1400–1600 words), for commute listening.

- Host asks the question a learner would actually ask; expert answers with the concrete example.
- Audio-first: no "as you can see", no diagrams, every number spoken in context.
- Covers the same objectives as the READ, at lower resolution and higher intuition.
- Opens mid-thought, ends with a single takeaway sentence.

---

## GAME

A recall mechanic with a win condition, playable in under three minutes.

Specify: the mechanic, the item pool (with answers), the scoring, and the failure feedback. Sorting,
matching, sequencing, and spot-the-error all work. If the "game" is a quiz with points, cut it and
write a quiz.

---

## COMIC

Exactly 3 panels. Per panel: a scene description for the illustrator, and the dialogue or caption.

Panel 1 sets up the naive belief. Panel 2 is the consequence. Panel 3 is the correction, stated as a
line worth remembering. Use it for the failure moment or for a sticky mental model — never for
procedure.

---

## JAM (music)

A short mnemonic lyric over a stated groove, for an ordered list or a fixed sequence that must be
recalled verbatim. Give the sequence, the lyric, and the beat. Two verses maximum. If the content is
not an ordered list, do not write one.

---

## CHAT

6–10 Socratic prompts for the tutor, escalating in difficulty.

Each prompt: the question to ask, the misconception it is hunting, and the follow-up if the learner
is wrong. The tutor asks — it does not answer. Never let a prompt be answerable "yes".

---

## Unit test (`unit-test.md`)

Written by the unit's own agent, not per topic. The markdown view is **rendered** from
`units[].test` in `course.json` (labels: **What's covered** / **Pass at**).

- 6–10 questions spanning **every objective in the unit**. Coverage is checked in Stage 6.
- Mix of types, weighted toward `MULTIPLE_CHOICE`.
- At least two questions must be **synthesis** — requiring two topics at once.
- `title` names the area in plain language.
- `description` is a second-person quick check of what they will face — **never** open with
  *Assesses*, *Evaluates*, or *This test covers*. Example: *"Quick check: can you …?"*
- Same explanation rules as QUIZ, including the `(objective N)` citation.
