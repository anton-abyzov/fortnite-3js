import { WORLD } from '../core/config';
import { Rng } from '../core/rng';

/**
 * The plan of Marazul Bay. Pure data: no meshes, no physics.
 * Terrain, roads, buildings, props, navigation, traffic and the minimap are all derived from this.
 *
 * Axes: X east, Z south. All rectangles are axis-aligned, in metres.
 */

export interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

export type District = 'heights' | 'deco' | 'mercado' | 'franja' | 'port' | 'garza';

export const DISTRICT_NAMES: Record<District, string> = {
  heights: 'Flamingo Heights',
  deco: 'Deco Row',
  mercado: 'El Mercado',
  franja: 'La Franja',
  port: 'Port Cascabel',
  garza: 'Isla Garza',
};

export interface RoadDef {
  /** Centre line coordinate on the axis across the road. */
  c: number;
  /** Kerb-to-kerb width. */
  w: number;
  name: string;
  /** Boulevards get a planted median. */
  median?: boolean;
}

export interface IslandDef {
  id: string;
  rect: Rect;
  district: District;
  /** Roads that run north-south (constant x). */
  avenues: RoadDef[];
  /** Roads that run east-west (constant z). */
  streets: RoadDef[];
}

export type Side = 'n' | 's' | 'e' | 'w';

export interface Block {
  id: number;
  island: string;
  district: District;
  rect: Rect;
  kind: 'buildings' | 'promenade' | 'park' | 'plaza' | 'yard';
  /** Which sides of the block face a road. */
  roadSides: Side[];
  /** Which sides of the block face water. */
  waterSides: Side[];
}

export type ShopType = 'market' | 'ammo' | 'pharmacy' | 'surf' | 'cafe' | 'arcade';

export type BuildingStyle = 'deco' | 'hotel' | 'tower' | 'villa' | 'warehouse' | 'shop' | 'modern';

export interface Lot {
  id: number;
  block: number;
  district: District;
  rect: Rect;
  /** Side of the lot that faces the street. */
  front: Side;
  /** Lot sits at a block corner (second street on this side). */
  cornerSide?: Side;
  use: 'building' | 'shop' | 'parking' | 'garden' | 'pool';
  style: BuildingStyle;
  floors: number;
  shop?: ShopType;
  name: string;
  seed: number;
}

export interface RoadSegment {
  id: number;
  /** 'x' runs east-west (along X), 'z' runs north-south (along Z). */
  axis: 'x' | 'z';
  /** Centre line coordinate across the road. */
  c: number;
  /** Start and end along the axis (a < b). */
  a: number;
  b: number;
  w: number;
  name: string;
  median: boolean;
  /** Set when the segment is a bridge: peak height above street level. */
  bridge?: { rise: number; over: 'canal' | 'creek' | 'bay' };
  nodeA: number;
  nodeB: number;
}

export interface RoadNode {
  id: number;
  x: number;
  z: number;
  /** Half extents of the intersection box. */
  hx: number;
  hz: number;
  segments: number[];
}

export interface Pier {
  rect: Rect;
  y: number;
  name?: string;
}

export interface Poi {
  name: string;
  x: number;
  z: number;
  r: number;
  district: District;
}

export interface WaterSlot {
  x: number;
  z: number;
  yaw: number;
  kind: 'boat' | 'jetski' | 'decor';
}

export interface StairDef {
  /** Top landing at street level, descending toward the water along `dir`. */
  x: number;
  z: number;
  dir: Side;
  width: number;
}

export interface Layout {
  seed: number;
  islands: IslandDef[];
  blocks: Block[];
  lots: Lot[];
  segments: RoadSegment[];
  nodes: RoadNode[];
  piers: Pier[];
  pois: Poi[];
  waterSlots: WaterSlot[];
  stairs: StairDef[];
  beach: { x0: number; z0: number; z1: number; rect: Rect };
  islets: { x: number; z: number; r: number; h: number; name: string }[];
  lighthouse: { x: number; z: number };
}

const SIDEWALK = 4;

/**
 * Quay stairs: steps of `run` metres going down `rise` each, from the kerb to well under the water.
 * The first thirteen reach half a metre below the surface; the rest carry on down so that someone
 * swimming, whose feet hang a metre under, can get a foot on them.
 */
export const STAIR = { steps: 19, run: 0.42, rise: (2.0 + 0.5) / 13 } as const;

/** Canal and channel geometry, shared by the island table below. */
export const CANAL = {
  rosa: { z0: -170, z1: -140 },
  azul: { z0: 140, z1: 170 },
  creek: { x0: 190, x1: 235 },
};

function road(c: number, w: number, name: string, median = false): RoadDef {
  return { c, w, name, median };
}

const CENTRO_AVENUES: RoadDef[] = [
  road(-305, 12, 'Bayshore Drive'),
  road(-205, 12, 'Avenida Coral'),
  road(-105, 12, 'Calle Mango'),
  road(-5, 18, 'Gran Via Marazul', true),
  road(95, 12, 'Calle Hibisco'),
  road(175, 12, 'Creekside Drive'),
];

const ISLANDS: IslandDef[] = [
  {
    id: 'heights',
    district: 'heights',
    rect: { x0: -320, z0: -470, x1: 190, z1: CANAL.rosa.z0 },
    avenues: CENTRO_AVENUES,
    streets: [
      road(-455, 12, 'North Shore Road'),
      road(-380, 12, 'Flamingo Street'),
      road(-315, 12, 'Heron Street'),
      road(-250, 12, 'Egret Street'),
      road(-185, 12, 'Paseo Rosa'),
    ],
  },
  {
    id: 'deco',
    district: 'deco',
    rect: { x0: -320, z0: CANAL.rosa.z1, x1: 190, z1: CANAL.azul.z0 },
    avenues: CENTRO_AVENUES,
    streets: [
      road(-125, 12, 'Rosa Quay'),
      road(-65, 10, 'Calle Neon'),
      road(0, 20, 'Avenida del Sol', true),
      road(65, 10, 'Calle Luna'),
      road(125, 12, 'Azul Quay'),
    ],
  },
  {
    id: 'mercado',
    district: 'mercado',
    rect: { x0: -320, z0: CANAL.azul.z1, x1: 190, z1: 320 },
    avenues: CENTRO_AVENUES,
    streets: [road(185, 12, 'Paseo Azul'), road(250, 12, 'Calle Mercado'), road(314, 12, 'Dockside Road')],
  },
  {
    id: 'franja',
    district: 'franja',
    rect: { x0: CANAL.creek.x1, z0: -520, x1: 345, z1: 520 },
    avenues: [road(250, 12, 'Arroyo Drive'), road(325, 14, 'Ocean Parade')],
    streets: [
      road(-505, 10, 'Punta Norte'),
      road(-410, 10, 'Pelican Street'),
      road(-315, 12, 'Heron Street'),
      road(-210, 10, 'Sandpiper Street'),
      road(-105, 10, 'Conch Street'),
      road(0, 20, 'Avenida del Sol', true),
      road(125, 10, 'Mariposa Street'),
      road(250, 12, 'Calle Mercado'),
      road(375, 10, 'Tarpon Street'),
      road(505, 10, 'Punta Sur'),
    ],
  },
  {
    id: 'garza',
    district: 'garza',
    rect: { x0: -600, z0: -110, x1: -470, z1: 110 },
    avenues: [road(-535, 10, 'Garza Loop')],
    streets: [road(-80, 10, 'Heron Lane'), road(0, 20, 'Sunset Causeway', true), road(80, 10, 'Egret Lane')],
  },
];

/** The port is one yard at street level with no kerbs. */
const PORT_RECT: Rect = { x0: -320, z0: 320, x1: 190, z1: 470 };

interface BridgeDef {
  axis: 'x' | 'z';
  c: number;
  a: number;
  b: number;
  w: number;
  rise: number;
  name: string;
  median: boolean;
  over: 'canal' | 'creek' | 'bay';
}

/** Approach length on land at each end of a canal bridge. */
const APPROACH = 9;

const BRIDGES: BridgeDef[] = [
  ...[-205, -5, 175].flatMap((x): BridgeDef[] => {
    const def = CENTRO_AVENUES.find((r) => r.c === x)!;
    return [
      { axis: 'z', c: x, a: CANAL.rosa.z0 - APPROACH, b: CANAL.rosa.z1 + APPROACH, w: def.w, rise: 2.6, name: def.name, median: false, over: 'canal' },
      { axis: 'z', c: x, a: CANAL.azul.z0 - APPROACH, b: CANAL.azul.z1 + APPROACH, w: def.w, rise: 2.6, name: def.name, median: false, over: 'canal' },
    ];
  }),
  { axis: 'x', c: -315, a: CANAL.creek.x0 - 9, b: CANAL.creek.x1 + 9, w: 12, rise: 3.2, name: 'Heron Bridge', median: false, over: 'creek' },
  { axis: 'x', c: 0, a: CANAL.creek.x0 - 9, b: CANAL.creek.x1 + 9, w: 20, rise: 3.4, name: 'Sol Bridge', median: false, over: 'creek' },
  { axis: 'x', c: 250, a: CANAL.creek.x0 - 9, b: CANAL.creek.x1 + 9, w: 12, rise: 3.2, name: 'Mercado Bridge', median: false, over: 'creek' },
  { axis: 'x', c: 0, a: -470, b: -320, w: 20, rise: 6.5, name: 'Sunset Causeway', median: false, over: 'bay' },
];

const SHOP_NAMES: Record<ShopType, string[]> = {
  market: ['Mercado Sol', 'Bodega Brisa', 'La Canasta', 'Mini Mar'],
  ammo: ['Tackle & Trigger', 'Bay Armory', 'El Calibre'],
  pharmacy: ['Farmacia Marea', 'Botica Coral', 'Farmacia Vida'],
  surf: ['Olas Surf Co', 'Wavecrest Outfitters', 'Franja Boardshop'],
  cafe: ['Cafe Colada', 'La Ventanita', 'Pastelito Club', 'Cafe Garza'],
  arcade: ['Pixel Playa', 'Arcadia Neon'],
};

const HOTEL_WORDS = ['Flamingo', 'Coral', 'Marlin', 'Tropic', 'Solana', 'Breeze', 'Ibis', 'Lido', 'Palma', 'Aurora', 'Nautilus', 'Delmar', 'Riviera', 'Pelican', 'Mirador', 'Azulejo', 'Cabana', 'Sirena', 'Calypso', 'Vista'];
const HOTEL_KINDS = ['Hotel', 'Suites', 'Arms', 'House', 'Court', 'Plaza', 'Tower', 'Club'];

function contains(r: Rect, x: number, z: number): boolean {
  return x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
}

export function rectW(r: Rect): number {
  return r.x1 - r.x0;
}

export function rectD(r: Rect): number {
  return r.z1 - r.z0;
}

export function rectCx(r: Rect): number {
  return (r.x0 + r.x1) / 2;
}

export function rectCz(r: Rect): number {
  return (r.z0 + r.z1) / 2;
}

export function rectContains(r: Rect, x: number, z: number, margin = 0): boolean {
  return x >= r.x0 - margin && x <= r.x1 + margin && z >= r.z0 - margin && z <= r.z1 + margin;
}

export function rectDistance(r: Rect, x: number, z: number): number {
  const dx = Math.max(r.x0 - x, 0, x - r.x1);
  const dz = Math.max(r.z0 - z, 0, z - r.z1);
  return Math.hypot(dx, dz);
}

export function shrink(r: Rect, by: number): Rect {
  return { x0: r.x0 + by, z0: r.z0 + by, x1: r.x1 - by, z1: r.z1 - by };
}

/** Height profile of an arched bridge deck above street level. `t` runs 0..1 along the span. */
export function bridgeRise(t: number, rise: number): number {
  if (t <= 0 || t >= 1) return 0;
  return (rise * (1 - Math.cos(t * Math.PI * 2))) / 2;
}

interface Band {
  lo: number;
  hi: number;
  def: RoadDef;
}

function bands(defs: RoadDef[], lo: number, hi: number): Band[] {
  return defs
    .filter((d) => d.c - d.w / 2 >= lo - 0.01 && d.c + d.w / 2 <= hi + 0.01)
    .map((d) => ({ lo: d.c - d.w / 2, hi: d.c + d.w / 2, def: d }))
    .sort((p, q) => p.lo - q.lo);
}

/** Intervals of [lo, hi] not covered by road bands. */
function gaps(bs: Band[], lo: number, hi: number): [number, number][] {
  const out: [number, number][] = [];
  let cur = lo;
  for (const b of bs) {
    if (b.lo - cur > 0.5) out.push([cur, b.lo]);
    cur = b.hi;
  }
  if (hi - cur > 0.5) out.push([cur, hi]);
  return out;
}

export function buildLayout(seed: number): Layout {
  const rng = new Rng(seed);
  const blocks: Block[] = [];
  const lots: Lot[] = [];
  const segments: RoadSegment[] = [];
  const nodes: RoadNode[] = [];
  const nodeKey = new Map<string, number>();

  const getNode = (x: number, z: number, hx: number, hz: number): number => {
    const key = `${Math.round(x)}:${Math.round(z)}`;
    let id = nodeKey.get(key);
    if (id === undefined) {
      id = nodes.length;
      nodes.push({ id, x, z, hx, hz, segments: [] });
      nodeKey.set(key, id);
    } else {
      const n = nodes[id]!;
      n.hx = Math.max(n.hx, hx);
      n.hz = Math.max(n.hz, hz);
    }
    return id;
  };

  const addSegment = (s: Omit<RoadSegment, 'id' | 'nodeA' | 'nodeB'>, na: number, nb: number): void => {
    const id = segments.length;
    segments.push({ ...s, id, nodeA: na, nodeB: nb });
    nodes[na]!.segments.push(id);
    nodes[nb]!.segments.push(id);
  };

  for (const isl of ISLANDS) {
    const r = isl.rect;
    const av = bands(isl.avenues, r.x0, r.x1);
    const st = bands(isl.streets, r.z0, r.z1);

    // Intersections and the road segments between them.
    for (const a of av) {
      for (const s of st) getNode(a.def.c, s.def.c, a.def.w / 2, s.def.w / 2);
    }
    for (const a of av) {
      for (let i = 0; i + 1 < st.length; i++) {
        const s0 = st[i]!;
        const s1 = st[i + 1]!;
        addSegment(
          { axis: 'z', c: a.def.c, a: s0.hi, b: s1.lo, w: a.def.w, name: a.def.name, median: !!a.def.median },
          getNode(a.def.c, s0.def.c, 0, 0),
          getNode(a.def.c, s1.def.c, 0, 0),
        );
      }
    }
    for (const s of st) {
      for (let i = 0; i + 1 < av.length; i++) {
        const a0 = av[i]!;
        const a1 = av[i + 1]!;
        addSegment(
          { axis: 'x', c: s.def.c, a: a0.hi, b: a1.lo, w: s.def.w, name: s.def.name, median: !!s.def.median },
          getNode(a0.def.c, s.def.c, 0, 0),
          getNode(a1.def.c, s.def.c, 0, 0),
        );
      }
    }

    // Everything between the roads is a block.
    const xg = gaps(av, r.x0, r.x1);
    const zg = gaps(st, r.z0, r.z1);
    for (const [x0, x1] of xg) {
      for (const [z0, z1] of zg) {
        const rect = { x0, z0, x1, z1 };
        const roadSides: Side[] = [];
        const waterSides: Side[] = [];
        if (x0 > r.x0 + 0.1) roadSides.push('w');
        else waterSides.push('w');
        if (x1 < r.x1 - 0.1) roadSides.push('e');
        else waterSides.push('e');
        if (z0 > r.z0 + 0.1) roadSides.push('n');
        else waterSides.push('n');
        if (z1 < r.z1 - 0.1) roadSides.push('s');
        else waterSides.push('s');
        const thin = Math.min(x1 - x0, z1 - z0) < 20;
        blocks.push({
          id: blocks.length,
          island: isl.id,
          district: isl.district,
          rect,
          kind: thin ? 'promenade' : 'buildings',
          roadSides,
          waterSides,
        });
      }
    }
  }

  // The mercado island's southern edge meets the port yard, which is land.
  for (const b of blocks) {
    if (b.island === 'mercado') b.waterSides = b.waterSides.filter((s) => s !== 's');
    // The beach island's eastern strip is the boardwalk: it meets sand, not a seawall.
    if (b.island === 'franja') b.waterSides = b.waterSides.filter((s) => s !== 'e');
  }

  // Bridges join islands. Their end nodes are the intersections they land on, or new dead-end nodes.
  const nearestNodeOnLine = (axis: 'x' | 'z', c: number, at: number): number => {
    let best = -1;
    let bestD = 140;
    for (const n of nodes) {
      const across = axis === 'z' ? n.x : n.z;
      const along = axis === 'z' ? n.z : n.x;
      if (Math.abs(across - c) > 1) continue;
      const d = Math.abs(along - at);
      if (d < bestD) {
        bestD = d;
        best = n.id;
      }
    }
    return best;
  };
  for (const b of BRIDGES) {
    const na = nearestNodeOnLine(b.axis, b.c, b.a);
    const nb = nearestNodeOnLine(b.axis, b.c, b.b);
    if (na < 0 || nb < 0) throw new Error(`Bridge ${b.name} has no road to land on`);
    addSegment({ axis: b.axis, c: b.c, a: b.a, b: b.b, w: b.w, name: b.name, median: b.median, bridge: { rise: b.rise, over: b.over } }, na, nb);
  }

  // Special blocks.
  const portBlock: Block = { id: blocks.length, island: 'port', district: 'port', rect: PORT_RECT, kind: 'yard', roadSides: ['n'], waterSides: ['w', 'e', 's'] };
  blocks.push(portBlock);

  const pickBlock = (x: number, z: number): Block | undefined => blocks.find((b) => b.kind === 'buildings' && contains(b.rect, x, z));
  const plaza = pickBlock(-55, -35);
  if (plaza) plaza.kind = 'plaza';
  const park1 = pickBlock(-150, -410);
  if (park1) park1.kind = 'park';
  const park2 = pickBlock(40, 220);
  if (park2) park2.kind = 'park';
  const park3 = pickBlock(290, -460);
  if (park3) park3.kind = 'park';

  // Lots.
  const shopPlan: { type: ShopType; x: number; z: number }[] = [
    { type: 'market', x: -55, z: 35 },
    { type: 'ammo', x: 45, z: -35 },
    { type: 'pharmacy', x: -155, z: 35 },
    { type: 'cafe', x: 45, z: 35 },
    { type: 'surf', x: 290, z: 60 },
    { type: 'cafe', x: 290, z: -60 },
    { type: 'market', x: 290, z: -260 },
    { type: 'ammo', x: 290, z: 310 },
    { type: 'pharmacy', x: 290, z: 190 },
    { type: 'arcade', x: 135, z: -35 },
    { type: 'market', x: -155, z: 220 },
    { type: 'ammo', x: -255, z: -220 },
    { type: 'cafe', x: -55, z: -220 },
    { type: 'pharmacy', x: 45, z: -350 },
    { type: 'surf', x: 290, z: -150 },
    { type: 'cafe', x: -568, z: 40 },
    { type: 'market', x: 135, z: 280 },
    { type: 'ammo', x: -255, z: 95 },
  ];
  const shopCount: Record<string, number> = {};
  const usedNames = new Set<string>();
  const hotelName = (r: Rng): string => {
    for (let i = 0; i < 20; i++) {
      const n = `${r.pick(HOTEL_WORDS)} ${r.pick(HOTEL_KINDS)}`;
      if (!usedNames.has(n)) {
        usedNames.add(n);
        return n;
      }
    }
    return `${r.pick(HOTEL_WORDS)} ${r.int(2, 99)}`;
  };

  for (const block of blocks) {
    if (block.kind !== 'buildings') continue;
    const inner = shrink(block.rect, SIDEWALK);
    const w = rectW(inner);
    const d = rectD(inner);
    const r = rng.fork();
    // Rows run along the long axis; each row faces the street on its side.
    const alongX = w >= d;
    const depth = alongX ? d : w;
    const length = alongX ? w : d;
    const twoRows = depth >= 38;
    const rowDepth = twoRows ? (depth - 3) / 2 : depth;
    const rows: { front: Side; lo: number; hi: number }[] = [];
    if (alongX) {
      if (twoRows) {
        rows.push({ front: 'n', lo: inner.z0, hi: inner.z0 + rowDepth });
        rows.push({ front: 's', lo: inner.z1 - rowDepth, hi: inner.z1 });
      } else {
        rows.push({ front: block.roadSides.includes('s') ? 's' : 'n', lo: inner.z0, hi: inner.z1 });
      }
    } else if (twoRows) {
      rows.push({ front: 'w', lo: inner.x0, hi: inner.x0 + rowDepth });
      rows.push({ front: 'e', lo: inner.x1 - rowDepth, hi: inner.x1 });
    } else {
      rows.push({ front: block.roadSides.includes('e') ? 'e' : 'w', lo: inner.x0, hi: inner.x1 });
    }
    const [minW, maxW] = block.district === 'heights' ? [30, 44] : block.district === 'garza' ? [26, 36] : block.district === 'franja' ? [24, 40] : [17, 30];
    for (const row of rows) {
      // A row whose street side is actually water (no road) still gets buildings facing the promenade.
      let pos = alongX ? inner.x0 : inner.z0;
      const end = pos + length;
      while (end - pos > 8) {
        let lw = r.range(minW, maxW);
        if (end - pos - lw < minW * 0.7) lw = end - pos;
        const a = pos;
        const b = pos + lw;
        pos = b;
        const rect: Rect = alongX ? { x0: a, x1: b, z0: row.lo, z1: row.hi } : { z0: a, z1: b, x0: row.lo, x1: row.hi };
        const atStart = a - (alongX ? inner.x0 : inner.z0) < 0.5;
        const atEnd = end - b < 0.5;
        let cornerSide: Side | undefined;
        if (alongX) {
          if (atStart && block.roadSides.includes('w')) cornerSide = 'w';
          else if (atEnd && block.roadSides.includes('e')) cornerSide = 'e';
        } else if (atStart && block.roadSides.includes('n')) cornerSide = 'n';
        else if (atEnd && block.roadSides.includes('s')) cornerSide = 's';
        lots.push(makeLot(lots.length, block, rect, row.front, cornerSide, r, hotelName));
      }
    }
  }

  // Turn the planned lots into shops: the lot nearest each planned point becomes that shop.
  for (const plan of shopPlan) {
    let best: Lot | undefined;
    let bestD = 70;
    for (const lot of lots) {
      if (lot.use !== 'building' || lot.shop) continue;
      const dd = Math.hypot(rectCx(lot.rect) - plan.x, rectCz(lot.rect) - plan.z);
      if (dd < bestD) {
        bestD = dd;
        best = lot;
      }
    }
    if (!best) continue;
    const n = (shopCount[plan.type] = (shopCount[plan.type] ?? 0) + 1);
    const names = SHOP_NAMES[plan.type];
    best.use = 'shop';
    best.shop = plan.type;
    best.style = 'shop';
    best.floors = Math.min(best.floors, 2);
    best.name = names[(n - 1) % names.length]!;
  }

  // Piers and the marina on the bay side.
  const piers: Pier[] = [];
  const waterSlots: WaterSlot[] = [];
  const marinaZ = [-95, -60, 35, 70, 105];
  for (const z of marinaZ) {
    piers.push({ rect: { x0: -372, x1: -320, z0: z - 1.6, z1: z + 1.6 }, y: 1.15 });
    for (let i = 0; i < 4; i++) {
      const x = -330 - i * 11;
      const kindN: WaterSlot['kind'] = rng.chance(0.55) ? (rng.chance(0.5) ? 'boat' : 'jetski') : 'decor';
      const kindS: WaterSlot['kind'] = rng.chance(0.55) ? (rng.chance(0.5) ? 'boat' : 'jetski') : 'decor';
      waterSlots.push({ x, z: z - 5.2, yaw: Math.PI, kind: kindN });
      waterSlots.push({ x, z: z + 5.2, yaw: 0, kind: kindS });
    }
  }
  // The ocean pier at the end of Avenida del Sol.
  piers.push({ rect: { x0: 345, x1: 492, z0: -4, z1: 4 }, y: WORLD.streetY + WORLD.kerb, name: 'Parade Pier' });
  piers.push({ rect: { x0: 478, x1: 500, z0: -13, z1: 13 }, y: WORLD.streetY + WORLD.kerb });
  // Canal and creek landings with boats.
  const canalSlots: [number, number, number][] = [
    [-260, -155, Math.PI / 2],
    [-150, -155, Math.PI / 2],
    [-60, -155, -Math.PI / 2],
    [50, -155, Math.PI / 2],
    [140, -155, -Math.PI / 2],
    [-260, 155, Math.PI / 2],
    [-150, 155, -Math.PI / 2],
    [-55, 155, Math.PI / 2],
    [50, 155, -Math.PI / 2],
    [140, 155, Math.PI / 2],
    [212, -420, 0],
    [212, -250, Math.PI],
    [212, -120, 0],
    [212, 80, Math.PI],
    [212, 180, 0],
    [212, 330, Math.PI],
    [212, 440, 0],
    [-455, -118, Math.PI / 2],
    [-455, 118, -Math.PI / 2],
    [-608, -40, 0],
    [-608, 40, Math.PI],
    [430, 20, Math.PI / 2],
    [470, -22, -Math.PI / 2],
    [-200, 482, Math.PI / 2],
    [-40, 482, Math.PI / 2],
    [-200, -482, -Math.PI / 2],
    [60, -482, Math.PI / 2],
  ];
  canalSlots.forEach(([x, z, yaw], i) => {
    waterSlots.push({ x, z, yaw, kind: i % 5 === 4 ? 'decor' : i % 2 === 0 ? 'jetski' : 'boat' });
  });

  // Stairs from the seawall down to water level, so swimmers can get out.
  const stairs: StairDef[] = [];
  for (const x of [-250, -150, -55, 45, 135]) {
    stairs.push({ x, z: CANAL.rosa.z0, dir: 's', width: 4 });
    stairs.push({ x: x + 25, z: CANAL.rosa.z1, dir: 'n', width: 4 });
    stairs.push({ x, z: CANAL.azul.z0, dir: 's', width: 4 });
    stairs.push({ x: x + 25, z: CANAL.azul.z1, dir: 'n', width: 4 });
  }
  for (const z of [-440, -360, -260, -150, -50, 60, 150, 300, 420]) {
    stairs.push({ x: CANAL.creek.x1, z, dir: 'w', width: 4 });
    if (z > -470 && z < 320) stairs.push({ x: CANAL.creek.x0, z: z + 22, dir: 'e', width: 4 });
  }
  for (const z of [-400, -250, 210, 290, 400]) stairs.push({ x: -320, z, dir: 'w', width: 4 });
  for (const x of [-250, -100, 60]) {
    stairs.push({ x, z: -470, dir: 'n', width: 4 });
    stairs.push({ x, z: 470, dir: 's', width: 4 });
  }
  stairs.push({ x: -470, z: -70, dir: 'e', width: 4 }, { x: -470, z: 70, dir: 'e', width: 4 });
  stairs.push({ x: -600, z: -60, dir: 'w', width: 4 }, { x: -600, z: 60, dir: 'w', width: 4 });
  stairs.push({ x: -535, z: -110, dir: 'n', width: 4 }, { x: -535, z: 110, dir: 's', width: 4 });

  const pois: Poi[] = [
    { name: 'Flamingo Heights', x: -60, z: -330, r: 150, district: 'heights' },
    { name: 'Deco Row', x: -60, z: 0, r: 140, district: 'deco' },
    { name: 'El Mercado', x: -60, z: 245, r: 110, district: 'mercado' },
    { name: 'Port Cascabel', x: -60, z: 395, r: 120, district: 'port' },
    { name: 'Ocean Parade', x: 300, z: -150, r: 150, district: 'franja' },
    { name: 'Parade Pier', x: 440, z: 0, r: 60, district: 'franja' },
    { name: 'Punta Sur', x: 295, z: 380, r: 130, district: 'franja' },
    { name: 'Marina del Sol', x: -350, z: 10, r: 80, district: 'deco' },
    { name: 'Isla Garza', x: -535, z: 0, r: 100, district: 'garza' },
    { name: 'Plaza Marazul', x: -55, z: -35, r: 45, district: 'deco' },
  ];

  return {
    seed,
    islands: ISLANDS,
    blocks,
    lots,
    segments,
    nodes,
    piers,
    pois,
    waterSlots,
    stairs,
    beach: { x0: 345, z0: -520, z1: 520, rect: ISLANDS.find((i) => i.id === 'franja')!.rect },
    islets: [
      { x: -470, z: -330, r: 46, h: 2.4, name: 'Cayo Coco' },
      { x: -440, z: 350, r: 38, h: 2.0, name: 'Cayo Perla' },
      { x: 60, z: -565, r: 34, h: 1.9, name: 'Cayo Norte' },
    ],
    lighthouse: { x: 300, z: 549 },
  };
}

function makeLot(
  id: number,
  block: Block,
  rect: Rect,
  front: Side,
  cornerSide: Side | undefined,
  r: Rng,
  hotelName: (r: Rng) => string,
): Lot {
  const district = block.district;
  let style: BuildingStyle = 'deco';
  let floors = 2;
  let use: Lot['use'] = 'building';
  switch (district) {
    case 'heights':
      style = r.weighted<BuildingStyle>([
        ['tower', 5],
        ['modern', 3],
        ['hotel', 2],
      ]);
      floors = style === 'tower' ? r.int(11, 22) : style === 'modern' ? r.int(6, 12) : r.int(4, 7);
      if (r.chance(0.1)) use = 'parking';
      break;
    case 'deco':
      style = r.weighted<BuildingStyle>([
        ['deco', 6],
        ['hotel', 3],
        ['modern', 1],
      ]);
      floors = style === 'hotel' ? r.int(4, 8) : style === 'modern' ? r.int(5, 9) : r.int(2, 4);
      if (r.chance(0.06)) use = 'parking';
      break;
    case 'mercado':
      style = r.weighted<BuildingStyle>([
        ['deco', 6],
        ['warehouse', 2],
        ['hotel', 1],
      ]);
      floors = style === 'warehouse' ? r.int(1, 2) : r.int(1, 3);
      if (r.chance(0.08)) use = 'parking';
      break;
    case 'franja':
      style = r.weighted<BuildingStyle>([
        ['hotel', 6],
        ['deco', 3],
        ['tower', 1],
      ]);
      floors = style === 'tower' ? r.int(10, 16) : style === 'hotel' ? r.int(3, 8) : r.int(2, 3);
      if (r.chance(0.07)) use = 'pool';
      break;
    case 'garza':
      style = 'villa';
      floors = r.int(1, 2);
      break;
    case 'port':
      style = 'warehouse';
      floors = 1;
      break;
  }
  const name = style === 'hotel' || style === 'tower' ? hotelName(r) : '';
  return { id, block: block.id, district, rect, front, cornerSide, use, style, floors, name, seed: Math.floor(r.next() * 1e9) };
}

export { PORT_RECT, SIDEWALK };
