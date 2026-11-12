/** Make an element with a class and, when given, its text. */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** A button that does one thing when clicked or activated from the keyboard. */
export function button(cls: string, text: string, act: (e: MouseEvent) => void): HTMLButtonElement {
  const node = el('button', cls, text);
  node.type = 'button';
  node.addEventListener('click', act);
  return node;
}
