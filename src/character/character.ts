import { Quaternion, type Scene, Vector3 } from 'three';
import type { ModelAsset } from '../core/assets';
import { angleDiff, clamp, dampAngle, moveTowardAngle, yawFromDir } from '../core/math';
import type { Physics, Surface } from '../physics/physics';
import { Animator, type AnimMode } from './animator';
import type { ClipBank } from './clips';
import { CharacterMotor, type MotorInput } from './motor';
import { CharacterRig, type Outfit } from './rig';
import { Inventory } from '../gameplay/inventory';
import type { Vehicle } from '../vehicles/vehicle';

/** What the character's body is doing at the top level. Movement states live in the motor. */
export type BodyState = 'normal' | 'plane' | 'freefall' | 'chute' | 'seated' | 'dead';

export interface CharacterEnv {
  waterHeight(x: number, z: number): number;
}

export interface CharacterEvents {
  footstep?(c: Character, side: number, speed: number, surface: Surface): void;
  landed?(c: Character, impact: number): void;
  jumped?(c: Character): void;
  splash?(c: Character, strength: number): void;
}

const _v = new Vector3();
const UP = new Vector3(0, 1, 0);

/**
 * A person in the world: capsule movement, skeleton, animation and the facts every system needs
 * (where they are, where they look, whether they are alive). The player and the bots are both this.
 */
export class Character {
  readonly rig: CharacterRig;
  readonly motor: CharacterMotor;
  readonly anim: Animator;
  /** Filled by whoever drives this character (player input or bot brain) before each fixed step. */
  readonly input: MotorInput = { moveX: 0, moveZ: 0, sprint: false, walk: false, crouch: false, jump: false };
  /** Body yaw: 0 faces -Z (north), positive turns left. */
  facing = 0;
  aimYaw = 0;
  aimPitch = 0;
  /** World point the character is aiming or looking at. */
  readonly aimPoint = new Vector3();
  /** When true the body squares up to the aim direction and the legs strafe; otherwise it faces travel. */
  strafe = true;
  state: BodyState = 'normal';
  health = 100;
  maxHealth = 100;
  armor = 0;
  maxArmor = 100;
  /** Money for the shops. */
  cash = 0;
  readonly inventory = new Inventory();
  alive = true;
  /** The vehicle this character sits in, and which seat. */
  vehicle: Vehicle | null = null;
  seat = -1;
  /** Full body orientation while seated or in a scripted pose; the vehicle or the drop writes it. */
  readonly seatQuat = new Quaternion();
  /** Seconds since the character was last hurt. */
  sinceHurt = 99;
  events: CharacterEvents = {};
  /** Visual feet position this frame. */
  readonly visual = new Vector3();
  private readonly riseTo = new Vector3();
  private turning = false;
  private wasSwimming = false;

  constructor(
    readonly id: number,
    readonly name: string,
    readonly isPlayer: boolean,
    asset: ModelAsset,
    bank: ClipBank,
    physics: Physics,
    scene: Scene,
    outfit: Outfit,
    x: number,
    y: number,
    z: number,
  ) {
    this.rig = new CharacterRig(asset, bank, outfit);
    this.rig.root.name = `character-${id}`;
    scene.add(this.rig.root);
    this.motor = new CharacterMotor(physics, { kind: 'character', surface: 'flesh', ref: this }, x, y, z);
    this.anim = new Animator(bank, this.rig, physics);
    this.anim.onFootstep = (side, speed) => this.events.footstep?.(this, side, speed, this.motor.waterDepth > 0.08 ? 'water' : this.motor.surface);
    this.visual.set(x, y, z);
  }

  get position(): Vector3 {
    return this.motor.position;
  }

  /** Eye height above the feet for the current stance. */
  get eyeHeight(): number {
    return this.motor.swimming ? 1.25 : this.motor.crouched ? 1.05 : 1.62;
  }

  headPosition(out: Vector3): Vector3 {
    return this.rig.b.head.getWorldPosition(out).add(_v.set(0, 0.1, 0));
  }

  chestPosition(out: Vector3): Vector3 {
    return this.rig.b.spine3.getWorldPosition(out);
  }

  /** Sit in a vehicle seat. The vehicle places the body from then on. Use `Vehicle.enter`, not this. */
  sitIn(vehicle: Vehicle, seat: number, clip: string): void {
    this.vehicle = vehicle;
    this.seat = seat;
    this.state = 'seated';
    this.motor.setEnabled(false, true);
    this.motor.velocity.set(0, 0, 0);
    this.anim.seatClip = clip;
    this.anim.rootQuat = this.seatQuat;
    this.input.moveX = 0;
    this.input.moveZ = 0;
  }

  /** Back on foot at a point. Use `Vehicle.exit`, not this. */
  standUp(x: number, y: number, z: number, yaw: number): void {
    this.vehicle = null;
    this.seat = -1;
    this.state = 'normal';
    this.anim.rootQuat = null;
    this.motor.setEnabled(true);
    this.teleport(x, y, z, yaw);
  }

  /**
   * Sit down on something that is not a vehicle (a stool, a bench). `rise` stands up where the
   * character came from.
   */
  sitAt(x: number, y: number, z: number, yaw: number, clip = 'Sitting_Idle_Loop'): boolean {
    if (this.state !== 'normal' || !this.alive) return false;
    this.riseTo.copy(this.motor.position);
    this.state = 'seated';
    this.motor.setEnabled(false, true);
    this.motor.velocity.set(0, 0, 0);
    this.motor.place(x, y, z);
    this.visual.set(x, y, z);
    this.facing = yaw;
    this.aimYaw = yaw;
    this.seatQuat.setFromAxisAngle(UP, yaw);
    this.anim.seatClip = clip;
    this.anim.rootQuat = this.seatQuat;
    this.input.moveX = 0;
    this.input.moveZ = 0;
    return true;
  }

  /** Stand up from a seat taken with `sitAt`. */
  rise(): void {
    if (this.state !== 'seated' || this.vehicle) return;
    this.standUp(this.riseTo.x, this.riseTo.y, this.riseTo.z, this.facing);
  }

  /** Restore health, up to the maximum. Returns how much was actually restored. */
  heal(amount: number): number {
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health - before;
  }

  addArmor(amount: number): number {
    const before = this.armor;
    this.armor = Math.min(this.maxArmor, this.armor + amount);
    return this.armor - before;
  }

  /** Put the character somewhere at once, facing `yaw`. */
  teleport(x: number, y: number, z: number, yaw = this.facing): void {
    this.motor.teleport(x, y, z);
    this.facing = yaw;
    this.aimYaw = yaw;
    this.visual.set(x, y, z);
    this.anim.velocity.set(0, 0, 0);
    this.anim.reset();
  }

  fixedUpdate(dt: number, env: CharacterEnv): void {
    this.sinceHurt += dt;
    const m = this.motor;
    if (this.state === 'freefall' || this.state === 'chute') {
      // Flying: the motor glides by the numbers the drop gave it, and the body turns with the view.
      m.step(dt, this.input, env.waterHeight);
      this.input.jump = false;
      this.facing = dampAngle(this.facing, this.aimYaw, this.state === 'chute' ? 3.4 : 5.5, dt);
      return;
    }
    if (this.state !== 'normal') {
      m.landed = 0;
      m.jumped = false;
      return;
    }
    if (!this.alive) {
      this.input.moveX = 0;
      this.input.moveZ = 0;
      this.input.jump = false;
      this.input.sprint = false;
    }
    m.step(dt, this.input, env.waterHeight);
    this.input.jump = false;
    if (m.jumped) {
      this.anim.jump();
      this.events.jumped?.(this);
    }
    if (m.landed > 0) {
      this.anim.land(m.landed);
      this.events.landed?.(this, m.landed);
    }
    if (m.swimming !== this.wasSwimming) {
      this.wasSwimming = m.swimming;
      if (m.swimming) this.events.splash?.(this, clamp(-m.velocity.y / 12, 0.2, 1));
    }

    // Facing. Strafing characters square up to the aim; the rest turn toward where they run.
    const speed = m.speed;
    if (!this.alive) return;
    if (m.swimming || !this.strafe) {
      if (speed > 0.5) this.facing = dampAngle(this.facing, yawFromDir(m.velocity.x, m.velocity.z), m.swimming ? 5 : 10, dt);
      this.turning = false;
    } else if (speed > 0.4 || m.mode === 'air') {
      this.facing = dampAngle(this.facing, this.aimYaw, 13, dt);
      this.turning = false;
    } else {
      // Standing still: the upper body follows the aim, and the feet only shuffle round once it is far off.
      const off = Math.abs(angleDiff(this.facing, this.aimYaw));
      if (off > 0.95) this.turning = true;
      if (this.turning) {
        this.facing = moveTowardAngle(this.facing, this.aimYaw, 4.6 * dt);
        if (off < 0.08) this.turning = false;
      }
    }
  }

  /** Per rendered frame: place the body between physics steps and pose it. */
  frameUpdate(dt: number, alpha: number): void {
    const m = this.motor;
    const a = this.anim;
    // Riding inside the seaplane: nothing to pose.
    if (this.state === 'plane') return;
    if (this.state === 'freefall' || this.state === 'chute') {
      this.visual.lerpVectors(m.prevPosition, m.position, alpha);
      a.velocity.copy(m.velocity);
      a.mode = this.alive ? 'pose' : 'dead';
      a.crouched = false;
    } else if (this.state === 'seated') {
      a.velocity.set(0, 0, 0);
      a.mode = this.alive ? 'seat' : 'dead';
      a.crouched = false;
    } else if (this.state === 'normal') {
      this.visual.lerpVectors(m.prevPosition, m.position, alpha);
      a.velocity.copy(m.velocity);
      let mode: AnimMode = 'ground';
      if (!this.alive) mode = 'dead';
      else if (m.mode === 'swim') mode = 'swim';
      else if (m.mode === 'slide') mode = 'slide';
      else if (m.mode === 'air' && (m.airTime > 0.09 || m.velocity.y > 1)) mode = 'air';
      a.mode = mode;
      a.crouched = m.crouched && m.mode !== 'slide';
    }
    a.position.copy(this.visual);
    a.facing = this.facing;
    a.aimYaw = this.aimYaw;
    a.aimPitch = this.aimPitch;
    a.update(dt);
  }

  dispose(): void {
    this.rig.dispose();
    this.motor.dispose();
  }
}
