import { type Bone, Vector3 } from 'three';
import { rotateWorldAxis, solveTwoBone } from './ik';
import type { CharacterRig } from './rig';

/** What a body in freefall is doing. All values are already smoothed by the caller. */
export interface SkydiveState {
  /** 0 belly to earth with the limbs spread, 1 head down with the arms swept back. */
  dive: number;
  /** -1..1, sideways steer: positive toward the character's left. */
  steer: number;
  /** Seconds, drives the flutter of the limbs in the wind. */
  time: number;
}

/** What a body under an open canopy is doing. */
export interface CanopyState {
  /** -1..1: positive pulls the left toggle down. */
  steer: number;
  /** 0..1: both toggles down. */
  brake: number;
  /** -1..1: legs swing back when speeding up and forward when slowing. */
  swing: number;
  time: number;
}

const _target = new Vector3();
const _pole = new Vector3();
const _axis = new Vector3();

/**
 * Put a hand or a foot at a point given in the body's own frame: +X is the character's left, +Y runs
 * from the feet to the head, +Z is the front. The frame turns with the body, so the same numbers work
 * standing up and lying on the air.
 */
function reach(rig: CharacterRig, upper: Bone, lower: Bone, end: Bone, x: number, y: number, z: number, px: number, py: number, pz: number): void {
  const m = rig.root.matrixWorld;
  _target.set(x, y, z).applyMatrix4(m);
  _pole.set(px, py, pz).transformDirection(m);
  solveTwoBone(upper, lower, end, _target, _pole, 1);
}

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Freefall. The spread "box" position (arms out at the shoulders with the forearms forward, hips
 * pushed toward the earth, knees bent so the shins trail up) blends into a head-down dive with the
 * arms back along the body and the legs straight. The limbs flutter a little, as they do in the wind.
 */
export function skydivePose(rig: CharacterRig, s: SkydiveState): void {
  const b = rig.b;
  const d = s.dive;
  const t = s.time;
  const m = rig.root.matrixWorld;
  // The body's right axis in the world. Bending the spine back about it arches the body.
  _axis.set(-1, 0, 0).transformDirection(m);
  const arch = mix(0.16, 0.03, d);
  rotateWorldAxis(b.spine1, _axis, arch);
  rotateWorldAxis(b.spine2, _axis, arch);
  rotateWorldAxis(b.spine3, _axis, arch * 0.8);
  // Chin up to look where the fall is going, less so in the dive where that is straight ahead.
  rotateWorldAxis(b.neck, _axis, mix(0.3, 0.1, d));
  rotateWorldAxis(b.head, _axis, mix(0.42, 0.14, d));

  const f1 = Math.sin(t * 9.3) * 0.022;
  const f2 = Math.sin(t * 11.1 + 1.7) * 0.022;
  const f3 = Math.sin(t * 7.7 + 0.6) * 0.03;
  const f4 = Math.sin(t * 8.9 + 2.9) * 0.03;
  // Steering dips one arm and lifts the other, which is how a skydiver slides sideways.
  const tip = s.steer * 0.12;

  const handX = mix(0.52, 0.34, d);
  const handY = mix(1.66, 0.98, d);
  const handZ = mix(0.2, -0.04, d);
  reach(rig, b.upperArmL, b.forearmL, b.handL, handX, handY + f1, handZ + tip, 1, mix(-0.3, 0.2, d), mix(0.1, -0.6, d));
  reach(rig, b.upperArmR, b.forearmR, b.handR, -handX, handY + f2, handZ - tip, -1, mix(-0.3, 0.2, d), mix(0.1, -0.6, d));

  const footX = mix(0.25, 0.13, d);
  const footY = mix(0.4, 0.1, d);
  const footZ = mix(-0.48, -0.1, d);
  reach(rig, b.thighL, b.shinL, b.footL, footX, footY, footZ + f3, 0.25, -0.2, 1);
  reach(rig, b.thighR, b.shinR, b.footR, -footX, footY, footZ + f4, -0.25, -0.2, 1);
}

/**
 * Under the canopy: hands up on the steering toggles, pulled down on the side of a turn and both
 * down to brake, the body hanging in the harness with the knees a little forward.
 */
export function canopyPose(rig: CharacterRig, s: CanopyState): void {
  const b = rig.b;
  const m = rig.root.matrixWorld;
  _axis.set(-1, 0, 0).transformDirection(m);
  // Sitting back into the harness: a slight lean back with the head up toward the canopy's nose.
  rotateWorldAxis(b.spine2, _axis, 0.06);
  rotateWorldAxis(b.head, _axis, -0.1);

  const sway = Math.sin(s.time * 1.3) * 0.02;
  const pullL = Math.min(1, s.brake + Math.max(0, s.steer));
  const pullR = Math.min(1, s.brake + Math.max(0, -s.steer));
  // Toggles sit about ear height with the elbows out, not at full stretch overhead.
  reach(rig, b.upperArmL, b.forearmL, b.handL, 0.43, 1.68 - pullL * 0.4, 0.2 + sway, 1, -0.5, -0.2);
  reach(rig, b.upperArmR, b.forearmR, b.handR, -0.43, 1.68 - pullR * 0.4, 0.2 - sway, -1, -0.5, -0.2);

  const swing = s.swing * 0.16 + Math.sin(s.time * 1.1) * 0.025;
  reach(rig, b.thighL, b.shinL, b.footL, 0.13, 0.13, 0.2 - swing, 0.1, 0, 1);
  reach(rig, b.thighR, b.shinR, b.footR, -0.13, 0.11, 0.24 - swing, -0.1, 0, 1);
}
