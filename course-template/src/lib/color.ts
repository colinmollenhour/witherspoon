/**
 * The course picks one accent. The site needs a family.
 *
 * Units are the coarsest thing a learner navigates, and six identical blue cards
 * give them nothing to navigate by. So each unit gets its own hue, rotated off the
 * course accent — but rotated in **OKLCH**, where lightness is perceptual, so every
 * unit colour lands at the same apparent brightness and the contrast ratio the
 * accent was chosen for holds for all of them. Rotating in HSL instead would make
 * the yellow unit unreadable and the blue unit muddy at the same nominal `L`.
 *
 * Everything here runs at build time and emits plain `#rrggbb`, so no page depends
 * on `oklch()` support, and print and PDF get real colours.
 */

export interface Oklch {
  l: number; // 0..1 perceptual lightness
  c: number; // chroma, unbounded in theory, ~0.37 max in sRGB
  h: number; // degrees
}

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.replace(/./g, (ch) => ch + ch);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0.25, 0.48, 0.77]; // the template default
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number): string =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** sRGB (0..1) → OKLab, per Björn Ottosson's published matrices. */
function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(L: number, a: number, bb: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;

  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex);
  const [L, a, bb] = rgbToOklab(r, g, b);
  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

const inGamut = ([r, g, b]: [number, number, number]): boolean =>
  r >= -1e-4 && r <= 1 + 1e-4 && g >= -1e-4 && g <= 1 + 1e-4 && b >= -1e-4 && b <= 1 + 1e-4;

/**
 * OKLCH → hex, reducing chroma until the colour fits sRGB.
 *
 * Holding chroma constant across a hue rotation would push the greens and yellows
 * outside the gamut, and naive clipping there shifts hue *and* lightness — the two
 * things this module exists to preserve. Bisecting on chroma keeps both.
 */
export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180;
  const at = (chroma: number): [number, number, number] =>
    oklabToRgb(l, chroma * Math.cos(rad), chroma * Math.sin(rad));

  if (inGamut(at(c))) {
    const [r, g, b] = at(c);
    return rgbToHex(r, g, b);
  }
  let lo = 0;
  let hi = c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(at(mid))) lo = mid;
    else hi = mid;
  }
  const [r, g, b] = at(lo);
  return rgbToHex(r, g, b);
}

/** Same hue and chroma, moved to a given perceptual lightness. */
export function atLightness(hex: string, l: number): string {
  const o = hexToOklch(hex);
  return oklchToHex({ ...o, l });
}

/**
 * The per-unit accent family.
 *
 * Hues fan out across a 260° arc centred on the course accent, so unit 1 keeps a
 * colour close to the brand and the rest stay recognisably related rather than
 * becoming an unrelated rainbow. Lightness and chroma come from the accent itself,
 * which is what makes every unit colour pass the same contrast check.
 */
export function unitAccents(accentHex: string, count: number): string[] {
  const base = hexToOklch(accentHex);
  if (count <= 1) return [accentHex];
  // Wide enough that six units are told apart at a glance, narrow enough that the
  // last one does not land on the same red the site uses for a wrong answer.
  const ARC = 210;
  const step = ARC / count;
  const start = base.h - ARC / 2 + step / 2;
  return Array.from({ length: count }, (_, i) =>
    oklchToHex({ l: base.l, c: base.c, h: (((start + i * step) % 360) + 360) % 360 }),
  );
}

/**
 * A light and a dark variant of a unit accent, for tinted surfaces that must stay
 * legible in both themes. Returned as hex rather than `color-mix()` so the value is
 * usable in an inline style attribute a print stylesheet can also see.
 */
export function tints(hex: string): { wash: string; washDark: string; ink: string } {
  const o = hexToOklch(hex);
  return {
    wash: oklchToHex({ l: 0.96, c: Math.min(o.c, 0.05), h: o.h }),
    washDark: oklchToHex({ l: 0.24, c: Math.min(o.c, 0.06), h: o.h }),
    ink: oklchToHex({ l: 0.45, c: o.c, h: o.h }),
  };
}
