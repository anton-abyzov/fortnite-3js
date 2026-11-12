import type { RAPIER } from './physics';

/**
 * Buoyancy for anything that floats: a hull is a handful of points, each one compared with the wave
 * height above or below it and pushed up by the water it displaces. Because every point feels its own
 * patch of sea, the hull heaves, pitches and rolls with the waves without being told to.
 */

/** Water surface height at a point, or anything below `NO_WATER` where there is none (dry land). */
export type WaterSampler = (x: number, z: number) => number;

const NO_WATER = -40;

export interface FloatDef {
  /**
   * Position in hull space. The origin sits on the centreline at the waterline the hull is drawn for,
   * so a point on the bottom has a negative `y` (its depth at rest) and a point on the gunwale a positive one.
   */
  x: number;
  y: number;
  z: number;
  /** Fraction of the craft's weight this point carries at rest. The shares of a hull add up to 1. */
  share?: number;
  /**
   * For a point that is dry at rest (the gunwale, the bow flare): the push it gives per metre under
   * water, in craft weights. This is what stops a hull from rolling over or burying its bow.
   */
  reserve?: number;
  /** How much of the planing lift this point gets. The forward part of a hull makes more than the stern. */
  lift?: number;
}

export interface BuoyancyOptions {
  /** Damping ratio of the bob the points give by themselves (heave, pitch and roll alike). */
  damping: number;
  /** How far the deck is above the waterline. A point pushed deeper than this displaces no more water. */
  freeboard: number;
  gravity: number;
}

interface FloatState {
  x: number;
  y: number;
  z: number;
  /** Newtons per metre of depth. */
  stiffness: number;
  /** Depth at which the push stops growing. */
  maxDepth: number;
  /** Depth at rest; zero for a reserve point. */
  rest: number;
  /** Newtons per (m/s) of sinking speed, at full immersion. */
  damping: number;
  /** Newtons of planing lift per unit of lift gain, at full immersion. */
  lift: number;
  /** This point's part in the planing lift, against an even spread. */
  liftShare: number;
  /** Upper and lower limits of the push, newtons. */
  cap: number;
  suction: number;
  share: number;
  /** Depth last step, without the trim and bank offsets. */
  prevDepth: number;
  hasPrev: boolean;
  /** Outputs, refreshed every step. */
  depth: number;
  wx: number;
  wy: number;
  wz: number;
}

/**
 * A snapshot of a rigid body for code that works out forces: where it is, how it moves, its axes in the
 * world, and a place to add up force and torque before handing them to the physics in one go.
 * The body's forward is its local -Z, right is +X, up is +Y.
 */
export class Hull {
  /** Body origin. */
  px = 0;
  py = 0;
  pz = 0;
  /** Centre of mass. */
  cx = 0;
  cy = 0;
  cz = 0;
  /** Velocity of the centre of mass and the spin, world space. */
  vx = 0;
  vy = 0;
  vz = 0;
  wx = 0;
  wy = 0;
  wz = 0;
  /** Local +X in the world. */
  rx = 1;
  ry = 0;
  rz = 0;
  /** Local +Y in the world. */
  ux = 0;
  uy = 1;
  uz = 0;
  /** Local +Z (astern) in the world. */
  bx = 0;
  by = 0;
  bz = 1;
  /** Force at the centre of mass and torque about it, added up over a step. */
  fx = 0;
  fy = 0;
  fz = 0;
  tx = 0;
  ty = 0;
  tz = 0;
  private readonly impulse = { x: 0, y: 0, z: 0 };

  /** Read the body's state and clear the totals. `com` is the centre of mass in body space. */
  read(body: RAPIER.RigidBody, com: { x: number; y: number; z: number }): void {
    const t = body.translation();
    const q = body.rotation();
    const v = body.linvel();
    const w = body.angvel();
    const x2 = q.x + q.x;
    const y2 = q.y + q.y;
    const z2 = q.z + q.z;
    const xx = q.x * x2;
    const xy = q.x * y2;
    const xz = q.x * z2;
    const yy = q.y * y2;
    const yz = q.y * z2;
    const zz = q.z * z2;
    const wx = q.w * x2;
    const wy = q.w * y2;
    const wz = q.w * z2;
    this.rx = 1 - (yy + zz);
    this.ry = xy + wz;
    this.rz = xz - wy;
    this.ux = xy - wz;
    this.uy = 1 - (xx + zz);
    this.uz = yz + wx;
    this.bx = xz + wy;
    this.by = yz - wx;
    this.bz = 1 - (xx + yy);
    this.px = t.x;
    this.py = t.y;
    this.pz = t.z;
    this.cx = t.x + this.rx * com.x + this.ux * com.y + this.bx * com.z;
    this.cy = t.y + this.ry * com.x + this.uy * com.y + this.by * com.z;
    this.cz = t.z + this.rz * com.x + this.uz * com.y + this.bz * com.z;
    this.vx = v.x;
    this.vy = v.y;
    this.vz = v.z;
    this.wx = w.x;
    this.wy = w.y;
    this.wz = w.z;
    this.fx = this.fy = this.fz = 0;
    this.tx = this.ty = this.tz = 0;
  }

  /** Bow up, radians. */
  get pitch(): number {
    return Math.asin(Math.max(-1, Math.min(1, -this.by)));
  }

  /** Starboard side down, radians. */
  get roll(): number {
    return Math.atan2(-this.ry, this.uy);
  }

  /** Heading as a game yaw: 0 faces -Z, positive turns left. */
  get yaw(): number {
    return Math.atan2(this.bx, this.bz);
  }

  /** Speed along the hull's forward, right and up axes. */
  get forwardSpeed(): number {
    return -(this.vx * this.bx + this.vy * this.by + this.vz * this.bz);
  }

  get sideSpeed(): number {
    return this.vx * this.rx + this.vy * this.ry + this.vz * this.rz;
  }

  /** A force through the centre of mass, world space. */
  push(x: number, y: number, z: number): void {
    this.fx += x;
    this.fy += y;
    this.fz += z;
  }

  /** A force at a world point. */
  pushAt(x: number, y: number, z: number, px: number, py: number, pz: number): void {
    const ax = px - this.cx;
    const ay = py - this.cy;
    const az = pz - this.cz;
    this.fx += x;
    this.fy += y;
    this.fz += z;
    this.tx += ay * z - az * y;
    this.ty += az * x - ax * z;
    this.tz += ax * y - ay * x;
  }

  /** A torque given about the hull's own axes: +X pitches the bow up, +Y turns left, +Z rolls to port. */
  twist(pitch: number, yaw: number, roll: number): void {
    this.tx += this.rx * pitch + this.ux * yaw + this.bx * roll;
    this.ty += this.ry * pitch + this.uy * yaw + this.by * roll;
    this.tz += this.rz * pitch + this.uz * yaw + this.bz * roll;
  }

  /** Spin about the hull's own axes: (pitch rate, yaw rate, roll rate). */
  spin(out: { x: number; y: number; z: number }): void {
    out.x = this.wx * this.rx + this.wy * this.ry + this.wz * this.rz;
    out.y = this.wx * this.ux + this.wy * this.uy + this.wz * this.uz;
    out.z = this.wx * this.bx + this.wy * this.by + this.wz * this.bz;
  }

  /** World position of a point given in hull space. */
  point(x: number, y: number, z: number, out: { x: number; y: number; z: number }): void {
    out.x = this.px + this.rx * x + this.ux * y + this.bx * z;
    out.y = this.py + this.ry * x + this.uy * y + this.by * z;
    out.z = this.pz + this.rz * x + this.uz * y + this.bz * z;
  }

  /** Hand the step's force and torque to the body as impulses. */
  apply(body: RAPIER.RigidBody, dt: number): void {
    const i = this.impulse;
    i.x = this.fx * dt;
    i.y = this.fy * dt;
    i.z = this.fz * dt;
    body.applyImpulse(i, true);
    i.x = this.tx * dt;
    i.y = this.ty * dt;
    i.z = this.tz * dt;
    body.applyTorqueImpulse(i, true);
  }
}

/** The floating points of one hull and the forces the water puts on them. */
export class Buoyancy {
  readonly floats: FloatState[] = [];
  /** How much of the hull is in the water: 0 airborne, 1 floating at its marks. */
  wet = 0;
  /** The same for the forward and the after half. */
  bowWet = 0;
  sternWet = 0;
  /** Total push from the water this step, in craft weights. 1 holds the hull up. */
  load = 0;
  /** Hardest landing on the water this step: sinking speed in m/s of a point that just went under. */
  slam = 0;
  /** Index into `floats` of the point that slammed, or -1. */
  slamAt = -1;
  /** Hull-space centre of the weight-carrying points: the trim and bank offsets turn about it. */
  private midX = 0;
  private midZ = 0;
  private bowShare = 0;
  private sternShare = 0;
  private readonly weight: number;

  constructor(
    readonly mass: number,
    defs: readonly FloatDef[],
    options: BuoyancyOptions,
  ) {
    this.weight = mass * options.gravity;
    let total = 0;
    for (const d of defs) total += d.share ?? 0;
    if (total <= 0) throw new Error('A hull needs at least one float that carries weight');
    let mx = 0;
    let mz = 0;
    for (const d of defs) {
      const share = (d.share ?? 0) / total;
      mx += d.x * share;
      mz += d.z * share;
    }
    this.midX = mx;
    this.midZ = mz;
    for (const d of defs) {
      const share = (d.share ?? 0) / total;
      const rest = share > 0 ? Math.max(0.05, -d.y) : 0;
      // A point that carries weight is a spring that holds its share at its rest depth.
      const stiffness = share > 0 ? (share * this.weight) / rest : (d.reserve ?? 0) * this.weight;
      // Damping ratio against the spring the point is, so every hull bobs the same way whatever it weighs.
      const mass1 = share > 0 ? share * mass : (stiffness / options.gravity) * 0.25;
      const omega = Math.sqrt(stiffness / Math.max(1e-6, mass1));
      this.floats.push({
        x: d.x,
        y: d.y,
        z: d.z,
        stiffness,
        maxDepth: share > 0 ? rest + options.freeboard : 0.7,
        rest,
        damping: 2 * options.damping * omega * mass1,
        lift: share * this.weight * (d.lift ?? 1),
        liftShare: share > 0 ? (d.lift ?? 1) : 0,
        cap: share > 0 ? share * this.weight * 9 : stiffness * 0.7 + this.weight * 0.5,
        suction: share * this.weight * 0.5,
        share,
        prevDepth: 0,
        hasPrev: false,
        depth: -1,
        wx: 0,
        wy: 0,
        wz: 0,
      });
      if (share > 0) {
        if (d.z < mz) this.bowShare += share;
        else this.sternShare += share;
      }
    }
  }

  /** Forget last step's depths: after the hull was moved by hand, the jump is not a splash. */
  reset(): void {
    for (const f of this.floats) f.hasPrev = false;
  }

  /**
   * Add this step's buoyant forces to `hull`.
   *
   * `liftGain` stiffens the water under the hull with speed (planing): the hull rides higher.
   * `trim` and `bank` raise the water the hull feels at the bow and on the outside of a turn, in radians:
   * the hull settles nose up, or leaning into the turn, exactly as far as its floats allow, and the
   * offsets do nothing at all to a hull that is in the air.
   */
  solve(hull: Hull, water: WaterSampler, dt: number, liftGain = 0, trim = 0, bank = 0): void {
    let fy = 0;
    let tx = 0;
    let tz = 0;
    let wet = 0;
    let bow = 0;
    let stern = 0;
    this.slam = 0;
    this.slamAt = -1;
    const floats = this.floats;
    for (let i = 0; i < floats.length; i++) {
      const f = floats[i]!;
      const wx = hull.px + hull.rx * f.x + hull.ux * f.y + hull.bx * f.z;
      const wy = hull.py + hull.ry * f.x + hull.uy * f.y + hull.by * f.z;
      const wz = hull.pz + hull.rz * f.x + hull.uz * f.y + hull.bz * f.z;
      f.wx = wx;
      f.wy = wy;
      f.wz = wz;
      const surface = water(wx, wz);
      if (surface < NO_WATER) {
        f.depth = -1;
        f.hasPrev = false;
        continue;
      }
      const raw = surface - wy;
      // How fast this point is going under. It follows the point over the waves, so a crest running
      // into a fast hull counts as much as the hull dropping onto flat water.
      let rate = f.hasPrev ? (raw - f.prevDepth) / dt : 0;
      if (rate > 8) rate = 8;
      else if (rate < -8) rate = -8;
      if (f.hasPrev && f.prevDepth <= 0 && raw > 0 && rate > this.slam) {
        this.slam = rate;
        this.slamAt = i;
      }
      f.prevDepth = raw;
      f.hasPrev = true;
      const depth = f.share > 0 ? raw - (f.z - this.midZ) * trim - (f.x - this.midX) * bank : raw;
      f.depth = depth;
      if (depth <= 0) continue;
      const immersed = f.rest > 0 ? Math.min(1, depth / f.rest) : Math.min(1, depth / 0.25);
      let force = f.stiffness * Math.min(depth, f.maxDepth);
      force += f.lift * liftGain * immersed;
      // The lift makes the water under a fast hull a stiffer spring, and a stiffer spring needs more
      // damping to bob the same way: without it a planing hull bounces from wave to wave and never settles.
      // A hull on the plane only skims the water, so the damping is all there once a point is a little way in.
      const firm = Math.sqrt(1 + liftGain * f.liftShare);
      const grip = f.rest > 0 ? Math.min(1, depth / (f.rest * 0.25)) : Math.min(1, depth / 0.08);
      // Water resists a hull coming down onto it more than one lifting off.
      force += f.damping * firm * (rate > 0 ? rate : rate * 0.6) * grip;
      if (force > f.cap) force = f.cap;
      else if (force < -f.suction) force = -f.suction;
      fy += force;
      const ax = wx - hull.cx;
      const az = wz - hull.cz;
      tx -= az * force;
      tz += ax * force;
      if (f.share > 0) {
        wet += f.share * immersed;
        if (f.z < this.midZ) bow += f.share * immersed;
        else stern += f.share * immersed;
      }
    }
    hull.fy += fy;
    hull.tx += tx;
    hull.tz += tz;
    this.wet = wet;
    this.bowWet = this.bowShare > 0 ? bow / this.bowShare : wet;
    this.sternWet = this.sternShare > 0 ? stern / this.sternShare : wet;
    this.load = fy / this.weight;
  }
}
