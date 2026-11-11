import { Quaternion, Vector3 } from 'three';

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function invLerp(a: number, b: number, v: number): number {
  return a === b ? 0 : (v - a) / (b - a);
}

export function remap(v: number, a: number, b: number, c: number, d: number): number {
  return lerp(c, d, clamp01(invLerp(a, b, v)));
}

export function smoothstep(a: number, b: number, v: number): number {
  const t = clamp01(invLerp(a, b, v));
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent exponential approach. `lambda` is the rate in 1/s. */
export function damp(a: number, b: number, lambda: number, dt: number): number {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

export function wrapAngle(a: number): number {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}

/** Shortest signed difference from `a` to `b`. */
export function angleDiff(a: number, b: number): number {
  return wrapAngle(b - a);
}

export function dampAngle(a: number, b: number, lambda: number, dt: number): number {
  return a + angleDiff(a, b) * (1 - Math.exp(-lambda * dt));
}

export function moveToward(a: number, b: number, maxDelta: number): number {
  const d = b - a;
  if (Math.abs(d) <= maxDelta) return b;
  return a + Math.sign(d) * maxDelta;
}

export function moveTowardAngle(a: number, b: number, maxDelta: number): number {
  const d = angleDiff(a, b);
  if (Math.abs(d) <= maxDelta) return b;
  return wrapAngle(a + Math.sign(d) * maxDelta);
}

/** Critically damped spring on a scalar. Stable for any dt. */
export class Spring {
  value: number;
  velocity = 0;
  constructor(
    value = 0,
    public halfLife = 0.12,
  ) {
    this.value = value;
  }

  update(target: number, dt: number): number {
    // Exact critically damped spring integration (Holden, "Spring-It-On").
    const y = (4 * Math.LN2) / Math.max(this.halfLife, 1e-5) / 2;
    const j0 = this.value - target;
    const j1 = this.velocity + j0 * y;
    const e = Math.exp(-y * dt);
    this.value = e * (j0 + j1 * dt) + target;
    this.velocity = e * (this.velocity - j1 * y * dt);
    return this.value;
  }

  reset(value: number): void {
    this.value = value;
    this.velocity = 0;
  }
}

export class SpringVec3 {
  readonly value = new Vector3();
  readonly velocity = new Vector3();
  constructor(public halfLife = 0.12) {}

  update(target: Vector3, dt: number): Vector3 {
    const y = (4 * Math.LN2) / Math.max(this.halfLife, 1e-5) / 2;
    const e = Math.exp(-y * dt);
    const v = this.value;
    const vel = this.velocity;
    const j0x = v.x - target.x;
    const j0y = v.y - target.y;
    const j0z = v.z - target.z;
    const j1x = vel.x + j0x * y;
    const j1y = vel.y + j0y * y;
    const j1z = vel.z + j0z * y;
    v.set(e * (j0x + j1x * dt) + target.x, e * (j0y + j1y * dt) + target.y, e * (j0z + j1z * dt) + target.z);
    vel.set(e * (vel.x - j1x * y * dt), e * (vel.y - j1y * y * dt), e * (vel.z - j1z * y * dt));
    return v;
  }

  reset(value: Vector3): void {
    this.value.copy(value);
    this.velocity.set(0, 0, 0);
  }
}

const _q = new Quaternion();
const _up = new Vector3(0, 1, 0);

/** Quaternion for a yaw (rotation about +Y). Yaw 0 faces -Z, positive yaw turns left (counter-clockwise from above). */
export function yawQuat(yaw: number, out = new Quaternion()): Quaternion {
  return out.setFromAxisAngle(_up, yaw);
}

/** Forward vector on the ground plane for a yaw. */
export function yawForward(yaw: number, out = new Vector3()): Vector3 {
  return out.set(-Math.sin(yaw), 0, -Math.cos(yaw));
}

/** Yaw that faces along a ground-plane direction. */
export function yawFromDir(x: number, z: number): number {
  return Math.atan2(-x, -z);
}

export function dist2D(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

export function quatDamp(a: Quaternion, b: Quaternion, lambda: number, dt: number): Quaternion {
  return a.slerp(b, 1 - Math.exp(-lambda * dt));
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export { _q as scratchQuat };
