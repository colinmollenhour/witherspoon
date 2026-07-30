#!/usr/bin/env node
/**
 * Build (or serve) a course site from this shared template.
 *
 *   npm run build -- --course ../course-from-apps-to-machines
 *   npm run dev   -- --course ../course-from-apps-to-machines [--host <ip>] [--port <n>]
 *
 * Three things happen before Astro runs:
 *   1. the TypeScript runtime is bundled to a single classic script
 *   2. the CSS partials are bundled to a single stylesheet
 *   3. any visuals committed in <course>/assets/ are staged alongside them
 *
 * All three land in .build/public/, which Astro copies verbatim into the output.
 * Nothing here goes through Astro's bundler, so no `/_astro/…` root-absolute URL
 * is ever emitted and the site stays deployable at any subpath.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/**
 * The same tool is reachable two ways — as `witherspoon-course build` from an
 * installed package, and as `npm run build --` from a checkout of this repo. Quoting
 * the form the caller did not use sends them to a script that does not exist on their
 * machine, so tools/cli.mjs sets WITHERSPOON_CLI and every hint below follows it.
 */
const viaCli = process.env.WITHERSPOON_CLI === '1';
const cliInvoke = process.env.WITHERSPOON_INVOKE || 'npx witherspoon-course';
const invoke = (cmd) => (viaCli ? `${cliInvoke} ${cmd}` : `npm run ${cmd} --`);

function usage(message) {
  console.error(`${message}\n`);
  console.error(`Usage: ${invoke('build')} --course <path-to-course-dir>`);
  console.error(`       ${invoke('dev')} --course <path-to-course-dir> [--host <ip>] [--port <n>]`);
  process.exit(2);
}

const argv = process.argv.slice(2);
const dev = argv.includes('--dev');
const at = argv.indexOf('--course');
if (at === -1 || !argv[at + 1]) usage('Missing --course.');

/** Optional passthrough to `astro dev`, so the preview can be reached from another machine. */
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1] ?? null;
};
const host = flag('--host');
const port = flag('--port');

const courseDir = path.resolve(argv[at + 1]);
if (!fs.existsSync(courseDir)) usage(`No such directory: ${courseDir}`);

/**
 * Dev and production stage to different directories, because `npm run dev` leaves
 * esbuild **watching**. With one shared directory a production build wipes it,
 * rebuilds minified, and the still-running watcher immediately writes its own
 * unminified output and a source map back over the top before Astro copies
 * publicDir into dist. The result is a `dist/` containing an unminified runtime and
 * a 90 KB `.map` — silently, and only for whoever happens to have a preview open.
 */
const STAGE = path.join(HERE, dev ? '.build/public-dev' : '.build/public');

const courseJson = path.join(courseDir, 'course.json');
if (!fs.existsSync(courseJson)) {
  usage(
    `${courseJson} does not exist.\n` +
      'This template builds an approved course directory — run course-builder first.',
  );
}
try {
  JSON.parse(fs.readFileSync(courseJson, 'utf8'));
} catch (err) {
  usage(`${courseJson} does not parse: ${err.message}`);
}

// ---- stage the public assets ------------------------------------------------
fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(path.join(STAGE, 'assets'), { recursive: true });

const jsOptions = {
  entryPoints: [path.join(HERE, 'src/runtime/index.ts')],
  outfile: path.join(STAGE, 'assets/site.js'),
  bundle: true,
  format: 'iife',
  target: 'es2019',
  minify: !dev,
  sourcemap: dev,
  legalComments: 'none',
};

const cssOptions = {
  entryPoints: [path.join(HERE, 'src/styles/index.css')],
  outfile: path.join(STAGE, 'assets/site.css'),
  bundle: true,
  minify: !dev,
  loader: { '.woff2': 'file' },
};

if (dev) {
  // The runtime and the design system are deliberately outside Astro's pipeline
  // (see the header comment), which also puts them outside its hot reload. Without
  // this, editing a stylesheet during `npm run dev` would appear to do nothing.
  // esbuild rewrites the file in publicDir; Vite notices and reloads the page.
  const [jsCtx, cssCtx] = await Promise.all([
    esbuild.context(jsOptions),
    esbuild.context(cssOptions),
  ]);
  await Promise.all([jsCtx.watch(), cssCtx.watch()]);
  console.log('Watching src/runtime/ and src/styles/ for changes.');
} else {
  await esbuild.build(jsOptions);
  await esbuild.build(cssOptions);
}

// Visuals live in the course's own tree so a rebuild cannot destroy them.
const courseAssets = path.join(courseDir, 'assets');
if (fs.existsSync(courseAssets)) {
  fs.cpSync(courseAssets, path.join(STAGE, 'assets'), { recursive: true });
}

/**
 * A course site is HTML plus `assets/`. Astro's content layer also drops build
 * scratch into the output (`content-modules.mjs`, `collections/*.schema.json`),
 * which is not part of the site. Prune to a whitelist rather than to a list of
 * known artifact names, so a future stray file does not silently ship either.
 */
function prune(dir, base = dir) {
  const removed = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const relPath = path.relative(base, abs);
    const top = relPath.split(path.sep)[0];
    if (top === 'assets') continue;
    if (entry.isDirectory()) {
      removed.push(...prune(abs, base));
      if (!fs.readdirSync(abs).length) fs.rmdirSync(abs);
      continue;
    }
    if (!entry.name.endsWith('.html')) {
      fs.rmSync(abs);
      removed.push(relPath);
    }
  }
  return removed;
}

// ---- hand off to Astro ------------------------------------------------------
/**
 * Spawn Astro's JS entry with *this* runtime rather than `node_modules/.bin/astro`.
 *
 * That shim starts `#!/usr/bin/env node`. A package manager running our scripts
 * substitutes its own runtime for that shebang, but `spawn()` does not — the kernel
 * reads it literally. So on a machine with Bun and no Node, launching the shim dies
 * with `env: 'node': No such file or directory` *after* the esbuild stage has already
 * succeeded, which reads as a template bug rather than a missing runtime.
 *
 * `process.execPath` is whichever runtime is executing this file, so the child
 * inherits it. Resolve through `astro/package.json` and not `astro/astro.js`: the
 * latter is absent from Astro's `exports` map and fails to resolve under both
 * runtimes. Resolving from HERE/package.json (not from this module's URL) keeps the
 * lookup anchored to the template's own dependency tree — Bun will otherwise
 * auto-install and silently resolve an unrelated Astro from its global cache.
 */
const require = createRequire(path.join(HERE, 'package.json'));
const astroEntry = path.join(path.dirname(require.resolve('astro/package.json')), 'astro.js');
const astroEnv = {
  ...process.env,
  COURSE_DIR: courseDir,
  // Which staging directory Astro should copy verbatim — see the note above.
  COURSE_STAGE: STAGE,
  // This template builds an offline-first site; the build should not phone home
  // either, and telemetry writes to a config dir that may not be writable.
  ASTRO_TELEMETRY_DISABLED: '1',
  /**
   * Only when a port was asked for by name. Astro otherwise walks forward to the
   * next free port, which reads as success while the browser keeps talking to a
   * server started earlier on the requested one — every fix then appears to do
   * nothing, because the page under test is stale output from another process.
   * Asking for a specific port and silently getting a different one is never what
   * the caller wanted; failing to start says so immediately.
   */
  ...(dev && port ? { COURSE_STRICT_PORT: '1' } : {}),
};

const astroArgs = [dev ? 'dev' : 'build'];
if (dev && host) astroArgs.push('--host', host);
if (dev && port) astroArgs.push('--port', port);

const child = spawn(process.execPath, [astroEntry, ...astroArgs], {
  cwd: HERE,
  stdio: 'inherit',
  env: astroEnv,
});
child.on('exit', (code) => {
  if (code === 0 && !dev) {
    const dist = path.join(courseDir, 'dist');
    const removed = prune(dist);
    if (removed.length) {
      console.log(`Pruned ${removed.length} non-site file(s): ${removed.join(', ')}`);
    }
    // `astro build` removes .astro/ on its way out, taking the generated types
    // with it, so sync runs afterwards. This is what makes `npm run typecheck`
    // and editor completion resolve the `astro:content` virtual module.
    spawnSync(process.execPath, [astroEntry, 'sync'], {
      cwd: HERE,
      stdio: 'ignore',
      env: astroEnv,
    });

    console.log(`\nBuilt: ${dist}`);
    console.log(`Verify: ${invoke('verify')} ${dist}`);
  }
  process.exit(code ?? 1);
});
