import { type Object3D, Quaternion, Vector3 } from 'three';

const _qw = new Quaternion();
const _qp = new Quaternion();
const _qd = new Quaternion();
const _a = new Vector3();
const _b = new Vector3();
const _c = new Vector3();
const _dir = new Vector3();
const _bend = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();
const _q0 = new Quaternion();
const _q1 = new Quaternion();

/** Apply a world-space rotation to a bone, keeping its position. */
export function rotateWorld(bone: Object3D, delta: Quaternion): void {
  bone.getWorldQuaternion(_qw);
  if (bone.parent) bone.parent.getWorldQuaternion(_qp).invert();
  else _qp.identity();
  bone.quaternion.copy(_qp).multiply(delta).multiply(_qw);
}

/**
 * Move a bone by a world-space offset. Bone positions are in the parent's space, and in this rig the
 * parent of the hips is turned a quarter turn, so adding to `position.y` would not move it up.
 */
export function translateWorld(bone: Object3D, x: number, y: number, z: number): void {
  if (bone.parent) bone.parent.getWorldQuaternion(_qp).invert();
  else _qp.identity();
  bone.position.add(_v1.set(x, y, z).applyQuaternion(_qp));
}

/** Rotate a bone about a world axis through its own origin. */
export function rotateWorldAxis(bone: Object3D, axis: Vector3, angle: number): void {
  if (Math.abs(angle) < 1e-6) return;
  rotateWorld(bone, _qd.setFromAxisAngle(axis, angle));
}

/** Set a bone's world rotation. */
export function setWorldQuaternion(bone: Object3D, world: Quaternion): void {
  if (bone.parent) bone.parent.getWorldQuaternion(_qp).invert();
  else _qp.identity();
  bone.quaternion.copy(_qp).multiply(world);
}

/**
 * Two-bone inverse kinematics (hip-knee-ankle or shoulder-elbow-wrist).
 * `pole` is a world direction the middle joint should bend toward. `weight` blends from the incoming
 * pose (0) to the solved pose (1). Returns how far the target was beyond reach, in metres.
 */
export function solveTwoBone(upper: Object3D, lower: Object3D, end: Object3D, target: Vector3, pole: Vector3, weight = 1): number {
  if (weight <= 0) return 0;
  _q0.copy(upper.quaternion);
  _q1.copy(lower.quaternion);
  upper.getWorldPosition(_a);
  lower.getWorldPosition(_b);
  end.getWorldPosition(_c);
  const lab = _a.distanceTo(_b);
  const lcb = _b.distanceTo(_c);
  _dir.subVectors(target, _a);
  const raw = _dir.length();
  const max = (lab + lcb) * 0.9985;
  const min = Math.abs(lab - lcb) + 0.01;
  const dist = Math.min(max, Math.max(min, raw));
  if (raw < 1e-5) return 0;
  _dir.multiplyScalar(1 / raw);

  // Position of the middle joint from the law of cosines, in the plane given by the pole.
  const cosA = Math.min(1, Math.max(-1, (lab * lab + dist * dist - lcb * lcb) / (2 * lab * dist)));
  const sinA = Math.sqrt(1 - cosA * cosA);
  _bend.copy(pole).addScaledVector(_dir, -pole.dot(_dir));
  if (_bend.lengthSq() < 1e-6) {
    _bend.subVectors(_b, _a).addScaledVector(_dir, -_v1.subVectors(_b, _a).dot(_dir));
    if (_bend.lengthSq() < 1e-6) _bend.set(0, 0, 1);
  }
  _bend.normalize();
  _v1.copy(_a).addScaledVector(_dir, cosA * lab).addScaledVector(_bend, sinA * lab);

  // Swing the upper bone so the middle joint lands on its new position.
  _v2.subVectors(_b, _a).normalize();
  _v1.sub(_a).normalize();
  rotateWorld(upper, _qd.setFromUnitVectors(_v2, _v1));

  // Then swing the lower bone so the end lands on the target.
  lower.getWorldPosition(_b);
  end.getWorldPosition(_c);
  _v2.subVectors(_c, _b).normalize();
  _v1.copy(_a).addScaledVector(_dir, dist).sub(_b).normalize();
  rotateWorld(lower, _qd.setFromUnitVectors(_v2, _v1));

  if (weight < 0.999) {
    // Not slerpQuaternions(_q0, bone.quaternion, w): it copies the first argument over the second.
    _qd.copy(upper.quaternion);
    upper.quaternion.copy(_q0).slerp(_qd, weight);
    _qd.copy(lower.quaternion);
    lower.quaternion.copy(_q1).slerp(_qd, weight);
  }
  return Math.max(0, raw - max);
}

/**
 * Turn a bone so that `current` (a world direction that moves with the bone) points along `wanted`.
 * The turn is limited to `maxAngle` radians and scaled by `weight`.
 */
export function aimBone(bone: Object3D, current: Vector3, wanted: Vector3, weight = 1, maxAngle = Math.PI): void {
  const dot = Math.min(1, Math.max(-1, current.dot(wanted)));
  let angle = Math.acos(dot);
  if (angle < 1e-4) return;
  _v1.crossVectors(current, wanted);
  if (_v1.lengthSq() < 1e-10) return;
  _v1.normalize();
  angle = Math.min(angle, maxAngle) * weight;
  rotateWorld(bone, _qd.setFromAxisAngle(_v1, angle));
}
