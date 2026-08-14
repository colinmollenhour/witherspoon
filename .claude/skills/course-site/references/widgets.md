# Interactive widgets

Read at Stage 2. This is the first place to look when a topic needs a visual aid — before images,
before diagrams, before anything that has to be generated.

A widget is a fenced block in a topic's `read.md`:

````markdown
```widget
{ "type": "anatomy", "title": "…", "parts": [ … ] }
```
````

The template compiles it to static HTML at build time and the runtime adds interaction on top.
Nothing is fetched, nothing is rendered client-side, and the content is in the page whether or not
JavaScript runs. There is no library to install and nothing to generate — you write JSON.

## Why these before an image

| | Widget | Generated image |
| --- | --- | --- |
| Cost to produce | write JSON | invoke a tool, hope it succeeds |
| Dark mode | themed | baked light, needs a light card |
| Small screens | reflows | scales down until unreadable |
| Text | selectable, searchable, translatable | pixels |
| Fails how | build error naming the file | silently missing |

So: **widget first, diagram second, infographic only for a unit hero.** An image earns its place
when the thing being shown is genuinely pictorial — a photograph, a hardware layout, a chart of real
numbers. Structure that is really a list, a table, a string, or a sequence should be a widget.

## Placement

Widgets go **in the prose, at the paragraph that earns them** — that is the whole reason they live in
markdown rather than in `course.json`. Put one immediately after the sentence it illustrates, never
in a lump at the end.

**Budget: at most two per topic, four per page.** The verifier warns past four. A reading with a
widget between every paragraph reads as decoration and the good ones lose their weight.

Do not caption a widget with what the reader can already see. The `caption` field carries the
*takeaway* — the sentence someone who skipped the widget still needs.

## The catalogue

Eight types. Pick by the shape of the thing being taught, not by variety.

### `anatomy` — dissect one literal string

**The highest-value widget for a string that is a grammar** — a path, a URL, a command line, an HTTP
request line, an `ls -la` row, a log line. A learner who can point at each piece and name it has
learned that string. It is the wrong widget for a system, a topology, or a decision table; those
need a `flow`, a `match`, a `sequence`, or a figure.

```json
{
  "type": "anatomy",
  "title": "Your project's address, one piece at a time",
  "subject": "Click any piece of the path to see what it does.",
  "parts": [
    { "text": "/", "label": "root", "note": "The one directory that contains every other." },
    { "text": "home", "label": "all users", "note": "Where Linux keeps each account's directory." },
    { "text": "/" },
    { "text": "index.html", "label": "the file", "note": "The `.html` is part of the name." }
  ],
  "caption": "Six pieces separated by slashes — directions from the top of the machine."
}
```

- `parts[].text` is required and is reproduced **exactly**, whitespace included. A part with neither
  `label` nor `note` renders as inert punctuation — that is how you get the separators.
- `label` is a two-or-three-word name; `note` is one or two sentences of markdown.
- Selecting a segment reveals its note. Without JavaScript every note is listed.

### `flow` — an ordered pipeline

For "A hands off to B hands off to C". Each step can carry the detail behind it.

```json
{
  "type": "flow",
  "direction": "row",
  "steps": [
    { "label": "`ls -la`", "sub": "prints a listing", "detail": "Writes to **stdout** exactly as…" },
    { "label": "`grep site`", "sub": "keeps matching lines", "detail": "Handed text on stdin…" }
  ],
  "caption": "Three programs running at once. Nothing is written to disk."
}
```

`direction` is `row` (default, up to about four short steps) or `column` (longer labels, more steps).
Details render below the chain, one at a time.

### `compare` — the same aspects across two or three things

**Two or three columns. Never four or five.** A five-column compare is a wall of text wearing a
widget chrome. Four or more shapes is a `match` (symptom → response) or a figure (which link broke).
Keep each cell to a sentence, not a paragraph.

```json
{
  "type": "compare",
  "columns": [{ "label": "`home/`", "tone": "ok" }, { "label": "`/home/`", "tone": "bad" }],
  "rows": [
    { "aspect": "First character", "cells": ["`h` — so **relative**", "`/` — so **absolute**"] }
  ]
}
```

`tone` is optional and only `ok` or `bad`. Use it when one column really is the right answer and the
other the trap — not to decorate a neutral comparison. `cells` must have one entry per column; a
mismatch fails the build. Below the reading column each row becomes a labelled stack.

### `terminal` — predict, then check

A transcript where the output is worth guessing first. Output ships in the HTML and the runtime
hides it behind a **Run** button, so with JavaScript off it is an ordinary transcript.

```json
{
  "type": "terminal",
  "host": "you@laptop",
  "cwd": "~/projects/first-site",
  "lines": [
    { "cmd": "pwd", "out": "/home/you/projects/first-site", "note": "Every relative path below…" },
    { "cmd": "cd ..", "cwd": "~/projects" },
    { "cmd": "pwd", "out": "/home/you/projects", "note": "`..` moved up one level." }
  ]
}
```

- A line's `cwd` **changes the prompt from that line on.** Use it after every `cd`, or the transcript
  teaches the opposite of what it is there to teach.
- Omit `out` for a command that prints nothing; no Run button appears.
- Only use real captured output. An invented result reads exactly like a true one and is fabrication.

### `match` — pair terms with meanings

Low-stakes recall practice. Nothing is scored, nothing is stored, it can be replayed.

```json
{
  "type": "match",
  "prompt": "Pair each number with what the registry actually says about it.",
  "pairs": [
    { "term": "`80`", "match": "`World Wide Web HTTP` — the default gate for `http://`" },
    { "term": "`443`", "match": "the default for `https://`, which is why you never type it" }
  ]
}
```

Three pairs minimum, six or seven maximum. Keep the `match` side short enough to scan. Both columns
are shuffled in the browser. Without JavaScript it degrades to the pair table, which is also a fine
reference.

### `order` — put the steps in sequence

```json
{
  "type": "order",
  "prompt": "Put the four checks in the order that eliminates a whole class each time.",
  "items": ["Is the server running?", "Is it serving the right directory?", "…"]
}
```

**Author `items` in the correct order** — the browser shuffles them. Use it only where the order is
itself the lesson (a diagnostic ladder, a protocol handshake, a build pipeline), never for a list
whose order is arbitrary.

### `sequence` — who says what to whom

```json
{
  "type": "sequence",
  "actors": ["curl (client)", "example.com (server)"],
  "messages": [
    { "from": 0, "to": 1, "label": "`GET / HTTP/1.1`", "note": "curl marks it `>` because it sent it." },
    { "from": 1, "to": 0, "label": "`HTTP/2 200`", "note": "The status line." }
  ]
}
```

`from`/`to` are indices into `actors`. A message to its own sender fails the build. Two to four
actors; beyond that the exchange is too big for one widget. The runtime adds a step-through control.

**Order `actors` caller first, callee last.** A message renders as a *return* — muted number, tinted
arrow — whenever `to` is less than `from`. Nothing declares that; it is derived from the indices
alone. With two actors the order is forced and this never comes up. With three it decides whether
each row reads as a call or a reply, so put whatever the others call (the server, the API, the
database) last, and the human or external trigger first:

```json
{
  "type": "sequence",
  "actors": ["Operator", "App", "Vault"],
  "messages": [
    { "from": 1, "to": 2, "label": "Read the credential" },
    { "from": 2, "to": 1, "label": "Return it with a lease" },
    { "from": 0, "to": 2, "label": "Revoke the lease early" }
  ]
}
```

Listing those as `["Operator", "Vault", "App"]` instead would build, verify, and render — with the
app's read drawn as a reply and Vault's answer drawn as an outbound call. This is the one widget
mistake the build cannot catch, because a backwards message is indistinguishable from a deliberate
one. Read the diagram back before shipping it: every row drawn as a return must be an actual
response to the row above it.

### `tree` — an annotated hierarchy

```json
{
  "type": "tree",
  "root": {
    "name": "/",
    "note": "the Linux root",
    "children": [
      { "name": "home/", "children": [{ "name": "you/", "tone": "ok", "note": "what `~` expands to" }] }
    ]
  }
}
```

Collapsing is native `<details>`, so it needs no JavaScript at all. `tone` may be `ok`, `bad` or
`accent`. Nodes below the second level start collapsed. Use it for filesystem layouts, config
hierarchies, and DOM or object shapes — not for a flat list.

## Rules for all of them

- **`title` and `caption` are optional but nearly always worth it.** Title says what it is; caption
  says what to take away.
- **Markdown works** in every label, note, cell and caption — inline code especially. Use it.
- **Every fact obeys the grounding contract.** A widget is content. Numbers in it come from
  `SOURCES.md`, exactly like prose. Inventing a plausible `ls` output inside a `terminal` widget is
  the same fabrication as inventing it in a paragraph, and it is harder to spot in review.
- **A malformed widget fails the build** with the file and the field named. That is deliberate — a
  silently broken diagram is worse than a build that stops.
- **Never put a widget inside a blockquote or a list item.** It is a block-level figure.

## Choosing, quickly

| The thing you are teaching | Widget |
| --- | --- |
| A string with named parts | `anatomy` |
| Stages that hand off to each other | `flow` |
| Two or three things, same questions asked of each | `compare` |
| Commands whose output is worth predicting | `terminal` |
| Vocabulary worth drilling | `match` |
| An order that is itself the lesson | `order` |
| Messages between two or more parties | `sequence` |
| A nested structure | `tree` |
| A photograph, a real chart, a hardware layout | an image — see `visuals.md` |
| Prose that is already clear | nothing |
