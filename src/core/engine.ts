import { ACESFilmicToneMapping, PCFShadowMap, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from 'three';
import { FIXED_DT, MAX_STEPS_PER_FRAME } from './config';
import type { Settings } from './settings';
import { PostFX } from '../render/post';

const MIN_RENDER_SCALE = 0.4;

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
  /** Draw the scene. Off while something opaque covers the canvas (the title screen). */
  renderEnabled = true;
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
  private watchdog = 0;
  /** When the last frame was drawn, as opposed to when the simulation last advanced. */
  private lastFrame = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;
  /**
   * Fraction of the preset's resolution being drawn. The engine lowers it when frames run slow and
   * raises it again when there is room, so the game stays playable on a busy or modest GPU.
   */
  renderScale = 1;
  /** Let the engine change `renderScale` by itself. */
  adaptive = true;
  /** Called when the lowest resolution is still too slow: the game can drop to a lighter preset. */
  onStruggle: (() => void) | null = null;
  private slowWindows = 0;
  private fastWindows = 0;
  private raiseAfter = 6;
  private stalls = 0;
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
    this.renderer.setPixelRatio((cap < 1 ? cap : Math.min(dpr, cap)) * this.renderScale);
  }

  /** Draw at a fraction of the preset's resolution (0.4 to 1). */
  setRenderScale(scale: number): void {
    const next = Math.max(MIN_RENDER_SCALE, Math.min(1, scale));
    if (Math.abs(next - this.renderScale) < 0.005) return;
    this.renderScale = next;
    this.applyPixelRatio();
    this.resize();
  }

  /** Runs twice a second with the frame rate of the last half second. */
  private govern(): void {
    if (!this.adaptive || !this.renderEnabled || document.hidden) {
      this.slowWindows = 0;
      this.fastWindows = 0;
      return;
    }
    if (this.fps < 42) {
      this.slowWindows++;
      this.fastWindows = 0;
    } else if (this.fps > 56) {
      this.fastWindows++;
      this.slowWindows = 0;
    } else {
      this.slowWindows = 0;
      this.fastWindows = 0;
    }
    if (this.slowWindows >= 2) {
      this.slowWindows = 0;
      if (this.renderScale > MIN_RENDER_SCALE + 0.005) {
        // A step up that did not hold makes the next try wait longer.
        this.raiseAfter = Math.min(120, this.raiseAfter * 2);
        this.setRenderScale(this.renderScale * (this.fps < 24 ? 0.7 : 0.85));
      } else {
        this.onStruggle?.();
      }
    } else if (this.fastWindows >= this.raiseAfter && this.renderScale < 1) {
      this.fastWindows = 0;
      this.setRenderScale(this.renderScale * 1.12);
    }
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
    this.lastFrame = this.last;
    const tick = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(tick);
      // The first callback can carry a timestamp from before `start` ran (the page was busy loading),
      // and a negative step would freeze the simulation until the debt was paid.
      const realDt = Math.max(0, Math.min(0.1, (now - this.last) / 1000));
      this.frameMs = Math.max(0, now - this.lastFrame);
      this.lastFrame = now;
      this.last = now;
      this.step(realDt * this.timeScale, realDt, Math.min(1, this.frameMs / 1000));
    };
    this.raf = requestAnimationFrame(tick);
    // When frames arrive seconds apart (a starved GPU), the world must not run in slow motion: keys
    // still have to act and clocks still have to count. So while no frame has come for a while, the
    // simulation is advanced from a timer, and the next frame draws wherever things have got to.
    this.watchdog = window.setInterval(() => {
      if (!this.running || document.hidden) return;
      const now = performance.now();
      if (now - this.last < 90) return;
      const realDt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.advance(realDt * this.timeScale);
    }, 30);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.watchdog);
  }

  /** Run the fixed steps that `dt` seconds of game time call for, then the per-frame handlers. */
  private advance(dt: number): void {
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
  }

  /**
   * Advance the game by `dt` seconds of game time and draw one frame. `frameDt` is the real time
   * since the last frame was drawn, for the frame-rate count.
   */
  step(dt: number, realDt = dt, frameDt = realDt): void {
    if (!this.handlers) return;
    this.advance(dt);
    if (this.renderEnabled) {
      this.renderer.info.reset();
      this.post.render(realDt);
    }
    this.frameCount++;
    this.fpsAccum += frameDt;
    this.fpsFrames++;
    if (this.recordFrames) this.frameTimes.push(this.frameMs);
    if (this.running && this.adaptive && this.renderEnabled && !document.hidden) {
      // Frames this slow mean the GPU is starved (shared with something heavy): shed work at once
      // instead of waiting for the half-second averages, which take many slow frames to fill.
      this.stalls = this.frameMs > 180 ? this.stalls + 1 : 0;
      if (this.stalls >= 3) {
        this.stalls = 0;
        this.raiseAfter = Math.min(120, this.raiseAfter * 2);
        this.setRenderScale(MIN_RENDER_SCALE);
        this.onStruggle?.();
      }
    }
    if (this.fpsAccum >= 0.5) {
      this.fps = this.fpsFrames / this.fpsAccum;
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      if (this.running) this.govern();
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
