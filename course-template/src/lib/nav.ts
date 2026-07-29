import { getCollection } from 'astro:content';

export interface NavItem {
  /** Site-root-relative; pages prefix with their own rel(depth). */
  href: string;
  title: string;
}

/**
 * The course read in order: each unit's topics, then its test, then its projects.
 * Drives the prev/next footer, and is what "the course sequence" means anywhere else.
 */
export async function courseSequence(): Promise<NavItem[]> {
  const units = (await getCollection('units')).sort((a, b) => a.data.index - b.data.index);
  const out: NavItem[] = [];
  for (const u of units) {
    for (const t of u.data.topics) {
      out.push({ href: `${u.data.slug}/${t.slug}.html`, title: t.title });
    }
    if (u.data.test) {
      out.push({
        href: `${u.data.slug}/test.html`,
        title: u.data.test.title || `Unit ${u.data.index} test`,
      });
    }
    for (const p of u.data.projects) {
      out.push({ href: `${u.data.slug}/${p.slug}.html`, title: p.title });
    }
  }
  return out;
}

export function neighbours(
  seq: NavItem[],
  href: string,
): { prev: NavItem | null; next: NavItem | null } {
  const i = seq.findIndex((x) => x.href === href);
  if (i === -1) return { prev: null, next: null };
  return { prev: seq[i - 1] ?? null, next: seq[i + 1] ?? null };
}
