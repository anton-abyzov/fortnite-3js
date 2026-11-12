import { Group, LOD, type Material, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import type { Character } from '../character/character';
import { CG, GRAVITY } from '../core/config';
import { angleDiff, clamp, clamp01, damp, dampAngle, moveToward, smoothstep, Spring } from '../core/math';
import type { Game } from '../game';
import { RAPIER, type Surface } from '../physics/physics';
import type { FxKind } from '../render/particles';
import type { CarKit, CarMaterials, CarModel, CarSpec, WheelDef } from './carModels';
import { Vehicle } from './vehicle';

/** 'dynamic' is a real rigid body on four springs. 'traffic' is carried along a lane by the traffic system. */
export type CarMode = 'dynamic' | 'traffic';

/** Suspension length (hardpoint to wheel centre) with the car standing still, and how far it moves. */
const REST = 0.36;
const BUMP = 0.13;
const DROOP = 0.15;
/** How fast a wheel can move up into the arch or drop out of it, m/s. Takes the edge off kerbs. */
const WHEEL_UP = 4.2;
const WHEEL_DOWN = 3.2;
const MAX_STEER = 0.6;
const GEARS = 5;
const REVERSE_SPEED = 9;
const IDLE = 0.13;
const SHIFT_TIME = 0.24;
const BRAKE_DECEL = 12.5;
/** Tyre forces act this far up from the road toward the centre of mass, which keeps the car from rolling over. */
const ROLL_LIFT = 0.38;
/** Slip angle of peak cornering grip, radians. */
const SLIP_PEAK = 0.15;
/** A locked or parked wheel is held to the spot it stopped on by a stiff spring (1/s² and 1/s per unit mass). */
const HOLD_K = 400;
const HOLD_C = 40;

const SURFACE_GRIP: Record<Surface, number> = { asphalt: 1, concrete: 1, sand: 0.62, grass: 0.78, wood: 0.9, metal: 0.82, tile: 0.92, water: 0.4, flesh: 0.8, glass: 0.7 };
const SURFACE_DRAG: Record<Surface, number> = { asphalt: 1, concrete: 1, sand: 6, grass: 3, wood: 1.2, metal: 1, tile: 1, water: 8, flesh: 1, glass: 1 };

/** Engine torque against revs (0..1 of the rev limit), as a share of the peak. Strongest in the middle. */
function torqueAt(x: number): number {
  const d = x - 0.62;
  return clamp(1 - 1.9 * d * d, 0.25, 1);
}

/** Cornering grip against slip angle: rises to a peak, then falls away a little so a slide can be held. */
function slipCurve(a: number): number {
  if (a < SLIP_PEAK) return a / SLIP_PEAK;
  return 1 - 0.2 * smoothstep(SLIP_PEAK * 1.4, 0.7, a);
}

interface Wheel {
  def: WheelDef;
  /** Where the suspension pushes on the body, vehicle space. */
  px: number;
  pz: number;
  /** Spring rate N/m, damping N·s/m in bump and rebound, and the length where the spring is slack. */
  k: number;
  cBump: number;
  cRebound: number;
  free: number;
  maxForce: number;
  /** Current length, hardpoint to wheel centre. */
  length: number;
  contact: boolean;
  /** Load on the tyre this step, N. */
  force: number;
  /** Contact point and normal, world space. */
  cx: number;
  cy: number;
  cz: number;
  nx: number;
  ny: number;
  nz: number;
  /** Distance the ground would let the wheel hang, before limits. */
  reach: number;
  surface: Surface;
  /** Held to a spot on the road: the spot, and whether there is one. */
  ax: number;
  ay: number;
  az: number;
  anchored: boolean;
  /** How fast the tyre is sliding over the road, m/s. */
  slide: number;
  /** Rolling speed for drawing, rad/s, and the angle it has turned. */
  omega: number;
  spin: number;
  mesh: Mesh;
}

export interface CarOptions {
  x: number;
  /** Road height under the car. */
  y: number;
  z: number;
  yaw: number;
  paint: number;
  /** Start asleep (a parked car) or in a lane (traffic). */
  mode?: CarMode;
}

const _q = new Quaternion();
const _v = new Vector3();
const _recline = new Quaternion();
const X_AXIS = new Vector3(1, 0, 0);
/** A knock smaller than this, in m/s, does not wake a parked car. */
const NUDGE = 0.9;
/** The most the character controller knocks a car by when someone runs into it, m/s. */
const SHOVE = 3.2;
const ZERO = { x: 0, y: 0, z: 0 };
const _imp = { x: 0, y: 0, z: 0 };
const _tor = { x: 0, y: 0, z: 0 };

let nextId = 1;

/**
 * A car: a rigid body held up by four suspension rays, with an engine and gearbox, tyres that grip
 * until they slide, brakes and a handbrake.
 *
 * The origin of the body is on the road under the middle of the car, so `position` is where the car
 * stands. Forward is local -Z.
 */
export class Car extends Vehicle {
  readonly kind = 'car' as const;
  readonly id = nextId++;
  readonly model: CarModel;
  readonly spec: CarSpec;
  mode: CarMode = 'dynamic';
  /** Engine speed, 0..1 of the rev limit. For the engine sound. */
  rpm = 0;
  /** -1 reverse, 0 engine off, 1..5. */
  gear = 0;
  /** Slip angle of the rear tyres, radians. Past about 0.25 the tail is out. */
  slip = 0;
  /** How far each spring is pushed in past its resting length, metres: front left, front right, rear left, rear right. */
  readonly suspension = [0, 0, 0, 0];
  speedKmh = 0;
  /** Lean of the body as drawn, radians: nose up is positive pitch, right side up is positive roll. */
  pitch = 0;
  roll = 0;
  /** Front wheel angle, radians, positive to the right. */
  steerAngle = 0;
  /** In water too deep to drive through. The engine does not come back. */
  flooded = false;
  /** Hardest knock taken so far, as a change of speed in m/s. */
  lastImpact = 0;
  braking = false;
  /** Seconds a lane-following car must stand still because someone is pressed against it. */
  blocked = 0;
  /**
   * The most that has been seen since `resetPeaks()`: rear slip angle, difference in compression
   * between two wheels, and each wheel's compression. Kept by the simulation itself so that a check
   * reads what happened on every step, not what it happened to catch.
   */
  readonly peaks = { slip: 0, spread: 0, wheels: [0, 0, 0, 0] };
  /** Called when a lane-following car turns into a free body: it was hit, shot at or taken. */
  onLeaveTraffic: ((car: Car, why: string) => void) | null = null;
  /** Speed and acceleration given by the traffic system while it carries the car. */
  trafficSpeed = 0;
  private trafficAccel = 0;
  private trafficLateral = 0;
  private readonly wheels: Wheel[] = [];
  private readonly mass: number;
  private readonly comY: number;
  private readonly comZ: number;
  private readonly wheelbase: number;
  private readonly hard: number;
  private readonly gearSpeeds: number[] = [];
  private readonly powerK: number;
  private readonly dragK: number;
  private readonly arbFront: number;
  private readonly arbRear: number;
  private readonly inertia: number;
  private steer = 0;
  private dir = 1;
  private shift = 0;
  private asleep = false;
  /** Where it was left, to put it back when someone leans on it. */
  private parkedAt = { x: 0, y: 0, z: 0 };
  private parkedFacing = { x: 0, y: 0, z: 0, w: 1 };
  private stillTime = 0;
  private simulated = false;
  private vx0 = 0;
  private vy0 = 0;
  private vz0 = 0;
  private ex = 0;
  private ey = 0;
  private ez = 0;
  private crashQuiet = 0;
  private glassQuiet = 0;
  private skidClock = 0;
  private smokeClock = 0;
  private upsideDown = 0;
  private wasWet = false;
  private sinkTime = 0;
  private readonly tilt = new Group();
  private readonly bodyMesh: Mesh;
  private readonly bodyMats: Material[];
  private readonly farMats: Material[];
  private readonly paint: Material;
  private readonly rollSpring = new Spring(0, 0.11);
  private readonly pitchSpring = new Spring(0, 0.1);
  private accelFwd = 0;
  private accelSide = 0;
  private lastVf = 0;
  private camSeen = 0;
  private camIdle = 9;
  private dummy: Object3D | null = null;

  constructor(
    game: Game,
    readonly kit: CarKit,
    private readonly materials: CarMaterials,
    options: CarOptions,
  ) {
    super(game, kit.spec.name);
    const spec = kit.spec;
    this.spec = spec;
    this.model = spec.model;
    this.mass = spec.mass;
    this.maxHealth = spec.health;
    this.health = spec.health;

    const fl = kit.wheels[0]!;
    const rl = kit.wheels[2]!;
    this.wheelbase = rl.z - fl.z;
    // A little nose-heavy, like a car with its engine in front.
    this.comZ = (fl.z + rl.z) / 2 - 0.04 * this.wheelbase;
    this.comY = spec.comHeight;
    this.hard = fl.radius + REST;

    // Mass and inertia of a box the size of the car. Roll is made heavier than that: a car this short
    // and tall would otherwise flick from side to side.
    const w = kit.width;
    const h = kit.height * 0.8;
    const l = kit.length;
    const m = spec.mass;
    const inertia = { x: (m / 12) * (h * h + l * l), y: (m / 12) * (w * w + l * l), z: (m / 12) * (w * w + h * h) * 1.5 };
    this.inertia = inertia.y;
    const yawQ = _q.setFromAxisAngle(new Vector3(0, 1, 0), options.yaw);
    const physics = game.physics;
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(options.x, options.y, options.z)
      .setRotation({ x: yawQ.x, y: yawQ.y, z: yawQ.z, w: yawQ.w })
      .setLinearDamping(0.01)
      .setAngularDamping(0.5)
      .setCanSleep(true)
      .setAdditionalMassProperties(m, { x: 0, y: this.comY, z: this.comZ }, inertia, { x: 0, y: 0, z: 0, w: 1 });
    this.body = physics.world.createRigidBody(desc);
    for (const box of [kit.lower, kit.upper]) {
      const c = RAPIER.ColliderDesc.cuboid(box.hx, box.hy, box.hz).setTranslation(box.cx, box.cy, box.cz).setCollisionGroups(CG.vehicle).setFriction(0.3).setRestitution(0.1).setDensity(0);
      physics.setOwner(physics.world.createCollider(c, this.body), { kind: 'vehicle', surface: 'metal', ref: this });
    }

    // Gearbox: evenly stepped from first gear up to a top gear that runs out just past the top speed.
    const last = spec.topSpeed * 1.06;
    for (let g = 0; g < GEARS; g++) this.gearSpeeds.push(spec.firstGear * Math.pow(last / spec.firstGear, g / (GEARS - 1)));
    // Wheel force in a gear is powerK / (that gear's speed) at the torque peak, which puts the power
    // peak near nine tenths of the rev range.
    this.powerK = (spec.power * 1000) / 0.766;
    const rolling = 0.012 * m * GRAVITY;
    const topForce = (this.powerK / last) * torqueAt(1 / 1.06);
    this.dragK = Math.max(0.2, (topForce - rolling) / (spec.topSpeed * spec.topSpeed));

    // Springs: each carries its share of the weight at the resting length.
    const omega = Math.PI * 2 * spec.ride;
    const sag = GRAVITY / (omega * omega);
    const frontShare = (rl.z - this.comZ) / this.wheelbase;
    this.root.name = `car-${this.id}-${spec.model}`;
    const full = new Group();
    full.add(this.tilt);
    for (const def of kit.wheels) {
      const load = (m * GRAVITY * (def.front ? frontShare : 1 - frontShare)) / 2;
      const k = load / sag;
      const sprung = load / GRAVITY;
      const crit = 2 * Math.sqrt(k * sprung);
      const mesh = new Mesh(def.left ? kit.wheelLeft : kit.wheelRight, materials.wheel);
      mesh.position.set(def.x, def.y, def.z);
      mesh.rotation.order = 'YXZ';
      mesh.receiveShadow = true;
      full.add(mesh);
      this.wheels.push({
        def,
        // The tyre is wider than its hub: the contact is out toward the edge of the car.
        px: def.x + Math.sign(def.x) * 0.2,
        pz: def.z,
        k,
        cBump: crit * 0.5,
        cRebound: crit * 0.8,
        free: REST + sag,
        maxForce: load * 6,
        length: REST,
        contact: true,
        force: load,
        cx: 0,
        cy: 0,
        cz: 0,
        nx: 0,
        ny: 1,
        nz: 0,
        reach: REST,
        surface: 'asphalt',
        ax: 0,
        ay: 0,
        az: 0,
        anchored: false,
        slide: 0,
        omega: 0,
        spin: 0,
        mesh,
      });
    }
    this.arbFront = this.wheels[0]!.k * 0.55;
    this.arbRear = this.wheels[2]!.k * 0.3;

    // Drawn in full up close, as a bare shell from down the street, and not at all from across the bay.
    const paint = spec.paints.length > 0 ? materials.paint(options.paint) : materials.trim;
    this.paint = paint;
    this.bodyMats = [paint, materials.trim, materials.glass, materials.head, materials.tail];
    this.farMats = [paint, materials.trim];
    this.bodyMesh = new Mesh(kit.body, this.bodyMats);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.tilt.add(this.bodyMesh);
    const far = new Mesh(kit.bodyFar, this.farMats);
    const lod = new LOD();
    lod.addLevel(full, 0);
    lod.addLevel(far, 130);
    lod.addLevel(new Object3D(), 480);
    this.root.add(lod);

    for (const s of kit.seats) {
      this.seats.push({
        def: {
          position: new Vector3(s.x, s.y, s.z),
          yaw: 0,
          clip: s.driver ? 'Driving_Loop' : 'Sitting_Idle_Loop',
          exit: new Vector3(Math.sign(s.x) * (kit.width / 2 + 0.75), 0, s.hipZ),
          driver: s.driver,
        },
        occupant: null,
      });
    }
    this.cameraSubject.height = 0.95 + kit.height * 0.48;
    this.cameraSubject.distance = 4.4 + kit.length * 0.45;
    this.register('Drive', kit.length / 2 + 1.4);
    // A parked car is never stepped, so nothing else would work out which way it faces.
    this.yaw = options.yaw;
    if (options.mode === 'traffic') this.enterTraffic();
    else this.park();
  }

  /** Parked, engine off, costing nothing until something touches it or someone gets in. */
  get sleeping(): boolean {
    return this.asleep;
  }

  get wheelContacts(): boolean[] {
    return this.wheels.map((w) => w.contact);
  }

  /** Put the body to sleep where it stands. */
  park(): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.parkedAt = { x: t.x, y: t.y, z: t.z };
    this.parkedFacing = { x: r.x, y: r.y, z: r.z, w: r.w };
    this.body.resetForces(false);
    this.body.resetTorques(false);
    this.body.sleep();
    this.asleep = true;
    this.stillTime = 0;
    this.rpm = 0;
    this.gear = 0;
  }

  /** Move the car somewhere else, standing on its wheels. */
  placeAt(x: number, y: number, z: number, yaw: number): void {
    _q.setFromAxisAngle(_v.set(0, 1, 0), yaw);
    const rot = { x: _q.x, y: _q.y, z: _q.z, w: _q.w };
    this.body.setTranslation({ x, y, z }, true);
    this.body.setRotation(rot, true);
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    if (this.mode === 'traffic') {
      this.body.setNextKinematicTranslation({ x, y, z });
      this.body.setNextKinematicRotation(rot);
    }
    for (const w of this.wheels) {
      w.length = REST;
      w.anchored = false;
    }
    this.asleep = false;
    this.simulated = false;
    this.resetPose();
  }

  resetPeaks(): void {
    this.peaks.slip = 0;
    this.peaks.spread = 0;
    this.peaks.wheels.fill(0);
  }

  /** Good as new: for a car that is put back into traffic. */
  repair(): void {
    this.health = this.maxHealth;
    this.destroyed = false;
    this.flooded = false;
    this.sinkTime = 0;
    this.lastImpact = 0;
    this.bodyMats[0] = this.paint;
    this.farMats[0] = this.paint;
  }

  // ---- Traffic ---------------------------------------------------------------------------------

  /** Hand the car to the traffic system: it stops being simulated and goes where it is put. */
  enterTraffic(): void {
    this.mode = 'traffic';
    this.asleep = false;
    this.body.resetForces(false);
    this.body.resetTorques(false);
    this.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    this.gear = 1;
    this.dir = 1;
    for (const w of this.wheels) {
      w.length = REST;
      w.contact = true;
      w.slide = 0;
      w.anchored = false;
    }
  }

  /** Become an ordinary car again, keeping the speed it had. */
  leaveTraffic(why: string): void {
    if (this.mode !== 'traffic') return;
    this.mode = 'dynamic';
    const r = this.body.rotation();
    _v.set(0, 0, -1).applyQuaternion(_q.set(r.x, r.y, r.z, r.w));
    this.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    this.body.setLinvel({ x: _v.x * this.trafficSpeed, y: _v.y * this.trafficSpeed, z: _v.z * this.trafficSpeed }, true);
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    this.simulated = false;
    this.stillTime = 0;
    this.setDummy(false);
    const cb = this.onLeaveTraffic;
    if (cb) cb(this, why);
  }

  /** Where the traffic system wants the car after this step, and how it is moving, for the wheels and the lean. */
  setTrafficPose(x: number, y: number, z: number, q: Quaternion, speed: number, steer: number, accel: number, lateral: number): void {
    this.body.setNextKinematicTranslation({ x, y, z });
    this.body.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    this.trafficSpeed = speed;
    this.steerAngle = steer;
    this.trafficAccel = accel;
    this.trafficLateral = lateral;
    this.braking = accel < -0.8 || speed < 0.2;
    const x1 = speed / this.gearSpeeds[this.gear - 1]!;
    if (this.gear < GEARS && x1 > 0.6) this.gear++;
    else if (this.gear > 1 && speed / this.gearSpeeds[this.gear - 2]! < 0.4) this.gear--;
    this.rpm = damp(this.rpm, Math.max(IDLE, speed / this.gearSpeeds[this.gear - 1]!), 8, 1 / 60);
  }

  /** Someone at the wheel of a traffic car, seen through the glass. */
  setDummy(on: boolean, make?: () => Object3D): void {
    if (on && !this.dummy && make) {
      const seat = this.kit.seats[0]!;
      this.dummy = make();
      this.dummy.position.set(seat.x, seat.y, seat.z);
      this.dummy.rotation.x = seat.recline;
      this.tilt.add(this.dummy);
    }
    if (this.dummy) this.dummy.visible = on;
  }

  // ---- Driving ---------------------------------------------------------------------------------

  override damage(amount: number, by: Character | null = null): void {
    if (amount > 0) this.leaveTraffic('hit');
    this.body.wakeUp();
    super.damage(amount, by);
  }

  protected override onEnter(_c: Character, _seat: number): void {
    this.leaveTraffic('taken');
    this.body.wakeUp();
    this.asleep = false;
    this.camIdle = 9;
    this.game.sound('car_door', this.position);
  }

  protected override onExit(_c: Character): void {
    this.game.sound('car_door', this.position);
    this.stillTime = 0;
  }

  protected override onDestroyed(_by: Character | null): void {
    this.rpm = 0;
    this.gear = 0;
    if (this.flooded) return;
    const p = this.position;
    this.game.fx.burst('explosion', p.x, p.y + 0.8, p.z, { amount: 0.6 });
    this.game.fx.burst('smoke', p.x, p.y + 1, p.z, { amount: 2 });
    this.game.sound('crash', p);
    this.game.sound('glass_break', p);
    // What is left is a burnt shell.
    this.bodyMats[0] = this.materials.wreck;
    this.farMats[0] = this.materials.wreck;
  }

  protected simulate(dt: number): void {
    this.crashQuiet -= dt;
    this.glassQuiet -= dt;
    if (this.mode === 'traffic') return;
    const body = this.body;
    const driver = this.driver;
    if (!driver && !this.occupied && body.isSleeping()) {
      this.asleep = true;
      this.simulated = false;
      return;
    }
    if (this.asleep) {
      // Just woken by a knock. Nothing left over from before it slept may push it.
      body.resetForces(false);
      body.resetTorques(false);
    }
    this.asleep = false;
    const game = this.game;
    const physics = game.physics;
    const t = body.translation();
    const q = body.rotation();
    const lv = body.linvel();
    const av = body.angvel();

    // The car's axes in the world: right, up and back (forward is the opposite of back).
    const rx = 1 - 2 * (q.y * q.y + q.z * q.z);
    const ry = 2 * (q.x * q.y + q.z * q.w);
    const rz = 2 * (q.x * q.z - q.y * q.w);
    const ux = 2 * (q.x * q.y - q.z * q.w);
    const uy = 1 - 2 * (q.x * q.x + q.z * q.z);
    const uz = 2 * (q.y * q.z + q.x * q.w);
    const bx = 2 * (q.x * q.z + q.y * q.w);
    const by = 2 * (q.y * q.z - q.x * q.w);
    const bz = 1 - 2 * (q.x * q.x + q.y * q.y);
    const fx = -bx;
    const fy = -by;
    const fz = -bz;
    const cx = t.x + ux * this.comY + bx * this.comZ;
    const cy = t.y + uy * this.comY + by * this.comZ;
    const cz = t.z + uz * this.comY + bz * this.comZ;
    const vf = lv.x * fx + lv.y * fy + lv.z * fz;
    const vAbs = Math.abs(vf);
    const m = this.mass;

    // ---- What the driver asks for.
    const k = this.controls;
    const dead = this.destroyed || this.flooded;
    let throttle = dead || !driver ? 0 : clamp(k.throttle, -1, 1);
    let brake = driver ? clamp01(k.brake) : 0;
    // Pulling against the way the car is rolling is the brake; from a near stop it selects the other direction.
    if (this.dir > 0 && throttle < -0.05) {
      if (vf > 0.5) {
        brake = Math.max(brake, -throttle);
        throttle = 0;
      } else this.dir = -1;
    } else if (this.dir < 0 && throttle > 0.05) {
      if (vf < -0.5) {
        brake = Math.max(brake, throttle);
        throttle = 0;
      } else this.dir = 1;
    }
    const demand = this.dir > 0 ? Math.max(0, throttle) : Math.max(0, -throttle);
    const hand = k.handbrake || !driver;
    // With nobody asking for anything a slow car is held still, so it never creeps down a camber.
    const hold = !driver || (demand < 0.02 && vAbs < 0.7) || (brake > 0.1 && vAbs < 0.45);
    this.braking = brake > 0.05 || (hand && !!driver);

    // ---- Engine and gearbox.
    this.shift = Math.max(0, this.shift - dt);
    let top = REVERSE_SPEED;
    if (!driver) {
      this.gear = 0;
    } else if (this.dir < 0) {
      this.gear = -1;
    } else {
      let g = Math.max(1, this.gear);
      if (this.shift <= 0) {
        if (g < GEARS && vAbs / this.gearSpeeds[g - 1]! > 0.93 && demand > 0.05) {
          g++;
          this.shift = SHIFT_TIME;
        } else if (g > 1) {
          const below = vAbs / this.gearSpeeds[g - 2]!;
          if (below < 0.64 || (demand > 0.9 && below < 0.82)) {
            g--;
            this.shift = SHIFT_TIME * 0.7;
          }
        }
      }
      this.gear = g;
      top = this.gearSpeeds[g - 1]!;
    }
    const revs = vAbs / top;
    // Moving off, a slipping clutch holds the revs up where the engine pulls.
    const x = Math.max(revs, demand > 0.02 ? Math.min(0.34 + 0.3 * demand, 0.62) : IDLE);
    let engine = 0;
    if (driver && !dead && demand > 0) {
      const gearTop = this.dir < 0 ? this.gearSpeeds[0]! * 1.25 : top;
      engine = demand * (this.powerK / gearTop) * torqueAt(x);
      // Rev limiter, and the gap in the pull while a gear goes in.
      if (revs > 1) engine *= clamp01(1 - (revs - 1) / 0.05);
      if (this.shift > 0) engine *= 0.12;
      if (k.boost) engine *= 1.22;
      if (this.health < this.maxHealth * 0.35) engine *= 0.6;
    }
    this.rpm = damp(this.rpm, driver && !dead ? clamp(x, IDLE, 1.02) : 0, this.shift > 0 ? 9 : 16, dt);
    const drive = this.spec.drive;
    const frontDrive = drive === 'fwd' ? 0.5 : drive === 'awd' ? 0.2 : 0;
    const rearDrive = drive === 'rwd' ? 0.5 : drive === 'awd' ? 0.3 : 0;
    // Lifting off, the engine drags on the driven wheels.
    const engineBrake = driver && demand < 0.02 && !dead ? m * 1.7 * (0.4 + 0.6 * Math.min(1, revs)) : 0;

    // ---- Steering: quick at a crawl, and no more lock at speed than the tyres can use.
    const want = driver ? clamp(k.steer, -1, 1) : 0;
    const into = Math.abs(want) > Math.abs(this.steer) && want * this.steer >= 0;
    this.steer = moveToward(this.steer, want, (into ? 3.2 : 5.5) * dt);
    const usable = Math.atan((this.wheelbase * 1.25 * this.spec.grip * GRAVITY) / Math.max(1, vf * vf)) + 0.02;
    this.steerAngle = this.steer * Math.min(MAX_STEER, usable);
    const sinS = Math.sin(this.steerAngle);
    const cosS = Math.cos(this.steerAngle);

    // ---- Suspension: a ray down from each corner.
    let Fx = 0;
    let Fy = 0;
    let Fz = 0;
    let Tx = 0;
    let Ty = 0;
    let Tz = 0;
    const wheels = this.wheels;
    let grounded = 0;
    for (let i = 0; i < 4; i++) {
      const w = wheels[i]!;
      const hx = t.x + rx * w.px + ux * this.hard + bx * w.pz;
      const hy = t.y + ry * w.px + uy * this.hard + by * w.pz;
      const hz = t.z + rz * w.px + uz * this.hard + bz * w.pz;
      const r = w.def.radius;
      const maxLen = REST + DROOP;
      const minLen = REST - BUMP;
      const hit = physics.raycast(hx, hy, hz, -ux, -uy, -uz, maxLen + r + 0.06, CG.querySolid, body);
      let target = maxLen;
      w.reach = maxLen + 1;
      if (hit && hit.normal.x * ux + hit.normal.y * uy + hit.normal.z * uz > 0.4) {
        w.reach = hit.distance - r;
        target = clamp(w.reach, minLen, maxLen);
        w.cx = hit.point.x;
        w.cy = hit.point.y;
        w.cz = hit.point.z;
        w.nx = hit.normal.x;
        w.ny = hit.normal.y;
        w.nz = hit.normal.z;
        w.surface = hit.owner?.surface ?? 'asphalt';
      }
      // The wheel follows the ground at a limited rate, which rounds off a kerb.
      if (target < w.length) w.length = Math.max(target, w.length - WHEEL_UP * dt);
      else w.length = Math.min(target, w.length + WHEEL_DOWN * dt);
      w.contact = w.reach <= w.length + 0.03;
      w.force = 0;
      if (w.contact) {
        grounded++;
        // The damper works on how fast this corner of the body is moving toward the road.
        const ox = hx - cx;
        const oy = hy - cy;
        const oz = hz - cz;
        const vx = lv.x + av.y * oz - av.z * oy;
        const vy = lv.y + av.z * ox - av.x * oz;
        const vz = lv.z + av.x * oy - av.y * ox;
        const closing = -(vx * ux + vy * uy + vz * uz);
        let f = w.k * (w.free - w.length) + (closing > 0 ? w.cBump : w.cRebound) * closing;
        // Bump stop: the last of the travel is much stiffer.
        const past = minLen - w.reach;
        if (past > 0) f += w.k * 5 * past;
        w.force = clamp(f, 0, w.maxForce);
      }
      this.suspension[i] = REST - w.length;
    }
    // Anti-roll bars: take load off the side that hangs and put it on the side that is squashed.
    for (let a = 0; a < 2; a++) {
      const l = wheels[a * 2]!;
      const r = wheels[a * 2 + 1]!;
      const d = (l.length - r.length) * (a === 0 ? this.arbFront : this.arbRear);
      if (l.contact) l.force = Math.max(0, l.force - d);
      if (r.contact) r.force = Math.max(0, r.force + d);
    }

    // ---- Tyres.
    const share = m / 4;
    const brakeTotal = m * BRAKE_DECEL * brake;
    let rearSide = 0;
    let rearLong = 0;
    let rearCount = 0;
    this.skidClock -= dt;
    const skidNow = this.skidClock <= 0;
    for (let i = 0; i < 4; i++) {
      const w = wheels[i]!;
      const front = w.def.front;
      w.slide = 0;
      if (!w.contact || w.force <= 0) {
        w.anchored = false;
        // In the air a driven wheel spins up and the rest keep turning.
        w.omega = damp(w.omega, vf / w.def.radius + (engine > 0 && (front ? frontDrive : rearDrive) > 0 ? this.dir * 25 : 0), 4, dt);
        continue;
      }
      const N = w.force;
      // Push the body up along the ground's normal.
      const sx = w.nx * N;
      const sy = w.ny * N;
      const sz = w.nz * N;
      let ox = w.cx - cx;
      let oy = w.cy - cy;
      let oz = w.cz - cz;
      Fx += sx;
      Fy += sy;
      Fz += sz;
      Tx += oy * sz - oz * sy;
      Ty += oz * sx - ox * sz;
      Tz += ox * sy - oy * sx;

      // Which way the wheel points, laid onto the road.
      let wx = front ? fx * cosS + rx * sinS : fx;
      let wy = front ? fy * cosS + ry * sinS : fy;
      let wz = front ? fz * cosS + rz * sinS : fz;
      const dn = wx * w.nx + wy * w.ny + wz * w.nz;
      wx -= w.nx * dn;
      wy -= w.ny * dn;
      wz -= w.nz * dn;
      const wl = Math.hypot(wx, wy, wz) || 1;
      wx /= wl;
      wy /= wl;
      wz /= wl;
      const ax = wy * w.nz - wz * w.ny;
      const ay = wz * w.nx - wx * w.nz;
      const az = wx * w.ny - wy * w.nx;
      // How the contact patch is moving over the road.
      const vx = lv.x + av.y * oz - av.z * oy;
      const vy = lv.y + av.z * ox - av.x * oz;
      const vz = lv.z + av.x * oy - av.y * ox;
      const vl = vx * wx + vy * wy + vz * wz;
      const vs = vx * ax + vy * ay + vz * az;
      if (!front) {
        rearSide += vs;
        rearLong += vl;
        rearCount++;
      }
      const limit = this.spec.grip * SURFACE_GRIP[w.surface] * N;
      let fl = 0;
      let fs = 0;
      const locked = hold || (hand && !front);
      if (locked) {
        const sp = Math.hypot(vl, vs);
        if (w.anchored && sp < 1) {
          // Standing: hold the wheel to the spot it stopped on. Past what the tyre can hold, the spot moves.
          const dx = w.cx - w.ax;
          const dy = w.cy - w.ay;
          const dz = w.cz - w.az;
          fl = -share * (HOLD_K * (dx * wx + dy * wy + dz * wz) + HOLD_C * vl);
          fs = -share * (HOLD_K * (dx * ax + dy * ay + dz * az) + HOLD_C * vs);
          const mag = Math.hypot(fl, fs);
          if (mag > limit) {
            fl *= limit / mag;
            fs *= limit / mag;
            w.ax = w.cx;
            w.ay = w.cy;
            w.az = w.cz;
          }
        } else {
          // Sliding with the wheel locked: plain friction against the way it slides, no steering in it.
          const f = Math.min(limit * 0.82, (0.7 * share * sp) / dt);
          if (sp > 1e-4) {
            fl = (-f * vl) / sp;
            fs = (-f * vs) / sp;
          }
          w.ax = w.cx;
          w.ay = w.cy;
          w.az = w.cz;
          w.anchored = true;
          w.slide = sp;
        }
        w.omega = 0;
      } else {
        w.anchored = false;
        // Cornering force from the slip angle, never more than would stop the sideways motion this step.
        const alpha = Math.atan2(Math.abs(vs), Math.abs(vl) + 0.6);
        fs = -Math.sign(vs) * Math.min(limit * slipCurve(alpha), (0.7 * share * Math.abs(vs)) / dt);
        const part = front ? frontDrive : rearDrive;
        fl = this.dir * engine * part;
        const stop = brakeTotal * (front ? 0.31 : 0.19) + engineBrake * part + 0.012 * SURFACE_DRAG[w.surface] * N;
        fl -= Math.sign(vl) * Math.min(stop, (0.7 * share * Math.abs(vl)) / dt);
        // Grip is shared between going and turning.
        const mag = Math.hypot(fl, fs);
        let spinning = 0;
        if (mag > limit) {
          if (Math.abs(fl) > limit) spinning = this.dir * Math.min(14, (Math.abs(fl) - limit) / (m * 0.5));
          fl *= limit / mag;
          fs *= limit / mag;
          w.slide = Math.max(Math.abs(vs), Math.abs(spinning));
        } else if (alpha > SLIP_PEAK * 1.3) w.slide = Math.abs(vs);
        w.omega = (vl + spinning) / w.def.radius;
      }
      // Tyre forces act part of the way up toward the centre of mass.
      const lift = ROLL_LIFT * Math.max(0, -(ox * ux + oy * uy + oz * uz));
      ox += ux * lift;
      oy += uy * lift;
      oz += uz * lift;
      const tx = wx * fl + ax * fs;
      const ty = wy * fl + ay * fs;
      const tz = wz * fl + az * fs;
      Fx += tx;
      Fy += ty;
      Fz += tz;
      Tx += oy * tz - oz * ty;
      Ty += oz * tx - ox * tz;
      Tz += ox * ty - oy * tx;

      if (skidNow && w.slide > 3) {
        const kind: FxKind = w.surface === 'sand' || w.surface === 'grass' ? 'dust' : w.slide > 7 ? 'smoke' : 'skid';
        game.fx.burst(kind, w.cx, w.cy + 0.03, w.cz, { dx: -fx, dy: 0.2, dz: -fz, amount: clamp(w.slide / 10, 0.3, 1.5) });
      }
    }
    if (skidNow) this.skidClock = 0.07;
    this.slip = rearCount > 0 && Math.hypot(lv.x, lv.z) > 2 ? Math.atan2(rearSide / rearCount, Math.max(1.5, Math.abs(rearLong / rearCount))) : 0;
    const peaks = this.peaks;
    const sus = this.suspension;
    peaks.slip = Math.max(peaks.slip, Math.abs(this.slip));
    peaks.spread = Math.max(peaks.spread, Math.max(sus[0]!, sus[1]!, sus[2]!, sus[3]!) - Math.min(sus[0]!, sus[1]!, sus[2]!, sus[3]!));
    for (let i = 0; i < 4; i++) peaks.wheels[i] = Math.max(peaks.wheels[i]!, sus[i]!);

    // ---- Air.
    const sp = Math.hypot(lv.x, lv.y, lv.z);
    Fx -= this.dragK * sp * lv.x;
    Fy -= this.dragK * sp * lv.y;
    Fz -= this.dragK * sp * lv.z;
    if (grounded > 0) {
      // A little downforce keeps a fast car planted.
      const down = 0.0012 * m * vf * vf;
      Fx -= ux * down;
      Fy -= uy * down;
      Fz -= uz * down;
    }

    // ---- Water: drag while wading, then the engine drowns and the car goes down.
    const water = game.env.waterHeight(t.x, t.z);
    const depth = water - t.y;
    const wet = depth > 0.12;
    if (wet) {
      const sub = clamp01(depth / 1.3);
      if (!this.wasWet && sp > 3) {
        game.fx.burst('splash', t.x, water, t.z, { amount: clamp(sp / 8, 0.5, 2) });
        game.sound('splash', t);
      }
      if (depth > 0.8 && !this.flooded) this.flood();
      if (this.flooded) this.sinkTime += dt;
      // It floats for a moment, then fills.
      const buoy = this.flooded ? Math.max(0.3, 0.95 - this.sinkTime * 0.22) : 0.6;
      Fy += m * GRAVITY * sub * buoy;
      const dragW = m * 2.2 * sub;
      Fx -= lv.x * dragW;
      Fy -= lv.y * dragW * 1.5;
      Fz -= lv.z * dragW;
      const spin = this.inertia * 2.5 * sub;
      Tx -= av.x * spin;
      Ty -= av.y * spin;
      Tz -= av.z * spin;
    }
    this.wasWet = wet;

    // ---- On its roof and going nowhere: roll it back onto its wheels.
    if (uy < 0.25 && sp < 1.5 && !wet) {
      this.upsideDown += dt;
      if (this.upsideDown > 1.6) {
        // Turn the car's up toward the sky: about the axis that does it, or its own length when dead on its roof.
        let tx = -uz;
        let tz = ux;
        const tl = Math.hypot(tx, tz);
        if (tl < 0.2) {
          tx = bx;
          tz = bz;
        } else {
          tx /= tl;
          tz /= tl;
        }
        const turn = this.inertia * 5;
        Tx += tx * turn;
        Tz += tz * turn;
        Fy += m * GRAVITY * 0.6;
      }
    } else this.upsideDown = 0;

    // As forces, not one kick at the start of the step: the solver then spreads them over its
    // sub-steps the way it spreads gravity, and a car at rest reads a velocity of zero.
    _imp.x = Fx;
    _imp.y = Fy;
    _imp.z = Fz;
    _tor.x = Tx;
    _tor.y = Ty;
    _tor.z = Tz;
    body.resetForces(false);
    body.resetTorques(false);
    body.addForce(_imp, true);
    body.addTorque(_tor, true);
    // What the velocity should be after this step if nothing is hit. See `postPhysics`.
    this.vx0 = lv.x;
    this.vy0 = lv.y;
    this.vz0 = lv.z;
    this.ex = (Fx / m) * dt;
    this.ey = (Fy / m - GRAVITY) * dt;
    this.ez = (Fz / m) * dt;
    this.simulated = true;

    // Felt acceleration, for the lean of the body.
    this.accelFwd = damp(this.accelFwd, (vf - this.lastVf) / dt, 12, dt);
    this.lastVf = vf;
    this.accelSide = damp(this.accelSide, -vf * (av.x * ux + av.y * uy + av.z * uz), 12, dt);

    // A damaged engine smokes.
    if (this.health < this.maxHealth * 0.4 && !this.flooded) {
      this.smokeClock -= dt;
      if (this.smokeClock <= 0) {
        this.smokeClock = this.destroyed ? 0.45 : 0.22;
        const hz = this.kit.front + 0.7;
        game.fx.burst('smoke', t.x + bx * hz + ux, t.y + by * hz + uy, t.z + bz * hz + uz, { dy: 1, amount: this.destroyed ? 1.4 : 0.6 });
      }
    }

    // The driver's horn.
    if (driver?.isPlayer && game.input.pressed('KeyH')) game.sound('horn', t);

    // Left alone and at rest: go to sleep.
    if (!this.occupied) {
      const still = sp < 0.05 && Math.hypot(av.x, av.y, av.z) < 0.05 && grounded >= 3;
      this.stillTime = still ? this.stillTime + dt : 0;
      if (this.stillTime > 1.2) this.park();
    }
  }

  /** Deep water: everyone out, and the car is finished. */
  private flood(): void {
    this.flooded = true;
    const p = this.body.translation();
    this.game.fx.burst('splash', p.x, p.y + 0.6, p.z, { amount: 2 });
    this.game.sound('splash', p);
    this.damage(this.health + 1);
  }

  override postPhysics(dt: number): void {
    if (this.mode === 'traffic') {
      super.postPhysics(dt);
      this.speed = this.trafficSpeed;
      this.speedKmh = this.speed * 3.6;
      return;
    }
    if (this.asleep) {
      // Something ran into a parked car during this step: it starts from rest, so all of its speed is the knock.
      if (this.body.isSleeping()) return;
      const v = this.body.linvel();
      const knock = Math.hypot(v.x, v.y, v.z);
      if (knock < NUDGE || (knock < SHOVE && this.personAgainst())) {
        // A touch, or someone walking into it. A parked car with its handbrake on does not roll for
        // that: put it back where it stood and let it sleep on.
        const body = this.body;
        body.setTranslation(this.parkedAt, false);
        body.setRotation(this.parkedFacing, false);
        body.setLinvel(ZERO, false);
        body.setAngvel(ZERO, false);
        body.sleep();
        return;
      }
      this.asleep = false;
      super.postPhysics(dt);
      if (knock > 1.4) this.onImpact(knock, v.x, v.y, v.z);
      return;
    }
    super.postPhysics(dt);
    this.speedKmh = this.speed * 3.6;
    if (!this.simulated) return;
    this.simulated = false;
    // The tyres, springs, air and gravity account for a known change of velocity. Anything more came
    // from hitting something.
    const v = this.body.linvel();
    const ix = v.x - this.vx0 - this.ex;
    const iy = v.y - this.vy0 - this.ey;
    const iz = v.z - this.vz0 - this.ez;
    const knock = Math.hypot(ix, iy, iz);
    if (knock > 0.05 && knock < SHOVE && this.personAgainst()) {
      // The character controller leans on things far harder than a person can. Nobody shoves a car about on foot.
      this.body.setLinvel({ x: v.x - ix, y: v.y - iy, z: v.z - iz }, false);
    } else if (knock > 1.4) this.onImpact(knock, ix, iy, iz);
    else if (knock > 0.02 && !this.occupied && Math.hypot(v.x, v.z) < 0.6) {
      // Standing empty with the handbrake on, and nudged: most of a small shove goes nowhere.
      this.body.setLinvel({ x: v.x - ix * 0.85, y: v.y, z: v.z - iz * 0.85 }, false);
    }
  }

  /** True when someone on foot is up against the car. */
  private personAgainst(): boolean {
    const t = this.body.translation();
    const reach = this.kit.length / 2 + 0.9;
    for (const c of this.game.characters) {
      if (!c.alive || c.vehicle) continue;
      const p = c.position;
      if (Math.abs(p.x - t.x) < reach && Math.abs(p.z - t.z) < reach && Math.abs(p.y - t.y) < 2.6) return true;
    }
    return false;
  }

  /** `knock` is the sudden change of speed in m/s; (ix, iy, iz) is the way the car was pushed. */
  private onImpact(knock: number, ix: number, iy: number, iz: number): void {
    const game = this.game;
    const p = this.body.translation();
    this.lastImpact = Math.max(this.lastImpact, knock);
    // The blow landed on the side the push came from.
    const reach = this.kit.length * 0.45;
    const hx = p.x - (ix / knock) * reach;
    const hy = p.y + 0.6;
    const hz = p.z - (iz / knock) * reach;
    if (this.crashQuiet <= 0) {
      this.crashQuiet = 0.3;
      game.sound('crash', { x: hx, y: hy, z: hz }, clamp(knock / 9, 0.25, 1));
      game.fx.burst('spark', hx, hy, hz, { dx: ix, dy: iy + 1, dz: iz, amount: clamp(knock / 6, 0.4, 2) });
    }
    if (knock > 7.5 && this.glassQuiet <= 0) {
      this.glassQuiet = 3;
      game.sound('glass_break', { x: hx, y: hy + 0.5, z: hz });
      game.fx.burst('glass', hx, hy + 0.5, hz, { dx: ix, dy: 1, dz: iz, amount: 1 });
    }
    const player = game.player;
    if (player && player.vehicle === this) game.camera.shake(clamp(knock / 18, 0.08, 0.7));
    // A hard enough crash hurts the people inside.
    if (knock > 10) {
      _v.set(ix, 0, iz).normalize();
      for (const s of this.seats) if (s.occupant) game.hurt(s.occupant, (knock - 10) * 3, { by: null, cause: 'vehicle', dir: _v });
    }
    const dmg = (knock - 2.5) * 4.2;
    if (dmg > 0) this.damage(dmg);
  }

  // ---- Drawing ---------------------------------------------------------------------------------

  override frameUpdate(dt: number, alpha: number): void {
    // A sleeping car has not moved.
    if (this.asleep && !this.occupied) return;
    super.frameUpdate(dt, alpha);
  }

  /** Put the drawn car where the body is, at once (after a teleport). */
  private resetPose(): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.position.set(t.x, t.y, t.z);
    this.quaternion.set(r.x, r.y, r.z, r.w);
    this.root.position.copy(this.position);
    this.root.quaternion.copy(this.quaternion);
    // The base class keeps its own copies for interpolation; two steps bring both to the new place.
    super.postPhysics(0);
    super.postPhysics(0);
  }

  protected override animate(dt: number): void {
    const traffic = this.mode === 'traffic';
    const speed = this.speed;
    // Wheels: up and down on their springs, turning with the road, steering at the front.
    for (const w of this.wheels) {
      const omega = traffic ? speed / w.def.radius : w.omega;
      w.spin = (w.spin - omega * dt) % (Math.PI * 2);
      const y = this.hard - w.length;
      w.mesh.position.y = damp(w.mesh.position.y, y, 40, dt);
      w.mesh.rotation.set(w.spin, w.def.front ? -this.steerAngle : 0, 0);
    }
    // The body leans on top of what the springs do: back under power, forward on the brakes, out of a turn.
    const fwd = traffic ? this.trafficAccel : this.accelFwd;
    const side = traffic ? this.trafficLateral : this.accelSide;
    const lean = this.destroyed ? 0 : 1;
    const pitch = this.pitchSpring.update(clamp(fwd * 0.0042, -0.06, 0.045) * lean, dt);
    const roll = this.rollSpring.update(clamp(side * 0.005, -0.075, 0.075) * lean, dt);
    this.tilt.rotation.set(pitch, 0, roll);
    // The body's own attitude from the physics, plus the drawn lean.
    _v.set(0, 0, -1).applyQuaternion(this.quaternion);
    this.pitch = Math.asin(clamp(_v.y, -1, 1)) + pitch;
    _v.set(1, 0, 0).applyQuaternion(this.quaternion);
    this.roll = Math.asin(clamp(_v.y, -1, 1)) + roll;

    const tail = this.braking && !this.destroyed ? this.materials.brake : this.materials.tail;
    if (this.bodyMats[4] !== tail) this.bodyMats[4] = tail;

    // Seats lean back, more in the low cars, so heads stay under the roof.
    const seats = this.kit.seats;
    for (let i = 0; i < this.seats.length; i++) {
      const c = this.seats[i]!.occupant;
      if (!c) continue;
      c.seatQuat.multiply(_recline.setFromAxisAngle(X_AXIS, seats[i]!.recline));
    }

    // The view swings round behind the car by itself unless the mouse is steering it.
    const driver = this.driver;
    if (driver?.isPlayer) {
      const cam = this.game.camera;
      if (Math.abs(angleDiff(cam.yaw, this.camSeen)) > 1e-4) this.camIdle = 0;
      else this.camIdle += dt;
      const fast = smoothstep(1.5, 10, Math.abs(speed));
      if (this.camIdle > 0.8 && fast > 0) {
        cam.yaw = dampAngle(cam.yaw, this.yaw, 2.6 * fast, dt);
        cam.pitch = damp(cam.pitch, -0.17, 1.2 * fast, dt);
      }
      this.camSeen = cam.yaw;
      this.cameraSubject.fovKick = damp(this.cameraSubject.fovKick, clamp(Math.abs(speed) * 0.22, 0, 11), 3, dt);
    }
  }

  /** A plain description for tests and the debug overlay. */
  describe(): Record<string, unknown> {
    const t = this.body.translation();
    const r = this.body.rotation();
    return {
      id: this.id,
      model: this.model,
      name: this.name,
      mode: this.mode,
      x: t.x,
      y: t.y,
      z: t.z,
      // From the body itself: a parked car that has never been stepped has no heading worked out yet.
      yaw: Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)),
      speed: this.speed,
      speedKmh: this.speed * 3.6,
      asleep: this.asleep,
      occupied: this.occupied,
      health: this.health,
      destroyed: this.destroyed,
    };
  }
}
