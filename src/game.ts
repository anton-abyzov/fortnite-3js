import { Vector3 } from 'three';
import { Bots } from './ai/bots';
import { GameAudio } from './audio/system';
import { Character } from './character/character';
import { ClipBank } from './character/clips';
import { heroOutfit } from './character/rig';
import { Assets, type ModelAsset } from './core/assets';
import { Engine } from './core/engine';
import { Emitter } from './core/events';
import { Input } from './core/input';
import { QUALITY, type QualityName, Settings } from './core/settings';
import type { GameSystem } from './core/system';
import { ThirdPersonCamera } from './gameplay/camera';
import { Drop } from './gameplay/drop';
import { Match, type MatchResult } from './gameplay/match';
import { Interactions } from './gameplay/interactions';
import { Combat } from './gameplay/combat';
import { ITEMS, type ConsumableId, type ItemId, type WeaponId } from './gameplay/items';
import { PlayerController } from './gameplay/player';
import { Physics } from './physics/physics';
import { Effects } from './render/particles';
import type { Vehicle } from './vehicles/vehicle';
import { type Container, Loot } from './world/loot';
import { NavGrid } from './world/navgrid';
import { World } from './world/world';
import { Zone, type ZoneStage } from './world/zone';

export type Phase = 'boot' | 'menu' | 'loading' | 'match' | 'ended';

export type DamageCause = 'bullet' | 'explosion' | 'vehicle' | 'fall' | 'storm' | 'drown';

export interface DamageInfo {
  /** Who did it, when someone did. */
  by: Character | null;
  cause: DamageCause;
  /** Item id of the weapon, for the kill feed. */
  weapon?: string;
  headshot?: boolean;
  /** World direction the blow travelled, for flinch and knockback. */
  dir?: Vector3;
  point?: Vector3;
}

export interface GameEvents extends Record<string, unknown> {
  phase: Phase;
  /** A character took damage. */
  hurt: { target: Character; amount: number; info: DamageInfo };
  /** A character died. */
  kill: { victim: Character; info: DamageInfo };
  /** A character received items (pickup or purchase). */
  grant: { to: Character; item: ItemId; count: number };
  /** A character came down from the drop, onto something solid or into water. */
  landed: { who: Character; water: boolean };
  /** A weapon was fired, from this point. `end` is where the first pellet stopped and `hit` what it found. */
  shot: { by: Character; weapon: WeaponId; x: number; y: number; z: number; end?: Vector3; hit?: string };
  /** Someone got into a vehicle seat (`seat` >= 0) or out of one (`seat` is -1). */
  seat: { who: Character; vehicle: Vehicle; seat: number };
  /** Something exploded. */
  blast: { x: number; y: number; z: number; by: Character | null };
  /** A character finished using a bandage, a medkit, a drink or a vest. */
  used: { who: Character; item: ConsumableId };
  /** A character picked up money. */
  cash: { to: Character; amount: number };
  /** A loot container was opened. */
  opened: { container: Container; by: Character | null };
  /** The eye of the storm changed what it is doing: holding, closing, shut. */
  zone: { phase: number; stage: ZoneStage; left: number };
  /** The round is over: one combatant, or none, is left. */
  over: MatchResult;
  /** Someone paid a shop's jukebox, which now plays `track`. `shop` is the lot id. */
  jukebox: { shop: number; track: string; by: Character; x: number; y: number; z: number };
}

export interface GameOptions {
  seed: number;
}

const CHARACTER_MODEL = 'models/character.glb';

/** Owns every system and runs the loop. */
export class Game {
  readonly settings = new Settings();
  readonly assets = new Assets();
  readonly events = new Emitter<GameEvents>();
  engine!: Engine;
  input!: Input;
  physics!: Physics;
  world!: World;
  clips!: ClipBank;
  characterAsset!: ModelAsset;
  camera!: ThirdPersonCamera;
  drop!: Drop;
  /** Sparks, smoke, spray: `fx.burst(kind, x, y, z)`. */
  readonly fx = new Effects();
  readonly match = new Match(this);
  /** Shooting, reloading, healing and grenades for every combatant. */
  combat!: Combat;
  /** Containers and everything lying on the ground. */
  loot!: Loot;
  /** Where people on foot can go, and how to walk from one place to another. */
  nav!: NavGrid;
  /** The eye of the storm. */
  zone!: Zone;
  /** The rivals. */
  bots!: Bots;
  /** Sound: one-shots, ambience, engines and music. Silent until the player's first click or key press. */
  audio: GameAudio | null = null;
  readonly characters: Character[] = [];
  /** Everything usable with the interact key. */
  readonly interactions = new Interactions();
  /** Lane traffic, when the cars are loaded. A friends round holds it still, as each browser runs its own. */
  traffic: { paused: boolean } | null = null;
  /** Every drivable thing in the world. Vehicles add themselves. */
  readonly vehicles: Vehicle[] = [];
  /** Things that run in the loop. See `addSystem`. */
  readonly systems: GameSystem[] = [];
  /** Extra debug entry points that systems publish for tests, under `window.__eyewall.ext`. */
  readonly debugExt: Record<string, any> = {};
  player: Character | null = null;
  controller: PlayerController | null = null;
  phase: Phase = 'boot';
  errors: string[] = [];
  /** Camera target used while no player is in control (menu flyover, debug views). */
  readonly viewTarget = new Vector3(0, 10, 0);
  private orbit = 0;
  /** When set, the debug API has taken over the camera. */
  cameraOverride = false;
  /** Debug: keep the camera at this offset from the player, looking at them. */
  debugChase: Vector3 | null = null;
  /** Water surface height at a point, or -50 on land. */
  readonly env = { waterHeight: (x: number, z: number): number => (this.world.field.isLand(x, z) ? -50 : this.world.water.height(x, z)) };

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly options: GameOptions,
  ) {}

  async init(progress: (fraction: number, label: string) => void): Promise<void> {
    progress(0.05, 'Starting physics');
    this.physics = await Physics.create();
    progress(0.1, 'Loading models');
    this.characterAsset = await this.assets.loadModel(CHARACTER_MODEL);
    this.clips = new ClipBank(this.characterAsset);
    progress(0.16, 'Starting renderer');
    this.engine = new Engine(this.canvas, this.settings);
    this.input = new Input(this.canvas);
    this.camera = new ThirdPersonCamera(this.engine.camera, this.physics);
    this.camera.baseFov = this.settings.data.fov;
    this.world = World.create(this.options.seed, this.engine.scene, this.engine.renderer, this.physics, this.settings, progress);
    this.fx.attach(this.engine.scene, this.engine.camera, this.canvas);
    this.addSystem(this.fx);
    progress(0.74, 'Stocking the coolers');
    // Its places come from physics rays, which see the city only after a step.
    this.physics.step();
    this.combat = this.addSystem(await Combat.create(this));
    this.loot = this.addSystem(await Loot.create(this));
    this.drop = this.addSystem(new Drop(this));
    // `?without=cars,boats,shops` leaves parts of the world out, to look at one part alone. Each part
    // loads as its own chunk, so one that is left out is never fetched.
    const without = new Set((new URLSearchParams(location.search).get('without') ?? '').split(','));
    if (!without.has('cars')) {
      progress(0.78, 'Parking cars');
      await (await import('./vehicles/cars')).installCars(this);
    }
    if (!without.has('boats')) {
      progress(0.82, 'Mooring boats');
      await (await import('./vehicles/boats')).installBoats(this);
    }
    if (!without.has('shops')) {
      progress(0.86, 'Opening the shops');
      await (await import('./world/shops')).installShops(this);
    }
    progress(0.88, 'Charting the streets');
    // The grid is surveyed with physics rays, which see what was just installed only after a step.
    this.physics.step();
    this.nav = new NavGrid(this.world.field, this.world.layout, this.physics);
    this.zone = this.addSystem(new Zone(this));
    this.addSystem(this.match);
    progress(0.89, 'Waking the rivals');
    // The player is combatant number one; the rest wait in the wings until a round starts.
    const player = this.ensurePlayer();
    this.bots = this.addSystem(new Bots(this));
    this.bots.park(player);
    this.settings.onChange((_data, changed) => {
      if (changed !== 'quality') return;
      this.engine.applyQuality();
      this.world.sky.applyQuality(this.settings.quality);
      this.world.water.setGrid(this.settings.quality.waterGrid);
      this.world.streetLights.setCount(this.settings.quality.streetLights);
    });
    // Still slow at the lowest resolution: take the next lighter preset.
    this.engine.onStruggle = () => {
      const order: QualityName[] = ['ultra', 'high', 'medium', 'low'];
      const next = order[order.indexOf(this.settings.data.quality) + 1];
      if (!next || !(next in QUALITY)) return;
      // For this sitting only: the next visit may find the GPU with nothing else to do.
      this.settings.set('quality', next, false);
    };
    progress(0.9, 'Warming up');
    // Ray and shape queries see the colliders only after a step.
    this.physics.step();
    this.warmUp();
    this.audio = new GameAudio(this);
    this.engine.start({
      fixed: (dt) => this.fixedUpdate(dt),
      frame: (dt, alpha) => this.frameUpdate(dt, alpha),
    });
    progress(1, 'Ready');
    this.setPhase('menu');
  }

  /**
   * Draw the whole city once while the loading bar is still up. The first draw compiles the shaders and
   * sends the meshes and textures to the GPU, which takes seconds: without this they would be the first
   * seconds of the round, and the engine would take them for a GPU too slow for the preset.
   */
  private warmUp(): void {
    const cam = this.engine.camera;
    const at = cam.position.clone();
    const facing = cam.quaternion.clone();
    try {
      // High over the middle of the island, looking down: everything is inside the frame.
      cam.position.set(0, 900, 1);
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld(true);
      this.engine.post.render(0);
      // From the street as well: the sky and the sea at a grazing angle are other shader paths.
      cam.position.set(-60, 4, 13);
      cam.lookAt(200, 6, 0);
      cam.updateMatrixWorld(true);
      this.engine.post.render(0);
    } catch (err) {
      console.warn('warm-up draw failed', err);
    }
    cam.position.copy(at);
    cam.quaternion.copy(facing);
    cam.updateMatrixWorld(true);
  }

  /**
   * Hurt a character. Armor soaks the damage first. Returns the damage dealt, and emits `hurt` and,
   * when it was the end of them, `kill`.
   */
  /** A say in how hard a hit lands (the bots go easier on each other than on the player). */
  hurtScale: ((target: Character, info: DamageInfo) => number) | null = null;

  /**
   * In a friends room, decides where damage is worked out: return false and it is not applied here
   * (a guest sends it to the host instead). Unset in single player.
   */
  hurtGate: ((target: Character, amount: number, info: DamageInfo) => boolean) | null = null;

  hurt(target: Character, amount: number, info: DamageInfo): number {
    if (!target.alive || amount <= 0) return 0;
    if (this.hurtGate && !this.hurtGate(target, amount, info)) return 0;
    if (this.hurtScale) amount *= this.hurtScale(target, info);
    let left = amount;
    if (info.cause !== 'storm' && info.cause !== 'drown' && info.cause !== 'fall') {
      const soaked = Math.min(target.armor, left);
      target.armor -= soaked;
      left -= soaked;
    }
    return this.settleHurt(target, amount, Math.max(0, target.health - left), target.armor, info);
  }

  /**
   * Damage already worked out somewhere else (the host of a friends room): set health and armor to
   * what they became, and tell everyone as `hurt` does.
   */
  applyHurt(target: Character, amount: number, health: number, armor: number, info: DamageInfo): number {
    if (!target.alive) return 0;
    return this.settleHurt(target, amount, health, armor, info);
  }

  private settleHurt(target: Character, amount: number, health: number, armor: number, info: DamageInfo): number {
    target.armor = armor;
    target.health = health;
    target.sinceHurt = 0;
    if (info.by && info.by !== target) {
      target.lastHurtBy = info.by;
      target.sinceHurtBy = 0;
    }
    if (info.dir) target.anim.flinch(info.dir.x, info.dir.z, Math.min(1, amount / 40));
    this.events.emit('hurt', { target, amount, info });
    if (target.health <= 0) {
      target.alive = false;
      // The storm and long falls finish what someone else started: they get the credit.
      if (!info.by && target.lastHurtBy && target.sinceHurtBy < 12) info.by = target.lastHurtBy;
      if (info.by && info.by !== target) info.by.kills++;
      target.vehicle?.exit(target);
      this.events.emit('kill', { victim: target, info });
    }
    return amount;
  }

  /**
   * Give a character items (a pickup, a purchase). Returns how many they could take. A weapon comes
   * in a `tier`; one already carried is only taken when the new one is better.
   */
  grant(to: Character, item: ItemId, count: number = ITEMS[item].stack, tier = 0): number {
    if (ITEMS[item].kind === 'weapon') {
      const id = item as WeaponId;
      if (!to.loadout.give(id, tier)) return 0;
      to.inventory.counts[id] = 1;
      // Bare hands: draw it.
      if (!to.loadout.current && !to.act.slot) to.act.slot = id;
      this.events.emit('grant', { to, item, count: 1 });
      return 1;
    }
    const taken = to.inventory.add(item, count);
    if (taken > 0) this.events.emit('grant', { to, item, count: taken });
    return taken;
  }

  /**
   * Play a one-shot sound, at a point in the world when `position` is given. Names are the audio
   * engine's `SoundName`s; unknown names are ignored.
   */
  sound(name: string, position?: { x: number; y: number; z: number }, volume = 1): void {
    // Before the audio exists (while the game loads) there is nobody to hear it.
    this.audio?.play(name, position, volume);
  }

  addSystem<T extends GameSystem>(system: T): T {
    this.systems.push(system);
    return system;
  }

  removeSystem(system: GameSystem): void {
    const i = this.systems.indexOf(system);
    if (i >= 0) this.systems.splice(i, 1);
  }

  setPhase(phase: Phase): void {
    this.phase = phase;
    this.events.emit('phase', phase);
  }

  /** Create a character standing at a point on the map. */
  spawnCharacter(name: string, isPlayer: boolean, x: number, z: number, yaw: number, outfit = heroOutfit()): Character {
    const y = this.physics.groundHeight(x, 200, z, 400, this.world.field.heightAt(x, z)) + 0.05;
    const c = new Character(this.characters.length, name, isPlayer, this.characterAsset, this.clips, this.physics, this.engine.scene, outfit, x, y, z);
    c.teleport(x, y, z, yaw);
    this.characters.push(c);
    return c;
  }

  /** The player's character, made on first use. */
  ensurePlayer(x = -60, z = 13, yaw = 0): Character {
    if (!this.player) {
      this.player = this.spawnCharacter('You', true, x, z, yaw);
      this.player.cash = 300;
      this.controller = new PlayerController(this.player, this.input, this.camera, this.settings, this.interactions);
    }
    return this.player;
  }

  /** Start a round aboard the seaplane. */
  startMatch(): void {
    this.match.start();
  }

  /**
   * What "Play again" and "Title" on the result card and the pause card do. A friends room replaces
   * them while it is open.
   */
  roundHooks: { again(): void; title(): void } | null = null;

  playAgain(): void {
    if (this.roundHooks) this.roundHooks.again();
    else this.startMatch();
  }

  toTitle(): void {
    if (this.roundHooks) {
      this.roundHooks.title();
      return;
    }
    this.input.setWantLock(false);
    this.match.stop();
    this.setPhase('menu');
  }

  /** Put the player on the ground at a point and hand over control, skipping the drop. */
  startAt(x: number, z: number, yaw = 0): Character {
    const player = this.ensurePlayer(x, z, yaw);
    this.match.stop();
    const y = this.physics.groundHeight(x, 200, z, 400, this.world.field.heightAt(x, z)) + 0.05;
    this.drop.release(player);
    player.vehicle?.exit(player);
    if (!player.alive) {
      // Back from a lost round.
      player.alive = true;
      player.health = player.maxHealth;
      player.armor = 0;
      this.combat.reset(player);
    }
    player.teleport(x, y, z, yaw);
    this.camera.yaw = yaw;
    this.camera.pitch = -0.12;
    this.camera.snap();
    this.cameraOverride = false;
    this.input.setWantLock(true);
    this.setPhase('match');
    return player;
  }

  private fixedUpdate(dt: number): void {
    const systems = this.systems;
    if (this.phase === 'match') {
      this.controller?.fixedUpdate();
      for (let i = 0; i < systems.length; i++) systems[i]!.fixedUpdate?.(dt);
      for (const c of this.characters) c.fixedUpdate(dt, this.env);
    }
    this.physics.step();
    if (this.phase === 'match') for (let i = 0; i < systems.length; i++) systems[i]!.postPhysics?.(dt);
    this.input.endFixedStep();
  }

  private frameUpdate(dt: number, alpha: number): void {
    const { camera } = this.engine;
    const playing = this.phase === 'match' && this.player && this.controller;
    if (playing) {
      const input = this.input;
      this.controller!.frameUpdate(dt, input.held('Mouse2'));
      // Vehicles place their occupants, so they go before the characters are posed.
      for (let i = 0; i < this.systems.length; i++) this.systems[i]!.frameUpdate?.(dt, alpha);
      for (const c of this.characters) c.frameUpdate(dt, alpha);
      if (this.debugChase) {
        const p = this.player!.visual;
        camera.position.set(p.x + this.debugChase.x, p.y + this.debugChase.y, p.z + this.debugChase.z);
        this.viewTarget.set(p.x, p.y + 0.95, p.z);
        camera.lookAt(this.viewTarget);
      } else if (!this.cameraOverride) {
        this.camera.update(dt, this.controller!.subject);
        this.viewTarget.copy(this.player!.visual);
      }
    } else if (!this.cameraOverride) {
      // Slow orbit over the city behind the menu.
      this.orbit += dt * 0.035;
      const r = 430;
      camera.position.set(Math.sin(this.orbit) * r + 40, 150, Math.cos(this.orbit) * r);
      this.viewTarget.set(40, 10, 0);
      camera.lookAt(this.viewTarget);
    }
    this.fx.daylight = 1 - this.world.sky.night;
    const ground = this.world.field.heightAt(camera.position.x, camera.position.z);
    this.world.update(this.engine.time, camera, this.viewTarget, Math.max(0, camera.position.y - ground));
    // The listener goes where the camera has just been put, in the menu as much as in a round.
    this.audio?.frame(dt);
    this.input.endFrame();
  }
}
