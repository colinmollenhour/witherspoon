import { Store } from './store';
import type { QuizRecord } from './types';

/** Derived values are computed on read, never stored — storing them creates two
 *  sources of truth that drift. */

/**
 * A record exists as soon as the first question is answered, but only counts as
 * a result once the whole quiz is done. Everything that reports a score — the
 * home stats, the unit dots, the certificate — filters on this.
 */
export function isComplete(
  rec: QuizRecord | undefined,
): rec is QuizRecord & { score: number; total: number; at: number } {
  return (
    !!rec && typeof rec.score === 'number' && typeof rec.total === 'number' && rec.total > 0
  );
}

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
    if (isComplete(rec)) out.push(rec.score / rec.total);
  }
  return out;
}

export function quizScores(): number[] {
  const t = Store.get().topics;
  const out: number[] = [];
  for (const k in t) {
    const q = t[k]?.quiz;
    if (isComplete(q)) out.push(q.score / q.total);
  }
  return out;
}

export function announce(msg: string): void {
  const live = document.querySelector('[data-live]');
  if (live) live.textContent = msg;
}
