#!/usr/bin/env node
/**
 * Upload a built course dist/ to here.now.
 *
 * The official here.now helper is an agent-oriented bash script: it needs curl,
 * jq and `file`, walks the tree by rewriting a JSON array once per file, uploads
 * sequentially, and lives at a harness-specific path that cannot go in a portable
 * package.json. This is the same create → PUT → finalize API as a first-class
 * `witherspoon-course` command, so a workspace `deploy` script works on any
 * machine that already built the site. Named `publish.mjs` (not an npm `publish`
 * lifecycle script) so `npm publish` of this package still means the registry.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_BASE_URL = 'https://here.now';
export const DEFAULT_CLIENT = 'witherspoon';
const UPLOAD_CONCURRENCY = 8;
const CREDENTIALS_FILE = path.join(os.homedir(), '.herenow', 'credentials');

const MIME = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  xml: 'application/xml',
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
};

export function guessContentType(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

export function normalizeClient(name) {
  const normalized = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || DEFAULT_CLIENT;
}

export function clientHeader(name) {
  return `${normalizeClient(name)}/witherspoon-course`;
}

/** Relative POSIX path, never a Windows separator in the here.now manifest. */
function posixRel(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

export function isSecretRel(rel) {
  const base = rel.split('/').pop() ?? rel;
  if (base === '.env' || base.startsWith('.env.')) return true;
  if (/\.(pem|p12|pfx|key)$/i.test(base)) return true;
  if (/^id_(rsa|ed25519|ecdsa|dsa)(-.*)?$/.test(base)) return true;
  return false;
}

function isSkippedRel(rel) {
  const base = rel.split('/').pop() ?? rel;
  if (base === '.DS_Store') return true;
  if (rel === '.herenow/state.json' || rel === '.herenow/fork-meta.json') return true;
  if (rel.startsWith('.git/') || rel === '.git') return true;
  return false;
}

export function collectFiles(target) {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    throw Object.assign(new Error(`path does not exist: ${resolved}`), { code: 'USAGE' });
  }
  const stat = fs.lstatSync(resolved);
  if (stat.isFile() || stat.isSymbolicLink()) {
    const real = fs.realpathSync(resolved);
    const fileStat = fs.statSync(real);
    if (!fileStat.isFile()) {
      throw Object.assign(new Error(`not a file or directory: ${resolved}`), { code: 'USAGE' });
    }
    const buf = fs.readFileSync(real);
    return {
      root: path.dirname(real),
      files: [
        {
          path: path.basename(real),
          abs: real,
          size: buf.length,
          contentType: guessContentType(real),
          hash: crypto.createHash('sha256').update(buf).digest('hex'),
        },
      ],
    };
  }
  if (!stat.isDirectory()) {
    throw Object.assign(new Error(`not a file or directory: ${resolved}`), { code: 'USAGE' });
  }

  const root = fs.realpathSync(resolved);
  const files = [];
  const secrets = [];
  const escaped = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const rel = posixRel(root, abs);
      if (entry.isSymbolicLink()) {
        let real;
        try {
          real = fs.realpathSync(abs);
        } catch {
          escaped.push(rel);
          continue;
        }
        const realRoot = root.endsWith(path.sep) ? root : root + path.sep;
        if (real !== root && !real.startsWith(realRoot)) {
          escaped.push(rel);
          continue;
        }
        const linked = fs.statSync(real);
        if (linked.isDirectory()) walk(real);
        else if (linked.isFile()) consider(rel, real);
        continue;
      }
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (entry.isFile()) consider(rel, abs);
    }
  }

  function consider(rel, abs) {
    if (isSkippedRel(rel)) return;
    if (isSecretRel(rel)) {
      secrets.push(rel);
      return;
    }
    const buf = fs.readFileSync(abs);
    files.push({
      path: rel,
      abs,
      size: buf.length,
      contentType: guessContentType(abs),
      hash: crypto.createHash('sha256').update(buf).digest('hex'),
    });
  }

  walk(root);
  files.sort((a, b) => a.path.localeCompare(b.path));

  if (secrets.length || escaped.length) {
    const lines = [];
    if (secrets.length) {
      lines.push('refusing to publish credential-like files:');
      for (const rel of secrets) lines.push(`  ${rel}`);
    }
    if (escaped.length) {
      lines.push('refusing to publish symlinks that escape the publish root:');
      for (const rel of escaped) lines.push(`  ${rel}`);
    }
    throw Object.assign(new Error(lines.join('\n')), { code: 'USAGE' });
  }
  if (files.length === 0) {
    throw Object.assign(new Error('no files found'), { code: 'USAGE' });
  }
  return { root, files };
}

export function loadApiKey({ env = process.env, credentialsPath = CREDENTIALS_FILE, flag } = {}) {
  if (flag) return { key: String(flag).trim(), source: 'flag' };
  if (env.HERENOW_API_KEY) return { key: env.HERENOW_API_KEY.trim(), source: 'env' };
  try {
    const text = fs.readFileSync(credentialsPath, 'utf8').trim();
    if (text) return { key: text, source: 'credentials' };
  } catch {
    // missing file is the usual anonymous case
  }
  return { key: '', source: 'none' };
}

export function loadClaimToken(statePath, slug) {
  if (!slug || !statePath) return '';
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return state?.publishes?.[slug]?.claimToken || '';
  } catch {
    return '';
  }
}

export function loadManifestSlug(courseDir) {
  if (!courseDir) return '';
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(courseDir, '.course-publish.json'), 'utf8'),
    );
    if (manifest?.provider === 'here.now' && typeof manifest.destination === 'string') {
      return manifest.destination;
    }
  } catch {
    // no manifest yet — first publish
  }
  return '';
}

export function savePublishState(statePath, slug, entry) {
  let state = { publishes: {} };
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (!state.publishes || typeof state.publishes !== 'object') state.publishes = {};
  } catch {
    // first write
  }
  const prev = state.publishes[slug] && typeof state.publishes[slug] === 'object' ? state.publishes[slug] : {};
  state.publishes[slug] = { ...prev, ...entry };
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

export function saveCredentials(apiKey, credentialsPath = CREDENTIALS_FILE) {
  const dir = path.dirname(credentialsPath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(credentialsPath, `${apiKey.trim()}\n`, { mode: 0o600 });
  fs.chmodSync(credentialsPath, 0o600);
}

function flagError(message) {
  return Object.assign(new Error(message), { code: 'USAGE' });
}

export function parseArgs(argv) {
  const out = {
    target: '',
    course: '',
    slug: '',
    claimToken: '',
    apiKey: '',
    client: DEFAULT_CLIENT,
    baseUrl: DEFAULT_BASE_URL,
    allowNonHerenowBaseUrl: false,
    requestCode: '',
    verifyCode: '',
    email: '',
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('-')) throw flagError(`missing value for ${arg}`);
      i += 1;
      return value;
    };
    switch (arg) {
      case '--help':
      case '-h':
        out.help = true;
        break;
      case '--course':
        out.course = next();
        break;
      case '--slug':
        out.slug = next();
        break;
      case '--claim-token':
        out.claimToken = next();
        break;
      case '--api-key':
        out.apiKey = next();
        break;
      case '--client':
        out.client = next();
        break;
      case '--base-url':
        out.baseUrl = next();
        break;
      case '--allow-nonherenow-base-url':
        out.allowNonHerenowBaseUrl = true;
        break;
      case '--request-code':
        out.requestCode = next();
        break;
      case '--verify-code':
        out.verifyCode = next();
        break;
      case '--email':
        out.email = next();
        break;
      default:
        if (arg.startsWith('-')) throw flagError(`unknown option: ${arg}`);
        if (out.target) throw flagError(`unexpected argument: ${arg}`);
        out.target = arg;
    }
  }
  return out;
}

export function resolveTarget(opts) {
  if (opts.course) {
    return path.resolve(opts.course, 'dist');
  }
  if (opts.target) return path.resolve(opts.target);
  return '';
}

export function courseDirOf(opts, target) {
  if (opts.course) return path.resolve(opts.course);
  if (target && path.basename(target) === 'dist') return path.dirname(target);
  return '';
}

function usageText(invoke) {
  return `Usage: ${invoke} --course <course-dir> [options]
       ${invoke} <dist-dir> [options]

Publish a built course dist/ to here.now (create → upload → finalize).

Options:
  --course <dir>          course directory (publishes <dir>/dist)
  --slug <slug>           update an existing Site (else read .course-publish.json)
  --claim-token <token>   anonymous update token (else .herenow/state.json)
  --client <name>         agent name for X-HereNow-Client (default: witherspoon)
  --api-key <key>         override (prefer $HERENOW_API_KEY or ~/.herenow/credentials)
  --base-url <url>        API base (default: https://here.now)
  --allow-nonherenow-base-url
                          allow sending a key to a non-default --base-url
  --request-code <email>  start the agent email-code login
  --verify-code <code>    finish login (needs --email) and save the API key
  --email <email>         email for --verify-code
`;
}

async function mapPool(items, limit, fn) {
  if (items.length === 0) return [];
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i], i);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

function apiError(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback;
  const err = payload.error || payload.message || fallback;
  const details = payload.details;
  if (details == null || details === '') return err;
  const extra = typeof details === 'string' ? details : JSON.stringify(details);
  return `${err} (${extra})`;
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`non-JSON response (${res.status}): ${text.slice(0, 240)}`);
  }
}

export async function apiJson(url, { method = 'GET', headers = {}, body, fetchImpl } = {}) {
  const fetchFn = fetchImpl ?? globalThis.fetch;
  const res = await fetchFn(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readJson(res);
  if (!res.ok || payload.error) {
    throw new Error(apiError(payload, `HTTP ${res.status}`));
  }
  return payload;
}

function authHeaders(apiKey, client, extra = {}) {
  const headers = {
    'content-type': 'application/json',
    'x-herenow-client': clientHeader(client),
    ...extra,
  };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  return headers;
}

export async function requestAgentCode(email, { baseUrl = DEFAULT_BASE_URL, fetchImpl, client = DEFAULT_CLIENT } = {}) {
  return apiJson(new URL('/api/auth/agent/request-code', baseUrl).href, {
    method: 'POST',
    headers: authHeaders('', client),
    body: { email },
    fetchImpl,
  });
}

export async function verifyAgentCode(
  email,
  code,
  { baseUrl = DEFAULT_BASE_URL, fetchImpl, client = DEFAULT_CLIENT, credentialsPath = CREDENTIALS_FILE } = {},
) {
  const payload = await apiJson(new URL('/api/auth/agent/verify-code', baseUrl).href, {
    method: 'POST',
    headers: authHeaders('', client),
    body: { email, code, keyName: 'witherspoon' },
    fetchImpl,
  });
  if (!payload.apiKey) throw new Error('verify-code returned no apiKey');
  saveCredentials(payload.apiKey, credentialsPath);
  return payload;
}

function viewerFromCourse(courseDir) {
  if (!courseDir) return {};
  try {
    const course = JSON.parse(fs.readFileSync(path.join(courseDir, 'course.json'), 'utf8'));
    const out = {};
    if (typeof course.title === 'string' && course.title.trim()) {
      out.displayName = course.title.trim().slice(0, 80);
    }
    const desc = course.subtitle || course.description;
    if (typeof desc === 'string' && desc.trim()) {
      out.displayDescription = desc.trim().slice(0, 280);
    }
    return out;
  } catch {
    return {};
  }
}

export async function publishSite({
  target,
  slug = '',
  claimToken = '',
  apiKey = '',
  apiKeySource = 'none',
  client = DEFAULT_CLIENT,
  baseUrl = DEFAULT_BASE_URL,
  allowNonHerenowBaseUrl = false,
  courseDir = '',
  statePath = '',
  fetchImpl,
  log = () => {},
} = {}) {
  const fetchFn = fetchImpl ?? globalThis.fetch;
  const base = String(baseUrl).replace(/\/+$/, '');
  if (apiKey && base !== DEFAULT_BASE_URL && !allowNonHerenowBaseUrl) {
    throw flagError(
      'refusing to send API key to non-default base URL; pass --allow-nonherenow-base-url to override',
    );
  }

  const { files } = collectFiles(target);
  const hasRootIndex = files.some((f) => f.path === 'index.html');
  if (!hasRootIndex && fs.statSync(target).isDirectory()) {
    throw flagError(`no index.html at the root of ${target} — publish dist/ itself, not its parent`);
  }

  const body = {
    files: files.map((f) => ({
      path: f.path,
      size: f.size,
      contentType: f.contentType,
      hash: f.hash,
    })),
    ...viewerFromCourse(courseDir),
  };
  if (claimToken && slug) body.claimToken = claimToken;

  const url = slug ? `${base}/api/v1/publish/${encodeURIComponent(slug)}` : `${base}/api/v1/publish`;
  const method = slug ? 'PUT' : 'POST';
  log(`creating publish (${files.length} files)...`);
  const created = await apiJson(url, {
    method,
    headers: authHeaders(apiKey, client),
    body,
    fetchImpl: fetchFn,
  });

  const outSlug = created.slug;
  if (!outSlug) throw new Error(`unexpected response: ${JSON.stringify(created)}`);
  const upload = created.upload ?? {};
  const uploads = Array.isArray(upload.uploads) ? upload.uploads : [];
  const skipped = Array.isArray(upload.skipped) ? upload.skipped : [];
  const versionId = upload.versionId;
  const finalizeUrl = upload.finalizeUrl;
  if (!versionId || !finalizeUrl) throw new Error('create response missing upload.versionId or finalizeUrl');

  if (skipped.length > 0) {
    log(`uploading ${uploads.length} files (${skipped.length} unchanged, skipped)...`);
  } else {
    log(`uploading ${uploads.length} files...`);
  }

  const byPath = new Map(files.map((f) => [f.path, f]));
  const failures = [];
  await mapPool(uploads, UPLOAD_CONCURRENCY, async (item) => {
    const local = byPath.get(item.path);
    if (!local) {
      failures.push(`${item.path} (missing locally)`);
      return;
    }
    const headers = { ...(item.headers ?? {}) };
    if (item.headers?.['Content-Type'] || item.headers?.['content-type']) {
      // use the signed headers as given
    } else if (local.contentType) {
      headers['Content-Type'] = local.contentType;
    }
    const buf = fs.readFileSync(local.abs);
    const res = await fetchFn(item.url, { method: item.method || 'PUT', headers, body: buf });
    if (res.status < 200 || res.status >= 300) {
      failures.push(`${item.path} (HTTP ${res.status})`);
    }
  });
  if (failures.length) {
    throw new Error(`${failures.length} file(s) failed to upload:\n  ${failures.join('\n  ')}`);
  }

  log('finalizing...');
  const finalized = await apiJson(new URL(finalizeUrl, `${base}/`).href, {
    method: 'POST',
    headers: authHeaders(apiKey, client),
    body: { versionId },
    fetchImpl: fetchFn,
  });

  const siteUrl = finalized.siteUrl || created.siteUrl;
  const claimFromCreate = created.claimToken || '';
  const claimUrl = created.claimUrl || '';
  const expiresAt = created.expiresAt || finalized.publishStatus?.expiresAt || '';
  const persistence =
    finalized.publishStatus?.persistence ||
    created.publishStatus?.persistence ||
    (apiKey ? 'permanent' : 'expires_24h');
  const authMode = apiKey ? 'authenticated' : 'anonymous';
  const accountUrl = finalized.accountUrl || created.accountUrl || '';

  if (statePath) {
    const entry = { siteUrl };
    if (claimFromCreate) entry.claimToken = claimFromCreate;
    if (claimUrl) entry.claimUrl = claimUrl;
    if (expiresAt) entry.expiresAt = expiresAt;
    savePublishState(statePath, outSlug, entry);
  }

  return {
    siteUrl,
    slug: outSlug,
    action: slug ? 'update' : 'create',
    authMode,
    apiKeySource,
    persistence: persistence === 'expiring' ? 'expires_24h' : persistence,
    expiresAt: expiresAt || '',
    claimUrl: typeof claimUrl === 'string' && claimUrl.startsWith('https://') ? claimUrl : '',
    accountUrl,
    fileCount: files.length,
    uploaded: uploads.length,
    skipped: skipped.length,
    unchanged: Boolean(finalized.unchanged),
  };
}

function printResult(result, log) {
  console.log(result.siteUrl);
  log('');
  for (const [key, value] of Object.entries({
    site_url: result.siteUrl,
    slug: result.slug,
    action: result.action,
    auth_mode: result.authMode,
    api_key_source: result.apiKeySource,
    persistence: result.persistence,
    expires_at: result.expiresAt,
    claim_url: result.claimUrl,
    account_url: result.accountUrl,
  })) {
    log(`publish_result.${key}=${value}`);
  }
  if (result.authMode === 'authenticated') {
    log('authenticated publish (permanent, saved to your account)');
    if (result.accountUrl) log(`workspace URL: ${result.accountUrl}`);
  } else {
    log('anonymous publish (expires in 24h)');
    if (result.claimUrl) log(`claim URL: ${result.claimUrl}`);
  }
}

export async function main(argv = process.argv.slice(2), deps = {}) {
  const log = deps.log ?? ((msg) => console.error(msg));
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const credentialsPath = deps.credentialsPath ?? CREDENTIALS_FILE;
  const env = deps.env ?? process.env;
  const invoke = env.WITHERSPOON_INVOKE
    ? `${env.WITHERSPOON_INVOKE} publish`
    : 'witherspoon-course publish';

  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    log(usageText(invoke));
    throw err;
  }
  if (opts.help) {
    console.log(usageText(invoke));
    return 0;
  }

  const baseUrl = opts.baseUrl.replace(/\/+$/, '');
  const client = opts.client;

  if (opts.requestCode) {
    const email = opts.requestCode;
    await requestAgentCode(email, { baseUrl, fetchImpl, client });
    log(`sign-in code sent to ${email}`);
    log('Ask the user to paste the code from their inbox, then run:');
    log(`  ${invoke} --verify-code <code> --email ${email}`);
    return 0;
  }
  if (opts.verifyCode) {
    const email = opts.email;
    if (!email) throw flagError('--verify-code needs --email');
    await verifyAgentCode(email, opts.verifyCode, {
      baseUrl,
      fetchImpl,
      client,
      credentialsPath,
    });
    log(`API key saved to ${credentialsPath}`);
    return 0;
  }

  const target = resolveTarget(opts);
  if (!target) {
    log(usageText(invoke));
    throw flagError('missing --course <dir> or dist path');
  }
  const courseDir = courseDirOf(opts, target);
  const slug = opts.slug || loadManifestSlug(courseDir);
  const statePath = courseDir
    ? path.join(courseDir, '.herenow', 'state.json')
    : path.join(process.cwd(), '.herenow', 'state.json');
  const auth = loadApiKey({ env, credentialsPath, flag: opts.apiKey });
  const claimToken = opts.claimToken || loadClaimToken(statePath, slug);

  const result = await publishSite({
    target,
    slug,
    claimToken,
    apiKey: auth.key,
    apiKeySource: auth.source,
    client,
    baseUrl,
    allowNonHerenowBaseUrl: opts.allowNonHerenowBaseUrl,
    courseDir,
    statePath,
    fetchImpl,
    log,
  });
  printResult(result, log);
  return 0;
}

const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main().then(
    (code) => process.exit(code ?? 0),
    (err) => {
      console.error(`error: ${err.message}`);
      process.exit(err.code === 'USAGE' ? 2 : 1);
    },
  );
}
