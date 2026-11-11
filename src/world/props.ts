import { Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import { WORLD } from '../core/config';
import { Rng } from '../core/rng';
import type { QualityPreset } from '../core/settings';
import type { Physics } from '../physics/physics';
import type { Materials } from '../render/materials';
import { Cell, type WorldField } from './field';
import { MeshBuilder } from './geo';
import type { Layout, Rect } from './layout';
import type { MedianStrip } from './roads';

const GROUND = WORLD.streetY + WORLD.kerb;

export interface PropBuild {
  group: Group;
  /** Street lamp positions, for placing a few real lights near the player at night. */
  lamps: Vector3[];
  palms: Vector3[];
}

interface PalmSpec {
  x: number;
  y: number;
  z: number;
  h: number;
  lean: number;
  yaw: number;
}

/** Palms, street lamps, benches, bins, beach furniture, lifeguard towers and other street dressing. */
export function buildProps(layout: Layout, field: WorldField, medians: MedianStrip[], materials: Materials, physics: Physics, quality: QualityPreset): PropBuild {
  const group = new Group();
  group.name = 'props';
  const rng = new Rng(layout.seed + 5);
  const palms: PalmSpec[] = [];
  const lamps: Vector3[] = [];
  const paint = new MeshBuilder();
  const wood = new MeshBuilder();
  const neon = new MeshBuilder();
  const metal = new MeshBuilder();
  const lampHeads = new MeshBuilder();
  const pools = new MeshBuilder();
  const density = quality.propDensity;

  const free = (x: number, z: number): boolean => {
    const t = field.typeAt(x, z);
    return t === Cell.Sidewalk || t === Cell.Grass || t === Cell.Plaza || t === Cell.Sand;
  };

  // Boulevard medians: palms down the middle.
  for (const m of medians) {
    for (let a = m.a + 4; a < m.b - 3; a += 11) {
      const x = m.axis === 'z' ? m.c : a;
      const z = m.axis === 'z' ? a : m.c;
      palms.push({ x, y: WORLD.streetY + 0.18, z, h: rng.range(8.5, 11.5), lean: rng.range(0, 0.1), yaw: rng.range(0, 6.28) });
    }
  }

  // Sidewalk edges of every block: palms and lamps alternate along road-facing sides.
  for (const b of layout.blocks) {
    if (b.kind === 'yard') continue;
    const r = b.rect;
    const inset = 1.3;
    const sides: { ax: 'x' | 'z'; c: number; a: number; b: number; out: [number, number] }[] = [];
    if (b.roadSides.includes('n')) sides.push({ ax: 'x', c: r.z0 + inset, a: r.x0 + 3, b: r.x1 - 3, out: [0, -1] });
    if (b.roadSides.includes('s')) sides.push({ ax: 'x', c: r.z1 - inset, a: r.x0 + 3, b: r.x1 - 3, out: [0, 1] });
    if (b.roadSides.includes('w')) sides.push({ ax: 'z', c: r.x0 + inset, a: r.z0 + 3, b: r.z1 - 3, out: [-1, 0] });
    if (b.roadSides.includes('e')) sides.push({ ax: 'z', c: r.x1 - inset, a: r.z0 + 3, b: r.z1 - 3, out: [1, 0] });
    for (const s of sides) {
      const spacing = 14;
      let i = 0;
      for (let a = s.a + rng.range(0, 4); a < s.b; a += spacing, i++) {
        const x = s.ax === 'x' ? a : s.c;
        const z = s.ax === 'x' ? s.c : a;
        if (!free(x, z)) continue;
        if (i % 2 === 0) {
          if (rng.chance(0.85 * density)) palms.push({ x, y: GROUND, z, h: rng.range(6.5, 10), lean: rng.range(0, 0.16), yaw: rng.range(0, 6.28) });
        } else {
          streetLamp(paint, lampHeads, x, z, s.out);
          lamps.push(new Vector3(x + s.out[0] * 1.4, GROUND + 6.2, z + s.out[1] * 1.4));
          lampPool(pools, x + s.out[0] * inset, z + s.out[1] * inset, s.out);
          physics.addStaticCylinder(x, GROUND + 3.2, z, 3.2, 0.12, { kind: 'world', surface: 'metal' });
        }
      }
    }
    // Water-facing promenades: benches, railings and more palms.
    for (const side of b.waterSides) {
      const horizontal = side === 'n' || side === 's';
      const lo = (horizontal ? r.x0 : r.z0) + 4;
      const hi = (horizontal ? r.x1 : r.z1) - 4;
      const off = side === 'n' ? r.z0 + 2.4 : side === 's' ? r.z1 - 2.4 : side === 'w' ? r.x0 + 2.4 : r.x1 - 2.4;
      for (let a = lo + rng.range(0, 6); a < hi; a += 17) {
        const x = horizontal ? a : off;
        const z = horizontal ? off : a;
        if (!free(x, z)) continue;
        if (rng.chance(0.5)) palms.push({ x, y: GROUND, z, h: rng.range(6, 9), lean: rng.range(0.05, 0.22), yaw: rng.range(0, 6.28) });
        else bench(paint, wood, x, z, horizontal ? (side === 'n' ? Math.PI : 0) : side === 'w' ? -Math.PI / 2 : Math.PI / 2, physics);
      }
    }
    if (b.kind === 'park') parkDressing(b.rect, rng, palms, paint, wood, physics);
    if (b.kind === 'plaza') plazaDressing(b.rect, rng, palms, paint, neon, metal, physics);
  }

  beachDressing(layout, field, rng, palms, paint, wood, physics, density);
  for (const islet of layout.islets) {
    const n = Math.round(islet.r / 6);
    for (let i = 0; i < n; i++) {
      const a = rng.range(0, 6.28);
      const d = rng.range(0, islet.r * 0.5);
      const x = islet.x + Math.cos(a) * d;
      const z = islet.z + Math.sin(a) * d;
      palms.push({ x, y: field.heightAt(x, z) - 0.1, z, h: rng.range(6, 11), lean: rng.range(0.08, 0.3), yaw: rng.range(0, 6.28) });
    }
  }
  lighthouse(layout, field, paint, neon, lampHeads, physics);
  portDressing(layout, rng, paint, metal, physics);

  // Palm trunk colliders.
  for (const p of palms) physics.addStaticCylinder(p.x, p.y + 2.2, p.z, 2.2, 0.24, { kind: 'world', surface: 'wood' });

  group.add(buildPalms(palms, materials));
  const add = (builder: MeshBuilder, material: Mesh['material'], name: string, cast = true): void => {
    if (builder.empty) return;
    const mesh = new Mesh(builder.build(), material);
    mesh.name = name;
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  };
  add(paint, materials.paint, 'props-paint');
  add(wood, materials.wood, 'props-wood');
  add(metal, materials.metal, 'props-metal');
  add(neon, materials.neon, 'props-neon', false);
  add(lampHeads, materials.lamp, 'lamp-heads', false);
  if (!pools.empty) {
    const mesh = new Mesh(pools.build(), materials.glow);
    mesh.name = 'lamp-pools';
    mesh.matrixAutoUpdate = false;
    mesh.renderOrder = 2;
    group.add(mesh);
  }
  return { group, lamps, palms: palms.map((p) => new Vector3(p.x, p.y, p.z)) };
}

function streetLamp(paint: MeshBuilder, heads: MeshBuilder, x: number, z: number, out: [number, number]): void {
  const pole = new Color(0.16, 0.2, 0.24);
  paint.cylinder(x, GROUND, z, 0.13, 0.08, 6.3, pole, 6, false);
  paint.cylinder(x, GROUND, z, 0.22, 0.16, 0.5, pole, 6, false);
  // Arm reaching over the street.
  const ax = x + out[0] * 0.8;
  const az = z + out[1] * 0.8;
  paint.box(Math.min(x, x + out[0] * 1.7) - 0.05, GROUND + 6.2, Math.min(z, z + out[1] * 1.7) - 0.05, Math.max(x, x + out[0] * 1.7) + 0.05, GROUND + 6.32, Math.max(z, z + out[1] * 1.7) + 0.05, pole);
  heads.box(ax + out[0] * 0.5 - 0.3, GROUND + 6.08, az + out[1] * 0.5 - 0.3, ax + out[0] * 0.5 + 0.3, GROUND + 6.2, az + out[1] * 0.5 + 0.3, new Color(1, 1, 1));
}

/**
 * Pool of light under a lamp at the kerb line (x, z): one half lies on the sidewalk, the other on the
 * roadway 16 cm lower. Both halves sample the same round gradient so the pool reads as one circle.
 */
function lampPool(b: MeshBuilder, x: number, z: number, out: [number, number]): void {
  const R = 8.5;
  const white = new Color(1, 1, 1);
  const tx = -out[1];
  const tz = out[0];
  const ax = x - tx * R;
  const az = z - tz * R;
  const bx = x + tx * R;
  const bz = z + tz * R;
  const yRoad = WORLD.streetY + 0.03;
  const ySide = GROUND + 0.03;
  // Roadway half, from the kerb outward.
  b.quad([ax, yRoad, az], [bx, yRoad, bz], [bx + out[0] * R, yRoad, bz + out[1] * R], [ax + out[0] * R, yRoad, az + out[1] * R], white, [0, 0.5, 1, 1]);
  // Sidewalk half, shorter because the building line is close.
  const d = 4.2;
  const v = 0.5 - (d / R) * 0.5;
  b.quad([bx, ySide, bz], [ax, ySide, az], [ax - out[0] * d, ySide, az - out[1] * d], [bx - out[0] * d, ySide, bz - out[1] * d], white, [1, 0.5, 0, v]);
}

function bench(paint: MeshBuilder, wood: MeshBuilder, x: number, z: number, yaw: number, physics: Physics): void {
  const frame = new Color(0.14, 0.52, 0.5);
  const slat = new Color(1, 1, 1);
  wood.boxRot(x, GROUND + 0.42, z, 1.8, 0.07, 0.5, yaw, slat);
  const bx = x - Math.sin(yaw) * -0.26;
  const bz = z - Math.cos(yaw) * -0.26;
  wood.boxRot(bx, GROUND + 0.5, bz, 1.8, 0.5, 0.06, yaw, slat);
  for (const s of [-0.75, 0.75]) {
    const lx = x + Math.cos(yaw) * s;
    const lz = z - Math.sin(yaw) * s;
    paint.boxRot(lx, GROUND, lz, 0.07, 0.42, 0.5, yaw, frame);
  }
  physics.addStaticBox(x, GROUND + 0.3, z, 0.9, 0.3, 0.3, { kind: 'world', surface: 'wood' }, yaw);
}

function parkDressing(r: Rect, rng: Rng, palms: PalmSpec[], paint: MeshBuilder, wood: MeshBuilder, physics: Physics): void {
  const n = Math.round(((r.x1 - r.x0) * (r.z1 - r.z0)) / 260);
  for (let i = 0; i < n; i++) {
    const x = rng.range(r.x0 + 4, r.x1 - 4);
    const z = rng.range(r.z0 + 4, r.z1 - 4);
    palms.push({ x, y: GROUND, z, h: rng.range(6, 11), lean: rng.range(0, 0.2), yaw: rng.range(0, 6.28) });
  }
  // A bandstand in the middle.
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  const white = new Color(0.98, 0.97, 0.93);
  paint.cylinder(cx, GROUND, cz, 4.2, 4.2, 0.5, white, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    paint.cylinder(cx + Math.sin(a) * 3.7, GROUND + 0.5, cz + Math.cos(a) * 3.7, 0.12, 0.12, 3.2, white, 6, false);
  }
  paint.cylinder(cx, GROUND + 3.7, cz, 4.6, 0.3, 1.6, new Color(0.95, 0.42, 0.5), 8, false);
  physics.addStaticCylinder(cx, GROUND + 0.25, cz, 0.25, 4.2, { kind: 'world', surface: 'wood' });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    bench(paint, wood, cx + Math.sin(a) * 8, cz + Math.cos(a) * 8, a + Math.PI, physics);
  }
}

function plazaDressing(r: Rect, rng: Rng, palms: PalmSpec[], paint: MeshBuilder, neon: MeshBuilder, metal: MeshBuilder, physics: Physics): void {
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  // Fountain: stepped basin with a glowing ring and a deco obelisk.
  const stone = new Color(0.95, 0.93, 0.88);
  paint.cylinder(cx, GROUND, cz, 6.2, 6.2, 0.55, stone, 24);
  paint.cylinder(cx, GROUND + 0.55, cz, 5.6, 5.6, 0.05, new Color(0.25, 0.75, 0.85), 24);
  paint.cylinder(cx, GROUND + 0.55, cz, 2.2, 2.0, 0.9, stone, 16);
  paint.cylinder(cx, GROUND + 1.45, cz, 0.7, 0.35, 5.5, stone, 8);
  metal.cylinder(cx, GROUND + 6.95, cz, 0.5, 0.0, 1.1, new Color(1, 0.82, 0.4), 8, false);
  neon.cylinder(cx, GROUND + 0.56, cz, 5.9, 5.9, 0.07, new Color(0.2, 0.95, 1), 32, false);
  neon.cylinder(cx, GROUND + 1.46, cz, 2.05, 2.05, 0.06, new Color(1, 0.3, 0.65), 24, false);
  physics.addStaticCylinder(cx, GROUND + 0.5, cz, 0.5, 6.2, { kind: 'world', surface: 'concrete' });
  physics.addStaticCylinder(cx, GROUND + 3, cz, 3, 0.9, { kind: 'world', surface: 'concrete' });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = cx + Math.sin(a) * Math.min(26, (r.x1 - r.x0) / 2 - 5);
    const z = cz + Math.cos(a) * Math.min(18, (r.z1 - r.z0) / 2 - 5);
    palms.push({ x, y: GROUND, z, h: rng.range(9, 12), lean: 0.03, yaw: rng.range(0, 6.28) });
  }
}

function beachDressing(layout: Layout, field: WorldField, rng: Rng, palms: PalmSpec[], paint: MeshBuilder, wood: MeshBuilder, physics: Physics, density: number): void {
  const b = layout.beach;
  // Palms scattered on the dry sand near the boardwalk.
  for (let z = b.z0 + 10; z < b.z1 - 10; z += 13) {
    if (rng.chance(0.7 * density)) {
      const x = b.x0 + rng.range(4, 22);
      const zz = z + rng.range(-4, 4);
      if (Math.abs(zz) < 9) continue;
      palms.push({ x, y: field.heightAt(x, zz) - 0.15, z: zz, h: rng.range(7, 12), lean: rng.range(0.1, 0.32), yaw: rng.range(-0.6, 0.6) });
    }
  }
  // Lifeguard towers: small raised huts in loud colours.
  const colours = [0xff5d8f, 0x2ec4b6, 0xffc43d, 0x7b5cff, 0xff8a3d, 0x3aa0ff];
  let k = 0;
  for (let z = b.z0 + 70; z < b.z1 - 40; z += 150) {
    const x = b.x0 + 34;
    const y = field.heightAt(x, z);
    lifeguardTower(paint, wood, x, y, z, new Color(colours[k % colours.length]!), new Color(colours[(k + 2) % colours.length]!), physics);
    k++;
  }
  // Umbrellas and loungers in clusters.
  for (let z = b.z0 + 30; z < b.z1 - 30; z += 24) {
    if (Math.abs(z) < 14 || !rng.chance(0.75 * density)) continue;
    const baseX = b.x0 + rng.range(26, 40);
    const colour = new Color(rng.pick(colours));
    const n = rng.int(2, 4);
    for (let i = 0; i < n; i++) {
      const x = baseX + rng.range(-2, 2);
      const zz = z + i * 4.2 - n * 2.1;
      const y = field.heightAt(x, zz);
      if (y < 0.7) continue;
      umbrella(paint, x, y, zz, colour, rng);
      lounger(wood, paint, x + 1.3, y, zz + 0.4, rng.range(-0.3, 0.3) + Math.PI / 2);
    }
  }
}

function lifeguardTower(paint: MeshBuilder, wood: MeshBuilder, x: number, y: number, z: number, body: Color, trim: Color, physics: Physics): void {
  const white = new Color(1, 1, 1);
  const deck = y + 2.4;
  for (const [dx, dz] of [
    [-1.4, -1.4],
    [1.4, -1.4],
    [-1.4, 1.4],
    [1.4, 1.4],
  ] as const) {
    wood.cylinder(x + dx, y - 0.4, z + dz, 0.12, 0.12, 2.8, white, 6, false);
  }
  wood.box(x - 2.2, deck - 0.14, z - 2.0, x + 2.6, deck, z + 2.0, white);
  paint.box(x - 1.6, deck, z - 1.5, x + 1.2, deck + 2.2, z + 1.5, body);
  // Sloped roof with a wide brim.
  paint.quad([x - 2.0, deck + 2.2, z - 1.9], [x - 2.0, deck + 2.2, z + 1.9], [x + 1.9, deck + 2.9, z + 1.9], [x + 1.9, deck + 2.9, z - 1.9], trim);
  paint.quad([x - 2.0, deck + 2.16, z - 1.9], [x + 1.9, deck + 2.86, z - 1.9], [x + 1.9, deck + 2.86, z + 1.9], [x - 2.0, deck + 2.16, z + 1.9], trim);
  paint.box(x + 1.18, deck + 0.9, z - 1.0, x + 1.22, deck + 1.8, z + 1.0, new Color(0.1, 0.2, 0.26));
  // Stripes and the railing.
  paint.box(x - 1.62, deck + 0.7, z - 1.52, x + 1.22, deck + 0.95, z + 1.52, trim, 'nsew');
  for (const zz of [z - 1.95, z + 1.95]) wood.box(x + 1.2, deck + 0.85, zz - 0.04, x + 2.6, deck + 0.93, zz + 0.04, white);
  wood.box(x + 2.52, deck + 0.85, z - 1.95, x + 2.6, deck + 0.93, z + 1.95, white);
  // Ramp down to the sand on the landward side.
  wood.quad([x - 2.2, deck, z - 0.7], [x - 2.2, deck, z + 0.7], [x - 6.2, y - 0.05, z + 0.7], [x - 6.2, y - 0.05, z - 0.7], white);
  wood.quad([x - 2.2, deck - 0.05, z - 0.7], [x - 6.2, y - 0.1, z - 0.7], [x - 6.2, y - 0.1, z + 0.7], [x - 2.2, deck - 0.05, z + 0.7], white);
  physics.addStaticBox(x + 0.2, deck - 0.07, z, 2.4, 0.07, 2.0, { kind: 'world', surface: 'wood' });
  physics.addStaticBox(x - 0.2, deck + 1.1, z, 1.4, 1.1, 1.5, { kind: 'world', surface: 'wood' });
  const slope = Math.atan2(deck - y, 4);
  physics.addStaticBoxQuat(x - 4.2, (deck + y) / 2 - 0.1, z, Math.hypot(4, deck - y) / 2, 0.08, 0.7, { x: 0, y: 0, z: Math.sin(slope / 2), w: Math.cos(slope / 2) }, { kind: 'world', surface: 'wood' });
}

function umbrella(paint: MeshBuilder, x: number, y: number, z: number, colour: Color, rng: Rng): void {
  const white = new Color(1, 1, 1);
  paint.cylinder(x, y - 0.3, z, 0.04, 0.04, 2.6, white, 5, false);
  const segs = 8;
  const top = y + 2.35;
  const rim = y + 1.95;
  const r = 1.55;
  const tilt = rng.range(-0.15, 0.15);
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const c = i % 2 === 0 ? colour : white;
    const p0: [number, number, number] = [x + Math.sin(a0) * r, rim + Math.sin(a0) * tilt, z + Math.cos(a0) * r];
    const p1: [number, number, number] = [x + Math.sin(a1) * r, rim + Math.sin(a1) * tilt, z + Math.cos(a1) * r];
    paint.triangle([x, top, z], p0, p1, c);
    paint.triangle([x, top - 0.02, z], p1, p0, c);
  }
}

function lounger(wood: MeshBuilder, paint: MeshBuilder, x: number, y: number, z: number, yaw: number): void {
  const white = new Color(1, 1, 1);
  wood.boxRot(x, y + 0.28, z, 0.65, 0.06, 1.9, yaw, white);
  paint.boxRot(x, y + 0.34, z, 0.6, 0.05, 1.8, yaw, new Color(0.3, 0.8, 0.82));
  wood.boxRot(x, y, z, 0.6, 0.28, 0.08, yaw, white);
}

function lighthouse(layout: Layout, field: WorldField, paint: MeshBuilder, neon: MeshBuilder, heads: MeshBuilder, physics: Physics): void {
  const { x, z } = layout.lighthouse;
  const y = field.heightAt(x, z) - 0.3;
  const white = new Color(0.98, 0.97, 0.94);
  const red = new Color(0.95, 0.3, 0.32);
  paint.cylinder(x, y, z, 5.2, 5.2, 1.2, new Color(0.7, 0.68, 0.64), 16);
  let r = 3.3;
  let h = y + 1.2;
  for (let i = 0; i < 6; i++) {
    const r1 = r - 0.3;
    paint.cylinder(x, h, z, r, r1, 4.2, i % 2 === 0 ? white : red, 16, false);
    r = r1;
    h += 4.2;
  }
  paint.cylinder(x, h, z, r + 0.9, r + 0.9, 0.25, new Color(0.15, 0.2, 0.24), 16);
  heads.cylinder(x, h + 0.25, z, r - 0.2, r - 0.2, 2.0, new Color(1, 1, 1), 12, false);
  paint.cylinder(x, h + 2.25, z, r + 0.2, 0.1, 1.6, red, 12, false);
  neon.cylinder(x, h + 0.02, z, r + 0.95, r + 0.95, 0.08, new Color(1, 0.85, 0.4), 16, false);
  physics.addStaticCylinder(x, y + 13, z, 13.5, 3.2, { kind: 'world', surface: 'concrete' });
  physics.addStaticCylinder(x, y + 0.6, z, 0.6, 5.2, { kind: 'world', surface: 'concrete' });
}

/** Container stacks and two gantry cranes in the port yard. */
function portDressing(layout: Layout, rng: Rng, paint: MeshBuilder, metal: MeshBuilder, physics: Physics): void {
  const yard = layout.blocks.find((b) => b.kind === 'yard');
  if (!yard) return;
  const r = yard.rect;
  const colours = [0xd1495b, 0x2e86ab, 0xedae49, 0x3c896d, 0xe07a5f, 0x5f6caf, 0xf2f2f2, 0x00a6a6].map((h) => new Color(h));
  const y0 = WORLD.streetY;
  const cl = 12.2;
  const cw = 2.44;
  const ch = 2.6;
  for (let x = r.x0 + 30; x < r.x1 - 96; x += 46) {
    for (let row = 0; row < 5; row++) {
      // Rows come in pairs with a truck lane between them.
      const z = r.z0 + 76 + row * 3.1 + Math.floor(row / 2) * 9.5;
      for (let slot = 0; slot < 3; slot++) {
        const cx = x + slot * (cl + 0.4) - cl;
        const stack = rng.weighted([[0, 2], [1, 3], [2, 4], [3, 3], [4, 1]] as const);
        for (let level = 0; level < stack; level++) {
          const c = rng.pick(colours);
          const yb = y0 + level * ch;
          paint.box(cx, yb, z - cw / 2, cx + cl, yb + ch, z + cw / 2, c);
          // Ribbing.
          for (let k = 1; k < 12; k++) {
            paint.box(cx + k * (cl / 12) - 0.03, yb + 0.15, z - cw / 2 - 0.03, cx + k * (cl / 12) + 0.03, yb + ch - 0.15, z - cw / 2, c.clone().multiplyScalar(0.8), 'n');
            paint.box(cx + k * (cl / 12) - 0.03, yb + 0.15, z + cw / 2, cx + k * (cl / 12) + 0.03, yb + ch - 0.15, z + cw / 2 + 0.03, c.clone().multiplyScalar(0.8), 's');
          }
        }
        if (stack > 0) physics.addStaticBox(cx + cl / 2, y0 + (stack * ch) / 2, z, cl / 2, (stack * ch) / 2, cw / 2, { kind: 'world', surface: 'metal' });
      }
    }
  }
  // Gantry cranes on the south quay.
  const craneColour = new Color(0.95, 0.5, 0.15);
  for (const cx of [r.x0 + 120, r.x0 + 300]) {
    const z = r.z1 - 14;
    for (const [dx, dz] of [
      [-9, -7],
      [9, -7],
      [-9, 7],
      [9, 7],
    ] as const) {
      metal.box(cx + dx - 0.6, y0, z + dz - 0.6, cx + dx + 0.6, y0 + 30, z + dz + 0.6, craneColour);
      physics.addStaticBox(cx + dx, y0 + 15, z + dz, 0.6, 15, 0.6, { kind: 'world', surface: 'metal' });
    }
    metal.box(cx - 10, y0 + 30, z - 8, cx + 10, y0 + 32, z + 8, craneColour);
    metal.box(cx - 1.4, y0 + 32, z - 22, cx + 1.4, y0 + 34.2, z + 46, craneColour);
    metal.box(cx - 2.2, y0 + 27.5, z + 20, cx + 2.2, y0 + 30, z + 25, new Color(0.9, 0.9, 0.9));
    metal.box(cx - 0.3, y0 + 34.2, z - 4, cx + 0.3, y0 + 44, z - 3.4, craneColour);
  }
}

/** All palms as two instanced meshes: trunks and crowns. */
function buildPalms(palms: PalmSpec[], materials: Materials): Group {
  const group = new Group();
  group.name = 'palms';
  if (palms.length === 0) return group;

  // Trunk: a tapered, slightly curved column of unit height.
  const trunk = new MeshBuilder();
  const bark = new Color(0.62, 0.5, 0.38);
  const bark2 = new Color(0.5, 0.4, 0.3);
  const rings = 9;
  for (let i = 0; i < rings; i++) {
    const t0 = i / rings;
    const t1 = (i + 1) / rings;
    const bend = (t: number): number => t * t * 0.09;
    const r0 = 0.03 - t0 * 0.012;
    trunk.cylinder(bend(t0), t0, 0, r0 * 1.12, r0, t1 - t0, i % 2 === 0 ? bark : bark2, 7, false);
  }
  const trunkMesh = new InstancedMesh(trunk.build(), materials.paint, palms.length);

  // Crown: fronds as bent strips radiating from the top, each a textured quad chain.
  const crown = new MeshBuilder();
  const leaf = new Color(1, 1, 1);
  const fronds = 13;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + (i % 2) * 0.2;
    const droop = 0.55 + (i % 3) * 0.16;
    const len = 0.36 + (i % 4) * 0.035;
    const segs = 5;
    const half = 0.085;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const px = -sz;
    const pz = sx;
    let prev: [number, number, number, number] | null = null;
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const out = t * len;
      const y = Math.sin(t * 1.3) * 0.11 - t * t * droop * 0.24;
      const cx = sx * out;
      const cz = sz * out;
      const l = crown.vertex(cx + px * half, y, cz + pz * half, 0, 1, 0, t, 0, leaf);
      const r = crown.vertex(cx - px * half, y, cz - pz * half, 0, 1, 0, t, 1, leaf);
      if (prev) {
        crown.tri(prev[0], prev[1], r);
        crown.tri(prev[0], r, l);
      }
      prev = [l, r, 0, 0];
    }
  }
  // Coconuts.
  crown.cylinder(0, -0.02, 0, 0.022, 0.03, 0.03, new Color(0.3, 0.42, 0.18), 6);
  const crownMesh = new InstancedMesh(crown.build(), materials.frond, palms.length);

  const m = new Matrix4();
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const axis = new Vector3();
  const dummy = new Object3D();
  palms.forEach((p, i) => {
    axis.set(Math.cos(p.yaw), 0, Math.sin(p.yaw));
    q.setFromAxisAngle(up, p.yaw);
    dummy.position.set(p.x, p.y, p.z);
    dummy.quaternion.setFromAxisAngle(axis, p.lean).multiply(q);
    dummy.scale.set(p.h, p.h, p.h);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);
    // Crown sits at the trunk top (unit trunk bends 0.09 in local x).
    m.copy(dummy.matrix);
    const top = new Vector3(0.09, 1, 0).applyMatrix4(m);
    dummy.position.copy(top);
    dummy.scale.setScalar(p.h * 0.9 + 3.2);
    dummy.updateMatrix();
    crownMesh.setMatrixAt(i, dummy.matrix);
  });
  for (const mesh of [trunkMesh, crownMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  trunkMesh.name = 'palm-trunks';
  crownMesh.name = 'palm-crowns';
  return group;
}
