/** Language names worth labelling. Anything else gets no chip rather than a
 *  meaningless one — `language-text` on a transcript helps nobody. */
const LANGS: Record<string, string> = {
  bash: 'bash', sh: 'shell', shell: 'shell', zsh: 'zsh', console: 'console',
  js: 'javascript', javascript: 'javascript', ts: 'typescript', typescript: 'typescript',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', html: 'html', css: 'css',
  python: 'python', py: 'python', sql: 'sql', http: 'http', diff: 'diff', c: 'c',
  cpp: 'c++', go: 'go', rust: 'rust', ruby: 'ruby', java: 'java', php: 'php',
};

/** Copy buttons are a pure enhancement — the code is selectable without them. */
export function initCopy(): void {
  document.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
    const pre = code.parentNode as HTMLElement | null;
    if (!pre) return;

    const cls = /language-([\w+-]+)/.exec(code.className ?? '');
    const label = cls ? LANGS[(cls[1] ?? '').toLowerCase()] : undefined;
    if (label) {
      const tag = document.createElement('span');
      tag.className = 'code-lang';
      tag.textContent = label;
      pre.appendChild(tag);
    }

    const b = document.createElement('button');
    b.className = 'btn copy-btn';
    b.type = 'button';
    b.textContent = 'Copy';
    b.addEventListener('click', () => {
      const text = code.textContent ?? '';
      const done = (): void => {
        b.textContent = 'Copied';
        setTimeout(() => {
          b.textContent = 'Copy';
        }, 1400);
      };
      const fallback = (): void => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          done();
        } catch {
          /* nothing more to try */
        }
        ta.remove();
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
    pre.appendChild(b);
  });
}
