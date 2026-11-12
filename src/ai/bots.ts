import { Frustum, Matrix4, Sphere } from 'three';
import type { Character } from '../character/character';
import { randomOutfit } from '../character/rig';
import { MATCH } from '../core/config';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { ItemId } from '../gameplay/items';
import type { Container } from '../world/loot';
import { Bot } from './brain';
import { BOT_NAMES } from './names';

/** Path searches allowed per fixed step, shared by every bot, so a bad moment never stalls the loop. */
const PATHS_PER_STEP = 2;

/** How much of a bot's damage lands on another bot. */
const RIVAL_DAMAGE = 0.55;

const _frustum = new Frustum();
const _matrix = new Matrix4();
const _sphere = new Sphere();

/**
 * The rivals: who they are, when each one thinks, and the cheap tricks that keep twenty-three of
 * them affordable (shared path budget, posing far bodies less often).
 */
export class Bots implements GameSystem {
  readonly list: Bot[] = [];
  /** Which bot is heading for which container, so two do not walk to the same one. */
  readonly claims = new Map<Container, Bot>();
  /** When each combatant last fired, in this system's clock: gunfire gives people away. */
  readonly lastShot = new Map<Character, number>();
  time = 0;
  private paths = 0;
  private readonly byCharacter = new Map<Character, Bot>();

  constructor(private readonly game: Game) {
    const rng = new Rng(game.options.seed ^ 0xb075);
    const names = rng.shuffle([...BOT_NAMES]);
    for (let i = 0; i < MATCH.combatants - 1; i++) {
      const c = game.spawnCharacter(names[i % names.length]!, false, -60 + (i % 6) * 2, 20 + Math.floor(i / 6) * 2, 0, randomOutfit(rng));
      const bot = new Bot(c, game, this, rng.fork());
      this.list.push(bot);
      this.byCharacter.set(c, bot);
      this.park(c);
    }
    // Rivals wear each other down slower than they do the player, so a round is not over before
    // the player has found a weapon.
    game.hurtScale = (target, info) => (info.by && info.by !== target && info.by !== game.player && target !== game.player ? RIVAL_DAMAGE : 1);
    const events = game.events;
    events.on('shot', ({ by, x, z }) => {
      this.lastShot.set(by, this.time);
      this.noise(x, z, 95, by);
    });
    events.on('blast', ({ x, z, by }) => this.noise(x, z, 130, by));
    events.on('hurt', ({ target, info }) => {
      if (info.by) this.byCharacter.get(target)?.hurtBy(info.by);
    });
    events.on('used', ({ who }) => {
      const bot = this.byCharacter.get(who);
      if (bot) bot.heals++;
    });
    events.on('kill', ({ victim }) => {
      for (const bot of this.list) if (bot.target === victim) bot.target = null;
    });
  }

  /** The bots' characters, in roster order. */
  get characters(): Character[] {
    return this.list.map((b) => b.c);
  }

  botOf(c: Character): Bot | undefined {
    return this.byCharacter.get(c);
  }

  /** Take a character out of play: unseen, untouchable, costing nothing. */
  park(c: Character): void {
    c.vehicle?.exit(c);
    this.game.drop.release(c);
    c.state = 'plane';
    c.rig.root.visible = false;
    c.motor.setEnabled(false);
    c.motor.velocity.set(0, 0, 0);
    c.input.moveX = 0;
    c.input.moveZ = 0;
    c.input.sprint = false;
    c.input.jump = false;
    c.act.fire = false;
    c.act.aim = false;
  }

  /** Everyone back in the wings (the round is over, or the player went off alone). */
  parkAll(): void {
    for (const bot of this.list) {
      this.park(bot.c);
      bot.mode = 'parked';
      bot.target = null;
    }
    this.claims.clear();
  }

  /** A new round: fresh temperaments, nothing remembered. */
  begin(seed: number): void {
    const rng = new Rng(seed ^ 0x0b07b075);
    for (const bot of this.list) bot.reset(rng.fork());
    this.claims.clear();
    this.lastShot.clear();
  }

  /**
   * Put some of the bots on the ground around a point, outside a round: for looking at them, and
   * for tests. `kit` hands each the same items.
   */
  deploy(count: number, x: number, z: number, spread = 12, kit: readonly (readonly [ItemId, number])[] = []): Character[] {
    const game = this.game;
    const rng = new Rng((game.options.seed ^ 0xdeb10) + count * 31 + Math.round(x * 7 + z * 13));
    const out: Character[] = [];
    // In a round they are aboard the seaplane, not waiting in the wings.
    if (game.match.running) return out;
    const spot = { x: 0, z: 0 };
    for (const bot of this.list) {
      if (out.length >= count) break;
      const c = bot.c;
      if (c.state !== 'plane') continue;
      if (!game.nav.randomOpen(rng, x, z, spread, 1.5, spot)) continue;
      bot.reset(rng.fork());
      c.alive = true;
      c.health = c.maxHealth;
      c.armor = 0;
      game.combat.reset(c);
      c.state = 'normal';
      c.rig.root.visible = true;
      c.motor.setEnabled(true);
      const y = game.physics.groundHeight(spot.x, 200, spot.z, 400, game.world.field.heightAt(spot.x, spot.z)) + 0.05;
      c.teleport(spot.x, y, spot.z, rng.range(0, Math.PI * 2));
      for (const [item, n] of kit) game.grant(c, item, n);
      out.push(c);
    }
    return out;
  }

  /** May a bot run a path search this step? */
  takePath(): boolean {
    if (this.paths <= 0) return false;
    this.paths--;
    return true;
  }

  private noise(x: number, z: number, reach: number, by: Character | null): void {
    for (const bot of this.list) {
      const c = bot.c;
      if (c === by || !c.alive || c.state !== 'normal') continue;
      const p = c.position;
      if (Math.hypot(p.x - x, p.z - z) < reach) bot.hear(x, z);
    }
  }

  fixedUpdate(dt: number): void {
    this.time += dt;
    this.paths = PATHS_PER_STEP;
    const list = this.list;
    for (let i = 0; i < list.length; i++) list[i]!.step(dt);
  }

  /** Bodies far away or out of view are posed every few frames. */
  frameUpdate(): void {
    const game = this.game;
    const cam = game.engine.camera;
    _frustum.setFromProjectionMatrix(_matrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const player = game.player;
    for (const c of game.characters) {
      if (c === player || c.state === 'plane') continue;
      const v = c.visual;
      const d = cam.position.distanceTo(v);
      _sphere.center.set(v.x, v.y + 1, v.z);
      _sphere.radius = 2.2;
      const seen = d < 30 || _frustum.intersectsSphere(_sphere);
      c.poseEvery = !seen ? 8 : d < 45 ? 1 : d < 100 ? 2 : d < 200 ? 3 : 5;
    }
  }

  /** What the bots are up to, for the debug view and tests. */
  snapshot(): Record<string, unknown> {
    const bots = this.list.map((b) => b.snapshot());
    const modes: Record<string, number> = {};
    for (const b of this.list) modes[b.mode] = (modes[b.mode] ?? 0) + 1;
    return {
      count: this.list.length,
      alive: this.list.filter((b) => b.c.alive && b.c.state !== 'plane').length,
      modes,
      bots,
    };
  }
}
