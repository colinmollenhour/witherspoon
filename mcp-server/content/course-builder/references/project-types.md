# Projects

Given to each project subagent in Stage 5.

A project is real work, graded three ways at once: **steps** the learner follows, a **rubric** a human
or model grades against, and **test cases** a machine runs. All three, every time.

## The eight types

| Type | The learner… | Grade via |
| --- | --- | --- |
| `code-notebook` | Writes and runs real code in a cloud sandbox | Hidden test cases + code-quality rubric |
| `coding-agents` | Directs an agent to build a working web page | Rubric on the artifact + the direction given |
| `scenarios` | Role-plays with an AI character (interview, sales call, consult) | Rubric on clarity, structure, relevance |
| `spreadsheet` | Builds a budget, model, or analysis in natural language | Rubric on structure, formulas, formatting |
| `writing-research` | Directs research, drafting, and revision | Rubric on sourcing, synthesis, structure |
| `image-generation` | Crafts prompts and iterates on results | Rubric on prompt specificity and iteration |
| `prompt-challenge` | Writes one prompt to recreate a reference | Automated similarity score (pass ≈ 90%) |
| `interactive-form` | Completes a structured worksheet or assessment | Rubric tailored to the topic |

Choosing: if the learner should produce *runnable* work, use `code-notebook`. If the skill is
conversational, use `scenarios`. If the skill is judgement expressed in prose, use
`interactive-form` or `writing-research`. Do not default to `code-notebook` for a non-programming
course.

## Required fields

### `goal`

One or two sentences: what they **build**, what they **capture or prove**, and why it matters next.
Mission voice — not a compliance triple of "state exactly… exactly… exactly…".

> "Write a single-threaded CUDA kernel that adds two 1M-element float arrays with Unified Memory, and
> capture the elapsed ms you will compare to the multi-thread launch in the next project."

Bad: *"State exactly which APIs you used, exactly what the timer printed, and exactly how many
threads you launched."* Keep those details in steps and `completionCriteria`, not in the goal.

### `config.instructions`

Markdown the learner reads before starting. Sections, in order:

1. **How this works** (not "How this runs") — the mechanics that will otherwise confuse them.
   *"All code cells are concatenated into a single `.cu` file and compiled with `nvcc` on a T4 GPU
   sandbox. There is no per-cell execution — hit Run once."*
   Prefer *evidence from your screen* / *checks* over *captured evidence* / *grading scripts* when
   describing what they hand in.
2. **Your tasks** — a numbered list keyed to the TODO markers in the starter.
3. **What the scaffolding is for** — why the banner, the timer, the validation loop exist, and what
   the learner should notice. This is where the spine gets reinforced:
   *"Compare the elapsed ms against the CPU baseline from the previous project — the GPU version is
   actually SLOWER on a single thread. That's not a bug."*
4. **Expected output** — the literal text they should see, in a fenced block.
5. **Rules** — what not to touch.

### `config.starterCells[]` / `starter/`

- A **read-only reference cell** carrying forward the previous project's solution, clearly marked
  `READ ONLY, do not edit`. This is how the running example threads across projects.
- Markdown cells that teach the step immediately before the cell that needs it.
- Code cells where **only the gap is missing**. Everything peripheral — setup, timing, validation,
  cleanup — is already wired. Mark each gap `// TODO A`, `// TODO B`, referenced by number from the
  instructions.
- The starter must compile/run as given, producing a visibly wrong or incomplete result. It must
  never fail to build.

### `steps[]`

Each: `title`, `description`, and a **machine-checkable** `completionCriteria`.

The site shows criteria as **You are done when:** — keep the condition precise (field names, exact
substrings, path shapes). Soften only the surrounding step *description*, not the check itself.

| Bad `completionCriteria` | Good |
| --- | --- |
| Student understands prefetching | `stdout contains the substring 'Max error: 0'` |
| Code is correct | `cudaMallocManaged is called for both x and y with N*sizeof(float) bytes each; no new[] or malloc is used` |
| Learner reflects on timing | `The kernel is launched with <<<1,1>>> and cudaDeviceSynchronize() is called before the validation loop` |

One step may be a noticing step (*"Note the CPU time — you'll compare it in the next project"*), but
no more than one, and it must be last.

### `rubric[]`

3–5 criteria. **Weights are integers summing to exactly 100.**

Each `description` must be specific enough that two graders would agree:

> **Proper Unified Memory lifecycle** (30) — cudaMallocManaged is used (not new/malloc) for both
> arrays, and cudaFree is used (not delete[]/free) for both arrays. Size argument is N*sizeof(float).

> **Clean C++ style** (25) — Code compiles without warnings, all TODO comments are resolved, memory
> is freed with delete[], and there are no leftover placeholder snippets.

Always include one craft criterion (style, clarity, structure) worth 15–25 — it is what stops
"passes the tests" from being the whole grade.

### `testCases[]`

For any type where output can be executed or parsed. Each: `name`, `code`, `expectedOutput`,
`weight`, `description`.

**At least one must be adversarial** — designed to catch the plausible shortcut. In the
learner-facing `description`, lead with what shortcut it catches (*"Catches a shortcut: …"*), not
the all-caps label `ADVERSARIAL.` alone.

```cpp
// Intentionally not a nice power of two — make sure the loop bound is `i < n`,
// not a hard-coded value.
const int N = 12345;
```

Typical set: one correctness test on the canonical input (weight ~50), one generality test with
awkward inputs (~30), one structural test asserting the required construct was actually used (~20).

Test code must be self-contained apart from the symbol under test, and print a definite
`expectedOutput` string such as `PASS` or `max_error=0.000000`.

### `environment`

Always pinned. Never latest.

```json
{ "image": "nvidia/cuda:12.4.1-devel-ubuntu22.04", "gpu": "T4",
  "packages": [], "compileFlags": ["-O2", "-std=c++17", "-arch=sm_75"], "timeoutMs": 60000 }
```

For non-code projects, pin what is pinnable: model, tool version, dataset, reference asset.

## Non-code project specifics

**`scenarios`** — specify the character (role, personality, what they want, what they resist), the
opening line, three branch points where the learner can go wrong, and the rubric dimensions
(clarity, structure, relevance, plus one skill-specific). The character must be able to say no.

**`interactive-form`** — specify each field, its type, and what a full-credit response contains.
Rubric criteria map to fields.

**`writing-research`** — specify the deliverable's structure, minimum distinct sources, and what
counts as synthesis rather than summary.

**`prompt-challenge`** — supply the reference artifact and the pass threshold.

## Project brief (`brief.md`)

Assemble as: title → `goal` → `config.instructions` → steps as a checklist → a pointer to
`rubric.md`. The rubric is written to `rubric.md` as a weights table plus criterion descriptions,
and the tests to `tests/`.
