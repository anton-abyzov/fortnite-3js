import { BufferAttribute, BufferGeometry, Color } from 'three';

/**
 * Accumulates quads, boxes and cylinders into one indexed geometry with normals, UVs and vertex colours.
 * The whole city is built from these so a block costs a handful of draw calls.
 */
export class MeshBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private uv: number[] = [];
  private col: number[] = [];
  private idx: number[] = [];
  private ext: number[] = [];
  private extUsed = false;
  private sx = 0;
  private sy = 0;
  private sz = 0;
  private sw = 0;
  private count = 0;
  /** World-space UV scale (UV units per metre) for helpers that derive UVs from position. */
  uvScale = 0.25;

  get vertexCount(): number {
    return this.count;
  }

  get empty(): boolean {
    return this.idx.length === 0;
  }

  /**
   * Window style for the facade shader, applied to every vertex added until it changes.
   * `w` and `h` are fractions of a bay and a floor, `kind` is 0 rectangle, 1 porthole, 2 ribbon, 3 storefront.
   */
  setStyle(w: number, h: number, kind: number, seed: number): void {
    this.sx = w;
    this.sy = h;
    this.sz = kind;
    this.sw = seed;
    if (w > 0) this.extUsed = true;
  }

  clearStyle(): void {
    this.sx = 0;
    this.sy = 0;
    this.sz = 0;
  }

  vertex(x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number, c: Color): number {
    this.ext.push(this.sx, this.sy, this.sz, this.sw);
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.uv.push(u, v);
    this.col.push(c.r, c.g, c.b);
    return this.count++;
  }

  tri(a: number, b: number, c: number): void {
    this.idx.push(a, b, c);
  }

  /**
   * Quad from four corners in counter-clockwise order seen from the front.
   * UVs default to 0..1; pass `uvs` as [u0, v0, u1, v1] for a sub-rectangle.
   */
  quad(
    a: readonly [number, number, number],
    b: readonly [number, number, number],
    c: readonly [number, number, number],
    d: readonly [number, number, number],
    color: Color,
    uvs: readonly [number, number, number, number] = [0, 0, 1, 1],
  ): void {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = d[0] - a[0];
    const vy = d[1] - a[1];
    const vz = d[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-9) {
      // Degenerate quad: a zero normal would turn into NaN lighting. Use straight up.
      nx = 0;
      ny = 1;
      nz = 0;
    } else {
      nx /= len;
      ny /= len;
      nz /= len;
    }
    const i0 = this.vertex(a[0], a[1], a[2], nx, ny, nz, uvs[0], uvs[1], color);
    const i1 = this.vertex(b[0], b[1], b[2], nx, ny, nz, uvs[2], uvs[1], color);
    const i2 = this.vertex(c[0], c[1], c[2], nx, ny, nz, uvs[2], uvs[3], color);
    const i3 = this.vertex(d[0], d[1], d[2], nx, ny, nz, uvs[0], uvs[3], color);
    this.idx.push(i0, i1, i2, i0, i2, i3);
  }

  /** Single triangle, counter-clockwise seen from the front. */
  triangle(a: readonly [number, number, number], b: readonly [number, number, number], c: readonly [number, number, number], color: Color): void {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-9) return;
    nx /= len;
    ny /= len;
    nz /= len;
    const i0 = this.vertex(a[0], a[1], a[2], nx, ny, nz, 0, 0, color);
    const i1 = this.vertex(b[0], b[1], b[2], nx, ny, nz, 1, 0, color);
    const i2 = this.vertex(c[0], c[1], c[2], nx, ny, nz, 0.5, 1, color);
    this.idx.push(i0, i1, i2);
  }

  /** Horizontal rectangle facing up, with UVs from world position. */
  floor(x0: number, z0: number, x1: number, z1: number, y: number, color: Color, uvScale = this.uvScale): void {
    const i0 = this.vertex(x0, y, z0, 0, 1, 0, x0 * uvScale, z0 * uvScale, color);
    const i1 = this.vertex(x0, y, z1, 0, 1, 0, x0 * uvScale, z1 * uvScale, color);
    const i2 = this.vertex(x1, y, z1, 0, 1, 0, x1 * uvScale, z1 * uvScale, color);
    const i3 = this.vertex(x1, y, z0, 0, 1, 0, x1 * uvScale, z0 * uvScale, color);
    this.idx.push(i0, i1, i2, i0, i2, i3);
  }

  /** Horizontal rectangle facing down. */
  ceiling(x0: number, z0: number, x1: number, z1: number, y: number, color: Color, uvScale = this.uvScale): void {
    const i0 = this.vertex(x0, y, z0, 0, -1, 0, x0 * uvScale, z0 * uvScale, color);
    const i1 = this.vertex(x1, y, z0, 0, -1, 0, x1 * uvScale, z0 * uvScale, color);
    const i2 = this.vertex(x1, y, z1, 0, -1, 0, x1 * uvScale, z1 * uvScale, color);
    const i3 = this.vertex(x0, y, z1, 0, -1, 0, x0 * uvScale, z1 * uvScale, color);
    this.idx.push(i0, i1, i2, i0, i2, i3);
  }

  /**
   * Vertical wall between two ground points, from y0 up to y1.
   * Walking from a to b on a north-up map, the wall faces your right-hand side: the normal is (-dz, 0, dx).
   */
  wall(
    ax: number,
    az: number,
    bx: number,
    bz: number,
    y0: number,
    y1: number,
    color: Color,
    uvs?: readonly [number, number, number, number],
  ): void {
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const s = this.uvScale;
    const u0 = uvs ? uvs[0] : 0;
    const u1 = uvs ? uvs[2] : len * s;
    const v0 = uvs ? uvs[1] : y0 * s;
    const v1 = uvs ? uvs[3] : y1 * s;
    const i0 = this.vertex(ax, y0, az, nx, 0, nz, u0, v0, color);
    const i1 = this.vertex(bx, y0, bz, nx, 0, nz, u1, v0, color);
    const i2 = this.vertex(bx, y1, bz, nx, 0, nz, u1, v1, color);
    const i3 = this.vertex(ax, y1, az, nx, 0, nz, u0, v1, color);
    this.idx.push(i0, i1, i2, i0, i2, i3);
  }

  /**
   * Axis-aligned box. `faces` is a string of the faces to emit from "nsewtb"
   * (north -Z, south +Z, east +X, west -X, top, bottom).
   */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: Color, faces = 'nsewtb', topColor?: Color): void {
    if (faces.includes('n')) this.wall(x1, z0, x0, z0, y0, y1, color);
    if (faces.includes('s')) this.wall(x0, z1, x1, z1, y0, y1, color);
    if (faces.includes('e')) this.wall(x1, z1, x1, z0, y0, y1, color);
    if (faces.includes('w')) this.wall(x0, z0, x0, z1, y0, y1, color);
    if (faces.includes('t')) this.floor(x0, z0, x1, z1, y1, topColor ?? color);
    if (faces.includes('b')) this.ceiling(x0, z0, x1, z1, y0, color);
  }

  /** Box centred at (cx, cz) and rotated about Y by `yaw`. */
  boxRot(cx: number, y0: number, cz: number, sx: number, sy: number, sz: number, yaw: number, color: Color, topColor?: Color): void {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const hx = sx / 2;
    const hz = sz / 2;
    const p = (lx: number, lz: number): [number, number] => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const [ax, az] = p(-hx, -hz);
    const [bx, bz] = p(hx, -hz);
    const [ccx, ccz] = p(hx, hz);
    const [dx, dz] = p(-hx, hz);
    const y1 = y0 + sy;
    this.wall(bx, bz, ax, az, y0, y1, color);
    this.wall(dx, dz, ccx, ccz, y0, y1, color);
    this.wall(ccx, ccz, bx, bz, y0, y1, color);
    this.wall(ax, az, dx, dz, y0, y1, color);
    this.quad([ax, y1, az], [dx, y1, dz], [ccx, y1, ccz], [bx, y1, bz], topColor ?? color);
    this.quad([ax, y0, az], [bx, y0, bz], [ccx, y0, ccz], [dx, y0, dz], color);
  }

  /** Vertical cylinder or cone frustum, optionally a partial arc. */
  cylinder(
    cx: number,
    y0: number,
    cz: number,
    r0: number,
    r1: number,
    height: number,
    color: Color,
    segments = 12,
    caps = true,
    arcStart = 0,
    arcLength = Math.PI * 2,
  ): void {
    const y1 = y0 + height;
    const slope = (r0 - r1) / height;
    const ring: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = arcStart + (i / segments) * arcLength;
      const sx = Math.sin(a);
      const sz = Math.cos(a);
      const nl = Math.hypot(1, slope);
      const lo = this.vertex(cx + sx * r0, y0, cz + sz * r0, sx / nl, slope / nl, sz / nl, i / segments, 0, color);
      this.vertex(cx + sx * r1, y1, cz + sz * r1, sx / nl, slope / nl, sz / nl, i / segments, 1, color);
      ring.push(lo);
    }
    for (let i = 0; i < segments; i++) {
      const a = ring[i]!;
      const b = ring[i + 1]!;
      this.idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
    if (caps && r1 > 0.001) {
      const centre = this.vertex(cx, y1, cz, 0, 1, 0, 0.5, 0.5, color);
      const start = this.count;
      for (let i = 0; i <= segments; i++) {
        const a = arcStart + (i / segments) * arcLength;
        this.vertex(cx + Math.sin(a) * r1, y1, cz + Math.cos(a) * r1, 0, 1, 0, 0.5 + Math.sin(a) / 2, 0.5 + Math.cos(a) / 2, color);
      }
      for (let i = 0; i < segments; i++) this.idx.push(centre, start + i, start + i + 1);
    }
  }

  /** Append another builder's content, optionally translated. */
  append(other: MeshBuilder, dx = 0, dy = 0, dz = 0): void {
    const base = this.count;
    for (let i = 0; i < other.pos.length; i += 3) this.pos.push(other.pos[i]! + dx, other.pos[i + 1]! + dy, other.pos[i + 2]! + dz);
    // Plain loops: spreading arrays this large into push() overflows the call stack.
    for (const v of other.nor) this.nor.push(v);
    for (const v of other.uv) this.uv.push(v);
    for (const v of other.col) this.col.push(v);
    for (const v of other.ext) this.ext.push(v);
    if (other.extUsed) this.extUsed = true;
    for (const i of other.idx) this.idx.push(i + base);
    this.count += other.count;
  }

  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('normal', new BufferAttribute(new Float32Array(this.nor), 3));
    g.setAttribute('uv', new BufferAttribute(new Float32Array(this.uv), 2));
    g.setAttribute('color', new BufferAttribute(new Float32Array(this.col), 3));
    if (this.extUsed) g.setAttribute('aStyle', new BufferAttribute(new Float32Array(this.ext), 4));
    g.setIndex(this.count > 65535 ? new BufferAttribute(new Uint32Array(this.idx), 1) : new BufferAttribute(new Uint16Array(this.idx), 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  /** Raw arrays for a physics trimesh. */
  collisionData(): { vertices: Float32Array; indices: Uint32Array } {
    return { vertices: new Float32Array(this.pos), indices: new Uint32Array(this.idx) };
  }
}

const _c = new Color();

/** Colour from a hex number, linear working space, reused scratch object unless `fresh`. */
export function col(hex: number, fresh = false): Color {
  return fresh ? new Color(hex) : _c.setHex(hex);
}

export function shade(color: Color, factor: number, out = new Color()): Color {
  return out.copy(color).multiplyScalar(factor);
}
