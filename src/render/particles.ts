import type { GameSystem } from '../core/system';

/** The kinds of short-lived effect the game can show. */
export type FxKind = 'dust' | 'smoke' | 'spark' | 'spray' | 'splash' | 'wake' | 'skid' | 'muzzle' | 'impact' | 'glass' | 'blood' | 'explosion' | 'shell';

export interface FxOptions {
  /** Direction the effect travels or faces, world space. Need not be normalised. */
  dx?: number;
  dy?: number;
  dz?: number;
  /** Strength, 1 is a normal amount. */
  amount?: number;
  /** Tint, as a hex colour. */
  color?: number;
}

/**
 * Sparks, smoke, spray and the rest. Systems ask for an effect at a point and do not keep any state
 * for it. Filled in with the weapons (T-06); until then asking is harmless.
 */
export class Effects implements GameSystem {
  /** Number of effects asked for, by kind. Tests read it. */
  readonly counts: Partial<Record<FxKind, number>> = {};

  burst(kind: FxKind, _x: number, _y: number, _z: number, _options?: FxOptions): void {
    this.counts[kind] = (this.counts[kind] ?? 0) + 1;
  }

  frameUpdate(_dt: number): void {}
}
