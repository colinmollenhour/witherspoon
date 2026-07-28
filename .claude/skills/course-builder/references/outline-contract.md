# Outline & topic contracts

Read at Stage 3.

The contract is the interface between the outline stage and the writing stage. Because each topic's
contract already says how that topic hands off to its neighbours, independent writers produce work
that interlocks. Get this right and parallel generation is safe; get it wrong and you get twenty-one
disconnected essays.

## Course-level fields

### `about` — exactly three paragraphs

1. **Hook that corrects a misconception.** Name the belief the reader arrives with, then break it
   with the transformation numbers.
2. **The straight-line build.** Unit by unit, in prose, ending on what they will have.
3. **Prerequisites and promise.** What they need, what they don't, and why the material is
   trustworthy.

Reference tone:

> Most people who hear 'GPU programming' assume it's for machine learning researchers or graphics
> engineers. It's not. […] you go from a single-threaded kernel that takes 75 milliseconds to a
> prefetched multi-block kernel that finishes in under 50 microseconds on an NVIDIA T4. Same math,
> same hardware, completely different result.

### `skills[]` — 4 to 6

Each is a **performance statement**, not a noun phrase.

- Good: *"Identify whether a given problem is a good fit for GPU acceleration based on how the work
  is structured."*
- Bad: *"GPU fundamentals."*

Format: `title` (2–4 words, scannable) + `description` (one sentence, what they can now do).

### `faqs[]` — 4 to 6

Answer objections a skeptical buyer would actually raise. At least one must be *"what makes this
different from the official docs / the free tutorial?"* and the answer must be specific.

> **What makes this different from the NVIDIA documentation?**
> The NVIDIA docs are thorough but they don't explain why things are slow before showing you how to
> fix them.

Others worth covering: hardware/tooling needed, prerequisite depth, what the course is *not* about.

## Units

3–6 units. Each has:

- **`title`** — names the shift in capability, not the topic area.
- **`description`** — 2–4 sentences. Where the learner is coming from, what this unit adds, and
  **it ends on the hook into the next unit.**

> "Once `add` runs on the GPU with one thread, the next step is to actually use the GPU's
> parallelism. Learn the `<<<blocks, threads>>>` execution configuration, how `threadIdx` and
> `blockDim` let each thread pick its slice of the work, and why thread blocks should be multiples
> of 32."

Each unit owns exactly one `test`, and (in `project-based`) one or more projects.

## Topics

2–4 per unit. Each has a title, a description, **three learning objectives**, and a contract.

### Learning objectives — the hard part

Three per topic. Each is an **observable action with the real API, term, number, or artifact
embedded**.

| Bad | Good |
| --- | --- |
| Understand thread indexing | Use `blockIdx.x * blockDim.x + threadIdx.x` to give every thread in the grid a unique index |
| Learn about profiling | Read an nsys profiler summary and identify Unified Memory H2D/D2H memcpy traffic |
| Know how to compile | Compile a `.cu` file with `nvcc` and run the resulting binary |
| Understand openers | Deliver a 15-second opener containing a permission ask, without filler |

Banned openers: *understand, learn, know, be aware of, appreciate, be familiar with, gain insight
into*.

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
specific numbers, listings, API calls, or source passages to use. State explicitly what NOT
to cover because a later topic owns it.>

## Grounded facts

<Added in Stage 6, after the expedition. Every figure, API signature, and misconception this
topic may use, each with its ledger reference. The topic agent may not introduce a number
that is not listed here — see references/grounding.md.>

- <fact> [src N]
- Teach from: <primary source>, <the specific listing / figure / table>

## Requested activities

- READ: <what it must cover, the artifact state it starts from, and what it must end by
  setting up. Length target.>
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

> Explain how to scale to multiple thread blocks. Cover `gridDim.x` and `blockIdx.x`, compute
> `numBlocks = (N + blockSize - 1) / blockSize`, and present the grid-stride loop pattern. Reference
> Figure 1 from the article. Mention that, surprisingly, this doesn't speed things up yet — that's
> the cliffhanger for Unit 3.

Note what it does: names the exact identifiers, names the exact formula, points at a specific source
figure, and states the emotional beat the topic must land. That last clause is what makes the
independently-written topic connect to Unit 3.

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
