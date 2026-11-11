import { RECIPES, renderRecipe, type RenderedBuffer } from './recipes';

// Render worker: synthesises the sound bank off the main thread, so unlocking audio never stalls a frame.
// It has no WebAudio; it only fills sample arrays and hands them back.

/** Messages to the worker. `first` moves keys to the front of its queue. */
export type RenderRequest = { type: 'start'; keys: string[]; sampleRate: number } | { type: 'first'; keys: string[] };

/** Messages from the worker. */
export type RenderReply = { type: 'buffers'; key: string; variants: RenderedBuffer[] } | { type: 'error'; key: string; message: string } | { type: 'done' };

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<RenderRequest>) => void) | null;
  postMessage(message: RenderReply, transfer: Transferable[]): void;
};

let queue: string[] = [];
let sampleRate = 48000;
let running = false;

async function run(): Promise<void> {
  running = true;
  while (queue.length > 0) {
    const key = queue.shift()!;
    const recipe = RECIPES[key];
    try {
      if (!recipe) throw new Error('no recipe');
      const variants = renderRecipe(key, recipe, sampleRate);
      scope.postMessage(
        { type: 'buffers', key, variants },
        variants.flatMap((v) => v.channels.map((ch) => ch.buffer)),
      );
    } catch (err) {
      scope.postMessage({ type: 'error', key, message: String(err) }, []);
    }
    // Yield between jobs so a `first` request can reorder what is left.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  running = false;
  scope.postMessage({ type: 'done' }, []);
}

scope.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === 'start') {
    sampleRate = msg.sampleRate;
    queue = [...msg.keys];
    if (!running) void run();
  } else {
    queue = [...msg.keys.filter((k) => queue.includes(k)), ...queue.filter((k) => !msg.keys.includes(k))];
  }
};
