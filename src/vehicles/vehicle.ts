import { Group, Quaternion, Vector3 } from 'three';
import type { Character } from '../character/character';
import { CG } from '../core/config';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { CameraSubject } from '../gameplay/camera';
import type { Interactable } from '../gameplay/interactions';
import { RAPIER } from '../physics/physics';

export type VehicleKind = 'car' | 'boat' | 'jetski';

/** What the driver asks for. Whoever drives (player or bot) writes these before each fixed step. */
export interface VehicleControls {
  /** -1 reverse or brake, 1 full ahead. */
  throttle: number;
  /** -1 left, 1 right. */
  steer: number;
  /** 0..1 foot brake. */
  brake: number;
  handbrake: boolean;
  boost: boolean;
}

export interface SeatDef {
  /** Where the occupant's root goes (the floor point under the hips), in vehicle space. */
  position: Vector3;
  /** Facing relative to the vehicle's forward, radians. */
  yaw: number;
  /** Animation clip to sit in: 'Driving_Loop', 'Sitting_Idle_Loop'... */
  clip: string;
  /** Where the occupant stands after getting out, in vehicle space. The base class checks it is free. */
  exit: Vector3;
  driver: boolean;
}

export interface Seat {
  def: SeatDef;
  occupant: Character | null;
}

const _p = new Vector3();
const _q = new Quaternion();
const _v = new Vector3();
const _from = new Vector3();
const _yaw = new Quaternion();
const UP = new Vector3(0, 1, 0);

/**
 * Base for everything that can be driven. Forward is the vehicle's local -Z, right is +X, up is +Y,
 * the same as a character facing yaw 0.
 *
 * A subclass builds `body` (a dynamic Rapier body with colliders in `CG.vehicle`), the visuals under
 * `root`, and `seats`, calls `register()`, and implements `simulate()`. The base class handles seats,
 * getting in and out, the interaction prompt, render interpolation and the chase camera subject.
 */
export abstract class Vehicle implements GameSystem {
  abstract readonly kind: VehicleKind;
  /** Visual root, placed from the body every frame. */
  readonly root = new Group();
  body!: RAPIER.RigidBody;
  readonly seats: Seat[] = [];
  readonly controls: VehicleControls = { throttle: 0, steer: 0, brake: 0, handbrake: false, boost: false };
  health = 100;
  maxHealth = 100;
  destroyed = false;
  /** Signed speed along the vehicle's forward, m/s. Updated after each physics step. */
  speed = 0;
  /** Interpolated position and rotation for drawing. */
  readonly position = new Vector3();
  readonly quaternion = new Quaternion();
  /** Heading as a game yaw (0 faces -Z, positive turns left). */
  yaw = 0;
  readonly cameraSubject: CameraSubject;
  interaction!: Interactable;
  /**
   * Someone in another browser drives this (a friends room): the body is kinematic and follows
   * `remoteTarget`, which the network sets, instead of being simulated here.
   */
  remoteDriven = false;
  readonly remoteTarget = { x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1 };
  private readonly prevPos = new Vector3();
  private readonly currPos = new Vector3();
  private readonly prevQuat = new Quaternion();
  private readonly currQuat = new Quaternion();

  constructor(
    protected readonly game: Game,
    readonly name: string,
  ) {
    this.cameraSubject = { position: this.position, height: 1.6, distance: 6.5, shoulder: 0, aim: 0, fovKick: 0, followRate: 8 };
  }

  /** Call once the body, visuals and seats exist. */
  protected register(prompt = 'Drive', reach = 2.8): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.currPos.set(t.x, t.y, t.z);
    this.prevPos.copy(this.currPos);
    this.currQuat.set(r.x, r.y, r.z, r.w);
    this.prevQuat.copy(this.currQuat);
    this.position.copy(this.currPos);
    this.quaternion.copy(this.currQuat);
    this.root.position.copy(this.position);
    this.root.quaternion.copy(this.quaternion);
    this.cameraSubject.exclude = this.body;
    this.game.engine.scene.add(this.root);
    this.interaction = this.game.interactions.add({
      kind: 'vehicle',
      position: this.position,
      radius: reach,
      label: () => (this.freeSeat(true) >= 0 ? `${prompt} ${this.name}` : `Ride in ${this.name}`),
      available: (c) => !this.destroyed && !c.vehicle && this.freeSeat(false) >= 0,
      use: (c) => {
        this.enter(c);
      },
      ref: this,
    });
    this.game.vehicles.push(this);
    this.game.addSystem(this);
  }

  get driver(): Character | null {
    for (const s of this.seats) if (s.def.driver) return s.occupant;
    return null;
  }

  get occupied(): boolean {
    return this.seats.some((s) => s.occupant);
  }

  /** Index of a free seat, the driver's first. With `driverOnly`, only the driver's seat counts. */
  freeSeat(driverOnly: boolean): number {
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i]!;
      if (!s.occupant && s.def.driver) return i;
    }
    if (driverOnly) return -1;
    for (let i = 0; i < this.seats.length; i++) if (!this.seats[i]!.occupant) return i;
    return -1;
  }

  /** Seat a character. Returns false when there is no room. */
  enter(c: Character, seat = this.freeSeat(false)): boolean {
    if (this.destroyed || seat < 0 || c.vehicle) return false;
    const s = this.seats[seat];
    if (!s || s.occupant) return false;
    s.occupant = c;
    c.sitIn(this, seat, s.def.clip);
    this.placeOccupant(s);
    this.onEnter(c, seat);
    this.game.events.emit('seat', { who: c, vehicle: this, seat });
    return true;
  }

  /** Put a character back on their feet beside the vehicle. */
  exit(c: Character): void {
    const seat = this.seats.find((s) => s.occupant === c);
    if (!seat) return;
    seat.occupant = null;
    const spot = this.exitPoint(seat, _p);
    c.standUp(spot.x, spot.y, spot.z, this.yaw + seat.def.yaw);
    // Leave with the vehicle's speed, so stepping off a moving boat does not stop you dead.
    const lv = this.body.linvel();
    c.motor.velocity.set(lv.x, Math.max(0, lv.y), lv.z);
    if (seat.def.driver) {
      this.controls.throttle = 0;
      this.controls.steer = 0;
      this.controls.boost = false;
    }
    this.onExit(c);
    this.game.events.emit('seat', { who: c, vehicle: this, seat: -1 });
  }

  /** A free spot to stand on next to a seat: the seat's own side first, then the others, then the roof. */
  exitPoint(seat: Seat, out: Vector3): Vector3 {
    const e = seat.def.exit;
    const candidates: [number, number, number][] = [
      [e.x, e.y, e.z],
      [-e.x, e.y, e.z],
      [e.x, e.y, e.z + 2.2],
      [-e.x, e.y, e.z + 2.2],
      [e.x * 1.6, e.y, e.z],
      [0, e.y, e.z + 3.4],
    ];
    const physics = this.game.physics;
    _from.copy(seat.def.position).applyQuaternion(this.currQuat).add(this.currPos);
    _from.y += 0.9;
    for (const [x, y, z] of candidates) {
      out.set(x, y, z).applyQuaternion(_yaw.setFromAxisAngle(UP, this.yaw)).add(this.currPos);
      // Nothing solid between the seat and the spot, at chest height.
      _v.set(out.x - _from.x, 0, out.z - _from.z);
      const d = _v.length();
      if (d > 0.01) {
        _v.multiplyScalar(1 / d);
        if (physics.raycast(_from.x, _from.y, _from.z, _v.x, 0, _v.z, d + 0.3, CG.querySolid, this.body)) continue;
      }
      // Something to stand on (or water to drop into) below it.
      const ground = physics.raycast(out.x, _from.y + 0.6, out.z, 0, -1, 0, 6, CG.querySolid, this.body);
      const water = this.game.env.waterHeight(out.x, out.z);
      if (ground && ground.point.y > _from.y - 3.2) {
        out.y = Math.max(ground.point.y + 0.05, water > ground.point.y ? water - 1.3 : -Infinity);
        return out;
      }
      if (water > -40) {
        out.y = water - 1.3;
        return out;
      }
    }
    // Boxed in on every side: climb out on top.
    out.copy(this.currPos);
    out.y += 2.2;
    return out;
  }

  /** Take damage. At zero the vehicle is destroyed and everyone is thrown out. */
  damage(amount: number, by: Character | null = null): void {
    if (this.destroyed) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.destroyed = true;
      for (const s of this.seats) if (s.occupant) this.exit(s.occupant);
      this.onDestroyed(by);
    }
  }

  /** Apply `controls` to the body. Called every fixed step before physics. */
  protected abstract simulate(dt: number): void;
  protected onEnter(_c: Character, _seat: number): void {}
  protected onExit(_c: Character): void {}
  protected onDestroyed(_by: Character | null): void {}
  /** Extra per-frame visuals (wheels, wake). `root` is already placed. */
  protected animate(_dt: number): void {}

  /**
   * Hand the body to the network (`on`) or take it back. Taking it back keeps going at `velocity`,
   * the last speed the other browser reported.
   */
  setRemoteDriven(on: boolean, velocity?: { x: number; y: number; z: number }, spin?: { x: number; y: number; z: number }): void {
    if (this.remoteDriven === on) return;
    this.remoteDriven = on;
    const b = this.body;
    if (on) {
      const t = b.translation();
      const r = b.rotation();
      Object.assign(this.remoteTarget, { x: t.x, y: t.y, z: t.z, qx: r.x, qy: r.y, qz: r.z, qw: r.w });
      b.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    } else {
      b.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      if (velocity) b.setLinvel(velocity, true);
      if (spin) b.setAngvel(spin, true);
    }
  }

  fixedUpdate(dt: number): void {
    if (this.remoteDriven) {
      const r = this.remoteTarget;
      this.body.setNextKinematicTranslation({ x: r.x, y: r.y, z: r.z });
      this.body.setNextKinematicRotation({ x: r.qx, y: r.qy, z: r.qz, w: r.qw });
      return;
    }
    if (!this.driver) {
      this.controls.throttle = 0;
      this.controls.steer = 0;
      this.controls.boost = false;
    }
    this.simulate(dt);
  }

  postPhysics(_dt: number): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.prevPos.copy(this.currPos);
    this.prevQuat.copy(this.currQuat);
    this.currPos.set(t.x, t.y, t.z);
    this.currQuat.set(r.x, r.y, r.z, r.w);
    _v.set(0, 0, -1).applyQuaternion(this.currQuat);
    this.yaw = Math.atan2(-_v.x, -_v.z);
    const lv = this.body.linvel();
    this.speed = lv.x * _v.x + lv.y * _v.y + lv.z * _v.z;
    // Occupants' capsules ride along so bullets can find them.
    for (const s of this.seats) {
      if (!s.occupant) continue;
      _p.copy(s.def.position).applyQuaternion(this.currQuat).add(this.currPos);
      s.occupant.motor.place(_p.x, _p.y, _p.z);
    }
  }

  frameUpdate(dt: number, alpha: number): void {
    this.position.lerpVectors(this.prevPos, this.currPos, alpha);
    this.quaternion.slerpQuaternions(this.prevQuat, this.currQuat, alpha);
    this.root.position.copy(this.position);
    this.root.quaternion.copy(this.quaternion);
    for (const s of this.seats) if (s.occupant) this.placeOccupant(s);
    this.animate(dt);
  }

  private placeOccupant(s: Seat): void {
    const c = s.occupant!;
    c.visual.copy(s.def.position).applyQuaternion(this.quaternion).add(this.position);
    c.seatQuat.copy(this.quaternion).multiply(_q.setFromAxisAngle(UP, s.def.yaw));
    c.facing = this.yaw + s.def.yaw;
  }

  /** World position of a point given in vehicle space, using the physics transform. */
  toWorld(local: Vector3, out: Vector3): Vector3 {
    return out.copy(local).applyQuaternion(this.currQuat).add(this.currPos);
  }

  dispose(): void {
    this.game.interactions.remove(this.interaction);
    this.game.engine.scene.remove(this.root);
    this.game.physics.removeBody(this.body);
    const i = this.game.vehicles.indexOf(this);
    if (i >= 0) this.game.vehicles.splice(i, 1);
  }
}
