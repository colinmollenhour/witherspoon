import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// tools/build.mjs resolves --course and exports this. Failing loudly here beats
// silently building an empty site against a missing course.
const courseDir = process.env.COURSE_DIR;
if (!courseDir) {
  throw new Error(
    'COURSE_DIR is not set. Build through the wrapper:\n' +
      '  npm run build -- --course <path-to-course-dir>',
  );
}

export default defineConfig({
  // Every internal URL the template emits is relative, so the site works from a
  // bucket root, a subpath, or file://. `base` is deliberately never set.
  outDir: path.join(courseDir, 'dist'),
  // Set by tools/build.mjs, which stages dev and production separately so a running
  // preview's esbuild watcher cannot overwrite a production bundle.
  publicDir: process.env.COURSE_STAGE ?? path.join(here, '.build/public'),
  // Kept inside the template. Left at its default it lands in outDir, shipping
  // content-layer scratch files (collections/*.schema.json, content-*.mjs) as
  // though they were part of the site.
  cacheDir: path.join(here, '.build/cache'),

  build: {
    // `unit-1/topic-1.html`, not `unit-1/topic-1/index.html`.
    format: 'file',
    // Astro emits bundled stylesheets at a root-absolute `/_astro/…` href, which
    // breaks a subpath deploy (gate S2/S12). Inlining means no external stylesheet
    // is ever produced. The design system itself is delivered as a public asset.
    inlineStylesheets: 'always',
  },

  // The toolbar injects client-side scripts; nothing in this site needs it.
  devToolbar: { enabled: false },

  markdown: {
    /**
     * Shiki in **dual-theme** mode. A single baked palette was the reason
     * highlighting was previously off: per-token colours chosen for one theme are
     * unreadable in the other, and this site ships both.
     *
     * Dual mode emits the light colour in `color` and the dark one in a
     * `--shiki-dark` custom property on the same span, and base.css swaps between
     * them. Everything is inline and computed at build time, so there is still no
     * highlighter shipped to the browser and no request made (gate S1).
     */
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'widget'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});
