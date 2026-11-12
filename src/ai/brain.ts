import { Vector3 } from 'three';
import type { Character } from '../character/character';
import { GRAVITY, GROUP, groups } from '../core/config';
import { angleDiff, clamp, damp, lerp, wrapAngle, yawFromDir } from '../core/math';
import type { Rng } from '../core/rng';
import type { Game } from '../game';
import { bestArmor, bestHeal } from '../gameplay/combat';
import { ITEMS, WEAPON_IDS, type WeaponId } from '../gameplay/items';
import { WEAPONS } from '../gameplay/weapons';
import type { Container, Pickup } from '../world/loot';
import { Nav } from '../world/navgrid';
import type { Bots } from './bots';

/** What a rival is doing, in one word. Shown in the debug view and read by tests. */
export type BotMode = 'parked' | 'drop' | 'loot' | 'fight' | 'chase' | 'cover' | 'heal' | 'storm' | 'roam' | 'hunt' | 'swim' | 'dead';

/** What blocks a line of sight, and a bullet. */
const SIGHT = groups(0xffff, GROUP.world | GROUP.prop | GROUP.door | GROUP.glass | GROUP.vehicle);

/** The distance each weapon likes to fight at, metres. */
const REACH: Record<WeaponId, number> = { shotgun: 7, smg: 13, pistol: 15, rifle: 27, sniper: 55 };

/** How well a weapon suits a distance. */
function suits(id: WeaponId, d: number): number {
  switch (id) {
    case 'shotgun':
      return d < 11 ? 10 : d < 20 ? 4 : 0.5;
    case 'smg':
      return d < 22 ? 8 : d < 40 ? 5 : 1.5;
    case 'rifle':
      return d < 8 ? 6 : d < 90 ? 9 : 5;
    case 'pistol':
      return d < 30 ? 4.5 : 3;
    case 'sniper':
      return d < 25 ? 1 : d < 50 ? 5 : 10;
  }
}

const _eye = new Vector3();
const _spot = { x: 0, z: 0 };
const _seen: { o: Character; d: number; score: number }[] = [];

/**
 * One rival's mind. Every fixed step it senses, decides, and fills in the same three things the
 * player's keys and mouse fill in: where to move (`character.input`), where to look
 * (`aimYaw`, `aimPitch`, `aimPoint`) and what the hands do (`character.act`).
 */
export class Bot {
  mode: BotMode = 'parked';
  /** 0 a tourist .. 1 a regular: aim, reactions and how far they notice things. */
  skill = 0.5;
  /** 0 keeps its distance .. 1 pushes every fight. */
  nerve = 0.5;
  rng: Rng;

  // --- getting around ---
  readonly path: number[] = [];
  private at = 0;
  goalX = 0;
  goalZ = 0;
  hasGoal = false;
  arrived = false;
  private wantPlan = false;
  /** Where the bot stood when the path was planned: the start of its first leg. */
  private legX = 0;
  private legZ = 0;
  /** A last leg walked in a straight line after the planned path: up the stairs out of a canal. */
  private stuckCheck = 0;
  private stuck = 0;
  private fromX = 0;
  private fromZ = 0;
  private dodgeFor = 0;
  private dodgeX = 0;
  private dodgeZ = 0;
  private feelIn = 0;
  private pause = 0;

  // --- senses ---
  target: Character | null = null;
  /** The target is in plain view right now. */
  sees = false;
  private seenFor = 0;
  private lostFor = 0;
  private react = 0;
  /** Where the target was last seen. */
  private readonly last = new Vector3();
  private senseIn = 0;
  private thinkIn = 0;
  private heardX = 0;
  private heardZ = 0;
  heardAge = 99;

  // --- aim ---
  yaw = 0;
  pitch = 0;
  private errYaw = 0;
  private errPitch = 0;
  private offYaw = 0;
  private offPitch = 0;
  private errIn = 0;

  // --- hands ---
  private burst = 0;
  private rest = 0;
  private swapIn = 0;
  private nadeIn = 6;
  private throwFor = 0;
  private throwYaw = 0;
  private throwPitch = 0;

  // --- footwork in a fight ---
  private side = 1;
  private sideIn = 0;

  // --- looting ---
  box: Container | null = null;
  item: Pickup | null = null;
  private waitFor = 0;
  /** Walking the last steps to a box in a straight line. */
  private direct = false;
  opened = 0;
  private readonly skip = new Set<number>();

  // --- totals, for the tests and the end card ---
  travelled = 0;
  heals = 0;
  thrown = 0;
  landed = false;

  constructor(
    readonly c: Character,
    private readonly game: Game,
    private readonly bots: Bots,
    rng: Rng,
  ) {
    this.rng = rng;
  }

  /** A new round: forget everything and draw a temperament. */
  reset(rng: Rng): void {
    this.rng = rng;
    // Most are average; a few are sharp.
    this.skill = clamp(0.5 + rng.gauss() * 0.3 + (rng.chance(0.12) ? 0.25 : 0), 0.12, 0.97);
    this.nerve = clamp(0.5 + rng.gauss() * 0.4, 0.05, 1);
    this.mode = 'parked';
    this.path.length = 0;
    this.hasGoal = false;
    this.arrived = false;
    this.wantPlan = false;
    this.stuck = 0;
    this.dodgeFor = 0;
    this.pause = 0;
    this.target = null;
    this.sees = false;
    this.heardAge = 99;
    this.burst = 0;
    this.rest = 0;
    this.swapIn = 0;
    this.nadeIn = rng.range(4, 12);
    this.throwFor = 0;
    this.box = null;
    this.item = null;
    this.waitFor = 0;
    this.direct = false;
    this.opened = 0;
    this.skip.clear();
    this.travelled = 0;
    this.heals = 0;
    this.thrown = 0;
    this.landed = false;
    this.senseIn = rng.range(0, 0.2);
    this.thinkIn = rng.range(0, 0.3);
    this.quiet();
  }

  /** Hands and feet still. */
  private quiet(): void {
    const c = this.c;
    c.input.moveX = 0;
    c.input.moveZ = 0;
    c.input.sprint = false;
    c.input.crouch = false;
    c.input.walk = false;
    c.act.fire = false;
    c.act.aim = false;
  }

  // ------------------------------------------------------------------------------------------
  // The step
  // ------------------------------------------------------------------------------------------

  step(dt: number): void {
    const c = this.c;
    if (!c.alive) {
      if (this.mode !== 'dead') {
        this.mode = 'dead';
        this.target = null;
        this.box = null;
        this.quiet();
      }
      return;
    }
    if (c.state !== 'normal') {
      // Aboard, falling or under canopy: the drop flies the body.
      this.mode = this.game.match.running ? 'drop' : 'parked';
      c.act.fire = false;
      c.act.aim = false;
      return;
    }
    if (this.mode === 'drop' || this.mode === 'parked') {
      // Feet on the ground for the first time.
      this.mode = 'roam';
      this.landed = true;
      this.yaw = c.facing;
      this.pitch = 0;
      this.hasGoal = false;
      this.thinkIn = this.rng.range(0.15, 0.7);
      this.fromX = c.position.x;
      this.fromZ = c.position.z;
    }

    this.heardAge += dt;
    this.nadeIn -= dt;
    this.swapIn -= dt;
    this.pause -= dt;
    this.waitFor -= dt;
    if ((this.senseIn -= dt) <= 0) {
      this.senseIn = 0.2;
      this.sense();
    }
    const t = this.target;
    if (t) {
      if (!t.alive || t.state === 'plane') this.forget();
      else if (this.sees) {
        this.seenFor += dt;
        this.lostFor = 0;
        this.last.set(t.position.x, t.position.y + Bot.chest(t), t.position.z);
      } else {
        this.lostFor += dt;
        if (this.lostFor > 8) this.forget();
      }
    }
    if ((this.thinkIn -= dt) <= 0) {
      this.thinkIn = 0.3;
      this.think();
    }
    this.aim(dt);
    this.hands(dt);
    this.move(dt);
  }

  private forget(): void {
    this.target = null;
    this.sees = false;
    this.seenFor = 0;
    this.lostFor = 0;
  }

  // ------------------------------------------------------------------------------------------
  // Senses
  // ------------------------------------------------------------------------------------------

  /** Height of the middle of someone's body above their feet. */
  private static chest(o: Character): number {
    return o.state === 'seated' ? 0.9 : o.motor.crouched ? 0.72 : 1.18;
  }

  /** Is there a clear line from this bot's eyes to someone's chest? */
  private canSee(o: Character, d: number): boolean {
    const c = this.c;
    const p = c.position;
    const q = o.position;
    const ey = p.y + c.eyeHeight;
    const dx = q.x - p.x;
    const dy = q.y + Bot.chest(o) - ey;
    const dz = q.z - p.z;
    const len = Math.hypot(dx, dy, dz);
    if (len < 0.6) return true;
    const hit = this.game.physics.raycast(p.x, ey, p.z, dx / len, dy / len, dz / len, Math.max(0.1, len - 0.35), SIGHT);
    if (!hit) return true;
    // Someone in a car is seen through their own car.
    return o.vehicle !== null && hit.owner?.ref === o.vehicle && d < 60;
  }

  /** Look and listen: pick who to worry about. */
  private sense(): void {
    const c = this.c;
    const game = this.game;
    const bots = this.bots;
    const p = c.position;
    const range = lerp(55, 100, this.skill) * (1 - 0.3 * game.world.sky.night);
    const hurtBy = c.sinceHurtBy < 5 ? c.lastHurtBy : null;
    _seen.length = 0;
    for (const o of game.characters) {
      if (o === c || !o.alive) continue;
      if (o.state !== 'normal' && o.state !== 'seated') continue;
      const q = o.position;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const dz = q.z - p.z;
      const d = Math.hypot(dx, dy, dz);
      if (d > range) continue;
      // A rival with empty hands is no threat and poor sport: leave them to find something first,
      // unless they are on top of you. (The player gets no such grace.)
      if (o !== hurtBy && d > 12 && bots.botOf(o)?.armed === false) continue;
      // Noticed: close by, in front, heard shooting, or the one doing the hurting.
      let notice = o === this.target || o === hurtBy || d < 9;
      if (!notice) notice = Math.abs(angleDiff(this.yaw, yawFromDir(dx, dz))) < 1.75;
      if (!notice) {
        const shot = bots.lastShot.get(o);
        notice = shot !== undefined && bots.time - shot < 2 && d < 85;
      }
      if (!notice) continue;
      let score = d;
      if (o === this.target) score *= 0.7;
      if (o === hurtBy) score *= 0.6;
      _seen.push({ o, d, score });
    }
    _seen.sort((a, b) => a.score - b.score);
    let found: Character | null = null;
    let foundD = 0;
    for (let i = 0; i < _seen.length && i < 3; i++) {
      const s = _seen[i]!;
      if (this.canSee(s.o, s.d)) {
        found = s.o;
        foundD = s.d;
        break;
      }
    }
    if (found) {
      if (found !== this.target) {
        this.target = found;
        this.seenFor = 0;
        this.react = lerp(0.8, 0.3, this.skill) + foundD / 150 + this.rng.range(0, 0.25);
        this.errIn = 0;
      }
      this.sees = true;
      this.lostFor = 0;
      this.last.set(found.position.x, found.position.y + Bot.chest(found), found.position.z);
    } else this.sees = false;
  }

  /** Something loud happened over there. */
  hear(x: number, z: number): void {
    this.heardX = x;
    this.heardZ = z;
    this.heardAge = 0;
  }

  /** Took a hit from someone. */
  hurtBy(by: Character): void {
    if (!this.c.alive || by === this.c || !by.alive) return;
    // Knocks the aim about, and names the culprit when nobody better is in view.
    this.errYaw += this.rng.gauss() * 0.07;
    this.errPitch += this.rng.gauss() * 0.04;
    if (this.target && this.sees) return;
    this.target = by;
    this.sees = false;
    this.seenFor = 0;
    this.lostFor = 0;
    this.react = lerp(0.5, 0.2, this.skill);
    this.last.set(by.position.x, by.position.y + Bot.chest(by), by.position.z);
    this.senseIn = 0;
    this.thinkIn = Math.min(this.thinkIn, 0.05);
  }

  // ------------------------------------------------------------------------------------------
  // Decisions
  // ------------------------------------------------------------------------------------------

  /** A weapon in hand or on the back that can still fire. */
  private usable(id: WeaponId): boolean {
    const held = this.c.loadout.held[id];
    return held !== undefined && (held.mag > 0 || this.c.inventory.has(WEAPONS[id].ammo));
  }

  get armed(): boolean {
    for (const id of WEAPON_IDS) if (this.usable(id)) return true;
    return false;
  }

  /** 0 fine, 1 time to head for the eye, 2 in the wall or about to be. */
  private stormUrgency(): number {
    const zone = this.game.zone;
    if (zone.stage === 'idle') return 0;
    const p = this.c.position;
    const wall = zone.toWall(p.x, p.z);
    if (wall < 3) return 2;
    const out = zone.outsideNext(p.x, p.z) + 6;
    if (out <= 0) return 0;
    if (zone.stage === 'closed') return 0;
    // The eye has to be reached by the time it has finished closing: leave when the walk needs the time left.
    const walk = out / 4.3;
    const left = zone.closesIn;
    if (left < walk + 4) return 2;
    if (zone.stage === 'shrink' && wall < 20 && zone.damage >= 2) return 2;
    return left < walk + 14 + (1 - this.nerve) * 22 ? 1 : 0;
  }

  private wantsPatch(): boolean {
    const c = this.c;
    if (c.health < 62 && bestHeal(c)) return true;
    return c.armor < 45 && c.sinceHurt > 4 && bestArmor(c) !== null;
  }

  private shouldRetreat(): boolean {
    const c = this.c;
    return c.health + c.armor * 0.5 < 34 + (1 - this.nerve) * 14 && bestHeal(c) !== null;
  }

  private wantsLoot(): boolean {
    const c = this.c;
    const guns = c.loadout.carried();
    if (guns.length === 0) return true;
    if (this.opened >= 5) return !this.armed;
    let rounds = 0;
    for (const id of guns) rounds += c.loadout.held[id]!.mag + c.inventory.count(WEAPONS[id].ammo);
    return guns.length < 2 || rounds < 60 || this.opened < 2 || (!c.inventory.has('bandage') && !c.inventory.has('medkit'));
  }

  /** Worth walking over to, not only worth having. */
  private useful(q: Pickup): boolean {
    if (q.item === 'cash') return false;
    const def = ITEMS[q.item];
    if (def.kind !== 'ammo') return true;
    for (const id of WEAPON_IDS) if (this.c.loadout.held[id] && WEAPONS[id].ammo === q.item) return true;
    return false;
  }

  /**
   * Choose something to pick up or open, and head for it. With the storm coming (`hurry`), only
   * what lies on the way to the eye.
   */
  private pickLoot(hurry = false): boolean {
    const c = this.c;
    const game = this.game;
    const loot = game.loot;
    const nav = game.nav;
    const zone = game.zone;
    const p = c.position;
    const box = this.box;
    if (box && !box.opened && !this.skip.has(box.id)) {
      if (!this.arrived) return true;
      // The path ended short of it (it stands on a cell the map calls solid): the last steps are a straight line.
      if (Math.hypot(box.x - p.x, box.z - p.z) < 4.5 && !this.direct) {
        this.direct = true;
        this.path.length = 0;
        this.path.push(box.x, box.z);
        this.at = 0;
        this.arrived = false;
        this.wantPlan = false;
        return true;
      }
      this.skip.add(box.id);
    }
    this.direct = false;
    if (this.item && loot.pickups.includes(this.item) && loot.wants(c, this.item)) {
      if (!this.arrived) return true;
      // Standing on it and it is still there: no room for it after all.
      this.skip.add(-this.item.id);
    }
    this.box = null;
    this.item = null;
    let bestP: Pickup | null = null;
    let bestPD = 26;
    for (const q of loot.pickups) {
      if (Math.abs(q.y - p.y) > 2.2) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d >= bestPD || this.skip.has(-q.id)) continue;
      if (!loot.wants(c, q) || !this.useful(q) || !nav.walkable(q.x, q.z)) continue;
      bestP = q;
      bestPD = d;
    }
    let bestC: Container | null = null;
    let bestCD = 150;
    const storm = zone.stage !== 'idle';
    const mine = Math.hypot(p.x - zone.nextX, p.z - zone.nextZ);
    for (const b of loot.containers) {
      if (b.opened || b.roof || this.skip.has(b.id)) continue;
      const d = Math.hypot(b.x - p.x, b.z - p.z);
      if (d >= bestCD) continue;
      if (storm && zone.outsideNext(b.x, b.z) > -4) {
        // Outside the next eye: fine while there is time and it is near, or when it is on the way in.
        if (hurry ? d > 45 || Math.hypot(b.x - zone.nextX, b.z - zone.nextZ) > mine - 4 : d > 80) continue;
      }
      const other = this.bots.claims.get(b);
      if (other && other !== this && other.c.alive && other.box === b && Math.hypot(b.x - other.c.position.x, b.z - other.c.position.z) < d) continue;
      bestC = b;
      bestCD = d;
    }
    if (bestP && (bestPD < 14 || !bestC)) {
      this.item = bestP;
      this.setGoal(bestP.x, bestP.z);
      return true;
    }
    if (bestC) {
      this.box = bestC;
      this.bots.claims.set(bestC, this);
      this.setGoal(bestC.x, bestC.z);
      return true;
    }
    return false;
  }

  private setGoal(x: number, z: number): void {
    if (this.hasGoal && !this.arrived && Math.hypot(x - this.goalX, z - this.goalZ) < 1.5) return;
    this.goalX = x;
    this.goalZ = z;
    this.hasGoal = true;
    this.arrived = false;
    this.wantPlan = true;
    this.stuck = 0;
  }

  private think(): void {
    const c = this.c;
    const p = c.position;
    const game = this.game;
    const nav = game.nav;
    const zone = game.zone;
    const rng = this.rng;
    const armed = this.armed;
    const storm = this.stormUrgency();
    const t = this.target;
    const threat = t !== null && (this.sees || this.lostFor < 4);
    // With empty hands, only someone holding a weapon, or someone who has drawn blood, is worth running from.
    const danger = threat && (t.loadout.current !== null || c.sinceHurtBy < 5);
    let mode: BotMode;
    // In the water, and then up the steps until the feet are on dry ground.
    if (c.motor.swimming || (this.mode === 'swim' && this.hasGoal && !this.arrived && p.y < 1.2)) mode = 'swim';
    else if (storm === 2) mode = 'storm';
    else if (threat && armed) {
      if (this.shouldRetreat()) mode = !this.sees && this.lostFor > 0.5 ? 'heal' : 'cover';
      else mode = this.sees ? 'fight' : 'chase';
    } else if (danger) mode = this.sees && c.sinceHurtBy < 3 ? 'cover' : this.pickLoot(storm === 1) ? 'loot' : 'cover';
    else if (this.wantsPatch()) mode = 'heal';
    else if (this.waitFor > 0) mode = 'loot';
    else if (storm === 1) mode = this.wantsLoot() && this.pickLoot(true) ? 'loot' : 'storm';
    else if (this.wantsLoot() && this.pickLoot()) mode = 'loot';
    else if (armed && this.heardAge < 9 && this.nerve > 0.3) mode = 'hunt';
    else mode = 'roam';
    const fresh = mode !== this.mode;
    this.mode = mode;
    if (mode !== 'loot') {
      this.box = null;
      this.item = null;
    }

    switch (mode) {
      case 'swim': {
        // Out of the water: for dry ground by the nearest stairs or beach, whichever way gets there soonest.
        if (!fresh && this.hasGoal && !this.arrived) break;
        const exit = nav.nearestExit(p.x, p.z);
        if (exit) this.setGoal(exit.inX, exit.inZ);
        break;
      }
      case 'storm': {
        const inside = this.hasGoal && !this.arrived && zone.outsideNext(this.goalX, this.goalZ) < -3;
        if (!fresh && inside) break;
        const r = zone.nextRadius;
        if (r < 6) this.setGoal(zone.nextX, zone.nextZ);
        else if (nav.randomOpen(rng, zone.nextX, zone.nextZ, r * 0.6, Math.min(2.5, r * 0.1), _spot)) this.setGoal(_spot.x, _spot.z);
        else this.setGoal(zone.nextX, zone.nextZ);
        break;
      }
      case 'chase':
        if (fresh || !this.hasGoal || Math.hypot(this.last.x - this.goalX, this.last.z - this.goalZ) > 5) this.setGoal(this.last.x, this.last.z);
        else if (this.arrived) this.forget();
        break;
      case 'cover':
        if (fresh || this.arrived || !this.hasGoal) this.takeCover();
        break;
      case 'heal':
      case 'fight':
        this.hasGoal = false;
        break;
      case 'hunt':
        if (fresh || !this.hasGoal) this.setGoal(this.heardX, this.heardZ);
        else if (this.arrived) this.heardAge = 99;
        break;
      case 'roam': {
        if (!fresh && this.hasGoal && !this.arrived) break;
        if (!fresh && this.pause > 0) break;
        if (this.arrived) {
          // A look around before moving on.
          this.arrived = false;
          this.hasGoal = false;
          this.pause = rng.range(0.6, 2.6);
          break;
        }
        const a = rng.range(0, Math.PI * 2);
        const d = rng.range(35, 110);
        let ok = nav.randomOpen(rng, p.x + Math.cos(a) * d, p.z + Math.sin(a) * d, 30, 2.5, _spot);
        if (ok && zone.stage !== 'idle' && zone.outsideNext(_spot.x, _spot.z) > -6) ok = false;
        if (!ok && zone.stage !== 'idle') ok = nav.randomOpen(rng, zone.nextX, zone.nextZ, Math.max(3, zone.nextRadius * 0.7), 2, _spot);
        if (ok) this.setGoal(_spot.x, _spot.z);
        break;
      }
      case 'loot':
      default:
        break;
    }
  }

  /** Find somewhere near that the threat cannot see, and go there. */
  private takeCover(): void {
    const c = this.c;
    const p = c.position;
    const nav = this.game.nav;
    const physics = this.game.physics;
    const rng = this.rng;
    const t = this.last;
    const away = Math.atan2(p.z - t.z, p.x - t.x);
    let best = Infinity;
    let bx = 0;
    let bz = 0;
    for (let i = 0; i < 12; i++) {
      // Mostly on the far side from the threat.
      const a = away + rng.range(-1.9, 1.9);
      const d = rng.range(6, 24);
      const x = p.x + Math.cos(a) * d;
      const z = p.z + Math.sin(a) * d;
      if (!nav.walkable(x, z)) continue;
      const y = p.y + 1.1;
      const dx = t.x - x;
      const dy = t.y - y;
      const dz = t.z - z;
      const len = Math.hypot(dx, dy, dz);
      if (len < 4) continue;
      if (!physics.raycast(x, y, z, dx / len, dy / len, dz / len, len - 0.4, SIGHT)) continue;
      const score = d + Math.abs(angleDiff(away, a)) * 4;
      if (score < best) {
        best = score;
        bx = x;
        bz = z;
      }
    }
    if (best < Infinity) {
      this.setGoal(bx, bz);
      return;
    }
    // Nothing to hide behind: put distance in between.
    if (nav.nearestOpen(p.x + Math.cos(away) * 22, p.z + Math.sin(away) * 22, 0, 14, _spot)) this.setGoal(_spot.x, _spot.z);
  }

  // ------------------------------------------------------------------------------------------
  // Aim
  // ------------------------------------------------------------------------------------------

  private aim(dt: number): void {
    const c = this.c;
    const p = c.position;
    const rng = this.rng;
    const ey = p.y + c.eyeHeight;
    let wantYaw = this.yaw;
    let wantPitch = 0;
    let reach = 30;
    const t = this.target;
    // Running for the eye or for cover, the eyes go where the feet go.
    const tracking = t !== null && (this.sees || this.lostFor < 2.5) && this.mode !== 'storm' && this.mode !== 'cover';
    if (this.throwFor > 0) {
      // Winding up a throw: hold the arc until it leaves the hand.
      this.throwFor -= dt;
      wantYaw = this.throwYaw;
      wantPitch = this.throwPitch;
      this.offYaw = 0;
      this.offPitch = 0;
    } else if (tracking) {
      const dx = this.last.x - p.x;
      const dy = this.last.y - ey;
      const dz = this.last.z - p.z;
      const flat = Math.hypot(dx, dz);
      reach = Math.max(2, Math.hypot(flat, dy));
      wantYaw = yawFromDir(dx, dz);
      wantPitch = Math.atan2(dy, Math.max(0.01, flat));
      // The hand is never perfectly on: an error that wanders, wider on a moving target and from a moving shooter.
      if ((this.errIn -= dt) <= 0) {
        this.errIn = rng.range(0.16, 0.42);
        let sigma = lerp(0.058, 0.013, this.skill);
        if (t) {
          const v = t.motor.velocity;
          const across = Math.abs(v.x * (dz / (flat || 1)) - v.z * (dx / (flat || 1)));
          sigma += across * 0.0042;
        }
        sigma += c.motor.speed * 0.003;
        sigma *= 1 + 1.6 * Math.exp(-this.seenFor / 0.6);
        if (c.sinceHurt < 0.5) sigma *= 1.4;
        // Rivals are poorer shots at each other than at the player, which keeps a round going.
        if (!t.isPlayer) sigma *= 1.9;
        this.errYaw = rng.gauss() * sigma;
        this.errPitch = rng.gauss() * sigma * 0.6;
      }
      this.offYaw = damp(this.offYaw, this.errYaw, 5, dt);
      this.offPitch = damp(this.offPitch, this.errPitch, 5, dt);
      wantYaw += this.offYaw;
      wantPitch += this.offPitch;
    } else {
      // Nothing to shoot at: look where the feet are going.
      const m = c.motor.velocity;
      if (Math.hypot(m.x, m.z) > 0.8) wantYaw = yawFromDir(m.x, m.z);
      else if (this.heardAge < 3) wantYaw = yawFromDir(this.heardX - p.x, this.heardZ - p.z);
    }
    // The view turns at a human rate: quick to swing round, slower to settle.
    const off = angleDiff(this.yaw, wantYaw);
    const rate = lerp(3.2, 7.5, this.skill) * (Math.abs(off) > 0.5 ? 1.7 : 1);
    const k = lerp(8, 15, this.skill);
    this.yaw = wrapAngle(this.yaw + clamp(off * k * dt, -rate * dt, rate * dt));
    this.pitch += clamp((wantPitch - this.pitch) * k * dt, -rate * dt, rate * dt);
    this.pitch = clamp(this.pitch, -1.2, 1.2);
    c.aimYaw = this.yaw;
    c.aimPitch = this.pitch;
    const cp = Math.cos(this.pitch);
    c.aimPoint.set(p.x - Math.sin(this.yaw) * cp * reach, ey + Math.sin(this.pitch) * reach, p.z - Math.cos(this.yaw) * cp * reach);
    c.strafe = tracking;
  }

  // ------------------------------------------------------------------------------------------
  // Hands
  // ------------------------------------------------------------------------------------------

  /** The best weapon carried for a distance, among those that can fire. */
  private bestWeapon(d: number): WeaponId | null {
    let best: WeaponId | null = null;
    let bestScore = 0;
    for (const id of WEAPON_IDS) {
      if (!this.usable(id)) continue;
      const held = this.c.loadout.held[id]!;
      let score = suits(id, d) * (1 + held.tier * 0.12);
      // An empty one needs a reload first.
      if (held.mag === 0) score *= 0.55;
      if (id === this.c.loadout.current) score *= 1.15;
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    return best;
  }

  private hands(dt: number): void {
    const c = this.c;
    const act = c.act;
    const lo = c.loadout;
    const rng = this.rng;
    act.fire = false;
    act.aim = false;
    this.rest -= dt;

    if (this.mode === 'heal') {
      // Patch up, then armor up.
      if (lo.using === null && lo.throwing <= 0) {
        const item = (c.health < 62 ? bestHeal(c) : null) ?? (c.armor < 45 ? bestArmor(c) : null) ?? (c.health < 75 ? bestHeal(c) : null);
        if (item) act.use = item;
      }
      return;
    }

    const t = this.target;
    const engaged = t !== null && (this.sees || this.lostFor < 4);
    const p = c.position;
    const d = engaged ? Math.hypot(this.last.x - p.x, this.last.y - (p.y + c.eyeHeight), this.last.z - p.z) : 30;

    // The right tool for the distance, without fumbling between two.
    if (this.swapIn <= 0 && this.burst <= 0 && lo.reloading <= 0) {
      const want = this.bestWeapon(d);
      if (want && want !== lo.current) {
        act.slot = want;
        this.swapIn = 2.5;
      }
    }
    const def = lo.weapon;
    const held = lo.heldNow;
    if (!def || !held) return;

    if (!engaged) {
      // Quiet moment: top up.
      if (held.mag < def.mag * 0.5 && lo.reloading <= 0 && c.inventory.has(def.ammo)) act.reload = true;
      return;
    }
    if (lo.using !== null) return;

    act.aim = this.sees && d > 16 && !c.input.sprint;

    // A frag for someone behind cover, or bunched up at a middling distance.
    if (this.nadeIn <= 0 && lo.throwing <= 0 && c.inventory.has('grenade') && d > 11 && d < 30) {
      const hidden = !this.sees && this.lostFor > 0.7 && this.lostFor < 3.5;
      if (hidden || (this.sees && rng.chance(0.02 + this.skill * 0.03))) {
        this.windUp(d);
        act.throw = true;
        this.thrown++;
        return;
      }
      if (!this.sees) this.nadeIn = 0.4;
    }

    if (!this.sees || this.seenFor < this.react || this.throwFor > 0 || lo.throwing > 0) {
      this.burst = 0;
      return;
    }
    // Only when the muzzle is near enough on.
    const ey = p.y + c.eyeHeight;
    const dx = this.last.x - p.x;
    const dz = this.last.z - p.z;
    const offYaw = Math.abs(angleDiff(this.yaw, yawFromDir(dx, dz)));
    const offPitch = Math.abs(this.pitch - Math.atan2(this.last.y - ey, Math.max(0.01, Math.hypot(dx, dz))));
    const body = Math.atan2(0.42, d);
    const loose = def.pellets > 1 ? 3 : def.auto ? 2.4 : 1.5;
    if (offYaw > body * loose + 0.012 || offPitch > body * loose * 1.6 + 0.012) {
      this.burst = 0;
      return;
    }
    if (def.auto) {
      if (this.burst > 0) {
        act.fire = true;
        this.burst -= dt;
        if (this.burst <= 0) this.rest = rng.range(0.14, 0.45) * (d > 30 ? 1.7 : 1);
      } else if (this.rest <= 0) {
        this.burst = rng.range(0.3, 0.8) * (d < 14 ? 1.7 : d > 45 ? 0.6 : 1);
        act.fire = true;
      }
    } else if (this.rest <= 0 && lo.cooldown <= 0) {
      // One pull, then let go: the next step's `fire` is false again.
      act.fire = true;
      this.rest = 60 / def.rpm + rng.range(0.04, 0.22) * lerp(1.6, 0.8, this.skill);
    }
  }

  /** Work out the arc for a throw that lands near the target, and hold it. */
  private windUp(d: number): void {
    const p = this.c.position;
    let pitch = 0;
    let bestErr = Infinity;
    for (let a = -0.3; a <= 0.62; a += 0.04) {
      const vx = 17 * Math.cos(a);
      const vy = 17 * Math.sin(a) + 4.2;
      const air = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * 1.4)) / GRAVITY;
      // It skips on a little after it lands.
      const err = Math.abs(vx * air * 1.08 - d);
      if (err < bestErr) {
        bestErr = err;
        pitch = a;
      }
    }
    this.throwYaw = yawFromDir(this.last.x - p.x, this.last.z - p.z) + this.rng.gauss() * lerp(0.08, 0.02, this.skill);
    this.throwPitch = pitch;
    this.throwFor = 0.6;
    this.nadeIn = this.rng.range(9, 17);
  }

  // ------------------------------------------------------------------------------------------
  // Feet
  // ------------------------------------------------------------------------------------------

  private move(dt: number): void {
    const c = this.c;
    const game = this.game;
    const nav = game.nav;
    const p = c.position;
    const input = c.input;
    const rng = this.rng;
    let mx = 0;
    let mz = 0;
    let sprint = false;
    let crouch = false;

    this.travelled += Math.hypot(c.motor.velocity.x, c.motor.velocity.z) * dt;

    if (this.mode === 'fight' && this.target) {
      const dx = this.last.x - p.x;
      const dz = this.last.z - p.z;
      const d = Math.hypot(dx, dz) || 1;
      const tx = dx / d;
      const tz = dz / d;
      const want = REACH[c.loadout.current ?? 'pistol'] * lerp(1.25, 0.8, this.nerve);
      if ((this.sideIn -= dt) <= 0) {
        this.sideIn = rng.range(0.6, 1.7);
        this.side = rng.chance(0.5) ? 1 : -1;
        // The better ones stand still for a breath to steady a long shot.
        if (d > 22 && rng.chance(this.skill * 0.35)) this.side = 0;
      }
      let along = 0;
      if (d > want * 1.35) along = 1;
      else if (d < want * 0.55) along = -0.85;
      const sx = -tz * this.side;
      const sz = tx * this.side;
      mx = tx * along + sx * (along !== 0 ? 0.55 : 1);
      mz = tz * along + sz * (along !== 0 ? 0.55 : 1);
      const len = Math.hypot(mx, mz);
      if (len > 1) {
        mx /= len;
        mz /= len;
      }
      // Not off a quay or into a wall.
      if (len > 0.01 && !nav.walkable(p.x + mx * 2.4, p.z + mz * 2.4)) {
        this.side = -this.side;
        mx = tx * along;
        mz = tz * along;
        if (!nav.walkable(p.x + mx * 2.4, p.z + mz * 2.4)) {
          mx = 0;
          mz = 0;
        }
      }
      sprint = along > 0 && d > want * 2.2 && !c.act.fire;
      crouch = this.side === 0 && d > 22;
      if (d < 9 && c.motor.grounded && rng.chance(0.006)) input.jump = true;
    } else if (this.mode === 'heal') {
      crouch = c.sinceHurt > 2;
    } else if (this.hasGoal && !this.arrived) {
      if (this.wantPlan && this.bots.takePath()) {
        this.wantPlan = false;
        nav.findPath(p.x, p.z, this.goalX, this.goalZ, this.path, c.motor.swimming);
        this.at = 0;
        this.legX = p.x;
        this.legZ = p.z;
        if (this.path.length === 0) this.giveUp();
      }
      const path = this.path;
      if (!this.wantPlan && this.at < path.length) {
        let dx = path[this.at]! - p.x;
        let dz = path[this.at + 1]! - p.z;
        let d = Math.hypot(dx, dz);
        const last = this.at >= path.length - 2;
        if (d < (last ? 0.55 : 1.25)) {
          if (last) this.arrived = true;
          else {
            this.at += 2;
            dx = path[this.at]! - p.x;
            dz = path[this.at + 1]! - p.z;
            d = Math.hypot(dx, dz);
          }
        }
        if (!this.arrived && d > 0.01) {
          // Walk the leg, not just toward its far end: aim a few steps along it from the nearest point,
          // so a bot knocked off its line comes back onto it instead of cutting through what is beside it.
          const ax = this.at >= 2 ? path[this.at - 2]! : this.legX;
          const az = this.at >= 2 ? path[this.at - 1]! : this.legZ;
          const lx = path[this.at]! - ax;
          const lz = path[this.at + 1]! - az;
          const len = Math.hypot(lx, lz);
          if (len > 2.6 && d > 2.6) {
            const s = Math.min(len, clamp(((p.x - ax) * lx + (p.z - az) * lz) / len, 0, len) + 2.6);
            dx = ax + (lx / len) * s - p.x;
            dz = az + (lz / len) * s - p.z;
            d = Math.hypot(dx, dz) || 1;
          }
          mx = dx / d;
          mz = dz / d;
        }
        const far = Math.hypot(this.goalX - p.x, this.goalZ - p.z);
        const hurry = this.mode === 'storm' && this.stormUrgency() === 2;
        sprint = hurry || this.mode === 'cover' || this.mode === 'swim' || ((this.mode === 'chase' || this.mode === 'hunt') && far > 25) || (far > 45 && !this.sees);
        if (c.act.fire || c.loadout.using !== null) sprint = false;
      }
      // Looting: open the box when it is in reach, wait for what hops out.
      const box = this.box;
      if (box) {
        if (box.opened) this.box = null;
        else if (Math.hypot(box.x - p.x, box.z - p.z) < 1.7 && Math.abs(box.y - p.y) < 1.6) {
          game.loot.open(box, c);
          this.opened++;
          this.box = null;
          this.hasGoal = false;
          this.waitFor = 1.3;
          mx = 0;
          mz = 0;
        }
      }
    }

    // Something in the way that the map does not know about: a parked car, a lamp post, a bench.
    if (this.dodgeFor > 0) {
      this.dodgeFor -= dt;
      mx = this.dodgeX;
      mz = this.dodgeZ;
    } else if ((mx !== 0 || mz !== 0) && (this.feelIn -= dt) <= 0) {
      this.feelIn = 0.15;
      if (this.blocked(mx, mz)) {
        for (const turn of [0.8, -0.8, 1.5, -1.5]) {
          const a = this.side < 0 ? -turn : turn;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          const rx = mx * cos - mz * sin;
          const rz = mx * sin + mz * cos;
          if (this.blocked(rx, rz)) continue;
          this.dodgeX = rx;
          this.dodgeZ = rz;
          this.dodgeFor = 0.4;
          mx = rx;
          mz = rz;
          break;
        }
      }
    }

    // Still not getting anywhere: hop, sidestep, plan again, and at last give the goal up.
    if (mx !== 0 || mz !== 0) {
      if ((this.stuckCheck -= dt) <= 0) {
        this.stuckCheck = 0.5;
        const moved = Math.hypot(p.x - this.fromX, p.z - this.fromZ);
        this.fromX = p.x;
        this.fromZ = p.z;
        if (moved < 0.22) {
          this.stuck++;
          // A hop clears a kerb or a low wall, but never one with the canal behind it.
          const hop = c.motor.swimming || nav.walkable(p.x + mx * 1.7, p.z + mz * 1.7);
          if (this.stuck === 1) input.jump = hop;
          else if (this.stuck <= 4) {
            const turn = (this.stuck % 2 === 0 ? 1 : -1) * rng.range(1.1, 1.9);
            this.dodgeX = mx * Math.cos(turn) - mz * Math.sin(turn);
            this.dodgeZ = mx * Math.sin(turn) + mz * Math.cos(turn);
            this.dodgeFor = 0.55;
            this.wantPlan = this.hasGoal;
            if (this.stuck === 3) input.jump = hop;
          } else this.giveUp();
        } else if (moved > 1.2) this.stuck = 0;
      }
    } else this.stuckCheck = 0.5;

    // Never a step that ends in the canal: a sidestep in a fight or round a lamp post stops at the quay.
    if ((mx !== 0 || mz !== 0) && c.motor.grounded && !c.motor.swimming && nav.kindAt(p.x, p.z) !== Nav.Exit) {
      const ax = p.x + mx * 1.2;
      const az = p.z + mz * 1.2;
      // Water on the map there, and nothing underfoot when you look: that is the edge.
      if (game.world.field.isWater(ax, az) && nav.kindAt(ax, az) !== Nav.Exit && !game.physics.raycast(ax, p.y + 0.5, az, 0, -1, 0, 1.8, SIGHT)) {
        mx = 0;
        mz = 0;
        this.dodgeFor = 0;
        this.side = -this.side;
        // The way on is not this way: plan again from here.
        if (this.hasGoal && !this.arrived) this.wantPlan = true;
      }
    }

    input.moveX = mx;
    input.moveZ = mz;
    input.sprint = sprint && (mx !== 0 || mz !== 0);
    input.crouch = crouch;
    input.walk = false;
  }

  /** Is there something solid a step ahead at knee height? Slopes and kerbs do not count. */
  private blocked(dx: number, dz: number): boolean {
    const p = this.c.position;
    const hit = this.game.physics.raycast(p.x, p.y + 0.55, p.z, dx, 0, dz, 1.25, SIGHT);
    return hit !== null && hit.normal.y < 0.4;
  }

  /** This goal cannot be reached: cross it off and think again. */
  private giveUp(): void {
    if (this.box) this.skip.add(this.box.id);
    if (this.item) this.skip.add(-this.item.id);
    this.box = null;
    this.item = null;
    this.hasGoal = false;
    this.arrived = false;
    this.wantPlan = false;
    this.path.length = 0;
    this.stuck = 0;
    this.thinkIn = 0;
    if (this.mode === 'chase') this.forget();
    if (this.mode === 'hunt') this.heardAge = 99;
  }

  /** One line about this bot, for the debug view and tests. */
  snapshot(): Record<string, unknown> {
    const c = this.c;
    const lo = c.loadout;
    _eye.copy(c.position);
    return {
      id: c.id,
      name: c.name,
      mode: this.mode,
      alive: c.alive,
      state: c.state,
      x: _eye.x,
      y: _eye.y,
      z: _eye.z,
      health: c.health,
      armor: c.armor,
      weapon: lo.current,
      weapons: lo.carried(),
      armed: this.armed,
      target: this.target?.id ?? null,
      sees: this.sees,
      skill: this.skill,
      nerve: this.nerve,
      opened: this.opened,
      heals: this.heals,
      thrown: this.thrown,
      shots: lo.shots,
      hits: lo.hits,
      kills: c.kills,
      travelled: this.travelled,
      landed: this.landed,
      swimming: c.motor.swimming,
      goal: this.hasGoal ? [this.goalX, this.goalZ] : null,
      inEye: this.game.zone.inside(c.position.x, c.position.z),
    };
  }
}
