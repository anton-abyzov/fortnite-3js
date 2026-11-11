import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { BiomechanicalAnimator } from '../../src/character/biomechanics';
import { HumanoidRig, LOWER_LEG_LEN, UPPER_LEG_LEN } from '../../src/character/human-rig';
import { solveTwoBoneIKPositions } from '../../src/character/ik-solver';

describe('Analytical Two-Bone IK and Human Biomechanical Locomotion', () => {
  it('preserves exact bone segment lengths without knee hyper-extension', () => {
    const hip = new THREE.Vector3(0, 0.92, 0);
    const target = new THREE.Vector3(0.02, 0.14, -0.28);
    const pole = new THREE.Vector3(0, 0, -1);

    const res = solveTwoBoneIKPositions(hip, target, pole, UPPER_LEG_LEN, LOWER_LEG_LEN);
    const d1 = hip.distanceTo(res.midPos);
    const d2 = res.midPos.distanceTo(res.endPos);

    expect(d1).toBeCloseTo(UPPER_LEG_LEN, 4);
    expect(d2).toBeCloseTo(LOWER_LEG_LEN, 4);
    expect(res.bendAngleRad).toBeGreaterThan(0.2);

    // Even when target is unreachable (3 meters away), limb clamps cleanly without NaN
    const farRes = solveTwoBoneIKPositions(
      hip,
      new THREE.Vector3(0, -3.0, 0),
      pole,
      UPPER_LEG_LEN,
      LOWER_LEG_LEN,
    );
    expect(Number.isFinite(farRes.midPos.y)).toBe(true);
    expect(hip.distanceTo(farRes.endPos)).toBeLessThan(UPPER_LEG_LEN + LOWER_LEG_LEN);
  });

  it('produces alternating footstance phases, spine counter-rotation, contra-lateral arms, and posture modes', () => {
    const rig = new HumanoidRig();
    const anim = new BiomechanicalAnimator();

    let stepEvents = 0;
    let maxSpineCounterDiff = 0;
    let maxArmOpposition = 0;

    for (let i = 0; i < 90; i++) {
      const t = anim.update(rig, {
        dt: 1 / 60,
        timeSec: i / 60,
        phase: 'grounded',
        planarSpeed: 7.4,
        forwardSpeed: 7.4,
        strafeSpeed: 0,
        verticalSpeed: 0,
        yawRate: 0.15,
        crouchAmount: 0,
        aimAmount: 0,
        aimPitchRad: 0,
        armed: false,
        recoilImpulse: 0,
        steerInput: 0,
        leftGroundDeltaY: 0,
        rightGroundDeltaY: 0.08,
        groundSlopePitchRad: 0.05,
      });

      if (t.stepTriggeredSide) stepEvents++;
      maxSpineCounterDiff = Math.max(
        maxSpineCounterDiff,
        Math.abs(rig.pelvis.rotation.y - rig.spineUpper.rotation.y),
      );
      maxArmOpposition = Math.max(
        maxArmOpposition,
        Math.abs(rig.upperArmL.rotation.x - rig.upperArmR.rotation.x),
      );
    }

    expect(stepEvents).toBeGreaterThanOrEqual(4);
    expect(maxSpineCounterDiff).toBeGreaterThan(0.12);
    expect(maxArmOpposition).toBeGreaterThan(0.6);

    // Verify canopy toggle pull asymmetry when banking right
    anim.update(rig, {
      dt: 1 / 60,
      timeSec: 2.0,
      phase: 'canopy',
      planarSpeed: 14,
      forwardSpeed: 14,
      strafeSpeed: 0,
      verticalSpeed: -5,
      yawRate: 0,
      crouchAmount: 0,
      aimAmount: 0,
      aimPitchRad: 0,
      armed: false,
      recoilImpulse: 0,
      steerInput: 1.0,
      leftGroundDeltaY: 0,
      rightGroundDeltaY: 0,
      groundSlopePitchRad: 0,
    });
    expect(rig.upperArmL.rotation.x).toBeGreaterThan(rig.upperArmR.rotation.x + 0.3);
  });
});
