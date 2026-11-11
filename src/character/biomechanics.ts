import * as THREE from 'three';
import { clamp, damp, lerp, saturate } from '../core/math';
import type { DropPhase } from '../types/game';
import {
  ANKLE_HEIGHT,
  HIP_HALF_WIDTH,
  HIP_REST_HEIGHT,
  type HumanoidRig,
  LOWER_LEG_LEN,
  UPPER_LEG_LEN,
} from './human-rig';
import { orientLimbSegment, solveTwoBoneIKPositions } from './ik-solver';

export interface BiomechanicsInput {
  dt: number;
  timeSec: number;
  phase: DropPhase;
  planarSpeed: number;
  forwardSpeed: number;
  strafeSpeed: number;
  verticalSpeed: number;
  yawRate: number;
  crouchAmount: number;
  aimAmount: number;
  aimPitchRad: number;
  armed: boolean;
  recoilImpulse: number;
  steerInput: number;
  leftGroundDeltaY: number;
  rightGroundDeltaY: number;
  groundSlopePitchRad: number;
}

export interface BiomechanicsTelemetry {
  gaitPhase: number;
  cadenceHz: number;
  leftFootPlanted: boolean;
  rightFootPlanted: boolean;
  stepTriggeredSide: 'L' | 'R' | null;
  leftKneeBendRad: number;
  rightKneeBendRad: number;
  pelvisOffsetY: number;
}

const _hipL = new THREE.Vector3();
const _hipR = new THREE.Vector3();
const _targetL = new THREE.Vector3();
const _targetR = new THREE.Vector3();
const _kneeL = new THREE.Vector3();
const _kneeR = new THREE.Vector3();
const _ankleL = new THREE.Vector3();
const _ankleR = new THREE.Vector3();
const _poleL = new THREE.Vector3();
const _poleR = new THREE.Vector3();
const _fwdHint = new THREE.Vector3(0, 0, -1);

export class BiomechanicalAnimator {
  private gaitPhase = 0;
  private prevLeftStance = true;
  private prevRightStance = true;
  private landingCompression = 0;
  private smoothedSpeed = 0;
  private smoothedYawRate = 0;
  private recoilAmount = 0;

  public readonly telemetry: BiomechanicsTelemetry = {
    gaitPhase: 0,
    cadenceHz: 0,
    leftFootPlanted: true,
    rightFootPlanted: true,
    stepTriggeredSide: null,
    leftKneeBendRad: 0,
    rightKneeBendRad: 0,
    pelvisOffsetY: 0,
  };

  triggerLandingImpact(fallSpeedMps: number): void {
    this.landingCompression = clamp(Math.abs(fallSpeedMps) * 0.018, 0.04, 0.24);
  }

  update(rig: HumanoidRig, input: BiomechanicsInput): BiomechanicsTelemetry {
    const dt = clamp(input.dt, 0.0005, 0.05);
    this.telemetry.stepTriggeredSide = null;

    this.smoothedSpeed = damp(this.smoothedSpeed, input.planarSpeed, 12, dt);
    this.smoothedYawRate = damp(this.smoothedYawRate, input.yawRate, 10, dt);
    this.landingCompression = damp(this.landingCompression, 0, 8.5, dt);
    this.recoilAmount = clamp(damp(this.recoilAmount, 0, 14, dt) + input.recoilImpulse, 0, 1.2);

    if (input.phase === 'freefall') {
      return this.solveFreefallPose(rig, input);
    }
    if (input.phase === 'canopy') {
      return this.solveCanopyPose(rig, input);
    }
    if (input.phase === 'swimming') {
      return this.solveSwimmingPose(rig, input);
    }
    if (input.phase === 'driving' || input.phase === 'aircraft') {
      return this.solveSeatedVehiclePose(rig, input);
    }

    return this.solveGroundedGait(rig, input, dt);
  }

  private solveGroundedGait(
    rig: HumanoidRig,
    input: BiomechanicsInput,
    dt: number,
  ): BiomechanicsTelemetry {
    const speed = this.smoothedSpeed;
    const moveBlend = saturate(speed / 0.85);
    const runBlend = saturate((speed - 3.6) / 3.8);

    // Stride cadence scales smoothly from 1.55 Hz walk -> 2.85 Hz sprint
    const cadenceHz = moveBlend > 0.02 ? lerp(1.55, 2.85, runBlend) * lerp(0.75, 1.0, moveBlend) : 0;
    this.gaitPhase = (this.gaitPhase + cadenceHz * dt) % 1.0;

    // Duty factor: 0.62 during walk (double support!) -> 0.42 during sprint (aerial float!)
    const duty = lerp(0.62, 0.42, runBlend);
    const phaseL = this.gaitPhase;
    const phaseR = (this.gaitPhase + 0.5) % 1.0;

    const leftPlanted = speed < 0.25 || phaseL < duty;
    const rightPlanted = speed < 0.25 || phaseR < duty;

    if (leftPlanted && !this.prevLeftStance && speed > 0.45) {
      this.telemetry.stepTriggeredSide = 'L';
    } else if (rightPlanted && !this.prevRightStance && speed > 0.45) {
      this.telemetry.stepTriggeredSide = 'R';
    }
    this.prevLeftStance = leftPlanted;
    this.prevRightStance = rightPlanted;

    // 1. Pelvis 6-DOF Biomechanics:
    // - Double-bump vertical COM oscillation (2 cycles per full stride)
    const doubleBump = Math.sin(this.gaitPhase * Math.PI * 4 - Math.PI * 0.35);
    const bobAmp = lerp(0.018, 0.048, runBlend) * moveBlend;
    const crouchDrop = input.crouchAmount * 0.27;
    const slopeDrop = Math.abs(input.groundSlopePitchRad) * 0.06;
    const minGroundOffset = Math.min(input.leftGroundDeltaY, input.rightGroundDeltaY, 0) * 0.65;
    const idleBreath = (1 - moveBlend) * Math.sin(input.timeSec * 2.1) * 0.008;

    const pelvisY =
      HIP_REST_HEIGHT -
      0.035 * moveBlend -
      crouchDrop -
      slopeDrop -
      this.landingCompression +
      minGroundOffset +
      bobAmp * doubleBump +
      idleBreath;

    // Lateral weight shift over active stance leg + pelvic list + axial yaw rotation
    const strideWave = Math.sin(this.gaitPhase * Math.PI * 2);
    const lateralShiftX = -strideWave * lerp(0.032, 0.018, runBlend) * moveBlend;
    const pelvicListRoll = strideWave * lerp(0.065, 0.085, runBlend) * moveBlend;
    const pelvicYaw = strideWave * lerp(0.09, 0.14, runBlend) * moveBlend;
    const turnBankRoll = clamp(-this.smoothedYawRate * speed * 0.026, -0.22, 0.22);

    rig.pelvis.position.set(lateralShiftX, pelvisY, 0);
    rig.pelvis.rotation.set(
      input.crouchAmount * 0.18 + lerp(0.02, 0.14, runBlend) * moveBlend,
      pelvicYaw,
      pelvicListRoll + turnBankRoll,
    );

    // 2. Spine Counter-Rotation, Breathing & Weapon Aim / Recoil Pitch
    const forwardLean = lerp(0.03, 0.16, runBlend) * moveBlend + input.crouchAmount * 0.24;
    const spineCounterYaw = -pelvicYaw * 1.15;
    const aimTwistYaw = input.armed ? lerp(0.18, 0.32, input.aimAmount) : 0;
    const aimSpinePitch = input.armed ? -input.aimPitchRad * 0.45 : 0;
    const breathPitch = Math.sin(input.timeSec * 2.2) * 0.014;

    rig.spineLower.rotation.set(
      forwardLean * 0.55 - this.recoilAmount * 0.08,
      spineCounterYaw * 0.5,
      -pelvicListRoll * 0.5,
    );
    rig.spineUpper.rotation.set(
      forwardLean * 0.45 + aimSpinePitch + breathPitch - this.recoilAmount * 0.14,
      spineCounterYaw * 0.65 - aimTwistYaw,
      -pelvicListRoll * 0.4,
    );

    // Head stabilization + target tracking
    rig.neck.rotation.set(-forwardLean * 0.45, aimTwistYaw * 0.5, 0);
    rig.head.rotation.set(
      -input.aimPitchRad * (input.armed ? 0.45 : 0.75) - forwardLean * 0.35,
      aimTwistYaw * 0.5,
      -turnBankRoll * 0.4,
    );

    // 3. Analytical Two-Bone Foot IK + Heel-Strike -> Flat-Foot -> Toe-Off Ankle Roll
    const strideLen = lerp(0.32, 0.66, runBlend) * moveBlend;
    const strafeRatio = speed > 0.2 ? clamp(input.strafeSpeed / Math.max(speed, 0.5), -1, 1) : 0;
    const fwdSign = input.forwardSpeed < -0.25 ? -1 : 1;

    const footL = this.sampleFootCycle(phaseL, duty, strideLen * fwdSign, runBlend, moveBlend);
    const footR = this.sampleFootCycle(phaseR, duty, strideLen * fwdSign, runBlend, moveBlend);

    // Hip socket origins in root space (accounting for pelvis shift/list/yaw)
    _hipL.set(-HIP_HALF_WIDTH, 0, 0).applyEuler(rig.pelvis.rotation).add(rig.pelvis.position);
    _hipR.set(HIP_HALF_WIDTH, 0, 0).applyEuler(rig.pelvis.rotation).add(rig.pelvis.position);

    const stanceWidth = HIP_HALF_WIDTH + input.crouchAmount * 0.03;
    _targetL.set(
      -stanceWidth + footL.forwardZ * strafeRatio * 0.45,
      ANKLE_HEIGHT + footL.liftY + clamp(input.leftGroundDeltaY, -0.32, 0.42) * (leftPlanted ? 1 : 0.35),
      -footL.forwardZ * (1 - Math.abs(strafeRatio) * 0.35),
    );
    _targetR.set(
      stanceWidth + footR.forwardZ * strafeRatio * 0.45,
      ANKLE_HEIGHT + footR.liftY + clamp(input.rightGroundDeltaY, -0.32, 0.42) * (rightPlanted ? 1 : 0.35),
      -footR.forwardZ * (1 - Math.abs(strafeRatio) * 0.35),
    );

    // Pole vectors push knees naturally forward (-Z) with slight outward athletic splay
    _poleL.set(-0.12 - input.crouchAmount * 0.08, 0.05, -1.0).normalize();
    _poleR.set(0.12 + input.crouchAmount * 0.08, 0.05, -1.0).normalize();

    const ikL = solveTwoBoneIKPositions(_hipL, _targetL, _poleL, UPPER_LEG_LEN, LOWER_LEG_LEN, _kneeL, _ankleL);
    const ikR = solveTwoBoneIKPositions(_hipR, _targetR, _poleR, UPPER_LEG_LEN, LOWER_LEG_LEN, _kneeR, _ankleR);

    this.applyLegTransforms(rig, 'L', _hipL, ikL.midPos, ikL.endPos, footL.anklePitch, footL.toeBend);
    this.applyLegTransforms(rig, 'R', _hipR, ikR.midPos, ikR.endPos, footR.anklePitch, footR.toeBend);

    // 4. Arms, Clavicles, Elbows & Hands (Contra-lateral Swing OR Two-Handed Weapon Grip/ADS)
    if (input.armed) {
      this.solveArmedUpperBody(rig, input, moveBlend, runBlend);
    } else {
      this.solveUnarmedArmSwing(rig, phaseL, phaseR, moveBlend, runBlend, input.timeSec);
    }

    this.telemetry.gaitPhase = this.gaitPhase;
    this.telemetry.cadenceHz = cadenceHz;
    this.telemetry.leftFootPlanted = leftPlanted;
    this.telemetry.rightFootPlanted = rightPlanted;
    this.telemetry.leftKneeBendRad = ikL.bendAngleRad;
    this.telemetry.rightKneeBendRad = ikR.bendAngleRad;
    this.telemetry.pelvisOffsetY = pelvisY - HIP_REST_HEIGHT;
    return this.telemetry;
  }

  private sampleFootCycle(
    phase: number,
    duty: number,
    strideAmp: number,
    runBlend: number,
    moveBlend: number,
  ): { forwardZ: number; liftY: number; anklePitch: number; toeBend: number } {
    if (moveBlend < 0.02) {
      return { forwardZ: 0, liftY: 0, anklePitch: 0, toeBend: 0 };
    }

    if (phase < duty) {
      // Stance phase: foot sweeps from +strideAmp (in front) -> -strideAmp (behind)
      const u = phase / duty; // 0 = heel-strike, 1 = toe-off
      const forwardZ = lerp(strideAmp, -strideAmp, u);

      // Heel-strike dorsiflexion (+0.30 rad) -> flat mid-stance (0) -> plantarflexion push-off (-0.46 rad)
      let anklePitch = 0;
      let toeBend = 0;
      let liftY = 0;
      if (u < 0.24) {
        anklePitch = lerp(0.32, 0, u / 0.24) * moveBlend;
      } else if (u > 0.68) {
        const pushT = (u - 0.68) / 0.32;
        anklePitch = -lerp(0, 0.46, pushT) * moveBlend;
        toeBend = lerp(0, 0.58, pushT) * moveBlend;
        liftY = Math.sin(pushT * Math.PI * 0.5) * 0.035 * moveBlend;
      }
      return { forwardZ, liftY, anklePitch, toeBend };
    }

    // Swing phase: cycloidal foot clearance arc + toe dorsiflexion so toes clear curbs/sand
    const sw = (phase - duty) / (1 - duty); // 0 = lift-off, 1 = next heel-strike
    const smoothSw = sw * sw * (3 - 2 * sw);
    const forwardZ = lerp(-strideAmp, strideAmp, smoothSw);
    const clearancePeak = lerp(0.11, 0.24, runBlend) * moveBlend;
    const liftY = Math.sin(Math.pow(sw, 0.82) * Math.PI) * clearancePeak;
    const anklePitch = lerp(-0.38, 0.3, smoothSw) * moveBlend;
    const toeBend = lerp(0.45, 0, saturate(sw * 2.2)) * moveBlend;

    return { forwardZ, liftY, anklePitch, toeBend };
  }

  private applyLegTransforms(
    rig: HumanoidRig,
    side: 'L' | 'R',
    hipPos: THREE.Vector3,
    kneePos: THREE.Vector3,
    anklePos: THREE.Vector3,
    anklePitch: number,
    toeBend: number,
  ): void {
    const upperLeg = side === 'L' ? rig.upperLegL : rig.upperLegR;
    const lowerLeg = side === 'L' ? rig.lowerLegL : rig.lowerLegR;
    const foot = side === 'L' ? rig.footL : rig.footR;
    const toe = side === 'L' ? rig.toeL : rig.toeR;

    upperLeg.position.copy(hipPos);
    orientLimbSegment(hipPos, kneePos, _fwdHint, upperLeg.quaternion);

    lowerLeg.position.copy(kneePos);
    orientLimbSegment(kneePos, anklePos, _fwdHint, lowerLeg.quaternion);

    foot.position.copy(anklePos);
    foot.rotation.set(anklePitch, 0, 0);
    toe.rotation.set(toeBend, 0, 0);
  }

  private solveUnarmedArmSwing(
    rig: HumanoidRig,
    phaseL: number,
    phaseR: number,
    moveBlend: number,
    runBlend: number,
    timeSec: number,
  ): void {
    // Contra-lateral arm swing: Left arm swings forward with Right leg!
    const swingAmp = lerp(0.32, 0.82, runBlend) * moveBlend;
    const waveL = Math.sin(phaseR * Math.PI * 2);
    const waveR = Math.sin(phaseL * Math.PI * 2);
    const idleSway = (1 - moveBlend) * Math.sin(timeSec * 1.7) * 0.035;

    // Clavicle protraction/elevation with arm swing
    rig.clavicleL.rotation.set(0, -waveL * 0.09 * moveBlend, -0.04 - moveBlend * 0.03);
    rig.clavicleR.rotation.set(0, waveR * 0.09 * moveBlend, 0.04 + moveBlend * 0.03);

    // Shoulder pitch + slight cross-body adduction during forward swing
    rig.upperArmL.rotation.set(
      waveL * swingAmp + idleSway,
      -Math.max(0, waveL) * 0.14 * moveBlend,
      0.11 + runBlend * 0.06,
    );
    rig.upperArmR.rotation.set(
      waveR * swingAmp - idleSway,
      Math.max(0, waveR) * 0.14 * moveBlend,
      -0.11 - runBlend * 0.06,
    );

    // Elbow flexion: ~0.28 rad relaxed pendulum at walk -> ~1.42 rad compact pump at sprint!
    const baseElbow = lerp(0.24, 1.38, runBlend) * moveBlend + 0.12 * (1 - moveBlend);
    rig.lowerArmL.rotation.set(baseElbow + Math.max(0, waveL) * 0.35 * moveBlend, 0, 0);
    rig.lowerArmR.rotation.set(baseElbow + Math.max(0, waveR) * 0.35 * moveBlend, 0, 0);

    // Secondary wrist lag & finger relaxation
    const wristLagL = Math.sin(phaseR * Math.PI * 2 - 0.55) * 0.16 * moveBlend;
    const wristLagR = Math.sin(phaseL * Math.PI * 2 - 0.55) * 0.16 * moveBlend;
    rig.handL.rotation.set(wristLagL, 0, 0.08);
    rig.handR.rotation.set(wristLagR, 0, -0.08);
  }

  private solveArmedUpperBody(
    rig: HumanoidRig,
    input: BiomechanicsInput,
    moveBlend: number,
    runBlend: number,
  ): void {
    const ads = input.aimAmount;
    const bob = Math.sin(this.gaitPhase * Math.PI * 4) * 0.035 * moveBlend * (1 - ads * 0.7);
    const sway = Math.sin(input.timeSec * 1.9) * 0.015 * (1 - ads * 0.65);
    const pitch = clamp(-input.aimPitchRad * 0.55, -0.75, 0.75);
    const kick = this.recoilAmount;

    rig.clavicleR.rotation.set(0, 0.12, 0.05);
    rig.clavicleL.rotation.set(0, -0.26, -0.04);

    // Right trigger arm raises weapon from tactical low-ready into crisp eye-line ADS
    rig.upperArmR.rotation.set(
      lerp(0.68, 1.18, ads) + pitch + bob + kick * 0.24,
      lerp(0.18, 0.34, ads) + sway,
      lerp(-0.18, -0.06, ads),
    );
    rig.lowerArmR.rotation.set(lerp(0.95, 0.62, ads) + kick * 0.28, 0.12, 0);
    rig.handR.rotation.set(lerp(-0.12, -0.24, ads), 0, 0);

    // Left support arm reaches across chest to cradle the foregrip barrel!
    rig.upperArmL.rotation.set(
      lerp(0.84, 1.24, ads) + pitch + bob * 0.9 + kick * 0.2,
      lerp(-0.56, -0.68, ads),
      lerp(0.24, 0.14, ads) + runBlend * 0.04,
    );
    rig.lowerArmL.rotation.set(lerp(0.88, 0.66, ads) + kick * 0.18, -0.32, 0);
    rig.handL.rotation.set(0.1, 0.45, 0.22);
  }

  private solveFreefallPose(rig: HumanoidRig, input: BiomechanicsInput): BiomechanicsTelemetry {
    const flutter = Math.sin(input.timeSec * 22) * 0.05;
    const diveBlend = saturate((Math.abs(input.verticalSpeed) - 38) / 18);

    rig.pelvis.position.set(0, HIP_REST_HEIGHT, 0);
    rig.pelvis.rotation.set(-1.18 - diveBlend * 0.32, 0, clamp(-input.steerInput * 0.45, -0.5, 0.5));
    rig.spineLower.rotation.set(-0.14, 0, 0);
    rig.spineUpper.rotation.set(-0.16, 0, 0);
    rig.head.rotation.set(0.55, 0, 0);

    // Skydiving arch: wide delta arms swept back in belly flight, tucked in steep dive
    const spread = lerp(1.15, 0.35, diveBlend);
    rig.upperArmL.rotation.set(0.35 + flutter, 0.25, spread);
    rig.upperArmR.rotation.set(0.35 - flutter, -0.25, -spread);
    rig.lowerArmL.rotation.set(0.55 + flutter * 0.8, 0, 0);
    rig.lowerArmR.rotation.set(0.55 - flutter * 0.8, 0, 0);

    // Bent knees trailing in slipstream
    _hipL.set(-HIP_HALF_WIDTH - 0.06, HIP_REST_HEIGHT, 0.12);
    _hipR.set(HIP_HALF_WIDTH + 0.06, HIP_REST_HEIGHT, 0.12);
    _kneeL.set(-0.2, HIP_REST_HEIGHT - 0.18, 0.48);
    _kneeR.set(0.2, HIP_REST_HEIGHT - 0.18, 0.48);
    _ankleL.set(-0.22, HIP_REST_HEIGHT + 0.12 + flutter * 0.4, 0.78);
    _ankleR.set(0.22, HIP_REST_HEIGHT + 0.12 - flutter * 0.4, 0.78);

    this.applyLegTransforms(rig, 'L', _hipL, _kneeL, _ankleL, -0.35, 0);
    this.applyLegTransforms(rig, 'R', _hipR, _kneeR, _ankleR, -0.35, 0);

    this.telemetry.leftFootPlanted = false;
    this.telemetry.rightFootPlanted = false;
    this.telemetry.cadenceHz = 0;
    return this.telemetry;
  }

  private solveCanopyPose(rig: HumanoidRig, input: BiomechanicsInput): BiomechanicsTelemetry {
    const sway = Math.sin(input.timeSec * 2.4) * 0.04;
    const bank = clamp(-input.steerInput * 0.38, -0.42, 0.42);

    rig.pelvis.position.set(0, HIP_REST_HEIGHT, 0);
    rig.pelvis.rotation.set(0.12, 0, bank);
    rig.spineLower.rotation.set(0.05, 0, 0);
    rig.spineUpper.rotation.set(0.06, 0, 0);
    rig.head.rotation.set(-0.12, -input.steerInput * 0.25, 0);

    // Hands raised overhead gripping ram-air steering toggles; banking pulls inner toggle down!
    const pullL = Math.max(0, -input.steerInput) * 0.65;
    const pullR = Math.max(0, input.steerInput) * 0.65;
    rig.upperArmL.rotation.set(2.55 - pullL, 0, 0.28);
    rig.upperArmR.rotation.set(2.55 - pullR, 0, -0.28);
    rig.lowerArmL.rotation.set(0.42 + pullL * 0.9, 0, 0);
    rig.lowerArmR.rotation.set(0.42 + pullR * 0.9, 0, 0);

    // Suspended harness legs dangling gently in slipstream
    _hipL.set(-HIP_HALF_WIDTH, HIP_REST_HEIGHT, 0);
    _hipR.set(HIP_HALF_WIDTH, HIP_REST_HEIGHT, 0);
    _kneeL.set(-HIP_HALF_WIDTH - 0.02, HIP_REST_HEIGHT - 0.41, 0.08 + sway);
    _kneeR.set(HIP_HALF_WIDTH + 0.02, HIP_REST_HEIGHT - 0.39, 0.14 - sway);
    _ankleL.set(-HIP_HALF_WIDTH - 0.02, HIP_REST_HEIGHT - 0.79, 0.22 + sway);
    _ankleR.set(HIP_HALF_WIDTH + 0.02, HIP_REST_HEIGHT - 0.76, 0.28 - sway);

    this.applyLegTransforms(rig, 'L', _hipL, _kneeL, _ankleL, -0.25, 0.15);
    this.applyLegTransforms(rig, 'R', _hipR, _kneeR, _ankleR, -0.25, 0.15);

    this.telemetry.leftFootPlanted = false;
    this.telemetry.rightFootPlanted = false;
    return this.telemetry;
  }

  private solveSwimmingPose(rig: HumanoidRig, input: BiomechanicsInput): BiomechanicsTelemetry {
    const move = saturate(this.smoothedSpeed / 1.5);
    const stroke = input.timeSec * lerp(2.2, 5.2, move);
    const sL = Math.sin(stroke);
    const sR = Math.sin(stroke + Math.PI);

    // Prone streamline trim when swimming forward, upright treading water when stationary
    const pronePitch = lerp(-0.22, -1.15, move);
    rig.pelvis.position.set(0, HIP_REST_HEIGHT - lerp(0.12, 0.35, move), 0);
    rig.pelvis.rotation.set(pronePitch, 0, Math.sin(stroke) * 0.14 * move);
    rig.spineLower.rotation.set(0.08, 0, 0);
    rig.spineUpper.rotation.set(0.14, -Math.sin(stroke) * 0.16 * move, 0);
    rig.head.rotation.set(-pronePitch * 0.82, 0, 0);

    // Freestyle / breaststroke alternating arm pull
    rig.upperArmL.rotation.set(1.25 + sL * lerp(0.35, 1.15, move), 0, 0.38);
    rig.upperArmR.rotation.set(1.25 + sR * lerp(0.35, 1.15, move), 0, -0.38);
    rig.lowerArmL.rotation.set(0.55 + Math.max(0, -sL) * 0.5, 0, 0);
    rig.lowerArmR.rotation.set(0.55 + Math.max(0, -sR) * 0.5, 0, 0);

    // Flutter kick
    _hipL.set(-HIP_HALF_WIDTH, rig.pelvis.position.y, 0);
    _hipR.set(HIP_HALF_WIDTH, rig.pelvis.position.y, 0);
    _kneeL.set(-HIP_HALF_WIDTH, rig.pelvis.position.y - 0.22 + sL * 0.08, 0.36);
    _kneeR.set(HIP_HALF_WIDTH, rig.pelvis.position.y - 0.22 + sR * 0.08, 0.36);
    _ankleL.set(-HIP_HALF_WIDTH, rig.pelvis.position.y - 0.36 + sL * 0.18, 0.72);
    _ankleR.set(HIP_HALF_WIDTH, rig.pelvis.position.y - 0.36 + sR * 0.18, 0.72);

    this.applyLegTransforms(rig, 'L', _hipL, _kneeL, _ankleL, -0.45, 0);
    this.applyLegTransforms(rig, 'R', _hipR, _kneeR, _ankleR, -0.45, 0);

    this.telemetry.leftFootPlanted = false;
    this.telemetry.rightFootPlanted = false;
    return this.telemetry;
  }

  private solveSeatedVehiclePose(rig: HumanoidRig, input: BiomechanicsInput): BiomechanicsTelemetry {
    const steer = clamp(input.steerInput, -1, 1);

    rig.pelvis.position.set(0, 0.52, 0.08);
    rig.pelvis.rotation.set(-0.08, 0, -steer * 0.08);
    rig.spineLower.rotation.set(0.06, 0, 0);
    rig.spineUpper.rotation.set(0.12, -steer * 0.1, -steer * 0.08);
    rig.head.rotation.set(-0.06, -steer * 0.22, 0);

    // Hands gripping steering wheel / watercraft handlebars and rotating with steer angle!
    rig.upperArmL.rotation.set(0.95 + steer * 0.22, -0.18, 0.12);
    rig.upperArmR.rotation.set(0.95 - steer * 0.22, 0.18, -0.12);
    rig.lowerArmL.rotation.set(0.55, 0, 0);
    rig.lowerArmR.rotation.set(0.55, 0, 0);

    _hipL.set(-HIP_HALF_WIDTH - 0.02, 0.52, 0.08);
    _hipR.set(HIP_HALF_WIDTH + 0.02, 0.52, 0.08);
    _kneeL.set(-0.15, 0.56, -0.34);
    _kneeR.set(0.15, 0.56, -0.34);
    _ankleL.set(-0.15, 0.18, -0.52);
    _ankleR.set(0.15, 0.18, -0.52);

    this.applyLegTransforms(rig, 'L', _hipL, _kneeL, _ankleL, 0.15, 0);
    this.applyLegTransforms(rig, 'R', _hipR, _kneeR, _ankleR, 0.15, 0);

    this.telemetry.leftFootPlanted = false;
    this.telemetry.rightFootPlanted = false;
    return this.telemetry;
  }
}
