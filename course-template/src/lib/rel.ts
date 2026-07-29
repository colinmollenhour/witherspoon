/**
 * Every internal URL in this site is relative, so the output works served from a
 * bucket root, from a subpath, or from file:// (gates S2 and S12).
 *
 * Astro has no "relative base" mode — setting `base` bakes in one deploy path —
 * so pages compute their own prefix from how deep they are and pass it down.
 * Depth 0 is the site root, depth 1 is inside a unit directory.
 */
export function rel(depth: number): string {
  return depth === 0 ? '' : '../'.repeat(depth);
}

/** Join a relative prefix to a site-root-relative path. */
export function href(depth: number, pathFromRoot: string): string {
  return rel(depth) + pathFromRoot.replace(/^\/+/, '');
}
