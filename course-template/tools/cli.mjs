#!/usr/bin/env node
/**
 * The published entry point — `witherspoon-course <command>`.
 *
 * Exists so a course workspace never has to know where this package unpacked to.
 * Before it, every documented command was a path into a checked-out repo
 * (`cd course-template && npm run build -- --course ../course-x`), which is exactly
 * the coupling that stops a course from being built on a machine that only ever
 * installed the template as a dependency.
 *
 * Each subcommand re-execs the matching tool with `process.execPath` rather than
 * importing it. The tools parse `process.argv` directly and call `process.exit`, so
 * running them in-process would mean rewriting argv globally and trapping exits for
 * no gain; a child also keeps one tool's failure from poisoning the next. Using
 * execPath (not a bare `node`) is what lets the whole chain run on a machine that
 * has Bun and no Node — see the header of build.mjs.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'package.json'), 'utf8'));

/**
 * `takesDist` commands are documented as taking a built `dist/`, but a course author
 * is always holding a course directory. Accepting `--course` on them too means one
 * flag works everywhere and nobody has to remember which half of the pipeline
 * appends `/dist`.
 */
const COMMANDS = {
  build: { tool: 'build.mjs', blurb: 'build the site into <course>/dist' },
  dev: {
    tool: 'build.mjs',
    extra: ['--dev'],
    blurb: 'live preview (Tailscale + free port; [--host [ip]] [--port <n>])',
  },
  verify: { tool: 'verify.mjs', takesDist: true, blurb: 'static build gates S1–S15' },
  test: { tool: 'test-runtime.mjs', takesDist: true, blurb: 'runtime behaviour in jsdom' },
  'check-widgets': { tool: 'check-widgets.mjs', blurb: 'validate widget JSON, no build' },
  'render-views': { tool: 'render-views.mjs', blurb: 'regenerate markdown views [--check]' },
};

function help() {
  const width = Math.max(...Object.keys(COMMANDS).map((c) => c.length));
  const lines = Object.entries(COMMANDS).map(
    ([name, { blurb }]) => `  ${name.padEnd(width)}  ${blurb}`,
  );
  console.log(`witherspoon-course ${PKG.version}

Build a self-contained course website from an approved course directory.

Usage:
  witherspoon-course <command> --course <course-dir>

Commands:
${lines.join('\n')}

Examples:
  witherspoon-course build  --course ./course-my-slug
  witherspoon-course verify --course ./course-my-slug
  witherspoon-course dev    --course ./course-my-slug --port 4321

Every command accepts --course <course-dir>. verify and test also accept a built
dist/ path directly. A course directory is one containing course.json.`);
}

const argv = process.argv.slice(2);
const command = argv[0];

if (!command || command === '--help' || command === '-h' || command === 'help') {
  help();
  process.exit(command ? 0 : 2);
}
if (command === '--version' || command === '-v') {
  console.log(PKG.version);
  process.exit(0);
}

const spec = COMMANDS[command];
if (!spec) {
  console.error(`Unknown command: ${command}\n`);
  help();
  process.exit(2);
}

const rest = argv.slice(1);

// verify/test want a positional dist path; translate --course <dir> into <dir>/dist
// so the flag is uniform across the pipeline.
let forwarded = rest;
if (spec.takesDist) {
  const at = rest.indexOf('--course');
  if (at !== -1) {
    const dir = rest[at + 1];
    if (!dir) {
      console.error('--course needs a directory.');
      process.exit(2);
    }
    forwarded = [...rest.slice(0, at), ...rest.slice(at + 2), path.join(dir, 'dist')];
  }
}

/**
 * How a follow-up command should be *typed*, which is not the same as how this one
 * was reached. On a machine with Bun and no Node the bare `witherspoon-course` shim
 * cannot be executed at all — its `#!/usr/bin/env node` has nothing to resolve, and
 * the shell exits 127. Only a package script (`bun run …`) or `bunx` works, so a hint
 * printed as a bare binary name would be uncopyable on exactly the machines this
 * package exists to support. `npm_config_user_agent` is set by whichever manager ran
 * us; default to npx when nothing set it.
 */
const runner = (process.env.npm_config_user_agent ?? '').startsWith('bun') ? 'bunx' : 'npx';

const result = spawnSync(
  process.execPath,
  [path.join(HERE, spec.tool), ...(spec.extra ?? []), ...forwarded],
  {
    stdio: 'inherit',
    // Tells build.mjs to print its follow-up hints in a form that exists here,
    // rather than the in-repo `npm run …` form that only works in a checkout.
    env: { ...process.env, WITHERSPOON_CLI: '1', WITHERSPOON_INVOKE: `${runner} witherspoon-course` },
  },
);

if (result.error) {
  console.error(`Failed to run ${command}: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
