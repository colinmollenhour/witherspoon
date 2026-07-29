---
name: course-builder
description: Generate complete course material — units, topics, learning objectives, readings, flashcards, quizzes, unit tests, and graded hands-on projects — from a topic description or from source documents. Researches and grounds the material against real sources before writing. Use when the user asks to build, create, or generate a course, curriculum, training program, syllabus, onboarding track, or lesson sequence. Outputs a reviewable markdown tree plus an importable course.json.
---

# Course Builder

Build a complete course that holds together and is true. Two failure modes this skill exists to
prevent: a pile of individually-plausible topics that share no spine, and confident material built
from recall rather than from sources.

## Deliverable

```
course-<slug>/
  course.json                    full course graph, importable
  README.md                      about, skills, faqs, syllabus
  SOURCES.md                     the grounding ledger — claim → source → verbatim quote
  unit-N-<slug>/
    topic-N-<slug>/
      _contract.md               generation prompt + grounded facts + Requested activities
      read.md  flashcards.md  quiz.md  [lecture.md ...]
    unit-test.md
    project-N-<slug>/
      brief.md  rubric.md  starter/  tests/
```

Write into the user's working directory unless they name a path.

## Non-negotiables

These are the quality bar. Do not proceed past a stage that violates one.

1. **One running example threads the whole course.** The same artifact is carried, modified, and
   re-measured in every unit. Pick it in Stage 2, before outlining.
2. **The transformation is measurable.** The subtitle states a concrete before→after with real
   numbers. If you cannot name the numbers, you do not understand the course yet.
3. **Every load-bearing number, API, and claim traces to `SOURCES.md`.** Nothing is written from
   recall alone. An ungrounded figure is a defect, not a placeholder.
4. **Objectives are observable actions with the real API, term, or artifact embedded.** Three per
   topic. "Understand X" is a defect; "Use `X` to do Y" is an objective.
5. **Every objective is assessed, and every assessment cites its objective.** Quiz and test
   explanations end with `(objective N)` or `(objectives N, M)`.
6. **At least one designed failure moment.** The learner hits a wall before being handed the fix, and
   the cliffhanger is written into the unit description so the next unit has somewhere to land.
7. **Project grading is machine-checkable.** `completionCriteria` a script can evaluate, rubric
   weights summing to 100, at least one adversarial test case, a pinned environment.

## Pipeline

### Stage 0 — Scan (silent, fast)

Search the working directory and any attached or referenced sources for material to build on: docs,
transcripts, specs, existing curricula, code. This is a quick orientation to make Stage 1's questions
informed — the real research happens in Stage 5.

Do not narrate beyond a single line.

### Stage 1 — Interview

**One `AskUserQuestion` call. Four questions. Every question carries a `(Recommended)` default so
"take all the defaults" is one interaction.** Infer defaults from Stage 0 and from anything the user
already said — do not ask what they have already told you; drop that question and keep the rest.

| Header | Question | Options |
| --- | --- | --- |
| Audience | Who is this for, and at what level? | Inferred band `(Recommended)` · two other plausible bands |
| Feel | How should the course feel? | Hands-on projects · Reading + assessment · Mixed |
| Size | How big? | ~3 units / 6 topics · ~6 units / 21 topics · Compact single unit |
| Template | Structure? | `project-based` · `academic` |

`project-based` = every unit ends in built work. `academic` = lecture-and-assessment led, projects
optional. See `references/schema.md`.

Never ask a second interview round. If something is still ambiguous after this, decide it, state the
assumption in one line at the approval gate, and move on.

### Stage 2 — Spine (provisional)

**Read `references/spine.md`.** Produce, before any outline:

- the running example (one concrete artifact)
- the measurable transformation (before number → after number)
- the designed failure moment (which unit, what wall, what cliffhanger)
- the title and the subtitle stating the transformation

Numbers here are provisional — best-effort from what you know, to be confirmed or corrected in
Stage 5. Mark any figure you are not certain of with `?`.

If you cannot fill all four slots even provisionally, the course concept is not ready. Reshape it
until you can.

### Stage 3 — Outline (provisional)

**Read `references/outline-contract.md`.** Produce the full outline in context — do not write files
yet: `about`, `skills[]`, `faqs[]`, units, topics with three objectives each and a full
`_contract.md` body, plus unit tests and projects assigned to units.

Every topic's contract must be self-sufficient: a writer who sees only that contract must produce
something that interlocks with its neighbours.

### Stage 4 — Approve

Present the outline as a compact syllabus: title, subtitle, the transformation numbers (marked where
provisional), the failure moment, and the unit/topic tree. Then state exactly:

> Approve and I'll ground this against real sources — **M** research agents confirming the numbers,
> APIs, and misconceptions — then build with **N** topic and project agents. Tell me what to change
> instead, if you'd rather.

Approving is the user's opt-in to both fan-outs. Do not spawn agents before it. This is the only
approval gate — after it, work autonomously through to the report.

### Stage 5 — Grounding expedition

**Read `references/grounding.md`.** This is active research, not a recall check.

If the search tools are not already loaded, fetch them first — `ToolSearch("select:WebSearch,WebFetch")`
— and discover any project-specific search tools the same way.

Fan out research agents across the angles in `references/grounding.md`: primary source, authoritative
numbers, current-state check, misconception harvest, and prior-art gap. Each returns findings as
ledger rows, not prose.

Write `SOURCES.md`. Every row: the claim, the source URL or file path, and the **verbatim** quote or
figure that supports it.

### Stage 6 — Refine

Apply the findings, per the rules in `references/grounding.md`:

- **Numbers corrected** → update the spine, the subtitle, and every contract that cites them.
- **API or version drifted** → update every affected objective and contract.
- **Misconceptions harvested** → wire them into distractors, and into the failure moment if one lands
  better than the provisional choice.
- **Prior-art gap found** → it becomes the "why this over the official docs" FAQ answer.
- **Premise invalidated** → stop and tell the user. This is the one thing that reopens the gate.
- **A claim that could not be grounded** → cut it, or rewrite the topic to teach the method for
  finding it. Never ship it unmarked.

Report the refinement in two or three lines — what changed and why — then continue without asking.

### Stage 7 — Generate

Write `course.json`, `README.md`, `SOURCES.md`, and every `_contract.md` to disk **first**, so the
skeleton survives any failure.

Then fan out: **one subagent per topic, one per project**, in parallel batches. Each agent receives:

- its own `_contract.md` (the whole contract, verbatim, including its grounded facts)
- the spine block from Stage 2, as refined
- the relevant reference file — `references/activity-specs.md` for topics,
  `references/project-types.md` for projects
- the `SOURCES.md` rows relevant to its topic
- its output paths

Agents do not talk to each other and do not read sibling topics. The contract is the interface. Tell
each agent its final message is a one-line status, not a summary of what it wrote, and that it must
not introduce a number absent from its grounded facts.

A topic agent writes `read.md` as prose — including any ```` ```widget ```` blocks its reading earns,
per `references/activity-specs.md` — and returns its **quiz and flashcards as structured data**,
which you merge into that topic's `quiz.questions[]` and `flashcards[]` in `course.json`. Set
`projects[].path` for every project. Then render the reviewable markdown views:

```bash
node course-template/tools/render-views.mjs --course <course-dir>
```

`quiz.md`, `flashcards.md` and `unit-test.md` are generated from the JSON, the way `README.md`
already is. Nothing downstream parses them, so the answer key is never inferred.

If a topic agent fails, re-run that one topic. Never leave a contract without content.

### Stage 8 — Verify

**Read `references/quality-gates.md` and run every check.** Fix what fails, then report:

- what was built (units, topics, projects, question count)
- the transformation numbers, and what grounding changed
- anything you assumed
- any gate that needed a fix

Report honestly. If a gate still fails, say so plainly rather than declaring completion.

Then offer the handoff, once, in one line:

> Review the markdown and `course.json`. When you're happy with them, run `course-site` to build a
> shareable interactive website into `dist/` using the shared template in `course-template/`.

Do not run `course-site` yourself. It is a separate skill, invoked after the user has approved the
material.

## Notes

- Prefer fewer, deeper topics over more, thinner ones. Three real objectives beat eight vague ones.
- Non-technical subjects get the identical treatment: the running example becomes a running scenario
  (one prospect, one patient, one case file), the measurable transformation becomes a rubric score or
  a rate, and grounding targets published rates, standards, and case material.
- The expedition is where fabrication gets caught. Treat a number you "remember" as unverified until
  a ledger row backs it.
