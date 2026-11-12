import { BufferAttribute, BufferGeometry, type Color, type Material, Matrix3, Matrix4, type Mesh, type Object3D, Vector3 } from 'three';
import type { ModelAsset } from '../core/assets';
import type { Region, ShopAtlas } from './shopAtlas';

/** Triangles of one kit model, flattened into the model's own space. */
interface KitPart {
  pos: Float32Array;
  nor: Float32Array;
  /** Atlas coordinates. Empty for glass, which has no texture. */
  uv: Float32Array;
  idx: Uint32Array;
}

export interface KitModel {
  name: string;
  solid: KitPart | null;
  glass: KitPart | null;
  /** Bounds at kit scale. */
  min: Vector3;
  max: Vector3;
}

const _m = new Matrix4();
const _inv = new Matrix4();
const _n3 = new Matrix3();
const _v = new Vector3();
const _uv: [number, number] = [0, 0];

/**
 * The furniture kits, read once into plain arrays. Furnishing a shop then copies triangles into
 * that shop's one mesh, which is far cheaper to draw than a scene object per shelf and bottle.
 */
export class ShopKit {
  private models = new Map<string, KitModel>();

  /** Read every top-level model of a kit file. `kit` names its colour chart in the atlas. */
  add(kit: string, asset: ModelAsset, atlas: ShopAtlas): void {
    asset.scene.updateMatrixWorld(true);
    for (const root of asset.scene.children) {
      const model = flatten(kit, root, atlas);
      if (model) this.models.set(`${kit}/${root.name}`, model);
    }
  }

  get(name: string): KitModel {
    const m = this.models.get(name);
    if (!m) throw new Error(`shop kit has no model ${name}`);
    return m;
  }

  has(name: string): boolean {
    return this.models.has(name);
  }
}

function flatten(kit: string, root: Object3D, atlas: ShopAtlas): KitModel | null {
  const solid = { pos: [] as number[], nor: [] as number[], uv: [] as number[], idx: [] as number[] };
  const glass = { pos: [] as number[], nor: [] as number[], uv: [] as number[], idx: [] as number[] };
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  _inv.copy(root.matrixWorld).invert();
  root.traverse((o) => {
    const mesh = o as Mesh;
    // Skinned figures (the kit's shop assistant) cannot be baked into a static mesh.
    if (!mesh.isMesh || (o as { isSkinnedMesh?: boolean }).isSkinnedMesh) return;
    const g = mesh.geometry;
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    const t = g.getAttribute('uv');
    if (!p || !n) return;
    const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as Material;
    const out = material.transparent || material.name.includes('glass') ? glass : solid;
    _m.multiplyMatrices(_inv, mesh.matrixWorld);
    _n3.getNormalMatrix(_m);
    const flipped = _m.determinant() < 0;
    const base = out.pos.length / 3;
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i).applyMatrix4(_m);
      out.pos.push(_v.x, _v.y, _v.z);
      min.min(_v);
      max.max(_v);
      _v.fromBufferAttribute(n, i).applyMatrix3(_n3).normalize();
      out.nor.push(_v.x, _v.y, _v.z);
      if (out === solid) {
        atlas.kitUv(kit, t ? t.getX(i) : 0, t ? t.getY(i) : 0, _uv);
        out.uv.push(_uv[0], _uv[1]);
      }
    }
    const index = g.getIndex();
    const count = index ? index.count : p.count;
    for (let i = 0; i < count; i += 3) {
      const a = base + (index ? index.getX(i) : i);
      const b = base + (index ? index.getX(i + 1) : i + 1);
      const c = base + (index ? index.getX(i + 2) : i + 2);
      // A mirrored node turns its triangles inside out; put them back.
      if (flipped) out.idx.push(a, c, b);
      else out.idx.push(a, b, c);
    }
  });
  if (solid.idx.length === 0 && glass.idx.length === 0) return null;
  const part = (s: typeof solid): KitPart | null =>
    s.idx.length === 0 ? null : { pos: new Float32Array(s.pos), nor: new Float32Array(s.nor), uv: new Float32Array(s.uv), idx: new Uint32Array(s.idx) };
  return { name: root.name, solid: part(solid), glass: part(glass), min, max };
}

type Vec3 = readonly [number, number, number];

/**
 * Collects one shop's unlit geometry: flat-coloured boxes, pictures from the atlas and kit models.
 * Light is painted into the vertex colours once, here, so the room looks the same at noon and at
 * midnight and costs no lighting at all when drawn.
 */
export class Batch {
  private pos: number[] = [];
  private uv: number[] = [];
  private col: number[] = [];
  private idx: number[] = [];
  private gPos: number[] = [];
  private gNor: number[] = [];
  private gIdx: number[] = [];
  private count = 0;
  private gCount = 0;
  /** How bright kit models are painted, against the hand-built parts. */
  kitGain = 1.12;

  /**
   * `lx`, `lz`: the direction the daylight comes from (the shopfront), on the ground plane.
   * `white`: a blank part of the atlas for flat colour.
   */
  constructor(
    private readonly white: Region,
    private readonly lx: number,
    private readonly lz: number,
  ) {}

  get vertices(): number {
    return this.count;
  }

  get triangles(): number {
    return (this.idx.length + this.gIdx.length) / 3;
  }

  /** Indices written to the unlit mesh so far: what was built before this point can be drawn alone. */
  get indexCount(): number {
    return this.idx.length;
  }

  /** Painted light for a surface facing (nx, ny, nz): bright tops, dim undersides, sides by the window. */
  shade(nx: number, ny: number, nz: number): number {
    const side = 0.76 + 0.1 * (nx * this.lx + nz * this.lz);
    if (ny >= 0) return side + (1 - side) * ny;
    return side + (0.5 - side) * -ny;
  }

  /**
   * A quad from four corners, counter-clockwise seen from the front. `gain` multiplies the colour:
   * one number, or one per corner for a painted gradient.
   */
  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Color, region: Region | null = null, gain: number | readonly [number, number, number, number] = 1): void {
    const i = this.count;
    const flat = region === null;
    const r = region ?? this.white;
    const um = (r.u0 + r.u1) / 2;
    const vm = (r.v0 + r.v1) / 2;
    const g = typeof gain === 'number' ? [gain, gain, gain, gain] : gain;
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    if (flat) this.uv.push(um, vm, um, vm, um, vm, um, vm);
    else this.uv.push(r.u0, r.v0, r.u1, r.v0, r.u1, r.v1, r.u0, r.v1);
    for (let k = 0; k < 4; k++) this.col.push(color.r * g[k]!, color.g * g[k]!, color.b * g[k]!);
    this.idx.push(i, i + 1, i + 2, i, i + 2, i + 3);
    this.count += 4;
  }

  /**
   * An axis-aligned box, shaded by which way each face looks. `faces` picks from n (-Z), s (+Z),
   * e (+X), w (-X), t and b. `gain` brightens it (above 1 for things that glow).
   */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: Color, faces = 'nsewt', gain = 1, topColor: Color = color): void {
    if (faces.includes('n')) this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], color, null, gain * this.shade(0, 0, -1));
    if (faces.includes('s')) this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], color, null, gain * this.shade(0, 0, 1));
    if (faces.includes('e')) this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], color, null, gain * this.shade(1, 0, 0));
    if (faces.includes('w')) this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], color, null, gain * this.shade(-1, 0, 0));
    if (faces.includes('t')) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], topColor, null, gain);
    if (faces.includes('b')) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], color, null, gain * 0.5);
  }

  /** An upright cylinder with a flat top, shaded round its side. */
  cylinder(cx: number, y0: number, cz: number, radius: number, height: number, color: Color, segments = 10, gain = 1, topColor: Color = color): void {
    const y1 = y0 + height;
    const base = this.count;
    const um = (this.white.u0 + this.white.u1) / 2;
    const vm = (this.white.v0 + this.white.v1) / 2;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const nx = Math.sin(a);
      const nz = Math.cos(a);
      const s = gain * this.shade(nx, 0, nz);
      for (const y of [y0, y1]) {
        this.pos.push(cx + nx * radius, y, cz + nz * radius);
        this.uv.push(um, vm);
        this.col.push(color.r * s, color.g * s, color.b * s);
      }
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2;
      const b = base + ((i + 1) % segments) * 2;
      this.idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
    this.count += segments * 2;
    const top = this.count;
    this.pos.push(cx, y1, cz);
    this.uv.push(um, vm);
    this.col.push(topColor.r * gain, topColor.g * gain, topColor.b * gain);
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      this.pos.push(cx + Math.sin(a) * radius, y1, cz + Math.cos(a) * radius);
      this.uv.push(um, vm);
      this.col.push(topColor.r * gain, topColor.g * gain, topColor.b * gain);
    }
    for (let i = 0; i < segments; i++) this.idx.push(top, top + 1 + i, top + 1 + ((i + 1) % segments));
    this.count += segments + 1;
  }

  /** Copy a kit model into the mesh, moved by `matrix`. Its glass goes to the glass mesh. */
  kit(model: KitModel, matrix: Matrix4, gain = 1): void {
    _n3.getNormalMatrix(matrix);
    const s = model.solid;
    if (s) {
      const base = this.count;
      const k = this.kitGain * gain;
      for (let i = 0, n = s.pos.length / 3; i < n; i++) {
        _v.set(s.pos[i * 3]!, s.pos[i * 3 + 1]!, s.pos[i * 3 + 2]!).applyMatrix4(matrix);
        this.pos.push(_v.x, _v.y, _v.z);
        _v.set(s.nor[i * 3]!, s.nor[i * 3 + 1]!, s.nor[i * 3 + 2]!).applyMatrix3(_n3).normalize();
        const sh = k * this.shade(_v.x, _v.y, _v.z);
        this.col.push(sh, sh, sh);
        this.uv.push(s.uv[i * 2]!, s.uv[i * 2 + 1]!);
      }
      for (let i = 0; i < s.idx.length; i++) this.idx.push(base + s.idx[i]!);
      this.count += s.pos.length / 3;
    }
    const g = model.glass;
    if (g) {
      const base = this.gCount;
      for (let i = 0, n = g.pos.length / 3; i < n; i++) {
        _v.set(g.pos[i * 3]!, g.pos[i * 3 + 1]!, g.pos[i * 3 + 2]!).applyMatrix4(matrix);
        this.gPos.push(_v.x, _v.y, _v.z);
        _v.set(g.nor[i * 3]!, g.nor[i * 3 + 1]!, g.nor[i * 3 + 2]!).applyMatrix3(_n3).normalize();
        this.gNor.push(_v.x, _v.y, _v.z);
      }
      for (let i = 0; i < g.idx.length; i++) this.gIdx.push(base + g.idx[i]!);
      this.gCount += g.pos.length / 3;
    }
  }

  /** A pane of glass: one quad, seen from both sides. */
  pane(a: Vec3, b: Vec3, c: Vec3, d: Vec3): void {
    const i = this.gCount;
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = d[0] - a[0];
    const vy = d[1] - a[1];
    const vz = d[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    this.gPos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    for (let k = 0; k < 4; k++) this.gNor.push(nx, ny, nz);
    this.gIdx.push(i, i + 1, i + 2, i, i + 2, i + 3);
    this.gCount += 4;
  }

  /**
   * The unlit mesh, with positions measured from (ox, oy, oz): each shop's mesh sits at its own
   * room, so the renderer can cull it and sort its glass by where it really is.
   */
  build(ox: number, oy: number, oz: number): BufferGeometry | null {
    if (this.idx.length === 0) return null;
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(offset(this.pos, ox, oy, oz), 3));
    g.setAttribute('uv', new BufferAttribute(new Float32Array(this.uv), 2));
    g.setAttribute('color', new BufferAttribute(new Float32Array(this.col), 3));
    g.setIndex(new BufferAttribute(this.count > 65535 ? new Uint32Array(this.idx) : new Uint16Array(this.idx), 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  buildGlass(ox: number, oy: number, oz: number): BufferGeometry | null {
    if (this.gIdx.length === 0) return null;
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(offset(this.gPos, ox, oy, oz), 3));
    g.setAttribute('normal', new BufferAttribute(new Float32Array(this.gNor), 3));
    g.setIndex(new BufferAttribute(this.gCount > 65535 ? new Uint32Array(this.gIdx) : new Uint16Array(this.gIdx), 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

function offset(src: number[], ox: number, oy: number, oz: number): Float32Array {
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 3) {
    out[i] = src[i]! - ox;
    out[i + 1] = src[i + 1]! - oy;
    out[i + 2] = src[i + 2]! - oz;
  }
  return out;
}
