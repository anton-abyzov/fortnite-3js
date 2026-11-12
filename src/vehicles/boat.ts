import { type Object3D, Quaternion, Vector3 } from 'three';
import type { Character } from '../character/character';
import { CG, GRAVITY, GROUP, groups, WORLD } from '../core/config';
import { angleDiff, clamp, clamp01, damp, dampAngle, lerp, moveToward, smoothstep, wrapAngle } from '../core/math';
import type { Game } from '../game';
import { Buoyancy, type FloatDef, Hull, type WaterSampler } from '../physics/buoyancy';
import { RAPIER } from '../physics/physics';
import { Cell, SEA_BED } from '../world/field';
import { type Seat, type SeatDef, Vehicle, type VehicleKind } from './vehicle';

/**
 * How a craft answers the throttle and the helm. Speeds are metres a second, accelerations m/s².
 */
export interface DriveSpec {
  /** Push off the line at full throttle. It fades by `fade` of itself on the way to top speed. */
  accel: number;
  fade: number;
  /** Speed held flat out on calm water, without the boost. */
  topSpeed: number;
  /** Extra thrust while the boost key is down, as a fraction. */
  boost: number;
  /** Thrust astern, as a fraction of ahead. */
  reverse: number;
  /** How quickly the engine follows the throttle, 1/s. */
  spool: number;
  /** The hull starts to climb onto its own bow wave at `planeFrom` and is skimming by `planeTo`. */
  planeFrom: number;
  planeTo: number;
  /** Water drag per (m/s)² while ploughing; the drag on the plane is worked out from the top speed. */
  dragSlow: number;
  /** Water drag per m/s, at any speed. */
  dragLinear: number;
  /** How much stiffer the water is under the hull at top speed: what lifts it onto the plane. */
  lift: number;
  /** Bow-up trim at the hump, radians, and the fraction of it left at top speed. */
  trim: number;
  trimFast: number;
  /** Turn rate with way on, rad/s, the speed that gives half of it, and how much the wash of the propeller adds from rest. */
  turn: number;
  turnHalf: number;
  wash: number;
  /** Hardest sideways pull a turn can have, m/s²: it widens the circle at speed. */
  carve: number;
  /** How quickly the hull takes up the turn rate asked of it, 1/s. */
  helm: number;
  /** Lean into a turn: radians per g of sideways pull, and the most it will lean. */
  bank: number;
  bankMax: number;
  /** Sideways drag: per m/s and per (m/s)². A keel grips; a jet ski's flat bottom slides. */
  grip: number;
  gripQuad: number;
}

/** Everything that makes one kind of craft: its size, weight, floats, seats and engine. */
export interface CraftSpec {
  kind: 'boat' | 'jetski';
  /** Which model it is, for tests and tools: 'boat-speed-h', 'jetski'. */
  model: string;
  /** What the prompt calls it: "Board runabout". */
  name: string;
  /** Word before the name in the prompt. */
  verb: string;
  length: number;
  beam: number;
  /** Keel below the waterline at rest, deck above it, and the top of what collides (windshield, handlebars). */
  draft: number;
  freeboard: number;
  height: number;
  mass: number;
  /** Radii of gyration in metres about the pitch, yaw and roll axes. */
  gyration: { pitch: number; yaw: number; roll: number };
  /** Height of the centre of mass above the waterline. Its fore-and-aft place follows the floats, so the hull sits level. */
  comY: number;
  floats: FloatDef[];
  /** Damping ratio of the bob. */
  damping: number;
  seats: SeatDef[];
  drive: DriveSpec;
  /** Reach of the prompt from the edge of the deck, metres. */
  reach: number;
  camera: { height: number; distance: number };
  /** Hull-space corners of the hull as it is: what shots, swimmers and anything else that looks for it finds. */
  shape: number[];
  /** Hull-space corners of the part that knocks against quays and other hulls. See `bumperShape`. */
  bumper: number[];
  /** Hull-space points effects come from: the stem at the waterline and the propeller or jet. */
  stem: { x: number; y: number; z: number };
  screw: { x: number; y: number; z: number };
}

/** Where a craft is tied up. */
export interface Berth {
  x: number;
  z: number;
  yaw: number;
  /** A place to stand on the dock beside it, when it has one. */
  dock: { x: number; y: number; z: number } | null;
}

/**
 * The sea as hulls feel it: the same swell the water shader draws, plus the ripple that the picture
 * shows only as a normal map, so that a boat in a calm canal still stirs at its mooring.
 */
export class Sea {
  /** Game time of the fixed step being worked out. */
  time = 0;

  constructor(private readonly game: Game) {}

  /** Surface height at a point, or -50 over land. */
  readonly height: WaterSampler = (x, z) => {
    const w = this.game.world;
    if (w.field.isLand(x, z)) return -50;
    return w.water.height(x, z, this.time) + this.chop(x, z, this.time);
  };

  /**
   * Ripples a few centimetres high: two crossing trains about three metres long, which make a hull
   * nod, and a longer one running across both, which rocks it whichever way it is moored.
   */
  chop(x: number, z: number, t: number): number {
    return 0.014 * Math.sin(1.9 * x + 0.7 * z - 3.1 * t) + 0.011 * Math.sin(-0.9 * x + 2.3 * z - 3.7 * t + 1.3) + 0.013 * Math.sin(0.62 * x - 0.66 * z - 2.3 * t + 0.4);
  }

  /**
   * Height of whatever is under a point, dry or not: sand, a quay, the bed. Decks on posts (piers,
   * bridges) count as the water under them.
   */
  floor(x: number, z: number): number {
    const f = this.game.world.field;
    if (Math.abs(x) > WORLD.half || Math.abs(z) > WORLD.half) return SEA_BED;
    const t = f.typeAt(x, z);
    return t === Cell.Pier || t === Cell.Bridge ? SEA_BED : f.heightAt(x, z);
  }

  /** Height of the bottom under a point: beach and islet sand where there is any, the flat bed elsewhere. */
  bed(x: number, z: number): number {
    const f = this.game.world.field;
    if (Math.abs(x) > WORLD.half || Math.abs(z) > WORLD.half) return SEA_BED;
    const t = f.typeAt(x, z);
    return t === Cell.Water || t === Cell.Sand ? f.heightAt(x, z) : SEA_BED;
  }
}

const UP = new Vector3(0, 1, 0);
const _a = new Vector3();
const _b = new Vector3();
const _q = new Quaternion();
const _q2 = new Quaternion();
const _spin = { x: 0, y: 0, z: 0 };
const _pt = { x: 0, y: 0, z: 0 };
const _zero = { x: 0, y: 0, z: 0 };
const _n = new Vector3();

let nextId = 1;

/**
 * A speedboat or a jet ski: a rigid body held up by floats on the wave field, pushed from the stern,
 * dragged far harder sideways than along the keel, and steered by the water running past it.
 */
export class Boat extends Vehicle {
  readonly kind: VehicleKind;
  readonly id = nextId++;
  /** Engine speed, 0..1, for the engine sound. Zero with nobody at the helm. */
  rpm = 0;
  /** 0 ploughing through the water, 1 skimming over it. */
  planing = 0;
  /** Bow up, and starboard side down, in radians. */
  pitch = 0;
  roll = 0;
  /** Far from anyone and at rest: the body sleeps and the hull only bobs in the picture. */
  asleep = true;
  berth: Berth | null;
  /** Where a character has to be near to come aboard: the nearest point of the keel line to them. */
  readonly boardPoint = new Vector3();
  readonly buoyancy: Buoyancy;
  /** The steering turned so far, -1..1, smoothed: models turn their handlebars with it. */
  helm = 0;
  private readonly hull = new Hull();
  private readonly com: { x: number; y: number; z: number };
  private readonly inertia: { pitch: number; yaw: number; roll: number };
  private readonly dragFast: number;
  /** Engine output, -1..1: it follows the throttle with a lag. */
  private power = 0;
  private trim = 0;
  private bank = 0;
  /** How much of the propeller's push reaches the water, 0..1. */
  private bite = 1;
  /** Where the view pointed last frame, and how long the mouse has left it alone. */
  private viewSeen = 0;
  private viewIdle = 0;
  private wakeDue = 0;
  private sprayDue = 0;
  private sinceSlap = 1;
  private restX: number;
  private restZ: number;
  private restYaw: number;
  /** How hard the bottom is on the sand, 0..1. */
  aground = 0;
  private readonly phase: number;
  /** Handlebars of a jet ski: they turn with the helm. */
  private readonly bars: Object3D | null;

  constructor(
    game: Game,
    private readonly sea: Sea,
    readonly spec: CraftSpec,
    visual: Object3D,
    berth: Berth,
  ) {
    super(game, spec.name);
    this.kind = spec.kind;
    this.berth = berth;
    this.restX = berth.x;
    this.restZ = berth.z;
    this.restYaw = berth.yaw;
    this.phase = (this.id * 2.399) % (Math.PI * 2);
    this.root.name = `${spec.kind}-${this.id}`;
    this.root.add(visual);
    this.bars = visual.getObjectByName('bars') ?? null;

    this.buoyancy = new Buoyancy(spec.mass, spec.floats, { damping: spec.damping, freeboard: spec.freeboard, gravity: GRAVITY });
    // The hull sits level when its weight is over the middle of the floats that carry it.
    let cz = 0;
    let total = 0;
    for (const f of spec.floats) {
      cz += (f.share ?? 0) * f.z;
      total += f.share ?? 0;
    }
    this.com = { x: 0, y: spec.comY, z: cz / total };
    const g = spec.gyration;
    this.inertia = { pitch: spec.mass * g.pitch * g.pitch, yaw: spec.mass * g.yaw * g.yaw, roll: spec.mass * g.roll * g.roll };
    const d = spec.drive;
    this.dragFast = Math.max(0.0005, (d.accel * (1 - d.fade) - d.dragLinear * d.topSpeed) / (d.topSpeed * d.topSpeed));

    const physics = game.physics;
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(berth.x, 0, berth.z)
      .setRotation(_q.setFromAxisAngle(UP, berth.yaw))
      .setAdditionalMassProperties(spec.mass, this.com, { x: this.inertia.pitch, y: this.inertia.yaw, z: this.inertia.roll }, { x: 0, y: 0, z: 0, w: 1 })
      .setAngularDamping(0.05)
      // No weight until the floats are switched on: nothing holds a hull up in the menu.
      .setGravityScale(0)
      .setCanSleep(true);
    this.body = physics.world.createRigidBody(desc);
    // Two shapes on one body. What collides is the bumper: full at the waterline and drawn in above it,
    // so a quay stops the hull near its own weight. The whole hull is there only to be found: by shots,
    // by someone swimming into it, by anything that asks what is in the way.
    const bumper = RAPIER.ColliderDesc.convexHull(new Float32Array(spec.bumper));
    const whole = RAPIER.ColliderDesc.convexHull(new Float32Array(spec.shape));
    if (!bumper || !whole) throw new Error(`No collision shape for ${spec.model}`);
    // The hull slides along quays and over sand; the beach slows it through `aground`, which the
    // engine can still pull against.
    bumper.setDensity(0).setCollisionGroups(CG.vehicle).setFriction(0.04).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min).setRestitution(0.12);
    whole.setDensity(0).setCollisionGroups(groups(GROUP.vehicle, GROUP.sensor));
    for (const desc of [bumper, whole]) physics.setOwner(physics.world.createCollider(desc, this.body), { kind: 'vehicle', surface: 'metal', ref: this });
    this.body.sleep();

    for (const def of spec.seats) this.seats.push({ def, occupant: null });
    this.maxHealth = this.health = spec.kind === 'boat' ? 260 : 120;
    this.cameraSubject.height = spec.camera.height;
    this.cameraSubject.distance = spec.camera.distance;
    this.register(spec.verb, spec.reach);
    // The prompt is offered from anywhere along the hull, not only near its middle.
    this.boardPoint.set(berth.x, spec.freeboard * 0.6, berth.z);
    this.interaction.position = this.boardPoint;
    this.pose(true);
  }

  /** True when the craft is still enough to be left to sleep. */
  get settled(): boolean {
    const v = this.body.linvel();
    return v.x * v.x + v.z * v.z < 0.2 && Math.abs(v.y) < 0.8;
  }

  /** Start simulating: put the body where the picture has the hull and switch the floats on. */
  wake(): void {
    if (!this.asleep) return;
    this.asleep = false;
    this.pose(true);
    const p = this.root.position;
    const body = this.body;
    body.setTranslation(p, true);
    body.setRotation(this.root.quaternion, true);
    body.setLinvel(_zero, true);
    body.setAngvel(_zero, true);
    body.setGravityScale(1, true);
    this.buoyancy.reset();
  }

  /** Stop simulating where it floats. */
  sleep(): void {
    if (this.asleep) return;
    this.asleep = true;
    const body = this.body;
    const t = body.translation();
    const r = body.rotation();
    this.restX = t.x;
    this.restZ = t.z;
    this.restYaw = Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y));
    body.setLinvel(_zero, false);
    body.setAngvel(_zero, false);
    body.setGravityScale(0, false);
    body.sleep();
    this.power = 0;
    this.rpm = 0;
    this.planing = 0;
    this.speed = 0;
  }

  /**
   * Move the prompt to the point of the deck nearest to someone standing or swimming at `p`: reach is
   * then measured from the hull's edge, the same from a pier at the bow, from the water alongside and
   * from a quay above (it is an easy hop down, so the point comes up to meet them).
   */
  aimBoardPoint(p: Vector3): void {
    const s = this.spec;
    const asleep = this.asleep;
    const at = asleep ? this.root.position : this.position;
    const yaw = asleep ? this.restYaw : this.yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const dx = p.x - at.x;
    const dz = p.z - at.z;
    const along = clamp(dx * fx + dz * fz, -s.length * 0.5 + 0.2, s.length * 0.5 - 0.2);
    // Right of the heading is (cos yaw, -sin yaw) = (-fz, fx).
    const across = clamp(dx * -fz + dz * fx, -s.beam * 0.5 + 0.1, s.beam * 0.5 - 0.1);
    const y = clamp(p.y + 1, at.y + s.freeboard * 0.6, at.y + s.freeboard + 2);
    this.boardPoint.set(at.x + fx * along - fz * across, y, at.z + fz * along + fx * across);
  }

  protected override onEnter(_c: Character, _seat: number): void {
    this.wake();
  }

  override fixedUpdate(dt: number): void {
    if (this.asleep) return;
    super.fixedUpdate(dt);
  }

  protected simulate(dt: number): void {
    const s = this.spec;
    const d = s.drive;
    const hull = this.hull;
    const body = this.body;
    const m = s.mass;
    hull.read(body, this.com);
    const vf = hull.forwardSpeed;
    const vs = hull.sideSpeed;
    const k = this.controls;
    const manned = this.driver !== null;

    // --- Engine ---
    const want = manned && !k.handbrake ? clamp(k.throttle, -1, 1) : 0;
    this.power = moveToward(this.power, want, d.spool * dt);
    const power = this.power;
    const pace = clamp01(Math.abs(vf) / d.topSpeed);
    const idle = manned ? 0.14 : 0;
    this.rpm = damp(this.rpm, idle + (1 - idle) * Math.abs(power) * (0.5 + 0.5 * pace) * (k.boost && power > 0 ? 1 : 0.94), 6, dt);

    // --- The water holding the hull up ---
    const ahead = Math.max(0, vf);
    const plane = smoothstep(d.planeFrom, d.planeTo, ahead);
    const buoy = this.buoyancy;
    // On the way up to the plane the hull climbs its own bow wave; once it is skimming the bow comes down again.
    const hump = smoothstep(d.planeFrom * 0.3, (d.planeFrom + d.planeTo) * 0.5, ahead) * (1 - (1 - d.trimFast) * smoothstep(d.planeTo, d.topSpeed, ahead));
    this.trim = damp(this.trim, d.trim * hump * (0.35 + 0.65 * clamp01(buoy.bowWet * 1.6)), 3.2, dt);
    hull.spin(_spin);
    // Sideways pull of the turn, in g. Turning left pulls to port and the hull leans to port.
    const pull = (_spin.y * vf) / GRAVITY;
    this.bank = damp(this.bank, clamp(-d.bank * pull, -d.bankMax, d.bankMax), 4.5, dt);
    const speedFrac = ahead / d.topSpeed;
    buoy.solve(hull, this.sea.height, dt, d.lift * speedFrac * speedFrac, this.trim, this.bank);
    // Everything the water does needs the hull to be in it.
    // A hull on the plane touches the water with a third of its bottom and is still fully "in" it.
    const inWater = clamp01(buoy.wet * 4);
    // A hull skipping from crest to crest is still planing: only a real flight lets it drop off.
    if (inWater > 0.15) this.planing = damp(this.planing, plane, 4, dt);
    else this.planing = damp(this.planing, 0, 0.7, dt);

    // --- Aground on the beach ---
    let aground = 0;
    for (const f of buoy.floats) {
      if (f.share <= 0) continue;
      const clear = f.wy - this.sea.bed(f.wx, f.wz);
      if (clear < 0.15) aground += f.share * clamp01((0.15 - clear) / 0.3);
    }
    this.aground = aground;
    // A hull resting on sand has about a quarter of its floats' weight on it.
    const beached = clamp01(aground * 4);
    // Which way the sand rises under the hull: more than zero with the bow on the higher ground.
    let rise = 0;
    if (beached > 0) {
      const hl = s.length * 0.5;
      hull.point(0, 0, -hl, _pt);
      rise = this.sea.floor(_pt.x, _pt.z);
      hull.point(0, 0, hl, _pt);
      rise -= this.sea.floor(_pt.x, _pt.z);
    }

    // --- Thrust, at the propeller ---
    let thrust = 0;
    if (power > 0) thrust = power * d.accel * (1 - d.fade * Math.min(1, ahead / d.topSpeed)) * (k.boost ? 1 + d.boost : 1);
    else if (power < 0) thrust = power * d.accel * d.reverse;
    if (thrust !== 0) {
      hull.point(s.screw.x, s.screw.y, s.screw.z, _pt);
      // A propeller in the air pushes nothing; one in the sand still drags the hull a little. On the plane
      // the stern rides high, but the propeller stays under: what counts is the water over it, not the hull's.
      const over = this.sea.height(_pt.x, _pt.z) - _pt.y;
      // On the sand the engine can only drag the hull back the way the water is: astern after running
      // up a beach bow first. The other way it just digs in.
      const toWater = thrust * rise < -0.02;
      this.bite = clamp01(Math.max(Math.min(over / 0.08 + 1, inWater), beached * (toWater ? 1 : 0.12)));
      const f = thrust * m * this.bite;
      hull.pushAt(-hull.bx * f, -hull.by * f, -hull.bz * f, _pt.x, _pt.y, _pt.z);
    }

    // --- Drag: little along the keel, a lot across it ---
    const k2 = vf >= 0 ? lerp(d.dragSlow, this.dragFast, plane) : d.dragSlow * 1.8;
    let along = -(d.dragLinear * vf + k2 * vf * Math.abs(vf));
    // Engine cut or the brake held: the hull falls off the plane and digs in.
    if (manned && k.handbrake) along -= 0.85 * vf + 0.5 * Math.sign(vf) * Math.min(1, Math.abs(vf));
    // Throttle shut: the propeller drags instead of pushing, and the hull loses its way in a few lengths.
    if (!manned) along -= 0.5 * vf;
    else if (Math.abs(power) < 0.15) along -= 0.3 * (1 - Math.abs(power) / 0.15) * vf;
    let across = -(d.grip * vs + d.gripQuad * vs * Math.abs(vs));
    if (!manned) across -= 0.5 * vs;
    along *= inWater * m;
    across *= inWater * m;
    // Never more than what would stop the hull in this step: drag cannot push it backwards.
    const stop = (m / dt) * 0.8;
    along = clamp(along, -stop * Math.abs(vf), stop * Math.abs(vf));
    across = clamp(across, -stop * Math.abs(vs), stop * Math.abs(vs));
    hull.push(-hull.bx * along + hull.rx * across, -hull.by * along + hull.ry * across, -hull.bz * along + hull.rz * across);

    if (beached > 0) {
      // Sand under the keel: a firm hold, and a drag that grows fast with speed while the hull ploughs
      // up the beach, so it stops within a couple of lengths of the water's edge. Sliding back down
      // toward the water the sand lets go far more easily, so the engine astern always gets it off.
      const sp = Math.hypot(hull.vx, hull.vz);
      if (sp > 1e-3) {
        const uphill = vf * rise > 0 ? 1 : 0.15;
        const decel = Math.min(beached * (1.2 + 2 * sp * uphill), 26, (sp / dt) * 0.8);
        hull.push((-hull.vx / sp) * decel * m, 0, (-hull.vz / sp) * decel * m);
      }
    }

    // --- Helm: the rudder needs water running past it, and the propeller wash gives a little from rest ---
    const steer = manned ? clamp(k.steer, -1, 1) : 0;
    this.helm = damp(this.helm, steer, 9, dt);
    const flow = Math.abs(vf) / (Math.abs(vf) + d.turnHalf);
    // Going astern the rudder leads the hull and answers lazily.
    const way = clamp(vf / 1.2, -0.6, 1);
    const wash = (d.wash * power * d.turnHalf) / (Math.abs(vf) + d.turnHalf);
    let turnRate = -this.helm * d.turn * (way * flow + wash);
    // At speed the hull can only carve as tight a circle as the water will hold it in.
    const carve = d.carve / Math.max(1, Math.abs(vf));
    turnRate = clamp(turnRate, -carve, carve);
    // Aground the hull can still be worked round on its keel, slowly.
    hull.twist(0, this.inertia.yaw * d.helm * (turnRate - _spin.y) * Math.max(inWater, beached * 0.6), 0);

    // --- Tied up, or left to drift ---
    const berth = this.berth;
    if (berth) {
      if (manned) {
        // Taken away from the dock: the lines are let go for good.
        if (Math.hypot(hull.px - berth.x, hull.pz - berth.z) > 3.5) this.berth = null;
      } else {
        // Mooring lines: a soft pull back to the berth and round to its heading.
        hull.push((berth.x - hull.px) * 2.4 * m - hull.vx * 2.2 * m, 0, (berth.z - hull.pz) * 2.4 * m - hull.vz * 2.2 * m);
        hull.ty += this.inertia.yaw * (wrapAngle(berth.yaw - hull.yaw) * 4 - hull.wy * 1.2);
      }
    }

    // --- Keeping it a boat ---
    if (inWater < 1) {
      // Thrown off a crest: the air and the crew's weight bring the hull back level and a little bow up,
      // so it comes down on its stern and not on its ear.
      const air = (1 - inWater) * (1 - beached);
      hull.twist(this.inertia.pitch * air * (5 * (0.07 - hull.pitch) - 2.2 * _spin.x), 0, this.inertia.roll * air * (7 * hull.roll - 3 * _spin.z));
    }
    if (hull.uy < 0.85) {
      // Heeled or pitched well past anything a turn or a wave asks for: the weight low in the hull brings
      // it back upright, gently at first and hard once it is on its side. Flat upside down it needs a kick.
      const lever = this.inertia.roll * 16 * smoothstep(0.85, 0.55, hull.uy);
      hull.tx += -hull.uz * lever;
      hull.tz += hull.ux * lever;
      if (hull.uy < -0.9) hull.twist(0, 0, lever * 0.3);
    }
    const edge = WORLD.bound - 30;
    if (Math.abs(hull.px) > edge) hull.fx -= Math.sign(hull.px) * (Math.abs(hull.px) - edge) * 3 * m;
    if (Math.abs(hull.pz) > edge) hull.fz -= Math.sign(hull.pz) * (Math.abs(hull.pz) - edge) * 3 * m;

    hull.apply(body, dt);
    this.effects(dt, hull, vf, inWater);
  }

  /** Spray from the bow, wake from the stern, and the slap of the hull on a wave. */
  private effects(dt: number, hull: Hull, vf: number, inWater: number): void {
    const game = this.game;
    const s = this.spec;
    const buoy = this.buoyancy;
    const speed = Math.abs(vf);
    this.sinceSlap += dt;
    if (buoy.slam > 1.1 && buoy.slamAt >= 0 && this.sinceSlap > 0.22) {
      const f = buoy.floats[buoy.slamAt]!;
      _pt.x = f.wx;
      _pt.y = f.wy + f.rest;
      _pt.z = f.wz;
      const hard = clamp01((buoy.slam - 1.1) / 3.5);
      // A hull coming down from the air makes a splash; a hull meeting a wave at speed slaps.
      if (buoy.slam > 3.4 && speed < 6) {
        game.sound('splash', _pt, 0.5 + 0.5 * hard);
        game.fx.burst('splash', _pt.x, _pt.y, _pt.z, { amount: 0.6 + hard * 1.4 });
      } else {
        game.sound('boat_slap', _pt, 0.35 + 0.65 * hard);
        game.fx.burst('spray', _pt.x, _pt.y, _pt.z, { dx: -hull.bx * speed * 0.3, dy: 2 + hard * 3, dz: -hull.bz * speed * 0.3, amount: 0.5 + hard * 1.5 });
      }
      this.sinceSlap = 0;
    }
    if (inWater < 0.2 || speed < 1.5) return;
    const pace = clamp01(speed / s.drive.topSpeed);
    // Wake: more puffs the faster it goes, from the propeller.
    this.wakeDue += dt * (4 + pace * 26) * clamp01(buoy.sternWet * 4);
    if (this.wakeDue >= 1) {
      this.wakeDue = Math.min(this.wakeDue - 1, 1);
      hull.point(s.screw.x, 0.02, s.screw.z, _pt);
      game.fx.burst('wake', _pt.x, this.sea.height(_pt.x, _pt.z) + 0.03, _pt.z, { dx: hull.bx * speed * 0.25, dy: 0.4 + pace * 1.2, dz: hull.bz * speed * 0.25, amount: 0.4 + pace * 1.2 });
    }
    // Spray: thrown out to both sides where the bow cuts the water, once the hull is moving fast.
    if (speed > s.drive.planeFrom * 0.8 && vf > 0) {
      this.sprayDue += dt * (2 + pace * 18) * clamp01(buoy.bowWet * 2 + 0.25);
      if (this.sprayDue >= 1) {
        this.sprayDue = Math.min(this.sprayDue - 1, 1);
        const side = this.id + Math.floor(this.sea.time * 30);
        const sx = side % 2 === 0 ? 1 : -1;
        // The cut moves aft along the hull as the bow lifts clear of the water.
        const cut = lerp(s.stem.z, s.stem.z * 0.35, this.planing);
        hull.point(sx * s.beam * 0.3, 0, cut, _pt);
        const out = 2.2 + pace * 3.5;
        game.fx.burst('spray', _pt.x, this.sea.height(_pt.x, _pt.z) + 0.05, _pt.z, {
          dx: hull.rx * sx * out - hull.bx * speed * 0.35,
          dy: 1.4 + pace * 2.6,
          dz: hull.rz * sx * out - hull.bz * speed * 0.35,
          amount: 0.4 + pace * 1.4,
        });
      }
    }
  }

  override postPhysics(dt: number): void {
    if (this.asleep) return;
    super.postPhysics(dt);
    const r = this.body.rotation();
    const fy = -2 * (r.y * r.z - r.w * r.x);
    const ry = 2 * (r.x * r.y + r.w * r.z);
    const uy = 1 - 2 * (r.x * r.x + r.z * r.z);
    this.pitch = Math.asin(clamp(fy, -1, 1));
    this.roll = Math.atan2(-ry, uy);
    // Safety net: nothing the water does should throw a hull into the sky or spin it like a top.
    const v = this.body.linvel();
    if (v.y > 9) {
      v.y = 9;
      this.body.setLinvel(v, true);
    }
    const w = this.body.angvel();
    const spin = Math.hypot(w.x, w.y, w.z);
    if (spin > 5) {
      const scale = 5 / spin;
      w.x *= scale;
      w.y *= scale;
      w.z *= scale;
      this.body.setAngvel(w, true);
    }
  }

  override frameUpdate(dt: number, alpha: number): void {
    if (this.asleep) {
      this.pose(false);
      return;
    }
    super.frameUpdate(dt, alpha);
  }

  protected override animate(dt: number): void {
    this.cameraSubject.fovKick = this.planing * 5 + (this.controls.boost && this.power > 0.5 ? 3 : 0);
    // A little, so the rider's hands stay close to the grips.
    if (this.bars) this.bars.rotation.y = -this.helm * 0.3;

    // The view swings round behind the craft by itself unless the mouse is steering it, as it does in a car.
    if (this.driver?.isPlayer) {
      const cam = this.game.camera;
      if (Math.abs(angleDiff(cam.yaw, this.viewSeen)) > 1e-4) this.viewIdle = 0;
      else this.viewIdle += dt;
      const fast = smoothstep(1.5, 10, Math.abs(this.speed));
      if (this.viewIdle > 0.8 && fast > 0) {
        cam.yaw = dampAngle(cam.yaw, this.yaw, 2.6 * fast, dt);
        cam.pitch = damp(cam.pitch, -0.17, 1.2 * fast, dt);
      }
      this.viewSeen = cam.yaw;
    }
  }

  /**
   * Where the hull floats when nothing is simulated: on the swell at its resting place, tipped to the
   * slope of the water. Cheap enough for every far-off craft, every frame.
   */
  private pose(force: boolean): void {
    const game = this.game;
    const x = this.restX;
    const z = this.restZ;
    if (!force) {
      const cam = game.engine.camera.position;
      const dx = x - cam.x;
      const dz = z - cam.z;
      if (dx * dx + dz * dz > 420 * 420) return;
    }
    const water = game.world.water;
    const t = force ? this.sea.time : water.now;
    const y = water.height(x, z, t) + this.sea.chop(x, z, t);
    water.normal(x, z, _n, t);
    // Tip from upright to the surface normal, then turn to the heading, with a slow sway of its own.
    _q.set(_n.z, 0, -_n.x, 1 + _n.y).normalize();
    _q2.setFromAxisAngle(UP, this.restYaw);
    _q.multiply(_q2);
    _q2.set(0, 0, Math.sin(0.5 * 0.022 * Math.sin(t * 3.2 + this.phase)), 1).normalize();
    _q.multiply(_q2);
    this.root.position.set(x, y, z);
    this.root.quaternion.copy(_q);
    this.position.copy(this.root.position);
    this.quaternion.copy(_q);
  }

  /**
   * Where to put someone who gets out: on a dock or a quay when one is within a step of the hull,
   * otherwise in the water alongside, where they swim.
   */
  override exitPoint(seat: Seat, out: Vector3): Vector3 {
    const s = this.spec;
    const physics = this.game.physics;
    const hb = s.beam * 0.5;
    const hl = s.length * 0.5;
    this.toWorld(seat.def.position, _a);
    const seatY = _a.y;
    const origin = this.toWorld(_b.set(0, 0, 0), _b);
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    let best = Infinity;
    // Rings of spots around the hull, the nearest ring first.
    for (const margin of [0.7, 1.4, 2.1, 2.8]) {
      const ex = hb + margin;
      const ez = hl + margin;
      const stepsX = Math.max(2, Math.round((ex * 2) / 0.9));
      const stepsZ = Math.max(2, Math.round((ez * 2) / 0.9));
      for (let side = 0; side < 4; side++) {
        const n = side < 2 ? stepsZ : stepsX;
        for (let i = 0; i <= n; i++) {
          const u = (i / n) * 2 - 1;
          const lx = side === 0 ? ex : side === 1 ? -ex : u * ex;
          const lz = side === 0 || side === 1 ? u * ez : side === 2 ? -ez : ez;
          // Hull space to the world with the heading only: a rolling hull does not move the dock.
          const wx = origin.x + lx * cos + lz * sin;
          const wz = origin.z - lx * sin + lz * cos;
          const cost = Math.hypot(wx - _a.x, wz - _a.z) + margin * 0.5;
          if (cost >= best) continue;
          const top = seatY + 3.4;
          const ground = physics.raycast(wx, top, wz, 0, -1, 0, 6.5, CG.querySolid, this.body);
          if (!ground || ground.normal.y < 0.7) continue;
          const kind = ground.owner?.kind;
          if (kind === 'vehicle' || kind === 'character') continue;
          const gy = ground.point.y;
          // Dry, and not a wall too high to climb out onto.
          const sea = this.game.env.waterHeight(wx, wz);
          if (gy < Math.max(sea, 0) + 0.3 || gy > seatY + 2.7 || gy < seatY - 2.5) continue;
          // Room to stand, and nothing solid between the hull and the spot above the edge.
          if (physics.raycast(wx, gy + 0.3, wz, 0, 1, 0, 1.7, CG.querySolid, this.body)) continue;
          const eye = Math.max(gy, seatY) + 1.1;
          const dx = wx - origin.x;
          const dz = wz - origin.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.05 && physics.raycast(origin.x, eye, origin.z, dx / dist, 0, dz / dist, dist, CG.querySolid, this.body)) continue;
          best = cost;
          out.set(wx, gy + 0.05, wz);
        }
      }
      if (best < Infinity) {
        // A step in from the edge, when the dock goes on that far: nobody climbs out to balance on the rim.
        const dx = out.x - origin.x;
        const dz = out.z - origin.z;
        const dist = Math.hypot(dx, dz) || 1;
        for (const step of [0.7, 0.45, 0.25]) {
          const wx = out.x + (dx / dist) * step;
          const wz = out.z + (dz / dist) * step;
          const ground = physics.raycast(wx, out.y + 1.2, wz, 0, -1, 0, 1.6, CG.querySolid, this.body);
          if (!ground || ground.normal.y < 0.7 || Math.abs(ground.point.y + 0.05 - out.y) > 0.15) continue;
          const kind = ground.owner?.kind;
          if (kind === 'vehicle' || kind === 'character') continue;
          if (physics.raycast(wx, out.y + 0.3, wz, 0, 1, 0, 1.7, CG.querySolid, this.body)) continue;
          out.x = wx;
          out.z = wz;
          break;
        }
        return out;
      }
    }
    // Over the side into the water, on this seat's side first.
    const first = seat.def.position.x >= 0 ? 1 : -1;
    for (const sx of [first, -first]) {
      const lx = sx * (hb + 0.75);
      const lz = clamp(seat.def.position.z, -hl * 0.6, hl * 0.6);
      const wx = origin.x + lx * cos + lz * sin;
      const wz = origin.z - lx * sin + lz * cos;
      const sea = this.game.env.waterHeight(wx, wz);
      if (sea < -40) continue;
      const dx = wx - origin.x;
      const dz = wz - origin.z;
      const dist = Math.hypot(dx, dz);
      if (physics.raycast(origin.x, sea + 0.4, origin.z, dx / dist, 0, dz / dist, dist + 0.35, CG.querySolid, this.body)) continue;
      const bed = physics.groundHeight(wx, sea + 0.5, wz, 8, SEA_BED);
      // Deep enough to swim: start afloat. Shallow: stand on the bottom.
      out.set(wx, Math.max(bed + 0.05, sea - 1.36), wz);
      return out;
    }
    return super.exitPoint(seat, out);
  }

  /** Plain numbers for tests and tools. */
  describe(): Record<string, unknown> {
    const p = this.asleep ? this.root.position : this.position;
    return {
      id: this.id,
      kind: this.kind,
      model: this.spec.model,
      name: this.name,
      x: p.x,
      y: p.y,
      z: p.z,
      yaw: this.asleep ? this.restYaw : this.yaw,
      pitch: this.pitch,
      roll: this.roll,
      speed: this.speed,
      planing: this.planing,
      rpm: this.rpm,
      occupied: this.occupied,
      asleep: this.asleep,
      moored: this.berth !== null,
      aground: this.aground,
      wet: this.buoyancy.wet,
      health: this.health,
      length: this.spec.length,
      beam: this.spec.beam,
      seats: this.seats.length,
      dock: this.berth?.dock ?? null,
    };
  }
}

/** Mirror a seat list: helper for specs that give seats in pairs. */
export function seat(x: number, y: number, z: number, yaw: number, clip: string, driver = false): SeatDef {
  // Stepping out goes over the nearer side.
  const side = x >= 0 ? 1 : -1;
  return { position: new Vector3(x, y, z), yaw, clip, exit: new Vector3(side * 2.4, 0, z), driver };
}

/** Float layout for a planing hull: pairs along the bilge, one under the bow, and dry points on the gunwales. */
export function hullFloats(length: number, beam: number, draft: number, freeboard: number, spread = 0.52): FloatDef[] {
  const hl = length * 0.5;
  const x = beam * 0.5 * spread;
  return [
    { x, y: -draft, z: hl * 0.78, share: 0.17, lift: 0.75 },
    { x: -x, y: -draft, z: hl * 0.78, share: 0.17, lift: 0.75 },
    { x, y: -draft, z: hl * 0.15, share: 0.18, lift: 1 },
    { x: -x, y: -draft, z: hl * 0.15, share: 0.18, lift: 1 },
    { x: x * 0.8, y: -draft * 0.9, z: -hl * 0.42, share: 0.115, lift: 1.35 },
    { x: -x * 0.8, y: -draft * 0.9, z: -hl * 0.42, share: 0.115, lift: 1.35 },
    { x: 0, y: -draft * 0.6, z: -hl * 0.82, share: 0.07, lift: 1.6 },
    // Dry at rest. They go under when the hull heels hard or buries its bow, and push it back.
    { x: beam * 0.46, y: freeboard * 0.7, z: hl * 0.2, reserve: 2.2 },
    { x: -beam * 0.46, y: freeboard * 0.7, z: hl * 0.2, reserve: 2.2 },
    { x: 0, y: freeboard * 0.55, z: -hl * 0.88, reserve: 1.6 },
  ];
}

/** Corners of a simple hull-shaped collider: narrow at the keel, full at the deck, pointed at the bow. */
export function hullShape(length: number, beam: number, draft: number, freeboard: number, height: number): number[] {
  const hl = length * 0.5;
  const hb = beam * 0.5;
  const p: number[] = [];
  const add = (x: number, y: number, z: number): void => {
    p.push(x, y, z);
    if (x !== 0) p.push(-x, y, z);
  };
  add(hb * 0.34, -draft, hl * 0.96);
  add(hb * 0.34, -draft, -hl * 0.45);
  add(0, -draft * 0.55, -hl * 0.86);
  add(hb * 0.96, 0, hl);
  add(hb * 0.96, 0, -hl * 0.3);
  add(0, 0.02, -hl * 0.97);
  add(hb, freeboard, hl);
  add(hb, freeboard, -hl * 0.35);
  add(hb * 0.52, freeboard, -hl * 0.8);
  add(0, freeboard, -hl);
  add(hb * 0.5, height, hl * 0.62);
  add(hb * 0.5, height, -hl * 0.3);
  return p;
}

/**
 * The same hull as it is given to the physics to collide with: a rubbing strake, upright and at its
 * fullest and longest in a band round the waterline, with everything above it drawn well in. A hull that
 * runs into a quay, or leans into a turn beside one, then meets it flat and low down, close to its own
 * weight, and is turned away. With its real flared sides it would be caught by the gunwale, levered up
 * the wall by its engine and rolled onto its side; with a sharp edge at the waterline it would ride up.
 */
export function bumperShape(length: number, beam: number, draft: number, freeboard: number, height: number): number[] {
  const hl = length * 0.5;
  const hb = beam * 0.5;
  const lo = -Math.min(0.12, draft * 0.5);
  const hi = Math.min(0.3, freeboard * 0.6);
  const p: number[] = [];
  const add = (x: number, y: number, z: number): void => {
    p.push(x, y, z);
    if (x !== 0) p.push(-x, y, z);
  };
  add(hb * 0.34, -draft, hl * 0.96);
  add(hb * 0.34, -draft, -hl * 0.45);
  add(0, -draft * 0.55, -hl * 0.86);
  for (const y of [lo, hi]) {
    add(hb, y, hl);
    add(hb, y, -hl * 0.3);
    add(0, y, -hl);
  }
  // Above the strake only a core is left, well inside the outline in every direction a hull can meet a
  // wall from (bow on at an angle is the one that matters): enough to stop it under a low deck.
  add(hb * 0.5, freeboard, hl * 0.8);
  add(hb * 0.5, freeboard, -hl * 0.2);
  add(0, freeboard, -hl * 0.6);
  add(hb * 0.4, height, hl * 0.6);
  add(hb * 0.4, height, -hl * 0.25);
  return p;
}
