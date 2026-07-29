import fs from 'node:fs';
import path from 'node:path';
import { courseFile } from './course';
import { renderInline } from './md';
import { esc } from './widgets';

/**
 * Static figures (photographs, unit heroes, diagrams) authored in markdown.
 *
 * Two forms, both compiled at build time the same way widgets are:
 *
 *   ```figure
 *   { "src": "assets/img/unit-1.webp", "alt": "…", "caption": "…" }
 *   ```
 *
 *   ![Alt text describing the picture](assets/img/unit-1.webp "Optional caption")
 *
 * Authors always write paths relative to the course directory (`assets/img/…`).
 * The build rewrites them to the depth of the page (`../assets/img/…` on unit
 * pages) and probes width/height so nothing reflows on load. Missing files fail
 * the build with the topic named — a broken `<img>` is worse than a stop.
 *
 * Every figure sits in a `.figure` card that keeps a light surface in both
 * themes (baked artwork cannot be recolored safely). See visuals.md.
 */

const FENCE = /^[ \t]*```[ \t]*figure[ \t]*\n([\s\S]*?)\n[ \t]*```[ \t]*$/gm;

/** Standard markdown images that point into the course's assets tree. */
const MD_IMAGE =
  /!\[([^\]]*)\]\(\s*(assets\/[^)\s]+)\s*(?:(?:"([^"]*)")|(?:'([^']*)'))?\s*\)/g;

const token = (i: number): string => `CSFIGUREMOUNT${i}ENDCSFIGUREMOUNT`;

export interface FigureSpec {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  /** When true the image is above the fold (unit heroes, first figure). */
  eager?: boolean;
}

function fail(where: string, msg: string): never {
  throw new Error(`figure in ${where}: ${msg}`);
}

/** Probe raster dimensions without pulling sharp in at module load. */
async function probeSize(abs: string): Promise<{ width: number; height: number }> {
  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(abs).metadata();
    if (meta.width && meta.height) return { width: meta.width, height: meta.height };
  } catch {
    // sharp is optional in the sense that a declared width/height still works;
    // fall through to the header readers below for the common formats.
  }
  const buf = fs.readFileSync(abs);
  const fromHeader = sizeFromHeader(buf);
  if (fromHeader) return fromHeader;
  fail(abs, 'could not determine image dimensions — set width and height explicitly');
}

function sizeFromHeader(buf: Buffer): { width: number; height: number } | null {
  // PNG
  if (buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1]!;
      const len = buf.readUInt16BE(i + 2);
      // SOF0 / SOF2
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  // WebP (VP8 / VP8L / VP8X)
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fourcc = buf.toString('ascii', 12, 16);
    if (fourcc === 'VP8X' && buf.length >= 30) {
      const w = 1 + buf[24]! + (buf[25]! << 8) + (buf[26]! << 16);
      const h = 1 + buf[27]! + (buf[28]! << 8) + (buf[29]! << 16);
      return { width: w, height: h };
    }
    if (fourcc === 'VP8 ' && buf.length >= 30) {
      // lossy bitstream: 3-byte little-endian at offset 26, 14-bit each
      const w = buf.readUInt16LE(26) & 0x3fff;
      const h = buf.readUInt16LE(28) & 0x3fff;
      return { width: w, height: h };
    }
    if (fourcc === 'VP8L' && buf.length >= 25) {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  // SVG — not a raster; authors must set width/height.
  return null;
}

/**
 * Resolve a course-relative asset path for a page at the given depth.
 * Depth 0 = site root (index, certificate); depth 1 = unit-N/*.html.
 */
export function assetHref(src: string, depth: number): string {
  const cleaned = src.replace(/^\.?\//, '');
  if (!cleaned.startsWith('assets/')) {
    throw new Error(`asset path must start with assets/: ${src}`);
  }
  return `${'../'.repeat(depth)}${cleaned}`;
}

export function renderFigureHtml(
  spec: FigureSpec & { width: number; height: number },
  depth: number,
): string {
  const href = assetHref(spec.src, depth);
  const loading = spec.eager ? 'eager' : 'lazy';
  const fetchpriority = spec.eager ? ' fetchpriority="high"' : '';
  const caption = spec.caption
    ? `<figcaption>${spec.caption /* already HTML from md */}</figcaption>`
    : '';
  return (
    `<figure class="figure">` +
    `<div class="figure__frame">` +
    `<img src="${esc(href)}" width="${spec.width}" height="${spec.height}" ` +
    `alt="${esc(spec.alt)}" loading="${loading}" decoding="async"${fetchpriority} />` +
    `</div>${caption}</figure>`
  );
}

/** Placeholder when a unit hero image is declared-but-missing or intentionally deferred. */
export function renderFigurePlaceholder(before: string, after: string, note?: string): string {
  const noteHtml = note
    ? `<p class="muted" style="margin:.6rem 0 0;font-size:.9rem">${esc(note)}</p>`
    : '';
  return (
    `<figure class="figure figure--placeholder">` +
    `<div class="figure__frame">` +
    `<p style="margin:0 0 .4rem"><strong>Before:</strong> ${esc(before)}</p>` +
    `<p style="margin:0"><strong>After:</strong> ${esc(after)}</p>` +
    noteHtml +
    `</div>` +
    `<figcaption>Visual pending — the transformation still stands.</figcaption>` +
    `</figure>`
  );
}

export interface ExtractedFigures {
  markdown: string;
  specs: FigureSpec[];
}

export function extractFigures(markdown: string, where: string): ExtractedFigures {
  const specs: FigureSpec[] = [];

  // Fenced figures first so a fence body containing an image line is not double-matched.
  let out = markdown.replace(FENCE, (_match, body: string) => {
    let raw: unknown;
    try {
      raw = JSON.parse(body);
    } catch (err) {
      fail(where, `block ${specs.length + 1} is not valid JSON — ${(err as Error).message}`);
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      fail(where, `block ${specs.length + 1} must be a JSON object`);
    }
    const o = raw as Record<string, unknown>;
    if (typeof o.src !== 'string' || !o.src.startsWith('assets/')) {
      fail(where, `block ${specs.length + 1}: \`src\` must start with assets/`);
    }
    if (typeof o.alt !== 'string' || o.alt.trim().length < 8) {
      fail(where, `block ${specs.length + 1}: \`alt\` must describe the picture (≥ 8 chars)`);
    }
    const i = specs.length;
    specs.push({
      src: o.src,
      alt: o.alt.trim(),
      caption: typeof o.caption === 'string' ? o.caption : undefined,
      width: typeof o.width === 'number' ? o.width : undefined,
      height: typeof o.height === 'number' ? o.height : undefined,
      eager: o.eager === true,
    });
    return `\n\n${token(i)}\n\n`;
  });

  out = out.replace(MD_IMAGE, (_m, alt: string, src: string, c1?: string, c2?: string) => {
    if (!alt || alt.trim().length < 8) {
      fail(where, `markdown image ${src}: alt text must describe the picture (≥ 8 chars)`);
    }
    const i = specs.length;
    specs.push({
      src,
      alt: alt.trim(),
      caption: (c1 ?? c2)?.trim() || undefined,
    });
    return `\n\n${token(i)}\n\n`;
  });

  return { markdown: out, specs };
}

export function injectFigures(html: string, compiled: string[]): string {
  let out = html;
  compiled.forEach((figure, i) => {
    const t = token(i);
    out = out.replace(new RegExp(`<p>\\s*${t}\\s*</p>`, 'g'), figure).replace(t, figure);
  });
  return out;
}

/**
 * Resolve dimensions, verify the file exists, compile caption markdown.
 * `depth` is the page depth that will host the figure (almost always 1).
 */
export async function compileFigures(
  markdown: string,
  where: string,
  depth = 1,
): Promise<{ markdown: string; inject: (html: string) => string }> {
  const { markdown: stripped, specs } = extractFigures(markdown, where);
  if (!specs.length) return { markdown, inject: (html) => html };

  const compiled: string[] = [];
  for (const spec of specs) {
    const abs = courseFile(spec.src);
    if (!fs.existsSync(abs)) {
      fail(where, `file does not exist: ${spec.src}`);
    }
    let width = spec.width;
    let height = spec.height;
    if (!width || !height) {
      const size = await probeSize(abs);
      width = width ?? size.width;
      height = height ?? size.height;
    }
    const captionHtml = spec.caption ? await renderInline(spec.caption) : undefined;
    compiled.push(
      renderFigureHtml(
        { ...spec, width, height, caption: captionHtml },
        depth,
      ),
    );
  }

  return {
    markdown: stripped,
    inject: (html) => injectFigures(html, compiled),
  };
}

/**
 * Resolve a unit's optional hero from course.json or by convention
 * (`assets/img/unit-N.webp` / `.png`). Returns null when neither is present.
 */
export function resolveUnitHero(
  unitIndex: number,
  declared?: { image: string; width?: number; height?: number; alt: string; caption?: string } | null,
): (FigureSpec & { width: number; height: number; abs: string }) | null {
  const tryPath = (rel: string, alt: string, caption?: string, w?: number, h?: number) => {
    const abs = courseFile(rel);
    if (!fs.existsSync(abs)) return null;
    return { rel, abs, alt, caption, w, h };
  };

  let found: { rel: string; abs: string; alt: string; caption?: string; w?: number; h?: number } | null =
    null;

  if (declared?.image) {
    found = tryPath(declared.image, declared.alt, declared.caption, declared.width, declared.height);
    if (!found) {
      throw new Error(
        `unit ${unitIndex} declares hero.image "${declared.image}" but that file does not exist`,
      );
    }
  } else {
    for (const ext of ['webp', 'png', 'jpg', 'jpeg', 'svg'] as const) {
      const rel = `assets/img/unit-${unitIndex}.${ext}`;
      found = tryPath(
        rel,
        `Illustration for unit ${unitIndex}`,
      );
      if (found) break;
    }
  }

  if (!found) return null;

  // Synchronous probe for common rasters so the loader stays simple.
  let width = found.w;
  let height = found.h;
  if (!width || !height) {
    if (found.abs.endsWith('.svg')) {
      throw new Error(
        `unit ${unitIndex} hero is SVG — set width and height on the hero declaration`,
      );
    }
    const size = sizeFromHeader(fs.readFileSync(found.abs));
    if (!size) {
      throw new Error(
        `unit ${unitIndex} hero ${found.rel}: could not read dimensions; declare width/height`,
      );
    }
    width = size.width;
    height = size.height;
  }

  return {
    src: found.rel,
    abs: found.abs,
    alt: found.alt,
    caption: found.caption,
    width,
    height,
    eager: true,
  };
}
