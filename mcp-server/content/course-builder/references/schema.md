# `course.json` schema

Written at the start of Stage 5, before fan-out, so the skeleton survives any failure. Shape derived
from real course payloads; it maps onto most LMSs.

## Structure templates

| `structureTemplate` | Shape | Use when |
| --- | --- | --- |
| `project-based` | Every unit ends in built work. Projects carry the assessment weight. | The skill is *doing* something — code, calls, spreadsheets, deployment. |
| `academic` | Lecture-and-assessment led. Projects optional or absent. | The skill is *knowing and reasoning* — math, history, theory, compliance. |

`academic` courses still need a spine and a measurable transformation; the running example becomes a
running problem, and `LECTURE` replaces projects as the second activity.

## Schema

```jsonc
{
  "title": "string",
  "slug": "kebab-case",
  "subtitle": "string — before→after with real numbers and a human payoff",
  "about": "string — exactly three paragraphs; situation-first, not survey-first",
  "structureTemplate": "project-based" | "academic",
  "license": {
    "id": "all-rights-reserved" | "cc-by-nc-nd-4.0" | "cc-by-4.0" | "cc0-1.0",
    "holder": "string | null — exact person or organization named in the notice",
    "year": "integer — copyright year"
  },
  "categories": ["string"],

  "hero": {                                   // optional; home-page artwork
    "image": "assets/img/hero.webp",          // relative to the course directory
    "width": 1600, "height": 900,             // 16:9; the site holds that ratio
    "alt": "string — describes the picture, min 20 chars"
  },
  // Visuals (course hero, unit heroes, in-reading figures) are produced by the
  // course-site skill after the markdown is approved — not here. course-builder
  // may leave hero fields null; course-site fills assets/ and these declarations.

  "skills": [
    { "title": "2-4 words", "description": "one sentence — what they can now do, natural language", "orderIndex": 0 }
  ],

  "faqs": [
    { "question": "string", "answer": "string — concrete; not a multi-product survey unless that is the point", "orderIndex": 0 }
  ],

  "spine": {
    "runningExample": "string",
    "transformation": { "before": "string", "after": "string" },
    "failureMoment": { "unit": 1, "wall": "string", "resolvedInUnit": 2 }
  },

  "sources": [                                // extension; mirrors SOURCES.md
    { "id": 1, "claim": "string", "value": "verbatim quote or exact figure",
      "source": "URL | file path | command", "angle": "A1".."A5" }
  ],
  "ungrounded": [
    { "claim": "string", "resolution": "cut" | "taught-as-method" | "flagged",
      "topic": "string | null" }
  ],

  "units": [
    {
      "title": "string — names the shift in capability",
      "description": "string — 2–4 sentences; ends on the hook into the next unit",
      "orderIndex": 0,

      // Optional. Filled by course-site when unit artwork is generated.
      // Convention fallback: assets/img/unit-<N>.webp is auto-discovered.
      "hero": {
        "image": "assets/img/unit-1.webp",
        "width": 1600, "height": 900,
        "alt": "string — describes the picture",
        "caption": "string — the takeaway; paths and commands belong here, not in the pixels"
      },

      "topics": [
        {
          "title": "string — the thing they will do or hold, not a thesis",
          "description": "string",
          "orderIndex": 0,
          "instructions": "Topic generation prompt: …\nRequested activities:\n- READ: …",
          "learningGoals": [
            { "title": "observable action + real API/term; natural learner-facing wording",
              "description": "string | null", "orderIndex": 0, "unitObjectiveNumber": 1 }
          ],
          "activities": [
            { "type": "READ" | "QUIZ" | "FLASHCARDS" | "LECTURE" | "PODCAST"
                    | "GAME" | "COMIC" | "JAM" | "CHAT",
              "path": "unit-1-foo/topic-1-bar/read.md" }
          ],

          // Assessment content lives here, in the same shape units[].test uses.
          // The markdown views (quiz.md, flashcards.md) are RENDERED FROM this —
          // nothing downstream parses them. See "Assessment data" below.
          "flashcards": [
            { "front": "string", "back": "string", "orderIndex": 0 }
          ],
          "quiz": {
            "questions": [ /* identical shape to units[].test.questions[] */ ]
          }
        }
      ],

      "test": {
        "title": "string — plain-language name of the area",
        "description": "string — second-person quick check; never starts with Assesses",
        "passingScore": 70,
        "questions": [
          {
            "question": "string — grounded in concrete specifics",
            "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
            "orderIndex": 0,
            "options": ["string"],            // MULTIPLE_CHOICE only; exactly 4
            "correctOptionIndex": 2,          // MULTIPLE_CHOICE only
            "correctAnswer": false,           // TRUE_FALSE only
            "sampleAnswer": "string",         // SHORT_ANSWER only
            "graderNotes": "string",          // SHORT_ANSWER, optional — what a
                                              // full-credit answer must cover,
                                              // learner-facing ("A strong answer
                                              // covers…"). Shown on self-mark.
            "explanation": "why right, why the tempting wrong one is wrong (objective 2, 11)"
          }
        ]
      },

      "projects": [
        {
          "title": "string",
          "goal": "build + capture/prove + why it matters next (mission voice)",
          "type": "code-notebook" | "coding-agents" | "scenarios" | "spreadsheet"
                | "writing-research" | "image-generation" | "prompt-challenge"
                | "interactive-form",
          "orderIndex": 0,
          // The project directory, relative to the course root. Required: it is
          // how brief.md, rubric.md, starter/ and tests/ are found at all.
          "path": "unit-1-foo/project-1-bar",
          "learningGoals": [ { "title": "string", "description": "string | null" } ],

          "config": {
            "title": "string",
            "description": "string — usually mirrors goal",
            "language": "cpp" | "python" | null,
            "instructions": "markdown — How this works / Your tasks / Scaffolding / Expected output / Rules",
            "starterCells": [
              { "id": "cell-reference", "type": "markdown" | "code",
                "content": "string", "readOnly": true }
            ]
          },

          "steps": [
            { "id": "step-implement", "title": "string", "description": "string",
              "completionCriteria": "machine-checkable condition (shown as You are done when:)" }
          ],

          "rubric": [
            { "criterion": "string", "weight": 30,
              "description": "specific enough that two graders agree" }
          ],

          "testCases": [
            { "name": "snake_case", "code": "string — self-contained",
              "expectedOutput": "PASS", "weight": 50,
              "description": "what it checks; adversarial: 'Catches a shortcut: …'" }
          ],

          "environment": {
            "image": "pinned:tag", "gpu": "T4" | null, "packages": ["string"],
            "compileFlags": ["string"], "timeoutMs": 60000
          }
        }
      ]
    }
  ]
}
```

## Rights metadata

`license` is required because a public course without an explicit reuse policy leaves both learners
and the owner guessing. The interview maps directly to `license.id`:

| ID | Displayed terms |
| --- | --- |
| `all-rights-reserved` | No copying, redistribution, or adaptation without permission. |
| `cc-by-nc-nd-4.0` | Attributed, noncommercial sharing; no adaptations. |
| `cc-by-4.0` | Sharing and adaptation, including commercial use, with attribution. |
| `cc0-1.0` | Rights waived where legally possible; attribution not required. |

`holder` is never inferred from a course title. Use the exact person or organization selected in the
interview, or `null`. `year` is the four-digit year in which the course is created. The site derives
the canonical Creative Commons URL and human-readable notice from the ID; do not store hand-written
license URLs or alternate labels in `course.json`.

## Assessment data

`course.json` is the **single source of truth for every quiz, flashcard deck and unit test.**
`quiz.md`, `flashcards.md` and `unit-test.md` are reviewable views rendered *from* it — exactly the
relationship `README.md` already has to the JSON. Nothing downstream parses them.

```bash
bunx witherspoon-course-template render-views --course <course-dir>           # write them
bunx witherspoon-course-template render-views --course <course-dir> --check   # assert they match
```

This is not a stylistic preference. When topic quizzes existed only as prose, the site builder had to
recover the answer key from five different hand-written markdown dialects — including one where
`**Correct:** 2` meant a 1-based ordinal and another where `**Correct option index:** 2` meant a
0-based index — through a ranked cascade of eight guessing strategies. An educational product must
not infer which answer is correct.

Emit the structured data; let the markdown be rendered.

## Invariants

- `rubric[].weight` sums to 100 per project. `testCases[].weight` sums to 100 per project.
- `learningGoals[].unitObjectiveNumber` is unique and contiguous within a unit, starting at 1.
- Every `unitObjectiveNumber` appears in at least one `explanation` citation in that unit.
- `MULTIPLE_CHOICE` has exactly 4 `options` and a valid `correctOptionIndex` — in **topic quizzes**
  as well as unit tests.
- Every topic has a non-empty `flashcards[]` and a non-empty `quiz.questions[]`.
- Every question's `explanation` carries at least one `(objective N)` citation, and every number it
  cites exists as a `unitObjectiveNumber` in that unit.
- Exactly one `test` per unit.
- Every `activities[].path` exists on disk; every content file is referenced by exactly one activity.
- Every `projects[].path` exists on disk and contains `brief.md` and `rubric.md`.
- `environment.image` carries an explicit tag — never `latest`.
- Every `sources[].id` is referenced by at least one topic's Grounded facts block.
- `ungrounded[]` is present, even if empty, and matches the **Ungrounded** section of `SOURCES.md`.
- No field anywhere contains a provisional `?` marker.

Most of these are enforced a second time by the collection schemas in
the template's `src/content.config.ts`, so a violation that slips through fails the site build
naming the entry and the field.

## `README.md` assembly

Render from `course.json`: title and subtitle → `about` → **What you'll be able to do** (`skills`) →
**Syllabus** (units, topics, objectives, projects) → **FAQ**. No content that is not in the JSON.
