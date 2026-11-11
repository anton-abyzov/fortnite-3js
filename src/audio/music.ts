import { hash2 } from '../core/rng';
import { burst, click, thump } from './blocks';
import type { Dsp, Mono, Rendered } from './dsp';
import type { BufferSource } from './loops';
import type { Recipe } from './sounds';

export type MusicTrack = 'none' | 'menu' | 'match' | 'storm' | 'victory' | 'defeat';

// ---------------------------------------------------------------------------------------------------------------------
// Drum kit and reverb impulse (pre-rendered)
// ---------------------------------------------------------------------------------------------------------------------

function kick(d: Dsp): Rendered {
  const out = thump(d, 150, 46, 0.03, 0.13, 0.002);
  d.mix(out, burst(d, 'lp', 1800, 0.7, 0.006), 0.25);
  return d.norm(d.drive(out, 1.4), 0.9);
}

/** Snare with the reverb cut short, the way eighties records did it. */
function snare(d: Dsp): Rendered {
  const dry = d.zeros(0.3);
  d.mix(
    dry,
    d.modes(0.2, [
      [186, 0.045, 1],
      [331, 0.03, 0.5],
    ]),
    0.7,
  );
  d.mix(dry, burst(d, 'bp', 1900, 0.6, 0.07, 0.001), 0.9);
  d.mix(dry, burst(d, 'hp', 5000, 0.7, 0.04, 0.001), 0.35);
  const wet = d.verb(dry, { time: 0.5, mix: 0.6, tail: 0.02 });
  for (const ch of wet) d.fade(ch, 0, 0.05);
  return d.norm(wet, 0.85);
}

/** Hi-hat: variant 0 closed, variant 1 half open. */
function hat(d: Dsp, v: number): Rendered {
  const tau = v === 0 ? 0.018 : 0.09;
  const out = burst(d, 'hp', 7500, 0.7, tau, 0.0005);
  d.mix(out, burst(d, 'bp', 10500, 3, tau * 0.8), 0.5);
  return d.norm(out, 0.7);
}

function shaker(d: Dsp): Rendered {
  return d.norm(burst(d, 'bp', 6200, 0.9, 0.028, 0.012), 0.7);
}

/** Dry woody tick for the clave line. */
function rim(d: Dsp): Rendered {
  const out = d.modes(0.12, [
    [1720, 0.014, 1],
    [2480, 0.01, 0.6],
    [820, 0.012, 0.4],
  ]);
  d.mix(out, burst(d, 'hp', 3000, 0.7, 0.001), 0.4);
  return d.norm(out, 0.8);
}

/** Hand drum: variant 0 high, variant 1 low. */
function conga(d: Dsp, v: number): Rendered {
  const f = v === 0 ? 292 : 206;
  const out = thump(d, f * 1.22, f, 0.02, 0.1, 0.001);
  d.mix(out, d.decay(d.sweep(0.3, f * 2.4, f * 2.1, 0.02), 0.04, 0.001), 0.3);
  d.mix(out, burst(d, 'bp', 1500, 1, 0.006), 0.4);
  return d.norm(out, 0.85);
}

function cymbal(d: Dsp): Rendered {
  const len = 2.6;
  const make = (): Mono => {
    const x = d.hp(d.white(len), 3200);
    d.mix(x, d.bp(d.white(len), 5400, 4), 0.6);
    d.mix(x, d.bp(d.white(len), 8300, 5), 0.5);
    return d.decay(x, 0.55, 0.002);
  };
  return d.norm([make(), make()], 0.7);
}

/** Reverb impulse: sparse early reflections, then a noise tail that darkens as it decays. */
function hall(d: Dsp): Rendered {
  const len = 2.8;
  const make = (): Mono => {
    const x = d.white(len);
    d.lp(x, (t) => 1100 + 6500 * Math.exp(-t / 0.5));
    d.env(x, (t) => Math.min(1, t / 0.03) * Math.exp(-t / 0.42));
    for (let i = 0; i < 9; i++) {
      const at = Math.round(d.rand(0.008, 0.085) * d.sr);
      x[at] = x[at]! + d.rand(0.4, 1) * (d.rng.next() < 0.5 ? -1 : 1);
    }
    return d.fade(x, 0, 0.4);
  };
  return d.norm([make(), make()], 0.9);
}

/** Buffers the music needs. */
export const KIT: Record<string, Recipe> = {
  drum_kick: { render: kick },
  drum_snare: { render: snare },
  drum_hat: { render: hat, variants: 2 },
  drum_shaker: { render: shaker },
  drum_rim: { render: rim },
  drum_conga: { render: conga, variants: 2 },
  drum_cymbal: { render: cymbal },
  drum_click: { render: (d) => d.norm(click(d, 2100, 0.01, 0.3), 0.6) },
  ir_hall: { render: hall },
};

/** Names of the buffers the music needs, so a caller can wait for them. */
export const KIT_KEYS = Object.keys(KIT);

// ---------------------------------------------------------------------------------------------------------------------
// Sequencer
// ---------------------------------------------------------------------------------------------------------------------

type Voice = 'bass' | 'pluck' | 'pad' | 'lead' | 'drums' | 'bell';

/** Per-instrument send levels: dry, delay, reverb. */
const SENDS: Record<Voice, readonly [number, number, number]> = {
  bass: [1, 0, 0.03],
  pluck: [1, 0.32, 0.22],
  pad: [1, 0, 0.45],
  lead: [1, 0.38, 0.32],
  drums: [1, 0, 0.1],
  bell: [1, 0.45, 0.6],
};

/** One playing track: its own mixer, delay and fader, so two tracks can cross-fade. */
interface Deck {
  track: MusicTrack;
  def: TrackDef;
  bus: Record<Voice, GainNode>;
  /** Faders: the dry mix and the reverb send move together. */
  faders: GainNode[];
  stepDur: number;
  step: number;
  nextTime: number;
  /** No more steps will be scheduled. */
  finished: boolean;
  /** Being faded out to make way for another track. */
  fading: boolean;
  /** When the deck can be torn down; 0 while it is still playing. */
  endTime: number;
}

interface TrackDef {
  bpm: number;
  gain: number;
  /** Echo time in sixteenth notes. */
  delaySteps: number;
  /** Length of a sting in steps. Loops when absent. */
  steps?: number;
  /** Ring-out after the last step of a sting, seconds. */
  tail?: number;
  schedule(m: Music, deck: Deck, step: number, t: number): void;
}

/** How far ahead of the audio clock notes are committed, seconds. Covers a few dropped frames. */
const LOOKAHEAD = 0.5;

function mtof(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Procedural music: a look-ahead step sequencer on the WebAudio clock driving a handful of small synth
 * voices (oscillators through filters) and the pre-rendered drum kit. Nothing here is a recording.
 */
export class Music {
  current: MusicTrack = 'none';
  private decks: Deck[] = [];
  private readonly reverb: ConvolverNode;

  constructor(
    private readonly ctx: BaseAudioContext,
    private readonly out: AudioNode,
    private readonly bank: BufferSource,
  ) {
    // The impulse is attached in `update` once it has been rendered; until then the reverb is simply silent.
    this.reverb = ctx.createConvolver();
    this.reverb.connect(out);
  }

  /** Switches track. Looping tracks cross-fade over `fade` seconds; stings start at once. To replay a sting, go through `none`. */
  play(track: MusicTrack, fade = 1.5): void {
    const now = this.ctx.currentTime;
    // Asking for the track that is already set changes nothing, so this is safe to call every frame.
    if (track === this.current) return;
    this.current = track;
    const f = Math.max(0.02, fade);
    for (const deck of this.decks) if (!deck.fading) this.fadeOut(deck, now, f);
    const def = TRACKS[track as Exclude<MusicTrack, 'none'>];
    if (track === 'none' || !def) return;
    this.decks.push(this.makeDeck(track, def, now, def.steps === undefined ? Math.min(f, 2) : 0.02));
    this.update();
  }

  /** Commits notes up to the look-ahead horizon and retires finished decks. Call every frame. */
  update(): void {
    const now = this.ctx.currentTime;
    if (!this.reverb.buffer && this.bank.has('ir_hall')) this.reverb.buffer = this.bank.get('ir_hall')[0]!;
    for (const deck of this.decks) {
      if (!deck.finished) {
        const sting = deck.def.steps !== undefined;
        // After a stall, skip what was missed instead of playing it all at once.
        if (!sting && deck.nextTime < now) {
          const missed = Math.ceil((now + 0.03 - deck.nextTime) / deck.stepDur);
          deck.step += missed;
          deck.nextTime += missed * deck.stepDur;
        }
        const horizon = sting ? Infinity : now + LOOKAHEAD;
        while (deck.nextTime < horizon) {
          if (sting && deck.step >= deck.def.steps!) {
            deck.finished = true;
            deck.endTime = deck.nextTime + (deck.def.tail ?? 2);
            break;
          }
          deck.def.schedule(this, deck, deck.step, deck.nextTime);
          deck.step++;
          deck.nextTime += deck.stepDur;
        }
      }
      if (deck.endTime > 0 && now > deck.endTime) {
        for (const f of deck.faders) f.disconnect();
        deck.endTime = -1;
      }
    }
    if (this.decks.some((d) => d.endTime < 0)) this.decks = this.decks.filter((d) => d.endTime >= 0);
  }

  dispose(): void {
    for (const deck of this.decks) for (const f of deck.faders) f.disconnect();
    this.decks = [];
    this.reverb.disconnect();
    this.current = 'none';
  }

  private fadeOut(deck: Deck, now: number, fade: number): void {
    for (const f of deck.faders) {
      const g = f.gain;
      const from = g.value;
      g.cancelScheduledValues(now);
      g.setValueAtTime(from, now);
      g.linearRampToValueAtTime(0, now + fade);
    }
    deck.finished = true;
    deck.fading = true;
    deck.endTime = now + fade + 0.05;
  }

  private makeDeck(track: MusicTrack, def: TrackDef, now: number, fadeIn: number): Deck {
    const ctx = this.ctx;
    const stepDur = 60 / def.bpm / 4;
    const mix = ctx.createGain();
    const fader = ctx.createGain();
    const verbFader = ctx.createGain();
    const delayIn = ctx.createGain();
    const verbIn = ctx.createGain();
    mix.connect(fader).connect(this.out);
    verbIn.connect(verbFader).connect(this.reverb);
    // Tempo-synced echo with a darkening feedback path.
    const delay = ctx.createDelay(2);
    delay.delayTime.value = stepDur * def.delaySteps;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.36;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 2600;
    delayIn.connect(delay).connect(damp).connect(feedback).connect(delay);
    damp.connect(mix);
    damp.connect(verbIn);
    const bus = {} as Record<Voice, GainNode>;
    for (const name of Object.keys(SENDS) as Voice[]) {
      const [dry, echo, verb] = SENDS[name];
      const g = ctx.createGain();
      g.gain.value = dry;
      g.connect(mix);
      bus[name] = g;
      if (echo > 0) {
        const send = ctx.createGain();
        send.gain.value = echo;
        g.connect(send).connect(delayIn);
      }
      if (verb > 0) {
        const send = ctx.createGain();
        send.gain.value = verb;
        g.connect(send).connect(verbIn);
      }
    }
    for (const f of [fader, verbFader]) {
      f.gain.setValueAtTime(0, now);
      f.gain.linearRampToValueAtTime(def.gain, now + fadeIn);
    }
    return { track, def, bus, faders: [fader, verbFader], stepDur, step: 0, nextTime: now + 0.06, finished: false, fading: false, endTime: 0 };
  }

  // ---- voices ----

  private osc(type: OscillatorType, freq: number, t: number, stop: number, detune = 0): OscillatorNode {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.start(t);
    o.stop(stop);
    return o;
  }

  /** Gain with an attack, a decay towards `sustain` and a release after `dur`. Returns the node and when it is silent. */
  private amp(t: number, peak: number, attack: number, decay: number, sustain: number, dur: number, release: number): [GainNode, number] {
    const g = this.ctx.createGain();
    const hold = Math.max(dur, attack + 0.01);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setTargetAtTime(peak * sustain, t + attack, decay);
    g.gain.setTargetAtTime(0, t + hold, release / 4);
    return [g, t + hold + release];
  }

  /** Frees a note's graph once its first oscillator has stopped. */
  private release(first: AudioScheduledSourceNode, last: AudioNode): void {
    first.onended = () => last.disconnect();
  }

  bass(deck: Deck, t: number, midi: number, dur: number, vel: number): void {
    const f = mtof(midi);
    const [g, end] = this.amp(t, vel * 0.42, 0.006, 0.1, 0.7, dur, 0.1);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = 2.5;
    filt.frequency.setValueAtTime(Math.min(4000, f * 10), t);
    filt.frequency.setTargetAtTime(f * 2.8, t, 0.09);
    const a = this.osc('sawtooth', f, t, end);
    a.connect(filt);
    this.osc('sawtooth', f, t, end, 9).connect(filt);
    this.osc('triangle', f, t, end).connect(filt);
    filt.connect(g).connect(deck.bus.bass);
    this.release(a, g);
  }

  pluck(deck: Deck, t: number, midi: number, dur: number, vel: number, pan = 0, bright = 1): void {
    const f = mtof(midi);
    const [g, end] = this.amp(t, vel * 0.16, 0.004, 0.09, 0.15, dur, 0.12);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = 1.6;
    filt.frequency.setValueAtTime(Math.min(9000, f * 7 * bright), t);
    filt.frequency.setTargetAtTime(f * 1.6, t, 0.07);
    const a = this.osc('square', f, t, end);
    a.connect(filt);
    this.osc('sawtooth', f, t, end, 10).connect(filt);
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;
    filt.connect(g).connect(p).connect(deck.bus.pluck);
    this.release(a, p);
  }

  pad(deck: Deck, t: number, midis: readonly number[], dur: number, vel: number, cutoff = 900, attack = 0.5): void {
    const ctx = this.ctx;
    const end = t + dur + 1.6;
    const g = ctx.createGain();
    const peak = (vel * 0.1) / Math.sqrt(midis.length);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setTargetAtTime(0, t + Math.max(dur, attack + 0.01), 0.32);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = 0.8;
    filt.frequency.setValueAtTime(cutoff * 0.6, t);
    filt.frequency.linearRampToValueAtTime(cutoff * 1.3, t + dur * 0.6);
    let first: OscillatorNode | null = null;
    for (const m of midis) {
      const f = mtof(m);
      const a = this.osc('sawtooth', f, t, end, -7);
      a.connect(filt);
      this.osc('sawtooth', f, t, end, 7).connect(filt);
      first ??= a;
    }
    filt.connect(g).connect(deck.bus.pad);
    if (first) this.release(first, g);
  }

  lead(deck: Deck, t: number, midi: number, dur: number, vel: number): void {
    const ctx = this.ctx;
    const f = mtof(midi);
    const [g, end] = this.amp(t, vel * 0.17, 0.02, 0.3, 0.7, dur, 0.18);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 3200;
    const a = this.osc('triangle', f, t, end);
    const b = this.osc('sawtooth', f, t, end, 5);
    const edge = ctx.createGain();
    edge.gain.value = 0.22;
    a.connect(filt);
    b.connect(edge).connect(filt);
    // Vibrato that arrives late, like a held note on a real instrument.
    const vib = this.osc('sine', 5.4, t, end);
    const depth = ctx.createGain();
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(0, t + 0.18);
    depth.gain.linearRampToValueAtTime(9, t + 0.45);
    vib.connect(depth);
    depth.connect(a.detune);
    depth.connect(b.detune);
    filt.connect(g).connect(deck.bus.lead);
    this.release(a, g);
  }

  bell(deck: Deck, t: number, midi: number, vel: number, ring = 0.5): void {
    const ctx = this.ctx;
    const f = mtof(midi);
    const end = t + ring * 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel * 0.2, t + 0.004);
    g.gain.setTargetAtTime(0, t + 0.004, ring);
    const a = this.osc('sine', f, t, end);
    a.connect(g);
    for (const [ratio, level] of [
      [2.76, 0.28],
      [5.4, 0.1],
    ] as const) {
      const partial = ctx.createGain();
      partial.gain.setValueAtTime(level, t);
      partial.gain.setTargetAtTime(0, t, ring * 0.35);
      this.osc('sine', f * ratio, t, end).connect(partial).connect(g);
    }
    g.connect(deck.bus.bell);
    this.release(a, g);
  }

  drum(deck: Deck, t: number, key: string, vel: number, rate = 1, pan = 0, variant = 0): void {
    const ctx = this.ctx;
    const buffers = this.bank.get(key);
    const src = ctx.createBufferSource();
    src.buffer = buffers[variant % buffers.length]!;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = vel;
    let last: AudioNode = src.connect(g);
    if (pan !== 0) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      last = last.connect(p);
    }
    last.connect(deck.bus.drums);
    src.onended = () => last.disconnect();
    src.start(t);
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------------------------------------------------

interface Chord {
  root: number;
  pad: readonly number[];
}

/** Menu: sixteen bars in A minor. The E7 bars borrow G sharp for the Latin turnaround. */
const MENU_CHORDS: readonly Chord[] = [
  { root: 33, pad: [57, 60, 64, 67] }, // Am7
  { root: 29, pad: [53, 57, 60, 64] }, // Fmaj7
  { root: 36, pad: [55, 60, 62, 64] }, // Cadd9
  { root: 31, pad: [55, 59, 62, 64] }, // G6
  { root: 33, pad: [57, 60, 64, 67] }, // Am7
  { root: 29, pad: [53, 57, 60, 64] }, // Fmaj7
  { root: 38, pad: [53, 57, 60, 62] }, // Dm7
  { root: 28, pad: [56, 59, 62, 64] }, // E7
  { root: 29, pad: [53, 57, 60, 65] }, // F
  { root: 31, pad: [55, 59, 62, 67] }, // G
  { root: 28, pad: [55, 59, 62, 64] }, // Em7
  { root: 33, pad: [57, 60, 64, 67] }, // Am7
  { root: 38, pad: [53, 57, 60, 64] }, // Dm9
  { root: 31, pad: [53, 55, 59, 62] }, // G7
  { root: 28, pad: [57, 59, 64, 69] }, // Esus4
  { root: 28, pad: [56, 59, 62, 64] }, // E7
];

/** Lead line per bar: step, note, length in steps. */
const MENU_LEAD: readonly (readonly (readonly [number, number, number])[])[] = [
  [
    [0, 76, 3],
    [3, 81, 3],
    [6, 79, 2],
    [8, 76, 6],
    [14, 74, 2],
  ],
  [
    [0, 72, 6],
    [6, 74, 2],
    [8, 76, 3],
    [11, 72, 5],
  ],
  [
    [0, 79, 3],
    [3, 76, 3],
    [6, 74, 2],
    [8, 76, 8],
  ],
  [
    [0, 74, 6],
    [6, 71, 2],
    [8, 74, 3],
    [11, 79, 3],
    [14, 77, 2],
  ],
  [[0, 76, 8]],
  [
    [2, 81, 2],
    [4, 79, 2],
    [6, 77, 2],
    [8, 76, 3],
    [11, 72, 5],
  ],
  [
    [0, 74, 3],
    [3, 77, 3],
    [6, 81, 2],
    [8, 79, 3],
    [11, 77, 3],
    [14, 76, 2],
  ],
  [
    [0, 80, 6],
    [6, 83, 2],
    [8, 76, 8],
  ],
  [
    [0, 81, 4],
    [4, 84, 4],
    [8, 81, 3],
    [11, 77, 5],
  ],
  [
    [0, 79, 4],
    [4, 83, 4],
    [8, 79, 3],
    [11, 74, 5],
  ],
  [
    [0, 76, 3],
    [3, 79, 3],
    [6, 83, 2],
    [8, 81, 3],
    [11, 79, 3],
    [14, 76, 2],
  ],
  [[0, 81, 10]],
  [
    [0, 77, 3],
    [3, 76, 3],
    [6, 74, 2],
    [8, 77, 3],
    [11, 81, 5],
  ],
  [
    [0, 79, 3],
    [3, 77, 3],
    [6, 74, 2],
    [8, 71, 3],
    [11, 74, 5],
  ],
  [
    [0, 76, 6],
    [6, 81, 2],
    [8, 83, 8],
  ],
  [
    [0, 80, 6],
    [8, 76, 4],
    [12, 68, 2],
    [14, 71, 2],
  ],
];

/** Arpeggio shapes: index into the chord (4 and up are an octave higher), -1 rests. */
const ARP_A = [0, 2, 1, 3, 2, -1, 3, 1, 4, 2, 3, -1, 2, 3, 1, 2];
const ARP_B = [0, -1, 2, 3, 4, 3, -1, 2, 5, 3, 2, -1, 4, 3, 2, 1];
/** Tresillo: the 3+3+2 pulse under the bass and the accents. */
const TRESILLO = [0, 3, 6, 8, 11, 14];
const BASS_STEPS: Record<number, number> = { 0: 0, 3: 0, 6: 12, 8: 0, 11: 7, 14: 12 };
const CLAVE = [0, 3, 6, 10, 12];

const menu: TrackDef = {
  bpm: 100,
  // Set against the full arrangement (bass and kick in), not the thin opening: at the default sliders the
  // loud passes sit near -24 dBFS, level with the stings, and stay under the limiter's threshold.
  gain: 0.95,
  delaySteps: 3,
  schedule(m, deck, step, t) {
    const sd = deck.stepDur;
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const b = bar % 16;
    const pass = Math.floor(bar / 16) % 4;
    const chord = MENU_CHORDS[b]!;
    // Arrangement: a thin opening, a full pass with the tune, a breakdown, then the tune's second half.
    const thin = (pass === 0 || pass === 2) && b < 8;
    const bassOn = !(pass === 0 && b < 4);
    const tune = pass === 1 || (pass === 3 && b >= 8);
    const arp = pass >= 2 ? ARP_B : ARP_A;
    const accent = TRESILLO.includes(s);

    if (s === 0) m.pad(deck, t, chord.pad, sd * 16, 0.9, thin ? 750 : 1050);
    const idx = arp[s]!;
    if (idx >= 0) {
      const note = chord.pad[idx % 4]! + 12 + (idx >= 4 ? 12 : 0);
      m.pluck(deck, t, note, sd * 1.4, accent ? 0.9 : 0.55, s % 2 === 0 ? -0.35 : 0.35, thin ? 0.6 : 1);
    }
    if (bassOn && s in BASS_STEPS) {
      if (pass === 2 && b < 8) {
        if (s === 0 || s === 8) m.bass(deck, t, chord.root + 12, sd * 7, 0.5);
      } else {
        m.bass(deck, t, chord.root + 12 + BASS_STEPS[s]!, sd * (s === 6 || s === 14 ? 1.6 : 2.4), accent && s % 8 === 0 ? 0.7 : 0.56);
      }
    }
    for (const [at, note, len] of MENU_LEAD[b]!) if (tune && at === s) m.lead(deck, t, note, sd * len * 0.92, 0.85);

    // Drums stay soft: this sits under a menu.
    m.drum(deck, t, 'drum_shaker', [0.2, 0.08, 0.14, 0.09][s % 4]!, 1, 0.3);
    if (bassOn && CLAVE.includes(s)) m.drum(deck, t, 'drum_rim', 0.2, 1, -0.3);
    if (!thin) {
      if (s === 0 || s === 8) m.drum(deck, t, 'drum_kick', 0.5);
      if (s === 11 && b % 2 === 1) m.drum(deck, t, 'drum_kick', 0.3);
      if (s === 4 || s === 12) m.drum(deck, t, 'drum_snare', 0.36);
      if (s % 2 === 0) m.drum(deck, t, 'drum_hat', s % 4 === 2 ? 0.16 : 0.1, 1, 0.15, s === 14 ? 1 : 0);
      if (b % 4 === 3 && s >= 10 && s !== 11) m.drum(deck, t, 'drum_conga', 0.22 + 0.04 * (s - 10), 1, -0.2, s === 10 || s === 14 ? 1 : 0);
    } else if (bassOn && s % 4 === 2) m.drum(deck, t, 'drum_hat', 0.1, 1, 0.15);
  },
};

/** Match: D minor with a flattened second. Root per bar over an eight-bar cycle. */
const MATCH_ROOTS = [38, 38, 34, 38, 38, 41, 39, 38];
const MATCH_SCALE = [62, 65, 67, 69, 72, 74, 75, 77, 81];

const match: TrackDef = {
  bpm: 72,
  gain: 0.5,
  delaySteps: 3,
  schedule(m, deck, step, t) {
    const sd = deck.stepDur;
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const root = MATCH_ROOTS[bar % 8]!;
    // A dark fifth that swells in under each bar and overlaps the next.
    if (s === 0) m.pad(deck, t, [root, root + 7, root + 12], sd * 17, 1, 260, 1.4);
    // Heartbeat.
    if (s === 0) m.drum(deck, t, 'drum_kick', 0.42, 0.78);
    if (s === 3) m.drum(deck, t, 'drum_kick', 0.24, 0.74);
    // A clock that is almost not there.
    if (s % 4 === 2) m.drum(deck, t, 'drum_click', 0.07, 1, s % 8 === 2 ? -0.5 : 0.5);
    // Sparse bell notes, placed by a hash so the pattern takes minutes to recur.
    const r = hash2(step, 7, 31);
    if (s % 2 === 0 && r < 0.13) {
      const pick = Math.floor(hash2(step, 11, 57) * MATCH_SCALE.length);
      m.bell(deck, t, MATCH_SCALE[pick]! + (root === 39 && pick === 0 ? 1 : 0), 0.5 + r * 3, 0.7);
    }
    // Every eighth bar, a high cold shimmer on the flattened second.
    if (bar % 8 === 6 && s === 0) m.pad(deck, t, [87, 94], sd * 14, 0.35, 2400, 2);
  },
};

/** Storm: the same key, faster and driven. Root per bar over eight bars. */
const STORM_ROOTS = [38, 38, 34, 36, 38, 38, 41, 39];

const storm: TrackDef = {
  bpm: 132,
  gain: 0.34,
  delaySteps: 3,
  schedule(m, deck, step, t) {
    const sd = deck.stepDur;
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const b = bar % 8;
    const root = STORM_ROOTS[b]!;
    // Galloping bass: an eighth and two sixteenths, over and over.
    if (s % 4 !== 1) m.bass(deck, t, root + (s === 6 || s === 14 ? 12 : 0), sd * 0.9, s % 4 === 0 ? 1 : 0.62);
    if (s % 4 === 0) m.drum(deck, t, 'drum_kick', 0.62);
    if (s % 4 === 2) m.drum(deck, t, 'drum_hat', 0.2, 1, 0.2, s === 14 ? 1 : 0);
    else m.drum(deck, t, 'drum_hat', 0.06, 1, 0.2);
    if (b >= 4 && (s === 4 || s === 12)) m.drum(deck, t, 'drum_snare', 0.4);
    // Minor stabs on the off-beats of every other bar.
    if (bar % 2 === 0 && (s === 0 || s === 6 || s === 12)) {
      for (const [i, n] of [root + 24, root + 27, root + 31].entries()) m.pluck(deck, t, n, sd * 1.5, 0.75, (i - 1) * 0.4, 1.3);
    }
    if (s === 0 && bar % 2 === 0) m.pad(deck, t, [root + 12, root + 19, root + 24], sd * 32, 0.9, 520, 0.8);
    // The last two bars of the cycle climb: a pulsing high note that gets louder.
    if (b >= 6 && s % 2 === 0) m.pluck(deck, t, b === 6 ? 81 : 82, sd, 0.3 + 0.035 * (s + (b - 6) * 16), 0, 1.6);
  },
};

/** Victory: a run up the A major triad into IV, V, I. Events: step, kind, notes, length in steps. */
type StingEvent = readonly [step: number, voice: 'pluck' | 'pad' | 'lead' | 'bass' | 'bell' | 'kick' | 'cymbal' | 'thud', notes: readonly number[], len: number];

const VICTORY: readonly StingEvent[] = [
  [0, 'kick', [], 0],
  [0, 'cymbal', [], 0],
  [0, 'pluck', [69], 2],
  [1, 'pluck', [73], 2],
  [2, 'pluck', [76], 2],
  [3, 'pluck', [81], 2],
  [4, 'pad', [62, 66, 69, 74], 5],
  [4, 'lead', [78], 4],
  [4, 'bass', [38], 4],
  [8, 'kick', [], 0],
  [9, 'pad', [64, 68, 71, 76], 5],
  [9, 'lead', [80], 4],
  [9, 'bass', [40], 4],
  [14, 'kick', [], 0],
  [14, 'cymbal', [], 0],
  [14, 'pad', [57, 61, 64, 69, 73], 12],
  [14, 'lead', [81], 10],
  [14, 'bass', [45], 11],
  [14, 'bell', [81], 0],
  [15, 'bell', [85], 0],
  [16, 'bell', [88], 0],
  [17, 'bell', [93], 0],
  [19, 'bell', [88], 0],
  [20, 'bell', [93], 0],
  [22, 'bell', [97], 0],
];

/** Defeat: a slow fall from E to A over A minor, ending on the low tonic. */
const DEFEAT: readonly StingEvent[] = [
  [0, 'thud', [], 0],
  [0, 'pad', [45, 52, 57, 60, 64], 15],
  [0, 'bass', [33], 14],
  [1, 'lead', [76], 4],
  [5, 'lead', [74], 4],
  [9, 'lead', [72], 4],
  [13, 'lead', [71], 3],
  [16, 'thud', [], 0],
  [16, 'pad', [45, 53, 57, 60], 8],
  [16, 'bass', [33], 8],
  [17, 'lead', [69], 8],
  [17, 'bell', [57], 0],
];

function sting(events: readonly StingEvent[], bpm: number, steps: number, tail: number, bright: number): TrackDef {
  return {
    bpm,
    // As loud as the menu's full passes; the final chord just clears the limiter's threshold at the default sliders.
    gain: 0.85,
    delaySteps: 3,
    steps,
    tail,
    schedule(m, deck, step, t) {
      const sd = deck.stepDur;
      for (const [at, voice, notes, len] of events) {
        if (at !== step) continue;
        if (voice === 'kick') m.drum(deck, t, 'drum_kick', 0.7);
        else if (voice === 'thud') m.drum(deck, t, 'drum_kick', 0.6, 0.62);
        else if (voice === 'cymbal') m.drum(deck, t, 'drum_cymbal', 0.3);
        else if (voice === 'pad') m.pad(deck, t, notes, sd * len, 1.2, 1500 * bright, bright > 0.6 ? 0.08 : 0.5);
        else {
          for (const n of notes) {
            if (voice === 'pluck') m.pluck(deck, t, n, sd * len, 1, 0, 1.4);
            else if (voice === 'lead') m.lead(deck, t, n, sd * len, 1);
            else if (voice === 'bass') m.bass(deck, t, n, sd * len, 0.9);
            else m.bell(deck, t, n, 0.8, 0.45);
          }
        }
      }
    },
  };
}

const TRACKS: Record<Exclude<MusicTrack, 'none'>, TrackDef> = {
  menu,
  match,
  storm,
  victory: sting(VICTORY, 120, 27, 2.4, 1),
  defeat: sting(DEFEAT, 100, 26, 2.2, 0.45),
};

/** Every track name, for tooling and tests. */
export const MUSIC_TRACKS: readonly MusicTrack[] = ['none', 'menu', 'match', 'storm', 'victory', 'defeat'];
