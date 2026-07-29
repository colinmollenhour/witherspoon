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

/** Walk dist for the first page whose HTML matches — used to find a page that
 *  actually carries the feature under test rather than assuming topic-1 does. */
function findPageWith(re) {
  const walk = (dir) => {
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(abs));
      else if (e.name.endsWith('.html')) out.push(abs);
    }
    return out;
  };
  return walk(dist).sort().find((f) => re.test(fs.readFileSync(f, 'utf8'))) ?? null;
}

const pageFile = findTopicPage();
const runtime = fs.readFileSync(path.join(dist, 'assets/site.js'), 'utf8');
const searchIdx = fs.readFileSync(path.join(dist, 'assets/search-index.js'), 'utf8');

/** Load the page with a given localStorage implementation and run the runtime. */
function load({ storage, seed, file }) {
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(String(e.message)));
  virtualConsole.on('error', (e) => errors.push(String(e)));

  const html = fs
    .readFileSync(file ?? pageFile, 'utf8')
    .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
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

/**
 * Wait for the runtime's debounced write to land.
 *
 * `Store.save()` batches at 250 ms, and a fixed sleep just longer than that raced
 * on a loaded machine — the reload tests failed roughly one run in two, always
 * because the blob had not been written yet. Poll for the condition instead.
 */
async function settle(store, predicate = () => true, ms = 3000) {
  const key = () => [...store._map.keys()].find((k) => k.startsWith('course:'));
  const started = Date.now();
  while (Date.now() - started < ms) {
    const k = key();
    if (k) {
      try {
        if (predicate(JSON.parse(store.getItem(k)))) return true;
      } catch {
        /* mid-write; try again */
      }
    }
    await new Promise((r) => setTimeout(r, 25));
  }
  return false;
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
  await settle(store, (b) => Object.values(b.topics ?? {})[0]?.quiz?.score !== undefined);
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
  const saved = await settle(store, (b) => Object.values(b.topics ?? {})[0]?.quiz?.score !== undefined);
  check('reload: the first visit persisted before reloading', saved);

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
  await settle(store, (b) => !Object.values(b.topics ?? {})[0]?.quiz);
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
  const saved = await settle(store, (b) => Array.isArray(Object.values(b.topics ?? {})[0]?.quiz?.answers));
  check('partial reload: the single answer persisted', saved);

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

// ------------------------------------------------- 8. widgets enhance, never gate
// The invariant that makes visual aids safe to ship: with the runtime off, every
// widget's content is already on the page. These check the other half — that the
// runtime does take over, and that taking over never destroys content.
// Each kind is looked up on its own page: testing only the first page carrying any
// widget silently skipped every kind that did not happen to appear on it.
for (const kind of ['anatomy', 'flow', 'terminal', 'match', 'order', 'sequence']) {
  const widgetPage = findPageWith(new RegExp(`data-widget="${kind}"`));
  if (!widgetPage) {
    // Advisory, not a failure: a course is not obliged to use every widget.
    console.log(`  --   widgets: no ${kind} widget in this course, skipped`);
  } else {
    const store = memoryStorage();
    const { dom, errors, thrown } = load({ storage: store, file: widgetPage });
    const doc = dom.window.document;
    const rel = path.relative(dist, widgetPage);
    check(`widgets: ${kind} on ${rel} loads without error`, !thrown && errors.length === 0,
      thrown?.message ?? errors[0] ?? '');

    const scripted = [...doc.querySelectorAll(`[data-widget="${kind}"]`)];
    check(`widgets: every ${kind} widget was enhanced`,
      scripted.length > 0 && scripted.every((w) => w.hasAttribute('data-enhanced')),
      `${scripted.length} found`);

    // Nothing may be removed from the DOM. Hiding is a CSS concern and prints back.
    for (const w of scripted) {
      if (kind === 'anatomy') {
        check('widgets: anatomy keeps every note in the DOM',
          w.querySelectorAll('.wx-note').length === w.querySelectorAll('.wx-seg[data-seg]').length);
        check('widgets: anatomy opens on a segment rather than an empty panel',
          !!w.querySelector('.wx-note[data-active]'));
      }
      if (kind === 'terminal') {
        check('widgets: terminal keeps its output in the DOM',
          w.querySelectorAll('.wx-line__out').length > 0);
        const line = w.querySelector('.wx-line[data-hidden]');
        check('widgets: terminal hides output behind Run', !!line);
        line?.querySelector('.wx-run')
          ?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
        check('widgets: Run reveals that line', !line?.hasAttribute('data-hidden'));
      }
      if (kind === 'match') {
        const tiles = [...w.querySelectorAll('.wx-tile[data-pair]')];
        check('widgets: match board is shown', !w.querySelector('[data-match]')?.hidden);
        const a = tiles.find((t) => t.getAttribute('data-side') === 'a');
        const b = tiles.find(
          (t) => t.getAttribute('data-side') === 'b'
            && t.getAttribute('data-pair') === a?.getAttribute('data-pair'),
        );
        const click = (el) => el?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
        click(a); click(b);
        check('widgets: a correct pair locks', a?.hasAttribute('data-done') && b?.hasAttribute('data-done'));
        check('widgets: match writes nothing to storage',
          ![...store._map.keys()].some((k) => /match/i.test(store.getItem(k) ?? '')));
      }
      if (kind === 'order') {
        const pool = w.querySelector('[data-pool]');
        check('widgets: order tiles are dealt into the pool',
          (pool?.children.length ?? 0) === w.querySelectorAll('.wx-tile[data-order]').length);
        check('widgets: order does not open already solved',
          [...(pool?.children ?? [])].some((t, i) => t.getAttribute('data-order') !== String(i)));
      }
      if (kind === 'sequence') {
        check('widgets: sequence offers a step control',
          !w.querySelector('[data-seq-bar]')?.hidden);
      }
    }
  }
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
