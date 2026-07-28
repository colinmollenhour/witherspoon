# Site spec

Read at Stage 4.

## Layout

```
dist/
  index.html                     home — hero, progress ring, syllabus, resume
  certificate.html               completion record, printable
  404.html                       relative-link-safe not-found
  unit-<n>/
    index.html                   unit overview + hero infographic + topic list
    topic-<m>.html               reading + flashcards + quiz, one page
    test.html                    unit test
    project-<p>.html             brief, steps checklist, rubric
  assets/
    site.css  site.js            copied from this skill, customized via variables only
    course.json                  the graph, for search and labels
    search.json                  prebuilt index
    img/                         svg + png
    diagrams/                    .tldr sources
    prompts/                     infographic prompt files, kept
```

One page per topic. Reading, flashcards, and quiz are sections on it, reachable from a sticky in-page
nav. Three thin pages and three clicks is worse.

## Every page

- Skip link → `<main>`.
- Header: course title (links home), unit/topic breadcrumb, search, theme toggle.
- Footer: prev/next within the course sequence, and a link to the syllabus.
- `<title>`: `<page> — <course title>`.
- Meta description from the topic description.
- No external anything. System font stack only.

## Home (`index.html`)

1. **Hero** — title, subtitle (the before→after), `about` paragraphs, and the estimated size
   (units · topics · quizzes).
2. **Resume** — a prominent link to `lastVisited`, shown only when progress exists. This is the most
   valuable element on the page for a returning learner.
3. **Progress ring** — overall completion, plus counts (topics read, quizzes taken, average score).
   Rendered as inline SVG with `stroke-dasharray`; no JS needed for the empty state.
4. **What you'll be able to do** — `skills[]` as cards.
5. **Syllabus** — units as cards, each listing topics with a per-item state dot (unread / read /
   quizzed) and a unit progress bar.
6. **FAQ** — `faqs[]` as `<details>` elements. Native, accessible, no JS.
7. **Footer strip** — certificate link, reset progress, storage status.

## Topic page

- Breadcrumb, title, and the topic's three objectives in a bordered callout at the top. Learners
  should see what they are about to be able to do.
- Sticky section nav: Reading · Flashcards · Quiz.
- **Reading** — the markdown rendered to HTML at build time. Max width 72ch. Code blocks get a copy
  button (JS enhancement; the code is selectable without it). Figures per `visuals.md`.
- **Mark as read** button at the end of the reading section, which also advances progress.
- **Flashcards** — a deck with flip animation, prev/next, keyboard support (`←` `→` `space`), a
  shuffle, and a counter. Cards are in the HTML; JS only handles flipping and ordering.
- **Quiz** — see below.
- Prev/next topic footer.

## Quiz and unit test

Same component, same behavior; the unit test is longer and uses `passingScore`.

- Questions render as `<fieldset>` + `<legend>` + radio inputs. Native semantics, keyboard-navigable
  by default.
- **Check** per question → locks that question, marks correct/incorrect, reveals the explanation.
  Immediate feedback is the pedagogy; do not batch it to the end.
- **Score counts first attempts only.** Changing an answer after checking does not change the score.
- `SHORT_ANSWER` cannot be auto-graded without a backend. Show a textarea, then on Check reveal the
  sample answer and ask the learner to self-mark **Got it / Missed it**. Label it plainly as
  self-graded — do not fake automated grading.
- Progress bar across the quiz; `aria-live="polite"` announces each result and the final score.
- On the last question: compute the score, persist it, and celebrate (see below).
- **Retake** clears that quiz's stored result and resets the UI.
- Below the score: a per-objective breakdown, parsed from the `(objective N)` citations in the
  explanations. This is the payoff of the citation contract — the learner sees *which objective* they
  missed, not just a number.

## Celebration

Fires once, on quiz completion, at the moment the score is computed.

- Canvas confetti, hand-rolled in `site.js` — no library, ~50 lines, 1.2s, then the canvas is removed.
- Two tiers: **passed** (score ≥ `passingScore`, default 70%) gets confetti and a congratulation;
  **completed below threshold** gets a calm "Nice work — here's what to review" with the missed
  objectives listed and no confetti. Do not celebrate a fail; it reads as mockery.
- `prefers-reduced-motion: reduce` → no canvas at all. A badge scales in over 150ms instead.
- Never fires on revisiting a completed quiz.

## Project page

- Goal, then the instructions rendered from the brief.
- Steps as a **checklist** persisted to localStorage — the one genuinely stateful part of a project
  page.
- Rubric as a table with weights, and a total row that must read 100.
- Starter files in a `<details>` block with copy buttons.
- A note that projects are not auto-graded here; the rubric and test cases are the grading contract,
  and a `code-notebook` project needs a real sandbox to run in.

## Certificate (`certificate.html`)

- Name input, persisted. Empty name → the certificate shows a prompt instead of a blank.
- **Issued** when every unit test has been attempted. Otherwise show progress toward it: which units
  remain, as links.
- Shows: course title, learner name, per-unit scores, overall average, topics completed, and the date
  the last test was taken (not today's date — the record should not change on reload).
- **"Self-reported completion record"** printed on its face, plus a line noting progress is stored
  only in this browser. The architecture cannot verify anything and the page must not imply it does.
- **Print / Save as PDF** button → `window.print()`. The print stylesheet drops all site chrome,
  forces light colors, fits one landscape page, and hides the buttons.
- Reset progress button, with the same confirm dialog as elsewhere.

## Search

Build-time index of unit/topic titles, headings, and the first ~200 characters of each reading.

- Inline into `site.js` when under 100 KB; otherwise `assets/search.json`, loaded on first use.
- `/` focuses the field; `Esc` clears; `↑`/`↓` move through results; `Enter` opens.
- Substring and token match is plenty. No fuzzy-matching library.
- No results → say so, and offer the syllabus link.

## Design

Fun, not distracting. The reading is the product.

- **One accent color.** From `brandColors.primary` when present, else pick and state it. Used for
  progress, focus rings, active states, and the celebration. Nothing else.
- **Surfaces:** page background, raised card, and a light figure card that stays light in both themes.
- **Type:** system font stack. `clamp()` for headings. Body 1.05rem/1.65. Reading column 72ch.
- **Motion:** 150–200ms on hover, focus, and card entry. No parallax, no scroll-jacking, no autoplay,
  nothing that moves while text is being read.
- **Dark and light**, `prefers-color-scheme` by default, toggle persisted, and the toggle must win
  over the system setting in both directions.
- **Density:** generous line height, real whitespace, cards not boxes-in-boxes.

## Accessibility

Non-optional, and checked in `build-gates.md`.

- Landmarks: `header`, `nav`, `main`, `footer`. One `<h1>` per page, no skipped levels.
- Contrast ≥ 4.5:1 for body text and ≥ 3:1 for UI edges, in **both** themes.
- Visible `:focus-visible` ring everywhere, never `outline: none` without a replacement.
- Quiz state changes announced via `aria-live`; the celebration is `aria-hidden` with a text
  equivalent alongside.
- Every control reachable and operable by keyboard. `<dialog>` for confirms — native focus trapping.
- Icons that convey meaning get accessible names; decorative ones get `aria-hidden="true"`.

## No-JS baseline

With JavaScript off: all readings, flashcard fronts and backs, quiz questions **with their answers
and explanations in a `<details>`**, projects, rubrics, and the syllabus are readable. Progress,
grading, search, and celebration are absent — and a `<noscript>` note says so once, on the home page,
without nagging.
