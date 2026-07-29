/**
 * Interaction for the visual aids compiled by lib/widgets.ts.
 *
 * Every widget arrives complete and readable. This module's whole job is to add
 * behaviour on top — and the first thing each initialiser does is set
 * `data-enhanced`, which is the CSS hook that switches a widget from its static
 * layout to its interactive one. If this file never runs, nothing here is missed:
 * notes stay listed, outputs stay printed, the answer stays visible.
 *
 * Nothing here writes to storage. A drill is practice, not assessment — scoring it
 * would turn a low-stakes retry into another thing to get wrong.
 */

const reduced = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fisher-Yates, on a copy. */
function shuffled<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i] as T;
    a[i] = a[j] as T;
    a[j] = t;
  }
  return a;
}

/** A shuffle that is guaranteed to move something, so a drill never opens solved. */
function reordered<T>(list: T[]): T[] {
  if (list.length < 2) return list.slice();
  for (let attempt = 0; attempt < 8; attempt++) {
    const a = shuffled(list);
    if (a.some((x, i) => x !== list[i])) return a;
  }
  const a = list.slice();
  const first = a[0] as T;
  a[0] = a[a.length - 1] as T;
  a[a.length - 1] = first;
  return a;
}

// ---------------------------------------------------------------- anatomy

function initAnatomy(root: HTMLElement): void {
  const segs = Array.from(root.querySelectorAll<HTMLButtonElement>('.wx-seg[data-seg]'));
  const notes = Array.from(root.querySelectorAll<HTMLElement>('.wx-note[data-note]'));
  if (!segs.length || !notes.length) return;
  root.setAttribute('data-enhanced', '');

  const select = (key: string): void => {
    for (const s of segs) s.setAttribute('aria-pressed', String(s.getAttribute('data-seg') === key));
    for (const n of notes) {
      if (n.getAttribute('data-note') === key) n.setAttribute('data-active', '');
      else n.removeAttribute('data-active');
    }
  };

  segs.forEach((s, i) => {
    s.setAttribute('aria-pressed', 'false');
    s.addEventListener('click', () => select(s.getAttribute('data-seg') ?? ''));
    // Left/right walks the string, which is how you read one.
    s.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = segs[(i + d + segs.length) % segs.length];
      next?.focus();
      next?.click();
    });
  });

  // Open on the first segment: an empty note slot below a highlighted string reads
  // as something failing to load.
  select(segs[0]?.getAttribute('data-seg') ?? '');
}

// ---------------------------------------------------------------- flow

function initFlow(root: HTMLElement): void {
  const steps = Array.from(root.querySelectorAll<HTMLElement>('.wx-step'));
  const details = Array.from(root.querySelectorAll<HTMLElement>('.wx-step__detail[data-detail]'));
  if (!details.length) return;
  root.setAttribute('data-enhanced', '');

  const detailFor = (key: string): HTMLElement | undefined =>
    details.filter((d) => d.getAttribute('data-detail') === key)[0];

  const open = (key: string): void => {
    for (const s of steps) {
      const mine = s.getAttribute('data-step') === key;
      s.toggleAttribute('data-open', mine);
      s.querySelector('.wx-step__head')?.setAttribute('aria-expanded', String(mine));
    }
    for (const d of details) d.toggleAttribute('data-open', d.getAttribute('data-detail') === key);
  };

  for (const step of steps) {
    const key = step.getAttribute('data-step') ?? '';
    const head = step.querySelector<HTMLButtonElement>('.wx-step__head');
    if (!head || !detailFor(key)) continue;
    head.setAttribute('aria-expanded', 'false');
    head.addEventListener('click', () => open(key));
  }

  // Open the first step that has something to say, so the panel below the chain
  // is never an empty gap.
  open(details[0]?.getAttribute('data-detail') ?? '');
}

// ---------------------------------------------------------------- terminal

function initTerminal(root: HTMLElement): void {
  const lines = Array.from(root.querySelectorAll<HTMLElement>('.wx-line'));
  const runnable = lines.filter((l) => l.querySelector('.wx-run'));
  if (!runnable.length) return;
  root.setAttribute('data-enhanced', '');

  for (const line of runnable) {
    const btn = line.querySelector<HTMLButtonElement>('.wx-run');
    const cmd = line.querySelector('.wx-line__cmd code')?.textContent ?? 'this command';
    if (!btn) continue;
    line.setAttribute('data-hidden', '');
    btn.hidden = false;
    btn.setAttribute('aria-label', `Show the output of ${cmd}`);
    btn.addEventListener('click', () => {
      line.removeAttribute('data-hidden');
      btn.remove();
    });
  }

  // One control to give up on predicting and just read the transcript.
  const all = document.createElement('button');
  all.className = 'wx-run';
  all.type = 'button';
  all.style.marginTop = '.8rem';
  all.textContent = 'Show all output';
  all.addEventListener('click', () => {
    for (const line of runnable) {
      line.removeAttribute('data-hidden');
      line.querySelector('.wx-run')?.remove();
    }
    all.remove();
  });
  root.querySelector('.wx-term')?.appendChild(all);
}

// ---------------------------------------------------------------- match

function initMatch(root: HTMLElement): void {
  const board = root.querySelector<HTMLElement>('[data-match]');
  const status = root.querySelector<HTMLElement>('[data-match-status]');
  if (!board) return;

  const cols = Array.from(board.querySelectorAll<HTMLElement>('.wx-match__col'));
  const [colA, colB] = cols;
  if (!colA || !colB) return;

  const tilesA = Array.from(colA.querySelectorAll<HTMLButtonElement>('.wx-tile'));
  const tilesB = Array.from(colB.querySelectorAll<HTMLButtonElement>('.wx-tile'));
  if (tilesA.length < 3) return;

  root.setAttribute('data-enhanced', '');
  board.hidden = false;
  if (status) status.hidden = false;

  // Both columns are shuffled: leaving the terms in source order would let the
  // whole board be solved by position on a second visit.
  for (const t of reordered(tilesA)) colA.appendChild(t);
  for (const t of reordered(tilesB)) colB.appendChild(t);

  let picked: HTMLButtonElement | null = null;
  let done = 0;
  const total = tilesA.length;

  const say = (msg: string): void => {
    if (!status) return;
    status.textContent = msg;
    if (done === total) status.setAttribute('data-done', '');
  };
  say(`0 of ${total} matched`);

  const pick = (tile: HTMLButtonElement): void => {
    if (tile.hasAttribute('data-done')) return;

    if (picked === tile) {
      tile.removeAttribute('data-picked');
      picked = null;
      return;
    }
    if (!picked || picked.getAttribute('data-side') === tile.getAttribute('data-side')) {
      picked?.removeAttribute('data-picked');
      picked = tile;
      tile.setAttribute('data-picked', '');
      return;
    }

    const hit = picked.getAttribute('data-pair') === tile.getAttribute('data-pair');
    const first = picked;
    picked = null;
    first.removeAttribute('data-picked');

    if (hit) {
      for (const t of [first, tile]) {
        t.setAttribute('data-done', '');
        t.disabled = true;
      }
      done += 1;
      say(done === total ? `All ${total} matched — nicely done.` : `${done} of ${total} matched`);
    } else {
      for (const t of [first, tile]) {
        t.setAttribute('data-wrong', '');
        setTimeout(() => t.removeAttribute('data-wrong'), reduced() ? 200 : 340);
      }
      say(`Not a pair — ${done} of ${total} matched`);
    }
  };

  for (const t of [...tilesA, ...tilesB]) t.addEventListener('click', () => pick(t));
}

// ---------------------------------------------------------------- order

function initOrder(root: HTMLElement): void {
  const game = root.querySelector<HTMLElement>('[data-order-game]');
  const pool = root.querySelector<HTMLElement>('[data-pool]');
  const slots = root.querySelector<HTMLElement>('[data-slots]');
  const check = root.querySelector<HTMLButtonElement>('[data-order-check]');
  const again = root.querySelector<HTMLButtonElement>('[data-order-reset]');
  const status = root.querySelector<HTMLElement>('[data-order-status]');
  // `data-order` is the tile's correct position. They ship in that order, so this
  // list is the answer key — read it before anything is shuffled.
  const source = Array.from(root.querySelectorAll<HTMLButtonElement>('.wx-tile[data-order]'));
  if (!game || !pool || !slots || !source.length) return;

  root.setAttribute('data-enhanced', '');
  game.hidden = false;

  const placed: HTMLButtonElement[] = [];

  const paint = (): void => {
    if (check) check.disabled = placed.length !== source.length;
    slots.innerHTML = '';
    placed.forEach((tile) => {
      const li = document.createElement('li');
      li.appendChild(tile);
      slots.appendChild(li);
    });
    for (let i = placed.length; i < source.length; i++) {
      const li = document.createElement('li');
      const blank = document.createElement('span');
      blank.className = 'wx-tile';
      blank.style.opacity = '.45';
      blank.textContent = '—';
      li.appendChild(blank);
      slots.appendChild(li);
    }
  };

  const reset = (): void => {
    placed.length = 0;
    if (status) status.textContent = '';
    pool.innerHTML = '';
    for (const t of reordered(source)) {
      t.removeAttribute('data-done');
      t.disabled = false;
      pool.appendChild(t);
    }
    paint();
  };

  for (const tile of source) {
    tile.addEventListener('click', () => {
      const at = placed.indexOf(tile);
      if (at >= 0) {
        // Clicking a placed tile takes it back, so a misplacement is not a dead end.
        placed.splice(at, 1);
        pool.appendChild(tile);
      } else {
        placed.push(tile);
      }
      for (const li of Array.from(slots.children)) li.removeAttribute('data-ok');
      if (status) status.textContent = '';
      paint();
    });
  }

  check?.addEventListener('click', () => {
    let right = 0;
    placed.forEach((tile, i) => {
      const ok = Number(tile.getAttribute('data-order')) === i;
      if (ok) right += 1;
      tile.parentElement?.setAttribute(ok ? 'data-ok' : 'data-bad', '');
      if (ok) tile.parentElement?.removeAttribute('data-bad');
      else tile.parentElement?.removeAttribute('data-ok');
    });
    if (status) {
      status.textContent =
        right === source.length
          ? 'That is the order.'
          : `${right} of ${source.length} in the right place.`;
    }
  });

  again?.addEventListener('click', reset);
  reset();
}

// ---------------------------------------------------------------- sequence

function initSequence(root: HTMLElement): void {
  const msgs = Array.from(root.querySelectorAll<HTMLElement>('.wx-msg'));
  const bar = root.querySelector<HTMLElement>('[data-seq-bar]');
  const step = root.querySelector<HTMLButtonElement>('[data-seq-step]');
  const all = root.querySelector<HTMLButtonElement>('[data-seq-all]');
  const status = root.querySelector<HTMLElement>('[data-seq-status]');
  if (msgs.length < 2 || !bar) return;

  root.setAttribute('data-enhanced', '');
  bar.hidden = false;

  let at = -1;
  const paint = (): void => {
    msgs.forEach((m, i) => {
      if (at >= 0 && i > at) m.setAttribute('data-dim', '');
      else m.removeAttribute('data-dim');
    });
    if (status) {
      status.textContent = at < 0 ? '' : `${Math.min(at + 1, msgs.length)} of ${msgs.length}`;
    }
    if (step) step.textContent = at < 0 ? 'Step through' : at >= msgs.length - 1 ? 'Restart' : 'Next';
  };

  step?.addEventListener('click', () => {
    at = at >= msgs.length - 1 ? -1 : at + 1;
    if (at === -1) at = 0;
    paint();
    if (!reduced()) msgs[at]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  all?.addEventListener('click', () => {
    at = -1;
    paint();
  });

  paint();
}

// ----------------------------------------------------------------

const INIT: Record<string, (root: HTMLElement) => void> = {
  anatomy: initAnatomy,
  flow: initFlow,
  terminal: initTerminal,
  match: initMatch,
  order: initOrder,
  sequence: initSequence,
  // `compare` is a table and `tree` is <details>; both are already what they need
  // to be, and wiring JS to them would only add ways to break them.
};

export function initWidgets(): void {
  document.querySelectorAll<HTMLElement>('[data-widget]').forEach((el) => {
    const fn = INIT[el.getAttribute('data-widget') ?? ''];
    if (!fn) return;
    try {
      fn(el);
    } catch (err) {
      // One malformed widget must not take the rest of the page's behaviour with it.
      console.warn('widget failed to initialise', el.getAttribute('data-widget'), err);
    }
  });
}
