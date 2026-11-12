import { Color, Group, Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { MeshBuilder } from '../world/geo';
import { bumperShape, type CraftSpec, hullShape, seat } from './boat';

/**
 * The jet ski: an original model built from flat panels in code, about three metres long. Hull space:
 * the bow points along -Z, y is measured from the waterline, metres.
 */

type P = readonly [number, number, number];

/** One cross-section of the hull: keel, chine (where bottom meets side) and gunwale (where side meets deck). */
interface Station {
  z: number;
  keel: number;
  chineW: number;
  chineY: number;
  railW: number;
  railY: number;
}

const STATIONS: Station[] = [
  { z: -1.55, keel: 0.2, chineW: 0.0, chineY: 0.21, railW: 0.0, railY: 0.24 },
  { z: -1.25, keel: -0.02, chineW: 0.2, chineY: 0.08, railW: 0.27, railY: 0.27 },
  { z: -0.8, keel: -0.16, chineW: 0.36, chineY: 0.0, railW: 0.44, railY: 0.27 },
  { z: -0.2, keel: -0.22, chineW: 0.45, chineY: -0.04, railW: 0.53, railY: 0.26 },
  { z: 0.5, keel: -0.22, chineW: 0.47, chineY: -0.05, railW: 0.56, railY: 0.25 },
  { z: 1.1, keel: -0.21, chineW: 0.45, chineY: -0.05, railW: 0.54, railY: 0.24 },
  { z: 1.45, keel: -0.19, chineW: 0.42, chineY: -0.05, railW: 0.5, railY: 0.23 },
];

/** Where the rider sits and what they hold, shared by the model and the seat. */
const SADDLE = { front: -0.3, back: 0.98, top: 0.6, rise: 0.07 };
const BAR = { y: 1.04, z: -0.09, half: 0.34 };
const WELL_Y = 0.12;

export interface JetSkiPaint {
  /** Deck, cowl and the stripe along the side. */
  body: number;
  /** Lower hull. */
  hull: number;
  /** Saddle. */
  seat: number;
}

/** Body colours: bright, in the pastel-and-neon range the city is painted in. */
export const JETSKI_PAINTS: JetSkiPaint[] = [
  { body: 0xff4f7b, hull: 0xf4f6fa, seat: 0x23262e },
  { body: 0x19c2b0, hull: 0xf4f6fa, seat: 0x23262e },
  { body: 0xffc13d, hull: 0x2a2e38, seat: 0x15171c },
  { body: 0x7b5cff, hull: 0xf4f6fa, seat: 0x23262e },
  { body: 0xff7a2f, hull: 0x2a2e38, seat: 0x15171c },
  { body: 0x2f8dff, hull: 0xf4f6fa, seat: 0x1d2330 },
  { body: 0xc6f24a, hull: 0x2a2e38, seat: 0x15171c },
];

let material: MeshStandardMaterial | null = null;

/**
 * A flat panel, wound so that it faces along `toward`. Hulls have insides and outsides, wells and
 * humps; saying which way a panel looks is easier to get right than counting corners.
 */
function panel(b: MeshBuilder, pts: readonly P[], color: Color, toward: P): void {
  const [p0, p1, p2] = pts as [P, P, P];
  const ux = p1[0] - p0[0];
  const uy = p1[1] - p0[1];
  const uz = p1[2] - p0[2];
  const last = pts[pts.length - 1]!;
  // With three points the "last" corner is the third; with four it is the fourth: both give the face normal.
  const w = pts.length === 3 ? p2 : last;
  const vx = w[0] - p0[0];
  const vy = w[1] - p0[1];
  const vz = w[2] - p0[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const flip = nx * toward[0] + ny * toward[1] + nz * toward[2] < 0;
  if (pts.length === 3) {
    if (flip) b.triangle(p0, p2, p1, color);
    else b.triangle(p0, p1, p2, color);
  } else {
    const p3 = pts[3]!;
    if (flip) b.quad(p0, p3, p2, p1, color);
    else b.quad(p0, p1, p2, p3, color);
  }
}

/** A box from its two corners, every face looking outward. */
function block(b: MeshBuilder, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: Color, top = color): void {
  panel(b, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], top, [0, 1, 0]);
  panel(b, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], color, [0, -1, 0]);
  panel(b, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], color, [0, 0, -1]);
  panel(b, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color, [0, 0, 1]);
  panel(b, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], color, [-1, 0, 0]);
  panel(b, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], color, [1, 0, 0]);
}

/** Linear value of a station property at `z`. */
function at(z: number, key: keyof Station): number {
  const s = STATIONS;
  if (z <= s[0]!.z) return s[0]![key];
  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i]!;
    const c = s[i + 1]!;
    if (z <= c.z) return a[key] + ((c[key] - a[key]) * (z - a.z)) / (c.z - a.z);
  }
  return s[s.length - 1]![key];
}

/** Build the jet ski. The handlebars are a child named `bars`, so they can turn with the helm. */
export function jetSkiVisual(paint: JetSkiPaint): Object3D {
  const body = new Color(paint.body);
  const hullC = new Color(paint.hull);
  const seatC = new Color(paint.seat);
  const seatTop = seatC.clone().lerp(new Color(0xffffff), 0.1);
  const bodyDark = body.clone().multiplyScalar(0.72);
  const mat = new Color(0x3a3f4a);
  const dark = new Color(0x191b20);
  const glass = new Color(0x26384a);
  const white = new Color(0xf4f6fa);
  const b = new MeshBuilder();

  // --- Hull: bottom, sides with a painted stripe, both halves ---
  for (let i = 0; i + 1 < STATIONS.length; i++) {
    const a = STATIONS[i]!;
    const c = STATIONS[i + 1]!;
    for (const s of [1, -1]) {
      const out: P = [s, -0.2, 0];
      const ak: P = [0, a.keel, a.z];
      const ck: P = [0, c.keel, c.z];
      const ac: P = [s * a.chineW, a.chineY, a.z];
      const cc: P = [s * c.chineW, c.chineY, c.z];
      // The stripe runs along the upper half of the side.
      const am: P = [s * (a.chineW + (a.railW - a.chineW) * 0.55), a.chineY + (a.railY - a.chineY) * 0.55, a.z];
      const cm: P = [s * (c.chineW + (c.railW - c.chineW) * 0.55), c.chineY + (c.railY - c.chineY) * 0.55, c.z];
      const ar: P = [s * a.railW, a.railY, a.z];
      const cr: P = [s * c.railW, c.railY, c.z];
      if (a.chineW < 1e-3) {
        // At the stem the panels close to a point.
        panel(b, [ak, cc, ck], hullC, [s * 0.4, -1, -0.2]);
        panel(b, [ac, cm, cc], hullC, out);
        panel(b, [ar, cr, cm], body, out);
      } else {
        panel(b, [ak, ck, cc, ac], hullC, [s * 0.3, -1, 0]);
        panel(b, [ac, cc, cm, am], hullC, out);
        panel(b, [am, cm, cr, ar], body, out);
      }
    }
  }
  // Transom.
  const t = STATIONS[STATIONS.length - 1]!;
  for (const s of [1, -1]) {
    panel(b, [[0, t.keel, t.z], [s * t.chineW, t.chineY, t.z], [s * t.railW, t.railY, t.z], [0, t.railY, t.z]], hullC, [0, 0, 1]);
  }
  // Jet nozzle and the ride plate under it.
  block(b, -0.09, -0.15, t.z - 0.02, 0.09, 0.01, t.z + 0.13, dark);

  // --- Cowl: from the stem up to the foot of the handlebars ---
  const cowlEnd = -0.42;
  const ridge = (z: number): number => 0.25 + 0.43 * Math.min(1, (z + 1.55) / (cowlEnd + 1.55)) ** 0.8;
  const ridgeW = (z: number): number => 0.17 * Math.min(1, (z + 1.55) / 0.7);
  const cuts = [-1.55, -1.25, -0.8, cowlEnd];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const za = cuts[i]!;
    const zc = cuts[i + 1]!;
    for (const s of [1, -1]) {
      const aRail: P = [s * at(za, 'railW'), at(za, 'railY'), za];
      const cRail: P = [s * at(zc, 'railW'), at(zc, 'railY'), zc];
      const aTop: P = [s * ridgeW(za), ridge(za), za];
      const cTop: P = [s * ridgeW(zc), ridge(zc), zc];
      if (i === 0) panel(b, [aRail, cRail, cTop], body, [s, 1, -0.3]);
      else panel(b, [aRail, cRail, cTop, aTop], body, [s, 1, -0.2]);
    }
    if (i > 0) panel(b, [[-ridgeW(za), ridge(za), za], [ridgeW(za), ridge(za), za], [ridgeW(zc), ridge(zc), zc], [-ridgeW(zc), ridge(zc), zc]], bodyDark, [0, 1, 0]);
    else panel(b, [[0, ridge(za), za], [ridgeW(zc), ridge(zc), zc], [-ridgeW(zc), ridge(zc), zc]], bodyDark, [0, 1, 0]);
  }
  // The cowl's after face, down to the foot wells.
  const cw = at(cowlEnd, 'railW');
  const cy = at(cowlEnd, 'railY');
  const cr = ridge(cowlEnd);
  const cwt = ridgeW(cowlEnd);
  panel(b, [[-cw, WELL_Y, cowlEnd], [cw, WELL_Y, cowlEnd], [cw, cy, cowlEnd], [-cw, cy, cowlEnd]], bodyDark, [0, 0, 1]);
  panel(b, [[-cw, cy, cowlEnd], [cw, cy, cowlEnd], [cwt, cr, cowlEnd], [-cwt, cr, cowlEnd]], bodyDark, [0, 0, 1]);
  // A low dark screen on the cowl.
  panel(b, [[-0.15, ridge(-0.86) + 0.01, -0.86], [0.15, ridge(-0.86) + 0.01, -0.86], [0.12, cr + 0.17, -0.5], [-0.12, cr + 0.17, -0.5]], glass, [0, 1, -1]);
  panel(b, [[-0.12, cr + 0.17, -0.5], [0.12, cr + 0.17, -0.5], [0.15, cr, -0.44], [-0.15, cr, -0.44]], dark, [0, 0.3, 1]);

  // --- Foot wells, gunwale tops and the after deck ---
  const wellFront = cowlEnd;
  const wellBack = SADDLE.back;
  const deckCuts = [wellFront, -0.2, 0.5, wellBack];
  for (let i = 0; i + 1 < deckCuts.length; i++) {
    const za = deckCuts[i]!;
    const zc = deckCuts[i + 1]!;
    for (const s of [1, -1]) {
      const aw = at(za, 'railW');
      const cw2 = at(zc, 'railW');
      const ay = at(za, 'railY');
      const cy2 = at(zc, 'railY');
      const lip = 0.08;
      // Gunwale top, its inner wall, then the well floor in to the engine cover.
      panel(b, [[s * aw, ay, za], [s * cw2, cy2, zc], [s * (cw2 - lip), cy2, zc], [s * (aw - lip), ay, za]], body, [0, 1, 0]);
      panel(b, [[s * (aw - lip), ay, za], [s * (cw2 - lip), cy2, zc], [s * (cw2 - lip), WELL_Y, zc], [s * (aw - lip), WELL_Y, za]], bodyDark, [-s, 0, 0]);
      panel(b, [[s * (aw - lip), WELL_Y, za], [s * (cw2 - lip), WELL_Y, zc], [s * 0.12, WELL_Y, zc], [s * 0.12, WELL_Y, za]], mat, [0, 1, 0]);
    }
  }
  // After deck: a step to climb on from the water, with a grab handle.
  const sternZ = t.z;
  const bw = at(wellBack, 'railW');
  panel(b, [[-bw, 0.21, wellBack], [bw, 0.21, wellBack], [t.railW, 0.21, sternZ], [-t.railW, 0.21, sternZ]], mat, [0, 1, 0]);
  for (const s of [1, -1]) {
    panel(b, [[s * bw, at(wellBack, 'railY'), wellBack], [s * t.railW, t.railY, sternZ], [s * t.railW, 0.21, sternZ], [s * bw, 0.21, wellBack]], body, [-s, 0.2, 0]);
    panel(b, [[s * (bw - 0.08), WELL_Y, wellBack], [s * 0.12, WELL_Y, wellBack], [s * 0.12, 0.21, wellBack], [s * (bw - 0.08), 0.21, wellBack]], bodyDark, [0, 0, -1]);
  }
  block(b, -0.2, 0.21, wellBack + 0.03, -0.16, 0.5, wellBack + 0.07, dark);
  block(b, 0.16, 0.21, wellBack + 0.03, 0.2, 0.5, wellBack + 0.07, dark);
  block(b, -0.2, 0.46, wellBack + 0.03, 0.2, 0.5, wellBack + 0.07, dark);

  // --- Engine cover and saddle: narrow where the knees grip it, wider under the hips ---
  const saddleCuts: [number, number, number][] = [
    // z, half width, top height
    [SADDLE.front, 0.11, SADDLE.top - 0.04],
    [-0.05, 0.13, SADDLE.top],
    [0.42, 0.17, SADDLE.top],
    [0.6, 0.18, SADDLE.top + SADDLE.rise],
    [SADDLE.back, 0.17, SADDLE.top + SADDLE.rise - 0.01],
  ];
  const skirt = 0.42;
  for (let i = 0; i + 1 < saddleCuts.length; i++) {
    const [za, wa, ya] = saddleCuts[i]!;
    const [zc, wc, yc] = saddleCuts[i + 1]!;
    panel(b, [[-wa, ya, za], [wa, ya, za], [wc, yc, zc], [-wc, yc, zc]], seatTop, [0, 1, 0]);
    for (const s of [1, -1]) {
      panel(b, [[s * wa, ya, za], [s * wc, yc, zc], [s * (wc + 0.015), skirt, zc], [s * (wa + 0.015), skirt, za]], seatC, [s, 0, 0]);
      // The cover under the saddle, in body paint.
      panel(b, [[s * (wa + 0.015), skirt, za], [s * (wc + 0.015), skirt, zc], [s * (wc + 0.03), WELL_Y, zc], [s * (wa + 0.03), WELL_Y, za]], body, [s, 0, 0]);
    }
  }
  const [zb, wb, yb] = saddleCuts[saddleCuts.length - 1]!;
  panel(b, [[-wb, yb, zb], [wb, yb, zb], [wb + 0.015, skirt, zb], [-wb - 0.015, skirt, zb]], seatC, [0, 0, 1]);
  panel(b, [[-wb - 0.015, skirt, zb], [wb + 0.015, skirt, zb], [wb + 0.03, 0.21, zb], [-wb - 0.03, 0.21, zb]], body, [0, 0, 1]);
  const [zf, wf, yf] = saddleCuts[0]!;
  panel(b, [[-wf, yf, zf], [wf, yf, zf], [wf + 0.03, WELL_Y, zf - 0.1], [-wf - 0.03, WELL_Y, zf - 0.1]], body, [0, 0.4, -1]);

  // --- Steering column, fixed part ---
  const colBase: P = [0, cr - 0.02, cowlEnd - 0.06];
  const colTop: P = [0, BAR.y - 0.05, BAR.z];
  const cwd = 0.055;
  panel(b, [[-cwd, colBase[1], colBase[2]], [cwd, colBase[1], colBase[2]], [cwd, colTop[1], colTop[2]], [-cwd, colTop[1], colTop[2]]], dark, [0, 1, -1]);
  panel(b, [[-cwd, colBase[1] - 0.1, colBase[2] + 0.1], [cwd, colBase[1] - 0.1, colBase[2] + 0.1], [cwd, colTop[1] - 0.07, colTop[2] + 0.07], [-cwd, colTop[1] - 0.07, colTop[2] + 0.07]], dark, [0, -1, 1]);
  for (const s of [1, -1]) {
    panel(b, [[s * cwd, colBase[1], colBase[2]], [s * cwd, colTop[1], colTop[2]], [s * cwd, colTop[1] - 0.07, colTop[2] + 0.07], [s * cwd, colBase[1] - 0.1, colBase[2] + 0.1]], dark, [s, 0, 0]);
  }

  const group = new Group();
  group.name = 'jetski';
  material ??= new MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.05 });
  const mesh = new Mesh(b.build(), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // --- Handlebars: their own object, pivoting at the head of the column ---
  const hb = new MeshBuilder();
  block(hb, -BAR.half, -0.02, -0.02, BAR.half, 0.02, 0.02, dark);
  // Grips and a pad in the middle with the paint on it.
  block(hb, -BAR.half - 0.01, -0.03, -0.03, -BAR.half + 0.13, 0.03, 0.03, white);
  block(hb, BAR.half - 0.13, -0.03, -0.03, BAR.half + 0.01, 0.03, 0.03, white);
  block(hb, -0.09, -0.04, -0.05, 0.09, 0.04, 0.04, body);
  const bars = new Mesh(hb.build(), material);
  bars.name = 'bars';
  bars.position.set(0, BAR.y, BAR.z);
  bars.castShadow = true;
  group.add(bars);
  return group;
}

/**
 * The rider's hips sit 0.31 m behind the point the body is placed by and 0.44 m above it, with the
 * knees 0.2 m either side of the middle: on a narrow saddle that puts one leg down each side of it.
 */
export const JETSKI: CraftSpec = {
  kind: 'jetski',
  model: 'jetski',
  name: 'jet ski',
  verb: 'Ride',
  length: 3.0,
  beam: 1.12,
  draft: 0.22,
  freeboard: 0.25,
  height: 1.06,
  mass: 340,
  gyration: { pitch: 0.78, yaw: 0.8, roll: 0.45 },
  comY: 0.02,
  floats: [
    { x: 0.3, y: -0.19, z: 1.0, share: 0.21, lift: 0.8 },
    { x: -0.3, y: -0.19, z: 1.0, share: 0.21, lift: 0.8 },
    { x: 0.3, y: -0.19, z: 0.15, share: 0.22, lift: 1 },
    { x: -0.3, y: -0.19, z: 0.15, share: 0.22, lift: 1 },
    { x: 0, y: -0.12, z: -0.95, share: 0.14, lift: 1.5 },
    // Dry at rest: the gunwales and the bow.
    { x: 0.5, y: 0.2, z: 0.3, reserve: 2.6 },
    { x: -0.5, y: 0.2, z: 0.3, reserve: 2.6 },
    { x: 0, y: 0.24, z: -1.35, reserve: 2 },
  ],
  damping: 0.45,
  seats: [seat(0, SADDLE.top - 0.44, 0.3 - 0.31, 0, 'Driving_Loop', true), seat(0, SADDLE.top + SADDLE.rise - 0.44, 0.9 - 0.31, 0, 'Sitting_Idle_Loop')],
  drive: {
    accel: 8.2,
    fade: 0.4,
    topSpeed: 21.5,
    boost: 0.2,
    reverse: 0.4,
    spool: 3.6,
    planeFrom: 4,
    planeTo: 9,
    dragSlow: 0.035,
    dragLinear: 0.06,
    lift: 2.6,
    trim: 0.12,
    trimFast: 0.4,
    turn: 1.2,
    turnHalf: 3.4,
    wash: 0.5,
    carve: 14,
    helm: 7,
    bank: 0.5,
    bankMax: 0.5,
    grip: 4.2,
    gripQuad: 0.9,
  },
  reach: 2.2,
  camera: { height: 1.9, distance: 6.4 },
  shape: hullShape(3.0, 1.12, 0.22, 0.25, 1.06),
  bumper: bumperShape(3.0, 1.12, 0.22, 0.25, 1.06),
  stem: { x: 0, y: 0, z: -1.4 },
  screw: { x: 0, y: -0.12, z: 1.45 },
};
