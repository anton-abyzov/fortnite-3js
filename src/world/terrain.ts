import { Color, Group, Mesh } from 'three';
import { WORLD } from '../core/config';
import { smoothstep } from '../core/math';
import { hash2 } from '../core/rng';
import type { Physics } from '../physics/physics';
import type { Materials } from '../render/materials';
import { beachHeight, isletHeight, SEA_BED } from './field';
import { MeshBuilder } from './geo';
import { type Layout, type Rect, rectContains, type Side } from './layout';

const STREET = WORLD.streetY;
const BLOCK = WORLD.streetY + WORLD.kerb;
const WHITE = new Color(1, 1, 1);

/** Builds the ground: island slabs with seawalls, kerbed blocks, beach, islets, piers and water stairs. */
export function buildTerrain(layout: Layout, materials: Materials, physics: Physics): Group {
  const group = new Group();
  group.name = 'terrain';
  const asphalt = new MeshBuilder();
  const concrete = new MeshBuilder();
  const sidewalk = new MeshBuilder();
  const grass = new MeshBuilder();
  const plaza = new MeshBuilder();
  const wood = new MeshBuilder();
  const paint = new MeshBuilder();
  const pool = new MeshBuilder();
  concrete.uvScale = 0.2;

  const wallTint = new Color(0.86, 0.84, 0.8);
  const capTint = new Color(0.97, 0.95, 0.9);
  const kerbTint = new Color(0.8, 0.8, 0.78);

  // Island slabs: asphalt on top, seawall on the sides, a pale cap along the edge.
  const lands: Rect[] = [...layout.islands.map((i) => i.rect), layout.blocks.find((b) => b.kind === 'yard')!.rect];
  for (const r of lands) {
    asphalt.floor(r.x0, r.z0, r.x1, r.z1, STREET, WHITE);
    concrete.box(r.x0, SEA_BED - 1, r.z0, r.x1, STREET, r.z1, wallTint, 'nsew');
    physics.addStaticBox((r.x0 + r.x1) / 2, (STREET + SEA_BED - 2) / 2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, (STREET - SEA_BED + 2) / 2, (r.z1 - r.z0) / 2, { kind: 'world', surface: 'asphalt' });
  }

  // Blocks: raised slabs with kerbs.
  for (const b of layout.blocks) {
    if (b.kind === 'yard') continue;
    const r = b.rect;
    const top = b.kind === 'park' ? grass : b.kind === 'plaza' ? plaza : sidewalk;
    top.floor(r.x0, r.z0, r.x1, r.z1, BLOCK, WHITE);
    concrete.box(r.x0, STREET, r.z0, r.x1, BLOCK, r.z1, kerbTint, 'nsew');
    if (b.kind === 'park') {
      // A paved border around the lawn.
      const w = 2.2;
      sidewalk.floor(r.x0, r.z0, r.x1, r.z0 + w, BLOCK + 0.012, WHITE);
      sidewalk.floor(r.x0, r.z1 - w, r.x1, r.z1, BLOCK + 0.012, WHITE);
      sidewalk.floor(r.x0, r.z0 + w, r.x0 + w, r.z1 - w, BLOCK + 0.012, WHITE);
      sidewalk.floor(r.x1 - w, r.z0 + w, r.x1, r.z1 - w, BLOCK + 0.012, WHITE);
    }
    physics.addStaticBox((r.x0 + r.x1) / 2, (STREET + BLOCK) / 2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, WORLD.kerb / 2, (r.z1 - r.z0) / 2, {
      kind: 'world',
      surface: b.kind === 'park' ? 'grass' : b.kind === 'plaza' ? 'tile' : 'concrete',
    });
    // Seawall cap where the block meets water.
    for (const side of b.waterSides) seawallCap(concrete, paint, r, side, capTint, hasStair(layout, r, side));
  }

  // Open lots inside building blocks.
  const bay = new Color(0.9, 0.9, 0.86);
  for (const lot of layout.lots) {
    const r = lot.rect;
    if (lot.use === 'parking') {
      asphalt.floor(r.x0, r.z0, r.x1, r.z1, BLOCK + 0.015, new Color(0.82, 0.82, 0.84));
      const alongX = r.x1 - r.x0 > r.z1 - r.z0;
      const n = Math.floor((alongX ? r.x1 - r.x0 : r.z1 - r.z0) / 2.8);
      for (let i = 1; i < n; i++) {
        const p = (alongX ? r.x0 : r.z0) + i * 2.8;
        if (alongX) {
          paint.floor(p - 0.06, r.z0 + 0.6, p + 0.06, r.z0 + 5.4, BLOCK + 0.03, bay);
          paint.floor(p - 0.06, r.z1 - 5.4, p + 0.06, r.z1 - 0.6, BLOCK + 0.03, bay);
        } else {
          paint.floor(r.x0 + 0.6, p - 0.06, r.x0 + 5.4, p + 0.06, BLOCK + 0.03, bay);
          paint.floor(r.x1 - 5.4, p - 0.06, r.x1 - 0.6, p + 0.06, BLOCK + 0.03, bay);
        }
      }
    } else if (lot.use === 'garden') {
      grass.floor(r.x0 + 0.5, r.z0 + 0.5, r.x1 - 0.5, r.z1 - 0.5, BLOCK + 0.02, WHITE);
    } else if (lot.use === 'pool') {
      buildPoolDeck(r, lot.seed, plaza, pool, paint, physics);
    }
  }

  // Port yard markings: a painted grid of container bays.
  const yard = layout.blocks.find((b) => b.kind === 'yard')!.rect;
  const yellow = new Color(0.95, 0.72, 0.12);
  for (let x = yard.x0 + 20; x < yard.x1 - 10; x += 50) paint.floor(x - 0.1, yard.z0 + 14, x + 0.1, yard.z1 - 8, STREET + 0.02, yellow);
  for (const side of ['w', 'e', 's'] as Side[]) seawallCap(concrete, paint, yard, side, capTint, hasStair(layout, yard, side));

  // Piers.
  const plank = new Color(1, 1, 1);
  const post = new Color(0.55, 0.42, 0.3);
  for (const pier of layout.piers) {
    const r = pier.rect;
    const y = pier.y;
    wood.uvScale = 0.5;
    const alongX = r.x1 - r.x0 > r.z1 - r.z0;
    // Planks run across the pier.
    if (alongX) wood.floor(r.x0, r.z0, r.x1, r.z1, y, plank);
    else {
      // Rotate UVs by building the quad by hand so planks still run across.
      wood.quad([r.x0, y, r.z0], [r.x0, y, r.z1], [r.x1, y, r.z1], [r.x1, y, r.z0], plank, [r.z0 * 0.5, r.x0 * 0.5, r.z1 * 0.5, r.x1 * 0.5]);
    }
    wood.box(r.x0, y - 0.35, r.z0, r.x1, y, r.z1, post, 'nsewb');
    const step = 7;
    for (let a = (alongX ? r.x0 : r.z0) + 1.5; a < (alongX ? r.x1 : r.z1); a += step) {
      for (const s of [0.25, -0.25]) {
        const px = alongX ? a : s > 0 ? r.x0 + 0.25 : r.x1 - 0.25;
        const pz = alongX ? (s > 0 ? r.z0 + 0.25 : r.z1 - 0.25) : a;
        wood.cylinder(px, SEA_BED, pz, 0.2, 0.2, y - SEA_BED + 0.9, post, 7, true);
      }
    }
    physics.addStaticBox((r.x0 + r.x1) / 2, y - 0.2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, 0.2, (r.z1 - r.z0) / 2, { kind: 'world', surface: 'wood' });
  }

  // Stairs down into the water.
  for (const st of layout.stairs) buildStair(st.x, st.z, st.dir, st.width, concrete, physics);

  // Sea bed far below everything, so nothing falls forever.
  physics.addStaticBox(0, SEA_BED - 1, 0, WORLD.bound + 100, 1, WORLD.bound + 100, { kind: 'world', surface: 'sand' });

  const add = (builder: MeshBuilder, material: Mesh['material'], name: string, cast = false): void => {
    if (builder.empty) return;
    const mesh = new Mesh(builder.build(), material);
    mesh.name = name;
    mesh.receiveShadow = true;
    mesh.castShadow = cast;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  };
  add(asphalt, materials.asphalt, 'asphalt');
  add(concrete, materials.concrete, 'concrete', true);
  add(sidewalk, materials.sidewalk, 'sidewalk');
  add(grass, materials.grass, 'grass');
  add(plaza, materials.plaza, 'plaza');
  add(wood, materials.wood, 'piers', true);
  add(paint, materials.marking, 'ground-paint');
  add(pool, materials.pool, 'pools');

  group.add(buildSand(layout, materials, physics));
  return group;
}

function hasStair(layout: Layout, r: Rect, side: Side): number[] {
  // Positions along the edge where a stair opens the cap.
  const out: number[] = [];
  for (const st of layout.stairs) {
    const onEdge =
      (side === 'n' && st.dir === 'n' && Math.abs(st.z - r.z0) < 0.6 && st.x > r.x0 && st.x < r.x1) ||
      (side === 's' && st.dir === 's' && Math.abs(st.z - r.z1) < 0.6 && st.x > r.x0 && st.x < r.x1) ||
      (side === 'w' && st.dir === 'w' && Math.abs(st.x - r.x0) < 0.6 && st.z > r.z0 && st.z < r.z1) ||
      (side === 'e' && st.dir === 'e' && Math.abs(st.x - r.x1) < 0.6 && st.z > r.z0 && st.z < r.z1);
    if (onEdge) out.push(side === 'n' || side === 's' ? st.x : st.z);
  }
  return out;
}

/** A low coping along a water edge with a painted stripe, broken where stairs go down. */
function seawallCap(concrete: MeshBuilder, paint: MeshBuilder, r: Rect, side: Side, tint: Color, gaps: number[]): void {
  const w = 0.45;
  const h = 0.22;
  const horizontal = side === 'n' || side === 's';
  const lo = horizontal ? r.x0 : r.z0;
  const hi = horizontal ? r.x1 : r.z1;
  const cuts = gaps.slice().sort((a, b) => a - b);
  const spans: [number, number][] = [];
  let cur = lo;
  for (const g of cuts) {
    if (g - 2.2 > cur) spans.push([cur, g - 2.2]);
    cur = g + 2.2;
  }
  if (hi > cur) spans.push([cur, hi]);
  const stripe = new Color(0.2, 0.75, 0.72);
  for (const [a, b] of spans) {
    if (side === 'n') {
      concrete.box(a, BLOCK, r.z0, b, BLOCK + h, r.z0 + w, tint);
      paint.floor(a, r.z0 + w + 0.15, b, r.z0 + w + 0.3, BLOCK + 0.02, stripe);
    } else if (side === 's') {
      concrete.box(a, BLOCK, r.z1 - w, b, BLOCK + h, r.z1, tint);
      paint.floor(a, r.z1 - w - 0.3, b, r.z1 - w - 0.15, BLOCK + 0.02, stripe);
    } else if (side === 'w') {
      concrete.box(r.x0, BLOCK, a, r.x0 + w, BLOCK + h, b, tint);
      paint.floor(r.x0 + w + 0.15, a, r.x0 + w + 0.3, b, BLOCK + 0.02, stripe);
    } else {
      concrete.box(r.x1 - w, BLOCK, a, r.x1, BLOCK + h, b, tint);
      paint.floor(r.x1 - w - 0.3, a, r.x1 - w - 0.15, b, BLOCK + 0.02, stripe);
    }
  }
}

function buildPoolDeck(r: Rect, seed: number, deck: MeshBuilder, pool: MeshBuilder, paint: MeshBuilder, physics: Physics): void {
  deck.floor(r.x0, r.z0, r.x1, r.z1, BLOCK + 0.02, new Color(1, 1, 1));
  const mx = (r.x1 - r.x0) * 0.22;
  const mz = (r.z1 - r.z0) * 0.24;
  const p: Rect = { x0: r.x0 + mx, x1: r.x1 - mx, z0: r.z0 + mz, z1: r.z1 - mz };
  const coping = new Color(0.98, 0.98, 0.95);
  const c = 0.35;
  const y = BLOCK + 0.02;
  // Coping ring.
  paint.box(p.x0 - c, y, p.z0 - c, p.x1 + c, y + 0.12, p.z0, coping);
  paint.box(p.x0 - c, y, p.z1, p.x1 + c, y + 0.12, p.z1 + c, coping);
  paint.box(p.x0 - c, y, p.z0, p.x0, y + 0.12, p.z1, coping);
  paint.box(p.x1, y, p.z0, p.x1 + c, y + 0.12, p.z1, coping);
  pool.floor(p.x0, p.z0, p.x1, p.z1, y + 0.06, new Color(1, 1, 1));
  void seed;
  void physics;
}

function buildStair(x: number, z: number, dir: Side, width: number, concrete: MeshBuilder, physics: Physics): void {
  const steps = 13;
  const rise = (STREET + 0.5) / steps;
  const run = 0.42;
  const tint = new Color(0.9, 0.88, 0.84);
  const dx = dir === 'e' ? 1 : dir === 'w' ? -1 : 0;
  const dz = dir === 's' ? 1 : dir === 'n' ? -1 : 0;
  const hw = width / 2;
  for (let i = 0; i < steps; i++) {
    const top = BLOCK - i * rise - (i === 0 ? 0 : 0);
    const a = i * run;
    const b = a + run;
    const x0 = dx !== 0 ? x + Math.min(a * dx, b * dx) : x - hw;
    const x1 = dx !== 0 ? x + Math.max(a * dx, b * dx) : x + hw;
    const z0 = dz !== 0 ? z + Math.min(a * dz, b * dz) : z - hw;
    const z1 = dz !== 0 ? z + Math.max(a * dz, b * dz) : z + hw;
    concrete.box(x0, SEA_BED, z0, x1, top, z1, tint, 'nsewt');
  }
  // One ramp collider under the steps keeps walking smooth.
  const len = steps * run;
  const drop = steps * rise;
  const slope = Math.atan2(drop, len);
  const hyp = Math.hypot(len, drop) / 2;
  const cx = x + dx * (len / 2);
  const cz = z + dz * (len / 2);
  const cy = BLOCK - drop / 2 - 0.3 * Math.cos(slope);
  // Rotation that tips the box down along the stair direction.
  const half = slope / 2;
  const q = dx !== 0 ? { x: 0, y: 0, z: -Math.sin(half) * dx, w: Math.cos(half) } : { x: Math.sin(half) * dz, y: 0, z: 0, w: Math.cos(half) };
  physics.addStaticBoxQuat(cx, cy, cz, dx !== 0 ? hyp : hw, 0.3, dz !== 0 ? hyp : hw, q, { kind: 'world', surface: 'concrete' });
}

/** Beach and islet sand as height grids, with matching triangle-mesh colliders. */
function buildSand(layout: Layout, materials: Materials, physics: Physics): Group {
  const group = new Group();
  group.name = 'sand';
  const isl = layout.beach.rect;
  const patches: { x0: number; x1: number; z0: number; z1: number; step: number; height: (x: number, z: number) => number; skip?: (x: number, z: number) => boolean }[] = [
    {
      x0: isl.x0,
      x1: isl.x1 + 126,
      z0: -WORLD.half,
      z1: WORLD.half,
      step: 2.5,
      height: (x, z) => beachHeight(layout, x, z),
      // Cells fully under the island slab are not needed.
      skip: (x, z) => rectContains(isl, x, z, -3),
    },
    ...layout.islets.map((islet) => ({
      x0: islet.x - islet.r * 1.85,
      x1: islet.x + islet.r * 1.85,
      z0: islet.z - islet.r * 1.85,
      z1: islet.z + islet.r * 1.85,
      step: 2,
      height: (x: number, z: number) => isletHeight(islet, x, z),
    })),
  ];
  const dry = new Color(1, 1, 1);
  const wet = new Color(0.74, 0.68, 0.56);
  const deep = new Color(0.5, 0.62, 0.6);
  const c = new Color();
  for (const p of patches) {
    const nx = Math.round((p.x1 - p.x0) / p.step);
    const nz = Math.round((p.z1 - p.z0) / p.step);
    const b = new MeshBuilder();
    const index = new Int32Array((nx + 1) * (nz + 1)).fill(-1);
    const hs = new Float32Array((nx + 1) * (nz + 1));
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) hs[j * (nx + 1) + i] = p.height(p.x0 + i * p.step, p.z0 + j * p.step);
    const vert = (i: number, j: number): number => {
      const k = j * (nx + 1) + i;
      if (index[k]! >= 0) return index[k]!;
      const x = p.x0 + i * p.step;
      const z = p.z0 + j * p.step;
      const h = hs[k]!;
      const hx0 = hs[j * (nx + 1) + Math.max(0, i - 1)]!;
      const hx1 = hs[j * (nx + 1) + Math.min(nx, i + 1)]!;
      const hz0 = hs[Math.max(0, j - 1) * (nx + 1) + i]!;
      const hz1 = hs[Math.min(nz, j + 1) * (nx + 1) + i]!;
      const nxv = (hx0 - hx1) / (2 * p.step);
      const nzv = (hz0 - hz1) / (2 * p.step);
      const nl = Math.hypot(nxv, 1, nzv);
      // Wet sand darkens toward the waterline; under water it takes a blue-green cast.
      const wetness = 1 - smoothstep(0.05, 0.7, h);
      c.copy(dry).lerp(wet, wetness * 0.8);
      if (h < 0) c.lerp(deep, smoothstep(0, -3, h));
      const speck = 0.96 + hash2(i, j, 5) * 0.08;
      c.multiplyScalar(speck);
      const id = b.vertex(x, h, z, nxv / nl, 1 / nl, nzv / nl, x * 0.12, z * 0.12, c);
      index[k] = id;
      return id;
    };
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const cx = p.x0 + (i + 0.5) * p.step;
        const cz = p.z0 + (j + 0.5) * p.step;
        if (p.skip?.(cx, cz)) continue;
        const h00 = hs[j * (nx + 1) + i]!;
        const h11 = hs[(j + 1) * (nx + 1) + i + 1]!;
        const h10 = hs[j * (nx + 1) + i + 1]!;
        const h01 = hs[(j + 1) * (nx + 1) + i]!;
        // Skip quads that lie flat on the sea bed.
        if (Math.max(h00, h11, h10, h01) < SEA_BED + 0.02) continue;
        const a = vert(i, j);
        const bb = vert(i, j + 1);
        const cc = vert(i + 1, j + 1);
        const d = vert(i + 1, j);
        b.tri(a, bb, cc);
        b.tri(a, cc, d);
      }
    }
    if (b.empty) continue;
    const mesh = new Mesh(b.build(), materials.sand);
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.name = 'sand-patch';
    group.add(mesh);
    const col = b.collisionData();
    physics.addStaticTrimesh(col.vertices, col.indices, { kind: 'world', surface: 'sand' });
  }
  return group;
}
