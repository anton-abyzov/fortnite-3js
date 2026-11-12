import { Quaternion, Vector3 } from 'three';
import { WORLD } from '../core/config';
import { angleDiff, clamp } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import { bridgeRise, type Layout, type RoadSegment } from '../world/layout';
import { Car } from './car';
import type { CarModel } from './carModels';
import type { Cars } from './cars';

/**
 * Traffic: cars that follow the lanes of the road network on the right-hand side, slow for turns,
 * take turns at junctions, keep a gap to whatever is ahead and stop for anything in their lane.
 *
 * They are carried along their lane rather than driven (no tyres, no springs), which is what lets a
 * dozen of them run all over the city for almost nothing. The moment one is about to be hit, is shot
 * at or is taken by the player it becomes an ordinary `Car` with the speed it had.
 */

/** One direction of travel along a road segment, from the edge of one junction to the edge of the next. */
export interface Lane {
  id: number;
  seg: RoadSegment;
  /** 1 runs toward larger x or z, -1 toward smaller. */
  dir: 1 | -1;
  /** Start of the lane and the unit direction along it. */
  x0: number;
  z0: number;
  dx: number;
  dz: number;
  length: number;
  /** Junctions at the start and the end. */
  from: number;
  to: number;
  /** Ways on from the end of this lane. */
  exits: Turn[];
}

/** A path across a junction from the end of one lane to the start of another. */
export interface Turn {
  node: number;
  from: Lane;
  to: Lane;
  kind: 'straight' | 'left' | 'right';
  /** The path as a row of points, with the distance along it at each. */
  px: Float32Array;
  pz: Float32Array;
  at: Float32Array;
  length: number;
  /** Speed to take it at, m/s. */
  speed: number;
}

interface Sample {
  x: number;
  z: number;
  tx: number;
  tz: number;
  y: number;
}

interface Driver {
  car: Car;
  active: boolean;
  /** The lane it is on, or while crossing a junction the lane it is heading into. */
  lane: Lane;
  /** Set while crossing a junction. */
  turn: Turn | null;
  /** The turn it will take at the end of its lane. */
  next: Turn;
  /** The turn it last came out of, for placing the back of the car just after a junction. */
  last: Turn | null;
  /** Distance of the car's middle along the lane or the turn. */
  s: number;
  v: number;
  cruise: number;
  /** Junction it holds a reservation for, or -1, and the way it is crossing it. */
  holding: number;
  claim: Turn | null;
  /** Seconds it has stood still waiting for something: a car, a person, a junction. */
  wait: number;
  horn: number;
  /** Seconds since it left the traffic. */
  away: number;
  yaw: number;
  state: 'cruise' | 'follow' | 'stop' | 'yield' | 'turn';
  /** What it is slowing for: a short word for the debug view. */
  cause: string;
  gap: number;
  /** Id of the car it is held up by, 0 for none, -1 for something that is not a car. */
  lead: number;
}

/** Something a traffic car must not drive into: a disc on the ground with a velocity. */
interface Obstacle {
  x: number;
  z: number;
  r: number;
  vx: number;
  vz: number;
  /** The car it belongs to, when it is one, so a car does not avoid itself. */
  car: Car | null;
  person: boolean;
}

/** Comfortable acceleration and braking, and the hardest braking, m/s². */
const ACCEL = 2.4;
const BRAKE = 3.0;
const HARD_BRAKE = 9.5;
/** Time gap to the car ahead in seconds, and the gap when stopped, metres. */
const HEADWAY = 1.1;
const STOP_GAP = 2.4;
/** Cars stop this far short of the junction: behind the stop line and the crossing. */
const STOP_LINE = 4.8;
const STREET = WORLD.streetY;
const TURN_POINTS = 14;

/** The cars in the stream, dealt out in a shuffled order: a believable mix every time, not the luck of the draw. */
const FLEET: readonly CarModel[] = ['sedan', 'taxi', 'suv', 'sedan', 'van', 'hatchback-sports', 'taxi', 'truck', 'suv-luxury', 'sedan', 'delivery', 'police'];

/** How far the lane's middle is from the road's centre line, from the way the road is painted. */
export function laneOffset(w: number): number {
  // Boulevards: a median 1.3 m either side of the centre, then two lanes. Traffic keeps to the inner one.
  if (w >= 18) return (1.3 + (w / 2 + 1.3) / 2) / 2;
  // Streets with kerb parking: one lane between the centre line and the parking bays.
  if (w >= 12) return (w / 2 - 2.4) / 2 + 0.1;
  return w / 4 - 0.1;
}

const _a: Sample = { x: 0, z: 0, tx: 0, tz: 0, y: 0 };
const _b: Sample = { x: 0, z: 0, tx: 0, tz: 0, y: 0 };
const _q = new Quaternion();
const _qp = new Quaternion();
const _v = new Vector3();
const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

export class Traffic implements GameSystem {
  readonly lanes: Lane[] = [];
  readonly drivers: Driver[] = [];
  /** Who holds each junction. Several cars may, when they came in by the same lane. */
  private readonly holders = new Map<number, Driver[]>();
  private readonly obstacles: Obstacle[] = [];
  private readonly rng: Rng;
  /** Stop the stream (for looking at one thing at a time). Cars stay where they are. */
  paused = false;

  constructor(
    private readonly game: Game,
    private readonly cars: Cars,
  ) {
    this.rng = new Rng(game.world.layout.seed + 909);
    this.buildLanes(game.world.layout);
    this.populate();
  }

  // ---- The network -----------------------------------------------------------------------------

  private buildLanes(layout: Layout): void {
    // Roads that lead nowhere are left to the player: drop dead ends until none are left.
    const live = new Set(layout.segments.map((s) => s.id));
    for (let changed = true; changed; ) {
      changed = false;
      const degree = new Map<number, number>();
      for (const id of live) {
        const s = layout.segments[id]!;
        degree.set(s.nodeA, (degree.get(s.nodeA) ?? 0) + 1);
        degree.set(s.nodeB, (degree.get(s.nodeB) ?? 0) + 1);
      }
      for (const id of live) {
        const s = layout.segments[id]!;
        if (degree.get(s.nodeA) === 1 || degree.get(s.nodeB) === 1) {
          live.delete(id);
          changed = true;
        }
      }
    }
    for (const id of live) {
      const seg = layout.segments[id]!;
      const na = layout.nodes[seg.nodeA]!;
      const nb = layout.nodes[seg.nodeB]!;
      const x = seg.axis === 'x';
      // A lane runs from the edge of one junction box to the edge of the next, which for a bridge
      // includes the plain road between the bridge and the junction it lands at.
      let lo = x ? na.x + na.hx : na.z + na.hz;
      let hi = x ? nb.x - nb.hx : nb.z - nb.hz;
      let first = seg.nodeA;
      let second = seg.nodeB;
      if (lo > hi) {
        lo = x ? nb.x + nb.hx : nb.z + nb.hz;
        hi = x ? na.x - na.hx : na.z - na.hz;
        first = seg.nodeB;
        second = seg.nodeA;
      }
      if (hi - lo < 12) continue;
      const off = laneOffset(seg.w);
      for (const dir of [1, -1] as const) {
        // Right-hand traffic. Eastbound keeps south of the centre line, southbound keeps west of it.
        const across = seg.c + (x ? dir : -dir) * off;
        const start = dir > 0 ? lo : hi;
        this.lanes.push({
          id: this.lanes.length,
          seg,
          dir,
          x0: x ? start : across,
          z0: x ? across : start,
          dx: x ? dir : 0,
          dz: x ? 0 : dir,
          length: hi - lo,
          from: dir > 0 ? first : second,
          to: dir > 0 ? second : first,
          exits: [],
        });
      }
    }
    for (const lane of this.lanes) {
      for (const out of this.lanes) {
        if (out.from !== lane.to || out.seg === lane.seg) continue;
        lane.exits.push(this.buildTurn(lane, out));
      }
    }
    // A lane with no way on would strand its cars; such a lane only exists if the pruning missed something.
    for (let i = this.lanes.length - 1; i >= 0; i--) if (this.lanes[i]!.exits.length === 0) this.lanes.splice(i, 1);
    for (const lane of this.lanes) lane.exits = lane.exits.filter((t) => this.lanes.includes(t.to));
  }

  private buildTurn(from: Lane, to: Lane): Turn {
    const ax = from.x0 + from.dx * from.length;
    const az = from.z0 + from.dz * from.length;
    const bx = to.x0;
    const bz = to.z0;
    const cross = from.dx * to.dz - from.dz * to.dx;
    const kind = cross > 0.5 ? 'right' : cross < -0.5 ? 'left' : 'straight';
    // A turn bends round the point where the two lane lines meet.
    const cx = kind === 'straight' ? (ax + bx) / 2 : from.dx !== 0 ? bx : ax;
    const cz = kind === 'straight' ? (az + bz) / 2 : from.dx !== 0 ? az : bz;
    const px = new Float32Array(TURN_POINTS + 1);
    const pz = new Float32Array(TURN_POINTS + 1);
    const at = new Float32Array(TURN_POINTS + 1);
    for (let i = 0; i <= TURN_POINTS; i++) {
      const t = i / TURN_POINTS;
      const u = 1 - t;
      px[i] = u * u * ax + 2 * u * t * cx + t * t * bx;
      pz[i] = u * u * az + 2 * u * t * cz + t * t * bz;
      at[i] = i === 0 ? 0 : at[i - 1]! + Math.hypot(px[i]! - px[i - 1]!, pz[i]! - pz[i - 1]!);
    }
    const radius = Math.min(Math.hypot(cx - ax, cz - az), Math.hypot(bx - cx, bz - cz));
    const speed = kind === 'straight' ? Infinity : clamp(Math.sqrt(2.4 * radius), 3.2, 6.5);
    return { node: from.to, from, to, kind, px, pz, at, length: at[TURN_POINTS]!, speed };
  }

  private laneAt(lane: Lane, s: number, out: Sample): void {
    out.x = lane.x0 + lane.dx * s;
    out.z = lane.z0 + lane.dz * s;
    out.tx = lane.dx;
    out.tz = lane.dz;
    out.y = STREET;
    const b = lane.seg.bridge;
    if (b) {
      const along = lane.seg.axis === 'x' ? out.x : out.z;
      out.y += bridgeRise((along - lane.seg.a) / (lane.seg.b - lane.seg.a), b.rise);
    }
  }

  private turnAt(turn: Turn, s: number, out: Sample): void {
    const at = turn.at;
    let i = 1;
    while (i < TURN_POINTS && at[i]! < s) i++;
    const span = at[i]! - at[i - 1]! || 1;
    const t = (s - at[i - 1]!) / span;
    const x0 = turn.px[i - 1]!;
    const z0 = turn.pz[i - 1]!;
    const dx = turn.px[i]! - x0;
    const dz = turn.pz[i]! - z0;
    const l = Math.hypot(dx, dz) || 1;
    out.x = x0 + dx * t;
    out.z = z0 + dz * t;
    out.tx = dx / l;
    out.tz = dz / l;
    out.y = STREET;
  }

  /** A point on the car's route, `off` metres ahead of its middle (or behind, when negative). */
  private sample(d: Driver, off: number, out: Sample): void {
    let s = d.s + off;
    if (d.turn) {
      if (s < 0) this.laneAt(d.turn.from, d.turn.from.length + s, out);
      else if (s > d.turn.length) this.laneAt(d.lane, s - d.turn.length, out);
      else this.turnAt(d.turn, s, out);
      return;
    }
    if (s < 0 && d.last) {
      s += d.last.length;
      if (s >= 0) this.turnAt(d.last, s, out);
      else this.laneAt(d.last.from, d.last.from.length + s, out);
    } else if (s > d.lane.length) {
      s -= d.lane.length;
      if (s <= d.next.length) this.turnAt(d.next, s, out);
      else this.laneAt(d.next.to, s - d.next.length, out);
    } else this.laneAt(d.lane, s, out);
  }

  // ---- Putting cars on the road ----------------------------------------------------------------

  private populate(): void {
    if (this.lanes.length === 0) return;
    const fleet = this.rng.shuffle([...FLEET]);
    for (const model of fleet) {
      const spot = this.freeSpot(null);
      if (!spot) break;
      this.laneAt(spot.lane, spot.s, _a);
      const car = this.cars.spawn(model, _a.x, _a.z, Math.atan2(-spot.lane.dx, -spot.lane.dz), undefined, true);
      const d: Driver = {
        car,
        active: true,
        lane: spot.lane,
        turn: null,
        next: this.rng.pick(spot.lane.exits),
        last: null,
        s: spot.s,
        v: 0,
        cruise: 0,
        holding: -1,
        claim: null,
        wait: 0,
        horn: 0,
        away: 0,
        yaw: Math.atan2(-spot.lane.dx, -spot.lane.dz),
        state: 'cruise',
        cause: '',
        gap: 99,
        lead: 0,
      };
      d.cruise = this.cruiseSpeed();
      d.v = d.cruise * 0.8;
      car.setDummy(true, this.cars.makeDummy);
      car.onLeaveTraffic = () => this.dropOut(d);
      this.drivers.push(d);
      this.pose(d, 0, 1 / 60);
    }
  }

  private cruiseSpeed(): number {
    return this.rng.range(9, 11.5);
  }

  /** A stretch of lane with nobody near it, away from the player. */
  private freeSpot(avoid: { x: number; z: number } | null): { lane: Lane; s: number } | null {
    for (let tries = 0; tries < 60; tries++) {
      const lane = this.rng.pick(this.lanes);
      if (lane.length < 40) continue;
      const s = this.rng.range(14, lane.length - 20);
      this.laneAt(lane, s, _a);
      // Not on the avenue by the plaza, where a round on foot usually starts.
      if (Math.hypot(_a.x + 60, _a.z - 8) < 50) continue;
      if (avoid && Math.hypot(_a.x - avoid.x, _a.z - avoid.z) < 130) continue;
      let crowded = false;
      for (const v of this.game.vehicles) {
        if (Math.hypot(v.position.x - _a.x, v.position.z - _a.z) < (v.kind === 'car' && (v as Car).mode === 'traffic' ? 34 : 7)) {
          crowded = true;
          break;
        }
      }
      if (!crowded) return { lane, s };
    }
    return null;
  }

  /** The car stopped being traffic: it was taken, hit or shot at. */
  private dropOut(d: Driver): void {
    d.active = false;
    d.away = 0;
    d.v = 0;
    this.release(d);
  }

  /** Put a car that fell out of the traffic back into it somewhere the player cannot see. */
  private rejoin(d: Driver): boolean {
    const player = this.game.player;
    const spot = this.freeSpot(player ? player.position : null);
    if (!spot) return false;
    const car = d.car;
    for (const s of car.seats) if (s.occupant) return false;
    car.repair();
    car.enterTraffic();
    this.laneAt(spot.lane, spot.s, _a);
    car.placeAt(_a.x, _a.y, _a.z, Math.atan2(-spot.lane.dx, -spot.lane.dz));
    car.setDummy(true, this.cars.makeDummy);
    d.active = true;
    d.lane = spot.lane;
    d.turn = null;
    d.last = null;
    d.next = this.rng.pick(spot.lane.exits);
    d.s = spot.s;
    d.v = 0;
    d.wait = 0;
    d.holding = -1;
    d.claim = null;
    d.yaw = Math.atan2(-spot.lane.dx, -spot.lane.dz);
    d.cruise = this.cruiseSpeed();
    this.pose(d, 0, 1 / 60);
    return true;
  }

  // ---- Junctions -------------------------------------------------------------------------------

  /**
   * Ask for the junction at the end of the driver's lane. Granted when it is empty, or when everyone
   * in it is on a path that cannot cross this one: they came in by the same lane, or both are going
   * straight through from opposite ends of the same road.
   */
  private reserve(d: Driver): boolean {
    const node = d.lane.to;
    if (d.holding === node) return true;
    let list = this.holders.get(node);
    if (!list) {
      list = [];
      this.holders.set(node, list);
    }
    const mine = d.next;
    for (const h of list) {
      const theirs = h.claim;
      if (!theirs || theirs.from === mine.from) continue;
      const opposite = theirs.from.seg.axis === mine.from.seg.axis && theirs.from.dir !== mine.from.dir;
      if (!(opposite && theirs.kind === 'straight' && mine.kind === 'straight')) return false;
    }
    list.push(d);
    d.holding = node;
    d.claim = mine;
    return true;
  }

  private release(d: Driver): void {
    if (d.holding < 0) return;
    const list = this.holders.get(d.holding);
    if (list) {
      const i = list.indexOf(d);
      if (i >= 0) list.splice(i, 1);
    }
    d.holding = -1;
    d.claim = null;
  }

  // ---- Each step -------------------------------------------------------------------------------

  private gatherObstacles(): void {
    const list = this.obstacles;
    list.length = 0;
    for (const v of this.game.vehicles) {
      const sin = Math.sin(v.yaw);
      const cos = Math.cos(v.yaw);
      v.toWorld(_v.set(0, 0, 0), _v);
      if (v.kind !== 'car') {
        list.push({ x: _v.x, z: _v.z, r: 1.3, vx: -sin * v.speed, vz: -cos * v.speed, car: null, person: false });
        continue;
      }
      const car = v as Car;
      const kit = car.kit;
      const r = kit.width / 2;
      const speed = car.speed;
      // Three discs along the car: nose, middle and tail.
      for (const z of [kit.front + r, (kit.front + kit.rear) / 2, kit.rear - r]) {
        list.push({ x: _v.x + sin * z, z: _v.z + cos * z, r, vx: -sin * speed, vz: -cos * speed, car, person: false });
      }
    }
    for (const c of this.game.characters) {
      if (!c.alive || c.vehicle || c.state !== 'normal') continue;
      const p = c.position;
      // Only people at street level: not on a roof, not swimming under a bridge.
      if (p.y > STREET + 9 || p.y < STREET - 1.2) continue;
      const m = c.motor.velocity;
      list.push({ x: p.x, z: p.z, r: 0.4, vx: m.x, vz: m.z, car: null, person: true });
      // Where they will be in a moment, so someone running into the road is seen in time.
      if (Math.hypot(m.x, m.z) > 1) list.push({ x: p.x + m.x * 0.7, z: p.z + m.z * 0.7, r: 0.4, vx: m.x, vz: m.z, car: null, person: true });
    }
  }

  /**
   * The nearest thing in the way within `look` metres along the route. Returns the clear distance from
   * the car's nose to it (negative when already touching) and sets `leadSpeed` and `leadWho`.
   */
  private leadSpeed = 0;
  private leadWho: Obstacle | null = null;

  private clearAhead(d: Driver, look: number): number {
    const car = d.car;
    const halfW = car.kit.width / 2;
    const halfL = car.kit.length / 2;
    let best = Infinity;
    this.leadSpeed = 0;
    this.leadWho = null;
    this.sample(d, 0, _a);
    const mx = _a.x;
    const mz = _a.z;
    for (const o of this.obstacles) {
      if (o.car === car) continue;
      if (Math.abs(o.x - mx) > look + 6 || Math.abs(o.z - mz) > look + 6) continue;
      const reach = halfW + o.r + (o.person ? 0.45 : 0.3);
      let dist = Infinity;
      let tx = 0;
      let tz = 0;
      // Walk the route: the rest of what it is on, then what comes after.
      let base = -d.s;
      const lanePart = (lane: Lane, from: number): void => {
        const rx = o.x - lane.x0;
        const rz = o.z - lane.z0;
        const along = rx * lane.dx + rz * lane.dz;
        const side = Math.abs(rx * lane.dz - rz * lane.dx);
        if (side < reach && along >= from - o.r && along <= lane.length + o.r && base + along < dist && base + along > 0) {
          dist = base + along;
          tx = lane.dx;
          tz = lane.dz;
        }
      };
      const turnPart = (turn: Turn, from: number): void => {
        for (let i = 1; i <= TURN_POINTS; i++) {
          if (turn.at[i]! < from) continue;
          const x0 = turn.px[i - 1]!;
          const z0 = turn.pz[i - 1]!;
          const ex = turn.px[i]! - x0;
          const ez = turn.pz[i]! - z0;
          const el = Math.hypot(ex, ez) || 1;
          const t = clamp(((o.x - x0) * ex + (o.z - z0) * ez) / (el * el), 0, 1);
          const side = Math.hypot(o.x - x0 - ex * t, o.z - z0 - ez * t);
          const along = turn.at[i - 1]! + t * el;
          if (side < reach && along >= from && base + along < dist && base + along > 0) {
            dist = base + along;
            tx = ex / el;
            tz = ez / el;
          }
        }
      };
      if (d.turn) {
        turnPart(d.turn, d.s);
        base += d.turn.length;
        lanePart(d.lane, 0);
      } else {
        lanePart(d.lane, d.s);
        base += d.lane.length;
        if (base < look) {
          turnPart(d.next, 0);
          base += d.next.length;
          if (base < look) lanePart(d.next.to, 0);
        }
      }
      if (dist > look + halfL) continue;
      const gap = dist - halfL - o.r;
      if (gap < best) {
        best = gap;
        this.leadSpeed = Math.max(0, o.vx * tx + o.vz * tz);
        this.leadWho = o;
      }
    }
    return best;
  }

  fixedUpdate(dt: number): void {
    if (this.paused) return;
    this.gatherObstacles();
    const player = this.game.player;
    for (const d of this.drivers) {
      if (!d.active) {
        // Out of the traffic. Once it has been left alone, far from the player, it drives off again.
        d.away += dt;
        const p = d.car.position;
        const far = !player || Math.hypot(p.x - player.position.x, p.z - player.position.z) > 130;
        if (d.away > 8 && far && !d.car.occupied) this.rejoin(d);
        continue;
      }
      this.drive(d, dt);
    }
  }

  private drive(d: Driver, dt: number): void {
    const car = d.car;
    const halfL = car.kit.length / 2;
    const v = d.v;
    let limit = d.cruise;
    let cause = '';
    let state: Driver['state'] = 'cruise';

    // Slow for the turn ahead, and take the turn itself at its own speed.
    if (d.turn) {
      if (d.turn.speed < limit) {
        limit = d.turn.speed;
        state = 'turn';
      }
    } else if (d.next.speed < limit) {
      const dist = Math.max(0, d.lane.length - d.s - 1);
      const allowed = Math.sqrt(d.next.speed * d.next.speed + 2 * BRAKE * 0.8 * dist);
      if (allowed < limit) {
        limit = allowed;
        state = 'turn';
      }
    }
    let accel = ACCEL * (1 - Math.pow(v / Math.max(0.5, limit), 4));

    // Whatever is in the way: a car, a person, a wreck.
    const look = clamp((v * v) / (2 * BRAKE) + 14, 16, 46);
    let gap = this.clearAhead(d, look);
    let lead = this.leadSpeed;
    const who = this.leadWho;
    let blockedBy = who ? (who.person ? 'person' : 'car') : '';

    // The junction, until it is ours.
    if (!d.turn) {
      const toLine = d.lane.length - STOP_LINE - d.s - halfL;
      const need = (v * v) / (2 * BRAKE) + 8;
      if (toLine < need || d.holding === d.lane.to) {
        // Do not go in while the way out is blocked: the car would sit across the junction.
        const through = gap > d.lane.length - d.s + d.next.length + halfL + 2;
        if (d.holding !== d.lane.to && (!through || !this.reserve(d))) {
          if (toLine < gap) {
            gap = Math.max(toLine, -0.2);
            lead = 0;
            blockedBy = 'junction';
          }
        }
      }
    }

    if (gap < look) {
      const stop = (blockedBy === 'person' ? STOP_GAP + 0.8 : blockedBy === 'junction' ? 0.4 : STOP_GAP) + Math.max(0, v * HEADWAY + (v * (v - lead)) / (2 * Math.sqrt(ACCEL * BRAKE)));
      const ratio = stop / Math.max(gap, 0.05);
      accel -= ACCEL * ratio * ratio;
      if (ratio > 0.75) {
        state = blockedBy === 'junction' ? 'yield' : v < 0.3 ? 'stop' : 'follow';
        cause = blockedBy;
      }
    }
    accel = clamp(accel, -HARD_BRAKE, ACCEL);
    let nv = Math.max(0, v + accel * dt);
    // Touching, or a person pressed against the bumper: stand still.
    if (gap < 0.25 || car.blocked > 0) nv = 0;
    car.blocked = Math.max(0, car.blocked - dt);
    if (nv < 0.04 && accel <= 0) nv = 0;

    // A free car coming too fast to avoid: let go of the lane and take the hit as a real car.
    if (who?.car && who.car.mode === 'dynamic' && this.aboutToCollide(d, who.car)) {
      car.leaveTraffic('collision');
      return;
    }
    for (const o of this.obstacles) {
      if (!o.car || o.car === car || o.car.mode !== 'dynamic' || o.car.sleeping) continue;
      if (Math.abs(o.x - car.position.x) > 12 || Math.abs(o.z - car.position.z) > 12) continue;
      if (this.aboutToCollide(d, o.car)) {
        car.leaveTraffic('collision');
        return;
      }
    }

    d.v = nv;
    d.s += nv * dt;
    d.gap = gap;
    d.state = state;
    d.cause = cause;
    d.lead = cause === 'car' || cause === 'person' ? (who?.car ? who.car.id : -1) : 0;

    // Standing behind something that is not moving: sound the horn now and then.
    if (nv < 0.2 && cause !== '') {
      d.wait += dt;
      d.horn -= dt;
      if (cause !== 'junction' && d.wait > 3 && d.horn <= 0) {
        d.horn = this.rng.range(6, 11);
        this.game.sound('horn', car.position);
      }
      // Stuck for good (behind a wreck, or in a ring of cars each waiting for the next), with nobody
      // watching: start again somewhere else.
      const player = this.game.player;
      if (d.wait > 30 && (!player || Math.hypot(car.position.x - player.position.x, car.position.z - player.position.z) > 110)) {
        this.release(d);
        car.leaveTraffic('stuck');
        return;
      }
    } else {
      d.wait = 0;
      d.horn = Math.min(d.horn, 2);
    }

    // On to the next piece of road.
    if (d.turn) {
      if (d.s >= d.turn.length) {
        d.s -= d.turn.length;
        d.last = d.turn;
        d.turn = null;
        d.next = this.pickTurn(d.lane);
        d.cruise = this.cruiseSpeed();
      }
    } else {
      if (d.holding >= 0 && d.holding !== d.lane.to && d.s > halfL + 1.5) this.release(d);
      if (d.s >= d.lane.length) {
        if (d.holding !== d.lane.to && !this.reserve(d)) {
          // Never into a junction that is not ours.
          d.s = d.lane.length - 0.01;
          d.v = 0;
        } else {
          d.s -= d.lane.length;
          d.turn = d.next;
          d.lane = d.next.to;
        }
      }
    }
    this.pose(d, accel, dt);
  }

  /** Which way to go at the end of a lane: mostly straight on. */
  private pickTurn(lane: Lane): Turn {
    const options = lane.exits.map((t) => [t, t.kind === 'straight' ? 5 : t.kind === 'right' ? 2.5 : 2] as const);
    return this.rng.weighted(options);
  }

  /** True when a free-moving car will be into this one within a moment, on the way both are going. */
  private aboutToCollide(d: Driver, other: Car): boolean {
    const car = d.car;
    const sin = Math.sin(other.yaw);
    const cos = Math.cos(other.yaw);
    const lv = other.body.linvel();
    const px = other.position.x - car.position.x;
    const pz = other.position.z - car.position.z;
    const wx = lv.x - -Math.sin(d.yaw) * d.v;
    const wz = lv.z - -Math.cos(d.yaw) * d.v;
    const w2 = wx * wx + wz * wz;
    if (w2 < 9) return false;
    const t = clamp(-(px * wx + pz * wz) / w2, 0, 0.4);
    const cx = px + wx * t;
    const cz = pz + wz * t;
    // At their closest, do the two overlap? Measured along and across the other car.
    const along = Math.abs(cx * -sin + cz * -cos);
    const side = Math.abs(cx * cos - cz * sin);
    const r = car.kit.length * 0.42;
    return along < other.kit.length / 2 + r && side < other.kit.width / 2 + r * 0.8 && Math.hypot(cx, cz) < other.kit.length / 2 + car.kit.length / 2 + 0.3;
  }

  /** Stand the car on its route: the axles on the path, the body between them. */
  private pose(d: Driver, accel: number, dt: number): void {
    const car = d.car;
    const kit = car.kit;
    const half = (kit.wheels[2]!.z - kit.wheels[0]!.z) / 2;
    const mid = (kit.wheels[2]!.z + kit.wheels[0]!.z) / 2;
    this.sample(d, half, _a);
    this.sample(d, -half, _b);
    const dx = _a.x - _b.x;
    const dz = _a.z - _b.z;
    const len = Math.hypot(dx, dz) || 1;
    const yaw = Math.atan2(-dx, -dz);
    const pitch = Math.atan2(_a.y - _b.y, len);
    // The body's origin is between the axles, give or take where the model's middle is.
    const fx = dx / len;
    const fz = dz / len;
    const x = (_a.x + _b.x) / 2 + fx * mid;
    const z = (_a.z + _b.z) / 2 + fz * mid;
    const y = (_a.y + _b.y) / 2;
    const turned = d.v > 0.3 ? angleDiff(d.yaw, yaw) / dt : 0;
    d.yaw = yaw;
    _q.setFromAxisAngle(UP, yaw).multiply(_qp.setFromAxisAngle(RIGHT, pitch));
    // Front wheels point along the bend: the angle a car of this length needs for the rate it is turning.
    const steer = d.v > 0.3 ? clamp(-Math.atan((turned * half * 2) / d.v), -0.55, 0.55) : car.steerAngle;
    car.setTrafficPose(x, y, z, _q, d.v, steer, accel, -d.v * turned);
  }

  // ---- For tests and the debug view ------------------------------------------------------------

  /** Distance of a car from the middle of the lane or turn it is on. */
  private offCentre(d: Driver): number {
    const p = d.car.body.translation();
    if (!d.turn) {
      return Math.abs((p.x - d.lane.x0) * d.lane.dz - (p.z - d.lane.z0) * d.lane.dx);
    }
    let best = Infinity;
    const t = d.turn;
    for (let i = 1; i <= TURN_POINTS; i++) {
      const x0 = t.px[i - 1]!;
      const z0 = t.pz[i - 1]!;
      const ex = t.px[i]! - x0;
      const ez = t.pz[i]! - z0;
      const u = clamp(((p.x - x0) * ex + (p.z - z0) * ez) / (ex * ex + ez * ez || 1), 0, 1);
      best = Math.min(best, Math.hypot(p.x - x0 - ex * u, p.z - z0 - ez * u));
    }
    return best;
  }

  describe(): Record<string, unknown>[] {
    return this.drivers
      .filter((d) => d.active)
      .map((d) => ({
        ...d.car.describe(),
        segment: d.lane.seg.id,
        road: d.lane.seg.name,
        axis: d.lane.seg.axis,
        dir: d.lane.dir,
        lane: d.lane.id,
        /** Junction being crossed, or -1 on a lane. */
        node: d.turn ? d.turn.node : -1,
        turning: d.turn ? d.turn.kind : d.next.kind,
        s: d.s,
        length: d.turn ? d.turn.length : d.lane.length,
        offset: this.offCentre(d),
        state: d.state,
        cause: d.cause,
        gap: d.gap,
        lead: d.lead,
        wait: d.wait,
        holding: d.holding,
      }));
  }

  /** A point on a traffic car's own lane, `metres` ahead of it, or null when its lane ends sooner. */
  ahead(id: number, metres: number): { x: number; z: number; y: number } | null {
    const d = this.drivers.find((k) => k.active && k.car.id === id);
    if (!d || d.turn || d.s + metres > d.lane.length - STOP_LINE - 3) return null;
    this.laneAt(d.lane, d.s + metres, _a);
    return { x: _a.x, z: _a.z, y: _a.y };
  }
}
