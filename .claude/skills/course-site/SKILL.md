---
name: course-site
description: Build a self-contained, interactive static website from an approved course directory — reading pages, flashcards, auto-graded quizzes, in-reading interactive widgets (dissected strings, pipelines, comparisons, predict-the-output terminals, matching and ordering drills, message sequences, annotated trees), progress tracking, a celebration on quiz completion, and a printable certificate. Adds diagrams and infographics by composing the tldraw-skill and infographic skills. No authentication, no backend; all state lives in the browser's localStorage. Outputs to dist/ ready to upload to any CDN or bucket. Use after course-builder's markdown and course.json have been reviewed and approved.
---

# Course Site

Turn an approved course directory into a static website anyone can open from a link.

The site itself is built by a **shared Astro template** at `course-template/`, checked into this
repo. You do not write a builder, and you do not write pages — you validate the course, plan and
generate its visuals, run the template, and check the gates. A fix to the template fixes every course.

Hard constraints, all of them load-bearing and all enforced by the template:

- **No authentication, no backend.** Every page is a static file.
- **No external requests.** No CDN fonts, no analytics, no remote images, no fetch to anywhere. The
  site must render fully offline and from any origin.
- **State lives only in `localStorage`**, namespaced per course, and the site must stay usable when
  storage is unavailable.
- **Path-independent.** It must work served from a bucket root *or* a subpath. Every URL is relative.
- **Content works without JavaScript.** JS adds progress, grading, and flair — never the words.

Output goes to `<course-dir>/dist/`. After the gates pass, invoke `course-publish` to choose a host,
authenticate, upload, and verify the public site.

## Prerequisites

- A course directory containing `course.json` and its markdown, after `course-builder` has finished
  and the user has approved. If `course.json` is missing or does not parse, stop and say so rather
  than inventing structure.
- Node 20+, and `npm install` run once in `course-template/`.

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
- **One hero infographic per unit, at most** — the unit's before→after.
- For each image: which tool, what it depicts, and its alt text.

State the budget. A course does not need a picture per topic, filler images cost more credibility
than they add, and a widget between every paragraph reads as decoration.

### Stage 3 — Build the visual aids

**Widgets** are authored directly into the topic's `read.md` as ```` ```widget ```` fences, at the
paragraph each one illustrates. Follow the catalogue in `references/widgets.md` for the shape of each
type. Every fact inside a widget obeys the same grounding contract as prose — an invented `ls` output
is fabrication whether it sits in a paragraph or in JSON.

**Images** follow `references/visuals.md` exactly — it covers the two composition gotchas:

- `infographic` produces a **prompt file, not an image**; it needs an image generator downstream.
- `tldraw` must be probed with `command -v tldraw` before use, and has a defined fallback.

Images go into `<course-dir>/assets/`, which is committed with the course. Both tools are allowed to
fail. A missing image degrades to a styled text panel; it never blocks the build. A malformed widget
*does* block the build, naming the file and the field — deliberately, because a silently broken
diagram is worse than a build that stops.

### Stage 4 — Build

```bash
cd course-template
npm install                                    # first run only
npm run build -- --course ../<course-dir>
```

That is the whole build. The template reads `course.json` and the course's markdown through Astro
content collections, renders every page, copies `<course-dir>/assets/` into the output, and writes
`<course-dir>/dist/`.

Do not hand-write pages, do not copy assets around, and do not write a build script. If the site needs
to change, change the template — that is the point of it being shared.

### Stage 5 — Verify

```bash
npm run verify -- ../<course-dir>/dist        # gates S1–S13
npm run test -- ../<course-dir>/dist          # runtime behaviour in jsdom
```

**Read `references/build-gates.md`** for what each gate means and for the two checks that are manual:
serving from a subpath, and loading with JavaScript disabled.

Fix what fails. A gate failure is nearly always a course-content problem or a template bug — say
which, plainly.

### Stage 6 — Report

```
Built: dist/ — <N> pages · <N> quizzes · <N> widgets · <N> images · <total size>
Widgets: <N> anatomy · <N> flow · <N> compare · <N> terminal · <N> match · <N> order ·
         <N> sequence · <N> tree
Visuals: <N> tldraw diagrams · <N> infographics · <N> skipped (reason)
Gates: <all passed | what needed fixing | what still fails>
Accent: <hex> (<from brandColors.primary | template default, stated here>)
         Units carry derived hues from it — see site-spec.md.

Preview locally:
  cd <course-dir>/dist && python3 -m http.server 8000

Publish: invoke `course-publish`. It defaults to a direct Tigris upload, asks for the user's
preferred host and URL, handles authentication, and verifies the live site. No GitHub deployment is
required.
```

If any visual was skipped, say which and why — and mention that the infographic prompt files are kept
in `<course-dir>/assets/prompts/` so they can be generated later without re-running the build.

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
