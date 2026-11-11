import { Vector3 } from 'three';
import { Character } from './character/character';
import { ClipBank } from './character/clips';
import { heroOutfit } from './character/rig';
import { Assets, type ModelAsset } from './core/assets';
import { Engine } from './core/engine';
import { Emitter } from './core/events';
import { Input } from './core/input';
import { Settings } from './core/settings';
import { ThirdPersonCamera } from './gameplay/camera';
import { PlayerController } from './gameplay/player';
import { Physics } from './physics/physics';
import { World } from './world/world';

export type Phase = 'boot' | 'menu' | 'loading' | 'match' | 'ended';

export interface GameEvents extends Record<string, unknown> {
  phase: Phase;
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
  private readonly env = { waterHeight: (x: number, z: number): number => (this.world.field.isLand(x, z) ? -50 : this.world.water.height(x, z)) };

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
      this.controller = new PlayerController(this.player, this.input, this.camera, this.settings);
    } else {
      const y = this.physics.groundHeight(x, 200, z, 400, this.world.field.heightAt(x, z)) + 0.05;
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
    if (this.phase === 'match') {
      this.controller?.fixedUpdate();
      for (const c of this.characters) c.fixedUpdate(dt, this.env);
    }
    this.physics.step();
    this.input.endFixedStep();
  }

  private frameUpdate(dt: number, alpha: number): void {
    const { camera } = this.engine;
    const playing = this.phase === 'match' && this.player && this.controller;
    if (playing) {
      const input = this.input;
      this.controller!.frameUpdate(dt, input.held('Mouse2'));
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
