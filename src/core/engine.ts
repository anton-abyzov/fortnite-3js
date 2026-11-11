import { ACESFilmicToneMapping, PCFShadowMap, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from 'three';
import { FIXED_DT, MAX_STEPS_PER_FRAME } from './config';
import type { Settings } from './settings';
import { PostFX } from '../render/post';

export interface LoopHandlers {
  /** Runs at exactly 60 Hz of game time. Physics and gameplay live here. */
  fixed(dt: number): void;
  /** Runs once per rendered frame. `alpha` is how far the frame is between two fixed steps (0..1). */
  frame(dt: number, alpha: number): void;
}

/** Renderer, camera, post chain and the fixed-step game loop. */
export class Engine {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly post: PostFX;
  readonly canvas: HTMLCanvasElement;
  /** Game time multiplier. 0 pauses the simulation while rendering continues. */
  timeScale = 1;
  /** Seconds of game time simulated so far. */
  time = 0;
  frameCount = 0;
  fps = 60;
  frameMs = 16;
  private accumulator = 0;
  private last = 0;
  private running = false;
  private handlers: LoopHandlers | null = null;
  private raf = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;
  /** Recent frame times in ms, for the performance test. */
  readonly frameTimes: number[] = [];
  recordFrames = false;

  constructor(
    canvas: HTMLCanvasElement,
    private settings: Settings,
  ) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      preserveDrawingBuffer: false,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = settings.quality.shadows;
    this.renderer.shadowMap.type = PCFShadowMap;
    // The post chain draws several passes per frame; counters are reset by hand once per frame.
    this.renderer.info.autoReset = false;
    this.camera = new PerspectiveCamera(settings.data.fov, 16 / 9, 0.12, settings.quality.drawDistance);
    this.applyPixelRatio();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.post = new PostFX(this.renderer, this.scene, this.camera, settings.quality);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private applyPixelRatio(): void {
    const cap = this.settings.quality.pixelRatio;
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(cap < 1 ? cap : Math.min(dpr, cap));
  }

  applyQuality(): void {
    const q = this.settings.quality;
    this.applyPixelRatio();
    this.renderer.shadowMap.enabled = q.shadows;
    this.camera.far = q.drawDistance;
    this.camera.updateProjectionMatrix();
    this.post.applyQuality(q);
    this.resize();
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.post.resize();
  }

  start(handlers: LoopHandlers): void {
    this.handlers = handlers;
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(tick);
      const realDt = Math.min(0.1, (now - this.last) / 1000);
      this.frameMs = now - this.last;
      this.last = now;
      this.step(realDt * this.timeScale, realDt);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Advance the game by `dt` seconds of game time and draw one frame. */
  step(dt: number, realDt = dt): void {
    const h = this.handlers;
    if (!h) return;
    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
      h.fixed(FIXED_DT);
      this.time += FIXED_DT;
      this.accumulator -= FIXED_DT;
      steps++;
    }
    if (this.accumulator > FIXED_DT * 2) this.accumulator = 0;
    h.frame(dt, this.accumulator / FIXED_DT);
    this.renderer.info.reset();
    this.post.render(realDt);
    this.frameCount++;
    this.fpsAccum += realDt;
    this.fpsFrames++;
    if (this.recordFrames) this.frameTimes.push(this.frameMs);
    if (this.fpsAccum >= 0.5) {
      this.fps = this.fpsFrames / this.fpsAccum;
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
  }

  /**
   * Run the simulation forward without drawing, as fast as the CPU allows.
   * Used by tests and by "skip" actions. Frame handlers run at a reduced rate to keep animation state sane.
   */
  fastForward(seconds: number, frameEvery = 6): void {
    const h = this.handlers;
    if (!h) return;
    const steps = Math.round(seconds / FIXED_DT);
    for (let i = 0; i < steps; i++) {
      h.fixed(FIXED_DT);
      this.time += FIXED_DT;
      if (i % frameEvery === frameEvery - 1) h.frame(FIXED_DT * frameEvery, 0);
    }
  }
}
