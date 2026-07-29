import { renderInline } from './md';

/**
 * Interactive visual aids, authored inline in a reading as a fenced block:
 *
 * ```widget
 * { "type": "anatomy", "title": "…", "parts": [ … ] }
 * ```
 *
 * Why a fence and not a field in course.json: placement is the whole point. A
 * diagram belongs at the paragraph that earns it, and course.json cannot express
 * "here". The fence also means the author writing the prose is the one deciding
 * the aid — not a later pass guessing where one might fit.
 *
 * Everything is compiled to static HTML **at build time**. The browser never sees
 * this JSON, never parses a spec, and never needs a rendering library. The runtime
 * only adds interaction on top of markup that is already complete and readable —
 * which is what keeps every widget inside gate S4.
 *
 * A malformed widget throws with the topic named. A course that ships a broken
 * diagram silently is worse than one that fails to build.
 */

const KINDS = [
  'anatomy',
  'flow',
  'compare',
  'terminal',
  'match',
  'order',
  'sequence',
  'tree',
] as const;

export type WidgetKind = (typeof KINDS)[number];

/** Human labels for the little kind chip on each widget's header. */
const KIND_LABEL: Record<WidgetKind, string> = {
  anatomy: 'Anatomy',
  flow: 'Flow',
  compare: 'Compare',
  terminal: 'Try it',
  match: 'Match',
  order: 'Order',
  sequence: 'Sequence',
  tree: 'Tree',
};

const FENCE = /^[ \t]*```[ \t]*widget[ \t]*\n([\s\S]*?)\n[ \t]*```[ \t]*$/gm;

/** Token left in the markdown where a widget was. Deliberately alphanumeric: any
 *  punctuation would risk being eaten or wrapped by the markdown processor. */
const token = (i: number): string => `CSWIDGETMOUNT${i}ENDCSWIDGETMOUNT`;

export function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Inline markdown for a label — mostly so `` `code` `` works in a node name. */
const md = (s: string): Promise<string> => renderInline(String(s ?? ''));

function fail(where: string, msg: string): never {
  throw new Error(`widget in ${where}: ${msg}`);
}

const asArray = (v: unknown, where: string, field: string): unknown[] => {
  if (!Array.isArray(v) || v.length === 0) fail(where, `\`${field}\` must be a non-empty array`);
  return v as unknown[];
};

const asString = (v: unknown, where: string, field: string): string => {
  if (typeof v !== 'string' || !v.trim()) fail(where, `\`${field}\` must be a non-empty string`);
  return v as string;
};

// ---------------------------------------------------------------------------
// extraction
// ---------------------------------------------------------------------------

export interface Extracted {
  /** The markdown with each widget fence replaced by its mount token. */
  markdown: string;
  specs: Record<string, unknown>[];
}

export function extractWidgets(markdown: string, where: string): Extracted {
  const specs: Record<string, unknown>[] = [];
  const out = markdown.replace(FENCE, (_match, body: string) => {
    let spec: unknown;
    try {
      spec = JSON.parse(body);
    } catch (err) {
      fail(where, `block ${specs.length + 1} is not valid JSON — ${(err as Error).message}`);
    }
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
      fail(where, `block ${specs.length + 1} must be a JSON object`);
    }
    const i = specs.length;
    specs.push(spec as Record<string, unknown>);
    // Blank lines around it so the token is always its own paragraph, whatever
    // the fence was surrounded by.
    return `\n\n${token(i)}\n\n`;
  });
  return { markdown: out, specs };
}

/**
 * Put the compiled widgets back where their tokens landed.
 *
 * The token is matched with or without its wrapping `<p>`: a paragraph is what the
 * markdown processor normally produces, but a token that ends up inside a list item
 * or a blockquote comes through bare, and silently leaving `CSWIDGETMOUNT0…` in the
 * page is the one failure mode this must not have.
 */
export function injectWidgets(html: string, compiled: string[]): string {
  let out = html;
  compiled.forEach((widget, i) => {
    const t = token(i);
    out = out.replace(new RegExp(`<p>\\s*${t}\\s*</p>`, 'g'), widget).replace(t, widget);
  });
  return out;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

export async function renderWidget(spec: Record<string, unknown>, where: string): Promise<string> {
  const kind = spec.type as WidgetKind;
  if (!KINDS.includes(kind)) {
    fail(where, `unknown type "${String(spec.type)}" — expected one of ${KINDS.join(', ')}`);
  }

  const body = await BUILDERS[kind](spec, where);
  const title = spec.title ? await md(String(spec.title)) : '';
  const caption = spec.caption ? await md(String(spec.caption)) : '';

  return (
    `<figure class="wx wx--${kind}" data-widget="${kind}">` +
    `<div class="wx__head"><span class="wx__kind">${esc(KIND_LABEL[kind])}</span>` +
    (title ? `<b class="wx__title">${title}</b>` : '') +
    `</div>` +
    `<div class="wx__body">${body}</div>` +
    (caption ? `<figcaption class="wx__cap">${caption}</figcaption>` : '') +
    `</figure>`
  );
}

type Builder = (spec: Record<string, unknown>, where: string) => Promise<string>;

// ---------------------------------------------------------------------------

/**
 * anatomy — dissect one literal string.
 *
 * The highest-value widget in a technical course: a path, a URL, a command line and
 * an HTTP request line are all *grammars*, and a learner who can point at each piece
 * and name it has learned the topic. Segments are buttons; selecting one reveals its
 * note. Every note is in the HTML, so with JS off this is a labelled glossary.
 */
const anatomy: Builder = async (spec, where) => {
  const parts = asArray(spec.parts, where, 'parts') as Array<Record<string, unknown>>;
  const segs: string[] = [];
  const notes: string[] = [];

  for (const [i, p] of parts.entries()) {
    // Not `asString`: a segment of pure whitespace is legitimate here. The space
    // between `GET` and `/` in a request line is one of the three slots, and
    // rejecting it would make the most important anatomy in the course unwritable.
    if (typeof p.text !== 'string' || p.text === '') {
      fail(where, `\`parts[${i}].text\` must be a non-empty string`);
    }
    const text = p.text;
    // `text` stays verbatim — it is the literal string being dissected, and
    // rendering it would eat the very punctuation the widget exists to label. Every
    // *authored* field around it is markdown, as widgets.md promises.
    const label = p.label ? await md(String(p.label)) : '';
    const note = p.note ? await md(String(p.note)) : '';
    // A segment with no explanation is scaffolding — punctuation holding the
    // string together — and must not be focusable or look clickable.
    const inert = !note && !label;
    segs.push(
      inert
        ? `<span class="wx-seg wx-seg--inert">${esc(text)}</span>`
        : `<button class="wx-seg" type="button" data-seg="${i}">` +
          `<span class="wx-seg__text">${esc(text)}</span>` +
          (label ? `<span class="wx-seg__label">${label}</span>` : '') +
          `</button>`,
    );
    if (!inert) {
      notes.push(
        `<div class="wx-note" data-note="${i}">` +
          (label ? `<b>${label}</b>` : '') +
          `<code>${esc(text)}</code>` +
          (note ? `<div class="wx-note__body">${note}</div>` : '') +
          `</div>`,
      );
    }
  }

  return (
    (spec.subject ? `<p class="wx__lead">${await md(String(spec.subject))}</p>` : '') +
    `<div class="wx-string" role="group" aria-label="Parts of the string">${segs.join('')}</div>` +
    `<div class="wx-notes" data-notes>${notes.join('')}</div>`
  );
};

/**
 * flow — an ordered pipeline, with the detail behind each stage.
 *
 * For "A hands off to B hands off to C". The arrows are drawn with CSS on the
 * separator, not as characters, so a screen reader reads a plain ordered list.
 */
const flow: Builder = async (spec, where) => {
  const steps = asArray(spec.steps, where, 'steps') as Array<Record<string, unknown>>;
  const heads: string[] = [];
  const details: string[] = [];

  for (const [i, s] of steps.entries()) {
    const label = await md(asString(s.label, where, `steps[${i}].label`));
    const sub = s.sub ? await md(String(s.sub)) : '';
    const detail = s.detail ? await md(String(s.detail)) : '';
    heads.push(
      `<li class="wx-step" data-step="${i}">` +
        `<button class="wx-step__head" type="button"${detail ? '' : ' disabled'}>` +
        `<span class="wx-step__n" aria-hidden="true">${i + 1}</span>` +
        `<span class="wx-step__label">${label}` +
        (sub ? `<small>${sub}</small>` : '') +
        `</span></button></li>`,
    );
    // Details are siblings of the chain, not children of a step. Nested inside a
    // grid cell they were forced into one column's width, which turned a two-line
    // explanation into a twelve-line ribbon.
    if (detail) {
      details.push(
        `<div class="wx-step__detail" data-detail="${i}">` +
          `<span class="wx-step__detail-n" aria-hidden="true">${i + 1}</span>` +
          `<div>${detail}</div></div>`,
      );
    }
  }

  const dir = spec.direction === 'column' ? 'column' : 'row';
  return (
    `<div class="wx-flow wx-flow--${dir}">` +
    `<ol class="wx-flow__steps">${heads.join('')}</ol>` +
    (details.length ? `<div class="wx-flow__details">${details.join('')}</div>` : '') +
    `</div>`
  );
};

/**
 * compare — the same aspects across two or three things.
 *
 * A real `<table>`, because that is what it is; the widget adds per-column tone and
 * a card layout below the table's breakpoint, where a three-column comparison of
 * full sentences is unreadable.
 */
const compare: Builder = async (spec, where) => {
  const columns = asArray(spec.columns, where, 'columns') as Array<Record<string, unknown>>;
  const rows = asArray(spec.rows, where, 'rows') as Array<Record<string, unknown>>;

  const heads: string[] = [];
  for (const [i, c] of columns.entries()) {
    const label = await md(asString(c.label, where, `columns[${i}].label`));
    const tone = c.tone === 'ok' || c.tone === 'bad' ? ` data-tone="${String(c.tone)}"` : '';
    heads.push(`<th scope="col"${tone}>${label}</th>`);
  }

  const body: string[] = [];
  for (const [i, r] of rows.entries()) {
    const aspect = await md(asString(r.aspect, where, `rows[${i}].aspect`));
    const cells = asArray(r.cells, where, `rows[${i}].cells`);
    if (cells.length !== columns.length) {
      fail(where, `rows[${i}].cells has ${cells.length} entries but there are ${columns.length} columns`);
    }
    const tds: string[] = [];
    for (const [ci, cell] of cells.entries()) {
      const c = columns[ci] as Record<string, unknown>;
      const tone = c.tone === 'ok' || c.tone === 'bad' ? ` data-tone="${String(c.tone)}"` : '';
      // The column label is repeated into a data attribute so the stacked layout
      // can print it before each value without duplicating it in the DOM.
      tds.push(
        `<td${tone} data-col="${esc(String(c.label ?? ''))}">${await md(String(cell ?? ''))}</td>`,
      );
    }
    body.push(`<tr><th scope="row">${aspect}</th>${tds.join('')}</tr>`);
  }

  return (
    `<div class="scroll-x"><table class="wx-compare"><thead><tr><td></td>${heads.join('')}</tr></thead>` +
    `<tbody>${body.join('')}</tbody></table></div>`
  );
};

/**
 * terminal — a transcript where the output is worth predicting first.
 *
 * Output ships visible. The runtime hides it behind a Run button, so with JS the
 * learner gets predict-then-check, and without it they get an ordinary transcript.
 * Never the other way around: content that only exists after a click fails S4.
 */
const terminal: Builder = async (spec, where) => {
  const lines = asArray(spec.lines, where, 'lines') as Array<Record<string, unknown>>;
  const prompt = spec.host ? String(spec.host) : '';
  // A line may restate the working directory, and once it does every later line
  // inherits it. A transcript whose prompt still says `first-site` three `cd ..`
  // commands later teaches the opposite of what it is there to teach.
  let cwd = spec.cwd ? String(spec.cwd) : '';
  const rows: string[] = [];

  for (const [i, l] of lines.entries()) {
    const cmd = asString(l.cmd, where, `lines[${i}].cmd`);
    const out = l.out === undefined || l.out === null ? '' : String(l.out);
    const note = l.note ? await md(String(l.note)) : '';
    if (l.cwd) cwd = String(l.cwd);
    rows.push(
      `<div class="wx-line" data-line="${i}">` +
        `<div class="wx-line__cmd">` +
        `<span class="wx-prompt" aria-hidden="true">` +
        (prompt ? `<span class="wx-prompt__host">${esc(prompt)}</span>` : '') +
        (cwd ? `<span class="wx-prompt__cwd">${esc(cwd)}</span>` : '') +
        `<span class="wx-prompt__sigil">$</span></span>` +
        `<code>${esc(cmd)}</code>` +
        (out ? `<button class="wx-run" type="button" hidden>Run</button>` : '') +
        `</div>` +
        (out ? `<pre class="wx-line__out"><code>${esc(out)}</code></pre>` : '') +
        (note ? `<div class="wx-line__note">${note}</div>` : '') +
        `</div>`,
    );
  }

  return `<div class="wx-term">${rows.join('')}</div>`;
};

/**
 * match — pair terms with meanings.
 *
 * Recall practice that is not a quiz: no score is stored, it can be replayed, and
 * getting it wrong costs nothing. With JS off it degrades to the pair table, which
 * is also a perfectly good reference.
 */
const match: Builder = async (spec, where) => {
  const pairs = asArray(spec.pairs, where, 'pairs') as Array<Record<string, unknown>>;
  if (pairs.length < 3) fail(where, '`pairs` needs at least 3 entries to be worth playing');

  const rows: string[] = [];
  const terms: string[] = [];
  const defs: string[] = [];

  for (const [i, p] of pairs.entries()) {
    const term = await md(asString(p.term, where, `pairs[${i}].term`));
    const meaning = await md(asString(p.match, where, `pairs[${i}].match`));
    rows.push(`<tr><th scope="row">${term}</th><td>${meaning}</td></tr>`);
    terms.push(`<button class="wx-tile" type="button" data-side="a" data-pair="${i}">${term}</button>`);
    defs.push(`<button class="wx-tile" type="button" data-side="b" data-pair="${i}">${meaning}</button>`);
  }

  return (
    (spec.prompt ? `<p class="wx__lead">${await md(String(spec.prompt))}</p>` : '') +
    // The board is built from these two columns by the runtime, which shuffles the
    // second one. Shuffling here would bake one order into the HTML.
    `<div class="wx-match" data-match hidden>` +
    `<div class="wx-match__col" data-col="a">${terms.join('')}</div>` +
    `<div class="wx-match__col" data-col="b">${defs.join('')}</div>` +
    `</div>` +
    `<p class="wx-match__status" data-match-status hidden aria-live="polite"></p>` +
    `<div class="wx-fallback" data-fallback><table><tbody>${rows.join('')}</tbody></table></div>`
  );
};

/**
 * order — put the steps in the sequence they happen.
 *
 * `items` are authored in the correct order and shuffled in the browser; click to
 * place, click again to take back. Click-to-place rather than drag-and-drop because
 * dragging is unusable by keyboard and awkward on a phone.
 */
const order: Builder = async (spec, where) => {
  const items = asArray(spec.items, where, 'items');
  if (items.length < 3) fail(where, '`items` needs at least 3 entries');

  const tiles: string[] = [];
  const list: string[] = [];
  for (const [i, it] of items.entries()) {
    const label = await md(String(it ?? ''));
    tiles.push(`<button class="wx-tile" type="button" data-order="${i}">${label}</button>`);
    list.push(`<li>${label}</li>`);
  }

  return (
    `<p class="wx__lead">${await md(String(spec.prompt ?? 'Put these in the order they happen.'))}</p>` +
    // The game ships hidden and the plain ordered list ships visible; the runtime
    // swaps them. The tiles live inside the hidden game, so with JavaScript off a
    // learner reads the sequence rather than meeting a row of dead buttons — and
    // the content is in the HTML either way (gate S4).
    `<div class="wx-order" data-order-game hidden>` +
    `<div class="wx-order__pool" data-pool aria-label="Steps to place">${tiles.join('')}</div>` +
    `<ol class="wx-order__slots" data-slots></ol>` +
    `<div class="wx-order__bar">` +
    `<button class="btn btn--primary" type="button" data-order-check disabled>Check order</button>` +
    `<button class="btn" type="button" data-order-reset>Shuffle</button>` +
    `<span class="wx-order__status" data-order-status aria-live="polite"></span>` +
    `</div></div>` +
    `<div class="wx-fallback" data-fallback><ol>${list.join('')}</ol></div>`
  );
};

/**
 * sequence — who says what to whom, in order.
 *
 * Rendered as a list of exchanges rather than the usual swim-lane diagram. Lanes
 * need horizontal room this template does not have: the reading column is 72
 * characters wide, and three actors' worth of lanes squeezes every label into a
 * two-word column. A list of `sender → receiver` rows carries the same information,
 * wraps properly on a phone, stays selectable, and reads correctly aloud.
 */
const sequence: Builder = async (spec, where) => {
  const actors = asArray(spec.actors, where, 'actors').map(String);
  const messages = asArray(spec.messages, where, 'messages') as Array<Record<string, unknown>>;
  // Rendered once and reused: an actor's name appears in the legend and again on
  // every message it takes part in.
  const names = await Promise.all(actors.map((a) => md(a)));

  // With two actors every row already names both, and a legend above them is pure
  // repetition. It earns its place only once there are three or more.
  const legend =
    actors.length > 2
      ? `<div class="wx-seq__legend">${actors
          .map((_a, i) => `<span class="wx-actor" data-actor="${i}">${names[i]}</span>`)
          .join('')}</div>`
      : '';
  const rows: string[] = [];

  for (const [i, m] of messages.entries()) {
    const from = Number(m.from);
    const to = Number(m.to);
    if (!(from >= 0 && from < actors.length) || !(to >= 0 && to < actors.length)) {
      fail(where, `messages[${i}] refers to an actor outside 0..${actors.length - 1}`);
    }
    if (from === to) fail(where, `messages[${i}] goes from an actor to itself`);
    const label = await md(asString(m.label, where, `messages[${i}].label`));
    const note = m.note ? await md(String(m.note)) : '';
    rows.push(
      `<li class="wx-msg" data-msg="${i}"${to < from ? ' data-back' : ''}>` +
        `<div class="wx-msg__wire">` +
        `<span class="wx-actor" data-actor="${from}">${names[from]}</span>` +
        `<span class="wx-msg__arrow" aria-hidden="true"></span>` +
        `<span class="wx-actor" data-actor="${to}">${names[to]}</span>` +
        `</div>` +
        `<div class="wx-msg__label">${label}${note ? `<small>${note}</small>` : ''}</div>` +
        `</li>`,
    );
  }

  return (
    `<div class="wx-seq">` +
    legend +
    `<ol class="wx-seq__msgs">${rows.join('')}</ol>` +
    `<div class="wx-seq__bar" data-seq-bar hidden>` +
    `<button class="btn" type="button" data-seq-step>Step through</button>` +
    `<button class="btn btn--quiet" type="button" data-seq-all>Show all</button>` +
    `<span class="muted" data-seq-status></span>` +
    `</div></div>`
  );
};

/**
 * tree — a hierarchy with a note against each node.
 *
 * Collapsing is `<details>`, which means it works with JavaScript off and needs no
 * runtime module at all. Not everything interactive has to be scripted.
 */
const tree: Builder = async (spec, where) => {
  const root = spec.root as Record<string, unknown> | undefined;
  if (!root || typeof root !== 'object') fail(where, '`root` must be an object');

  async function node(n: Record<string, unknown>, depth: number): Promise<string> {
    const name = asString(n.name, where, 'name');
    const note = n.note ? await md(String(n.note)) : '';
    const kids = Array.isArray(n.children) ? (n.children as Array<Record<string, unknown>>) : [];
    const tone = n.tone ? ` data-tone="${esc(String(n.tone))}"` : '';
    const label =
      `<code class="wx-node__name"${tone}>${esc(name)}</code>` +
      (note ? `<span class="wx-node__note">${note}</span>` : '');

    if (!kids.length) return `<li class="wx-node">${label}</li>`;

    const children: string[] = [];
    for (const k of kids) children.push(await node(k, depth + 1));
    // Deep branches start closed so a large tree is scannable at its top level.
    return (
      `<li class="wx-node wx-node--branch">` +
      `<details${depth < 2 ? ' open' : ''}><summary>${label}</summary>` +
      `<ul>${children.join('')}</ul></details></li>`
    );
  }

  return `<ul class="wx-tree">${await node(root, 0)}</ul>`;
};

const BUILDERS: Record<WidgetKind, Builder> = {
  anatomy,
  flow,
  compare,
  terminal,
  match,
  order,
  sequence,
  tree,
};

/**
 * The whole pass, for a loader to call around `renderMarkdown`.
 * Returns the markdown to render, plus a function that patches the result.
 */
export async function compileWidgets(
  markdown: string,
  where: string,
): Promise<{ markdown: string; inject: (html: string) => string }> {
  const { markdown: stripped, specs } = extractWidgets(markdown, where);
  if (!specs.length) return { markdown, inject: (html) => html };
  const compiled: string[] = [];
  for (const s of specs) compiled.push(await renderWidget(s, where));
  return { markdown: stripped, inject: (html) => injectWidgets(html, compiled) };
}
