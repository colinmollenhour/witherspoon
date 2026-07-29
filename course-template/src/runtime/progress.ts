import { CFG } from './config';
import { avg, quizScores, testScores, topicsDone } from './derived';
import { Store } from './store';

/** Paints every progress affordance on the current page from the stored state.
 *  Called on boot, after any state change, and on a cross-tab storage event. */
export function render(): void {
  const done = topicsDone();
  const total = CFG.totalTopics || 1;
  const pct = Math.round((done / total) * 100);

  document.querySelectorAll<HTMLElement>('[data-ring]').forEach((el) => {
    const v = el.querySelector<SVGCircleElement>('.value');
    const lbl = el.querySelector<HTMLElement>('.ring__label');
    if (v) {
      const c = 2 * Math.PI * v.r.baseVal.value;
      v.style.strokeDasharray = String(c);
      v.style.strokeDashoffset = String(c * (1 - pct / 100));
    }
    if (lbl) lbl.textContent = pct + '%';
  });

  const qa = avg(quizScores());
  const ta = avg(testScores());
  document.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
    const k = el.getAttribute('data-stat');
    if (k === 'topics') el.textContent = done + ' / ' + total;
    else if (k === 'quizzes') el.textContent = String(quizScores().length);
    else if (k === 'quiz-avg') el.textContent = qa === null ? '—' : qa + '%';
    else if (k === 'test-avg') el.textContent = ta === null ? '—' : ta + '%';
  });

  const st = Store.get();

  document.querySelectorAll<HTMLElement>('[data-topic-state]').forEach((el) => {
    const id = el.getAttribute('data-topic-state') ?? '';
    const rec = st.topics[id];
    const dot = el.querySelector<HTMLElement>('.dot');
    const score = el.querySelector<HTMLElement>('.score');
    if (dot) {
      dot.className = 'dot' + (rec?.quiz ? ' dot--quizzed' : rec?.read ? ' dot--read' : '');
    }
    if (score) score.textContent = rec?.quiz ? rec.quiz.score + '/' + rec.quiz.total : '';
  });

  document.querySelectorAll<HTMLElement>('[data-unit-bar]').forEach((el) => {
    const id = el.getAttribute('data-unit-bar');
    const unit = (CFG.units || []).filter((u) => u.id === id)[0];
    if (!unit) return;
    const n = unit.topics.filter((t) => st.topics[t]?.read).length;
    const span = el.querySelector<HTMLElement>('span');
    if (span) span.style.width = Math.round((n / (unit.topics.length || 1)) * 100) + '%';
  });

  // The most valuable element on the page for a returning learner.
  const resume = document.querySelector<HTMLElement>('[data-resume]');
  if (resume) {
    const link = resume.querySelector('a');
    if (st.lastVisited && link) {
      resume.hidden = false;
      link.setAttribute('href', st.lastVisited);
    } else {
      resume.hidden = true;
    }
  }
}
