import { Store } from './store';

/** Derived values are computed on read, never stored — storing them creates two
 *  sources of truth that drift. */

export function topicsDone(): number {
  const t = Store.get().topics;
  let n = 0;
  for (const k in t) if (t[k]?.read) n++;
  return n;
}

export function avg(list: number[]): number | null {
  if (!list.length) return null;
  let s = 0;
  for (const x of list) s += x;
  return Math.round((s / list.length) * 100);
}

export function testScores(): number[] {
  const t = Store.get().tests;
  const out: number[] = [];
  for (const k in t) {
    const rec = t[k];
    if (rec?.total) out.push(rec.score / rec.total);
  }
  return out;
}

export function quizScores(): number[] {
  const t = Store.get().topics;
  const out: number[] = [];
  for (const k in t) {
    const q = t[k]?.quiz;
    if (q?.total) out.push(q.score / q.total);
  }
  return out;
}

export function announce(msg: string): void {
  const live = document.querySelector('[data-live]');
  if (live) live.textContent = msg;
}
