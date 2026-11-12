import { type BufferGeometry, Color, Matrix4, Vector3 } from 'three';
import type { ShopType } from './layout';
import type { Region, ShopAtlas } from './shopAtlas';
import { Batch, type ShopKit } from './shopKit';
import { SHOPFRONT, type ShopSite } from './shopPlan';

/** Which way something in a room faces: into the shop, out to the street, or to a side wall. */
type Dir = 'in' | 'out' | 'left' | 'right';

export type SpotKind = 'counter' | 'fridge' | 'seat' | 'jukebox' | 'booth' | 'vending' | 'gacha';

/** Something in or outside a shop that the interact key can use. */
export interface Spot {
  kind: SpotKind;
  /** The thing itself, at chest height, for the prompt. */
  x: number;
  y: number;
  z: number;
  radius: number;
  /** Where to stand to use it. */
  standX: number;
  standZ: number;
  /** Seats: where the body is put and which way it faces. */
  seatX?: number;
  seatY?: number;
  seatZ?: number;
  yaw?: number;
  outside?: boolean;
  /**
   * How deep into the room to walk down the middle before turning toward this, when something
   * stands between the middle and the place to stand (a bar, a counter). Metres from the shopfront.
   */
  lane?: number;
}

export interface BoxCollider {
  x: number;
  y: number;
  z: number;
  hx: number;
  hy: number;
  hz: number;
  glass?: boolean;
  /** A round post rather than a box (stools, table stems). */
  round?: boolean;
}

/** One shop's room, built: what to draw, what to bump into and what can be used. */
export interface Interior {
  site: ShopSite;
  /** Centre of the room on the floor. The meshes are measured from here. */
  origin: Vector3;
  geometry: BufferGeometry | null;
  glass: BufferGeometry | null;
  colliders: BoxCollider[];
  spots: Spot[];
  /** Middle of the doorway on the floor; `yaw` faces into the shop. */
  door: { x: number; z: number; yaw: number };
  /** Unit vectors on the ground: into the shop, and along the shopfront (the way the door leaves slide). */
  into: { x: number; z: number };
  along: { x: number; z: number };
  /** Standing spots just inside and just outside the door. */
  inside: { x: number; y: number; z: number };
  outside: { x: number; y: number; z: number };
  /** Where a customer stands at the counter. */
  counter: { x: number; y: number; z: number };
  keeper: { x: number; z: number; yaw: number };
  /** Half width and depth of the room, for "is this point inside". */
  halfWidth: number;
  depth: number;
  /** How many of each kind of furniture were placed. */
  furniture: Record<string, number>;
  /** A sidewalk drinks machine's body, drawn with the street's lit materials: centre, size and facing. */
  streetMachine: { x: number; z: number; fx: number; fz: number } | null;
  /** The room itself (floor, walls, ceiling, window frames) comes first in the mesh, this many indices of it. */
  shellIndices: number;
  vertices: number;
  triangles: number;
}

const hex = (h: number): Color => new Color(h);
const WHITE = hex(0xffffff);
const DARK = hex(0x22303a);
const STEEL = hex(0x8c97a3);
const CHROME = hex(0xc9d1d9);
const CREAM = hex(0xfff6e4);
const WOOD = hex(0xb07d4f);
const BLACK = hex(0x14181d);
const GREEN = hex(0x35c98a);
const NEONS = [hex(0xff3d8b), hex(0x35e0c8), hex(0xffd166), hex(0x8a5cf5), hex(0x19b8d4), hex(0xff7a59)];
const CARTONS = [hex(0xc23b3b), hex(0x3f7d4a), hex(0xd9a441), hex(0x2f5f8f), hex(0xe8e2d4), hex(0x7a4a8a)];

interface Theme {
  wall: Color;
  wainscot: Color;
  trim: Color;
  ceiling: Color;
  floor: 'tile' | 'plank' | 'carpet' | 'concrete';
  floorA: Color;
  floorB: Color;
  counter: Color;
  counterTop: Color;
  /** Brightness of the ceiling light panels and their tint. */
  lamp: Color;
  lampGain: number;
  /** Poster indices into the atlas, in the order the posters are listed in art.json. */
  posters: readonly number[];
}

function theme(type: ShopType, accent: Color): Theme {
  const soft = accent.clone().lerp(WHITE, 0.45);
  switch (type) {
    case 'market':
      return { wall: hex(0xfff3da), wainscot: soft, trim: hex(0xfdfdf8), ceiling: hex(0xf2efe6), floor: 'tile', floorA: hex(0xffffff), floorB: hex(0xbfe6dc), counter: hex(0x2f8f83), counterTop: CREAM, lamp: hex(0xfff4dc), lampGain: 2.3, posters: [0, 3, 1] };
    case 'ammo':
      return { wall: hex(0xd8d0b8), wainscot: hex(0x5d6e4f), trim: hex(0x2f3a2c), ceiling: hex(0xcfc9b6), floor: 'concrete', floorA: hex(0xb9b7ad), floorB: hex(0xb0aea4), counter: hex(0x5a4632), counterTop: hex(0x2b2d30), lamp: hex(0xfff0d0), lampGain: 2.1, posters: [5, 4, 2] };
    case 'pharmacy':
      return { wall: hex(0xf6fbf9), wainscot: hex(0xb9e6d8), trim: hex(0xffffff), ceiling: hex(0xf4f7f6), floor: 'tile', floorA: hex(0xffffff), floorB: hex(0xcfe4f2), counter: hex(0xf2f5f4), counterTop: hex(0x35c98a), lamp: hex(0xf2fbff), lampGain: 2.5, posters: [1, 0, 3] };
    case 'surf':
      return { wall: hex(0xfff0d2), wainscot: hex(0x8fd9e0), trim: hex(0xfdfdf8), ceiling: hex(0xf5eedc), floor: 'plank', floorA: hex(0xe6c391), floorB: hex(0xdcb682), counter: hex(0xff9e6b), counterTop: hex(0xfff6e4), lamp: hex(0xfff2d6), lampGain: 2.2, posters: [4, 1, 0] };
    case 'cafe':
      return { wall: hex(0xffe3c6), wainscot: hex(0x1d8f8a), trim: hex(0xfff6e4), ceiling: hex(0xf6ead8), floor: 'tile', floorA: hex(0xfbf7ee), floorB: hex(0x2f3340), counter: hex(0x16807b), counterTop: hex(0xfff0d8), lamp: hex(0xffe6bf), lampGain: 2.0, posters: [0, 3, 2] };
    default:
      return { wall: hex(0x33215f), wainscot: hex(0x1f1440), trim: hex(0xff3d8b), ceiling: hex(0x181030), floor: 'carpet', floorA: hex(0x3a3068), floorB: hex(0x3a3068), counter: hex(0x3a1548), counterTop: hex(0xff5fa8), lamp: hex(0xc79bff), lampGain: 1.5, posters: [2, 0, 4] };
  }
}

const _m = new Matrix4();
const _r = new Matrix4();
const _s = new Matrix4();

/**
 * A room in its own coordinates: `x` runs to the right for someone walking in, `z` runs from the
 * shopfront to the back wall, heights are measured from the floor. Half the shops are mirror images,
 * which this hides: a layout is written once and comes out handed either way.
 */
class Room {
  readonly hw: number;
  readonly d: number;
  readonly h: number = SHOPFRONT.ceiling;
  readonly y: number = SHOPFRONT.floorY;
  readonly colliders: BoxCollider[] = [];
  readonly spots: Spot[] = [];
  readonly furniture: Record<string, number> = {};
  private readonly ox: number;
  private readonly oz: number;
  /** World direction of the room's +x and +z. */
  readonly rx: number;
  readonly rz: number;
  readonly fx: number;
  readonly fz: number;
  /** -1 in a mirrored room: there, things to the right on paper stand to the left. */
  readonly hand: number;

  constructor(
    readonly site: ShopSite,
    readonly batch: Batch,
    readonly kit: ShopKit,
    readonly atlas: ShopAtlas,
    readonly theme: Theme,
  ) {
    const f = site.frame;
    const p = site.plan;
    this.hw = (p.u1 - p.u0) / 2;
    this.d = p.w1 - p.w0;
    const m = p.mirror ? -1 : 1;
    this.hand = m;
    this.ox = f.x(p.doorU, p.w0);
    this.oz = f.z(p.doorU, p.w0);
    this.rx = (f.x(1, 0) - f.x(0, 0)) * m;
    this.rz = (f.z(1, 0) - f.z(0, 0)) * m;
    this.fx = f.x(0, 1) - f.x(0, 0);
    this.fz = f.z(0, 1) - f.z(0, 0);
  }

  X(x: number, z: number): number {
    return this.ox + x * this.rx + z * this.fx;
  }

  Z(x: number, z: number): number {
    return this.oz + x * this.rz + z * this.fz;
  }

  /** Something standing at a point of the room, facing `dir`. */
  at(x: number, z: number, dir: Dir): Obj {
    const s = dir === 'in' || dir === 'right' ? 1 : -1;
    const side = dir === 'left' || dir === 'right';
    return new Obj(this, this.X(x, z), this.Z(x, z), (side ? this.rx : this.fx) * s, (side ? this.rz : this.fz) * s);
  }

  count(name: string, n = 1): void {
    this.furniture[name] = (this.furniture[name] ?? 0) + n;
  }

  /** A flat rectangle on the floor or under the ceiling, given in room coordinates. */
  slab(x0: number, z0: number, x1: number, z1: number, y: number, up: boolean, color: Color, region: Region | null = null, gain: number | readonly [number, number, number, number] = 1): void {
    const xa = Math.min(this.X(x0, z0), this.X(x1, z1));
    const xb = Math.max(this.X(x0, z0), this.X(x1, z1));
    const za = Math.min(this.Z(x0, z0), this.Z(x1, z1));
    const zb = Math.max(this.Z(x0, z0), this.Z(x1, z1));
    const wy = this.y + y;
    if (up) this.batch.quad([xa, wy, zb], [xb, wy, zb], [xb, wy, za], [xa, wy, za], color, region, gain);
    else this.batch.quad([xa, wy, za], [xb, wy, za], [xb, wy, zb], [xa, wy, zb], color, region, gain);
  }
}

/**
 * A thing with a front. Its own coordinates: `r` to the right of someone looking at its front,
 * `f` out of its front, heights from the floor. In a mirrored room `r` runs the other way, so a
 * layout written once comes out as its mirror image, but pictures and lettering are always placed
 * in the world the right way round.
 */
class Obj {
  constructor(
    readonly room: Room,
    readonly x: number,
    readonly z: number,
    readonly fx: number,
    readonly fz: number,
  ) {}

  wx(r: number, f: number): number {
    return this.x + r * this.room.hand * this.fz + f * this.fx;
  }

  wz(r: number, f: number): number {
    return this.z - r * this.room.hand * this.fx + f * this.fz;
  }

  /** The game yaw of someone facing the way this faces. */
  get yaw(): number {
    return Math.atan2(-this.fx, -this.fz);
  }

  /** The same place, turned to face the other way. */
  flip(): Obj {
    return new Obj(this.room, this.x, this.z, -this.fx, -this.fz);
  }

  private face(letter: string): string {
    const dir = (x: number, z: number): string => (z > 0.5 ? 's' : z < -0.5 ? 'n' : x > 0.5 ? 'e' : 'w');
    const h = this.room.hand;
    if (letter === 'f') return dir(this.fx, this.fz);
    if (letter === 'k') return dir(-this.fx, -this.fz);
    if (letter === 'r') return dir(this.fz * h, -this.fx * h);
    if (letter === 'l') return dir(-this.fz * h, this.fx * h);
    return letter;
  }

  /** A box. `faces` picks from f front, k back, l left, r right, t top, b bottom. */
  box(r0: number, y0: number, f0: number, r1: number, y1: number, f1: number, color: Color, faces = 'fklrt', gain = 1, top: Color = color): void {
    const xa = this.wx(r0, f0);
    const xb = this.wx(r1, f1);
    const za = this.wz(r0, f0);
    const zb = this.wz(r1, f1);
    let w = '';
    for (const ch of faces) w += this.face(ch);
    const y = this.room.y;
    this.room.batch.box(Math.min(xa, xb), y + y0, Math.min(za, zb), Math.max(xa, xb), y + y1, Math.max(za, zb), color, w, gain, top);
  }

  cylinder(r: number, y0: number, f: number, radius: number, height: number, color: Color, gain = 1, top: Color = color, segments = 10): void {
    this.room.batch.cylinder(this.wx(r, f), this.room.y + y0, this.wz(r, f), radius, height, color, segments, gain, top);
  }

  /** A picture from the atlas standing upright, facing the way this faces, `f` in front of the origin. */
  decal(region: Region, r: number, y: number, f: number, w: number, h: number, gain = 1, color: Color = WHITE): void {
    const y0 = this.room.y + y;
    const cx = this.wx(r, f);
    const cz = this.wz(r, f);
    // Half the width, along the right of whoever is looking at it.
    const hx = (this.fz * w) / 2;
    const hz = (-this.fx * w) / 2;
    this.room.batch.quad([cx - hx, y0, cz - hz], [cx + hx, y0, cz + hz], [cx + hx, y0 + h, cz + hz], [cx - hx, y0 + h, cz - hz], color, region, gain);
  }

  /** A picture lying on the floor, to be read by someone standing in front of this. */
  floorDecal(region: Region, r: number, f: number, w: number, h: number, y = 0.026, gain = 1, color: Color = WHITE): void {
    const wy = this.room.y + y;
    const cx = this.wx(r, f);
    const cz = this.wz(r, f);
    const hx = (this.fz * w) / 2;
    const hz = (-this.fx * w) / 2;
    // The foot of the picture is nearest the reader.
    const nx = (this.fx * h) / 2;
    const nz = (this.fz * h) / 2;
    this.room.batch.quad([cx - hx + nx, wy, cz - hz + nz], [cx + hx + nx, wy, cz + hz + nz], [cx + hx - nx, wy, cz + hz - nz], [cx - hx - nx, wy, cz - hz - nz], color, region, gain);
  }

  /** A kit model with its front the way this faces. `quarter` turns it further, in quarter turns. */
  kit(name: string, r: number, y: number, f: number, scale = 2, quarter = 0, gain = 1): void {
    const room = this.room;
    _m.makeTranslation(this.wx(r, f), room.y + y, this.wz(r, f));
    _r.makeRotationY(Math.atan2(this.fx, this.fz) + (quarter * this.room.hand * Math.PI) / 2);
    _s.makeScale(scale, scale, scale);
    _m.multiply(_r).multiply(_s);
    room.batch.kit(room.kit.get(name), _m, gain);
  }

  /** Something solid to walk into, `height` tall from `y0`. */
  solid(r0: number, f0: number, r1: number, f1: number, height: number, y0 = 0, glass = false): void {
    const xa = this.wx(r0, f0);
    const xb = this.wx(r1, f1);
    const za = this.wz(r0, f0);
    const zb = this.wz(r1, f1);
    this.room.colliders.push({ x: (xa + xb) / 2, y: this.room.y + y0 + height / 2, z: (za + zb) / 2, hx: Math.abs(xb - xa) / 2, hy: height / 2, hz: Math.abs(zb - za) / 2, glass });
  }

  post(r: number, f: number, radius: number, height: number): void {
    this.room.colliders.push({ x: this.wx(r, f), y: this.room.y + height / 2, z: this.wz(r, f), hx: radius, hy: height / 2, hz: radius, round: true });
  }

  /** Something to use, at (r, f), with the place to stand `reach` in front of it. */
  spot(kind: SpotKind, r: number, f: number, reach: number, radius = 1.7, extra: Partial<Spot> = {}): Spot {
    const s: Spot = { kind, x: this.wx(r, f), y: this.room.y + 1.0, z: this.wz(r, f), radius, standX: this.wx(r, f + reach), standZ: this.wz(r, f + reach), ...extra };
    this.room.spots.push(s);
    return s;
  }
}

/** Build one shop's room: shell, furniture for its trade, posters, and the things to use. */
export function buildInterior(site: ShopSite, kit: ShopKit, atlas: ShopAtlas, free: (x: number, z: number) => boolean = () => true): Interior {
  const f = site.frame;
  const p = site.plan;
  // The shopfront faces the daylight: surfaces turned toward it are painted a little brighter.
  const batch = new Batch(atlas.white, f.outX, f.outZ);
  const th = theme(p.type, site.accent);
  const room = new Room(site, batch, kit, atlas, th);
  if (p.type === 'arcade') batch.kitGain = 1.0;

  shell(room);
  const shellIndices = batch.indexCount;
  const made = FURNISH[p.type](room);
  const streetMachine = made.streetMachine ? sidewalkMachine(room, free) : null;

  const origin = new Vector3(room.X(0, room.d / 2), room.y, room.Z(0, room.d / 2));
  const door = room.at(0, -SHOPFRONT.wall / 2, 'in');
  return {
    site,
    origin,
    geometry: batch.build(origin.x, origin.y, origin.z),
    glass: batch.buildGlass(origin.x, origin.y, origin.z),
    colliders: room.colliders,
    spots: room.spots,
    door: { x: door.x, z: door.z, yaw: door.yaw },
    into: { x: room.fx, z: room.fz },
    along: { x: room.rx, z: room.rz },
    inside: { x: room.X(0, 1.3), y: room.y, z: room.Z(0, 1.3) },
    outside: { x: room.X(0, -2.6), y: room.y, z: room.Z(0, -2.6) },
    counter: made.counter,
    keeper: made.keeper,
    halfWidth: room.hw,
    depth: room.d,
    furniture: room.furniture,
    streetMachine,
    shellIndices,
    vertices: batch.vertices,
    triangles: batch.triangles,
  };
}

interface Furnished {
  counter: { x: number; y: number; z: number };
  keeper: { x: number; z: number; yaw: number };
  /** Put a drinks machine on the sidewalk by the shopfront. */
  streetMachine?: boolean;
}

// --- the room itself ---

/** Floor, walls, ceiling with light panels, and the inside of the glazed front. */
function shell(room: Room): void {
  const { hw, d, h, theme: th, atlas, batch } = room;
  const half = SHOPFRONT.doorWidth / 2;
  const wall = SHOPFRONT.wall;

  // Floor. Tiles darken toward the walls, which reads as soft shadow in the corners.
  const pattern = th.floor === 'tile' ? atlas.tile : th.floor === 'plank' ? atlas.plank : th.floor === 'carpet' ? atlas.carpet : atlas.concrete;
  const size = th.floor === 'tile' ? 0.8 : 1.6;
  const edge = (x: number, z: number): number => {
    const front = Math.abs(x) < half ? 9 : z;
    const near = Math.min(x + hw, hw - x, front, d - z);
    const t = Math.min(1, Math.max(0, near / 0.9));
    return 0.74 + 0.26 * t * t * (3 - 2 * t);
  };
  const nx = Math.ceil((hw * 2) / size);
  const nz = Math.ceil(d / size);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = -hw + i * size;
      const x1 = Math.min(hw, x0 + size);
      const z0 = j * size;
      const z1 = Math.min(d, z0 + size);
      // A cut tile at the far edge shows only its near part.
      const u1 = pattern.u0 + ((pattern.u1 - pattern.u0) * (x1 - x0)) / size;
      const v1 = pattern.v0 + ((pattern.v1 - pattern.v0) * (z1 - z0)) / size;
      const cell: Region = { u0: pattern.u0, v0: pattern.v0, u1, v1 };
      const color = (i + j) % 2 === 0 ? th.floorA : th.floorB;
      // One value per tile keeps the checker crisp; the gradient comes from tile to tile.
      room.slab(x0, z0, x1, z1, 0.02, true, color, cell, edge((x0 + x1) / 2, (z0 + z1) / 2));
    }
  }
  // The doorway's own strip of floor, out to the threshold.
  room.slab(-half, -wall, half, 0, 0.02, true, th.floorA, null, 0.8);

  // Ceiling, with lit panels in a grid.
  room.slab(-hw, 0, hw, d, h, false, th.ceiling, null, 0.86);
  const cols = Math.max(2, Math.round((hw * 2) / 3.4));
  const rows = Math.max(2, Math.round(d / 3.2));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = -hw + ((i + 0.5) * hw * 2) / cols;
      const z = ((j + 0.5) * d) / rows;
      // Seen from below only: a bright face in a thin dark frame.
      room.slab(x - 0.66, z - 0.36, x + 0.66, z + 0.36, h - 0.012, false, DARK, null, 0.9);
      room.slab(x - 0.6, z - 0.3, x + 0.6, z + 0.3, h - 0.024, false, th.lamp, null, th.lampGain);
    }
  }

  // Walls: baseboard, a coloured dado, a rail, then the wall colour up to the ceiling.
  const back = room.at(0, d, 'out');
  const left = room.at(-hw, d / 2, 'right');
  const right = room.at(hw, d / 2, 'left');
  wallFace(back, hw * 2, 0, h, th);
  wallFace(left, d, 0, h, th);
  wallFace(right, d, 0, h, th);

  // The inside of the front: band over the glass, the low wall under the windows, sills and reveals.
  const front = room.at(0, 0, 'in');
  const shadeIn = batch.shade(front.fx, 0, front.fz);
  front.decal(atlas.white, 0, SHOPFRONT.glassTop, 0, hw * 2, h - SHOPFRONT.glassTop, shadeIn * 0.92, th.wall);
  for (const s of [-1, 1]) {
    const a = s < 0 ? -hw : half;
    const b = s < 0 ? -half : hw;
    // Seen from inside, left and right swap: `front` faces into the room.
    front.decal(atlas.white, -(a + b) / 2, 0, 0, b - a, SHOPFRONT.plinth, shadeIn * 0.9, th.wainscot);
    room.slab(a, -wall + 0.05, b, 0, SHOPFRONT.plinth, true, th.trim, null, 0.95);
  }
  room.slab(-hw, -wall, hw, 0, SHOPFRONT.glassTop, false, th.wall, null, 0.7);
  for (const s of [-1, 1]) {
    // Ends of the low wall, facing the doorway.
    const jamb = room.at(s * half, -wall / 2, s < 0 ? 'right' : 'left');
    jamb.decal(atlas.white, 0, 0, 0, wall, SHOPFRONT.plinth, batch.shade(jamb.fx, 0, jamb.fz) * 0.9, th.wainscot);
  }

  // Window frames and glass. The frame is dark both sides, so it is drawn here, unlit.
  const glassZ = -0.15;
  const frame = room.at(0, glassZ, 'out');
  const bar = (x0: number, x1: number, y0: number, y1: number): void => frame.box(Math.min(x0, x1), y0, -0.04, Math.max(x0, x1), y1, 0.04, DARK, 'fklrtb', 0.9);
  for (const s of [-1, 1]) {
    const a = s * (half + 0.08);
    const b = s * hw;
    bar(a, b, SHOPFRONT.plinth, SHOPFRONT.plinth + 0.06);
    bar(a, b, SHOPFRONT.glassTop - 0.07, SHOPFRONT.glassTop);
    // Door post, full height.
    bar(s * half, a, 0, SHOPFRONT.glassTop);
    const n = Math.max(1, Math.round((hw - half) / 2.1));
    for (let i = 1; i < n; i++) {
      const x = a + ((b - a) * i) / n;
      bar(x - 0.035, x + 0.035, SHOPFRONT.plinth + 0.06, SHOPFRONT.glassTop - 0.07);
    }
    pane(room, a, b, SHOPFRONT.plinth + 0.06, SHOPFRONT.glassTop - 0.07, glassZ);
    // Glass stops people and bullets, but not the camera.
    frame.solid(a, -0.13, b, 0.13, SHOPFRONT.glassTop - SHOPFRONT.plinth, SHOPFRONT.plinth, true);
  }
  // Transom over the door.
  bar(-half, half, SHOPFRONT.doorHeight, SHOPFRONT.doorHeight + 0.08);
  pane(room, -half, half, SHOPFRONT.doorHeight + 0.08, SHOPFRONT.glassTop - 0.07, glassZ);
  bar(-half, half, SHOPFRONT.glassTop - 0.07, SHOPFRONT.glassTop);
  frame.solid(-half, -0.13, half, 0.13, SHOPFRONT.glassTop - SHOPFRONT.doorHeight, SHOPFRONT.doorHeight, true);

  // The shop's name on a plate behind the glass over the door, for the street.
  const plate = atlas.names.get(room.site.lot.name);
  if (plate) room.at(0, glassZ + 0.03, 'out').decal(plate, 0, SHOPFRONT.doorHeight + 0.11, 0, 1.8, 0.35, 1.5);

  // Welcome mat, and a neon OPEN in the window for the street.
  room.at(0, 0.75, 'out').floorDecal(atlas.mat, 0, 0, 1.7, 0.85, 0.027, 0.85);
  const sign = room.at(-(half + 1.55), -0.07, 'out');
  sign.decal(atlas.open, 0, 2.05, 0, 1.5, 0.7, 2.1);
  // And readable from inside too.
  sign.flip().decal(atlas.open, 0, 2.05, 0.02, 1.5, 0.7, 1.2);
}

function pane(room: Room, x0: number, x1: number, y0: number, y1: number, z: number): void {
  const y = room.y;
  room.batch.pane([room.X(x0, z), y + y0, room.Z(x0, z)], [room.X(x1, z), y + y0, room.Z(x1, z)], [room.X(x1, z), y + y1, room.Z(x1, z)], [room.X(x0, z), y + y1, room.Z(x0, z)]);
}

/** One wall, seen from inside: `o` stands at its foot in the middle, facing the room. */
function wallFace(o: Obj, width: number, y0: number, y1: number, th: Theme): void {
  const b = o.room.batch;
  const sh = b.shade(o.fx, 0, o.fz);
  const hw = width / 2;
  // Darker toward the corners and up by the ceiling.
  const cuts = [-hw, -hw + 0.7, hw - 0.7, hw];
  const dim = [0.8, 1, 1, 0.8];
  const bands: [number, number, Color, number, number][] = [
    [y0, y0 + 0.12, th.trim, 0.55, 0.6],
    [y0 + 0.12, y0 + 1.0, th.wainscot, 0.86, 0.95],
    [y0 + 1.0, y0 + 1.06, th.trim, 1, 1],
    [y0 + 1.06, y1 - 0.5, th.wall, 1, 1],
    [y1 - 0.5, y1, th.wall, 1, 0.84],
  ];
  const y = o.room.y;
  for (const [ya, yb, color, ga, gb] of bands) {
    for (let i = 0; i < 3; i++) {
      const ra = cuts[i]!;
      const rb = cuts[i + 1]!;
      const da = dim[i]! * sh;
      const db = dim[i + 1]! * sh;
      // Along the wall, left to right for someone facing it.
      const xa = o.x + ra * o.fz;
      const za = o.z - ra * o.fx;
      const xb = o.x + rb * o.fz;
      const zb = o.z - rb * o.fx;
      b.quad([xa, y + ya, za], [xb, y + ya, zb], [xb, y + yb, zb], [xa, y + yb, za], color, null, [da * ga, db * ga, db * gb, da * gb]);
    }
  }
}

// --- furniture built from boxes ---

/** A shop counter running left to right, customers at its front. Returns its top height. */
function counter(o: Obj, len: number, th: Theme, accent: Color, height = 1.02): number {
  const a = -len / 2;
  const b = len / 2;
  o.box(a, 0, -0.26, b, 0.1, 0.24, BLACK, 'fklr');
  o.box(a, 0.1, -0.32, b, height - 0.06, 0.32, th.counter, 'fklr');
  o.box(a - 0.04, height - 0.06, -0.4, b + 0.04, height, 0.42, th.counterTop, 'fklrtb');
  // A band of the building's colour across the front, between two pale rules.
  o.box(a + 0.08, 0.34, 0.32, b - 0.08, 0.7, 0.335, accent, 'f');
  o.box(a + 0.08, 0.3, 0.32, b - 0.08, 0.33, 0.34, CREAM, 'f', 1.1);
  o.box(a + 0.08, 0.71, 0.32, b - 0.08, 0.74, 0.34, CREAM, 'f', 1.1);
  o.solid(a, -0.38, b, 0.4, height);
  o.room.count('counter');
  return height;
}

/** A till: a base with a keypad and a small lit screen turned to the shopkeeper. */
function till(o: Obj, r: number, top: number): void {
  o.box(r - 0.2, top, -0.18, r + 0.2, top + 0.1, 0.16, DARK);
  o.box(r - 0.16, top + 0.1, -0.02, r + 0.16, top + 0.13, 0.14, STEEL, 'fklrt');
  o.box(r - 0.02, top + 0.1, -0.14, r + 0.02, top + 0.3, -0.1, DARK);
  o.box(r - 0.17, top + 0.22, -0.2, r + 0.17, top + 0.46, -0.16, BLACK);
  o.flip().decal(o.room.atlas.till, -r, top + 0.25, 0.202, 0.28, 0.18, 1.7);
  o.room.count('till');
}

/** A bar stool. Returns where to sit on it. */
function stool(o: Obj, r: number, f: number, color: Color, seat = 0.76): [number, number, number] {
  o.cylinder(r, 0, f, 0.2, 0.03, STEEL);
  o.cylinder(r, 0.03, f, 0.035, seat - 0.09, CHROME, 1, CHROME, 6);
  o.cylinder(r, 0.28, f, 0.15, 0.02, STEEL, 1, STEEL, 8);
  o.cylinder(r, seat - 0.06, f, 0.19, 0.06, color, 1, color, 12);
  o.post(r, f, 0.17, seat);
  o.room.count('stool');
  return [o.wx(r, f), o.room.y + seat, o.wz(r, f)];
}

/** A chair facing the way `o` faces. */
function chair(o: Obj, color: Color): void {
  for (const [r, f] of [
    [-0.19, -0.19],
    [0.19, -0.19],
    [-0.19, 0.19],
    [0.19, 0.19],
  ] as const) {
    o.box(r - 0.02, 0, f - 0.02, r + 0.02, 0.43, f + 0.02, CHROME, 'fklr');
  }
  o.box(-0.22, 0.43, -0.22, 0.22, 0.48, 0.22, color, 'fklrtb');
  o.box(-0.21, 0.48, -0.22, 0.21, 0.56, -0.19, CHROME, 'fklr');
  o.box(-0.22, 0.56, -0.23, 0.22, 0.92, -0.18, color, 'fklrt');
  o.solid(-0.22, -0.23, 0.22, 0.22, 0.92);
  o.room.count('chair');
}

/** A round cafe table with something on it. */
function table(o: Obj, color: Color): void {
  o.cylinder(0, 0, 0, 0.26, 0.03, STEEL);
  o.cylinder(0, 0.03, 0, 0.045, 0.69, CHROME, 1, CHROME, 6);
  o.cylinder(0, 0.72, 0, 0.44, 0.04, color, 1, color, 14);
  o.post(0, 0, 0.3, 0.76);
  o.room.count('table');
}

/** A bench with a back, `len` long. */
function bench(o: Obj, len: number, color: Color): void {
  const a = -len / 2;
  const b = len / 2;
  for (const r of [a + 0.04, b - 0.04]) o.box(r - 0.04, 0, -0.24, r + 0.04, 0.42, 0.24, DARK, 'fklr');
  o.box(a, 0.42, -0.25, b, 0.48, 0.25, color, 'fklrtb');
  o.box(a, 0.48, -0.25, b, 0.95, -0.19, color, 'fklrt');
  o.solid(a, -0.25, b, 0.25, 0.95);
  o.room.count('bench');
}

/**
 * Seats along a bench or a row, as interact spots. Bodies sit a little forward of the seat's middle.
 * `side` moves the place to stand from in front of the seat to beside it, for a chair pulled up to a table.
 */
function seats(o: Obj, places: readonly number[], seatY: number, f = 0, side = 0): void {
  for (const r of places) {
    // The sitting pose puts the hips a quarter metre behind the feet.
    const sx = o.wx(r, f + 0.22);
    const sz = o.wz(r, f + 0.22);
    const beside = side === 0 ? {} : { standX: o.wx(r + side, f + 0.1), standZ: o.wz(r + side, f + 0.1) };
    o.spot('seat', r, f, 0.85, 1.25, { seatX: sx, seatY: o.room.y + seatY - 0.45, seatZ: sz, yaw: o.yaw, ...beside });
  }
}

/** A lightbox: a word on a lit plate, a hand's breadth off the wall. */
function lightbox(o: Obj, region: Region, r: number, y: number, w: number, h: number, f = 0.02): void {
  o.box(r - w / 2 - 0.03, y - 0.03, f, r + w / 2 + 0.03, y + h + 0.03, f + 0.05, DARK, 'flrtb');
  o.decal(region, r, y, f + 0.052, w, h, 1.7);
}

/** A framed poster on a wall. */
function poster(o: Obj, index: number, r: number, y = 1.3, w = 0.92): void {
  const h = w * 1.5;
  const region = o.room.atlas.posters[index % o.room.atlas.posters.length];
  if (!region) return;
  o.box(r - w / 2 - 0.04, y - 0.04, 0.005, r + w / 2 + 0.04, y + h + 0.04, 0.03, DARK, 'flrtb');
  o.decal(region, r, y, 0.032, w, h, 1.0);
  o.room.count('poster');
}

/** The price board: what the shop sells, straight from the item table. */
function board(o: Obj, r: number, y: number, w = 1.9): void {
  const region = o.room.atlas.boards[o.room.site.plan.type];
  o.decal(region, r, y, 0.02, w, (w * 300) / 448, 1.15);
  o.room.count('board');
}

/** A jukebox: a lit arch on a cabinet. The interact spot is its front. */
function jukebox(o: Obj): Spot {
  const body = hex(0x6a1f1a);
  o.box(-0.48, 0, -0.3, 0.48, 1.12, 0.26, body);
  o.box(-0.42, 1.12, -0.3, 0.42, 1.42, 0.24, body);
  o.box(-0.3, 1.42, -0.3, 0.3, 1.58, 0.22, body);
  o.decal(o.room.atlas.jukebox, 0, 0.08, 0.262, 0.92, 1.38, 1.75);
  // Glowing tubes up each side.
  for (const s of [-1, 1]) o.box(s * 0.5 - 0.035, 0.1, 0.2, s * 0.5 + 0.035, 1.1, 0.29, NEONS[s < 0 ? 0 : 1]!, 'fklrt', 2.4);
  o.solid(-0.5, -0.3, 0.5, 0.28, 1.58);
  o.room.count('jukebox');
  return o.spot('jukebox', 0, 0, 1.0, 1.4);
}

/** A drinks machine. `lit` leaves the cabinet to the street's own materials when it stands outside. */
function vendingMachine(o: Obj, outside = false): Spot {
  const body = hex(0xa3142c);
  if (!outside) {
    o.box(-0.5, 0, -0.42, 0.5, 1.98, 0.36, body);
    o.box(-0.5, 0, 0.36, 0.5, 0.06, 0.4, BLACK, 'flrt');
  }
  o.decal(o.room.atlas.vending, 0, 0.06, outside ? 0.372 : 0.362, 0.96, 1.9, outside ? 1.45 : 1.6);
  o.solid(-0.5, -0.42, 0.5, 0.38, 1.98);
  o.room.count('vending');
  return o.spot('vending', 0, 0.1, 0.95, 1.4, { outside });
}

/** An arcade cabinet with a lit screen and a marquee. `game` picks which. */
function cabinet(o: Obj, game: number): void {
  const side = NEONS[game % NEONS.length]!;
  const shellColor = hex(0x1c1a2e);
  o.box(-0.39, 0, -0.42, 0.39, 0.98, 0.3, shellColor);
  // Control deck with a stick and two buttons.
  o.box(-0.39, 0.98, -0.1, 0.39, 1.06, 0.4, hex(0x2b2946), 'fklrt');
  o.cylinder(-0.14, 1.06, 0.18, 0.018, 0.1, CHROME, 1, CHROME, 5);
  o.cylinder(-0.14, 1.15, 0.18, 0.04, 0.04, hex(0xe63946), 1.5, hex(0xe63946), 6);
  o.cylinder(0.1, 1.06, 0.2, 0.035, 0.02, NEONS[2]!, 1.8, NEONS[2]!, 6);
  o.cylinder(0.22, 1.06, 0.16, 0.035, 0.02, NEONS[1]!, 1.8, NEONS[1]!, 6);
  o.box(-0.39, 0.98, -0.42, 0.39, 1.88, -0.02, shellColor);
  o.decal(o.room.atlas.screens[game % o.room.atlas.screens.length]!, 0, 1.14, -0.018, 0.64, 0.56, 2.3);
  o.box(-0.39, 1.7, -0.02, 0.39, 1.92, 0.2, shellColor, 'flrb');
  o.box(-0.39, 1.88, -0.42, 0.39, 1.92, 0.2, shellColor, 't');
  o.decal(o.room.atlas.marquees[game % o.room.atlas.marquees.length]!, 0, 1.71, 0.202, 0.76, 0.2, 2.0);
  // Coloured edging down both sides.
  for (const s of [-1, 1]) o.box(s * 0.39 - 0.012, 0.04, -0.42, s * 0.39 + 0.012, 1.9, 0.3, side, s < 0 ? 'l' : 'r', 1.3);
  o.box(-0.3, 0.2, 0.3, 0.3, 0.62, 0.305, side, 'f', 0.9);
  o.solid(-0.39, -0.42, 0.39, 0.4, 1.92);
  o.room.count('arcade-cabinet');
}

/** A changing booth: three walls, a curtain drawn half back, a mirror and a stool inside. */
function booth(o: Obj, curtain: Color): Spot {
  const wallColor = CREAM;
  const w = 0.66;
  const depth = 1.3;
  o.box(-w - 0.05, 0, -depth, -w, 2.15, 0, wallColor);
  o.box(w, 0, -depth, w + 0.05, 2.15, 0, wallColor);
  o.box(-w, 2.05, -0.06, w, 2.15, 0, WOOD, 'fklrtb');
  // Rail and curtain: one half drawn, bunched at the side.
  o.cylinder(-w + 0.02, 2.0, 0.02, 0.012, 0.01, CHROME);
  o.decal(o.room.atlas.curtain, -w / 2 - 0.03, 0.12, 0.012, w - 0.02, 1.9, 0.95, curtain);
  o.decal(o.room.atlas.curtain, w - 0.14, 0.12, 0.014, 0.26, 1.9, 0.8, curtain);
  o.decal(o.room.atlas.mirror, 0.16, 0.45, -depth + 0.012, 0.56, 1.3, 1.25);
  o.cylinder(-0.28, 0, -depth + 0.34, 0.16, 0.44, WOOD, 1, curtain, 8);
  o.solid(-w - 0.05, -depth, -w, 0, 2.15);
  o.solid(w, -depth, w + 0.05, 0, 2.15);
  o.room.count('changing-booth');
  return o.spot('booth', 0, -0.3, 1.2, 1.5);
}

/** A stack of packing crates, `n` high. */
function crates(o: Obj, n: number, tint: Color, w = 0.9, h = 0.55, depth = 0.7): void {
  const b = o.room.batch;
  const y = o.room.y;
  // The four sides: which way each looks, and how far it is from the middle.
  const sides: [number, number, number, number][] = [
    [o.fx, o.fz, depth / 2, w / 2],
    [-o.fx, -o.fz, depth / 2, w / 2],
    [o.fz, -o.fx, w / 2, depth / 2],
    [-o.fz, o.fx, w / 2, depth / 2],
  ];
  for (let i = 0; i < n; i++) {
    // Stacked a little out of line, as crates are.
    const skew = i % 2 === 0 ? 0 : 0.06;
    const cx = o.wx(skew, 0);
    const cz = o.wz(skew, 0);
    const y0 = y + i * h;
    for (const [nx, nz, out, half] of sides) {
      const mx = cx + nx * out;
      const mz = cz + nz * out;
      // Left to right for someone looking at this side.
      const tx = nz * half;
      const tz = -nx * half;
      b.quad([mx - tx, y0, mz - tz], [mx + tx, y0, mz + tz], [mx + tx, y0 + h, mz + tz], [mx - tx, y0 + h, mz - tz], tint, o.room.atlas.crate, b.shade(nx, 0, nz));
    }
    o.box(skew - w / 2, (i + 1) * h - 0.001, -depth / 2, skew + w / 2, (i + 1) * h, depth / 2, tint, 't');
  }
  o.solid(-w / 2, -depth / 2, w / 2 + 0.06, depth / 2, n * h);
  o.room.count('crate', n);
}

/** Open shelving against a wall with rows of small cartons. */
function shelving(o: Obj, len: number, shelves: number, seed: number, tall = 2.0): void {
  const a = -len / 2;
  const b = len / 2;
  const depth = 0.42;
  for (const r of [a, b - 0.05]) o.box(r, 0, 0, r + 0.05, tall, depth, STEEL);
  o.box(a, 0, 0, b, tall, 0.02, hex(0x3b4252), 'f');
  let s = seed >>> 0;
  const rnd = (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < shelves; i++) {
    const y = 0.25 + (i * (tall - 0.45)) / Math.max(1, shelves - 1);
    o.box(a + 0.05, y - 0.03, 0.02, b - 0.05, y, depth, CHROME, 'flrtb');
    // Cartons in blocks of one colour, as they come out of a case.
    let r = a + 0.12;
    while (r < b - 0.3) {
      const w = 0.16 + rnd() * 0.14;
      const h = 0.14 + rnd() * 0.16;
      const run = 1 + Math.floor(rnd() * 3);
      const color = CARTONS[Math.floor(rnd() * CARTONS.length)]!;
      for (let k = 0; k < run && r + w < b - 0.08; k++) {
        o.box(r, y, 0.08, r + w - 0.015, y + h, depth - 0.05, color, 'flrt');
        r += w;
      }
      r += 0.05 + rnd() * 0.12;
    }
  }
  o.solid(a, 0, b, depth, tall);
  o.room.count('shelving');
}

/** A sign hung from the ceiling on two rods, readable from both sides. */
function hangingSign(o: Obj, region: Region, y: number, w: number, h: number): void {
  for (const s of [-1, 1]) o.box(s * (w / 2 - 0.1) - 0.01, y + h, -0.01, s * (w / 2 - 0.1) + 0.01, o.room.h, 0.01, DARK, 'fklr');
  o.box(-w / 2 - 0.03, y - 0.03, -0.03, w / 2 + 0.03, y + h + 0.03, 0.03, DARK, 'fklrtb');
  o.decal(region, 0, y, 0.032, w, h, 1.7);
  o.flip().decal(region, 0, y, 0.032, w, h, 1.7);
}

// --- the six trades ---

const FURNISH: Record<ShopType, (room: Room) => Furnished> = {
  market,
  ammo,
  pharmacy,
  surf,
  cafe,
  arcade,
};

/** Where the customer stands and where the shopkeeper stands, for a counter object. */
function service(o: Obj, r: number, keeperBack = 1.05, customerOut = 1.05): Furnished {
  return {
    counter: { x: o.wx(r, customerOut), y: o.room.y, z: o.wz(r, customerOut) },
    keeper: { x: o.wx(r, -keeperBack), z: o.wz(r, -keeperBack), yaw: o.yaw },
  };
}

/** A fridge from the kit against a wall, with its drink to take. */
function fridge(o: Obj, lane?: number): void {
  o.kit('shop/freezers-standing', 0, 0, 1.0, 2);
  o.solid(-1.0, 0, 1.0, 1.0, 1.8);
  o.room.count('fridge');
  o.spot('fridge', 0, 0.9, 1.0, 1.5, lane === undefined ? {} : { lane });
}

function market(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;
  const accent = room.site.accent;

  // Fridges along the back wall.
  for (const x of [-2.15, 0, 2.15]) fridge(room.at(x, d, 'out'));
  lightbox(room.at(0, d, 'out'), atlas.signs.cold, 0, 2.3, 2.6, 0.6);

  // Checkout by the door, on the left.
  const desk = room.at(-hw + 1.75, 2.5, 'right');
  const top = counter(desk, 2.5, th, accent);
  till(desk, 0.55, top);
  desk.kit('shop/shopping-basket', -0.8, top, 0, 1.3, 1);
  desk.kit('food/soda-can', -0.2, top, 0.05, 0.9);
  const made = service(desk, 0);
  const leftWall = room.at(-hw, d / 2, 'right');
  board(leftWall, 2.5 - d / 2, 1.55, 1.7);
  lightbox(leftWall, atlas.signs.pay, 2.5 - d / 2, 2.85, 1.5, 0.36);

  // Chest freezers further down the left wall.
  for (const z of [5.5, 7.3]) {
    const o = room.at(-hw + 0.72, z, 'right');
    o.kit('shop/freezer', 0, 0, 0, 2);
    o.solid(-0.8, -0.62, 0.8, 0.62, 0.7);
    room.count('freezer');
  }
  const corner = room.at(-hw + 0.55, 9.3, 'right');
  corner.kit('shop/bottle-return', 0, 0, 0, 1.8);
  corner.solid(-0.42, -0.5, 0.42, 0.4, 1.95);
  room.count('bottle-return');

  // Wall shelves along the right.
  for (const z of [2.75, 4.4, 6.05, 7.7]) {
    const o = room.at(hw, z, 'left');
    o.kit('shop/shelf-end', 0, 0, 0.84, 2);
    o.solid(-0.8, 0, 0.8, 0.84, 2.1);
    room.count('shelf');
  }

  // Gondolas either side of the middle aisle.
  const gondola = (x: number, z: number, model: string): void => {
    const o = room.at(x, z, 'right');
    o.kit(model, 0, 0, 0, 2);
    o.solid(-0.8, -0.7, 0.8, 0.7, 1.6);
    room.count('shelf');
  };
  gondola(2.6, 3.7, 'shop/shelf-boxes');
  gondola(2.6, 5.3, 'shop/shelf-bags');
  gondola(2.6, 6.9, 'shop/shelf-boxes');
  gondola(-2.35, 5.3, 'shop/shelf-bags');
  gondola(-2.35, 6.9, 'shop/shelf-boxes');

  // Fresh produce by the window on the right.
  const fruit = room.at(2.3, 1.15, 'out');
  fruit.kit('shop/display-fruit', 0, 0, 0, 2);
  fruit.solid(-0.6, -0.6, 0.6, 0.6, 1.0);
  const bread = room.at(3.85, 1.15, 'out');
  bread.kit('shop/display-bread', 0, 0, 0, 2);
  bread.solid(-0.7, -0.6, 0.7, 0.6, 1.0);
  const cans = room.at(hw - 0.75, 0.95, 'left');
  cans.kit('shop/display-cans', 0, 0, 0, 1.6);
  cans.solid(-0.64, -0.64, 0.64, 0.64, 1.4);
  room.count('display', 3);
  const fresh = room.at(hw - 2.2, 9.35, 'out');
  fresh.kit('shop/display-flowers', 0, 0, 0, 1.7);
  fresh.solid(-0.68, -0.68, 0.68, 0.68, 0.9);
  room.count('display');

  // Baskets by the door and carts under the left window.
  const baskets = room.at(1.4, 0.45, 'in');
  for (let i = 0; i < 4; i++) baskets.kit('shop/shopping-basket', 0, i * 0.11, 0, 1.4);
  room.count('basket', 4);
  for (const x of [-1.75, -2.5]) {
    room.at(x, 0.75, 'in').kit('shop/shopping-cart', 0, 0, 0, 2.3);
    room.count('cart');
  }
  room.at(-2.12, 0.75, 'in').solid(-0.75, -0.62, 0.75, 0.62, 0.9);
  const truck = room.at(hw - 0.5, 9.75, 'left');
  truck.kit('shop/hand-truck', 0, 0, 0, 2);

  poster(leftWall, th.posters[0]!, 5.5 - d / 2, 1.25);
  poster(leftWall, th.posters[1]!, 7.3 - d / 2, 1.25);
  poster(room.at(hw, 0.95, 'left'), th.posters[2]!, 0, 1.75, 0.8);
  return { ...made, streetMachine: true };
}

function ammo(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;
  const olive = hex(0x6f7f5a);
  const sand = hex(0xd9c79a);

  // The gun counter across the back, with a gap at the left for the shopkeeper.
  const len = hw * 2 - 1.5;
  const desk = room.at(0.75, d - 2.3, 'out');
  const top = counter(desk, len, th, hex(0xc9a227), 1.0);
  till(desk, -1.4, top);
  // Under glass: a lit strip along the top with sidearms and magazines laid out.
  desk.box(-len / 2 + 0.2, top, -0.3, len / 2 - 0.2, top + 0.012, 0.34, hex(0xe9f4ff), 't', 1.25);
  const lay = ['weapons/blaster-b', 'weapons/blaster-c', 'weapons/blaster-h', 'weapons/blaster-k', 'weapons/blaster-i'];
  for (let i = 0; i < 6; i++) {
    const r = -len / 2 + 0.7 + (i * (len - 1.4)) / 5;
    if (Math.abs(r + 1.4) < 0.45) continue;
    desk.kit(lay[i % lay.length]!, r, top + 0.2, 0.02, 0.85, 1);
    desk.kit('weapons/clip-small', r + 0.38, top + 0.012, 0.12, 0.9);
  }
  room.count('display-case');
  const made = service(desk, -0.75, 1.1, 1.05);

  // The rack: long guns on a dark board behind the counter.
  const back = room.at(0, d, 'out');
  const x0 = -hw + 1.6;
  const x1 = hw - 0.5;
  back.box(x0, 1.15, 0.01, x1, 3.05, 0.05, hex(0x2a2f36), 'flrtb');
  const long = ['weapons/blaster-d', 'weapons/blaster-f', 'weapons/blaster-p', 'weapons/blaster-e', 'weapons/blaster-q', 'weapons/blaster-a', 'weapons/blaster-r', 'weapons/blaster-g', 'weapons/blaster-j', 'weapons/blaster-m'];
  let n = 0;
  for (const y of [1.55, 2.25, 2.8]) {
    const step = y > 2.5 ? 1.75 : 1.45;
    for (let x = x0 + 0.8; x < x1 - 0.6; x += step) {
      const model = long[n++ % long.length]!;
      // Laid along the wall, muzzle to the side, on two pegs.
      const offset = model.endsWith('-e') ? -0.6 : 0;
      back.kit(model, x + offset, y, 0.17, 1.0, 1);
      for (const s of [-0.22, 0.22]) back.box(x + s - 0.015, y - 0.16, 0.05, x + s + 0.015, y - 0.13, 0.2, CHROME, 'flrtb');
      room.count('rack-gun');
    }
  }
  room.count('gun-rack');
  // Crates stacked in the corner behind the counter.
  crates(room.at(-hw + 0.6, d - 0.55, 'right'), 3, olive);
  crates(room.at(-hw + 0.6, d - 1.4, 'right'), 2, sand);

  // Ammunition shelves on the left wall, and a price board.
  const leftWall = room.at(-hw, d / 2, 'right');
  shelving(room.at(-hw, 4.5, 'right'), 3.0, 4, room.site.lot.seed);
  board(leftWall, 2.05 - d / 2, 1.45, 1.75);
  // Crates down the right wall, some with open boxes of kit on top.
  const rightWall = room.at(hw, d / 2, 'left');
  let k = 0;
  for (const z of [1.9, 3.0, 4.6, 5.7]) {
    const o = room.at(hw - 0.42, z, 'left');
    const high = 1 + (k % 3);
    crates(o, high, k % 2 === 0 ? olive : sand);
    if (high < 3) o.kit(k % 2 === 0 ? 'weapons/crate-medium' : 'weapons/crate-small', 0, high * 0.55 + 0.04, 0, 0.9, 1);
    k++;
  }
  // Two tables in the open floor with pieces to handle.
  for (const s of [-1, 1]) {
    const t = room.at(s * 2.7, 4.1, 'out');
    t.box(-0.8, 0, -0.4, 0.8, 0.82, 0.4, th.counter);
    t.box(-0.86, 0.82, -0.46, 0.86, 0.87, 0.46, th.counterTop, 'fklrtb');
    t.kit(s < 0 ? 'weapons/blaster-n' : 'weapons/blaster-l', -0.3, 1.06, 0, 0.9, 1);
    t.kit('weapons/crate-small', 0.45, 0.89, 0, 0.6, 1);
    t.solid(-0.86, -0.46, 0.86, 0.46, 0.87);
    room.count('table');
  }
  // A bench under the left window for whoever is waiting.
  const seat = room.at(-hw + 1.7, 0.36, 'in');
  bench(seat, 2.2, olive);
  seats(seat, [-0.6, 0.1, 0.8], 0.48);

  // Paper targets and posters.
  rightWall.decal(atlas.target, d / 2 - 7.3, 1.7, 0.02, 0.8, 0.8, 1.0);
  rightWall.decal(atlas.target, d / 2 - 8.4, 1.55, 0.02, 0.8, 0.8, 1.0);
  poster(rightWall, th.posters[0]!, d / 2 - 0.9, 1.5, 0.84);
  poster(leftWall, th.posters[1]!, 6.9 - d / 2, 1.35);
  poster(leftWall, th.posters[2]!, 0.95 - d / 2, 2.15, 0.7);
  return { ...made, streetMachine: true };
}

function pharmacy(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;
  const accent = room.site.accent;

  // Dispensary counter across the back.
  const len = hw * 2 - 2.2;
  const desk = room.at(0, d - 2.45, 'out');
  const top = counter(desk, len, th, GREEN);
  till(desk, 1.0, top);
  desk.kit('shop/display-small', -len / 2 + 0.5, top, 0.05, 0.9);
  const made = service(desk, 0, 1.15, 1.05);
  // Medicine shelves along the back wall, with the shop's cross above them.
  const back = room.at(0, d, 'out');
  const units = Math.max(2, Math.floor((hw * 2 - 0.3) / 1.64));
  for (let i = 0; i < units; i++) {
    const r = (i - (units - 1) / 2) * 1.64;
    back.kit('shop/shelf-end', r, 0, 0.84, 2);
    room.count('shelf');
  }
  back.solid(-(units * 1.64) / 2, 0, (units * 1.64) / 2, 0.84, 2.1);
  back.decal(atlas.cross, 0, 2.3, 0.03, 1.25, 1.25, 2.0);
  lightbox(back, atlas.signs.rx, -hw + 1.5, 2.6, 1.7, 0.4);

  // Shelves down the left wall.
  for (const z of [1.75, 3.4, 5.05]) {
    const o = room.at(-hw, z, 'right');
    o.kit('shop/shelf-end', 0, 0, 0.84, 2);
    o.solid(-0.8, 0, 0.8, 0.84, 2.1);
    room.count('shelf');
  }
  // Right wall: a drinks machine, then a fridge of cold drinks.
  vendingMachine(room.at(hw - 0.44, 3.0, 'left'));
  const cold = room.at(hw, 5.2, 'left');
  fridge(cold);
  lightbox(cold, atlas.signs.cold, 0, 2.05, 1.7, 0.4);
  // Waiting chairs with their backs to the right window.
  for (const x of [1.75, 2.45, 3.15]) {
    if (x > hw - 0.45) continue;
    const c = room.at(x, 0.42, 'in');
    chair(c, accent.clone().lerp(WHITE, 0.2));
    seats(c, [0], 0.48);
  }
  // The cross again in the left window, for the street.
  room.at(-hw + 1.3, -0.07, 'out').decal(atlas.cross, 0, 0.95, 0, 1.0, 1.0, 2.2);

  poster(room.at(-hw, d - 1.35, 'right'), th.posters[0]!, 0, 1.3, 0.86);
  poster(room.at(hw, d - 1.35, 'left'), th.posters[1]!, 0, 1.3, 0.86);
  poster(room.at(-hw, 3.4, 'right'), th.posters[2]!, 0, 2.3, 0.62);
  return made;
}

function surf(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;
  const accent = room.site.accent;
  const aqua = hex(0x19b8d4);

  // Counter at the back on the right.
  const desk = room.at(hw - 2.3, d - 2.3, 'out');
  const top = counter(desk, 3.2, th, aqua);
  till(desk, 0.9, top);
  desk.kit('shop/display-small', -1.1, top, 0, 0.8);
  const made = service(desk, 0, 1.1, 1.05);
  const back = room.at(0, d, 'out');
  // Folded shirts on shelves behind the counter, under the price board.
  shelving(room.at(hw - 2.3, d, 'out'), 3.0, 2, room.site.lot.seed + 3, 1.1);
  board(back, hw - 2.3, 1.5, 1.8);

  // Two fitting rooms at the back on the left.
  const curtain = accent.clone().lerp(WHITE, 0.15);
  for (const x of [-hw + 0.85, -hw + 2.35]) booth(room.at(x, d - 1.32, 'out'), curtain);
  // Their back walls are the shop's back wall; a sign hangs over the pair.
  lightbox(room.at(-hw + 1.6, d - 1.32, 'out'), atlas.signs.fitting, 0, 2.3, 2.0, 0.44, 0.0);
  // Boards racked upright between the fitting rooms and the counter.
  const rackX0 = -hw + 3.6;
  const rackX1 = hw - 4.3;
  back.box(rackX0, 0, 0.02, rackX1, 0.12, 0.5, WOOD);
  back.box(rackX0, 1.3, 0.02, rackX1, 1.36, 0.16, WOOD, 'flrtb');
  const count = Math.max(2, Math.floor((rackX1 - rackX0) / 0.62));
  for (let i = 0; i < count; i++) {
    const x = rackX0 + 0.35 + (i * (rackX1 - rackX0 - 0.7)) / Math.max(1, count - 1);
    back.decal(atlas.boardsSurf[i % atlas.boardsSurf.length]!, x, 0.12, 0.2 + (i % 2) * 0.05, 0.56, 2.3, 1.05);
    room.count('surfboard');
  }
  lightbox(back, atlas.signs.boards, (rackX0 + rackX1) / 2, 2.75, Math.min(2.6, rackX1 - rackX0), 0.46);

  // Left wall: two more boards, a bench under the posters.
  const leftWall = room.at(-hw, d / 2, 'right');
  leftWall.decal(atlas.boardsSurf[1]!, 1.5 - d / 2, 0.02, 0.05, 0.56, 2.3, 1.05);
  leftWall.decal(atlas.boardsSurf[3]!, 2.2 - d / 2, 0.02, 0.07, 0.56, 2.3, 1.05);
  room.count('surfboard', 2);
  const seat = room.at(-hw + 0.3, 5.6, 'right');
  bench(seat, 2.4, WOOD);
  seats(seat, [-0.75, 0, 0.75], 0.48);
  poster(leftWall, th.posters[0]!, 4.95 - d / 2, 1.45, 0.9);
  poster(leftWall, th.posters[1]!, 6.25 - d / 2, 1.45, 0.9);

  // Racks and tables on the floor, clear of the middle aisle.
  const rack = (x: number, z: number, dir: Dir): void => {
    const o = room.at(x, z, dir);
    o.kit('shop/clothing-rack', 0, 0, 0, 2);
    // As deep as the clothes hang, so the camera stays out of them.
    o.solid(-0.8, -0.45, 0.8, 0.45, 1.6);
    room.count('clothing-rack');
  };
  rack(-2.6, 3.3, 'out');
  rack(-2.6, 7.3, 'out');
  rack(2.6, 3.2, 'out');
  rack(2.6, 6.0, 'out');
  for (const x of [-2.6, 2.6]) {
    const o = room.at(x, 1.35, 'out');
    o.kit('shop/clothing-table', 0, 0, 0, 2);
    o.solid(-0.88, -0.58, 0.88, 0.58, 0.9);
    room.count('clothing-table');
  }
  // Mannequins in the window, facing the street.
  for (const x of [-hw + 0.85, hw - 0.85, hw - 2.1]) {
    const o = room.at(x, 0.5, 'out');
    o.kit('shop/mannequin', 0, 0, 0, 2.2);
    o.post(0, 0, 0.3, 1.5);
    room.count('mannequin');
  }
  // A fridge of drinks on the right wall.
  const cold = room.at(hw, 4.6, 'left');
  fridge(cold);
  lightbox(cold, atlas.signs.cold, 0, 2.05, 1.7, 0.4);
  poster(room.at(hw, 6.6, 'left'), th.posters[2]!, 0, 1.4, 0.86);
  return { ...made, streetMachine: true };
}

function cafe(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;
  const accent = room.site.accent;
  const seatColor = hex(0xe63946);

  // The bar: from left of the door line to the right wall.
  const x0 = -2.1;
  const x1 = hw - 0.55;
  const len = x1 - x0;
  const mid = (x0 + x1) / 2;
  const bar = room.at(mid, d - 2.55, 'out');
  const R = (x: number): number => x - mid;
  const top = counter(bar, len, th, accent, 1.08);
  till(bar, R(-1.45), top);
  // Pastries under a cover, and cups ready to go.
  bar.kit('food/plate', R(-0.3), top, 0, 0.55);
  bar.kit('food/croissant', R(-0.3), top + 0.04, 0, 0.75);
  bar.kit('food/plate', R(0.35), top, 0.02, 0.55);
  bar.kit('food/donut-sprinkles', R(0.35), top + 0.04, 0.02, 0.9);
  bar.kit('food/cake', R(4.6), top, 0, 0.6);
  for (const x of [1.4, 2.4, 3.4]) bar.kit('food/cup-coffee', R(x), top, 0.12, 0.8);
  room.count('pastry', 3);
  // Four stools along the customer side.
  for (const x of [0.9, 1.9, 2.9, 3.9]) {
    if (x > x1 - 0.5) continue;
    const [sx, sy, sz] = stool(bar, R(x), 0.82, seatColor, 0.78);
    bar.spot('seat', R(x), 0.82, 0.85, 1.25, { seatX: sx + bar.fx * -0.22, seatY: sy - 0.45, seatZ: sz + bar.fz * -0.22, yaw: bar.flip().yaw });
  }
  const made = service(bar, R(-0.75), 1.2, 1.15);
  lightbox(room.at(-0.75, d - 2.55, 'out'), atlas.signs.order, 0, 2.55, 1.5, 0.36, -2.52);

  // Back counter with the coffee machine, and the menu above it.
  const back = room.at(0, d, 'out');
  const bx0 = -1.9;
  const bx1 = hw - 0.25;
  back.box(bx0, 0, 0.02, bx1, 0.9, 0.62, th.counter);
  back.box(bx0, 0.9, 0.02, bx1, 0.95, 0.66, th.counterTop, 'flrtb');
  back.box(0.1, 0.95, 0.1, 1.0, 1.45, 0.56, CHROME);
  back.decal(atlas.espresso, 0.55, 0.96, 0.562, 0.88, 0.48, 1.2);
  for (const x of [1.6, 1.9, 2.2]) back.kit('food/soda-bottle', x, 0.95, 0.35, 0.85);
  for (const x of [3.0, 3.3]) back.kit('food/wine-red', x, 0.95, 0.35, 0.8);
  back.kit('food/pineapple', 4.1, 0.95, 0.35, 1.0);
  room.count('coffee-machine');
  board(back, 2.6, 1.75, 2.1);
  // A fridge in the back corner on the left.
  const cold = room.at(-hw + 1.1, d, 'out');
  // Behind the line of the bar: walk up to the bar, then round its end.
  fridge(cold, d - 3.6);
  lightbox(cold, atlas.signs.cold, 0, 2.05, 1.7, 0.4);

  // Jukebox on the left wall.
  jukebox(room.at(-hw + 0.32, 4.7, 'right'));

  // Tables by the windows and along the right.
  const setTable = (x: number, z: number, cup: boolean): void => {
    const t = room.at(x, z, 'out');
    table(t, CREAM);
    if (cup) {
      t.kit('food/cup-coffee', -0.14, 0.76, 0.05, 0.7);
      t.kit('food/croissant', 0.16, 0.76, -0.06, 0.55);
    } else t.kit('food/cocktail', 0.1, 0.76, 0, 0.6);
    for (const s of [-1, 1]) {
      const c = room.at(x + s * 0.74, z, s < 0 ? 'right' : 'left');
      chair(c, seatColor);
      // The table is in front of the chair, so it is taken from the side away from the window.
      seats(c, [0], 0.48, 0, s < 0 ? 0.8 : -0.8);
    }
  };
  setTable(-3.35, 1.55, true);
  setTable(3.35, 1.55, false);
  setTable(3.35, 3.9, true);

  const leftWall = room.at(-hw, d / 2, 'right');
  poster(leftWall, th.posters[0]!, 2.6 - d / 2, 1.35);
  poster(leftWall, th.posters[1]!, 6.7 - d / 2, 1.35);
  const rightWall = room.at(hw, d / 2, 'left');
  poster(rightWall, th.posters[2]!, d / 2 - 2.7, 1.45, 0.86);
  rightWall.decal(atlas.clock, d / 2 - 5.2, 2.2, 0.02, 0.5, 0.5, 1.0);
  return made;
}

function arcade(room: Room): Furnished {
  const { hw, d, theme: th, atlas } = room;

  // Prize counter at the back.
  const len = hw * 2 - 3.2;
  const desk = room.at(0, d - 2.25, 'out');
  const top = counter(desk, len, th, NEONS[1]!);
  till(desk, 1.2, top);
  desk.kit('shop/gacha-machine', -len / 2 + 0.5, top, 0, 0.8);
  const made = service(desk, 0, 1.1, 1.05);
  const back = room.at(0, d, 'out');
  shelving(back, Math.min(5.2, hw * 2 - 3.4), 3, room.site.lot.seed + 9, 1.7);
  lightbox(back, atlas.signs.prizes, 0, 2.5, 2.4, 0.5);
  board(back, hw - 1.35, 1.35, 1.7);

  // Cabinets down both walls, a drinks machine and a jukebox near the door.
  let game = 0;
  const stoolColor = NEONS[0]!;
  const play = (x: number, z: number, dir: Dir, withStool: boolean): void => {
    const o = room.at(x, z, dir);
    cabinet(o, game++);
    if (withStool) {
      const [sx, sy, sz] = stool(o, 0, 1.0, stoolColor, 0.62);
      o.spot('seat', 0, 1.0, 0.8, 1.2, { seatX: sx + o.fx * -0.22, seatY: sy - 0.45, seatZ: sz + o.fz * -0.22, yaw: o.flip().yaw });
    }
  };
  for (const [i, z] of [2.7, 3.9, 5.1, 6.3].entries()) play(-hw + 0.44, z, 'right', i % 2 === 0);
  for (const [i, z] of [3.9, 5.1, 6.3].entries()) play(hw - 0.44, z, 'left', i === 1);
  vendingMachine(room.at(hw - 0.44, 2.45, 'left'));
  jukebox(room.at(hw - 0.32, 0.95, 'left'));
  // Two pairs back to back in the open floor, either side of the middle aisle.
  for (const s of [-1, 1]) {
    play(s * 2.75 - 0.43, 4.5, 'left', false);
    play(s * 2.75 + 0.43, 4.5, 'right', false);
  }

  // Gacha machines under the left window.
  for (const x of [-hw + 0.75, -hw + 1.75, -hw + 2.75]) {
    const o = room.at(x, 0.55, 'in');
    o.kit('shop/gacha-machine', 0, 0, 0, 2, 0, 1.25);
    o.solid(-0.44, -0.44, 0.44, 0.44, 1.95);
    o.spot('gacha', 0, 0, 1.0, 1.4);
    room.count('gacha-machine');
  }
  hangingSign(room.at(-hw + 1.75, 1.0, 'in'), atlas.signs.gacha, 2.45, 1.9, 0.44);

  // Neon runs round the walls, and the posters.
  const leftWall = room.at(-hw, d / 2, 'right');
  const rightWall = room.at(hw, d / 2, 'left');
  for (const [o, w, color] of [
    [leftWall, d, NEONS[0]!],
    [rightWall, d, NEONS[1]!],
    [back, hw * 2, NEONS[3]!],
  ] as const) {
    o.box(-w / 2 + 0.2, 2.86, 0.01, w / 2 - 0.2, 2.92, 0.05, color, 'ftb', 2.6);
    o.box(-w / 2 + 0.2, 0.13, 0.01, w / 2 - 0.2, 0.17, 0.04, color, 'ftb', 1.8);
  }
  poster(leftWall, th.posters[0]!, 7.9 - d / 2, 1.3, 0.9);
  poster(rightWall, th.posters[1]!, d / 2 - 7.9, 1.3, 0.9);
  poster(leftWall, th.posters[2]!, 1.35 - d / 2, 2.15, 0.5);
  return made;
}

/**
 * A drinks machine on the sidewalk beside the shopfront, against a part of the facade that has no
 * glass. Only its lit front is drawn here; the cabinet is drawn with the street's own materials.
 */
function sidewalkMachine(room: Room, free: (x: number, z: number) => boolean): Interior['streetMachine'] {
  const site = room.site;
  const p = site.plan;
  const f = site.frame;
  // Whichever side of the glass has more wall, away from a corner drum.
  const leftRoom = p.g0;
  const rightRoom = f.W - p.g1;
  const leftDrum = site.lot.cornerSide !== undefined && p.bay0 <= 2;
  const rightDrum = site.lot.cornerSide !== undefined && p.bays - p.bay1 <= 2;
  const sides: number[] = [];
  const left = leftRoom >= 1.6 && !leftDrum;
  const right = rightRoom >= 1.6 && !rightDrum;
  if (left && (leftRoom >= rightRoom || !right)) sides.push(p.g0 - 0.85);
  if (right) sides.push(p.g1 + 0.85);
  if (left && !sides.includes(p.g0 - 0.85)) sides.push(p.g0 - 0.85);
  // Facing the street, its back 6 cm off the wall. Not where something already stands.
  const u = sides.find((v) => free(f.x(v, -0.48), f.z(v, -0.48)));
  if (u === undefined) return null;
  const x = f.x(u, -0.48);
  const z = f.z(u, -0.48);
  const o = new Obj(room, x, z, f.outX, f.outZ);
  vendingMachine(o, true);
  return { x, z, fx: f.outX, fz: f.outZ };
}
