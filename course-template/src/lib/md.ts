import { createMarkdownProcessor } from '@astrojs/markdown-remark';

/**
 * Renders the small markdown fragments that live inside course.json — question
 * stems, options, explanations, sample answers, flashcard faces, rubric prose.
 *
 * These carry inline code, emphasis and the occasional fenced block, so they
 * cannot be dropped in as plain text. Readings and briefs do not come through
 * here: those are rendered by the content loader via `renderMarkdown()`.
 */
const processor = await createMarkdownProcessor({
  syntaxHighlight: false,
  gfm: true,
  smartypants: false,
});

export async function renderBlock(text: string): Promise<string> {
  if (!text) return '';
  const { code } = await processor.render(text);
  return code;
}

/** Same, minus the wrapping paragraph — for text that sits inside a <span> or <li>. */
export async function renderInline(text: string): Promise<string> {
  const html = await renderBlock(text);
  const single = html.trim();
  const m = /^<p>([\s\S]*)<\/p>$/.exec(single);
  return m && !m[1]!.includes('<p>') ? m[1]! : single;
}
