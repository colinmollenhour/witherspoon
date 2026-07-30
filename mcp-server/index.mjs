#!/usr/bin/env node
/**
 * HTTP entry point — the URL a user pastes into their agent.
 *
 * Stateless on purpose. Every tool here is a pure read of bundled markdown, so there
 * is nothing to keep between calls; a fresh server and transport per request means the
 * process can be replicated, restarted, or run as a function with no session affinity
 * and no store. `sessionIdGenerator: undefined` is what puts the transport in that
 * mode — with a generator set, a client's second request would look up a session this
 * process may never have had.
 *
 *   PORT=8787 node index.mjs        →  http://localhost:8787/mcp
 */
import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { loadAll, VERSION } from './src/content.mjs';
import { createServer } from './src/server.mjs';

// Fail at boot, not on a user's first call, if content/ was never synced.
loadAll();

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '0.0.0.0';
const MCP_PATH = process.env.MCP_PATH ?? '/mcp';
/** One document is ~17 KB; a request body has no business being larger than this. */
const MAX_BODY = 1024 * 1024;

/**
 * Open CORS because the server is public, unauthenticated, and read-only — there is
 * no cookie or token for a hostile origin to ride on. `mcp-session-id` must be
 * exposed or browser-based clients cannot read it, and `mcp-protocol-version` is sent
 * by current clients on every follow-up request.
 */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, last-event-id',
  );
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id, mcp-protocol-version');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Built per request so the address it prints is the one the visitor actually reached,
 * including behind a proxy. A landing page for a public URL that answers "add this
 * server" with a bare `/mcp` leaves the reader to assemble the thing they came for.
 */
function landing(req) {
  const proto = (req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim() || 'http';
  const host = (req.headers['x-forwarded-host'] ?? req.headers.host ?? `localhost:${PORT}`)
    .split(',')[0]
    .trim();
  return `Witherspoon MCP server ${VERSION}

Add this server to your agent, then ask it to build a course.

  ${proto}://${host}${MCP_PATH}

No authentication. It returns instructions only — your agent does the work with its
own file and shell tools, so it needs both.

  https://github.com/colinmollenhour/witherspoon
`;
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (url.pathname === '/health') return send(res, 200, 'ok');
  if (url.pathname === '/' && req.method === 'GET') return send(res, 200, landing(req));

  if (url.pathname !== MCP_PATH) return send(res, 404, 'Not found');

  // Stateless: there is no stream to resume and no session to terminate, so the two
  // verbs that exist only to serve those get an honest 405 rather than a hang.
  if (req.method === 'GET' || req.method === 'DELETE') {
    return send(
      res,
      405,
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'This server is stateless; use POST.' },
        id: null,
      }),
      'application/json',
    );
  }

  if (req.method !== 'POST') return send(res, 405, 'Method not allowed');

  let mcp;
  let transport;
  try {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : undefined;

    mcp = createServer();
    transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    // Tear down when the client goes away, so an aborted request cannot leak a
    // transport per connection.
    res.on('close', () => {
      transport?.close();
      mcp?.close();
    });

    await mcp.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    transport?.close();
    mcp?.close();
    if (res.headersSent) {
      res.end();
      return;
    }
    const parse = err instanceof SyntaxError;
    send(
      res,
      parse ? 400 : 500,
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: parse ? -32700 : -32603,
          message: parse ? 'Parse error' : 'Internal server error',
        },
        id: null,
      }),
      'application/json',
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Witherspoon MCP server ${VERSION} — http://${HOST}:${PORT}${MCP_PATH}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
