import { clamp01, smoothstep } from '../core/math';
import type { Settings } from '../core/settings';
import { BufferBank } from './bank';
import { LOOPS, type LoopName, type LoopVoice } from './loops';
import { KIT_KEYS, Music, type MusicTrack } from './music';
import { RECIPES } from './recipes';
import { SOUNDS, type SoundName } from './sounds';

export type { LoopName } from './loops';
export { LOOP_NAMES } from './loops';
export type { MusicTrack } from './music';
export { MUSIC_TRACKS } from './music';
export type { SoundName } from './sounds';
export { SOUND_NAMES } from './sounds';

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface PlayOptions {
  /** World position in metres. Without it the sound plays centred at full level. */
  position?: Vec3Like;
  /** Multiplies the sound's own level. */
  volume?: number;
  /** Playback rate, 1 = as rendered. */
  pitch?: number;
  /** Random pitch spread, e.g. 0.06. Each sound has a sensible default. */
  jitter?: number;
}

export interface LoopHandle {
  /** `gain` 0..1; `pitch` is RPM for engines (0.5..2.5) and speed for wind; a `position` makes it positional, `null` centres it again. */
  set(p: { gain?: number; pitch?: number; position?: Vec3Like | null }): void;
  /** The same as `set` without an object to build, for a caller that steers a loop many times a second. `position` left out keeps the last one. */
  steer(gain: number, pitch: number, position?: Vec3Like | null): void;
  stop(fadeSeconds?: number): void;
  readonly active: boolean;
}

export interface AudioStats {
  /** `locked` before unlock, `unavailable` if no context could be made, otherwise the context state. */
  state: string;
  ready: boolean;
  /** Play requests per sound since unlock, including ones that were culled or rate-limited. */
  played: Record<string, number>;
  /** Loops that are running with a gain above zero. */
  loops: string[];
  /** The track last asked for. */
  music: MusicTrack;
  /** Voices actually started per sound since unlock: what was left after culling, rate limits and the voice cap. */
  started: Record<string, number>;
  /** One-shots sounding now. */
  voices: number;
  /** Gain of the master, effects and music faders as the audio thread has them now. */
  levels: { master: number; sfx: number; music: number };
  /** Level of each loop as the audio thread has it now (the loudest, when several of a kind run). */
  loopLevels: Record<string, number>;
  /** The jukebox tune that is on, or an empty string. */
  jukebox: string;
  /** Level at the output over the last ~40 ms. */
  peak: number;
  rms: number;
}

/** Most one-shots sounding at once. Past this the weakest is dropped. */
const MAX_VOICES = 40;
/** The same sound asked for twice within this many seconds plays once. */
const RATE_LIMIT = 0.015;
const SPEED_OF_SOUND = 343;
/**
 * Share of a positional sound that skips the panner. Equal-power panning puts a source at 90 degrees in
 * one ear only, which is tiring on headphones; this keeps the far ear about 14 dB down instead of silent.
 */
const CENTRE_BLEED = 0.25;
/** How long `unlock` waits for a context that will not start without a user gesture. */
const RESUME_TIMEOUT_MS = 400;
/** Rendered before anything else: the sounds a menu needs the moment audio starts. Each takes under a millisecond. */
const FIRST_SOUNDS: readonly SoundName[] = ['ui_click', 'ui_hover', 'ui_back'];
/** Muffle filter cutoff when fully muffled, Hz. */
const MUFFLE_FLOOR = 350;
/** A loop that has been at zero level this long is unplugged until it is needed again, seconds. */
const PARK_AFTER = 0.5;
/**
 * Level after the limiter. The browser's compressor adds about 4.5 dB of make-up gain at the settings
 * used here, which roughly restores what the volume tapers take away; this leaves a little headroom on top.
 */
const OUTPUT_TRIM = 0.85;

interface Graph {
  ctx: AudioContext;
  master: GainNode;
  /** Sound effects enter here, through the muffle filter. */
  sfxIn: BiquadFilterNode;
  sfx: GainNode;
  /** Interface sounds: under the sfx volume, past the muffle filter. */
  ui: GainNode;
  music: GainNode;
  analyser: AnalyserNode;
  bank: BufferBank;
  player: Music;
  /** "Wide open" for a low-pass: 20 kHz, or less on a context running at a low sample rate. */
  top: number;
}

interface Voice {
  name: SoundName;
  src: AudioBufferSourceNode;
  gain: GainNode;
  /** The nodes that feed the bus: one, or two for a positional voice. */
  tails: AudioNode[];
  /** Loudness times priority, for stealing. */
  weight: number;
  start: number;
  end: number;
}

interface LoopState {
  name: LoopName;
  active: boolean;
  gain: number;
  pitch: number;
  position: Vec3Like | null;
  voice: LoopVoice | null;
  level: GainNode | null;
  panner: PannerNode | null;
  bleed: GainNode | null;
  /** Whether `level` currently feeds the panner. */
  panned: boolean;
  /** Unplugged from its level node, so its sources and filters are not processed at all. */
  parked: boolean;
  /** When the level last dropped to zero; negative while it is audible. */
  quietSince: number;
  /** The level last scheduled on the fader, so a loop that is holding steady schedules nothing. */
  sent: number;
}

/** A jukebox carries about as far as a horn does not: down the block, not across the city. */
const JUKEBOX_RANGE: readonly [number, number] = [5, 70];
const JUKEBOX_GAIN = 0.7;

/** The cafe jukebox: its own sequencer, panned and faded like any other thing in the world. */
interface Jukebox {
  player: Music;
  /** Fader: distance, and the fade when the tune's time is up. */
  level: GainNode;
  /** Walls and distance take the top end off. */
  tone: BiquadFilterNode;
  panner: PannerNode;
  bleed: GainNode;
  position: Vec3Like;
  title: string;
  /** Audio-clock time the tune stops at. */
  until: number;
  /** The distance its level was last set for. */
  heardAt: number;
}

/** Unity up to 0.7, then a smooth shoulder that never passes 1. Input is pre-scaled so the curve spans -2..2. */
function softClipCurve(): Float32Array<ArrayBuffer> {
  const n = 4097;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = ((i / (n - 1)) * 2 - 1) * 2;
    const a = Math.abs(x);
    curve[i] = Math.sign(x) * (a <= 0.7 ? a : 0.7 + 0.3 * Math.tanh((a - 0.7) / 0.3));
  }
  return curve;
}

/**
 * Moves a parameter to `value` over `seconds`. Ramps are used rather than `setTargetAtTime` because a
 * target curve only advances while its node is processing: set during silence, it would still be
 * sweeping when the next sound arrived.
 */
function glide(p: AudioParam, value: number, now: number, seconds: number, exponential = false): void {
  const from = p.value;
  p.cancelScheduledValues(now);
  p.setValueAtTime(from, now);
  if (exponential && from > 0 && value > 0) p.exponentialRampToValueAtTime(value, now + seconds);
  else p.linearRampToValueAtTime(value, now + seconds);
}

/** Slider position to gain: squared, so the bottom of the slider is usable. */
function taper(v: number): number {
  const c = clamp01(v);
  return c * c;
}

/**
 * All game audio. Every sound is synthesised: one-shots and loop beds are rendered into buffers (in a
 * worker) when the engine is unlocked, engines and wind are shaped live, and music is sequenced on the
 * audio clock.
 *
 * Nothing sounds before `unlock()`, and every call is safe without a working AudioContext. No call
 * synthesises on the main thread while the worker is alive: a one-shot asked for before its buffer has
 * arrived (the first second or so after `unlock()`) is skipped and moved to the front of the render queue.
 *
 * Bus layout: `sfx` (through the muffle filter) and `music` feed `master`, then a compressor and a
 * soft clipper, then the output. Interface sounds join `sfx` after the muffle filter.
 */
export class AudioEngine {
  private graph: Graph | null = null;
  private unlocked = false;
  private failed = false;
  private rendering: Promise<void> = Promise.resolve();
  private readonly unsubscribe: () => void;

  private voices: Voice[] = [];
  private readonly played: Record<string, number> = {};
  private readonly started: Record<string, number> = {};
  private juke: Jukebox | null = null;
  private readonly lastPlay = new Map<SoundName, number>();
  private readonly lastVariant = new Map<SoundName, number>();
  private loops: LoopState[] = [];
  private track: MusicTrack = 'none';
  private trackFade = 1.5;
  private muffle = 0;

  private lx = 0;
  private ly = 0;
  private lz = 0;
  /** Last usable right vector, for when the listener looks straight up or down. */
  private rx = 1;
  private rz = 0;
  private readonly scope = new Float32Array(2048);

  constructor(private readonly settings: Settings) {
    this.unsubscribe = settings.onChange((_data, key) => {
      if (key === 'masterVolume' || key === 'sfxVolume' || key === 'musicVolume') this.applySettings();
    });
  }

  /** The context is running: sound can be heard, though some buffers may still be on their way. */
  get running(): boolean {
    return this.graph !== null && this.graph.ctx.state === 'running';
  }

  /** The context is running and every buffer is rendered. */
  get ready(): boolean {
    const g = this.graph;
    return g !== null && g.ctx.state === 'running' && g.bank.done;
  }

  /**
   * Creates or resumes the AudioContext and renders the sound bank. Call from the first user gesture;
   * safe to call again. Resolves when the bank is rendered, or straight away if audio is unavailable.
   */
  unlock(): Promise<void> {
    this.unlocked = true;
    if (!this.graph && !this.failed) {
      try {
        this.graph = this.build();
        this.applySettings();
        this.setMuffle(this.muffle);
        this.graph.bank.prioritise(FIRST_SOUNDS);
        this.rendering = this.graph.bank.renderAll().catch((err: unknown) => console.warn('[audio] render failed:', err));
      } catch (err) {
        this.failed = true;
        console.warn('[audio] unavailable:', err);
      }
    }
    const g = this.graph;
    if (!g) return Promise.resolve();
    let resumed: Promise<unknown> = Promise.resolve();
    if (g.ctx.state === 'suspended') {
      // Without a gesture the browser leaves resume() pending for ever, so never wait on it alone.
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, RESUME_TIMEOUT_MS));
      resumed = Promise.race([g.ctx.resume().catch(() => undefined), timeout]);
    }
    // Loops and music asked for earlier start as soon as the context runs and their buffers land,
    // which is well before the whole bank is done.
    void resumed.then(() => this.startPending());
    return Promise.all([resumed, this.rendering]).then(() => this.startPending());
  }

  /** Re-reads the master, sfx and music volumes from the settings. Also runs by itself when they change. */
  applySettings(): void {
    const g = this.graph;
    if (!g) return;
    const now = g.ctx.currentTime;
    const d = this.settings.data;
    glide(g.master.gain, taper(d.masterVolume), now, 0.05);
    glide(g.sfx.gain, taper(d.sfxVolume), now, 0.05);
    glide(g.music.gain, taper(d.musicVolume), now, 0.05);
  }

  /** Listener position and facing, in world metres. Up is +Y. */
  setListener(px: number, py: number, pz: number, fx: number, fy: number, fz: number): void {
    this.lx = px;
    this.ly = py;
    this.lz = pz;
    const g = this.graph;
    if (!g) return;
    let len = Math.hypot(fx, fy, fz);
    if (!(len > 1e-6)) {
      fx = 0;
      fy = 0;
      fz = -1;
      len = 1;
    }
    fx /= len;
    fy /= len;
    fz /= len;
    // Right = forward x up. Looking straight up or down it vanishes, so keep the last good one.
    const rl = Math.hypot(fz, fx);
    if (rl > 1e-3) {
      this.rx = -fz / rl;
      this.rz = fx / rl;
    }
    const ux = -this.rz * fy;
    const uy = this.rz * fx - this.rx * fz;
    const uz = this.rx * fy;
    const l = g.ctx.listener;
    if (l.positionX) {
      l.positionX.value = px;
      l.positionY.value = py;
      l.positionZ.value = pz;
      l.forwardX.value = fx;
      l.forwardY.value = fy;
      l.forwardZ.value = fz;
      l.upX.value = ux;
      l.upY.value = uy;
      l.upZ.value = uz;
    } else {
      l.setPosition(px, py, pz);
      l.setOrientation(fx, fy, fz, ux, uy, uz);
    }
  }

  /**
   * Plays a one-shot. With `position` it is panned and fades with distance (each sound has its own
   * range: gunshots carry about 120 m, footsteps about 25 m). Does nothing before `unlock()`.
   */
  play(name: SoundName, opts: PlayOptions = {}): void {
    if (!this.unlocked) return;
    this.played[name] = (this.played[name] ?? 0) + 1;
    const g = this.graph;
    const def = SOUNDS[name];
    if (!g || !def || g.ctx.state !== 'running') return;
    const ctx = g.ctx;
    const now = ctx.currentTime;
    const last = this.lastPlay.get(name);
    if (last !== undefined && now - last < RATE_LIMIT) return;

    let level = def.gain * Math.max(0, opts.volume ?? 1);
    let dist = 0;
    const pos = opts.position;
    if (pos) {
      dist = Math.hypot(pos.x - this.lx, pos.y - this.ly, pos.z - this.lz);
      level *= this.attenuation(dist, def.range);
    }
    if (!(level > 0.0008)) return;
    if (!g.bank.has(name)) {
      // Still in the render queue. Synthesising it here could cost a frame or several (thunder takes over
      // 100 ms), so this one play is skipped and the sound is rendered next.
      g.bank.prioritise([name]);
      return;
    }
    const weight = level * def.priority;
    if (this.voices.length >= MAX_VOICES && !this.steal(weight, now)) return;
    this.lastPlay.set(name, now);

    const buffers = g.bank.get(name);
    let pick = 0;
    if (buffers.length > 1) {
      // Never the same variant twice running.
      const prev = this.lastVariant.get(name) ?? -1;
      pick = prev < 0 ? Math.floor(Math.random() * buffers.length) : (prev + 1 + Math.floor(Math.random() * (buffers.length - 1))) % buffers.length;
      this.lastVariant.set(name, pick);
    }
    const buffer = buffers[pick]!;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const jitter = opts.jitter ?? def.jitter;
    const rate = Math.max(0.05, (opts.pitch ?? 1) * (1 + (Math.random() * 2 - 1) * jitter));
    src.playbackRate.value = rate;
    const gain = ctx.createGain();
    gain.gain.value = level;
    const bus = def.bus === 'ui' ? g.ui : g.sfxIn;
    let tail: AudioNode = src.connect(gain);
    const tails: AudioNode[] = [];
    let when = now;
    if (pos) {
      if (dist > def.range[0] * 2) {
        // Air soaks up the top end over distance.
        const air = ctx.createBiquadFilter();
        air.type = 'lowpass';
        air.frequency.value = g.top * Math.exp((-2.2 * dist) / def.range[1]);
        tail = tail.connect(air);
      }
      const bleed = this.bleed(ctx);
      tail.connect(bleed).connect(bus);
      tails.push(bleed);
      tail = tail.connect(this.panner(ctx, pos));
      // Far shots arrive late, as they do.
      if (dist > 20) when = now + Math.min(dist / SPEED_OF_SOUND, 0.4);
    }
    tail.connect(bus);
    tails.push(tail);
    const voice: Voice = { name, src, gain, tails, weight, start: when, end: when + buffer.duration / rate };
    src.onended = () => this.dropVoice(voice);
    src.start(when);
    this.voices.push(voice);
    this.started[name] = (this.started[name] ?? 0) + 1;
  }

  /**
   * Starts a loop and returns its handle. It is silent until `set({ gain })`. A loop asked for before
   * `unlock()` starts as soon as audio is available.
   */
  loop(name: LoopName): LoopHandle {
    const st: LoopState = { name, active: true, gain: 0, pitch: 1, position: null, voice: null, level: null, panner: null, bleed: null, panned: false, parked: false, quietSince: -1, sent: -1 };
    this.loops.push(st);
    this.attachLoop(st);
    const place = (position: Vec3Like | null): void => {
      if (!position) st.position = null;
      else if (st.position) {
        st.position.x = position.x;
        st.position.y = position.y;
        st.position.z = position.z;
      } else st.position = { x: position.x, y: position.y, z: position.z };
    };
    return {
      set: (p) => {
        if (!st.active) return;
        if (p.gain !== undefined) st.gain = Math.max(0, p.gain);
        if (p.pitch !== undefined) st.pitch = p.pitch;
        if (p.position !== undefined) place(p.position);
        this.syncLoop(st);
      },
      steer: (gain, pitch, position) => {
        if (!st.active) return;
        st.gain = Math.max(0, gain);
        st.pitch = pitch;
        if (position !== undefined) place(position);
        this.syncLoop(st);
      },
      stop: (fadeSeconds = 0.3) => this.endLoop(st, fadeSeconds),
      get active() {
        return st.active;
      },
    };
  }

  /** Switches music, cross-fading over `fadeSeconds`. Asking for the current track again does nothing. */
  music(track: MusicTrack, fadeSeconds = 1.5): void {
    this.track = track;
    this.trackFade = fadeSeconds;
    this.startMusic();
  }

  /**
   * Starts a jukebox tune at a place in the world, for `seconds`. The tune is made from its title, so each
   * title is its own song. It is part of the world: panned, fading with distance, under the effects volume
   * and the muffle filter. One jukebox plays at a time; a new one takes over. Does nothing before `unlock()`.
   */
  jukebox(title: string, position: Vec3Like, seconds: number): void {
    const g = this.graph;
    if (!this.unlocked || !g || g.ctx.state !== 'running') return;
    if (!KIT_KEYS.every((key) => g.bank.has(key))) {
      // The drums are still being rendered: nothing to play the tune with yet.
      g.bank.prioritise(KIT_KEYS);
      return;
    }
    const ctx = g.ctx;
    const now = ctx.currentTime;
    let j = this.juke;
    if (!j) {
      const level = ctx.createGain();
      level.gain.value = 0;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = g.top;
      tone.Q.value = 0.5;
      const panner = this.panner(ctx, position);
      const bleed = this.bleed(ctx);
      level.connect(tone);
      tone.connect(panner).connect(g.sfxIn);
      tone.connect(bleed).connect(g.sfxIn);
      j = { player: new Music(ctx, level, g.bank), level, tone, panner, bleed, position: { x: 0, y: 0, z: 0 }, title: '', until: 0, heardAt: -1 };
      this.juke = j;
    }
    j.position.x = position.x;
    j.position.y = position.y;
    j.position.z = position.z;
    this.place(j.panner, j.position);
    j.title = title;
    j.until = now + Math.max(1, seconds);
    j.player.playTune(title, 0.4);
    j.heardAt = -1;
    this.tuneJukebox(j, now, 0.02);
  }

  /** Fades the jukebox out. */
  stopJukebox(fadeSeconds = 1.5): void {
    const j = this.juke;
    if (!j || j.title === '') return;
    j.title = '';
    j.player.stop(fadeSeconds);
  }

  /**
   * Stops the audio clock: for a hidden tab, so nothing drones on unheard. `unlock()` starts it again.
   * Does nothing before the first `unlock()`.
   */
  suspend(): void {
    const g = this.graph;
    if (g && g.ctx.state === 'running') void g.ctx.suspend().catch(() => undefined);
  }

  /** 0..1 low-pass over the sound effects and loops: under water, or deep in the storm. Interface sounds stay clear. */
  setMuffle(amount: number): void {
    this.muffle = clamp01(amount);
    const g = this.graph;
    if (!g) return;
    // Wide open when clear, down to 350 Hz.
    glide(g.sfxIn.frequency, g.top * Math.pow(MUFFLE_FLOOR / g.top, this.muffle), g.ctx.currentTime, 0.25, true);
  }

  /** Stops every one-shot. Loops and music carry on. */
  stopAll(fadeSeconds = 0.05): void {
    const g = this.graph;
    if (!g) return;
    const now = g.ctx.currentTime;
    for (const v of this.voices) this.silence(v, now, fadeSeconds);
    this.voices = [];
  }

  /** Per frame: music sequencing, loop distance, voice clean-up. */
  update(_dt: number): void {
    const g = this.graph;
    if (!g || g.ctx.state !== 'running') return;
    const now = g.ctx.currentTime;
    this.startMusic();
    g.player.update();
    const j = this.juke;
    if (j) {
      if (j.title !== '') {
        if (now >= j.until) this.stopJukebox();
        else this.tuneJukebox(j, now, 0.08);
      }
      j.player.update();
    }
    for (let i = this.voices.length - 1; i >= 0; i--) {
      const v = this.voices[i]!;
      if (now > v.end + 0.3) this.dropVoice(v);
    }
    for (const st of this.loops) {
      if (!st.level || !st.voice) {
        this.attachLoop(st);
        continue;
      }
      const level = this.loopLevel(st);
      this.parkLoop(st, level, now);
      if (st.position && !st.parked && Math.abs(level - st.sent) > 0.0005) {
        st.sent = level;
        st.level.gain.setTargetAtTime(level, now, 0.05);
      }
      st.voice.tick?.(now, level > 0.01);
    }
  }

  /** What the engine is doing, for tests and the debug overlay. */
  stats(): AudioStats {
    const g = this.graph;
    let peak = 0;
    let rms = 0;
    if (g && g.ctx.state === 'running') {
      const data = this.scope;
      g.analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i]!;
        sum += v * v;
        if (Math.abs(v) > peak) peak = Math.abs(v);
      }
      rms = Math.sqrt(sum / data.length);
    }
    return {
      state: g ? g.ctx.state : this.failed ? 'unavailable' : 'locked',
      ready: this.ready,
      played: { ...this.played },
      started: { ...this.started },
      loops: this.loops.filter((l) => l.active && l.gain > 0).map((l) => l.name),
      music: this.track,
      voices: this.voices.length,
      levels: { master: g?.master.gain.value ?? 0, sfx: g?.sfx.gain.value ?? 0, music: g?.music.gain.value ?? 0 },
      loopLevels: this.loopLevels(),
      jukebox: this.juke?.title ?? '',
      peak,
      rms,
    };
  }

  /** Stops everything and closes the context. The engine cannot be used afterwards. */
  dispose(): void {
    this.unsubscribe();
    // endLoop replaces the array rather than editing it, so iterating the old one is safe.
    for (const st of this.loops) this.endLoop(st, 0);
    this.stopAll(0);
    const g = this.graph;
    this.graph = null;
    this.failed = true;
    if (g) {
      g.player.dispose();
      this.juke?.player.dispose();
      this.juke = null;
      g.bank.dispose();
      g.master.disconnect();
      void g.ctx.close().catch(() => undefined);
    }
  }

  // ---- internals ----

  private build(): Graph {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error('no AudioContext');
    const ctx = new Ctor({ latencyHint: 'interactive' });
    const master = ctx.createGain();
    // Limiter: fast, steep, a few dB under full scale.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 10;
    comp.ratio.value = 14;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;
    // Whatever still gets past is rounded off instead of clipping.
    const trim = ctx.createGain();
    trim.gain.value = 0.5 * OUTPUT_TRIM;
    const clip = ctx.createWaveShaper();
    clip.curve = softClipCurve();
    clip.oversample = '2x';
    const analyser = ctx.createAnalyser();
    analyser.fftSize = this.scope.length;
    analyser.smoothingTimeConstant = 0;
    const sfx = ctx.createGain();
    const music = ctx.createGain();
    const ui = ctx.createGain();
    // A context can run well below 44.1 kHz (some headsets force 16 or 24 kHz); filters must stay under its Nyquist.
    const top = Math.min(20000, ctx.sampleRate * 0.45);
    const sfxIn = ctx.createBiquadFilter();
    sfxIn.type = 'lowpass';
    sfxIn.frequency.value = top;
    sfxIn.Q.value = 0.5;
    sfxIn.connect(sfx);
    ui.connect(sfx);
    sfx.connect(master);
    music.connect(master);
    master.connect(comp).connect(trim).connect(clip).connect(ctx.destination);
    clip.connect(analyser);
    const bank = new BufferBank(ctx, RECIPES, () => this.startPending());
    const player = new Music(ctx, music, bank);
    return { ctx, master, sfxIn, sfx, ui, music, analyser, bank, player, top };
  }

  /**
   * Starts whatever has been asked for and can now run: loops whose beds are rendered, and the music. Loops
   * that were adjusted while the context was not running get their values now.
   */
  private startPending(): void {
    for (const st of this.loops) {
      if (st.level) this.syncLoop(st);
      else this.attachLoop(st);
    }
    this.startMusic();
  }

  /** Hands the wanted track to the sequencer once the context runs and the drum kit is rendered. */
  private startMusic(): void {
    const g = this.graph;
    if (!g || g.ctx.state !== 'running' || g.player.current === this.track) return;
    if (this.track !== 'none' && !KIT_KEYS.every((key) => g.bank.has(key))) {
      g.bank.prioritise(KIT_KEYS);
      return;
    }
    g.player.play(this.track, this.trackFade);
  }

  /** 1 inside `near`, inverse-distance beyond it, eased to nothing at `far`. */
  private attenuation(dist: number, range: readonly [number, number]): number {
    const [near, far] = range;
    if (dist >= far) return 0;
    if (dist <= near) return 1;
    return (near / dist) * (1 - smoothstep(far * 0.55, far, dist));
  }

  private panner(ctx: AudioContext, pos: Vec3Like): PannerNode {
    const p = ctx.createPanner();
    // Equal-power panning is far cheaper than HRTF with dozens of voices. Distance is handled by `attenuation`.
    p.panningModel = 'equalpower';
    // Pan a mono fold-down: a stereo buffer panned as stereo gets louder as it moves to one side.
    p.channelCount = 1;
    p.channelCountMode = 'explicit';
    p.distanceModel = 'linear';
    p.rolloffFactor = 0;
    this.place(p, pos);
    return p;
  }

  /** The unpanned share of a positional sound, mono like the panned part. */
  private bleed(ctx: AudioContext): GainNode {
    const b = ctx.createGain();
    b.gain.value = CENTRE_BLEED;
    b.channelCount = 1;
    b.channelCountMode = 'explicit';
    return b;
  }

  private place(p: PannerNode, pos: Vec3Like): void {
    if (p.positionX) {
      p.positionX.value = pos.x;
      p.positionY.value = pos.y;
      p.positionZ.value = pos.z;
    } else p.setPosition(pos.x, pos.y, pos.z);
  }

  /** Makes room for a new voice by dropping the weakest, unless the new one is weaker still. */
  private steal(weight: number, now: number): boolean {
    let victim = -1;
    let lowest = Infinity;
    for (let i = 0; i < this.voices.length; i++) {
      const v = this.voices[i]!;
      // A voice counts for less as it plays out, so of two equals the older goes first.
      const left = clamp01(1 - (now - v.start) / Math.max(0.01, v.end - v.start));
      const w = v.weight * (0.1 + 0.9 * left);
      if (w < lowest) {
        lowest = w;
        victim = i;
      }
    }
    if (victim < 0 || lowest > weight) return false;
    this.silence(this.voices[victim]!, now, 0.03);
    this.voices.splice(victim, 1);
    return true;
  }

  private silence(v: Voice, now: number, fade: number): void {
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setTargetAtTime(0, now, Math.max(0.001, fade / 4));
    try {
      v.src.stop(now + fade + 0.01);
    } catch {
      // Already stopped.
    }
  }

  private dropVoice(v: Voice): void {
    for (const t of v.tails) t.disconnect();
    const i = this.voices.indexOf(v);
    if (i >= 0) this.voices.splice(i, 1);
  }

  /** Distance sets the jukebox's level and how much of its top end arrives. */
  private tuneJukebox(j: Jukebox, now: number, glideTime: number): void {
    const g = this.graph;
    if (!g) return;
    const dist = Math.hypot(j.position.x - this.lx, j.position.y - this.ly, j.position.z - this.lz);
    if (Math.abs(dist - j.heardAt) < 0.05) return;
    j.heardAt = dist;
    j.level.gain.setTargetAtTime(JUKEBOX_GAIN * this.attenuation(dist, JUKEBOX_RANGE), now, glideTime);
    j.tone.frequency.setTargetAtTime(Math.max(500, g.top * Math.exp((-3 * dist) / JUKEBOX_RANGE[1])), now, glideTime);
  }

  private loopLevels(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const st of this.loops) {
      // A parked loop is unplugged: whatever its fader says, nothing of it is heard.
      const level = st.level && !st.parked ? st.level.gain.value : 0;
      out[st.name] = Math.max(out[st.name] ?? 0, level);
    }
    return out;
  }

  private loopLevel(st: LoopState): number {
    const def = LOOPS[st.name];
    let level = st.gain * def.gain;
    if (st.position) level *= this.attenuation(Math.hypot(st.position.x - this.lx, st.position.y - this.ly, st.position.z - this.lz), def.range);
    return level;
  }

  /** Builds the loop's live graph once the context and its buffers exist. */
  private attachLoop(st: LoopState): void {
    const g = this.graph;
    if (!g || !st.active || st.level) return;
    const def = LOOPS[st.name];
    if (!def.beds.every((key) => g.bank.has(key))) {
      // Still rendering in the background: ask for these next, and try again when they land.
      g.bank.prioritise(def.beds);
      return;
    }
    st.voice = def.build(g.ctx, g.bank);
    st.level = g.ctx.createGain();
    st.level.gain.value = 0;
    st.voice.out.connect(st.level);
    st.level.connect(g.sfxIn);
    this.syncLoop(st);
  }

  /**
   * Pushes a loop's gain, pitch and position into its graph. Automation is only scheduled on nodes that are
   * being processed: on a suspended context or an unplugged loop it would pile up unplayed, one event per
   * call, for as long as the game kept steering the loop. The wanted values are kept and applied later.
   */
  private syncLoop(st: LoopState): void {
    const g = this.graph;
    if (!g || !st.level || !st.voice || g.ctx.state !== 'running') return;
    const now = g.ctx.currentTime;
    const wantPanned = st.position !== null;
    if (wantPanned !== st.panned) {
      st.level.disconnect();
      if (wantPanned) {
        st.panner ??= this.panner(g.ctx, st.position!);
        st.bleed ??= this.bleed(g.ctx);
        st.level.connect(st.panner).connect(g.sfxIn);
        st.level.connect(st.bleed).connect(g.sfxIn);
      } else {
        st.panner?.disconnect();
        st.bleed?.disconnect();
        st.level.connect(g.sfxIn);
      }
      st.panned = wantPanned;
    }
    if (st.position && st.panner) this.place(st.panner, st.position);
    const level = this.loopLevel(st);
    this.parkLoop(st, level, now);
    if (st.parked) return;
    st.sent = level;
    st.level.gain.setTargetAtTime(level, now, 0.05);
    st.voice.setPitch(st.pitch, now);
  }

  /**
   * Unplugs a loop that has faded to nothing and plugs it back in the moment it is wanted. A looping source
   * costs the audio thread the same at gain 0 as at gain 1, and a match keeps a loop per vehicle, most of
   * them parked or out of earshot.
   */
  private parkLoop(st: LoopState, level: number, now: number): void {
    if (!st.level || !st.voice) return;
    if (level > 0) {
      st.quietSince = -1;
      if (st.parked) {
        st.voice.out.connect(st.level);
        st.parked = false;
        // Whatever the pitch became while nothing was listening.
        st.voice.setPitch(st.pitch, now);
      }
    } else if (!st.parked) {
      if (st.quietSince < 0) st.quietSince = now;
      else if (now - st.quietSince > PARK_AFTER) {
        st.voice.out.disconnect();
        st.parked = true;
      }
    }
  }

  private endLoop(st: LoopState, fade: number): void {
    if (!st.active) return;
    st.active = false;
    this.loops = this.loops.filter((l) => l !== st);
    const g = this.graph;
    const { level, voice, panner, bleed } = st;
    if (!g || !level || !voice) return;
    const now = g.ctx.currentTime;
    const f = Math.max(0.005, fade);
    level.gain.cancelScheduledValues(now);
    level.gain.setTargetAtTime(0, now, f / 4);
    voice.stop(now + f + 0.05);
    setTimeout(
      () => {
        level.disconnect();
        panner?.disconnect();
        bleed?.disconnect();
      },
      (f + 0.2) * 1000,
    );
  }
}
