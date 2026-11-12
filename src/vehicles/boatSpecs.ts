import { type BufferAttribute, type BufferGeometry, Group, type Material, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import type { ModelAsset } from '../core/assets';
import { bumperShape, type CraftSpec, type DriveSpec, hullFloats, hullShape, seat } from './boat';
import type { SeatDef } from './vehicle';

/**
 * The speedboats. The models are small toys: `SCALE` makes them boats a person fits in, and they are
 * turned round, because their bows point along +Z and everything that drives points along -Z.
 */
export const BOAT_SCALE = 1.75;
/** Height in model units of the waterline the hulls are floated at. */
const WATERLINE = 0.3;

const S = BOAT_SCALE;
const HALF_PI = Math.PI / 2;

/**
 * A point given in model units as it was measured on the model (x to the model's left, y up from the
 * keel, z toward the bow), as a hull-space position: metres, y from the waterline, -Z forward.
 */
const hx = (x: number): number => -x * S;
const hy = (y: number): number => (y - WATERLINE) * S;
const hz = (z: number): number => -z * S;

/**
 * Seated poses: the hips sit 0.31 m behind the point the body is placed by and 0.44 m above it, with the
 * shins straight down under the knees. So a seat is given by where its cushion is, and this finds the point.
 * `x` and `z` are the hips in model units, `top` the cushion height; `facing` turns the sitter (0 looks ahead).
 */
function sitting(x: number, top: number, z: number, driver: boolean, facing = 0): SeatDef {
  const back = 0.31;
  // Behind the sitter, in hull space, for the way they face.
  const bx = Math.sin(facing) * back;
  const bz = Math.cos(facing) * back;
  return seat(hx(x) - bx, hy(top) - 0.44, hz(z) - bz, facing, driver ? 'Driving_Loop' : 'Sitting_Idle_Loop', driver);
}

interface ModelDef {
  model: string;
  name: string;
  /** Model units. */
  length: number;
  beam: number;
  /** Deck edge and the highest solid part, in model units above the keel. */
  deck: number;
  top: number;
  mass: number;
  seats: SeatDef[];
  /** Livelier or lazier than the standard hull. */
  tune?: Partial<DriveSpec>;
}

const SPEEDBOAT: DriveSpec = {
  accel: 5.2,
  fade: 0.4,
  topSpeed: 17,
  boost: 0.26,
  reverse: 0.42,
  spool: 2.4,
  planeFrom: 5,
  planeTo: 10.5,
  dragSlow: 0.03,
  dragLinear: 0.06,
  lift: 2.4,
  trim: 0.105,
  trimFast: 0.42,
  turn: 0.82,
  turnHalf: 3.2,
  wash: 0.3,
  carve: 9.5,
  helm: 4.5,
  bank: 0.36,
  bankMax: 0.26,
  grip: 4.5,
  gripQuad: 1.1,
};

/**
 * The five hulls with an open cockpit, where the crew can be seen. The helm is on the starboard side
 * (the model's -x). The closed-cabin models in the same kit are moored as scenery instead.
 */
const MODELS: ModelDef[] = [
  {
    // Open launch: a well behind the console, and a wide bow deck with the side tubes to sit on.
    model: 'boat-speed-d',
    name: 'launch',
    length: 3.86,
    beam: 2.0,
    deck: 1.0,
    top: 1.2,
    mass: 1650,
    seats: [sitting(-0.26, 0.7, -1.22, true), sitting(0.26, 0.7, -1.22, false), sitting(-0.84, 1.0, 0.75, false, HALF_PI), sitting(0.84, 1.0, 0.75, false, -HALF_PI)],
    tune: { topSpeed: 16.4, accel: 4.8, turn: 0.74 },
  },
  {
    model: 'boat-speed-e',
    name: 'skiff',
    length: 2.86,
    beam: 2.0,
    deck: 1.0,
    top: 1.3,
    mass: 1150,
    seats: [sitting(-0.26, 0.69, -0.74, true), sitting(0.26, 0.69, -0.74, false)],
    tune: { topSpeed: 17.4, accel: 5.6, turn: 0.95, turnHalf: 2.8 },
  },
  {
    model: 'boat-speed-f',
    name: 'skiff',
    length: 2.86,
    beam: 2.2,
    deck: 1.0,
    top: 1.2,
    mass: 1250,
    seats: [sitting(-0.26, 0.69, -0.72, true), sitting(0.26, 0.69, -0.72, false)],
    tune: { topSpeed: 17.8, accel: 5.8, turn: 0.92, turnHalf: 2.8 },
  },
  {
    model: 'boat-speed-h',
    name: 'runabout',
    length: 3.68,
    beam: 1.78,
    deck: 0.88,
    top: 1.22,
    mass: 1350,
    seats: [sitting(-0.25, 0.8, -1.02, true), sitting(0.25, 0.8, -1.02, false)],
  },
  {
    model: 'boat-speed-j',
    name: 'runabout',
    length: 4.26,
    beam: 1.78,
    deck: 0.88,
    top: 1.2,
    mass: 1500,
    seats: [sitting(-0.25, 0.8, -1.22, true), sitting(0.25, 0.8, -1.22, false)],
    tune: { topSpeed: 18, accel: 5, turn: 0.76 },
  },
];

/** Closed-cabin and working boats: moored for the look of the harbour, not for driving. */
export const SCENERY_MODELS = ['boat-speed-a', 'boat-speed-b', 'boat-speed-c', 'boat-speed-g', 'boat-speed-i', 'boat-sail-a', 'boat-sail-b', 'boat-fishing-small', 'boat-row-large'] as const;

function specFor(def: ModelDef): CraftSpec {
  const length = def.length * S;
  const beam = def.beam * S;
  const draft = WATERLINE * S;
  const freeboard = hy(def.deck);
  const height = hy(def.top) + 0.15;
  return {
    kind: 'boat',
    model: def.model,
    name: def.name,
    verb: 'Board',
    length,
    beam,
    draft,
    freeboard,
    height,
    mass: def.mass,
    gyration: { pitch: length * 0.26, yaw: length * 0.27, roll: beam * 0.37 },
    comY: -0.06,
    floats: hullFloats(length, beam, draft * 0.86, freeboard),
    damping: 0.45,
    seats: def.seats,
    drive: { ...SPEEDBOAT, ...def.tune },
    reach: 2.4,
    camera: { height: 2.5, distance: 9.5 },
    shape: hullShape(length, beam, draft, freeboard, height),
    bumper: bumperShape(length, beam, draft, freeboard, height),
    stem: { x: 0, y: 0, z: -length * 0.46 },
    screw: { x: 0, y: -draft * 0.9, z: length * 0.47 },
  };
}

export const SPEEDBOATS: CraftSpec[] = MODELS.map(specFor);

/**
 * The kit paints every model from one palette image: each colour is a column of it and a model picks
 * its colours by where its UVs point. Row three of the palette holds the bright paints, eight columns wide.
 */
const PAINT_ROW = { v0: 0.5, v1: 0.75 };
const COLUMNS = 8;
/** Paint columns that suit a boat: cream, green, yellow, orange, red, blue, sky. */
export const BOAT_PAINTS = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * A copy of a model's geometry with its main paint moved to another column of the palette, so the same
 * hull comes in several colours without a second texture. Only the paint that covers the most surface
 * moves: trim in other colours stays as the kit drew it.
 */
function repaint(source: BufferGeometry, column: number): BufferGeometry {
  const uv = source.getAttribute('uv') as BufferAttribute | undefined;
  const pos = source.getAttribute('position') as BufferAttribute | undefined;
  if (!uv || !pos) return source;
  const index = source.getIndex();
  const tris = (index ? index.count : pos.count) / 3;
  const area = new Float32Array(COLUMNS);
  const vert = (t: number, k: number): number => (index ? index.getX(t * 3 + k) : t * 3 + k);
  const col = (i: number): number => Math.min(COLUMNS - 1, Math.max(0, Math.floor(uv.getX(i) * COLUMNS)));
  const painted = (i: number): boolean => uv.getY(i) >= PAINT_ROW.v0 && uv.getY(i) < PAINT_ROW.v1;
  for (let t = 0; t < tris; t++) {
    const a = vert(t, 0);
    const b = vert(t, 1);
    const c = vert(t, 2);
    if (!painted(a)) continue;
    const ux = pos.getX(b) - pos.getX(a);
    const uy = pos.getY(b) - pos.getY(a);
    const uz = pos.getZ(b) - pos.getZ(a);
    const vx = pos.getX(c) - pos.getX(a);
    const vy = pos.getY(c) - pos.getY(a);
    const vz = pos.getZ(c) - pos.getZ(a);
    area[col(a)]! += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
  }
  let main = -1;
  let most = 0;
  for (let i = 0; i < COLUMNS; i++) {
    if (area[i]! > most) {
      most = area[i]!;
      main = i;
    }
  }
  if (main < 0 || main === column) return source;
  const out = source.clone();
  const dst = (uv.clone() as BufferAttribute);
  const shift = (column - main) / COLUMNS;
  for (let i = 0; i < dst.count; i++) {
    if (painted(i) && col(i) === main) dst.setX(i, uv.getX(i) + shift);
  }
  out.setAttribute('uv', dst);
  return out;
}

const repainted = new Map<string, BufferGeometry>();
const toned = new Map<Material, Material>();

/**
 * The kit's white is pure white, and in the afternoon sun a white hull burns out to a glowing blob.
 * The boats use a copy of the kit's material a shade darker, which keeps the shape of a white hull readable.
 */
function tone(source: Material): Material {
  let m = toned.get(source);
  if (!m) {
    m = source.clone();
    (m as MeshStandardMaterial).color?.multiplyScalar(0.84);
    toned.set(source, m);
  }
  return m;
}

/**
 * The drawn model for a craft, in hull space: scaled, turned to face -Z and sunk to its waterline.
 * `paint` picks the colour; leave it out for the kit's own.
 */
export function boatVisual(asset: ModelAsset, model: string, paint?: number): Object3D {
  const source = asset.scene.getObjectByName(model);
  if (!source) throw new Error(`Model ${model} is not in the boat kit`);
  const holder = new Group();
  holder.name = model;
  source.updateMatrixWorld(true);
  const inverse = source.matrixWorld.clone().invert();
  source.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    let geometry = mesh.geometry;
    if (paint !== undefined) {
      const key = `${mesh.uuid}:${paint}`;
      let g = repainted.get(key);
      if (!g) {
        g = repaint(mesh.geometry, paint);
        repainted.set(key, g);
      }
      geometry = g;
    }
    const copy = new Mesh(geometry, tone(mesh.material as Material));
    // Children of a kit model (a sail, a pair of oars) keep their place on it.
    copy.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
    copy.castShadow = true;
    copy.receiveShadow = true;
    holder.add(copy);
  });
  holder.scale.setScalar(S);
  holder.rotation.y = Math.PI;
  holder.position.y = -WATERLINE * S;
  return holder;
}
