---
name: course-builder
description: Generate complete course material — units, topics, learning objectives, readings, flashcards, quizzes, unit tests, and graded hands-on projects — from a topic description or from source documents. Researches and grounds the material against real sources before writing. Use when the user asks to build, create, or generate a course, curriculum, training program, syllabus, onboarding track, or lesson sequence. Do not use when they already have a course directory and want it reviewed, refined, or made easier to follow — that is course-review. Outputs a reviewable markdown tree plus an importable course.json.
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

If the user already has a course directory and wants it reviewed, refined, or made easier to
follow, **stop this pipeline**. That is the review path — a skill named `course-review`, or the
`witherspoon_review_course` tool — not a new build.

## Non-negotiables

These are the quality bar. Do not proceed past a stage that violates one.

1. **One running example threads the whole course.** The same artifact is carried, modified, and
   re-measured in every unit. Pick it in Stage 2, before outlining. A topic that only *mentions*
   the artifact has failed — its leaving state must differ from the one it inherited.
2. **The transformation is measurable, and the pitch sells the power.** The spine states a concrete
   before→after with real numbers — if you cannot name the numbers, you do not understand the course
   yet. The title and subtitle sell what the learner *becomes* and must survive the skeptic's shrug
   ("I can already do that with an app"); numbers appear in the pitch only when the number itself is
   the impressive thing (spine.md §4).
3. **Every load-bearing number, API, and claim traces to `SOURCES.md`.** Nothing is written from
   recall alone. An ungrounded figure is a defect, not a placeholder. The ledger stays in
   `SOURCES.md`; the page teaches the claim. `[src N]`, researcher quotes, and journal citations
   do not ship in learner-facing files.
4. **Objectives are observable actions with the real API, term, or artifact embedded.** Three per
   topic. "Understand X" is a defect; "Use `X` to do Y" is an objective. The string that ships to the
   learner is that action in natural language — not checklist-speak (see learner-facing voice below).
5. **Every objective is assessed, and every assessment cites its objective.** Quiz and test
   explanations end with `(objective N)` or `(objectives N, M)`.
6. **At least one designed failure moment.** The learner hits a wall before being handed the fix, and
   the cliffhanger is written into the unit description so the next unit has somewhere to land.
7. **Project grading is machine-checkable.** `completionCriteria` a script can evaluate, rubric
   weights summing to 100, at least one adversarial test case, a pinned environment.
8. **Learner-facing voice is energetic, direct, and credible.** Hero copy, about, unit descriptions,
    project goals, skills, and readings lead with capability and real situations — not compliance
    metrics, literacy surveys, assessment bureaucracy, or a seminar proving it has read the
    literature. Short sentences. Age-appropriate without sounding childish, slangy, or patronizing.
    Exact numbers stay where the learner needs them for instructions, scoring, or transparency.
    Journal citations and competitor catalogues stay in `SOURCES.md`.
9. **The first hour is a thing they do, not a lecture they survive.** Topic 1 puts the running
   example in the learner's hands before any design-rationale or "why this tool" topic. Details:
   `references/spine.md` → First hour.

**References.** Each stage below names a reference document. Load it at the moment that stage calls
for it — from `references/<name>.md` beside this file, or by fetching `<name>` through a reference
tool such as `witherspoon_reference`. One at a time, never all up front; the split exists to keep
each stage's context small.

## Pipeline

### Stage 0 — Scan (silent, fast)

Search the working directory and any attached or referenced sources for material to build on: docs,
transcripts, specs, existing curricula, code. This is a quick orientation to make Stage 1's questions
informed — the real research happens in Stage 5.

Also probe for a JavaScript runtime, silently:

```bash
node --version 2>/dev/null || bun --version 2>/dev/null || echo MISSING
```

Node 20.19+ (or 22.13+, or 24+) or Bun 1.1+ is enough; either alone builds the whole site, and npm is as well supported as bun. Record the result and say
nothing about it now. Only the website needs a runtime — the material does not — so this must not
become a prerequisite. If it is missing you will raise it once, at the Stage 4 gate, where the user
can install it during the long autonomous stretch that follows. See `references/runtime-setup.md`.

Do not narrate beyond a single line.

### Stage 1 — Interview

**All six questions in one batched multiple-choice turn** — `AskUserQuestion`, or whatever your
harness calls its equivalent; if it has none, ask them as one numbered list in a single message.
**Every question carries a `(Recommended)` default so "take all the defaults" is one interaction.**
Infer defaults from Stage 0 and from anything the user already said — do not ask what they have
already told you; drop that question and keep the rest.

| Header | Question | Options |
| --- | --- | --- |
| Audience | Who is this for, and at what level? | Inferred band `(Recommended)` · two other plausible bands |
| Feel | How should the course feel? | Hands-on projects · Reading + assessment · Mixed |
| Size | How big? | ~3 units / 6–10 topics `(Recommended)` · ~6 units / 12–16 topics · Compact single unit |
| Template | Structure? | `project-based` · `academic` |
| Rights | How may other people use this course? | All rights reserved · CC BY-NC-ND 4.0 · CC BY 4.0 · CC0 1.0 |
| Holder | Who should the copyright notice name? | Reliably inferred person/organization `(Recommended)` · No named holder · exact name under Other |

Explain the rights choices in the option descriptions:

- **All rights reserved** (`all-rights-reserved`) — no copying, redistribution, or adaptation without
  permission. Recommend this when the user wants tight control or has expressed no reuse preference.
- **CC BY-NC-ND 4.0** (`cc-by-nc-nd-4.0`) — attributed, noncommercial sharing is allowed; adaptations
  are not.
- **CC BY 4.0** (`cc-by-4.0`) — sharing and adaptation, including commercial use, with attribution.
- **CC0 1.0** (`cc0-1.0`) — maximum openness; waive rights where legally possible and do not require
  attribution.

For Holder, use a person or organization only when the request or local project metadata identifies
it reliably. Otherwise recommend **No named holder** and tell the user to enter the exact legal name
under Other if they want one. Set `license.year` to the current year. Do not invent a holder or give
legal advice; describe what each standardized choice permits.

`project-based` = every unit ends in built work. `academic` = lecture-and-assessment led, projects
optional. See `references/schema.md`.

The size question is a **band**, not a quota. Recommend 6–10 topics unless the running example
clearly has more state-changes than that. The large band is allowed only when every topic can
write a different one-line artifact state; the outline critic will cut down to that. Do not offer
21 topics as a target.

Never ask a second interview round. If something is still ambiguous after this, decide it, state the
assumption in one line at the approval gate, and move on. Licensing and holder are never assumptions:
the interview answer is copied exactly into `course.json`.

### Stage 2 — Spine (provisional)

**Read `references/spine.md`.** Produce, before any outline:

- the running example (one concrete artifact)
- the measurable transformation (before number → after number)
- the designed failure moment (which unit, what wall, what cliffhanger)
- the default dialect and which topic owns the platform map
- the title and the subtitle — drafted as candidates and passed through the skeptic test in
  spine.md §4, not taken as the first idea

Numbers here are provisional — best-effort from what you know, to be confirmed or corrected in
Stage 5. Mark any figure you are not certain of with `?`.

If you cannot fill the running example, the transformation, the failure moment, and the default
dialect even provisionally, the course concept is not ready. Reshape it until you can.

### Stage 3 — Outline (provisional), then criticise it

**Read `references/outline-contract.md`.** Produce the full outline in context — do not write files
yet: `about`, `skills[]`, `faqs[]`, units, topics with three objectives each and a full
`_contract.md` body, plus unit tests and projects assigned to units.

Every topic's contract must be self-sufficient: a writer who sees only that contract must produce
something that interlocks with its neighbours.

**Then read `references/outline-critic.md` and run the critic before Stage 4.** Spawn one agent that
did not write the contracts. It may only cut, merge, reorder, and rewrite contracts — it may not
add topics or change the spine. Replace your outline with its result. Do not present the first
draft. If you cannot spawn, do a distinct critic pass yourself: list the satellites, cut them,
then continue.

### Stage 4 — Approve

Present the **criticised** outline as a compact syllabus: title and subtitle (with the runner-up
title in one line, so redirecting the pitch costs the user one word), the transformation
numbers (marked where provisional), the failure moment, the default dialect, the selected license
and copyright holder, and the unit/topic tree. In one line, say what the critic cut and why. Then
state exactly:

> Approve and I'll ground this against real sources — **M** research agents confirming the numbers,
> APIs, and misconceptions — then build with **N** topic and project agents. Tell me what to change
> instead, if you'd rather.

Approving is the user's opt-in to both fan-outs. Do not spawn agents before it. This is the only
approval gate — after it, work autonomously through to the report.

**If Stage 0's probe found no runtime, append the install block here** — read
`references/runtime-setup.md` and give the commands for the user's platform, framed as something to
do *while* the course builds and explicitly not blocking:

> While that runs, install a runtime so the website can be built at the end — about a minute, and
> nothing here waits on it.

This is the only moment the user is guaranteed present and about to reply, and grounding plus one
agent per topic and project runs long enough to cover the install. Do not raise it before this point,
and do not hold the pipeline for it. If the probe found a runtime, say nothing.

### Stage 5 — Grounding expedition

**Read `references/grounding.md`.** This is active research, not a recall check.

You need web search and web fetch for this stage. If your harness loads tools on demand, load them
first — in Claude Code, `ToolSearch("select:WebSearch,WebFetch")` — and discover any
project-specific search tools the same way.

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
- **Prior-art gap found** → it becomes the "why this over the official docs" FAQ as one
  specific omission, not a vendor survey.
- **Premise invalidated** → stop and tell the user. This is the one thing that reopens the gate.
- **A claim that could not be grounded** → cut it, or rewrite the topic to teach the method for
  finding it. Never ship it unmarked.

Report the refinement in two or three lines — what changed and why — then continue without asking.

### Stage 7 — Generate

Write `course.json`—including the selected `license` object—plus `README.md`, `SOURCES.md`, and every
`_contract.md` to disk **first**, so the skeleton survives any failure.

Then fan out: **one subagent per topic, one per project**, in parallel batches. Each agent receives:

- its own `_contract.md` (the whole contract, verbatim, including its grounded facts)
- the spine block from Stage 2, as refined
- the relevant reference file — `references/activity-specs.md` for topics,
  `references/project-types.md` for projects
- the `SOURCES.md` rows relevant to its topic
- its output paths

If your harness cannot run agents in parallel, run the same contracts one at a time — the isolation
is what matters, the concurrency is only speed.

Agents do not talk to each other and do not read sibling topics. The contract is the interface. Tell
each agent its final message is a one-line status, not a summary of what it wrote, and that it must
not introduce a number absent from its grounded facts, must write the default dialect only, and
must not put `[src N]`, journal citations, or literature combat on the page.

A topic agent writes `read.md` as prose — including any ```` ```widget ```` blocks its reading earns,
per `references/activity-specs.md` — and returns its **quiz and flashcards as structured data**,
which you merge into that topic's `quiz.questions[]` and `flashcards[]` in `course.json`. Set
`projects[].path` for every project. Then render the reviewable markdown views:

```bash
bunx witherspoon-course-template render-views --course <course-dir>
# or, with npm:  npx witherspoon-course-template render-views --course <course-dir>
```

`quiz.md`, `flashcards.md` and `unit-test.md` are generated from the JSON, the way `README.md`
already is. Nothing downstream parses them, so the answer key is never inferred.

This is the one step in Stage 7 that needs a runtime. Re-probe first; by now the user has usually
installed one during the fan-out. If there still is none, skip it, note that the markdown views will
be rendered at the site stage, and continue — `course.json` already holds every answer key.
**Never hand-write these three files.** They are generated output, and a hand-written view is exactly
the ambiguity this direction retires.

If a topic agent fails, re-run that one topic. Never leave a contract without content.

**Workspace provenance README (non-negotiable).** After the course tree is on disk, if the working
directory that **contains** `course-<slug>/` has no `README.md`, write a short provenance README
there: who created it, when (UTC `YYYY-MM-DD`), why, and that it was made with
[Witherspoon](https://github.com/colinmollenhour/witherspoon). Pull who from the interview /
`license.holder` (fallback `unknown`) and why from the course title + subtitle. Never overwrite an
existing workspace README. Never put this *inside* `course-<slug>/` in place of the course README
(about / syllabus) that Stage 7 already writes.

### Stage 8 — Verify, then the learner pass

**Read `references/quality-gates.md` and run every blocking check.** Fix what fails.

**Then read `references/learner-pass.md` and run the learner pass.** Spawn one editor that did not
write the topics. This is the in-pipeline caller: diagnose, then apply — no second user gate. The
user approved the syllabus, not the essays. The editor may cut, move, or rephrase; it may not add
facts or change the syllabus. Re-run every gate whose files it touched.

Then report:

- what was built (units, topics, projects, question count)
- the transformation numbers, and what grounding changed
- what the outline critic cut, and what the learner pass changed
- the selected license, copyright year, and named holder (or explicitly no named holder)
- anything you assumed
- any gate that needed a fix

Report honestly. If a gate still fails, say so plainly rather than declaring completion.

Then offer the handoff, once, in one line:

> Review the markdown and `course.json`. When you're happy with them, say so and I'll build the
> shareable interactive website into `dist/` — that step also plans and generates unit heroes,
> optional course artwork, and any diagrams the readings earn.

**Address the user, not the machinery.** Do not name a skill or a tool in that sentence: the reader
has no way to run either, and telling them to "run `course-site`" is an instruction they cannot
follow. Whether the next stage arrives as a skill named `course-site` or as a `witherspoon_build_site`
tool call is yours to know and theirs to be spared.

Then end the turn with the **Second pair of eyes** prompt from `learner-pass.md`. Print it for them
to copy. Do not answer it yourself.

Do not start it yourself. It is a separate stage that runs only after the user has approved the
material. **Do not generate site artwork here** either: images live under `assets/`, are wiped out of
`dist/` on every rebuild, and only become part of the product when the site stage wires them through
`course.json` and the template. Leaving hero fields empty is correct; filling them without the site
pipeline is how visuals get orphaned.

## Notes

- Prefer fewer, deeper topics over more, thinner ones. Three real objectives beat eight vague ones.
  The critic and G6 (`Leaves` ≠ `Inherits`) are how that preference becomes a check, not a wish.
- Non-technical subjects get the identical treatment: the running example becomes a running scenario
  (one prospect, one patient, one case file), the measurable transformation becomes a rubric score or
  a rate, and grounding targets published rates, standards, and case material.
- The expedition is where fabrication gets caught. Treat a number you "remember" as unverified until
  a ledger row backs it.
- **Assessability is for the author and the grader; the page is for the learner.** Keep machine-checkable
  criteria, `(objective N)` citations, and adversarial tests. Do not paste "Assesses whether…",
  "A grader must see…", "course-defined mastery threshold", or "state exactly… exactly… exactly…" onto
  surfaces the learner reads first. Do not paste a literature review either. Full voice rules live
  in `references/outline-contract.md`.
