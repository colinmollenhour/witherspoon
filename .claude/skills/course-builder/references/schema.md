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
  "subtitle": "string — states the before→after with real numbers",
  "about": "string — exactly three paragraphs",
  "structureTemplate": "project-based" | "academic",
  "categories": ["string"],

  "skills": [
    { "title": "2-4 words", "description": "one sentence — a performance statement", "orderIndex": 0 }
  ],

  "faqs": [
    { "question": "string", "answer": "string", "orderIndex": 0 }
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
      "description": "string — ends on the hook into the next unit",
      "orderIndex": 0,

      "topics": [
        {
          "title": "string",
          "description": "string",
          "orderIndex": 0,
          "instructions": "Topic generation prompt: …\nRequested activities:\n- READ: …",
          "learningGoals": [
            { "title": "observable action with the real API/term embedded",
              "description": "string | null", "orderIndex": 0, "unitObjectiveNumber": 1 }
          ],
          "activities": [
            { "type": "READ" | "QUIZ" | "FLASHCARDS" | "LECTURE" | "PODCAST"
                    | "GAME" | "COMIC" | "JAM" | "CHAT",
              "path": "unit-1-foo/topic-1-bar/read.md" }
          ]
        }
      ],

      "test": {
        "title": "string — names the assessed area",
        "description": "string — what it assesses",
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
            "explanation": "why right, why the tempting wrong one is wrong (objective 2, 11)"
          }
        ]
      },

      "projects": [
        {
          "title": "string",
          "goal": "one sentence — the outcome in the learner's terms",
          "type": "code-notebook" | "coding-agents" | "scenarios" | "spreadsheet"
                | "writing-research" | "image-generation" | "prompt-challenge"
                | "interactive-form",
          "orderIndex": 0,
          "learningGoals": [ { "title": "string", "description": "string | null" } ],

          "config": {
            "title": "string",
            "description": "string",
            "language": "cpp" | "python" | null,
            "instructions": "markdown — How this runs / Your tasks / Scaffolding / Expected output / Rules",
            "starterCells": [
              { "id": "cell-reference", "type": "markdown" | "code",
                "content": "string", "readOnly": true }
            ]
          },

          "steps": [
            { "id": "step-implement", "title": "string", "description": "string",
              "completionCriteria": "machine-checkable condition" }
          ],

          "rubric": [
            { "criterion": "string", "weight": 30,
              "description": "specific enough that two graders agree" }
          ],

          "testCases": [
            { "name": "snake_case", "code": "string — self-contained",
              "expectedOutput": "PASS", "weight": 50,
              "description": "what it verifies; for the adversarial case, what shortcut it catches" }
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

## Invariants

- `rubric[].weight` sums to 100 per project. `testCases[].weight` sums to 100 per project.
- `learningGoals[].unitObjectiveNumber` is unique and contiguous within a unit, starting at 1.
- Every `unitObjectiveNumber` appears in at least one `explanation` citation in that unit.
- `MULTIPLE_CHOICE` has exactly 4 `options` and a valid `correctOptionIndex`.
- Exactly one `test` per unit.
- Every `activities[].path` exists on disk; every content file is referenced by exactly one activity.
- `environment.image` carries an explicit tag — never `latest`.
- Every `sources[].id` is referenced by at least one topic's Grounded facts block.
- `ungrounded[]` is present, even if empty, and matches the **Ungrounded** section of `SOURCES.md`.
- No field anywhere contains a provisional `?` marker.

## `README.md` assembly

Render from `course.json`: title and subtitle → `about` → **What you'll be able to do** (`skills`) →
**Syllabus** (units, topics, objectives, projects) → **FAQ**. No content that is not in the JSON.
