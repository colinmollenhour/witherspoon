---
name: course-site
description: Build a self-contained, interactive static website from an approved course directory — reading pages, flashcards, auto-graded quizzes, progress tracking, a celebration on quiz completion, and a printable certificate. Adds diagrams and infographics by composing the tldraw-skill and infographic skills. No authentication, no backend; all state lives in the browser's localStorage. Outputs to dist/ ready to upload to any CDN or bucket. Use after course-builder's markdown and course.json have been reviewed and approved.
---

# Course Site

Turn an approved course directory into a static website anyone can open from a link.

Hard constraints, all of them load-bearing:

- **No authentication, no backend.** Every page is a static file.
- **No external requests.** No CDN fonts, no analytics, no remote images, no fetch to anywhere. The
  site must render fully offline and from any origin.
- **State lives only in `localStorage`**, namespaced per course, and the site must stay usable when
  storage is unavailable.
- **Path-independent.** It must work served from a bucket root *or* a subpath. Every URL is relative.
- **Content works without JavaScript.** JS adds progress, grading, and flair — never the words.

Output goes to `<course-dir>/dist/`. Uploading it is the user's job for now; the report tells them how.

## Prerequisite

Run only on a course directory that already contains `course.json` and its markdown content — i.e.
after `course-builder` has finished and the user has approved. If `course.json` is missing or does not
parse, stop and say so rather than inventing structure.

## Pipeline

### Stage 1 — Load and validate

Read `course.json`, then confirm every `activities[].path` and project file it references exists on
disk. Read `SOURCES.md` if present.

Report anything missing as a list and stop. A site built over holes hides them.

Derive from the course: the accent color (from `brandColors.primary` if present, else pick one and
state which), the slug, and the page inventory.

### Stage 2 — Plan visuals

**Read `references/visuals.md`.** Decide, and list before generating:

- one hero infographic per unit, at most — the unit's before→after
- diagrams only where a topic has real structure to show (flow, hierarchy, state, relationships)
- for each: which tool, what it depicts, and its alt text

State the budget. A course does not need a picture per topic, and filler images cost more credibility
than they add.

### Stage 3 — Generate visuals

Follow `references/visuals.md` exactly — it covers the two composition gotchas:

- `infographic` produces a **prompt file, not an image**; it needs an image generator downstream.
- `tldraw` must be probed with `command -v tldraw` before use, and has a defined fallback.

Both are allowed to fail. A missing image degrades to a styled text panel; it never blocks the build.

### Stage 4 — Build

**Read `references/site-spec.md` for pages and design, and `references/state.md` for the storage
contract.**

Copy `assets/site.css`, `assets/site.js`, and `assets/page.template.html` from this skill into the
build, then render every page. **Do not rewrite the CSS or JS from scratch** — they carry the
storage-safety, grading, celebration, and accessibility behavior that the gates check for. Customize
via the documented CSS custom properties and the `COURSE` config block.

Bake all content into the HTML at build time. The site never fetches its own content.

### Stage 5 — Verify

**Read `references/build-gates.md` and run every check.** The important ones are mechanical: zero
external references, zero absolute internal paths, every link resolves, content present with JS
disabled, and no crash when `localStorage` throws.

Fix what fails. Report anything that still fails plainly.

### Stage 6 — Report

```
Built: dist/ — <N> pages · <N> quizzes · <N> images · <total size>
Visuals: <N> tldraw diagrams · <N> infographics · <N> skipped (reason)
Gates: <all passed | what needed fixing | what still fails>

Preview locally:
  cd <course-dir>/dist && python3 -m http.server 8000

Deploy: upload the contents of dist/ to any static host or bucket.
Serve index.html at the root of wherever you put it; every internal link is relative,
so a subpath works too.
```

If any visual was skipped, say which and why — and mention that the infographic prompt files are kept
in `dist/assets/prompts/` so they can be generated later without re-running the build.

## Notes

- Prefer fewer, better pages. One page per topic carrying reading, flashcards, and quiz beats three
  thin pages and three clicks.
- The certificate is a self-reported completion record, not a credential — it says so on its face.
  Do not imply verification the architecture cannot provide.
- Flair budget: one accent color, one celebration, subtle transitions. If an effect would distract a
  learner mid-reading, it does not ship.
- Everything honors `prefers-reduced-motion` and `prefers-color-scheme`.
