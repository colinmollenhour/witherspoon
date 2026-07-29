import { Store } from './store';

/** The one genuinely stateful part of a project page. */
export function initChecklist(): void {
  const list = document.querySelector<HTMLElement>('[data-checklist]');
  if (!list) return;
  const id = list.getAttribute('data-checklist') ?? '';
  const st = Store.get();
  st.projects[id] = st.projects[id] ?? { steps: [] };

  list.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((b, i) => {
    b.checked = !!st.projects[id]?.steps[i];
    b.addEventListener('change', () => {
      const rec = Store.get().projects[id];
      if (!rec) return;
      rec.steps[i] = b.checked;
      Store.save();
    });
  });
}
