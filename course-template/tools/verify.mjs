#!/usr/bin/env node
/**
 * Build gates S1–S12 from course-site/references/build-gates.md, plus the advisory
 * checks. Replaces the inline verify.sh, whose S1 quietly dropped the `fetch(`
 * pattern that the prose version of the gate requires — so the two disagreed about
 * whether the shipped runtime passed.
 *
 *   npm run verify -- <path-to-dist>
 *
 * Exits non-zero if any blocking gate fails.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
if (!fs.existsSync(dist)) {
  console.error(`No such directory: ${dist}`);
  process.exit(2);
}

const failures = [];
const advisories = [];
const fail = (gate, msg) => failures.push(`${gate}: ${msg}`);
const advise = (msg) => advisories.push(msg);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

const allFiles = walk(dist);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const relOf = (f) => path.relative(dist, f);
const read = (f) => fs.readFileSync(f, 'utf8');
const pages = new Map(htmlFiles.map((f) => [f, read(f)]));

// ---------------------------------------------------------------- S1
// Zero external references. A link the course cites in prose is fine — a learner
// may click it. Anything the page *loads* is not.
for (const [f, html] of pages) {
  for (const m of html.matchAll(/\bsrc="(https?:)?\/\//g)) {
    fail('S1', `${relOf(f)} loads a remote resource: ${m[0]}`);
  }
  for (const m of html.matchAll(/@import\s+url\(\s*['"]?https?:/g)) {
    fail('S1', `${relOf(f)} imports a remote stylesheet`);
  }
  for (const m of html.matchAll(/\.woff2?["')]/g)) {
    fail('S1', `${relOf(f)} references a webfont`);
  }
}
for (const f of allFiles.filter((x) => /\.(js|css)$/.test(x))) {
  const src = read(f);
  for (const pat of [/\bfetch\s*\(/g, /XMLHttpRequest/g, /\bnew WebSocket/g]) {
    if (pat.test(src)) fail('S1', `${relOf(f)} makes a network call (${pat.source})`);
  }
  if (/@import\s+url\(\s*['"]?https?:/.test(src)) fail('S1', `${relOf(f)} imports a remote stylesheet`);
  if (/\.woff2?["')]/.test(src)) fail('S1', `${relOf(f)} references a webfont`);
}

// ---------------------------------------------------------------- S2
// No absolute internal paths, so a subpath deploy works. `/_astro/` is called out
// separately because it is the specific failure a bundler reintroduces silently.
for (const [f, html] of pages) {
  for (const m of html.matchAll(/(?:src|href)="\/(?!\/)/g)) {
    fail('S2', `${relOf(f)} has a root-absolute URL at offset ${m.index}`);
  }
  if (html.includes('/_astro/')) {
    fail('S2', `${relOf(f)} references /_astro/ — a bundled asset escaped into the output`);
  }
}
for (const f of allFiles.filter((x) => /\.(js|css)$/.test(x))) {
  if (read(f).includes('/_astro/')) fail('S2', `${relOf(f)} references /_astro/`);
}

// ---------------------------------------------------------------- S3
// Every link resolves. Fragments must match an id on the target page.
const idsOf = (html) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const idCache = new Map();
function idsFor(file) {
  if (!idCache.has(file)) idCache.set(file, idsOf(pages.get(file) ?? read(file)));
  return idCache.get(file);
}

for (const [f, html] of pages) {
  const dir = path.dirname(f);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|data:|#|javascript:)/.test(raw)) {
      if (raw.startsWith('#')) {
        if (!idsFor(f).has(raw.slice(1))) {
          fail('S3', `${relOf(f)} links to missing fragment ${raw}`);
        }
      }
      continue;
    }
    const [p, frag] = raw.split('#');
    const target = path.resolve(dir, p);
    if (!fs.existsSync(target)) {
      fail('S3', `${relOf(f)} links to missing ${raw}`);
      continue;
    }
    if (frag && target.endsWith('.html') && !idsFor(target).has(frag)) {
      fail('S3', `${relOf(f)} links to ${p}#${frag} but that id is not on the page`);
    }
  }
}

// ---------------------------------------------------------------- S4
// Content without JavaScript. Every quiz question must ship its answer and
// explanation in a <details>, and every flashcard both faces.
for (const [f, html] of pages) {
  const quizBlocks = [...html.matchAll(/<div class="q">/g)].length;
  if (quizBlocks) {
    const details = [...html.matchAll(/<details[^>]*>\s*<summary>Show answer<\/summary>/g)].length;
    if (details !== quizBlocks) {
      fail('S4', `${relOf(f)} has ${quizBlocks} questions but ${details} no-JS answer blocks`);
    }
  }
  const cards = [...html.matchAll(/class="fc"/g)].length;
  if (cards) {
    const faces = [...html.matchAll(/class="fc__face/g)].length;
    if (faces !== cards * 2) {
      fail('S4', `${relOf(f)} has ${cards} flashcards but ${faces} faces (expected ${cards * 2})`);
    }
  }
}

// ---------------------------------------------------------------- S5
// Storage safety: exactly one module touches localStorage, and reset removes one key.
for (const [f, html] of pages) {
  if (/localStorage/.test(html)) fail('S5', `${relOf(f)} touches localStorage inline`);
}
for (const f of allFiles.filter((x) => x.endsWith('.js'))) {
  const src = read(f);
  if (/localStorage\s*\.\s*clear/.test(src)) {
    fail('S5', `${relOf(f)} calls localStorage.clear() — it must remove only its own key`);
  }
}
const runtime = allFiles.find((f) => f.endsWith('assets/site.js'));
if (!runtime) fail('S5', 'assets/site.js is missing');
else if (!/localStorage/.test(read(runtime))) {
  fail('S5', 'assets/site.js never touches localStorage — progress cannot persist');
}

// ---------------------------------------------------------------- S6 / S7
// JSON integrity and objective wiring.
for (const [f, html] of pages) {
  for (const m of html.matchAll(
    /<script type="application\/json"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    let parsed;
    try {
      parsed = JSON.parse(m[2]);
    } catch (err) {
      fail('S6', `${relOf(f)} #${m[1]} is not valid JSON: ${err.message}`);
      continue;
    }
    if (m[1] !== 'quiz-data') continue;
    const optionCounts = [...html.matchAll(/<fieldset>([\s\S]*?)<\/fieldset>/g)].map(
      (fs2) => [...fs2[1].matchAll(/class="opt"/g)].length,
    );
    parsed.questions.forEach((q, i) => {
      if (!Array.isArray(q.objectives) || q.objectives.length === 0) {
        fail('S7', `${relOf(f)} question ${i + 1} has no objectives[]`);
      }
      if (q.type === 'MULTIPLE_CHOICE') {
        const n = optionCounts[i];
        if (n !== 4) fail('S6', `${relOf(f)} question ${i + 1} renders ${n} options, expected 4`);
        if (!(q.correctOptionIndex >= 0 && q.correctOptionIndex < 4)) {
          fail('S6', `${relOf(f)} question ${i + 1} correctOptionIndex ${q.correctOptionIndex}`);
        }
      }
      if (q.type === 'TRUE_FALSE' && typeof q.correctAnswer !== 'boolean') {
        fail('S6', `${relOf(f)} question ${i + 1} TRUE_FALSE without correctAnswer`);
      }
    });
  }
}

// ---------------------------------------------------------------- S8
// Accessibility floor.
for (const [f, html] of pages) {
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) fail('S8', `${relOf(f)} has ${h1s} <h1> elements, expected exactly 1`);

  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      advise(`${relOf(f)} skips from h${levels[i - 1]} to h${levels[i]}`);
      break;
    }
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) fail('S8', `${relOf(f)} has an <img> without alt`);
  }

  const ids = idsFor(f);
  for (const m of html.matchAll(/<(input|textarea|select)\b[^>]*>/g)) {
    const tag = m[0];
    if (/type="(hidden|radio|checkbox)"/.test(tag)) continue; // wrapped in or bound to a label
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const labelled =
      (id && new RegExp(`<label[^>]*\\bfor="${id}"`).test(html)) ||
      /aria-label=|aria-labelledby=/.test(tag);
    if (!labelled) fail('S8', `${relOf(f)} has an unlabelled ${m[1]}`);
    void ids;
  }
}
for (const f of allFiles.filter((x) => x.endsWith('.css'))) {
  const css = read(f);
  if (/outline:\s*none/.test(css) && !/:focus-visible/.test(css)) {
    fail('S8', `${relOf(f)} uses outline:none without a :focus-visible replacement`);
  }
}

// ---------------------------------------------------------------- S9 / S10
const certFile = htmlFiles.find((f) => path.basename(f) === 'certificate.html');
if (!certFile) fail('S9', 'certificate.html is missing');
else {
  const cert = pages.get(certFile);
  const css = allFiles.filter((f) => f.endsWith('.css')).map(read).join('\n');
  if (!/@media\s+print/.test(css)) fail('S9', 'no print stylesheet found');
  if (!/\.no-print/.test(css)) fail('S9', 'print stylesheet does not hide .no-print');
  if (!/size:\s*landscape/.test(css)) fail('S9', 'print stylesheet does not set landscape');
  if (!/data-print/.test(cert)) fail('S9', 'certificate.html has no print control');

  if (!/self-reported/i.test(cert)) {
    fail('S10', 'certificate.html does not call itself a self-reported record');
  }
  if (!/this browser/i.test(cert)) {
    fail('S10', 'certificate.html does not say progress is stored only in this browser');
  }
  // The gate bans claims of verification, not the words themselves: "not verified
  // by anyone" is exactly the disclaimer the gate exists to require. Only an
  // affirmative use fails.
  for (const word of ['verified', 'accredited', 'certified by']) {
    for (const m of cert.matchAll(new RegExp(`[^.]*\\b${word}\\b`, 'gi'))) {
      const clause = m[0];
      const negated = /\b(not|never|cannot|can't|no|nothing|without)\b[^.]*$/i.test(
        clause.slice(0, clause.toLowerCase().lastIndexOf(word.split(' ')[0])),
      );
      if (!negated) {
        fail('S10', `certificate.html claims "${word}": …${clause.trim().slice(-90)}`);
      }
    }
  }
}

// ---------------------------------------------------------------- S11
for (const [f, html] of pages) {
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) {
      fail('S11', `${relOf(f)} has an <img> without width/height: ${src ?? tag.slice(0, 60)}`);
    }
    if (src && !/^(https?:|data:)/.test(src)) {
      const target = path.resolve(path.dirname(f), src.split('#')[0]);
      if (!fs.existsSync(target)) fail('S11', `${relOf(f)} references a missing image ${src}`);
    }
  }
}

// ---------------------------------------------------------------- S12
// Structural half of path independence: every asset reference is relative and
// carries the right number of `../` for its depth. The serve-from-a-subpath run
// is a manual step; this catches what a grep over HTML can.
for (const [f, html] of pages) {
  const depth = relOf(f).split(path.sep).length - 1;
  const expect = '../'.repeat(depth);
  for (const m of html.matchAll(/(?:src|href)="([^"]*assets\/[^"]+)"/g)) {
    if (!m[1].startsWith(expect) || (depth === 0 && m[1].startsWith('../'))) {
      fail('S12', `${relOf(f)} (depth ${depth}) references ${m[1]}, expected prefix "${expect}"`);
    }
  }
}

// ---------------------------------------------------------------- advisory
const totalBytes = allFiles.reduce((s, f) => s + fs.statSync(f).size, 0);
const biggest = allFiles
  .map((f) => ({ f, size: fs.statSync(f).size }))
  .sort((a, b) => b.size - a.size)[0];
advise(
  `payload ${(totalBytes / 1024 / 1024).toFixed(2)} MB across ${allFiles.length} files; ` +
    `largest ${relOf(biggest.f)} (${(biggest.size / 1024).toFixed(0)} KB)`,
);
if (runtime && fs.statSync(runtime).size > 60 * 1024) {
  advise(`assets/site.js is ${(fs.statSync(runtime).size / 1024).toFixed(0)} KB (> 60 KB)`);
}
for (const [f, html] of pages) {
  const seen = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) {
    if (seen.has(m[1])) advise(`${relOf(f)} has duplicate id "${m[1]}"`);
    seen.add(m[1]);
  }
}

// ---------------------------------------------------------------- report
const gates = [...new Set(failures.map((x) => x.split(':')[0]))].sort();
if (advisories.length) {
  console.log('Advisory:');
  for (const a of advisories.slice(0, 20)) console.log(`  · ${a}`);
  if (advisories.length > 20) console.log(`  · …and ${advisories.length - 20} more`);
  console.log('');
}
if (failures.length) {
  console.log(`FAILED ${gates.join(', ')} — ${failures.length} problem(s):`);
  for (const x of failures.slice(0, 60)) console.log(`  ✗ ${x}`);
  if (failures.length > 60) console.log(`  …and ${failures.length - 60} more`);
  process.exit(1);
}
console.log(`All gates passed — ${htmlFiles.length} pages, ${allFiles.length} files.`);
