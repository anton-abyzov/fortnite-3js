import { type Object3D, Quaternion, Vector3 } from 'three';
import type { Character } from '../character/character';
import { GROUP, groups, WORLD } from '../core/config';
import { clamp } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { Layout, Rect, WaterSlot } from '../world/layout';
import { type Berth, Boat, type CraftSpec, Sea } from './boat';
import { BOAT_PAINTS, BOAT_SCALE, boatVisual, SCENERY_MODELS, SPEEDBOATS } from './boatSpecs';
import { JETSKI, JETSKI_PAINTS, jetSkiVisual } from './jetski';

/** A craft this close to the player is simulated; one further than `SLEEP_AT` and at rest only bobs. */
const WAKE_AT = 60;
const SLEEP_AT = 78;
/** Clear water left between a moored bow and the dock it points at. */
const DOCK_GAP = 0.45;

const UP = new Vector3(0, 1, 0);
const _q = new Quaternion();
const _n = new Vector3();

interface Solid {
  rect: Rect;
  /** Height of the top you can stand on. */
  y: number;
}

/** Distance along a ray on the ground plane to an axis-aligned rectangle, or Infinity. */
function rayRect(x: number, z: number, dx: number, dz: number, r: Rect): number {
  let t0 = 0;
  let t1 = Infinity;
  for (const [o, d, lo, hi] of [
    [x, dx, r.x0, r.x1],
    [z, dz, r.z0, r.z1],
  ] as const) {
    if (Math.abs(d) < 1e-6) {
      if (o < lo || o > hi) return Infinity;
      continue;
    }
    const a = (lo - o) / d;
    const b = (hi - o) / d;
    t0 = Math.max(t0, Math.min(a, b));
    t1 = Math.min(t1, Math.max(a, b));
  }
  return t0 <= t1 ? t0 : Infinity;
}

/** What a berth is worked out from: the things a hull can lie against, and the map. */
interface Shore {
  solids: Solid[];
  layout: Layout;
  /** True where a quay stands: land high enough that it is a wall to a hull, not a beach. */
  quay(x: number, z: number): boolean;
  heightAt(x: number, z: number): number;
}

/** The quay stairs: thirteen steps of 0.42 m, from the kerb down to half a metre under the water. */
const STAIR = { steps: 13, run: 0.42, drop: WORLD.streetY + 0.5 };

/**
 * Where a craft ties up at a slot.
 *
 * A slot beside a pier points at it: the hull is slid along its own heading until the bow is just clear,
 * whatever its length. The canal and creek slots are out in the middle of the water, where a moored
 * hull is in everybody's way and nobody can reach it dry, so those craft are taken to the nearest quay
 * stairs and tied up bow to the wall beside the bottom steps, or failing stairs laid alongside the
 * nearest quay. Only a slot with nothing near it keeps its place in open water.
 */
function berthAt(slot: WaterSlot, length: number, beam: number, shore: Shore): Berth {
  const fx = -Math.sin(slot.yaw);
  const fz = -Math.cos(slot.yaw);
  let ahead = Infinity;
  let top = 0;
  for (const s of shore.solids) {
    const d = rayRect(slot.x, slot.z, fx, fz, s.rect);
    if (d < ahead) {
      ahead = d;
      top = s.y;
    }
  }
  if (ahead <= 7) {
    const reach = length * 0.5 + DOCK_GAP;
    const shift = clamp(ahead - reach, -3, 2.5);
    const x = slot.x + fx * shift;
    const z = slot.z + fz * shift;
    const edge = ahead - shift;
    return { x, z, yaw: slot.yaw, dock: { x: x + fx * (edge + 0.9), y: top, z: z + fz * (edge + 0.9) } };
  }
  return besideStairs(slot, length, beam, shore) ?? alongsideQuay(slot, length, beam, shore) ?? { x: slot.x, z: slot.z, yaw: slot.yaw, dock: null };
}

/** Bow to the wall beside the nearest stairs, close enough to step aboard from the bottom steps. */
function besideStairs(slot: WaterSlot, length: number, beam: number, shore: Shore): Berth | null {
  let best: Layout['stairs'][number] | null = null;
  let bestD = 34;
  for (const st of shore.layout.stairs) {
    const d = Math.hypot(st.x - slot.x, st.z - slot.z);
    if (d < bestD) {
      bestD = d;
      best = st;
    }
  }
  if (!best) return null;
  // Out from the wall, toward the water.
  const ox = best.dir === 'e' ? 1 : best.dir === 'w' ? -1 : 0;
  const oz = best.dir === 's' ? 1 : best.dir === 'n' ? -1 : 0;
  // Along the wall, on the slot's side of the stairs.
  const tx = oz !== 0 ? 1 : 0;
  const tz = ox !== 0 ? 1 : 0;
  const side = (slot.x - best.x) * tx + (slot.z - best.z) * tz >= 0 ? 1 : -1;
  const across = side * (best.width / 2 + 0.55 + beam / 2);
  const out = DOCK_GAP + length / 2;
  const x = best.x + tx * across + ox * out;
  const z = best.z + tz * across + oz * out;
  // The wall has to be there for the bow to point at, and the water for the hull to lie in.
  if (!shore.quay(x - ox * (out + 1), z - oz * (out + 1)) || shore.quay(x + ox * length * 0.5, z + oz * length * 0.5)) return null;
  // A step a hand's breadth above the water, on the hull's side of the stairs.
  const step = 9;
  const down = (step + 0.5) * STAIR.run;
  const inStairs = side * (best.width / 2 - 0.6);
  return {
    x,
    z,
    yaw: Math.atan2(ox, oz),
    dock: { x: best.x + tx * inStairs + ox * down, y: WORLD.streetY + WORLD.kerb - step * (STAIR.drop / STAIR.steps), z: best.z + tz * inStairs + oz * down },
  };
}

/** Side on to the nearest quay or pier within reach, where the crew can hop down from the top. */
function alongsideQuay(slot: WaterSlot, length: number, beam: number, shore: Shore): Berth | null {
  let best: { d: number; dx: number; dz: number; y: number } | null = null;
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    let d = Infinity;
    let y = 0;
    for (const s of shore.solids) {
      const hit = rayRect(slot.x, slot.z, dx, dz, s.rect);
      if (hit < d) {
        d = hit;
        y = s.y;
      }
    }
    for (let m = 0.5; m < Math.min(d, 24); m += 0.5) {
      if (!shore.quay(slot.x + dx * m, slot.z + dz * m)) continue;
      d = m;
      y = shore.heightAt(slot.x + dx * (m + 1), slot.z + dz * (m + 1));
      break;
    }
    if (d <= 24 && (!best || d < best.d)) best = { d, dx, dz, y };
  }
  if (!best) return null;
  const { d, dx, dz, y } = best;
  // Along the wall, the way the slot was already heading as near as can be.
  let tx = -dz;
  let tz = dx;
  if (tx * -Math.sin(slot.yaw) + tz * -Math.cos(slot.yaw) < 0) {
    tx = -tx;
    tz = -tz;
  }
  const wallX = slot.x + dx * d;
  const wallZ = slot.z + dz * d;
  // The wall has to run the length of the hull: no berth half round a corner.
  const wallAt = (along: number): boolean => {
    const px = wallX + tx * along + dx * 0.75;
    const pz = wallZ + tz * along + dz * 0.75;
    return shore.quay(px, pz) || shore.solids.some((s) => px >= s.rect.x0 && px <= s.rect.x1 && pz >= s.rect.z0 && pz <= s.rect.z1);
  };
  if (!wallAt(-length / 2) || !wallAt(length / 2)) return null;
  const off = beam / 2 + 0.6;
  return {
    x: wallX - dx * off,
    z: wallZ - dz * off,
    yaw: Math.atan2(-tx, -tz),
    dock: { x: wallX + dx * 0.9, y, z: wallZ + dz * 0.9 },
  };
}

/** A moored boat that is only scenery: it rides the swell in the picture and stands still in the physics. */
class Scenery {
  private readonly phase: number;

  constructor(
    readonly visual: Object3D,
    readonly x: number,
    readonly z: number,
    readonly yaw: number,
  ) {
    this.phase = (x * 0.37 + z * 0.61) % 6.283;
  }

  pose(game: Game, sea: Sea): void {
    const water = game.world.water;
    const t = water.now;
    water.normal(this.x, this.z, _n, t);
    const q = this.visual.quaternion;
    q.set(_n.z, 0, -_n.x, 1 + _n.y).normalize();
    q.multiply(_q.setFromAxisAngle(UP, this.yaw));
    q.multiply(_q.set(0, 0, Math.sin(0.011 * Math.sin(t * 2.9 + this.phase)), 1).normalize());
    this.visual.position.set(this.x, water.height(this.x, this.z, t) + sea.chop(this.x, this.z, t), this.z);
  }
}

/**
 * Everything afloat: decides which craft are worth simulating, keeps their boarding prompts beside
 * whoever is near, and answers the tests' questions.
 */
class Fleet implements GameSystem {
  readonly craft: Boat[] = [];
  readonly scenery: Scenery[] = [];
  readonly sea: Sea;
  private readonly focus = new Vector3();

  constructor(private readonly game: Game) {
    this.sea = new Sea(game);
    // Outside a match nothing steps the craft, so nothing may be left awake to sink.
    game.events.on('phase', (phase) => {
      if (phase === 'match') return;
      for (const c of this.craft) c.sleep();
    });
  }

  fixedUpdate(): void {
    const game = this.game;
    this.sea.time = game.engine.time;
    const player = game.player;
    const focus = player ? this.focus.copy(player.position) : this.focus.copy(game.engine.camera.position);
    const wake2 = WAKE_AT * WAKE_AT;
    const sleep2 = SLEEP_AT * SLEEP_AT;
    for (const c of this.craft) {
      if (c.destroyed) continue;
      if (c.asleep) {
        const p = c.root.position;
        const dx = p.x - focus.x;
        const dz = p.z - focus.z;
        // Something ran into it while it slept: the physics woke the body, so it has to float again.
        if (c.occupied || dx * dx + dz * dz < wake2 || !c.body.isSleeping()) c.wake();
      } else if (!c.occupied) {
        const p = c.position;
        const dx = p.x - focus.x;
        const dz = p.z - focus.z;
        if (dx * dx + dz * dz > sleep2 && c.settled) c.sleep();
      }
    }
    // Whoever is on foot near a hull gets its prompt beside them, wherever along the hull they stand or
    // swim. A hull has one prompt, so with several people round it the player's place is the one that counts.
    for (const who of game.characters) if (who !== player) this.aim(who);
    if (player) this.aim(player);
  }

  private aim(who: Character): void {
    if (who.state !== 'normal' || !who.alive) return;
    const p = who.position;
    for (const c of this.craft) {
      const q = c.asleep ? c.root.position : c.position;
      const dx = q.x - p.x;
      const dz = q.z - p.z;
      if (dx * dx + dz * dz < 144) c.aimBoardPoint(p);
    }
  }

  frameUpdate(): void {
    const cam = this.game.engine.camera.position;
    for (const s of this.scenery) {
      const dx = s.x - cam.x;
      const dz = s.z - cam.z;
      if (dx * dx + dz * dz < 420 * 420) s.pose(this.game, this.sea);
    }
  }

  nearest(kind: string | undefined, x: number, z: number): Boat | null {
    let best: Boat | null = null;
    let bestD = Infinity;
    for (const c of this.craft) {
      if (c.destroyed || (kind && c.kind !== kind)) continue;
      const p = c.asleep ? c.root.position : c.position;
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }
}

/** Boats and jet skis at the moorings (T-08). Called once while the game loads, after the world exists. */
export async function installBoats(game: Game): Promise<void> {
  const asset = await game.assets.loadModel('models/boats.glb');
  const layout: Layout = game.world.layout;
  const rng = new Rng(layout.seed + 808);
  const fleet = game.addSystem(new Fleet(game));

  // What a bow can point at: piers, and the quays of the islands and the port.
  const solids: Solid[] = [
    ...layout.piers.map((p) => ({ rect: p.rect, y: p.y })),
    ...layout.islands.map((i) => ({ rect: i.rect, y: WORLD.streetY + WORLD.kerb })),
    ...layout.blocks.filter((b) => b.kind === 'yard').map((b) => ({ rect: b.rect, y: WORLD.streetY })),
  ];

  // Piers are decks on posts, and only the deck is solid. A hull could slide in underneath and be
  // pinned there by the next wave, so each pier gets a wall below its deck that only vehicles feel:
  // swimmers still pass between the posts, and shots and the camera do not see it.
  const underPier = groups(GROUP.ragdoll, GROUP.vehicle);
  for (const pier of layout.piers) {
    const r = pier.rect;
    const top = pier.y - 0.4;
    const bottom = -3.2;
    game.physics.addStaticBox((r.x0 + r.x1) / 2, (top + bottom) / 2, (r.z0 + r.z1) / 2, (r.x1 - r.x0) / 2, (top - bottom) / 2, (r.z1 - r.z0) / 2, { kind: 'world', surface: 'wood' }, 0, underPier);
  }

  const field = game.world.field;
  const shore: Shore = {
    solids,
    layout,
    quay: (x, z) => field.isLand(x, z) && field.heightAt(x, z) >= 1.5,
    heightAt: (x, z) => field.heightAt(x, z),
  };

  // The quay stairs are a thin ramp to the physics, open underneath, and hulls are moored right beside
  // them. The same kind of wall, in four steps under each flight, makes them as solid to a hull as they look.
  const len = STAIR.steps * STAIR.run;
  for (const st of layout.stairs) {
    const ox = st.dir === 'e' ? 1 : st.dir === 'w' ? -1 : 0;
    const oz = st.dir === 's' ? 1 : st.dir === 'n' ? -1 : 0;
    for (let k = 0; k < 4; k++) {
      const top = WORLD.streetY + WORLD.kerb - ((k + 1) / 4) * STAIR.drop - 0.05;
      const bottom = -3.6;
      const mid = ((k + 0.5) / 4) * len;
      const hx = ox !== 0 ? len / 8 : st.width / 2;
      const hz = oz !== 0 ? len / 8 : st.width / 2;
      game.physics.addStaticBox(st.x + ox * mid, (top + bottom) / 2, st.z + oz * mid, hx, (top - bottom) / 2, hz, { kind: 'world', surface: 'concrete' }, 0, underPier);
    }
  }

  // Deal the models and paints so neighbours differ.
  const boatDeck = rng.shuffle(SPEEDBOATS.slice());
  const boatPaints = rng.shuffle(BOAT_PAINTS.slice());
  const skiPaints = rng.shuffle(JETSKI_PAINTS.slice());
  const sceneryDeck = rng.shuffle(SCENERY_MODELS.slice());
  let boats = 0;
  let skis = 0;
  let props = 0;
  for (const slot of layout.waterSlots) {
    if (slot.kind === 'boat') {
      const spec: CraftSpec = boatDeck[boats % boatDeck.length]!;
      const paint = boatPaints[(boats + Math.floor(boats / boatDeck.length)) % boatPaints.length]!;
      fleet.craft.push(new Boat(game, fleet.sea, spec, boatVisual(asset, spec.model, paint), berthAt(slot, spec.length, spec.beam, shore)));
      boats++;
    } else if (slot.kind === 'jetski') {
      const paint = skiPaints[skis % skiPaints.length]!;
      const craft = new Boat(game, fleet.sea, JETSKI, jetSkiVisual(paint), berthAt(slot, JETSKI.length, JETSKI.beam, shore));
      fleet.craft.push(craft);
      skis++;
    } else {
      // Scenery: cabin cruisers, sailing boats and work boats, moored and never driven.
      const model = sceneryDeck[props % sceneryDeck.length]!;
      const visual = boatVisual(asset, model, model.startsWith('boat-speed') ? boatPaints[props % boatPaints.length] : undefined);
      // Their length comes from the model, so the bow clears the dock like everyone else's.
      visual.updateMatrixWorld(true);
      const size = sizeOf(visual);
      const berth = berthAt(slot, size.length, size.beam, shore);
      const prop = new Scenery(visual, berth.x, berth.z, berth.yaw);
      prop.pose(game, fleet.sea);
      game.engine.scene.add(visual);
      fleet.scenery.push(prop);
      // A plain box to bump into and to climb onto.
      game.physics.addStaticBox(berth.x, (size.deck - size.keel) / 2 + size.keel, berth.z, size.beam / 2, (size.deck - size.keel) / 2, size.length / 2, { kind: 'world', surface: 'wood' }, berth.yaw);
      props++;
    }
  }

  game.debugExt['boats'] = {
    /** Every drivable craft, as plain numbers. */
    list: () => fleet.craft.map((c) => c.describe()),
    /** The craft of a kind ('boat', 'jetski' or nothing for either) nearest to a point. */
    nearest: (kind: string | undefined, x: number, z: number) => fleet.nearest(kind, x, z)?.describe() ?? null,
    get: (id: number) => fleet.craft.find((c) => c.id === id)?.describe() ?? null,
    /** The craft itself, for tools that need more than numbers. */
    craft: (id: number) => fleet.craft.find((c) => c.id === id) ?? null,
    counts: () => ({ boats, skis, scenery: props, awake: fleet.craft.filter((c) => !c.asleep).length }),
    /** Hull height the swell and the harbour ripple give at a point: what a hull there floats on. */
    surface: (x: number, z: number) => fleet.sea.height(x, z),
  };
}

/** Size of a scenery model as it is drawn: length along its heading, beam, and how deep and high the hull goes. */
function sizeOf(visual: Object3D): { length: number; beam: number; keel: number; deck: number } {
  let minX = -1;
  let maxX = 1;
  let minZ = -2;
  let maxZ = 2;
  // The first mesh is the hull. Sails, masts and oars hang off it and are not for bumping into.
  let hull = false;
  visual.traverse((o) => {
    const mesh = o as { isMesh?: boolean; geometry?: { boundingBox: { min: Vector3; max: Vector3 } | null; computeBoundingBox(): void } };
    if (hull || !mesh.isMesh || !mesh.geometry) return;
    hull = true;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const b = mesh.geometry.boundingBox!;
    minX = b.min.x;
    maxX = b.max.x;
    minZ = b.min.z;
    maxZ = b.max.z;
  });
  return { length: (maxZ - minZ) * BOAT_SCALE, beam: (maxX - minX) * BOAT_SCALE * 0.9, keel: -0.5, deck: 0.95 };
}
