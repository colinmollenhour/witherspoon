# Visuals

Read at Stages 2–3, **after `widgets.md`**.

> **Check `widgets.md` first.** Most of what a reading needs is a widget, not a picture: strings with
> named parts, hand-offs between stages, comparisons, predicted output, sequences, hierarchies. A
> widget costs a block of JSON, themes itself, reflows on a phone, and stays searchable and
> translatable. Generate an image only when the subject is genuinely pictorial — a photograph, a
> hardware layout, a chart of real numbers — or when it is a unit hero.

The template **does** render images when they exist: unit overview heroes, and figures authored into
markdown. Generating a file under `assets/img/` without wiring it is not enough — see
**How images reach the page** below. Two composition gotchas remain: the `infographic` skill writes a
prompt file (not pixels), and `tldraw` must be on `PATH` or you fall back.

## Where output goes

**Everything you generate is written under `<course-dir>/assets/`**, alongside the course's markdown,
and is committed with the course. The build copies that directory into `dist/assets/`.

Never write into `dist/`. It is deleted and rewritten on every build, so a diagram, an image, or a
kept infographic prompt placed there survives exactly until the next run — which is how an earlier
version of this file silently discarded every visual it produced.

```
<course-dir>/assets/
  img/          .webp / .png / .svg referenced by pages
  diagrams/     .tldr sources, kept so a diagram can be edited later
  prompts/      infographic prompt files, kept so an image can be generated later
```

## What gets a picture

| Need | Tool | Output |
| --- | --- | --- |
| Flow, pipeline, hierarchy, comparison, sequence, a dissected string | **a widget** — see `widgets.md` | HTML |
| Home-page hero artwork | any image generator — see **Hero artwork** below | WebP |
| Unit hero — the before→after of that unit | image generator (prefer atmospheric illustration, not labeled charts) | WebP |
| Structure a widget genuinely cannot carry — a state machine with cycles, a spatial layout | `tldraw-skill` **or** hand SVG | SVG |
| In-reading photograph / diagram | same generators; author a figure in `read.md` | WebP/SVG |
| Anything else | nothing | — |

Budget, and hold to it:

- **At most one unit hero per unit.** It illustrates that unit's slice of the spine.
- **Diagrams only where a widget will not do.** Most of what used to justify a diagram is now a
  `flow`, a `sequence`, or a `tree`, all of which theme and reflow and cost nothing to produce.
- **Never decorative.** If the alt text would be "illustration of the topic", do not generate it.
- **No exact text, numbers, or labeled charts in generated rasters.** Image models garble them.
  Put labels in a widget, an SVG, or the caption. Unit heroes should be metaphors, not screenshots
  of the lesson.

List the plan before generating: file name, tool, what it depicts, alt text, caption. Alt text is
written by you, at plan time — not derived from the image afterwards.

## How images reach the page

Three paths. All of them start from a file under `<course-dir>/assets/` (never under `dist/`).

### 1. Course hero (home page)

Declared on `course.json` as top-level `hero` (see below). The template paints it behind the title.

### 2. Unit hero (unit overview)

Declared on `units[i].hero` **or** dropped in by convention as `assets/img/unit-<N>.webp`
(also `.png`). The unit overview page (`unit-N/index.html`) renders it under the unit title as a
`.figure.figure--hero` with caption. Prefer the explicit declaration so alt text and caption are
authored, not inventable.

```json
"hero": {
  "image": "assets/img/unit-1.webp",
  "width": 1600,
  "height": 900,
  "alt": "A tablet of app icons beside a laptop opening a nested folder path to one file.",
  "caption": "On a phone a file hides inside an app. On a dev machine every file has a path."
}
```

### 3. In-reading figures (`read.md` / project `brief.md`)

Authors always write **course-relative** paths (`assets/img/…`). The build rewrites them for page
depth (`../assets/img/…` on unit pages), probes width/height, and wraps them in a light `.figure`
card. Two authoring forms:

````markdown
```figure
{
  "src": "assets/img/unit-1.webp",
  "alt": "A tablet of app icons beside a laptop opening a nested folder path to one file.",
  "caption": "On a phone a file hides inside an app. On a dev machine every file has a path."
}
```
````

```markdown
![A tablet of app icons beside a laptop opening a nested folder path to one file.](assets/img/unit-1.webp "On a phone a file hides inside an app.")
```

Alt text is mandatory and must actually describe the picture (≥ 8 characters). A missing file or a
path that does not start with `assets/` **fails the build** naming the topic — deliberately.

Implemented by `course-template/src/lib/figures.ts`, called from the topic and project loaders the
same way widgets are.

## Hero artwork (course home)

Optional, one per course, and the only place a *pictorial* image earns the top of the home page.
Declared in `course.json` as top-level `hero`:

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

## Unit heroes

One per unit, **atmospheric**, matching the unit accent family when practical. Same encoding rules
as the course hero (16:9, 1600×900, WebP q90, light background, **no text in the image**). The
caption under the figure carries the takeaway in real HTML — that is where file paths, URLs, and
commands belong.

Write to `<course-dir>/assets/img/unit-<N>.webp` and declare `units[i].hero` in `course.json`. If
you only drop the file and skip the declaration, the template still picks it up by convention, but
alt text becomes a generic stub — so declare it.

Style consistency across the set matters more than any single image: shared light background, shared
soft-editorial look, subject on the right two-thirds so the left stays airy.

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

## Generating unit heroes (and other rasters)

Prefer a direct image generator. Exact-text infographics are the wrong tool for unit heroes (models
garble labels); use a **metaphor illustration** and put the takeaway in the caption.

### Preferred path

1. Load the `imagine` skill and call `image_gen` (or `image_edit` when iterating) with a coherent
   style brief: light `#fbfbfc` background, soft editorial illustration, quiet left third, **no
   text/letters/numbers/logos**, 16:9.
2. Inspect the result at native resolution (malformed hands/faces → regenerate).
3. Resize to 1600×900 and encode WebP q90:

   ```bash
   # example with Pillow + cwebp
   python3 -c "from PIL import Image; Image.open('in.jpg').convert('RGB').resize((1600,900)).save('/tmp/u.png')"
   cwebp -q 90 /tmp/u.png -o <course-dir>/assets/img/unit-N.webp
   ```

4. Declare `units[i].hero` in `course.json` with alt + caption.
5. Rebuild: `npm run build -- --course ../<course-dir>`.

### Alternate: prompt file first

The `infographic` skill writes a **prompt file, not an image**. Use it only when you want a kept
brief for later generation:

- Scope it explicitly: *"for the course unit described below — not a git change"*.
- Pass unit title, before→after, and `make it technical` when identifiers matter.
- Save to `<course-dir>/assets/prompts/unit-<N>.md`, then feed that prompt to an image generator
  (`image_gen`, `nano-banana`, or `codex-cli`).

If no generator is available, **skip the image, keep the prompt file.** The build continues; unit
pages without a hero simply omit the figure rather than shipping a broken `<img>`.

## Rules for every image

- **Alt text is mandatory** and describes the content, not the medium. "Vector-add timing falling from
  75 ms to 47 µs across four kernel configurations" — not "chart".
- **Set `width` and `height`** on every `<img>` so nothing reflows on load. The figure compiler
  probes raster dimensions when they are not declared.
- **`loading="lazy"`** on everything below the fold (unit heroes and the course hero are eager).
- **Everything is local.** No remote URLs, ever.
- **Caption below the figure** giving the takeaway in one sentence. A reader who skips the image
  should still get the point.
- **Size budget:** flag any single raster over 400 KB and any total image payload over 3 MB. Both are
  advisory, both go in the report.
