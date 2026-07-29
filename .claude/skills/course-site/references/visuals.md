# Visuals

Read at Stages 2–3, **after `widgets.md`**.

> **Check `widgets.md` first.** Most of what a reading needs is a widget, not a picture: strings with
> named parts, hand-offs between stages, comparisons, predicted output, sequences, hierarchies. A
> widget costs a block of JSON, themes itself, reflows on a phone, and stays searchable and
> translatable. Generate an image only when the subject is genuinely pictorial — a photograph, a
> hardware layout, a chart of real numbers — or when it is a unit hero.

Two skills are composed here, and each has a gotcha that will silently produce nothing useful if
ignored.

## Where output goes

**Everything you generate is written under `<course-dir>/assets/`**, alongside the course's markdown,
and is committed with the course. The build copies that directory into `dist/assets/`.

Never write into `dist/`. It is deleted and rewritten on every build, so a diagram, an image, or a
kept infographic prompt placed there survives exactly until the next run — which is how an earlier
version of this file silently discarded every visual it produced.

```
<course-dir>/assets/
  img/          .svg and .png referenced by pages
  diagrams/     .tldr sources, kept so a diagram can be edited later
  prompts/      infographic prompt files, kept so an image can be generated later
```

## What gets a picture

| Need | Tool | Output |
| --- | --- | --- |
| Flow, pipeline, hierarchy, comparison, sequence, a dissected string | **a widget** — see `widgets.md` | HTML |
| Home-page hero artwork | any image generator — see **Hero artwork** below | WebP |
| Unit hero — the before→after of that unit | `infographic` → image generator | PNG |
| Structure a widget genuinely cannot carry — a state machine with cycles, a spatial layout | `tldraw-skill` | SVG |
| Anything else | nothing | — |

Budget, and hold to it:

- **At most one infographic per unit.** It illustrates that unit's slice of the spine.
- **Diagrams only where a widget will not do.** Most of what used to justify a diagram is now a
  `flow`, a `sequence`, or a `tree`, all of which theme and reflow and cost nothing to produce.
- **Never decorative.** If the alt text would be "illustration of the topic", do not generate it.

List the plan before generating: file name, tool, what it depicts, alt text. Alt text is written by
you, at plan time — not derived from the image afterwards.

## Hero artwork

Optional, one per course, and the only place a *pictorial* image earns the top of a
page. Declared in `course.json`:

```json
"hero": {
  "image": "assets/img/hero.webp",
  "width": 1600,
  "height": 900,
  "alt": "Two students at a laptop, one pointing at the screen, both breaking into a delighted laugh as something finally makes sense."
}
```

The template renders it behind the title, with a scrim, and keeps the whole block on
a **light surface in both themes** — the same call `.figure` makes, for the same
reason: the artwork has baked light colours and a dark-mode recolour would wreck it.

Brief it accordingly, and hold these four:

- **16:9, 1600×900.** The hero renders at the reading measure and holds that ratio,
  so anything else gets cropped. 1600 wide is exactly 2× for a retina display.
- **A quiet left third.** The title, subtitle and stat chips sit over the left of
  the image. Composition that puts a face or a focal point there will be covered.
- **No text of any kind.** The headline is real HTML beside it. Image generators
  corrupt small lettering, and a garbled word in a hero is the first thing seen.
- **A light background** in the artwork itself, keyed to `#fbfbfc`.

Encode to **WebP at quality 90** — a painterly 1600×900 lands around 140 KB, against
~1.7 MB for the PNG a generator returns and ~200 KB for JPEG. It will be the largest
asset on the site; keep it under the 400 KB advisory.

If the generator produces malformed hands or faces, regenerate rather than shipping
it. Those are the two things a viewer looks at first, and they are where these models
fail. Inspect at native resolution, not in a thumbnail — a bad hand is invisible
scaled down and obvious on the page.

A course with no `hero` in `course.json` falls back to the template's painted
gradient. That is a perfectly good hero; do not generate artwork just to fill a slot.

## tldraw — structural diagrams

Probe once, before any diagram work:

```bash
command -v tldraw >/dev/null 2>&1
```

**Available** → load `tldraw-skill` and follow its generation, layout, export, and self-check rules.
Export **SVG** (scales, tiny, crisp at any zoom). Write the `.tldr` source to
`<course-dir>/assets/diagrams/<name>.tldr` and the export to `<course-dir>/assets/img/<name>.svg`. A successful PATH
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
- `save it to <course-dir>/assets/prompts/unit-<N>.md`
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

Write output to `<course-dir>/assets/img/unit-<N>.png`.

### When the image is missing

Render a `.figure--placeholder` panel in its slot: the unit's before→after as styled text, plus a
small note that a visual can be generated later from the kept prompt. Never leave a broken `<img>`,
and never silently drop the slot — an empty region reads as a rendering bug.

Because the prompt file lives in `<course-dir>/assets/prompts/`, it survives every rebuild, and the
image can be generated weeks later without re-running any of Stage 2.

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
