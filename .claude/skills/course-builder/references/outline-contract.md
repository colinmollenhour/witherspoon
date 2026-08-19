# Outline & topic contracts

Read at Stage 3.

The contract is the interface between the outline stage and the writing stage. Because each topic's
contract already says how that topic hands off to its neighbours, independent writers produce work
that interlocks. Get this right and parallel generation is safe; get it wrong and you get twenty-one
disconnected essays.

## Learner-facing voice

Every field below ships to the site unless noted. Write for a motivated pre-teen or teen by default —
energetic, direct, and credible — unless Stage 1 named a clearly different audience. Never childish,
slang-heavy, or patronizing. Never bureaucratic.

**Lead with capability and a real situation** (the phone fails, the folder is gone, the demo is in
six months). Do **not** lead with compliance metrics, literacy surveys, competitor audits, or
assessment bureaucracy on hero, about, unit intros, project goals, skills, or CTAs.

| Ship this | Not this |
| --- | --- |
| Start with a file you can only double-click. Finish with it loading on your phone. | Learn 18 of 20 verified behaviors against the course-defined mastery threshold. |
| Quick check: can you find home and read an `ls -la` line? | Assesses locating your home directory and knowing why the Desktop is wrong. |
| Build the folder, capture the path, notice how many clicks it cost. | State exactly where it lives, exactly what URL shows, and exactly what it cost. |
| A strong answer covers three things: … | A grader must see three things: … |
| How this works / evidence from your screen / checks | How this runs / captured evidence / grading scripts |
| People use "min" two ways. This name only means the first. | The naming is deliberate. Practitioners disagree… |
| The two policies cost the same number of trips. | Dominated rather than merely imperfect. |
| Heskett introduced the ratio in 1963. Low goes closest to the door. | Heskett, 1963 (*Journal Title* vol. 3, April, pp. 27–31). |
| The book's min/max section is blank. Here is what to do. | The canonical textbook has the same hole, empty across releases spanning 1998 to 2019. |

**Metrics stay** where the learner acts on them: command budgets, pass %, ports, sizes, weights, field
rules in `completionCriteria`. Cohort studies, librarian surveys, and competitor audits belong in
an FAQ or not at all — never on the homepage, and never as the personality of a reading.

**The page teaches; the ledger proves.** `SOURCES.md` holds verbatim quotes. Contracts hold claims,
numbers, and `[src N]` ids. Learner-facing files (`read.md`, `brief.md`, `README.md`, homepage
about, unit copy) do **not** carry `[src N]`, view-count rhetoric ("56,565 views"), or blockquotes
from researchers, librarians, or RFC preambles. Allowed on the page: an error message, a command's
own output, or a single sentence that *is* the object of study. A generation prompt that says "use
the ACRLog quotes" will put those quotes on the page — do not write that prompt.

**The page is a trainer, not a seminar.** Isolated writers with a rich ledger perform credibility:
they prosecute the textbook, survey competitors, and stack journal citations. Keep the result (the
theorem, the year of origin, the one named alternative). Cut the prosecution. Journal, volume,
issue, and page belong in `SOURCES.md`. A quoted sentence that *is* the object of study may stay;
the narrator must not then gloat over it. Titles name the thing they will do, not a profession they
are joining (*Reading a pick face*, not *Reading a pick face like an industrial engineer*).

**Sentence craft:** short and direct. One idea per sentence. One concrete payoff per paragraph.
A sentence over ~25 words is a candidate to split. A 50-word clause-stack is a defect, even when
every clause is true. British spelling in prose. Cut educational jargon (*mastery threshold*,
*observable behaviors*, *blank playbook*, *cohort*) unless the domain itself uses the term (e.g. a
real privileged-port threshold of 1024).

**Define on first use.** The first time a domain term appears, give it one short sentence. Do not
open a topic — especially Unit 1 — with a paragraph that assumes the unit's whole vocabulary. A
first-hour glossary (a small table, one sentence each) belongs in the first topic, not in the last
unit's reference card.

**Honesty has a place.** Docs-vs-code discrepancies, ungrounded published numbers, and "the page is
wrong" findings belong in an FAQ, a version appendix, or a later topic that has earned them. They
are not the personality of the first hour.

**One default dialect.** The spine names it. Topic 1 (or a short setup appendix on it) owns install
and the platform map. Every later topic writes the default only. Variants are an "On a Mac / On
Windows" box of a few lines. Restating the full three-platform table after setup is a defect.

## Course-level fields

### `subtitle`

One or two sentences. States the before→after with real numbers **and** a human payoff. Lead with
what they can do, not with a feature list.

### `about` — exactly three paragraphs

1. **Hook that corrects a misconception.** Name the belief the reader arrives with, then break it
   with the transformation numbers. Open on the situation, not on a survey of how far behind "a
   generation" is, and not by prosecuting the field.
2. **The straight-line build.** Unit by unit, in prose, ending on what they will have.
3. **Prerequisites and promise.** What they need, what they don't, and why the material is
   trustworthy.

Reference tone:

> Most people who hear 'GPU programming' assume it's for machine learning researchers or graphics
> engineers. It's not. […] you go from a single-threaded kernel that takes 75 milliseconds to a
> prefetched multi-block kernel that finishes in under 50 microseconds on an NVIDIA T4. Same math,
> same hardware, completely different result.

### `skills[]` — 4 to 6

Each is a **performance statement**, not a noun phrase — and it should sound like something a person
would say they can do, not a checklist item.

- Good: *"Tell whether a problem is a good fit for the GPU from how the work is structured."*
- Also good: *"Identify whether a given problem is a good fit for GPU acceleration based on how the
  work is structured."*
- Bad: *"GPU fundamentals."*
- Bad: *"State three conditions under which…"* when *"Name three cases where…"* says the same thing.

Format: `title` (2–4 words, scannable) + `description` (one sentence, what they can now do).

### `faqs[]` — 4 to 6

Answer objections a skeptical buyer would actually raise. At least one must be *"what makes this
different from the official docs / the free tutorial?"* and the answer must be **one specific
omission**, not a census of the market.

> **What makes this different from the NVIDIA documentation?**
> The NVIDIA docs are thorough but they don't explain why things are slow before showing you how to
> fix them.

Others worth covering: hardware/tooling needed, prerequisite depth, what the course is *not* about.
Keep answers concrete. Do not open with a multi-product survey. Do not count a vendor's course
catalogue or help topics. "A minority capability, not a unique one" is research-note hedging; if
other products already do a piece of this, name the piece in one sentence and move on.

## Units

3–6 units. Each has:

- **`title`** — names the shift in capability, not the topic area.
- **`description`** — **2–4 sentences, never one.** Where the learner is coming from, what this unit
  adds, and **it ends on the hook into the next unit.** A one-sentence description that only restates
  the title is a defect.

> "Once `add` runs on the GPU with one thread, the next step is to actually use the GPU's
> parallelism. Learn the `<<<blocks, threads>>>` execution configuration, how `threadIdx` and
> `blockDim` let each thread pick its slice of the work, and why thread blocks should be multiples
> of 32."

Each unit owns exactly one `test`, and (in `project-based`) one or more projects.

### Unit test description

`test.description` is learner-facing on the unit page and the test page. Write it as a **quick check
in second person**, not as an assessment abstract.

- Good: *"Quick check: can you launch with `<<<N,1>>>`, read the nsys summary, and say why a single
  thread is still slower than the CPU path?"*
- Bad: *"Assesses whether the learner can launch kernels, interpret profiler output, and explain…"*

Do not start with *Assesses*, *Evaluates*, *This test covers*, or *The learner will demonstrate*.
Pass score is shown separately by the site (`Pass at {passingScore}%`); you may mention it once in
the description only if you need a second emphasis — not as the lead.

## Topics

2–4 per unit. Each has a title, a description, **three learning objectives**, and a contract.

**Title** names the thing they will do or hold, not a thesis. *Where your files actually live*
beats *A tablet hides the filesystem; a dev machine hands it to you*.

**Unit 1 order** is in `spine.md` → First hour. Follow it; do not restate it here.

**Handoff is a state change.** `Leaves` must differ from `Inherits`. Equal states mean the topic
is a sidebar — fold it into the page that needs it, do not give it a quiz. The outline critic
(`outline-critic.md`) walks this before the user sees the syllabus. The interview picked a size
*band*, not a quota; do not fill 21 slots because a large option existed.

### Learning objectives — the hard part

Three per topic. Each is an **observable action with the real API, term, number, or artifact
embedded** — and the string in `learningGoals[].title` is what the site prints under **You will be
able to**. Write the assessable action in language a learner would recognize as invitation, not
audit.

| Bad (vague) | Bad (stiff but assessable) | Good (assessable and natural) |
| --- | --- | --- |
| Understand thread indexing | State the formula that yields a unique thread index | Give every thread a unique index with `blockIdx.x * blockDim.x + threadIdx.x` |
| Learn about profiling | Use `nsys` to identify Unified Memory H2D/D2H memcpy traffic | Read an nsys summary and spot Unified Memory H2D/D2H memcpy traffic |
| Know how to compile | Invoke `nvcc` to produce a runnable binary from a `.cu` file | Compile a `.cu` file with `nvcc` and run the binary |
| Understand openers | Deliver a 15-second opener containing a permission ask, without filler | Deliver a 15-second opener with a permission ask and no filler |

Prefer natural verbs (*find, open, fix, tell, map, split, build, stop*) over audit verbs (*state,
classify, demonstrate, list three things a…, identify whether*) when both stay precise.

Banned openers: *understand, learn, know, be aware of, appreciate, be familiar with, gain insight
into*. Also avoid shipping *demonstrate mastery of*, *exhibit competency in*, *achieve the threshold*.

Objectives are numbered per unit (1..N across the unit's topics) because assessments cite them by
number.

## The `_contract.md` file

One per topic. This exact shape:

```markdown
# <Topic title>

**Unit:** <N> — <unit title>
**Objectives (unit-numbered):**
1. <objective>   [obj 4]
2. <objective>   [obj 5]
3. <objective>   [obj 6]

## Topic generation prompt

<3–6 sentences. What to teach, in what order, anchored to the running example. Name the
specific numbers, listings, API calls, or figures to use — not "paste this quote" and not
"cite the 1963 paper with volume and page". State explicitly what NOT to cover because a
later topic owns it. Write the default dialect; variants are a short box, not a second
outline. Do not ask the writer to prosecute a textbook, a vendor catalogue, or "folk
wisdom".>

## Grounded facts

<Added in Stage 6, after the expedition. Every figure, API signature, and misconception this
topic may use, each with its ledger reference. Claims and numbers — not verbatim quotes to
paste. The topic agent may not introduce a number that is not listed here — see
references/grounding.md.>

- <fact> [src N]
- Teach from: <primary source>, <the specific listing / figure / table>

## Requested activities

- READ: <what it must cover, the artifact state it starts from, and what it must end by
  setting up. Length target. Name the widget type if one is earned, and any spatial
  figure. The opening is a thing they type, click, or open — not a lecture. First
  topic of the course: they touch the running example, and it ends with a first-hour
  glossary.>
- FLASHCARDS: <what to card>. <N> cards.
- QUIZ: <N> questions on <specific decisions/discriminations>.
- LECTURE: <slide count, what must be fully worked on screen>.

## Handoff

**Inherits:** <state of the running example entering this topic>
**Leaves:** <state of the running example leaving this topic>
**Do not cover:** <what belongs to a neighbouring topic>
```

### Writing a good generation prompt

Model it on the real thing:

> The learner already has `add.cu` compiling. Open on that file, not on a lecture about occupancy.
> Define `gridDim` and `blockIdx` in one sentence each the first time they appear. Cover
> `numBlocks = (N + blockSize - 1) / blockSize` and the grid-stride loop. One idea per sentence.
> Reference Figure 1 from the article. Use a `flow` widget for the launch config, not a five-column
> table. Mention that, surprisingly, this doesn't speed things up yet — that's the cliffhanger for
> Unit 3. Do NOT recap why GPUs exist; topic 1 already did.

Note what it does: names the exact identifiers, names the exact formula, points at a specific source
figure, states the emotional beat, **says what they already have in their hands**, and forbids a
recap the previous topic already taught. A prompt that only lists facts to cover produces an essay.

### Writing good activity requests

Always include counts and specifics. From a real non-technical course:

```
- READ: 5-minute pre-call routine, what to look up, the direct-dial-vs-main-line point from
  the attached Cold Calling Strategy doc, and the 'connect-rate is usually data quality'
  diagnostic.
- FLASHCARDS: Definitions and quick-recall cards: direct dial vs. main line, trigger event,
  ICP, connect rate. 8-12 cards.
- QUIZ: 5 questions on whether to dial vs. skip a lead, which data point is worth gathering,
  and what to do when only a main line is available.
```

A request like `- QUIZ: 5 questions on the topic` is a defect. Name the discriminations being tested.

## Assigning activities

- Every topic: `READ` + `QUIZ`. These are the floor.
- `FLASHCARDS` when there is vocabulary or a fixed set to recall.
- `LECTURE` for procedural/worked-example subjects — the default second activity in `academic`.
- `PODCAST`, `COMIC`, `GAME`, `JAM`, `CHAT` — at most one per unit, and only where the format
  genuinely fits. Variety for its own sake dilutes; do not sprinkle.

See `references/activity-specs.md` for each type's rules.
