# course-template

One Astro project that builds a self-contained static site from **any** approved course directory.

```bash
npm install                                        # first run only
npm run build -- --course ../course-<slug>         # → ../course-<slug>/dist
npm run dev   -- --course ../course-<slug>         # live preview
npm run verify -- ../course-<slug>/dist            # gates S1–S12
npm run test   -- ../course-<slug>/dist            # runtime behaviour in jsdom
npm run typecheck
```

Course directories hold content only. Updating a course means editing `course.json` and its markdown;
improving the site means editing this template, once, for every course.

## What it reads

`course.json` is the single source of truth for structure and assessment — units, topics, objectives,
flashcards, quizzes, unit tests, projects. Markdown supplies prose only:

| Source | Becomes |
| --- | --- |
| `course.json` | every page's structure, and all quiz/flashcard/test data |
| `<topic>/read.md` | the reading on a topic page |
| `<project>/brief.md` | the brief on a project page |
| `<project>/starter/`, `<project>/tests/` | starter files and grader sources |
| `SOURCES.md` | the sources page (falls back to a table from `course.json`) |
| `<course-dir>/assets/` | images and diagrams, copied to `dist/assets/` |

Four content collections (`course`, `units`, `topics`, `projects`) are defined in
`src/content.config.ts` with zod schemas. A course that violates one fails the build naming the entry
and the field — `topics → unit-1/topic-1 … correctOptionIndex 7 is out of range` — instead of
producing a site that grades wrongly.

## Why the assets are not bundled

Four hard constraints drive the whole design: no external requests, no absolute paths, works without
JavaScript, and deployable at any subpath. Astro is zero-JS by default, which handles the third for
free. The fourth is the one a bundler quietly breaks — Astro emits `/_astro/…` root-absolute URLs for
anything it processes, which 404s the moment the site is served from a subdirectory.

So the runtime and the stylesheet never go through Astro's bundler:

- `src/runtime/*.ts` → bundled by esbuild to one classic IIFE at `assets/site.js`
- `src/styles/*.css` → bundled by esbuild to `assets/site.css`
- both referenced with a prefix computed from the page's depth (`src/lib/rel.ts`)
- `build.inlineStylesheets: 'always'` as a backstop, so a component `<style>` could never emit an
  external `/_astro/*.css`

`tools/build.mjs` stages all of that into `.build/public/` before invoking Astro, then prunes the
output to HTML plus `assets/` so content-layer scratch files never ship. Gate S2 fails on any
`/_astro/` reference, so a regression here is caught rather than discovered on deploy.

## Layout

```
src/
  content.config.ts     collections + zod schemas
  lib/                  course.ts (read/derive) · loaders.ts · rel.ts · search.ts · nav.ts · md.ts
  layouts/Page.astro    shell, config block, relative asset links
  components/           Quiz · Flashcards · ProgressRing · Checklist · Rubric · Markdown
  runtime/              store · quiz · deck · progress · certificate · search · confetti · …
  styles/               tokens · base · components · print
  pages/                index · certificate · sources · 404 · [unit]/[page] · assets/search-index.js
tools/
  build.mjs             the --course wrapper
  verify.mjs            gates S1–S12
  test-runtime.mjs      jsdom behaviour tests
  render-views.mjs      renders quiz.md / flashcards.md / unit-test.md from course.json
```

`src/pages/[unit]/[page].astro` is one dynamic route dispatching on a `kind` prop — unit overview,
topic, test, project. Sibling `[topic].astro`/`[project].astro` routes would be an Astro route
conflict, and under `build.format: 'file'` an `index.astro` would emit `unit-1.html` rather than
`unit-1/index.html`.

## Contracts

- `.claude/skills/course-site/references/site-spec.md` — the design contract this template implements
- `.claude/skills/course-site/references/state.md` — the localStorage contract `src/runtime/store.ts`
  implements
- `.claude/skills/course-site/references/build-gates.md` — what each gate means
- `.claude/skills/course-builder/references/schema.md` — the `course.json` shape

Ids are positional (`u1t1`, `u1p1`) and topics are numbered per unit in the URL while the source tree
numbers them globally. Both are what saved progress is keyed on — changing either orphans every
learner's stored progress.
