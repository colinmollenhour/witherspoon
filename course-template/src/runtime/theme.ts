import { html } from './config';
import { Store } from './store';
import type { ThemePref } from './types';

/** Default is light. The toggle still cycles light → system → dark → light and
 *  must win over the OS setting in both directions; tokens.css declares the dark
 *  values twice to make that work. */
export function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

  const apply = (v: ThemePref): void => {
    if (v === 'system') html.removeAttribute('data-theme');
    else html.setAttribute('data-theme', v);
    if (btn) {
      btn.setAttribute('aria-label', 'Theme: ' + v + '. Click to change.');
      btn.textContent = v === 'dark' ? '◑' : v === 'light' ? '○' : '◒';
    }
  };

  apply(Store.get().theme || 'light');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const cur = Store.get().theme || 'light';
    const next: ThemePref = cur === 'dark' ? 'light' : cur === 'light' ? 'system' : 'dark';
    Store.get().theme = next;
    Store.save();
    apply(next);
  });
}
