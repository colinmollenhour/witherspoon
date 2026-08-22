# Scene visualizations

Read at Stage 2, after `widgets.md`. A **scene** is an animated, steppable simulation of a process —
a request travelling, a cursor walking a tree, bytes replacing bytes. Reach for one only when the
thing being taught is *invisible and temporal*: it changes over time, the order is the lesson, and a
static table could only assert the outcome rather than show the cause. Most topics do not need one.
A course needs at most a handful, each at the moment its unit's drama turns.

The spec format is the easy half of this document. The hard half is the design method — and it is
not optional. A scene built by translating the prose's nouns into rectangles and its verbs into
arrows is worse than no scene: it costs attention and teaches nothing the paragraph did not.

## Recognising the topic that deserves one

Do not wait to be asked. While walking the topics at Stage 2, look for these signals in the prose —
they mark a flattened animation, written down because the author had no way to play it:

- **An instruction to watch something change**: "watch the terminal while you reload", "run it
  again and compare", "look at the first line it printed".
- **A compare widget whose columns are really successive attempts** — before/during/after, three
  tries at the same thing. Columns are a storyboard forced into a table.
- **Hidden state that silently changes meaning**: a working directory reparenting every relative
  path, a name resolving differently per machine, a buffer emptying before it fills.
- **Evidence that accumulates or is conspicuously absent** — a log line that appears, or the
  silence where one should have been.
- **A failure the learner will actually hit**, walked in prose as "if X, then look at Y".

Anti-signals — use a widget or a figure instead: structure (tree, anatomy), a genuine side-by-side
comparison, vocabulary, anything whose truth is fully visible in one frame.

## Designing one — before any JSON

Work through these five steps in order. The storyboard is the deliverable of this stage; the spec
is transcription.

1. **State the insight as a causal sentence.** *"After this scene, the learner understands that
   ___ because they watched ___."* If the first blank is a topic ("HTTP", "the shell") rather than
   a claim ("`localhost` names whoever is asking"), or the second blank is empty, stop — the topic
   wants a widget, not a scene.

2. **Diverge: sketch three genuinely different visual grammars before choosing.** Different
   grammars, not three arrangements of boxes and arrows. Draw from: spatial topology (places and
   travel), accumulation (an evidence pane that gains rows), state transformation (one string or
   value rewritten step by step), lockstep contrast (two lanes replaying the same input until they
   diverge), a physical metaphor (doors, mailboxes — only if it cannot lie), a counterfactual
   toggle (same run, one variable changed). For each sketch, one line: what stays fixed, what
   moves, what the eye follows, its strongest beat, and how it could mislead. At least one sketch
   must not be boxes-and-arrows.

3. **Choose for explanatory power, not looks.** The winner is the sketch whose *motion is the
   argument* — where seeing the order happen is what makes the claim land. Synthesise: it is
   normal for the winner to borrow one beat from a loser (a resolution flash, an evidence pane).

4. **Storyboard 5–8 beats, one sentence each.** These sentences become the phase narrations, and
   with JavaScript off they *are* the lesson — so write them to read as prose, in the course's
   voice, before touching geometry. If the prose raises a failure ("if the page still fails…"),
   the storyboard includes it; the counterfactual beat is usually the one that lands hardest. Put
   the poster on the frame with the most *evidence*, not the most drama.

5. **Self-check before transcribing to JSON.** Kill the scene, or fix it, if any of these fail:
   - The insight could be shown as well by the static poster alone (then ship a figure).
   - A paused frame mid-scene would puzzle someone who missed the earlier phases.
   - Anything moves that is not the causal subject — labels drift, boxes shuffle, decoration
     animates. The stage holds still; one or two pieces move at a time.
   - The metaphor asserts something false about the system (packets do not literally queue at a
     chip; a firewall beat must not imply the server refused).
   - A number, address, or output is invented rather than consistent with the course's own worked
     examples and `SOURCES.md` discipline.

## What the learner gets

- With JavaScript: the scene rewinds to its first phase and offers **Play / Back / Next**, a status
  line, and a clickable storyboard of every phase with its narration. Frames are derived from
  `{phase, progress}` by one clock, so pausing, stepping and replaying always land on the same
  pixels. Reduced-motion users get Back/Next only — every phase's settled frame, no motion.
- Without JavaScript: the scene settled at its **poster** phase — the most informative frame — with
  the whole storyboard printed below it. Nothing the learner reads depends on the runtime (gate S4).
- Outside the site (GitHub, any markdown viewer): a real static diagram, because the embed is an
  ordinary image reference and the build generates that image from the spec.

## Authoring: one file, one image reference

The spec lives beside the assets; the markdown embeds it **as an image of the poster**:

```
assets/viz/three-attempts.viz.json     ← you write this
assets/viz/three-attempts.svg          ← the build writes this (the poster); commit it
```

```markdown
![Alt text that tells the story and its outcome](assets/viz/three-attempts.svg "Caption — the takeaway, and any caveat such as 'the addresses are examples'")
```

Rules, all enforced by the build:

- The image path must be `assets/viz/<name>.svg` with `<name>.viz.json` beside it. Without the
  sibling spec it is treated as an ordinary figure (and an SVG figure needs width and height).
- **Alt text ≥ 8 characters** and written as the process *and its outcome*, not a title — it is what
  a screen reader and a broken-image fallback both get.
- A malformed spec fails the build naming the file and the field, the same as a widget.
- The build (re)writes the poster whenever it is missing or stale, content-compared, so a repeated
  build is a no-op. **Commit the poster** — it is what renders on GitHub.

Pre-check without building: `check-widgets` validates every `assets/viz/*.viz.json` alongside the
widget fences and warns about a spec no page embeds.

## The spec

```json
{
  "title": "Where each request actually goes",
  "canvas": { "width": 780, "height": 396, "minWidth": 640 },
  "poster": "proof",
  "elements": [ … ],
  "phases": [ … ]
}
```

`canvas` is the SVG `viewBox`. The scene scales to the reading column; below `minWidth` it scrolls
sideways rather than shrinking text below legibility (same rule as `compare` tables). Keep text at
10 px or larger in canvas units and prefer a wide, short canvas.

### Elements

Every element has an `id` (letters, digits, `-`, `_`), and may carry `tone`, `state` and
`hidden: true`. Later elements draw on top of earlier ones — list moving pieces last.

| kind | geometry | fields |
| --- | --- | --- |
| `box` | `x y w h` top-left | `label`, `labelAt: "center"`, `dash`, `r` (corner radius) |
| `chip` | `x y` centre | `label`, `mono`, `w` (else estimated from the label) |
| `text` | `x y` baseline start | `text` *or* `spans: [{ "t", "tone" }]`, `size`, `mono`, `anchor`, `weight` |
| `wire` | `points: [[x,y],…]` | `arrow: true \| "both"`, `dash`, `width` |

`tone` colours a piece by meaning: `accent`, `ok`, `bad`, `warn`, `term` (a dark terminal pane),
`ghost` (outline only, for what is present but inert). A `text` with `spans` keeps a colour per run —
how a log line highlights its first field — but cannot be swapped by a `text` action.

### Phases and actions

A phase is a named beat with narration and a duration. Its actions apply at entry; `move` tweens
across the phase; the settled state carries into the next phase.

```json
{
  "id": "phone-asks",
  "title": "The phone asks the same letters",
  "ms": 2600,
  "narration": "`localhost` still means the machine that is asking — and now that is the phone.",
  "actions": [
    { "state": { "el": "ph-browser", "value": "active" } },
    { "show": "ph-resolve" },
    { "jump": { "el": "packet", "to": [660, 202] } },
    { "show": "packet" },
    { "move": { "el": "packet", "path": [[660, 202], [660, 276]] } }
  ]
}
```

| action | does |
| --- | --- |
| `show` / `hide` | `"id"` — reveal or hide a piece |
| `state` | `{ el, value }` — set `data-state`: `active`, `ok`, `bad`, `warn`, `dim`, or `""` to clear; state wins over tone |
| `text` | `{ el, value }` — swap a plain `text` element's content (not `spans`) |
| `move` | `{ el, path }` — tween a `chip`/`text`/`box` along absolute points for the phase's `ms` |
| `jump` | `{ el, to }` — reposition instantly at entry, for reusing one piece across acts |

Narration and `title` are inline markdown. Narration is the storyboard — write it so the eight
lines read as the lesson on their own, because with JavaScript off that is what ships. British
spelling, the course's voice.

`poster` names the phase whose settled state is the poster and the no-JS frame; default is the
last. Choose the frame that carries the most evidence, not the dramatic failure.

## Composing the stage

The storyboard fixes *what* happens; these are the rules for *how it looks*:

- The stage — devices, lanes, panes — is laid out once and never moves. Only the causal subjects
  travel: one or two chips at a time, on paths the eye can follow. List movers last in `elements`
  so they draw on top.
- Reserve strong colour for meaning: `state` changes mark cause and effect, `bad`/`warn` mark
  failure, `ghost` marks what is present but inert. A scene where everything is coloured says
  nothing. Never encode a state by colour alone — pair it with a text change or a marker, the way
  `connection refused` appears beside the reddened packet.
- Evidence accumulates in a fixed pane (a `term` box gaining `text` lines) rather than floating
  labels appearing mid-air. Absence is evidence too — a ghost line saying what did *not* happen
  outlives the phase that proves it.
- Reuse one packet across acts with `jump` rather than minting look-alike chips; the learner
  should track a single protagonist.
- Every number in a scene obeys the same grounding contract as prose. Example addresses must be
  consistent with the course's own worked examples, and the caption must say they are examples
  when the learner is meant to read their own.

## Checking it

Build, then open the page with `?vizphase=N` (1-based) to settle every scene on phase N — the
deterministic frame for a screenshot. Look at each phase for overlaps, the first and last frames,
dark mode, and a 390 px viewport. `bun run test` covers the runtime contract: the scene enhances,
rewinds to phase 1, steps deterministically, and restores authored text and positions on rewind.
