/**
 * Loads the synced skill markdown and wraps it for delivery over MCP.
 *
 * Two things here are load-bearing and easy to mistake for decoration.
 *
 * First, the framing. A skill loaded by a harness arrives as *instructions*; the same
 * text arriving as a tool result is, to the model, just data — and the common failure
 * is an agent that reads a pipeline and then narrates it back to the user instead of
 * executing it. Every response therefore opens by saying what it is and closes with
 * the next call to make.
 *
 * Second, the granularity. The skills total roughly 150 KB. Returning them together
 * would spend most of a context window before any work starts, and would defeat the
 * per-stage split the `references/` directories exist to provide. One document per
 * call, always.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT = path.join(HERE, 'content');

export const VERSION = JSON.parse(
  fs.readFileSync(path.join(HERE, 'package.json'), 'utf8'),
).version;

/** The template version the instructions in this server assume. */
export const TEMPLATE_VERSION = '1.2.0';

/**
 * Flat names, because they are unique across the skills and an agent choosing
 * from an enum should not have to know which skill owns which document.
 */
export const REFERENCES = {
  spine: {
    path: 'course-builder/references/spine.md',
    blurb: 'picking the running example and the measurable transformation (Stage 2)',
  },
  'outline-contract': {
    path: 'course-builder/references/outline-contract.md',
    blurb: 'the per-topic generation contract format (Stage 3)',
  },
  'outline-critic': {
    path: 'course-builder/references/outline-critic.md',
    blurb: 'the Stage 3 critic: cut satellites before the user sees the syllabus',
  },
  'learner-pass': {
    path: 'course-builder/references/learner-pass.md',
    blurb: 'read the course as a first-hour learner; in-pipeline editor and invoked review',
  },
  grounding: {
    path: 'course-builder/references/grounding.md',
    blurb: 'the five-angle research expedition and the SOURCES.md ledger (Stages 5–6)',
  },
  'activity-specs': {
    path: 'course-builder/references/activity-specs.md',
    blurb: 'per-activity rules — length, structure, counts; hand to each topic agent (Stage 7)',
  },
  'project-types': {
    path: 'course-builder/references/project-types.md',
    blurb: 'the project types, environments and rubrics; hand to each project agent (Stage 7)',
  },
  'quality-gates': {
    path: 'course-builder/references/quality-gates.md',
    blurb: 'the fail-the-build checklist for course material (Stage 8)',
  },
  schema: {
    path: 'course-builder/references/schema.md',
    blurb: 'the full course.json shape — the single source of truth for all assessment data',
  },
  'runtime-setup': {
    path: 'course-builder/references/runtime-setup.md',
    blurb: 'Node/Bun install commands and when to raise them (same content as witherspoon_prereqs)',
  },
  'site-spec': {
    path: 'course-site/references/site-spec.md',
    blurb: 'the design contract the site template implements; read only when changing the template',
  },
  state: {
    path: 'course-site/references/state.md',
    blurb: 'the localStorage contract and every failure mode',
  },
  'build-gates': {
    path: 'course-site/references/build-gates.md',
    blurb: 'what each site gate S1–S15 means, including the two that stay manual',
  },
  widgets: {
    path: 'course-site/references/widgets.md',
    blurb: 'the eight interactive widget types and their JSON, for authors',
  },
  visuals: {
    path: 'course-site/references/visuals.md',
    blurb: 'composing diagram and image tools, wiring heroes, and the fallbacks',
  },
  'here-now': {
    path: 'course-publish/references/here-now.md',
    blurb: 'here.now (default): witherspoon-course publish, anonymous 24h vs permanent, republish',
  },
  vercel: {
    path: 'course-publish/references/vercel.md',
    blurb: 'Vercel (advanced alternative): browser drop, CLI route, custom hostnames',
  },
};

const cache = new Map();

function read(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const abs = path.join(CONTENT, rel);
  if (!abs.startsWith(CONTENT)) throw new Error(`Refusing to read outside content/: ${rel}`);
  let text = fs.readFileSync(abs, 'utf8');
  // Strip YAML frontmatter. `name` and `description` exist so a harness can decide
  // whether to load the skill; here the tool description already did that job, and
  // leaving it in invites the agent to treat the block as data to report.
  text = text.replace(/^---\n[\s\S]*?\n---\n+/, '');
  cache.set(rel, text);
  return text;
}

export function loadAll() {
  const missing = [];
  for (const [name, { path: rel }] of Object.entries(REFERENCES)) {
    try {
      read(rel);
    } catch {
      missing.push(`${name} → ${rel}`);
    }
  }
  for (const rel of [
    'course-builder/SKILL.md',
    'course-site/SKILL.md',
    'course-publish/SKILL.md',
    'course-review/SKILL.md',
  ]) {
    try {
      read(rel);
    } catch {
      missing.push(rel);
    }
  }
  if (missing.length) {
    throw new Error(
      `Missing content — run "npm run sync" in mcp-server/:\n${missing.map((m) => `  ${m}`).join('\n')}`,
    );
  }
}

/**
 * The instruction envelope. `next` is not politeness: without an explicit pointer,
 * an agent that has finished one stage has no way to know another call exists, and
 * the pipeline stops halfway with the user none the wiser.
 */
export function envelope({ title, body, next }) {
  return `# ${title}

**This is a set of operating instructions, not reference material.** Carry it out with your own
file, shell, and subagent tools. Do not paste it into the conversation or summarise it back to the
user — do the work it describes, and talk to the user only where it tells you to.

---

${body.trim()}

---

## Next call

${next.trim()}

<!-- witherspoon-mcp ${VERSION} · witherspoon-course-template ${TEMPLATE_VERSION} -->
`;
}

export const skill = {
  builder: () => read('course-builder/SKILL.md'),
  site: () => read('course-site/SKILL.md'),
  publish: () => read('course-publish/SKILL.md'),
  review: () => read('course-review/SKILL.md'),
};

export function reference(name) {
  const entry = REFERENCES[name];
  if (!entry) throw new Error(`Unknown reference: ${name}`);
  return read(entry.path);
}
