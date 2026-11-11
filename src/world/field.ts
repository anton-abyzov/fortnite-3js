import { WORLD } from '../core/config';
import { clamp, clamp01, lerp, smoothstep } from '../core/math';
import { fbm2 } from '../core/rng';
import { bridgeRise, type Layout, type Rect, rectDistance } from './layout';

/** What covers a cell of the world grid. */
export const enum Cell {
  Water = 0,
  Road = 1,
  Sidewalk = 2,
  Building = 3,
  Sand = 4,
  Grass = 5,
  Plaza = 6,
  Pier = 7,
  Bridge = 8,
  Yard = 9,
  Pool = 10,
  Lot = 11,
}

const BEACH_PROFILE: [number, number][] = [
  [0, WORLD.streetY + WORLD.kerb],
  [8, 1.95],
  [26, 1.3],
  [52, 0],
  [86, -2.0],
  [120, -4.0],
];

export const SEA_BED = -4;

function profile(d: number): number {
  const p = BEACH_PROFILE;
  if (d <= p[0]![0]) return p[0]![1];
  for (let i = 0; i + 1 < p.length; i++) {
    const a = p[i]!;
    const b = p[i + 1]!;
    if (d <= b[0]) return lerp(a[1], b[1], (d - a[0]) / (b[0] - a[0]));
  }
  return SEA_BED;
}

/** Height of the sand around the beach island. Only meaningful east of the creek. */
export function beachHeight(layout: Layout, x: number, z: number): number {
  const r = layout.beach.rect;
  if (x < r.x0) return SEA_BED;
  const d = rectDistance(r, x, z);
  let h = profile(d);
  if (d > 6 && d < 44) {
    // Low dunes and footprints of wind on the dry sand.
    const dune = (fbm2(x * 0.06, z * 0.06, 3, 7) - 0.5) * 0.55 * smoothstep(6, 16, d) * (1 - smoothstep(30, 44, d));
    h += dune;
  }
  if (z < r.z0 || z > r.z1) h = lerp(SEA_BED, h, smoothstep(r.x0, r.x0 + 40, x));
  return h;
}

export function isletHeight(islet: { x: number; z: number; r: number; h: number }, x: number, z: number): number {
  const dist = Math.hypot(x - islet.x, z - islet.z);
  const e = 1 - dist / islet.r;
  if (e >= 0) return islet.h * smoothstep(0, 1, e) + (fbm2(x * 0.09, z * 0.09, 2, 3) - 0.5) * 0.3 * e;
  return lerp(0, SEA_BED, clamp01(-e * 1.3));
}

/**
 * A grid over the whole map: what is at each cell and how high the ground is.
 * Navigation, the minimap, spawn queries and the water shore map all read it.
 */
export class WorldField {
  readonly size = 1024;
  readonly cell = (WORLD.half * 2) / 1024;
  readonly type = new Uint8Array(1024 * 1024);
  readonly height = new Float32Array(1024 * 1024);
  /** Distance in metres from a water cell to the nearest land, capped at 60. Zero on land. */
  readonly shore = new Float32Array(1024 * 1024);

  constructor(readonly layout: Layout) {
    this.height.fill(SEA_BED);
    const streetY = WORLD.streetY;
    const blockY = WORLD.streetY + WORLD.kerb;

    // Sand first, so the islands and piers painted afterwards win where they overlap.
    const b = layout.beach.rect;
    this.eachCell({ x0: b.x0, x1: Math.min(WORLD.half, b.x1 + 130), z0: -WORLD.half, z1: WORLD.half }, (i, x, z) => {
      const h = beachHeight(layout, x, z);
      if (h > this.height[i]!) this.height[i] = h;
      if (h > 0.02) this.type[i] = Cell.Sand;
    });
    for (const islet of layout.islets) {
      this.eachCell({ x0: islet.x - islet.r * 2, x1: islet.x + islet.r * 2, z0: islet.z - islet.r * 2, z1: islet.z + islet.r * 2 }, (i, x, z) => {
        const h = isletHeight(islet, x, z);
        if (h > this.height[i]!) this.height[i] = h;
        if (h > 0.02) this.type[i] = Cell.Sand;
      });
    }

    for (const isl of layout.islands) this.fill(isl.rect, Cell.Road, streetY);
    for (const blk of layout.blocks) {
      if (blk.kind === 'yard') this.fill(blk.rect, Cell.Yard, streetY);
      else if (blk.kind === 'park') this.fill(blk.rect, Cell.Grass, blockY);
      else if (blk.kind === 'plaza') this.fill(blk.rect, Cell.Plaza, blockY);
      else this.fill(blk.rect, Cell.Sidewalk, blockY);
    }
    for (const lot of layout.lots) {
      if (lot.use === 'parking') this.fill(lot.rect, Cell.Lot, blockY);
      else if (lot.use === 'garden') this.fill(lot.rect, Cell.Grass, blockY);
      else if (lot.use === 'pool') this.fill(lot.rect, Cell.Lot, blockY);
    }
    for (const pier of layout.piers) this.fill(pier.rect, Cell.Pier, pier.y);
    for (const seg of layout.segments) {
      if (!seg.bridge) continue;
      const rect: Rect = seg.axis === 'z' ? { x0: seg.c - seg.w / 2, x1: seg.c + seg.w / 2, z0: seg.a, z1: seg.b } : { x0: seg.a, x1: seg.b, z0: seg.c - seg.w / 2, z1: seg.c + seg.w / 2 };
      this.eachCell(rect, (i, x, z) => {
        const t = ((seg.axis === 'z' ? z : x) - seg.a) / (seg.b - seg.a);
        this.type[i] = Cell.Bridge;
        this.height[i] = streetY + bridgeRise(t, seg.bridge!.rise);
      });
    }
    this.computeShore();
  }

  /** Mark a building footprint. Called by the building generator so the grid matches what was built. */
  markBuilding(rect: Rect, roofY: number): void {
    this.fill(rect, Cell.Building, roofY);
  }

  markRect(rect: Rect, type: Cell, y?: number): void {
    this.eachCell(rect, (i) => {
      this.type[i] = type;
      if (y !== undefined) this.height[i] = y;
    });
  }

  private fill(rect: Rect, type: Cell, y: number): void {
    this.eachCell(rect, (i) => {
      this.type[i] = type;
      this.height[i] = y;
    });
  }

  private eachCell(rect: Rect, fn: (index: number, x: number, z: number) => void): void {
    const n = this.size;
    const c = this.cell;
    const i0 = clamp(Math.ceil((rect.x0 + WORLD.half) / c - 0.5), 0, n - 1);
    const i1 = clamp(Math.floor((rect.x1 + WORLD.half) / c - 0.5), 0, n - 1);
    const j0 = clamp(Math.ceil((rect.z0 + WORLD.half) / c - 0.5), 0, n - 1);
    const j1 = clamp(Math.floor((rect.z1 + WORLD.half) / c - 0.5), 0, n - 1);
    for (let j = j0; j <= j1; j++) {
      const z = (j + 0.5) * c - WORLD.half;
      for (let i = i0; i <= i1; i++) fn(j * n + i, (i + 0.5) * c - WORLD.half, z);
    }
  }

  /** Chamfer distance transform from land into the water. */
  private computeShore(): void {
    const n = this.size;
    const d = this.shore;
    const cap = 60 / this.cell;
    for (let i = 0; i < d.length; i++) d[i] = this.isLandIndex(i) ? 0 : cap;
    const a = 1;
    const b = Math.SQRT2;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        if (i > 0) v = Math.min(v, d[k - 1]! + a);
        if (j > 0) {
          v = Math.min(v, d[k - n]! + a);
          if (i > 0) v = Math.min(v, d[k - n - 1]! + b);
          if (i < n - 1) v = Math.min(v, d[k - n + 1]! + b);
        }
        d[k] = v;
      }
    }
    for (let j = n - 1; j >= 0; j--) {
      for (let i = n - 1; i >= 0; i--) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        if (i < n - 1) v = Math.min(v, d[k + 1]! + a);
        if (j < n - 1) {
          v = Math.min(v, d[k + n]! + a);
          if (i < n - 1) v = Math.min(v, d[k + n + 1]! + b);
          if (i > 0) v = Math.min(v, d[k + n - 1]! + b);
        }
        d[k] = v;
      }
    }
    for (let i = 0; i < d.length; i++) d[i] = d[i]! * this.cell;
  }

  private isLandIndex(i: number): boolean {
    const t = this.type[i]!;
    // Piers and bridges stand over water: waves pass underneath.
    return t !== Cell.Water && t !== Cell.Pier && t !== Cell.Bridge;
  }

  index(x: number, z: number): number {
    const n = this.size;
    const i = clamp(Math.floor((x + WORLD.half) / this.cell), 0, n - 1);
    const j = clamp(Math.floor((z + WORLD.half) / this.cell), 0, n - 1);
    return j * n + i;
  }

  typeAt(x: number, z: number): Cell {
    return this.type[this.index(x, z)]! as Cell;
  }

  /** Ground or roof height at a point (nearest cell). */
  heightAt(x: number, z: number): number {
    return this.height[this.index(x, z)]!;
  }

  /** True where there is open water at the surface (no land, pier or bridge above it). */
  isWater(x: number, z: number): boolean {
    if (Math.abs(x) > WORLD.half || Math.abs(z) > WORLD.half) return true;
    return this.type[this.index(x, z)] === Cell.Water;
  }

  isLand(x: number, z: number): boolean {
    if (Math.abs(x) > WORLD.half || Math.abs(z) > WORLD.half) return false;
    return this.isLandIndex(this.index(x, z));
  }

  /** Bilinear sample of a per-cell array. */
  private bilinear(data: Float32Array, x: number, z: number): number {
    const n = this.size;
    const fx = clamp((x + WORLD.half) / this.cell - 0.5, 0, n - 1.001);
    const fz = clamp((z + WORLD.half) / this.cell - 0.5, 0, n - 1.001);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const tx = fx - i;
    const tz = fz - j;
    const k = j * n + i;
    return lerp(lerp(data[k]!, data[k + 1]!, tx), lerp(data[k + n]!, data[k + n + 1]!, tx), tz);
  }

  shoreDistance(x: number, z: number): number {
    if (Math.abs(x) > WORLD.half || Math.abs(z) > WORLD.half) return 60;
    return this.bilinear(this.shore, x, z);
  }

  /**
   * Wave amplitude factor at a point: near zero in canals, moderate in the bay, full on the open ocean.
   * The water shader reads the same values from a texture built from this function.
   */
  waveAmp(x: number, z: number): number {
    const shore = this.shoreDistance(x, z);
    const open = smoothstep(6, 58, shore);
    // The ocean is to the east; the bay behind the islands is sheltered.
    const side = lerp(0.42, 1, smoothstep(300, 420, x));
    return 0.035 + open * side * 0.965;
  }
}
