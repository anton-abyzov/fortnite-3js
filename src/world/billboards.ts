import {
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  type Texture,
  Vector2,
  Vector3,
  Vector4,
  type WebGLProgramParametersWithUniforms,
  type WebGLRenderer,
} from 'three';
import { Assets } from '../core/assets';
import { WORLD } from '../core/config';
import { Rng } from '../core/rng';
import type { QualityPreset } from '../core/settings';
import type { Physics, Surface } from '../physics/physics';
import type { Materials } from '../render/materials';
import type { BuildingInfo, CityBuild } from './buildings';
import { Cell, type WorldField } from './field';
import type { Frame } from './frame';
import { MeshBuilder } from './geo';
import type { Block, District, Layout, Lot, RoadSegment } from './layout';
import type { PropBuild } from './props';
import { shopClearRects } from './shopPlan';

export type ArtKind = 'billboard' | 'mural' | 'poster';
export type ArtMount = 'roof' | 'pole' | 'wall' | 'window';

/** One picture hung in the city, as `window.__eyewall.ext.art()` reports it. */
export interface ArtPiece {
  kind: ArtKind;
  /** Path under `public/assets/img/`. Empty until the manifest has been read. */
  file: string;
  name: string;
  /** Centre of the picture. */
  x: number;
  y: number;
  z: number;
  /** The way the picture faces: yaw 0 faces north (-Z), like everything else. */
  yaw: number;
  width: number;
  height: number;
  /** True once the picture's texture is on its board. */
  loaded: boolean;
  mount: ArtMount;
  /** 2 when the same picture also faces the other way, on the back of a pole board. */
  faces: number;
}

interface ArtEntry {
  file: string;
  name: string;
  width: number;
  height: number;
}

interface ArtManifest {
  billboards?: ArtEntry[];
  murals?: ArtEntry[];
  posters?: ArtEntry[];
}

/** Where one copy of a picture hangs: the middle of its bottom edge on the ground plan, and the way it faces. */
interface Face {
  x: number;
  z: number;
  yaw: number;
}

interface Site {
  piece: ArtPiece;
  faces: Face[];
  /** What the place is about (district, shop type, "beach", ...), matched against what each picture likes. */
  tags: string[];
  /** Sites that share a number never show the same picture twice (the two windows of one shop). */
  group: number;
}

interface PoleSpec {
  x: number;
  z: number;
  /** Ground height at the foot. */
  base: number;
  yaw: number;
  /** How far the middle of the board sits to the viewer's right of the column. */
  off: number;
  tags: string[];
}

interface RoofSpec {
  info: BuildingInfo;
  /** Middle of the board along the front of the building. */
  u: number;
  width: number;
  x: number;
  z: number;
  score: number;
  tags: string[];
}

interface MuralSpec {
  x: number;
  y: number;
  z: number;
  yaw: number;
  width: number;
  height: number;
  score: number;
  district: District;
  tags: string[];
}

interface PosterSpec {
  x: number;
  z: number;
  yaw: number;
  tags: string[];
  group: number;
}

/** A windowless stretch of wall from the ground (or a setback) up to the coping. */
interface BlankWall {
  nx: number;
  nz: number;
  /** Coordinate of the wall plane on the axis it faces along. */
  plane: number;
  /** Extent along the wall. */
  a: number;
  b: number;
  y0: number;
  y1: number;
}

type V3 = readonly [number, number, number];

const GROUND = WORLD.streetY + WORLD.kerb;

/** Board structures and mural walls are fixed counts: their colliders must exist before the nav grid, the manifest arrives later. */
const BILLBOARDS = 8;
const MURALS = 6;

/** Rooftop boards: the picture stands this far behind the facade and this far above the roof, clear of the parapet. */
const ROOF_SETBACK = 1.1;
const ROOF_LIFT = 2.0;
const ROOF_STAY = 2.0;
const PARAPET_INSIDE = 0.3;

/** Pole boards stand clear above the crowns of the sidewalk palms, which top out near 10.6 m. */
const POLE_W = 10;
const POLE_H = 5;
const POLE_LIFT = 11.5;
/** Half the gap between the two faces of a pole board. */
const POLE_HALF = 0.5;
const CATWALK = 0.8;
const LAMPS = 4;

const POSTER_W = 1.2;
const POSTER_H = 1.8;

const STEEL = new Color(0x2b333b);
const HOUSING = new Color(0x161b20);
const GALVANISED = new Color(0x8d959b);
const CREAM = new Color(0xf3efe4);
const CONCRETE = new Color(0xb5b2a8);
const WHITE = new Color(0xffffff);

/** What each picture is about, most important first. Pictures the table does not know go wherever there is room. */
const LIKES: Record<string, readonly string[]> = {
  'pelican-surf': ['surf', 'beach', 'franja'],
  'tidewater-cold-brew': ['cafe', 'deco', 'heights'],
  'cascabel-cola': ['market', 'mercado', 'port'],
  'hotel-flamingo': ['heights', 'hotel', 'deco'],
  'garza-marina': ['marina', 'causeway', 'garza'],
  'marazul-air': ['air', 'causeway', 'garza'],
  'storm-watch': ['plaza', 'heights', 'deco'],
  'sol-987': ['pier', 'beach', 'franja'],
  fruit: ['mercado', 'market', 'deco'],
  pelican: ['port', 'canal', 'mercado'],
  flamingos: ['deco', 'heights', 'street'],
  eye: ['heights', 'deco', 'street'],
  'big-wave': ['franja', 'canal', 'deco'],
  manatee: ['canal', 'mercado', 'port'],
  'mango-smoothie': ['cafe', 'market'],
  sunscreen: ['pharmacy', 'surf'],
  'arcade-night': ['arcade'],
  'fresh-ceviche': ['market', 'cafe'],
  'board-rental': ['surf'],
  'ammo-sale': ['ammo'],
};

/** How each kind of picture is finished: sheen, glow after dark, weathering, and lamps along the bottom edge. */
const LOOK: Record<ArtKind, { roughness: number; glow: number; wear: number; lamps: number }> = {
  billboard: { roughness: 0.6, glow: 1.0, wear: 0, lamps: LAMPS },
  mural: { roughness: 0.94, glow: 0.07, wear: 1, lamps: 0 },
  poster: { roughness: 0.45, glow: 0.6, wear: 0, lamps: 0 },
};

const yawOf = (dx: number, dz: number): number => Math.atan2(-dx, -dz);
const slug = (file: string): string => file.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');

/**
 * A local frame on a picture plane: `r` runs to the viewer's right, `d` out of the picture toward
 * the viewer, `y` is world height. Everything a board is made of is laid out in these.
 */
class Easel {
  readonly dx: number;
  readonly dz: number;
  readonly rx: number;
  readonly rz: number;

  constructor(
    readonly x: number,
    readonly z: number,
    readonly yaw: number,
  ) {
    this.dx = -Math.sin(yaw);
    this.dz = -Math.cos(yaw);
    this.rx = this.dz;
    this.rz = -this.dx;
  }

  px(r: number, d: number): number {
    return this.x + this.rx * r + this.dx * d;
  }

  pz(r: number, d: number): number {
    return this.z + this.rz * r + this.dz * d;
  }

  /** Lateral position of a world point. */
  across(x: number, z: number): number {
    return (x - this.x) * this.rx + (z - this.z) * this.rz;
  }

  box(b: MeshBuilder, r0: number, r1: number, y0: number, y1: number, d0: number, d1: number, color: Color): void {
    const r = (r0 + r1) / 2;
    const d = (d0 + d1) / 2;
    b.boxRot(this.px(r, d), y0, this.pz(r, d), r1 - r0, y1 - y0, d1 - d0, this.yaw, color);
  }

  solid(physics: Physics, r0: number, r1: number, y0: number, y1: number, d0: number, d1: number, surface: Surface = 'metal'): void {
    const r = (r0 + r1) / 2;
    const d = (d0 + d1) / 2;
    physics.addStaticBox(this.px(r, d), (y0 + y1) / 2, this.pz(r, d), (r1 - r0) / 2, (y1 - y0) / 2, (d1 - d0) / 2, { kind: 'world', surface }, this.yaw);
  }

  /** A square strut from (d0, y0) to (d1, y1) at lateral position `r`, with its collider. */
  strut(b: MeshBuilder, physics: Physics, r: number, d0: number, y0: number, d1: number, y1: number, t: number, color: Color): void {
    const len = Math.hypot(d1 - d0, y1 - y0);
    if (len < 1e-3) return;
    const h = t / 2;
    const ud = (d1 - d0) / len;
    const uy = (y1 - y0) / len;
    // Corner of the section at one end: `sr` across, `sn` along the strut's own normal in the (d, y) plane.
    const corner = (end: number, sr: number, sn: number): V3 => {
      const d = (end ? d1 : d0) - uy * h * sn;
      const y = (end ? y1 : y0) + ud * h * sn;
      return [this.px(r + sr * h, d), y, this.pz(r + sr * h, d)];
    };
    const mx = this.px(r, (d0 + d1) / 2);
    const my = (y0 + y1) / 2;
    const mz = this.pz(r, (d0 + d1) / 2);
    const ring: [number, number][] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];
    for (let i = 0; i < 4; i++) {
      const [ra, na] = ring[i]!;
      const [rb, nb] = ring[(i + 1) % 4]!;
      const p0 = corner(0, ra, na);
      const p1 = corner(0, rb, nb);
      const p2 = corner(1, rb, nb);
      const p3 = corner(1, ra, na);
      // Wind each side so it faces away from the strut's axis.
      const ox = (p0[0] + p1[0] + p2[0] + p3[0]) / 4 - mx;
      const oy = (p0[1] + p1[1] + p2[1] + p3[1]) / 4 - my;
      const oz = (p0[2] + p1[2] + p2[2] + p3[2]) / 4 - mz;
      const ux = p1[0] - p0[0];
      const uy2 = p1[1] - p0[1];
      const uz = p1[2] - p0[2];
      const vx = p3[0] - p0[0];
      const vy = p3[1] - p0[1];
      const vz = p3[2] - p0[2];
      const facing = (uy2 * vz - uz * vy) * ox + (uz * vx - ux * vz) * oy + (ux * vy - uy2 * vx) * oz;
      if (facing >= 0) b.quad(p0, p1, p2, p3, color);
      else b.quad(p0, p3, p2, p1, color);
    }
    const along = new Vector3(this.dx * ud, uy, this.dz * ud);
    const side = new Vector3(this.rx, 0, this.rz);
    const q = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(side, new Vector3().crossVectors(along, side), along));
    physics.addStaticBoxQuat(mx, my, mz, h, h, len / 2, { x: q.x, y: q.y, z: q.z, w: q.w }, { kind: 'world', surface: 'metal' });
  }
}

/** Bounds of every triangle of the city in a coarse grid, to ask "is anything built in this box". */
class TriGrid {
  private static readonly CELL = 8;
  private readonly cells = new Map<number, number[]>();
  private readonly bounds: number[] = [];

  add(mesh: Mesh): void {
    const pos = mesh.geometry.getAttribute('position');
    const index = mesh.geometry.getIndex();
    if (!pos || !index) return;
    const p = pos.array as ArrayLike<number>;
    const ix = index.array as ArrayLike<number>;
    const c = TriGrid.CELL;
    for (let k = 0; k + 2 < ix.length; k += 3) {
      const a = ix[k]! * 3;
      const b = ix[k + 1]! * 3;
      const d = ix[k + 2]! * 3;
      const x0 = Math.min(p[a]!, p[b]!, p[d]!);
      const x1 = Math.max(p[a]!, p[b]!, p[d]!);
      const y0 = Math.min(p[a + 1]!, p[b + 1]!, p[d + 1]!);
      const y1 = Math.max(p[a + 1]!, p[b + 1]!, p[d + 1]!);
      const z0 = Math.min(p[a + 2]!, p[b + 2]!, p[d + 2]!);
      const z1 = Math.max(p[a + 2]!, p[b + 2]!, p[d + 2]!);
      const id = this.bounds.length / 6;
      this.bounds.push(x0, y0, z0, x1, y1, z1);
      for (let j = Math.floor(z0 / c); j <= Math.floor(z1 / c); j++) {
        for (let i = Math.floor(x0 / c); i <= Math.floor(x1 / c); i++) {
          const key = (j + 512) * 1024 + (i + 512);
          const list = this.cells.get(key);
          if (list) list.push(id);
          else this.cells.set(key, [id]);
        }
      }
    }
  }

  /** Highest point of any triangle whose bounds reach into the box, or -Infinity. Touching the box does not count. */
  top(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
    const c = TriGrid.CELL;
    const b = this.bounds;
    let best = -Infinity;
    for (let j = Math.floor(z0 / c); j <= Math.floor(z1 / c); j++) {
      for (let i = Math.floor(x0 / c); i <= Math.floor(x1 / c); i++) {
        const list = this.cells.get((j + 512) * 1024 + (i + 512));
        if (!list) continue;
        for (const id of list) {
          const o = id * 6;
          if (b[o]! < x1 && b[o + 3]! > x0 && b[o + 1]! < y1 && b[o + 4]! > y0 && b[o + 2]! < z1 && b[o + 5]! > z0 && b[o + 4]! > best) best = b[o + 4]!;
        }
      }
    }
    return best;
  }

  any(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): boolean {
    return this.top(x0, y0, z0, x1, y1, z1) > -Infinity;
  }
}

/** Finds the places: reads the layout, the finished buildings and the street dressing, and adds nothing to the world. */
class Planner {
  private readonly tris = new TriGrid();
  private readonly rng: Rng;
  /** Board structures placed so far, to keep the next ones apart. */
  private readonly taken: { x: number; z: number }[] = [];

  constructor(
    private readonly layout: Layout,
    private readonly field: WorldField,
    private readonly city: CityBuild,
    private readonly props: PropBuild,
  ) {
    this.rng = new Rng((layout.seed ^ 0x51ab0a2d) >>> 0);
    for (const child of city.group.children) if ((child as Mesh).isMesh) this.tris.add(child as Mesh);
  }

  // ---- shared queries ----

  private segmentAt(x: number, z: number): RoadSegment | undefined {
    for (const s of this.layout.segments) {
      const along = s.axis === 'x' ? x : z;
      const across = s.axis === 'x' ? z : x;
      if (along >= s.a && along <= s.b && Math.abs(across - s.c) <= s.w / 2) return s;
    }
    return undefined;
  }

  private blockAt(x: number, z: number): Block | undefined {
    return this.layout.blocks.find((b) => x >= b.rect.x0 && x <= b.rect.x1 && z >= b.rect.z0 && z <= b.rect.z1);
  }

  private far(x: number, z: number, gap: number): boolean {
    return this.taken.every((t) => Math.hypot(t.x - x, t.z - z) >= gap);
  }

  /** Open pavement: somewhere a column may stand without blocking a lane, a parking bay or a garden bed. */
  private pavement(x: number, z: number): boolean {
    const t = this.field.typeAt(x, z);
    return t === Cell.Sidewalk || t === Cell.Plaza;
  }

  // ---- pole boards ----

  /** Unipoles at the plaza, beside the pier and at both landings of the causeway. */
  poles(): PoleSpec[] {
    const out: PoleSpec[] = [];
    for (const options of [this.plazaPoles(), this.pierPoles(), ...this.causewayPoles()]) {
      // The taller palms of the plaza and the beach would reach the catwalk: look for a spot clear of them first.
      const spec = options.find((o) => this.poleFits(o, true)) ?? options.find((o) => this.poleFits(o, false));
      if (!spec) continue;
      out.push(spec);
      this.taken.push(spec);
    }
    return out;
  }

  private pole(x: number, z: number, yaw: number, off: number, tags: string[]): PoleSpec {
    return { x, z, base: this.field.heightAt(x, z), yaw, off, tags };
  }

  /** The plaza corner on the widest junction, turned to face it. */
  private plazaPoles(): PoleSpec[] {
    const out: PoleSpec[] = [];
    for (const b of this.layout.blocks) {
      if (b.kind !== 'plaza') continue;
      const r = b.rect;
      const corners = [
        [r.x1, r.z1, 1, 1],
        [r.x0, r.z1, -1, 1],
        [r.x1, r.z0, 1, -1],
        [r.x0, r.z0, -1, -1],
      ].map(([cx, cz, sx, sz]) => {
        const beside = this.segmentAt(cx! + sx! * 6, cz! - sz! * 12)?.w ?? 0;
        const below = this.segmentAt(cx! - sx! * 12, cz! + sz! * 6)?.w ?? 0;
        return { cx: cx!, cz: cz!, sx: sx!, sz: sz!, roads: beside + below };
      });
      corners.sort((p, q) => q.roads - p.roads);
      for (const c of corners) {
        for (const inset of [5.5, 7, 4.5, 8.5]) out.push(this.pole(c.cx - c.sx * inset, c.cz - c.sz * inset, yawOf(c.sx, c.sz), 0, ['plaza', b.district]));
      }
    }
    return out;
  }

  /** On the boardwalk beside the long pier: the front to the beach, the back to the parade. */
  private pierPoles(): PoleSpec[] {
    const length = (p: { rect: { x0: number; x1: number; z0: number; z1: number } }): number => Math.max(p.rect.x1 - p.rect.x0, p.rect.z1 - p.rect.z0);
    const piers = [...this.layout.piers].sort((p, q) => (q.name ? 1 : 0) - (p.name ? 1 : 0) || length(q) - length(p));
    const pier = piers[0];
    if (!pier) return [];
    const r = pier.rect;
    const alongX = r.x1 - r.x0 >= r.z1 - r.z0;
    const cx = (r.x0 + r.x1) / 2;
    const cz = (r.z0 + r.z1) / 2;
    // Each end with the direction that leads out to sea from it.
    const ends: [number, number, number, number][] = alongX
      ? [
          [r.x0, cz, 1, 0],
          [r.x1, cz, -1, 0],
        ]
      : [
          [cx, r.z0, 0, 1],
          [cx, r.z1, 0, -1],
        ];
    const end = ends.find(([x, z, dx, dz]) => this.field.isLand(x - dx * 4, z - dz * 4));
    if (!end) return [];
    const [ex, ez, dx, dz] = end;
    const first = this.rng.chance(0.5) ? 1 : -1;
    const reach = this.rng.range(17, 24);
    const out: PoleSpec[] = [];
    for (const side of [first, -first]) {
      for (const extra of [0, 3, -3, 6, 10]) {
        for (const back of [6.5, 5, 8]) {
          const x = ex - dx * back - dz * side * (reach + extra);
          const z = ez - dz * back + dx * side * (reach + extra);
          out.push(this.pole(x, z, yawOf(dx, dz), 0, ['pier', 'beach', this.blockAt(x, z)?.district ?? 'franja']));
        }
      }
    }
    return out;
  }

  /** One list of options for each landing of the longest bridge: beside the road, facing the traffic that comes off it. */
  private causewayPoles(): PoleSpec[][] {
    const length = (s: RoadSegment): number => s.b - s.a;
    const bridges = this.layout.segments.filter((s) => s.bridge).sort((p, q) => (q.bridge!.over === 'bay' ? 1 : 0) - (p.bridge!.over === 'bay' ? 1 : 0) || length(q) - length(p));
    const main = bridges[0];
    if (!main) return [];
    const lists: PoleSpec[][] = [];
    for (const [coord, land] of [
      [main.b, 1],
      [main.a, -1],
    ] as const) {
      const lx = main.axis === 'x' ? land : 0;
      const lz = main.axis === 'x' ? 0 : land;
      const ex = main.axis === 'x' ? coord : main.c;
      const ez = main.axis === 'x' ? main.c : coord;
      // Across the road.
      const ax = main.axis === 'x' ? 0 : 1;
      const az = main.axis === 'x' ? 1 : 0;
      const yaw = yawOf(-lx, -lz);
      const easel = new Easel(0, 0, yaw);
      const sides = this.rng.chance(0.5) ? [1, -1] : [-1, 1];
      const out: PoleSpec[] = [];
      // First choice hangs the board away from the road; closer to the middle when palms are in the way.
      for (const off of [POLE_W / 2 - 1.2, 2.2, 0.8, 0]) {
        for (const side of sides) {
          for (const inland of [1.8, 3, 4.5]) {
            const x = ex + lx * inland + ax * side * (main.w / 2 + 2);
            const z = ez + lz * inland + az * side * (main.w / 2 + 2);
            const district = this.blockAt(x, z)?.district ?? 'deco';
            const tags = district === 'garza' ? ['causeway', 'air', 'garza'] : ['causeway', 'marina', district];
            out.push(this.pole(x, z, yaw, off * side * (ax * easel.rx + az * easel.rz), tags));
          }
        }
      }
      lists.push(out);
    }
    return lists;
  }

  private poleFits(p: PoleSpec, clearOfCrowns: boolean): boolean {
    const { x, z } = p;
    for (const [ox, oz] of [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      if (!this.pavement(x + ox, z + oz)) return false;
    }
    if (!this.far(x, z, 60)) return false;
    for (const site of this.city.shops) {
      const { room, apron } = shopClearRects(site);
      for (const r of [room, apron]) if (x > r.x0 - 1.5 && x < r.x1 + 1.5 && z > r.z0 - 1.5 && z < r.z1 + 1.5) return false;
    }
    for (const s of this.layout.stairs) if (Math.hypot(s.x - x, s.z - z) < s.width + 2) return false;
    for (const pier of this.layout.piers) {
      const r = pier.rect;
      if (x > r.x0 - 3 && x < r.x1 + 3 && z > r.z0 - 3 && z < r.z1 + 3) return false;
    }
    // Lamp posts stand 1.4 m behind their heads; palm trunks lean.
    if (this.props.lamps.some((l) => Math.hypot(l.x - x, l.z - z) < 3)) return false;
    if (this.props.palms.some((t) => Math.hypot(t.x - x, t.z - z) < 2.4)) return false;
    // The board itself, with its catwalks and lamps: no palm right under it, nothing built in it.
    const e = new Easel(x, z, p.yaw);
    const hw = POLE_W / 2 + 0.3;
    const hd = POLE_HALF + CATWALK + 1.2;
    const y0 = p.base + POLE_LIFT;
    if (clearOfCrowns) {
      for (const t of this.props.palms) {
        const r = e.across(t.x, t.z) - p.off;
        const d = (t.x - x) * e.dx + (t.z - z) * e.dz;
        if (Math.abs(r) < hw + 1 && Math.abs(d) < hd + 1) return false;
      }
    }
    let x0 = Infinity;
    let x1 = -Infinity;
    let z0 = Infinity;
    let z1 = -Infinity;
    for (const sr of [-1, 1]) {
      for (const sd of [-1, 1]) {
        const cx = e.px(p.off + sr * hw, sd * hd);
        const cz = e.pz(p.off + sr * hw, sd * hd);
        x0 = Math.min(x0, cx);
        x1 = Math.max(x1, cx);
        z0 = Math.min(z0, cz);
        z1 = Math.max(z1, cz);
      }
    }
    if (this.tris.any(x0, y0 - 1.2, z0, x1, y0 + POLE_H + 0.5, z1)) return false;
    if (this.tris.any(x - 0.8, p.base + 0.3, z - 0.8, x + 0.8, y0, z + 0.8)) return false;
    for (let i = -2; i <= 2; i++) {
      for (const sd of [-1, 0, 1]) {
        const cx = e.px(p.off + (i / 2) * hw, sd * hd);
        const cz = e.pz(p.off + (i / 2) * hw, sd * hd);
        if (this.field.typeAt(cx, cz) === Cell.Building && this.field.heightAt(cx, cz) > y0 - 1.5) return false;
      }
    }
    return true;
  }

  // ---- rooftop boards ----

  /**
   * Rooftop boards. The first four each look for a roof that suits a picture: a surf shop on the
   * beach, a cafe, a market, a roof in the heights. Any more go to the best roofs left.
   */
  roofs(count: number): RoofSpec[] {
    const all: RoofSpec[] = [];
    for (const info of this.city.buildings) {
      const spec = this.roofOn(info);
      if (spec) all.push(spec);
    }
    const has = (c: RoofSpec, tag: string): number => (c.tags.includes(tag) ? 1 : 0);
    const roles: ((c: RoofSpec) => number)[] = [
      (c) => has(c, 'beach') * 2 + has(c, 'surf'),
      (c) => has(c, 'cafe') * 2 + has(c, 'deco'),
      (c) => has(c, 'market') * 2 + has(c, 'mercado'),
      (c) => has(c, 'heights') * 2 + has(c, 'hotel'),
    ];
    const picked: RoofSpec[] = [];
    while (picked.length < count) {
      const role = roles[picked.length] ?? (() => 0);
      let best: RoofSpec | undefined;
      // The best-suited roof wins even if it stands a little closer to another board.
      for (let rank = 3; rank >= 0 && !best; rank--) {
        for (const gap of [150, 90, 50]) {
          for (const c of all) {
            if (picked.includes(c) || role(c) !== rank || !this.far(c.x, c.z, gap)) continue;
            if (!best || c.score > best.score) best = c;
          }
          if (best) break;
        }
      }
      if (!best) break;
      picked.push(best);
      this.taken.push(best);
    }
    return picked;
  }

  private roofOn(info: BuildingInfo): RoofSpec | undefined {
    const { lot, frame: f, roofY } = info;
    if (lot.style === 'villa' || lot.style === 'tower') return undefined;
    // A wide hotel has its name in lights along the same edge.
    if (lot.style === 'hotel' && f.W > 16) return undefined;
    const rise = roofY - GROUND;
    if (rise < 7 || rise > 19 || f.W < 12 || f.D < 11) return undefined;
    const width = Math.min(11, Math.floor((f.W - 2.6) * 2) / 2);
    const height = width / 2;
    // Slide along the front until the board, its stays and its lamps clear the crown, fins, drums and roof plant.
    const lo = width / 2 + 1.3;
    const hi = f.W - width / 2 - 1.3;
    let u: number | undefined;
    for (let step = 0; step <= 12 && u === undefined; step++) {
      for (const side of step === 0 ? [0] : [-1, 1]) {
        const at = f.W / 2 + side * step;
        if (at < lo - 1e-6 || at > hi + 1e-6) continue;
        if (this.roofClear(f, roofY, at, width, height)) {
          u = at;
          break;
        }
      }
    }
    if (u === undefined) return undefined;
    let road = 0;
    for (const out of [5, 8, 11, 14]) {
      const seg = this.segmentAt(f.x(u, -out), f.z(u, -out));
      if (seg) {
        road = seg.w;
        break;
      }
    }
    if (road === 0) return undefined;
    const beach = [26, 34, 42, 50].some((out) => this.field.typeAt(f.x(u, -out), f.z(u, -out)) === Cell.Sand);
    const tags: string[] = [lot.district];
    if (lot.shop) tags.push(lot.shop);
    if (lot.style === 'hotel') tags.push('hotel');
    if (beach) tags.push('beach');
    const score = road * 0.5 + (lot.shop ? 4 : 0) + (beach ? 6 : 0) - Math.abs(rise - 11) * 0.5 + width * 0.3 + this.rng.range(0, 0.5);
    return { info, u, width, x: f.x(u, ROOF_SETBACK), z: f.z(u, ROOF_SETBACK), score, tags };
  }

  private roofClear(f: Frame, roofY: number, u: number, width: number, height: number): boolean {
    const top = roofY + ROOF_LIFT + height + 0.4;
    const u0 = u - width / 2 - 0.5;
    const u1 = u + width / 2 + 0.5;
    // Behind the parapet, down to just above the roof itself.
    const inside = f.worldRect(u0, u1, PARAPET_INSIDE + 0.02, ROOF_SETBACK + 0.45 + ROOF_STAY + 0.5);
    if (this.tris.any(inside.x0, roofY + 0.2, inside.z0, inside.x1, top, inside.z1)) return false;
    // Over the parapet and out over the street, where the lamps hang.
    const outside = f.worldRect(u0, u1, -1.5, PARAPET_INSIDE + 0.02);
    return !this.tris.any(outside.x0, roofY + 1.1, outside.z0, outside.x1, top, outside.z1);
  }

  // ---- murals ----

  murals(count: number): MuralSpec[] {
    const all: MuralSpec[] = [];
    for (const wall of this.blankWalls()) {
      const spec = this.muralOn(wall);
      if (spec) all.push(spec);
    }
    all.sort((p, q) => q.score - p.score);
    const picked: MuralSpec[] = [];
    // The port's sheds are the biggest walls in town: one of them is enough unless the town runs short.
    for (const [gap, portCap, cap] of [
      [80, 1, 2],
      [50, 1, 3],
      [30, 2, 4],
      [12, 6, 6],
    ] as const) {
      for (const c of all) {
        if (picked.length >= count) break;
        if (picked.includes(c)) continue;
        if (picked.some((p) => Math.hypot(p.x - c.x, p.z - c.z) < gap)) continue;
        const same = picked.filter((p) => p.district === c.district).length;
        if (same >= (c.district === 'port' ? portCap : cap)) continue;
        picked.push(c);
      }
    }
    return picked;
  }

  /** Windowless facade quads, stacked into walls. Storeys with windows, and the bands above a shopfront, drop out as too low. */
  private blankWalls(): BlankWall[] {
    const runs = new Map<string, { nx: number; nz: number; plane: number; a: number; b: number; spans: [number, number][] }>();
    for (const child of this.city.group.children) {
      if (!child.name.startsWith('facade-')) continue;
      const g = (child as Mesh).geometry;
      const pos = g.getAttribute('position');
      const nor = g.getAttribute('normal');
      const style = g.getAttribute('aStyle');
      const index = g.getIndex();
      if (!pos || !nor || !index) continue;
      for (let k = 0; k + 5 < index.count; k += 6) {
        const i0 = index.getX(k);
        const i1 = index.getX(k + 1);
        const i2 = index.getX(k + 2);
        if (style && style.getX(i0) > 0.001) continue;
        const nx = nor.getX(i0);
        const nz = nor.getZ(i0);
        if (Math.abs(nor.getY(i0)) > 0.01) continue;
        const alongZ = Math.abs(nx) > 0.99;
        if (!alongZ && Math.abs(nz) < 0.99) continue;
        const ax = pos.getX(i0);
        const az = pos.getZ(i0);
        const bx = pos.getX(i1);
        const bz = pos.getZ(i1);
        const y0 = pos.getY(i0);
        const y1 = pos.getY(i2);
        if (y1 - y0 < 0.05) continue;
        const plane = alongZ ? ax : az;
        const a = alongZ ? Math.min(az, bz) : Math.min(ax, bx);
        const b = alongZ ? Math.max(az, bz) : Math.max(ax, bx);
        const key = `${alongZ ? (nx > 0 ? 'e' : 'w') : nz > 0 ? 's' : 'n'}:${plane.toFixed(2)}:${a.toFixed(2)}:${b.toFixed(2)}`;
        let run = runs.get(key);
        if (!run) runs.set(key, (run = { nx: Math.round(nx), nz: Math.round(nz), plane, a, b, spans: [] }));
        run.spans.push([y0, y1]);
      }
    }
    const out: BlankWall[] = [];
    for (const run of runs.values()) {
      run.spans.sort((p, q) => p[0] - q[0]);
      let y0 = run.spans[0]![0];
      let y1 = run.spans[0]![1];
      const flush = (): void => {
        out.push({ nx: run.nx, nz: run.nz, plane: run.plane, a: run.a, b: run.b, y0, y1 });
      };
      for (const [s0, s1] of run.spans.slice(1)) {
        if (s0 <= y1 + 0.03) y1 = Math.max(y1, s1);
        else {
          flush();
          y0 = s0;
          y1 = s1;
        }
      }
      flush();
    }
    return out;
  }

  /** The building a wall belongs to: the one whose footprint has it as an edge. */
  private owner(wall: BlankWall): Lot | undefined {
    const eps = 0.06;
    for (const b of this.city.buildings) {
      const r = b.rect;
      const edge = wall.nx > 0 ? r.x1 : wall.nx < 0 ? r.x0 : wall.nz > 0 ? r.z1 : r.z0;
      if (Math.abs(edge - wall.plane) > eps) continue;
      const lo = wall.nx !== 0 ? r.z0 : r.x0;
      const hi = wall.nx !== 0 ? r.z1 : r.x1;
      if (wall.a >= lo - eps && wall.b <= hi + eps) return b.lot;
    }
    return undefined;
  }

  private muralOn(wall: BlankWall): MuralSpec | undefined {
    const length = wall.b - wall.a;
    const top = wall.y1 - 0.7;
    if (length < 8.7 || top - wall.y0 < 6) return undefined;
    const lot = this.owner(wall);
    if (!lot) return undefined;
    // World position of a point `s` along the wall and `d` out from it.
    const at = (s: number, d: number): [number, number] => (wall.nx !== 0 ? [wall.plane + wall.nx * d, s] : [s, wall.plane + wall.nz * d]);
    let best: MuralSpec | undefined;
    for (const t of [0.5, 0.25, 0.75]) {
      let bottom = wall.y0 + 1.0;
      let height = Math.min(9, top - bottom);
      let width = Math.min(height * 1.5, length - 1.2);
      const mid = wall.a + 0.6 + width / 2 + (length - 1.2 - width) * t;
      const s0 = mid - width / 2 - 0.3;
      const s1 = mid + width / 2 + 0.3;
      // Whatever stands against the wall or close in front of it: the picture starts above that.
      const [xa, za] = at(s0, 0.03);
      const [xb, zb] = at(s1, 5);
      let blocked = this.tris.top(Math.min(xa, xb), wall.y0 + 0.4, Math.min(za, zb), Math.max(xa, xb), top, Math.max(za, zb));
      for (let s = s0; s <= s1 + 1e-6; s += 1.2) {
        for (const d of [0.8, 2, 3.5, 5, 6.5, 8]) {
          const [x, z] = at(s, d);
          if (this.field.typeAt(x, z) === Cell.Building) blocked = Math.max(blocked, this.field.heightAt(x, z));
        }
      }
      if (blocked > -Infinity) bottom = Math.max(bottom, blocked + 0.4);
      height = Math.min(9, top - bottom);
      if (height < 5) continue;
      width = Math.min(height * 1.5, length - 1.2);
      height = width / 1.5;
      if (width < 7.5) continue;
      // Sits high on the wall, where the eye goes and nothing parks in front of it.
      const y = top - height / 2 - (top - bottom - height) * 0.3;
      // What the wall looks out on.
      let facing = '';
      let open = 70;
      for (let d = 1; d <= 70; d += 1.25) {
        const [x, z] = at(mid, d);
        const cell = this.field.typeAt(x, z);
        if (cell === Cell.Building && this.field.heightAt(x, z) > y) {
          open = d;
          break;
        }
        if (cell === Cell.Road || cell === Cell.Bridge) {
          facing = 'street';
          open = d;
          break;
        }
        if (cell === Cell.Water) {
          facing = 'canal';
          open = d;
          break;
        }
      }
      if (!facing && open < 16) continue;
      let palms = 0;
      for (const p of this.props.palms) {
        const s = wall.nx !== 0 ? p.z : p.x;
        const d = wall.nx !== 0 ? (p.x - wall.plane) * wall.nx : (p.z - wall.plane) * wall.nz;
        if (s > s0 - 1 && s < s1 + 1 && d > 0 && d < 8) palms++;
      }
      const raised = bottom > wall.y0 + 1.5;
      const score = width * height * (facing === 'street' ? 1 : facing === 'canal' ? 0.9 : 0.45) * Math.max(0.3, 1 - palms * 0.25) * (raised ? 0.85 : 1) * (t === 0.5 ? 1 : 0.97);
      if (best && best.score >= score) continue;
      const [x, z] = at(mid, 0.04);
      const tags: string[] = [lot.district, lot.style];
      if (facing) tags.push(facing);
      if (lot.shop) tags.push(lot.shop);
      best = { x, y, z, yaw: yawOf(wall.nx, wall.nz), width, height, score, district: lot.district, tags };
    }
    return best;
  }

  // ---- posters ----

  /** In the painted windows either side of each shop's real glass. */
  posters(): PosterSpec[] {
    const out: PosterSpec[] = [];
    for (const site of this.city.shops) {
      const { plan: p, frame: f, lot } = site;
      for (const bay of [p.bay0 - 1, p.bay1]) {
        if (bay < 0 || bay >= p.bays) continue;
        const u = (bay + 0.5) * p.bayW;
        // Corner drums, fins and doors stand in front of some bays.
        const r = f.worldRect(u - POSTER_W / 2 - 0.25, u + POSTER_W / 2 + 0.25, -0.6, -0.02);
        if (this.tris.any(r.x0, GROUND + 0.6, r.z0, r.x1, GROUND + 0.85 + POSTER_H + 0.1, r.z1)) continue;
        out.push({ x: f.x(u, -0.065), z: f.z(u, -0.065), yaw: f.yawOut, tags: [lot.shop ?? p.type, lot.district], group: lot.id });
      }
    }
    return out;
  }
}

/** One program for every picture: the map, a glow after dark from the lamps along the bottom edge, and worn paint on murals. */
function artMaterial(map: Texture, kind: ArtKind, width: number, height: number, night: { value: number }): MeshStandardMaterial {
  const look = LOOK[kind];
  const material = new MeshStandardMaterial({ map, roughness: look.roughness, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const uArt = { value: new Vector4(look.glow, look.wear, look.lamps, 0) };
  const uArtSize = { value: new Vector2(width, height) };
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms['uNight'] = night;
    shader.uniforms['uArt'] = uArt;
    shader.uniforms['uArtSize'] = uArtSize;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uNight;
        uniform vec4 uArt;
        uniform vec2 uArtSize;
        float artHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float artNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(artHash(i), artHash(i + vec2(1.0, 0.0)), f.x), mix(artHash(i + vec2(0.0, 1.0)), artHash(i + vec2(1.0, 1.0)), f.x), f.y);
        }`,
      )
      .replace(
        '#include <map_fragment>',
        /* glsl */ `#include <map_fragment>
        if (uArt.y > 0.0) {
          // Paint on stucco: a brushed edge, a few flakes where the wall shows through, sun fade and rain streaks.
          vec2 m = vMapUv * uArtSize;
          float n = artNoise(m * 1.3) * 0.6 + artNoise(m * 4.1) * 0.4;
          vec2 rim = min(vMapUv, 1.0 - vMapUv) * uArtSize;
          if (min(rim.x, rim.y) + (n - 0.5) * 0.34 < 0.1) discard;
          float flake = artNoise(m * 2.3 + 17.0) * 0.7 + artNoise(m * 7.0 + 5.0) * 0.3;
          if (flake > 0.86 - 0.07 * (1.0 - vMapUv.y)) discard;
          float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lum), 0.14 * uArt.y);
          float streak = artNoise(vec2(m.x * 2.6, m.y * 0.22));
          diffuseColor.rgb *= 1.0 - uArt.y * (0.1 * n + 0.14 * streak * streak);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        {
          float lit = 1.0;
          if (uArt.z > 0.5) {
            // Pools of light over each lamp at the bottom edge, running together and fading toward the top.
            float pool = 0.5 + 0.5 * cos((vMapUv.x * uArt.z - 0.5) * 6.2832);
            lit = mix(0.6 + 0.4 * pool, 0.84, vMapUv.y) * mix(1.14, 0.62, vMapUv.y);
          }
          totalEmissiveRadiance += diffuseColor.rgb * (uNight * uArt.x * lit);
        }`,
      );
  };
  material.customProgramCacheKey = () => 'art';
  return material;
}

/**
 * The city's advertising and street art: steel-framed boards on rooftops and on poles beside the main
 * roads, murals on blank side walls and posters in shop windows. Every place is read off the layout and
 * the finished buildings, so a seed always hangs the same pictures in the same places.
 */
export class Billboards {
  readonly group = new Group();
  private readonly sites: Site[] = [];
  private readonly paint = new MeshBuilder();
  private readonly heads = new MeshBuilder();

  constructor(
    layout: Layout,
    field: WorldField,
    city: CityBuild,
    props: PropBuild,
    private readonly materials: Materials,
    private readonly physics: Physics,
    private readonly renderer: WebGLRenderer,
    private readonly quality: QualityPreset,
    private readonly assets: Assets = new Assets(),
  ) {
    this.group.name = 'billboards';
    const plan = new Planner(layout, field, city, props);
    const poles = plan.poles();
    for (const p of poles) this.poleBoard(p);
    for (const r of plan.roofs(BILLBOARDS - poles.length)) this.roofBoard(r);
    for (const m of plan.murals(MURALS)) {
      this.sites.push({ piece: this.piece('mural', 'wall', m.x, m.y, m.z, m.yaw, m.width, m.height, 1), faces: [{ x: m.x, z: m.z, yaw: m.yaw }], tags: m.tags, group: -1 });
    }
    for (const p of plan.posters()) this.poster(p);

    const add = (builder: MeshBuilder, material: Mesh['material'], name: string, cast: boolean): void => {
      if (builder.empty) return;
      const mesh = new Mesh(builder.build(), material);
      mesh.name = name;
      mesh.castShadow = cast;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.group.add(mesh);
    };
    add(this.paint, materials.paint, 'art-frames', true);
    add(this.heads, materials.lamp, 'art-lamps', false);

    if (typeof window !== 'undefined' && window.__eyewall) window.__eyewall.ext['art'] = () => this.debug();
    this.hang().catch((err: unknown) => console.warn('[art] the pictures did not load:', err));
  }

  /** Every placed piece, for tests and tooling. */
  debug(): ArtPiece[] {
    return this.sites.map((s) => ({ ...s.piece }));
  }

  private piece(kind: ArtKind, mount: ArtMount, x: number, y: number, z: number, yaw: number, width: number, height: number, faces: number): ArtPiece {
    return { kind, file: '', name: '', x, y, z, yaw, width, height, loaded: false, mount, faces };
  }

  // ---- structures ----

  /** What stands in front of one face of a board: a catwalk with a rail, and lamps on arms that shine back at the picture. */
  private dress(e: Easel, width: number, bottom: number): void {
    const { paint, heads } = this;
    const hw = width / 2 + 0.1;
    const deck = bottom - 0.5;
    e.box(paint, -hw, hw, deck - 0.08, deck, 0, CATWALK, GALVANISED);
    e.box(paint, -hw, hw, deck + 0.86, deck + 0.9, CATWALK - 0.05, CATWALK, STEEL);
    e.box(paint, -hw, hw, deck + 0.43, deck + 0.46, CATWALK - 0.04, CATWALK - 0.01, STEEL);
    const posts = Math.max(2, Math.round(width / 2.2) + 1);
    for (let i = 0; i < posts; i++) {
      const r = -hw + 0.03 + ((hw * 2 - 0.06) * i) / (posts - 1);
      e.box(paint, r - 0.025, r + 0.025, deck, deck + 0.86, CATWALK - 0.05, CATWALK, STEEL);
    }
    for (let i = 0; i < LAMPS; i++) {
      const r = -width / 2 + ((i + 0.5) * width) / LAMPS;
      e.box(paint, r - 0.03, r + 0.03, deck - 0.07, deck - 0.01, CATWALK, CATWALK + 0.95, STEEL);
      e.box(paint, r - 0.24, r + 0.24, deck - 0.02, deck + 0.2, CATWALK + 0.86, CATWALK + 1.12, HOUSING);
      // The lens faces the board; its rim shows around the housing from the street.
      e.box(heads, r - 0.27, r + 0.27, deck - 0.04, deck + 0.23, CATWALK + 0.82, CATWALK + 0.86, WHITE);
    }
  }

  private roofBoard(spec: RoofSpec): void {
    const { paint, physics } = this;
    const f = spec.info.frame;
    const roof = spec.info.roofY;
    const w = spec.width;
    const h = w / 2;
    const hw = w / 2;
    const y0 = roof + ROOF_LIFT;
    const y1 = y0 + h;
    const e = new Easel(spec.x, spec.z, f.yawOut);
    // The sheet: a cream border round the picture, dark steel behind.
    e.box(paint, -hw - 0.16, hw + 0.16, y0 - 0.16, y1 + 0.16, -0.14, -0.03, CREAM);
    e.box(paint, -hw - 0.2, hw + 0.2, y0 - 0.2, y1 + 0.2, -0.22, -0.14, STEEL);
    const back = -0.42;
    const posts = Math.max(3, Math.round(w / 2.75) + 1);
    for (let i = 0; i < posts; i++) {
      const r = -hw + 0.35 + ((w - 0.7) * i) / (posts - 1);
      e.box(paint, r - 0.09, r + 0.09, roof, y1 - 0.1, back, -0.22, STEEL);
      // A raked stay back to a footplate on the roof, and a bracket forward under the catwalk.
      e.strut(paint, physics, r, back, y0 + h * 0.6, back - ROOF_STAY, roof + 0.06, 0.12, STEEL);
      e.box(paint, r - 0.2, r + 0.2, roof, roof + 0.06, back - ROOF_STAY - 0.22, back - ROOF_STAY + 0.18, STEEL);
      e.box(paint, r - 0.04, r + 0.04, y0 - 0.7, y0 - 0.58, -0.22, CATWALK, STEEL);
    }
    for (const y of [y0 + h * 0.2, y0 + h * 0.8]) e.box(paint, -hw, hw, y - 0.06, y + 0.06, -0.3, -0.22, STEEL);
    this.dress(e, w, y0);
    // The sheet with its posts, and everything from the roof to the catwalk: nobody squeezes under it.
    e.solid(physics, -hw - 0.2, hw + 0.2, y0 - 0.58, y1 + 0.2, back, 0);
    e.solid(physics, -hw - 0.1, hw + 0.1, roof, y0 - 0.5, back, CATWALK);
    const tags = spec.tags;
    this.sites.push({ piece: this.piece('billboard', 'roof', spec.x, y0 + h / 2, spec.z, f.yawOut, w, h, 1), faces: [{ x: spec.x, z: spec.z, yaw: f.yawOut }], tags, group: -1 });
  }

  private poleBoard(spec: PoleSpec): void {
    const { paint, physics } = this;
    const w = POLE_W;
    const h = POLE_H;
    const hw = w / 2;
    const y0 = spec.base + POLE_LIFT;
    const y1 = y0 + h;
    const column = new Easel(spec.x, spec.z, spec.yaw);
    // Middle of the board, between its two faces.
    const mid = new Easel(column.px(spec.off, 0), column.pz(spec.off, 0), spec.yaw);
    const front: Face = { x: mid.px(0, POLE_HALF), z: mid.pz(0, POLE_HALF), yaw: spec.yaw };
    const rear: Face = { x: mid.px(0, -POLE_HALF), z: mid.pz(0, -POLE_HALF), yaw: spec.yaw + Math.PI };
    mid.box(paint, -hw - 0.16, hw + 0.16, y0 - 0.16, y1 + 0.16, -POLE_HALF + 0.03, POLE_HALF - 0.03, CREAM);
    mid.box(paint, -hw - 0.22, hw + 0.22, y1 + 0.16, y1 + 0.26, -POLE_HALF - 0.03, POLE_HALF + 0.03, STEEL);
    mid.box(paint, -hw - 0.22, hw + 0.22, y0 - 0.26, y0 - 0.16, -POLE_HALF - 0.03, POLE_HALF + 0.03, STEEL);
    // Catwalk under the middle, joining the two outside.
    mid.box(paint, -hw - 0.1, hw + 0.1, y0 - 0.58, y0 - 0.5, -POLE_HALF, POLE_HALF, GALVANISED);
    // The column runs up between the faces from a concrete footing, with a collar where it takes the board.
    paint.cylinder(spec.x, spec.base, spec.z, 0.46, 0.4, y0 + h * 0.5 - spec.base, STEEL, 14, false);
    paint.cylinder(spec.x, spec.base, spec.z, 0.95, 0.9, 0.4, CONCRETE, 16);
    mid.box(paint, -spec.off - 0.7, -spec.off + 0.7, y0 - 0.95, y0 - 0.58, -0.62, 0.62, STEEL);
    this.dress(new Easel(front.x, front.z, front.yaw), w, y0);
    this.dress(new Easel(rear.x, rear.z, rear.yaw), w, y0);
    physics.addStaticCylinder(spec.x, (spec.base + y0) / 2, spec.z, (y0 - spec.base) / 2, 0.46, { kind: 'world', surface: 'metal' });
    physics.addStaticCylinder(spec.x, spec.base + 0.2, spec.z, 0.2, 0.95, { kind: 'world', surface: 'concrete' });
    mid.solid(physics, -hw - 0.22, hw + 0.22, y0 - 0.26, y1 + 0.26, -POLE_HALF, POLE_HALF);
    mid.solid(physics, -hw - 0.1, hw + 0.1, y0 - 0.58, y0 - 0.5, -POLE_HALF - CATWALK, POLE_HALF + CATWALK);
    this.sites.push({ piece: this.piece('billboard', 'pole', front.x, y0 + h / 2, front.z, spec.yaw, w, h, 2), faces: [front, rear], tags: spec.tags, group: -1 });
  }

  private poster(spec: PosterSpec): void {
    const y0 = GROUND + 0.85;
    const e = new Easel(spec.x, spec.z, spec.yaw);
    e.box(this.paint, -POSTER_W / 2 - 0.035, POSTER_W / 2 + 0.035, y0 - 0.035, y0 + POSTER_H + 0.035, -0.05, -0.012, STEEL);
    this.sites.push({ piece: this.piece('poster', 'window', spec.x, y0 + POSTER_H / 2, spec.z, spec.yaw, POSTER_W, POSTER_H, 1), faces: [{ x: spec.x, z: spec.z, yaw: spec.yaw }], tags: spec.tags, group: spec.group });
  }

  // ---- pictures ----

  /** Read the manifest, decide which picture goes where, and put each one up as its texture arrives. */
  private async hang(): Promise<void> {
    const res = await fetch(this.assets.url('img/art.json'));
    if (!res.ok) throw new Error(`art.json: HTTP ${res.status}`);
    const manifest = (await res.json()) as ArtManifest;
    const jobs: Promise<void>[] = [];
    for (const [kind, entries] of [
      ['billboard', manifest.billboards ?? []],
      ['mural', manifest.murals ?? []],
      ['poster', manifest.posters ?? []],
    ] as const) {
      const sites = this.sites.filter((s) => s.piece.kind === kind);
      for (const [entry, hung] of this.assign(sites, entries)) jobs.push(this.mount(kind, entry, hung));
    }
    await Promise.all(jobs);
  }

  /** Match pictures to places by what each is about. Every picture gets a place first; places left over share the pictures. */
  private assign(sites: Site[], entries: readonly ArtEntry[]): Map<ArtEntry, Site[]> {
    const out = new Map<ArtEntry, Site[]>();
    if (entries.length === 0) return out;
    const fit = (site: Site, entry: ArtEntry): number => {
      const likes = LIKES[slug(entry.file)] ?? [];
      return likes.reduce((n, tag, i) => n + (site.tags.includes(tag) ? 4 - i : 0), 0);
    };
    const give = (site: Site, entry: ArtEntry): void => {
      site.piece.file = entry.file;
      site.piece.name = entry.name;
      const list = out.get(entry);
      if (list) list.push(site);
      else out.set(entry, [site]);
    };
    const open = [...sites];
    const spare = [...entries];
    while (open.length > 0 && spare.length > 0) {
      let si = 0;
      let ei = 0;
      let best = -1;
      for (let i = 0; i < open.length; i++) {
        for (let j = 0; j < spare.length; j++) {
          const score = fit(open[i]!, spare[j]!);
          if (score > best) {
            best = score;
            si = i;
            ei = j;
          }
        }
      }
      give(open[si]!, spare[ei]!);
      open.splice(si, 1);
      spare.splice(ei, 1);
    }
    for (const site of open) {
      let pick = entries[0]!;
      let best = -Infinity;
      for (const entry of entries) {
        const hung = out.get(entry) ?? [];
        const twice = site.group >= 0 && hung.some((s) => s.group === site.group);
        const score = fit(site, entry) - hung.length * 0.01 - (twice ? 100 : 0);
        if (score > best) {
          best = score;
          pick = entry;
        }
      }
      give(site, pick);
    }
    return out;
  }

  /** One mesh and one material per picture, however many places show it. */
  private async mount(kind: ArtKind, entry: ArtEntry, sites: Site[]): Promise<void> {
    let map: Texture;
    try {
      map = await this.assets.loadTexture(`img/${entry.file}`);
    } catch (err) {
      console.warn(`[art] ${entry.file} did not load:`, err);
      return;
    }
    map.anisotropy = Math.max(1, Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.quality.anisotropy));
    map.generateMipmaps = true;
    map.needsUpdate = true;
    // Upload now, during loading, instead of on the frame the board first comes into view.
    this.renderer.initTexture(map);
    const b = new MeshBuilder();
    for (const site of sites) {
      const { width, height, y } = site.piece;
      for (const face of site.faces) {
        const e = new Easel(face.x, face.z, face.yaw);
        b.wall(e.px(-width / 2, 0), e.pz(-width / 2, 0), e.px(width / 2, 0), e.pz(width / 2, 0), y - height / 2, y + height / 2, WHITE, [0, 0, 1, 1]);
      }
    }
    const first = sites[0]!.piece;
    const mesh = new Mesh(b.build(), artMaterial(map, kind, first.width, first.height, this.materials.shared.uNight));
    mesh.name = `art-${slug(entry.file)}`;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    this.group.add(mesh);
    for (const site of sites) site.piece.loaded = true;
  }
}
