/** A one-line indirection so feature modules can ask for a repaint without
 *  importing the renderer, which would create an import cycle with the store. */
const subscribers: Array<() => void> = [];

export function onProgressChange(cb: () => void): void {
  subscribers.push(cb);
}

export function progressChanged(): void {
  for (const cb of subscribers) cb();
}
