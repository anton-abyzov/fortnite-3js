import type { Character } from '../character/character';
import { formatTime } from '../core/math';
import type { Game } from '../game';
import { ITEMS, isItemId } from '../gameplay/items';
import type { FeedLine } from '../gameplay/match';
import { ZONE_PHASES } from '../world/zone';
import { el } from './dom';

/** Compass: pixels of strip to a degree of turn, and the strip's width (hud.css says the same). */
const PPD = 3;
const STRIP = 372;
const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/** Seconds of the round a kill stays in the feed, and how many lines it holds. */
const FEED_LIFE = 6;
const FEED_MAX = 6;

/** The words between the two names of a kill. */
function howOf(line: FeedLine): string {
  if (line.weapon && isItemId(line.weapon)) return ITEMS[line.weapon].name;
  switch (line.cause) {
    case 'storm':
      return line.killer ? 'storm' : 'took';
    case 'fall':
      return line.killer ? 'fall' : 'broke';
    case 'drown':
      return line.killer ? 'drowned' : 'took';
    case 'vehicle':
      return line.killer ? 'ran down' : 'crushed';
    case 'explosion':
      return 'blast';
    default:
      return 'shot';
  }
}

/** Who did it when nobody did. */
function natureOf(line: FeedLine): string {
  switch (line.cause) {
    case 'storm':
      return 'The storm';
    case 'fall':
      return 'The fall';
    case 'drown':
      return 'The bay';
    case 'vehicle':
      return 'A wreck';
    case 'explosion':
      return 'A blast';
    default:
      return 'A stray shot';
  }
}

/**
 * The parts of the display that are about the round and not about the player's own body: the
 * compass, who is left, the kill feed, the storm's clock and its warning, and the grey of the
 * wall over the screen while the view is inside it.
 */
export class RoundHud {
  readonly compass = el('div', 'compass');
  readonly storm = el('div', 'storm');
  readonly warn = el('div', 'storm-warn');
  readonly tally = el('div', 'tally');
  readonly feed = el('div', 'feed');
  readonly tint = el('div', 'storm-tint');
  private readonly tape = el('div', 'compass-tape');
  private readonly point = el('span', 'compass-point', 'N');
  private readonly degrees = el('span', 'compass-deg', '000');
  private readonly stormPhase = el('span', 'storm-phase');
  private readonly stormText = el('span', 'storm-text');
  private readonly warnTitle = el('b', 'storm-warn-title');
  private readonly warnText = el('span', 'storm-warn-text');
  private readonly alive = el('b', 'tally-alive', '0');
  private readonly kills = el('b', 'tally-kills', '0');
  private readonly lines: HTMLElement[] = [];
  private readonly lineAt: number[] = [];
  private lastLine: FeedLine | null = null;
  // What is on the page now: each part is written again only when its value moves.
  private headingQ = -1;
  private degree = -1;
  private clock = -1;
  private warning = -1;
  private tintQ = -1;
  private aliveN = -1;
  private killsN = -1;
  private inRound = -1;

  constructor(private readonly game: Game) {
    // The strip repeats a quarter turn past each end, so north can sit anywhere on it.
    for (let d = -90; d <= 450; d += 15) {
      const a = ((d % 360) + 360) % 360;
      const text = a % 45 === 0 ? POINTS[a / 45]! : String(a);
      const mark = el('span', `compass-mark${a % 90 === 0 ? ' cardinal' : a % 45 === 0 ? ' half' : ''}${a === 0 ? ' north' : ''}`, text);
      mark.style.left = `${(d + 90) * PPD}px`;
      this.tape.append(mark);
    }
    const read = el('div', 'compass-read');
    read.append(this.point, this.degrees);
    this.compass.append(this.tape, el('i', 'compass-needle'), read);

    this.storm.append(el('i', 'storm-dot'), this.stormPhase, this.stormText);
    this.warn.append(this.warnTitle, this.warnText);
    this.warn.setAttribute('role', 'status');

    const left = el('span', 'tally-item');
    left.append(this.alive, el('span', 'tally-label', 'Alive'));
    const mine = el('span', 'tally-item');
    mine.append(this.kills, el('span', 'tally-label', 'Kills'));
    this.tally.append(left, mine);
  }

  /** Compass bearing of a view yaw: 0 is north, 90 east. Yaw turns left, a bearing turns right. */
  static bearing(yaw: number): number {
    const deg = (-yaw * 180) / Math.PI;
    return ((deg % 360) + 360) % 360;
  }

  update(player: Character, yaw: number): void {
    const g = this.game;
    const match = g.match;
    const zone = g.zone;

    // Compass.
    const bearing = RoundHud.bearing(yaw);
    const q = Math.round(bearing * 4);
    if (q !== this.headingQ) {
      this.headingQ = q;
      this.tape.style.transform = `translateX(${(STRIP / 2 - (q / 4 + 90) * PPD).toFixed(2)}px)`;
    }
    const degree = Math.round(bearing) % 360;
    if (degree !== this.degree) {
      this.degree = degree;
      this.degrees.textContent = String(degree).padStart(3, '0');
      this.point.textContent = POINTS[Math.round(degree / 45) % 8]!;
    }

    // Who is left. Outside a round there is nobody to count.
    const inRound = match.running || match.result !== null ? 1 : 0;
    if (inRound !== this.inRound) {
      this.inRound = inRound;
      this.tally.classList.toggle('show', inRound === 1);
      this.feed.classList.toggle('show', inRound === 1);
    }
    if (match.alive !== this.aliveN) {
      this.aliveN = match.alive;
      this.alive.textContent = String(match.alive);
    }
    if (player.kills !== this.killsN) {
      this.killsN = player.kills;
      this.kills.textContent = String(player.kills);
    }

    // The storm's clock.
    const stage = inRound === 1 ? zone.stage : 'idle';
    const seconds = Math.max(0, Math.ceil(zone.left));
    const code = stage === 'idle' ? 0 : stage === 'hold' ? 1 : stage === 'shrink' ? 2 : 3;
    const clock = code === 0 ? 0 : code * 1e6 + zone.phase * 1e4 + seconds;
    if (clock !== this.clock) {
      this.clock = clock;
      this.storm.classList.toggle('show', code !== 0);
      this.storm.classList.toggle('closing', code === 2);
      this.storm.classList.toggle('shut', code === 3);
      this.stormPhase.textContent = `Eye ${zone.phase + 1} of ${ZONE_PHASES.length}`;
      this.stormText.textContent = code === 1 ? `Eye closes in ${formatTime(seconds)}` : code === 2 ? `Closing ${formatTime(seconds)}` : 'The eye has shut';
    }

    // Outside the eye: how far it is. Inside it but outside the next one: how far that is.
    let warning = 0;
    if (code !== 0 && match.running && player.alive && player.state !== 'plane') {
      const p = player.position;
      const out = -zone.toWall(p.x, p.z);
      if (out > 0) warning = 1e6 + Math.min(9999, Math.ceil(out)) + zone.damage * 1e4;
      else if (code !== 3) {
        const next = zone.outsideNext(p.x, p.z);
        if (next > 0) warning = 2e6 + Math.min(9999, Math.ceil(next));
      }
    }
    if (warning !== this.warning) {
      const was = Math.floor(this.warning / 1e6);
      const mode = Math.floor(warning / 1e6);
      this.warning = warning;
      const metres = warning % 1e4;
      if (mode !== was) {
        this.warn.classList.toggle('show', mode !== 0);
        this.warn.classList.toggle('out', mode === 1);
        this.warnTitle.textContent = mode === 1 ? 'In the storm' : 'Eye is moving';
      }
      if (mode === 1) this.warnText.textContent = `${metres} m to the eye, losing ${zone.damage} health a second`;
      else if (mode === 2) this.warnText.textContent = `${metres} m to the next eye`;
    }

    // In the wall the screen goes grey with rain.
    const tint = Math.round(zone.playerOutside * 20);
    if (tint !== this.tintQ) {
      this.tintQ = tint;
      this.tint.style.opacity = String(tint / 20);
      this.tint.classList.toggle('show', tint > 0);
    }

    this.syncFeed();
  }

  /** Bring the lines on the page up to date with the round's kill feed. */
  private syncFeed(): void {
    const feed = this.game.match.feed;
    const n = feed.length;
    const last = n > 0 ? feed[n - 1]! : null;
    if (last !== this.lastLine) {
      // Everything after the last line shown is new. Several can arrive between two frames.
      let seen = -1;
      if (this.lastLine) for (let i = n - 2; i >= 0 && seen < 0; i--) if (feed[i] === this.lastLine) seen = i;
      // None of what is on the page belongs to this feed: a new round has begun.
      if (seen < 0) this.clearFeed();
      for (let i = Math.max(seen + 1, n - FEED_MAX); i < n; i++) this.addLine(feed[i]!);
      this.lastLine = last;
    }
    // The oldest line goes once the round has moved on.
    if (this.lines.length > 0 && this.game.match.time - this.lineAt[0]! > FEED_LIFE) this.dropLine();
  }

  private addLine(line: FeedLine): void {
    const node = el('div', `feed-line${line.mine ? ' mine' : ''}`);
    node.append(el('span', `feed-killer${line.killer ? '' : ' nature'}`, line.killer ?? natureOf(line)), el('span', 'feed-how', howOf(line)));
    if (line.headshot) {
      const head = el('i', 'feed-head');
      head.title = 'Headshot';
      head.setAttribute('aria-label', 'headshot');
      node.append(head);
    }
    node.append(el('span', 'feed-victim', line.victim));
    node.dataset['at'] = line.at.toFixed(1);
    this.feed.append(node);
    this.lines.push(node);
    this.lineAt.push(line.at);
    while (this.lines.length > FEED_MAX) this.dropLine(true);
  }

  private dropLine(now = false): void {
    const node = this.lines.shift();
    this.lineAt.shift();
    if (!node) return;
    if (now) node.remove();
    else {
      node.classList.add('out');
      window.setTimeout(() => node.remove(), 450);
    }
  }

  private clearFeed(): void {
    for (const node of this.lines) node.remove();
    this.lines.length = 0;
    this.lineAt.length = 0;
  }

  /** For tests: what the page shows right now. */
  snapshot(): Record<string, unknown> {
    return {
      alive: Number(this.alive.textContent),
      kills: Number(this.kills.textContent),
      bearing: Number(this.degrees.textContent),
      point: this.point.textContent,
      storm: this.storm.classList.contains('show') ? `${this.stormPhase.textContent}: ${this.stormText.textContent}` : '',
      warning: this.warn.classList.contains('show') ? `${this.warnTitle.textContent}: ${this.warnText.textContent}` : '',
      tint: Number(this.tint.style.opacity || 0),
      // One string a line: killer, how, a star for a headshot, victim.
      feed: this.lines.map((l) => [...l.children].map((part) => (part.classList.contains('feed-head') ? '*' : part.textContent)).join(' ')),
    };
  }
}
