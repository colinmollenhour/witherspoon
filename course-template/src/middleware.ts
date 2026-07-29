import type { MiddlewareHandler } from 'astro';

/**
 * Dev-only URL normalisation, so previewing a course uses the same addresses the
 * built site does.
 *
 * The unit overview is `[unit]/[page].astro` with `page: 'index'` — it has to be,
 * because under `build.format: 'file'` a real `[unit]/index.astro` would emit
 * `unit-1.html` rather than `unit-1/index.html`. The build therefore writes a
 * genuine `dist/unit-1/index.html`, but `astro dev` only routes the extensionless
 * `/unit-1/index`, so opening the built site's own URL in dev returns a 404 and the
 * page looks broken when it is not.
 *
 * `import.meta.env.DEV` is load-bearing: with static output there is no request at
 * runtime, but middleware *does* run during the build for each prerendered page, so
 * an unguarded rewrite here could change what gets generated. This must be a
 * preview convenience and nothing more.
 */
export const onRequest: MiddlewareHandler = (context, next) => {
  if (!import.meta.env.DEV) return next();

  const { pathname } = context.url;
  // Only inside a directory. `/index.html` at the root already resolves, and
  // rewriting it would point at a route that does not exist.
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return next();

  if (pathname.endsWith('/index.html')) {
    return context.rewrite(pathname.slice(0, -'.html'.length));
  }
  return next();
};
