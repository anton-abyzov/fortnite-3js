import { Vector3 } from 'three';
import { Character } from './character/character';
import { ClipBank } from './character/clips';
import { heroOutfit } from './character/rig';
import { Assets, type ModelAsset } from './core/assets';
import { Engine } from './core/engine';
import { Emitter } from './core/events';
import { Input } from './core/input';
import { Settings } from './core/settings';
import type { GameSystem } from './core/system';
import { ThirdPersonCamera } from './gameplay/camera';
import { Interactions } from './gameplay/interactions';
import { ITEMS, type ItemId } from './gameplay/items';
import { PlayerController } from './gameplay/player';
import { Physics } from './physics/physics';
import type { Vehicle } from './vehicles/vehicle';
import { World } from './world/world';

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
  readonly characters: Character[] = [];
  /** Everything usable with the interact key. */
  readonly interactions = new Interactions();
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
    progress(0.9, 'Warming up');
    // Ray and shape queries see the colliders only after a step.
    this.physics.step();
    this.engine.start({
      fixed: (dt) => this.fixedUpdate(dt),
      frame: (dt, alpha) => this.frameUpdate(dt, alpha),
    });
    progress(1, 'Ready');
    this.setPhase('menu');
  }

  /**
   * Hurt a character. Armor soaks the damage first. Returns the damage dealt, and emits `hurt` and,
   * when it was the end of them, `kill`.
   */
  hurt(target: Character, amount: number, info: DamageInfo): number {
    if (!target.alive || amount <= 0) return 0;
    let left = amount;
    if (info.cause !== 'storm' && info.cause !== 'drown' && info.cause !== 'fall') {
      const soaked = Math.min(target.armor, left);
      target.armor -= soaked;
      left -= soaked;
    }
    target.health = Math.max(0, target.health - left);
    target.sinceHurt = 0;
    if (info.dir) target.anim.flinch(info.dir.x, info.dir.z, Math.min(1, amount / 40));
    this.events.emit('hurt', { target, amount, info });
    if (target.health <= 0) {
      target.alive = false;
      target.vehicle?.exit(target);
      this.events.emit('kill', { victim: target, info });
    }
    return amount;
  }

  /** Give a character items (a pickup, a purchase). Returns how many they could take. */
  grant(to: Character, item: ItemId, count: number = ITEMS[item].stack): number {
    const taken = to.inventory.add(item, count);
    if (taken > 0) this.events.emit('grant', { to, item, count: taken });
    return taken;
  }

  /**
   * Play a one-shot sound, at a point in the world when `position` is given. Names are the audio
   * engine's `SoundName`s; unknown names are ignored.
   */
  sound(_name: string, _position?: { x: number; y: number; z: number }, _volume = 1): void {
    // Wired to the audio engine in T-12.
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

  /** Put the player on the ground at a point and hand over control, skipping the drop. */
  startAt(x: number, z: number, yaw = 0): Character {
    if (!this.player) {
      this.player = this.spawnCharacter('You', true, x, z, yaw);
      this.controller = new PlayerController(this.player, this.input, this.camera, this.settings, this.interactions);
    } else {
      const y = this.physics.groundHeight(x, 200, z, 400, this.world.field.heightAt(x, z)) + 0.05;
      this.player.vehicle?.exit(this.player);
      this.player.teleport(x, y, z, yaw);
    }
    this.camera.yaw = yaw;
    this.camera.pitch = -0.12;
    this.camera.snap();
    this.cameraOverride = false;
    this.input.setWantLock(true);
    this.setPhase('match');
    return this.player;
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
    const ground = this.world.field.heightAt(camera.position.x, camera.position.z);
    this.world.update(this.engine.time, camera, this.viewTarget, Math.max(0, camera.position.y - ground));
    this.input.endFrame();
  }
}
