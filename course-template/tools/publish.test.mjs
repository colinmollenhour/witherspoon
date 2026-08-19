import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  collectFiles,
  guessContentType,
  isSecretRel,
  loadApiKey,
  loadClaimToken,
  loadManifestSlug,
  main,
  normalizeClient,
  parseArgs,
  publishSite,
  saveCredentials,
  savePublishState,
} from './publish.mjs';

function tmpDir(prefix = 'witherspoon-publish-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeTree(root, tree) {
  for (const [rel, contents] of Object.entries(tree)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contents);
  }
}

test('guessContentType covers the files a course dist actually ships', () => {
  assert.equal(guessContentType('index.html'), 'text/html; charset=utf-8');
  assert.equal(guessContentType('assets/site.css'), 'text/css; charset=utf-8');
  assert.equal(guessContentType('assets/site.js'), 'text/javascript; charset=utf-8');
  assert.equal(guessContentType('assets/img/hero.webp'), 'image/webp');
  assert.equal(guessContentType('notes.md'), 'text/plain; charset=utf-8');
  assert.equal(guessContentType('mystery.bin'), 'application/octet-stream');
});

test('normalizeClient matches the here.now helper rules', () => {
  assert.equal(normalizeClient('witherspoon'), 'witherspoon');
  assert.equal(normalizeClient('Claude Code'), 'claude-code');
  assert.equal(normalizeClient(''), 'witherspoon');
});

test('isSecretRel names the files Stage 2 must refuse', () => {
  assert.equal(isSecretRel('.env'), true);
  assert.equal(isSecretRel('.env.local'), true);
  assert.equal(isSecretRel('secrets/id_rsa'), true);
  assert.equal(isSecretRel('certs/star.pem'), true);
  assert.equal(isSecretRel('index.html'), false);
  assert.equal(isSecretRel('assets/site.js'), false);
});

test('collectFiles walks nested dist files with POSIX keys and hashes', () => {
  const dir = tmpDir();
  writeTree(dir, {
    'index.html': '<h1>hi</h1>',
    'assets/site.css': 'body{}',
    '.DS_Store': 'junk',
    '.herenow/state.json': '{"publishes":{}}',
  });
  const { files } = collectFiles(dir);
  assert.deepEqual(
    files.map((f) => f.path),
    ['assets/site.css', 'index.html'],
  );
  const html = files.find((f) => f.path === 'index.html');
  assert.equal(html.size, Buffer.byteLength('<h1>hi</h1>'));
  assert.equal(html.hash, crypto.createHash('sha256').update('<h1>hi</h1>').digest('hex'));
  assert.equal(html.contentType, 'text/html; charset=utf-8');
});

test('collectFiles refuses credential-like files rather than skipping them', () => {
  const dir = tmpDir();
  writeTree(dir, { 'index.html': 'ok', '.env': 'SECRET=1' });
  assert.throws(() => collectFiles(dir), /credential-like/);
});

test('collectFiles refuses a symlink that escapes the publish root', () => {
  const dir = tmpDir();
  const outside = path.join(tmpDir(), 'secret.txt');
  fs.writeFileSync(outside, 'nope');
  writeTree(dir, { 'index.html': 'ok' });
  fs.symlinkSync(outside, path.join(dir, 'leak.txt'));
  assert.throws(() => collectFiles(dir), /escape/);
});

test('loadApiKey prefers flag, then env, then the credentials file', () => {
  const creds = path.join(tmpDir(), 'credentials');
  fs.writeFileSync(creds, 'file-key\n');
  assert.equal(loadApiKey({ flag: 'flag-key', env: { HERENOW_API_KEY: 'env-key' }, credentialsPath: creds }).source, 'flag');
  assert.equal(loadApiKey({ env: { HERENOW_API_KEY: 'env-key' }, credentialsPath: creds }).source, 'env');
  assert.equal(loadApiKey({ env: {}, credentialsPath: creds }).key, 'file-key');
  assert.equal(loadApiKey({ env: {}, credentialsPath: path.join(tmpDir(), 'missing') }).source, 'none');
});

test('claim token and manifest slug round-trip from disk', () => {
  const course = tmpDir();
  const statePath = path.join(course, '.herenow', 'state.json');
  savePublishState(statePath, 'bright-canvas', {
    siteUrl: 'https://bright-canvas.here.now',
    claimToken: 'tok_abc',
  });
  assert.equal(loadClaimToken(statePath, 'bright-canvas'), 'tok_abc');
  fs.writeFileSync(
    path.join(course, '.course-publish.json'),
    JSON.stringify({ provider: 'here.now', destination: 'bright-canvas' }),
  );
  assert.equal(loadManifestSlug(course), 'bright-canvas');
  fs.writeFileSync(
    path.join(course, '.course-publish.json'),
    JSON.stringify({ provider: 'vercel', destination: 'other' }),
  );
  assert.equal(loadManifestSlug(course), '');
});

test('parseArgs accepts --course, login flags, and rejects unknowns', () => {
  const opts = parseArgs(['--course', './course-x', '--slug', 'abc']);
  assert.equal(opts.course, './course-x');
  assert.equal(opts.slug, 'abc');
  assert.throws(() => parseArgs(['--nope']), /unknown option/);
});

function startMock({ skipAll = false, failUpload = false } = {}) {
  const uploaded = [];
  const createdBodies = [];
  const finalized = [];
  let store = {};

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1`);
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const json = () => (raw.length ? JSON.parse(raw.toString('utf8')) : {});
      const send = (code, body) => {
        res.writeHead(code, { 'content-type': 'application/json' });
        res.end(JSON.stringify(body));
      };

      if (req.method === 'POST' && url.pathname === '/api/auth/agent/request-code') {
        send(200, { success: true, requiresCodeEntry: true, expiresAt: '2099-01-01T00:00:00.000Z' });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/auth/agent/verify-code') {
        const body = json();
        send(200, {
          success: true,
          email: body.email,
          apiKey: 'hnk_test_key',
          isNewUser: false,
          apiKeyName: body.keyName,
        });
        return;
      }
      if (
        (req.method === 'POST' && url.pathname === '/api/v1/publish') ||
        (req.method === 'PUT' && url.pathname.startsWith('/api/v1/publish/'))
      ) {
        const body = json();
        createdBodies.push({ method: req.method, path: url.pathname, body, auth: req.headers.authorization || '', client: req.headers['x-herenow-client'] });
        const slug = req.method === 'PUT' ? url.pathname.split('/').pop() : 'bright-canvas-a7k2';
        const uploads = skipAll
          ? []
          : body.files.map((f) => ({
              path: f.path,
              method: 'PUT',
              url: `http://127.0.0.1:${server.address().port}/upload/${encodeURIComponent(f.path)}`,
              headers: { 'Content-Type': f.contentType },
            }));
        send(200, {
          slug,
          siteUrl: `https://${slug}.here.now`,
          status: 'pending',
          isLive: false,
          requiresFinalize: true,
          claimToken: req.headers.authorization ? undefined : 'claim_once',
          claimUrl: req.headers.authorization ? undefined : `https://here.now/claim?slug=${slug}&token=claim_once`,
          expiresAt: req.headers.authorization ? null : '2099-01-02T00:00:00.000Z',
          upload: {
            versionId: 'ver_1',
            uploads,
            skipped: skipAll ? body.files.map((f) => f.path) : [],
            finalizeUrl: `http://127.0.0.1:${server.address().port}/api/v1/publish/${slug}/finalize`,
            expiresInSeconds: 900,
          },
        });
        return;
      }
      if (req.method === 'PUT' && url.pathname.startsWith('/upload/')) {
        const filePath = decodeURIComponent(url.pathname.slice('/upload/'.length));
        if (failUpload) {
          res.writeHead(500);
          res.end('nope');
          return;
        }
        uploaded.push({ path: filePath, bytes: raw.length, type: req.headers['content-type'] });
        store[filePath] = raw;
        res.writeHead(200);
        res.end();
        return;
      }
      if (req.method === 'POST' && url.pathname.endsWith('/finalize')) {
        const body = json();
        finalized.push(body);
        const slug = url.pathname.split('/')[4];
        send(200, {
          success: true,
          slug,
          siteUrl: `https://${slug}.here.now`,
          currentVersionId: body.versionId,
          unchanged: skipAll,
        });
        return;
      }
      send(404, { error: 'not found', code: 'not_found', message: url.pathname });
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        uploaded,
        createdBodies,
        finalized,
        store,
      });
    });
  });
}

test('publishSite create → parallel upload → finalize, then records claim state', async () => {
  const mock = await startMock();
  const dist = tmpDir();
  writeTree(dist, {
    'index.html': '<h1>Course</h1>',
    'assets/site.js': 'console.log(1)',
    'unit-1/topic-1.html': '<p>hi</p>',
  });
  const course = tmpDir();
  fs.writeFileSync(path.join(course, 'course.json'), JSON.stringify({ title: 'From Apps to Machines', subtitle: 'Same file, three addresses' }));
  const statePath = path.join(course, '.herenow', 'state.json');
  try {
    const result = await publishSite({
      target: dist,
      baseUrl: mock.baseUrl,
      courseDir: course,
      statePath,
      allowNonHerenowBaseUrl: true,
      log: () => {},
    });
    assert.equal(result.siteUrl, 'https://bright-canvas-a7k2.here.now');
    assert.equal(result.action, 'create');
    assert.equal(result.authMode, 'anonymous');
    assert.equal(result.uploaded, 3);
    assert.equal(result.skipped, 0);
    assert.equal(mock.uploaded.length, 3);
    assert.equal(mock.finalized.length, 1);
    assert.equal(mock.finalized[0].versionId, 'ver_1');
    assert.equal(mock.createdBodies[0].body.displayName, 'From Apps to Machines');
    assert.equal(mock.createdBodies[0].client, 'witherspoon/witherspoon-course');
    assert.equal(loadClaimToken(statePath, result.slug), 'claim_once');
  } finally {
    mock.server.close();
  }
});

test('publishSite refuses a tree with no root index.html', async () => {
  const dist = tmpDir();
  writeTree(dist, { 'unit-1/index.html': '<p>nested</p>' });
  await assert.rejects(
    () => publishSite({ target: dist, baseUrl: 'https://here.now', log: () => {} }),
    /no index.html at the root/,
  );
});

test('main reuses the here.now destination from .course-publish.json', async () => {
  const mock = await startMock();
  const course = tmpDir();
  writeTree(path.join(course, 'dist'), { 'index.html': '<h1>again</h1>' });
  fs.writeFileSync(
    path.join(course, '.course-publish.json'),
    JSON.stringify({ provider: 'here.now', destination: 'kept-slug' }),
  );
  const origLog = console.log;
  console.log = () => {};
  try {
    await main(['--course', course, '--base-url', mock.baseUrl, '--allow-nonherenow-base-url'], {
      log: () => {},
      env: {},
    });
    assert.equal(mock.createdBodies[0].method, 'PUT');
    assert.match(mock.createdBodies[0].path, /kept-slug$/);
  } finally {
    console.log = origLog;
    mock.server.close();
  }
});

test('publishSite skip-all republish still finalizes (the bash seq landmine)', async () => {
  const mock = await startMock({ skipAll: true });
  const dist = tmpDir();
  writeTree(dist, { 'index.html': '<h1>same</h1>' });
  try {
    const result = await publishSite({
      target: dist,
      slug: 'existing-slug',
      apiKey: 'hnk_saved',
      apiKeySource: 'credentials',
      baseUrl: mock.baseUrl,
      allowNonHerenowBaseUrl: true,
      log: () => {},
    });
    assert.equal(result.action, 'update');
    assert.equal(result.uploaded, 0);
    assert.equal(result.skipped, 1);
    assert.equal(result.unchanged, true);
    assert.equal(mock.uploaded.length, 0);
    assert.equal(mock.finalized.length, 1);
    assert.equal(mock.createdBodies[0].method, 'PUT');
    assert.match(mock.createdBodies[0].path, /existing-slug$/);
    assert.equal(mock.createdBodies[0].auth, 'Bearer hnk_saved');
  } finally {
    mock.server.close();
  }
});

test('publishSite refuses to send an API key to a non-default base URL', async () => {
  await assert.rejects(
    () =>
      publishSite({
        target: tmpDir(),
        apiKey: 'hnk_x',
        baseUrl: 'https://evil.example',
      }),
    /non-default base URL/,
  );
});

test('publishSite reports upload failures rather than finalizing a partial Site', async () => {
  const mock = await startMock({ failUpload: true });
  const dist = tmpDir();
  writeTree(dist, { 'index.html': '<h1>x</h1>' });
  try {
    await assert.rejects(
      () =>
        publishSite({
          target: dist,
          baseUrl: mock.baseUrl,
          allowNonHerenowBaseUrl: true,
          log: () => {},
        }),
      /failed to upload/,
    );
    assert.equal(mock.finalized.length, 0);
  } finally {
    mock.server.close();
  }
});

test('main --request-code and --verify-code talk to the auth endpoints', async () => {
  const mock = await startMock();
  const creds = path.join(tmpDir(), 'credentials');
  const logs = [];
  try {
    const sent = await main(['--request-code', 'ada@example.com', '--base-url', mock.baseUrl], {
      fetch: globalThis.fetch,
      log: (m) => logs.push(m),
      credentialsPath: creds,
      env: {},
    });
    assert.equal(sent, 0);
    assert.match(logs.join('\n'), /sign-in code sent/);

    const verified = await main(
      ['--verify-code', 'ABCD-2345', '--email', 'ada@example.com', '--base-url', mock.baseUrl],
      { log: () => {}, credentialsPath: creds, env: {} },
    );
    assert.equal(verified, 0);
    assert.equal(fs.readFileSync(creds, 'utf8').trim(), 'hnk_test_key');
  } finally {
    mock.server.close();
  }
});

test('main publishes --course/<dist> and prints publish_result lines on stderr', async () => {
  const mock = await startMock();
  const course = tmpDir();
  writeTree(path.join(course, 'dist'), { 'index.html': '<h1>live</h1>' });
  const logs = [];
  const prints = [];
  const origLog = console.log;
  console.log = (msg) => prints.push(String(msg));
  try {
    const code = await main(['--course', course, '--base-url', mock.baseUrl, '--allow-nonherenow-base-url'], {
      log: (m) => logs.push(m),
      env: {},
    });
    assert.equal(code, 0);
    assert.equal(prints[0], 'https://bright-canvas-a7k2.here.now');
    assert.match(logs.join('\n'), /publish_result\.auth_mode=anonymous/);
    assert.match(logs.join('\n'), /publish_result\.claim_url=https:\/\//);
  } finally {
    console.log = origLog;
    mock.server.close();
  }
});

test('saveCredentials writes mode 0600', () => {
  const creds = path.join(tmpDir(), '.herenow', 'credentials');
  saveCredentials('hnk_abc', creds);
  const mode = fs.statSync(creds).mode & 0o777;
  assert.equal(mode, 0o600);
});
