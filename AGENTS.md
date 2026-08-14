# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**witherspoon** — a course-authoring system made of four agent skills plus one shared Astro site
builder. It is not an app; it is a pipeline that produces course directories and static sites from
them. (Named for John Witherspoon, the educator — README.md explains why.)

The skills are harness-neutral by design: where one needs a capability with a Claude Code-specific
tool name, it states the capability first and gives the name as an example. Keep it that way.

```
.claude/skills/course-builder/   generates course material  → course-<slug>/
.claude/skills/course-review/    first-hour pass on an existing course
.claude/skills/course-site/      builds the static site     → course-<slug>/dist/
.claude/skills/course-publish/   uploads dist/ to here.now  → public URL
course-template/                 the shared Astro builder (every course uses it)
create-witherspoon-course/       npm `create-` package that installs and runs the builder
mcp-server/                      serves the four skills over MCP, so nothing is installed
course-from-apps-to-machines/    the one course that exists today
README.md                        the design rationale behind all of the above — read it
```

Two distribution channels, one set of files. The skills are loaded from disk by a harness, **or**
fetched per stage from `mcp-server/`, whose `content/` is a generated copy synced from
`.claude/skills/`. The skills are therefore written to work without a checkout of this repo: they
name published packages, not repo paths. Do not reintroduce a `cd course-template` into a skill, and
run `npm run check` in `mcp-server/` after editing one.

Skills are invoked in that order: **build → site → publish**. **Review** is a side door for a
course that already exists — it is not a fourth stage of a new build. Each skill's `SKILL.md`
holds its pipeline; its `references/` files are loaded per-stage, not up front, so `SKILL.md`
stays small.

## Commands

Everything runs through `course-template`. Working **in this repo**, drive it directly:

```bash
cd course-template
npm install                                        # first run only
npm run build  -- --course ../course-<slug>        # → ../course-<slug>/dist
npm run dev    -- --course ../course-<slug>        # live preview (--host, --port pass through)
npm run verify -- ../course-<slug>/dist            # gates S1–S15, static
npm run test   -- ../course-<slug>/dist            # runtime behaviour in jsdom (needs a build first)
npm run check-widgets -- --course ../course-<slug> # widget JSON only, no build
npm run typecheck                                  # tsc --noEmit
node tools/render-views.mjs --course ../course-<slug> [--check]   # regenerate the markdown views
```

**Outside this repo** — the form the skills document — the same operations come from the published
package via `bun create witherspoon-course`, which writes `build`/`dev`/`verify`/`test`/
`check-widgets`/`render-views` scripts into a workspace `package.json`. `tools/cli.mjs` is the `bin`
that backs them, and it just re-execs the same tools.

The MCP server:

```bash
cd mcp-server
npm install && npm run sync   # sync copies .claude/skills → content/
npm start                     # http://localhost:8787/mcp
npm run check                 # fails if content/ drifted from the skills
npm run smoke                 # protocol-level check against a running server
```

There is no test filter flag. `tools/test-runtime.mjs` and `tools/verify.mjs` each run their whole
list and print every failure; to isolate one, read the named check in the tool and reproduce it.

`npm run build` requires `--course`; `astro.config.mjs` throws if `COURSE_DIR` is unset, so never
invoke `astro` directly.

## Architecture

### `course.json` is the source of truth

Structure and **all** assessment data — quizzes, flashcards, unit tests, rubrics, test cases — live in
`course.json`. Markdown supplies prose only: `read.md`, `brief.md`, `SOURCES.md`.

`quiz.md`, `flashcards.md` and `unit-test.md` are **rendered views**, generated from the JSON by
`tools/render-views.mjs`. Nothing parses them back. Do not hand-edit them and do not add a parser —
the previous builder had to recover answer keys from five hand-written markdown dialects through a
cascade of guesses, which is exactly what this direction retires.

`src/content.config.ts` validates the JSON against zod schemas at build time, so a bad answer key
fails the build naming the entry and the field rather than shipping a site that grades wrongly.

### The template holds the site; courses hold content

Fixing a bug in `course-template/` fixes it for every course. Never hand-write pages into a course
directory, never copy assets around by hand, and never write a per-course build script. If the site
must change, change the template.

```
course-template/src/
  content.config.ts   four collections (course, units, topics, projects) + zod schemas
  lib/                course.ts (read/derive from course.json — the only module that knows the
                      on-disk shape) · loaders.ts · rel.ts · search.ts · nav.ts · md.ts ·
                      widgets.ts (compiles ```widget fences) · color.ts (per-unit OKLCH hues) ·
                      license.ts
  layouts/Page.astro  shell, config block, relative asset links
  components/         Quiz · Flashcards · ProgressRing · Checklist · Rubric · Markdown
  runtime/            store · quiz · deck · progress · certificate · search · confetti · widgets · …
  styles/             tokens · base · components · widgets · print
  pages/              index · certificate · sources · 404 · [unit]/[page] · assets/search-index.js
tools/                build.mjs · verify.mjs · test-runtime.mjs · check-widgets.mjs · render-views.mjs
```

### Four constraints that drive the whole design

- **No external requests.** No CDN fonts, no analytics, no remote images, no off-origin `fetch`. The
  site renders fully offline. (Gate S1.)
- **Path-independent.** Works at a bucket root, a subpath, or `file://`. Every internal URL is
  relative, computed from page depth via `src/lib/rel.ts`. (Gates S2, S12.)
- **Content works without JavaScript.** JS adds progress, grading and flair — never the words.
  (Gate S4.)
- **State only in `localStorage`**, namespaced `course:<slug>:v1`, usable when storage is disabled,
  full or corrupt. (Gate S5.)

## Things that will bite you

- **The runtime and stylesheet bypass Astro's bundler on purpose.** Astro emits root-absolute
  `/_astro/…` URLs, which 404 on a subpath deploy. `tools/build.mjs` bundles `src/runtime/*.ts` and
  `src/styles/*.css` with esbuild into `assets/site.js` / `assets/site.css`, stages them into
  `.build/public/`, and Astro copies them verbatim. `inlineStylesheets: 'always'` is the backstop.
  Gate S2 fails on any surviving `/_astro/` reference.
- **Bun is a first-class runtime, and `spawn()` is where that breaks.** The whole pipeline — Astro
  build, gates, jsdom runtime tests — runs under Bun with no Node installed. The one thing that does
  not survive is spawning a `node_modules/.bin/*` shim: a package manager substitutes its own runtime
  for the `#!/usr/bin/env node` shebang, but `spawn()` does not, and the kernel reads it literally.
  `tools/build.mjs` therefore launches Astro's `astro.js` with `process.execPath`. For the same
  reason, never document `node_modules/.bin/witherspoon-course` as a command — on a Bun-only machine
  the shell exits 127. Package scripts and `bunx`/`npx` are the only portable forms.
- **Dev and production stage separately** (`.build/public-dev` vs `.build/public`). `npm run dev`
  leaves esbuild watching; a shared directory let the watcher write unminified output and a source map
  over a production build before Astro copied it.
- **Ids are positional and load-bearing.** `u1t1`, `u1p1` (`src/lib/course.ts`). Topics are numbered
  *per unit* in URLs while the source tree numbers them *globally*. Changing either orphans every
  learner's saved progress.
- **`[unit]/[page].astro` is one dynamic route** dispatching on a `kind` prop (unit overview, topic,
  test, project). Sibling `[topic].astro`/`[project].astro` routes are an Astro route conflict, and
  under `build.format: 'file'` an `index.astro` would emit `unit-1.html` instead of
  `unit-1/index.html`. `src/middleware.ts` rewrites `/unit-1/index.html` in **dev only** so preview
  URLs match built ones — the `import.meta.env.DEV` guard is required, since middleware also runs
  during the build.
- **Generated visuals go in `<course-dir>/assets/`, never `dist/`.** `dist/` is deleted and rewritten
  on every build. `tools/build.mjs` copies course assets in; the build then prunes the output to HTML
  plus `assets/` so content-layer scratch never ships.
- **Widgets are compiled at build time.** `src/lib/widgets.ts` lifts each ```` ```widget ```` fence out
  before markdown rendering and puts the compiled HTML back after, so no spec or renderer reaches the
  browser. Eight types: `anatomy`, `flow`, `compare`, `terminal`, `match`, `order`, `sequence`, `tree`
  (catalogue: `.claude/skills/course-site/references/widgets.md`). The un-enhanced markup is already
  complete; `src/runtime/widgets.ts` only sets `data-enhanced` and hides rather than removes, which is
  what lets the print stylesheet bring everything back. A malformed widget fails the build by design.
- **Diagrams are SVG, not Mermaid.** Mermaid needs a runtime library and would break the
  no-external-requests rule. Fallback for a failed visual is inline SVG or a table — and the build
  never blocks on a missing picture.
- **The certificate is a self-reported record.** It must say so on its face; gate S10 fails on any
  wording implying verification the architecture cannot provide.

## Content quality gates

`course-builder` fails the build on: an objective with no assessment covering it; a quiz explanation
missing its `(objective N)` citation; rubric weights not summing to 100; a `completionCriteria` no
machine can check; a project with no adversarial test case; a topic dropping the running example; an
unpinned project environment; **a number tracing to no `SOURCES.md` ledger row** (fabrication);
a ledger row without a resolvable source or with a paraphrased "quote".

The `(objective N)` citation contract is not decoration — the site's per-objective quiz review is
built from it (gate S7), so it is checked at both ends.

Site gates S1–S15 are documented in `.claude/skills/course-site/references/build-gates.md`, including
the two that stay manual: serving from a subpath, and loading with JavaScript disabled.

## Conventions

- Node 20.19+ / 22.13+ / 24+ (the floor `jsdom` sets), ESM throughout (`"type": "module"`). Tools are `.mjs` with a shebang and a header comment
  explaining *why* they exist, not what they do — match that when adding one.
- Comments in this codebase document non-obvious decisions and the bug that motivated them. Terse
  where the code is obvious; a paragraph where a future reader would otherwise "simplify" a
  load-bearing workaround back into a regression.
- Prose in courses and docs uses British spelling.
- **Three licences live here, split on one line: anything that ends up inside a user's published site
  is permissive, everything else is copyleft.** `course-template/` is MIT, because its bundled JS and
  CSS ship in every course site. The skills, `mcp-server/` and `create-witherspoon-course/` are
  GPL-3.0-or-later (root `LICENSE`). Keep new code on the correct side of that line — moving a module
  into `course-template/src/runtime/` relicenses it. Separately, a *course* carries whatever the
  author picked at the interview, stored in its `course.json` `license` object and rendered by gate
  S15; never copy a repo licence into a course, or a course licence into a `package.json`.
- `dist/`, `node_modules/`, `.astro/`, `course-template/.build/` and `.tmp/` are ignored.
  `course-template/.claude/` and `course-template/.mcp.json` are ignored too — they are sandbox mount
  stubs the agent harness creates, not config. The repo's own `.claude/skills/` **is** tracked.
