import { BoxGeometry, type BufferGeometry, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, PointLight, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Character } from '../character/character';
import { type BakedClip, Pose } from '../character/clips';
import { CharacterRig, type Outfit, randomOutfit } from '../character/rig';
import type { ModelAsset } from '../core/assets';
import { CG } from '../core/config';
import { smoothstep } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { Interactable } from '../gameplay/interactions';
import { ITEMS, type ItemId } from '../gameplay/items';
import type { ColliderOwner, Physics } from '../physics/physics';
import { ShopPanel, type PanelRow, type PanelView } from '../ui/shopPanel';
import { buildInterior, type Interior, type Spot } from './interiors';
import type { ShopType } from './layout';
import { GACHA_PRICE, ShopAtlas, STOCK, VENDING_PRICE } from './shopAtlas';
import { ShopKit } from './shopKit';
import { shopClearRects, SHOPFRONT, type ShopSite } from './shopPlan';

const JUKEBOX_PRICE = 5;
const FRIDGE_HEAL = 25;
/** Seconds before a fridge has another cold one. */
const FRIDGE_RESTOCK = 45;
/** A door starts to open when someone is this close. */
const DOOR_REACH = 3.4;
/** How far each leaf slides, in metres. */
const DOOR_SLIDE = 0.98;
/** Beyond this the furniture is not drawn, only the room behind the glass. */
const FURNITURE_RANGE = 95;
const KEEPER_RANGE = 80;

const TRACKS = ['Marazul Nights', 'Flamingo Funk', 'Causeway Cruise', 'Coral Static', 'Hurricane Heart', 'Sol y Sombra', 'Mango Mambo', 'Pastel Riot'] as const;

const KICKER: Record<ShopType, string> = {
  market: 'Corner market',
  ammo: 'Guns and ammunition',
  pharmacy: 'Pharmacy',
  surf: 'Surf shop',
  cafe: 'Cafe',
  arcade: 'Arcade',
};

/** What a gacha capsule can hold, and how often. */
const GACHA: readonly (readonly [ItemId, number])[] = [
  ['cola', 3],
  ['bandage', 3],
  ['grenade', 2],
  ['ammo_light', 2],
  ['medkit', 1.6],
  ['ammo_medium', 1.4],
  ['ammo_shells', 1.4],
  ['vest', 1],
  ['pistol', 1],
  ['smg', 0.5],
  ['shotgun', 0.4],
];

const KEEPER_SHIRT: Record<ShopType, number> = {
  market: 0x2f8f83,
  ammo: 0x5d6e4f,
  pharmacy: 0xf2f5f4,
  surf: 0xff9e6b,
  cafe: 0x16807b,
  arcade: 0x8a5cf5,
};

const FURNITURE: ColliderOwner = { kind: 'world', surface: 'wood' };
const GLASS: ColliderOwner = { kind: 'glass', surface: 'glass' };
const DOOR: ColliderOwner = { kind: 'door', surface: 'glass' };
const KEEPER: ColliderOwner = { kind: 'prop', surface: 'flesh' };

const DIGITS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'] as const;

type Collider = ReturnType<Physics['addStaticBox']>;

interface Shop {
  id: number;
  type: ShopType;
  name: string;
  site: ShopSite;
  interior: Interior;
  mesh: Mesh | null;
  keeper: CharacterRig;
  keeperClip: BakedClip;
  keeperPhase: number;
  /** 0 shut .. 1 open, and whether someone is near enough to want it open. */
  open: number;
  wanted: boolean;
  doorCollider: Collider;
  doorSolid: boolean;
  /** Whether the furniture is being drawn, or only the room. */
  full: boolean;
  /** What the jukebox last played. */
  track: number;
  counter: Vector3;
  bell: Vector3;
}

const _m = new Matrix4();

/** Shop interiors and the things in them (T-09). Called once while the game loads, after the world exists. */
export async function installShops(game: Game): Promise<void> {
  const sites = game.world.city.shops;
  if (sites.length === 0) return;
  const [shopKit, foodKit, weaponKit, posters] = await Promise.all([
    game.assets.loadModel('models/shop.glb'),
    game.assets.loadModel('models/food.glb'),
    game.assets.loadModel('models/weapons.glb'),
    loadPosters(game),
  ]);
  const atlas = new ShopAtlas(
    [
      { name: 'shop', image: chart(shopKit) },
      { name: 'food', image: chart(foodKit) },
      { name: 'weapons', image: chart(weaponKit) },
    ],
    posters,
    sites.map((site) => site.lot.name),
  );
  const kit = new ShopKit();
  kit.add('shop', shopKit, atlas);
  kit.add('food', foodKit, atlas);
  kit.add('weapons', weaponKit, atlas);
  const shops = game.addSystem(new Shops(game, sites, kit, atlas));
  game.debugExt['shops'] = shops.debug();
}

/** The picture a kit's models take their colours from. */
function chart(asset: ModelAsset): CanvasImageSource {
  let image: CanvasImageSource | null = null;
  asset.scene.traverse((o) => {
    if (image) return;
    const material = (o as Mesh).material as { map?: { image?: CanvasImageSource } | null } | undefined;
    if (material?.map?.image) image = material.map.image;
  });
  if (!image) throw new Error('shop kit has no colour chart');
  return image;
}

/** The wall posters, in the order art.json lists them. A shop without them is still a shop. */
async function loadPosters(game: Game): Promise<CanvasImageSource[]> {
  try {
    const art = (await (await fetch(game.assets.url('img/art.json'))).json()) as { posters?: { file: string }[] };
    return await Promise.all(
      (art.posters ?? []).map(
        (p) =>
          new Promise<CanvasImageSource>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`poster did not load: ${p.file}`));
            img.src = game.assets.url(`img/${p.file}`);
          }),
      ),
    );
  } catch (err) {
    console.warn('shops: posters left out', err);
    return [];
  }
}

function outfitKey(o: Outfit): string {
  const colors = [o.skin, o.hair, o.shirt, o.shirt2, o.pants, o.shoes, o.sole, o.accent, o.pack].map((c) => c.getHexString()).join('-');
  return `${colors}|${o.shirtStyle}|${o.sleeve}|${o.hem}|${o.gloves ? 1 : 0}|${o.hairStyle}|${o.glasses ? 1 : 0}`;
}

/**
 * Every shop's room, door and shopkeeper, the things inside that can be used, and the counter's
 * list. A room is one unlit mesh with its light painted in, so eighteen of them cost eighteen draw
 * calls and no lighting.
 */
class Shops implements GameSystem {
  private readonly shops: Shop[] = [];
  private readonly byId = new Map<number, Shop>();
  private readonly group = new Group();
  private readonly panel: ShopPanel;
  private readonly rng: Rng;
  private readonly leaves: InstancedMesh;
  private readonly leafGlass: InstancedMesh;
  private readonly lamp = new PointLight(0xffe7c8, 0, 17, 1.5);
  private readonly pose: Pose;
  /** Which shop each character is standing in, to ring the bell as they walk in. */
  private readonly insideOf = new Map<Character, Shop>();
  private scan = 0;
  private bells = 0;
  // The open counter: whose shop, who is buying, and what was said last.
  private serving: Shop | null = null;
  private customer: Character | null = null;
  private justOpened = false;
  private message = '';
  private refused = false;
  private viewYaw = 0;
  private viewPitch = 0;
  private lastTrack: { shop: number; name: string; track: string; plays: number } | null = null;
  private plays = 0;

  constructor(
    private readonly game: Game,
    sites: readonly ShopSite[],
    kit: ShopKit,
    atlas: ShopAtlas,
  ) {
    this.rng = new Rng((game.options.seed ^ 0x51f0c0de) >>> 0);
    this.pose = new Pose(game.clips.boneCount);
    this.group.name = 'shops';
    const ui = document.getElementById('ui') ?? document.body;
    this.panel = new ShopPanel(
      ui,
      (index) => this.purchase(index),
      () => this.closeCounter(),
    );
    game.events.on('phase', (phase) => {
      if (phase !== 'match') this.closeCounter();
    });

    // One material for every room: colours come from the vertices and the atlas, light is painted in.
    const paint = new MeshBasicMaterial({ map: atlas.texture, vertexColors: true, alphaTest: 0.5 });
    const glass = new MeshStandardMaterial({ color: 0x9cc7d0, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide });
    // Loot is placed before the shops open: a drinks machine must not swallow a cooler.
    const containers = game.loot?.containers ?? [];
    const free = (x: number, z: number): boolean => !containers.some((c) => Math.abs(c.y - SHOPFRONT.floorY) < 2.5 && Math.hypot(c.x - x, c.z - z) < 1.7);

    for (const site of sites) {
      const interior = buildInterior(site, kit, atlas, free);
      const shop = this.open(site, interior, paint, glass);
      this.shops.push(shop);
      this.byId.set(shop.id, shop);
    }

    // Door leaves for the whole city are two instanced meshes: frames and panes.
    this.leaves = new InstancedMesh(leafFrame(), new MeshBasicMaterial({ color: 0x1b262e }), this.shops.length * 2);
    this.leafGlass = new InstancedMesh(leafPane(), glass, this.shops.length * 2);
    for (const mesh of [this.leaves, this.leafGlass]) {
      // Leaves move a metre at most; the bounds are worked out once, with that much to spare.
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      this.group.add(mesh);
    }
    this.leafGlass.renderOrder = 2;
    this.shops.forEach((_, i) => this.placeLeaves(i));

    const machines = this.streetMachines();
    if (machines) this.group.add(machines);

    // One real light, parked in whichever shop is nearest, so people indoors are lit at night.
    // It is always in the scene (dark when not needed) so no shader is rebuilt when it comes on.
    this.lamp.castShadow = false;
    this.lamp.position.set(0, -60, 0);
    this.group.add(this.lamp);
    game.engine.scene.add(this.group);
  }

  /** Build one shop: meshes, colliders, shopkeeper and the things to use. */
  private open(site: ShopSite, interior: Interior, paint: MeshBasicMaterial, glass: MeshStandardMaterial): Shop {
    const { game } = this;
    const physics = game.physics;
    const lot = site.lot;
    const o = interior.origin;

    let mesh: Mesh | null = null;
    if (interior.geometry) {
      mesh = new Mesh(interior.geometry, paint);
      mesh.name = `shop-${lot.id}`;
      mesh.position.copy(o);
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      // Far away only the room is drawn; see `frameUpdate`.
      interior.geometry.setDrawRange(0, interior.shellIndices);
      this.group.add(mesh);
    }
    if (interior.glass) {
      const panes = new Mesh(interior.glass, glass);
      panes.name = `shop-glass-${lot.id}`;
      panes.position.copy(o);
      panes.matrixAutoUpdate = false;
      panes.updateMatrix();
      panes.renderOrder = 2;
      this.group.add(panes);
    }

    for (const b of interior.colliders) {
      if (b.round) physics.addStaticCylinder(b.x, b.y, b.z, b.hy, b.hx, FURNITURE);
      else physics.addStaticBox(b.x, b.y, b.z, b.hx, b.hy, b.hz, b.glass ? GLASS : FURNITURE, 0, b.glass ? CG.glass : CG.world);
    }
    // The door stops bullets and the camera while it is shut. It is solid only when nobody is near,
    // so it can never be in anyone's way.
    const d = interior.door;
    const along = interior.along;
    const into = interior.into;
    const half = SHOPFRONT.doorWidth / 2;
    const doorCollider = physics.addStaticBox(
      d.x,
      SHOPFRONT.floorY + SHOPFRONT.doorHeight / 2,
      d.z,
      Math.abs(along.x) * half + Math.abs(into.x) * 0.05,
      SHOPFRONT.doorHeight / 2,
      Math.abs(along.z) * half + Math.abs(into.z) * 0.05,
      DOOR,
      0,
      CG.door,
    );

    // The shopkeeper: one of the game's own people, standing behind the counter.
    const k = interior.keeper;
    const rng = new Rng((lot.seed ^ 0x0badcafe) >>> 0);
    const outfit = randomOutfit(rng);
    outfit.shirt.setHex(KEEPER_SHIRT[site.plan.type]);
    outfit.sleeve = 0.37;
    outfit.hem = 0.15;
    outfit.gloves = false;
    const keeper = new CharacterRig(game.characterAsset, game.clips, outfit);
    keeper.root.name = `shopkeeper-${lot.id}`;
    keeper.root.position.set(k.x, SHOPFRONT.floorY, k.z);
    // The model faces +Z; yaw 0 in the game faces -Z.
    keeper.root.rotation.y = k.yaw + Math.PI;
    keeper.setShadows(false);
    keeper.root.visible = false;
    const keeperClip = game.clips.clip(site.plan.type === 'ammo' || site.plan.type === 'arcade' ? 'Idle_FoldArms_Loop' : 'Idle_Loop');
    const keeperPhase = rng.range(0, 8);
    game.clips.apply(game.clips.sample(keeperClip, keeperPhase, this.pose), keeper.bones);
    this.group.add(keeper.root);
    physics.addStaticCylinder(k.x, SHOPFRONT.floorY + 0.9, k.z, 0.9, 0.28, KEEPER);

    // The counter is between the customer's spot and the shopkeeper's.
    const c = interior.counter;
    const shop: Shop = {
      id: lot.id,
      type: site.plan.type,
      name: lot.name,
      site,
      interior,
      mesh,
      keeper,
      keeperClip,
      keeperPhase,
      open: 0,
      wanted: false,
      doorCollider,
      doorSolid: true,
      full: false,
      track: -1,
      counter: new Vector3((c.x + k.x) / 2, SHOPFRONT.floorY + 1.0, (c.z + k.z) / 2),
      bell: new Vector3(d.x, SHOPFRONT.floorY + 2.6, d.z),
    };

    game.interactions.add({
      kind: 'shop-counter',
      position: shop.counter,
      radius: 1.75,
      label: `Shop at ${shop.name}`,
      priority: 1,
      ref: shop,
      use: (who) => this.openCounter(shop, who),
    });
    for (const spot of interior.spots) game.interactions.add(this.usable(shop, spot));
    return shop;
  }

  /** Turn a place in a shop into something the interact key can use. */
  private usable(shop: Shop, spot: Spot): Interactable {
    const { game } = this;
    const position = new Vector3(spot.x, spot.y, spot.z);
    const base = { position, radius: spot.radius, ref: shop };
    switch (spot.kind) {
      case 'fridge': {
        let readyAt = 0;
        return {
          ...base,
          kind: 'shop-fridge',
          label: 'Take a cold drink',
          available: () => game.engine.time >= readyAt,
          use: (c) => {
            if (c.health >= c.maxHealth) {
              this.say(c, 'You are not hurt. Leave it for someone who is.', true);
              return;
            }
            const healed = Math.round(c.heal(FRIDGE_HEAL));
            readyAt = game.engine.time + FRIDGE_RESTOCK;
            game.sound('heal', position);
            this.say(c, `Ice cold. +${healed} health`);
          },
        };
      }
      case 'seat': {
        const sx = spot.seatX ?? spot.x;
        const sy = spot.seatY ?? SHOPFRONT.floorY;
        const sz = spot.seatZ ?? spot.z;
        return {
          ...base,
          kind: 'shop-seat',
          label: 'Sit down',
          // One to a seat.
          available: (c) => !game.characters.some((other) => other !== c && other.state === 'seated' && Math.hypot(other.position.x - sx, other.position.z - sz) < 0.4),
          use: (c) => {
            c.sitAt(sx, sy, sz, spot.yaw ?? c.facing);
          },
        };
      }
      case 'jukebox':
        return {
          ...base,
          kind: 'shop-jukebox',
          label: `Play the jukebox ($${JUKEBOX_PRICE})`,
          use: (c) => {
            if (c.cash < JUKEBOX_PRICE) {
              game.sound('ui_back', position);
              this.say(c, `The jukebox takes $${JUKEBOX_PRICE}. You have $${c.cash}.`, true);
              return;
            }
            c.cash -= JUKEBOX_PRICE;
            // Never the song that is already on.
            shop.track = (Math.max(0, shop.track) + 1 + this.rng.int(0, TRACKS.length - 2)) % TRACKS.length;
            const track = TRACKS[shop.track]!;
            this.plays++;
            this.lastTrack = { shop: shop.id, name: shop.name, track, plays: this.plays };
            game.sound('jukebox_coin', position);
            game.events.emit('jukebox', { shop: shop.id, track, by: c, x: position.x, y: position.y, z: position.z });
            this.say(c, `Now playing: ${track}`);
          },
        };
      case 'booth':
        return {
          ...base,
          kind: 'shop-booth',
          label: 'Change outfit',
          use: (c) => {
            c.rig.setOutfit(this.newClothes(c.rig.outfit));
            game.sound('equip', position);
            this.say(c, 'New look. It suits you.');
          },
        };
      case 'vending':
        return {
          ...base,
          kind: 'shop-vending',
          label: `Buy a ${ITEMS.cola.name} ($${VENDING_PRICE})`,
          use: (c) => {
            if (c.cash < VENDING_PRICE) {
              game.sound('ui_back', position);
              this.say(c, `Not enough cash: a can is $${VENDING_PRICE} and you have $${c.cash}.`, true);
              return;
            }
            if (game.grant(c, 'cola', 1) === 0) {
              game.sound('ui_back', position);
              this.say(c, `You cannot carry more ${ITEMS.cola.name}.`, true);
              return;
            }
            c.cash -= VENDING_PRICE;
            game.sound('vending', position);
            this.say(c, `Clunk. One ${ITEMS.cola.name}.`);
          },
        };
      default:
        return {
          ...base,
          kind: 'shop-gacha',
          label: `Try the gacha ($${GACHA_PRICE})`,
          use: (c) => {
            const result = this.gacha(c, position);
            this.say(c, result.message, !result.ok);
          },
        };
    }
  }

  /** A change of clothes: the same person in something else. */
  private newClothes(current: Outfit): Outfit {
    let next = randomOutfit(this.rng);
    for (let i = 0; i < 8; i++) {
      next.skin.copy(current.skin);
      next.hair.copy(current.hair);
      next.hairStyle = current.hairStyle;
      if (outfitKey(next) !== outfitKey(current)) break;
      next = randomOutfit(this.rng);
    }
    return next;
  }

  /** A line of text for the player; everyone else does without. */
  private say(c: Character, text: string, refused = false): void {
    if (c.isPlayer) this.panel.say(text, refused);
  }

  // --- the counter ---

  private openCounter(shop: Shop, c: Character): void {
    const controller = this.game.controller;
    // The list is a page for the person at the keyboard. Anyone else buys with `sell`.
    if (!c.isPlayer || !controller) return;
    this.serving = shop;
    this.customer = c;
    this.justOpened = true;
    this.message = '';
    this.refused = false;
    controller.locked = true;
    // The pointer is needed for the list; the view stays where it was.
    this.viewYaw = this.game.camera.yaw;
    this.viewPitch = this.game.camera.pitch;
    this.game.input.setWantLock(false);
    this.game.sound('ui_click');
    this.refresh();
  }

  private closeCounter(): void {
    if (!this.serving) return;
    this.serving = null;
    this.customer = null;
    this.panel.hide();
    const controller = this.game.controller;
    if (controller) controller.locked = false;
    if (this.game.phase === 'match') this.game.input.setWantLock(true);
    this.game.sound('ui_back');
  }

  private rows(shop: Shop, c: Character): PanelRow[] {
    return STOCK[shop.type].map((item, i) => {
      const key = String((i + 1) % 10);
      if (item === 'gacha') {
        return { key, item, name: 'Gacha capsule', pack: '', blurb: 'A lucky dip: could be anything.', price: GACHA_PRICE, have: 0, max: 0, can: c.cash >= GACHA_PRICE };
      }
      const def = ITEMS[item];
      const have = c.inventory.count(item);
      return {
        key,
        item,
        name: def.name,
        pack: def.stack > 1 ? `x${def.stack}` : '',
        blurb: def.blurb,
        price: def.price,
        have,
        max: def.max,
        can: c.cash >= def.price && have < def.max,
      };
    });
  }

  private view(): PanelView | null {
    const shop = this.serving;
    const c = this.customer;
    if (!shop || !c) return null;
    return { shop: shop.id, type: shop.type, name: shop.name, kicker: KICKER[shop.type], cash: c.cash, rows: this.rows(shop, c), message: this.message, refused: this.refused };
  }

  private refresh(): void {
    const view = this.view();
    if (view) this.panel.show(view);
  }

  /** The customer asked for row `index` of the open list, with a key or a click. */
  private purchase(index: number): void {
    const shop = this.serving;
    const c = this.customer;
    if (!shop || !c) return;
    const result = this.sell(shop, index, c);
    this.message = result.message;
    this.refused = !result.ok;
    this.refresh();
  }

  /** Sell one thing from a shop's list to a character, if they can pay for it and carry it. */
  private sell(shop: Shop, index: number, c: Character): { ok: boolean; message: string } {
    const item = STOCK[shop.type][index];
    if (item === undefined) return { ok: false, message: '' };
    if (item === 'gacha') return this.gacha(c, shop.counter);
    const def = ITEMS[item];
    const no = (message: string): { ok: boolean; message: string } => {
      this.game.sound('ui_back', shop.counter);
      return { ok: false, message };
    };
    if (c.cash < def.price) return no(`Not enough cash: ${def.name} is $${def.price} and you have $${c.cash}.`);
    const taken = this.game.grant(c, item);
    if (taken === 0) return no(def.kind === 'weapon' ? `You already carry a ${def.name}.` : `You cannot carry more ${def.name}.`);
    c.cash -= def.price;
    this.game.sound('cash', shop.counter);
    return { ok: true, message: `Sold: ${taken > 1 ? `${taken} x ` : ''}${def.name} for $${def.price}.` };
  }

  /** One pull of the gacha: something from the table that the character can still carry. */
  private gacha(c: Character, at: Vector3): { ok: boolean; message: string } {
    const { game } = this;
    if (c.cash < GACHA_PRICE) {
      game.sound('ui_back', at);
      return { ok: false, message: `Not enough cash: a capsule is $${GACHA_PRICE} and you have $${c.cash}.` };
    }
    const left = GACHA.slice();
    while (left.length > 0) {
      const item = this.rng.weighted(left);
      left.splice(
        left.findIndex((e) => e[0] === item),
        1,
      );
      const taken = game.grant(c, item);
      if (taken === 0) continue;
      c.cash -= GACHA_PRICE;
      game.sound('cash', at);
      return { ok: true, message: `The capsule pops open: ${taken > 1 ? `${taken} x ` : ''}${ITEMS[item].name}.` };
    }
    game.sound('ui_back', at);
    return { ok: false, message: 'Your pockets are full: nothing in the machine would fit.' };
  }

  // --- the loop ---

  fixedUpdate(): void {
    const { game } = this;
    const input = game.input;

    if (this.serving) {
      const c = this.customer!;
      const far = Math.hypot(c.position.x - this.serving.counter.x, c.position.z - this.serving.counter.z) > 4.5;
      if (!c.alive || c.state !== 'normal' || far) this.closeCounter();
      else if (this.justOpened) {
        // The key press that opened the list is still on record for this step.
        this.justOpened = false;
      } else if (input.pressed('KeyE') || input.pressed('KeyF') || input.pressed('Escape')) this.closeCounter();
      else {
        const count = STOCK[this.serving.type].length;
        for (let i = 0; i < count; i++) {
          if (input.pressed(DIGITS[i]!)) {
            this.purchase(i);
            break;
          }
        }
      }
    }

    // Ten times a second: who is at a door, and who has walked in.
    if (++this.scan < 6) return;
    this.scan = 0;
    const characters = game.characters;
    for (const shop of this.shops) {
      const d = shop.interior.door;
      let wanted = false;
      for (const c of characters) {
        if (!c.alive) continue;
        const p = c.position;
        if (Math.abs(p.y - SHOPFRONT.floorY) < 3 && Math.hypot(p.x - d.x, p.z - d.z) < DOOR_REACH) {
          wanted = true;
          break;
        }
      }
      shop.wanted = wanted;
      this.setDoorSolid(shop, !wanted && shop.open === 0);
    }
    for (const c of characters) {
      const now = c.alive ? this.shopAt(c.position) : null;
      const before = this.insideOf.get(c) ?? null;
      if (now === before) continue;
      if (now) {
        this.insideOf.set(c, now);
        this.bells++;
        game.sound('door_bell', now.bell);
      } else this.insideOf.delete(c);
    }
  }

  frameUpdate(dt: number): void {
    const { game } = this;
    const camera = game.engine.camera.position;
    const player = game.player;

    // The pointer is free while the list is open; moving it must not swing the view.
    if (this.serving) {
      game.camera.yaw = this.viewYaw;
      game.camera.pitch = this.viewPitch;
    }

    let moved = false;
    for (let i = 0; i < this.shops.length; i++) {
      const shop = this.shops[i]!;
      const o = shop.interior.origin;
      const distance = Math.hypot(camera.x - o.x, camera.z - o.z);

      const full = distance < FURNITURE_RANGE;
      if (full !== shop.full) {
        shop.full = full;
        shop.interior.geometry?.setDrawRange(0, full ? Infinity : shop.interior.shellIndices);
      }
      const near = distance < KEEPER_RANGE;
      shop.keeper.root.visible = near;
      // Only someone close enough to see it breathing is animated.
      if (near && distance < 30) game.clips.apply(game.clips.sample(shop.keeperClip, game.engine.time + shop.keeperPhase, this.pose), shop.keeper.bones);

      const target = shop.wanted ? 1 : 0;
      if (shop.open !== target) {
        const step = dt * 3.4;
        shop.open = target > shop.open ? Math.min(1, shop.open + step) : Math.max(0, shop.open - step * 0.6);
        this.placeLeaves(i);
        moved = true;
        if (shop.open === 0 && !shop.wanted) this.setDoorSolid(shop, true);
      }
    }
    if (moved) {
      this.leaves.instanceMatrix.needsUpdate = true;
      this.leafGlass.instanceMatrix.needsUpdate = true;
    }

    // Park the light in the shop nearest whoever is being watched.
    const focus = game.cameraOverride || !player ? camera : player.visual;
    let best: Shop | null = null;
    let bestD = Infinity;
    for (const shop of this.shops) {
      const d = this.distanceToRoom(shop, focus.x, focus.z);
      if (d < bestD) {
        bestD = d;
        best = shop;
      }
    }
    const night = game.world.sky.night;
    const strength = best ? 1 - smoothstep(5, 20, bestD) : 0;
    if (best && strength > 0) {
      const o = best.interior.origin;
      this.lamp.position.set(o.x, SHOPFRONT.floorY + SHOPFRONT.ceiling - 0.45, o.z);
      this.lamp.intensity = (5 + 9 * night) * strength;
    } else this.lamp.intensity = 0;
  }

  private setDoorSolid(shop: Shop, solid: boolean): void {
    if (shop.doorSolid === solid) return;
    shop.doorSolid = solid;
    shop.doorCollider.setEnabled(solid);
  }

  /** Put a shop's two door leaves where its `open` says. */
  private placeLeaves(index: number): void {
    const shop = this.shops[index]!;
    const { door, along, into } = shop.interior;
    // Ease in and out, so the leaves do not start and stop dead.
    const t = shop.open * shop.open * (3 - 2 * shop.open);
    const yaw = Math.atan2(-along.z, along.x);
    for (let side = 0; side < 2; side++) {
      const s = side === 0 ? -1 : 1;
      const slide = s * (0.5 + t * DOOR_SLIDE);
      // Just inside the fixed panes, so an open leaf slides in front of them.
      _m.makeRotationY(yaw).setPosition(door.x + along.x * slide + into.x * 0.075, SHOPFRONT.floorY, door.z + along.z * slide + into.z * 0.075);
      this.leaves.setMatrixAt(index * 2 + side, _m);
      this.leafGlass.setMatrixAt(index * 2 + side, _m);
    }
  }

  /** The cabinets of the sidewalk drinks machines. They stand in the weather, so they are lit like the street. */
  private streetMachines(): Mesh | null {
    const parts: BufferGeometry[] = [];
    for (const shop of this.shops) {
      const m = shop.interior.streetMachine;
      if (!m) continue;
      // 1.0 wide, 0.78 deep, from 0.42 behind its middle to 0.36 in front.
      const sx = Math.abs(m.fz) * 1.0 + Math.abs(m.fx) * 0.78;
      const sz = Math.abs(m.fx) * 1.0 + Math.abs(m.fz) * 0.78;
      parts.push(new BoxGeometry(sx, 1.98, sz).translate(m.x - m.fx * 0.03, SHOPFRONT.floorY + 0.99, m.z - m.fz * 0.03));
    }
    if (parts.length === 0) return null;
    const mesh = new Mesh(mergeGeometries(parts), new MeshStandardMaterial({ color: 0xa3142c, roughness: 0.42, metalness: 0.25 }));
    for (const g of parts) g.dispose();
    mesh.name = 'shop-street-machines';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /** Room coordinates of a world point: across (right of someone walking in) and depth from the shopfront. */
  private local(shop: Shop, x: number, z: number): { across: number; depth: number } {
    const i = shop.interior;
    const dx = x - i.origin.x;
    const dz = z - i.origin.z;
    return { across: dx * i.along.x + dz * i.along.z, depth: dx * i.into.x + dz * i.into.z + i.depth / 2 };
  }

  private contains(shop: Shop, x: number, y: number, z: number): boolean {
    if (y < SHOPFRONT.floorY - 0.6 || y > SHOPFRONT.floorY + SHOPFRONT.ceiling) return false;
    const p = this.local(shop, x, z);
    return Math.abs(p.across) < shop.interior.halfWidth && p.depth > 0 && p.depth < shop.interior.depth;
  }

  private shopAt(p: Vector3): Shop | null {
    for (const shop of this.shops) if (this.contains(shop, p.x, p.y, p.z)) return shop;
    return null;
  }

  /** How far a point on the ground is from a shop's room: 0 inside it. */
  private distanceToRoom(shop: Shop, x: number, z: number): number {
    const p = this.local(shop, x, z);
    const dx = Math.max(0, Math.abs(p.across) - shop.interior.halfWidth);
    const dz = Math.max(0, -p.depth, p.depth - shop.interior.depth);
    return Math.hypot(dx, dz);
  }

  /** A point of the room in the world, from its place across and its depth from the shopfront. */
  private world(shop: Shop, across: number, depth: number): { x: number; z: number } {
    const i = shop.interior;
    const back = depth - i.depth / 2;
    return { x: i.origin.x + i.along.x * across + i.into.x * back, z: i.origin.z + i.along.z * across + i.into.z * back };
  }

  /**
   * How to walk to a place in a shop from the aisle that runs back from its door: down the aisle,
   * across, and for places behind a counter a last leg along the wall. Things on the sidewalk are
   * reached by way of the doorstep.
   */
  private route(shop: Shop, x: number, z: number, outside: boolean, lane?: number): { x: number; z: number }[] {
    const stand = { x, z };
    if (outside) return [{ x: shop.interior.outside.x, z: shop.interior.outside.z }, stand];
    const at = this.local(shop, x, z);
    const depth = lane ?? at.depth;
    const out = [this.world(shop, 0, depth)];
    if (lane !== undefined) out.push(this.world(shop, at.across, depth));
    out.push(stand);
    return out;
  }

  // --- for tests and tools ---

  debug(): Record<string, unknown> {
    const { game } = this;
    const describe = (shop: Shop): Record<string, unknown> => {
      const i = shop.interior;
      const rects = shopClearRects(shop.site);
      const things = i.spots.map((s) => ({ kind: s.kind, x: s.x, y: s.y, z: s.z, standX: s.standX, standZ: s.standZ, outside: s.outside === true, route: this.route(shop, s.standX, s.standZ, s.outside === true, s.lane) }));
      things.unshift({ kind: 'counter', x: shop.counter.x, y: shop.counter.y, z: shop.counter.z, standX: i.counter.x, standZ: i.counter.z, outside: false, route: this.route(shop, i.counter.x, i.counter.z, false) });
      return {
        id: shop.id,
        type: shop.type,
        name: shop.name,
        door: { ...i.door },
        inside: { ...i.inside },
        outside: { ...i.outside },
        counter: { ...i.counter },
        keeper: { ...i.keeper },
        /** The room on the ground, and the sidewalk in front of the door. */
        rect: rects.room,
        apron: rects.apron,
        ceiling: SHOPFRONT.ceiling,
        doorWidth: SHOPFRONT.doorWidth,
        furniture: { ...i.furniture },
        interactables: things,
        vertices: i.vertices,
        triangles: i.triangles,
      };
    };
    return {
      list: () => this.shops.map(describe),
      /** Put the player just inside a shop's door, facing in. */
      enter: (id: number): boolean => {
        const shop = this.byId.get(id);
        if (!shop) return false;
        const i = shop.interior;
        // From the menu, the seaplane or a lost round this starts play on foot: nothing moves outside
        // a match, and someone falling is not ours to place.
        const p = game.player;
        if (!p || game.phase !== 'match' || !p.alive || game.drop.has(p)) game.startAt(i.outside.x, i.outside.z, i.door.yaw);
        const c = game.player!;
        this.closeCounter();
        c.vehicle?.exit(c);
        c.rise();
        c.teleport(i.inside.x, i.inside.y + 0.03, i.inside.z, i.door.yaw);
        game.camera.yaw = i.door.yaw;
        game.camera.pitch = -0.12;
        game.camera.snap();
        return true;
      },
      panel: () => this.panel.describe(),
      jukebox: () => this.lastTrack,
      outfitKey: () => (game.player ? outfitKey(game.player.rig.outfit) : ''),
      /** Which shop the player is in, how much headroom they have and how far its door is open. */
      where: () => {
        const c = game.player;
        if (!c) return null;
        const p = c.position;
        const shop = this.shopAt(p);
        const up = game.physics.raycast(p.x, p.y + 1.0, p.z, 0, 1, 0, 60, CG.queryWorld);
        const nearest = shop ?? this.shops.reduce((a, b) => (this.distanceToRoom(a, p.x, p.z) <= this.distanceToRoom(b, p.x, p.z) ? a : b));
        const at = this.local(nearest, p.x, p.z);
        return {
          shop: shop ? shop.id : null,
          type: shop ? shop.type : null,
          /** Clear height above the feet, or null under open sky. */
          ceiling: up ? up.distance + 1.0 : null,
          door: nearest.open,
          doorSolid: nearest.doorSolid,
          nearest: nearest.id,
          across: at.across,
          depth: at.depth,
          bells: this.bells,
        };
      },
      /** What the shops add to the scene. */
      stats: () => {
        let triangles = 0;
        let vertices = 0;
        let shell = 0;
        let colliders = 0;
        let spots = 0;
        for (const shop of this.shops) {
          triangles += shop.interior.triangles;
          vertices += shop.interior.vertices;
          shell += shop.interior.shellIndices / 3;
          colliders += shop.interior.colliders.length + 2;
          spots += shop.interior.spots.length + 1;
        }
        return { shops: this.shops.length, triangles, vertices, shellTriangles: shell, colliders, interactables: spots, machinesOutside: this.shops.filter((s) => s.interior.streetMachine).length, lamp: this.lamp.intensity };
      },
      /** Loot that stands where a shop needs the floor: in a room or right in front of a door. */
      blocked: () => {
        const out: { shop: number; where: string; container: number }[] = [];
        for (const c of game.loot?.containers ?? []) {
          if (Math.abs(c.y - SHOPFRONT.floorY) > 3) continue;
          for (const shop of this.shops) {
            const r = shopClearRects(shop.site);
            for (const [where, q] of [
              ['room', r.room],
              ['apron', r.apron],
            ] as const) {
              if (c.x > q.x0 && c.x < q.x1 && c.z > q.z0 && c.z < q.z1) out.push({ shop: shop.id, where, container: c.id });
            }
          }
        }
        return out;
      },
      /** Sell from a shop's list without the panel, as a bot would. */
      sell: (id: number, index: number) => {
        const shop = this.byId.get(id);
        return shop && game.player ? this.sell(shop, index, game.player) : null;
      },
    };
  }
}

/** One sliding door leaf's frame: stiles, rails and a push bar. Its origin is the foot of its middle. */
function leafFrame(): BufferGeometry {
  const w = SHOPFRONT.doorWidth / 2;
  const h = SHOPFRONT.doorHeight;
  const t = 0.04;
  const bar = (x: number, y: number, sx: number, sy: number, depth = t): BufferGeometry => new BoxGeometry(sx, sy, depth).translate(x, y, 0);
  const parts = [
    bar(-w / 2 + 0.03, h / 2, 0.06, h),
    bar(w / 2 - 0.03, h / 2, 0.06, h),
    bar(0, h - 0.035, w, 0.07),
    bar(0, 0.07, w, 0.14),
    // A bar to push, at hand height.
    bar(0, 1.05, w - 0.16, 0.05, 0.09),
  ];
  const merged = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return merged;
}

function leafPane(): BufferGeometry {
  const w = SHOPFRONT.doorWidth / 2;
  const h = SHOPFRONT.doorHeight;
  return new PlaneGeometry(w - 0.12, h - 0.21).translate(0, 0.14 + (h - 0.21) / 2, 0);
}

