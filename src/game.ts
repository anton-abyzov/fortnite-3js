import { Vector3 } from 'three';
import { Assets } from './core/assets';
import { Engine } from './core/engine';
import { Emitter } from './core/events';
import { Input } from './core/input';
import { Settings } from './core/settings';
import { Physics } from './physics/physics';
import { World } from './world/world';

export type Phase = 'boot' | 'menu' | 'loading' | 'match' | 'ended';

export interface GameEvents extends Record<string, unknown> {
  phase: Phase;
}

export interface GameOptions {
  seed: number;
}

/** Owns every system and runs the loop. */
export class Game {
  readonly settings = new Settings();
  readonly assets = new Assets();
  readonly events = new Emitter<GameEvents>();
  engine!: Engine;
  input!: Input;
  physics!: Physics;
  world!: World;
  phase: Phase = 'boot';
  errors: string[] = [];
  /** Camera target used while no player is in control (menu flyover, debug views). */
  readonly viewTarget = new Vector3(0, 10, 0);
  private orbit = 0;
  /** When set, the debug API has taken over the camera. */
  cameraOverride = false;

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly options: GameOptions,
  ) {}

  async init(progress: (fraction: number, label: string) => void): Promise<void> {
    progress(0.05, 'Starting physics');
    this.physics = await Physics.create();
    progress(0.12, 'Starting renderer');
    this.engine = new Engine(this.canvas, this.settings);
    this.input = new Input(this.canvas);
    this.world = World.create(this.options.seed, this.engine.scene, this.engine.renderer, this.physics, this.settings, progress);
    progress(0.9, 'Warming up');
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

  private fixedUpdate(_dt: number): void {
    this.physics.step();
    this.input.endFixedStep();
  }

  private frameUpdate(dt: number, _alpha: number): void {
    const { camera } = this.engine;
    if (!this.cameraOverride) {
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
