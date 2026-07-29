import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../lib/search';

export const prerender = true;

/**
 * The search index as a plain script that assigns one global, emitted to
 * `assets/search-index.js` and loaded with a relative src alongside site.js.
 *
 * Not `fetch('assets/search.json')` — that was resolved page-relative, so it
 * 404'd on every page below the root and silently hid the search box there, and
 * it was the site's only network request (gate S1).
 *
 * Not inlined per page either: at ~50 KB across 40-odd pages that is megabytes of
 * duplication. As a separate script it is downloaded and cached exactly once,
 * which is what site-spec.md means by inlining it into the runtime.
 */
export const GET: APIRoute = () => {
  const body = `window.__COURSE_SEARCH__=${JSON.stringify(buildSearchIndex())};`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
};
