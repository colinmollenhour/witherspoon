import { html } from './config';

/**
 * Hand-rolled, ~40 lines, no library — a dependency would mean a network request
 * or vendored weight for one 1.4-second effect.
 *
 * Fires only on a pass, and only the first time. A failed quiz gets a calm review
 * list instead: celebrating a fail reads as mockery.
 */
export function celebrate(): void {
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const c = document.createElement('canvas');
  c.id = 'confetti';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  if (!ctx) {
    c.remove();
    return;
  }

  const w = (c.width = innerWidth);
  const h = (c.height = innerHeight);
  const accent = getComputedStyle(html).getPropertyValue('--accent').trim() || '#3f7ac4';
  const colors = [accent, '#f5c451', '#4fbf87', '#e8734a', '#8d7ce0'];

  const bits = Array.from({ length: 110 }, (_, i) => ({
    x: Math.random() * w,
    y: -20 - Math.random() * h * 0.4,
    vx: (Math.random() - 0.5) * 2.2,
    vy: 2 + Math.random() * 3.5,
    s: 4 + Math.random() * 6,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.25,
    c: colors[i % colors.length] as string,
  }));

  const start = performance.now();
  const frame = (t: number): void => {
    const age = t - start;
    ctx.clearRect(0, 0, w, h);
    for (const b of bits) {
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      b.vy += 0.02;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.globalAlpha = Math.max(0, 1 - age / 1400);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
      ctx.restore();
    }
    if (age < 1400) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}
