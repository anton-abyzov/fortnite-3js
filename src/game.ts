import { BoxGeometry, Color, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { Assets } from './core/assets';
import { Engine } from './core/engine';
import { Emitter } from './core/events';
import { Input } from './core/input';
import { Settings } from './core/settings';
import { Physics } from './physics/physics';

export type Phase = 'boot' | 'menu' | 'loading' | 'match' | 'ended';

export interface GameEvents extends Record<string, unknown> {
  phase: Phase;
}

/** Owns every system and runs the loop. */
export class Game {
  readonly settings = new Settings();
  readonly assets = new Assets();
  readonly events = new Emitter<GameEvents>();
  engine!: Engine;
  input!: Input;
  physics!: Physics;
  phase: Phase = 'boot';
  errors: string[] = [];

  constructor(readonly canvas: HTMLCanvasElement) {}

  async init(progress: (fraction: number, label: string) => void): Promise<void> {
    progress(0.05, 'Starting physics');
    this.physics = await Physics.create();
    progress(0.15, 'Starting renderer');
    this.engine = new Engine(this.canvas, this.settings);
    this.input = new Input(this.canvas);
    this.buildPlaceholder();
    this.engine.start({
      fixed: (dt) => this.fixedUpdate(dt),
      frame: (dt, alpha) => this.frameUpdate(dt, alpha),
    });
    progress(1, 'Ready');
    this.setPhase('menu');
  }

  private buildPlaceholder(): void {
    const { scene, camera } = this.engine;
    scene.background = new Color(0x6ec6ff);
    scene.add(new HemisphereLight(0xbfe3ff, 0x8a7a5c, 1.2));
    const sun = new DirectionalLight(0xfff1d6, 3);
    sun.position.set(30, 50, 20);
    scene.add(sun);
    const ground = new Mesh(new PlaneGeometry(200, 200), new MeshStandardMaterial({ color: 0xe8d7a8 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    const box = new Mesh(new BoxGeometry(2, 2, 2), new MeshStandardMaterial({ color: 0xff7a59 }));
    box.position.set(0, 1, 0);
    box.name = 'placeholder-box';
    scene.add(box);
    camera.position.set(6, 4, 8);
    camera.lookAt(0, 1, 0);
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
    const box = this.engine.scene.getObjectByName('placeholder-box');
    if (box) box.rotation.y += dt;
    this.input.endFrame();
  }
}
