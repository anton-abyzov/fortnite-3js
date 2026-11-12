import type { Color } from 'three';
import { CG, WORLD } from '../core/config';
import { Rng } from '../core/rng';
import type { Physics } from '../physics/physics';
import type { Frame } from './frame';
import type { MeshBuilder } from './geo';
import type { Lot, ShopType, Side } from './layout';

/**
 * Where a shop's room sits inside its building. The building generator reads this to leave the
 * shopfront open and the room hollow; the shop module reads the same numbers to furnish it.
 * Lengths are metres in the building's frame: `u` along the front, `w` back from the street.
 */
export interface ShopPlan {
  type: ShopType;
  /** Shopfront bays across the whole ground floor, and the width of one. */
  bays: number;
  bayW: number;
  /** The glazed bays: [bay0, bay1). The rest of the front keeps its painted windows. */
  bay0: number;
  bay1: number;
  /** The glazed span along the front, pilasters included. */
  g0: number;
  g1: number;
  /** Middle of the doorway. */
  doorU: number;
  /** The clear inside of the room. */
  u0: number;
  u1: number;
  w0: number;
  w1: number;
  /** Furniture is laid out for a door-centred room and flipped left to right in half the shops. */
  mirror: boolean;
}

/** One shop as built: its plan, where it stands and the colours of its building. */
export interface ShopSite {
  lot: Lot;
  plan: ShopPlan;
  frame: Frame;
  /** Height of the roof above sea level. */
  top: number;
  body: Color;
  accent: Color;
  neon: Color;
}

/** Fixed measurements of every shopfront, in metres above the sidewalk unless noted. */
export const SHOPFRONT = {
  /** Floor of the shop: the block's own slab, so the doorway has no step. */
  floorY: WORLD.streetY + WORLD.kerb,
  /** Top of the glass, just under the fascia band that runs along the building. */
  glassTop: 3.5,
  ceiling: 3.75,
  doorWidth: 2.0,
  doorHeight: 2.5,
  /** Thickness of the front wall, and of the pilasters at each end of the glass. */
  wall: 0.3,
  pilaster: 0.3,
  /** Low wall under the windows. Taller than a step, so nobody climbs through a window. */
  plinth: 0.5,
} as const;

/** A rectangle on the ground in world coordinates. */
export interface GroundRect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/**
 * Ground that must stay free of loot and props: the shop's room, and the sidewalk in front of its
 * door where people walk in. Anything dropped from the sky lands on the roof, not in the room, but
 * the apron is open sidewalk.
 */
export function shopClearRects(site: ShopSite): { room: GroundRect; apron: GroundRect } {
  const f = site.frame;
  const p = site.plan;
  const rect = (u0: number, u1: number, w0: number, w1: number): GroundRect => {
    const xa = f.x(u0, w0);
    const xb = f.x(u1, w1);
    const za = f.z(u0, w0);
    const zb = f.z(u1, w1);
    return { x0: Math.min(xa, xb), z0: Math.min(za, zb), x1: Math.max(xa, xb), z1: Math.max(za, zb) };
  };
  const half = SHOPFRONT.doorWidth / 2 + 0.6;
  return { room: rect(p.u0, p.u1, 0, p.w1), apron: rect(p.doorU - half, p.doorU + half, -3.2, 0) };
}

/** How many bays wide and how deep each kind of shop wants to be. */
const ROOM: Record<ShopType, { bays: number; depth: number }> = {
  market: { bays: 3, depth: 10.5 },
  ammo: { bays: 3, depth: 9.5 },
  pharmacy: { bays: 2, depth: 9 },
  surf: { bays: 3, depth: 10.5 },
  cafe: { bays: 3, depth: 9.5 },
  arcade: { bays: 3, depth: 10 },
};

/** Which end of the front a corner drum stands on: bay 0 is the left end as seen from the street. */
const LEFT_OF: Record<Side, Side> = { s: 'w', n: 'e', e: 's', w: 'n' };

/**
 * Lay out a shop's room for a building `W` wide and `D` deep. The glass spans whole bays of the
 * facade so the painted windows beside it are never cut in half.
 */
export function planShop(lot: Lot, W: number, D: number): ShopPlan {
  const type = lot.shop ?? 'market';
  const want = ROOM[type];
  // Its own dice, so the rest of the building rolls exactly as it did before shops had rooms.
  const r = new Rng((lot.seed ^ 0x5f3759df) >>> 0);
  const bays = Math.max(1, Math.round(W / 4.2));
  const bayW = W / bays;
  const k = Math.min(want.bays, bays);
  // A rounded drum fills the street-corner end of a corner building: keep the room clear of it.
  let lo = 0;
  let hi = bays - k;
  if (lot.cornerSide) {
    const keep = Math.min(2, hi);
    if (lot.cornerSide === LEFT_OF[lot.front]) lo = keep;
    else hi = Math.max(lo, hi - keep);
  }
  // Prefer the middle of the facade, one bay either way.
  const mid = Math.round((bays - k) / 2);
  const bay0 = Math.max(lo, Math.min(hi, mid + r.int(-1, 1)));
  const bay1 = bay0 + k;
  const g0 = bay0 * bayW;
  const g1 = bay1 * bayW;
  const w0 = SHOPFRONT.wall;
  const w1 = Math.min(w0 + want.depth, D - 0.8);
  return {
    type,
    bays,
    bayW,
    bay0,
    bay1,
    g0,
    g1,
    doorU: (g0 + g1) / 2,
    u0: g0 + SHOPFRONT.pilaster,
    u1: g1 - SHOPFRONT.pilaster,
    w0,
    w1,
    mirror: r.chance(0.5),
  };
}

/**
 * The solid parts of a shop building: everything around the room, and the front wall with the
 * doorway left open. Replaces the single box other buildings get. The glass and the door are added
 * by the shop module, so a build without it has open windows rather than invisible walls.
 */
export function shopColliders(physics: Physics, f: Frame, p: ShopPlan, top: number): void {
  const y0 = SHOPFRONT.floorY;
  const yc = y0 + SHOPFRONT.ceiling;
  const box = (u0: number, u1: number, w0: number, w1: number, ya: number, yb: number): void => {
    if (u1 - u0 < 0.01 || w1 - w0 < 0.01 || yb - ya < 0.01) return;
    const r = f.worldRect(u0, u1, w0, w1);
    physics.addStaticBox((r.x0 + r.x1) / 2, (ya + yb) / 2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, (yb - ya) / 2, (r.z1 - r.z0) / 2, { kind: 'world', surface: 'concrete' }, 0, CG.world);
  };
  // Left and right of the room, the full depth and height of the building.
  box(0, p.u0, 0, f.D, y0, top);
  box(p.u1, f.W, 0, f.D, y0, top);
  // Behind the room, and everything above its ceiling.
  box(p.u0, p.u1, p.w1, f.D, y0, top);
  box(p.u0, p.u1, 0, p.w1, yc, top);
  // The front wall: a plinth under the windows on each side of the door, and the band over the glass.
  const half = SHOPFRONT.doorWidth / 2;
  box(p.u0, p.doorU - half, 0, p.w0, y0, y0 + SHOPFRONT.plinth);
  box(p.doorU + half, p.u1, 0, p.w0, y0, y0 + SHOPFRONT.plinth);
  box(p.u0, p.u1, 0, p.w0, y0 + SHOPFRONT.glassTop, yc);
}

/**
 * The street side of a shopfront, added to the building's own meshes: pilasters at each end of the
 * glass, the plinth under the windows, a canopy over the door and a line of neon along the top.
 */
export function shopfrontDressing(f: Frame, p: ShopPlan, paint: MeshBuilder, neon: MeshBuilder, colors: { accent: Color; neon: Color; trim: Color; dark: Color }): void {
  const y0 = SHOPFRONT.floorY;
  const top = y0 + SHOPFRONT.glassTop + 0.05;
  const half = SHOPFRONT.doorWidth / 2;
  for (const [a, b] of [
    [p.g0, p.u0],
    [p.u1, p.g1],
  ] as const) {
    f.box(paint, a, b, y0, top, -0.1, SHOPFRONT.wall, colors.trim, 'flrk');
    // A coloured foot ties the pilaster to the plinth beside it.
    f.box(paint, a - 0.03, b + 0.03, y0, y0 + SHOPFRONT.plinth, -0.13, 0, colors.accent, 'flrt');
  }
  for (const [a, b] of [
    [p.u0, p.doorU - half],
    [p.doorU + half, p.u1],
  ] as const) {
    f.box(paint, a, b, y0, y0 + SHOPFRONT.plinth, -0.06, 0.05, colors.accent, 'flrt', colors.trim);
  }
  // Canopy: a thin deco slab over the doorway with a neon edge that lights the threshold at night.
  const cw = half + 0.75;
  const cy = y0 + SHOPFRONT.doorHeight + 0.42;
  f.box(paint, p.doorU - cw, p.doorU + cw, cy, cy + 0.14, -1.25, 0, colors.trim, 'flrtb', colors.accent);
  f.box(paint, p.doorU - cw - 0.04, p.doorU + cw + 0.04, cy + 0.14, cy + 0.2, -1.29, 0, colors.accent, 'flrtb');
  f.box(neon, p.doorU - cw + 0.08, p.doorU + cw - 0.08, cy - 0.05, cy, -1.2, -1.14, colors.neon, 'flrb');
  f.box(neon, p.u0 + 0.05, p.u1 - 0.05, y0 + SHOPFRONT.glassTop - 0.02, y0 + SHOPFRONT.glassTop + 0.04, -0.05, 0, colors.neon, 'fb');
  // Door threshold plate.
  f.box(paint, p.doorU - half, p.doorU + half, y0, y0 + 0.012, -0.12, 0.02, colors.dark, 'ft');
}
