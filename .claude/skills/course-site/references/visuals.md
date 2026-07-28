# Visuals

Read at Stages 2–3. Two skills are composed here, and each has a gotcha that will silently produce
nothing useful if ignored.

## What gets a picture

| Need | Tool | Output |
| --- | --- | --- |
| Unit hero — the before→after of that unit | `infographic` → image generator | PNG |
| Structure: flow, pipeline, hierarchy, state machine, relationships | `tldraw-skill` | SVG |
| Anything else | nothing | — |

Budget, and hold to it:

- **At most one infographic per unit.** It illustrates that unit's slice of the spine.
- **Diagrams only where structure exists.** A topic teaching one API call does not need a diagram. A
  topic teaching how three things hand off to each other does.
- **Never decorative.** If the alt text would be "illustration of the topic", do not generate it.

List the plan before generating: file name, tool, what it depicts, alt text. Alt text is written by
you, at plan time — not derived from the image afterwards.

## tldraw — structural diagrams

Probe once, before any diagram work:

```bash
command -v tldraw >/dev/null 2>&1
```

**Available** → load `tldraw-skill` and follow its generation, layout, export, and self-check rules.
Export **SVG** (scales, tiny, crisp at any zoom). Write the `.tldr` source to
`dist/assets/diagrams/<name>.tldr` and the export to `dist/assets/img/<name>.svg`. A successful PATH
check is sufficient — do not probe further. Do not install it.

**Unavailable** → do **not** fall back to Mermaid. Mermaid needs a runtime library, which would break
the no-external-requests rule, and vendoring a renderer for a handful of diagrams is not worth the
weight. Fall back in this order:

1. Hand-author a small inline SVG — boxes, arrows, labels, `currentColor` where practical. Good for
   under ~8 nodes, and it themes for free.
2. Otherwise render the structure as an ordered list or a table and skip the image. A clear table
   beats a diagram nobody can see.

Naming: purpose-specific and stable — `request-flow.svg`, `state-transitions.svg`, not `diagram1.svg`.

### Dark mode

Exported tldraw SVGs carry baked light-mode colors. Do not try to recolor them. Render every image
inside a `.figure` card that keeps a light surface in both themes (the stylesheet already does this),
with the caption outside the card in normal body color. This is honest and robust; CSS filter
inversion is neither.

## infographic — unit heroes

**The gotcha: this skill does not generate an image.** It writes a prompt file and stops. Its own
words: *"You are not generating the image. You are generating the prompt that another tool/agent will
use."*

So it is always two calls.

### Call 1 — the prompt

Invoke `infographic` with **explicit scope in the arguments**, or it will go looking for a merge
request, find none, ask a question, and stop. Pass:

- the scope, stated plainly: *"for the course unit described below — not a git change"*
- the unit title, its before→after, its objectives, and the relevant `SOURCES.md` figures, inlined
- `save it to dist/assets/prompts/unit-<N>.md`
- **`make it technical`** if the course is technical

That last one matters. The skill's default rules strip file paths, function names, and code
identifiers — correct for an operations audience, wrong for a programming course where the API name
*is* the content. The skill supports `make it technical` as a documented override and caps paths at
five.

It refuses to fabricate: missing facts come back as `[NEEDS DATA]` markers and it stops. Treat that as
a grounding failure, not a tooling failure — supply the figures from `SOURCES.md` and re-run, or drop
the infographic.

### Call 2 — the image

Feed the prompt file to an image generator, in this order:

1. `nano-banana` — preferred; generates directly.
2. `codex-cli` — native raster generation; fallback.
3. Neither available → **skip the image, keep the prompt file.** The build continues.

Write output to `dist/assets/img/unit-<N>.png`.

### When the image is missing

Render a `.figure--placeholder` panel in its slot: the unit's before→after as styled text, plus a
small note that a visual can be generated later from the kept prompt. Never leave a broken `<img>`,
and never silently drop the slot — an empty region reads as a rendering bug.

## Rules for every image

- **Alt text is mandatory** and describes the content, not the medium. "Vector-add timing falling from
  75 ms to 47 µs across four kernel configurations" — not "chart".
- **Set `width` and `height`** on every `<img>` so nothing reflows on load.
- **`loading="lazy"`** on everything below the fold.
- **Everything is local.** No remote URLs, ever.
- **Caption below the figure** giving the takeaway in one sentence. A reader who skips the image
  should still get the point.
- **Size budget:** flag any single raster over 400 KB and any total image payload over 3 MB. Both are
  advisory, both go in the report.
