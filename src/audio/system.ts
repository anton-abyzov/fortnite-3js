import { Vector3 } from 'three';
import type { Character } from '../character/character';
import { clamp, clamp01, damp, smoothstep } from '../core/math';
import type { Game } from '../game';
import type { Surface } from '../physics/physics';
import type { Vehicle } from '../vehicles/vehicle';
import { Cell } from '../world/field';
import { AudioEngine, type LoopHandle, type LoopName, type MusicTrack, type PlayOptions, type SoundName, type Vec3Like } from './audio';
import { LOOPS } from './loops';
import { SOUNDS } from './sounds';

/** Names the game uses for sounds the engine knows by another name. */
const ALIASES: Record<string, SoundName> = {
  chute_open: 'parachute_open',
  zone_warning: 'zone_warn',
};

/** Names that are not one-shots at all: the end of a round is a piece of music. */
const STINGS: Record<string, MusicTrack> = {
  win: 'victory',
  lose: 'defeat',
};

const STEPS: Record<Surface, SoundName> = {
  asphalt: 'step_concrete',
  concrete: 'step_concrete',
  tile: 'step_concrete',
  glass: 'step_concrete',
  flesh: 'step_concrete',
  sand: 'step_sand',
  grass: 'step_grass',
  wood: 'step_wood',
  metal: 'step_metal',
  water: 'step_water',
};

/** Events that count as the player's first gesture. Browsers start audio only from one of these. */
const GESTURES = ['pointerdown', 'mousedown', 'keydown', 'touchend'] as const;

/** Ambience, engines and music are worked out this often, seconds. The listener moves every frame. */
const TICK = 0.05;
/** Frames closer together than this are a fast-forward, not a display: the audio skips them. */
const MIN_FRAME_MS = 3;
/** The slower jobs (who is in earshot, how near the sea is) run once in this many ticks. */
const SCAN_EVERY = 4;
/** How long a jukebox plays for a coin, seconds. */
const JUKEBOX_SECONDS = 48;
/** Inside this distance of a playing jukebox the background music makes way for it, metres. */
const JUKEBOX_DUCK = 45;
/** A sound made this close to the player is the player's own doing, metres. */
const OWN_REACH = 2.5;
/** Engine loops kept for cars and for boats: the nearest running ones get them. */
const CAR_VOICES = 5;
const BOAT_VOICES = 3;
/** A loop that has just let one vehicle go fades out before it takes another, seconds. */
const VOICE_REST = 0.3;

/** Where the sea is looked for around the listener: eight ways, at these distances in metres. */
const RINGS = [0, 8, 16, 26, 38, 52, 70, 92, 118, 150, 190] as const;
const WAYS = 8;
const WAY_X = new Float32Array(WAYS);
const WAY_Z = new Float32Array(WAYS);
for (let i = 0; i < WAYS; i++) {
  WAY_X[i] = Math.cos((i / WAYS) * Math.PI * 2);
  WAY_Z[i] = Math.sin((i / WAYS) * Math.PI * 2);
}

const _dir = new Vector3();

/** What the audio reads off a vehicle. Cars and boats both keep `rpm` (0..1) for the engine sound. */
interface Revving {
  rpm?: number;
  /** Cars: slip angle of the rear tyres, radians. */
  slip?: number;
  /** Cars: 'traffic' while the car is carried along a lane. */
  mode?: string;
}

function revs(v: Vehicle): number {
  const rpm = (v as Vehicle & Revving).rpm;
  return typeof rpm === 'number' && !v.destroyed ? rpm : 0;
}

/** How hard a car's tyres are sliding, 0..1. Lane-following traffic never slides. */
function skidOf(v: Vehicle): number {
  const car = v as Vehicle & Revving;
  if (car.mode !== 'dynamic') return 0;
  const speed = Math.abs(v.speed);
  const slide = smoothstep(0.16, 0.5, Math.abs(car.slip ?? 0)) * smoothstep(3, 9, speed);
  return v.controls.handbrake && speed > 4 ? Math.max(slide, 0.55) : slide;
}

/** A loop the game steers. It remembers what it last sent, so the audio thread only hears of changes. */
class Bed {
  gain = 0;
  pitch = 1;
  private sentGain = 0;
  private sentPitch = 1;

  constructor(readonly loop: LoopHandle) {}

  /** Ease toward a level and a pitch. With a `position` the loop is placed there. */
  move(gain: number, pitch: number, rate: number, dt: number, position?: Vec3Like): void {
    this.gain = damp(this.gain, gain, rate, dt);
    if (gain === 0 && this.gain < 0.004) this.gain = 0;
    this.pitch = damp(this.pitch, pitch, rate * 2, dt);
    const silent = this.gain === 0;
    if (silent && this.sentGain === 0) return;
    // A source that moves is placed afresh each time; one that stays put is only told of a real change.
    if (!position && !silent && Math.abs(this.gain - this.sentGain) < 0.004 && Math.abs(this.pitch - this.sentPitch) < 0.008) return;
    this.sentGain = this.gain;
    this.sentPitch = this.pitch;
    this.loop.steer(this.gain, this.pitch, position);
  }

  /** Silence at once (the engine still fades it over a few hundredths of a second). */
  cut(): void {
    this.gain = 0;
    if (this.sentGain === 0) return;
    this.sentGain = 0;
    this.loop.steer(0, this.pitch);
  }
}

/** One engine loop and the vehicle it is sounding for. */
interface EngineVoice {
  bed: Bed;
  vehicle: Vehicle | null;
  /** Seconds until it may take another vehicle. */
  rest: number;
}

interface Fleet {
  voices: EngineVoice[];
  /** Beyond this the engine cannot be heard, metres squared. */
  reach2: number;
}

/**
 * The game's side of the sound: turns what happens in the world into calls on the `AudioEngine`.
 *
 * One-shots come in through `play` (which is what `game.sound` calls). Everything continuous is worked out
 * here from the state of the game, twenty times a second: the ambience under the camera, an engine loop for
 * each running vehicle in earshot, and which music fits the moment.
 *
 * Nothing sounds until the player's first click or key press, because browsers do not allow it; until then
 * every call is safe and is simply dropped.
 */
export class GameAudio {
  readonly engine: AudioEngine;
  /** A first gesture has been seen and the engine asked to start. */
  unlocked = false;
  private listening = true;
  private readonly opts: PlayOptions = {};
  private readonly unknown = new Set<string>();
  private lx = 0;
  private ly = 0;
  private lz = 0;
  private lastTick = 0;
  private lastFrame = 0;
  private ticks = 0;

  private readonly wind: Bed;
  private readonly ocean: Bed;
  private readonly city: Bed;
  private readonly storm: Bed;
  private readonly rain: Bed;
  private readonly plane: Bed;
  private readonly skids: Bed[];
  private readonly cars: Fleet;
  private readonly boats: Fleet;
  /** How near and how open the sea is, 0..1. */
  private sea = 0;
  private muffle = 0;
  private thunderIn = 8;
  private doorWasOpen = false;

  private track: MusicTrack = 'none';
  /** The end-of-round music, once it has been called for, until the next round starts. */
  private sting: MusicTrack | null = null;
  private stormMusic = false;
  private outsideFor = 0;
  private insideFor = 0;
  private jukeLeft = 0;
  private readonly jukeAt = { x: 0, y: 0, z: 0 };

  /** Characters whose footsteps, jumps and splashes are already wired. */
  private hooked = 0;
  private strokes = new Uint8Array(64);

  constructor(private readonly game: Game) {
    const engine = new AudioEngine(game.settings);
    this.engine = engine;
    const bed = (name: LoopName): Bed => new Bed(engine.loop(name));
    this.wind = bed('wind');
    this.ocean = bed('ocean');
    this.city = bed('city');
    this.storm = bed('storm');
    this.rain = bed('rain');
    this.plane = bed('plane_engine');
    this.skids = [bed('skid'), bed('skid')];
    const fleet = (name: LoopName, count: number): Fleet => {
      const voices: EngineVoice[] = [];
      for (let i = 0; i < count; i++) voices.push({ bed: bed(name), vehicle: null, rest: 0 });
      const reach = LOOPS[name].range[1] * 0.95;
      return { voices, reach2: reach * reach };
    };
    this.cars = fleet('car_engine', CAR_VOICES);
    this.boats = fleet('boat_engine', BOAT_VOICES);

    for (const type of GESTURES) window.addEventListener(type, this.onGesture, { capture: true, passive: true });
    document.addEventListener('click', this.onClick, true);
    document.addEventListener('visibilitychange', this.onVisibility);

    game.events.on('phase', (phase) => {
      // A new round, or back at the title: the last round's ending is over.
      if (phase === 'match' || phase === 'menu') this.sting = null;
      if (phase === 'menu') {
        this.jukeLeft = 0;
        engine.stopJukebox(0.5);
      }
      this.direct();
    });
    game.events.on('kill', ({ victim }) => {
      // Out of the round while it goes on without them: the player hears how it ended for them now.
      if (victim === game.player && game.match.running) this.sting = 'defeat';
      this.direct();
    });
    game.events.on('jukebox', (e) => {
      this.jukeAt.x = e.x;
      this.jukeAt.y = e.y;
      this.jukeAt.z = e.z;
      this.jukeLeft = JUKEBOX_SECONDS;
      engine.jukebox(e.track, this.jukeAt, JUKEBOX_SECONDS);
      this.direct();
    });
    game.debugExt['audio'] = () => this.snapshot();
    this.direct();
  }

  /**
   * Play a one-shot: at a point in the world when `position` is given, flat (an interface sound, or
   * something in the player's own head) when not. Unknown names are ignored. Safe at any time.
   */
  play(name: string, position?: Vec3Like, volume = 1): void {
    const sting = STINGS[name];
    if (sting) {
      this.sting = sting;
      this.direct();
      return;
    }
    let id = ALIASES[name] ?? name;
    // Thunder at a place is something blowing up there, and is heard only as far as a blast carries.
    if (id === 'thunder' && position) id = 'explosion';
    const def = SOUNDS[id as SoundName];
    if (!def) {
      if (!this.unknown.has(name)) {
        this.unknown.add(name);
        console.warn(`[audio] no sound called "${name}"`);
      }
      return;
    }
    if (position) {
      // Out of earshot: not worth the engine's time.
      const d2 = this.away2(position);
      const far = def.range[1];
      if (d2 >= far * far) return;
      // What the player does themselves is heard from where they stand, not from the camera behind
      // them: the camera's distance is taken back out of a sound made within arm's reach of the player.
      const me = this.game.player?.position;
      const near = def.range[0];
      if (me && d2 > near * near) {
        const mx = position.x - me.x;
        const my = position.y - me.y;
        const mz = position.z - me.z;
        if (mx * mx + my * my + mz * mz < OWN_REACH * OWN_REACH) volume *= Math.min(Math.sqrt(d2) / near, 4);
      }
    }
    const o = this.opts;
    o.position = position;
    o.volume = volume;
    this.engine.play(id as SoundName, o);
  }

  /** Once per rendered frame, in the menu as well as in a round. */
  frame(dt: number): void {
    // By the wall clock, not game time: a paused or fast-forwarded game still sounds like now. A game
    // run forward without drawing calls this thousands of times in one instant, and once is enough.
    const now = performance.now();
    if (now - this.lastFrame < MIN_FRAME_MS) return;
    this.lastFrame = now;
    const cam = this.game.engine.camera;
    const p = cam.position;
    cam.getWorldDirection(_dir);
    this.lx = p.x;
    this.ly = p.y;
    this.lz = p.z;
    this.engine.setListener(p.x, p.y, p.z, _dir.x, _dir.y, _dir.z);
    const elapsed = (now - this.lastTick) / 1000;
    if (elapsed >= TICK) {
      this.lastTick = now;
      this.tick(Math.min(elapsed, 0.25));
    }
    this.engine.update(dt);
  }

  /** What the audio is doing, for tests and the debug overlay: the engine's own numbers and the game's side. */
  snapshot(): Record<string, unknown> {
    const engines = (f: Fleet): number => f.voices.reduce((n, v) => n + (v.vehicle ? 1 : 0), 0);
    return {
      ...this.engine.stats(),
      unlocked: this.unlocked,
      unknown: [...this.unknown],
      track: this.track,
      sting: this.sting,
      ambience: { wind: this.wind.gain, ocean: this.ocean.gain, city: this.city.gain, storm: this.storm.gain, rain: this.rain.gain, plane: this.plane.gain, sea: this.sea, muffle: this.muffle },
      engines: { cars: engines(this.cars), boats: engines(this.boats), skid: Math.max(this.skids[0]!.gain, this.skids[1]!.gain) },
      jukeboxLeft: this.jukeLeft,
    };
  }

  dispose(): void {
    this.stopListening();
    document.removeEventListener('click', this.onClick, true);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.engine.dispose();
  }

  // ---- starting ----

  private readonly onGesture = (): void => {
    this.unlocked = true;
    void this.engine.unlock();
    // A gesture the browser does not count (Escape, a modifier key) leaves the context waiting, so the
    // listeners stay until one has worked.
    if (this.engine.running) this.stopListening();
  };

  private stopListening(): void {
    if (!this.listening) return;
    this.listening = false;
    for (const type of GESTURES) window.removeEventListener(type, this.onGesture, { capture: true });
  }

  /** Buttons and sliders anywhere on the page click. Whoever also asks for the click is not doubled. */
  private readonly onClick = (e: MouseEvent): void => {
    const target = e.target;
    if (target instanceof Element && target.closest('button, input, select, [role="button"]')) this.play('ui_click');
  };

  private readonly onVisibility = (): void => {
    if (!this.unlocked) return;
    if (document.hidden) this.engine.suspend();
    else void this.engine.unlock();
  };

  // ---- people ----

  private readonly onStep = (c: Character, _side: number, speed: number, surface: Surface): void => {
    const level = clamp(0.35 + speed * 0.09, 0.35, 1) * (c.motor.crouched ? 0.45 : 1);
    this.play(STEPS[surface] ?? 'step_concrete', c.position, c.isPlayer ? level * 0.85 : level);
  };

  private readonly onLanded = (c: Character, impact: number): void => {
    this.play('land', c.position, clamp(impact / 9, 0.3, 1));
  };

  private readonly onJumped = (c: Character): void => {
    this.play('jump', c.position, 0.8);
  };

  private readonly onSplash = (c: Character, strength: number): void => {
    this.play('splash', c.position, strength);
  };

  /** Wire the feet of anyone who has joined since last time, and give swimmers their strokes. */
  private people(): void {
    const all = this.game.characters;
    for (; this.hooked < all.length; this.hooked++) {
      const e = all[this.hooked]!.events;
      e.footstep ??= this.onStep;
      e.landed ??= this.onLanded;
      e.jumped ??= this.onJumped;
      e.splash ??= this.onSplash;
    }
    if (this.strokes.length < all.length) this.strokes = new Uint8Array(all.length * 2);
    for (let i = 0; i < all.length; i++) {
      const c = all[i]!;
      // Each arm comes over once per cycle of the stroke.
      const half = c.anim.phase >= 0.5 ? 1 : 0;
      if (half === this.strokes[i]) continue;
      this.strokes[i] = half;
      if (c.alive && c.state === 'normal' && c.motor.swimming && c.motor.speed > 0.5) this.play('swim_stroke', c.position, 0.8);
    }
  }

  // ---- the tick ----

  private tick(dt: number): void {
    const game = this.game;
    const playing = game.phase === 'match' || game.phase === 'ended';
    const scan = this.ticks++ % SCAN_EVERY === 0;
    if (this.unlocked && this.listening && this.engine.running) this.stopListening();
    if (this.jukeLeft > 0) this.jukeLeft = Math.max(0, this.jukeLeft - dt);
    this.direct(dt);
    if (playing) this.people();
    this.ambience(dt, playing, scan);
    this.fleet(this.cars, dt, playing, scan);
    this.fleet(this.boats, dt, playing, scan);
    this.slides(dt);
  }

  /** Which music fits the moment. Runs on every tick and whenever something changes. */
  private direct(dt = 0): void {
    const game = this.game;
    const playing = game.phase === 'match' || game.phase === 'ended';
    // Caught in the storm for a couple of seconds, the music turns; a few seconds back in the calm, it settles.
    const outside = playing && game.zone ? game.zone.playerOutside : 0;
    this.outsideFor = outside > 0.5 ? this.outsideFor + dt : 0;
    this.insideFor = outside < 0.1 ? this.insideFor + dt : 0;
    if (this.outsideFor > 2) this.stormMusic = true;
    else if (this.insideFor > 4 || !playing) this.stormMusic = false;

    let track: MusicTrack;
    let fade = 2;
    if (!playing) track = 'menu';
    else if (this.sting) {
      track = this.sting;
      fade = 0.3;
    } else if (this.jukeLeft > 0 && Math.hypot(this.jukeAt.x - this.lx, this.jukeAt.y - this.ly, this.jukeAt.z - this.lz) < JUKEBOX_DUCK) {
      // The cafe's own music has the floor.
      track = 'none';
      fade = 1;
    } else if (this.stormMusic) {
      track = 'storm';
      fade = 1.2;
    } else track = 'match';
    if (track === this.track) return;
    this.track = track;
    this.engine.music(track, fade);
  }

  private ambience(dt: number, playing: boolean, scan: boolean): void {
    const game = this.game;
    const field = game.world.field;
    const x = this.lx;
    const y = this.ly;
    const z = this.lz;
    if (scan) this.sea = this.probeSea(x, z);

    if (!playing) {
      // The title: the bay, faintly, under the music.
      this.ocean.move(0.3, 1, 1.5, dt);
      this.wind.move(0.06, 0.8, 1.5, dt);
      this.city.move(0, 1, 3, dt);
      this.storm.move(0, 1, 3, dt);
      this.rain.move(0, 1, 3, dt);
      this.plane.move(0, 1, 6, dt);
      this.setMuffle(0);
      return;
    }

    const player = game.player;
    const zone = game.zone;
    // Height above the street, the roof or the sea below.
    const above = Math.max(0, y - Math.max(0, field.heightAt(x, z)));
    const outside = zone.playerOutside;
    const water = game.env.waterHeight(x, z);
    const under = y < water - 0.05;

    // How fast the air goes past: falling, gliding, driving.
    let speed = 0;
    if (player) {
      // Behind glass, or behind a windscreen at least.
      if (player.vehicle) speed = Math.abs(player.vehicle.speed) * 0.7;
      else if (player.state !== 'plane') speed = player.motor.velocity.length();
    }
    const windGain = clamp01(0.08 + 0.45 * smoothstep(20, 300, above) + 0.9 * smoothstep(5, 55, speed) + 0.5 * outside);
    this.wind.move(under ? 0 : windGain, clamp(0.5 + speed / 28 + 0.8 * outside, 0.4, 2.8), 3, dt);

    // The sea: loud at the water's edge, gone a few streets inland and from high up.
    const seaGain = smoothstep(0.02, 0.75, this.sea) * (1 - 0.85 * smoothstep(40, 300, above));
    this.ocean.move(seaGain, 1, 1.6, dt);

    // The city: in the streets, less on the sand, hardly at all on the water or in the storm.
    const cell = field.typeAt(x, z);
    const ground = cell === Cell.Water || cell === Cell.Pool ? 0.15 : cell === Cell.Sand || cell === Cell.Pier ? 0.45 : 1;
    const cityGain = under ? 0 : ground * (1 - smoothstep(25, 180, above)) * (1 - 0.7 * outside);
    this.city.move(cityGain, 1, 1.6, dt);

    // The wall of the storm: heard coming, and all around once inside it.
    const near = zone.stage === 'idle' ? 0 : 0.3 * (1 - smoothstep(0, 140, zone.toWall(x, z)));
    this.storm.move(Math.max(near, outside), 1 + 0.25 * outside, 2.5, dt);
    this.rain.move(under ? 0 : outside * 0.9, 1, 2.5, dt);

    // The seaplane, aboard it and as it goes over.
    const drop = game.drop;
    if (drop.flying) this.plane.move(1, 1.05, 6, dt, drop.plane.position);
    else this.plane.move(0, 1, 6, dt);
    // "Go": the doors open with the player still aboard.
    const door = drop.flying && drop.doorOpen && player?.state === 'plane';
    if (door && !this.doorWasOpen) this.play('jump_cue');
    this.doorWasOpen = door;

    // Thunder rolls now and then, in the storm and close to it.
    const rumble = Math.max(near * 1.5, outside);
    if (rumble > 0.15) {
      this.thunderIn -= dt;
      if (this.thunderIn <= 0) {
        this.thunderIn = 6 + Math.random() * 14;
        this.play('thunder', undefined, (0.2 + 0.45 * Math.random()) * clamp01(rumble + 0.3));
      }
    }

    // Under water everything is dull; behind the pause card the world is held at arm's length.
    this.setMuffle(under ? 0.9 : game.engine.timeScale === 0 ? 0.75 : outside * 0.2);
  }

  private setMuffle(amount: number): void {
    if (Math.abs(amount - this.muffle) < 0.02) return;
    this.muffle = amount;
    this.engine.setMuffle(amount);
  }

  /**
   * How near and how open the sea is at a point, 0..1: 1 at the edge of the ocean, about half that on the
   * sheltered bay, next to nothing beside a canal or inland.
   */
  private probeSea(x: number, z: number): number {
    const field = this.game.world.field;
    let best = 0;
    for (let w = 0; w < WAYS; w++) {
      const wx = WAY_X[w]!;
      const wz = WAY_Z[w]!;
      for (let i = 0; i < RINGS.length; i++) {
        const r = RINGS[i]!;
        const px = x + wx * r;
        const pz = z + wz * r;
        if (!field.isWater(px, pz)) continue;
        // Water, but how much of it? A canal has land again a little further on; the sea does not.
        const open = field.waveAmp(px + wx * 55, pz + wz * 55);
        const score = open * (1 - smoothstep(12, 190, r));
        if (score > best) best = score;
      }
    }
    return best;
  }

  /** Keep each engine loop on a running vehicle in earshot, and hand free ones to whoever is nearest. */
  private fleet(fleet: Fleet, dt: number, playing: boolean, scan: boolean): void {
    const mine = this.game.player?.vehicle ?? null;
    for (const voice of fleet.voices) {
      const v = voice.vehicle;
      if (!v) {
        if (voice.rest > 0) voice.rest -= dt;
        continue;
      }
      const rpm = revs(v);
      if (!playing || rpm < 0.02 || this.away2(v.position) > fleet.reach2) {
        this.release(voice);
        continue;
      }
      const load = Math.abs(v.controls.throttle);
      const boat = v.kind !== 'car';
      // Revs set the note; the throttle leans on it and opens it up.
      const pitch = boat ? 0.6 + 1.5 * rpm + (v.kind === 'jetski' ? 0.35 : 0) : 0.6 + 1.7 * rpm + 0.08 * load;
      const gain = clamp01(boat ? 0.4 + 0.6 * rpm : 0.42 + 0.33 * rpm + 0.3 * load) * (v === mine ? 1.15 : 1);
      voice.bed.move(gain, pitch, 10, dt, v.position);
    }
    if (!scan || !playing) return;
    const wantBoat = fleet === this.boats;
    for (const v of this.game.vehicles) {
      if ((v.kind !== 'car') !== wantBoat || revs(v) < 0.02) continue;
      const d2 = this.away2(v.position);
      if (d2 > fleet.reach2) continue;
      let free: EngineVoice | null = null;
      let far: EngineVoice | null = null;
      let farD = 0;
      let has = false;
      for (const voice of fleet.voices) {
        const held = voice.vehicle;
        if (held === v) {
          has = true;
          break;
        }
        if (!held) {
          if (voice.rest <= 0) free ??= voice;
          continue;
        }
        const d = this.away2(held.position);
        if (d > farD) {
          farD = d;
          far = voice;
        }
      }
      if (has) continue;
      if (free) free.vehicle = v;
      // Every loop is busy and this one is much nearer than the furthest: that one gives way.
      else if (far && d2 < farD * 0.5) this.release(far);
    }
  }

  private release(voice: EngineVoice): void {
    voice.bed.cut();
    voice.vehicle = null;
    voice.rest = VOICE_REST;
  }

  /** Tyres: the two cars sliding hardest among those that have an engine loop. */
  private slides(dt: number): void {
    let first: Vehicle | null = null;
    let firstAmount = 0;
    let second: Vehicle | null = null;
    let secondAmount = 0;
    for (const voice of this.cars.voices) {
      const v = voice.vehicle;
      if (!v) continue;
      const amount = skidOf(v);
      if (amount > firstAmount) {
        second = first;
        secondAmount = firstAmount;
        first = v;
        firstAmount = amount;
      } else if (amount > secondAmount) {
        second = v;
        secondAmount = amount;
      }
    }
    this.skids[0]!.move(firstAmount, first ? 0.8 + 0.4 * smoothstep(5, 30, Math.abs(first.speed)) : 1, 14, dt, first?.position);
    this.skids[1]!.move(secondAmount, second ? 0.8 + 0.4 * smoothstep(5, 30, Math.abs(second.speed)) : 1, 14, dt, second?.position);
  }

  /** Distance from the listener to a point, squared. */
  private away2(p: Vec3Like): number {
    const dx = p.x - this.lx;
    const dy = p.y - this.ly;
    const dz = p.z - this.lz;
    return dx * dx + dy * dy + dz * dz;
  }
}
