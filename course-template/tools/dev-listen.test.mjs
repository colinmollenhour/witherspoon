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

const TAIL_IFACES = {
  lo: [{ address: '127.0.0.1', family: 'IPv4', internal: true }],
  enp86s0: [{ address: '192.168.234.80', family: 'IPv4', internal: false }],
  tailscale0: [{ address: '100.110.251.42', family: 'IPv4', internal: false }],
};

const STATUS = {
  BackendState: 'Running',
  Self: {
    DNSName: 'seamus.tail76dcf8.ts.net.',
    HostName: 'bazzite',
    TailscaleIPs: ['100.110.251.42', 'fd7a:115c:a1e0::b038:fb2a'],
  },
};

test('tailscaleFromIfaces uses a named Tailscale interface', () => {
  const found = tailscaleFromIfaces(TAIL_IFACES);
  assert.equal(found.ip, '100.110.251.42');
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
    Tailscale: [{ address: '100.110.251.42', family: 4, internal: false }],
  });
  assert.equal(found.ip, '100.110.251.42');
});

test('tailscaleFromStatus strips the trailing DNS dot', () => {
  const found = tailscaleFromStatus(STATUS);
  assert.equal(found.ip, '100.110.251.42');
  assert.equal(found.host, 'seamus');
  assert.equal(found.dnsName, 'seamus.tail76dcf8.ts.net');
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
  assert.equal(plan.alsoListen, '100.110.251.42');
  assert.equal(plan.allowedHost, 'seamus');
  assert.deepEqual(plan.allowedHosts, ['seamus', 'seamus.tail76dcf8.ts.net']);
  assert.deepEqual(
    plan.urls.map((u) => u.label),
    ['Local', 'Tailscale'],
  );
  assert.equal(plan.urls[1].href, 'http://seamus.tail76dcf8.ts.net:4321/');
  assert.equal(plan.urls[1].extra, '100.110.251.42');
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
  assert.equal(plan.allowedHost, 'seamus');
  assert.deepEqual(plan.allowedHosts, ['seamus', 'seamus.tail76dcf8.ts.net']);
  assert.equal(plan.urls[1].label, 'Tailscale');
});

test('formatPreviewBanner mentions a moved port', () => {
  const text = formatPreviewBanner(
    {
      urls: [
        { label: 'Local', href: 'http://localhost:4322/' },
        { label: 'Tailscale', href: 'http://seamus.tail76dcf8.ts.net:4322/', extra: '100.110.251.42' },
      ],
      movedFrom: 4321,
      port: 4322,
    },
    { title: 'Same File, Three Addresses' },
  );
  assert.match(text, /Previewing Same File, Three Addresses/);
  assert.match(text, /Local\s+http:\/\/localhost:4322\//);
  assert.match(text, /Tailscale\s+http:\/\/seamus\.tail76dcf8\.ts\.net:4322\/\s+\(100\.110\.251\.42\)/);
  assert.match(text, /Port 4321 is in use — using 4322/);
});

test('findFreePort skips occupied ports on every bind host', async () => {
  const taken = new Set(['4321@127.0.0.1', '4321@100.110.251.42', '4322@100.110.251.42']);
  const port = await findFreePort(4321, ['127.0.0.1', '100.110.251.42'], async (p, host) => {
    return !taken.has(`${p}@${host}`);
  });
  assert.equal(port, 4323);
});
