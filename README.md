# education

Design notes and reference material for **`course-builder`** — a Claude Code skill that generates
complete, grounded course material.

This README captures two things: the quality model the skill targets, and the design that implements
it.

---

## 1. Where the quality model came from

It was derived by pulling apart the underlying data of professionally-generated courses across three
subject domains — a systems-programming course, a sales course, and a high-school maths course — and
asking what the good ones had in common that the mediocre ones didn't.

The answer was not format variety. Nine activity types and eight project types are table stakes and
explain nothing. What separated them was structural: a spine, traceable assessment, and an
intermediate representation between planning and writing.

Worked examples throughout this document use a GPU-programming course, because it makes the
measurements concrete. The underlying CUDA facts are from NVIDIA's public introductory material
(see §5); the course design around them is our own.

---

## 2. What makes the output good

Six traits, in rough order of leverage.

### 2.1 A running example threads the entire course

One `add()` over 1M floats, carried through all six topics and re-measured at every step:

| Stage | Time |
| --- | --- |
| CPU baseline | ~3 ms |
| `add<<<1, 1>>>` on GPU | ~75 ms *(slower — deliberately)* |
| `add<<<1, 256>>>` | 4.2 ms |
| Multi-block grid-stride | barely changes *(the cliffhanger)* |
| `cudaMemPrefetchAsync` | 47 µs |

Nothing else does as much for coherence. Activity variety is decoration on top of this.

### 2.2 Deliberate failure moments

Unit 1's project makes the GPU version *slower* than the CPU, and the course says so out loud rather
than letting the learner conclude they broke something:

> **Why is the GPU slower than the CPU here?**
> You did everything right, and the GPU version takes ~75 ms against the CPU's ~3 ms. That isn't a
> bug — it's the lesson. `<<<1, 1>>>` launches exactly one thread, so you've asked a single GPU core
> — far simpler than a CPU core — to do all 1,048,576 additions in sequence. Unit 2 fills the machine.

The wall is designed in, and the cliffhanger is written into the *unit description* so the next unit
has somewhere to land. Learners hit the problem before being handed the fix.

### 2.3 Objectives are observable actions with the real API embedded

Three per topic, numbered, no fog:

- Use `blockIdx.x * blockDim.x + threadIdx.x` to give every thread a unique index
- Write a grid-stride loop that handles arrays larger than the launch's total thread count
- Identify Unified Memory H2D/D2H traffic in an `nsys` profiler summary
- Compile a `.cu` file with `nvcc` and run the resulting binary

**Every quiz explanation cites the objective it assesses** — `(objective 2)`, `(objectives 1 and 10)`.
That traceability contract is why the assessments aren't filler: an objective with no question
covering it becomes a visible, checkable defect.

### 2.4 An intermediate representation between outline and content

Each topic carries a generation prompt that the outline stage writes *for* the writing stage, plus an
explicit activity manifest with counts:

```
Topic generation prompt: Teach scaling from one block to a full grid. Cover `gridDim.x`
and `blockIdx.x`, derive `numBlocks = (N + blockSize - 1) / blockSize`, and introduce the
grid-stride loop. Do not cover memory behaviour — Unit 3 owns it. End on the surprise:
the timing barely moves despite using all 40 SMs.
Requested activities:
- READ: Build the multi-block launch and grid-stride loop up from the single-block version
  in the previous topic. Close by setting up the memory-bottleneck question Unit 3 answers.
  ~900 words.
- QUIZ: 5 questions on block-count arithmetic, why the stride is `blockDim.x * gridDim.x`,
  and what the flat timing implies.
```

Non-technical subjects take the identical shape:

```
- READ: The 15-second opener — its three parts, the permission ask, and three weak openers
  rewritten. ~700 words.
- FLASHCARDS: Opener components and the discriminating pairs (permission ask vs. pitch,
  trigger event vs. generic hook). 10 cards.
- QUIZ: 5 questions choosing the stronger of two openers and naming what fails in the weaker.
```

**This is the mechanism that makes parallel generation coherent.** Because the outline stage already
wrote each topic's contract — including how it hands off to its neighbours — N topics can be written
by N independent workers and still interlock.

### 2.5 Projects are graded three ways at once

Every project carries all of:

- **`steps[]`** with machine-checkable `completionCriteria` — *"stdout contains `Max error: 0`"*, not
  *"student understands prefetching"*.
- **`rubric[]`** with weights summing to 100 and criteria specific enough that two graders agree:

  > **Unified Memory lifecycle** (30) — Both arrays are allocated with `cudaMallocManaged` and
  > released with `cudaFree`; no `new[]`/`delete[]` or `malloc`/`free` remains; sizes are
  > `N * sizeof(float)`.

- **`testCases[]`** with real executable code, `expectedOutput`, and a weight — including at least one
  adversarial case aimed at the plausible shortcut:

  ```cpp
  // N is deliberately not a power of two: catches a loop bound hard-coded to 1<<20
  // instead of derived from n.
  const int N = 12345;
  ```

Plus a pinned `environment`, so results are reproducible:

```json
{ "image": "nvidia/cuda:12.4.1-devel-ubuntu22.04", "gpu": "T4",
  "timeoutMs": 60000, "compileFlags": ["-O2", "-std=c++17", "-arch=sm_75"] }
```

### 2.6 Course-level framing

- **Subtitle states a concrete before→after with numbers** — *"…ending with a vector-add kernel
  running near the memory-bandwidth ceiling of the GPU you test on."*
- **`about`** is three paragraphs: a hook that corrects a misconception, the straight-line build, then
  prerequisites and the promise.
- **`skills[]`** are performance statements, not nouns — *"Decide whether a workload is worth moving
  to the GPU, based on how its work is shaped."*
- **`faqs[]`** answer real objections — *"Why not just read the official CUDA guide?"* — and the
  answer has to be specific about what the official treatment leaves out.

---

## 3. Data model reference

The course graph the skill emits. Abridged to the fields that carry pedagogical weight; the full
schema is in `references/schema.md`.

```
course
  title, slug, about, structureTemplate: "project-based" | "academic"
  skills[]        { title, description }
  faqs[]          { question, answer }
  spine           { runningExample, transformation, failureMoment }
  sources[]       { id, claim, value, source, angle }
  units[]
    title, description            # description ends on the hook into the next unit
    topics[]
      title, description
      instructions                # "Topic generation prompt: …" + "Requested activities:"
      learningGoals[]             # 3 per topic, observable, API-bearing
      activities[]                # { type, path } — the join to read.md
      flashcards[]                # { front, back }
      quiz { questions[] }        # same question shape as the unit test
    test
      title, description, passingScore
      questions[]                 # MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER
        question, options[], correctOptionIndex | correctAnswer | sampleAnswer
        graderNotes?              # SHORT_ANSWER: what full credit requires
        explanation               # MUST cite "(objective N)"
    projects[]
      path                        # the project directory — how brief.md is found
      goal, type, learningGoals[]
      config { title, description, language, instructions, starterCells[] }
      steps[]        { title, description, completionCriteria }   # machine-checkable
      rubric[]       { criterion, weight, description }           # weights sum to 100
      testCases[]    { name, code, expectedOutput, weight, description }
      environment    { image, gpu?, packages[], compileFlags[], timeoutMs }
```

**Project types** (8): `scenarios`, `coding-agents`, `spreadsheet`, `image-generation`,
`prompt-challenge`, `writing-research`, `code-notebook`, `interactive-form`.

**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),
comics, AI chat.

### `course.json` holds all the assessment data

Quizzes, flashcards and unit tests live **in the JSON**. The markdown files `quiz.md`,
`flashcards.md` and `unit-test.md` are reviewable views rendered *from* it — the same relationship
`README.md` already has to the JSON — and nothing downstream parses them back.

That direction is load-bearing. When topic quizzes existed only as prose, the site builder had to
recover each answer key from five different hand-written markdown dialects through a ranked cascade
of eight guessing strategies, including one dialect where `**Correct:** 2` meant a 1-based ordinal
and another where `**Correct option index:** 2` meant a 0-based index. A course should not infer
which answer is correct; the model that wrote the question already knew.

```bash
node course-template/tools/render-views.mjs --course <course-dir> [--check]
```

---

## 4. The `course-builder` skill

**Location:** `.claude/skills/course-builder/`

```
course-builder/
  SKILL.md                  workflow, interview, gates
  references/
    spine.md                picking the running example + measurable transformation
    outline-contract.md     the per-topic generation contract format
    grounding.md            the 5-angle research expedition + SOURCES.md ledger
    activity-specs.md       per-type rules: length, structure, counts
    project-types.md        the 8 types + environment pinning + rubric/testCase shape
    quality-gates.md        the fail-the-build checklist
    schema.md               course.json shape (section 3 above)
```

`references/` is loaded per-stage, not up front, so `SKILL.md` stays small and the interview stays
fast.

### Pipeline

1. **Scan** *(silent)* — quick orientation over the working directory and any attached sources, just
   enough to make the interview's questions informed.
2. **Interview** — a single `AskUserQuestion` turn with four questions (audience/level, feel, size,
   template), each carrying a `(Recommended)` default so "just go" is one click.
3. **Spine** *(provisional)* — pick the running example and the measurable transformation *before*
   outlining. Numbers are best-effort and marked `?` until the expedition confirms them.
4. **Outline** *(provisional)* — units, topics, three observable objectives each, `skills[]`,
   `faqs[]`, and per topic a `_contract.md`. At least one designed failure moment, with its
   cliffhanger written into the unit description.
5. **Approve** — the only gate. Approving opts into both fan-outs; after it, work runs autonomously.
6. **Grounding expedition** — active research across five angles, fanned out in parallel:
   **A1** primary source · **A2** authoritative numbers · **A3** current-state check ·
   **A4** misconception harvest · **A5** prior-art gap. Produces `SOURCES.md`, a ledger of
   claim → source → verbatim quote.
7. **Refine** — corrected numbers propagate to the spine, subtitle, and every contract; harvested
   misconceptions become distractors (and may replace the provisional failure moment); the prior-art
   gap becomes the "why this over the docs" FAQ. Ungroundable claims are cut or converted to
   method-teaching. An invalidated premise is the one finding that reopens the gate.
8. **Generate** — fan out one subagent per topic and per project, each handed only its own
   `_contract.md` and its ledger rows. The isolation is the point; the contracts are what keep
   independently-written topics interlocking. **Agents may not introduce a number absent from their
   Grounded facts block.**
9. **Verify** — the gates below.

### Quality gates (build fails on any)

- an objective with no assessment covering it
- a quiz explanation missing its `(objective N)` citation
- rubric weights that do not sum to 100
- a `completionCriteria` no machine can check
- a project with no adversarial test case
- a topic that drops the running example
- an unpinned project environment
- **a number in the content that traces to no ledger row** — fabrication, not a placeholder
- **a `SOURCES.md` row without a resolvable source**, a paraphrased "quote", or a surviving `?`

### Output layout

```
course-<slug>/
  course.json                    full course graph, importable
  README.md                      about, skills, faqs, syllabus
  SOURCES.md                     grounding ledger: claim → source → verbatim quote
  unit-1-foundations/
    topic-1-cpu-vs-gpu/
      _contract.md               generation prompt + grounded facts + Requested activities
      read.md
      flashcards.md
      quiz.md
    unit-test.md
    project-1-baseline/
      brief.md
      rubric.md
      starter/
      tests/
```

---

## 5. The `course-site` skill

**Location:** `.claude/skills/course-site/`

A separate skill, invoked by the user **after** the markdown and `course.json` have been reviewed and
approved. It turns an approved course directory into a static website at `<course-dir>/dist/` that
anyone can open from a link.

The site is built by a **shared Astro template** at `course-template/`. The skill validates the
course, plans and generates its visuals, runs the template, and checks the gates — it does not write
pages and does not write a builder.

```bash
cd course-template
npm install                                     # first run only
npm run build  -- --course ../course-<slug>     # → ../course-<slug>/dist
npm run verify -- ../course-<slug>/dist         # gates S1–S12
npm run test   -- ../course-<slug>/dist         # runtime behaviour in jsdom
```

```
course-site/                  the skill: what to build and how to check it
  SKILL.md
  references/
    visuals.md                composing tldraw-skill + infographic; budgets and fallbacks
    site-spec.md              the design contract the template implements
    state.md                  localStorage contract and every failure mode
    build-gates.md            what each of S1–S12 means

course-template/              the builder: one Astro project, every course
  src/content.config.ts       four collections, zod-validated
  src/lib/                    loaders, relative-path helper, search index, nav
  src/layouts/ components/    the pages
  src/runtime/ styles/        the TypeScript runtime and the design system
  tools/                      build · verify · test-runtime · render-views
```

Courses hold content; the template holds the site. Fixing a bug in the template fixes it for every
course, which is the whole reason it exists — the first course was built by a 673-line Python script
that lived inside that course's own directory, and would have been rewritten from scratch for the
second.

Content collections validate `course.json` against zod schemas at build time, so a bad answer key
fails the build naming the entry and the field rather than producing a site that grades wrongly.

### Constraints, all load-bearing

- **No auth, no backend.** Every page is a static file.
- **No external requests.** No CDN fonts, no analytics, no remote images, no `fetch` off-origin. It
  renders fully offline.
- **State lives only in `localStorage`**, namespaced `course:<slug>:v1`, and the site stays usable
  when storage is disabled, full, or corrupt.
- **Path-independent.** Works at a bucket root or a subpath; every URL is relative.
- **Content works without JavaScript.** JS adds progress, grading, and flair — never the words.

The last two shape the template's architecture. Astro is zero-JS by default, which gives the no-JS
baseline for free. Path-independence is the one a bundler quietly breaks: Astro emits `/_astro/…`
root-absolute URLs for anything it processes, so the runtime and stylesheet are bundled by esbuild
into `assets/site.js` and `assets/site.css` and referenced with a prefix computed from each page's
depth. Gate S2 fails on any `/_astro/` reference, so a regression is caught rather than discovered
on deploy.

### What it builds

Home with a progress ring, resume link, syllabus and FAQ · one page per topic carrying reading,
flashcards and quiz · unit tests · project pages with persisted step checklists · a printable
certificate · client-side search.

Quizzes give **immediate per-question feedback**, score first attempts only, and — because every
explanation cites `(objective N)` — report a **per-objective breakdown** of what to review. That is
the payoff of the citation contract from §2.3. Short answers are self-graded and labelled as such;
without a backend, pretending otherwise would be a lie.

A quiz passed at or above `passingScore` triggers a hand-rolled canvas confetti burst (no library,
~50 lines, suppressed under `prefers-reduced-motion`). Finishing below the threshold gets a calm
review list instead — celebrating a fail reads as mockery.

The certificate shows per-unit scores, an overall average, and the date of the last test taken. It
states on its face that it is a **self-reported completion record** stored only in that browser. The
architecture can verify nothing, so the page never implies it does.

### Images

Composed from two existing skills, each with a gotcha the reference file pins down:

- **`tldraw-skill`** → structural diagrams, exported as SVG. Probed with `command -v tldraw` first.
  Fallback is hand-authored inline SVG or a table — deliberately **not** Mermaid, which would need a
  runtime library and break the no-external-requests rule.
- **`infographic`** → unit heroes. This skill emits a **prompt file, not an image**, so it is always
  two calls: prompt, then `nano-banana` (or `codex-cli`) to render it. It must be given explicit
  scope or it goes hunting for a merge request, and `make it technical` when the course is technical,
  or its default rules strip the API names that *are* the content.

Either may fail. A missing image degrades to a styled text panel and the prompt file is kept for
later — the build never blocks on a picture.

Generated visuals are written to **`<course-dir>/assets/`** and committed with the course; the build
copies them into `dist/assets/`. Never into `dist/` itself, which is deleted and rewritten on every
run — an earlier version of the spec pointed there, so every diagram and kept prompt survived exactly
until the next build.

### Deployment

Out of scope for now. The build reports a local preview command and notes that the contents of
`dist/` can be uploaded to any static host or bucket. A CDN upload tool is left as a future addition.

---

## 6. Sources

The CUDA figures used in the worked examples above (T4 spec, the timing progression, the prefetch
speedup) come from NVIDIA's public introductory CUDA material and their T4 datasheet. Everything
else in this document — the quality model, the pipeline, the contract format, the gates — is our own.
