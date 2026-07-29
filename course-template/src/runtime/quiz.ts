import { progressChanged } from './bus';
import { CFG, json } from './config';
import { announce, isComplete } from './derived';
import { celebrate } from './confetti';
import { Store } from './store';
import type { Answer, QuizData, QuizQuestion, QuizRecord } from './types';

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

  // What was answered, one entry per question. Saved on every answer rather than
  // only at the end, so closing the tab half way through loses nothing.
  const answers: Answer[] = qs.map((_, i) => stored?.answers?.[i] ?? null);

  // A record written before `answers` existed: the score survived but the choices
  // did not, so the quiz can be shown as finished without saying what was picked.
  const legacyComplete = isComplete(stored) && !Array.isArray(stored.answers);

  const remaining = (): number => state.filter((s) => !s.done).length;

  /** The stored record for this quiz, created on first write. */
  function recordFor(): QuizRecord {
    const st = Store.get();
    if (data.kind === 'test') {
      st.tests[data.id] = st.tests[data.id] ?? {};
      return st.tests[data.id] as QuizRecord;
    }
    st.topics[data.id] = st.topics[data.id] ?? {};
    const topic = st.topics[data.id]!;
    topic.quiz = topic.quiz ?? {};
    return topic.quiz;
  }

  function clearRecord(): void {
    const st = Store.get();
    if (data.kind === 'test') delete st.tests[data.id];
    else {
      const topic = st.topics[data.id];
      if (topic) delete topic.quiz;
    }
    Store.save();
    progressChanged();
  }

  const meter = root.querySelector<HTMLElement>('[data-quiz-meter]');
  if (meter) meter.hidden = false;

  /** How far through the quiz, painted on the sticky meter above the questions. */
  function paintMeter(): void {
    if (!meter) return;
    const done = state.filter((s) => s.done).length;
    const span = meter.querySelector<HTMLElement>('.bar > span');
    if (span) span.style.width = Math.round((done / (state.length || 1)) * 100) + '%';
    const count = meter.querySelector<HTMLElement>('[data-quiz-count]');
    if (count) count.textContent = done + ' / ' + state.length;
  }

  function mark(qEl: HTMLElement, q: QuizQuestion, idx: number, right: boolean): void {
    qEl.setAttribute('data-locked', '1');
    qEl.setAttribute('data-state', right ? 'ok' : 'bad');
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
    // Merged into the existing record, not assigned over it: the answers written
    // as the learner went are what lets a reload show the finished quiz.
    const rec = recordFor();
    rec.score = score;
    rec.total = total;
    rec.at = Date.now();
    rec.missed = missed;
    rec.answers = answers.slice();
    Store.save();
    progressChanged();

    const pct = Math.round((score / total) * 100);
    const passed = pct >= (CFG.passingScore || 70);
    showResult(pct, score, total, missed, passed);
    // Never re-fire on revisiting a quiz that already has a stored result.
    if (!stored && passed) celebrate();
    stored = rec;
  }

  function resolve(i: number, right: boolean, q: QuizQuestion, answer: Answer): void {
    state[i] = { done: true, correct: right, objectives: q.objectives ?? [] };
    answers[i] = answer;
    paintMeter();

    // Persist immediately. `finish()` will write the score too once the last
    // question lands, but a quiz abandoned half way still comes back answered.
    recordFor().answers = answers.slice();
    Store.save();

    announce((right ? 'Correct. ' : 'Incorrect. ') + remaining() + ' remaining.');
    if (state.every((s) => s.done)) finish();
  }

  function showResult(
    pct: number,
    score: number,
    total: number,
    missed: number[],
    passed: boolean,
    /** Only when the learner just finished. Replaying a stored result must not
     *  yank the page down to the quiz the moment a topic page opens. */
    scroll = true,
  ): void {
    const box = root.querySelector<HTMLElement>('.quiz__result');
    if (!box) return;
    box.hidden = false;
    box.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'result ' + (passed ? 'result--pass' : 'result--fail');

    const h = document.createElement('p');
    h.className = 'quiz__score badge-pop';
    h.textContent = pct + '%';
    const sub = document.createElement('p');
    sub.className = 'muted';
    sub.style.margin = '.2rem 0 0';
    sub.textContent = score + ' of ' + total + ' correct';
    const scoreCol = document.createElement('div');
    scoreCol.appendChild(h);
    scoreCol.appendChild(sub);
    panel.appendChild(scoreCol);

    const body = document.createElement('div');
    body.className = 'result__body';
    const msg = document.createElement('p');
    msg.style.margin = '0';
    msg.textContent = passed
      ? 'Passed — nice work.'
      : "Below the pass mark — here's what to review.";
    body.appendChild(msg);

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
      body.appendChild(ul);
    }
    panel.appendChild(body);
    box.appendChild(panel);

    const again = document.createElement('button');
    again.className = 'btn';
    again.type = 'button';
    again.style.marginTop = '1rem';
    again.textContent = 'Retake';
    again.addEventListener('click', () => {
      clearRecord();
      location.reload();
    });
    box.appendChild(again);
    if (scroll) box.scrollIntoView({ block: 'nearest' });
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
        resolve(i, right, q, idx);
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
          resolve(i, right, q, right);
        });
      });
    }

    // ---- restore what was already answered -------------------------------
    // Everything above only wires the fresh state. This replays the stored
    // answer for this question so a reload comes back exactly as it was left.
    const saved = answers[i];
    const answered = saved !== null && saved !== undefined;

    if (answered || legacyComplete) {
      if (q.type === 'SHORT_ANSWER') {
        const got = saved === true;
        reveal(qEl, explain, null);
        if (self && answered) {
          self.hidden = false;
          self.querySelectorAll('button').forEach((x) => {
            x.disabled = true;
          });
          self
            .querySelector<HTMLElement>(`[data-self="${got ? 'got' : 'missed'}"]`)
            ?.classList.add('btn--primary');
        }
        if (answered) state[i] = { done: true, correct: got, objectives: q.objectives ?? [] };
      } else {
        // -1 for a legacy record: the correct option is still marked, but nothing
        // is flagged as the learner's wrong pick, because that was never stored.
        const idx = typeof saved === 'number' ? saved : -1;
        const right =
          q.type === 'TRUE_FALSE'
            ? (idx === 1) === (q.correctAnswer === true)
            : idx === q.correctOptionIndex;
        const input = qEl.querySelectorAll<HTMLInputElement>('input[type=radio]')[idx];
        if (input) input.checked = true;
        mark(qEl, q, idx, right);
        reveal(qEl, explain, answered ? right : null);
        if (answered) state[i] = { done: true, correct: right, objectives: q.objectives ?? [] };
      }
      if (check) check.disabled = true;
    }
  });

  // ---- replay the result panel ---------------------------------------------
  paintMeter();
  if (state.length && state.every((s) => s.done)) {
    const score = state.filter((s) => s.correct).length;
    const missed: number[] = [];
    for (const s of state) {
      if (!s.correct) for (const o of s.objectives) if (missed.indexOf(o) < 0) missed.push(o);
    }
    const pct = Math.round((score / state.length) * 100);
    // showResult, not finish(): the score is already stored, and re-running
    // finish() would restamp `at` and could re-fire the celebration.
    showResult(pct, score, state.length, missed, pct >= (CFG.passingScore || 70), false);
  } else if (legacyComplete && isComplete(stored)) {
    showResult(
      Math.round((stored.score / stored.total) * 100),
      stored.score,
      stored.total,
      stored.missed ?? [],
      Math.round((stored.score / stored.total) * 100) >= (CFG.passingScore || 70),
      false,
    );
  }

  // ---- reset, always available once there is anything to reset -------------
  const reset = root.querySelector<HTMLButtonElement>('[data-quiz-reset]');
  if (reset) {
    const hasProgress = legacyComplete || answers.some((a) => a !== null && a !== undefined);
    reset.hidden = !hasProgress;
    reset.addEventListener('click', () => {
      clearRecord();
      location.reload();
    });
  }
}
