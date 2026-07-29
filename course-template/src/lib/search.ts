import fs from 'node:fs';
import {
  courseFile,
  projectSlug,
  readCourseJson,
  stripTitle,
  toPlainText,
  topicSlug,
  unitSlug,
} from './course';

export interface SearchEntry {
  title: string;
  unit?: string;
  /** Site-root-relative; pages prefix it with their own `rel(depth)`. */
  href: string;
  text?: string;
}

let cache: SearchEntry[] | null = null;

/**
 * Built once at build time and embedded in every page as `#search-index`.
 *
 * It used to be written to assets/search.json and fetched at runtime with a
 * page-relative URL, which 404'd on every page below the root and hid the search
 * box there. Embedding also removes the site's only network request, so it works
 * offline and stops tripping gate S1.
 */
export function buildSearchIndex(): SearchEntry[] {
  if (cache) return cache;
  const c = readCourseJson();
  const out: SearchEntry[] = [];

  for (const [ui, u] of c.units.entries()) {
    out.push({ title: u.title, unit: `Unit ${ui + 1}`, href: `${unitSlug(ui)}/index.html`, text: u.description });

    for (const [ti, t] of u.topics.entries()) {
      const readPath = t.activities?.find((a) => a.type === 'READ')?.path;
      let text = t.description;
      if (readPath) {
        const abs = courseFile(readPath);
        if (fs.existsSync(abs)) {
          text = toPlainText(stripTitle(fs.readFileSync(abs, 'utf8')));
        }
      }
      out.push({
        title: t.title,
        unit: u.title,
        href: `${unitSlug(ui)}/${topicSlug(ti)}.html`,
        text,
      });
    }

    if (u.test) {
      out.push({
        title: u.test.title || 'Unit test',
        unit: u.title,
        href: `${unitSlug(ui)}/test.html`,
        text: u.test.description,
      });
    }

    for (const [pi, p] of (u.projects ?? []).entries()) {
      out.push({
        title: p.title,
        unit: u.title,
        href: `${unitSlug(ui)}/${projectSlug(pi)}.html`,
        text: p.goal,
      });
    }
  }

  cache = out;
  return out;
}
