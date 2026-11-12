import { Color, Group, Mesh } from 'three';
import { WORLD } from '../core/config';
import { Rng } from '../core/rng';
import type { Physics } from '../physics/physics';
import type { Materials } from '../render/materials';
import type { WorldField } from './field';
import { Frame } from './frame';
import { MeshBuilder } from './geo';
import { type Block, type Layout, type Lot, type Rect, rectCx, rectCz } from './layout';
import { planShop, shopColliders, shopfrontDressing, SHOPFRONT, type ShopPlan, type ShopSite } from './shopPlan';

const GROUND = WORLD.streetY + WORLD.kerb;
const GROUND_H = 4.3;
const FLOOR_H = 3.3;
const PARAPET = 0.9;

const hex = (h: number): Color => new Color(h);

const BODY = [0xf7a8b8, 0xa8e6cf, 0x8fd9e0, 0xfff1a8, 0xffcba4, 0xc9b6f2, 0xa9d3f5, 0xfff6e0, 0xff9e8a, 0x7fe0c4, 0xfafaf5, 0xfde2e4, 0xbde0fe].map(hex);
const ACCENT = [0x18b8b0, 0xff4f9a, 0xffc83d, 0x2ee6d6, 0x8a5cf5, 0xff7a59, 0x3aa0ff].map(hex);
const NEON = [new Color(1, 0.22, 0.6), new Color(0.15, 0.95, 1), new Color(0.72, 0.4, 1), new Color(1, 0.84, 0.28), new Color(0.35, 1, 0.68), new Color(1, 0.48, 0.18)];
const TRIM = hex(0xfdfdf8);
const DARK = hex(0x22303a);
const ROOF_TINT = new Color(0.9, 0.9, 0.88);
const WAREHOUSE = [0x6fa3a8, 0xb9785f, 0x7f93b8, 0xa9a48f, 0x8fb39a].map(hex);

/** Window presets: [width fraction, height fraction, kind]. */
const WIN = {
  rect: [0.5, 0.52, 0],
  wide: [0.74, 0.54, 0],
  slit: [0.26, 0.7, 0],
  porthole: [0.44, 0.44, 1],
  ribbon: [1, 0.44, 2],
  store: [0.9, 0.7, 3],
  small: [0.4, 0.26, 0],
} as const satisfies Record<string, readonly [number, number, number]>;
type WinName = keyof typeof WIN;

export interface BuildingInfo {
  lot: Lot;
  /** Footprint of the main mass. */
  rect: Rect;
  /** Roof height above sea level. */
  roofY: number;
  frame: Frame;
}

export interface RoofSpot {
  x: number;
  z: number;
  y: number;
}

export interface CityBuild {
  group: Group;
  buildings: BuildingInfo[];
  roofSpots: RoofSpot[];
  /** Blank walls and rooftops reserved for billboards and murals. */
  artSlots: ArtSlot[];
  /** Shops with a real room behind the shopfront, for the shop module to furnish. */
  shops: ShopSite[];
}

export interface ArtSlot {
  kind: 'mural' | 'billboard';
  /** Centre of the panel. */
  x: number;
  y: number;
  z: number;
  /** Direction the panel faces, as a yaw. */
  yaw: number;
  width: number;
  height: number;
}

interface Builders {
  facade: MeshBuilder;
  paint: MeshBuilder;
  roof: MeshBuilder;
  neon: MeshBuilder;
  sign: MeshBuilder;
  gloss: MeshBuilder;
}

interface Ctx {
  f: Frame;
  r: Rng;
  b: Builders;
  lot: Lot;
  body: Color;
  accent: Color;
  neon: Color;
  seed: number;
  physics: Physics;
  materials: Materials;
  out: CityBuild;
}

function newBuilders(): Builders {
  return { facade: new MeshBuilder(), paint: new MeshBuilder(), roof: new MeshBuilder(), neon: new MeshBuilder(), sign: new MeshBuilder(), gloss: new MeshBuilder() };
}

export function buildBuildings(layout: Layout, field: WorldField, materials: Materials, physics: Physics): CityBuild {
  const out: CityBuild = { group: new Group(), buildings: [], roofSpots: [], artSlots: [], shops: [] };
  out.group.name = 'buildings';
  const byBlock = new Map<number, Lot[]>();
  for (const lot of layout.lots) {
    if (lot.use !== 'building' && lot.use !== 'shop') continue;
    let list = byBlock.get(lot.block);
    if (!list) byBlock.set(lot.block, (list = []));
    list.push(lot);
  }

  for (const [blockId, lots] of byBlock) {
    const block = layout.blocks[blockId]!;
    const b = newBuilders();
    for (const lot of lots) {
      const r = new Rng(lot.seed);
      const rect = footprint(lot, r);
      const f = new Frame(rect, lot.front);
      const ctx: Ctx = {
        f,
        r,
        b,
        lot,
        body: r.pick(BODY).clone(),
        accent: r.pick(ACCENT).clone(),
        neon: r.pick(NEON).clone(),
        seed: (lot.seed % 97) + 1,
        physics,
        materials,
        out,
      };
      let roofY: number;
      switch (lot.style) {
        case 'tower':
          roofY = tower(ctx);
          break;
        case 'hotel':
          roofY = hotel(ctx);
          break;
        case 'modern':
          roofY = modern(ctx);
          break;
        case 'villa':
          roofY = villa(ctx);
          break;
        case 'warehouse':
          roofY = warehouse(ctx);
          break;
        default:
          roofY = deco(ctx);
          break;
      }
      field.markBuilding(rect, roofY);
      out.buildings.push({ lot, rect, roofY, frame: f });
      out.roofSpots.push({ x: rectCx(rect) + r.range(-2, 2), z: rectCz(rect) + r.range(-2, 2), y: roofY });
    }
    flush(out.group, b, materials, block);
  }

  buildPortSheds(layout, field, materials, physics, out);
  return out;
}

function flush(group: Group, b: Builders, m: Materials, block: Block | null): void {
  const add = (builder: MeshBuilder, material: Mesh['material'], name: string, cast: boolean): void => {
    if (builder.empty) return;
    const mesh = new Mesh(builder.build(), material);
    mesh.name = `${name}-${block ? block.id : 'x'}`;
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  };
  add(b.facade, m.facade, 'facade', true);
  add(b.paint, m.paint, 'trim', true);
  add(b.roof, m.roof, 'roof', false);
  add(b.gloss, m.gloss, 'gloss', true);
  add(b.neon, m.neon, 'neon', false);
  add(b.sign, m.signs.material, 'signs', false);
}

/** The built part of a lot: the lot minus setbacks that depend on the style. */
function footprint(lot: Lot, r: Rng): Rect {
  const q = lot.rect;
  const f = new Frame(q, lot.front);
  const side = lot.style === 'deco' || lot.style === 'shop' ? 0 : lot.style === 'villa' ? r.range(3, 5) : r.range(1.2, 2.4);
  const front = lot.style === 'villa' ? r.range(4, 6) : lot.style === 'tower' ? 1.5 : 0;
  const back = lot.style === 'villa' ? r.range(5, 8) : 1.5;
  return f.worldRect(side, f.W - side, front, f.D - back);
}

function setWin(b: MeshBuilder, name: WinName, seed: number): void {
  const w = WIN[name];
  b.setStyle(w[0], w[1], w[2], seed);
}

interface MassOpts {
  u0: number;
  u1: number;
  w0: number;
  w1: number;
  y0: number;
  /** Number of storeys in this mass. */
  floors: number;
  /** The lowest storey is a tall ground floor with shopfronts. */
  ground?: boolean;
  front: WinName;
  sides: WinName | null;
  back?: WinName | null;
  color: Color;
  parapet?: number;
  /** Skip the collider when another mass already covers it. */
  noCollider?: boolean;
  roof?: boolean;
  /** A shop with a room inside: the glazed part of the front stays open and the room is left hollow. */
  shop?: ShopPlan;
}

/** A rectangular mass with windowed walls, parapet, roof and collider. Returns the roof height. */
function mass(c: Ctx, o: MassOpts): number {
  const { f, b } = c;
  const W = o.u1 - o.u0;
  const D = o.w1 - o.w0;
  const groundH = o.ground ? GROUND_H : 0;
  const upper = o.ground ? o.floors - 1 : o.floors;
  const yUpper = o.y0 + groundH;
  const top = yUpper + upper * FLOOR_H;
  const parapet = o.parapet ?? PARAPET;
  const baysF = Math.max(1, Math.round(W / 3.2));
  const baysS = Math.max(1, Math.round(D / 3.2));
  const fa = b.facade;

  if (o.ground) {
    setWin(fa, 'store', c.seed);
    const s = o.shop;
    if (s) {
      // Painted windows on either side of the real shopfront, and plain wall above its glass.
      if (s.bay0 > 0) f.wallFront(fa, o.u0, s.g0, o.y0, yUpper, o.w0, c.body, [0, 0, s.bay0, 1]);
      if (s.bay1 < s.bays) f.wallFront(fa, s.g1, o.u1, o.y0, yUpper, o.w0, c.body, [s.bay1, 0, s.bays, 1]);
      fa.clearStyle();
      f.wallFront(fa, s.g0, s.g1, o.y0 + SHOPFRONT.glassTop, yUpper, o.w0, c.body, [0, 0, 1, 0.2]);
    } else f.wallFront(fa, o.u0, o.u1, o.y0, yUpper, o.w0, c.body, [0, 0, Math.max(1, Math.round(W / 4.2)), 1]);
    fa.clearStyle();
    f.wallLeft(fa, o.u0, o.w0, o.w1, o.y0, yUpper, o.color, [0, 0, baysS, 1]);
    f.wallRight(fa, o.u1, o.w0, o.w1, o.y0, yUpper, o.color, [0, 0, baysS, 1]);
    f.wallBack(fa, o.u0, o.u1, o.y0, yUpper, o.w1, o.color, [0, 0, baysF, 1]);
  }
  if (upper > 0) {
    setWin(fa, o.front, c.seed);
    f.wallFront(fa, o.u0, o.u1, yUpper, top, o.w0, o.color, [0, 0, baysF, upper]);
    if (o.sides) setWin(fa, o.sides, c.seed + 3);
    else fa.clearStyle();
    f.wallLeft(fa, o.u0, o.w0, o.w1, yUpper, top, o.color, [0, 0, baysS, upper]);
    f.wallRight(fa, o.u1, o.w0, o.w1, yUpper, top, o.color, [0, 0, baysS, upper]);
    const back = o.back === undefined ? o.sides : o.back;
    if (back) setWin(fa, back, c.seed + 5);
    else fa.clearStyle();
    f.wallBack(fa, o.u0, o.u1, yUpper, top, o.w1, o.color, [0, 0, baysF, upper]);
    fa.clearStyle();
  }
  // Parapet band and roof.
  if (parapet > 0) {
    fa.clearStyle();
    f.wallFront(fa, o.u0, o.u1, top, top + parapet, o.w0, o.color, [0, 0, 1, 0.3]);
    f.wallLeft(fa, o.u0, o.w0, o.w1, top, top + parapet, o.color, [0, 0, 1, 0.3]);
    f.wallRight(fa, o.u1, o.w0, o.w1, top, top + parapet, o.color, [0, 0, 1, 0.3]);
    f.wallBack(fa, o.u0, o.u1, top, top + parapet, o.w1, o.color, [0, 0, 1, 0.3]);
    const t = 0.3;
    // Inner faces and coping.
    f.box(b.paint, o.u0, o.u1, top + parapet, top + parapet + 0.08, o.w0, o.w0 + t, TRIM, 'ftkb');
    f.box(b.paint, o.u0, o.u1, top + parapet, top + parapet + 0.08, o.w1 - t, o.w1, TRIM, 'ftkb');
    f.box(b.paint, o.u0, o.u0 + t, top + parapet, top + parapet + 0.08, o.w0, o.w1, TRIM, 'ltrb');
    f.box(b.paint, o.u1 - t, o.u1, top + parapet, top + parapet + 0.08, o.w0, o.w1, TRIM, 'ltrb');
    f.wallBack(b.paint, o.u0 + t, o.u1 - t, top, top + parapet, o.w0 + t, o.color);
    f.wallFront(b.paint, o.u0 + t, o.u1 - t, top, top + parapet, o.w1 - t, o.color);
    f.wallRight(b.paint, o.u0 + t, o.w0 + t, o.w1 - t, top, top + parapet, o.color);
    f.wallLeft(b.paint, o.u1 - t, o.w0 + t, o.w1 - t, top, top + parapet, o.color);
  }
  if (o.roof !== false) f.floor(b.roof, o.u0, o.u1, o.w0, o.w1, top + 0.01, ROOF_TINT);
  if (o.shop) shopColliders(c.physics, f, o.shop, top);
  else if (!o.noCollider) {
    const r = f.worldRect(o.u0, o.u1, o.w0, o.w1);
    c.physics.addStaticBox((r.x0 + r.x1) / 2, (o.y0 + top) / 2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, (top - o.y0) / 2, (r.z1 - r.z0) / 2, { kind: 'world', surface: 'concrete' });
  }
  return top;
}

/** Thin slabs over the windows of each upper floor: the "eyebrows" of tropical deco. */
function eyebrows(c: Ctx, u0: number, u1: number, w: number, yBase: number, floors: number, depth = 0.65): void {
  for (let i = 0; i < floors; i++) {
    const y = yBase + i * FLOOR_H + FLOOR_H * 0.82;
    c.f.box(c.b.paint, u0, u1, y, y + 0.13, w - depth, w, TRIM, 'flrtb');
  }
}

/** Three thin coloured bands across a facade. */
function speedLines(c: Ctx, u0: number, u1: number, w: number, y: number, color: Color): void {
  for (let i = 0; i < 3; i++) c.f.box(c.b.paint, u0, u1, y + i * 0.3, y + i * 0.3 + 0.12, w - 0.07, w, color, 'flrtb');
}

/** Shopfront dressing along a ground floor: plinth, awnings, a door and a fascia band. */
function storefront(c: Ctx, u0: number, u1: number, w: number, y0: number, shop?: ShopPlan): void {
  const { f, b, r } = c;
  // A shop's glazed span gets its own plinth, canopy and real door; the dressing here stays clear of it.
  const clear = (a: number, e: number): boolean => !shop || e <= shop.g0 || a >= shop.g1;
  if (shop) {
    if (shop.g0 - u0 > 0.05) f.box(b.paint, u0, shop.g0, y0, y0 + 0.5, w - 0.06, w, c.accent, 'flrt');
    if (u1 - shop.g1 > 0.05) f.box(b.paint, shop.g1, u1, y0, y0 + 0.5, w - 0.06, w, c.accent, 'flrt');
  } else f.box(b.paint, u0, u1, y0, y0 + 0.5, w - 0.06, w, c.accent, 'flrt');
  f.box(b.paint, u0, u1, y0 + GROUND_H - 0.75, y0 + GROUND_H - 0.1, w - 0.1, w, TRIM, 'flrtb');
  // Awnings over groups of bays.
  const n = Math.max(1, Math.round((u1 - u0) / 6));
  const span = (u1 - u0) / n;
  const stripe = r.chance(0.5);
  for (let i = 0; i < n; i++) {
    if (r.chance(0.25)) continue;
    const a = u0 + i * span + 0.5;
    const e = a + span - 1;
    if (!clear(a, e)) continue;
    const yTop = y0 + 3.45;
    const yLow = y0 + 2.85;
    const depth = 1.35;
    const strips = stripe ? Math.max(2, Math.round((e - a) / 0.8)) : 1;
    for (let s = 0; s < strips; s++) {
      const sa = a + ((e - a) * s) / strips;
      const sb = a + ((e - a) * (s + 1)) / strips;
      const col = stripe && s % 2 === 1 ? TRIM : c.accent;
      b.paint.quad([f.x(sa, w), yTop, f.z(sa, w)], [f.x(sa, w - depth), yLow, f.z(sa, w - depth)], [f.x(sb, w - depth), yLow, f.z(sb, w - depth)], [f.x(sb, w), yTop, f.z(sb, w)], col);
      // Underside so the awning is not see-through from below.
      b.paint.quad([f.x(sb, w), yTop - 0.02, f.z(sb, w)], [f.x(sb, w - depth), yLow - 0.02, f.z(sb, w - depth)], [f.x(sa, w - depth), yLow - 0.02, f.z(sa, w - depth)], [f.x(sa, w), yTop - 0.02, f.z(sa, w)], col);
    }
    f.box(b.paint, a, e, yLow - 0.22, yLow, w - depth - 0.02, w - depth + 0.04, c.accent, 'flrtbk');
  }
  // Door.
  const du = u0 + (u1 - u0) * r.pick([0.2, 0.5, 0.8]);
  if (shop) return;
  f.box(b.paint, du - 0.85, du + 0.85, y0, y0 + 2.5, w - 0.09, w, DARK, 'flrt');
  f.box(b.gloss, du - 0.7, du + 0.7, y0 + 0.1, y0 + 2.35, w - 0.12, w - 0.08, new Color(0.25, 0.42, 0.48), 'f');
}

/** A vertical fin on the facade with neon edges and stacked lettering. Returns its top. */
function fin(c: Ctx, u: number, w: number, y0: number, y1: number, width: number, text: string): number {
  const { f, b } = c;
  const depth = 0.9;
  f.box(b.paint, u - width / 2, u + width / 2, y0, y1, w - depth, w + 0.2, TRIM);
  for (const s of [-1, 1]) {
    const e = u + (s * width) / 2;
    f.box(b.neon, e - 0.07, e + 0.07, y0 + 0.3, y1 - 0.2, w - depth - 0.08, w - depth, c.neon, 'flrtb');
  }
  if (text) {
    const slot = c.materials.signs.vertical(text);
    const h = Math.min(y1 - y0 - 1.2, (width * 0.7) / slot.aspect);
    const sw = h * slot.aspect;
    const cy = (y0 + y1) / 2;
    f.signFront(b.sign, u - sw / 2, u + sw / 2, cy - h / 2, cy + h / 2, w - depth - 0.04, c.neon, slot.uv);
  }
  // Cap.
  f.box(b.paint, u - width / 2 - 0.2, u + width / 2 + 0.2, y1, y1 + 0.25, w - depth - 0.2, w + 0.4, c.accent);
  return y1 + 0.25;
}

/** Stepped crown in the middle of a parapet. */
function crown(c: Ctx, u: number, w: number, y: number, width: number, steps: number): void {
  for (let i = 0; i < steps; i++) {
    const wv = width * (1 - i / (steps + 0.6));
    c.f.box(c.b.paint, u - wv / 2, u + wv / 2, y + i * 0.7, y + (i + 1) * 0.7, w, w + 0.9, i % 2 === 0 ? c.body : TRIM);
  }
}

/** A lit name above a shopfront or on a rooftop frame. */
function nameSign(c: Ctx, text: string, u: number, w: number, y: number, maxWidth: number, height: number, style: 'block' | 'script' | 'outline', frame = false): void {
  if (!text) return;
  const slot = c.materials.signs.horizontal(text, style);
  let h = height;
  let sw = h * slot.aspect;
  if (sw > maxWidth) {
    sw = maxWidth;
    h = sw / slot.aspect;
  }
  if (frame) {
    // Open steel frame behind rooftop letters.
    c.f.box(c.b.paint, u - sw / 2 - 0.3, u + sw / 2 + 0.3, y - 0.25, y - 0.1, w + 0.1, w + 0.3, DARK);
    for (let i = 0; i <= 4; i++) {
      const pu = u - sw / 2 + (sw * i) / 4;
      c.f.box(c.b.paint, pu - 0.06, pu + 0.06, y - 0.9, y + h, w + 0.14, w + 0.26, DARK);
    }
  }
  c.f.signFront(c.b.sign, u - sw / 2, u + sw / 2, y, y + h, w, c.neon, slot.uv);
}

function roofClutter(c: Ctx, u0: number, u1: number, w0: number, w1: number, y: number): void {
  const { f, b, r } = c;
  const grey = new Color(0.72, 0.74, 0.76);
  const n = r.int(1, 4);
  for (let i = 0; i < n; i++) {
    const u = r.range(u0 + 2, u1 - 2);
    const w = r.range(w0 + 3, w1 - 2);
    if (r.chance(0.6)) {
      f.box(b.paint, u - 0.9, u + 0.9, y, y + 1.1, w - 0.7, w + 0.7, grey);
      f.box(b.paint, u - 0.7, u + 0.7, y + 1.1, y + 1.2, w - 0.5, w + 0.5, DARK);
    } else {
      const wr = f.worldRect(u - 1, u + 1, w - 1, w + 1);
      b.paint.cylinder((wr.x0 + wr.x1) / 2, y, (wr.z0 + wr.z1) / 2, 1.0, 1.0, 1.9, grey, 10);
      b.paint.cylinder((wr.x0 + wr.x1) / 2, y + 1.9, (wr.z0 + wr.z1) / 2, 1.05, 0.2, 0.5, DARK, 10, false);
    }
  }
  // Stair bulkhead.
  if (u1 - u0 > 12 && r.chance(0.7)) {
    const u = r.range(u0 + 3, u1 - 3);
    f.box(b.paint, u - 1.4, u + 1.4, y, y + 2.6, w1 - 4.2, w1 - 1.2, c.body);
    f.box(b.paint, u - 0.5, u + 0.5, y, y + 2.05, w1 - 4.25, w1 - 4.2, DARK, 'f');
  }
}

/** Rounded corner drum with ribbon windows, where a building turns a street corner. */
function cornerDrum(c: Ctx, top: number): void {
  const { f, b, lot } = c;
  if (!lot.cornerSide) return;
  // The corner is on the left end when the corner street is to the frame's left.
  const leftSide = { s: 'w', n: 'e', e: 's', w: 'n' }[lot.front];
  const atLeft = lot.cornerSide === leftSide;
  const radius = Math.min(3.4, f.W * 0.2);
  const u = atLeft ? radius * 0.55 : f.W - radius * 0.55;
  const w = radius * 0.55;
  const x = f.x(u, w);
  const z = f.z(u, w);
  const upper = Math.max(1, Math.round((top - (GROUND + GROUND_H)) / FLOOR_H));
  setWin(b.facade, 'store', c.seed);
  drum(b.facade, x, z, radius, GROUND, GROUND + GROUND_H, c.body, 8, 1);
  setWin(b.facade, 'ribbon', c.seed);
  drum(b.facade, x, z, radius, GROUND + GROUND_H, top + PARAPET + 0.6, c.body, 8, upper + 0.45);
  b.facade.clearStyle();
  b.paint.cylinder(x, top + PARAPET + 0.6, z, radius + 0.25, radius + 0.25, 0.22, TRIM, 20);
  b.paint.cylinder(x, GROUND + GROUND_H - 0.3, z, radius + 0.3, radius + 0.3, 0.2, TRIM, 20);
  b.neon.cylinder(x, top + PARAPET + 0.3, z, radius + 0.05, radius + 0.05, 0.1, c.neon, 20, false);
}

/** Cylinder wall with facade UVs (u wraps `bays` times, v spans `floors`). */
function drum(b: MeshBuilder, cx: number, cz: number, r: number, y0: number, y1: number, color: Color, bays: number, floors: number): void {
  const seg = 20;
  const ids: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const lo = b.vertex(cx + sx * r, y0, cz + sz * r, sx, 0, sz, (i / seg) * bays, 0, color);
    b.vertex(cx + sx * r, y1, cz + sz * r, sx, 0, sz, (i / seg) * bays, floors, color);
    ids.push(lo);
  }
  for (let i = 0; i < seg; i++) {
    const a = ids[i]!;
    const d = ids[i + 1]!;
    b.tri(a, d, d + 1);
    b.tri(a, d + 1, a + 1);
  }
}

function deco(c: Ctx): number {
  const { f, r, lot } = c;
  const floors = Math.max(1, lot.floors);
  const frontWin = r.pick<WinName>(['rect', 'rect', 'wide', 'porthole', 'slit']);
  // A shop gets a real room: a glazed shopfront with a doorway, and walls around a hollow inside.
  const shop = lot.use === 'shop' && lot.shop ? planShop(lot, f.W, f.D) : undefined;
  const top = mass(c, { u0: 0, u1: f.W, w0: 0, w1: f.D, y0: GROUND, floors, ground: true, front: frontWin, sides: lot.cornerSide ? frontWin : r.chance(0.4) ? 'small' : null, back: 'small', color: c.body, shop });
  storefront(c, 0.3, f.W - 0.3, 0, GROUND, shop);
  if (shop) {
    shopfrontDressing(f, shop, c.b.paint, c.b.neon, { accent: c.accent, neon: c.neon, trim: TRIM, dark: DARK });
    c.out.shops.push({ lot, plan: shop, frame: f, top, body: c.body, accent: c.accent, neon: c.neon });
  }
  if (floors > 1) {
    eyebrows(c, 0.4, f.W - 0.4, 0, GROUND + GROUND_H, floors - 1);
    speedLines(c, 0.2, f.W - 0.2, 0, top - 0.2, c.accent);
  }
  const mid = f.W / 2;
  if (r.chance(0.6) && f.W > 12) crown(c, mid, 0, top + PARAPET, Math.min(8, f.W * 0.45), r.int(2, 3));
  // Over a shop the fin starts above the fascia, so it never covers the name over the door.
  if (r.chance(0.55) && floors >= 2) fin(c, r.chance(0.5) ? mid : f.W * r.pick([0.22, 0.78]), 0, GROUND + GROUND_H - (shop ? -0.05 : 0.4), top + PARAPET + r.range(1.5, 4), 1.5, lot.name || r.pick(['CAFE', 'BAR', 'DELI', 'MODA', 'CINE', 'CLUB', 'SALSA', 'HELADO']));
  // The name goes over the shop's own door when it has one.
  if (lot.name && lot.use === 'shop') nameSign(c, lot.name, shop ? shop.doorU : mid, -0.12, GROUND + GROUND_H - 0.72, shop ? shop.g1 - shop.g0 - 1 : f.W * 0.6, 0.58, r.pick(['block', 'script']));
  cornerDrum(c, top);
  roofClutter(c, 0, f.W, 0, f.D, top);
  if (lot.cornerSide === undefined && f.D > 12 && r.chance(0.3)) mural(c, top);
  return top;
}

function hotel(c: Ctx): number {
  const { f, r, lot, b } = c;
  const floors = Math.max(3, lot.floors);
  const top = mass(c, { u0: 0, u1: f.W, w0: 0, w1: f.D, y0: GROUND, floors, ground: true, front: 'wide', sides: 'rect', back: 'small', color: c.body });
  storefront(c, 0.3, f.W - 0.3, 0, GROUND);
  // Balconies with solid fronts on alternating bays give the facade depth.
  const upper = floors - 1;
  const centre = f.W / 2;
  const finW = 2.2;
  for (let i = 0; i < upper; i++) {
    const y = GROUND + GROUND_H + i * FLOOR_H;
    for (const [a, e] of [
      [0.6, centre - finW / 2 - 0.5],
      [centre + finW / 2 + 0.5, f.W - 0.6],
    ] as const) {
      if (e - a < 2) continue;
      f.box(b.paint, a, e, y - 0.1, y + 0.06, -1.25, 0, TRIM);
      f.box(b.paint, a, e, y + 0.06, y + 0.95, -1.25, -1.15, i % 2 === 0 ? c.accent : TRIM);
    }
  }
  const finTop = fin(c, centre, 0, GROUND + 0.2, top + PARAPET + r.range(3, 6), finW, lot.name);
  // Neon ring and a mast on top of the fin.
  b.neon.cylinder(f.x(centre, 0.2), finTop, f.z(centre, 0.2), 0.12, 0.12, r.range(2, 4), c.neon, 6);
  speedLines(c, 0.2, f.W - 0.2, 0, top - 0.25, c.accent);
  crown(c, centre, 0, top + PARAPET, Math.min(9, f.W * 0.5), 2);
  cornerDrum(c, top);
  roofClutter(c, 0, f.W, 0, f.D, top);
  if (f.W > 16) nameSign(c, lot.name, f.W / 2, f.D * 0.35, top + PARAPET + 1.1, f.W * 0.8, 1.9, 'block', true);
  return top;
}

function tower(c: Ctx): number {
  const { f, r, lot, b } = c;
  const floors = Math.max(8, lot.floors);
  const podiumFloors = 2;
  const podTop = mass(c, { u0: 0, u1: f.W, w0: 0, w1: f.D, y0: GROUND, floors: podiumFloors, ground: true, front: 'wide', sides: 'rect', back: 'small', color: TRIM, parapet: 1.0 });
  storefront(c, 0.3, f.W - 0.3, 0, GROUND);
  const inset = Math.min(4, f.W * 0.14);
  const u0 = inset;
  const u1 = f.W - inset;
  const w0 = 2.5;
  const w1 = f.D - 2.5;
  const shaftFloors = floors - podiumFloors;
  const top = mass(c, { u0, u1, w0, w1, y0: podTop, floors: shaftFloors, front: 'ribbon', sides: r.pick<WinName>(['wide', 'ribbon']), back: 'ribbon', color: c.body });
  // Wrap-around balcony slabs: the horizontal banding of a beachfront tower.
  for (let i = 1; i <= shaftFloors; i++) {
    const y = podTop + i * FLOOR_H;
    f.box(b.paint, u0 - 1.1, u1 + 1.1, y - 0.12, y + 0.05, w0 - 1.1, w0, TRIM);
    f.box(b.paint, u0 - 1.1, u1 + 1.1, y - 0.12, y + 0.05, w1, w1 + 1.1, TRIM);
    if (i < shaftFloors) {
      f.box(b.gloss, u0 - 1.1, u1 + 1.1, y + 0.05, y + 0.9, w0 - 1.1, w0 - 1.05, new Color(0.5, 0.8, 0.85), 'fk');
      f.box(b.gloss, u0 - 1.1, u1 + 1.1, y + 0.05, y + 0.9, w1 + 1.05, w1 + 1.1, new Color(0.5, 0.8, 0.85), 'fk');
    }
  }
  // Stepped crown and mast.
  const cu = (u0 + u1) / 2;
  const cw = (w0 + w1) / 2;
  let y = top + PARAPET;
  let half = Math.min(u1 - u0, w1 - w0) * 0.32;
  for (let i = 0; i < 3; i++) {
    f.box(b.paint, cu - half, cu + half, y, y + 2.2, cw - half, cw + half, i % 2 === 0 ? c.body : TRIM);
    f.box(b.neon, cu - half - 0.05, cu + half + 0.05, y + 2.0, y + 2.12, cw - half - 0.05, cw + half + 0.05, c.neon, 'fklr');
    y += 2.2;
    half *= 0.62;
  }
  b.paint.cylinder(f.x(cu, cw), y, f.z(cu, cw), 0.22, 0.08, 9, TRIM, 6);
  b.neon.cylinder(f.x(cu, cw), y + 9, f.z(cu, cw), 0.3, 0.3, 0.5, new Color(1, 0.2, 0.2), 6);
  // Corner neon strips up the shaft.
  for (const u of [u0, u1]) f.box(b.neon, u - 0.08, u + 0.08, podTop + 0.5, top, w0 - 0.1, w0 - 0.02, c.neon, 'flr');
  nameSign(c, lot.name, f.W / 2, -0.1, podTop - 1.25, f.W * 0.7, 1.0, 'block');
  roofClutter(c, 0, inset + 1, 0, f.D, podTop);
  c.out.roofSpots.push({ x: f.x(1.5, f.D / 2), z: f.z(1.5, f.D / 2), y: podTop });
  return top;
}

function modern(c: Ctx): number {
  const { f, r, lot, b } = c;
  const floors = Math.max(4, lot.floors);
  const body = TRIM;
  const top = mass(c, { u0: 0, u1: f.W, w0: 0, w1: f.D, y0: GROUND, floors, ground: true, front: 'ribbon', sides: 'ribbon', back: 'wide', color: body });
  storefront(c, 0.3, f.W - 0.3, 0, GROUND);
  // A coloured frame around part of the facade and offset floor plates.
  const y0 = GROUND + GROUND_H;
  const fu0 = f.W * r.range(0.05, 0.3);
  const fu1 = f.W * r.range(0.65, 0.95);
  const d = 0.9;
  f.box(b.paint, fu0, fu0 + 0.35, y0, top, -d, 0, c.accent);
  f.box(b.paint, fu1 - 0.35, fu1, y0, top, -d, 0, c.accent);
  f.box(b.paint, fu0, fu1, top - 0.35, top, -d, 0, c.accent);
  f.box(b.paint, fu0, fu1, y0, y0 + 0.3, -d, 0, c.accent);
  for (let i = 1; i < floors - 1; i++) f.box(b.paint, fu0 + 0.35, fu1 - 0.35, y0 + i * FLOOR_H - 0.08, y0 + i * FLOOR_H + 0.06, -d * 0.8, 0, TRIM);
  f.box(b.neon, fu0 + 0.35, fu1 - 0.35, top - 0.5, top - 0.42, -d - 0.02, -d + 0.04, c.neon, 'f');
  roofClutter(c, 0, f.W, 0, f.D, top);
  if (lot.name) nameSign(c, lot.name, f.W / 2, -0.12, GROUND + GROUND_H - 0.72, f.W * 0.6, 0.58, 'block');
  return top;
}

function villa(c: Ctx): number {
  const { f, r, lot, b } = c;
  const floors = Math.max(1, Math.min(2, lot.floors));
  const white = TRIM;
  // Two offset volumes and wide roof slabs.
  const split = f.W * r.range(0.45, 0.62);
  const top1 = mass(c, { u0: 0, u1: split, w0: 0, w1: f.D, y0: GROUND, floors, front: 'wide', sides: 'wide', back: 'wide', color: white, parapet: 0.25 });
  const top2 = mass(c, { u0: split, u1: f.W, w0: f.D * 0.22, w1: f.D, y0: GROUND, floors: 1, front: 'wide', sides: 'rect', back: 'wide', color: c.body, parapet: 0.25 });
  f.box(b.paint, -1.1, split + 0.8, top1 + 0.25, top1 + 0.5, -1.4, f.D + 0.8, white);
  f.box(b.paint, split - 0.2, f.W + 1.0, top2 + 0.25, top2 + 0.48, f.D * 0.22 - 1.6, f.D + 0.8, white);
  // Accent wall and entry.
  f.box(b.paint, split - 0.25, split + 0.25, GROUND, top1 + 0.2, -1.2, f.D * 0.5, c.accent);
  f.box(b.paint, split * 0.5 - 0.8, split * 0.5 + 0.8, GROUND, GROUND + 2.4, -0.08, 0, DARK, 'flrt');
  // Garden wall with hedge along the street side of the lot.
  const lf = new Frame(lot.rect, lot.front);
  const hedge = new Color(0.2, 0.46, 0.26);
  const gate = lf.W * r.range(0.3, 0.7);
  for (const [a, e] of [
    [0.4, gate - 1.8],
    [gate + 1.8, lf.W - 0.4],
  ] as const) {
    if (e - a < 1) continue;
    lf.box(b.paint, a, e, GROUND, GROUND + 0.9, 0.3, 0.6, white);
    lf.box(b.paint, a, e, GROUND + 0.9, GROUND + 1.5, 0.25, 0.65, hedge);
    const wr = lf.worldRect(a, e, 0.3, 0.6);
    c.physics.addStaticBox((wr.x0 + wr.x1) / 2, GROUND + 0.75, (wr.z0 + wr.z1) / 2, (wr.x1 - wr.x0) / 2, 0.75, (wr.z1 - wr.z0) / 2, { kind: 'world', surface: 'concrete' });
  }
  return top1;
}

function warehouse(c: Ctx): number {
  const { f, r, lot, b } = c;
  const body = r.pick(WAREHOUSE).clone();
  const h = 7 + lot.floors * 1.6;
  const floors = Math.round(h / FLOOR_H);
  const top = mass(c, { u0: 0, u1: f.W, w0: 0, w1: f.D, y0: GROUND, floors, front: 'small', sides: null, back: null, color: body, parapet: 0.5 });
  // Roller doors and a loading dock.
  const doors = Math.max(1, Math.floor(f.W / 8));
  for (let i = 0; i < doors; i++) {
    const u = (f.W * (i + 0.5)) / doors;
    f.box(b.paint, u - 2, u + 2, GROUND, GROUND + 4.2, -0.06, 0, new Color(0.62, 0.64, 0.66), 'flrt');
    for (let k = 1; k < 9; k++) f.box(b.paint, u - 2, u + 2, GROUND + k * 0.46, GROUND + k * 0.46 + 0.04, -0.09, -0.06, DARK, 'f');
    f.box(b.paint, u - 2.2, u + 2.2, GROUND + 4.2, GROUND + 4.45, -0.14, 0, c.accent, 'flrtb');
  }
  speedLines(c, 0, f.W, 0, top - 0.9, c.accent);
  if (r.chance(0.6)) mural(c, top);
  nameSign(c, r.pick(['Cascabel Freight', 'Bahia Cold Store', 'Marazul Supply', 'Tidewater Cargo', 'Sol Imports']), f.W / 2, -0.1, top - 2.2, f.W * 0.6, 1.0, 'block');
  return top;
}

/** Reserve a blank side wall for a mural. */
function mural(c: Ctx, top: number): void {
  const { f } = c;
  const h = Math.min(top - GROUND - 1.4, 9);
  const wdt = Math.min(f.D - 2, h * 1.5);
  if (h < 3.5 || wdt < 4) return;
  const w = f.D / 2;
  // Right-hand side wall, facing +u.
  const yaw = f.yawOut - Math.PI / 2;
  c.out.artSlots.push({ kind: 'mural', x: f.x(f.W + 0.06, w), y: GROUND + 0.9 + h / 2, z: f.z(f.W + 0.06, w), yaw, width: wdt, height: h });
}

/** Big sheds, container stacks are props; these are the port's own buildings. */
function buildPortSheds(layout: Layout, field: WorldField, materials: Materials, physics: Physics, out: CityBuild): void {
  const yard = layout.blocks.find((b) => b.kind === 'yard');
  if (!yard) return;
  const b = newBuilders();
  const r = new Rng(layout.seed + 77);
  const sheds: Rect[] = [
    { x0: yard.rect.x0 + 14, x1: yard.rect.x0 + 74, z0: yard.rect.z0 + 26, z1: yard.rect.z0 + 54 },
    { x0: yard.rect.x0 + 96, x1: yard.rect.x0 + 150, z0: yard.rect.z0 + 26, z1: yard.rect.z0 + 54 },
    { x0: yard.rect.x1 - 92, x1: yard.rect.x1 - 22, z0: yard.rect.z0 + 30, z1: yard.rect.z0 + 62 },
    { x0: yard.rect.x1 - 70, x1: yard.rect.x1 - 26, z0: yard.rect.z1 - 44, z1: yard.rect.z1 - 16 },
  ];
  sheds.forEach((rect, i) => {
    const lot: Lot = { id: 9000 + i, block: yard.id, district: 'port', rect, front: 'n', use: 'building', style: 'warehouse', floors: r.int(1, 2), name: '', seed: r.int(1, 1e9) };
    const lr = new Rng(lot.seed);
    const f = new Frame(rect, lot.front);
    const ctx: Ctx = { f, r: lr, b, lot, body: lr.pick(WAREHOUSE).clone(), accent: lr.pick(ACCENT).clone(), neon: lr.pick(NEON).clone(), seed: i + 11, physics, materials, out };
    // Sheds sit on the yard, which has no kerb: lower them by the kerb height is not needed visually.
    const roofY = warehouse(ctx);
    field.markBuilding(rect, roofY);
    out.buildings.push({ lot, rect, roofY, frame: f });
    out.roofSpots.push({ x: rectCx(rect), z: rectCz(rect), y: roofY });
  });
  flush(out.group, b, materials, null);
}
