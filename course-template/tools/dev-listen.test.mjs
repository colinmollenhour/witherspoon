import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_DEV_PORT,
  findFreePort,
  formatPreviewBanner,
  planDevListen,
  tailscaleFromIfaces,
  tailscaleFromStatus,
} from './dev-listen.mjs';

const TS_IP = '100.64.1.10';
const TS_HOST = 'devbox';
const TS_DNS = 'devbox.tailexample.ts.net';

const TAIL_IFACES = {
  lo: [{ address: '127.0.0.1', family: 'IPv4', internal: true }],
  eth0: [{ address: '192.168.1.50', family: 'IPv4', internal: false }],
  tailscale0: [{ address: TS_IP, family: 'IPv4', internal: false }],
};

const STATUS = {
  BackendState: 'Running',
  Self: {
    DNSName: `${TS_DNS}.`,
    HostName: 'testhost',
    TailscaleIPs: [TS_IP, 'fd7a:115c:a1e0::1'],
  },
};

test('tailscaleFromIfaces uses a named Tailscale interface', () => {
  const found = tailscaleFromIfaces(TAIL_IFACES);
  assert.equal(found.ip, TS_IP);
  assert.equal(found.iface, 'tailscale0');
});

test('tailscaleFromIfaces ignores CGNAT on a non-Tailscale iface', () => {
  assert.equal(
    tailscaleFromIfaces({
      eth0: [{ address: '100.64.1.2', family: 'IPv4', internal: false }],
    }),
    null,
  );
});

test('tailscaleFromIfaces accepts family: 4 (older Node)', () => {
  const found = tailscaleFromIfaces({
    Tailscale: [{ address: TS_IP, family: 4, internal: false }],
  });
  assert.equal(found.ip, TS_IP);
});

test('tailscaleFromStatus strips the trailing DNS dot', () => {
  const found = tailscaleFromStatus(STATUS);
  assert.equal(found.ip, TS_IP);
  assert.equal(found.host, TS_HOST);
  assert.equal(found.dnsName, TS_DNS);
});

test('tailscaleFromStatus ignores a stopped backend', () => {
  assert.equal(tailscaleFromStatus({ ...STATUS, BackendState: 'Stopped' }), null);
});

function occupied(ports) {
  return async (port, _host) => !ports.has(port);
}

test('planDevListen auto-binds Tailscale and allow-lists the MagicDNS host', async () => {
  const plan = await planDevListen(
    { host: null, port: null },
    {
      ifaces: TAIL_IFACES,
      fromApi: async () => tailscaleFromStatus(STATUS),
      fromCli: () => null,
      probe: occupied(new Set()),
    },
  );
  assert.equal(plan.error, undefined);
  assert.equal(plan.astroHost, null);
  assert.equal(plan.port, DEFAULT_DEV_PORT);
  assert.equal(plan.alsoListen, TS_IP);
  assert.equal(plan.allowedHost, TS_HOST);
  assert.deepEqual(plan.allowedHosts, [TS_HOST, TS_DNS]);
  assert.deepEqual(
    plan.urls.map((u) => u.label),
    ['Local', 'Tailscale'],
  );
  assert.equal(plan.urls[1].href, `http://${TS_DNS}:4321/`);
  assert.equal(plan.urls[1].extra, TS_IP);
});

test('planDevListen walks forward when the default port is taken', async () => {
  const plan = await planDevListen(
    { host: null, port: null },
    {
      ifaces: { lo: [{ address: '127.0.0.1', family: 'IPv4', internal: true }] },
      fromApi: async () => null,
      fromCli: () => null,
      probe: occupied(new Set([4321, 4322])),
    },
  );
  assert.equal(plan.port, 4323);
  assert.equal(plan.movedFrom, 4321);
  assert.equal(plan.alsoListen, null);
});

test('planDevListen fails on an explicit occupied --port', async () => {
  const plan = await planDevListen(
    { host: null, port: '4321' },
    {
      fromApi: async () => null,
      fromCli: () => null,
      probe: occupied(new Set([4321])),
    },
  );
  assert.match(plan.error, /Port 4321 is already in use/);
});

test('an explicit --host skips auto-binding the Tailscale IP', async () => {
  const plan = await planDevListen(
    { host: '0.0.0.0', port: null },
    {
      fromApi: async () => tailscaleFromStatus(STATUS),
      fromCli: () => null,
      probe: occupied(new Set()),
    },
  );
  assert.equal(plan.astroHost, '0.0.0.0');
  assert.equal(plan.alsoListen, null);
  assert.equal(plan.allowedHost, TS_HOST);
  assert.deepEqual(plan.allowedHosts, [TS_HOST, TS_DNS]);
  assert.equal(plan.urls[1].label, 'Tailscale');
});

test('formatPreviewBanner mentions a moved port', () => {
  const text = formatPreviewBanner(
    {
      urls: [
        { label: 'Local', href: 'http://localhost:4322/' },
        { label: 'Tailscale', href: `http://${TS_DNS}:4322/`, extra: TS_IP },
      ],
      movedFrom: 4321,
      port: 4322,
    },
    { title: 'Same File, Three Addresses' },
  );
  assert.match(text, /Previewing Same File, Three Addresses/);
  assert.match(text, /Local\s+http:\/\/localhost:4322\//);
  assert.match(text, new RegExp(`Tailscale\\s+http://${TS_DNS.replaceAll('.', '\\.')}:4322/\\s+\\(${TS_IP.replaceAll('.', '\\.')}\\)`));
  assert.match(text, /Port 4321 is in use — using 4322/);
});

test('findFreePort skips occupied ports on every bind host', async () => {
  const taken = new Set([`4321@127.0.0.1`, `4321@${TS_IP}`, `4322@${TS_IP}`]);
  const port = await findFreePort(4321, ['127.0.0.1', TS_IP], async (p, host) => {
    return !taken.has(`${p}@${host}`);
  });
  assert.equal(port, 4323);
});
