/**
 * The pure model behind animated scene visualizations (`assets/viz/*.viz.json`).
 *
 * A scene is elements plus a timeline of named phases; the frame shown at any
 * moment is a *derivation* from `{spec, phase index, progress}` — never mutated
 * state accumulated by callbacks. That one decision is what makes the poster
 * SVG, the no-JS frame, the runtime's Play/Back/Next and a `?vizphase=` test
 * screenshot all provably the same picture.
 *
 * This module is imported by both `lib/viz.ts` (build) and `runtime/viz.ts`
 * (browser bundle), so it must stay free of node and DOM imports.
 */

export type Pt = [number, number];

export type Tone = 'accent' | 'ok' | 'bad' | 'warn' | 'term' | 'ghost';

interface Common {
  id: string;
  /** Not rendered (poster) / display:none (inline) until an action shows it. */
  hidden?: boolean;
  /** Initial `data-state`; the CSS maps states to colour + emphasis. */
  state?: string;
  tone?: Tone;
}

export interface BoxEl extends Common {
  kind: 'box';
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  labelAt?: 'top' | 'center';
  dash?: boolean;
  r?: number;
}

/** A small pill of text, centred on (x, y). The usual moving piece. */
export interface ChipEl extends Common {
  kind: 'chip';
  x: number;
  y: number;
  w?: number;
  label: string;
  mono?: boolean;
}

export interface TextSpan {
  t: string;
  tone?: Tone;
}

export interface TextEl extends Common {
  kind: 'text';
  x: number;
  y: number;
  /** Plain content — swappable by a `text` action. */
  text?: string;
  /** Toned runs on one line — not swappable, but each run keeps its colour. */
  spans?: TextSpan[];
  size?: number;
  mono?: boolean;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
}

export interface WireEl extends Common {
  kind: 'wire';
  points: Pt[];
  arrow?: boolean | 'both';
  dash?: boolean;
  width?: number;
}

export type VizEl = BoxEl | ChipEl | TextEl | WireEl;

export interface VizAction {
  show?: string;
  hide?: string;
  state?: { el: string; value: string };
  text?: { el: string; value: string };
  /** Tween the element's anchor along these absolute points during the phase. */
  move?: { el: string; path: Pt[] };
  /** Instant reposition at phase entry — for reusing a piece across acts. */
  jump?: { el: string; to: Pt };
}

export interface VizPhase {
  id: string;
  title: string;
  narration?: string;
  ms?: number;
  actions?: VizAction[];
}

export interface VizSpec {
  title?: string;
  canvas: { width: number; height: number; minWidth?: number };
  elements: VizEl[];
  phases: VizPhase[];
  /** Phase whose settled state is the poster / no-JS frame. Default: last. */
  poster?: string;
}

export const DEFAULT_PHASE_MS = 1600;

// ---------------------------------------------------------------- state

export interface ElState {
  hidden: boolean;
  state: string;
  /** Overridden plain text, or null for the authored content. */
  text: string | null;
  /** Translation away from the authored anchor. */
  dx: number;
  dy: number;
}

export type Snapshot = Record<string, ElState>;

export function initialSnapshot(spec: VizSpec): Snapshot {
  const snap: Snapshot = {};
  for (const el of spec.elements) {
    snap[el.id] = { hidden: !!el.hidden, state: el.state ?? '', text: null, dx: 0, dy: 0 };
  }
  return snap;
}

const anchorOf = (el: VizEl): Pt =>
  el.kind === 'wire' ? (el.points[0] as Pt) : [el.x, el.y];

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Point at fraction `t` of the polyline's total length. */
export function pointAlong(path: Pt[], t: number): Pt {
  if (path.length === 0) return [0, 0];
  const first = path[0] as Pt;
  if (path.length === 1) return first;
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1] as Pt;
    const [bx, by] = path[i] as Pt;
    const d = Math.hypot(bx - ax, by - ay);
    lens.push(d);
    total += d;
  }
  if (total === 0) return first;
  let want = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < lens.length; i++) {
    const d = lens[i] as number;
    if (want <= d || i === lens.length - 1) {
      const [ax, ay] = path[i] as Pt;
      const [bx, by] = path[i + 1] as Pt;
      const f = d === 0 ? 0 : want / d;
      return [ax + (bx - ax) * f, ay + (by - ay) * f];
    }
    want -= d;
  }
  return path[path.length - 1] as Pt;
}

/**
 * Apply one phase onto a snapshot. Instant actions land at phase entry;
 * `move` places its element `progress` of the way along the path (eased).
 * Mutates and returns `snap` — callers hand in their own copy.
 */
export function applyPhase(
  snap: Snapshot,
  spec: VizSpec,
  phase: VizPhase,
  progress = 1,
): Snapshot {
  const anchors: Record<string, Pt> = {};
  const anchor = (id: string): Pt => {
    if (!anchors[id]) {
      const el = spec.elements.find((e) => e.id === id);
      anchors[id] = el ? anchorOf(el) : [0, 0];
    }
    return anchors[id] as Pt;
  };

  for (const a of phase.actions ?? []) {
    if (a.show && snap[a.show]) (snap[a.show] as ElState).hidden = false;
    if (a.hide && snap[a.hide]) (snap[a.hide] as ElState).hidden = true;
    if (a.state && snap[a.state.el]) (snap[a.state.el] as ElState).state = a.state.value;
    if (a.text && snap[a.text.el]) (snap[a.text.el] as ElState).text = a.text.value;
    if (a.jump && snap[a.jump.el]) {
      const s = snap[a.jump.el] as ElState;
      const [ax, ay] = anchor(a.jump.el);
      s.dx = a.jump.to[0] - ax;
      s.dy = a.jump.to[1] - ay;
    }
    if (a.move && snap[a.move.el]) {
      const s = snap[a.move.el] as ElState;
      const [px, py] = pointAlong(a.move.path, easeInOut(progress));
      const [ax, ay] = anchor(a.move.el);
      s.dx = px - ax;
      s.dy = py - ay;
    }
  }
  return snap;
}

/**
 * The settled state after phases 0..index inclusive (-1 = before anything).
 * This is the runtime's jump target and the build's poster frame.
 */
export function snapshotAt(spec: VizSpec, index: number): Snapshot {
  const snap = initialSnapshot(spec);
  for (let i = 0; i <= Math.min(index, spec.phases.length - 1); i++) {
    applyPhase(snap, spec, spec.phases[i] as VizPhase, 1);
  }
  return snap;
}

export function posterIndex(spec: VizSpec): number {
  if (!spec.poster) return spec.phases.length - 1;
  return spec.phases.findIndex((p) => p.id === spec.poster);
}

// ---------------------------------------------------------------- validation

function bad(where: string, msg: string): never {
  throw new Error(`viz in ${where}: ${msg}`);
}

const isPt = (p: unknown): p is Pt =>
  Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n));

const TONES: readonly string[] = ['accent', 'ok', 'bad', 'warn', 'term', 'ghost'];

/** Throws with the file named on the first structural problem. */
export function validateViz(raw: unknown, where: string): VizSpec {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad(where, 'spec must be a JSON object');
  const spec = raw as VizSpec;

  const c = spec.canvas;
  if (!c || typeof c.width !== 'number' || typeof c.height !== 'number' || c.width <= 0 || c.height <= 0) {
    bad(where, '`canvas` needs positive numeric `width` and `height`');
  }

  if (!Array.isArray(spec.elements) || !spec.elements.length) bad(where, '`elements` must be a non-empty array');
  const ids = new Set<string>();
  for (const [i, el] of spec.elements.entries()) {
    if (!el || typeof el !== 'object') bad(where, `elements[${i}] must be an object`);
    if (typeof el.id !== 'string' || !el.id) bad(where, `elements[${i}] needs an \`id\``);
    // Ids land in attribute selectors verbatim (runtime/viz.ts), so keep them
    // to a charset that needs no escaping anywhere.
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(el.id)) {
      bad(where, `element id "${el.id}" must be letters, digits, - or _ (starting with a letter)`);
    }
    if (ids.has(el.id)) bad(where, `duplicate element id "${el.id}"`);
    ids.add(el.id);
    if (el.tone && !TONES.includes(el.tone)) bad(where, `"${el.id}": unknown tone "${el.tone}"`);
    switch (el.kind) {
      case 'box':
        if (![el.x, el.y, el.w, el.h].every((n) => typeof n === 'number')) {
          bad(where, `box "${el.id}" needs numeric x, y, w, h`);
        }
        break;
      case 'chip':
        if (typeof el.x !== 'number' || typeof el.y !== 'number') bad(where, `chip "${el.id}" needs numeric x, y`);
        if (typeof el.label !== 'string' || !el.label) bad(where, `chip "${el.id}" needs a \`label\``);
        break;
      case 'text':
        if (typeof el.x !== 'number' || typeof el.y !== 'number') bad(where, `text "${el.id}" needs numeric x, y`);
        if (!el.text && !Array.isArray(el.spans)) bad(where, `text "${el.id}" needs \`text\` or \`spans\``);
        if (Array.isArray(el.spans)) {
          for (const [si, s] of el.spans.entries()) {
            if (!s || typeof s.t !== 'string') bad(where, `text "${el.id}" spans[${si}] needs a \`t\` string`);
            if (s.tone && !TONES.includes(s.tone)) bad(where, `text "${el.id}" spans[${si}]: unknown tone`);
          }
        }
        break;
      case 'wire':
        if (!Array.isArray(el.points) || el.points.length < 2 || !el.points.every(isPt)) {
          bad(where, `wire "${el.id}" needs \`points\` — at least two [x, y] pairs`);
        }
        break;
      default:
        bad(where, `elements[${i}] has unknown kind "${String((el as { kind?: unknown }).kind)}"`);
    }
  }

  if (!Array.isArray(spec.phases) || !spec.phases.length) bad(where, '`phases` must be a non-empty array');
  const phaseIds = new Set<string>();
  for (const [i, p] of spec.phases.entries()) {
    if (!p || typeof p.id !== 'string' || !p.id) bad(where, `phases[${i}] needs an \`id\``);
    if (phaseIds.has(p.id)) bad(where, `duplicate phase id "${p.id}"`);
    phaseIds.add(p.id);
    if (typeof p.title !== 'string' || !p.title) bad(where, `phase "${p.id}" needs a \`title\``);
    if (p.ms !== undefined && (typeof p.ms !== 'number' || p.ms <= 0)) bad(where, `phase "${p.id}": \`ms\` must be positive`);
    for (const [ai, a] of (p.actions ?? []).entries()) {
      const at = `phase "${p.id}" actions[${ai}]`;
      const refs = [a.show, a.hide, a.state?.el, a.text?.el, a.move?.el, a.jump?.el].filter(
        (r): r is string => typeof r === 'string',
      );
      if (!refs.length) bad(where, `${at} does nothing — needs show/hide/state/text/move/jump`);
      for (const r of refs) if (!ids.has(r)) bad(where, `${at} refers to unknown element "${r}"`);
      if (a.move && (!Array.isArray(a.move.path) || a.move.path.length < 2 || !a.move.path.every(isPt))) {
        bad(where, `${at}: \`move.path\` needs at least two [x, y] pairs`);
      }
      if (a.jump && !isPt(a.jump.to)) bad(where, `${at}: \`jump.to\` must be an [x, y] pair`);
      for (const mv of [a.move?.el, a.jump?.el]) {
        if (!mv) continue;
        const el = spec.elements.find((e) => e.id === mv);
        if (el?.kind === 'wire') bad(where, `${at}: a wire cannot move — move a chip or text instead`);
      }
      if (a.text) {
        const el = spec.elements.find((e) => e.id === a.text?.el);
        if (el && el.kind !== 'text') bad(where, `${at}: \`text\` can only retarget a text element`);
        if (el?.kind === 'text' && el.spans) bad(where, `${at}: "${el.id}" uses spans and cannot be swapped`);
      }
    }
  }

  if (spec.poster && !phaseIds.has(spec.poster)) {
    bad(where, `\`poster\` names phase "${spec.poster}" which does not exist`);
  }
  return spec;
}
