import type { Color } from 'three';
import type { MeshBuilder } from './geo';
import type { Rect, Side } from './layout';

const OPPOSITE: Record<Side, Side> = { n: 's', s: 'n', e: 'w', w: 'e' };
const LEFT_OF: Record<Side, Side> = { s: 'w', n: 'e', e: 's', w: 'n' };

/**
 * A building's local frame. `u` runs left to right along the front as seen from the street,
 * `w` runs from the front face back into the lot, `y` is up. Fronts only face the four compass
 * directions, so every local box is still an axis-aligned box in the world.
 */
export class Frame {
  /** Width along the front. */
  readonly W: number;
  /** Depth away from the street. */
  readonly D: number;
  private ox: number;
  private oz: number;
  private ux: number;
  private uz: number;
  private wx: number;
  private wz: number;

  constructor(
    readonly rect: Rect,
    readonly front: Side,
  ) {
    const r = rect;
    switch (front) {
      case 's':
        this.W = r.x1 - r.x0;
        this.D = r.z1 - r.z0;
        [this.ox, this.oz, this.ux, this.uz, this.wx, this.wz] = [r.x0, r.z1, 1, 0, 0, -1];
        break;
      case 'n':
        this.W = r.x1 - r.x0;
        this.D = r.z1 - r.z0;
        [this.ox, this.oz, this.ux, this.uz, this.wx, this.wz] = [r.x1, r.z0, -1, 0, 0, 1];
        break;
      case 'e':
        this.W = r.z1 - r.z0;
        this.D = r.x1 - r.x0;
        [this.ox, this.oz, this.ux, this.uz, this.wx, this.wz] = [r.x1, r.z1, 0, -1, -1, 0];
        break;
      default:
        this.W = r.z1 - r.z0;
        this.D = r.x1 - r.x0;
        [this.ox, this.oz, this.ux, this.uz, this.wx, this.wz] = [r.x0, r.z0, 0, 1, 1, 0];
        break;
    }
  }

  x(u: number, w: number): number {
    return this.ox + u * this.ux + w * this.wx;
  }

  z(u: number, w: number): number {
    return this.oz + u * this.uz + w * this.wz;
  }

  /** Yaw for an object that should face the street (its local -Z toward the viewer on the street). */
  get yawOut(): number {
    return this.front === 'n' ? 0 : this.front === 's' ? Math.PI : this.front === 'e' ? -Math.PI / 2 : Math.PI / 2;
  }

  /** Outward street direction on the ground plane. */
  get outX(): number {
    return -this.wx;
  }

  get outZ(): number {
    return -this.wz;
  }

  worldRect(u0: number, u1: number, w0: number, w1: number): Rect {
    const xa = this.x(u0, w0);
    const xb = this.x(u1, w1);
    const za = this.z(u0, w0);
    const zb = this.z(u1, w1);
    return { x0: Math.min(xa, xb), x1: Math.max(xa, xb), z0: Math.min(za, zb), z1: Math.max(za, zb) };
  }

  /** Translate local face letters (f front, k back, l left, r right, t top, b bottom) to compass faces. */
  private faces(local: string): string {
    let out = '';
    for (const ch of local) {
      if (ch === 'f') out += this.front;
      else if (ch === 'k') out += OPPOSITE[this.front];
      else if (ch === 'l') out += LEFT_OF[this.front];
      else if (ch === 'r') out += OPPOSITE[LEFT_OF[this.front]];
      else out += ch;
    }
    return out;
  }

  box(b: MeshBuilder, u0: number, u1: number, y0: number, y1: number, w0: number, w1: number, color: Color, faces = 'fklrtb', topColor?: Color): void {
    const r = this.worldRect(u0, u1, w0, w1);
    b.box(r.x0, y0, r.z0, r.x1, y1, r.z1, color, this.faces(faces), topColor);
  }

  /** Wall on the street side at depth `w`, facing the street. UV u runs left to right for the viewer. */
  wallFront(b: MeshBuilder, u0: number, u1: number, y0: number, y1: number, w: number, color: Color, uvs?: readonly [number, number, number, number]): void {
    b.wall(this.x(u0, w), this.z(u0, w), this.x(u1, w), this.z(u1, w), y0, y1, color, uvs);
  }

  wallBack(b: MeshBuilder, u0: number, u1: number, y0: number, y1: number, w: number, color: Color, uvs?: readonly [number, number, number, number]): void {
    b.wall(this.x(u1, w), this.z(u1, w), this.x(u0, w), this.z(u0, w), y0, y1, color, uvs);
  }

  /** Wall at `u` facing left (toward smaller u). */
  wallLeft(b: MeshBuilder, u: number, w0: number, w1: number, y0: number, y1: number, color: Color, uvs?: readonly [number, number, number, number]): void {
    b.wall(this.x(u, w1), this.z(u, w1), this.x(u, w0), this.z(u, w0), y0, y1, color, uvs);
  }

  /** Wall at `u` facing right (toward larger u). */
  wallRight(b: MeshBuilder, u: number, w0: number, w1: number, y0: number, y1: number, color: Color, uvs?: readonly [number, number, number, number]): void {
    b.wall(this.x(u, w0), this.z(u, w0), this.x(u, w1), this.z(u, w1), y0, y1, color, uvs);
  }

  floor(b: MeshBuilder, u0: number, u1: number, w0: number, w1: number, y: number, color: Color): void {
    const r = this.worldRect(u0, u1, w0, w1);
    b.floor(r.x0, r.z0, r.x1, r.z1, y, color);
  }

  ceiling(b: MeshBuilder, u0: number, u1: number, w0: number, w1: number, y: number, color: Color): void {
    const r = this.worldRect(u0, u1, w0, w1);
    b.ceiling(r.x0, r.z0, r.x1, r.z1, y, color);
  }

  /**
   * A flat quad standing on the street side at depth `w` (slightly in front of a wall), for signs.
   * UVs are given as an atlas rectangle [u0, v0, u1, v1] with v0 at the bottom.
   */
  signFront(b: MeshBuilder, u0: number, u1: number, y0: number, y1: number, w: number, color: Color, uvs: readonly [number, number, number, number]): void {
    this.wallFront(b, u0, u1, y0, y1, w, color, uvs);
  }
}
