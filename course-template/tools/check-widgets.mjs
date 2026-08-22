#!/usr/bin/env node
/**
 * Validate every ```widget block in a course's markdown, without building the site.
 *
 *   node tools/check-widgets.mjs --course <path-to-course-dir>
 *
 * The build already fails on a malformed widget, naming the file and the field. This
 * exists so course-builder can catch one at gate G14 — before the handoff — rather
 * than the site build being the first thing to notice.
 *
 * It reports the same errors the build would, plus the per-topic budget, and exits
 * non-zero if anything is wrong.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const at = argv.indexOf('--course');
if (at === -1 || !argv[at + 1]) {
  console.error('Usage: node tools/check-widgets.mjs --course <path-to-course-dir>');
  process.exit(2);
}
const courseDir = path.resolve(argv[at + 1]);
if (!fs.existsSync(courseDir)) {
  console.error(`No such directory: ${courseDir}`);
  process.exit(2);
}

// The compiler is TypeScript and this is a plain node script, so the validation
// rules are not importable here. Re-deriving them would create a second source of
// truth that drifts — the one thing this whole pipeline keeps avoiding. Instead,
// parse and shape-check, and let the build own the deep validation.
const KINDS = ['anatomy', 'flow', 'compare', 'terminal', 'match', 'order', 'sequence', 'tree'];
const REQUIRED = {
  anatomy: ['parts'],
  flow: ['steps'],
  compare: ['columns', 'rows'],
  terminal: ['lines'],
  match: ['pairs'],
  order: ['items'],
  sequence: ['actors', 'messages'],
  tree: ['root'],
};

const FENCE = /^[ \t]*```[ \t]*widget[ \t]*\n([\s\S]*?)\n[ \t]*```[ \t]*$/gm;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'dist' || e.name === 'node_modules' || e.name === 'assets') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, out);
    else if (e.name.endsWith('.md')) out.push(abs);
  }
  return out;
}

const errors = [];
const notes = [];
let total = 0;

for (const file of walk(courseDir)) {
  const rel = path.relative(courseDir, file);
  const src = fs.readFileSync(file, 'utf8');
  let n = 0;

  for (const m of src.matchAll(FENCE)) {
    n += 1;
    total += 1;
    let spec;
    try {
      spec = JSON.parse(m[1]);
    } catch (err) {
      errors.push(`${rel} block ${n}: not valid JSON — ${err.message}`);
      continue;
    }
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
      errors.push(`${rel} block ${n}: must be a JSON object`);
      continue;
    }
    if (!KINDS.includes(spec.type)) {
      errors.push(
        `${rel} block ${n}: unknown type ${JSON.stringify(spec.type)} — expected one of ${KINDS.join(', ')}`,
      );
      continue;
    }
    for (const field of REQUIRED[spec.type]) {
      const v = spec[field];
      const empty = v === undefined || v === null || (Array.isArray(v) && v.length === 0);
      if (empty) errors.push(`${rel} block ${n}: ${spec.type} needs a non-empty \`${field}\``);
    }
    if (spec.type === 'compare' && Array.isArray(spec.columns) && Array.isArray(spec.rows)) {
      spec.rows.forEach((r, i) => {
        if (Array.isArray(r?.cells) && r.cells.length !== spec.columns.length) {
          errors.push(
            `${rel} block ${n}: rows[${i}].cells has ${r.cells.length} entries, ` +
              `but there are ${spec.columns.length} columns`,
          );
        }
      });
    }
    if (spec.type === 'sequence' && Array.isArray(spec.messages)) {
      spec.messages.forEach((msg, i) => {
        const n2 = (spec.actors ?? []).length;
        if (!(msg?.from >= 0 && msg.from < n2) || !(msg?.to >= 0 && msg.to < n2)) {
          errors.push(`${rel} block ${n}: messages[${i}] refers to an actor outside 0..${n2 - 1}`);
        } else if (msg.from === msg.to) {
          errors.push(`${rel} block ${n}: messages[${i}] goes from an actor to itself`);
        }
      });
    }
  }

  // Budget, per activity-specs.md. Advisory: an over-budget reading is a judgement
  // call, not a broken one.
  if (n > 2) notes.push(`${rel} has ${n} widgets — the budget is two per topic`);
}

// Scene visualizations live beside the assets as `assets/viz/<name>.viz.json`
// and are embedded as an image of the sibling `<name>.svg` (see lib/viz.ts).
// Same policy as widgets: shape-check here, leave the deep rules to the build.
const VIZ_KINDS = ['box', 'chip', 'text', 'wire'];
const ACTIONS = ['show', 'hide', 'state', 'text', 'move', 'jump'];
const vizDir = path.join(courseDir, 'assets', 'viz');
const vizFiles = fs.existsSync(vizDir)
  ? fs.readdirSync(vizDir).filter((f) => f.endsWith('.viz.json')).sort()
  : [];
const allMd = walk(courseDir).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

for (const file of vizFiles) {
  const rel = path.join('assets', 'viz', file);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(path.join(vizDir, file), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: not valid JSON — ${err.message}`);
    continue;
  }
  const svg = rel.replace(/\.viz\.json$/, '.svg');
  if (!allMd.includes(`(${svg}`)) {
    notes.push(`${rel} is not embedded anywhere — reference it as ![alt](${svg} "caption") in a read.md`);
  }
  if (!spec?.canvas || !(spec.canvas.width > 0) || !(spec.canvas.height > 0)) {
    errors.push(`${rel}: \`canvas\` needs positive width and height`);
  }
  const ids = new Set();
  for (const [i, el] of (Array.isArray(spec?.elements) ? spec.elements : []).entries()) {
    if (!el?.id) errors.push(`${rel}: elements[${i}] needs an \`id\``);
    else if (ids.has(el.id)) errors.push(`${rel}: duplicate element id "${el.id}"`);
    else ids.add(el.id);
    if (!VIZ_KINDS.includes(el?.kind)) {
      errors.push(`${rel}: elements[${i}] has unknown kind ${JSON.stringify(el?.kind)} — expected one of ${VIZ_KINDS.join(', ')}`);
    }
  }
  if (!ids.size) errors.push(`${rel}: \`elements\` must be a non-empty array`);
  const phases = Array.isArray(spec?.phases) ? spec.phases : [];
  if (!phases.length) errors.push(`${rel}: \`phases\` must be a non-empty array`);
  for (const [pi, p] of phases.entries()) {
    if (!p?.id || !p?.title) errors.push(`${rel}: phases[${pi}] needs \`id\` and \`title\``);
    for (const [ai, a] of (p?.actions ?? []).entries()) {
      const keys = Object.keys(a ?? {}).filter((k) => ACTIONS.includes(k));
      if (!keys.length) errors.push(`${rel}: phase "${p?.id}" actions[${ai}] needs one of ${ACTIONS.join(', ')}`);
      for (const k of keys) {
        const ref = typeof a[k] === 'string' ? a[k] : a[k]?.el;
        if (!ids.has(ref)) errors.push(`${rel}: phase "${p?.id}" actions[${ai}] refers to unknown element "${ref}"`);
      }
    }
  }
  if (spec?.poster && !phases.some((p) => p?.id === spec.poster)) {
    errors.push(`${rel}: \`poster\` names phase "${spec.poster}" which does not exist`);
  }
}

for (const e of errors) console.log(`  ✗ ${e}`);
for (const a of notes) console.log(`  · ${a}`);
const vizNote = vizFiles.length ? ` and ${vizFiles.length} scene(s)` : '';
console.log(
  errors.length
    ? `\n${errors.length} problem(s) across ${total} widget(s)${vizNote}.`
    : `\n${total} widget(s)${vizNote} checked, all well-formed.`,
);
process.exit(errors.length ? 1 : 0);
