import type { Character } from '../character/character';
import type { GameSystem } from '../core/system';
import type { DamageCause, Game } from '../game';

/** Where the player is in the round. */
export type Stage = 'none' | 'aboard' | 'falling' | 'canopy' | 'ground' | 'over';

/** One line of the kill feed. */
export interface FeedLine {
  /** Seconds into the round. */
  at: number;
  killer: string | null;
  victim: string;
  cause: DamageCause;
  /** Item id of the weapon, when there was one. */
  weapon: string | null;
  headshot: boolean;
  /** The player did it, or it happened to the player. */
  mine: boolean;
  /** How many were left standing afterwards. */
  left: number;
}

/** How a round ended, for the result screen. */
export interface MatchResult {
  winner: Character | null;
  winnerName: string;
  /** The player was the last one standing. */
  won: boolean;
  /** Where the player finished: 1 is the win. */
  place: number;
  total: number;
  kills: number;
  /** Seconds the round lasted. */
  time: number;
  /** Seconds the player lasted. */
  survived: number;
}

/** Seconds between the last shot of a round and the result screen freezing the world. */
const AFTERMATH = 4;

/**
 * One round, from the seaplane to the last survivor. It owns who is in the round, counts who is
 * left, keeps the kill feed and calls the end; the drop, the storm and the bots are systems it starts.
 */
export class Match implements GameSystem {
  /** Everyone in the round, the player first. */
  readonly combatants: Character[] = [];
  /** Number of rounds started, so each one flies a different route. */
  round = 0;
  running = false;
  /** Seconds since the round began. */
  time = 0;
  /** How many are still standing. */
  alive = 0;
  /** The newest kills, oldest first. */
  readonly feed: FeedLine[] = [];
  /** Set when the round is over, until the next one starts. */
  result: MatchResult | null = null;
  /** Where each of the fallen finished. */
  readonly places = new Map<Character, number>();
  private playerDiedAt = -1;
  private aftermath = 0;

  constructor(private readonly game: Game) {
    game.events.on('kill', ({ victim, info }) => {
      if (!this.running || !this.combatants.includes(victim)) return;
      let left = 0;
      for (const c of this.combatants) if (c.alive) left++;
      this.alive = left;
      this.places.set(victim, left + 1);
      const player = game.player;
      if (victim === player) this.playerDiedAt = this.time;
      this.feed.push({
        at: this.time,
        killer: info.by && info.by !== victim ? info.by.name : null,
        victim: victim.name,
        cause: info.cause,
        weapon: info.weapon ?? null,
        headshot: info.headshot === true,
        mine: victim === player || (info.by === player && player !== null),
        left,
      });
      if (this.feed.length > 40) this.feed.shift();
      if (left <= 1) this.finish();
    });
  }

  /** Start a round: everyone boards the seaplane. */
  start(): void {
    const game = this.game;
    const player = game.ensurePlayer();
    this.round++;
    this.running = true;
    this.time = 0;
    this.result = null;
    this.aftermath = 0;
    this.playerDiedAt = -1;
    this.feed.length = 0;
    this.places.clear();
    this.combatants.length = 0;
    this.combatants.push(player, ...game.bots.characters);
    this.alive = this.combatants.length;
    const seed = game.options.seed + this.round * 7919;
    for (const c of this.combatants) {
      c.alive = true;
      c.health = c.maxHealth;
      c.armor = 0;
      c.sinceHurt = 99;
      c.sinceHurtBy = 99;
      c.cash = c.isPlayer ? 300 : 0;
      game.combat.reset(c);
    }
    game.combat.clear();
    game.fx.clear();
    game.loot.reset(seed);
    game.zone.begin(seed);
    game.bots.begin(seed);
    game.drop.begin(this.combatants, seed);
    // Look out over the wing, down toward the bay.
    game.camera.yaw = player.facing + 0.5;
    game.camera.pitch = -0.42;
    game.camera.snap();
    game.cameraOverride = false;
    game.input.setWantLock(true);
    game.setPhase('match');
  }

  /** Leave the round and put the seaplane, the storm and the rivals away. */
  stop(): void {
    this.running = false;
    this.result = null;
    this.aftermath = 0;
    this.game.drop.clear();
    this.game.zone?.clear();
    this.game.bots?.parkAll();
  }

  /** The last one standing has it. */
  private finish(): void {
    const game = this.game;
    const player = game.player;
    this.running = false;
    let winner: Character | null = null;
    for (const c of this.combatants) if (c.alive) winner = c;
    if (winner) this.places.set(winner, 1);
    const won = winner !== null && winner === player;
    this.result = {
      winner,
      winnerName: winner ? winner.name : 'Nobody',
      won,
      place: player ? (this.places.get(player) ?? 1) : 0,
      total: this.combatants.length,
      kills: player ? player.kills : 0,
      time: this.time,
      survived: this.playerDiedAt >= 0 ? this.playerDiedAt : this.time,
    };
    this.aftermath = AFTERMATH;
    game.sound(won ? 'win' : 'lose');
    game.events.emit('over', this.result);
  }

  fixedUpdate(dt: number): void {
    if (this.running) this.time += dt;
    else if (this.aftermath > 0) {
      this.aftermath -= dt;
      if (this.aftermath <= 0) this.game.setPhase('ended');
    }
  }

  get stage(): Stage {
    const p = this.game.player;
    if (!p || (!this.running && !this.result)) return 'none';
    if (!p.alive || this.result) return 'over';
    if (p.state === 'plane') return 'aboard';
    if (p.state === 'freefall') return 'falling';
    if (p.state === 'chute') return 'canopy';
    return 'ground';
  }
}
