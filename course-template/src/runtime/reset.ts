import { progressChanged } from './bus';
import { initCertificate } from './certificate';
import { announce } from './derived';
import { Store } from './store';

/** Confirms with a native <dialog> — real focus trapping, Esc to cancel, no
 *  library — and removes exactly one namespaced key. */
export function initReset(): void {
  const dlg = document.getElementById('reset-dialog') as HTMLDialogElement | null;

  function doReset(): void {
    Store.reset();
    progressChanged();
    initCertificate();
    document.querySelectorAll('.q[data-locked]').forEach((q) => q.removeAttribute('data-locked'));
    announce('Progress reset. All saved scores and reading progress have been erased.');
  }

  document.querySelectorAll<HTMLButtonElement>('[data-reset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (dlg && dlg.showModal) dlg.showModal();
      else if (confirm('Erase all saved progress for this course?')) doReset();
    });
  });

  if (!dlg) return;
  dlg.querySelector('[data-reset-confirm]')?.addEventListener('click', () => {
    doReset();
    dlg.close();
  });
  dlg.querySelector('[data-reset-cancel]')?.addEventListener('click', () => dlg.close());
}
