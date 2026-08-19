# Learner pass

The rubric for reading a course as a first-hour learner. Two callers:

- **In-pipeline** — course-builder Stage 8, after the structural gates. Diagnose, then apply.
  The user already approved the syllabus; do not add or delete topics.
- **Invoked review** — the user already has a course and asked for it to be reviewed or refined.
  Diagnose, **stop and wait**, apply only after they say to go.

Same checklist either way. Same edit constraints. The only difference is the pause.

## Stance

Read as a first-hour learner, not as an author checking a rubric. Do not invent problems to fill a
list. Skip anything that is dense on purpose and working.

Talk to the user in ordinary sentences. They have a folder of lessons. They do not know what a
contract, a gate, or a ledger is, and a line they will read must not name one.

## Find the course

Look for a file named `course.json`. That file *is* the course. Search the working directory and
one level down. One match: use it. Several: show the titles and ask which. None: ask where the
course folder is. Stop if they cannot point at one.

Do not start a new course. Do not interview for a subject.

## What to read

1. The home copy — `about`, `skills`, the subtitle, and `README.md` if present.
2. Every Unit 1 reading, in order.
3. Every project brief (`brief.md`).
4. The start and end state of every topic (the `Inherits` / `Leaves` lines in each `_contract.md`,
   or the same idea reconstructed from the readings if a contract is missing).
5. Two later readings: one mid-course, one from the last unit.

Do not read every quiz. A quiz cannot make a bad first hour easy to start.

## Failure modes

Look for things that make the course hard to start, hard to finish, or harder than it needs to be.

| Failure | What it looks like | Smallest fix |
| --- | --- | --- |
| Lecture before touch | Topic 1 explains why the tool exists, lists non-goals, or contrasts a competitor before the learner has run, opened, or clicked the running example | Swap with the stand-it-up topic, or open on a thing they do |
| Topic does not move the spine | `Leaves` equals `Inherits` — the artifact is mentioned, not changed | Fold into a box on the page that needs it. In-pipeline: fold, do not delete the topic file. Invoked: propose the fold and wait |
| Undefined terms | A paragraph assumes the unit's whole vocabulary | One short sentence on first use. A first-hour glossary table belongs in topic 1, not in the last unit |
| Stacked opening | First sentence over ~25 words, or three new ideas before a full stop | Split the sentence |
| Ledger on the page | `[src N]`, "N,NNN views", a researcher / librarian / RFC-preamble blockquote, a grader-philosophy paragraph | Cut it. Keep error messages, a command's own output, and a single sentence that *is* the object of study. Proof stays in `SOURCES.md` |
| Platform restated | After a setup topic already owned the map, later pages re-teach all three operating systems | Write the default dialect. Variants become an "On a Mac / On Windows" box of a few lines |
| Brief is a grading manual | `brief.md` over ~1,200 words, or it teaches adversarial rationale / environment pins / how the tests parse | Move grader material into `rubric.md` / `tests/`. The brief keeps: goal, tasks, done-when, expected shape, rules |
| Widget is a wall of text | `compare` with four or more columns, or cells that are paragraphs; `anatomy` used on a system or a topology | `match`, a `flow`, or a small diagram. Spatial ideas (topology, a cut link, two timelines) need a picture, not another table |
| Honesty too early | Docs-vs-code, ungrounded published numbers, "the official page is wrong" in the first hour | Move to an FAQ or a later topic that has earned it |
| Glossary only at the end | The only definition table is in the last unit | A ten-word first-hour table in topic 1; the last unit may keep the full card |
| Seminar voice | Journal volume and page on the page; "canonical textbook"; a vendor course-catalogue count; the narrator gloating over a quote; titles that award a profession (*like an industrial engineer*); skills that say *dominated rather than merely imperfect* | Keep the result. Cut the prosecution. Citations stay in `SOURCES.md`. |

Do not hunt these as a scorecard. One real issue, named, is worth more than seven maybes.

## Finding shape

For each real issue: **where it is**, **why it costs the reader**, **the smallest fix**. Prefer a
widget or a small diagram over new prose; prefer a box or a cut over a rewrite.

End Phase 1 with a short verdict:

- what is already strong
- what to change first
- what to leave alone

**Invoked review: stop there and wait.** Applying is a separate phase.

**In-pipeline: apply immediately** after that verdict (you may put the verdict in the Stage 8
report; do not ask). Then re-run every structural check whose files you touched.

## Apply constraints

You may cut, move, or rephrase. You may collapse a platform table into a box. You may move grader
prose from a brief into the rubric.

You may **not**:

- add a number, API, version, or claim that is not already in that topic's Grounded facts or in
  `SOURCES.md`
- add or delete a topic unless the user asked to change the outline (in-pipeline: never)
- rewrite a reading from scratch when a cut or a move would do
- invent a diagram that a widget can carry
- "improve" a page by adding more explanation

After edits, if a runtime is available:

```bash
bunx witherspoon-course-template render-views --course <course-dir> --check
bunx witherspoon-course-template check-widgets --course <course-dir>
```

Then re-read `quality-gates.md` for any gate whose files changed — especially the ledger-on-the-page
check, brief length, and spine continuity.

## Second pair of eyes

The learner pass is a rubric. A second agent, who did not write the course and does not have this
checklist, will notice different things. That is the point.

**Do not answer the prompt below yourself.** Print it for the user to copy into a *new* chat with a
*different* assistant, pointed at the same course folder. Say that in ordinary words: another
reader, not another pass of the same list.

This is the last thing you say in the turn — after the verdict (invoked review) or after the
site-build offer (in-pipeline).

> Want a second opinion? Paste this into a new chat with a different assistant, pointed at the
> same course folder:

```
Read this course as if you were taking it. Start at the landing page and go as far as you need to form an opinion.
I want your take, not a checklist. What works. What doesn’t. What you’d change, and what you’d leave alone. Say why.
Don’t edit anything. Don’t hunt for problems to fill a list. If you only have three things to say, say three things.
```
