/** Copy buttons are a pure enhancement — the code is selectable without them. */
export function initCopy(): void {
  document.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
    const pre = code.parentNode as HTMLElement | null;
    if (!pre) return;
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
