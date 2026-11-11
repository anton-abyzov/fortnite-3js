import { PointLight, type Scene, type Vector3 } from 'three';
import { smoothstep } from '../core/math';

/**
 * A small pool of real point lights that follows the player from lamp to lamp at night.
 * The light count never changes after start-up, so shaders are compiled once.
 */
export class StreetLights {
  private lights: PointLight[] = [];
  private slot: number[] = [];
  private timer = 0;

  constructor(
    scene: Scene,
    private lamps: Vector3[],
    count: number,
  ) {
    for (let i = 0; i < count; i++) {
      const l = new PointLight(0xffd9a0, 0, 26, 1.7);
      l.castShadow = false;
      l.position.set(0, -50, 0);
      scene.add(l);
      this.lights.push(l);
      this.slot.push(-1);
    }
  }

  update(dt: number, focus: Vector3, night: number): void {
    if (this.lights.length === 0) return;
    this.timer -= dt;
    if (this.timer <= 0 && night > 0.02) {
      this.timer = 0.3;
      this.assign(focus);
    }
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i]!;
      const s = this.slot[i]!;
      if (s < 0 || night <= 0.02) {
        l.intensity = 0;
        continue;
      }
      const d = Math.hypot(l.position.x - focus.x, l.position.z - focus.z);
      // Lights fade out with distance from the player, so moving one to a new lamp never pops.
      l.intensity = night * 46 * (1 - smoothstep(34, 58, d));
    }
  }

  /** Keep lights on the lamps nearest the focus. A light only moves once its lamp has left that set. */
  private assign(focus: Vector3): void {
    const n = this.lights.length;
    const best: number[] = [];
    const bestD: number[] = [];
    for (let i = 0; i < this.lamps.length; i++) {
      const p = this.lamps[i]!;
      const d = (p.x - focus.x) ** 2 + (p.z - focus.z) ** 2;
      if (best.length === n && d >= bestD[n - 1]!) continue;
      let k = best.length < n ? best.length : n - 1;
      while (k > 0 && bestD[k - 1]! > d) {
        best[k] = best[k - 1]!;
        bestD[k] = bestD[k - 1]!;
        k--;
      }
      best[k] = i;
      bestD[k] = d;
    }
    const wanted = new Set(best);
    const free: number[] = [];
    for (let i = 0; i < n; i++) {
      const s = this.slot[i]!;
      if (s >= 0 && wanted.has(s)) wanted.delete(s);
      else free.push(i);
    }
    for (const lamp of wanted) {
      const i = free.pop();
      if (i === undefined) break;
      this.slot[i] = lamp;
      const p = this.lamps[lamp]!;
      this.lights[i]!.position.set(p.x, p.y - 0.4, p.z);
    }
  }
}
