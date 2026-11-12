import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Matrix4, type Mesh, MeshStandardMaterial, type Object3D, SRGBColorSpace, type Texture, Vector3 } from 'three';
import type { ModelAsset } from '../core/assets';

/**
 * Turns the car models in `models/vehicles.glb` into what a `Car` needs: geometry split into paint,
 * trim, glass and lamps, wheel positions, collision boxes, seats and the numbers that make each model
 * drive differently.
 *
 * The source models are toy-sized and face +Z. Here they are turned to face -Z (the game's forward),
 * stretched to the size of a real car next to a 1.75 m person, and their origin is put on the road
 * under the middle of the car.
 */

export type CarModel = 'sedan' | 'sedan-sports' | 'suv' | 'suv-luxury' | 'taxi' | 'police' | 'hatchback-sports' | 'van' | 'truck' | 'delivery';

export const CAR_MODELS: readonly CarModel[] = ['sedan', 'sedan-sports', 'suv', 'suv-luxury', 'taxi', 'police', 'hatchback-sports', 'van', 'truck', 'delivery'];

export type DriveLayout = 'fwd' | 'rwd' | 'awd';

export interface CarSpec {
  model: CarModel;
  /** Name shown in the prompt: "Drive Marlin GT". Invented, not a real make. */
  name: string;
  /** Kilograms. */
  mass: number;
  /** Peak engine power at the wheels, kW. */
  power: number;
  /** Road speed at the rev limit in first gear, m/s. Lower means a harder launch. */
  firstGear: number;
  /** Top speed on the flat, m/s. Aerodynamic drag is worked out from it. */
  topSpeed: number;
  drive: DriveLayout;
  /** Tyre grip coefficient on dry asphalt. */
  grip: number;
  /** Suspension natural frequency in Hz: higher is stiffer. */
  ride: number;
  /** Height of the centre of mass above the road, metres. */
  comHeight: number;
  health: number;
  /** How far the seats lean back, radians. Low cars need more to keep heads under the roof. */
  recline: number;
  /** Rows of seats: 1 seats two people, 2 seats four. */
  rows: 1 | 2;
  /** Move the front seats along the car, metres (positive is toward the tail). */
  seatShift: number;
  /** Paint colours this model comes in. Empty means it keeps the colours it was drawn with. */
  paints: readonly number[];
}

const BRIGHT = [0xe5443a, 0xf29a2e, 0x25b8a8, 0x2f7fd0, 0xff6fa8, 0x69c97b, 0xf2efe6, 0x8e5bd9] as const;
const SOBER = [0xf2efe6, 0x9aa3ad, 0x2b2f36, 0x1c2a4a, 0x7a1f2b, 0x2f7fd0, 0x25b8a8, 0xc9b28a] as const;
const WORK = [0xf2efe6, 0x2f7fd0, 0xe5443a, 0x9aa3ad, 0xf29a2e, 0x3f8f5a] as const;

export const CAR_SPECS: Record<CarModel, CarSpec> = {
  sedan: { model: 'sedan', name: 'Brisa', mass: 1350, power: 92, firstGear: 17, topSpeed: 43, drive: 'fwd', grip: 1.0, ride: 1.9, comHeight: 0.5, health: 100, recline: 0.2, rows: 2, seatShift: 0, paints: SOBER },
  'sedan-sports': { model: 'sedan-sports', name: 'Marlin GT', mass: 1250, power: 150, firstGear: 20, topSpeed: 56, drive: 'rwd', grip: 1.14, ride: 2.3, comHeight: 0.42, health: 90, recline: 0.5, rows: 1, seatShift: 0, paints: BRIGHT },
  suv: { model: 'suv', name: 'Cayo 4x4', mass: 1750, power: 105, firstGear: 15, topSpeed: 40, drive: 'awd', grip: 0.98, ride: 1.7, comHeight: 0.58, health: 135, recline: 0.2, rows: 2, seatShift: 0, paints: SOBER },
  'suv-luxury': { model: 'suv-luxury', name: 'Solana LX', mass: 1900, power: 150, firstGear: 17, topSpeed: 47, drive: 'awd', grip: 1.02, ride: 1.75, comHeight: 0.56, health: 140, recline: 0.2, rows: 2, seatShift: 0, paints: SOBER },
  taxi: { model: 'taxi', name: 'Bay Cab', mass: 1450, power: 95, firstGear: 16, topSpeed: 41, drive: 'rwd', grip: 0.98, ride: 1.8, comHeight: 0.52, health: 110, recline: 0.2, rows: 2, seatShift: 0, paints: [0xf6c12c] },
  police: { model: 'police', name: 'Patrol Cruiser', mass: 1550, power: 165, firstGear: 19, topSpeed: 52, drive: 'rwd', grip: 1.08, ride: 2.1, comHeight: 0.5, health: 140, recline: 0.2, rows: 2, seatShift: 0, paints: [] },
  'hatchback-sports': { model: 'hatchback-sports', name: 'Pica RS', mass: 1150, power: 118, firstGear: 18, topSpeed: 50, drive: 'fwd', grip: 1.1, ride: 2.2, comHeight: 0.44, health: 85, recline: 0.5, rows: 1, seatShift: 0, paints: BRIGHT },
  van: { model: 'van', name: 'Carga Van', mass: 1900, power: 88, firstGear: 13, topSpeed: 36, drive: 'rwd', grip: 0.92, ride: 1.7, comHeight: 0.62, health: 140, recline: 0.14, rows: 2, seatShift: 0, paints: WORK },
  truck: { model: 'truck', name: 'Ranchera', mass: 2000, power: 110, firstGear: 13, topSpeed: 38, drive: 'rwd', grip: 0.94, ride: 1.75, comHeight: 0.6, health: 150, recline: 0.16, rows: 1, seatShift: 0, paints: WORK },
  delivery: { model: 'delivery', name: 'Reparto Box Truck', mass: 3000, power: 112, firstGear: 11, topSpeed: 31, drive: 'rwd', grip: 0.9, ride: 1.6, comHeight: 0.8, health: 200, recline: 0.1, rows: 1, seatShift: 0, paints: WORK },
};

/** A wheel at rest, in vehicle space (origin on the road under the car, forward is -Z). */
export interface WheelDef {
  x: number;
  y: number;
  z: number;
  radius: number;
  front: boolean;
  left: boolean;
}

/** A collision box in vehicle space. */
export interface BoxDef {
  cx: number;
  cy: number;
  cz: number;
  hx: number;
  hy: number;
  hz: number;
}

export interface SeatSpot {
  /** Floor point under the occupant's feet, vehicle space. */
  x: number;
  y: number;
  z: number;
  recline: number;
  driver: boolean;
  /** Where the hips end up, for the exit point. */
  hipZ: number;
}

export interface CarKit {
  spec: CarSpec;
  /** Body with material groups in the order of `BODY_GROUPS`. */
  body: BufferGeometry;
  /** The same vertices in two groups (paint, everything else), for cars far away. */
  bodyFar: BufferGeometry;
  wheelLeft: BufferGeometry;
  wheelRight: BufferGeometry;
  /** Front left, front right, rear left, rear right. */
  wheels: WheelDef[];
  lower: BoxDef;
  upper: BoxDef;
  width: number;
  length: number;
  height: number;
  /** Front and rear ends along Z (front is negative). */
  front: number;
  rear: number;
  /** Bottom of the windows. */
  belt: number;
  seats: SeatSpot[];
}

export const BODY_GROUPS = ['paint', 'trim', 'glass', 'head', 'tail'] as const;
type BodyGroup = (typeof BODY_GROUPS)[number];

/** Stretch applied to the toy-sized models: wider, taller and a good deal longer. */
const SX = 1.3;
const SY = 1.25;
const SZ = 1.6;
/** Ground clearance of the collision box. Higher than a kerb, so only the wheels meet it. */
export const CLEARANCE = 0.34;
/** Lowest the soles of someone seated may be: just inside the bottom of the body. */
const FOOT_WELL = 0.3;

interface Palette {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}

/** The models take their colours from one small palette image. Read its pixels once. */
function readPalette(asset: ModelAsset): Palette {
  let tex: Texture | null = null;
  asset.scene.traverse((o) => {
    const m = (o as Mesh).material as MeshStandardMaterial | undefined;
    if (!tex && m && !Array.isArray(m) && m.map) tex = m.map;
  });
  if (!tex) throw new Error('vehicles.glb has no colour map');
  const img = (tex as Texture).image as CanvasImageSource & { width: number; height: number };
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, cv.width, cv.height).data, w: cv.width, h: cv.height };
}

const _c = new Color();

/** Palette colour at a texture coordinate, in linear light. */
function sample(p: Palette, u: number, v: number, out: Color): Color {
  const x = Math.min(p.w - 1, Math.max(0, Math.floor(u * p.w)));
  const y = Math.min(p.h - 1, Math.max(0, Math.floor(v * p.h)));
  const k = (y * p.w + x) * 4;
  return out.setRGB(p.data[k]! / 255, p.data[k + 1]! / 255, p.data[k + 2]! / 255, SRGBColorSpace);
}

function luma(c: Color): number {
  return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
}

const ROAD_WHEEL = /^wheel-(front|back)-(left|right)/;
const GLASS_TINT = new Color(0x1a2a33);

interface Soup {
  pos: number[];
  nor: number[];
  col: number[];
}

function soup(): Soup {
  return { pos: [], nor: [], col: [] };
}

/**
 * Everything a car of one model shares. Built once per model.
 *
 * The palette image is a grid of 8 by 4 colour cells, and a face says what it is by the cell it
 * points into: the window cell, the headlamp cell, the tail lamp cell, a paint cell, or the greys and
 * blacks of bumpers and tyres. That is how the body is split into materials.
 */
export function buildCarKit(asset: ModelAsset, model: CarModel, palette: Palette = readPalette(asset)): CarKit {
  const spec = CAR_SPECS[model];
  const root = asset.scene.getObjectByName(model);
  if (!root) throw new Error(`vehicles.glb has no ${model}`);
  root.updateWorldMatrix(true, true);
  const toRoot = new Matrix4().copy(root.matrixWorld).invert();
  const m = new Matrix4();
  const v = new Vector3();
  const n = new Vector3();
  const flat = new Color();

  const groups: Record<BodyGroup, Soup> = { paint: soup(), trim: soup(), glass: soup(), head: soup(), tail: soup() };
  const wheelSoup: Record<'left' | 'right', Soup | null> = { left: null, right: null };
  const wheels: WheelDef[] = [];

  // First pass over the body to learn where the windows start, which tells lamps from roof lights.
  let belt = Infinity;
  const bodyMeshes: Mesh[] = [];
  root.traverse((o: Object3D) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    if (ROAD_WHEEL.test(mesh.name)) return;
    bodyMeshes.push(mesh);
    const uv = mesh.geometry.getAttribute('uv');
    const pos = mesh.geometry.getAttribute('position');
    m.multiplyMatrices(toRoot, mesh.matrixWorld);
    for (let i = 0; i < pos.count; i++) {
      if (Math.floor(uv.getX(i) * 8) !== 0 || Math.floor(uv.getY(i) * 4) !== 3) continue;
      v.fromBufferAttribute(pos, i).applyMatrix4(m);
      belt = Math.min(belt, v.y * SY);
    }
  });
  if (!Number.isFinite(belt)) belt = 0.95;

  for (const mesh of bodyMeshes) {
    const g = mesh.geometry;
    const pos = g.getAttribute('position');
    const nor = g.getAttribute('normal');
    const uv = g.getAttribute('uv');
    const index = g.getIndex();
    const count = index ? index.count : pos.count;
    m.multiplyMatrices(toRoot, mesh.matrixWorld);
    for (let t = 0; t < count; t += 3) {
      const a = index ? index.getX(t) : t;
      const col = Math.floor(uv.getX(a) * 8);
      const row = Math.floor(uv.getY(a) * 4);
      v.fromBufferAttribute(pos, a).applyMatrix4(m);
      const low = v.y * SY < belt - 0.02;
      let kind: BodyGroup = 'trim';
      if (row === 3 && col === 0) kind = 'glass';
      else if (row === 3 && col === 1 && low) kind = 'head';
      else if (row === 3 && col === 2 && low) kind = 'tail';
      else if (row === 1 && spec.paints.length > 0) kind = 'paint';
      const out = groups[kind];
      // The flat half of the cell is the colour itself; the other half is the same colour shaded.
      sample(palette, (col + 0.25) / 8, (row + 0.5) / 4, flat);
      for (let k = 0; k < 3; k++) {
        const i = index ? index.getX(t + k) : t + k;
        v.fromBufferAttribute(pos, i).applyMatrix4(m);
        n.fromBufferAttribute(nor, i).transformDirection(m);
        // Half a turn about Y, then the stretch. Normals take the inverse stretch.
        out.pos.push(-v.x * SX, v.y * SY, -v.z * SZ);
        n.set(-n.x / SX, n.y / SY, -n.z / SZ).normalize();
        out.nor.push(n.x, n.y, n.z);
        sample(palette, uv.getX(i), uv.getY(i), _c);
        if (kind === 'paint') {
          // Paint keeps only the shading, so the material can give it any colour.
          const shade = Math.min(1.12, Math.max(0.5, luma(_c) / Math.max(1e-4, luma(flat))));
          out.col.push(shade, shade, shade);
        } else if (kind === 'glass') {
          out.col.push(GLASS_TINT.r, GLASS_TINT.g, GLASS_TINT.b);
        } else {
          out.col.push(_c.r, _c.g, _c.b);
        }
      }
    }
  }

  // Road wheels: where they sit, and one left and one right wheel to draw at all four corners.
  root.traverse((o: Object3D) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const match = ROAD_WHEEL.exec(mesh.name);
    if (!match) return;
    v.setFromMatrixPosition(m.multiplyMatrices(toRoot, mesh.matrixWorld));
    const left = match[2] === 'left';
    const front = match[1] === 'front';
    wheels.push({ x: -v.x * SX, y: v.y * SY, z: -v.z * SZ, radius: 0.3 * SY, front, left });
    const side = left ? 'left' : 'right';
    if (wheelSoup[side]) return;
    const out = soup();
    const g = mesh.geometry;
    const pos = g.getAttribute('position');
    const nor = g.getAttribute('normal');
    const uv = g.getAttribute('uv');
    const index = g.getIndex();
    const count = index ? index.count : pos.count;
    for (let t = 0; t < count; t++) {
      const i = index ? index.getX(t) : t;
      // A wheel is stretched the same up and along, so it stays round.
      out.pos.push(-pos.getX(i) * SX, pos.getY(i) * SY, -pos.getZ(i) * SY);
      n.set(-nor.getX(i) / SX, nor.getY(i) / SY, -nor.getZ(i) / SY).normalize();
      out.nor.push(n.x, n.y, n.z);
      sample(palette, uv.getX(i), uv.getY(i), _c);
      out.col.push(_c.r, _c.g, _c.b);
    }
    wheelSoup[side] = out;
  });
  if (wheels.length !== 4 || !wheelSoup.left || !wheelSoup.right) throw new Error(`${model} does not have four wheels`);
  // Front left, front right, rear left, rear right. After the half turn, left is -X and front is -Z.
  wheels.sort((a, b) => Number(b.front) - Number(a.front) || Number(b.left) - Number(a.left));

  // One geometry, one group per material.
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const body = new BufferGeometry();
  const bodyFar = new BufferGeometry();
  let start = 0;
  BODY_GROUPS.forEach((name, i) => {
    const s = groups[name];
    for (const x of s.pos) pos.push(x);
    for (const x of s.nor) nor.push(x);
    for (const x of s.col) col.push(x);
    const count = s.pos.length / 3;
    if (count > 0) body.addGroup(start, count, i);
    start += count;
  });
  const paintCount = groups.paint.pos.length / 3;
  body.setAttribute('position', new Float32BufferAttribute(pos, 3));
  body.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  body.setAttribute('color', new Float32BufferAttribute(col, 3));
  body.computeBoundingBox();
  body.computeBoundingSphere();
  for (const name of ['position', 'normal', 'color'] as const) bodyFar.setAttribute(name, body.getAttribute(name));
  if (paintCount > 0) bodyFar.addGroup(0, paintCount, 0);
  bodyFar.addGroup(paintCount, start - paintCount, 1);
  bodyFar.boundingBox = body.boundingBox;
  bodyFar.boundingSphere = body.boundingSphere;

  const wheelGeometry = (s: Soup): BufferGeometry => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(s.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(s.nor, 3));
    g.setAttribute('color', new Float32BufferAttribute(s.col, 3));
    g.computeBoundingSphere();
    return g;
  };

  // Collision boxes: the body up to the windows, and whatever stands above that (cabin, cargo box).
  const lo = { x: 0, z0: Infinity, z1: -Infinity };
  const hi = { x: 0, z0: Infinity, z1: -Infinity, top: 0 };
  let front = Infinity;
  let rear = -Infinity;
  let width = 0;
  let top = 0;
  for (let i = 0; i < pos.length; i += 3) {
    const x = Math.abs(pos[i]!);
    const y = pos[i + 1]!;
    const z = pos[i + 2]!;
    front = Math.min(front, z);
    rear = Math.max(rear, z);
    width = Math.max(width, x);
    top = Math.max(top, y);
    if (y > belt + 0.05) {
      hi.x = Math.max(hi.x, x);
      hi.z0 = Math.min(hi.z0, z);
      hi.z1 = Math.max(hi.z1, z);
    } else {
      lo.x = Math.max(lo.x, x);
      lo.z0 = Math.min(lo.z0, z);
      lo.z1 = Math.max(lo.z1, z);
    }
  }
  const lower: BoxDef = { cx: 0, cy: (CLEARANCE + belt) / 2, cz: (lo.z0 + lo.z1) / 2, hx: lo.x - 0.02, hy: (belt - CLEARANCE) / 2, hz: (lo.z1 - lo.z0) / 2 - 0.03 };
  const upper: BoxDef = { cx: 0, cy: (belt + top) / 2, cz: (hi.z0 + hi.z1) / 2, hx: hi.x - 0.02, hy: (top - belt) / 2, hz: (hi.z1 - hi.z0) / 2 - 0.04 };

  // Seats. The cabin is where the glass is; people sit with their heads just behind the top of the windscreen.
  let gz0 = Infinity;
  let gz1 = -Infinity;
  let gx = 0;
  let glassTop = 0;
  const gp = groups.glass.pos;
  for (let i = 0; i < gp.length; i += 3) {
    gx = Math.max(gx, Math.abs(gp[i]!));
    glassTop = Math.max(glassTop, gp[i + 1]!);
    gz0 = Math.min(gz0, gp[i + 2]!);
    gz1 = Math.max(gz1, gp[i + 2]!);
  }
  // Where the windscreen meets the roof: the foremost glass near the top of the front half of the
  // glass (a tailgate window can stand taller than the windscreen).
  const gMid = (gz0 + gz1) / 2;
  let frontTop = 0;
  for (let i = 0; i < gp.length; i += 3) if (gp[i + 2]! < gMid) frontTop = Math.max(frontTop, gp[i + 1]!);
  let screenTop = Infinity;
  for (let i = 0; i < gp.length; i += 3) if (gp[i + 2]! < gMid && gp[i + 1]! > frontTop - 0.08) screenTop = Math.min(screenTop, gp[i + 2]!);
  if (!Number.isFinite(screenTop)) {
    screenTop = front + 1.5;
    gz1 = rear - 0.6;
    gx = width - 0.25;
    glassTop = top - 0.1;
  }
  // The roof is just above the top of the glass; roof signs and light bars stand higher than that.
  const roof = Math.min(top, glassTop + 0.07);
  const seats: SeatSpot[] = [];
  const sx = Math.min(0.42, gx * 0.55);
  // A seated body, measured from the clip: the soles are at the root, the hips 0.54 m up and 0.31 m
  // behind, the middle of the head 1.19 m up and 0.34 m behind, and a hat tops out near 1.45 m.
  // That is a chair, taller than a car seat, so the seat leans back until the head clears the roof
  // with the feet still inside the body rather than hanging under the sill.
  let recline = spec.recline;
  const headTop = (a: number): number => 1.45 * Math.cos(a) - 0.34 * Math.sin(a);
  while (recline < 0.66 && roof - 0.03 - headTop(recline) < FOOT_WELL) recline += 0.02;
  const rc = Math.cos(recline);
  const rs = Math.sin(recline);
  const headBack = 1.19 * rs + 0.34 * rc;
  const hipBack = 0.54 * rs + 0.31 * rc;
  const floor = Math.max(FOOT_WELL - 0.06, Math.min(0.36, roof - 0.03 - headTop(recline)));
  // Feet stay level with the front wheels at the most, where the tyres hide them, even in a van whose windscreen is right at the nose.
  const z0 = Math.max(screenTop + 0.3 - headBack, wheels[0]!.z + 0.03) + spec.seatShift;
  for (let row = 0; row < spec.rows; row++) {
    const z = z0 + row * 0.86;
    // Leave out a back row whose heads would be out through the rear window.
    if (row > 0 && z + headBack > gz1 - 0.12) break;
    seats.push({ x: -sx, y: floor, z, recline, driver: row === 0, hipZ: z + hipBack });
    seats.push({ x: sx, y: floor, z, recline, driver: false, hipZ: z + hipBack });
  }

  return {
    spec,
    body,
    bodyFar,
    wheelLeft: wheelGeometry(wheelSoup.left),
    wheelRight: wheelGeometry(wheelSoup.right),
    wheels,
    lower,
    upper,
    width: width * 2,
    length: rear - front,
    height: top,
    front,
    rear,
    belt,
    seats,
  };
}

/** Every model's kit, built from one loaded asset. */
export function buildCarKits(asset: ModelAsset): Record<CarModel, CarKit> {
  const palette = readPalette(asset);
  const kits = {} as Record<CarModel, CarKit>;
  for (const model of CAR_MODELS) kits[model] = buildCarKit(asset, model, palette);
  return kits;
}

/** Materials shared by every car. Paint is one material per colour. */
export class CarMaterials {
  /** Bumpers, tyres, underbody, lamps that are off: the colours baked into the vertices, matt. */
  readonly trim = new MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.05, side: DoubleSide });
  readonly wheel = new MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.1 });
  /** Tinted glass: dark enough to hide that the cabins are empty shells, clear enough to see who is in. */
  readonly glass = new MeshStandardMaterial({ color: 0x16242c, roughness: 0.24, metalness: 0.3, transparent: true, opacity: 0.6, depthWrite: false });
  readonly head = new MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0, emissive: 0xfff0c0, emissiveIntensity: 0 });
  readonly tail = new MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0, emissive: 0xff2a1a, emissiveIntensity: 0.05 });
  readonly brake = new MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0, emissive: 0xff2a1a, emissiveIntensity: 2.6 });
  /** Burnt out: what is left of the paint on a wreck. */
  readonly wreck = new MeshStandardMaterial({ color: 0x2a2623, vertexColors: true, roughness: 0.95, metalness: 0.1, side: DoubleSide });
  private readonly paints = new Map<number, MeshStandardMaterial>();

  paint(color: number): MeshStandardMaterial {
    let m = this.paints.get(color);
    if (!m) {
      // Satin, not showroom gloss: seen toward the afternoon sun a glossier roof blows out into the bloom.
      m = new MeshStandardMaterial({ color, vertexColors: true, roughness: 0.58, metalness: 0.1, side: DoubleSide });
      this.paints.set(color, m);
    }
    return m;
  }

  /** Lamps come on as the daylight goes. `night` is 0 by day and 1 in the dark. */
  setNight(night: number): void {
    this.head.emissiveIntensity = night * 2.2;
    this.tail.emissiveIntensity = 0.05 + night * 0.7;
  }
}
