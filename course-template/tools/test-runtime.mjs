#!/usr/bin/env node
/**
 * Exercises the built runtime against a built page in jsdom.
 *
 * These are the gate S5 and S4 behaviours that a grep cannot check: that a
 * throwing localStorage degrades to an in-memory store with one banner instead of
 * an uncaught error, that a corrupt blob resets rather than white-screening, that
 * quiz grading scores first attempts only, and that reset removes exactly one key.
 *
 *   node tools/test-runtime.mjs <path-to-dist>
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const dist = path.resolve(process.argv[2] ?? 'dist');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

function findTopicPage() {
  const units = fs
    .readdirSync(dist, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('unit-'))
    .map((e) => e.name)
    .sort();
  for (const u of units) {
    const f = path.join(dist, u, 'topic-1.html');
    if (fs.existsSync(f)) return f;
  }
  throw new Error('no topic page found in ' + dist);
}

const pageFile = findTopicPage();
const runtime = fs.readFileSync(path.join(dist, 'assets/site.js'), 'utf8');
const searchIdx = fs.readFileSync(path.join(dist, 'assets/search-index.js'), 'utf8');

/** Load the page with a given localStorage implementation and run the runtime. */
function load({ storage, seed }) {
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(String(e.message)));
  virtualConsole.on('error', (e) => errors.push(String(e)));

  const html = fs.readFileSync(pageFile, 'utf8').replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://example.test/course/unit-1/topic-1.html',
    virtualConsole,
  });

  Object.defineProperty(dom.window, 'localStorage', { value: storage, configurable: true });
  // Not implemented in jsdom; the site only ever uses it to nudge the view.
  dom.window.Element.prototype.scrollIntoView = function scrollIntoView() {};
  if (seed) storage.setItem(seed.key, seed.value);

  let thrown = null;
  try {
    dom.window.eval(searchIdx);
    dom.window.eval(runtime);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  } catch (err) {
    thrown = err;
  }
  return { dom, errors, thrown };
}

function memoryStorage(overrides = {}) {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    _map: map,
    ...overrides,
  };
}


/** Answer every question on a loaded page, correctly. */
function answerAll(dom, doc) {
  const spec = JSON.parse(doc.getElementById('quiz-data').textContent);
  const click = (el) => el?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  [...doc.querySelectorAll('.q')].forEach((qEl, i) => {
    const q = spec.questions[i];
    if (q.type === 'SHORT_ANSWER') {
      click(qEl.querySelector('[data-check]'));
      click(qEl.querySelector('[data-self="got"]'));
      return;
    }
    const idx = q.type === 'TRUE_FALSE' ? (q.correctAnswer ? 1 : 0) : (q.correctOptionIndex ?? 0);
    const inputs = qEl.querySelectorAll('input[type=radio]');
    if (inputs[idx]) inputs[idx].checked = true;
    click(qEl.querySelector('[data-check]'));
  });
  return spec;
}

// ---------------------------------------------------------------- 1. happy path
{
  const store = memoryStorage();
  const { dom, errors, thrown } = load({ storage: store });
  check('loads without error', !thrown && errors.length === 0, thrown?.message ?? errors[0] ?? '');
  const doc = dom.window.document;
  check('no-js class removed', !doc.documentElement.classList.contains('no-js'));
  check('flashcard deck initialised', doc.querySelector('.deck__count')?.textContent?.includes('/'));
  check(
    'no-JS <details> fallback present before interaction',
    doc.querySelectorAll('details').length > 0,
  );

  // Answer every question correctly; the score is only written once all are done.
  const quizData = JSON.parse(doc.getElementById('quiz-data').textContent);
  const click = (el) => el?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  const qEls = [...doc.querySelectorAll('.q')];

  const first = qEls[0];
  answer(first, quizData.questions[0]);
  check('correct answer marked correct', !!first.querySelector('.opt--correct'));
  check('question locks after check', first.hasAttribute('data-locked'));
  check(
    'inputs disabled so a second attempt cannot rescore',
    [...first.querySelectorAll('input[type=radio]')].every((i) => i.disabled),
  );
  check('no-JS details removed once answered', !first.querySelector('details'));

  for (let i = 1; i < qEls.length; i++) answer(qEls[i], quizData.questions[i]);

  function answer(qEl, spec) {
    if (spec.type === 'SHORT_ANSWER') {
      click(qEl.querySelector('[data-check]'));
      click(qEl.querySelector('[data-self="got"]'));
      return;
    }
    const idx =
      spec.type === 'TRUE_FALSE' ? (spec.correctAnswer ? 1 : 0) : (spec.correctOptionIndex ?? 0);
    const inputs = qEl.querySelectorAll('input[type=radio]');
    if (inputs[idx]) inputs[idx].checked = true;
    click(qEl.querySelector('[data-check]'));
  }

  const result = doc.querySelector('.quiz__result');
  check(
    'full marks reported and celebrated',
    /100%/.test(result?.textContent ?? '') && /Passed/.test(result?.textContent ?? ''),
    (result?.textContent ?? '').slice(0, 60),
  );

  // Writes are debounced at 250 ms and the whole blob is written at once.
  await new Promise((r) => setTimeout(r, 400));
  const courseKey = [...store._map.keys()].find((k) => k.startsWith('course:'));
  check('progress persisted under a namespaced key', !!courseKey, courseKey ?? 'no course: key');
  const blob = courseKey ? JSON.parse(store.getItem(courseKey)) : {};
  const rec = Object.values(blob.topics ?? {})[0]?.quiz;
  check(
    'persisted blob records a full-marks quiz score',
    !!rec && rec.score === rec.total && rec.total === quizData.questions.length,
    JSON.stringify(rec ?? null),
  );
}

// ---------------------------------------------------------------- 2. throwing storage
{
  const store = memoryStorage({
    setItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
  });
  const { dom, errors, thrown } = load({ storage: store });
  check('throwing storage: no uncaught error', !thrown && errors.length === 0, thrown?.message ?? errors[0] ?? '');
  const banners = dom.window.document.querySelectorAll('.banner');
  check('throwing storage: exactly one banner', banners.length === 1, `saw ${banners.length}`);
  check(
    'throwing storage: banner explains progress will not save',
    /won't be saved|storage disabled/i.test(banners[0]?.textContent ?? ''),
  );
  // Grading must still work for the session.
  const doc = dom.window.document;
  const q = doc.querySelectorAll('.q')[0];
  const quizData = JSON.parse(doc.getElementById('quiz-data').textContent);
  q.querySelectorAll('input[type=radio]')[quizData.questions[0].correctOptionIndex ?? 0].checked = true;
  q.querySelector('[data-check]').dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  check('throwing storage: quiz still gradeable', !!q.querySelector('.opt--correct'));
}

// ---------------------------------------------------------------- 3. corrupt blob
{
  const store = memoryStorage();
  const cfgSlug = JSON.parse(
    fs.readFileSync(pageFile, 'utf8').match(/id="course-config">([\s\S]*?)<\/script>/)[1],
  ).slug;
  const key = `course:${cfgSlug}:v1`;
  const { dom, errors, thrown } = load({ storage: store, seed: { key, value: '{not json at all' } });
  check('corrupt blob: no uncaught error', !thrown && errors.length === 0, thrown?.message ?? errors[0] ?? '');
  check('corrupt blob: page still renders', !!dom.window.document.querySelector('h1'));
  check('corrupt blob: bad key discarded', store.getItem(key) === null);
}

// ---------------------------------------------------------------- 4. wrong version
{
  const store = memoryStorage();
  const cfgSlug = JSON.parse(
    fs.readFileSync(pageFile, 'utf8').match(/id="course-config">([\s\S]*?)<\/script>/)[1],
  ).slug;
  const key = `course:${cfgSlug}:v1`;
  const { dom, errors, thrown } = load({
    storage: store,
    seed: { key, value: JSON.stringify({ v: 99, topics: { u1t1: { read: true } } }) },
  });
  check('wrong schema version: no uncaught error', !thrown && errors.length === 0);
  check('wrong schema version: reset with a notice', store.getItem(key) === null);
  check(
    'wrong schema version: notice shown once',
    dom.window.document.querySelectorAll('.banner').length === 1,
  );
}

// ---------------------------------------------------------------- 5. reset scope
{
  const store = memoryStorage();
  store.setItem('some-other-app', 'keep me');
  store.setItem('course:another-course:v1', 'keep me too');
  const { dom } = load({ storage: store });
  const doc = dom.window.document;
  doc.querySelector('[data-mark-read]')?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  const dlg = doc.getElementById('reset-dialog');
  if (dlg) dlg.showModal = () => {};
  doc.querySelector('[data-reset]')?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  dlg?.querySelector('[data-reset-confirm]')?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  check('reset leaves other origins’ keys alone', store.getItem('some-other-app') === 'keep me');
  check(
    'reset leaves another course’s progress alone',
    store.getItem('course:another-course:v1') === 'keep me too',
  );
}


// ------------------------------------------------- 6. progress survives a reload
// The reported bug: a completed quiz came back blank, because only the score was
// stored and nothing replayed it into the page.
{
  const store = memoryStorage();

  const first = load({ storage: store });
  const spec = answerAll(first.dom, first.dom.window.document);
  await new Promise((r) => setTimeout(r, 400));

  const again = load({ storage: store });
  const doc = again.dom.window.document;
  check('reload: no uncaught error', !again.thrown && again.errors.length === 0,
    again.thrown?.message ?? again.errors[0] ?? '');

  const qEls = [...doc.querySelectorAll('.q')];
  check('reload: every question comes back locked',
    qEls.every((q, i) => spec.questions[i].type === 'SHORT_ANSWER' || q.hasAttribute('data-locked')));
  check('reload: chosen options are still selected',
    qEls.every((q, i) => spec.questions[i].type === 'SHORT_ANSWER'
      || [...q.querySelectorAll('input[type=radio]')].some((x) => x.checked)));
  check('reload: explanations stay revealed',
    qEls.every((q) => q.querySelector('.explain') && !q.querySelector('.explain').hidden));
  check('reload: Check is disabled so the score cannot be redone',
    qEls.every((q) => q.querySelector('[data-check]').disabled));

  const result = doc.querySelector('.quiz__result');
  check('reload: the score is shown again', !result.hidden && /100%/.test(result.textContent ?? ''),
    (result.textContent ?? '').slice(0, 40));
  check('reload: no confetti on a revisit', !doc.getElementById('confetti'));

  const reset = doc.querySelector('[data-quiz-reset]');
  check('reload: a reset control is offered', !!reset && !reset.hidden);

  // Reset clears this quiz and nothing else.
  store.setItem('course:other:v1', 'untouched');
  reset.dispatchEvent(new again.dom.window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 400));
  const key = [...store._map.keys()].find((k) => k.startsWith('course:') && k !== 'course:other:v1');
  const blob = key ? JSON.parse(store.getItem(key)) : {};
  const rec = Object.values(blob.topics ?? {})[0]?.quiz;
  check('reset: the quiz record is gone', !rec, JSON.stringify(rec ?? null));
  check('reset: other courses untouched', store.getItem('course:other:v1') === 'untouched');
}

// ------------------------------------------------- 7. partial progress survives
{
  const store = memoryStorage();
  const first = load({ storage: store });
  const doc1 = first.dom.window.document;
  const spec = JSON.parse(doc1.getElementById('quiz-data').textContent);
  const q0 = doc1.querySelectorAll('.q')[0];
  const idx = spec.questions[0].correctOptionIndex ?? 0;
  q0.querySelectorAll('input[type=radio]')[idx].checked = true;
  q0.querySelector('[data-check]').dispatchEvent(new first.dom.window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 400));

  const again = load({ storage: store });
  const doc = again.dom.window.document;
  const qEls = [...doc.querySelectorAll('.q')];
  check('partial reload: the answered question is restored', qEls[0].hasAttribute('data-locked'));
  check('partial reload: the rest stay answerable', !qEls[1].hasAttribute('data-locked'));
  check('partial reload: no result panel yet', doc.querySelector('.quiz__result').hidden);
  check('partial reload: meter shows 1 answered',
    /\b1 \/ /.test(doc.querySelector('[data-quiz-count]')?.textContent ?? ''),
    doc.querySelector('[data-quiz-count]')?.textContent ?? '');
}

// ---------------------------------------------------------------- report
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '  ok  ' : '  FAIL'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
}
console.log(
  failed.length ? `\n${failed.length} of ${results.length} checks failed.` : `\nAll ${results.length} runtime checks passed.`,
);
process.exit(failed.length ? 1 : 0);
