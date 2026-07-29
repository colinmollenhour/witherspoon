/**
 * Scroll depth through a long reading, painted along the bottom edge of the header.
 *
 * Measured against the reading section rather than the document, so the bar reaches
 * 100% when the *prose* ends — not after the learner has also scrolled past the
 * flashcards, the quiz and the footer, which would make it read as permanently
 * incomplete on exactly the pages it exists to reassure.
 */
export function initReadbar(): void {
  const bar = document.querySelector<HTMLElement>('[data-readbar]');
  if (!bar) return;
  const target = document.querySelector<HTMLElement>('#reading') ?? document.querySelector('main');
  if (!target) return;

  let queued = false;
  const paint = (): void => {
    queued = false;
    const end = target.offsetTop + target.offsetHeight - window.innerHeight;
    const start = Math.max(0, target.offsetTop - 80);
    const span = end - start;
    const pct = span <= 0 ? 100 : ((window.scrollY - start) / span) * 100;
    bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  };

  const onScroll = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();
}
