import { Color, Group, Mesh } from 'three';
import { WORLD } from '../core/config';
import type { Physics } from '../physics/physics';
import type { Materials } from '../render/materials';
import { SEA_BED } from './field';
import { MeshBuilder } from './geo';
import { bridgeRise, type Layout, type RoadSegment } from './layout';

const STREET = WORLD.streetY;
const MARK_Y = STREET + 0.012;

export interface MedianStrip {
  /** Centre line of a planted median: palms and lamps go here. */
  axis: 'x' | 'z';
  c: number;
  a: number;
  b: number;
}

export interface RoadBuild {
  group: Group;
  medians: MedianStrip[];
}

/** Lane paint, crosswalks, planted medians and the arched bridges. */
export function buildRoads(layout: Layout, materials: Materials, physics: Physics): RoadBuild {
  const group = new Group();
  group.name = 'roads';
  const paint = new MeshBuilder();
  const asphalt = new MeshBuilder();
  const concrete = new MeshBuilder();
  const grass = new MeshBuilder();
  const trim = new MeshBuilder();
  const neon = new MeshBuilder();
  const medians: MedianStrip[] = [];

  const white = new Color(0.74, 0.74, 0.72);
  const yellow = new Color(0.86, 0.62, 0.1);
  const kerb = new Color(0.82, 0.82, 0.8);

  for (const seg of layout.segments) {
    if (seg.bridge) {
      buildBridge(seg, asphalt, concrete, trim, paint, neon, physics);
      continue;
    }
    const len = seg.b - seg.a;
    if (len < 4) continue;
    // Helpers that map (along, across) on the segment to world x, z.
    const strip = (a0: number, a1: number, c0: number, c1: number, y: number, color: Color, builder = paint): void => {
      if (seg.axis === 'z') builder.floor(seg.c + c0, a0, seg.c + c1, a1, y, color);
      else builder.floor(a0, seg.c + c0, a1, seg.c + c1, y, color);
    };
    const half = seg.w / 2;
    if (seg.median) {
      const mw = 1.3;
      const a0 = seg.a + 5;
      const a1 = seg.b - 5;
      if (a1 - a0 > 6) {
        // Raised planted median.
        if (seg.axis === 'z') {
          concrete.box(seg.c - mw, STREET, a0, seg.c + mw, STREET + 0.18, a1, kerb, 'nsew');
          grass.floor(seg.c - mw, a0, seg.c + mw, a1, STREET + 0.18, new Color(1, 1, 1));
          physics.addStaticBox(seg.c, STREET + 0.09, (a0 + a1) / 2, mw, 0.09, (a1 - a0) / 2, { kind: 'world', surface: 'grass' });
        } else {
          concrete.box(a0, STREET, seg.c - mw, a1, STREET + 0.18, seg.c + mw, kerb, 'nsew');
          grass.floor(a0, seg.c - mw, a1, seg.c + mw, STREET + 0.18, new Color(1, 1, 1));
          physics.addStaticBox((a0 + a1) / 2, STREET + 0.09, seg.c, (a1 - a0) / 2, 0.09, mw, { kind: 'world', surface: 'grass' });
        }
        medians.push({ axis: seg.axis, c: seg.c, a: a0, b: a1 });
      }
      // Lane dividers on each carriageway.
      const laneC = (half + mw) / 2;
      for (let a = seg.a + 3; a + 3 < seg.b - 3; a += 9) {
        strip(a, a + 3, laneC - 0.07, laneC + 0.07, MARK_Y, white);
        strip(a, a + 3, -laneC - 0.07, -laneC + 0.07, MARK_Y, white);
      }
    } else {
      // Double yellow centre line.
      strip(seg.a + 1.5, seg.b - 1.5, -0.2, -0.08, MARK_Y, yellow);
      strip(seg.a + 1.5, seg.b - 1.5, 0.08, 0.2, MARK_Y, yellow);
      // Parking lane edge lines where the road is wide enough.
      if (seg.w >= 12) {
        const p = half - 2.4;
        for (let a = seg.a + 4; a + 5.5 < seg.b - 4; a += 6) {
          strip(a, a + 0.1, p, half - 0.2, MARK_Y, white);
          strip(a, a + 0.1, -half + 0.2, -p, MARK_Y, white);
        }
        strip(seg.a + 4, seg.b - 4, p - 0.05, p + 0.05, MARK_Y, white);
        strip(seg.a + 4, seg.b - 4, -p - 0.05, -p + 0.05, MARK_Y, white);
      }
    }
    // Stop lines and zebra crossings at both ends.
    for (const end of [0, 1]) {
      const at = end === 0 ? seg.a : seg.b;
      const dir = end === 0 ? 1 : -1;
      const z0 = at + dir * 0.8;
      const z1 = at + dir * 3.4;
      for (let cpos = -half + 0.5; cpos + 0.55 <= half - 0.4; cpos += 1.1) {
        strip(Math.min(z0, z1), Math.max(z0, z1), cpos, cpos + 0.55, MARK_Y, white);
      }
      const s0 = at + dir * 4.1;
      const s1 = at + dir * 4.45;
      // The stop line covers the lanes approaching the junction. Traffic keeps right: heading north
      // (towards a lower z) its lanes are on the east side, heading west they are on the north side.
      const right = seg.axis === 'z' ? (end === 0 ? 1 : -1) : end === 0 ? -1 : 1;
      const c0 = right > 0 ? 0.3 : -half + 0.4;
      const c1 = right > 0 ? half - 0.4 : -0.3;
      strip(Math.min(s0, s1), Math.max(s0, s1), c0, c1, MARK_Y, white);
    }
  }

  const add = (builder: MeshBuilder, material: Mesh['material'], name: string, cast = false): void => {
    if (builder.empty) return;
    const mesh = new Mesh(builder.build(), material);
    mesh.name = name;
    mesh.receiveShadow = true;
    mesh.castShadow = cast;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  };
  add(paint, materials.marking, 'road-paint');
  add(asphalt, materials.asphalt, 'bridge-decks', true);
  add(concrete, materials.concrete, 'road-concrete', true);
  add(grass, materials.grass, 'medians');
  add(trim, materials.paint, 'bridge-trim', true);
  add(neon, materials.neon, 'bridge-neon');
  return { group, medians };
}

function buildBridge(seg: RoadSegment, asphalt: MeshBuilder, concrete: MeshBuilder, trim: MeshBuilder, paint: MeshBuilder, neon: MeshBuilder, physics: Physics): void {
  const rise = seg.bridge!.rise;
  const len = seg.b - seg.a;
  const n = Math.max(12, Math.round(len / 3.2));
  const half = seg.w / 2;
  const white = new Color(1, 1, 1);
  const fascia = new Color(0.93, 0.9, 0.86);
  const rail = seg.bridge!.over === 'bay' ? new Color(0.99, 0.62, 0.5) : new Color(0.56, 0.9, 0.85);
  const glow = seg.bridge!.over === 'bay' ? new Color(1, 0.35, 0.55) : new Color(0.2, 0.95, 0.9);
  const yellow = new Color(0.86, 0.62, 0.1);
  const thick = 0.7;
  const railH = 1.05;
  const railT = 0.35;

  // Map (along, across, y) to world coordinates for either axis.
  const P = (along: number, across: number, y: number): [number, number, number] => (seg.axis === 'z' ? [seg.c + across, y, along] : [along, y, seg.c + across]);

  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const a0 = seg.a + t0 * len;
    const a1 = seg.a + t1 * len;
    const y0 = STREET + bridgeRise(t0, rise);
    const y1 = STREET + bridgeRise(t1, rise);
    // Deck top. Winding differs per axis so the face points up.
    if (seg.axis === 'z') {
      asphalt.quad(P(a0, -half, y0), P(a1, -half, y1), P(a1, half, y1), P(a0, half, y0), white, [(seg.c - half) * 0.25, a0 * 0.25, (seg.c + half) * 0.25, a1 * 0.25]);
    } else {
      asphalt.quad(P(a0, -half, y0), P(a0, half, y0), P(a1, half, y1), P(a1, -half, y1), white, [a0 * 0.25, (seg.c - half) * 0.25, a1 * 0.25, (seg.c + half) * 0.25]);
    }
    // Underside and side fascias.
    const b0 = y0 - thick;
    const b1 = y1 - thick;
    if (seg.axis === 'z') {
      concrete.quad(P(a0, -half, b0), P(a0, half, b0), P(a1, half, b1), P(a1, -half, b1), fascia);
      concrete.quad(P(a0, -half, b0), P(a1, -half, b1), P(a1, -half, y1), P(a0, -half, y0), fascia);
      concrete.quad(P(a1, half, b1), P(a0, half, b0), P(a0, half, y0), P(a1, half, y1), fascia);
    } else {
      concrete.quad(P(a0, -half, b0), P(a1, -half, b1), P(a1, half, b1), P(a0, half, b0), fascia);
      concrete.quad(P(a1, -half, b1), P(a0, -half, b0), P(a0, -half, y0), P(a1, -half, y1), fascia);
      concrete.quad(P(a0, half, b0), P(a1, half, b1), P(a1, half, y1), P(a0, half, y0), fascia);
    }
    // Parapets with a neon line along the outside.
    for (const side of [-1, 1]) {
      const c0 = side < 0 ? -half : half - railT;
      const c1 = c0 + railT;
      const q = (along: number, across: number, y: number): [number, number, number] => P(along, across, y);
      const inner = side < 0 ? c1 : c0;
      const outer = side < 0 ? c0 : c1;
      // Inner face, outer face and top of the parapet.
      const faces: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]][] = [
        [q(a0, inner, y0), q(a1, inner, y1), q(a1, inner, y1 + railH), q(a0, inner, y0 + railH)],
        [q(a1, outer, y1), q(a0, outer, y0), q(a0, outer, y0 + railH), q(a1, outer, y1 + railH)],
        [q(a0, inner, y0 + railH), q(a1, inner, y1 + railH), q(a1, outer, y1 + railH), q(a0, outer, y0 + railH)],
      ];
      for (const f of faces) {
        // Flip winding depending on axis and side so each face points outward.
        const flip = (seg.axis === 'z') !== side < 0;
        if (flip) trim.quad(f[1], f[0], f[3], f[2], rail);
        else trim.quad(f[0], f[1], f[2], f[3], rail);
      }
      const ny0 = y0 + railH * 0.55;
      const ny1 = y1 + railH * 0.55;
      const o = outer + side * 0.02;
      neon.quad(q(a0, o, ny0 - 0.05), q(a1, o, ny1 - 0.05), q(a1, o, ny1 + 0.05), q(a0, o, ny0 + 0.05), glow);
    }
    // Centre line.
    const m0 = y0 + 0.015;
    const m1 = y1 + 0.015;
    if (i % 2 === 0) {
      if (seg.axis === 'z') paint.quad(P(a0, -0.08, m0), P(a1, -0.08, m1), P(a1, 0.08, m1), P(a0, 0.08, m0), yellow);
      else paint.quad(P(a0, -0.08, m0), P(a0, 0.08, m0), P(a1, 0.08, m1), P(a1, -0.08, m1), yellow);
    }

    // Colliders: a thick deck slab and two parapets per span.
    const dy = y1 - y0;
    const da = a1 - a0;
    const slope = Math.atan2(dy, da);
    const hyp = Math.hypot(da, dy) / 2 + 0.02;
    const am = (a0 + a1) / 2;
    const ym = (y0 + y1) / 2;
    const half2 = slope / 2;
    const q = seg.axis === 'z' ? { x: -Math.sin(half2), y: 0, z: 0, w: Math.cos(half2) } : { x: 0, y: 0, z: Math.sin(half2), w: Math.cos(half2) };
    const deckC = P(am, 0, ym - (thick / 2) * Math.cos(slope));
    if (seg.axis === 'z') physics.addStaticBoxQuat(deckC[0], deckC[1], deckC[2], half, thick / 2, hyp, q, { kind: 'world', surface: 'asphalt' });
    else physics.addStaticBoxQuat(deckC[0], deckC[1], deckC[2], hyp, thick / 2, half, q, { kind: 'world', surface: 'asphalt' });
    for (const side of [-1, 1]) {
      const rc = P(am, side * (half - railT / 2), ym + railH / 2);
      if (seg.axis === 'z') physics.addStaticBoxQuat(rc[0], rc[1], rc[2], railT / 2, railH / 2, hyp, q, { kind: 'world', surface: 'concrete' });
      else physics.addStaticBoxQuat(rc[0], rc[1], rc[2], hyp, railH / 2, railT / 2, q, { kind: 'world', surface: 'concrete' });
    }
  }

  // Support piers standing in the water.
  const supports = seg.bridge!.over === 'bay' ? 5 : 2;
  for (let i = 1; i <= supports; i++) {
    const t = i / (supports + 1);
    const along = seg.a + t * len;
    const top = STREET + bridgeRise(t, rise) - thick;
    if (top < 0.8) continue;
    for (const side of [-1, 1]) {
      const p = P(along, side * (half - 1.6), 0);
      concrete.cylinder(p[0], SEA_BED, p[2], 0.75, 0.6, top - SEA_BED, fascia, 10, false);
      physics.addStaticCylinder(p[0], (top + SEA_BED) / 2, p[2], (top - SEA_BED) / 2, 0.7, { kind: 'world', surface: 'concrete' });
    }
  }
}
