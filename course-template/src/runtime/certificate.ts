import { CFG } from './config';
import { avg, testScores } from './derived';
import { Store } from './store';

/**
 * A self-reported completion record. The architecture cannot verify anything and
 * the page says so on its face (gate S10).
 *
 * The date shown is the timestamp of the last unit test taken, not today's — the
 * record must not change on reload.
 */
export function initCertificate(): void {
  const root = document.querySelector<HTMLElement>('[data-certificate]');
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>('[data-cert-name]');
  const nameEl = root.querySelector<HTMLElement>('.cert__name');

  function paint(): void {
    const s = Store.get();
    if (nameEl) nameEl.textContent = s.name || 'Enter your name above';

    const units = CFG.units ?? [];
    const taken = units.filter((u) => s.tests[u.id]);

    const body = root!.querySelector<HTMLElement>('[data-cert-rows]');
    if (body) {
      body.innerHTML = '';
      for (const u of units) {
        const rec = s.tests[u.id];
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = u.title || u.id;
        const td2 = document.createElement('td');
        td2.textContent = rec
          ? rec.score + '/' + rec.total + ' (' + Math.round((rec.score / rec.total) * 100) + '%)'
          : 'not attempted';
        tr.appendChild(td1);
        tr.appendChild(td2);
        body.appendChild(tr);
      }
    }

    const a = avg(testScores());
    const avgEl = root!.querySelector<HTMLElement>('[data-cert-avg]');
    if (avgEl) avgEl.textContent = a === null ? '—' : a + '%';

    const dateEl = root!.querySelector<HTMLElement>('[data-cert-date]');
    if (dateEl) {
      let last = 0;
      for (const u of units) {
        const rec = s.tests[u.id];
        if (rec && rec.at > last) last = rec.at;
      }
      dateEl.textContent = last ? new Date(last).toLocaleDateString() : '—';
    }

    const incomplete = root!.querySelector<HTMLElement>('[data-cert-incomplete]');
    const issued = root!.querySelector<HTMLElement>('[data-cert-issued]');
    const done = units.length > 0 && taken.length === units.length;
    if (incomplete) incomplete.hidden = done;
    if (issued) issued.hidden = !done;
  }

  if (input) {
    input.value = Store.get().name ?? '';
    input.addEventListener('input', () => {
      Store.get().name = input.value.trim() || null;
      Store.save();
      paint();
    });
  }

  paint();
  root.querySelector('[data-print]')?.addEventListener('click', () => window.print());
}
