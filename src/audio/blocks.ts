import type { Dsp, FilterType, Mono, Param } from './dsp';

// Building blocks shared by the one-shot, loop and drum recipes.

/** Filtered noise burst with a fast attack and exponential decay, peak 1. */
export function burst(d: Dsp, type: FilterType, freq: Param, q: number, tau: number, attack = 0.0004): Mono {
  return d.norm(d.decay(d.filter(d.white(tau * 7 + attack), type, freq, q), tau, attack), 1);
}

/** Pitched thump: a sine that drops from `f0` to `f1`. */
export function thump(d: Dsp, f0: number, f1: number, glide: number, tau: number, attack = 0.001): Mono {
  return d.decay(d.sweep(tau * 7 + attack, f0, f1, glide), tau, attack);
}

/** Struck-metal click: a few inharmonic partials and a noise tick. */
export function click(d: Dsp, freq: number, tau: number, tick = 0.5): Mono {
  const x = d.modes(
    tau * 7 + 0.01,
    [
      [freq, tau, 1],
      [freq * 1.59, tau * 0.7, 0.6],
      [freq * 2.71, tau * 0.5, 0.4],
      [freq * 4.13, tau * 0.35, 0.25],
    ],
    true,
  );
  return d.mix(x, burst(d, 'hp', 3000, 0.7, 0.0012), tick);
}

/** Mallet chime: strong fundamental, a few quick upper partials. Starts at zero, so it never clicks. */
export function chime(d: Dsp, freq: number, tau: number, bright = 1): Mono {
  return d.modes(tau * 7, [
    [freq, tau, 1],
    [freq * 2, tau * 0.6, 0.35 * bright],
    [freq * 3.01, tau * 0.4, 0.2 * bright],
    [freq * 4.1, tau * 0.25, 0.14 * bright],
    [freq * 6.3, tau * 0.12, 0.08 * bright],
  ]);
}

/** Bubble or droplet: a sine that rises as it dies. */
export function bubble(d: Dsp, freq: number, rise: number, tau: number): Mono {
  return d.decay(
    d.osc(tau * 6 + 0.005, 'sine', (t) => freq * (1 + rise * t)),
    tau,
    0.002,
  );
}

/** Random loudness flutter for crunchy, grainy textures. `rate` is how fast it moves, in Hz. */
export function crackle(d: Dsp, x: Mono, rate: number, depth = 1): Mono {
  const m = d.norm(d.lp(d.white(x.length / d.sr), rate), 1);
  for (let i = 0; i < x.length; i++) x[i] = x[i]! * (1 - depth + depth * Math.min(1, Math.abs(m[i]!) * 2.5));
  return x;
}

/** A scatter of tiny high pings, dense at first and thinning out: glass, coins, debris. Peak 1. */
export function shards(d: Dsp, dur: number, count: number, lo: number, hi: number, spread: number): Mono {
  const out = d.zeros(dur);
  for (let i = 0; i < count; i++) {
    const at = -Math.log(1 - d.rng.next() * 0.98) * spread;
    const f = lo * Math.pow(hi / lo, d.rng.next());
    const tau = d.rand(0.004, 0.03);
    const ping = d.modes(
      tau * 7,
      [
        [f, tau, 1],
        [f * 1.51, tau * 0.7, 0.5],
        [f * 2.3, tau * 0.5, 0.3],
      ],
      true,
    );
    d.mix(out, ping, d.rand(0.2, 1) * Math.exp(-at / (spread * 2)), at);
  }
  return d.norm(out, 1);
}

/** Half-sine window over `len` seconds, raised to `power`. */
export function hump(len: number, power = 1): (t: number) => number {
  return (t) => (t >= len ? 0 : Math.sin((Math.PI * t) / len) ** power);
}

/**
 * Slow random drift in about -1..1 that repeats exactly every `period` seconds,
 * so a loop modulated by it still closes seamlessly.
 */
export function wander(d: Dsp, period: number, harmonics: number): (t: number) => number {
  const phase: number[] = [];
  const amp: number[] = [];
  let norm = 0;
  for (let k = 1; k <= harmonics; k++) {
    phase.push(d.rng.next() * Math.PI * 2);
    amp.push(1 / Math.sqrt(k));
    norm += 1 / k;
  }
  norm = Math.sqrt(norm / 2) * 1.6;
  return (t) => {
    let v = 0;
    for (let k = 0; k < harmonics; k++) v += amp[k]! * Math.sin((Math.PI * 2 * (k + 1) * t) / period + phase[k]!);
    return Math.max(-1, Math.min(1, v / norm));
  };
}

/** Like `Dsp.mix`, but anything past the end wraps to the start: for layering events into a loop. */
export function mixWrap(dst: Mono, src: Mono, gain: number, at: number, sr: number): Mono {
  const n = dst.length;
  const off = Math.round(at * sr);
  for (let i = 0; i < src.length; i++) {
    const j = (((off + i) % n) + n) % n;
    dst[j] = dst[j]! + src[i]! * gain;
  }
  return dst;
}
