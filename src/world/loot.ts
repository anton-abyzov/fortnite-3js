import {
  BoxGeometry,
  type BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  RingGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Character } from '../character/character';
import type { ModelAsset } from '../core/assets';
import { GROUP, groups } from '../core/config';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { Interactable } from '../gameplay/interactions';
import { type AmmoId, ITEMS, type ItemId, type WeaponId } from '../gameplay/items';
import { MAX_TIER, TIERS, WEAPONS } from '../gameplay/weapons';
import { Cell } from './field';

export type ContainerKind = 'cooler' | 'duffel';

export interface Container {
  id: number;
  kind: ContainerKind;
  x: number;
  y: number;
  z: number;
  yaw: number;
  /** On a rooftop: harder to reach, so it holds better things. */
  roof: boolean;
  opened: boolean;
  use: Interactable | null;
}

export interface Pickup {
  id: number;
  /** An item, or 'cash'. */
  item: ItemId | 'cash';
  count: number;
  tier: number;
  x: number;
  y: number;
  z: number;
  node: Group;
  use: Interactable;
  /** Seconds since it appeared, for the hop out of a container. */
  age: number;
  fromX: number;
  fromY: number;
  fromZ: number;
  phase: number;
}

const CONTAINERS = 110;
const FLOOR_SPOTS = 70;
const SPACING = 13;
const SHOW_WITHIN = 75;
const TOUCH = 1.15;

const WEAPON_ODDS: [WeaponId, number][] = [
  ['pistol', 24],
  ['smg', 24],
  ['rifle', 22],
  ['shotgun', 20],
  ['sniper', 10],
];
const TIER_ODDS: [number, number][] = [
  [0, 50],
  [1, 30],
  [2, 15],
  [3, 5],
];
const FLOOR_TIER_ODDS: [number, number][] = [
  [0, 66],
  [1, 24],
  [2, 8],
  [3, 2],
];
const EXTRA_ODDS: [ItemId, number][] = [
  ['bandage', 30],
  ['cola', 24],
  ['medkit', 14],
  ['vest', 10],
  ['grenade', 22],
];
const AMMO_COLOR: Record<AmmoId, number> = { ammo_light: 0xf2c14e, ammo_medium: 0x4ea8de, ammo_shells: 0xe85d4a, ammo_heavy: 0x9b5de5 };
// Kept well under white: the sun here is strong and a pale box would glare.
const COOLER_COLORS = [0x0f8aa3, 0xc9563a, 0xb9c4c2, 0xc99a3c, 0xc22e6a];
const DUFFEL_COLORS = [0x4c5a3a, 0x24384a, 0x7a4a2c, 0x3a3a40, 0x8a2f3a];

const _m = new Matrix4();
const _q = new Quaternion();
const _p = new Vector3();
const _s = new Vector3();
const _c = new Color();
const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);

interface Drop {
  item: ItemId | 'cash';
  count: number;
  tier: number;
}

/** The words for a pickup: "Coral 9 (Tuned)", "36 Light rounds", "$40". */
export function describe(item: ItemId | 'cash', count: number, tier: number): string {
  if (item === 'cash') return `$${count}`;
  const def = ITEMS[item];
  if (def.kind === 'weapon') return tier > 0 ? `${def.name} (${TIERS[tier]!.name})` : def.name;
  return count > 1 ? `${count} ${def.name}` : def.name;
}

/**
 * Everything lying about to be picked up: beach coolers and duffel bags that are opened with the
 * interact key, the items they spill, items on the ground, and what the fallen leave behind.
 */
export class Loot implements GameSystem {
  readonly containers: Container[] = [];
  readonly pickups: Pickup[] = [];
  private readonly group = new Group();
  private coolers!: InstancedMesh;
  private lids!: InstancedMesh;
  private duffels!: InstancedMesh;
  /** Index of each container within its own instanced mesh. */
  private readonly slotOf = new Map<Container, number>();
  private floor: { x: number; y: number; z: number; roof: boolean }[] = [];
  private nextId = 1;
  private tick = 0;
  private time = 0;
  private seed: number;
  private readonly parts: Record<string, { geometry: BufferGeometry; material: MeshStandardMaterial }> = {};
  private readonly rings = new Map<number, MeshBasicMaterial>();
  private readonly ringGeometry = new RingGeometry(0.3, 0.42, 28).rotateX(-Math.PI / 2);

  private constructor(
    private readonly game: Game,
    private readonly weapons: ModelAsset,
  ) {
    this.seed = game.options.seed;
    this.group.name = 'loot';
    game.engine.scene.add(this.group);
    this.buildParts();
    this.place();
    this.reset(this.seed);
    game.events.on('kill', ({ victim }) => this.dropFrom(victim));
  }

  static async create(game: Game): Promise<Loot> {
    return new Loot(game, await game.assets.loadModel('models/weapons.glb'));
  }

  // --- Setting out ---------------------------------------------------------------------------------

  /** Choose where the containers and the loose items go. The same seed gives the same places. */
  private place(): void {
    const game = this.game;
    const field = game.world.field;
    const physics = game.physics;
    const rng = new Rng(this.seed ^ 0x100715);
    const spots: { x: number; y: number; z: number; roof: boolean; cell: Cell }[] = [];
    const probe = (x: number, z: number): number => physics.groundHeight(x, 320, z, 400, Number.NaN);
    const consider = (x: number, z: number): boolean => {
      const cell = field.typeAt(x, z);
      if (cell === Cell.Water || cell === Cell.Road || cell === Cell.Bridge || cell === Cell.Pool) return false;
      const roof = cell === Cell.Building;
      // Roofs are a reward for a good landing, not the norm.
      if (roof && !rng.chance(0.3)) return false;
      const y = probe(x, z);
      if (!(y > 0.6)) return false;
      // Level ground with room around it: no ledges, kerbs, palm trunks or walls.
      for (const [dx, dz] of [
        [0.9, 0],
        [-0.9, 0],
        [0, 0.9],
        [0, -0.9],
      ] as const) {
        if (!(Math.abs(probe(x + dx, z + dz) - y) < 0.12)) return false;
      }
      if (!roof && Math.abs(y - field.heightAt(x, z)) > 0.6) return false;
      for (const s of spots) {
        const d = Math.hypot(s.x - x, s.z - z);
        if (d < SPACING && Math.abs(s.y - y) < 6) return false;
      }
      spots.push({ x, y, z, roof, cell });
      return true;
    };
    // A few near the heart of every named place, then the rest anywhere on the islands.
    for (const poi of game.world.layout.pois) {
      let got = 0;
      for (let i = 0; i < 60 && got < 5; i++) {
        const a = rng.range(0, Math.PI * 2);
        const r = Math.sqrt(rng.next()) * Math.min(poi.r, 90);
        if (consider(poi.x + Math.cos(a) * r, poi.z + Math.sin(a) * r)) got++;
      }
    }
    const want = CONTAINERS + FLOOR_SPOTS;
    for (let i = 0; i < 9000 && spots.length < want; i++) consider(rng.range(-600, 600), rng.range(-600, 600));
    rng.shuffle(spots);

    const containers = spots.slice(0, Math.min(CONTAINERS, Math.round(spots.length * 0.61)));
    this.floor = spots.slice(containers.length);
    let nCooler = 0;
    let nDuffel = 0;
    for (const s of containers) {
      const kind: ContainerKind = s.cell === Cell.Sand || s.cell === Cell.Pier || s.cell === Cell.Plaza || s.cell === Cell.Yard ? 'cooler' : 'duffel';
      const c: Container = { id: this.containers.length, kind, x: s.x, y: s.y, z: s.z, yaw: rng.range(0, Math.PI * 2), roof: s.roof, opened: false, use: null };
      this.containers.push(c);
      this.slotOf.set(c, kind === 'cooler' ? nCooler++ : nDuffel++);
      // People walk round it; cars and boats do not notice it.
      physics.addStaticBox(c.x, c.y + 0.2, c.z, kind === 'cooler' ? 0.33 : 0.36, 0.2, kind === 'cooler' ? 0.22 : 0.2, { kind: 'prop', surface: kind === 'cooler' ? 'metal' : 'wood' }, c.yaw, groups(GROUP.prop, GROUP.character));
    }

    const body = new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
    const lid = new MeshStandardMaterial({ color: 0xc9d2d0, roughness: 0.5 });
    const canvas = new MeshStandardMaterial({ roughness: 0.92 });
    this.coolers = new InstancedMesh(this.parts['coolerBody']!.geometry, body, Math.max(1, nCooler));
    this.lids = new InstancedMesh(this.parts['coolerLid']!.geometry, lid, Math.max(1, nCooler));
    this.duffels = new InstancedMesh(this.parts['duffel']!.geometry, canvas, Math.max(1, nDuffel));
    this.coolers.count = nCooler;
    this.lids.count = nCooler;
    this.duffels.count = nDuffel;
    for (const mesh of [this.coolers, this.lids, this.duffels]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    const crng = new Rng(this.seed ^ 0xc001e4);
    for (const c of this.containers) {
      const i = this.slotOf.get(c)!;
      if (c.kind === 'cooler') this.coolers.setColorAt(i, _c.setHex(crng.pick(COOLER_COLORS)));
      else this.duffels.setColorAt(i, _c.setHex(crng.pick(DUFFEL_COLORS)));
    }
    for (const c of this.containers) this.drawContainer(c);
    for (const mesh of [this.coolers, this.lids, this.duffels]) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }

  /** Shapes shared by every container and pickup. */
  private buildParts(): void {
    const mat = (color: number, rough = 0.6, emissive = 0): MeshStandardMaterial => new MeshStandardMaterial({ color, roughness: rough, emissive, emissiveIntensity: emissive ? 0.35 : 0 });
    const white = mat(0xf4fbfa);
    const put = (name: string, geometry: BufferGeometry, material: MeshStandardMaterial): void => {
      this.parts[name] = { geometry, material };
    };
    // A beach cooler: a box with a lid and a carry handle. The lid turns about its back edge.
    put('coolerBody', new BoxGeometry(0.62, 0.34, 0.4).translate(0, 0.17, 0), white);
    put('coolerLid', mergeGeometries([new BoxGeometry(0.66, 0.07, 0.44).translate(0, 0.035, 0.22), new BoxGeometry(0.3, 0.03, 0.05).translate(0, 0.085, 0.22)])!, white);
    // A duffel bag: a fat roll with two straps and end caps.
    put(
      'duffel',
      mergeGeometries([
        new CapsuleGeometry(0.19, 0.42, 6, 14).rotateZ(Math.PI / 2).scale(1, 0.82, 1).translate(0, 0.16, 0),
        new BoxGeometry(0.05, 0.33, 0.4).translate(-0.14, 0.165, 0),
        new BoxGeometry(0.05, 0.33, 0.4).translate(0.14, 0.165, 0),
        new BoxGeometry(0.34, 0.035, 0.04).translate(0, 0.34, 0),
      ])!,
      white,
    );
    for (const [id, color] of Object.entries(AMMO_COLOR)) {
      put(id, mergeGeometries([new BoxGeometry(0.22, 0.11, 0.13).translate(0, 0.055, 0), new BoxGeometry(0.23, 0.03, 0.14).translate(0, 0.125, 0)])!, mat(color, 0.5));
    }
    put('bandage', new CylinderGeometry(0.07, 0.07, 0.11, 16).rotateZ(Math.PI / 2).translate(0, 0.07, 0), mat(0xf7f3ea, 0.9));
    put('medkit', new BoxGeometry(0.3, 0.2, 0.12).translate(0, 0.1, 0), mat(0xff7a59, 0.5));
    put('medkitCross', mergeGeometries([new BoxGeometry(0.12, 0.04, 0.125).translate(0, 0.1, 0), new BoxGeometry(0.04, 0.12, 0.125).translate(0, 0.1, 0)])!, white);
    put('cola', new CylinderGeometry(0.045, 0.045, 0.15, 14).translate(0, 0.075, 0), mat(0x19b8d4, 0.3));
    put('colaBand', new CylinderGeometry(0.047, 0.047, 0.05, 14).translate(0, 0.08, 0), mat(0xff3d8b, 0.4));
    put('vest', mergeGeometries([new BoxGeometry(0.36, 0.4, 0.14).translate(0, 0.2, 0), new BoxGeometry(0.09, 0.12, 0.14).translate(-0.12, 0.45, 0), new BoxGeometry(0.09, 0.12, 0.14).translate(0.12, 0.45, 0)])!, mat(0x2b3a48, 0.8));
    put('vestStrap', new BoxGeometry(0.37, 0.05, 0.15).translate(0, 0.2, 0), mat(0x35e0c8, 0.5, 0x35e0c8));
    put(
      'cash',
      mergeGeometries([new BoxGeometry(0.2, 0.03, 0.1).translate(0, 0.015, 0), new BoxGeometry(0.2, 0.03, 0.1).rotateY(0.3).translate(0.01, 0.047, 0.01), new BoxGeometry(0.2, 0.03, 0.1).rotateY(-0.2).translate(-0.01, 0.079, 0)])!,
      mat(0x4fbf6b, 0.7),
    );
  }

  /** Place one container's instances for its open or closed state. */
  private drawContainer(c: Container): void {
    const i = this.slotOf.get(c)!;
    _q.setFromAxisAngle(UP, c.yaw);
    if (c.kind === 'cooler') {
      this.coolers.setMatrixAt(i, _m.compose(_p.set(c.x, c.y, c.z), _q, ONE));
      // The hinge runs along the back top edge.
      const hinge = new Matrix4().makeTranslation(0, 0.34, -0.22);
      const swing = new Matrix4().makeRotationX(c.opened ? -1.9 : 0);
      this.lids.setMatrixAt(i, _m.compose(_p.set(c.x, c.y, c.z), _q, ONE).multiply(hinge).multiply(swing));
      this.coolers.instanceMatrix.needsUpdate = true;
      this.lids.instanceMatrix.needsUpdate = true;
    } else {
      // An emptied bag sags.
      this.duffels.setMatrixAt(i, _m.compose(_p.set(c.x, c.y, c.z), _q, _s.set(1, c.opened ? 0.5 : 1, c.opened ? 1.12 : 1)));
      this.duffels.instanceMatrix.needsUpdate = true;
    }
  }

  /** Close every container, clear the ground and lay out the loose items again (a new round). */
  reset(seed: number): void {
    this.seed = seed;
    while (this.pickups.length > 0) this.remove(this.pickups[0]!);
    const interactions = this.game.interactions;
    for (const c of this.containers) {
      c.opened = false;
      if (!c.use) {
        const what = c.kind === 'cooler' ? 'Open cooler' : 'Open duffel bag';
        c.use = interactions.add({ kind: 'chest', position: new Vector3(c.x, c.y + 0.3, c.z), radius: 2.3, label: what, available: () => !c.opened, use: (who) => this.open(c, who), ref: c });
      }
      this.drawContainer(c);
    }
    const rng = new Rng(seed ^ 0xf100d);
    for (const s of this.floor) {
      const roll = rng.next();
      if (roll < 0.45) {
        const weapon = rng.weighted(WEAPON_ODDS);
        const tier = Math.min(MAX_TIER, rng.weighted(FLOOR_TIER_ODDS) + (s.roof ? 1 : 0));
        this.spawn(weapon, 1, tier, s.x - 0.3, s.y, s.z);
        this.spawn(WEAPONS[weapon].ammo, ITEMS[WEAPONS[weapon].ammo].stack, 0, s.x + 0.45, s.y, s.z + 0.2);
      } else if (roll < 0.75) {
        const ammo = WEAPONS[rng.weighted(WEAPON_ODDS)].ammo;
        this.spawn(ammo, ITEMS[ammo].stack, 0, s.x, s.y, s.z);
      } else {
        const item = rng.weighted(EXTRA_ODDS);
        this.spawn(item, ITEMS[item].stack, 0, s.x, s.y, s.z);
      }
    }
  }

  // --- Containers -----------------------------------------------------------------------------------

  private roll(c: Container): Drop[] {
    const rng = new Rng((this.seed ^ Math.imul(c.id + 1, 0x9e3779b1)) >>> 0);
    const drops: Drop[] = [];
    const weapon = rng.weighted(WEAPON_ODDS);
    const ammo = WEAPONS[weapon].ammo;
    drops.push({ item: weapon, count: 1, tier: Math.min(MAX_TIER, rng.weighted(TIER_ODDS) + (c.roof ? 1 : 0)) });
    drops.push({ item: ammo, count: ITEMS[ammo].stack * rng.int(1, 2), tier: 0 });
    if (rng.chance(0.7)) {
      const extra = rng.weighted(EXTRA_ODDS);
      drops.push({ item: extra, count: ITEMS[extra].stack, tier: 0 });
    }
    if (rng.chance(0.5)) {
      const other = WEAPONS[rng.weighted(WEAPON_ODDS)].ammo;
      if (other !== ammo) drops.push({ item: other, count: ITEMS[other].stack, tier: 0 });
    }
    drops.push({ item: 'cash', count: rng.int(5, 18) * 5, tier: 0 });
    return drops;
  }

  /** Open a container: its contents hop out onto the ground around it. */
  open(c: Container, who: Character | null): boolean {
    if (c.opened) return false;
    c.opened = true;
    this.drawContainer(c);
    const game = this.game;
    game.sound('chest_open', c);
    who?.anim.play('Interact', { layer: 'upper', speed: 1.8, from: 0.15, fadeIn: 0.1, fadeOut: 0.25 });
    const drops = this.roll(c);
    // The contents hop out to the opener's feet, on the side of the box, where a step collects them.
    const from = who ? who.position : c;
    const toward = who ? Math.atan2(c.x - from.x, c.z - from.z) : c.yaw;
    drops.forEach((d, i) => {
      const a = toward + (i - (drops.length - 1) / 2) * 0.55;
      const [x, y, z] = this.landing(from.x, from.y, from.z, Math.sin(a), Math.cos(a), who ? 0.55 + (i % 2) * 0.3 : 1.05 + (i % 2) * 0.28);
      const p = this.spawn(d.item, d.count, d.tier, x, y, z);
      p.age = 0;
      p.fromX = c.x;
      p.fromY = c.y + 0.35;
      p.fromZ = c.z;
    });
    game.events.emit('opened', { container: c, by: who });
    return true;
  }

  /** A clear point on the ground about `reach` metres from a centre in a direction. */
  private landing(cx: number, cy: number, cz: number, dx: number, dz: number, reach: number): [number, number, number] {
    const physics = this.game.physics;
    const wall = physics.raycast(cx, cy + 0.45, cz, dx, 0, dz, reach + 0.3);
    const r = wall ? Math.max(0.3, wall.distance - 0.3) : reach;
    const x = cx + dx * r;
    const z = cz + dz * r;
    const ground = physics.raycast(x, cy + 1.2, z, 0, -1, 0, 4);
    return [x, ground ? ground.point.y : cy, z];
  }

  // --- Pickups --------------------------------------------------------------------------------------

  /** Put an item on the ground. */
  spawn(item: ItemId | 'cash', count: number, tier: number, x: number, y: number, z: number): Pickup {
    const node = this.build(item, tier);
    node.position.set(x, y, z);
    this.group.add(node);
    const p: Pickup = {
      id: this.nextId++,
      item,
      count,
      tier,
      x,
      y,
      z,
      node,
      age: 99,
      fromX: x,
      fromY: y,
      fromZ: z,
      phase: (this.nextId * 1.618) % (Math.PI * 2),
      use: null as unknown as Interactable,
    };
    p.use = this.game.interactions.add({
      kind: 'loot',
      position: new Vector3(x, y + 0.3, z),
      radius: 2,
      priority: 1,
      label: () => `Pick up ${describe(p.item, p.count, p.tier)}`,
      available: (c) => this.wants(c, p),
      use: (c) => {
        this.take(c, p);
      },
      ref: p,
    });
    this.pickups.push(p);
    return p;
  }

  /** The little model for a pickup, over a ring in the colour of what it is. */
  private build(item: ItemId | 'cash', tier: number): Group {
    const node = new Group();
    const body = new Group();
    body.name = 'body';
    const add = (name: string): void => {
      const part = this.parts[name]!;
      const mesh = new Mesh(part.geometry, part.material);
      mesh.castShadow = true;
      body.add(mesh);
    };
    let ring = 0xf4fbfa;
    if (item === 'cash') {
      add('cash');
      ring = 0x4fbf6b;
    } else {
      const def = ITEMS[item];
      if (def.kind === 'weapon') {
        const w = WEAPONS[item as WeaponId];
        const source = this.weapons.scene.getObjectByName(w.model);
        if (source) {
          const model = source.clone(true);
          model.scale.setScalar(w.scale * 1.15);
          // Lying on its side, raised so the ring shows under it.
          model.rotation.set(0, 0, Math.PI / 2);
          model.position.y = 0.12;
          model.traverse((o: Object3D) => {
            o.castShadow = true;
          });
          body.add(model);
        }
        ring = TIERS[tier]!.color;
      } else if (def.kind === 'ammo') {
        add(item);
        ring = AMMO_COLOR[item as AmmoId];
      } else if (item === 'grenade') {
        const source = this.weapons.scene.getObjectByName('grenade-a');
        if (source) {
          const model = source.clone(true);
          model.scale.setScalar(0.85);
          body.add(model);
        }
        ring = 0xffd166;
      } else {
        add(item);
        if (item === 'medkit') add('medkitCross');
        if (item === 'cola') add('colaBand');
        if (item === 'vest') add('vestStrap');
        ring = def.kind === 'heal' ? 0xff7a59 : 0x35e0c8;
      }
    }
    let material = this.rings.get(ring);
    if (!material) {
      material = new MeshBasicMaterial({ color: ring, transparent: true, opacity: 0.85, depthWrite: false });
      // Brighter than white so it catches the bloom at night.
      material.color.multiplyScalar(1.6);
      this.rings.set(ring, material);
    }
    const halo = new Mesh(this.ringGeometry, material);
    halo.position.y = 0.03;
    halo.name = 'ring';
    node.add(body, halo);
    return node;
  }

  /** True when taking this pickup would give the character something. */
  wants(c: Character, p: Pickup): boolean {
    if (p.item === 'cash') return true;
    const def = ITEMS[p.item];
    if (def.kind === 'weapon') {
      const have = c.loadout.held[p.item as WeaponId];
      return !have || have.tier < p.tier;
    }
    return c.inventory.count(p.item) < def.max;
  }

  /** Pick something up. Returns false when the character has no use or no room for it. */
  take(c: Character, p: Pickup): boolean {
    if (!c.alive || !this.pickups.includes(p)) return false;
    const game = this.game;
    if (p.item === 'cash') {
      c.cash += p.count;
      game.sound('cash', p, 0.7);
      game.events.emit('cash', { to: c, amount: p.count });
      this.remove(p);
      return true;
    }
    const taken = game.grant(c, p.item, p.count, p.tier);
    if (taken <= 0) return false;
    game.sound('pickup', p, 0.8);
    p.count -= taken;
    if (p.count <= 0 || ITEMS[p.item].kind === 'weapon') this.remove(p);
    return true;
  }

  private remove(p: Pickup): void {
    const i = this.pickups.indexOf(p);
    if (i >= 0) this.pickups.splice(i, 1);
    this.game.interactions.remove(p.use);
    p.node.removeFromParent();
  }

  /** What a fallen combatant leaves on the ground: weapons, ammunition, supplies and cash. */
  dropFrom(c: Character): void {
    const drops: Drop[] = [];
    const lo = c.loadout;
    for (const id of lo.carried()) drops.push({ item: id, count: 1, tier: lo.held[id]!.tier });
    for (const [id, n] of Object.entries(c.inventory.counts) as [ItemId, number][]) {
      if (n > 0 && ITEMS[id].kind !== 'weapon') drops.push({ item: id, count: n, tier: 0 });
    }
    if (c.cash > 0) drops.push({ item: 'cash', count: c.cash, tier: 0 });
    const n = Math.min(drops.length, 9);
    for (let i = 0; i < n; i++) {
      const d = drops[i]!;
      const a = (i / n) * Math.PI * 2 + c.facing;
      const [x, y, z] = this.landing(c.position.x, c.position.y, c.position.z, Math.sin(a), Math.cos(a), 0.8 + (i % 3) * 0.3);
      const p = this.spawn(d.item, d.count, d.tier, x, y, z);
      p.age = 0;
      p.fromX = c.position.x;
      p.fromY = c.position.y + 0.9;
      p.fromZ = c.position.z;
    }
    lo.clear();
    c.inventory.clear();
    c.cash = 0;
  }

  /** The closest unopened container to a point, within `reach` metres. */
  nearestContainer(x: number, z: number, reach = Infinity, y?: number): Container | null {
    let best: Container | null = null;
    let bestD = reach;
    for (const c of this.containers) {
      if (c.opened) continue;
      if (y !== undefined && Math.abs(c.y - y) > 3) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }

  fixedUpdate(dt: number): void {
    this.time += dt;
    // Walking over something useful picks it up. Checked a few times a second, which is plenty.
    if (++this.tick % 6 !== 0) return;
    const pickups = this.pickups;
    if (pickups.length === 0) return;
    for (const c of this.game.characters) {
      if (!c.alive || c.state !== 'normal') continue;
      const px = c.position.x;
      const py = c.position.y;
      const pz = c.position.z;
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i]!;
        const dx = p.x - px;
        const dz = p.z - pz;
        if (dx * dx + dz * dz > TOUCH * TOUCH || Math.abs(p.y - py) > 1.4 || p.age < 0.5) continue;
        if (this.wants(c, p)) this.take(c, p);
      }
    }
  }

  frameUpdate(dt: number): void {
    const cam = this.game.engine.camera.position;
    const t = this.time;
    for (const p of this.pickups) {
      const dx = p.x - cam.x;
      const dz = p.z - cam.z;
      const near = dx * dx + dz * dz < SHOW_WITHIN * SHOW_WITHIN && Math.abs(p.y - cam.y) < 60;
      p.node.visible = near;
      p.age += dt;
      if (!near) continue;
      const body = p.node.children[0]!;
      body.rotation.y = t * 1.1 + p.phase;
      if (p.age < 0.5) {
        // The hop out of the box: a short arc from where it came from.
        const k = p.age / 0.5;
        const e = 1 - (1 - k) * (1 - k);
        p.node.position.set(p.fromX + (p.x - p.fromX) * e, p.fromY + (p.y - p.fromY) * e + Math.sin(k * Math.PI) * 0.55, p.fromZ + (p.z - p.fromZ) * e);
        body.position.y = 0.2;
      } else {
        p.node.position.set(p.x, p.y, p.z);
        body.position.y = 0.26 + Math.sin(t * 2.1 + p.phase) * 0.045;
      }
    }
  }
}
