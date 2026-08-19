/**
 * How the dev server decides where to listen.
 *
 * Astro/Vite bind a single address. A course author on a Tailscale machine wants
 * localhost in the browser they already have open *and* the tailnet name from a
 * phone or another laptop. Binding 0.0.0.0 would also hang the preview off every
 * Docker bridge and the LAN; we listen on loopback and add a second socket on
 * the tailscale0 address instead.
 *
 * Vite 6 rejects unknown Host headers. The tailnet MagicDNS name is not
 * localhost and is not an IP, so it has to be allow-listed via
 * `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` or the page is a 403.
 */
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

export const DEFAULT_DEV_PORT = 4321;
const PORT_SCAN = 30;

const TAILSCALE_SOCKETS = [
  process.env.TAILSCALE_SOCKET,
  '/var/run/tailscale/tailscaled.sock',
  '/var/run/tailscaled.sock',
  '/var/run/tailscaled.socket',
].filter(Boolean);

/** IPv4 on an interface whose name is Tailscale's. CGNAT 100.64/10 alone is not enough. */
export function tailscaleFromIfaces(ifaces) {
  for (const [name, addrs] of Object.entries(ifaces ?? {})) {
    if (!/tailscale/i.test(name) || !addrs) continue;
    const v4 = addrs.find((a) => !a.internal && isIpv4(a));
    if (v4) return { iface: name, ip: v4.address, host: null };
  }
  return null;
}

export function tailscaleFromStatus(status) {
  if (!status || status.BackendState !== 'Running') return null;
  const self = status.Self ?? {};
  const ip = (self.TailscaleIPs ?? []).find((addr) => net.isIPv4(addr));
  if (!ip) return null;
  const dnsName = typeof self.DNSName === 'string' ? self.DNSName.replace(/\.$/, '') : '';
  // MagicDNS short name is what people type (`seamus`); the FQDN is what
  // the tailnet resolves when split-DNS is off.
  const host = (dnsName && dnsName.split('.')[0]) || self.HostName || null;
  return { ip, host: host || dnsName || null, dnsName: dnsName || null, iface: null };
}

function isIpv4(addr) {
  return addr.family === 'IPv4' || addr.family === 4;
}

function localApiStatus(socketPath, timeoutMs = 400) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath,
        path: '/localapi/v0/status',
        headers: { Host: 'local-tailscaled.sock' },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.end();
  });
}

function tailscaleFromCli() {
  const r = spawnSync('tailscale', ['status', '--json'], {
    encoding: 'utf8',
    timeout: 1500,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (r.status !== 0 || !r.stdout) return null;
  try {
    return tailscaleFromStatus(JSON.parse(r.stdout));
  } catch {
    return null;
  }
}

export async function detectTailscale(deps = {}) {
  const ifaces = deps.ifaces ?? os.networkInterfaces();
  const fromApi = deps.fromApi ?? readLocalApi;
  const fromCli = deps.fromCli ?? tailscaleFromCli;

  const api = await fromApi();
  if (api) return api;
  const cli = fromCli();
  if (cli) return cli;
  return tailscaleFromIfaces(ifaces);
}

async function readLocalApi() {
  for (const socketPath of TAILSCALE_SOCKETS) {
    try {
      if (!fs.existsSync(socketPath)) continue;
      const found = tailscaleFromStatus(await localApiStatus(socketPath));
      if (found) return found;
    } catch {
      // Socket present but not talking to us (permissions, userspace down).
    }
  }
  return null;
}

export function canBind(port, host) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once('error', () => resolve(false));
    srv.listen({ port, host, exclusive: true }, () => {
      srv.close(() => resolve(true));
    });
  });
}

export async function findFreePort(start, hosts, probe = canBind) {
  const first = Number(start);
  if (!Number.isInteger(first) || first < 1 || first > 65535) {
    throw new Error(`Not a port: ${start}`);
  }
  const list = hosts.length ? hosts : ['127.0.0.1'];
  for (let port = first; port < first + PORT_SCAN; port++) {
    const free = await Promise.all(list.map((host) => probe(port, host)));
    if (free.every(Boolean)) return port;
  }
  throw new Error(`No free port in ${first}–${first + PORT_SCAN - 1}`);
}

/**
 * @param {{ host: string | true | null, port: string | null }} flags
 *        `host === true` is a bare `--host` (all interfaces), matching Astro.
 *        `host` a string is an explicit bind. `null` means pick the default.
 */
export async function planDevListen(flags, deps = {}) {
  const explicitHost = flags.host != null;
  const explicitPort = flags.port != null;
  const tailscale = await detectTailscale(deps);
  // Only auto-bind the tailnet address when the caller did not name a host.
  const alsoListen = explicitHost ? null : (tailscale?.ip ?? null);
  const allowedHosts = [];
  for (const name of [tailscale?.host, tailscale?.dnsName]) {
    if (name && !allowedHosts.includes(name)) allowedHosts.push(name);
  }
  const allowedHost = allowedHosts[0] ?? null;

  let astroHost = null;
  if (flags.host === true) astroHost = true;
  else if (typeof flags.host === 'string') astroHost = flags.host;

  const bindHosts = [];
  if (astroHost === true) bindHosts.push('0.0.0.0');
  else if (typeof astroHost === 'string') bindHosts.push(astroHost);
  else bindHosts.push('127.0.0.1');
  if (alsoListen && !bindHosts.includes(alsoListen)) bindHosts.push(alsoListen);

  if (explicitPort && flags.port === true) {
    return { error: '--port needs a number.' };
  }
  const preferred = explicitPort ? Number(flags.port) : DEFAULT_DEV_PORT;
  if (explicitPort && (!Number.isInteger(preferred) || preferred < 1 || preferred > 65535)) {
    return { error: `--port needs a number between 1 and 65535, not ${JSON.stringify(flags.port)}.` };
  }

  const probe = deps.probe ?? canBind;
  if (explicitPort) {
    const free = await Promise.all(bindHosts.map((h) => probe(preferred, h)));
    if (!free.every(Boolean)) {
      return {
        error:
          `Port ${preferred} is already in use.\n` +
          `Pass --port <n> for a different one, or stop the other process.`,
      };
    }
    return finishPlan({
      astroHost,
      port: preferred,
      movedFrom: null,
      alsoListen,
      allowedHost,
      allowedHosts,
      tailscale,
    });
  }

  try {
    const port = await findFreePort(DEFAULT_DEV_PORT, bindHosts, probe);
    return finishPlan({
      astroHost,
      port,
      movedFrom: port === DEFAULT_DEV_PORT ? null : DEFAULT_DEV_PORT,
      alsoListen,
      allowedHost,
      allowedHosts,
      tailscale,
    });
  } catch (err) {
    return { error: err.message };
  }
}

function finishPlan({ astroHost, port, movedFrom, alsoListen, allowedHost, allowedHosts, tailscale }) {
  const urls = [];
  const allIfaces = astroHost === true || astroHost === '0.0.0.0' || astroHost === '::';
  const local =
    astroHost == null || allIfaces || astroHost === 'localhost' || astroHost === '127.0.0.1';
  if (local) urls.push({ label: 'Local', href: `http://localhost:${port}/` });
  else if (typeof astroHost === 'string') urls.push({ label: 'Host', href: `http://${astroHost}:${port}/` });

  const onTailnet = Boolean(alsoListen) || allIfaces || (tailscale && astroHost === tailscale.ip);
  if (onTailnet && (allowedHost || tailscale?.ip)) {
    const printed = tailscale?.dnsName || allowedHost || tailscale.ip;
    const extra = printed !== tailscale?.ip ? alsoListen || tailscale?.ip : null;
    urls.push({ label: 'Tailscale', href: `http://${printed}:${port}/`, extra });
  }
  return { astroHost, port, movedFrom, alsoListen, allowedHost, allowedHosts, tailscale, urls };
}

export function formatPreviewBanner(plan, { title } = {}) {
  const lines = [];
  lines.push(title ? `Previewing ${title}` : 'Preview ready');
  lines.push('');
  const width = Math.max(...plan.urls.map((u) => u.label.length));
  for (const url of plan.urls) {
    const label = url.label.padEnd(width);
    const ip = url.extra ? `  (${url.extra})` : '';
    lines.push(`  ${label}  ${url.href}${ip}`);
  }
  if (plan.movedFrom != null) {
    lines.push('');
    lines.push(`  Port ${plan.movedFrom} is in use — using ${plan.port}.`);
  }
  return lines.join('\n');
}

/**
 * Extra HTTP sockets on the Tailscale address (and IPv4 loopback). Sharing
 * Vite's request and upgrade handlers is what keeps HMR working on every URL.
 *
 * configureServer's post-hook runs *before* listen(), so we wait for
 * `listening` — calling address() any earlier is null and we would silently
 * bind nothing.
 */
export function alsoListenPlugin() {
  const extras = (process.env.COURSE_DEV_ALSO_LISTEN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name: 'witherspoon-also-listen',
    configureServer(server) {
      if (!extras.length) return;
      return () => {
        const main = server.httpServer;
        if (!main) return;
        const extrasStarted = [];
        const start = () => {
          const addr = main.address();
          if (!addr || typeof addr === 'string') return;
          for (const extraHost of extras) {
            const extra = http.createServer((req, res) => {
              main.emit('request', req, res);
            });
            extra.on('upgrade', (req, socket, head) => {
              main.emit('upgrade', req, socket, head);
            });
            extra.on('error', (err) => {
              console.warn(`Could not also listen on ${extraHost}:${addr.port}: ${err.message}`);
            });
            extra.listen(addr.port, extraHost);
            extrasStarted.push(extra);
          }
        };
        if (main.listening) start();
        else main.once('listening', start);
        main.on('close', () => {
          for (const extra of extrasStarted) extra.close();
        });
      };
    },
  };
}
