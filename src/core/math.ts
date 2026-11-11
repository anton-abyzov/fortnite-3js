export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function saturate(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * Math.max(0, dt)));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = saturate((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function wrapAngleRad(angle: number): number {
  let a = (angle + Math.PI) % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a - Math.PI;
}

export function dampAngleRad(current: number, target: number, lambda: number, dt: number): number {
  const delta = wrapAngleRad(target - current);
  return wrapAngleRad(current + delta * (1 - Math.exp(-lambda * Math.max(0, dt))));
}

export interface SpringState {
  value: number;
  velocity: number;
}

export function stepSpringDamper(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): SpringState {
  const safeDt = Math.min(Math.max(dt, 0), 0.05);
  const force = (target - state.value) * stiffness - state.velocity * damping;
  const velocity = state.velocity + force * safeDt;
  const value = state.value + velocity * safeDt;
  return { value, velocity };
}
