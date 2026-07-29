import type { CourseConfig } from './types';

/** Read one of the `<script type="application/json">` blocks the build embeds.
 *  Everything the runtime needs is baked into the page — the site never fetches
 *  its own content, which is what keeps it working offline and from a subpath. */
export function json<T>(id: string): T | null {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent ?? '') as T;
  } catch (err) {
    console.warn('bad JSON in #' + id, err);
    return null;
  }
}

export const html: HTMLElement = document.documentElement;

export const CFG: CourseConfig = json<CourseConfig>('course-config') ?? {
  slug: 'course',
  passingScore: 70,
  totalTopics: 0,
  rel: '',
  units: [],
};

export const KEY = 'course:' + CFG.slug + ':v1';
export const VERSION = 1;
