# State

Read at Stage 4. `site.js` already implements all of this — this file explains the contract so you
can wire pages to it correctly and so the gates can be checked.

There is no server. `localStorage` is the entire persistence layer, and it is allowed to be missing,
full, corrupt, or shared across tabs. Every one of those cases has to be survivable.

## Key and shape

One key per course: `course:<slug>:v1`. One JSON blob:

```json
{
  "v": 1,
  "name": null,
  "theme": "light",
  "lastVisited": "unit-1/topic-2.html",
  "topics": {
    "u1t1": { "read": true, "readAt": 1753600000000,
              "quiz": { "answers": [2, true, 0, null, null],
                        "score": 4, "total": 5, "at": 1753600000000, "missed": [2] } }
  },
  "tests": {
    "u1": { "answers": [1, 3, 0, 2, true, 1, 0, 3, 2, 1],
            "score": 8, "total": 10, "at": 1753600000000, "missed": [3, 7] }
  },
  "projects": { "u1p1": { "steps": [true, false, false] } }
}
```

Rules:

- **Namespaced by slug**, so two courses on the same host never collide.
- **`v` is the schema version.** A blob with a different `v` is migrated if a migration exists, and
  otherwise discarded with a one-time notice — never read as if it matched.
- **`answers[]` is one entry per question** — the chosen option index for `MULTIPLE_CHOICE` and
  `TRUE_FALSE`, the self-mark for `SHORT_ANSWER`, `null` for not yet answered. It is written on
  **every** answer, not at the end, so a quiz abandoned half way comes back answered and a finished
  one comes back showing what was actually chosen. Storing only the final score meant a refresh
  re-rendered the quiz blank and the learner's work looked lost.
- **A record exists from the first answer; a *result* needs `score` and `total`.** Those, plus `at`
  and `missed[]`, are written only once every question is done. Anything reporting a score — the
  home stats, the unit dots, the certificate — must filter on completeness, or a half-finished unit
  test counts as taken.
- **`missed[]` holds objective numbers**, parsed from the `(objective N)` citations. That is what
  drives the per-objective breakdown and the review list.
- **Timestamps are recorded at the event**, so the certificate date does not move on reload.
- Nothing personal beyond a name the learner typed. No identifiers, no tracking, nothing leaves the
  browser.

## Availability

Feature detection must be an **actual write**, not `'localStorage' in window` — Safari private mode
exposes the API and throws on `setItem`.

```js
try { localStorage.setItem(probe, '1'); localStorage.removeItem(probe); ok = true }
catch { ok = false }
```

Unavailable → fall back to an in-memory store so every feature keeps working for the session, and show
a **dismissible** banner once: *"Progress won't be saved — this browser has storage disabled."* State
it once and never again.

## Failure modes

| Case | Handling |
| --- | --- |
| Storage disabled or throwing | In-memory store, banner once. Site fully functional for the session. |
| Corrupt JSON | Catch, discard the key, start clean, notice once. Never let a parse error white-screen the page. |
| `QuotaExceededError` | Drop `missed[]` arrays first, retry; then drop `projects`, retry; then stop writing and warn. Never lose quiz scores to a quota error caused by checklists. |
| Wrong `v` | Migrate if possible, else reset with notice. |
| Two tabs open | Listen for `storage` events and re-render progress. Last write wins; nothing here needs stronger consistency. |
| Blob is huge | Debounce writes at 250 ms and write the whole blob once, rather than many small keys. |

Every read and write goes through the store's try/catch wrapper. There is no bare `localStorage.` call
anywhere else in the site — that is a build gate.

## Derived values

Computed on read, never stored — storing them creates two sources of truth that drift.

- **Topic complete** = `read === true`.
- **Unit progress** = topics complete ÷ topics in unit.
- **Course progress** = topics complete ÷ total topics.
- **Quiz average** = mean of `score/total` across attempted quizzes.
- **Unit test average** = mean across attempted tests. This is what the certificate reports.
- **Certificate issued** = every unit has a `tests[uN]` entry.

## Reset

Available from the home footer, the certificate, and any settings affordance.

- Confirm with a native `<dialog>` — real focus trapping, `Esc` to cancel, no library.
- The dialog states exactly what will be lost: *"all quiz scores, reading progress, project
  checklists, and your name on the certificate."*
- On confirm: remove **only** `course:<slug>:v1`. Never `localStorage.clear()` — other courses and
  other apps may share the origin.
- Then re-render in place and announce completion via `aria-live`. No page reload needed, and no
  navigation away.

## Wiring pages

`site.js` reads a config block that the build injects into every page:

```html
<script type="application/json" id="course-config">
  { "slug": "intro-to-cuda", "passingScore": 70,
    "totalTopics": 21, "units": [ { "id": "u1", "topics": ["u1t1", "u1t2"] } ] }
</script>
```

Quiz data is embedded the same way, per page:

```html
<script type="application/json" id="quiz-data">
  { "id": "u1t1", "kind": "quiz",
    "questions": [ { "type": "MULTIPLE_CHOICE", "question": "…", "options": ["…"],
                     "correctOptionIndex": 2, "explanation": "… (objective 2)",
                     "objectives": [2] } ] }
</script>
```

The build extracts `objectives[]` from the `(objective N)` citations at build time. Do not make the
browser parse prose.

Everything is embedded. The site never fetches its own content — that is what keeps it working from
`file://`, from a bucket subpath, and offline.
