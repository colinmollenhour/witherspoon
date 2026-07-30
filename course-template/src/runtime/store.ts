import { KEY, VERSION } from './config';
import type { State } from './types';

/**
 * The entire persistence layer. localStorage is allowed to be missing, full,
 * corrupt, or shared across tabs, and every one of those has to be survivable.
 *
 * Gate S5: this module is the ONLY place in the site that touches `localStorage`.
 * Every read and write goes through the try/catch wrapper below, and reset removes
 * exactly one namespaced key — never `clear()`, since other courses and other apps
 * may share the origin.
 */

let mem: State | null = null;
let warned = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners: Array<() => void> = [];

// Feature detection must be an actual write: Safari private mode exposes the API
// and throws on setItem, so `'localStorage' in window` is not enough.
let ok = false;
try {
  const probe = '__cs__';
  localStorage.setItem(probe, '1');
  localStorage.removeItem(probe);
  ok = true;
} catch {
  ok = false;
}

function blank(): State {
  return {
    v: VERSION,
    name: null,
    theme: 'light',
    lastVisited: null,
    topics: {},
    tests: {},
    projects: {},
  };
}

/** Built node-by-node rather than via innerHTML: this can fire before the body
 *  is parsed. Stated once, then never again. */
function notice(msg: string): void {
  if (warned) return;
  warned = true;
  const mount = (): void => {
    if (!document.body) return;
    const b = document.createElement('div');
    b.className = 'banner';
    b.setAttribute('role', 'status');
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const span = document.createElement('span');
    span.textContent = msg;
    const btn = document.createElement('button');
    btn.className = 'btn btn--quiet';
    btn.type = 'button';
    btn.style.marginLeft = 'auto';
    btn.textContent = 'Dismiss';
    btn.addEventListener('click', () => b.remove());
    wrap.appendChild(span);
    wrap.appendChild(btn);
    b.appendChild(wrap);
    document.body.insertBefore(b, document.body.firstChild);
  };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
}

function load(): State {
  if (mem) return mem;
  if (!ok) {
    mem = blank();
    return mem;
  }
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (!raw) {
    mem = blank();
    return mem;
  }
  let data: unknown = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }
  const rec = data as State | null;
  if (!rec || typeof rec !== 'object' || rec.v !== VERSION) {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* nothing else to do */
    }
    notice('Saved progress was from an older version and has been reset.');
    mem = blank();
    return mem;
  }
  // Defensive: a hand-edited or partially-written blob must not crash a render.
  for (const k of ['topics', 'tests', 'projects'] as const) {
    const v = rec[k] as unknown;
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      (rec as unknown as Record<string, unknown>)[k] = {};
    }
  }
  mem = rec;
  return mem;
}

function persist(): void {
  if (!ok) return;
  const d = load();
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return;
  } catch {
    // Quota: shed the least important data first. Never lose a quiz score to a
    // quota error caused by project checklists.
    try {
      for (const k of Object.keys(d.topics)) {
        const t = d.topics[k];
        if (t && t.quiz) delete t.quiz.missed;
      }
      for (const k of Object.keys(d.tests)) {
        const t = d.tests[k];
        if (t) delete t.missed;
      }
      localStorage.setItem(KEY, JSON.stringify(d));
      return;
    } catch {
      /* fall through */
    }
    try {
      d.projects = {};
      localStorage.setItem(KEY, JSON.stringify(d));
      return;
    } catch {
      /* fall through */
    }
    notice('Storage is full — recent progress may not be saved.');
  }
}

if (!ok) notice("Progress won't be saved — this browser has storage disabled.");

// Two tabs: last write wins, nothing here needs stronger consistency.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    mem = null;
    for (const cb of listeners) cb();
  }
});

export const Store = {
  get: load,
  /** Debounced: write the whole blob once rather than many small keys. */
  save(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(persist, 250);
  },
  /**
   * Write now and cancel any pending debounce. Required before `location.reload()`
   * (Retake / Reset): a debounced save never lands if the page unloads first.
   * Also the path for anything else that must not race the next paint.
   */
  flush(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    persist();
  },
  available: ok,
  reset(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    mem = blank();
    if (ok) {
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* nothing else to do */
      }
    }
  },
  /** Re-render hook for cross-tab changes; wired up in index.ts to avoid a
   *  circular import between the store and the progress renderer. */
  onExternalChange(cb: () => void): void {
    listeners.push(cb);
  },
};

// Closing a tab mid-answer would otherwise drop anything still in the debounce
// window. beforeunload is the last chance to land the in-memory blob.
window.addEventListener('beforeunload', () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    persist();
  }
});
