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

**Every topic changes that state.** The one-line state a topic inherits and the one-line state it
leaves behind must differ. A topic that only *mentions* the artifact is a sidebar on the page that
needs it — not a topic with its own quiz. This is the compression rule; the outline critic enforces
it before the user ever sees the syllabus.

**First hour.** The first topic of the course must put this artifact in the learner's hands. They
run it, open it, click it, or read a real status dump from it. A topic that explains *why the tool
exists*, lists non-goals, or contrasts it with a competitor is not a first topic — it comes after
they have touched the thing. **Do → name the parts → then the bet** is the default Unit 1 order.
The reverse is how a course opens with a 1,200-word essay and a live cluster in topic 3.

**Default dialect.** Name the path, OS, or tool the running example is written in — one, not all of
them. Exactly one setup topic (or a short appendix on topic 1) owns install and the platform map.
Every later page writes the default. Variants are an "On a Mac / On Windows" box of a few lines,
never a restated three-column table. A course that forks every paragraph into three operating
systems is three courses interleaved; nobody finishes the one they are on.

### 2. The measurable transformation

A before number and an after number, both real.

- `75 ms → 47 µs` (1932× on a T4)
- `9% connect rate → 24%`
- `"I can't read a stack trace" → resolves a 3-frame trace unaided in under 2 minutes`
- `0 deployed sites → 1 live URL`

If the domain has no natural number, use a rubric score or a task time — but commit to one. It
lives in the spine block and the `about`; it reaches the subtitle only under §4's rule.

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

These two lines are the pitch, read by someone who has not yet decided to care. They sell what the
*learner becomes*, not the artifact walk — the mechanism is the spine's business, and a title that
summarises the mechanism reads like documentation. *Same file, three addresses* is an accurate
title and a boring one; *Out of the Sandbox* names the identity shift, and its double meaning (the
app sandbox that confines, the kids' sandbox you outgrow) **is** that course's thesis. An evocative
image earns its place exactly when the metaphor is the argument — never as decoration on top of a
course that doesn't cash it.

**Do not present your first idea.** Draft 3–5 title candidates across genuinely different framings
— the mechanism, the transformation, an image or metaphor, a provocation — then judge them with
the skeptic test below and pick. A catalogue of subjects (*Files, the Terminal, and the Web Under
the Hood*) always loses.

**The skeptic test.** Read the pitch as the target learner at their most dismissive, and voice the
shrug: *"so what — I can already do that with an app I have."* A subtitle whose payoff an existing
app can deliver has sold the demo, not the power ("that same page loads on your phone" fails: so
does AirDrop). Rewrite until the shrug has no answer — which usually means naming the power gained,
not the artifact produced.

**Subtitle** — one or two sentences, in the course's voice. First the hook: the confinement, the
itch, the thing they suspect is being hidden from them (extending the title's metaphor if it has
one). Then the concrete powers gained, as real tools and verbs. Numbers belong in the subtitle
only when the number itself is the impressive thing to *this* learner; otherwise the measurable
transformation stays in the spine block and the `about`, where it does its design work.

> "Learn how to write GPU programs in CUDA from scratch, starting with why GPUs exist and ending
> with a kernel running at over 80% of peak memory bandwidth on real hardware."
> — the number is the flex; it earns its seat.

> "An app is a clean sandbox where you can't get hurt. Shake the sand off, grab a shovel, and dig
> into what lies beneath: learn the shell and launch a server on your own network."
> — no number would impress a beginner; the powers named (`the shell`, `a server`, `your own
> network`) are the flex, and the first sentence cashes the title's metaphor.

## Output of this stage

Produce this block and carry it verbatim into every subagent prompt in Stage 5:

```
SPINE
  Running example:   <one artifact, one sentence>
  Transformation:    <before number> → <after number>
  Per-unit state:    U1 <state> · U2 <state> · U3 <state> …
  Failure moment:    Unit <N> — <the wall> → resolved in Unit <M>
  Default dialect:   <the path / OS / tool the example is written in>
  Setup owns:        <the one topic or appendix that holds the platform map>
  Title:             <title>
  Subtitle:          <subtitle>
```

Every topic must change the running example's state. A topic that does not is either mis-scoped or
belongs in a different course — cut it or fold it into a sidebar.
