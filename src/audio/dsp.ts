import { Rng } from '../core/rng';

/** One channel of samples. */
export type Mono = Float32Array<ArrayBuffer>;
/** Left and right channels of equal length. */
export type Stereo = [Mono, Mono];
export type Rendered = Mono | Stereo;
/** A constant, or a function of time in seconds (read at control rate). */
export type Param = number | ((t: number) => number);
export type FilterType = 'lp' | 'hp' | 'bp' | 'peak' | 'notch' | 'ls' | 'hs';
export type Wave = 'sine' | 'tri' | 'saw' | 'square';
/** A decaying sine partial: frequency in Hz, decay time constant in seconds, amplitude. */
export type Mode = readonly [freq: number, tau: number, amp: number];

const TAU = Math.PI * 2;
/** Samples between control-rate updates of a time-varying parameter. */
const CTRL = 16;

export function isStereo(r: Rendered): r is Stereo {
  return Array.isArray(r);
}

export function peakOf(r: Rendered): number {
  let peak = 0;
  for (const ch of isStereo(r) ? r : [r]) {
    for (let i = 0; i < ch.length; i++) {
      const a = Math.abs(ch[i]!);
      if (a > peak) peak = a;
    }
  }
  return peak;
}

function blep(p: number, dt: number): number {
  if (p < dt) {
    const t = p / dt;
    return t + t - t * t - 1;
  }
  if (p > 1 - dt) {
    const t = (p - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
}

/**
 * Offline synthesis toolkit: plain sample loops over Float32Arrays, no WebAudio.
 * Every sound in the game is built from these and then wrapped in an AudioBuffer.
 * Shaping methods work in place and return their input so calls can be nested.
 */
export class Dsp {
  readonly rng: Rng;

  constructor(
    readonly sr: number,
    seed: number,
  ) {
    this.rng = new Rng(seed);
  }

  len(seconds: number): number {
    return Math.max(1, Math.round(seconds * this.sr));
  }

  zeros(seconds: number): Mono {
    return new Float32Array(this.len(seconds));
  }

  stereo(seconds: number): Stereo {
    return [this.zeros(seconds), this.zeros(seconds)];
  }

  rand(a = -1, b = 1): number {
    return this.rng.range(a, b);
  }

  // ---- sources ----

  white(seconds: number): Mono {
    const x = this.zeros(seconds);
    const rng = this.rng;
    for (let i = 0; i < x.length; i++) x[i] = rng.next() * 2 - 1;
    return x;
  }

  /** Pink noise (Paul Kellet's filter), about -3 dB per octave. */
  pink(seconds: number): Mono {
    const x = this.zeros(seconds);
    const rng = this.rng;
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < x.length; i++) {
      const w = rng.next() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.16;
      b6 = w * 0.115926;
    }
    return x;
  }

  /** Brown noise, about -6 dB per octave. */
  brown(seconds: number): Mono {
    const x = this.zeros(seconds);
    const rng = this.rng;
    let last = 0;
    for (let i = 0; i < x.length; i++) {
      last = (last + 0.02 * (rng.next() * 2 - 1)) / 1.02;
      x[i] = last * 3.5;
    }
    return x;
  }

  /** Band-limited oscillator. A function `freq` is read at control rate. */
  osc(seconds: number, wave: Wave, freq: Param, phase = 0): Mono {
    const x = this.zeros(seconds);
    const sr = this.sr;
    const fn = typeof freq === 'function' ? freq : null;
    let f = fn ? fn(0) : (freq as number);
    let p = phase - Math.floor(phase);
    for (let i = 0; i < x.length; i++) {
      if (fn && i % CTRL === 0) f = fn(i / sr);
      const dt = f / sr;
      let v: number;
      if (wave === 'sine') v = Math.sin(TAU * p);
      else if (wave === 'tri') {
        const q = p + 0.25 - Math.floor(p + 0.25);
        v = 1 - 4 * Math.abs(q - 0.5);
      } else if (wave === 'saw') v = 2 * p - 1 - blep(p, dt);
      else {
        const h = p + 0.5 - Math.floor(p + 0.5);
        v = (p < 0.5 ? 1 : -1) + blep(p, dt) - blep(h, dt);
      }
      x[i] = v;
      p += dt;
      if (p >= 1) p -= 1;
    }
    return x;
  }

  /** Sine whose pitch glides exponentially from `f0` to `f1` with time constant `tau`, exact per sample. */
  sweep(seconds: number, f0: number, f1: number, tau: number): Mono {
    const x = this.zeros(seconds);
    const sr = this.sr;
    for (let i = 0; i < x.length; i++) {
      const t = i / sr;
      x[i] = Math.sin(TAU * (f1 * t + (f0 - f1) * tau * (1 - Math.exp(-t / tau))));
    }
    return x;
  }

  /** Sum of exponentially decaying sine partials: the ring of a struck object. */
  modes(seconds: number, partials: readonly Mode[], randomPhase = false): Mono {
    const x = this.zeros(seconds);
    const sr = this.sr;
    for (const [freq, tau, amp] of partials) {
      if (freq >= sr * 0.47 || freq <= 0) continue;
      const w = (TAU * freq) / sr;
      const ph = randomPhase ? this.rng.next() * TAU : 0;
      const k = Math.exp(-1 / (tau * sr));
      const n = Math.min(x.length, Math.ceil(tau * 8 * sr));
      let e = amp;
      for (let i = 0; i < n; i++) {
        x[i] = x[i]! + Math.sin(w * i + ph) * e;
        e *= k;
      }
    }
    return x;
  }

  /** Sparse random impulses of random sign and size. `rate` is impulses per second. */
  dust(seconds: number, rate: Param): Mono {
    const x = this.zeros(seconds);
    const sr = this.sr;
    const rng = this.rng;
    const fn = typeof rate === 'function' ? rate : null;
    let r = fn ? fn(0) : (rate as number);
    for (let i = 0; i < x.length; i++) {
      if (fn && i % CTRL === 0) r = fn(i / sr);
      if (rng.next() * sr < r) x[i] = rng.next() * 2 - 1;
    }
    return x;
  }

  // ---- shaping (in place) ----

  env(x: Mono, fn: (t: number) => number): Mono {
    const sr = this.sr;
    for (let i = 0; i < x.length; i++) x[i] = x[i]! * fn(i / sr);
    return x;
  }

  /** Like `env`, but reads `fn` every 64 samples and interpolates: for slow swells over long buffers. */
  envSlow(x: Mono, fn: (t: number) => number): Mono {
    const sr = this.sr;
    const step = 64;
    let a = fn(0);
    for (let i = 0; i < x.length; i += step) {
      const b = fn((i + step) / sr);
      const n = Math.min(step, x.length - i);
      for (let j = 0; j < n; j++) x[i + j] = x[i + j]! * (a + ((b - a) * j) / step);
      a = b;
    }
    return x;
  }

  /** Linear attack, then exponential decay with time constant `tau`. */
  decay(x: Mono, tau: number, attack = 0.0004): Mono {
    const a = Math.max(1, attack * this.sr);
    const k = Math.exp(-1 / (tau * this.sr));
    let e = 1;
    for (let i = 0; i < x.length; i++) {
      x[i] = x[i]! * (i < a ? i / a : 1) * e;
      if (i >= a) e *= k;
    }
    return x;
  }

  /** Raised-cosine edges, so a layer starts and ends at zero. */
  fade(x: Mono, fadeIn: number, fadeOut: number): Mono {
    const n = x.length;
    const a = Math.min(n, Math.round(fadeIn * this.sr));
    const b = Math.min(n, Math.round(fadeOut * this.sr));
    for (let i = 0; i < a; i++) x[i] = x[i]! * (0.5 - 0.5 * Math.cos((Math.PI * i) / a));
    for (let i = 0; i < b; i++) x[n - 1 - i] = x[n - 1 - i]! * (0.5 - 0.5 * Math.cos((Math.PI * i) / b));
    return x;
  }

  gain(x: Mono, g: number): Mono {
    for (let i = 0; i < x.length; i++) x[i] = x[i]! * g;
    return x;
  }

  /** Soft saturation. Higher `amount` squashes harder; output stays within -1..1. */
  drive(x: Mono, amount: number): Mono {
    const norm = 1 / Math.tanh(amount);
    for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i]! * amount) * norm;
    return x;
  }

  /** Biquad filter (RBJ cookbook). `freq` and `q` may vary over time. */
  filter(x: Mono, type: FilterType, freq: Param, q: Param = Math.SQRT1_2, gainDb = 0): Mono {
    const sr = this.sr;
    const fFn = typeof freq === 'function' ? freq : null;
    const qFn = typeof q === 'function' ? q : null;
    const varying = fFn !== null || qFn !== null;
    const A = Math.pow(10, gainDb / 40);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let a1 = 0;
    let a2 = 0;
    const set = (t: number): void => {
      const f = Math.min(sr * 0.45, Math.max(10, fFn ? fFn(t) : (freq as number)));
      const qq = Math.max(0.05, qFn ? qFn(t) : (q as number));
      const w = (TAU * f) / sr;
      const cs = Math.cos(w);
      const alpha = Math.sin(w) / (2 * qq);
      let a0 = 1 + alpha;
      a1 = -2 * cs;
      a2 = 1 - alpha;
      if (type === 'lp') {
        b0 = (1 - cs) / 2;
        b1 = 1 - cs;
        b2 = b0;
      } else if (type === 'hp') {
        b0 = (1 + cs) / 2;
        b1 = -(1 + cs);
        b2 = b0;
      } else if (type === 'bp') {
        b0 = alpha;
        b1 = 0;
        b2 = -alpha;
      } else if (type === 'notch') {
        b0 = 1;
        b1 = -2 * cs;
        b2 = 1;
      } else if (type === 'peak') {
        b0 = 1 + alpha * A;
        b1 = -2 * cs;
        b2 = 1 - alpha * A;
        a0 = 1 + alpha / A;
        a2 = 1 - alpha / A;
      } else {
        const sq = 2 * Math.sqrt(A) * alpha;
        const s = type === 'ls' ? 1 : -1;
        b0 = A * (A + 1 - s * (A - 1) * cs + sq);
        b1 = s * 2 * A * (A - 1 - s * (A + 1) * cs);
        b2 = A * (A + 1 - s * (A - 1) * cs - sq);
        a0 = A + 1 + s * (A - 1) * cs + sq;
        a1 = -s * 2 * (A - 1 + s * (A + 1) * cs);
        a2 = A + 1 + s * (A - 1) * cs - sq;
      }
      b0 /= a0;
      b1 /= a0;
      b2 /= a0;
      a1 /= a0;
      a2 /= a0;
    };
    set(0);
    let z1 = 0;
    let z2 = 0;
    for (let i = 0; i < x.length; i++) {
      if (varying && i % CTRL === 0) set(i / sr);
      const v = x[i]!;
      const y = b0 * v + z1;
      z1 = b1 * v - a1 * y + z2;
      z2 = b2 * v - a2 * y;
      x[i] = y;
    }
    return x;
  }

  lp(x: Mono, freq: Param, q: Param = Math.SQRT1_2): Mono {
    return this.filter(x, 'lp', freq, q);
  }

  hp(x: Mono, freq: Param, q: Param = Math.SQRT1_2): Mono {
    return this.filter(x, 'hp', freq, q);
  }

  bp(x: Mono, freq: Param, q: Param = 1): Mono {
    return this.filter(x, 'bp', freq, q);
  }

  // ---- combining ----

  /** Adds `src` into `dst` starting `at` seconds in. Anything past the end of `dst` is dropped. */
  mix(dst: Mono, src: Mono, gain = 1, at = 0): Mono {
    const off = Math.round(at * this.sr);
    const n = Math.min(src.length, dst.length - off);
    for (let i = Math.max(0, -off); i < n; i++) dst[off + i] = dst[off + i]! + src[i]! * gain;
    return dst;
  }

  /** Adds a mono or stereo layer into a stereo mix. `pan` runs -1 (left) to 1 (right); centre is unity on both sides. */
  mixS(dst: Stereo, src: Rendered, gain = 1, at = 0, pan = 0): Stereo {
    const a = ((Math.min(1, Math.max(-1, pan)) + 1) * Math.PI) / 4;
    const gl = Math.cos(a) * Math.SQRT2 * gain;
    const gr = Math.sin(a) * Math.SQRT2 * gain;
    if (isStereo(src)) {
      this.mix(dst[0], src[0], gl, at);
      this.mix(dst[1], src[1], gr, at);
    } else {
      this.mix(dst[0], src, gl, at);
      this.mix(dst[1], src, gr, at);
    }
    return dst;
  }

  /**
   * Small Schroeder reverb (six damped combs and three all-passes per side, detuned between the sides).
   * Returns a new stereo buffer: the dry input at unity plus `mix` of the wet signal, longer by the tail.
   */
  verb(x: Rendered, o: { time: number; mix?: number; damp?: number; pre?: number; tail?: number }): Stereo {
    const sr = this.sr;
    const dry: Stereo = isStereo(x) ? x : [x, x];
    const pre = Math.round((o.pre ?? 0) * sr);
    const n = dry[0].length + pre + this.len(o.tail ?? o.time * 1.2);
    const damp = o.damp ?? 0.35;
    const wetGain = (o.mix ?? 0.25) * 0.3;
    const combs = [0.0253, 0.0269, 0.029, 0.0307, 0.0338, 0.0367];
    const allpasses = [0.0126, 0.0077, 0.0051];
    const out: Stereo = [new Float32Array(n), new Float32Array(n)];
    for (let ch = 0; ch < 2; ch++) {
      const src = dry[ch]!;
      const wet = new Float32Array(n);
      const spread = ch === 0 ? 1 : 1.037;
      for (const c of combs) {
        const d = Math.max(1, Math.round(c * spread * sr));
        const fb = Math.pow(10, (-3 * d) / sr / o.time);
        const buf = new Float32Array(d);
        let idx = 0;
        let lp = 0;
        for (let i = 0; i < n; i++) {
          const y = buf[idx]!;
          lp = y + (lp - y) * damp;
          const j = i - pre;
          buf[idx] = (j >= 0 && j < src.length ? src[j]! : 0) + lp * fb;
          wet[i] = wet[i]! + y;
          idx = idx + 1 === d ? 0 : idx + 1;
        }
      }
      for (const ap of allpasses) {
        const d = Math.max(1, Math.round(ap * spread * sr));
        const buf = new Float32Array(d);
        let idx = 0;
        for (let i = 0; i < n; i++) {
          const delayed = buf[idx]!;
          const v = wet[i]! + delayed * 0.5;
          buf[idx] = v;
          wet[i] = delayed - v * 0.5;
          idx = idx + 1 === d ? 0 : idx + 1;
        }
      }
      const o2 = out[ch]!;
      for (let i = 0; i < n; i++) o2[i] = (i < src.length ? src[i]! : 0) + wet[i]! * wetGain;
    }
    return out;
  }

  /** Scales a sound in place so its peak is `peak`. */
  norm<T extends Rendered>(r: T, peak = 0.9): T {
    const p = peakOf(r);
    if (p > 1e-6) {
      const g = peak / p;
      for (const ch of isStereo(r) ? r : [r as Mono]) this.gain(ch, g);
    }
    return r;
  }

  /** Folds the last `xfade` seconds onto the start with an equal-power crossfade, giving a seamless, shorter loop. */
  loopify(x: Mono, xfade: number): Mono {
    const nx = Math.min(this.len(xfade), x.length >> 1);
    const n = x.length - nx;
    const out = x.slice(0, n);
    for (let i = 0; i < nx; i++) {
      const t = (i / nx) * Math.PI * 0.5;
      out[i] = x[i]! * Math.sin(t) + x[n + i]! * Math.cos(t);
    }
    return out;
  }
}
