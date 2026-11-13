import { Quaternion, Vector3 } from 'three';
import type { Character } from '../character/character';
import { angleDiff } from '../core/math';
import { isItemId, type WeaponId } from '../gameplay/items';
import type { Vehicle } from '../vehicles/vehicle';
import { MODES, type StateMsg } from './protocol';

/** How far behind the newest news remote bodies are drawn, seconds. */
export const INTERP_DELAY = 0.1;
/**
 * Vehicles are drawn closer to now and carried forward along their velocity: a car covers 3 m in
 * the 100 ms a person is held back, and its path is smooth enough to guess.
 */
export const VEHICLE_DELAY = 0.02;
/** How far past the last message a body keeps moving before it waits, seconds. */
const MAX_EXTRAPOLATE = 0.2;

interface Sample {
  /** Local clock, seconds. */
  at: number;
  msg: StateMsg;
}

const _qa = new Quaternion();
const _qb = new Quaternion();
const _v = new Vector3();

function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDiff(a, b) * t;
}

export function now(): number {
  return performance.now() / 1000;
}

/**
 * The last second of one remote player's state messages, and the body drawn from them about
 * 100 ms in the past. Clock offset: the smallest (arrival - sent) seen, eased upward slowly, so a
 * late packet does not drag every later one back.
 */
export class RemoteBody {
  private readonly samples: Sample[] = [];
  private offset: number | null = null;
  /** The newest message, for the discrete parts (weapon, vehicle, stance). */
  latest: StateMsg | null = null;
  /** When the last message arrived, local clock. */
  heardAt = 0;
  /** Messages taken, for tests. */
  count = 0;

  constructor(readonly slot: number) {}

  push(msg: StateMsg): void {
    const t = now();
    const est = t - msg.t;
    if (this.offset === null || est < this.offset) this.offset = est;
    else this.offset += (est - this.offset) * 0.02;
    const at = msg.t + this.offset;
    const last = this.samples[this.samples.length - 1];
    if (last && at <= last.at) return;
    this.samples.push({ at, msg });
    while (this.samples.length > 2 && this.samples[0]!.at < t - 1) this.samples.shift();
    this.latest = msg;
    this.heardAt = t;
    this.count++;
  }

  reset(): void {
    this.samples.length = 0;
    this.offset = null;
    this.latest = null;
    this.count = 0;
  }

  /**
   * Place a character (and the vehicle it drives) where this player was `INTERP_DELAY` ago.
   * Returns false when nothing has been heard yet.
   */
  /** The two samples around `render`, how far between them, and how far past the newest. */
  private bracket(render: number): { a: Sample; b: Sample; t: number; ahead: number } {
    const s = this.samples;
    let a = s[0]!;
    let b = a;
    for (let i = 1; i < s.length; i++) {
      b = s[i]!;
      if (b.at >= render) break;
      a = b;
    }
    let t = 0;
    let ahead = 0;
    if (b === a || render >= b.at) {
      // Past the newest: carry on along its velocity for a moment.
      a = b = s[s.length - 1]!;
      ahead = Math.min(MAX_EXTRAPOLATE, Math.max(0, render - b.at));
    } else if (render > a.at) t = (render - a.at) / (b.at - a.at);
    return { a, b, t, ahead };
  }

  apply(c: Character, vehicles: readonly Vehicle[]): boolean {
    if (this.samples.length === 0) return false;
    const { a, b, t, ahead } = this.bracket(now() - INTERP_DELAY);
    const ma = a.msg;
    const mb = b.msg;
    const latest = this.latest!;

    const x = ma.p[0] + (mb.p[0] - ma.p[0]) * t + mb.v[0] * ahead;
    const y = ma.p[1] + (mb.p[1] - ma.p[1]) * t + (mb.m === 0 ? 0 : mb.v[1] * ahead);
    const z = ma.p[2] + (mb.p[2] - ma.p[2]) * t + mb.v[2] * ahead;
    const m = c.motor;
    if (!c.vehicle) m.place(x, y, z);
    m.velocity.set(ma.v[0] + (mb.v[0] - ma.v[0]) * t, ma.v[1] + (mb.v[1] - ma.v[1]) * t, ma.v[2] + (mb.v[2] - ma.v[2]) * t);
    m.speed = Math.hypot(m.velocity.x, m.velocity.z);
    const mode = MODES[latest.m] ?? 'ground';
    if (!c.vehicle) m.mode = mode;
    m.grounded = mode === 'ground' || mode === 'slide';
    m.airTime = mode === 'air' ? 0.5 : 0;
    m.crouched = latest.c === 1;
    c.input.sprint = m.grounded && m.speed > 5.6;
    if (!c.vehicle) c.facing = lerpAngle(ma.f, mb.f, t);
    c.aimYaw = lerpAngle(ma.ay, mb.ay, t);
    c.aimPitch = ma.ap + (mb.ap - ma.ap) * t;
    // A point well ahead along the view, for the head and the arms to follow.
    const cp = Math.cos(c.aimPitch);
    c.aimPoint.set(c.position.x - Math.sin(c.aimYaw) * cp * 60, c.position.y + c.eyeHeight + Math.sin(c.aimPitch) * 60, c.position.z - Math.cos(c.aimYaw) * cp * 60);
    c.act.aim = latest.a > 0.5;
    c.act.fire = false;

    // The weapon in hand.
    const lo = c.loadout;
    const w = latest.w;
    if (!w) lo.current = null;
    else if (isItemId(w) && lo.current !== w) {
      if (!lo.has(w as WeaponId)) lo.give(w as WeaponId, 0);
      lo.current = w as WeaponId;
    }

    // The vehicle this player drives follows their browser.
    const v = c.vehicle;
    const vk = this.bracket(now() - VEHICLE_DELAY);
    const va = vk.a.msg;
    const vbm = vk.b.msg;
    if (v && v.driver === c && vbm.vb && va.vb && vehicles.indexOf(v) === vbm.veh) {
      const pa = va.vb;
      const pb = vbm.vb;
      const t = vk.t;
      const ahead = vk.ahead;
      if (!v.remoteDriven) v.setRemoteDriven(true);
      const r = v.remoteTarget;
      r.x = pa[0]! + (pb[0]! - pa[0]!) * t + pb[7]! * ahead;
      r.y = pa[1]! + (pb[1]! - pa[1]!) * t + pb[8]! * ahead;
      r.z = pa[2]! + (pb[2]! - pa[2]!) * t + pb[9]! * ahead;
      _qa.set(pa[3]!, pa[4]!, pa[5]!, pa[6]!);
      _qb.set(pb[3]!, pb[4]!, pb[5]!, pb[6]!);
      _qa.slerp(_qb, t);
      r.qx = _qa.x;
      r.qy = _qa.y;
      r.qz = _qa.z;
      r.qw = _qa.w;
    }
    return true;
  }

  /** The last reported velocity of the vehicle this player drove, to hand the body back with. */
  vehicleVelocity(): { lin: Vector3; ang: Vector3 } | null {
    const vb = this.latest?.vb;
    if (!vb) return null;
    return { lin: _v.set(vb[7]!, vb[8]!, vb[9]!).clone(), ang: new Vector3(vb[10]!, vb[11]!, vb[12]!) };
  }
}
