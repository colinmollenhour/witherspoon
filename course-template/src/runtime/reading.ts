import { progressChanged } from './bus';
import { Store } from './store';

export function initReading(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-mark-read]');
  if (!btn) return;
  const id = btn.getAttribute('data-mark-read') ?? '';
  const st = Store.get();
  st.topics[id] = st.topics[id] ?? {};

  const sync = (): void => {
    const read = !!Store.get().topics[id]?.read;
    btn.textContent = read ? '✓ Marked as read' : 'Mark as read';
    btn.classList.toggle('btn--primary', !read);
    btn.setAttribute('aria-pressed', String(read));
  };

  sync();
  btn.addEventListener('click', () => {
    const rec = Store.get().topics[id];
    if (!rec) return;
    rec.read = !rec.read;
    if (rec.read) rec.readAt = Date.now();
    Store.save();
    sync();
    progressChanged();
  });
}

/** Records where the learner was so the home page can offer a resume link. */
export function trackVisit(): void {
  const p = document.body.getAttribute('data-page-path');
  if (!p) return;
  Store.get().lastVisited = p;
  Store.save();
}
