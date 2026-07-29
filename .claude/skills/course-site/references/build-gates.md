# Build gates

Read at Stage 5. Nearly all of these are implemented in `course-template/tools/verify.mjs` and run
in one command:

```bash
cd course-template
npm run verify -- ../<course-dir>/dist
```

Behaviour a static check cannot see — a throwing `localStorage`, a corrupt blob, first-attempt-only
scoring, reset scope — is covered by `npm run test -- ../<course-dir>/dist`, which drives the built
runtime against a built page in jsdom.

Two gates stay manual and are called out below: **S4** (load with JavaScript disabled) and **S12**
(serve from a subpath). Everything else is automated.

A gate that fails blocks completion; fix it, or report it plainly as unfixed. This file explains what
each gate is *for* — the verifier is the authority on whether it passes.

## Blocking

### S1 — Zero external references

The single most important gate. One remote URL breaks offline use, leaks a request, and can be
blocked by a CSP the user does not control.

The rule: **`href="https://…"` in prose the course cites is fine** — that is a link a learner may
click, not a resource the page loads. Any `src`, `@import`, webfont, `fetch(`, `XMLHttpRequest` or
`WebSocket` is a failure.

That distinction matters: an earlier `verify.sh` omitted `fetch(` from its pattern while the prose
here required it, so the two definitions of S1 disagreed — and the shipped runtime, which called
`fetch('assets/search.json')`, passed the script while failing the gate as written. The search index
is now a plain script loaded with a relative `src`, and `verify.mjs` checks the full rule.

### S2 — No absolute internal paths

Every internal link, script, style, and image is relative, so a subpath deploy works.

The verifier also fails on any `/_astro/` reference. That is the specific way this gate gets broken
silently: Astro's bundler emits root-absolute URLs for anything it processes, so the template keeps
`site.css` and `site.js` out of the bundler entirely and sets `build.inlineStylesheets: 'always'` as
a backstop. A `/_astro/` path in the output means something slipped back in.

### S3 — Every link resolves

Walk every `href` and `src` in `dist/`, resolve it against its containing file, and confirm the target
exists. Fragment links must match an `id` on the target page.

Report broken links with the file and line. Zero tolerance — a dead link in a course reads as
abandonment.

### S4 — Content without JavaScript *(partly manual)*

Load each page with scripting disabled (or strip `<script>` and inspect the DOM). Every reading,
flashcard front *and* back, quiz question with its answer and explanation, rubric, and syllabus entry
must be present in the HTML.

If content only appears once JS runs, the build fetched or rendered it client-side. Bake it in.

### S5 — Storage safety

- `grep -rn 'localStorage\.' dist/assets/site.js` returns only lines inside the store wrapper.
- No bare `localStorage.` anywhere else in `dist/`.
- No `localStorage.clear()` anywhere. Reset removes exactly one namespaced key.
- Simulate a throwing store (override `setItem` to throw) and load a page: no uncaught error, the
  banner appears once, quizzes still gradeable for the session.
- Feed the key malformed JSON and reload: page renders, storage resets, no white screen.

### S6 — JSON integrity

Every `<script type="application/json">` block parses. Quiz blocks have a valid `correctOptionIndex`
within range for every `MULTIPLE_CHOICE`, `options.length === 4` as rendered, and every `TRUE_FALSE`
carries a boolean `correctAnswer`.

Most of this is now also enforced upstream, by the collection schemas in
`course-template/src/content.config.ts` — a course with a bad answer key fails the build naming the
entry and the field, rather than producing a site that grades wrongly. S6 is the check that the
rendered page agrees with the validated data.

### S7 — Objective wiring

Every quiz question carries a non-empty `objectives[]`, extracted at build time from its explanation's
`(objective N)` citation. An empty array means the per-objective breakdown silently shows nothing —
which is exactly the feature the citation contract exists to enable.

### S8 — Accessibility floor

- One `<h1>` per page; no skipped heading levels.
- Every `<img>` has `alt` (empty + `aria-hidden="true"` only if genuinely decorative).
- Every form control has a label or accessible name.
- No `outline: none` without a `:focus-visible` replacement.
- Contrast ≥ 4.5:1 body / ≥ 3:1 UI, computed for **both** themes against the chosen accent.
- Quiz results live region present.

### S9 — Print path

`certificate.html` has print styles that hide chrome and buttons, force light colors, and fit one
landscape page. Verify the print stylesheet exists and that `.no-print` covers every interactive
element on that page.

### S10 — Certificate honesty

The page states it is a self-reported record and that progress is stored only in this browser. It must
not **claim** to be "verified", "accredited", or "certified by" anyone — the architecture supports
none of them.

Negated uses are the point, not a violation: "not verified by anyone" is exactly the disclaimer this
gate exists to require, so the verifier fails only on an affirmative claim.

### S11 — Image completeness

Every planned visual either exists on disk at its referenced path, or its slot renders a
`.figure--placeholder`. No broken `<img>`, no empty region. Every `<img>` has `width` and `height`.

### S12 — Path independence

The verifier checks that every asset reference carries the right number of `../` for its depth. That
does not prove the site loads, so also serve `dist/` from a subpath and open a deep page:

```bash
mkdir -p /tmp/sub/course && cp -r dist/* /tmp/sub/course/ && cd /tmp/sub && python3 -m http.server 8000
```

Open `/course/unit-1/topic-1.html`. Styles, scripts, images, and navigation all work. This catches
root-absolute paths that a grep can miss inside JS.

### S13 — Widget integrity

Interactive visual aids fail in two ways a reader cannot see, and this gate covers both.

**A widget that did not render.** Compilation replaces each ```` ```widget ```` fence with a mount
token and puts the compiled HTML back afterwards. If the injection misses, the token ships as visible
gibberish in the middle of the prose. Any `CSWIDGETMOUNT` left in the output fails.

**A widget whose content only exists after JavaScript.** This is S4 for widgets, checked per type:
`match` and `order` must carry their static fallback, `anatomy` must carry every note, and a
`terminal` with a Run button must carry the output that button reveals. Every button inside a widget
needs an accessible name.

The kind in `data-widget` must be one the template knows and must agree with the `wx--` class.

A malformed widget never reaches this gate — the **build** fails first, naming the file and the
field, because a course that ships a broken diagram silently is worse than one that stops.

Advisory: more than four widgets on a page. Past that they read as decoration and the good ones lose
their weight.

### S14 — No raw Markdown leaks

Structured prose from `course.json` must pass through the Markdown renderer. The verifier strips
tags, scripts, styles, preformatted blocks, and code, then fails when visible prose still contains
backtick code spans or `**bold**` markers. This catches fields rendered with `{value}` instead of the
shared Markdown component.

### S15 — Rights notice

Every generated page contains exactly one `.site-license` notice whose `data-license-id` is one of
the four IDs accepted by the course schema. Creative Commons licenses must also appear as canonical
`rel="license"` links in both `<head>` and the visible footer. A license recorded only in
`course.json` but absent from the deployed pages fails.

## Advisory

Report, do not block.

- **Payload** — total `dist/` size, largest single asset. Flag rasters over 400 KB, total images over
  3 MB, `site.js` over 60 KB.
- **Reading length** — flag topic pages whose reading is under 400 or over 1600 words.
- **Orphan pages** — any page not reachable from `index.html` in two clicks.
- **Duplicate ids** within a page.
- **Motion** — confirm every transition and the celebration are inside a `prefers-reduced-motion`
  guard.
- **Empty states** — a fresh browser (no storage) shows sensible home, certificate, and search
  states, not zeros and blanks.

## Running them

```bash
cd course-template
npm run verify -- ../<course-dir>/dist   # S1–S15 and the advisory checks
npm run test   -- ../<course-dir>/dist   # runtime behaviour in jsdom
```

`verify.mjs` is deliberately loud: it prints the file and the specific problem, so a failure names
itself.

`test-runtime.mjs` covers what a static check cannot see — a throwing `localStorage` degrading to an
in-memory store with exactly one banner, a corrupt blob resetting instead of white-screening, a
wrong schema version resetting with a notice, first-attempt-only scoring, the no-JS `<details>`
fallback being present before interaction and removed after, and reset touching exactly one key
while leaving other courses on the same origin alone.

Neither replaces the two manual checks: load a topic page with scripting disabled (S4), and serve
`dist/` from a subpath and open a deep page (S12).
