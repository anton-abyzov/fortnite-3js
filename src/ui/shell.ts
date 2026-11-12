import type { Game } from '../game';
import { button, el } from './dom';
import { installSettings, settingsButton } from './settings';

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
  ['M', 'Map'],
  ['Esc', 'Pause'],
];

/** Classes on the page root that mean something else has the pointer and the keyboard. */
const BUSY = ['shop-open', 'map-open', 'result-open', 'settings-open'] as const;

/**
 * The page around the canvas: the title screen, the prompt for the interact key and the pause card.
 * It reads the game and calls it; the game does not know it exists.
 */
export class Shell {
  /** Room in the pause card, between Resume and Title, for buttons other parts add (Settings). */
  readonly pauseSlot = el('div', 'pause-slot');
  private readonly title: HTMLElement;
  private readonly prompt: HTMLElement;
  private readonly promptText: HTMLElement;
  private readonly pause: HTMLElement;
  private readonly resume: HTMLButtonElement;
  private readonly hint = el('div', 'look-hint', 'Click to look around');
  /** The round is stopped behind the pause card. */
  private paused = false;
  private hadLock = false;
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
    private readonly root: HTMLElement,
  ) {
    this.title = this.buildTitle();
    this.resume = button('pause-resume', 'Resume', () => this.setPaused(false));
    this.pause = this.buildPause();
    installSettings(game, root);
    this.pauseSlot.append(settingsButton());
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
    root.append(this.place, this.note, this.altimeter, this.prompt, this.hint, this.pause, this.title);
    game.events.on('phase', () => {
      // A new round, a fresh start or the title: whatever was paused is over.
      this.setPaused(false, false);
      this.sync();
    });
    document.addEventListener('pointerlockchange', () => this.onLock());
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'Enter' && this.game.phase === 'menu') this.play();
      else if (e.code === 'Escape' && !e.defaultPrevented && this.game.phase === 'match' && !this.busy()) this.setPaused(!this.paused);
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
    panel.append(settingsButton());

    const keys = el('dl', 'keys');
    for (const [key, what] of CONTROLS) {
      const row = el('div', 'keys-row');
      row.append(el('dt', 'key', key), el('dd', 'keys-what', what));
      keys.append(row);
    }
    panel.append(keys);
    panel.append(el('p', 'title-note', 'One round: 23 rivals drop with you. Loot coolers and duffel bags, take a car, buy at the shops, and stay inside the eye as the storm closes.'));
    screen.append(panel);
    return screen;
  }

  private buildPause(): HTMLElement {
    const card = el('div', 'pause');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Paused');
    const back = button('pause-back', 'Title', () => {
      this.game.input.setWantLock(false);
      this.game.match.stop();
      this.game.setPhase('menu');
    });
    const actions = el('div', 'pause-actions');
    actions.append(this.resume, this.pauseSlot, back);
    const text = el('div', 'pause-text');
    text.append(el('kbd', 'key key-small', 'Esc'), ' resumes');
    card.append(el('div', 'pause-title', 'Paused'), actions, text);
    return card;
  }

  /** A shop counter, the full map, the result card or a settings panel is up. */
  private busy(): boolean {
    const c = this.root.classList;
    for (const name of BUSY) if (c.contains(name)) return true;
    return false;
  }

  /**
   * The browser takes the pointer back on Escape without passing the key on, so losing the pointer
   * in the middle of a round is the pause. Giving it up on purpose (a shop counter, free look) is not.
   */
  private onLock(): void {
    const g = this.game;
    const locked = document.pointerLockElement === g.canvas;
    if (this.hadLock && !locked && g.phase === 'match' && !this.paused && !g.input.freeLook && !this.busy()) this.setPaused(true);
    this.hadLock = locked;
    this.sync();
  }

  /** Stop the round behind the pause card, or carry on. `takeView` asks for the pointer back. */
  private setPaused(on: boolean, takeView = true): void {
    if (on === this.paused) return;
    const g = this.game;
    this.paused = on;
    // The world stops; the picture stays.
    g.engine.timeScale = on ? 0 : 1;
    g.input.enabled = !on;
    this.root.classList.toggle('paused', on);
    // The card is on the page before its button is given the keyboard.
    this.sync();
    if (on) {
      g.input.setWantLock(false);
      this.resume.focus({ preventScroll: true });
    } else {
      // Keys pressed while the card was up are not orders for the game.
      g.input.endFixedStep();
      g.input.endFrame();
      g.canvas.focus({ preventScroll: true });
      if (takeView && g.phase === 'match') g.input.setWantLock(true);
    }
  }

  private sync(): void {
    const g = this.game;
    // A debug camera view is for looking at the world, so the title steps aside.
    const menu = g.phase === 'menu' && !g.cameraOverride;
    this.title.classList.toggle('hidden', !menu);
    // Hidden, its buttons must not take the keyboard either.
    this.title.inert = !menu;
    // The title art covers the whole canvas, so the city behind it need not be drawn.
    if (g.engine) g.engine.renderEnabled = !menu;
    const input = g.input;
    const playing = g.phase === 'match';
    this.pause.classList.toggle('show', playing && this.paused);
    // Without the pointer the mouse cannot turn the view, so say how to get it back.
    const adrift = playing && !this.paused && !!input && !input.locked && !input.freeLook && !this.busy();
    this.hint.classList.toggle('show', adrift);
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
