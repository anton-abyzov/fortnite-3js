import * as THREE from 'three';
import { clamp } from '../core/math';

export interface TwoBoneIKResult {
  midPos: THREE.Vector3;
  endPos: THREE.Vector3;
  bendAngleRad: number;
}

const _dir = new THREE.Vector3();
const _poleProj = new THREE.Vector3();
const _ortho = new THREE.Vector3();

/**
 * Analytical Law-of-Cosines two-bone IK solver in character root local space.
 * Prevents hyper-extension lock by clamping reach to 99.6% of total limb length.
 */
export function solveTwoBoneIKPositions(
  rootPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  poleDir: THREE.Vector3,
  upperLen: number,
  lowerLen: number,
  outMid = new THREE.Vector3(),
  outEnd = new THREE.Vector3(),
): TwoBoneIKResult {
  _dir.subVectors(targetPos, rootPos);
  const rawDist = _dir.length();
  const minDist = Math.abs(upperLen - lowerLen) + 0.015;
  const maxDist = (upperLen + lowerLen) * 0.996;
  const reach = clamp(rawDist, minDist, maxDist);

  if (rawDist < 1e-5) {
    _dir.set(0, -1, 0);
  } else {
    _dir.multiplyScalar(1 / rawDist);
  }

  outEnd.copy(rootPos).addScaledVector(_dir, reach);

  // Project pole direction onto plane perpendicular to target axis
  _poleProj.copy(poleDir).addScaledVector(_dir, -poleDir.dot(_dir));
  if (_poleProj.lengthSq() < 1e-6) {
    _ortho.set(0, 0, 1).cross(_dir);
    if (_ortho.lengthSq() < 1e-6) _ortho.set(1, 0, 0);
    _poleProj.copy(_ortho).normalize();
  } else {
    _poleProj.normalize();
  }

  const cosAlpha = clamp(
    (upperLen * upperLen + reach * reach - lowerLen * lowerLen) / (2 * upperLen * reach),
    -1,
    1,
  );
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));

  const cosInterior = clamp(
    (upperLen * upperLen + lowerLen * lowerLen - reach * reach) / (2 * upperLen * lowerLen),
    -1,
    1,
  );
  const bendAngleRad = Math.PI - Math.acos(cosInterior);

  outMid
    .copy(rootPos)
    .addScaledVector(_dir, upperLen * cosAlpha)
    .addScaledVector(_poleProj, upperLen * sinAlpha);

  return {
    midPos: outMid,
    endPos: outEnd,
    bendAngleRad,
  };
}

const _segDir = new THREE.Vector3();
const _defaultDown = new THREE.Vector3(0, -1, 0);
const _rotMat = new THREE.Matrix4();
const _xAxis = new THREE.Vector3();
const _yAxis = new THREE.Vector3();
const _zAxis = new THREE.Vector3();

/**
 * Computes a stable orientation quaternion whose -Y axis points from `from` to `to`
 * and whose forward (+Z or -Z) aligns consistently with `forwardHint`.
 */
export function orientLimbSegment(
  from: THREE.Vector3,
  to: THREE.Vector3,
  forwardHint: THREE.Vector3,
  outQuat = new THREE.Quaternion(),
): THREE.Quaternion {
  _segDir.subVectors(to, from);
  if (_segDir.lengthSq() < 1e-8) {
    return outQuat.identity();
  }
  _segDir.normalize();

  // Bone local -Y points down along segment -> local +Y is -_segDir
  _yAxis.copy(_segDir).negate();
  _xAxis.crossVectors(_yAxis, forwardHint);
  if (_xAxis.lengthSq() < 1e-6) {
    return outQuat.setFromUnitVectors(_defaultDown, _segDir);
  }
  _xAxis.normalize();
  _zAxis.crossVectors(_xAxis, _yAxis).normalize();

  _rotMat.makeBasis(_xAxis, _yAxis, _zAxis);
  return outQuat.setFromRotationMatrix(_rotMat);
}
