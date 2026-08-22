/**
 * Interaction for the scene visualizations compiled by lib/viz.ts.
 *
 * The figure arrives settled at its poster phase with the full phase list
 * printed below it — complete without this file. Enhancement rewinds the scene
 * to phase 0 and adds a transport: one clock, frames derived purely from
 * `{phase, progress}` via the same viz-model functions the build used, so
 * pause, step, replay and a `?vizphase=N` screenshot all land on identical
 * pixels. No timing accumulates across callbacks — jumping to phase N replays
 * phases 0..N from the initial snapshot every time.
 *
 * Reduced motion drops the Play clock entirely and leaves Back/Next stepping,
 * which lands each phase's settled frame instantly — same information, no
 * motion. Offscreen, an IntersectionObserver parks the clock.
 */

import {
  applyPhase,
  initialSnapshot,
  snapshotAt,
  type ElState,
  type Snapshot,
  type VizPhase,
  type VizSpec,
} from '../lib/viz-model';

const reduced = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** ~30 fps is plenty — these are diagrams, not games. */
const FRAME_MS = 33;

interface Payload {
  /** [id, x, y, hidden, state, authored text (0 when not swappable)] */
  els: Array<[string, number, number, number, string, string | 0]>;
  phases: Array<{ id: string; ms: number; actions: VizPhase['actions'] }>;
  poster: number;
}

/** Rebuild a spec-shaped object the shared snapshot functions can consume.
 *  Every element becomes a chip — snapshots only need ids and anchors. */
function specFrom(p: Payload): VizSpec {
  return {
    canvas: { width: 0, height: 0 },
    elements: p.els.map(([id, x, y, hidden, state]) => ({
      kind: 'chip',
      id,
      x,
      y,
      label: '',
      hidden: hidden === 1,
      state: state || undefined,
    })),
    phases: p.phases.map((ph) => ({ id: ph.id, title: ph.id, ms: ph.ms, actions: ph.actions })),
  };
}

function initViz(root: HTMLElement): void {
  const island = root.querySelector<HTMLElement>('script[data-viz-timeline]');
  const svg = root.querySelector<SVGSVGElement>('.viz__svg');
  const bar = root.querySelector<HTMLElement>('[data-viz-bar]');
  if (!island || !svg || !bar) return;

  const payload = JSON.parse(island.textContent ?? '') as Payload;
  const spec = specFrom(payload);
  const total = spec.phases.length;
  if (!total) return;

  const nodes = new Map<string, SVGElement>();
  // Authored text comes from the payload, never the DOM: the shipped SVG is
  // settled at the poster phase, so its textContent may already be a later
  // phase's override.
  const authoredText = new Map<string, string>();
  for (const [id, , , , , text] of payload.els) {
    if (typeof text === 'string') authoredText.set(id, text);
  }
  for (const el of spec.elements) {
    // Ids are validated at build time to a selector-safe charset, so no
    // CSS.escape here — which jsdom (the runtime test harness) lacks anyway.
    const node = svg.querySelector<SVGElement>(`[data-el="${el.id}"]`);
    if (node) nodes.set(el.id, node);
  }

  const play = root.querySelector<HTMLButtonElement>('[data-viz-play]');
  const prev = root.querySelector<HTMLButtonElement>('[data-viz-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-viz-next]');
  const status = root.querySelector<HTMLElement>('[data-viz-status]');
  const phaseItems = Array.from(root.querySelectorAll<HTMLElement>('.viz__phase[data-phase]'));
  const gotos = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-viz-goto]'));

  root.setAttribute('data-enhanced', '');
  bar.hidden = false;
  for (const b of gotos) b.disabled = false;

  const noMotion = reduced();
  if (noMotion && play) play.hidden = true;

  // ---- state ----------------------------------------------------------
  let at = 0; // current phase index
  let playing = false;
  let phaseStart = 0; // clock ms when the current phase began
  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  let parkedAt = 0; // clock position banked while offscreen

  const paint = (snap: Snapshot): void => {
    for (const el of spec.elements) {
      const node = nodes.get(el.id);
      const s = snap[el.id] as ElState;
      if (!node || !s) continue;
      node.toggleAttribute('data-hidden', s.hidden);
      if (s.state) node.setAttribute('data-state', s.state);
      else node.removeAttribute('data-state');
      if (s.dx || s.dy) node.setAttribute('transform', `translate(${s.dx} ${s.dy})`);
      else node.removeAttribute('transform');
      const original = authoredText.get(el.id);
      if (original !== undefined) node.textContent = s.text ?? original;
    }
  };

  const phaseTitle = (i: number): string =>
    phaseItems[i]?.querySelector('b')?.textContent ?? spec.phases[i]?.id ?? '';

  const say = (): void => {
    if (status) status.textContent = `${at + 1} of ${total} — ${phaseTitle(at)}`;
    phaseItems.forEach((li, i) => li.toggleAttribute('data-active', i === at));
    if (prev) prev.disabled = at <= 0;
    if (next) next.disabled = false;
    if (play) play.textContent = playing ? 'Pause' : at >= total - 1 ? 'Replay' : 'Play';
  };

  /** Settle on phase `i`: derived frame, no residue from wherever we were. */
  const settle = (i: number): void => {
    at = Math.max(0, Math.min(i, total - 1));
    paint(snapshotAt(spec, at));
    say();
  };

  const stop = (): void => {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    say();
  };

  const tick = (now: number): void => {
    if (!playing) return;
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    const phase = spec.phases[at] as VizPhase;
    const ms = phase.ms ?? 1600;
    const progress = Math.min((now - phaseStart) / ms, 1);

    // Derive the frame: settled history, then the live phase at `progress`.
    const snap = at > 0 ? snapshotAt(spec, at - 1) : initialSnapshot(spec);
    applyPhase(snap, spec, phase, progress);
    paint(snap);

    if (progress >= 1) {
      if (at >= total - 1) {
        stop();
        return;
      }
      at += 1;
      phaseStart = now;
      say();
    }
  };

  const start = (from: number): void => {
    at = Math.max(0, Math.min(from, total - 1));
    playing = true;
    phaseStart = performance.now();
    lastFrame = 0;
    say();
    raf = requestAnimationFrame(tick);
  };

  play?.addEventListener('click', () => {
    if (playing) stop();
    else if (at >= total - 1) { settle(0); start(0); }
    else start(at);
  });
  prev?.addEventListener('click', () => { stop(); settle(at - 1); });
  next?.addEventListener('click', () => {
    stop();
    settle(at >= total - 1 ? 0 : at + 1);
  });
  for (const b of gotos) {
    b.addEventListener('click', () => {
      stop();
      settle(Number(b.getAttribute('data-viz-goto')));
    });
  }

  // Park the clock offscreen; re-base it on return so motion resumes where it
  // paused instead of leaping to wherever wall time got to.
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting === visible) continue;
          visible = e.isIntersecting;
          if (!visible) parkedAt = performance.now() - phaseStart;
          else phaseStart = performance.now() - parkedAt;
        }
      },
      { rootMargin: '80px' },
    ).observe(root);
  }

  // Deterministic frame override for screenshots and visual tests:
  // ?vizphase=N settles every scene on phase N (1-based in the URL).
  const want = new URLSearchParams(location.search).get('vizphase');
  const wanted = want === null ? NaN : Number(want) - 1;
  settle(Number.isFinite(wanted) ? wanted : 0);
}

export function initVizScenes(): void {
  document.querySelectorAll<HTMLElement>('[data-viz]').forEach((el) => {
    try {
      initViz(el);
    } catch (err) {
      // A malformed scene must not take the rest of the page's behaviour with it.
      console.warn('viz failed to initialise', el.getAttribute('data-viz'), err);
    }
  });
}
