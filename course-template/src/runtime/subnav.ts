/** Marks the in-page nav link for whichever section is on screen. */
export function initSubnav(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.subnav a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map: Record<string, HTMLAnchorElement> = {};
  links.forEach((l) => {
    const t = document.getElementById((l.getAttribute('href') ?? '').slice(1));
    if (t) map[t.id] = l;
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          map[en.target.id]?.setAttribute('aria-current', 'true');
        }
      }
    },
    { rootMargin: '-30% 0px -60% 0px' },
  );

  for (const id of Object.keys(map)) {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  }
}
