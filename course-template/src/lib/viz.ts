import fs from 'node:fs';
import path from 'node:path';
import { courseFile } from './course';
import { renderInline } from './md';
import { esc } from './widgets';
import {
  DEFAULT_PHASE_MS,
  posterIndex,
  snapshotAt,
  validateViz,
  type BoxEl,
  type ChipEl,
  type ElState,
  type Snapshot,
  type TextEl,
  type Tone,
  type VizEl,
  type VizSpec,
  type WireEl,
} from './viz-model';

/**
 * Animated scene visualizations — a simulation authored as a spec file beside
 * the course's assets, embedded in markdown as a plain image:
 *
 *   ![alt text](assets/viz/three-attempts.svg "Caption")
 *
 * with `assets/viz/three-attempts.viz.json` next to it. Why an image and not a
 * fence: a scene spec runs to hundreds of lines, and inlining it would bury the
 * prose and break every renderer that is not this site. As an image reference,
 * GitHub and any plain markdown viewer show a real (static) diagram — this
 * module *generates* that poster SVG from the spec, so the two cannot drift —
 * while the site build swaps the image for the live inline scene.
 *
 * The inline scene ships settled at the spec's `poster` phase with every
 * phase's narration listed below it, so a reader with JavaScript off gets the
 * most informative frame plus the whole story (gate S4). The runtime rewinds
 * it to phase 0 and adds the clock and controls.
 */

const MD_VIZ_IMAGE =
  /!\[([^\]]*)\]\(\s*(assets\/viz\/[^)\s]+\.svg)\s*(?:(?:"([^"]*)")|(?:'([^']*)'))?\s*\)/g;

const token = (i: number): string => `CSVIZMOUNT${i}ENDCSVIZMOUNT`;

function fail(where: string, msg: string): never {
  throw new Error(`viz in ${where}: ${msg}`);
}

// ---------------------------------------------------------------- palette
//
// The poster is a standalone file: no stylesheet reaches it, so every colour is
// baked in — always the light theme, because README-hosted images sit on
// unknown backgrounds and the light values are the ones with a safe floor.
// `styles/viz.css` maps the same tone/state names for the inline scene; if a
// tone is added here it must be added there.

const P = {
  surface: '#ffffff',
  surface2: '#f2f3f5',
  border: '#dfe2e8',
  borderStrong: '#c8cdd7',
  text: '#16181d',
  dim: '#5c626e',
  faint: '#868d9b',
  accent: '#3f7ac4',
  accentWash: '#eef3fa',
  ok: '#1f7a4d',
  okBg: '#e8f5ee',
  bad: '#b3261e',
  badBg: '#fdecea',
  warn: '#8a5a00',
  warnBg: '#fdf3e0',
  termBg: '#14171e',
  termInk: '#dfe4ee',
  termDim: '#838c9d',
  termAccent: '#7fd1a0',
} as const;

const FONT = `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

interface Paint {
  fill: string;
  stroke: string;
  ink: string;
}

/** State wins over tone; tone wins over the neutral default. */
function paintFor(tone: Tone | undefined, state: string): Paint {
  const key = state || tone || '';
  switch (key) {
    case 'accent':
    case 'active':
      return { fill: P.accentWash, stroke: P.accent, ink: P.accent };
    case 'ok':
      return { fill: P.okBg, stroke: P.ok, ink: P.ok };
    case 'bad':
      return { fill: P.badBg, stroke: P.bad, ink: P.bad };
    case 'warn':
      return { fill: P.warnBg, stroke: P.warn, ink: P.warn };
    case 'term':
      return { fill: P.termBg, stroke: P.termBg, ink: P.termInk };
    case 'ghost':
    case 'dim':
      return { fill: 'none', stroke: P.border, ink: P.faint };
    default:
      return { fill: P.surface2, stroke: P.borderStrong, ink: P.text };
  }
}

const spanInk = (tone: Tone | undefined, base: string): string => {
  switch (tone) {
    case 'accent': return P.accent;
    case 'ok': return P.ok;
    case 'bad': return P.bad;
    case 'warn': return P.warn;
    case 'term': return P.termAccent;
    case 'ghost': return P.termDim;
    default: return base;
  }
};

// ---------------------------------------------------------------- svg

export const chipWidth = (el: ChipEl): number =>
  el.w ?? Math.round(el.label.length * (el.mono ? 7.4 : 6.9)) + 20;

const CHIP_H = 24;

const attrs = (pairs: Record<string, string | number | undefined>): string =>
  Object.entries(pairs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join('');

/** One element at one state. `poster` bakes colours; inline leaves them to CSS. */
function renderEl(el: VizEl, s: ElState, poster: boolean): string {
  if (poster && s.hidden) return '';
  const paint = poster ? paintFor(el.tone, s.state) : null;
  const common = {
    'data-el': el.id,
    'data-tone': el.tone,
    'data-state': s.state || undefined,
    // Must be a non-empty value: `attrs` drops '' along with undefined, so an
    // empty marker silently vanished and every element hidden at the poster
    // phase rendered anyway in the no-JS frame (the runtime's own
    // `toggleAttribute` writes '', and `[data-hidden]` matches either form).
    'data-hidden': !poster && s.hidden ? 'true' : undefined,
    transform: s.dx || s.dy ? `translate(${round(s.dx)} ${round(s.dy)})` : undefined,
  };

  switch (el.kind) {
    case 'box':
      return renderBox(el, s, common, paint);
    case 'chip':
      return renderChip(el, s, common, paint);
    case 'text':
      return renderText(el, s, common, paint);
    case 'wire':
      return renderWire(el, common, paint);
  }
}

const round = (n: number): number => Math.round(n * 10) / 10;

type Common = Record<string, string | number | undefined>;

function renderBox(el: BoxEl, s: ElState, common: Common, paint: Paint | null): string {
  const rect =
    `<rect${attrs({
      x: el.x, y: el.y, width: el.w, height: el.h, rx: el.r ?? 10,
      fill: paint?.fill, stroke: paint?.stroke,
      'stroke-width': paint ? 1.4 : undefined,
      'stroke-dasharray': el.dash ? '6 5' : undefined,
    })}/>`;
  const label = el.label ?? '';
  const center = el.labelAt === 'center';
  const text = label
    ? `<text${attrs({
        x: center ? el.x + el.w / 2 : el.x + 12,
        y: center ? el.y + el.h / 2 + 4.5 : el.y + 20,
        'text-anchor': center ? 'middle' : undefined,
        'font-family': paint ? FONT : undefined,
        'font-size': 12.5,
        'font-weight': 600,
        fill: paint ? (el.tone === 'term' ? P.termDim : paint.ink === P.text ? P.dim : paint.ink) : undefined,
      })} class="vz-box__label">${esc(label)}</text>`
    : '';
  return `<g class="vz vz-box"${attrs(common)}>${rect}${text}</g>`;
}

function renderChip(el: ChipEl, s: ElState, common: Common, paint: Paint | null): string {
  const w = chipWidth(el);
  const rect = `<rect${attrs({
    x: round(el.x - w / 2), y: round(el.y - CHIP_H / 2), width: w, height: CHIP_H, rx: CHIP_H / 2,
    fill: paint?.fill, stroke: paint?.stroke, 'stroke-width': paint ? 1.4 : undefined,
  })}/>`;
  const text = `<text${attrs({
    x: el.x, y: el.y + 4,
    'text-anchor': 'middle',
    'font-family': paint ? (el.mono ? MONO : FONT) : undefined,
    'font-size': el.mono ? 11.5 : 11.5,
    'font-weight': 600,
    fill: paint?.ink,
  })}${el.mono ? ' class="vz-mono"' : ''}>${esc(s.text ?? el.label)}</text>`;
  return `<g class="vz vz-chip"${attrs(common)}>${rect}${text}</g>`;
}

function renderText(el: TextEl, s: ElState, common: Common, paint: Paint | null): string {
  const size = el.size ?? 13;
  const body = el.spans
    ? el.spans
        .map(
          (sp) =>
            `<tspan${attrs({
              'data-tone': sp.tone,
              fill: paint ? spanInk(sp.tone, el.tone === 'term' ? P.termInk : paint.ink) : undefined,
            })}>${esc(sp.t)}</tspan>`,
        )
        .join('')
    : esc(s.text ?? el.text ?? '');
  return `<text class="vz vz-text${el.mono ? ' vz-mono' : ''}"${attrs({
    ...common,
    x: el.x, y: el.y,
    'text-anchor': el.anchor,
    'font-family': paint ? (el.mono ? MONO : FONT) : undefined,
    'font-size': size,
    'font-weight': el.weight,
    fill: paint ? spanInk(el.tone, P.text) : undefined,
  })}>${body}</text>`;
}

function renderWire(el: WireEl, common: Common, paint: Paint | null): string {
  const pts = el.points;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const width = el.width ?? 2;
  const parts = [
    `<path${attrs({
      d,
      fill: 'none',
      stroke: paint ? (paint.stroke === P.borderStrong ? P.borderStrong : paint.stroke) : undefined,
      'stroke-width': width,
      'stroke-dasharray': el.dash ? '6 5' : undefined,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })} class="vz-wire__path"/>`,
  ];
  // Arrowheads are drawn as polygons, not <marker>s: the same code then serves
  // the standalone poster (markers cannot inherit a themed stroke) and the
  // inline scene, and jsdom needs no layout to test either.
  const heads: Array<[Pt2, Pt2]> = [];
  if (el.arrow === true || el.arrow === 'both') heads.push([pts[pts.length - 2] as Pt2, pts[pts.length - 1] as Pt2]);
  if (el.arrow === 'both') heads.push([pts[1] as Pt2, pts[0] as Pt2]);
  for (const [from, to] of heads) {
    const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
    const size = 5 + width;
    const p = (a: number, r: number): string =>
      `${round(to[0] - Math.cos(ang + a) * r)},${round(to[1] - Math.sin(ang + a) * r)}`;
    parts.push(
      `<polygon points="${to[0]},${to[1]} ${p(0.42, size)} ${p(-0.42, size)}"${attrs({
        fill: paint ? paint.stroke : undefined,
      })} class="vz-wire__head"/>`,
    );
  }
  return `<g class="vz vz-wire"${attrs(common)}>${parts.join('')}</g>`;
}

type Pt2 = [number, number];

function renderScene(spec: VizSpec, snap: Snapshot, opts: { poster: boolean; alt: string }): string {
  const { width, height, minWidth } = spec.canvas;
  const body = spec.elements
    .map((el) => renderEl(el, snap[el.id] as ElState, opts.poster))
    .join('');
  if (opts.poster) {
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
      `viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(opts.alt)}">` +
      `<title>${esc(opts.alt)}</title>` +
      `<rect width="${width}" height="${height}" fill="${P.surface}" rx="12"/>` +
      body +
      `</svg>`
    );
  }
  const mw = minWidth ? ` style="min-width:${minWidth}px"` : '';
  return (
    `<svg class="viz__svg" viewBox="0 0 ${width} ${height}" role="img" ` +
    `aria-label="${esc(opts.alt)}" preserveAspectRatio="xMidYMid meet"${mw}>${body}</svg>`
  );
}

// ---------------------------------------------------------------- figure

/** The compact spec the runtime rebuilds snapshots from — anchors and timeline
 *  only; labels and narration already live in the markup. Swappable text ships
 *  here too: the inline SVG is settled at the poster phase, so the DOM cannot
 *  be trusted as the source of an element's *authored* text. */
function runtimePayload(spec: VizSpec): string {
  return JSON.stringify({
    els: spec.elements.map((el) => [
      el.id,
      ...(el.kind === 'wire' ? (el.points[0] as Pt2) : [el.x, el.y]),
      el.hidden ? 1 : 0,
      el.state ?? '',
      el.kind === 'text' && typeof el.text === 'string' ? el.text : 0,
    ]),
    phases: spec.phases.map((p) => ({ id: p.id, ms: p.ms ?? DEFAULT_PHASE_MS, actions: p.actions ?? [] })),
    poster: posterIndex(spec),
  });
}

async function renderVizFigure(
  spec: VizSpec,
  name: string,
  alt: string,
  captionMd: string | undefined,
): Promise<string> {
  const at = posterIndex(spec);
  const svg = renderScene(spec, snapshotAt(spec, at), { poster: false, alt });

  const items: string[] = [];
  for (const [i, p] of spec.phases.entries()) {
    const narration = p.narration ? await renderInline(p.narration) : '';
    items.push(
      `<li class="viz__phase" data-phase="${i}">` +
        `<button type="button" class="viz__phase-btn" data-viz-goto="${i}" disabled>` +
        `<span class="viz__phase-n" aria-hidden="true">${i + 1}</span>` +
        `<span class="viz__phase-text"><b>${await renderInline(p.title)}</b>` +
        (narration ? ` <span class="viz__phase-note">${narration}</span>` : '') +
        `</span></button></li>`,
    );
  }

  const caption = captionMd ? await renderInline(captionMd) : '';
  const title = spec.title ? await renderInline(spec.title) : '';

  return (
    `<figure class="wx wx--viz viz" data-viz="${esc(name)}">` +
    `<div class="wx__head"><span class="wx__kind">Simulation</span>` +
    (title ? `<b class="wx__title">${title}</b>` : '') +
    `</div>` +
    `<div class="viz__stage">${svg}</div>` +
    `<div class="viz__bar" data-viz-bar hidden>` +
    `<button class="btn btn--primary" type="button" data-viz-play>Play</button>` +
    `<button class="btn" type="button" data-viz-prev aria-label="Previous phase">&#8592; Back</button>` +
    `<button class="btn" type="button" data-viz-next aria-label="Next phase">Next &#8594;</button>` +
    `<span class="viz__status" data-viz-status aria-live="polite"></span>` +
    `</div>` +
    `<ol class="viz__phases" data-viz-phases>${items.join('')}</ol>` +
    (caption ? `<figcaption class="wx__cap">${caption}</figcaption>` : '') +
    `<script type="application/json" data-viz-timeline>${runtimePayload(spec)
      // A literal `</script>` inside the JSON would end the island early.
      .replace(/</g, '\\u003c')}</script>` +
    `</figure>`
  );
}

// ---------------------------------------------------------------- compile

export interface ExtractedViz {
  markdown: string;
  refs: Array<{ src: string; alt: string; caption?: string }>;
}

/** Lift viz image references — only those whose sibling spec exists. */
export function extractViz(markdown: string, where: string): ExtractedViz {
  const refs: ExtractedViz['refs'] = [];
  const out = markdown.replace(MD_VIZ_IMAGE, (m, alt: string, src: string, c1?: string, c2?: string) => {
    const specPath = courseFile(src.replace(/\.svg$/, '.viz.json'));
    if (!fs.existsSync(specPath)) return m; // an ordinary image; the figure pass owns it
    if (!alt || alt.trim().length < 8) {
      fail(where, `${src}: alt text must describe the scene (\u2265 8 chars)`);
    }
    const i = refs.length;
    refs.push({ src, alt: alt.trim(), caption: (c1 ?? c2)?.trim() || undefined });
    return `\n\n${token(i)}\n\n`;
  });
  return { markdown: out, refs };
}

export function injectViz(html: string, compiled: string[]): string {
  let out = html;
  compiled.forEach((figure, i) => {
    const t = token(i);
    out = out.replace(new RegExp(`<p>\\s*${t}\\s*</p>`, 'g'), figure).replace(t, figure);
  });
  return out;
}

/**
 * Regenerate the poster beside the spec when it is missing or stale. The write
 * is content-compared so repeated builds are no-ops, and it lands in the course
 * directory (the documented home for generated visuals) so the markdown's image
 * reference works on GitHub and in any plain renderer.
 */
function refreshPoster(spec: VizSpec, src: string, alt: string): void {
  const abs = courseFile(src);
  const svg = renderScene(spec, snapshotAt(spec, posterIndex(spec)), { poster: true, alt }) + '\n';
  const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (current === svg) return;
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, svg);
  console.log(`viz: ${current === null ? 'wrote' : 'refreshed'} poster ${src}`);
}

/** The whole pass, called before the figure pass so it claims its images first. */
export async function compileViz(
  markdown: string,
  where: string,
): Promise<{ markdown: string; inject: (html: string) => string }> {
  const { markdown: stripped, refs } = extractViz(markdown, where);
  if (!refs.length) return { markdown, inject: (html) => html };

  const compiled: string[] = [];
  for (const ref of refs) {
    const rel = ref.src.replace(/\.svg$/, '.viz.json');
    const name = path.basename(ref.src, '.svg');
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(courseFile(rel), 'utf8'));
    } catch (err) {
      fail(where, `${rel} is not valid JSON — ${(err as Error).message}`);
    }
    const spec = validateViz(raw, `${where} → ${rel}`);
    refreshPoster(spec, ref.src, ref.alt);
    compiled.push(await renderVizFigure(spec, name, ref.alt, ref.caption));
  }
  return { markdown: stripped, inject: (html) => injectViz(html, compiled) };
}
