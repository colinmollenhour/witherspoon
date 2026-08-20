/**
 * Scaffolder writes a GitHub Pages workflow once, never overwrites it, and
 * skips it when the course sits outside the workspace.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const CLI = fileURLToPath(new URL('./index.mjs', import.meta.url));

function scaffold(cwd, args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, npm_config_user_agent: 'npm' },
  });
}

function makeCourse(root, name) {
  const dir = path.join(root, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'course.json'),
    `${JSON.stringify({ title: 'Test course', slug: name.replace(/^course-/, '') }, null, 2)}\n`,
  );
  return dir;
}

test('writes a Pages workflow pointing at the course dist/', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'witherspoon-create-'));
  try {
    makeCourse(tmp, 'course-water');
    const r = scaffold(tmp, ['--course', './course-water', '--skip-install', '--skip-build']);
    assert.equal(r.status, 0, r.stderr || r.stdout);
    const workflow = fs.readFileSync(path.join(tmp, '.github/workflows/publish.yml'), 'utf8');
    assert.match(workflow, /path: "course-water\/dist"/);
    assert.match(workflow, /npm run build/);
    assert.match(workflow, /npm run verify/);
    assert.match(workflow, /npm run test/);
    assert.match(workflow, /actions\/deploy-pages@v4/);
    assert.match(workflow, /node-version: 22/);
    assert.match(workflow, /\$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
    assert.equal(workflow.includes('node_modules/.bin/witherspoon-course'), false);
    assert.match(fs.readFileSync(path.join(tmp, 'README.md'), 'utf8'), /GitHub Pages/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('does not overwrite an existing publish.yml', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'witherspoon-create-'));
  try {
    makeCourse(tmp, 'course-water');
    const workflowPath = path.join(tmp, '.github/workflows/publish.yml');
    fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
    fs.writeFileSync(workflowPath, '# custom\n');
    const r = scaffold(tmp, ['--course', './course-water', '--skip-install', '--skip-build']);
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.equal(fs.readFileSync(workflowPath, 'utf8'), '# custom\n');
    assert.match(r.stdout, /leaving it/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('skips the workflow when the course is outside the workspace', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'witherspoon-create-'));
  try {
    const course = makeCourse(tmp, 'course-water');
    const workspace = path.join(tmp, 'workspace');
    fs.mkdirSync(workspace);
    const r = scaffold(workspace, ['--course', course, '--skip-install', '--skip-build']);
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.equal(fs.existsSync(path.join(workspace, '.github/workflows/publish.yml')), false);
    assert.match(r.stdout, /outside this workspace/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
