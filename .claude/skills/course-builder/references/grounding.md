# Grounding expedition

Read at Stage 5, after approval. This is active research. You are not checking your memory — you are
finding the material the course will be built on.

The tell that a course was grounded is that its topic prompts can say things like *"Show the article's
nsys_easy timing table for the single-block case (4.2ms)"* and *"Reference Figure 1 from the article"*.
That specificity is not recalled. It is fetched.

## Tools

Load what you need before fanning out:

```
ToolSearch("select:WebSearch,WebFetch")
```

Then discover anything project-specific — internal docs, ticket systems, code search, knowledge bases
— with a keyword `ToolSearch`. Local `Grep`/`Glob`/`Read` count as grounding sources and are often
the best ones: a repo's actual code beats a blog post about it.

For a site that renders client-side and hides the useful data, fetching the raw HTML and extracting
the embedded JSON payload is fair game and usually faster than fighting the SPA.

## The five angles

Fan out one agent per angle. Each returns **ledger rows, not prose**.

### A1 — Primary source

Find the canonical thing the course should be built on: the original paper, the official guide, the
spec, the standard, the internal runbook. One or two documents, read properly.

This is the highest-value angle. A course anchored to one real document inherits its examples,
figures, and numbers, and every topic can point at it. Return: the document, its URL, its structure,
and the specific listings/figures/tables worth teaching from.

### A2 — Authoritative numbers

Nail down every figure the spine depends on — the before, the after, and anything quoted along the
way. Spec sheets, published benchmarks, official pricing, industry rates, measured baselines.

Return each as: figure, unit, conditions it was measured under, source. A number without its
conditions is not grounded — `47 µs` means nothing without `on a T4, N=1<<20`.

### A3 — Current-state check

The angle that catches stale knowledge. For every API, tool, version, flag, price, or standard the
outline names, confirm it still exists and still works that way.

Look for: deprecations, renames, breaking changes, superseded standards, changed defaults, current
stable version. Explicitly check anything you believe from memory — that is exactly where drift
hides.

Return: `<thing> — still current | changed to X as of <date> | deprecated, use Y`.

### A4 — Misconception harvest

What do learners actually get wrong? Forums, issue trackers, Stack Overflow, FAQ sections, "common
mistakes" posts, support threads.

This angle pays for itself twice: harvested misconceptions become **plausible multiple-choice
distractors** (the difference between real questions and filler), and the most common one is often a
better failure moment than the one you invented.

Return: the misconception, why it is tempting, what actually happens, and where it was observed.

### A5 — Prior-art gap

How do existing courses and tutorials sequence this, and **what do they all skip**?

The gap is the course's reason to exist, and it becomes the "why this over the official docs" FAQ
answer. The real example:

> The NVIDIA docs are thorough but they don't explain why things are slow before showing you how to
> fix them.

Return: what the existing treatments cover, what they consistently omit, and the sequencing they use.

## Scaling the expedition

- Five agents is the default. Small or compact courses can drop A5 and merge A2 into A1.
- For a large course, add one **per-unit fact-check agent** that verifies only that unit's contracts.
- Stop on **coverage**, not effort: every provisional `?` resolved, every API confirmed, every angle
  reported. If an angle comes back empty, say so in the ledger — an empty A4 is a finding.

## `SOURCES.md`

The ledger. Written before generation, shipped with the course, and quoted by topic agents.

```markdown
# Sources

## Primary
- **<Title>** — <URL> — <what it provides>

## Ledger

| # | Claim | Value / quote | Source | Angle |
|---|-------|---------------|--------|-------|
| 1 | T4 has 40 SMs × 64 CUDA cores | "2,560 CUDA cores across 40 SMs" | <URL> | A2 |
| 2 | Single-thread kernel baseline | 75 ms, N=1<<20, T4 | <URL> | A2 |
| 3 | `cudaMemPrefetchAsync` signature current | `(ptr, bytes, device, stream)`, CUDA 12.4 | <URL> | A3 |
| 4 | Learners assume GPU is always faster | "why is my CUDA slower than CPU" — recurring | <URL> | A4 |

## Ungrounded
Claims that could not be verified, and what was done about them.

- <claim> — cut / taught as method / flagged in topic N
```

Rules:

- Verbatim quotes or exact figures. A paraphrase is not grounding.
- Every row has a resolvable source — URL, file path, or command that produces it.
- The **Ungrounded** section is mandatory, even if empty. It is where honesty lives.

## Refinement rules (Stage 6)

| Finding | Action |
| --- | --- |
| A provisional number was wrong | Correct the spine, subtitle, and every contract citing it. Note the delta in the report. |
| An API/version/flag drifted | Update every affected objective, contract, and project environment. |
| A better misconception surfaced (A4) | Promote it to a distractor; if it beats the provisional failure moment, swap it and rewrite the two unit descriptions involved. |
| A gap confirmed (A5) | Write it into the "why this over the docs" FAQ, in specific terms. |
| The primary source restructures the material better than the outline | Re-sequence topics. Keep the spine; the running example does not change. |
| A claim cannot be grounded | Cut it, or rewrite the topic to teach how to find it. Record it under **Ungrounded**. Never ship it silently. |
| **The premise is invalidated** — the transformation does not hold, the tool is dead, the numbers are off by an order of magnitude | **Stop.** Report what you found and what it means for the course. This is the only finding that reopens the approval gate. |

Everything except the last row is applied autonomously. Report the refinement in two or three lines
and keep going — do not re-interview.

## Injecting grounding into contracts

After refinement, each `_contract.md` gains a section before its activity list:

```markdown
## Grounded facts

- T4: 40 SMs × 64 CUDA cores = 2,560 [src 1]
- Single-thread baseline: 75 ms at N=1<<20 [src 2]
- Common misconception: "more threads always helps" — actually memory-bound here [src 4]
- Teach from: <primary source>, Figure 1 and the timing table
```

This is what the topic agent quotes from. It is also the constraint: **a topic agent may not
introduce a number that is not in its grounded facts.** Gate G11 enforces it.
