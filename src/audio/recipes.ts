import { Dsp, isStereo, type Mono } from './dsp';
import { BEDS } from './loops';
import { KIT } from './music';
import { SOUNDS, type Recipe } from './sounds';

/**
 * Everything that is rendered into a buffer, in render order: the drum kit and reverb impulse first so
 * menu music can start, then the one-shots, then the loop beds.
 */
export const RECIPES: Record<string, Recipe> = { ...KIT, ...SOUNDS, ...BEDS };

/** One rendered variant: plain samples, ready to become an AudioBuffer (and cheap to pass between threads). */
export interface RenderedBuffer {
  sr: number;
  channels: Mono[];
}

/** Stable seed per buffer, so a sound is the same on every run and on either thread (FNV-1a). */
function seedOf(key: string, variant: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return Math.imul(h ^ (variant + 1), 16777619) >>> 0 || 1;
}

/** Runs a recipe: every variant, cleaned of bad samples, and with one-shots brought to zero at the end. */
export function renderRecipe(key: string, recipe: Recipe, contextRate: number): RenderedBuffer[] {
  const sr = recipe.sr ?? contextRate;
  const out: RenderedBuffer[] = [];
  for (let v = 0; v < (recipe.variants ?? 1); v++) {
    const rendered = recipe.render(new Dsp(sr, seedOf(key, v)), v);
    const channels = isStereo(rendered) ? [rendered[0], rendered[1]] : [rendered];
    for (const ch of channels) {
      const n = ch.length;
      // A recipe that went wrong must not put NaN on the bus: silence it instead.
      for (let i = 0; i < n; i++) if (!Number.isFinite(ch[i]!)) ch[i] = 0;
      // One-shots end at zero whatever the recipe left there. Loops must keep their ends as rendered.
      const fade = recipe.loop ? 0 : Math.min(n, Math.round(sr * 0.004));
      for (let i = 0; i < fade; i++) ch[n - 1 - i] = ch[n - 1 - i]! * (i / fade);
    }
    out.push({ sr, channels });
  }
  return out;
}
