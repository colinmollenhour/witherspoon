#!/usr/bin/env node
/**
 * `bun create witherspoon-course` / `npm create witherspoon-course`
 *
 * Adopts a course directory that already exists and makes it buildable: writes the
 * workspace package.json, installs witherspoon-course-template, and runs the first
 * build. It deliberately does **not** scaffold course content — course-builder writes
 * that, and a starter course generated here would be a second, ungrounded source of
 * truth for a project whose whole premise is that course.json is the only one.
 *
 * Everything it emits is a package *script*. On a machine with Bun and no Node the
 * bare `node_modules/.bin/witherspoon-course` shim cannot execute — its
 * `#!/usr/bin/env node` has nothing to resolve and the shell exits 127 — but
 * `bun run <script>` substitutes Bun for that shebang. Scripts are therefore the only
 * invocation form that works on every machine this is aimed at.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Kept in step with the template's major line; the caret allows patch upgrades. */
const TEMPLATE = 'witherspoon-course-template';
const TEMPLATE_RANGE = '^1.1.0';

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : (argv[i + 1] ?? null);
};

if (has('--help') || has('-h')) {
  console.log(`create-witherspoon-course

Set up the Witherspoon site builder around a course directory that already exists,
then build the site.

Usage:
  bun create witherspoon-course [options]
  npm create witherspoon-course [-- options]

Options:
  --course <dir>   the course directory to wire up (auto-detected when unambiguous)
  --skip-install   write package.json but do not install dependencies
  --skip-build     install but do not run the first build
  -h, --help       show this

Run it from the directory that contains your course-<slug>/ folder.`);
  process.exit(0);
}

const cwd = process.cwd();
const say = (msg) => console.log(msg);
const die = (msg) => {
  console.error(`\n${msg}\n`);
  process.exit(1);
};

// ---- 1. locate the course ---------------------------------------------------
/** A course directory is one containing course.json — not one matching a name pattern. */
function isCourseDir(dir) {
  try {
    return fs.statSync(path.join(dir, 'course.json')).isFile();
  } catch {
    return false;
  }
}

let courseDir = valueOf('--course');
if (courseDir) {
  courseDir = path.resolve(cwd, courseDir);
  if (!isCourseDir(courseDir)) die(`No course.json in ${courseDir}.`);
} else if (isCourseDir(cwd)) {
  // Run from inside the course itself: treat its parent as the workspace.
  die(
    `This looks like a course directory itself (it has course.json).\n` +
      `Run the command one level up, from the folder that contains it:\n\n` +
      `  cd ..\n  bun create witherspoon-course`,
  );
} else {
  const found = fs
    .readdirSync(cwd, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
    .map((e) => path.join(cwd, e.name))
    .filter(isCourseDir);

  if (found.length === 0) {
    die(
      `No course found in ${cwd}.\n\n` +
        `A course directory is one containing course.json. Generate one first with the\n` +
        `Witherspoon course-builder skill, then run this from the folder above it.`,
    );
  }
  if (found.length > 1) {
    die(
      `Several courses found here. Name the one to build:\n\n` +
        found.map((d) => `  bun create witherspoon-course --course ./${path.basename(d)}`).join('\n'),
    );
  }
  courseDir = found[0];
}

const rel = `./${path.relative(cwd, courseDir).split(path.sep).join('/')}`;
const course = JSON.parse(fs.readFileSync(path.join(courseDir, 'course.json'), 'utf8'));
say(`\nCourse: ${course.title ?? path.basename(courseDir)}  (${rel})`);

// ---- 2. pick a package manager ----------------------------------------------
/**
 * Prefer whichever manager actually invoked us; `bun create` and `npm create` both
 * set npm_config_user_agent. Falling back to a PATH probe covers a direct
 * `node index.mjs`, and Bun is preferred there because it is the lighter install for
 * someone who had no runtime ten minutes ago.
 */
function onPath(bin) {
  // One string, not (cmd, args) — `shell: true` with an args array is DEP0190.
  const probe = spawnSync(`${bin} --version`, { stdio: 'ignore', shell: true });
  return !probe.error && probe.status === 0;
}
const ua = process.env.npm_config_user_agent ?? '';
const pm = ua.startsWith('bun') ? 'bun' : ua.startsWith('npm') ? 'npm' : onPath('bun') ? 'bun' : 'npm';
say(`Package manager: ${pm}`);

// ---- 3. write the workspace package.json ------------------------------------
const pkgPath = path.join(cwd, 'package.json');
let pkg = { name: course.slug ? `${course.slug}-site` : 'witherspoon-course-site', private: true };
if (fs.existsSync(pkgPath)) {
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    say('Found an existing package.json — preserving it and merging scripts.');
  } catch (err) {
    die(`${pkgPath} exists but does not parse: ${err.message}`);
  }
}

const scripts = {
  build: `witherspoon-course build --course ${rel}`,
  dev: `witherspoon-course dev --course ${rel}`,
  verify: `witherspoon-course verify --course ${rel}`,
  test: `witherspoon-course test --course ${rel}`,
  'check-widgets': `witherspoon-course check-widgets --course ${rel}`,
  'render-views': `witherspoon-course render-views --course ${rel}`,
};

// Merge rather than replace: a course workspace may already carry a deploy script
// written by course-publish, and clobbering it would silently drop the destination.
pkg.scripts = { ...scripts, ...(pkg.scripts ?? {}) };
for (const [name, cmd] of Object.entries(scripts)) {
  const existing = pkg.scripts[name];
  // Refresh our own scripts (the course path may have changed) but never overwrite
  // one the user has customised into something that is not a template call.
  if (existing?.includes('witherspoon-course')) pkg.scripts[name] = cmd;
}
pkg.dependencies = { ...(pkg.dependencies ?? {}), [TEMPLATE]: TEMPLATE_RANGE };
if (pkg.private === undefined) pkg.private = true;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
say(`Wrote ${path.relative(cwd, pkgPath) || 'package.json'}`);

const gitignore = path.join(cwd, '.gitignore');
if (!fs.existsSync(gitignore)) {
  fs.writeFileSync(gitignore, 'node_modules/\ndist/\n.herenow/\n');
  say('Wrote .gitignore');
}

// Workspace provenance only — never the learner-facing course-<slug>/README.md that
// course-builder already writes. Skip when a README is already present.
const workspaceReadme = path.join(cwd, 'README.md');
if (!fs.existsSync(workspaceReadme)) {
  const createdBy = course.license?.holder || 'unknown';
  const created = new Date().toISOString().slice(0, 10);
  const why = (course.subtitle || 'A Witherspoon course workspace.').replace(/\|/g, '\\|');
  const title = course.title || path.basename(courseDir);
  fs.writeFileSync(
    workspaceReadme,
    `# ${title}

| | |
| --- | --- |
| **Created by** | ${createdBy} |
| **Created** | ${created} |
| **Why** | ${why} |

Course materials live in [\`${rel}\`](${rel}).

This workspace was set up with [Witherspoon](https://github.com/colinmollenhour/witherspoon)
(\`course-builder\` → \`course-site\` → \`course-publish\`).

## Commands

\`\`\`bash
bun run dev
bun run build
bun run verify
\`\`\`
`,
  );
  say('Wrote README.md (provenance)');
}

// ---- 4. install and build ----------------------------------------------------
/**
 * `npm create` reaches us through `npm exec`, which exports its whole resolved config
 * into the environment as `npm_config_*`. A nested `npm install` inherits those, and
 * npm 11 rejects the inherited `--allow-scripts` outright:
 *
 *   npm error code EALLOWSCRIPTS
 *   npm error --allow-scripts is not allowed in project-scoped installs
 *
 * So the install fails on the npm path while working fine under Bun, which exports no
 * such thing. Drop the inherited config and let the child re-read `.npmrc` for itself,
 * keeping only the keys that carry registry location and credentials — strip those and
 * anyone on a private registry loses their auth.
 */
const KEEP_CONFIG = ['registry', '_auth', 'token', 'proxy', 'strict_ssl', 'cafile', 'userconfig'];

function childEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('npm_config_')) {
      env[key] = value;
      continue;
    }
    const setting = key.slice('npm_config_'.length).toLowerCase();
    if (KEEP_CONFIG.some((keep) => setting.includes(keep))) env[key] = value;
  }
  return env;
}

/**
 * `shell: true` is what makes this work on Windows, where `npm` is really `npm.cmd`
 * and a bare spawn misses it. The command goes as one string rather than
 * (cmd, args) because the pair form under a shell is DEP0190 — every argument here
 * is a literal from the two call sites below, so there is nothing to escape.
 */
function run(cmd, args) {
  const line = `${cmd} ${args.join(' ')}`;
  say(`\n$ ${line}`);
  const r = spawnSync(line, { cwd, stdio: 'inherit', shell: true, env: childEnv() });
  return (r.status ?? 1) === 0;
}

if (has('--skip-install')) {
  say('\nSkipped install (--skip-install).');
} else if (!run(pm, ['install'])) {
  die(`${pm} install failed. Fix the error above, then run: ${pm} install && ${pm} run build`);
}

const built =
  has('--skip-install') || has('--skip-build') ? false : run(pm, ['run', 'build']);

if (!has('--skip-install') && !has('--skip-build') && !built) {
  die(
    `The build failed. The course material is untouched — only the site build failed.\n` +
      `Read the error above; it names the course entry and field when the cause is content.`,
  );
}

// ---- 5. next steps -----------------------------------------------------------
const pending = [];
if (has('--skip-install')) pending.push(`  ${pm} install       install the site builder`);
if (!built) pending.push(`  ${pm} run build     build the site`);

say(`
${built ? `Built: ${rel}/dist` : 'Setup complete.'}

Next:
${pending.length ? `${pending.join('\n')}\n` : ''}  ${pm} run verify     check the build gates
  ${pm} run test       runtime behaviour in jsdom
  ${pm} run dev        preview with live reload — the best way to read it back

To inspect the built output itself (or to test a subpath deploy):
  cd ${rel}/dist && python3 -m http.server 8000

Always use "${pm} run <script>" rather than calling witherspoon-course directly —
on a Bun-only machine the bare binary cannot start.`);
