import { Vector3 } from 'three';
import { CG, CHARACTER_GRAVITY, WORLD } from '../core/config';
import { clamp, clamp01, moveToward } from '../core/math';
import { type ColliderOwner, type Physics, RAPIER, type Surface } from '../physics/physics';

export interface MotorInput {
  /** Wanted direction of travel on the ground plane, world space, length 0..1. */
  moveX: number;
  moveZ: number;
  sprint: boolean;
  walk: boolean;
  crouch: boolean;
  /** True on the step the jump button went down. */
  jump: boolean;
}

export type MotorMode = 'ground' | 'air' | 'swim' | 'slide' | 'off';

export const MOVE = {
  walk: 1.55,
  run: 4.7,
  sprint: 6.9,
  crouch: 1.5,
  swim: 2.2,
  swimFast: 3.3,
  jumpSpeed: 7.4,
  radius: 0.3,
  standHalf: 0.59,
  crouchHalf: 0.3,
  /** Water depth at the feet where walking turns into swimming. */
  swimDepth: 1.32,
  slideStart: 8.4,
} as const;

let sharedController: RAPIER.KinematicCharacterController | null = null;
let sharedFor: Physics | null = null;

function controllerFor(physics: Physics): RAPIER.KinematicCharacterController {
  if (!sharedController || sharedFor !== physics) {
    const c = physics.world.createCharacterController(0.03);
    c.setUp({ x: 0, y: 1, z: 0 });
    c.setSlideEnabled(true);
    c.setMaxSlopeClimbAngle((52 * Math.PI) / 180);
    c.setMinSlopeSlideAngle((56 * Math.PI) / 180);
    c.enableAutostep(0.46, 0.12, false);
    c.enableSnapToGround(0.34);
    c.setApplyImpulsesToDynamicBodies(true);
    c.setCharacterMass(75);
    sharedController = c;
    sharedFor = physics;
  }
  return sharedController;
}

const _delta = { x: 0, y: 0, z: 0 };
const _m1 = { x: 0, y: 0, z: 0 };
const _next = { x: 0, y: 0, z: 0 };

/**
 * Capsule character movement: walking, sprinting, crouching, sliding, jumping, falling and swimming.
 * Shared by the player and the bots. Runs in the fixed step; `position` is the point between the feet.
 */
export class CharacterMotor {
  readonly position = new Vector3();
  readonly prevPosition = new Vector3();
  readonly velocity = new Vector3();
  readonly groundNormal = new Vector3(0, 1, 0);
  mode: MotorMode = 'air';
  grounded = false;
  crouched = false;
  surface: Surface = 'concrete';
  /** Water surface height minus feet height. Positive when standing in water. */
  waterDepth = -10;
  waterY = 0;
  airTime = 0;
  /** Set for one step when the feet touch down; holds the downward speed at impact. */
  landed = 0;
  /** Set for one step when a jump starts. */
  jumped = false;
  slideTime = 0;
  /** Horizontal speed over the ground, m/s. */
  speed = 0;
  /** Speed cap multiplier (weapon weight, healing, storm). */
  speedScale = 1;
  readonly body: RAPIER.RigidBody;
  readonly collider: RAPIER.Collider;
  private coyote = 0;
  private jumpBuffer = 0;
  private enabled = true;
  private half: number = MOVE.standHalf;
  private readonly slideDir = new Vector3();

  constructor(
    private physics: Physics,
    owner: ColliderOwner,
    x: number,
    y: number,
    z: number,
  ) {
    this.position.set(x, y, z);
    this.prevPosition.copy(this.position);
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y + this.half + MOVE.radius, z);
    this.body = physics.world.createRigidBody(bodyDesc);
    const desc = RAPIER.ColliderDesc.capsule(this.half, MOVE.radius).setCollisionGroups(CG.character).setFriction(0);
    this.collider = physics.world.createCollider(desc, this.body);
    physics.setOwner(this.collider, owner);
  }

  get height(): number {
    return (this.half + MOVE.radius) * 2;
  }

  get swimming(): boolean {
    return this.mode === 'swim';
  }

  /** Turn collision and movement off (seated in a vehicle, parachuting, dead) or back on. */
  setEnabled(on: boolean): void {
    if (this.enabled === on) return;
    this.enabled = on;
    this.collider.setEnabled(on);
    if (!on) this.mode = 'off';
    else this.mode = 'air';
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  teleport(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.prevPosition.copy(this.position);
    this.velocity.set(0, 0, 0);
    this.body.setTranslation({ x, y: y + this.half + MOVE.radius, z }, true);
    this.airTime = 0;
  }

  /** Move without collision, for scripted motion (plane, parachute, seats). Keeps the collider in sync. */
  place(x: number, y: number, z: number): void {
    this.prevPosition.copy(this.position);
    this.position.set(x, y, z);
    _next.x = x;
    _next.y = y + this.half + MOVE.radius;
    _next.z = z;
    this.body.setNextKinematicTranslation(_next);
  }

  private setCrouched(on: boolean): void {
    if (on === this.crouched) return;
    if (!on) {
      // Stand only when there is headroom.
      const top = this.position.y + (MOVE.crouchHalf + MOVE.radius) * 2;
      const need = (MOVE.standHalf - MOVE.crouchHalf) * 2 + 0.05;
      if (this.physics.raycast(this.position.x, top - 0.05, this.position.z, 0, 1, 0, need, CG.querySolid)) return;
    }
    this.crouched = on;
    this.half = on ? MOVE.crouchHalf : MOVE.standHalf;
    this.collider.setHalfHeight(this.half);
    this.body.setTranslation({ x: this.position.x, y: this.position.y + this.half + MOVE.radius, z: this.position.z }, true);
  }

  step(dt: number, input: MotorInput, waterHeight: (x: number, z: number) => number): void {
    this.landed = 0;
    this.jumped = false;
    this.prevPosition.copy(this.position);
    if (!this.enabled) return;
    const p = this.position;
    const v = this.velocity;
    this.waterY = waterHeight(p.x, p.z);
    this.waterDepth = this.waterY - p.y;

    let mx = input.moveX;
    let mz = input.moveZ;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) {
      mx /= ml;
      mz /= ml;
    }
    const moving = ml > 0.05;

    // Swimming starts in deep water and ends when the bottom comes within standing depth.
    if (this.mode !== 'swim' && this.waterDepth > MOVE.swimDepth) {
      this.mode = 'swim';
      this.setCrouched(false);
      v.y *= 0.3;
    } else if (this.mode === 'swim') {
      const bed = this.physics.groundHeight(p.x, p.y + 1.2, p.z, 4, -100);
      if (this.waterY - bed < MOVE.swimDepth - 0.14) this.mode = 'air';
    }

    this.jumpBuffer = input.jump ? 0.13 : Math.max(0, this.jumpBuffer - dt);
    this.coyote = this.grounded ? 0.11 : Math.max(0, this.coyote - dt);

    if (this.mode === 'swim') {
      const top = (input.sprint ? MOVE.swimFast : MOVE.swim) * this.speedScale;
      const ax = 9 * dt;
      v.x = moveToward(v.x, mx * top, ax);
      v.z = moveToward(v.z, mz * top, ax);
      // Float with the shoulders at the surface when still, flatter and higher when stroking.
      const sp = Math.hypot(v.x, v.z);
      const sink = 1.4 - 0.32 * clamp01(sp / MOVE.swim);
      const targetY = this.waterY - sink;
      v.y = clamp((targetY - p.y) * 7, -3.2, 2.6);
      // A jump at the surface next to a ledge climbs out.
      if (this.jumpBuffer > 0 && p.y > targetY - 0.2) {
        v.y = 5.2;
        this.jumpBuffer = 0;
      }
    } else {
      // Crouch and slide.
      if (this.mode === 'slide') {
        this.slideTime += dt;
        const downhill = -(this.groundNormal.x * this.slideDir.x + this.groundNormal.z * this.slideDir.z);
        const sp = Math.max(0, Math.hypot(v.x, v.z) - (5.2 - downhill * 16) * dt);
        v.x = this.slideDir.x * sp;
        v.z = this.slideDir.z * sp;
        if (sp < 2.6 || this.slideTime > 1.15 || !this.grounded || !input.crouch) {
          this.mode = this.grounded ? 'ground' : 'air';
          this.setCrouched(input.crouch);
        }
      } else if (this.grounded) {
        const sp = Math.hypot(v.x, v.z);
        if (input.crouch && !this.crouched && input.sprint && sp > MOVE.run + 0.8 && this.waterDepth < 0.3) {
          this.mode = 'slide';
          this.slideTime = 0;
          this.slideDir.set(v.x / sp, 0, v.z / sp);
          this.setCrouched(true);
          const boost = Math.max(sp, MOVE.slideStart);
          v.x = this.slideDir.x * boost;
          v.z = this.slideDir.z * boost;
        } else {
          this.setCrouched(input.crouch);
        }
      }

      if (this.mode !== 'slide') {
        let top = this.crouched ? MOVE.crouch : input.walk ? MOVE.walk : input.sprint ? MOVE.sprint : MOVE.run;
        // Wading: water above the shins slows the legs down.
        top *= 1 - 0.5 * clamp01((this.waterDepth - 0.25) / 1.0);
        top *= this.speedScale;
        const tx = mx * top;
        const tz = mz * top;
        if (this.grounded) {
          // Quick to start, quicker to stop, and reversing direction costs the most.
          const dot = v.x * tx + v.z * tz;
          const rate = (moving ? (dot < 0 ? 44 : 30) : 36) * dt;
          const dx = tx - v.x;
          const dz = tz - v.z;
          const d = Math.hypot(dx, dz);
          if (d <= rate || d < 1e-6) {
            v.x = tx;
            v.z = tz;
          } else {
            v.x += (dx / d) * rate;
            v.z += (dz / d) * rate;
          }
        } else if (moving) {
          const rate = 9 * dt;
          v.x = moveToward(v.x, tx, rate);
          v.z = moveToward(v.z, tz, rate);
        }
      }

      // Jump, with a short grace period after leaving a ledge and a short input buffer before landing.
      if (this.jumpBuffer > 0 && this.coyote > 0 && this.waterDepth < 0.9) {
        if (this.crouched) this.setCrouched(false);
        if (!this.crouched) {
          v.y = MOVE.jumpSpeed;
          this.jumpBuffer = 0;
          this.coyote = 0;
          this.grounded = false;
          this.jumped = true;
          this.mode = 'air';
        }
      }
      if (this.grounded && v.y <= 0) v.y = -0.6;
      else v.y = Math.max(-58, v.y - CHARACTER_GRAVITY * dt);
      // Water drag on the way in.
      if (this.waterDepth > 0.6 && v.y < -4) v.y += (-4 - v.y) * Math.min(1, 9 * dt);
    }

    const kcc = controllerFor(this.physics);
    if (this.mode === 'swim' || v.y > 0.5) kcc.disableSnapToGround();
    else kcc.enableSnapToGround(0.34);
    _delta.x = v.x * dt;
    _delta.y = v.y * dt;
    _delta.z = v.z * dt;
    kcc.computeColliderMovement(this.collider, _delta, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, CG.querySolid);
    let m = kcc.computedMovement();
    const wasGrounded = this.grounded;
    const fallSpeed = -v.y;
    let grounded = kcc.computedGrounded();
    // A capsule pressed down onto a triangle mesh now and then catches a vertex or an inner edge of flat
    // ground and stops dead for a step. When the ground stops us, try again without the downward push:
    // a real wall blocks that too, a seam does not.
    const wantH = Math.hypot(_delta.x, _delta.z);
    if (wasGrounded && _delta.y < 0 && wantH > 1e-4 && Math.hypot(m.x, m.z) < wantH * 0.6) {
      _m1.x = m.x;
      _m1.y = m.y;
      _m1.z = m.z;
      _delta.y = 0;
      kcc.computeColliderMovement(this.collider, _delta, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, CG.querySolid);
      const m2 = kcc.computedMovement();
      if (Math.hypot(m2.x, m2.z) > Math.hypot(_m1.x, _m1.z) + wantH * 0.2) {
        m = m2;
        grounded = true;
      } else {
        m = _m1;
      }
      _delta.y = v.y * dt;
    }
    this.grounded = this.mode !== 'swim' && grounded && v.y <= 0.5;

    // Walls take the speed out of the direction they block; ceilings stop a jump.
    if (dt > 0) {
      const ax = m.x / dt;
      const az = m.z / dt;
      // Stepping up a kerb shortens one step's travel without being a wall: keep the pace over it.
      const stepped = wasGrounded && m.y > 0.03;
      if (!stepped && (Math.abs(ax) < Math.abs(v.x) - 0.5 || Math.abs(az) < Math.abs(v.z) - 0.5)) {
        v.x = ax;
        v.z = az;
      }
      if (v.y > 0 && m.y < _delta.y * 0.5) v.y = 0;
    }
    p.x += m.x;
    p.y += m.y;
    p.z += m.z;
    // Nothing leaves the map.
    p.x = clamp(p.x, -WORLD.bound, WORLD.bound);
    p.z = clamp(p.z, -WORLD.bound, WORLD.bound);
    if (p.y < -30) p.y = 5;

    if (this.grounded) {
      if (!wasGrounded && this.airTime > 0.12) this.landed = Math.max(0.01, fallSpeed);
      this.airTime = 0;
      if (this.mode === 'air') this.mode = 'ground';
      const hit = this.physics.raycast(p.x, p.y + 0.4, p.z, 0, -1, 0, 0.9, CG.querySolid);
      if (hit) {
        this.groundNormal.copy(hit.normal);
        this.surface = hit.owner?.surface ?? 'concrete';
      } else {
        this.groundNormal.set(0, 1, 0);
      }
    } else if (this.mode !== 'swim') {
      this.airTime += dt;
      if (this.mode === 'ground' || this.mode === 'slide') {
        if (this.mode === 'slide') this.setCrouched(false);
        this.mode = 'air';
      }
    } else {
      this.airTime = 0;
    }
    this.speed = Math.hypot(v.x, v.z);

    _next.x = p.x;
    _next.y = p.y + this.half + MOVE.radius;
    _next.z = p.z;
    this.body.setNextKinematicTranslation(_next);
  }

  dispose(): void {
    this.physics.removeBody(this.body);
  }
}
