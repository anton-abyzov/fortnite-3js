import { AnimationMixer, type Bone, type Object3D, type SkinnedMesh, Vector3 } from 'three';
import type { ModelAsset } from '../core/assets';

/** Bone names in skeleton order, as three.js spells them after loading (dots removed). */
export const BONE = {
  root: 'root',
  hips: 'DEF-hips',
  spine1: 'DEF-spine001',
  spine2: 'DEF-spine002',
  spine3: 'DEF-spine003',
  neck: 'DEF-neck',
  head: 'DEF-head',
  shoulderL: 'DEF-shoulderL',
  upperArmL: 'DEF-upper_armL',
  forearmL: 'DEF-forearmL',
  handL: 'DEF-handL',
  shoulderR: 'DEF-shoulderR',
  upperArmR: 'DEF-upper_armR',
  forearmR: 'DEF-forearmR',
  handR: 'DEF-handR',
  thighL: 'DEF-thighL',
  shinL: 'DEF-shinL',
  footL: 'DEF-footL',
  toeL: 'DEF-toeL',
  thighR: 'DEF-thighR',
  shinR: 'DEF-shinR',
  footR: 'DEF-footR',
  toeR: 'DEF-toeR',
} as const;

/** A pose: one local rotation per bone plus the hips position in rig space. */
export class Pose {
  readonly q: Float32Array;
  readonly hips = new Float32Array(3);

  constructor(readonly bones: number) {
    this.q = new Float32Array(bones * 4);
    for (let i = 0; i < bones; i++) this.q[i * 4 + 3] = 1;
  }

  copy(src: Pose): this {
    this.q.set(src.q);
    this.hips.set(src.hips);
    return this;
  }

  /**
   * Move this pose toward `src` by `w` (0..1). With a mask, each bone uses `w * mask[bone]`.
   * Rotations are blended with a normalised lerp on the short arc, which is accurate for the small
   * angles between neighbouring animation poses and much cheaper than slerp.
   */
  blend(src: Pose, w: number, mask?: Float32Array): this {
    if (w <= 0) return this;
    const a = this.q;
    const b = src.q;
    for (let i = 0, n = this.bones; i < n; i++) {
      const t = mask ? w * mask[i]! : w;
      if (t <= 0) continue;
      const k = i * 4;
      const ax = a[k]!;
      const ay = a[k + 1]!;
      const az = a[k + 2]!;
      const aw = a[k + 3]!;
      let bx = b[k]!;
      let by = b[k + 1]!;
      let bz = b[k + 2]!;
      let bw = b[k + 3]!;
      if (ax * bx + ay * by + az * bz + aw * bw < 0) {
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const z = az + (bz - az) * t;
      const ww = aw + (bw - aw) * t;
      const inv = 1 / Math.hypot(x, y, z, ww);
      a[k] = x * inv;
      a[k + 1] = y * inv;
      a[k + 2] = z * inv;
      a[k + 3] = ww * inv;
    }
    // The hips position follows the lower-body weight (bone 1 is the hips).
    const hw = mask ? w * mask[1]! : w;
    if (hw > 0) {
      this.hips[0]! += (src.hips[0]! - this.hips[0]!) * hw;
      this.hips[1]! += (src.hips[1]! - this.hips[1]!) * hw;
      this.hips[2]! += (src.hips[2]! - this.hips[2]!) * hw;
    }
    return this;
  }
}

export interface BakedClip {
  name: string;
  duration: number;
  loop: boolean;
  /** Number of stored frames. The last frame of a loop equals the first. */
  frames: number;
  fps: number;
  quat: Float32Array;
  hips: Float32Array;
  /** Ground speed the feet imply during stance, in m/s. Zero for clips that do not travel. */
  speed: number;
  /** Distance covered by one full cycle at the natural speed. */
  stride: number;
}

const BAKE_FPS = 30;

/**
 * Every animation clip sampled once into flat arrays, shared by all characters.
 * Sampling a pose is then two array reads and a lerp per bone, with no allocation, and poses can be
 * blended per bone, which the stock three.js mixer cannot do.
 */
export class ClipBank {
  readonly clips = new Map<string, BakedClip>();
  readonly boneNames: string[] = [];
  readonly parents: number[] = [];
  readonly index = new Map<string, number>();
  /** The T pose, used as the base for procedural poses. */
  readonly rest: Pose;
  boneCount = 0;

  constructor(asset: ModelAsset) {
    const scene = asset.scene;
    let skinned: SkinnedMesh | null = null;
    scene.traverse((o: Object3D) => {
      if (!skinned && (o as SkinnedMesh).isSkinnedMesh) skinned = o as SkinnedMesh;
    });
    if (!skinned) throw new Error('character model has no skinned mesh');
    const bones: Bone[] = (skinned as SkinnedMesh).skeleton.bones;
    this.boneCount = bones.length;
    bones.forEach((b, i) => {
      this.boneNames.push(b.name);
      this.index.set(b.name, i);
    });
    bones.forEach((b) => this.parents.push(b.parent ? (this.index.get(b.parent.name) ?? -1) : -1));
    const hipsIndex = this.bone(BONE.hips);
    const toeL = bones[this.bone(BONE.toeL)]!;
    const toeR = bones[this.bone(BONE.toeR)]!;

    const mixer = new AnimationMixer(scene);
    const tmp = new Vector3();
    for (const clip of asset.animations) {
      const loop = clip.name.includes('_Loop');
      const frames = Math.max(2, Math.round(clip.duration * BAKE_FPS) + 1);
      const quat = new Float32Array(frames * this.boneCount * 4);
      const hips = new Float32Array(frames * 3);
      const fz: number[][] = [[], []];
      const fy: number[][] = [[], []];
      const action = mixer.clipAction(clip);
      action.play();
      for (let f = 0; f < frames; f++) {
        // The last frame of a loop is the first frame again, so wrapping interpolates cleanly.
        const t = loop && f === frames - 1 ? 0 : Math.min(clip.duration - 1e-4, (f / (frames - 1)) * clip.duration);
        mixer.setTime(t);
        for (let b = 0; b < this.boneCount; b++) {
          const q = bones[b]!.quaternion;
          const k = (f * this.boneCount + b) * 4;
          quat[k] = q.x;
          quat[k + 1] = q.y;
          quat[k + 2] = q.z;
          quat[k + 3] = q.w;
        }
        const hp = bones[hipsIndex]!.position;
        hips[f * 3] = hp.x;
        hips[f * 3 + 1] = hp.y;
        hips[f * 3 + 2] = hp.z;
        scene.updateMatrixWorld(true);
        [toeL, toeR].forEach((toe, s) => {
          toe.getWorldPosition(tmp);
          fy[s]!.push(tmp.y);
          fz[s]!.push(tmp.z);
        });
      }
      action.stop();
      mixer.uncacheAction(clip);
      const speed = loop ? stanceSpeed(fy, fz, clip.duration / (frames - 1)) : 0;
      this.clips.set(clip.name, { name: clip.name, duration: clip.duration, loop, frames, fps: (frames - 1) / clip.duration, quat, hips, speed, stride: speed * clip.duration });
    }
    mixer.stopAllAction();
    this.rest = new Pose(this.boneCount);
    this.sample(this.clip('A_TPose'), 0, this.rest);
    // Leave the source skeleton in the T pose for anything that clones it later.
    this.apply(this.rest, bones);
    scene.updateMatrixWorld(true);
  }

  bone(name: string): number {
    const i = this.index.get(name);
    if (i === undefined) throw new Error(`bone not found: ${name}`);
    return i;
  }

  clip(name: string): BakedClip {
    const c = this.clips.get(name);
    if (!c) throw new Error(`clip not found: ${name}`);
    return c;
  }

  /** Sample a clip at `time` seconds into `out`. Looping clips wrap, others clamp. */
  sample(clip: BakedClip, time: number, out: Pose): Pose {
    const n = this.boneCount;
    let t = time;
    if (clip.loop) {
      t %= clip.duration;
      if (t < 0) t += clip.duration;
    } else {
      t = t < 0 ? 0 : t > clip.duration ? clip.duration : t;
    }
    const x = t * clip.fps;
    let f0 = Math.floor(x);
    if (f0 >= clip.frames - 1) f0 = clip.frames - 2;
    const a = x - f0;
    const q = clip.quat;
    const o = out.q;
    const base0 = f0 * n * 4;
    const base1 = base0 + n * 4;
    for (let k = 0, len = n * 4; k < len; k += 4) {
      const ax = q[base0 + k]!;
      const ay = q[base0 + k + 1]!;
      const az = q[base0 + k + 2]!;
      const aw = q[base0 + k + 3]!;
      let bx = q[base1 + k]!;
      let by = q[base1 + k + 1]!;
      let bz = q[base1 + k + 2]!;
      let bw = q[base1 + k + 3]!;
      if (ax * bx + ay * by + az * bz + aw * bw < 0) {
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      const rx = ax + (bx - ax) * a;
      const ry = ay + (by - ay) * a;
      const rz = az + (bz - az) * a;
      const rw = aw + (bw - aw) * a;
      const inv = 1 / Math.hypot(rx, ry, rz, rw);
      o[k] = rx * inv;
      o[k + 1] = ry * inv;
      o[k + 2] = rz * inv;
      o[k + 3] = rw * inv;
    }
    const h = clip.hips;
    out.hips[0] = h[f0 * 3]! + (h[f0 * 3 + 3]! - h[f0 * 3]!) * a;
    out.hips[1] = h[f0 * 3 + 1]! + (h[f0 * 3 + 4]! - h[f0 * 3 + 1]!) * a;
    out.hips[2] = h[f0 * 3 + 2]! + (h[f0 * 3 + 5]! - h[f0 * 3 + 2]!) * a;
    return out;
  }

  /** Write a pose to a skeleton whose bones are in bank order. */
  apply(pose: Pose, bones: Bone[]): void {
    const q = pose.q;
    for (let i = 0, n = this.boneCount; i < n; i++) {
      const k = i * 4;
      bones[i]!.quaternion.set(q[k]!, q[k + 1]!, q[k + 2]!, q[k + 3]!);
    }
    bones[1]!.position.set(pose.hips[0]!, pose.hips[1]!, pose.hips[2]!);
  }

  /** Per-bone weights: 1 for the named bones and everything below them, 0 elsewhere. */
  mask(roots: readonly string[], weights?: Record<string, number>): Float32Array {
    const m = new Float32Array(this.boneCount);
    const rootIdx = roots.map((r) => this.bone(r));
    for (let i = 0; i < this.boneCount; i++) {
      let p = i;
      while (p >= 0) {
        if (rootIdx.includes(p)) {
          m[i] = 1;
          break;
        }
        p = this.parents[p]!;
      }
    }
    if (weights) for (const [name, w] of Object.entries(weights)) m[this.bone(name)] = w;
    return m;
  }
}

/**
 * How fast a looping locomotion clip covers ground, from its feet: while a toe is on the floor it travels
 * backward under the body at the speed the body would move forward. Total travel over total contact time,
 * so clips whose body surges (a sneak) still give the right average.
 */
function stanceSpeed(fy: number[][], fz: number[][], dt: number): number {
  let travel = 0;
  let count = 0;
  for (let s = 0; s < 2; s++) {
    const y = fy[s]!;
    const z = fz[s]!;
    let min = Infinity;
    for (const v of y) min = Math.min(min, v);
    for (let i = 0; i + 1 < y.length; i++) {
      if (y[i]! < min + 0.02 && y[i + 1]! < min + 0.02) {
        const d = z[i]! - z[i + 1]!;
        if (d > 0) {
          travel += d;
          count++;
        }
      }
    }
  }
  return count >= 2 ? travel / (count * dt) : 0;
}
