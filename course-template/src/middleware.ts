import type { MiddlewareHandler } from 'astro';

/**
 * Dev-only fixes, so previewing a course uses the same addresses the built site
 * does and serves the same files.
 *
 * `import.meta.env.DEV` is load-bearing throughout: with static output there is no
 * request at runtime, but middleware *does* run during the build for each
 * prerendered page, so anything unguarded here could change what gets generated.
 * Everything below must be a preview convenience and nothing more.
 */

/**
 * Serve `assets/` from the staging directory ourselves.
 *
 * The runtime and stylesheet are bundled by esbuild outside Astro's pipeline (see
 * tools/build.mjs) into a staging directory that Astro is pointed at with
 * `publicDir`. In production Astro copies that directory into the output and the
 * files are simply there. In dev, serving them depends on Vite mounting an
 * out-of-tree `publicDir` — and on Windows that mount did not happen: `/` returned
 * 200 while `/assets/site.css` and `/assets/site.js` returned 404, so every preview
 * rendered unstyled and inert while the production build was perfect.
 *
 * Reading the staged file here removes that dependency. It behaves identically on
 * every platform, which matters more than the duplication: a silent divergence
 * between what one developer sees and what another does is exactly how this was
 * missed. URLs are untouched, so a dev preview still exercises the same relative
 * paths the built site uses (gates S2 and S12).
 */
const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

async function serveStagedAsset(pathname: string): Promise<Response | null> {
  const stage = process.env.COURSE_STAGE;
  if (!stage) return null;

  // Imported lazily so the module graph for a production build never pulls in
  // node:fs on account of a branch that build can never reach.
  const [{ readFile }, path] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
  ]);

  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // malformed percent-encoding
  }

  const root = path.resolve(stage);
  const target = path.resolve(root, decoded.replace(/^\/+/, ''));
  // This turns a URL into a filesystem read, so refuse anything that escapes the
  // staging directory rather than trusting the path to be well behaved.
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  try {
    const buffer = await readFile(target);
    /**
     * Node's Buffer is a Uint8Array at runtime, but neither it nor a view onto its
     * pooled memory satisfies `BodyInit`: both come out as
     * `Uint8Array<ArrayBufferLike>`, and `BufferSource` wants a concrete
     * `ArrayBuffer`. Copying through this constructor produces exactly that. It is
     * a copy of a file this same process just read, on the dev path only.
     */
    const body = new Uint8Array(buffer);
    return new Response(body, {
      headers: {
        'content-type': MIME[path.extname(target).toLowerCase()] ?? 'application/octet-stream',
        // The esbuild watcher rewrites these in place; a cached copy would hide
        // the edit the preview exists to show.
        'cache-control': 'no-store',
        'x-witherspoon-dev-asset': 'middleware',
      },
    });
  } catch {
    return null; // fall through to Astro's own 404
  }
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  if (!import.meta.env.DEV) return next();

  const { pathname } = context.url;

  if (pathname.startsWith('/assets/')) {
    const asset = await serveStagedAsset(pathname);
    if (asset) return asset;
  }

  /**
   * The unit overview is `[unit]/[page].astro` with `page: 'index'` — it has to be,
   * because under `build.format: 'file'` a real `[unit]/index.astro` would emit
   * `unit-1.html` rather than `unit-1/index.html`. The build therefore writes a
   * genuine `dist/unit-1/index.html`, but `astro dev` only routes the extensionless
   * `/unit-1/index`, so opening the built site's own URL in dev returns a 404 and
   * the page looks broken when it is not.
   */
  // Only inside a directory. `/index.html` at the root already resolves, and
  // rewriting it would point at a route that does not exist.
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return next();

  if (pathname.endsWith('/index.html')) {
    return context.rewrite(pathname.slice(0, -'.html'.length));
  }
  return next();
};
