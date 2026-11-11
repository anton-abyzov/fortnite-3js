import { crackle, hump, mixWrap, wander } from './blocks';
import type { Dsp, Mono, Rendered, Stereo } from './dsp';
import type { Recipe } from './sounds';

/** Every continuous sound the game can run. */
export type LoopName = 'wind' | 'ocean' | 'city' | 'storm' | 'car_engine' | 'boat_engine' | 'plane_engine' | 'skid' | 'rain';

/** Where loop graphs get their pre-rendered buffers. */
export interface BufferSource {
  /** Already rendered: `get` will not have to synthesise it on the spot. */
  has(key: string): boolean;
  get(key: string): AudioBuffer[];
}

/** The live part of a loop: sources and filters feeding one output node. The engine adds gain, panning and the bus. */
export interface LoopVoice {
  readonly out: AudioNode;
  /** Engine revs, or speed for wind. 1 is the nominal value; engines take 0.5..2.5. */
  setPitch(pitch: number, when: number): void;
  /** Per-frame hook for loops that scatter their own details (gulls over the city). */
  tick?(now: number, audible: boolean): void;
  stop(when: number): void;
}

export interface LoopDef {
  /** Buffers the graph needs before it can be built. */
  beds: readonly string[];
  /** Level at `gain: 1`. */
  gain: number;
  /** Positional range in metres when the loop is given a position. */
  range: readonly [near: number, far: number];
  build(ctx: BaseAudioContext, bank: BufferSource): LoopVoice;
}

const TAU = Math.PI * 2;

// Local copies: importing core/math would drag three.js into the render worker.
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// ---------------------------------------------------------------------------------------------------------------------
// Beds: seamless pre-rendered loops
// ---------------------------------------------------------------------------------------------------------------------

function both(make: (side: number) => Mono): Stereo {
  return [make(0), make(1)];
}

/** Free-fall air: pink noise with slow gusts baked in. The live filters do the rest. */
function bedWind(d: Dsp): Rendered {
  const len = 6;
  const fold = 0.6;
  return d.norm(
    both(() => {
      const gust = wander(d, len, 5);
      return d.loopify(
        d.envSlow(d.pink(len + fold), (t) => 0.8 + 0.35 * gust(t)),
        fold,
      );
    }),
    0.8,
  );
}

/** Surf: a steady distant wash with three waves that build, break and hiss back down the sand. */
function bedOcean(d: Dsp): Rendered {
  const len = 14;
  const fold = 1;
  const rise = 2.4;
  const waves: readonly (readonly [number, number])[] = [
    [1.5, 1],
    [6.3, 0.7],
    [10.4, 0.9],
  ];
  return d.norm(
    both((side) => {
      const swell = wander(d, len, 3);
      const bed = d.lp(d.brown(len + fold), 500);
      d.mix(bed, d.bp(d.pink(len + fold), 700, 0.5), 0.5);
      d.envSlow(bed, (t) => 0.75 + 0.25 * swell(t));
      const out = d.gain(d.loopify(bed, fold), 0.55);
      for (const [at, size] of waves) {
        const wave = d.white(rise + 5.5);
        d.lp(wave, (t) => (t < rise ? 250 + 1300 * (t / rise) ** 2 : 700 + 3600 * Math.exp(-(t - rise) / 0.7)));
        d.envSlow(wave, (t) => (t < rise ? 0.45 * (t / rise) ** 2.2 : (0.45 + 0.55 * Math.min(1, (t - rise) / 0.06)) * Math.exp(-(t - rise) / 1.1)));
        const foam = crackle(d, d.hp(d.white(rise + 5.5), 3000), 45, 0.6);
        d.envSlow(foam, (t) => (t < rise ? 0 : (1 - Math.exp(-(t - rise) / 0.25)) * Math.exp(-(t - rise) / 1.7)));
        d.mix(wave, foam, 0.28);
        mixWrap(out, wave, size, at - rise + side * 0.27 + d.rand(0, 0.1), d.sr);
      }
      return out;
    }),
    0.85,
  );
}

/** A city heard from inside it: low traffic rumble, a few distant passes and a trace of mains hum. */
function bedCity(d: Dsp): Rendered {
  const len = 12;
  const fold = 1;
  return d.norm(
    both(() => {
      const ebb = wander(d, len, 4);
      const flow = wander(d, len, 6);
      const rumble = d.envSlow(d.lp(d.brown(len + fold), 170), (t) => 0.7 + 0.3 * ebb(t));
      const traffic = d.envSlow(d.bp(d.pink(len + fold), 430, 0.6), (t) => 0.55 + 0.45 * flow(t));
      d.mix(rumble, traffic, 0.9);
      const out = d.loopify(rumble, fold);
      for (let i = 0; i < 3; i++) {
        const pass = d.bp(d.pink(3.4), (t) => 560 - 60 * t, 1.1);
        mixWrap(out, d.envSlow(pass, hump(3.4, 3)), d.rand(0.5, 0.9), d.rand(0, len), d.sr);
      }
      // Both hum partials complete whole cycles in the loop.
      d.mix(out, d.osc(len, 'sine', 100), 0.012);
      d.mix(out, d.osc(len, 'sine', 200), 0.006);
      return out;
    }),
    0.7,
  );
}

/** The eyewall: wind howling through two wandering resonances over a heavy rumble. */
function bedStorm(d: Dsp): Rendered {
  const len = 10;
  const fold = 1;
  return d.norm(
    both(() => {
      const a = wander(d, len, 5);
      const b = wander(d, len, 7);
      const g = wander(d, len, 4);
      const out = d.bp(d.pink(len + fold), (t) => 430 + 210 * a(t), 3);
      d.mix(out, d.bp(d.pink(len + fold), (t) => 820 + 300 * b(t), 4), 0.45);
      d.envSlow(out, (t) => 0.7 + 0.3 * a(t + 1.3));
      d.mix(out, d.envSlow(d.lp(d.brown(len + fold), 140), (t) => 0.7 + 0.3 * g(t)), 0.5);
      d.mix(out, d.envSlow(d.hp(d.pink(len + fold), 1500), (t) => Math.max(0, g(t + 2)) ** 2), 0.5);
      return d.loopify(out, fold);
    }),
    0.85,
  );
}

/** Rain: a fine hiss, close drops and a lower patter on hard ground. */
function bedRain(d: Dsp): Rendered {
  const len = 6;
  const fold = 0.5;
  return d.norm(
    both(() => {
      const out = crackle(d, d.lp(d.hp(d.white(len + fold), 2500), 9000), 30, 0.3);
      d.gain(out, 0.2);
      d.mix(out, d.lp(d.hp(d.pink(len + fold), 250), 1400), 0.4);
      d.mix(out, d.bp(d.dust(len + fold, 420), 3800, 1.2), 0.8);
      d.mix(out, d.bp(d.dust(len + fold, 260), 1100, 1.5), 1.6);
      d.mix(out, d.bp(d.dust(len + fold, 120), 420, 2), 2.2);
      return d.loopify(out, fold);
    }),
    0.8,
  );
}

/** Plain white noise, shared by the engines for intake and wash. */
function bedNoise(d: Dsp): Rendered {
  return d.norm(d.loopify(d.white(2.2), 0.2), 0.8);
}

/** Tyres letting go: two narrow, wavering bands of noise over the scrub of rubber on tarmac. */
function bedSkid(d: Dsp): Rendered {
  const len = 2.4;
  const fold = 0.3;
  const a = wander(d, len, 7);
  const b = wander(d, len, 5);
  const out = d.norm(
    d.bp(d.white(len + fold), (t) => 1060 * (1 + 0.07 * a(t)), 28),
    1,
  );
  d.mix(
    out,
    d.norm(
      d.bp(d.white(len + fold), (t) => 1640 * (1 + 0.06 * b(t)), 24),
      1,
    ),
    0.5,
  );
  crackle(d, out, 160, 0.4);
  d.mix(out, crackle(d, d.bp(d.white(len + fold), 2500, 0.7), 80, 0.6), 0.35);
  return d.norm(d.loopify(out, fold), 0.8);
}

interface EngineSpec {
  /** Engine cycles per second at pitch 1. Each cycle fires every cylinder once. */
  cycleHz: number;
  /** When each cylinder fires within the cycle (0..1) and how hard. Uneven values give the lumpy idle. */
  fires: readonly (readonly [at: number, amp: number])[];
  /** Whole cycles in the loop. */
  cycles: number;
  /** Exhaust resonance as a multiple of the firing rate, and its decay in firing periods. */
  ring: number;
  ringTau: number;
  /** A second, higher and shorter resonance for the rasp: multiple of the firing rate, and level. */
  rasp: number;
  raspLevel: number;
  /** Saturation of the finished bed. Adds upper harmonics, like an exhaust being pushed. */
  drive: number;
  /** Sharp pressure pulse under each ring, where the upper harmonics come from: level, and decay in firing periods. */
  pulse: number;
  pulseTau: number;
  /** Random variation from firing to firing. */
  rough: number;
  /** Combustion noise riding on each firing. */
  noise: number;
}

/**
 * An engine as a train of firing pulses rather than a tone: each firing rings the exhaust and adds a
 * sharp pressure pulse and a burst of noise. Uneven firings put energy at half-orders, which is what
 * makes it sound like an engine and not a synth. Played back faster or slower, it is the RPM.
 */
function engineBed(d: Dsp, e: EngineSpec, extra?: (out: Mono) => void): Mono {
  const sr = d.sr;
  const cycle = 1 / e.cycleHz;
  const total = e.cycles * cycle;
  const n = d.len(total);
  const out = new Float32Array(n);
  const blast = new Float32Array(n);
  const period = cycle / e.fires.length;
  const pulseLen = Math.round(period * 5 * sr);
  const w = (TAU * e.ring) / (period * sr);
  const w2 = (TAU * e.rasp) / (period * sr);
  const kRing = Math.exp(-1 / (e.ringTau * period * sr));
  const kRasp = Math.exp(-1 / (0.3 * period * sr));
  const kPulse = Math.exp(-1 / (e.pulseTau * period * sr));
  const kBlast = Math.exp(-1 / (0.3 * period * sr));
  for (let c = 0; c < e.cycles; c++) {
    for (const [at, amp] of e.fires) {
      const start = Math.round((c + at + d.rand() * e.rough * 0.05) * cycle * sr);
      const a = amp * (1 + d.rand() * e.rough);
      let ring = a;
      let rasp = a * e.raspLevel;
      let pulse = a * e.pulse;
      let env = a;
      for (let i = 0; i < pulseLen; i++) {
        const j = (((start + i) % n) + n) % n;
        out[j] = out[j]! + Math.sin(w * i) * ring + Math.sin(w2 * i) * rasp + pulse;
        blast[j] = blast[j]! + env;
        ring *= kRing;
        rasp *= kRasp;
        pulse *= kPulse;
        env *= kBlast;
      }
    }
  }
  const hiss = d.lp(d.white(total), 3200);
  for (let i = 0; i < n; i++) out[i] = out[i]! + hiss[i]! * blast[i]! * e.noise;
  extra?.(out);
  // High-pass over two laps so the filter state is the same at both ends of the loop.
  const twice = new Float32Array(n * 2);
  twice.set(out);
  twice.set(out, n);
  d.hp(twice, 28);
  return d.norm(d.drive(d.norm(twice.slice(n), 1), e.drive), 0.85);
}

const bedCar = (d: Dsp): Rendered =>
  engineBed(d, {
    cycleHz: 17.5,
    fires: [
      [0, 1],
      [0.25, 0.8],
      [0.5, 0.93],
      [0.75, 0.72],
    ],
    cycles: 32,
    ring: 2.3,
    ringTau: 0.8,
    rasp: 6.7,
    raspLevel: 0.6,
    drive: 1.8,
    pulse: 1.1,
    pulseTau: 0.03,
    rough: 0.07,
    noise: 0.35,
  });

const bedBoat = (d: Dsp): Rendered =>
  engineBed(d, {
    cycleHz: 21,
    fires: [
      [0, 1],
      [0.4, 0.7],
    ],
    cycles: 36,
    ring: 2.2,
    ringTau: 1.1,
    rasp: 5.4,
    raspLevel: 0.7,
    drive: 2.2,
    pulse: 0.8,
    pulseTau: 0.06,
    rough: 0.16,
    noise: 0.6,
  });

const bedPlane = (d: Dsp): Rendered =>
  engineBed(
    d,
    {
      cycleHz: 11,
      fires: [1, 0.85, 0.95, 0.8, 0.9, 1, 0.82, 0.93, 0.88].map((amp, i) => [i / 9, amp] as const),
      cycles: 34,
      ring: 1.5,
      ringTau: 0.6,
      rasp: 4.6,
      raspLevel: 0.6,
      drive: 1.6,
      pulse: 0.9,
      pulseTau: 0.04,
      rough: 0.05,
      noise: 0.3,
    },
    (out) => {
      // Propeller: blades pass six times per engine cycle. A second set a few passes per loop sharp
      // beats against it, the slow throb of a prop drone. Both complete whole cycles in the loop.
      const n = out.length;
      const passes = 34 * 6;
      for (const [count, level] of [
        [passes, 0.5],
        [passes + 5, 0.3],
      ] as const) {
        for (let h = 1; h <= 8; h++) {
          const w = (TAU * count * h) / n;
          const a = level / h;
          for (let i = 0; i < n; i++) out[i] = out[i]! + Math.sin(w * i) * a;
        }
      }
    },
  );

/** Distant gull: a harsh, formant-shaped cry that rises fast and sags, repeated two or three times. */
function gull(d: Dsp, v: number): Rendered {
  const calls = v === 0 ? 3 : 2;
  const dry = d.zeros(1.5);
  let at = 0.02;
  for (let c = 0; c < calls; c++) {
    const len = (v === 0 ? 0.2 : 0.34) + d.rand(0, 0.08) + (c === calls - 1 ? 0.12 : 0);
    const f0 = (v === 0 ? 1250 : 980) * (1 + d.rand(-0.05, 0.05)) * (1 - c * 0.03);
    const pitch = (t: number): number => {
      const u = Math.min(1, t / len);
      return f0 * (0.78 + 1.05 * Math.pow(u, 0.3) * Math.pow(1 - u, 0.6)) * (1 + 0.012 * Math.sin(t * 190));
    };
    const call = d.osc(len, 'saw', pitch);
    d.mix(call, d.osc(len, 'square', pitch), 0.5);
    d.lp(d.hp(d.filter(call, 'peak', 2700, 2, 10), 700), 5200);
    d.env(call, (t) => hump(len, 0.6)(t) * (0.8 + 0.2 * Math.sin(t * TAU * 48)));
    d.mix(dry, d.norm(call, 1), 1 - c * 0.12, at);
    at += len + d.rand(0.05, 0.12);
  }
  d.lp(dry, 3800);
  return d.norm(d.verb(dry, { time: 1.1, mix: 0.5, pre: 0.02 }), 0.8);
}

/** Buffers behind the loops. Ambience is dull enough to render at a reduced rate. */
export const BEDS: Record<string, Recipe> = {
  bed_wind: { render: bedWind, sr: 24000, loop: true },
  bed_ocean: { render: bedOcean, sr: 24000, loop: true },
  bed_city: { render: bedCity, sr: 16000, loop: true },
  bed_storm: { render: bedStorm, sr: 24000, loop: true },
  bed_rain: { render: bedRain, sr: 32000, loop: true },
  bed_noise: { render: bedNoise, loop: true },
  bed_skid: { render: bedSkid, loop: true },
  bed_car: { render: bedCar, loop: true },
  bed_boat: { render: bedBoat, loop: true },
  bed_plane: { render: bedPlane, loop: true },
  amb_gull: { render: gull, variants: 2 },
};

// ---------------------------------------------------------------------------------------------------------------------
// Live graphs
// ---------------------------------------------------------------------------------------------------------------------

/** Glide time for control changes, seconds. */
const GLIDE = 0.06;

function loopSource(ctx: BaseAudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  // Start anywhere, so two cars are never in step.
  src.start(0, Math.random() * buffer.duration);
  return src;
}

function biquad(ctx: BaseAudioContext, type: BiquadFilterType, freq: number, q = Math.SQRT1_2, gainDb = 0): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  f.gain.value = gainDb;
  return f;
}

function gainNode(ctx: BaseAudioContext, value: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

/** Slow sine added to a parameter. */
function lfo(ctx: BaseAudioContext, hz: number, depth: number, target: AudioParam): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.frequency.value = hz;
  osc.connect(gainNode(ctx, depth)).connect(target);
  osc.start();
  return osc;
}

function stopAll(nodes: readonly AudioScheduledSourceNode[], when: number): void {
  for (const n of nodes) {
    try {
      n.stop(when);
    } catch {
      // Already stopped.
    }
  }
}

/** A bed played as it is, with playback rate as its only control. */
function plain(bed: string, rateOf: (pitch: number) => number, drift?: readonly [hz: number, depth: number]) {
  return (ctx: BaseAudioContext, bank: BufferSource): LoopVoice => {
    const src = loopSource(ctx, bank.get(bed)[0]!);
    const out = gainNode(ctx, 1);
    src.connect(out);
    const sources: AudioScheduledSourceNode[] = [src];
    // A slow swell at a period unrelated to the loop length hides the repeat.
    if (drift) sources.push(lfo(ctx, drift[0], drift[1], out.gain));
    return {
      out,
      setPitch: (pitch, when) => src.playbackRate.setTargetAtTime(rateOf(pitch), when, GLIDE),
      stop: (when) => stopAll(sources, when),
    };
  };
}

function buildWind(ctx: BaseAudioContext, bank: BufferSource): LoopVoice {
  const src = loopSource(ctx, bank.get('bed_wind')[0]!);
  const out = gainNode(ctx, 1);
  const rumble = biquad(ctx, 'highpass', 90);
  const body = biquad(ctx, 'lowpass', 1000, 0.6);
  const whistle = biquad(ctx, 'bandpass', 720, 2.2);
  const whistleGain = gainNode(ctx, 0.6);
  const air = biquad(ctx, 'highpass', 2600);
  const airGain = gainNode(ctx, 0.2);
  src.connect(rumble).connect(body).connect(out);
  src.connect(whistle).connect(whistleGain).connect(out);
  src.connect(air).connect(airGain).connect(out);
  const sources = [src, lfo(ctx, 0.19, 0.16, out.gain), lfo(ctx, 0.31, 80, whistle.frequency)];
  return {
    out,
    setPitch(pitch, when) {
      const k = clamp(pitch, 0.3, 3);
      src.playbackRate.setTargetAtTime(0.8 + 0.2 * k, when, GLIDE);
      body.frequency.setTargetAtTime(300 + 700 * k ** 1.3, when, GLIDE);
      whistle.frequency.setTargetAtTime(250 + 560 * k, when, GLIDE);
      whistleGain.gain.setTargetAtTime(0.5 + 1.4 * clamp01((k - 0.4) / 1.6), when, GLIDE);
      airGain.gain.setTargetAtTime(0.15 + 1.6 * clamp01((k - 0.6) / 1.9), when, GLIDE);
    },
    stop: (when) => stopAll(sources, when),
  };
}

function buildCity(ctx: BaseAudioContext, bank: BufferSource): LoopVoice {
  const src = loopSource(ctx, bank.get('bed_city')[0]!);
  const out = gainNode(ctx, 1);
  src.connect(out);
  let nextGull = 0;
  return {
    out,
    setPitch: (pitch, when) => src.playbackRate.setTargetAtTime(clamp(pitch, 0.5, 2), when, GLIDE),
    tick(now, audible) {
      if (nextGull === 0 || !audible) {
        if (nextGull < now + 2) nextGull = now + 2 + Math.random() * 6;
        return;
      }
      if (now < nextGull) return;
      nextGull = now + 5 + Math.random() * 10;
      const cries = bank.get('amb_gull');
      const cry = ctx.createBufferSource();
      cry.buffer = cries[Math.floor(Math.random() * cries.length)]!;
      cry.playbackRate.value = 0.85 + Math.random() * 0.35;
      const level = gainNode(ctx, 0.07 + Math.random() * 0.16);
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      cry.connect(level).connect(pan).connect(out);
      cry.onended = () => pan.disconnect();
      cry.start(now);
    },
    stop: (when) => stopAll([src], when),
  };
}

interface EngineVoiceSpec {
  bed: string;
  /** Fixed resonances of the body and exhaust: Hz, Q, dB. They stay put while the revs move. */
  peaks: readonly (readonly [hz: number, q: number, db: number])[];
  /** Low-pass that opens with revs: Hz at rest, and Hz added per unit of pitch. */
  lowpass: readonly [base: number, perPitch: number];
  /** Intake hiss or wash: band centre, level at idle, level added per unit of pitch. */
  noise: readonly [hz: number, idle: number, perPitch: number];
  /** Slow wobble on the noise: Hz and depth. A boat uses it for water burbling at the exhaust. */
  burble?: readonly [hz: number, depth: number];
}

function engine(spec: EngineVoiceSpec) {
  return (ctx: BaseAudioContext, bank: BufferSource): LoopVoice => {
    const src = loopSource(ctx, bank.get(spec.bed)[0]!);
    const out = gainNode(ctx, 0.8);
    let node: AudioNode = src;
    for (const [hz, q, db] of spec.peaks) node = node.connect(biquad(ctx, 'peaking', hz, q, db));
    const lowpass = biquad(ctx, 'lowpass', spec.lowpass[0] + spec.lowpass[1], 0.8);
    node.connect(lowpass).connect(out);
    const hiss = loopSource(ctx, bank.get('bed_noise')[0]!);
    const hissBand = biquad(ctx, 'bandpass', spec.noise[0], 0.8);
    const hissGain = gainNode(ctx, spec.noise[1]);
    hiss.connect(hissBand).connect(hissGain).connect(out);
    const sources: AudioScheduledSourceNode[] = [src, hiss];
    if (spec.burble) sources.push(lfo(ctx, spec.burble[0], spec.burble[1], hissGain.gain));
    return {
      out,
      setPitch(pitch, when) {
        const k = clamp(pitch, 0.3, 3);
        src.playbackRate.setTargetAtTime(k, when, GLIDE);
        lowpass.frequency.setTargetAtTime(spec.lowpass[0] + spec.lowpass[1] * k, when, GLIDE);
        hissBand.frequency.setTargetAtTime(spec.noise[0] * (0.6 + 0.4 * k), when, GLIDE);
        hissGain.gain.setTargetAtTime(spec.noise[1] + spec.noise[2] * Math.max(0, k - 0.5), when, GLIDE);
        out.gain.setTargetAtTime(0.7 + 0.3 * clamp01((k - 0.5) / 2), when, GLIDE);
      },
      stop: (when) => stopAll(sources, when),
    };
  };
}

const AMBIENT = [15, 250] as const;

/** Every loop: what it needs and how its live graph is wired. */
export const LOOPS: Record<LoopName, LoopDef> = {
  wind: { beds: ['bed_wind'], gain: 0.7, range: AMBIENT, build: buildWind },
  ocean: { beds: ['bed_ocean'], gain: 0.5, range: [25, 320], build: plain('bed_ocean', (p) => clamp(p, 0.6, 1.6), [0.043, 0.14]) },
  city: { beds: ['bed_city', 'amb_gull'], gain: 0.4, range: AMBIENT, build: buildCity },
  storm: { beds: ['bed_storm'], gain: 0.7, range: [40, 500], build: plain('bed_storm', (p) => clamp(p, 0.6, 1.8), [0.071, 0.15]) },
  rain: { beds: ['bed_rain'], gain: 0.55, range: AMBIENT, build: plain('bed_rain', (p) => clamp(p, 0.7, 1.5)) },
  skid: { beds: ['bed_skid'], gain: 0.4, range: [5, 70], build: plain('bed_skid', (p) => clamp(p, 0.5, 2)) },
  car_engine: {
    beds: ['bed_car', 'bed_noise'],
    gain: 0.26,
    range: [6, 90],
    build: engine({
      bed: 'bed_car',
      peaks: [
        [110, 1.2, 3],
        [420, 1.2, 6],
        [1100, 1, 6],
        [2400, 1.2, 4],
      ],
      lowpass: [700, 1500],
      noise: [1800, 0.012, 0.05],
    }),
  },
  boat_engine: {
    beds: ['bed_boat', 'bed_noise'],
    gain: 0.2,
    range: [8, 110],
    build: engine({
      bed: 'bed_boat',
      peaks: [
        [90, 1.2, 3],
        [260, 1.5, 8],
        [800, 1.2, 8],
      ],
      lowpass: [600, 900],
      noise: [520, 0.06, 0.08],
      burble: [7.3, 0.035],
    }),
  },
  plane_engine: {
    beds: ['bed_plane', 'bed_noise'],
    gain: 0.3,
    range: [30, 600],
    build: engine({
      bed: 'bed_plane',
      peaks: [
        [95, 1, 3],
        [330, 1.2, 6],
        [1000, 1, 7],
      ],
      lowpass: [1100, 1500],
      noise: [2500, 0.03, 0.05],
    }),
  },
};

/** Every loop name, for tooling and tests. */
export const LOOP_NAMES = Object.keys(LOOPS) as LoopName[];
