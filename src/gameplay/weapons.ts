import { Matrix4, type Object3D, Quaternion, Vector3 } from 'three';
import type { Animator } from '../character/animator';
import { setWorldQuaternion, solveTwoBone } from '../character/ik';
import type { CharacterRig } from '../character/rig';
import type { ModelAsset } from '../core/assets';
import { damp, Spring } from '../core/math';
import type { AmmoId, ConsumableId, WeaponId } from './items';

/** Build quality of a weapon. Better tiers hit harder and reload quicker. */
export const TIERS = [
  { name: 'Stock', damage: 1, reload: 1, color: 0xe9e2d0 },
  { name: 'Tuned', damage: 1.1, reload: 0.94, color: 0x35e0c8 },
  { name: 'Custom', damage: 1.2, reload: 0.88, color: 0xff7a59 },
  { name: 'Signature', damage: 1.32, reload: 0.8, color: 0xffd166 },
] as const;

export const MAX_TIER = TIERS.length - 1;

export interface WeaponDef {
  id: WeaponId;
  ammo: AmmoId;
  /** Key 1..5 that selects it. */
  slot: number;
  /** Holding the trigger keeps firing. */
  auto: boolean;
  /** Shots a minute. */
  rpm: number;
  mag: number;
  /** Seconds for a full reload, or per shell when `shellReload` is set. */
  reload: number;
  /** The magazine is filled one round at a time, and firing interrupts it. */
  shellReload: boolean;
  /** Damage of one projectile to the body at close range. */
  damage: number;
  /** Projectiles per shot. */
  pellets: number;
  headshot: number;
  /** Damage starts to drop at the first distance and reaches `falloff` at the second. Metres. */
  range: [number, number];
  falloff: number;
  /** Half-angle of the cone the shots land in, radians: from the hip, and aimed. */
  spread: number;
  aimSpread: number;
  /** Added to the cone by each shot, the most it can add, and how fast it settles (rad/s). */
  bloom: number;
  bloomMax: number;
  settle: number;
  /** View kick per shot in radians: up, and the most to either side. */
  recoil: [number, number];
  /** How much the body rocks. */
  kick: number;
  /** Field of view when aimed, as a fraction of normal. */
  zoom: number;
  sound: string;
  tracer: number;
  /** Seconds to bring it up after switching. */
  draw: number;
  // --- the model ---
  model: string;
  scale: number;
  /** Held with both hands at the shoulder, or out in front like a sidearm. */
  long: boolean;
  /** Points on the model, in its own coordinates (the barrel runs toward -Z): [y, z]. */
  grip: [number, number];
  fore: [number, number];
  muzzle: [number, number];
  /** Where the shells come out. */
  port: [number, number];
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol', ammo: 'ammo_light', slot: 1, auto: false, rpm: 420, mag: 12, reload: 1.45, shellReload: false,
    damage: 24, pellets: 1, headshot: 1.8, range: [28, 70], falloff: 0.6,
    spread: 0.011, aimSpread: 0.0035, bloom: 0.009, bloomMax: 0.05, settle: 0.11,
    recoil: [0.016, 0.006], kick: 0.5, zoom: 0.78, sound: 'shot_pistol', tracer: 0xffe2a8, draw: 0.28,
    model: 'blaster-b', scale: 0.62, long: false, grip: [-0.13, 0.1], fore: [-0.16, 0.1], muzzle: [0.012, -0.26], port: [0.07, -0.05],
  },
  smg: {
    id: 'smg', ammo: 'ammo_light', slot: 2, auto: true, rpm: 780, mag: 30, reload: 1.9, shellReload: false,
    damage: 15, pellets: 1, headshot: 1.5, range: [16, 45], falloff: 0.5,
    spread: 0.027, aimSpread: 0.012, bloom: 0.0045, bloomMax: 0.05, settle: 0.14,
    recoil: [0.008, 0.007], kick: 0.28, zoom: 0.8, sound: 'shot_smg', tracer: 0xffe2a8, draw: 0.3,
    model: 'blaster-c', scale: 0.85, long: true, grip: [-0.09, 0.17], fore: [-0.085, -0.05], muzzle: [0.025, -0.24], port: [0.1, 0.02],
  },
  rifle: {
    id: 'rifle', ammo: 'ammo_medium', slot: 3, auto: true, rpm: 540, mag: 30, reload: 2.2, shellReload: false,
    damage: 27, pellets: 1, headshot: 1.6, range: [50, 120], falloff: 0.7,
    spread: 0.015, aimSpread: 0.0035, bloom: 0.0052, bloomMax: 0.045, settle: 0.1,
    recoil: [0.012, 0.006], kick: 0.42, zoom: 0.62, sound: 'shot_rifle', tracer: 0xfff0c2, draw: 0.38,
    model: 'blaster-d', scale: 0.8, long: true, grip: [-0.08, 0.19], fore: [-0.035, -0.24], muzzle: [0.07, -0.45], port: [0.1, 0.02],
  },
  shotgun: {
    id: 'shotgun', ammo: 'ammo_shells', slot: 4, auto: false, rpm: 70, mag: 5, reload: 0.52, shellReload: true,
    damage: 11, pellets: 9, headshot: 1.3, range: [8, 24], falloff: 0.25,
    spread: 0.075, aimSpread: 0.06, bloom: 0, bloomMax: 0, settle: 1,
    recoil: [0.05, 0.012], kick: 1.3, zoom: 0.84, sound: 'shot_shotgun', tracer: 0xffd9a0, draw: 0.42,
    model: 'blaster-a', scale: 0.85, long: true, grip: [-0.15, 0.22], fore: [-0.11, -0.2], muzzle: [0.05, -0.37], port: [0.11, 0.05],
  },
  sniper: {
    id: 'sniper', ammo: 'ammo_heavy', slot: 5, auto: false, rpm: 38, mag: 5, reload: 2.8, shellReload: false,
    damage: 105, pellets: 1, headshot: 2.2, range: [150, 320], falloff: 0.8,
    spread: 0.07, aimSpread: 0.0005, bloom: 0.02, bloomMax: 0.04, settle: 0.05,
    recoil: [0.06, 0.008], kick: 1.5, zoom: 0.24, sound: 'shot_sniper', tracer: 0xeaf6ff, draw: 0.55,
    model: 'blaster-f', scale: 0.82, long: true, grip: [-0.07, 0.39], fore: [-0.03, -0.08], muzzle: [0.066, -0.65], port: [0.09, 0.1],
  },
};

/** What a consumable does and how long it takes to use. */
export const CONSUMABLES: Record<Exclude<ConsumableId, 'grenade'>, { time: number; health: number; healthCap: number; armor: number }> = {
  bandage: { time: 2.2, health: 20, healthCap: 75, armor: 0 },
  medkit: { time: 4.5, health: 100, healthCap: 100, armor: 0 },
  cola: { time: 1.6, health: 0, healthCap: 0, armor: 25 },
  vest: { time: 3, health: 0, healthCap: 0, armor: 60 },
};

export interface HeldWeapon {
  tier: number;
  /** Rounds in the magazine. */
  mag: number;
}

/** What a combatant wants their hands to do this step. The player's keys or a bot's brain fill it in. */
export interface Actions {
  fire: boolean;
  aim: boolean;
  reload: boolean;
  /** Switch to this weapon. */
  slot: WeaponId | null;
  /** Switch to the next (+1) or previous (-1) weapon carried. */
  cycle: number;
  use: Exclude<ConsumableId, 'grenade'> | null;
  throw: boolean;
}

/** The weapons a combatant carries and what their hands are busy with. */
export class Loadout {
  readonly held: Partial<Record<WeaponId, HeldWeapon>> = {};
  current: WeaponId | null = null;
  /** Seconds until the next shot may leave. */
  cooldown = 0;
  /** Seconds left of the reload under way, 0 when not reloading. */
  reloading = 0;
  reloadTotal = 0;
  /** Seconds left before a freshly drawn weapon is ready. */
  drawing = 0;
  /** Extra spread from recent shots, radians. */
  bloom = 0;
  /** Shots in the current burst, for the recoil pattern. */
  burst = 0;
  sinceShot = 99;
  triggerHeld = false;
  /** A consumable being used, and the seconds left. */
  using: Exclude<ConsumableId, 'grenade'> | null = null;
  useLeft = 0;
  /** A grenade leaves the hand when this runs out. */
  throwing = 0;
  /** Totals, for the end-of-round card and the tests. */
  shots = 0;
  hits = 0;
  headshots = 0;

  has(id: WeaponId): boolean {
    return this.held[id] !== undefined;
  }

  get weapon(): WeaponDef | null {
    return this.current ? WEAPONS[this.current] : null;
  }

  get heldNow(): HeldWeapon | null {
    return this.current ? (this.held[this.current] ?? null) : null;
  }

  /** Weapons carried, in key order. */
  carried(): WeaponId[] {
    return (Object.keys(WEAPONS) as WeaponId[]).filter((id) => this.held[id]);
  }

  /**
   * Take a weapon. Returns false when the one already carried is as good or better. A fresh weapon
   * comes with a full magazine.
   */
  give(id: WeaponId, tier = 0): boolean {
    const have = this.held[id];
    if (have) {
      if (tier <= have.tier) return false;
      have.tier = tier;
      return true;
    }
    this.held[id] = { tier, mag: WEAPONS[id].mag };
    return true;
  }

  clear(): void {
    for (const id of Object.keys(this.held) as WeaponId[]) delete this.held[id];
    this.current = null;
    this.cooldown = 0;
    this.reloading = 0;
    this.drawing = 0;
    this.bloom = 0;
    this.burst = 0;
    this.using = null;
    this.useLeft = 0;
    this.throwing = 0;
    this.triggerHeld = false;
    this.shots = 0;
    this.hits = 0;
    this.headshots = 0;
  }
}

export function newActions(): Actions {
  return { fire: false, aim: false, reload: false, slot: null, cycle: 0, use: null, throw: false };
}

const _dir = new Vector3();
const _right = new Vector3();
const _up = new Vector3();
const _chest = new Vector3();
const _target = new Vector3();
const _pole = new Vector3();
const _hand = new Vector3();
const _off = new Vector3();
const _m = new Matrix4();
const _aimQ = new Quaternion();
const _handQ = new Quaternion();
const _q = new Quaternion();
const _left = new Vector3();
const UP = new Vector3(0, 1, 0);
// A slung weapon lies flat across the back, muzzle up over the left shoulder. The chest bone's own
// axes are the body's: +X left, +Y up, +Z front.
const STOW = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(0, 0, -1), new Vector3(0.89, -0.45, 0), new Vector3(-0.45, -0.89, 0)));
// The left hand under a fore-end: palm up, fingers across the barrel.
const LEFT_HOLD = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -1.35).multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.5));

/**
 * The weapon in a character's hands: the model on the grip socket, the one slung on the back, and
 * the arms that hold it. The arms are solved, not played from a clip, so the barrel points exactly
 * where the character aims at any pitch.
 */
export class WeaponView {
  private models: Partial<Record<WeaponId, Object3D>> = {};
  private shown: WeaponId | null = null;
  private stowed: WeaponId | null = null;
  /** 0 weapon up and on target, 1 lowered (sprinting, reloading, busy hands). */
  private lowered = 1;
  private readonly recoil = new Spring(0, 0.07);
  /** World position of the muzzle after the last pose. */
  readonly muzzle = new Vector3();
  /** World position of the ejection port. */
  readonly port = new Vector3();
  hasMuzzle = false;
  /** Set by the owner each frame. */
  lower = false;
  leftFree = false;

  constructor(
    private readonly rig: CharacterRig,
    private readonly anim: Animator,
    private readonly asset: ModelAsset,
  ) {
    anim.armFn = (r, w, dt) => this.pose(r, w, dt);
  }

  private model(id: WeaponId): Object3D {
    let m = this.models[id];
    if (!m) {
      const def = WEAPONS[id];
      const source = this.asset.scene.getObjectByName(def.model);
      if (!source) throw new Error(`weapon model ${def.model} is missing`);
      m = source.clone(true);
      m.name = `weapon-${id}`;
      m.traverse((o) => {
        o.castShadow = true;
      });
      this.models[id] = m;
    }
    return m;
  }

  /** Show `id` in the hands (or nothing), and sling `stow` on the back. */
  show(id: WeaponId | null, stow: WeaponId | null = null): void {
    if (id !== this.shown) {
      if (this.shown) this.models[this.shown]?.removeFromParent();
      this.shown = id;
      if (id) {
        const def = WEAPONS[id];
        const m = this.model(id);
        const s = def.scale;
        // The models point down -Z and the socket's barrel axis is +Z: turn it round, palm on the grip.
        m.rotation.set(0, Math.PI, 0);
        m.scale.setScalar(s);
        m.position.set(0, -def.grip[0] * s, def.grip[1] * s);
        this.rig.grip.add(m);
        this.lowered = 1;
      }
      this.anim.holding = id !== null;
      this.hasMuzzle = false;
    }
    if (stow === id) stow = null;
    if (stow !== this.stowed) {
      if (this.stowed && this.stowed !== this.shown) this.models[this.stowed]?.removeFromParent();
      this.stowed = stow;
      if (stow) {
        const def = WEAPONS[stow];
        const m = this.model(stow);
        m.quaternion.copy(STOW);
        m.scale.setScalar(def.scale);
        m.position.set(0.02, 0.06, -0.27);
        this.rig.b.spine3.add(m);
      }
    }
  }

  /** Rock the weapon back for a shot. */
  kick(strength: number): void {
    this.recoil.velocity += strength * 1.6;
  }

  /** Called by the animator once the spine is posed. `w` is how much the upper body is on the aim. */
  private pose(rig: CharacterRig, w: number, dt: number): void {
    const id = this.shown;
    const kick = this.recoil.update(0, dt);
    this.lowered = damp(this.lowered, this.lower ? 1 : 0, this.lower ? 9 : 13, dt);
    if (!id || w < 0.01) {
      this.hasMuzzle = false;
      return;
    }
    const def = WEAPONS[id];
    const b = rig.b;
    const anim = this.anim;
    const low = this.lowered;
    // The aim frame: forward along the aim, with the weapon dropped and swung in when lowered.
    const yaw = anim.aimYaw + low * 0.5;
    const pitch = anim.aimPitch * (1 - low) - low * 0.75 + kick * 0.08;
    const cp = Math.cos(pitch);
    _dir.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
    _right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    _up.crossVectors(_right, _dir).normalize();
    _left.copy(_right).negate();
    // Socket axes: +Z along the barrel, +Y up, +X to the character's left.
    _m.makeBasis(_left, _up, _dir);
    _aimQ.setFromRotationMatrix(_m);

    b.spine3.getWorldPosition(_chest);
    // Where the palm goes: tucked by the right shoulder for a long gun, out in front for a sidearm.
    if (def.long) _target.copy(_chest).addScaledVector(_right, 0.15 - low * 0.05).addScaledVector(UP, 0.07 - low * 0.2).addScaledVector(_dir, 0.2 - kick * 0.05 + low * 0.04);
    else _target.copy(_chest).addScaledVector(_right, 0.1).addScaledVector(UP, 0.13 - low * 0.32).addScaledVector(_dir, 0.5 - kick * 0.06 - low * 0.16);

    // Right hand: put the grip socket on the target, turned to the aim frame.
    _handQ.copy(_aimQ).multiply(_q.copy(rig.grip.quaternion).invert());
    _off.copy(rig.grip.position).multiply(b.handR.getWorldScale(_hand)).applyQuaternion(_handQ);
    _hand.copy(_target).sub(_off);
    _pole.copy(_right).multiplyScalar(0.7).addScaledVector(UP, -1).addScaledVector(_dir, -0.2);
    solveTwoBone(b.upperArmR, b.forearmR, b.handR, _hand, _pole, w);
    b.handR.getWorldQuaternion(_q);
    setWorldQuaternion(b.handR, _q.slerp(_handQ, w));

    const model = this.models[id]!;
    model.updateWorldMatrix(true, false);
    this.muzzle.set(0, def.muzzle[0], def.muzzle[1]).applyMatrix4(model.matrixWorld);
    this.port.set(0, def.port[0], def.port[1]).applyMatrix4(model.matrixWorld);
    this.hasMuzzle = true;

    // Left hand: on the fore-end of a long gun, cupped under the right hand on a sidearm.
    if (!this.leftFree) {
      _target.set(def.long ? 0 : 0.035, def.fore[0], def.fore[1]).applyMatrix4(model.matrixWorld);
      _pole.copy(_right).multiplyScalar(-0.75).addScaledVector(UP, -1);
      const lw = w * (1 - low * 0.35);
      solveTwoBone(b.upperArmL, b.forearmL, b.handL, _target, _pole, lw);
      b.handL.getWorldQuaternion(_q);
      setWorldQuaternion(b.handL, _q.slerp(_handQ.copy(_aimQ).multiply(LEFT_HOLD), lw));
    }
  }

  dispose(): void {
    for (const m of Object.values(this.models)) m?.removeFromParent();
    this.anim.armFn = null;
    this.anim.holding = false;
  }
}
