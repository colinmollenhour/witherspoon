#!/usr/bin/env node
/**
 * Copy the skills into the server's own tree.
 *
 * The server has to be deployable on its own — a container or a function, with no
 * checkout of this repo around it — so it cannot read `../.claude/skills` at runtime.
 * Copying makes the skills the single source and `content/` a generated artifact, the
 * same direction `render-views.mjs` establishes for the markdown views.
 *
 *   node tools/sync-content.mjs           # write
 *   node tools/sync-content.mjs --check   # fail if content/ has drifted
 *
 * `--check` is the guard that matters: without it, editing a SKILL.md and forgetting
 * to sync ships a server that quietly serves last month's pipeline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(HERE, '..', '.claude', 'skills');
const DEST = path.join(HERE, 'content');
const check = process.argv.includes('--check');

if (!fs.existsSync(SOURCE)) {
  console.error(`No skills at ${SOURCE}. Run this from a checkout of the Witherspoon repo.`);
  process.exit(2);
}

/** Every .md under the skills tree, as paths relative to SOURCE. */
function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(abs, base);
    return entry.name.endsWith('.md') ? [path.relative(base, abs)] : [];
  });
}

const files = walk(SOURCE).sort();
const drifted = [];
let written = 0;

for (const rel of files) {
  const from = path.join(SOURCE, rel);
  const to = path.join(DEST, rel);
  const source = fs.readFileSync(from, 'utf8');
  const current = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : null;
  if (source === current) continue;
  if (check) {
    drifted.push(rel);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, source);
  written += 1;
}

// A file deleted from the skills but left behind here would still be served.
const stale = fs.existsSync(DEST)
  ? walk(DEST).filter((rel) => !files.includes(rel))
  : [];
for (const rel of stale) {
  if (check) drifted.push(`${rel} (stale)`);
  else fs.rmSync(path.join(DEST, rel));
}

if (check) {
  if (drifted.length) {
    console.error(`content/ is out of date with .claude/skills:\n${drifted.map((f) => `  ${f}`).join('\n')}`);
    console.error('\nRun: npm run sync');
    process.exit(1);
  }
  console.log(`content/ matches .claude/skills — ${files.length} file(s).`);
} else {
  console.log(
    `Synced ${files.length} file(s): ${written} written, ${stale.length} stale removed.`,
  );
}
