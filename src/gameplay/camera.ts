import { type PerspectiveCamera, Vector3 } from 'three';
import { CG } from '../core/config';
import { clamp, damp, lerp, Spring } from '../core/math';
import type { Physics } from '../physics/physics';

const _pivot = new Vector3();
const _want = new Vector3();
const _dir = new Vector3();
const _right = new Vector3();

/** What the camera frames this frame. Filled by the game from the player, a vehicle or the drop. */
export interface CameraSubject {
  /** Point at the subject's feet or centre. */
  position: Vector3;
  /** Height of the pivot above `position`. */
  height: number;
  /** Boom length in metres. */
  distance: number;
  /** Sideways offset of the pivot, positive to the right of the view. */
  shoulder: number;
  /** 0 hip, 1 fully aimed down the sights. */
  aim: number;
  /** Extra field of view in degrees (sprint, speed). */
  fovKick: number;
  /** Field of view when fully aimed, as a fraction of normal. 0.74 when not given. */
  zoom?: number;
  /** Rigid body to leave out of the collision check, when the subject is a vehicle. */
  exclude?: import('@dimforge/rapier3d-compat').RigidBody;
  /** How quickly the pivot follows the subject vertically (1/s). */
  followRate?: number;
}

/**
 * Orbit camera on a boom over the right shoulder. The boom shortens when a wall is in the way and
 * grows back slowly, so the view never jumps through geometry and never pumps in and out.
 */
export class ThirdPersonCamera {
  yaw = 0;
  pitch = -0.12;
  /** Where the centre of the screen is pointing, in the world. */
  readonly forward = new Vector3(0, 0, -1);
  /** The point under the crosshair. */
  readonly aimPoint = new Vector3();
  aimDistance = 100;
  baseFov = 62;
  private readonly pivot = new Vector3();
  private hasPivot = false;
  private boom = 3.4;
  private fov = 62;
  private shoulder = 0.55;
  private trauma = 0;
  private time = 0;
  private recoilPitch = new Spring(0, 0.09);
  private recoilYaw = new Spring(0, 0.09);

  constructor(
    readonly camera: PerspectiveCamera,
    private physics: Physics,
  ) {}

  /** Turn by a mouse delta in pixels. */
  look(dx: number, dy: number, sensitivity: number, invertY: boolean): void {
    const k = 0.0022 * sensitivity * (this.fov / this.baseFov);
    this.yaw -= dx * k;
    this.pitch = clamp(this.pitch - dy * k * (invertY ? -1 : 1), -1.35, 1.25);
  }

  /** Add camera shake, 0..1. */
  shake(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Kick the view up and sideways; it settles back on its own. */
  recoil(pitch: number, yaw: number): void {
    this.recoilPitch.velocity += pitch * 22;
    this.recoilYaw.velocity += yaw * 22;
  }

  /** How far the view is kicked off the aim right now, radians (up, sideways). */
  get recoilOffset(): { pitch: number; yaw: number } {
    return { pitch: this.recoilPitch.value, yaw: this.recoilYaw.value };
  }

  snap(): void {
    this.hasPivot = false;
  }

  update(dt: number, s: CameraSubject): void {
    this.time += dt;
    const rp = this.recoilPitch.update(0, dt);
    const ry = this.recoilYaw.update(0, dt);
    const yaw = this.yaw + ry;
    const pitch = clamp(this.pitch + rp, -1.45, 1.4);
    const cp = Math.cos(pitch);
    _dir.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
    _right.set(Math.cos(yaw), 0, -Math.sin(yaw));

    // The pivot trails the subject a little, more so vertically, which hides steps and landings.
    _pivot.copy(s.position);
    _pivot.y += s.height;
    if (!this.hasPivot) {
      this.pivot.copy(_pivot);
      this.hasPivot = true;
      this.boom = s.distance;
    } else {
      const k = 1 - Math.exp(-28 * dt);
      this.pivot.x += (_pivot.x - this.pivot.x) * k;
      this.pivot.z += (_pivot.z - this.pivot.z) * k;
      this.pivot.y = damp(this.pivot.y, _pivot.y, s.followRate ?? 12, dt);
      if (this.pivot.distanceToSquared(_pivot) > 36) this.pivot.copy(_pivot);
    }
    this.shoulder = damp(this.shoulder, s.shoulder, 10, dt);

    // Shoulder offset, pulled in if a wall is beside the character.
    _want.copy(this.pivot);
    let side = this.shoulder;
    if (Math.abs(side) > 0.01) {
      const sign = Math.sign(side);
      const hit = this.physics.raycast(this.pivot.x, this.pivot.y, this.pivot.z, _right.x * sign, 0, _right.z * sign, Math.abs(side) + 0.25, CG.queryCamera, s.exclude);
      if (hit) side = sign * Math.max(0, hit.distance - 0.25);
      _want.addScaledVector(_right, side);
    }
    const px = _want.x;
    const py = _want.y;
    const pz = _want.z;

    // Boom with collision: in at once, out gently.
    const dist = lerp(s.distance, Math.min(s.distance, 1.75), s.aim);
    let allowed = dist;
    const hit = this.physics.raycast(px, py, pz, -_dir.x, -_dir.y, -_dir.z, dist + 0.3, CG.queryCamera, s.exclude);
    if (hit) allowed = Math.max(0.35, hit.distance - 0.3);
    if (allowed < this.boom) this.boom = allowed;
    else this.boom = damp(this.boom, allowed, 6, dt);

    const cam = this.camera;
    cam.position.set(px - _dir.x * this.boom, py - _dir.y * this.boom, pz - _dir.z * this.boom);

    // Shake from trauma squared, as smooth noise.
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const sh = this.trauma * this.trauma;
    const t = this.time;
    const sx = (Math.sin(t * 37.1) + Math.sin(t * 61.7 + 1.3)) * 0.5 * sh;
    const sy = (Math.sin(t * 43.3 + 2.1) + Math.sin(t * 57.9)) * 0.5 * sh;
    cam.rotation.set(pitch + sy * 0.035, yaw + sx * 0.035, sx * 0.02, 'YXZ');

    const fov = lerp(this.baseFov + s.fovKick, this.baseFov * (s.zoom ?? 0.74), s.aim);
    this.fov = damp(this.fov, fov, 10, dt);
    if (Math.abs(cam.fov - this.fov) > 0.01) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }

    // What is under the crosshair. The ray starts beyond the subject so it cannot hit things behind them.
    this.forward.copy(_dir);
    const skip = this.boom + 0.2;
    const ox = cam.position.x + _dir.x * skip;
    const oy = cam.position.y + _dir.y * skip;
    const oz = cam.position.z + _dir.z * skip;
    const aim = this.physics.raycast(ox, oy, oz, _dir.x, _dir.y, _dir.z, 420, CG.queryBullet, s.exclude);
    this.aimDistance = aim ? aim.distance + skip : 420;
    this.aimPoint.set(cam.position.x + _dir.x * this.aimDistance, cam.position.y + _dir.y * this.aimDistance, cam.position.z + _dir.z * this.aimDistance);
  }
}
