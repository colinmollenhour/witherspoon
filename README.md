# witherspoon

Generate a complete, grounded course — readings, flashcards, quizzes, unit tests, and graded
hands-on projects — then build it into a self-contained static website.

Three agent skills plus one shared [Astro](https://astro.build) template. The skills are plain
directories of Markdown, so any agent harness that loads skills can run them. The site builder is
ordinary Node and runs on its own.

**→ [See a finished course](https://course-from-apps-to-machines.t3.tigrisfiles.io/index.html)** —
*From Apps to Machines*: 6 units, 21 topics, 27 quizzes and tests, interactive widgets, and a
printable certificate. Built from `course-from-apps-to-machines/` in this repo, and hosted free.

```
.claude/skills/course-builder/   subject → course-<slug>/          (material)
.claude/skills/course-site/      course-<slug>/ → dist/            (website)
.claude/skills/course-publish/   dist/ → a public URL              (hosting)
course-template/                 the shared Astro builder — every course uses it
create-witherspoon-course/       `bun create witherspoon-course` — sets the builder up
mcp-server/                      serves the three skills over MCP — nothing to install
course-from-apps-to-machines/    a worked example: 6 units, 21 topics, 6 projects
```

Two ways in. **Connect the MCP server** and ask your agent for a course — it fetches each stage as it
needs it, and the only thing that ever lands on your machine is the course itself plus the site
builder. Or **copy the skills** into a harness that loads them from disk. The pipeline is identical
either way; the MCP server serves the same files.

## Requirements

- **An agent harness with skill support.** Each skill is a `SKILL.md` with YAML frontmatter and a
  `references/` directory, loaded per-stage so the entry file stays small. Nothing calls a model
  vendor's API directly. Four harness capabilities are used, each with a stated fallback:

  | Capability | Used for | Without it |
  | --- | --- | --- |
  | Batched multiple-choice question | the interviews | ask as one numbered list |
  | Web search + web fetch | the grounding expedition | *required* — grounding is the point |
  | Parallel subagents | writing topics and projects | run the same contracts sequentially |

  `.claude/skills/` is the conventional location — copy or symlink elsewhere if your harness looks
  somewhere else. Where a tool has a Claude Code-specific name, the skills give the capability first
  and the name as an example.
  Or connect the MCP server instead, which needs none of that — see below.
- **Optional external tools** for visuals: a diagram CLI and an image generator. `course-site` probes
  for them and degrades to a styled text panel if absent — the build never blocks on a picture.
- **Node ≥ 20 or Bun ≥ 1.1** for the site template. Either one alone runs the whole build, gates and
  jsdom tests included. It is needed only for the **website** — the course material is written
  without it, which is why nothing asks you to install anything until the material is done.

## Quick start — over MCP

Add the server to your agent by URL. No authentication, nothing to install, no repository to clone:

```
https://mcp-production-f93d.up.railway.app/mcp
```

Then ask for what you want:

> Help me create a course using Witherspoon for my 3rd grade science class on the water cycle.

Your agent fetches the pipeline one stage at a time, interviews you once, stops at a single approval
gate, and then works autonomously. Somewhere around that gate it will hand you a one-line command to
install Bun or Node — do it while the course generates, and the website builds at the end. If you
skip it, you still get the complete course material as Markdown.

Your agent needs file and shell access for anything past the interview. Hosting the server yourself
is `cd mcp-server && npm install && npm run sync && npm start`; see [`mcp-server/`](mcp-server/).

## Quick start — from a checkout

```bash
git clone https://github.com/colinmollenhour/witherspoon.git
cd witherspoon
```

**1 · Generate the material.** Point your agent at the repo and ask:

> Build a course on *&lt;subject&gt;* for *&lt;audience&gt;*.

`course-builder` asks six questions in one turn — audience, feel, size, structure, licence, and
copyright holder, each with a recommended default — then proposes a running example and an outline
and stops. That approval is the only gate. After it, the skill researches the subject, grounds every
figure in a real source, writes `SOURCES.md`, and fans out to write each topic and project into
`course-<slug>/`.

**2 · Review it.** The output is a readable Markdown tree plus `course.json`. Read the readings,
check `SOURCES.md`, fix what you disagree with.

**3 · Build the site.** From the directory that *contains* `course-<slug>/`:

```bash
bun create witherspoon-course        # or: npm create witherspoon-course
```

That installs the builder, writes the scripts, and runs the first build. Then:

```bash
bun run verify        # gates S1–S15
bun run test          # runtime behaviour in jsdom
```

Or ask your agent to run `course-site`, which also plans and generates the diagrams and unit hero
images before building.

Always go through `bun run <script>` / `npm run <script>`. On a machine with Bun and no Node the bare
`node_modules/.bin/witherspoon-course` shim cannot execute — its `#!/usr/bin/env node` line has
nothing to resolve and the shell exits 127.

**4 · Preview.**

```bash
bun run dev                                     # live reload
# or, against the built output:
cd course-<slug>/dist && python3 -m http.server 8000
```

**5 · Publish — free.** Ask your agent to publish the course. It uploads `dist/` straight to
[Vercel](https://vercel.com) with one CLI call, wires up a custom domain if you want one, and opens
the live URL from the public internet to verify it before reporting. It never deploys through GitHub.

A course site is static files with no backend, which makes it essentially free to host. Vercel is the
default for one specific reason: it serves `index.html` at the root, so the link you share is a bare
`https://your-course.vercel.app` rather than something ending in `/index.html`. Its free **Hobby**
plan covers personal and educational publishing; commercial use needs a paid plan, and the skill says
so before you log in rather than after you publish.

Any other static host works too — Netlify and Cloudflare Pages are built in, and naming any other
provider and upload mechanism will use that instead. Every route is direct artifact upload; nothing
goes through a repository or CI.

## Output layout

```
course-<slug>/
  course.json                    the full course graph — structure and all assessment data
  README.md                      about, skills, faqs, syllabus
  SOURCES.md                     grounding ledger: claim → source → verbatim quote
  assets/                        generated diagrams and hero images
  unit-1-foundations/
    topic-1-cpu-vs-gpu/
      _contract.md               generation prompt + grounded facts + requested activities
      read.md  flashcards.md  quiz.md
    unit-test.md
    project-1-baseline/
      brief.md  rubric.md  starter/  tests/
  dist/                          the built site
```

## What makes a course good

The quality model came from pulling apart professionally-built courses in three domains — systems
programming, sales, and high-school maths — and asking what the good ones had in common that the
mediocre ones didn't. It was not format variety; nine activity types are table stakes and explain
nothing. What separated them was structural.

1. **A running example threads the entire course.** One artefact carried through every topic and
   re-measured at each step — a CUDA `add()` over 1M floats going 3 ms on the CPU → 75 ms on one GPU
   thread (*deliberately worse*) → 4.2 ms on one block → 47 µs once memory is prefetched. Nothing
   else does as much for coherence; activity variety is decoration on top of it.

2. **Failure moments are designed in.** The learner hits the wall *before* being handed the fix, and
   the course says so out loud rather than letting them conclude they broke something. The
   cliffhanger is written into the unit description, so the next unit has somewhere to land.

3. **Objectives are observable actions with the real API embedded.** Three per topic. *"Write a
   grid-stride loop that handles arrays larger than the launch's total thread count"* — not
   "understand parallelism". **Every quiz explanation cites the objective it assesses**, as
   `(objective 2)`. That traceability is why the assessments aren't filler: an objective no question
   covers becomes a visible, checkable defect.

4. **An intermediate representation sits between outline and content.** Each topic carries a
   `_contract.md` — a generation prompt plus an activity manifest with counts — that the outline
   stage writes *for* the writing stage, including how the topic hands off to its neighbours. This
   is the mechanism that makes parallel generation coherent: N topics can be written by N
   independent workers and still interlock.

5. **Projects are graded three ways at once.** `steps[]` with machine-checkable completion criteria
   (*"stdout contains `Max error: 0`"*, not *"student understands prefetching"*), a weighted
   `rubric[]` summing to 100, and executable `testCases[]` — including at least one adversarial case
   aimed at the plausible shortcut. Plus a pinned `environment`, so results reproduce.

6. **Course framing is concrete.** The subtitle states a before→after with numbers. `skills[]` are
   performance statements, not nouns. `faqs[]` answer real objections, starting with *"why not just
   read the official docs?"* — and the answer has to be specific about what the official treatment
   leaves out.

## `course.json`

The course graph, abridged to the fields that carry pedagogical weight. Full schema in
`.claude/skills/course-builder/references/schema.md`.

```
course
  title, slug, about, structureTemplate: "project-based" | "academic"
  skills[]   faqs[]   spine { runningExample, transformation, failureMoment }
  sources[]  { id, claim, value, source, angle }
  units[]
    title, description                # description ends on the hook into the next unit
    topics[]
      instructions                    # the generation contract
      learningGoals[]                 # 3 per topic, observable, API-bearing
      activities[]                    # { type, path } — the join to read.md
      flashcards[]   quiz
    test  { passingScore, questions[] }     # explanation MUST cite "(objective N)"
    projects[]
      goal, type, config, steps[], rubric[], testCases[], environment
```

**Assessment data lives in the JSON, not the Markdown.** `quiz.md`, `flashcards.md` and
`unit-test.md` are reviewable views rendered *from* it, and nothing parses them back:

```bash
bunx witherspoon-course-template render-views --course <course-dir> [--check]
```

That direction is load-bearing. When quizzes existed only as prose, the site builder had to recover
each answer key from five hand-written Markdown dialects through a ranked cascade of eight guessing
strategies — including one where `**Correct:** 2` meant a 1-based ordinal and another where
`**Correct option index:** 2` meant a 0-based index. A course should not have to infer which answer
is correct; the model that wrote the question already knew.

## Pipeline

`course-builder` runs nine stages, with exactly one human gate:

1. **Scan** *(silent)* — orient over the working directory and any attached sources.
2. **Interview** — four questions in one turn, each with a recommended default.
3. **Spine** *(provisional)* — pick the running example and the measurable transformation *before*
   outlining. Unconfirmed numbers are marked `?`.
4. **Outline** *(provisional)* — units, topics, objectives, and a `_contract.md` per topic, with at
   least one designed failure moment.
5. **Approve** — **the only gate.** Approving opts into both fan-outs; after it, work runs
   autonomously.
6. **Ground** — parallel research across five angles: primary source · authoritative numbers ·
   current-state check · misconception harvest · prior-art gap. Produces `SOURCES.md`.
7. **Refine** — corrected numbers propagate to the spine, subtitle, and every contract; harvested
   misconceptions become quiz distractors; the prior-art gap becomes the "why this over the docs"
   FAQ. An invalidated premise is the one finding that reopens the gate.
8. **Generate** — one subagent per topic and per project, each handed only its own contract and its
   ledger rows. **No agent may introduce a number absent from its grounded facts.**
9. **Verify** — the gates below.

### Quality gates — the build fails on any

- an objective with no assessment covering it
- a quiz explanation missing its `(objective N)` citation
- rubric weights that do not sum to 100
- a `completionCriteria` no machine can check
- a project with no adversarial test case
- a topic that drops the running example
- an unpinned project environment
- **a number that traces to no ledger row** — fabrication, not a placeholder
- a `SOURCES.md` row without a resolvable source, a paraphrased "quote", or a surviving `?`

## The site template

`course-site` validates the course, generates its visuals, runs `course-template/`, and checks the
gates. It does not write pages and does not write a builder — courses hold content, the template
holds the site, so fixing a bug once fixes every course.

```bash
bun run build     bun run dev       bun run verify
bun run test      bun run check-widgets         bun run render-views
```

**What it builds:** a home page with a progress ring and resume link · one page per topic carrying
reading, flashcards and quiz · unit tests · project pages with persisted step checklists · a
printable certificate · client-side search. Quizzes give immediate per-question feedback, score
first attempts only, and — because every explanation cites its objective — report a **per-objective
breakdown** of what to review. Readings can embed eight kinds of interactive widget (`anatomy`,
`flow`, `compare`, `terminal`, `match`, `order`, `sequence`, `tree`), compiled at build time so no
renderer ever reaches the browser.

**Four constraints, all load-bearing:**

- **No auth, no backend.** Every page is a static file.
- **No external requests.** No CDN fonts, no analytics, no remote images, nothing off-origin. It
  renders fully offline.
- **State lives only in `localStorage`**, namespaced `course:<slug>:v1`, and the site stays usable
  when storage is disabled, full, or corrupt.
- **Content works without JavaScript.** JS adds progress, grading and flair — never the words.

Path-independence is the one a bundler quietly breaks: Astro emits root-absolute `/_astro/…` URLs,
so the runtime and stylesheet are bundled by esbuild into `assets/site.js` and `assets/site.css` and
referenced with a prefix computed from each page's depth. Gate S2 fails on any surviving `/_astro/`
reference, so a regression is caught rather than discovered on deploy.

Content collections validate `course.json` against zod schemas at build time, so a bad answer key
fails the build naming the entry and the field rather than producing a site that grades wrongly.

The certificate states on its face that it is a **self-reported completion record** stored only in
that browser. The architecture can verify nothing, so the page never implies it does.

## Reference

| Document | Covers |
| --- | --- |
| `course-builder/references/spine.md` | picking the running example and the transformation |
| `course-builder/references/outline-contract.md` | the per-topic generation contract format |
| `course-builder/references/grounding.md` | the five-angle expedition and the `SOURCES.md` ledger |
| `course-builder/references/activity-specs.md` | per-type rules: length, structure, counts |
| `course-builder/references/project-types.md` | the 8 project types, environments, rubrics |
| `course-builder/references/quality-gates.md` | the fail-the-build checklist |
| `course-builder/references/schema.md` | the full `course.json` shape |
| `course-builder/references/runtime-setup.md` | installing Node or Bun, and when to raise it |
| `course-site/references/site-spec.md` | the design contract the template implements |
| `course-site/references/state.md` | the `localStorage` contract and every failure mode |
| `course-site/references/build-gates.md` | what each of S1–S15 means |
| `course-site/references/widgets.md` | the widget catalogue, for authors |
| `course-site/references/visuals.md` | composing diagram and infographic skills; fallbacks |
| `course-publish/references/vercel.md` | projects, production deploys, custom hostnames |

## The name

**John Witherspoon** (1723–1794) — sixth president of the College of New Jersey, delegate to the
Continental Congress, and the only active clergyman to sign the Declaration of Independence. He is
the namesake as an educator: he took over a small, indebted college in 1768 and rebuilt both what it
taught and how, and his standing rests less on any doctrine he left behind than on what his students
— James Madison and Aaron Burr among them — could afterwards go and do.

That is the standard this project borrows. A course earns its keep by what a learner can do at the
end of it; the observable objectives, the machine-checkable rubrics, and the gates all exist to keep
that claim honest rather than merely asserted.

## Licence

Copyright © 2026 Colin Mollenhour. Three licences, split along one line: **anything that can end up
inside a site you publish is permissive; everything else is copyleft.**

| Part | Licence | Why |
| --- | --- | --- |
| `course-template/` | [MIT](course-template/LICENSE) | its JS and CSS ship inside every course site you build |
| everything else — the skills, `mcp-server/`, `create-witherspoon-course/` | [GPL-3.0-or-later](LICENSE) | tooling; never embedded in your output |
| `course-from-apps-to-machines/` | CC BY 4.0 | it is course content, not software |

The practical consequence: **a course site you build and publish carries no copyleft obligation.**
The template's runtime is bundled into `assets/site.js` and `assets/site.css`, and under MIT you may
ship that anywhere, including commercially, keeping only the copyright notice.

Your course itself is never touched by any of this. Each one carries whatever licence you chose at
the interview — all rights reserved, CC BY-NC-ND 4.0, CC BY 4.0, or CC0 1.0 — recorded in its own
`course.json` and printed in the footer of every page. Generating a course with this tooling no more
licenses the course under the GPL than writing an essay in a GPL editor does.

## Sources

*From Apps to Machines* is grounded in **186 ledger rows across 41 distinct sources**, recorded in
its [`SOURCES.md`](course-from-apps-to-machines/SOURCES.md) with a verbatim quote against each claim.
The bulk are primary and normative: Microsoft Learn for the WSL and Windows paths, the RFC Editor for
HTTP and IP behaviour, Ubuntu man pages and the Open Group base specifications for shell commands,
MDN for URL and web semantics, and IANA for port registrations.

Everything else here — the quality model, the pipeline, the contract format, the gates — is our own.
