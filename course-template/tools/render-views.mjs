#!/usr/bin/env node
/**
 * Render the reviewable markdown views from course.json.
 *
 *   node tools/render-views.mjs --course <path-to-course-dir> [--check]
 *
 * course.json is the source of truth for every quiz, flashcard deck and unit test.
 * `quiz.md`, `flashcards.md` and `unit-test.md` exist so a human can read and
 * approve that content as prose — the same relationship README.md already has to
 * course.json ("No content that is not in the JSON").
 *
 * Rendering them rather than parsing them is what retires the heuristics: the old
 * builder had to guess an answer key back out of five different hand-written
 * markdown dialects, including one where `**Correct:** 2` meant a 1-based ordinal
 * and another where `**Correct option index:** 2` meant a 0-based index.
 *
 * `--check` rewrites nothing and exits non-zero if any file is out of date.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const at = argv.indexOf('--course');
if (at === -1 || !argv[at + 1]) {
  console.error('Usage: node tools/render-views.mjs --course <dir> [--check]');
  process.exit(2);
}
const checkOnly = argv.includes('--check');
const courseDir = path.resolve(argv[at + 1]);
const course = JSON.parse(fs.readFileSync(path.join(courseDir, 'course.json'), 'utf8'));

const byOrder = (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0);

function renderQuestion(q, n) {
  const out = [`## Question ${n}`, '', `**Type:** ${q.type}`, '', q.question.trim(), ''];

  if (q.type === 'MULTIPLE_CHOICE') {
    for (const opt of q.options ?? []) out.push(`- ${opt}`);
    out.push('', `**Correct option index:** ${q.correctOptionIndex}`, '');
  } else if (q.type === 'TRUE_FALSE') {
    out.push(`**Correct answer:** ${q.correctAnswer}`, '');
  } else if (q.type === 'SHORT_ANSWER') {
    out.push('**Sample answer:**', '', q.sampleAnswer.trim(), '');
    if (q.graderNotes) out.push('**A full-credit answer shows:**', '', q.graderNotes.trim(), '');
  }

  out.push('**Explanation:**', '', q.explanation.trim(), '');
  return out.join('\n');
}

function renderQuiz(topic) {
  const qs = [...(topic.quiz?.questions ?? [])].sort(byOrder);
  return [
    `# Quiz — ${topic.title}`,
    '',
    '<!-- Rendered from course.json by course-template/tools/render-views.mjs.',
    '     Edit course.json, then re-render. Edits here are overwritten. -->',
    '',
    ...qs.map((q, i) => renderQuestion(q, i + 1)),
  ].join('\n');
}

function renderFlashcards(topic) {
  const cards = [...(topic.flashcards ?? [])].sort(byOrder);
  const blocks = cards.map((c) => `**Front:** ${c.front.trim()}\n\n**Back:** ${c.back.trim()}\n`);
  return [
    `# Flashcards — ${topic.title}`,
    '',
    '<!-- Rendered from course.json by course-template/tools/render-views.mjs.',
    '     Edit course.json, then re-render. Edits here are overwritten. -->',
    '',
    blocks.join('\n---\n\n'),
  ].join('\n');
}

function renderUnitTest(unit, index) {
  const qs = [...(unit.test?.questions ?? [])].sort(byOrder);
  return [
    `# Unit ${index} test — ${unit.test.title}`,
    '',
    '<!-- Rendered from course.json by course-template/tools/render-views.mjs.',
    '     Edit course.json, then re-render. Edits here are overwritten. -->',
    '',
    `**Assesses:** ${unit.test.description}`,
    '',
    `**Passing score:** ${unit.test.passingScore}%`,
    '',
    ...qs.map((q, i) => renderQuestion(q, i + 1)),
  ].join('\n');
}

const written = [];
const stale = [];

function emit(rel, body) {
  const abs = path.join(courseDir, rel);
  const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (current === body) return;
  if (checkOnly) {
    stale.push(rel);
    return;
  }
  fs.writeFileSync(abs, body);
  written.push(rel);
}

for (const [ui, unit] of course.units.entries()) {
  let unitDir = null;
  for (const topic of unit.topics) {
    const paths = Object.fromEntries((topic.activities ?? []).map((a) => [a.type, a.path]));
    if (!unitDir && paths.READ) unitDir = paths.READ.split('/')[0];
    if (paths.QUIZ) emit(paths.QUIZ, renderQuiz(topic));
    if (paths.FLASHCARDS) emit(paths.FLASHCARDS, renderFlashcards(topic));
  }
  if (unit.test && unitDir) emit(`${unitDir}/unit-test.md`, renderUnitTest(unit, ui + 1));
}

if (checkOnly) {
  if (stale.length) {
    console.log(`${stale.length} markdown view(s) out of date with course.json:`);
    for (const s of stale) console.log(`  ✗ ${s}`);
    process.exit(1);
  }
  console.log('All markdown views match course.json.');
} else {
  console.log(`Rendered ${written.length} file(s) from course.json.`);
}
