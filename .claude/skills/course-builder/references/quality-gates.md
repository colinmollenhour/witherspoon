# Quality gates

Read at Stage 6. Run every check. A failing gate blocks completion — fix it, or report it plainly as
unfixed. Do not declare the course done with a gate outstanding.

## Blocking gates

### G1 — Objective coverage

Every learning objective in a unit is assessed by at least one question in that unit's test or in one
of its topics' quizzes.

```
for each unit:
  objectives  = union of all topic objectives
  assessed    = set of objective numbers cited across quizzes + unit test
  FAIL if objectives - assessed is non-empty
```

Report the orphans by number. The usual fix is a new test question, not a deleted objective.

### G2 — Citation integrity

Every quiz and unit-test explanation ends with `(objective N)` or `(objectives N, M)`, and every cited
number exists in that unit.

Common failures: an explanation with no citation; a citation pointing at an objective from a
different unit; renumbering drift after a topic was moved.

### G3 — Rubric weights

For every project, `rubric[]` weights are integers summing to exactly 100. `testCases[]` weights sum
to 100 independently.

### G4 — Machine-checkable completion criteria

Every `completionCriteria` names an observable condition — a string in stdout, a construct present in
the source, a file that exists, a value in a field. At most one noticing step per project, and it must
be last.

Reject any criterion containing *understands*, *appreciates*, *is aware*, *reflects on*, *grasps*
unless it is that single trailing noticing step.

### G5 — Adversarial test case

Every project with `testCases[]` has at least one case whose stated purpose is catching a shortcut —
hard-coded bounds, a magic constant, an ignored input, a construct the learner skipped. Its
`description` must say what shortcut it catches.

### G6 — Spine continuity

Every topic touches the running example. For each topic, its written content must arrive at the state
its contract's `Leaves` declares, and the next topic's `Inherits` must match it.

```
for i in topics[0..n-1]:
  FAIL if topics[i].leaves != topics[i+1].inherits
  FAIL if running example absent from topics[i] content
```

A topic that genuinely does not touch the spine is mis-scoped: re-aim it or cut it.

### G7 — Environment pinned

Every project `environment` names an exact image/version tag. No `latest`, no unversioned tool, no
implicit runtime.

### G8 — Objective form

No objective begins with *understand, learn, know, be aware of, appreciate, be familiar with, gain
insight into*. Every objective names a real API, term, artifact, or number.

### G9 — Failure moment present

Exactly one or two designed failure moments exist, each with: a callout naming the surprise, a
cliffhanger in the owning unit's description, and a resolution in a **later** unit. A failure moment
resolved in the same topic is not one.

### G10 — Structural completeness

- Every `_contract.md` has content files for every activity it requested.
- Every unit has exactly one `unit-test.md`.
- `course.json` parses, and its unit/topic/project entries match the directory tree exactly.
- No file contains an unresolved placeholder — `TODO:`, `<...>`, `Lorem`, `[insert`.

### G11 — No ungrounded numbers

Every figure, version, API signature, and quoted claim in the written content appears in that topic's
**Grounded facts** block or in `SOURCES.md`.

```
for each content file:
  for each number / version / API signature in it:
    FAIL if not traceable to the topic's grounded facts or a SOURCES.md row
```

A topic agent that introduced a figure of its own has fabricated it. Cut the figure, or ground it and
add the ledger row. Excepted: arithmetic derived in-place from grounded figures, provided the
derivation is shown.

### G12 — Ledger integrity

- `SOURCES.md` exists, and every row has a resolvable source — URL, file path, or command.
- Quotes are verbatim, not paraphrased.
- The **Ungrounded** section is present, even if empty.
- No provisional `?` marker survives anywhere in the course.
- Every claim listed under **Ungrounded** was actually cut, converted to method-teaching, or flagged
  in its topic — not silently shipped.

## Advisory checks

Report these; do not block on them.

- **Distractor quality** — spot-check three multiple-choice questions. Every distractor should trace
  to a specific misconception. Filler distractors are the most common quiet quality failure.
- **Explanation depth** — explanations should address the tempting wrong answer, not only the right
  one.
- **Reading length** — flag any READ under 500 or over 1400 words.
- **Flashcard redundancy** — flag cards answerable by the same sentence, or duplicating a quiz item.
- **Activity sprawl** — flag a unit with more than one of `PODCAST`/`COMIC`/`GAME`/`JAM`.
- **Source concentration** — flag any unit whose grounded facts all trace to a single ledger row. Thin
  grounding usually means that unit was written from recall with one citation bolted on.
- **Stale-risk claims** — flag anything version-sensitive that A3 did not explicitly confirm.

## Completion report

After fixing, report:

```
Built: <N> units · <N> topics · <N> projects · <N> assessment items
Spine: <running example> — <before> → <after>
Grounding: <N> sources · <N> ledger rows · <N> ungrounded claims cut
  Corrected by research: <what the expedition changed>
Failure moment: Unit <N> (<the wall>), resolved Unit <M>
Assumed: <anything decided without asking>
Gates: <all passed | list of what needed fixing | list of what still fails>
```

State unfixed gates explicitly. A course reported as complete with a silent gate failure is worse
than one reported as incomplete.
