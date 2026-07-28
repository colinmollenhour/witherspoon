# Build gates

Read at Stage 5. Most of these are mechanical — run the command, read the answer. A gate that fails
blocks completion; fix it, or report it plainly as unfixed.

## Blocking

### S1 — Zero external references

The single most important gate. One remote URL breaks offline use, leaks a request, and can be
blocked by a CSP the user does not control.

```bash
grep -rnoE '(src|href)="https?://|@import +url\(https?://|fetch\(|XMLHttpRequest|WebSocket|\.woff2?"' dist/ \
  --include='*.html' --include='*.css' --include='*.js'
```

Expected: nothing, except `href="https://…"` inside prose the course itself cites. Those are fine —
they are links a learner may click, not resources the page loads. Any `src`, `@import`, webfont, or
network call is a failure.

### S2 — No absolute internal paths

Every internal link, script, style, and image is relative, so a subpath deploy works.

```bash
grep -rnoE '(src|href)="/[^/]' dist/ --include='*.html' --include='*.css'
```

Expected: nothing.

### S3 — Every link resolves

Walk every `href` and `src` in `dist/`, resolve it against its containing file, and confirm the target
exists. Fragment links must match an `id` on the target page.

Report broken links with the file and line. Zero tolerance — a dead link in a course reads as
abandonment.

### S4 — Content without JavaScript

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

Every `<script type="application/json">` block parses. `assets/course.json` parses. Quiz blocks have
a valid `correctOptionIndex` within range for every `MULTIPLE_CHOICE`, and `options.length === 4`.

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
not use the words "verified", "accredited", or "certified by" — the architecture supports none of
them.

### S11 — Image completeness

Every planned visual either exists on disk at its referenced path, or its slot renders a
`.figure--placeholder`. No broken `<img>`, no empty region. Every `<img>` has `width` and `height`.

### S12 — Path independence

Serve `dist/` from a subpath and load a deep page:

```bash
mkdir -p /tmp/sub/course && cp -r dist/* /tmp/sub/course/ && cd /tmp/sub && python3 -m http.server 8000
```

Open `/course/unit-1/topic-1.html`. Styles, scripts, images, and navigation all work. This catches
root-absolute paths that S2's grep can miss inside JS.

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

## Smoke script

Worth writing once into `dist/../verify.sh` so re-runs are cheap:

```bash
#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/dist" || exit 1
fail=0
echo "S1 external refs";  grep -rnoE '(src)="https?://|@import +url\(https?://|\.woff2?"' . && fail=1
echo "S2 absolute paths"; grep -rnoE '(src|href)="/[^/]' . --include='*.html' && fail=1
echo "S5 bare storage";   grep -rn 'localStorage\.' . --include='*.html' && fail=1
echo "S5 clear()";        grep -rn 'localStorage.clear' . && fail=1
echo "S6 json";           for f in $(find . -name '*.json'); do python3 -m json.tool "$f" >/dev/null || fail=1; done
echo "S11 img dims";      grep -rnoE '<img (?![^>]*width=)[^>]*>' -P . --include='*.html' && fail=1
exit $fail
```

Note the greps are deliberately loud: they print what they find, so a failure names itself.
