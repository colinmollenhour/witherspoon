# Spine

Read at Stage 2. The spine is decided before the outline and is not revisited.

A course without a spine is a list of topics. A course with one is a story where the learner keeps
touching the same object and it keeps getting better.

## The four things you must name

### 1. The running example

One concrete artifact the learner carries through every unit, modifying and re-measuring it.

Good running examples are **small, real, and improvable**:

| Subject | Running example |
| --- | --- |
| GPU programming | `add()` over 1M floats — CPU → 1 thread → 1 block → grid → prefetched |
| Cold calling | One named prospect, called across all six stages of the call |
| Algebra 1 | One word problem re-expressed as variables → equation → graph → system |
| Dev tooling | One tiny site — created locally, versioned, inspected, deployed |
| Incident response | One outage, replayed at increasing depth |

Bad running examples: a different toy per unit; an example too large to hold in one page; anything
whose "improvement" cannot be measured.

**Test:** can you write the same artifact's state at the end of every unit, in one line each? If not,
it is not a spine.

### 2. The measurable transformation

A before number and an after number, both real.

- `75 ms → 47 µs` (1932× on a T4)
- `9% connect rate → 24%`
- `"I can't read a stack trace" → resolves a 3-frame trace unaided in under 2 minutes`
- `0 deployed sites → 1 live URL`

If the domain has no natural number, use a rubric score or a task time — but commit to one. The
subtitle is built directly from this.

**Never invent the numbers.** Take them from source material, from a real spec, or from a run you can
actually predict. If you cannot ground them, say so and use a qualitative before→after instead of a
fabricated figure.

### 3. The designed failure moment

Pick the unit where the learner does the obvious thing and it does not work.

The pattern, from the CUDA course:

1. Unit 1 project ports `add()` to the GPU. It runs **75 ms** — 25× *slower* than the CPU baseline.
2. A callout names the surprise before the learner concludes they broke something:
   *"That feels backwards… It is — but only when you actually use it. A GPU is a bus, not a Ferrari."*
3. Unit 1's **description** ends on the open question, so Unit 2 has somewhere to land.

Rules:

- The wall must be reachable by doing the *correct* thing so far, not by making a mistake.
- Name the surprise explicitly. An unexplained bad result reads as a broken lesson.
- Resolve it in a later unit, never in the same topic.
- One per course is enough. Two is the ceiling.

### 4. Title and subtitle

- **Title** — plain, says what it is. Not clever.
- **Subtitle** — states the transformation with the numbers in it.

> "Learn how to write GPU programs in CUDA from scratch, starting with why GPUs exist and ending with
> a kernel running at over 80% of peak memory bandwidth on real hardware."

Formula: `<start state>, starting with <first idea> and ending with <after number> on <real thing>`.

## Output of this stage

Produce this block and carry it verbatim into every subagent prompt in Stage 5:

```
SPINE
  Running example:   <one artifact, one sentence>
  Transformation:    <before number> → <after number>
  Per-unit state:    U1 <state> · U2 <state> · U3 <state> …
  Failure moment:    Unit <N> — <the wall> → resolved in Unit <M>
  Title:             <title>
  Subtitle:          <subtitle>
```

Every topic must touch the running example. A topic that does not is either mis-scoped or belongs in
a different course — cut it or re-aim it.
