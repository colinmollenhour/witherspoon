---
name: course-site
description: Build a self-contained, interactive static website from an approved course directory — reading pages, flashcards, auto-graded quizzes, in-reading interactive widgets (dissected strings, pipelines, comparisons, predict-the-output terminals, matching and ordering drills, message sequences, annotated trees), progress tracking, a celebration on quiz completion, and a printable certificate. Adds diagrams and infographics by composing the tldraw-skill and infographic skills. No authentication, no backend; all state lives in the browser's localStorage. Outputs to dist/ ready to upload to any CDN or bucket. Use after course-builder's markdown and course.json have been reviewed and approved.
---

# Course Site

Turn an approved course directory into a static website anyone can open from a link.

The site itself is built by a **shared Astro template**, published as `witherspoon-course-template`
and checked into this repo as `course-template/`. You do not write a builder, and you do not write
pages — you validate the course, plan and generate its visuals, run the template, and check the
gates. A fix to the template fixes every course.

Hard constraints, all of them load-bearing and all enforced by the template:

- **No authentication, no backend.** Every page is a static file.
- **No external requests.** No CDN fonts, no analytics, no remote images, no fetch to anywhere. The
  site must render fully offline and from any origin.
- **State lives only in `localStorage`**, namespaced per course, and the site must stay usable when
  storage is unavailable.
- **Path-independent.** It must work served from a bucket root *or* a subpath. Every URL is relative.
- **Content works without JavaScript.** JS adds progress, grading, and flair — never the words.

Output goes to `<course-dir>/dist/`. After the gates pass, the publish stage — a skill named
`course-publish`, or the `witherspoon_publish` tool — chooses a host, authenticates, uploads, and
verifies the public site.

## Prerequisites

- A course directory containing `course.json` and its markdown, after `course-builder` has finished
  and the user has approved. If `course.json` is missing or does not parse, stop and say so rather
  than inventing structure.
- **Node ≥ 20 or Bun ≥ 1.1.** Either one alone runs the entire build, gates and jsdom tests included.
  Probe with `node --version 2>/dev/null || bun --version 2>/dev/null || echo MISSING`. If it is
  missing, stop here and read `course-builder/references/runtime-setup.md`: the material is already
  finished and on disk, so this is a paused site build, not a failed course. Say that plainly rather
  than reporting an error.

**References.** Each stage below names a reference document. Load it at the moment that stage calls
for it — from `references/<name>.md` beside this file, or by fetching `<name>` through a reference
tool such as `witherspoon_reference`. One at a time, never all up front.

## Pipeline

### Stage 1 — Load and validate

Read `course.json`. The template validates it against the collection schemas at build time and fails
naming the offending entry, so you do not need to pre-check field shapes — but do confirm the files
it points at exist: every `activities[].path`, and every `projects[].path` with its `brief.md` and
`rubric.md`. Read `SOURCES.md` if present.

Report anything missing as a list and stop. A site built over holes hides them.

Note the accent color: `brandColors.primary` if present, otherwise the template's default `#3f7ac4`,
which you state in the report.

### Stage 2 — Plan visual aids

**Read `references/widgets.md` first, then `references/visuals.md`.** They are in that order for a
reason: most of what a technical reading needs is a widget, and a widget costs a block of JSON while
an image costs a tool invocation that may fail, cannot be searched, and does not theme.

Walk every topic and decide, listing the plan before you build anything:

- **Widgets** — where the reading contains a string with named parts, a hand-off between stages, a
  two-way comparison, output worth predicting, vocabulary worth drilling, an order that is itself the
  lesson, an exchange between parties, or a hierarchy. Give the type, the topic, and the one sentence
  it makes land. **At most two per topic.**
- **Diagrams** — only for structure a widget genuinely cannot carry.
- **Scenes** — an animated, steppable simulation, for a process that is invisible *and temporal*:
  the order is the lesson and a table could only assert the outcome. Watch for the telltales as you
  read: prose that says "watch what happens", a compare table whose columns are really successive
  attempts, hidden state changing meaning, evidence that appears (or pointedly does not), a failure
  walked step by step. At most a handful per course, each where a unit's drama turns. **Read
  `references/viz.md` and run its design method** — insight sentence, three divergent sketches,
  storyboard — before any spec; the plan lists the insight sentence and the chosen visual grammar,
  not just "add a scene".
- **One unit hero per unit, at most** — atmospheric illustration of that unit's before→after, with
  the takeaway in the caption (not painted into the pixels).
- **Optional course hero** — home-page artwork if none exists yet.
- **Optional in-reading figures** — only when a photograph or spatial layout earns a place in prose.
- For each image: file name, tool, what it depicts, alt text, caption, and **how it is wired**
  (`course.json` hero / `units[i].hero` / a `figure` fence or markdown image in `read.md`).

State the budget. A course does not need a picture per topic, filler images cost more credibility
than they add, and a widget between every paragraph reads as decoration.

### Stage 3 — Build the visual aids

**Widgets** are authored directly into the topic's `read.md` as ```` ```widget ```` fences, at the
paragraph each one illustrates. Follow the catalogue in `references/widgets.md` for the shape of each
type. Every fact inside a widget obeys the same grounding contract as prose — an invented `ls` output
is fabrication whether it sits in a paragraph or in JSON.

**Scenes** are a spec file at `assets/viz/<name>.viz.json`, embedded in `read.md` as an ordinary
image of the poster the build generates beside it — `![alt](assets/viz/<name>.svg "caption")` — so
the markdown stays readable and every other renderer shows a real diagram. `references/viz.md` has
the spec; commit the generated poster.

**Images** follow `references/visuals.md` exactly. Three non-obvious rules:

1. **Write under `<course-dir>/assets/`**, never under `dist/` (dist is wiped every build).
2. **Wire them** — course hero and unit heroes via `course.json`; in-reading art via a `figure`
   fence or `![alt](assets/img/…)` in markdown. A file that is not referenced is invisible.
3. **No exact text in rasters.** Labels, paths, status codes, and numbers live in widgets, captions,
   or hand SVG. Unit heroes are metaphors.

Image generators (`image_gen` / `imagine`, `nano-banana`, `codex-cli`) and `tldraw` are allowed to
fail. A missing unit hero simply omits the figure; it never blocks the build. A malformed widget or
a markdown image pointing at a missing `assets/` file *does* block the build, naming the topic —
deliberately, because a silently broken diagram is worse than a build that stops.

### Stage 4 — Build

Run this **from the directory that contains `course-<slug>/`**, not from inside it:

```bash
bun create witherspoon-course        # or: npm create witherspoon-course
```

That is the whole build, first time and every time. It finds the course directory, writes a
`package.json` carrying the build scripts, installs the template, and runs the build. The scaffolder
also writes `.github/workflows/publish.yml` when that file is missing (GitHub Pages on push to
`main`), and a workspace-root provenance `README.md` when that file is missing (who / when / why /
Witherspoon); it never overwrites either and never replaces the learner-facing
`course-<slug>/README.md`. If you build without that path for some reason and the workspace README is
still missing, write the same provenance README before reporting. Afterwards:

```bash
bun run build          # or: npm run build
```

Always go through `bun run <script>` / `npm run <script>`. On a machine with Bun and no Node the bare
`node_modules/.bin/witherspoon-course` shim cannot execute — its `#!/usr/bin/env node` line has
nothing to resolve and the shell exits 127. A one-off command with no workspace is
`bunx witherspoon-course-template <command> --course <course-dir>`.

The template reads `course.json` and the course's markdown through Astro content collections, renders
every page, copies `<course-dir>/assets/` into the output, and writes `<course-dir>/dist/`.

Working inside a checkout of this repo instead, the equivalent is
`cd course-template && npm install && npm run build -- --course ../<course-dir>`.

Do not hand-write pages, do not copy assets around, and do not write a build script. If the site needs
to change, change the template — that is the point of it being shared.

### Stage 5 — Verify

```bash
bun run verify        # gates S1–S15          (npm run verify)
bun run test          # runtime behaviour in jsdom
```

**Read `references/build-gates.md`** for what each gate means and for the two checks that are manual:
serving from a subpath, and loading with JavaScript disabled.

Fix what fails. A gate failure is nearly always a course-content problem or a template bug — say
which, plainly.

### Stage 6 — Report

```
Built: dist/ — <N> pages · <N> quizzes · <N> widgets · <N> images · <total size>
Widgets: <N> anatomy · <N> flow · <N> compare · <N> terminal · <N> match · <N> order ·
         <N> sequence · <N> tree · <N> scene(s)
Visuals: course hero <yes|no> · <N> unit heroes · <N> in-reading figures ·
         <N> tldraw/SVG diagrams · <N> skipped (reason)
Gates: <all passed | what needed fixing | what still fails>
Accent: <hex> (<from brandColors.primary | template default, stated here>)
         Units carry derived hues from it — see site-spec.md.
Rights: <© year holder | no named holder> · <license label>

Preview locally:
  bun run dev        (or: npm run dev) — live reload, edit a reading and the page updates

Publish: say the word and I'll put this on a public URL. The easiest route is here.now — I'll
upload the built folder and check the live site. Or name another host. If this workspace is on
GitHub, push to main also publishes via `.github/workflows/publish.yml` once Pages is set to
GitHub Actions.
```

**Offer the dev server, not a static file server.** `npm run dev` (or `bun run dev` — both are fully
supported; use whichever the machine already has) runs Astro with hot reload, so an author fixing a
typo sees it on the next save. Serving `dist/` means rebuilding by hand after every edit, which is
the wrong loop for the moment a reviewer is most likely to want changes. Dev also rewrites
`/unit-1/index.html` so preview URLs match the built ones.

**If you start a dev server, verify it before handing over the URL.** A 200 on `/` proves almost
nothing — the page can render unstyled and inert while its assets 404. Check all four, and read the
port off the startup log rather than assuming the one you asked for:

```text
GET /                                    → 200
GET /unit-1/topic-1.html                 → 200
GET the CSS URL that HTML actually emits → 200
GET the JS URL that HTML actually emits  → 200
```

Also confirm the returned HTML contains no Astro error overlay. If the dev server will not start at
all — a sandboxed filesystem denies the watcher, most commonly — do not report a broken build: the
production build does not need a watcher, so build and serve `dist/` instead and say which you did.
`course-builder/references/runtime-setup.md` has the signatures and the Windows `npm.cmd` caveat.

Serving `dist/` statically is still the right tool for exactly two jobs, and should be offered only
for them: inspecting the real built output, and the two manual gates — **S12** needs the artifact
served from a subpath, and **S4** needs it loaded with JavaScript disabled. Neither is a preview.

That last line addresses the **user**, so it names no skill and no tool: they cannot invoke either,
and an instruction they cannot follow reads as a broken handoff. Publishing is a separate stage,
reached as a skill named `course-publish` or a `witherspoon_publish` tool call — your business, not
theirs. Do not begin it before the user asks.

If any visual was skipped, say which and why — and mention that any prompt files kept in
`<course-dir>/assets/prompts/` can be generated later without re-running Stage 2.

### Stage 7 — Revise, then re-cut the build

Most courses get read once and then edited. Keep that loop on the dev server: hot reload shows a
reworded paragraph or a fixed widget on save, so the user can look at several changes before anything
is rebuilt. Edit course source only — `course.json`, `read.md`, `brief.md`, or the template. Nothing
in `dist/` survives the next build, and a fix made there is a fix that disappears.

**An affirmation ends the loop.** When the user says the change looks good — "looks good", "perfect",
"ship it", "yes, that's it", any plain approval of what they are looking at — do these in order,
without asking a confirming question:

1. **Commit the course source**, when the workspace is a git repository (`git rev-parse
   --git-dir`). Stage the course files you actually changed and write a message naming the change.
   Never `git push` — a push is the user's to make; the committed Pages workflow is what runs after
   they do — never `git init` a workspace that is not already a repository, and never commit `dist/`,
   `node_modules/` or `.vercel/`. Outside a repository, skip this silently; it is a convenience, not
   a gate.
2. **Rebuild and re-run the gates** — `bun run build`, then `bun run verify` and `bun run test`. The
   dev server renders from source and proves nothing about the artifact anyone will upload.
3. **Report the absolute `dist/` path** and say it is ready to publish or re-upload. If the course is
   already live, that is the folder the user drags onto `vercel.com/drop` again — the publish stage
   owns the naming step that keeps the existing link.

Approval of an edit is not an instruction to deploy it. Build, commit, offer — then wait for the user
to ask. Publishing remains a separate stage, reached as a skill named `course-publish` or a
`witherspoon_publish` tool call.

## Notes

- Prefer fewer, better pages. One page per topic carrying reading, flashcards, and quiz beats three
  thin pages and three clicks.
- The certificate is a self-reported completion record, not a credential — it says so on its face.
  Do not imply verification the architecture cannot provide.
- Flair budget: one accent color and the per-unit hues derived from it, one celebration, subtle
  transitions. If an effect would distract a learner mid-reading, it does not ship.
- Interaction budget: at most two widgets per topic. Every one of them must be answering a question
  the prose has just raised. A widget that is merely *about* the topic is decoration.
- **Nothing the learner reads may depend on JavaScript.** Widgets enhance markup that is already
  complete — gate S13 checks it, and it is the rule to hold any new component to.
- Everything honors `prefers-reduced-motion` and `prefers-color-scheme`.
- `references/site-spec.md` is the design contract the template is held to. Read it when changing the
  template, not when building a course.
