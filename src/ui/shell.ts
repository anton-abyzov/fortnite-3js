import type { Game } from '../game';

interface StartPoint {
  name: string;
  note: string;
  /** Aboard the seaplane, or on foot at a place. */
  drop?: boolean;
  x: number;
  z: number;
  yaw: number;
}

/** How a round can start: the seaplane drop, or straight onto the streets. */
export const START_POINTS: readonly StartPoint[] = [
  { name: 'Seaplane drop', note: 'Jump, fly, land', drop: true, x: 0, z: 0, yaw: 0 },
  { name: 'Deco Row', note: 'Avenida del Sol', x: -60, z: 13, yaw: -Math.PI / 2 },
  { name: 'Ocean Parade', note: 'The beach', x: 385, z: 150, yaw: -Math.PI / 2 },
  { name: 'Gran Via', note: 'Canal bridge', x: -5, z: -118, yaw: 0 },
  { name: 'Parade Pier', note: 'Out over the surf', x: 430, z: 0, yaw: -Math.PI / 2 },
  { name: 'El Mercado', note: 'Market streets', x: -60, z: 245, yaw: Math.PI },
];

const CONTROLS: readonly [string, string][] = [
  ['W A S D', 'Move, steer, drive'],
  ['Mouse', 'Look, fire, aim'],
  ['Space', 'Jump, parachute'],
  ['Shift', 'Sprint'],
  ['C', 'Crouch, slide'],
  ['E', 'Use, open, get in'],
  ['1 to 5', 'Weapons'],
  ['R', 'Reload'],
  ['Q  X', 'Heal, armor up'],
  ['G', 'Throw a frag'],
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The page around the canvas: the title screen, the prompt for the interact key and the pause card.
 * It reads the game and calls it; the game does not know it exists.
 */
export class Shell {
  private readonly title: HTMLElement;
  private readonly prompt: HTMLElement;
  private readonly promptText: HTMLElement;
  private readonly pause: HTMLElement;
  private readonly place: HTMLElement;
  private readonly note: HTMLElement;
  private readonly altimeter: HTMLElement;
  private readonly altValue: HTMLElement;
  private readonly altLabel: HTMLElement;
  private toldFreeLook = false;
  private start = 0;
  private shownPrompt = '';
  private timer = 0;

  constructor(
    private readonly game: Game,
    root: HTMLElement,
  ) {
    this.title = this.buildTitle();
    this.pause = this.buildPause();
    this.prompt = el('div', 'prompt');
    this.prompt.append(el('kbd', 'key', 'E'));
    this.promptText = el('span', 'prompt-text');
    this.prompt.append(this.promptText);
    this.place = el('div', 'place');
    this.note = el('div', 'note');
    this.altimeter = el('div', 'altimeter');
    this.altValue = el('span', 'altimeter-value', '0');
    this.altLabel = el('span', 'altimeter-label', 'm above ground');
    this.altimeter.append(this.altValue, this.altLabel);
    root.append(this.place, this.note, this.altimeter, this.prompt, this.pause, this.title);
    game.events.on('phase', () => this.sync());
    document.addEventListener('pointerlockchange', () => this.sync());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.game.phase === 'menu') this.play();
    });
    this.sync();
    this.timer = window.setInterval(() => this.tick(), 100);
  }

  dispose(): void {
    window.clearInterval(this.timer);
  }

  /** Start the round the chosen way. */
  play(): void {
    const p = START_POINTS[this.start] ?? START_POINTS[0]!;
    if (p.drop) this.game.startMatch();
    else this.game.startAt(p.x, p.z, p.yaw);
    this.place.textContent = p.drop ? 'Marazul Bay' : p.name;
    this.place.classList.remove('show');
    // Restart the fade-in.
    void this.place.offsetWidth;
    this.place.classList.add('show');
    this.sync();
  }

  private buildTitle(): HTMLElement {
    const screen = el('section', 'title');
    screen.setAttribute('aria-label', 'Title screen');
    const panel = el('div', 'title-panel');
    panel.append(el('div', 'title-kicker', 'Hurricane season, Marazul Bay'));
    panel.append(el('h1', 'title-name', 'EYEWALL'));
    panel.append(el('p', 'title-line', 'The storm is closing on the city. Land, gear up and be the last one standing in the eye.'));

    const pick = el('div', 'title-pick');
    pick.append(el('div', 'title-label', 'Start in'));
    const chips = el('div', 'chips');
    START_POINTS.forEach((p, i) => {
      const chip = el('button', 'chip');
      chip.type = 'button';
      chip.dataset.start = String(i);
      chip.append(el('span', 'chip-name', p.name), el('span', 'chip-note', p.note));
      chip.addEventListener('click', () => {
        this.start = i;
        for (const c of chips.children) c.classList.toggle('on', c === chip);
      });
      if (i === 0) chip.classList.add('on');
      chips.append(chip);
    });
    pick.append(chips);
    panel.append(pick);

    const play = el('button', 'play', 'Play');
    play.type = 'button';
    play.id = 'play';
    play.addEventListener('click', () => this.play());
    panel.append(play);

    const keys = el('dl', 'keys');
    for (const [key, what] of CONTROLS) {
      const row = el('div', 'keys-row');
      row.append(el('dt', 'key', key), el('dd', 'keys-what', what));
      keys.append(row);
    }
    panel.append(keys);
    panel.append(el('p', 'title-note', 'Preview build: the seaplane drop, the city, the water and movement on foot. Vehicles, weapons and rivals are next.'));
    screen.append(panel);
    return screen;
  }

  private buildPause(): HTMLElement {
    const card = el('div', 'pause');
    card.append(el('div', 'pause-title', 'Paused'));
    card.append(el('div', 'pause-text', 'Click to take the view again'));
    const back = el('button', 'pause-back', 'Back to title');
    back.type = 'button';
    back.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.input.setWantLock(false);
      this.game.match.stop();
      this.game.setPhase('menu');
    });
    card.append(back);
    card.addEventListener('click', () => this.game.input.setWantLock(true));
    return card;
  }

  private sync(): void {
    const g = this.game;
    // A debug camera view is for looking at the world, so the title steps aside.
    const menu = g.phase === 'menu' && !g.cameraOverride;
    this.title.classList.toggle('hidden', !menu);
    // The title art covers the whole canvas, so the city behind it need not be drawn.
    if (g.engine) g.engine.renderEnabled = !menu;
    const input = g.input;
    const playing = g.phase === 'match';
    // Without the pointer the mouse cannot turn the view, so say how to get it back.
    const paused = playing && !!input && !input.locked && !input.freeLook;
    this.pause.classList.toggle('show', paused);
  }

  private tick(): void {
    const g = this.game;
    if (g.input?.lockDenied && !this.toldFreeLook) {
      // The page could not capture the pointer, so say how looking around works here.
      this.toldFreeLook = true;
      this.note.textContent = 'Move the pointer to look. Rest it near a side edge to keep turning.';
      this.note.classList.add('show');
      window.setTimeout(() => this.note.classList.remove('show'), 9000);
    }
    // Height above whatever is below, while the player is in the air.
    const stage = g.phase === 'match' ? g.match.stage : 'none';
    const flying = stage === 'aboard' || stage === 'falling' || stage === 'canopy';
    this.altimeter.classList.toggle('show', flying);
    if (flying && g.player) {
      this.altValue.textContent = String(Math.max(0, Math.round(g.drop.altitude(g.player))));
      this.altLabel.textContent = stage === 'aboard' ? 'm, aboard the seaplane' : stage === 'falling' ? 'm, freefall' : 'm, under canopy';
    }
    const text = g.phase === 'match' ? (g.controller?.prompt ?? '') : '';
    if (text !== this.shownPrompt) {
      this.shownPrompt = text;
      this.promptText.textContent = text;
      this.prompt.classList.toggle('show', text !== '');
    }
    this.sync();
  }
}
