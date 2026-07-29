import { CFG } from './config';
import type { SearchEntry } from './types';

/**
 * The index arrives as `window.__COURSE_SEARCH__`, set by assets/search-index.js
 * — a sibling of this script, loaded with the same relative prefix.
 *
 * It used to be fetched from `assets/search.json` with a page-relative URL, which
 * resolved to `unit-1/assets/search.json` on any deep page, 404'd, and silently
 * hid the search box everywhere except the home page. It was also the only network
 * request in the site, which broke offline use and tripped gate S1.
 *
 * Its hrefs are site-root-relative, so they are prefixed here with the depth the
 * build recorded for this page.
 */
export function initSearch(): void {
  const box = document.querySelector<HTMLElement>('[data-search]');
  if (!box) return;
  const input = box.querySelector('input');
  const out = box.querySelector<HTMLElement>('.search__results');
  if (!input || !out) return;

  const raw = (window as unknown as { __COURSE_SEARCH__?: SearchEntry[] }).__COURSE_SEARCH__;
  if (!raw || !raw.length) {
    box.hidden = true;
    return;
  }
  const prefix = CFG.rel ?? '';
  const idx: SearchEntry[] = raw.map((e) => ({ ...e, href: prefix + e.href }));
  let active = -1;

  function run(): void {
    const q = input!.value.trim().toLowerCase();
    active = -1;
    out!.innerHTML = '';
    if (!q) {
      out!.hidden = true;
      return;
    }
    const hits = idx!
      .filter(
        (r) =>
          (r.title + ' ' + (r.unit ?? '') + ' ' + (r.text ?? '')).toLowerCase().indexOf(q) > -1,
      )
      .slice(0, 12);

    if (!hits.length) {
      const a = document.createElement('a');
      a.href = box!.getAttribute('data-home') ?? 'index.html';
      const strong = document.createElement('strong');
      strong.textContent = 'No matches';
      const small = document.createElement('small');
      small.textContent = 'Browse the syllabus';
      a.appendChild(strong);
      a.appendChild(small);
      out!.appendChild(a);
    } else {
      for (const r of hits) {
        const a = document.createElement('a');
        a.href = r.href;
        const strong = document.createElement('strong');
        strong.textContent = r.title;
        const small = document.createElement('small');
        small.textContent = r.unit ?? '';
        a.appendChild(strong);
        a.appendChild(small);
        out!.appendChild(a);
      }
    }
    out!.hidden = false;
  }

  document.addEventListener('keydown', (e) => {
    const el = document.activeElement;
    if (e.key === '/' && el !== input && !/^(INPUT|TEXTAREA)$/.test(el?.tagName ?? '')) {
      e.preventDefault();
      input.focus();
    }
  });

  input.addEventListener('input', run);
  input.addEventListener('keydown', (e) => {
    const links = out.querySelectorAll('a');
    if (e.key === 'Escape') {
      input.value = '';
      run();
      input.blur();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(0, Math.min(links.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
      links.forEach((l, i) => l.classList.toggle('is-active', i === active));
    }
    if (e.key === 'Enter') {
      const target = links[active];
      if (target) location.href = target.href;
    }
  });

  document.addEventListener('click', (e) => {
    if (!box.contains(e.target as Node)) out.hidden = true;
  });
}
