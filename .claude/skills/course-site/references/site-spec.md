# Site spec

**This is the design contract the shared Astro template at `course-template/` is held to.** Read it
when changing the template, not when building a course — building a course is one command, and the
template already implements everything below.

## Layout

```
dist/
  index.html                     home — hero, progress ring, syllabus, resume
  certificate.html               completion record, printable
  sources.html                   the grounding ledger
  404.html                       relative-link-safe not-found
  unit-<n>/
    index.html                   unit overview + hero infographic + topic list
    topic-<m>.html               reading + flashcards + quiz, one page
    test.html                    unit test
    project-<p>.html             brief, steps checklist, rubric, starter files
  assets/
    site.css  site.js            the design system and runtime, bundled by the template
    search-index.js              prebuilt index, one global, loaded once and cached
    img/  diagrams/  prompts/    copied from <course-dir>/assets/
```

Topics are numbered **per unit** in the URL (`unit-5/topic-1.html`) even though the source tree
numbers them globally across the course (`topic-15-url-anatomy`). That mapping, and the positional
`u<N>t<M>` ids, are what localStorage progress is keyed on — changing either orphans every learner's
saved progress.

`course.json` is deliberately **not** copied into `dist/`. Everything a page needs is baked into it
at build time; shipping a 700 KB graph that nothing loads was pure payload.

One page per topic. Reading, flashcards, and quiz are sections on it, reachable from a sticky in-page
nav. Three thin pages and three clicks is worse.

## Every page

- Skip link → `<main>`.
- Header: course title (links home), unit/topic breadcrumb, search, theme toggle.
- Footer: prev/next within the course sequence, syllabus/certificate/sources links, reset progress,
  and the course's copyright/license notice on every page. Creative Commons notices link to the
  canonical terms with `rel="license"`; the same relation appears in `<head>`.
- `<title>`: `<page> — <course title>`.
- Meta description from the topic description.
- No external anything. System font stack only.

## Home (`index.html`)

1. **Hero** — title, subtitle (the before→after), `about` paragraphs, and the estimated size
   (units · topics · quizzes). When `course.json` declares a `hero`, the artwork fills the block and
   the copy sits over its left third behind a scrim; the block holds the image's 16:9 ratio so
   `cover` has nothing to crop, and keeps a light surface in **both** themes, as `.figure` does, since
   the artwork's colours are baked. Without a `hero` the block falls back to a painted gradient. See
   `visuals.md` for how to brief and encode one.
2. **Resume** — a prominent link to `lastVisited`, shown only when progress exists. This is the most
   valuable element on the page for a returning learner.
3. **Progress ring** — overall completion, plus counts (topics read, quizzes taken, average score).
   Rendered as inline SVG with `stroke-dasharray`; no JS needed for the empty state.
4. **What you'll be able to do** — `skills[]` as cards.
5. **Syllabus** — units as cards, each listing topics with a per-item state dot (unread / read /
   quizzed) and a unit progress bar.
6. **FAQ** — `faqs[]` as `<details>` elements. Native, accessible, no JS.
7. **Footer strip** — certificate link, reset progress, storage status, copyright holder, and
   selected license.

## Topic page

- Breadcrumb, title, and the topic's three objectives in a bordered callout at the top. Learners
  should see what they are about to be able to do.
- Sticky section nav: Reading · Flashcards · Quiz, plus a scroll-depth strip along the bottom edge of
  the header, measured against the **reading** rather than the document — a bar that only fills once
  the learner has also scrolled past the quiz and the footer reads as permanently incomplete.
- **Reading** — the markdown rendered to HTML at build time. It fills the content column rather than
  setting its own width; see **Design** below. Headings carry an accent tick so a long page can be
  scanned by colour. Code blocks get a copy button and a language chip (both JS enhancements; the
  code is selectable without them). Figures per `visuals.md`, widgets per `widgets.md`.
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

- Emitted as `assets/search-index.js`, a plain script setting one global, loaded with a relative
  `src` alongside `site.js`. Downloaded and cached once for the whole site.
- **Not** fetched, and **not** inlined per page. Fetching it resolved page-relative, so it 404'd on
  every page below the root and silently hid the search box there — and it was the site's only
  network request, breaking offline use and gate S1. Inlining it into each page instead would
  duplicate ~50 KB across forty-odd pages.
- Its hrefs are site-root-relative; the runtime prefixes them with the depth the build recorded in
  `#course-config`.
- `/` focuses the field; `Esc` clears; `↑`/`↓` move through results; `Enter` opens.
- Substring and token match is plenty. No fuzzy-matching library.
- No results → say so, and offer the syllabus link.

## Interactive widgets

A reading may embed visual aids as ```` ```widget ```` fences carrying JSON. Eight types —
`anatomy`, `flow`, `compare`, `terminal`, `match`, `order`, `sequence`, `tree` — documented for
authors in `widgets.md`. The contract the template is held to:

- **Compiled at build time** by `src/lib/widgets.ts`, never rendered in the browser. The page ships
  finished HTML; no spec, no JSON, and no renderer crosses to the client.
- **Complete before JavaScript runs.** `src/runtime/widgets.ts` sets `data-enhanced` and adds
  behaviour on top of markup that already reads correctly. Every widget has a defined un-enhanced
  form — notes listed, output printed, answer visible — and the runtime **hides**, never removes.
  Gate S13 checks it and the print stylesheet un-hides all of it.
- **Nothing is scored or stored.** A drill is practice. Turning a low-stakes retry into another
  recorded failure is the fastest way to stop a learner touching it.
- **Interaction is keyboard-first.** Click-to-place rather than drag-and-drop, arrow keys along an
  anatomy, native `<details>` for a tree. Nothing that needs a pointer.
- **A malformed widget fails the build**, naming the file and the field. Silent degradation is
  correct for a missing *image* and wrong for a broken *diagram*: one is a gap, the other is a lie.
- Widgets are authored where they belong in the prose, which is why they live in markdown and not in
  `course.json`. Placement is the point.

## Design

Fun, not distracting. The reading is the product.

- **One accent color, and a family derived from it.** From `brandColors.primary` when present, else
  pick and state it. Used for progress, focus rings, active states, and the celebration.
- **Each unit carries its own hue.** `src/lib/color.ts` fans the accent across a 210° arc **in
  OKLCH**, so every unit colour sits at the same perceptual lightness and inherits the contrast the
  accent was chosen for. The result is emitted as plain hex, so nothing depends on `oklch()` support
  and print gets real colours. Rotating in HSL instead would make the yellow unit unreadable and the
  blue unit muddy at the same nominal lightness — that is the reason for the whole module.
  `--accent` is re-declared per unit on the page root, so every accent-derived surface picks the unit
  up without any component knowing which unit it is in.
- **Syntax highlighting is dual-theme Shiki**, computed at build time. Both palettes are emitted
  inline (`color` for light, `--shiki-dark` for dark) and swapped in CSS. A single baked palette is
  why highlighting was previously off; one palette cannot serve two themes.
- **Surfaces:** page background, raised card, and a light figure card that stays light in both themes.
- **Type:** system font stack. `clamp()` for headings. Body 1.05rem/1.65.
- **One content measure.** `main` is capped at `--read-width` (90ch) and *no component sets its own
  `max-width`* — competing caps are what left the page edge ragged, with headings spanning 74rem
  while prose sat at 72ch and the lede at 60ch. Pages that are a table or an index rather than
  something read start to finish opt out with the layout's `wide` prop.
- **Motion:** 150–200ms on hover, focus, and card entry. No parallax, no scroll-jacking, no autoplay,
  nothing that moves while text is being read.
- **Dark and light**, light by default, toggle cycles light → system → dark (persisted), and the
  toggle must win over the system setting in both directions.
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
