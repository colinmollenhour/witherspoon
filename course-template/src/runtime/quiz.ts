import { progressChanged } from './bus';
import { CFG, json } from './config';
import { announce } from './derived';
import { celebrate } from './confetti';
import { Store } from './store';
import type { QuizData, QuizQuestion, QuizRecord } from './types';

interface Slot {
  done: boolean;
  correct: boolean;
  objectives: number[];
}

/**
 * One component for both topic quizzes and unit tests, distinguished by `kind`.
 *
 * Feedback is per-question and immediate — that is the pedagogy, not a batch score
 * at the end. Only first attempts count: once a question is checked its inputs are
 * disabled, so changing an answer afterwards cannot change the score.
 */
export function initQuiz(): void {
  const rootEl = document.querySelector<HTMLElement>('[data-quiz]');
  const quizData = json<QuizData>('quiz-data');
  if (!rootEl || !quizData) return;

  // Bound after the guard: TypeScript does not carry the null-narrowing into the
  // hoisted function declarations below.
  const root = rootEl;
  const data = quizData;

  const qs = data.questions ?? [];
  const state: Slot[] = qs.map(() => ({ done: false, correct: false, objectives: [] }));
  let stored: QuizRecord | undefined =
    data.kind === 'test' ? Store.get().tests[data.id] : Store.get().topics[data.id]?.quiz;

  const remaining = (): number => state.filter((s) => !s.done).length;

  function mark(qEl: HTMLElement, q: QuizQuestion, idx: number, right: boolean): void {
    qEl.setAttribute('data-locked', '1');
    const correctIdx =
      q.type === 'TRUE_FALSE' ? (q.correctAnswer === true ? 1 : 0) : q.correctOptionIndex;
    qEl.querySelectorAll<HTMLElement>('.opt').forEach((o, oi) => {
      const input = o.querySelector('input');
      if (input) input.disabled = true;
      if (oi === correctIdx) o.classList.add('opt--correct');
      else if (oi === idx && !right) o.classList.add('opt--chosen-wrong');
    });
  }

  function reveal(qEl: HTMLElement, explain: HTMLElement | null, right: boolean | null): void {
    if (!explain) return;
    explain.hidden = false;
    if (right !== null) explain.setAttribute('data-state', right ? 'ok' : 'bad');
    // The no-JS <details> fallback is now redundant and would duplicate the answer.
    const det = qEl.querySelector('details');
    if (det) det.remove();
  }

  function finish(): void {
    const score = state.filter((s) => s.correct).length;
    const total = state.length;
    const missed: number[] = [];
    for (const s of state) {
      if (!s.correct) {
        for (const o of s.objectives) if (missed.indexOf(o) < 0) missed.push(o);
      }
    }
    const rec: QuizRecord = { score, total, at: Date.now(), missed };
    const st = Store.get();
    if (data.kind === 'test') {
      st.tests[data.id] = rec;
    } else {
      st.topics[data.id] = st.topics[data.id] ?? {};
      const topic = st.topics[data.id];
      if (topic) topic.quiz = rec;
    }
    Store.save();
    progressChanged();

    const pct = Math.round((score / total) * 100);
    const passed = pct >= (CFG.passingScore || 70);
    showResult(pct, score, total, missed, passed);
    // Never re-fire on revisiting a quiz that already has a stored result.
    if (!stored && passed) celebrate();
    stored = rec;
  }

  function resolve(i: number, right: boolean, q: QuizQuestion): void {
    state[i] = { done: true, correct: right, objectives: q.objectives ?? [] };
    announce((right ? 'Correct. ' : 'Incorrect. ') + remaining() + ' remaining.');
    if (state.every((s) => s.done)) finish();
  }

  function showResult(
    pct: number,
    score: number,
    total: number,
    missed: number[],
    passed: boolean,
  ): void {
    const box = root.querySelector<HTMLElement>('.quiz__result');
    if (!box) return;
    box.hidden = false;
    box.innerHTML = '';

    const h = document.createElement('p');
    h.className = 'quiz__score badge-pop';
    h.textContent = score + ' / ' + total + '  (' + pct + '%)';
    const msg = document.createElement('p');
    msg.textContent = passed
      ? 'Passed — nice work.'
      : "Below the pass mark — here's what to review.";
    box.appendChild(h);
    box.appendChild(msg);

    // The payoff of the (objective N) citation contract: which objective was
    // missed, not just a number.
    if (missed.length) {
      const ul = document.createElement('ul');
      ul.className = 'review';
      for (const o of missed) {
        const li = document.createElement('li');
        const name = (data.objectiveNames ?? {})[String(o)];
        li.textContent = name ? 'Objective ' + o + ' — ' + name : 'Objective ' + o;
        ul.appendChild(li);
      }
      box.appendChild(ul);
    }

    const again = document.createElement('button');
    again.className = 'btn';
    again.type = 'button';
    again.textContent = 'Retake';
    again.addEventListener('click', () => {
      const st = Store.get();
      if (data.kind === 'test') delete st.tests[data.id];
      else {
        const topic = st.topics[data.id];
        if (topic) delete topic.quiz;
      }
      Store.save();
      location.reload();
    });
    box.appendChild(again);
    box.scrollIntoView({ block: 'nearest' });
  }

  root.querySelectorAll<HTMLElement>('.q').forEach((qEl, i) => {
    const q = qs[i];
    if (!q) return;
    const check = qEl.querySelector<HTMLButtonElement>('[data-check]');
    const explain = qEl.querySelector<HTMLElement>('.explain');
    const self = qEl.querySelector<HTMLElement>('.self-grade');
    if (explain) explain.hidden = true;
    if (self) self.hidden = true;

    if (check) {
      check.addEventListener('click', () => {
        const slot = state[i];
        if (!slot || slot.done) return;

        // Short answers cannot be auto-graded without a backend. Reveal the sample
        // answer and let the learner self-mark; the UI says so plainly.
        if (q.type === 'SHORT_ANSWER') {
          reveal(qEl, explain, null);
          if (self) self.hidden = false;
          check.disabled = true;
          return;
        }

        const chosen = qEl.querySelector<HTMLInputElement>('input:checked');
        if (!chosen) {
          qEl.querySelector('fieldset')?.setAttribute('data-nudge', '1');
          return;
        }
        const idx = Number(chosen.value);
        const right =
          q.type === 'TRUE_FALSE'
            ? (idx === 1) === (q.correctAnswer === true)
            : idx === q.correctOptionIndex;
        mark(qEl, q, idx, right);
        reveal(qEl, explain, right);
        resolve(i, right, q);
        check.disabled = true;
      });
    }

    if (self) {
      self.querySelectorAll<HTMLButtonElement>('[data-self]').forEach((b) => {
        b.addEventListener('click', () => {
          const slot = state[i];
          if (!slot || slot.done) return;
          const right = b.getAttribute('data-self') === 'got';
          self.querySelectorAll('button').forEach((x) => {
            x.disabled = true;
          });
          b.classList.add('btn--primary');
          resolve(i, right, q);
        });
      });
    }
  });
}
