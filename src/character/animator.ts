import { type Object3D, Quaternion, Vector3 } from 'three';
import { CG } from '../core/config';
import { angleDiff, clamp, clamp01, damp, lerp, smoothstep, Spring, yawFromDir } from '../core/math';
import type { Physics } from '../physics/physics';
import { type BakedClip, BONE, type ClipBank, Pose } from './clips';
import { aimBone, rotateWorldAxis, setWorldQuaternion, solveTwoBone, translateWorld } from './ik';
import type { CharacterRig } from './rig';

export type AnimMode = 'ground' | 'air' | 'swim' | 'slide' | 'seat' | 'dead' | 'pose';

export interface OneShotOptions {
  /** 'upper' plays on the torso and arms while the legs keep moving; 'full' takes the whole body. */
  layer?: 'upper' | 'full';
  speed?: number;
  fadeIn?: number;
  fadeOut?: number;
  /** Start position as a fraction of the clip. */
  from?: number;
  /** Stay on the last frame instead of fading out. */
  hold?: boolean;
  weight?: number;
}

interface OneShot {
  clip: BakedClip;
  time: number;
  speed: number;
  full: boolean;
  fadeIn: number;
  fadeOut: number;
  hold: boolean;
  gain: number;
}

interface Foot {
  thigh: Object3D;
  shin: Object3D;
  foot: Object3D;
  toe: Object3D;
  planted: boolean;
  /** World position the ankle is pinned to while planted. */
  lock: Vector3;
  /** World position of the toe while planted: the pin moves there once the heel lifts. */
  toeLock: Vector3;
  lockYaw: number;
  /** Turn applied this frame to keep a planted foot from spinning. */
  lockYawFix: number;
  /** Leftover offset after release, blended out. */
  release: Vector3;
  groundOffset: number;
  normal: Vector3;
  stepping: number;
  stepFrom: Vector3;
  stepYawFrom: number;
  last: Vector3;
  lastOnToe: boolean;
  hasLast: boolean;
  /** Animated ankle position relative to the body last frame, to tell stance from swing. */
  relX: number;
  relZ: number;
  hasRel: boolean;
}

const UP = new Vector3(0, 1, 0);
const _v = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _hip = new Vector3();
const _knee = new Vector3();
const _ankle = new Vector3();
const _toe = new Vector3();
const _target = new Vector3();
const _pole = new Vector3();
const _q = new Quaternion();
const _q2 = new Quaternion();
const _q3 = new Quaternion();
const _right = new Vector3();
const _fwd = new Vector3();

/** How fast each locomotion clip may be played relative to its authored speed before strides are stretched instead. */
const MAX_RATE = 1.45;
const MAX_RATE_CROUCH = 1.75;
/** Below this speed the walk fades into the idle. */
const MOVE_BLEND = 0.55;
/** How far the hips may sink to let a planted foot keep its place, in metres. */
const REACH_DROP = 0.12;
/** Speeds between which the walk hands over to the run. Nobody holds a pace in between for long. */
const RUN_FROM = 2.1;
const RUN_FULL = 3.3;

/**
 * Turns movement state into a pose every frame.
 *
 * Layers, in order: a base pose from blended clips (speed-matched and phase-synced locomotion, crouch,
 * air, swim, slide, seat, death), an upper-body layer for weapon stances and one-shot actions, then
 * procedural passes on the skeleton: leg orientation warping with a counter-twisted spine, lean into
 * acceleration, pelvis and foot IK with foot locking and stepping, head tracking, breathing and recoil.
 */
export class Animator {
  // Inputs, set by the owner before `update`.
  /** Feet position to draw at (already interpolated between physics steps). */
  readonly position = new Vector3();
  readonly velocity = new Vector3();
  /** Body yaw. 0 faces -Z, positive turns left. */
  facing = 0;
  aimYaw = 0;
  aimPitch = 0;
  mode: AnimMode = 'ground';
  crouched = false;
  /** 1 when the upper body should hold the weapon up toward the aim direction. */
  upperAim = 0;
  /** True when the right hand holds something, so its fingers stay curled. */
  holding = false;
  /** Point to look at. When null the head follows the aim direction. */
  lookAt: Vector3 | null = null;
  /** 0 full quality, 1 no IK or head tracking (distant characters). */
  lod = 0;
  /** Clip used in 'seat' mode. */
  seatClip = 'Sitting_Idle_Loop';
  /** Called in 'pose' mode after the rest pose is applied, to shape the body procedurally. */
  poseFn: ((rig: CharacterRig, dt: number) => void) | null = null;
  /** Fired when a foot comes down while moving. */
  onFootstep: ((side: number, speed: number) => void) | null = null;
  /** Extra downward offset of the whole body in metres (sinking into a seat, swimming depth). */
  bodyOffsetY = 0;

  // Outputs for other systems and tests.
  readonly metrics = { footError: 0, slide: 0, travel: 0, leanRoll: 0, leanPitch: 0, twist: 0, headError: 0, strideRate: 0, legWarp: 0, plantedL: false, plantedR: false, pelvis: 0, stretch: 0, lockErr: 0, strideScale: 1, footErrorMax: 0 };
  /** Normalised stride phase, 0..1. The left foot strikes near 0 and the right near 0.5. */
  phase = 0;
  exertion = 0;

  private base: Pose;
  private scratch: Pose;
  private scratch2: Pose;
  private snapshot: Pose;
  private finalBase: Pose;
  private fade = 1;
  private fadeDur = 0.2;
  private key = '';
  private idleTime = Math.random() * 3;
  private airTime = 0;
  private jumped = false;
  private modeTime = 0;
  private crouchW = 0;
  private backward = false;
  private legWarp = 0;
  private upperW = 0;
  private gripW = 0;
  private oneShots: OneShot[] = [];
  private upperMask: Float32Array;
  private fingerMask: Float32Array;
  private feet: Foot[];
  private ikW = 0;
  private pelvis = 0;
  private visualY = 0;
  private hasVisualY = false;
  private readonly accel = new Vector3();
  private readonly lastVel = new Vector3();
  private leanPitch = 0;
  private leanRoll = 0;
  private landSpring = new Spring(0, 0.12);
  private kickSpring = new Spring(0, 0.06);
  private flinchPitch = new Spring(0, 0.07);
  private flinchRoll = new Spring(0, 0.07);
  private breath = Math.random() * 6;
  private readonly lookDir = new Vector3(0, 0, -1);
  private hasLook = false;
  private clips: Record<string, BakedClip>;
  private headFwd: Vector3;
  private chestFwd: Vector3;
  private hipsFwd: Vector3;

  constructor(
    private bank: ClipBank,
    readonly rig: CharacterRig,
    private physics: Physics,
  ) {
    const n = bank.boneCount;
    this.base = new Pose(n);
    this.scratch = new Pose(n);
    this.scratch2 = new Pose(n);
    this.snapshot = new Pose(n);
    this.finalBase = new Pose(n).copy(bank.rest);
    this.upperMask = bank.mask([BONE.spine1], { [BONE.spine1]: 0.2, [BONE.spine2]: 0.45, [BONE.spine3]: 0.75, [BONE.neck]: 0.6, [BONE.head]: 0.4 });
    this.fingerMask = bank.mask([BONE.handR], { [BONE.handR]: 0 });
    this.clips = {};
    for (const [name, clip] of bank.clips) this.clips[name] = clip;
    const b = rig.b;
    const foot = (thigh: Object3D, shin: Object3D, f: Object3D, toe: Object3D): Foot => ({
      thigh,
      shin,
      foot: f,
      toe,
      planted: false,
      lock: new Vector3(),
      toeLock: new Vector3(),
      lockYaw: 0,
      lockYawFix: 0,
      release: new Vector3(),
      groundOffset: 0,
      normal: new Vector3(0, 1, 0),
      stepping: 0,
      stepFrom: new Vector3(),
      stepYawFrom: 0,
      last: new Vector3(),
      lastOnToe: false,
      hasLast: false,
      relX: 0,
      relZ: 0,
      hasRel: false,
    });
    this.feet = [foot(b.thighL, b.shinL, b.footL, b.toeL), foot(b.thighR, b.shinR, b.footR, b.toeR)];
    // Which way the head points, in its own bone space, measured in the T pose where it faces +Z.
    bank.apply(bank.rest, rig.bones);
    rig.root.rotation.set(0, 0, 0);
    rig.root.updateMatrixWorld(true);
    this.headFwd = new Vector3(0, 0, 1).applyQuaternion(b.head.getWorldQuaternion(new Quaternion()).invert());
    this.chestFwd = new Vector3(0, 0, 1).applyQuaternion(b.spine3.getWorldQuaternion(new Quaternion()).invert());
    this.hipsFwd = new Vector3(0, 0, 1).applyQuaternion(b.hips.getWorldQuaternion(new Quaternion()).invert());
    b.shinL.getWorldPosition(_knee);
    this.legLength = b.thighL.getWorldPosition(_hip).distanceTo(_knee) + b.footL.getWorldPosition(_ankle).distanceTo(_knee);
  }

  /** Play a clip once on top of the base pose. */
  play(name: string, o: OneShotOptions = {}): void {
    const clip = this.clips[name];
    if (!clip) return;
    const full = o.layer === 'full';
    // One action per layer: a new one replaces the old.
    this.oneShots = this.oneShots.filter((s) => s.full !== full);
    this.oneShots.push({ clip, time: (o.from ?? 0) * clip.duration, speed: o.speed ?? 1, full, fadeIn: o.fadeIn ?? 0.12, fadeOut: o.fadeOut ?? 0.18, hold: o.hold ?? false, gain: o.weight ?? 1 });
  }

  stop(layer: 'upper' | 'full'): void {
    this.oneShots = this.oneShots.filter((s) => s.full !== (layer === 'full'));
  }

  /** True while a one-shot is playing on a layer. */
  playing(layer: 'upper' | 'full'): boolean {
    return this.oneShots.some((s) => s.full === (layer === 'full'));
  }

  /** Call when a jump starts so the take-off pose plays. */
  jump(): void {
    this.jumped = true;
    this.airTime = 0;
  }

  /** Call on touchdown with the impact speed in m/s. */
  land(impact: number): void {
    // The knees take the fall: about 13 cm of give from a jump, up to 29 cm from a long drop.
    this.landSpring.velocity -= clamp(impact * 0.55, 1.5, 9);
    const sp = Math.hypot(this.velocity.x, this.velocity.z);
    if (impact > 6.5 && sp < 2.2) this.play('Jump_Land', { layer: 'full', from: 0.12, speed: 1.5, fadeIn: 0.05, fadeOut: 0.3, weight: clamp01((impact - 4) / 8) });
  }

  /** Recoil kick through the spine. */
  kick(strength: number): void {
    this.kickSpring.velocity += strength * 3.2;
  }

  /** Flinch away from a hit. `dx, dz` is the world direction the hit travelled. */
  flinch(dx: number, dz: number, strength: number): void {
    const f = this.facing;
    const fwd = dx * -Math.sin(f) + dz * -Math.cos(f);
    const right = dx * Math.cos(f) + dz * -Math.sin(f);
    this.flinchPitch.velocity += -fwd * strength * 5;
    this.flinchRoll.velocity += right * strength * 5;
  }

  /** Forget smoothing state after a teleport. */
  reset(): void {
    this.hasVisualY = false;
    this.hasLook = false;
    this.fade = 1;
    this.key = '';
    this.pelvis = 0;
    this.reachDrop = 0;
    this.hasLastPos = false;
    this.landSpring.reset(0);
    this.accel.set(0, 0, 0);
    this.lastVel.copy(this.velocity);
    for (const f of this.feet) {
      f.planted = false;
      f.release.set(0, 0, 0);
      f.groundOffset = 0;
      f.stepping = 0;
      f.hasLast = false;
      f.hasRel = false;
    }
  }

  update(dt: number): void {
    const bank = this.bank;
    const rig = this.rig;
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    this.modeTime += dt;

    // --- Base pose -------------------------------------------------------------------------------
    let key: string = this.mode;
    let fadeDur = 0.2;
    const base = this.base;
    if (this.mode === 'ground') {
      this.updateWarp(dt, speed);
      key = this.backward ? 'ground-b' : 'ground';
      this.evalGround(base, dt, speed);
      fadeDur = 0.16;
    } else if (this.mode === 'air') {
      this.airTime += dt;
      const loop = this.clips['Jump_Loop']!;
      bank.sample(loop, this.airTime, base);
      if (this.jumped) {
        const start = this.clips['Jump_Start']!;
        bank.sample(start, lerp(0.74, 1, clamp01(this.airTime / 0.2)) * start.duration, this.scratch);
        base.blend(this.scratch, 1 - smoothstep(0.1, 0.36, this.airTime));
      }
      this.legWarp = damp(this.legWarp, 0, 8, dt);
      fadeDur = 0.14;
    } else if (this.mode === 'swim') {
      const idle = this.clips['Swim_Idle_Loop']!;
      const fwd = this.clips['Swim_Fwd_Loop']!;
      this.idleTime += dt;
      this.phase = (this.phase + dt * (0.45 + speed * 0.22)) % 1;
      bank.sample(idle, this.idleTime, base);
      bank.sample(fwd, this.phase * fwd.duration, this.scratch);
      base.blend(this.scratch, smoothstep(0.25, 1.5, speed));
      this.legWarp = damp(this.legWarp, 0, 8, dt);
      fadeDur = 0.35;
    } else if (this.mode === 'slide') {
      const start = this.clips['Slide_Start']!;
      const loop = this.clips['Slide_Loop']!;
      bank.sample(loop, this.modeTime, base);
      if (this.modeTime < 0.3) {
        bank.sample(start, lerp(0.45, 1, this.modeTime / 0.3) * start.duration, this.scratch);
        base.blend(this.scratch, 1 - smoothstep(0.1, 0.3, this.modeTime));
      }
      this.legWarp = damp(this.legWarp, 0, 12, dt);
      fadeDur = 0.14;
    } else if (this.mode === 'seat') {
      const c = this.clips[this.seatClip] ?? this.clips['Sitting_Idle_Loop']!;
      this.idleTime += dt;
      bank.sample(c, this.idleTime, base);
      this.legWarp = 0;
      key = `seat-${this.seatClip}`;
      fadeDur = 0.25;
    } else if (this.mode === 'dead') {
      bank.sample(this.clips['Death01']!, this.modeTime, base);
      this.legWarp = damp(this.legWarp, 0, 6, dt);
      fadeDur = 0.12;
    } else {
      base.copy(bank.rest);
      this.legWarp = 0;
      fadeDur = 0.3;
    }
    if (this.mode !== 'air') {
      this.jumped = false;
      this.airTime = 0;
    }

    // Snapshot crossfade: on a state change, blend out of the last pose that was shown.
    if (key !== this.key) {
      if (this.key !== '') {
        this.snapshot.copy(this.finalBase);
        this.fade = 0;
        this.fadeDur = fadeDur;
      }
      this.key = key;
      this.modeTime = 0;
    }
    if (this.fade < 1) {
      this.fade = Math.min(1, this.fade + dt / this.fadeDur);
      const t = this.fade * this.fade * (3 - 2 * this.fade);
      base.blend(this.snapshot, 1 - t);
    }
    this.finalBase.copy(base);

    // --- Upper body and one-shots ---------------------------------------------------------------
    const out = base;
    const wantUpper = this.mode === 'ground' || this.mode === 'air' || this.mode === 'seat' ? this.upperAim : 0;
    this.upperW = damp(this.upperW, wantUpper, 14, dt);
    if (this.upperW > 0.002) {
      bank.sample(this.clips['Pistol_Aim_Neutral']!, 0, this.scratch);
      out.blend(this.scratch, this.upperW, this.upperMask);
    }
    this.gripW = damp(this.gripW, this.holding ? 1 : 0, 16, dt);
    if (this.gripW > 0.002) {
      bank.sample(this.clips['Pistol_Idle_Loop']!, 0, this.scratch);
      out.blend(this.scratch, this.gripW, this.fingerMask);
    }
    for (let i = this.oneShots.length - 1; i >= 0; i--) {
      const s = this.oneShots[i]!;
      s.time += dt * s.speed;
      const d = s.clip.duration;
      const over = s.time >= d;
      if (over && !s.hold && !s.clip.loop) {
        this.oneShots.splice(i, 1);
        continue;
      }
      let w = clamp01(s.time / Math.max(1e-3, s.fadeIn));
      if (!s.hold && !s.clip.loop) w = Math.min(w, clamp01((d - s.time) / Math.max(1e-3, s.fadeOut)));
      w = w * w * (3 - 2 * w) * s.gain;
      bank.sample(s.clip, s.time, this.scratch);
      if (s.full) out.blend(this.scratch, w);
      else out.blend(this.scratch, w, this.upperMask);
    }
    bank.apply(out, rig.bones);

    // --- Root placement, lean and leg warp ------------------------------------------------------
    const grounded = this.mode === 'ground';
    if (!this.hasVisualY || !grounded) {
      this.visualY = this.position.y;
      this.hasVisualY = true;
    } else {
      // Steps and kerbs move the capsule in jumps; the body glides over them and the legs do the work.
      this.visualY = damp(this.visualY, this.position.y, 16, dt);
      this.visualY = clamp(this.visualY, this.position.y - 0.5, this.position.y + 0.5);
    }
    this.updateLean(dt, speed, grounded);
    const land = this.landSpring.update(0, dt);
    rig.root.position.set(this.position.x, this.visualY + this.bodyOffsetY, this.position.z);
    rig.root.rotation.set(this.leanPitch, this.facing + Math.PI + this.legWarp, this.leanRoll, 'YXZ');

    if (this.mode === 'pose' && this.poseFn) {
      rig.root.updateMatrixWorld(true);
      this.poseFn(rig, dt);
    }

    // The spine turns back by the leg warp and on toward the aim direction.
    const upperYaw = lerp(0, angleDiff(this.facing, this.aimYaw), this.upperW);
    const twist = clamp(upperYaw - this.legWarp, -1.9, 1.9);
    this.metrics.twist = twist;
    this.metrics.legWarp = this.legWarp;
    const b = rig.b;
    if (this.mode !== 'dead' && this.mode !== 'pose') {
      if (Math.abs(twist) > 1e-4) {
        rotateWorldAxis(b.hips, UP, twist * 0.08);
        rotateWorldAxis(b.spine1, UP, twist * 0.24);
        rotateWorldAxis(b.spine2, UP, twist * 0.3);
        rotateWorldAxis(b.spine3, UP, twist * 0.38);
      }
      // Pitch toward the aim, breathing, recoil and flinch, all about the body's right axis.
      this.breath += dt * (1.5 + this.exertion * 3.4);
      const breathe = Math.sin(this.breath) * (0.008 + this.exertion * 0.022);
      const kick = this.kickSpring.update(0, dt);
      const fp = this.flinchPitch.update(0, dt);
      const fr = this.flinchRoll.update(0, dt);
      const yawNow = this.facing + this.legWarp + twist;
      _right.set(Math.cos(yawNow), 0, -Math.sin(yawNow));
      _fwd.set(-Math.sin(yawNow), 0, -Math.cos(yawNow));
      const pitch = this.aimPitch * this.upperW;
      rotateWorldAxis(b.spine2, _right, pitch * 0.22 + breathe + fp * 0.5);
      rotateWorldAxis(b.spine3, _right, pitch * 0.3 - breathe * 0.4 + kick * 0.35 + fp * 0.5);
      if (Math.abs(fr) > 1e-4) rotateWorldAxis(b.spine2, _fwd, fr);
    }

    // --- Legs ------------------------------------------------------------------------------------
    const wantIk = grounded && this.lod === 0 && !this.playing('full') ? 1 : 0;
    this.ikW = damp(this.ikW, wantIk, wantIk ? 14 : 22, dt);
    const dip = land;
    if (this.ikW > 0.01) this.solveLegs(dt, speed, dip);
    else {
      this.pelvis = damp(this.pelvis, 0, 12, dt);
      translateWorld(b.hips, 0, dip * 0.6, 0);
      this.metrics.pelvis = dip * 0.6;
      for (const f of this.feet) {
        f.planted = false;
        f.hasLast = false;
        f.hasRel = false;
        f.stepping = 0;
      }
      this.hasLastPos = false;
      this.metrics.plantedL = false;
      this.metrics.plantedR = false;
    }

    // --- Head ------------------------------------------------------------------------------------
    if (this.lod === 0 && this.mode !== 'dead') this.solveHead(dt);

    this.exertion = clamp01(this.exertion + (speed > 5.6 && grounded ? dt * 0.09 : -dt * 0.06));
  }

  /** Legs turn toward the direction of travel; beyond a right angle they run backward instead. */
  private updateWarp(dt: number, speed: number): void {
    let target = 0;
    if (speed > 0.35) {
      const moveYaw = yawFromDir(this.velocity.x, this.velocity.z);
      const rel = angleDiff(this.facing, moveYaw);
      const limit = this.backward ? 1.45 : 1.85;
      const back = Math.abs(rel) > limit;
      if (back !== this.backward) {
        this.backward = back;
        // The legs flip by half a turn: restart the warp at its new value under a crossfade.
        this.legWarp = back ? angleDiff(Math.PI, rel) : rel;
      }
      target = this.backward ? angleDiff(Math.PI, rel) : rel;
      target = clamp(target, -1.4, 1.4);
    } else if (speed < 0.15) {
      this.backward = false;
    }
    this.legWarp = damp(this.legWarp, target, 11, dt);
  }

  private evalGround(out: Pose, dt: number, speed: number): void {
    const bank = this.bank;
    const c = this.clips;
    this.crouchW = damp(this.crouchW, this.crouched ? 1 : 0, 11, dt);
    this.idleTime += dt;
    const dir = this.backward ? -1 : 1;
    const v = speed;
    const cw = this.crouchW;

    const walk = c['Walk_Loop']!;
    const jog = c['Jog_Fwd_Loop']!;
    const sprint = c['Sprint_Loop']!;
    const cIdle = c['Crouch_Idle_Loop']!;
    const cFwd = c['Crouch_Fwd_Loop']!;
    // Walking and running are different gaits, so each has its own clip and they only cross over a
    // narrow band of speeds. Inside a gait, speed changes cadence and stride length together.
    const run = smoothstep(RUN_FROM, RUN_FULL, v);
    const fast = clamp01((v - jog.speed) / (sprint.speed - jog.speed));
    const wWalk = 1 - run;
    const wJog = run * (1 - fast);
    const wSprint = run * fast;
    const moveW = clamp01(v / MOVE_BLEND);

    const stride = lerp(wWalk * walk.stride + wJog * jog.stride + wSprint * sprint.stride, cFwd.stride, cw);
    const cadence = lerp(wWalk / walk.duration + wJog / jog.duration + wSprint / sprint.duration, 1 / cFwd.duration, cw);
    let freq = 0;
    let scale = 1;
    if (v > 0.05) {
      // Share the change between longer steps and quicker ones, as people do.
      scale = clamp(Math.sqrt(v / (stride * cadence)), 0.62, 1.3);
      freq = clamp(v / (stride * scale), cadence * 0.5, cadence * lerp(MAX_RATE, MAX_RATE_CROUCH, cw));
      // Whatever the cadence cannot cover, the stride does. The fade into the idle already shortens steps.
      scale = clamp(v / (freq * stride * moveW), 0.5, 1.75);
    }
    this.strideScale = scale;
    this.metrics.strideRate = freq;
    this.metrics.strideScale = scale;
    this.phase = (this.phase + freq * dt * dir + 1) % 1;
    const ph = this.phase;

    if (cw < 0.999) {
      let acc = 0;
      const add = (clip: BakedClip, w: number): void => {
        if (w <= 0.001) return;
        bank.sample(clip, ph * clip.duration, this.scratch);
        acc += w;
        if (acc === w) out.copy(this.scratch);
        else out.blend(this.scratch, w / acc);
      };
      add(walk, wWalk);
      add(jog, wJog);
      add(sprint, wSprint);
      if (moveW < 0.999) {
        bank.sample(c['Idle_Loop']!, this.idleTime, this.scratch);
        out.blend(this.scratch, 1 - moveW);
      }
    }
    if (cw > 0.001) {
      const cp = cw < 0.999 ? this.scratch2 : out;
      bank.sample(cIdle, this.idleTime, cp);
      if (moveW > 0.001) {
        bank.sample(cFwd, ph * cFwd.duration, this.scratch);
        cp.blend(this.scratch, moveW);
      }
      if (cp !== out) out.blend(cp, cw);
    }
  }

  private strideScale = 1;
  private reachDrop = 0;
  private readonly lastPos = new Vector3();
  private hasLastPos = false;
  /** Hip to ankle with the knee straight. */
  private legLength = 0.83;

  /** Lean into acceleration: forward when speeding up, into the turn when the path curves. */
  private updateLean(dt: number, speed: number, grounded: boolean): void {
    if (dt > 0) {
      _v.subVectors(this.velocity, this.lastVel).multiplyScalar(1 / dt);
      _v.y = 0;
      if (_v.lengthSq() > 60 * 60) _v.setLength(60);
      const k = 1 - Math.exp(-7 * dt);
      this.accel.lerp(_v, k);
      this.lastVel.copy(this.velocity);
    }
    const f = this.facing;
    const aFwd = this.accel.x * -Math.sin(f) + this.accel.z * -Math.cos(f);
    const aRight = this.accel.x * Math.cos(f) + this.accel.z * -Math.sin(f);
    let pitch = 0;
    let roll = 0;
    if (grounded) {
      pitch = clamp(aFwd * 0.011, -0.1, 0.13) + clamp01((speed - 4.5) / 3) * 0.035;
      roll = clamp(aRight * 0.015, -0.17, 0.17);
    } else if (this.mode === 'swim') {
      pitch = clamp01(speed / 2.2) * 0.1;
    }
    this.leanPitch = damp(this.leanPitch, pitch, 9, dt);
    this.leanRoll = damp(this.leanRoll, roll, 9, dt);
    this.metrics.leanPitch = this.leanPitch;
    this.metrics.leanRoll = this.leanRoll;
  }

  /** Pelvis height, foot locking, stepping in place, ground contact and the leg IK itself. */
  private solveLegs(dt: number, speed: number, dip: number): void {
    const rig = this.rig;
    const b = rig.b;
    const rootY = rig.root.position.y;
    rig.root.updateMatrixWorld(true);
    const moving = speed > 0.5;
    let mvx = 0;
    let mvz = 0;
    if (speed > 0.2) {
      mvx = this.velocity.x / speed;
      mvz = this.velocity.z / speed;
    }
    const targets: Vector3[] = [_tA, _tB];
    const footQ: Quaternion[] = [_qA, _qB];
    const heights = [0, 0];
    const rawGround = [0, 0];
    const heelUp = [false, false];
    let lowest = 0;
    const otherStepping = [this.feet[1]!.stepping > 0, this.feet[0]!.stepping > 0];

    for (let s = 0; s < 2; s++) {
      const f = this.feet[s]!;
      f.foot.getWorldPosition(_ankle);
      f.toe.getWorldPosition(_toe);
      f.foot.getWorldQuaternion(footQ[s]!);
      const hA = _ankle.y - rootY;
      const hT = _toe.y - rootY;
      const yaw = Math.atan2(_toe.x - _ankle.x, _toe.z - _ankle.z);
      const t = targets[s]!.copy(_ankle);
      // Stretch or shorten the stride along the direction of travel when the clip rate is capped.
      if (this.strideScale !== 1 && speed > 0.2) {
        const along = (t.x - this.position.x) * mvx + (t.z - this.position.z) * mvz;
        t.x += mvx * along * (this.strideScale - 1);
        t.z += mvz * along * (this.strideScale - 1);
      }
      const animX = t.x;
      const animZ = t.z;

      // Contact: at a standstill both feet are down. In motion a foot is down while it travels backward
      // under the body (that is what a stance foot does in any gait) and is low; it lifts when it stops
      // travelling backward or rises.
      let down: boolean;
      const relX = animX - this.position.x;
      const relZ = animZ - this.position.z;
      let back = 0;
      if (f.hasRel && dt > 0) back = -((relX - f.relX) * mvx + (relZ - f.relZ) * mvz) / dt;
      f.relX = relX;
      f.relZ = relZ;
      f.hasRel = true;
      if (speed < 0.35) down = f.planted ? !(hT > 0.09 && hA > 0.17) : hT < 0.06 || hA < 0.135;
      else if (f.planted) down = back > speed * 0.22 && !(hT > 0.075 && hA > 0.16);
      else down = back > speed * 0.55 && (hT < 0.05 || hA < 0.13);
      if (down && !f.planted) {
        f.planted = true;
        f.lock.set(t.x + f.release.x, 0, t.z + f.release.z);
        f.toeLock.set(f.lock.x + _toe.x - _ankle.x, 0, f.lock.z + _toe.z - _ankle.z);
        f.lockYaw = yaw;
        f.release.set(0, 0, 0);
        f.stepping = 0;
        if (moving && this.onFootstep) this.onFootstep(s, speed);
      } else if (!down && f.planted) {
        f.planted = false;
        f.release.set(f.lock.x - t.x, 0, f.lock.z - t.z);
        f.stepping = 0;
      }

      let lift = 0;
      let yawFix = 0;
      if (f.planted) {
        const yawErr = angleDiff(yaw, f.lockYaw);
        yawFix = clamp(yawErr, -1.0, 1.0);
        // Ankle to toe as the foot will be drawn. A flat foot is pinned at the ankle; once the heel
        // lifts the toe is what stays put and the ankle rolls forward over it.
        const cy = Math.cos(yawFix);
        const sy = Math.sin(yawFix);
        const ax = _toe.x - _ankle.x;
        const az = _toe.z - _ankle.z;
        const vx = ax * cy + az * sy;
        const vz = az * cy - ax * sy;
        heelUp[s] = hA > 0.125 && hT < 0.06 && f.stepping === 0;
        if (heelUp[s]) f.lock.set(f.toeLock.x - vx, 0, f.toeLock.z - vz);
        const ex = f.lock.x - animX;
        const ez = f.lock.z - animZ;
        const err = Math.hypot(ex, ez);
        if (err > this.metrics.lockErr) this.metrics.lockErr = err;
        if (f.stepping > 0) {
          // A step in progress: carry the foot from where it was to where the pose now wants it.
          f.stepping = Math.min(1, f.stepping + dt / 0.24);
          const k = f.stepping * f.stepping * (3 - 2 * f.stepping);
          f.lock.set(lerp(f.stepFrom.x, animX, k), 0, lerp(f.stepFrom.z, animZ, k));
          f.lockYaw = f.stepYawFrom + angleDiff(f.stepYawFrom, yaw) * k;
          lift = Math.sin(Math.PI * f.stepping) * 0.07;
          if (f.stepping >= 1) {
            f.stepping = 0;
            if (this.onFootstep) this.onFootstep(s, 0.6);
          }
        } else if (!moving && (err > 0.15 || Math.abs(yawErr) > 0.55) && !otherStepping[s]) {
          // Standing and the foot has been left behind by a turn or a shuffle: take a step.
          f.stepping = 0.001;
          f.stepFrom.copy(f.lock);
          f.stepYawFrom = f.lockYaw;
          otherStepping[1 - s] = true;
        } else if (err > 0.3) {
          // Never stretch a leg: drag the pin along when the body outruns it.
          const k = 0.3 / err;
          f.lock.set(animX + ex * k, 0, animZ + ez * k);
        }
        if (f.stepping > 0) yawFix = clamp(angleDiff(yaw, f.lockYaw), -1.0, 1.0);
        f.toeLock.set(f.lock.x + vx, 0, f.lock.z + vz);
        t.x = f.lock.x;
        t.z = f.lock.z;
      } else {
        // Blend out whatever offset the pin left behind.
        const k = Math.exp(-14 * dt);
        f.release.multiplyScalar(k);
        t.x += f.release.x;
        t.z += f.release.z;
      }

      // Ground under the foot.
      const hit = this.physics.raycast(t.x, rootY + 0.75, t.z, 0, -1, 0, 1.5, CG.querySolid);
      let off = 0;
      if (hit) {
        off = clamp(hit.point.y - rootY, -0.55, 0.6);
        f.normal.lerp(hit.normal, 1 - Math.exp(-14 * dt)).normalize();
      } else {
        f.normal.lerp(UP, 1 - Math.exp(-14 * dt)).normalize();
      }
      rawGround[s] = rootY + off;
      f.groundOffset = damp(f.groundOffset, off, 22, dt);
      // The ground matters less the higher the foot swings.
      const influence = 1 - smoothstep(0.16, 0.42, hA);
      const g = f.groundOffset * influence;
      heights[s] = hA;
      t.y = rootY + hA + g + lift;
      if (g < lowest) lowest = g;
      f.lockYawFix = yawFix;
    }

    // Lower the pelvis so the lower foot can reach its ground, plus the landing dip.
    this.pelvis = damp(this.pelvis, clamp(lowest, -0.5, 0), 12, dt);
    let drop = (this.pelvis + dip) * this.ikW;
    translateWorld(b.hips, 0, drop, 0);
    // A planted foot stays where it is, so when its leg would run out of length (a long stride, a kerb
    // behind) the hips sink a little more; past that the pin is given up rather than the knee snapped straight.
    let need = 0;
    const reach = this.legLength * 0.994;
    for (let s = 0; s < 2; s++) {
      const f = this.feet[s]!;
      // A foot coming down counts too, so the hips are already there when it lands.
      const low = f.planted ? 1 : 1 - smoothstep(0.13, 0.24, heights[s]!);
      if (low <= 0) continue;
      const t = targets[s]!;
      f.thigh.getWorldPosition(_hip);
      const dh2 = (t.x - _hip.x) ** 2 + (t.z - _hip.z) ** 2;
      const dy = _hip.y - t.y;
      if (dh2 + dy * dy <= reach * reach) continue;
      let short = (dy - Math.sqrt(Math.max(0, reach * reach - dh2))) * low;
      if (!f.planted) short = Math.min(short, REACH_DROP);
      if (short > REACH_DROP) {
        // Pull the pin in until the leg reaches with the hips at their lowest.
        const dh = Math.sqrt(dh2);
        const okDy = Math.max(0.05, dy - REACH_DROP);
        const okDh = Math.sqrt(Math.max(0, reach * reach - okDy * okDy));
        if (dh > 1e-4 && okDh < dh) {
          const k = okDh / dh;
          t.x = _hip.x + (t.x - _hip.x) * k;
          t.z = _hip.z + (t.z - _hip.z) * k;
          f.toeLock.x += t.x - f.lock.x;
          f.toeLock.z += t.z - f.lock.z;
          f.lock.x = t.x;
          f.lock.z = t.z;
        }
        short = REACH_DROP;
      }
      if (short > need) need = short;
    }
    this.reachDrop = need > this.reachDrop ? damp(this.reachDrop, need, 40, dt) : damp(this.reachDrop, need, 9, dt);
    if (this.reachDrop > 1e-4) {
      translateWorld(b.hips, 0, -this.reachDrop * this.ikW, 0);
      drop -= this.reachDrop * this.ikW;
    }
    this.metrics.pelvis = drop;

    let maxErr = 0;
    for (let s = 0; s < 2; s++) {
      const f = this.feet[s]!;
      const t = targets[s]!;
      f.thigh.getWorldPosition(_hip);
      f.shin.getWorldPosition(_knee);
      // Keep the knee bending the way the animation bends it.
      _pole.subVectors(_knee, _hip);
      _target.copy(t);
      const over = solveTwoBone(f.thigh, f.shin, f.foot, _target, _pole, this.ikW);
      if (over > this.metrics.stretch) this.metrics.stretch = over;
      // Foot rotation: the animated one, turned to keep a planted foot from spinning, tilted to the ground.
      _q.copy(footQ[s]!);
      if (f.planted && Math.abs(f.lockYawFix) > 1e-3) _q.premultiply(_q2.setFromAxisAngle(UP, f.lockYawFix * this.ikW));
      const flat = 1 - smoothstep(0.14, 0.3, heights[s]!);
      if (flat > 0.01 && f.normal.y < 0.9995) {
        _q3.setFromUnitVectors(UP, f.normal);
        _q2.identity().slerp(_q3, flat * this.ikW);
        _q.premultiply(_q2);
      }
      setWorldQuaternion(f.foot, _q);

      // Measurements for tests: how far the sole is from the ground it stands on, and how much it slides.
      f.foot.getWorldPosition(_v3);
      if (f.planted && f.stepping === 0) {
        const err = Math.abs(_v3.y - heights[s]! - rawGround[s]!);
        if (err > maxErr) maxErr = err;
        // Slide is measured where the foot touches: the toe once the heel is up, the ankle otherwise.
        const onToe = heelUp[s]!;
        if (onToe) f.toe.getWorldPosition(_v3);
        if (f.hasLast && onToe === f.lastOnToe && speed > 0.5) this.metrics.slide += Math.hypot(_v3.x - f.last.x, _v3.z - f.last.z);
        f.last.copy(_v3);
        f.lastOnToe = onToe;
        f.hasLast = true;
      } else {
        f.hasLast = false;
      }
    }
    // Distance covered, from where the body actually went, so it compares with the slide whatever the frame rate.
    if (this.hasLastPos && speed > 0.5) this.metrics.travel += Math.hypot(this.position.x - this.lastPos.x, this.position.z - this.lastPos.z);
    this.lastPos.copy(this.position);
    this.hasLastPos = true;
    this.metrics.footError = maxErr;
    if (maxErr > this.metrics.footErrorMax) this.metrics.footErrorMax = maxErr;
    this.metrics.plantedL = this.feet[0]!.planted;
    this.metrics.plantedR = this.feet[1]!.planted;
  }

  /** The head turns toward the look target within the limits of a neck. */
  private solveHead(dt: number): void {
    const b = this.rig.b;
    b.head.getWorldPosition(_v);
    if (this.lookAt) {
      _v2.subVectors(this.lookAt, _v);
      if (_v2.lengthSq() < 0.04) _v2.set(-Math.sin(this.aimYaw), 0, -Math.cos(this.aimYaw));
      _v2.normalize();
    } else {
      const cp = Math.cos(this.aimPitch);
      _v2.set(-Math.sin(this.aimYaw) * cp, Math.sin(this.aimPitch), -Math.cos(this.aimYaw) * cp);
    }
    // Limit the turn relative to where the chest faces.
    const chestYaw = this.facing + this.legWarp + this.metrics.twist;
    const wantYaw = Math.atan2(-_v2.x, -_v2.z);
    const wantPitch = Math.asin(clamp(_v2.y, -1, 1));
    const relYaw = clamp(angleDiff(chestYaw, wantYaw), -1.25, 1.25);
    const pitch = clamp(wantPitch, -0.75, 0.8);
    const yaw = chestYaw + relYaw;
    const cp = Math.cos(pitch);
    _v2.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
    if (!this.hasLook) {
      this.lookDir.copy(_v2);
      this.hasLook = true;
    } else {
      this.lookDir.lerp(_v2, 1 - Math.exp(-11 * dt)).normalize();
    }
    const w = this.mode === 'pose' || this.mode === 'swim' ? 0.35 : this.playing('full') ? 0.3 : 1;
    // Neck takes a third of the turn, the head the rest.
    b.head.getWorldQuaternion(_q);
    _v3.copy(this.headFwd).applyQuaternion(_q);
    aimBone(b.neck, _v3, this.lookDir, 0.35 * w, 1.0);
    b.head.getWorldQuaternion(_q);
    _v3.copy(this.headFwd).applyQuaternion(_q);
    aimBone(b.head, _v3, this.lookDir, w, 1.3);
    b.head.getWorldQuaternion(_q);
    _v3.copy(this.headFwd).applyQuaternion(_q);
    this.metrics.headError = Math.acos(clamp(_v3.dot(this.lookDir), -1, 1));
  }

  /** World position of a foot after IK, for effects. */
  /** World direction a body part faces right now, from its bone. */
  partFacing(part: 'head' | 'chest' | 'hips', out: Vector3): Vector3 {
    const b = this.rig.b;
    const bone = part === 'head' ? b.head : part === 'chest' ? b.spine3 : b.hips;
    const local = part === 'head' ? this.headFwd : part === 'chest' ? this.chestFwd : this.hipsFwd;
    return out.copy(local).applyQuaternion(bone.getWorldQuaternion(_q));
  }

  /** Start the running totals in `metrics` again (slide, travel and the maxima). */
  resetMetrics(): void {
    const m = this.metrics;
    m.slide = 0;
    m.travel = 0;
    m.lockErr = 0;
    m.stretch = 0;
    m.footErrorMax = 0;
  }

  footPosition(side: number, out: Vector3): Vector3 {
    return this.feet[side]!.foot.getWorldPosition(out);
  }
}

const _tA = new Vector3();
const _tB = new Vector3();
const _qA = new Quaternion();
const _qB = new Quaternion();
