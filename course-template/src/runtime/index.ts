/* course-site runtime. Self-contained, no dependencies, no network.
   Bundled by tools/build.mjs to .build/public/assets/site.js and loaded with a
   relative src, so nothing here ever goes through Astro's bundler. */
import { onProgressChange, progressChanged } from './bus';
import { initCertificate } from './certificate';
import { html } from './config';
import { initCopy } from './copy';
import { initChecklist } from './checklist';
import { initDeck } from './deck';
import { initQuiz } from './quiz';
import { initReadbar } from './readbar';
import { initReading, trackVisit } from './reading';
import { initReset } from './reset';
import { initSearch } from './search';
import { initSubnav } from './subnav';
import { initTheme } from './theme';
import { initWidgets } from './widgets';
import { render } from './progress';
import { Store } from './store';

html.classList.remove('no-js');

// Wire the renderer to the change bus and to cross-tab storage events here, so
// no feature module has to import the renderer (and create a cycle with the store).
onProgressChange(render);
Store.onExternalChange(() => progressChanged());

function boot(): void {
  initTheme();
  render();
  trackVisit();
  initReading();
  initQuiz();
  initDeck();
  initChecklist();
  initCertificate();
  initReset();
  initSearch();
  initCopy();
  initSubnav();
  initReadbar();
  initWidgets();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
