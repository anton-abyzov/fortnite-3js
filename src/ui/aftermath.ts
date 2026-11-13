import { Vector3 } from 'three';
import type { Character } from '../character/character';
import { formatTime } from '../core/math';
import type { DamageCause, DamageInfo, Game } from '../game';
import type { CameraSubject } from '../gameplay/camera';
import { ITEMS, isItemId } from '../gameplay/items';
import { button, el } from './dom';

/** Seconds the view stays on the player's own body before it moves to someone else. */
const LINGER = 1.6;
/** A key still held when the card comes up must not press its button. */
const ARM_MS = 350;

/** One sentence on how the player went out. */
function epitaph(cause: DamageCause, weapon: string | null, killer: string | null): string {
  switch (cause) {
    case 'bullet':
      if (!killer) return 'A stray shot found you.';
      return weapon && isItemId(weapon) ? `${killer} got you with the ${ITEMS[weapon].name}.` : `${killer} got you.`;
    case 'explosion':
      return killer ? `${killer} caught you in a blast.` : 'A blast caught you.';
    case 'vehicle':
      return killer ? `${killer} ran you down.` : 'A wreck took you with it.';
    case 'storm':
      return killer ? `The storm finished what ${killer} started.` : 'The storm caught you outside the eye.';
    case 'fall':
      return killer ? `${killer} sent you over the edge.` : 'It was a long way down.';
    case 'drown':
      return 'The bay took you.';
  }
}

/**
 * What comes after the player's part in a round: the view moves to whoever got them, or to the
 * nearest rival still standing, and they can watch the rest; then the card that says how it went,
 * with another round or the title one key away. A win goes straight to the card.
 */
export class Aftermath {
  /** Who the camera follows once the player is out. Null while the player is in the round. */
  target: Character | null = null;
  readonly label = el('div', 'spectate');
  private readonly labelKicker = el('span', 'spectate-kicker');
  private readonly labelName = el('span', 'spectate-name');
  private readonly card = el('section', 'result');
  private readonly kicker = el('div', 'result-kicker');
  private readonly title = el('h2', 'result-title');
  private readonly note = el('p', 'result-note');
  private readonly stats = el('dl', 'result-stats');
  private readonly place = el('dd', 'result-place');
  private readonly kills = el('dd', 'result-kills');
  private readonly time = el('dd', 'result-time');
  private readonly again: HTMLButtonElement;
  private readonly back: HTMLButtonElement;
  private readonly subject: CameraSubject = { position: new Vector3(), height: 1.56, distance: 4.6, shoulder: 0, aim: 0, fovKick: 0 };
  /** The camera subject this put on the player's controller, so it takes back only its own. */
  private held: CameraSubject | null = null;
  /** Seconds since the player went down; negative while they are in the round. */
  private deadFor = -1;
  private killer: Character | null = null;
  private cause: DamageCause = 'storm';
  private weapon: string | null = null;
  /** Seconds into the round when the player went down, and whether there was a round. */
  private diedAt = 0;
  private inRound = false;
  private open = false;
  private armedAt = 0;
  /** What the label says now: -2 nothing, -1 just eliminated, otherwise the id of who is watched. */
  private labelled = -2;

  constructor(
    private readonly game: Game,
    private readonly ui: HTMLElement,
  ) {
    const swap = el('span', 'spectate-hint spectate-switch');
    swap.append(el('kbd', 'key key-small', 'A'), el('kbd', 'key key-small', 'D'), 'Switch');
    const results = el('span', 'spectate-hint');
    results.append(el('kbd', 'key key-small', 'Enter'), 'Results');
    const keys = el('span', 'spectate-keys');
    keys.append(swap, results);
    this.label.append(this.labelKicker, this.labelName, keys);
    this.label.setAttribute('role', 'status');

    this.card.setAttribute('role', 'dialog');
    this.card.setAttribute('aria-label', 'Round result');
    const panel = el('div', 'result-card');
    for (const [label, value] of [
      ['Place', this.place],
      ['Kills', this.kills],
      ['Time survived', this.time],
    ] as const) {
      const cell = el('div', 'result-stat');
      cell.append(el('dt', 'result-label', label), value);
      this.stats.append(cell);
    }
    this.again = button('result-again', 'Play again', (e) => {
      if (this.armed(e)) this.game.playAgain();
    });
    this.back = button('result-back', 'Title', (e) => {
      if (this.armed(e)) this.toTitle();
    });
    const actions = el('div', 'result-actions');
    actions.append(this.again, this.back);
    panel.append(this.kicker, this.title, this.note, this.stats, actions);
    this.card.append(panel);
    ui.append(this.card);

    const g = game;
    g.events.on('kill', ({ victim, info }) => {
      if (victim === g.player) this.fell(info);
      else if (victim === this.target) this.watch(this.pick(info.by, victim));
    });
    g.events.on('over', () => this.show());
    g.events.on('phase', (phase) => {
      // Back to the title, or on their feet again in a new round or a fresh start.
      if (phase === 'menu' || (phase === 'match' && g.player?.alive === true && !g.match.result)) this.reset();
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (!this.open) {
        // Watching the rest of the round: Enter brings up how it went.
        if (e.code === 'Enter' && this.deadFor >= 0 && g.phase === 'match' && g.input.enabled) {
          this.show();
          e.preventDefault();
        }
        return;
      }
      const at = document.activeElement;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        (at === this.again ? this.back : this.again).focus();
        e.preventDefault();
      } else if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') && at !== this.again && at !== this.back) {
        // The focus has wandered off the card: the key still means its main button.
        e.preventDefault();
        this.again.focus();
        if (performance.now() >= this.armedAt) g.playAgain();
      }
    });
  }

  /** The result card is up. */
  get showing(): boolean {
    return this.open;
  }

  /** A button press counts unless it is the key that brought the card up, still held. */
  private armed(e: MouseEvent): boolean {
    return e.detail > 0 || performance.now() >= this.armedAt;
  }

  private toTitle(): void {
    this.game.toTitle();
  }

  /** The player is out. */
  private fell(info: DamageInfo): void {
    const g = this.game;
    const match = g.match;
    const player = g.player!;
    this.deadFor = 0;
    this.killer = info.by && info.by !== player ? info.by : null;
    this.cause = info.cause;
    this.weapon = info.weapon ?? null;
    this.diedAt = match.time;
    this.inRound = match.combatants.includes(player) && (match.running || match.result !== null);
    // The blow that ended the round has already brought the card up: it can now say what happened.
    if (this.open) this.render();
  }

  /** Follow someone, or nobody. */
  private watch(c: Character | null): void {
    this.target = c;
    if (c) this.subject.position = c.visual;
  }

  /** Who to watch: `prefer` when they are still in it, otherwise whoever is nearest to `near`. */
  private pick(prefer: Character | null, near: Character): Character | null {
    const g = this.game;
    const player = g.player;
    const rivals = g.match.combatants;
    if (prefer && prefer !== player && prefer.alive && rivals.includes(prefer)) return prefer;
    let best: Character | null = null;
    let bestD = Infinity;
    for (const c of rivals) {
      if (c === player || !c.alive) continue;
      const d = c.position.distanceToSquared(near.position);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }

  /** Move to the next rival still standing, or the one before. */
  private step(dir: 1 | -1): void {
    const g = this.game;
    const list = g.match.combatants;
    const n = list.length;
    let i = this.target ? list.indexOf(this.target) : 0;
    for (let k = 0; k < n; k++) {
      i = (i + dir + n) % n;
      const c = list[i]!;
      if (c.alive && c !== g.player) {
        this.watch(c);
        return;
      }
    }
  }

  /** Fixed step: the keys that change who is watched. */
  fixedUpdate(): void {
    if (!this.target || this.open) return;
    const input = this.game.input;
    if (input.pressed('KeyD') || input.pressed('ArrowRight') || input.pressed('Mouse0')) this.step(1);
    else if (input.pressed('KeyA') || input.pressed('ArrowLeft')) this.step(-1);
  }

  /** Per frame: hold the camera on whoever is watched, and keep the label true. */
  update(dt: number): void {
    if (this.deadFor < 0) return;
    const g = this.game;
    this.deadFor += dt;
    if (!this.target && this.deadFor >= LINGER) {
      if (g.match.running) this.watch(this.pick(this.killer, g.player!));
      // Nobody to watch: the card.
      if (!this.target && !this.open) this.show();
    }
    const t = this.target;
    const controller = g.controller;
    if (t && controller) {
      let subject = this.subject;
      if (t.vehicle) subject = t.vehicle.cameraSubject;
      else {
        const flying = t.state === 'plane' || t.state === 'freefall' || t.state === 'chute';
        subject.height = flying ? 1.4 : t.motor.crouched ? 1.15 : 1.56;
        subject.distance = flying ? 9 : 4.6;
      }
      controller.subjectOverride = subject;
      this.held = subject;
    }
    const labelled = this.open ? -2 : t ? t.id : -1;
    if (labelled !== this.labelled) {
      this.labelled = labelled;
      this.label.classList.toggle('show', labelled !== -2);
      this.label.classList.toggle('watching', labelled >= 0);
      if (t && labelled >= 0) {
        this.labelKicker.textContent = 'Spectating';
        this.labelName.textContent = t.name;
      } else if (labelled === -1) {
        const place = g.match.places.get(g.player!);
        this.labelKicker.textContent = 'Eliminated';
        this.labelName.textContent = this.inRound && place ? `Place ${place} of ${g.match.combatants.length}` : 'Out of the fight';
      }
    }
  }

  /** Bring the card up, or bring it up to date. */
  private show(): void {
    const g = this.game;
    if (!this.open) {
      this.open = true;
      this.armedAt = performance.now() + ARM_MS;
      this.ui.classList.add('result-open');
      this.card.classList.add('show');
      // The card owns the keyboard and the pointer until one of its buttons is used.
      g.input.enabled = false;
      g.input.setWantLock(false);
      this.again.focus({ preventScroll: true });
    }
    this.render();
  }

  private render(): void {
    const g = this.game;
    const match = g.match;
    const player = g.player;
    const result = match.result;
    const won = result?.won === true;
    const rivals = (result ? result.total : match.combatants.length) - 1;
    this.card.classList.toggle('win', won);
    this.card.classList.toggle('loss', !won);
    this.kicker.textContent = won ? 'Round won' : result ? 'Round over' : this.inRound ? 'Out of the round' : 'Down';
    this.title.textContent = won ? 'Last one standing' : 'Eliminated';
    let note = won ? `You outlasted ${rivals} rivals and the storm.` : epitaph(this.cause, this.weapon, this.killer?.name ?? null);
    if (result && !won && result.winner) note += ` ${result.winnerName} won the round.`;
    this.note.textContent = note;
    // Free roam has no places and no clock.
    const counted = result !== null || this.inRound;
    this.stats.classList.toggle('show', counted);
    if (!counted || !player) return;
    const place = result ? result.place : (match.places.get(player) ?? 0);
    const total = result ? result.total : match.combatants.length;
    this.place.textContent = `${place} of ${total}`;
    this.kills.textContent = String(result ? result.kills : player.kills);
    this.time.textContent = formatTime(Math.floor(result ? result.survived : this.diedAt));
  }

  /** The player is back in it, or back at the title: put everything away. */
  private reset(): void {
    const g = this.game;
    this.deadFor = -1;
    this.killer = null;
    this.target = null;
    if (g.controller && this.held && g.controller.subjectOverride === this.held) g.controller.subjectOverride = null;
    this.held = null;
    this.labelled = -2;
    this.label.classList.remove('show', 'watching');
    if (!this.open) return;
    this.open = false;
    this.ui.classList.remove('result-open');
    this.card.classList.remove('show');
    g.input.enabled = true;
    if (document.activeElement === this.again || document.activeElement === this.back) g.canvas.focus({ preventScroll: true });
  }

  /** For tests: what the page shows right now. */
  snapshot(): Record<string, unknown> {
    return {
      spectating: this.target ? this.target.name : null,
      label: this.label.classList.contains('show') ? `${this.labelKicker.textContent}: ${this.labelName.textContent}` : '',
      result: this.open
        ? {
            won: this.card.classList.contains('win'),
            title: this.title.textContent,
            note: this.note.textContent,
            place: this.place.textContent,
            kills: this.kills.textContent,
            time: this.time.textContent,
          }
        : null,
    };
  }
}
