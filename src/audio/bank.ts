import type { BufferSource } from './loops';
import { renderRecipe, type RenderedBuffer } from './recipes';
import type { Recipe } from './sounds';
import type { RenderReply, RenderRequest } from './worker';

/** Longest silence from the render worker before the main thread takes over. Module load included. */
const WORKER_TIMEOUT_MS = 8000;

/**
 * Renders recipes into AudioBuffers and keeps them.
 *
 * `renderAll` hands the whole table to a worker, so synthesising two and a half minutes of audio costs the
 * page no frames. If the worker cannot run at all, the main thread works through the table instead, yielding
 * to the page between sounds. `get` renders a missing buffer on the spot, so callers that must not stall
 * check `has` first and `prioritise` what they are waiting for.
 */
export class BufferBank implements BufferSource {
  private readonly cache = new Map<string, AudioBuffer[]>();
  /** Keys not rendered yet, in the order they will be. */
  private queue: string[];
  private running: Promise<void> | null = null;
  private worker: Worker | null = null;
  /** Ends a worker render that is under way, quietly. */
  private cancel: (() => void) | null = null;
  private readonly total: number;

  constructor(
    private readonly ctx: BaseAudioContext,
    private readonly recipes: Record<string, Recipe>,
    /** Called whenever a buffer set arrives in the background. */
    private readonly onRendered?: () => void,
  ) {
    this.queue = Object.keys(recipes);
    this.total = this.queue.length;
  }

  /** Everything is rendered. */
  get done(): boolean {
    return this.cache.size >= this.total;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  /** All variants of a sound, rendering them now if they are not ready yet. */
  get(key: string): AudioBuffer[] {
    let buffers = this.cache.get(key);
    if (!buffers) {
      buffers = this.renderNow(key);
      this.store(key, buffers);
    }
    return buffers;
  }

  /** Asks for these to be rendered next. */
  prioritise(keys: readonly string[]): void {
    const wanted = keys.filter((k) => !this.cache.has(k));
    if (wanted.length === 0) return;
    this.queue = [...wanted, ...this.queue.filter((k) => !wanted.includes(k))];
    const request: RenderRequest = { type: 'first', keys: wanted };
    this.worker?.postMessage(request, []);
  }

  /** Renders everything that is left, in the background. Safe to call again; resolves when the bank is complete. */
  renderAll(): Promise<void> {
    this.running ??= this.inWorker().catch((err: unknown) => {
      console.warn('[audio] render worker unavailable, rendering on the main thread:', err);
      return this.onMainThread();
    });
    return this.running;
  }

  dispose(): void {
    this.queue = [];
    // Without this the watchdog would report a dead worker a few seconds after the engine was closed.
    this.cancel?.();
    this.worker?.terminate();
    this.worker = null;
  }

  private store(key: string, buffers: AudioBuffer[]): void {
    this.cache.set(key, buffers);
    this.queue = this.queue.filter((k) => k !== key);
  }

  private inWorker(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Worker === 'undefined') {
        reject(new Error('no Worker'));
        return;
      }
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      this.worker = worker;
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      const stop = (): void => {
        clearTimeout(watchdog);
        worker.terminate();
        this.worker = null;
        this.cancel = null;
      };
      this.cancel = () => {
        stop();
        resolve();
      };
      const fail = (err: unknown): void => {
        stop();
        reject(err);
      };
      // A worker that never answers (blocked by policy, or failed to load quietly) must not leave the bank waiting.
      watchdog = setTimeout(() => fail(new Error('timed out')), WORKER_TIMEOUT_MS);
      worker.onerror = (e) => fail(new Error(e.message || 'failed to start'));
      worker.onmessage = (e: MessageEvent<RenderReply>) => {
        const msg = e.data;
        clearTimeout(watchdog);
        if (msg.type === 'done') {
          stop();
          // Anything the worker could not render is tried once more here.
          this.onMainThread().then(resolve, reject);
          return;
        }
        watchdog = setTimeout(() => fail(new Error('timed out')), WORKER_TIMEOUT_MS);
        if (msg.type === 'error') {
          console.warn(`[audio] worker could not render "${msg.key}": ${msg.message}`);
          return;
        }
        if (!this.cache.has(msg.key)) this.store(msg.key, msg.variants.map((v) => this.toBuffer(v)));
        this.onRendered?.();
      };
      const request: RenderRequest = { type: 'start', keys: [...this.queue], sampleRate: this.ctx.sampleRate };
      worker.postMessage(request, []);
    });
  }

  /** Works through the queue on this thread, yielding to the page every few milliseconds. */
  private async onMainThread(sliceMs = 5): Promise<void> {
    let slice = performance.now();
    while (this.queue.length > 0) {
      const key = this.queue[0]!;
      this.get(key);
      if (this.queue[0] === key) this.queue.shift();
      this.onRendered?.();
      if (performance.now() - slice > sliceMs) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        slice = performance.now();
      }
    }
  }

  private renderNow(key: string): AudioBuffer[] {
    const recipe = this.recipes[key];
    try {
      if (!recipe) throw new Error('no recipe');
      return renderRecipe(key, recipe, this.ctx.sampleRate).map((v) => this.toBuffer(v));
    } catch (err) {
      // One broken sound must not take the rest down: it becomes a moment of silence.
      console.warn(`[audio] could not render "${key}":`, err);
      return [this.ctx.createBuffer(1, 1, this.ctx.sampleRate)];
    }
  }

  private toBuffer(v: RenderedBuffer): AudioBuffer {
    const buffer = this.ctx.createBuffer(v.channels.length, v.channels[0]!.length, v.sr);
    v.channels.forEach((ch, c) => buffer.copyToChannel(ch, c));
    return buffer;
  }
}
