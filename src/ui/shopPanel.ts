import './shop.css';

/** One thing on a shop's list, as the panel shows it. */
export interface PanelRow {
  /** The key that buys it: '1'..'9', then '0'. */
  key: string;
  /** Item id, or 'gacha' for the arcade's lucky dip. */
  item: string;
  name: string;
  /** What one purchase gives, e.g. "x3", or an empty string. */
  pack: string;
  blurb: string;
  price: number;
  /** How many the customer carries, and the most they can. */
  have: number;
  max: number;
  /** False when the customer has too little cash or no room: the row is dimmed, and buying is refused. */
  can: boolean;
}

/** Everything the panel shows. Tests read the same object. */
export interface PanelView {
  shop: number;
  type: string;
  name: string;
  kicker: string;
  cash: number;
  rows: PanelRow[];
  /** The last thing the shopkeeper said: a receipt or a refusal. */
  message: string;
  refused: boolean;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The shop counter's list, and a small line of text for what the other things in a shop say back
 * (the jukebox's track, a drinks machine that wants more money). The game decides what a purchase
 * does; this only shows it and reports clicks.
 */
export class ShopPanel {
  private readonly panel: HTMLElement;
  private readonly kicker: HTMLElement;
  private readonly name: HTMLElement;
  private readonly cash: HTMLElement;
  private readonly list: HTMLElement;
  private readonly message: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly note: HTMLElement;
  private view: PanelView | null = null;
  private rows: { button: HTMLButtonElement; have: HTMLElement }[] = [];
  private noteTimer = 0;

  constructor(
    private readonly root: HTMLElement,
    onBuy: (index: number) => void,
    onClose: () => void,
  ) {
    this.panel = el('section', 'shop-panel');
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Shop counter');

    const head = el('header', 'shop-head');
    const title = el('div', 'shop-title');
    this.kicker = el('div', 'shop-kicker');
    this.name = el('h2', 'shop-name');
    title.append(this.kicker, this.name);
    const wallet = el('div', 'shop-wallet');
    wallet.append(el('span', 'shop-wallet-label', 'Your cash'));
    this.cash = el('span', 'shop-cash');
    wallet.append(this.cash);
    head.append(title, wallet);

    this.list = el('ol', 'shop-list');
    this.list.addEventListener('click', (e) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>('.shop-row');
      if (!button) return;
      // Keep the keyboard with the game: a focused button would also answer to Enter and Space.
      button.blur();
      onBuy(Number(button.dataset['index']));
    });

    this.message = el('div', 'shop-message');
    this.message.setAttribute('role', 'status');

    const foot = el('footer', 'shop-foot');
    this.hint = el('span', 'shop-hint');
    const leave = el('button', 'shop-leave');
    leave.type = 'button';
    leave.append(el('kbd', 'key', 'E'), ' Leave');
    leave.addEventListener('click', () => {
      leave.blur();
      onClose();
    });
    foot.append(this.hint, leave);

    this.panel.append(head, this.list, this.message, foot);
    this.note = el('div', 'shop-note');
    this.note.setAttribute('role', 'status');
    root.append(this.panel, this.note);
  }

  get open(): boolean {
    return this.view !== null;
  }

  /** What is on show, for tests. Null when the panel is closed. */
  describe(): PanelView | null {
    return this.view;
  }

  /** Open the panel, or bring it up to date after a purchase. */
  show(view: PanelView): void {
    const fresh = !this.view || this.view.shop !== view.shop || this.rows.length !== view.rows.length;
    this.view = view;
    if (fresh) this.build(view);
    this.kicker.textContent = view.kicker;
    this.name.textContent = view.name;
    this.cash.textContent = `$${view.cash}`;
    view.rows.forEach((row, i) => {
      const r = this.rows[i]!;
      r.button.classList.toggle('off', !row.can);
      r.have.textContent = row.max > 1 ? `${row.have} of ${row.max}` : row.have > 0 ? 'Carried' : '';
    });
    this.message.textContent = view.message;
    this.message.classList.toggle('refused', view.refused);
    this.message.classList.toggle('show', view.message !== '');
    if (fresh) {
      this.panel.classList.add('show');
      this.root.classList.add('shop-open');
      this.note.classList.remove('show');
    }
  }

  hide(): void {
    if (!this.view) return;
    this.view = null;
    this.panel.classList.remove('show');
    this.root.classList.remove('shop-open');
  }

  /** A short line near the top of the screen, for things that happen away from the counter. */
  say(text: string, refused = false): void {
    this.note.textContent = text;
    this.note.classList.toggle('refused', refused);
    this.note.classList.remove('show');
    // Restart the fade when one line follows another.
    void this.note.offsetWidth;
    this.note.classList.add('show');
    window.clearTimeout(this.noteTimer);
    this.noteTimer = window.setTimeout(() => this.note.classList.remove('show'), 3200);
  }

  private build(view: PanelView): void {
    this.list.textContent = '';
    this.rows = [];
    this.list.classList.toggle('long', view.rows.length > 6);
    // Which keys buy: the first and the last on this shop's list.
    const first = view.rows[0];
    const last = view.rows[view.rows.length - 1];
    this.hint.textContent = '';
    if (first && last) {
      this.hint.append(el('kbd', 'key', first.key));
      if (last !== first) this.hint.append(' to ', el('kbd', 'key', last.key));
      this.hint.append(' or click to buy');
    }
    view.rows.forEach((row, i) => {
      const item = el('li', 'shop-line');
      const button = el('button', 'shop-row');
      button.type = 'button';
      button.dataset['index'] = String(i);
      button.dataset['item'] = row.item;
      const name = el('span', 'shop-item', row.name);
      if (row.pack) name.append(el('span', 'shop-pack', row.pack));
      const have = el('span', 'shop-have');
      button.append(el('kbd', 'key', row.key), name, el('span', 'shop-blurb', row.blurb), have, el('span', 'shop-price', `$${row.price}`));
      item.append(button);
      this.list.append(item);
      this.rows.push({ button, have });
    });
  }
}
