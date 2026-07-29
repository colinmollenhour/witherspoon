/** Flashcards. Both faces are already in the HTML — this only handles ordering
 *  and flipping, so the deck stays fully readable with JavaScript off (gate S4). */
export function initDeck(): void {
  const deck = document.querySelector<HTMLElement>('[data-deck]');
  if (!deck) return;
  const cards = Array.from(deck.querySelectorAll<HTMLElement>('.fc'));
  if (!cards.length) return;

  const order = cards.map((_, i) => i);
  let pos = 0;

  const current = (): HTMLElement | undefined => cards[order[pos] ?? 0];

  function show(): void {
    cards.forEach((c, i) => {
      c.hidden = i !== order[pos];
      c.removeAttribute('data-flipped');
    });
    const n = deck!.querySelector<HTMLElement>('.deck__count');
    if (n) n.textContent = pos + 1 + ' / ' + cards.length;
  }
  function flip(): void {
    current()?.toggleAttribute('data-flipped');
  }
  function step(d: number): void {
    pos = (pos + d + cards.length) % cards.length;
    show();
  }

  for (const c of cards) {
    c.setAttribute('tabindex', '0');
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', 'Flashcard — activate to flip');
    c.addEventListener('click', flip);
    c.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flip();
      }
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  deck.querySelector('[data-deck-prev]')?.addEventListener('click', () => step(-1));
  deck.querySelector('[data-deck-next]')?.addEventListener('click', () => step(1));
  deck.querySelector('[data-deck-shuffle]')?.addEventListener('click', () => {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = order[i] as number;
      order[i] = order[j] as number;
      order[j] = t;
    }
    pos = 0;
    show();
  });

  show();
}
