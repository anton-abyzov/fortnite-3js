import { bubble, burst, chime, click, crackle, hump, shards, thump } from './blocks';
import type { Dsp, Rendered, Stereo } from './dsp';

/** Every one-shot the game can play. */
export type SoundName =
  | 'shot_pistol'
  | 'shot_smg'
  | 'shot_rifle'
  | 'shot_shotgun'
  | 'shot_sniper'
  | 'reload'
  | 'dry_fire'
  | 'equip'
  | 'shell'
  | 'bullet_whiz'
  | 'explosion'
  | 'impact_concrete'
  | 'impact_metal'
  | 'impact_wood'
  | 'impact_sand'
  | 'impact_water'
  | 'impact_glass'
  | 'impact_body'
  | 'headshot'
  | 'hit_marker'
  | 'kill_confirm'
  | 'damage'
  | 'shield_break'
  | 'step_concrete'
  | 'step_sand'
  | 'step_wood'
  | 'step_grass'
  | 'step_metal'
  | 'step_water'
  | 'jump'
  | 'land'
  | 'splash'
  | 'swim_stroke'
  | 'parachute_open'
  | 'cloth_flap'
  | 'car_door'
  | 'horn'
  | 'crash'
  | 'glass_break'
  | 'boat_slap'
  | 'pickup'
  | 'chest_open'
  | 'heal'
  | 'cash'
  | 'door_bell'
  | 'jukebox_coin'
  | 'vending'
  | 'ui_click'
  | 'ui_hover'
  | 'ui_back'
  | 'countdown'
  | 'zone_warn'
  | 'zone_shrink'
  | 'thunder'
  | 'jump_cue';

/** How a buffer is synthesised. `variant` runs 0..variants-1; each variant also gets its own random seed. */
export interface Recipe {
  render: (d: Dsp, variant: number) => Rendered;
  /** Pre-rendered variations, picked at random per play. Default 1. */
  variants?: number;
  /** Render sample rate; defaults to the context rate. Dull, long sounds can use less. */
  sr?: number;
  /** A seamless loop: its ends must be left exactly as rendered. */
  loop?: boolean;
}

/** A one-shot: its recipe plus how it is played. */
export interface SoundDef extends Recipe {
  /** Playback gain before distance attenuation. */
  gain: number;
  /** Default random pitch spread per play (0.06 = up to 6 % either way). */
  jitter: number;
  /** Positional range in metres: full level inside the first, silent beyond the second. */
  range: readonly [near: number, far: number];
  /** `ui` skips the muffle filter. */
  bus: 'sfx' | 'ui';
  /** Scales loudness when voices are stolen; higher survives longer. */
  priority: number;
}

// ---------------------------------------------------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------------------------------------------------

interface GunSpec {
  dur: number;
  /** High transient: level, high-pass corner, decay. */
  crack: readonly [level: number, hz: number, tau: number];
  /** Broadband muzzle blast, the bulk of the shot: level, low-pass corner, decay. */
  blast: readonly [level: number, hz: number, tau: number];
  /** Mid resonance that gives the weapon its voice: level, band centre, Q, decay. */
  body: readonly [level: number, hz: number, q: number, tau: number];
  /** Low thump: level, start Hz, end Hz, glide, decay. */
  thump: readonly [level: number, f0: number, f1: number, glide: number, tau: number];
  /** Noise tail: level, decay, low-pass at the start and at the end. */
  tail: readonly [level: number, tau: number, hz0: number, hz1: number];
  /** Slap-back echoes: delay, level, pan. */
  echoes: readonly (readonly [at: number, level: number, pan: number])[];
  drive: number;
  /** Action cycling after the shot: level, pitch, delay. */
  mech?: readonly [level: number, hz: number, at: number];
}

/**
 * Layered gunshot: a sharp noise transient, a broadband blast, a band-passed body and a pitched thump,
 * saturated together, then a darkening noise tail (different on each side) and a few low-passed echoes
 * of the dry shot standing in for the street's reflections.
 */
function gunshot(d: Dsp, g: GunSpec): Stereo {
  const dry = d.zeros(Math.min(g.dur, 0.6));
  d.mix(dry, burst(d, 'hp', g.crack[1], 0.7, g.crack[2], 0.0002), g.crack[0]);
  d.mix(dry, burst(d, 'lp', g.blast[1], 0.7, g.blast[2], 0.0003), g.blast[0]);
  d.mix(dry, burst(d, 'bp', g.body[1], g.body[2], g.body[3], 0.0006), g.body[0]);
  d.mix(dry, thump(d, g.thump[1], g.thump[2], g.thump[3], g.thump[4]), g.thump[0]);
  d.drive(d.norm(dry, 1), g.drive);
  if (g.mech) d.mix(dry, click(d, g.mech[1], 0.007), g.mech[0], g.mech[2]);
  const out = d.stereo(g.dur);
  d.mixS(out, dry);
  const [tailLevel, tailTau, hz0, hz1] = g.tail;
  for (const ch of out) {
    const tail = d.white(g.dur - 0.01);
    d.lp(tail, (t) => hz1 + (hz0 - hz1) * Math.exp(-t / (tailTau * 0.8)));
    d.hp(tail, 140);
    d.mix(ch, d.decay(tail, tailTau, 0.006), tailLevel, 0.002);
  }
  const slap = d.lp(dry.slice(), 1600);
  for (const [at, level, pan] of g.echoes) d.mixS(out, slap, level, at, pan);
  return d.norm(out, 0.95);
}

const shotPistol = (d: Dsp): Rendered =>
  gunshot(d, {
    dur: 0.55,
    crack: [1, 2500, 0.002],
    blast: [1.4, 7000, 0.014],
    body: [1, 1400, 0.9, 0.024],
    thump: [0.45, 230, 85, 0.015, 0.028],
    tail: [0.2, 0.085, 5200, 900],
    echoes: [
      [0.071, 0.1, -0.4],
      [0.124, 0.06, 0.5],
    ],
    drive: 2.4,
    mech: [0.1, 2900, 0.058],
  });

const shotSmg = (d: Dsp): Rendered =>
  gunshot(d, {
    dur: 0.28,
    crack: [1, 3500, 0.0015],
    blast: [1.3, 9000, 0.008],
    body: [0.9, 2300, 1, 0.013],
    thump: [0.3, 320, 140, 0.01, 0.015],
    tail: [0.16, 0.042, 6500, 1500],
    echoes: [[0.052, 0.07, 0.3]],
    drive: 2,
    mech: [0.08, 3600, 0.034],
  });

const shotRifle = (d: Dsp): Rendered =>
  gunshot(d, {
    dur: 1,
    crack: [1.2, 2000, 0.0035],
    blast: [1.5, 6000, 0.022],
    body: [1.1, 620, 0.7, 0.045],
    thump: [0.55, 180, 58, 0.025, 0.05],
    tail: [0.3, 0.22, 5000, 700],
    echoes: [
      [0.093, 0.13, -0.5],
      [0.171, 0.09, 0.6],
      [0.274, 0.05, -0.2],
    ],
    drive: 3.2,
    mech: [0.07, 2300, 0.075],
  });

const shotShotgun = (d: Dsp): Rendered =>
  gunshot(d, {
    dur: 1.35,
    crack: [0.7, 1500, 0.005],
    blast: [1.6, 3800, 0.04],
    body: [1.3, 360, 0.6, 0.08],
    thump: [0.7, 130, 40, 0.05, 0.1],
    tail: [0.32, 0.28, 3600, 480],
    echoes: [
      [0.112, 0.14, 0.7],
      [0.209, 0.1, -0.7],
      [0.338, 0.06, 0.3],
    ],
    drive: 3.6,
  });

const shotSniper = (d: Dsp): Rendered =>
  gunshot(d, {
    dur: 2.7,
    crack: [1.4, 2800, 0.003],
    blast: [1.5, 5500, 0.03],
    body: [1.1, 520, 0.6, 0.065],
    thump: [0.6, 150, 45, 0.04, 0.09],
    tail: [0.28, 0.6, 4500, 420],
    echoes: [
      [0.162, 0.2, -0.6],
      [0.331, 0.14, 0.7],
      [0.553, 0.09, -0.3],
      [0.824, 0.06, 0.4],
      [1.21, 0.035, 0],
    ],
    drive: 3.4,
  });

function reload(d: Dsp): Rendered {
  const out = d.zeros(1.15);
  // Magazine release and the magazine sliding out.
  d.mix(out, click(d, 2400, 0.012), 0.7);
  d.mix(out, d.fade(d.bp(d.white(0.14), (t) => 1800 - t * 6000, 2), 0.02, 0.08), 0.5, 0.03);
  // New magazine slides in and seats.
  d.mix(out, d.fade(d.bp(d.white(0.1), (t) => 900 + t * 9000, 2), 0.03, 0.02), 0.45, 0.42);
  d.mix(out, thump(d, 190, 90, 0.02, 0.03), 0.9, 0.52);
  d.mix(out, click(d, 1500, 0.02), 0.8, 0.52);
  // Bolt back, then home.
  d.mix(out, click(d, 3100, 0.01), 0.6, 0.8);
  d.mix(out, d.fade(d.bp(d.white(0.09), 2600, 3), 0.01, 0.03), 0.4, 0.81);
  d.mix(out, click(d, 2000, 0.018), 1, 0.93);
  d.mix(out, thump(d, 240, 120, 0.01, 0.02), 0.5, 0.93);
  return d.norm(out, 0.85);
}

function dryFire(d: Dsp): Rendered {
  const out = d.zeros(0.14);
  d.mix(out, click(d, 1900, 0.006, 0.8));
  d.mix(out, click(d, 3300, 0.004, 0.4), 0.5, 0.012);
  // Spring twang behind the hammer.
  d.mix(
    out,
    d.modes(
      0.1,
      [
        [620, 0.02, 0.25],
        [1130, 0.015, 0.15],
      ],
      true,
    ),
    1,
    0.004,
  );
  return d.norm(out, 0.8);
}

function equip(d: Dsp): Rendered {
  const out = d.zeros(0.36);
  const rustle = d.bp(d.white(0.2), (t) => 900 + 13000 * t, 1.2);
  d.env(rustle, (t) => hump(0.2, 2)(t) * (0.6 + 0.4 * Math.sin(t * 140)));
  d.mix(out, rustle, 1.2);
  d.mix(out, click(d, 1400, 0.012), 0.7, 0.12);
  d.mix(out, thump(d, 210, 110, 0.015, 0.025), 0.5, 0.12);
  d.mix(out, click(d, 2500, 0.009), 0.9, 0.2);
  return d.norm(out, 0.8);
}

/** Brass casing bouncing on the ground. */
function shell(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.5);
  const base = 3800 + v * 450 + d.rand(-150, 150);
  let at = 0;
  let amp = 1;
  let gap = 0.12 + d.rand(-0.02, 0.02);
  for (let b = 0; b < 4; b++) {
    const f = base * (1 + d.rand(-0.04, 0.04));
    const ping = d.modes(
      0.12,
      [
        [f, 0.022, 1],
        [f * 1.47, 0.016, 0.7],
        [f * 2.09, 0.012, 0.5],
        [f * 2.83, 0.008, 0.3],
      ],
      true,
    );
    d.mix(ping, burst(d, 'hp', 5000, 0.7, 0.001), 0.5);
    d.mix(out, ping, amp, at);
    at += gap;
    gap *= 0.58;
    amp *= 0.55;
  }
  return d.norm(out, 0.8);
}

/** A round passing close by: air torn at a pitch that drops as it goes past. */
function bulletWhiz(d: Dsp, v: number): Rendered {
  const dur = 0.34;
  const f0 = 2500 + v * 550;
  const fall = (t: number): number => f0 * (0.42 + 0.58 / (1 + Math.exp((t - 0.09) * 55)));
  const out = d.bp(d.white(dur), fall, 5);
  d.mix(out, d.bp(d.osc(dur, 'saw', fall), fall, 3), 0.12);
  d.env(out, (t) => Math.exp(-(((t - 0.09) / (t < 0.09 ? 0.035 : 0.075)) ** 2)));
  d.mix(out, burst(d, 'hp', 4500, 0.7, 0.0015), 0.25, 0.085);
  return d.norm(out, 0.85);
}

// ---------------------------------------------------------------------------------------------------------------------
// Impacts and hit feedback
// ---------------------------------------------------------------------------------------------------------------------

function impactConcrete(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.42);
  d.mix(out, burst(d, 'hp', 2200, 0.7, 0.003));
  d.mix(out, burst(d, 'bp', 480 + v * 90, 1.2, 0.022), 0.9);
  d.mix(out, thump(d, 160, 80, 0.01, 0.02), 0.3);
  const grit = d.bp(
    d.dust(0.38, (t) => 900 * Math.exp(-t / 0.08)),
    3200 + d.rand(-500, 500),
    1.5,
  );
  d.mix(out, d.norm(grit, 1), 0.35, 0.01);
  d.mix(out, burst(d, 'bp', 1400, 0.6, 0.05, 0.004), 0.25);
  return d.norm(out, 0.9);
}

function impactMetal(d: Dsp, v: number): Rendered {
  const base = [1150, 1720, 2380][v % 3]! * (1 + d.rand(-0.04, 0.04));
  const out = d.zeros(0.6);
  d.mix(out, burst(d, 'hp', 3500, 0.7, 0.0015), 0.9);
  d.mix(out, burst(d, 'bp', 900, 1, 0.012), 0.6);
  const ring = d.modes(
    0.6,
    [
      [base, 0.09, 1],
      [base * 2.32, 0.07, 0.7],
      [base * 3.87, 0.05, 0.55],
      [base * 5.21, 0.035, 0.4],
      [base * 6.9, 0.02, 0.3],
      [base * 0.48, 0.03, 0.4],
    ],
    true,
  );
  d.mix(out, ring, 0.8);
  // One variant glances off instead of stopping dead.
  if (v % 3 === 2) d.mix(out, d.decay(d.sweep(0.3, 4300, 1500, 0.09), 0.07, 0.002), 0.4, 0.004);
  return d.norm(out, 0.9);
}

function impactWood(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.3);
  const f = 170 + v * 35 + d.rand(-10, 10);
  d.mix(
    out,
    d.modes(0.25, [
      [f, 0.03, 1],
      [f * 2.4, 0.022, 0.7],
      [f * 4.3, 0.015, 0.45],
      [f * 6.8, 0.01, 0.25],
    ]),
  );
  d.mix(out, burst(d, 'bp', 2600, 1.5, 0.005), 0.7);
  const splinter = d.bp(
    d.dust(0.2, (t) => 500 * Math.exp(-t / 0.05)),
    4200,
    2,
  );
  d.mix(out, d.norm(splinter, 1), 0.3, 0.008);
  return d.norm(out, 0.9);
}

function impactSand(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.36);
  d.mix(out, burst(d, 'lp', 1700 + v * 250, 0.7, 0.03, 0.003));
  d.mix(out, burst(d, 'hp', 3200, 0.7, 0.06, 0.008), 0.3);
  d.mix(out, thump(d, 120, 60, 0.02, 0.03, 0.003), 0.5);
  const grains = d.hp(
    d.dust(0.3, (t) => 2500 * Math.exp(-t / 0.07)),
    2500,
  );
  d.mix(out, grains, 0.15, 0.02);
  return d.norm(out, 0.85);
}

function impactWater(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.46);
  const f = 420 + v * 110;
  d.mix(out, burst(d, 'bp', 2400, 0.8, 0.02, 0.002), 0.8);
  d.mix(out, bubble(d, f, 8, 0.035), 0.9, 0.012);
  d.mix(out, bubble(d, f * 1.7, 10, 0.02), 0.4, 0.06);
  d.mix(out, burst(d, 'hp', 3500, 0.7, 0.08, 0.01), 0.3, 0.01);
  for (let i = 0; i < 3; i++) d.mix(out, bubble(d, d.rand(900, 2200), 12, 0.008), 0.2, 0.12 + d.rand(0, 0.2));
  return d.norm(out, 0.85);
}

function impactGlass(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.5);
  d.mix(out, burst(d, 'hp', 4000, 0.7, 0.002));
  d.mix(out, burst(d, 'bp', 1900 + 300 * v, 2, 0.012), 0.7);
  d.mix(out, shards(d, 0.48, 14, 3200, 9500, 0.06), 0.7, 0.004);
  return d.norm(out, 0.85);
}

function impactBody(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.26);
  d.mix(out, thump(d, 170 + v * 15, 70, 0.018, 0.035));
  d.mix(out, burst(d, 'lp', 520, 0.8, 0.02, 0.001), 0.8);
  d.mix(out, burst(d, 'bp', 1700, 1, 0.006), 0.3);
  return d.norm(d.drive(d.norm(out, 1), 1.5), 0.85);
}

function headshot(d: Dsp): Rendered {
  const out = d.zeros(0.42);
  d.mix(out, burst(d, 'hp', 3000, 0.7, 0.002), 0.8);
  // Hollow knock.
  d.mix(
    out,
    d.modes(0.2, [
      [880, 0.018, 1],
      [1420, 0.012, 0.6],
      [2350, 0.008, 0.35],
    ]),
  );
  d.mix(out, thump(d, 200, 90, 0.012, 0.025), 0.6);
  // Glassy ting that confirms it.
  d.mix(
    out,
    d.modes(0.4, [
      [2640, 0.07, 0.5],
      [3960, 0.05, 0.35],
      [5310, 0.035, 0.2],
    ]),
    0.8,
    0.015,
  );
  return d.norm(out, 0.9);
}

function hitMarker(d: Dsp): Rendered {
  const out = d.zeros(0.09);
  d.mix(
    out,
    d.modes(0.08, [
      [1480, 0.009, 1],
      [2230, 0.007, 0.7],
      [3350, 0.005, 0.3],
    ]),
  );
  d.mix(out, burst(d, 'hp', 4500, 0.7, 0.0015), 0.5);
  return d.norm(out, 0.8);
}

function killConfirm(d: Dsp): Rendered {
  const out = d.zeros(0.75);
  d.mix(out, thump(d, 150, 60, 0.02, 0.04), 0.7);
  d.mix(out, burst(d, 'hp', 3000, 0.7, 0.002), 0.3);
  d.mix(out, chime(d, 659.26, 0.1), 0.6);
  d.mix(out, chime(d, 987.77, 0.11), 0.7, 0.085);
  d.mix(out, chime(d, 1318.51, 0.1), 0.45, 0.17);
  return d.norm(d.verb(out, { time: 0.6, mix: 0.3 }), 0.85);
}

/** The player taking a hit: a dull blow with a crunch and a second, weaker pulse. */
function damage(d: Dsp): Rendered {
  const out = d.zeros(0.42);
  d.mix(out, thump(d, 130, 48, 0.03, 0.06));
  d.mix(out, d.drive(burst(d, 'bp', 520, 0.8, 0.045, 0.002), 3), 0.5);
  d.mix(out, thump(d, 95, 45, 0.03, 0.05), 0.5, 0.13);
  d.mix(out, burst(d, 'bp', 2100, 2, 0.01), 0.2);
  return d.norm(d.drive(d.norm(out, 1), 1.6), 0.9);
}

function shieldBreak(d: Dsp): Rendered {
  const out = d.stereo(1.05);
  // The field collapsing: a resonant zap that falls away.
  const zap = d.osc(0.45, 'saw', (t) => 2600 * Math.exp(-t / 0.11) + 180);
  d.bp(zap, (t) => 3200 * Math.exp(-t / 0.13) + 300, 3);
  d.mixS(out, d.norm(d.decay(zap, 0.12, 0.002), 1), 0.7);
  d.mixS(out, burst(d, 'hp', 3500, 0.7, 0.004), 0.8);
  d.mixS(out, thump(d, 120, 45, 0.05, 0.09), 0.7);
  d.mixS(out, shards(d, 0.95, 30, 2400, 9000, 0.14), 0.6, 0.03, -0.4);
  d.mixS(out, shards(d, 0.95, 30, 2400, 9000, 0.18), 0.6, 0.06, 0.4);
  return d.norm(out, 0.9);
}

// ---------------------------------------------------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------------------------------------------------

function stepConcrete(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.2);
  d.mix(out, thump(d, 140 + d.rand(-15, 15), 70, 0.012, 0.018), 0.45);
  d.mix(out, burst(d, 'bp', 1700 + v * 180 + d.rand(-150, 150), 1.2, 0.009));
  d.mix(out, burst(d, 'hp', 3800, 0.7, 0.02, 0.003), 0.18);
  // The sole rolling down after the heel.
  d.mix(out, burst(d, 'bp', 900, 0.8, 0.014, 0.003), 0.35, 0.045 + d.rand(-0.01, 0.01));
  return d.norm(out, 0.8);
}

function stepSand(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.32);
  const crunch = crackle(d, d.bp(d.white(0.3), 850 + v * 120, 0.7), 130);
  d.env(crunch, (t) => Math.min(1, t / 0.012) * Math.exp(-t / 0.06));
  d.mix(out, d.norm(crunch, 1));
  d.mix(out, burst(d, 'hp', 3000, 0.7, 0.05, 0.01), 0.2);
  d.mix(out, thump(d, 95, 50, 0.02, 0.03, 0.004), 0.45);
  return d.norm(out, 0.75);
}

function stepWood(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.3);
  const f = 150 + v * 14 + d.rand(-8, 8);
  d.mix(
    out,
    d.modes(0.28, [
      [f, 0.045, 1],
      [f * 2.07, 0.035, 0.7],
      [f * 3.6, 0.025, 0.4],
      [f * 5.9, 0.012, 0.2],
    ]),
  );
  d.mix(out, burst(d, 'bp', 1200, 1, 0.008), 0.6);
  // Every so often a board complains.
  if (v === 3) {
    const creak = d.bp(
      d.osc(0.09, 'saw', (t) => 610 + 1500 * t),
      1400,
      3,
    );
    d.mix(out, d.env(creak, hump(0.09)), 0.25, 0.03);
  }
  return d.norm(out, 0.8);
}

function stepGrass(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.34);
  const swish = crackle(d, d.bp(d.white(0.32), 3600 + v * 300, 0.6), 95);
  d.env(swish, (t) => Math.min(1, t / 0.018) * Math.exp(-t / 0.07));
  d.mix(out, d.norm(swish, 1));
  d.mix(out, thump(d, 90, 50, 0.02, 0.03, 0.005), 0.3);
  const blades = d.bp(
    d.dust(0.2, (t) => 400 * Math.exp(-t / 0.06)),
    5200,
    2,
  );
  d.mix(out, d.norm(blades, 1), 0.3, 0.01);
  return d.norm(out, 0.7);
}

function stepMetal(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.42);
  const f = 500 + v * 45 + d.rand(-20, 20);
  d.mix(out, thump(d, 150, 75, 0.012, 0.02), 0.7);
  d.mix(out, burst(d, 'bp', 2100, 1.2, 0.006), 0.7);
  d.mix(
    out,
    d.modes(
      0.4,
      [
        [f, 0.06, 0.6],
        [f * 2.58, 0.05, 0.5],
        [f * 4.35, 0.035, 0.35],
        [f * 7.5, 0.02, 0.2],
      ],
      true,
    ),
  );
  return d.norm(out, 0.8);
}

function stepWater(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.42);
  const slosh = d.bp(d.white(0.3), (t) => 520 + (1300 + v * 150) * Math.min(1, t / 0.12), 1.1);
  d.env(slosh, (t) => Math.min(1, t / 0.015) * Math.exp(-t / 0.075));
  d.mix(out, d.norm(slosh, 1));
  d.mix(out, bubble(d, 300 + d.rand(0, 200), 6, 0.025), 0.5, 0.02);
  d.mix(out, bubble(d, 520 + d.rand(0, 300), 8, 0.018), 0.35, 0.07);
  for (let i = 0; i < 3; i++) d.mix(out, bubble(d, d.rand(1100, 2600), 12, 0.007), 0.18, 0.12 + d.rand(0, 0.22));
  return d.norm(out, 0.75);
}

function jump(d: Dsp): Rendered {
  const out = d.zeros(0.27);
  d.mix(out, burst(d, 'bp', 1100, 0.8, 0.012, 0.002), 0.6);
  d.mix(out, thump(d, 130, 70, 0.015, 0.02), 0.4);
  const whoosh = d.bp(d.white(0.22), (t) => 500 + 6800 * t, 1.3);
  d.mix(out, d.env(whoosh, hump(0.22, 2)), 1.2, 0.02);
  return d.norm(out, 0.7);
}

function land(d: Dsp): Rendered {
  const out = d.zeros(0.38);
  d.mix(out, thump(d, 125, 52, 0.025, 0.045));
  d.mix(out, burst(d, 'lp', 420, 0.8, 0.03, 0.001), 0.8);
  d.mix(out, burst(d, 'bp', 1500, 1, 0.012), 0.5);
  d.mix(out, burst(d, 'bp', 1300, 1, 0.012), 0.35, 0.03);
  d.mix(out, burst(d, 'hp', 3200, 0.7, 0.05, 0.005), 0.15, 0.01);
  return d.norm(out, 0.9);
}

function splash(d: Dsp): Rendered {
  const out = d.stereo(1.5);
  d.mixS(out, burst(d, 'lp', 3200, 0.7, 0.05, 0.002));
  d.mixS(out, thump(d, 95, 42, 0.05, 0.1, 0.004), 0.9, 0.01);
  d.mixS(out, bubble(d, 180, 3, 0.05), 0.5, 0.06);
  for (const ch of out) {
    const spray = crackle(d, d.hp(d.white(1.3), 2200), 55, 0.7);
    d.mix(ch, d.decay(spray, 0.3, 0.03), 0.5, 0.02);
    const wash = d.bp(d.pink(1), (t) => 1400 - 900 * t, 0.7);
    d.mix(ch, d.decay(wash, 0.25, 0.05), 1.6, 0.02);
  }
  for (let i = 0; i < 14; i++) {
    d.mixS(out, bubble(d, d.rand(700, 2600), 10, d.rand(0.006, 0.014)), d.rand(0.08, 0.3), d.rand(0.25, 1.3), d.rand(-0.8, 0.8));
  }
  return d.norm(out, 0.92);
}

function swimStroke(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.7);
  const sweep = d.bp(d.white(0.55), (t) => 450 + (900 + v * 200) * Math.sin(Math.PI * Math.min(1, t / 0.5)), 1.1);
  crackle(d, sweep, 40, 0.5);
  d.env(sweep, (t) => Math.min(1, t / 0.09) * Math.exp(-Math.max(0, t - 0.09) / 0.14));
  d.mix(out, d.norm(sweep, 1));
  for (let i = 0; i < 4; i++) d.mix(out, bubble(d, d.rand(350, 900), 5, d.rand(0.012, 0.03)), d.rand(0.15, 0.4), d.rand(0.08, 0.4));
  for (let i = 0; i < 5; i++) d.mix(out, bubble(d, d.rand(1200, 2800), 10, 0.008), d.rand(0.05, 0.15), d.rand(0.25, 0.62));
  return d.norm(out, 0.7);
}

function parachuteOpen(d: Dsp): Rendered {
  const out = d.stereo(1.5);
  d.mixS(out, burst(d, 'hp', 1800, 0.7, 0.006), 0.7, 0.03);
  d.mixS(out, thump(d, 82, 38, 0.08, 0.16, 0.01), 0.7, 0.02);
  for (const ch of out) {
    // Air dumped out of the canopy as it fills.
    const air = d.lp(d.white(1.2), (t) => 320 + 3200 * Math.exp(-t / 0.16));
    d.mix(ch, d.env(air, (t) => Math.min(1, t / 0.03) * Math.exp(-t / 0.3)), 1.2);
    // The canopy settling.
    const flutter = d.bp(d.white(1), 700, 0.8);
    d.env(flutter, (t) => Math.exp(-t / 0.35) * (0.5 + 0.5 * Math.sin(2 * Math.PI * (15 - 6 * t) * t)) ** 2);
    d.mix(ch, flutter, 1.8, 0.25);
  }
  // Lines pulling tight.
  d.mixS(out, click(d, 520, 0.03, 0.2), 0.3, 0.09, -0.3);
  d.mixS(out, click(d, 640, 0.025, 0.2), 0.25, 0.13, 0.3);
  return d.norm(out, 0.92);
}

function clothFlap(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.32);
  const flaps = 2 + (v % 2);
  for (let i = 0; i < flaps; i++) {
    const at = i * (0.06 + d.rand(0, 0.02));
    d.mix(out, burst(d, 'bp', 600 + d.rand(0, 700), 0.7, 0.02 + d.rand(0, 0.012), 0.006), 1 - i * 0.25, at);
    d.mix(out, thump(d, 150, 80, 0.02, 0.02, 0.004), 0.3, at);
  }
  return d.norm(out, 0.7);
}

// ---------------------------------------------------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------------------------------------------------

function carDoor(d: Dsp): Rendered {
  const out = d.zeros(0.44);
  d.mix(out, click(d, 2300, 0.006, 0.6), 0.5);
  d.mix(out, thump(d, 105, 58, 0.03, 0.05), 1, 0.018);
  d.mix(out, burst(d, 'lp', 520, 0.8, 0.03, 0.001), 0.8, 0.018);
  d.mix(
    out,
    d.modes(
      0.3,
      [
        [310, 0.05, 0.3],
        [690, 0.04, 0.25],
        [1120, 0.03, 0.15],
      ],
      true,
    ),
    1,
    0.02,
  );
  // Window glass rattling in its channel.
  const rattle = d.bp(
    d.dust(0.12, (t) => 350 * Math.exp(-t / 0.04)),
    2900,
    3,
  );
  d.mix(out, d.norm(rattle, 1), 0.12, 0.03);
  return d.norm(out, 0.9);
}

/** Twin-tone horn: two reedy notes a major third apart through a horn-shaped resonance. */
function horn(d: Dsp): Rendered {
  const dur = 0.7;
  const out = d.zeros(dur);
  for (const [f, level] of [
    [415, 1],
    [523, 0.9],
  ] as const) {
    const pitch = (t: number): number => f * (1 + 0.004 * Math.sin(t * 38)) * (1 - 0.03 * Math.exp(-t / 0.02));
    const reed = d.osc(dur, 'square', pitch);
    d.mix(reed, d.osc(dur, 'saw', pitch), 0.6);
    d.mix(out, reed, level);
  }
  d.filter(out, 'peak', 2400, 1.2, 9);
  d.lp(d.hp(out, 320), 5200);
  d.drive(d.norm(out, 1), 1.4);
  d.env(out, (t) => Math.min(1, t / 0.012) * Math.min(1, (dur - t) / 0.07));
  return d.norm(d.verb(out, { time: 0.45, mix: 0.18 }), 0.85);
}

function crash(d: Dsp): Rendered {
  const out = d.stereo(1.4);
  d.mixS(out, thump(d, 95, 34, 0.05, 0.14));
  d.mixS(out, burst(d, 'lp', 900, 0.7, 0.07, 0.001), 0.9);
  d.mixS(out, burst(d, 'hp', 2500, 0.7, 0.006), 0.6);
  // Sheet metal crumpling: crackling noise through panel resonances.
  for (const [f, pan] of [
    [340, -0.5],
    [710, 0.4],
    [1280, -0.2],
    [2150, 0.6],
  ] as const) {
    const panel = crackle(d, d.bp(d.white(0.5), f * (1 + d.rand(-0.05, 0.05)), 6), 60);
    d.mixS(out, d.norm(d.decay(panel, 0.13, 0.002), 1), 0.45, d.rand(0, 0.04), pan);
  }
  // Loose parts and broken trim landing afterwards.
  d.mixS(out, click(d, 780, 0.06), 0.4, 0.16, 0.5);
  d.mixS(out, click(d, 1250, 0.05), 0.3, 0.29, -0.4);
  d.mixS(out, shards(d, 0.9, 22, 2600, 9000, 0.15), 0.3, 0.08, 0.2);
  for (const ch of out) d.drive(ch, 1.3);
  return d.norm(out, 0.95);
}

/** A frag going off: a hard crack, a deep thump, a roar that darkens as it dies, then dirt coming back down. */
function explosion(d: Dsp): Rendered {
  const out = d.stereo(2.4);
  d.mixS(out, burst(d, 'hp', 1400, 0.7, 0.012, 0.0003), 0.9);
  d.mixS(out, burst(d, 'lp', 2400, 0.7, 0.05, 0.0005), 1.2);
  d.mixS(out, thump(d, 120, 30, 0.07, 0.3, 0.001), 1.3);
  for (const ch of out) {
    const roar = d.lp(d.brown(2.2), (t) => 140 + 2600 * Math.exp(-t / 0.22));
    d.mix(ch, d.env(roar, (t) => Math.min(1, t / 0.004) * Math.exp(-t / 0.45)), 4, 0.004);
  }
  const dirt = crackle(d, d.decay(d.bp(d.white(1.2), 1800, 0.8), 0.35, 0.05), 40);
  d.mixS(out, d.norm(dirt, 1), 0.3, 0.18, -0.3);
  d.mixS(out, shards(d, 1.1, 18, 1800, 7000, 0.3), 0.16, 0.3, 0.4);
  for (const ch of out) d.drive(ch, 1.6);
  return d.norm(out, 0.95);
}

function glassBreak(d: Dsp, _v: number): Rendered {
  const out = d.stereo(1.2);
  d.mixS(out, burst(d, 'hp', 2500, 0.7, 0.004));
  d.mixS(out, burst(d, 'bp', 1300, 1.2, 0.035), 0.9);
  d.mixS(out, thump(d, 150, 70, 0.02, 0.04), 0.5);
  d.mixS(out, burst(d, 'hp', 5000, 0.7, 0.09, 0.004), 0.45);
  d.mixS(out, shards(d, 1.1, 40, 2600, 11000, 0.16), 0.8, 0.02, -0.5);
  d.mixS(out, shards(d, 1.1, 40, 2600, 11000, 0.2), 0.8, 0.05, 0.5);
  return d.norm(out, 0.9);
}

/** A hull coming down on a wave: hollow knock, slap and spray. */
function boatSlap(d: Dsp, v: number): Rendered {
  const out = d.zeros(0.9);
  const f = 78 + v * 9;
  d.mix(
    out,
    d.modes(0.5, [
      [f, 0.07, 1],
      [f * 2.1, 0.05, 0.6],
      [f * 3.4, 0.03, 0.3],
    ]),
  );
  d.mix(out, burst(d, 'lp', 2400, 0.7, 0.035, 0.002), 0.8);
  d.mix(out, crackle(d, burst(d, 'hp', 2800, 0.7, 0.12, 0.02), 70, 0.6), 0.4, 0.02);
  return d.norm(out, 0.9);
}

// ---------------------------------------------------------------------------------------------------------------------
// World and interface
// ---------------------------------------------------------------------------------------------------------------------

function pickup(d: Dsp): Rendered {
  const out = d.zeros(0.52);
  d.mix(out, burst(d, 'bp', 2600, 1.5, 0.008), 0.25);
  d.mix(out, chime(d, 783.99, 0.05), 0.8);
  d.mix(out, chime(d, 1174.66, 0.07), 0.9, 0.065);
  return d.norm(out, 0.8);
}

function chestOpen(d: Dsp): Rendered {
  const dry = d.zeros(1.25);
  d.mix(dry, click(d, 1300, 0.015), 0.7);
  d.mix(dry, thump(d, 180, 80, 0.02, 0.04), 0.6);
  // Lid hinge: a stick-slip squeak that rises as it opens.
  const creak = d.osc(0.28, 'saw', (t) => 240 + 330 * (t / 0.28) ** 2 + 12 * Math.sin(t * 90));
  d.bp(creak, (t) => 900 + 6400 * t, 4);
  d.env(creak, (t) => hump(0.28)(t) * (0.6 + 0.4 * Math.sin(t * 190)));
  d.mix(dry, d.norm(creak, 1), 0.3, 0.06);
  // The reward: a rising run of chimes.
  [587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, i) => d.mix(dry, chime(d, f, 0.1 + i * 0.012), 0.5, 0.3 + i * 0.07));
  return d.norm(d.verb(dry, { time: 0.9, mix: 0.35 }), 0.85);
}

function heal(d: Dsp): Rendered {
  const dur = 1;
  const dry = d.zeros(dur);
  // Warm swell that lifts by about a tone.
  for (const [f, level] of [
    [392, 1],
    [587.33, 0.6],
    [784, 0.35],
  ] as const) {
    d.mix(
      dry,
      d.osc(dur, 'sine', (t) => f * (1 + 0.12 * Math.min(1, t / 0.6) ** 1.5)),
      level,
    );
  }
  d.env(dry, hump(dur, 1.2));
  for (let i = 0; i < 7; i++) d.mix(dry, bubble(d, 900 + i * 260 + d.rand(-60, 60), 6, 0.02), 0.25, 0.12 + i * 0.1 + d.rand(-0.02, 0.02));
  return d.norm(d.verb(dry, { time: 0.8, mix: 0.3 }), 0.8);
}

function cash(d: Dsp): Rendered {
  const out = d.zeros(0.9);
  for (const [at, f] of [
    [0, 3900],
    [0.055, 4700],
    [0.1, 4250],
  ] as const) {
    d.mix(
      out,
      d.modes(
        0.1,
        [
          [f, 0.02, 1],
          [f * 1.43, 0.015, 0.6],
          [f * 2.1, 0.01, 0.4],
        ],
        true,
      ),
      0.5,
      at,
    );
  }
  // Till bell.
  d.mix(
    out,
    d.modes(0.7, [
      [2093, 0.16, 1],
      [2093 * 2.76, 0.09, 0.4],
      [2093 * 4.2, 0.05, 0.2],
    ]),
    0.8,
    0.15,
  );
  d.mix(out, burst(d, 'hp', 4000, 0.7, 0.002), 0.3, 0.15);
  return d.norm(out, 0.8);
}

/** Shop door bell: a small bell on a spring, struck a few times as it swings. */
function doorBell(d: Dsp): Rendered {
  const dry = d.zeros(1.4);
  const strike = (at: number, f: number, level: number): void => {
    d.mix(
      dry,
      d.modes(
        1.2,
        [
          [f, 0.22, 1],
          [f * 2.74, 0.13, 0.55],
          [f * 5.2, 0.08, 0.3],
          [f * 8.1, 0.04, 0.15],
          [f * 0.5, 0.16, 0.2],
        ],
        true,
      ),
      level,
      at,
    );
    d.mix(dry, burst(d, 'hp', 5000, 0.7, 0.0015), level * 0.3, at);
  };
  strike(0, 1568, 1);
  strike(0.14, 1568 * 1.006, 0.6);
  strike(0.24, 1568 * 0.997, 0.4);
  strike(0.31, 1568 * 1.003, 0.25);
  return d.norm(d.verb(dry, { time: 0.5, mix: 0.2 }), 0.8);
}

function jukeboxCoin(d: Dsp): Rendered {
  const out = d.zeros(1.05);
  // Coin against the slot.
  d.mix(
    out,
    d.modes(
      0.12,
      [
        [4100, 0.025, 1],
        [6050, 0.018, 0.6],
        [8300, 0.012, 0.35],
      ],
      true,
    ),
    0.6,
  );
  // Down the chute: ticks that speed up and drop in pitch.
  let at = 0.06;
  let gap = 0.05;
  for (let i = 0; i < 9; i++) {
    d.mix(out, click(d, 2600 - i * 120, 0.006, 0.3), 0.2 + 0.02 * i, at);
    at += gap;
    gap *= 0.84;
  }
  // Into the cash box.
  d.mix(out, thump(d, 210, 120, 0.01, 0.025), 0.7, at + 0.03);
  d.mix(
    out,
    d.modes(
      0.3,
      [
        [1250, 0.06, 1],
        [2890, 0.04, 0.6],
        [4700, 0.03, 0.4],
      ],
      true,
    ),
    0.6,
    at + 0.03,
  );
  // Relay clunk and the mechanism winding up.
  const motor = d.lp(
    d.osc(0.3, 'saw', (t) => 70 + 520 * Math.min(0.25, t)),
    900,
  );
  d.mix(out, d.env(motor, hump(0.3)), 0.25, at + 0.12);
  d.mix(out, click(d, 900, 0.02), 0.5, at + 0.12);
  return d.norm(out, 0.8);
}

function vending(d: Dsp): Rendered {
  const out = d.zeros(1.1);
  d.mix(out, click(d, 1700, 0.01), 0.6);
  // Motor turning the coil.
  const motor = d.osc(0.42, 'saw', (t) => 96 + 6 * Math.sin(t * 50));
  d.mix(motor, d.osc(0.42, 'square', 192.5), 0.4);
  d.lp(d.filter(motor, 'peak', 700, 2, 8), 1800);
  d.env(motor, (t) => Math.min(1, t / 0.03) * Math.min(1, (0.42 - t) / 0.05) * (0.8 + 0.2 * Math.sin(t * 2 * Math.PI * 24)));
  d.mix(out, d.norm(motor, 1), 0.35, 0.05);
  // The can drops and bounces in the tray.
  for (const [at, level, f] of [
    [0.52, 1, 150],
    [0.68, 0.55, 170],
    [0.78, 0.3, 185],
  ] as const) {
    d.mix(out, thump(d, f, f * 0.5, 0.02, 0.035), level, at);
    d.mix(
      out,
      d.modes(
        0.2,
        [
          [820, 0.03, 0.6],
          [1930, 0.02, 0.4],
          [3100, 0.012, 0.3],
        ],
        true,
      ),
      level * 0.6,
      at,
    );
    d.mix(out, burst(d, 'bp', 1200, 0.8, 0.012), level * 0.4, at);
  }
  return d.norm(out, 0.85);
}

function uiClick(d: Dsp): Rendered {
  const out = d.zeros(0.08);
  d.mix(out, d.decay(d.sweep(0.07, 1500, 760, 0.012), 0.012, 0.0008));
  d.mix(out, d.modes(0.06, [[2280, 0.008, 0.3]]));
  d.mix(out, burst(d, 'hp', 5000, 0.7, 0.0012), 0.25);
  return d.norm(out, 0.7);
}

function uiHover(d: Dsp): Rendered {
  const out = d.zeros(0.06);
  d.mix(out, d.decay(d.sweep(0.05, 2300, 2000, 0.01), 0.008, 0.002));
  d.mix(out, burst(d, 'hp', 6000, 0.7, 0.002, 0.001), 0.12);
  return d.norm(out, 0.5);
}

function uiBack(d: Dsp): Rendered {
  const out = d.zeros(0.14);
  d.mix(out, d.decay(d.sweep(0.07, 980, 600, 0.015), 0.012, 0.0008));
  d.mix(out, d.decay(d.sweep(0.08, 720, 430, 0.018), 0.014, 0.0008), 0.8, 0.055);
  d.mix(out, burst(d, 'hp', 4500, 0.7, 0.0012), 0.2);
  return d.norm(out, 0.7);
}

function countdown(d: Dsp): Rendered {
  const out = d.zeros(0.42);
  const f = 659.26;
  d.mix(
    out,
    d.modes(0.4, [
      [f, 0.07, 1],
      [f * 2, 0.045, 0.5],
      [f * 3, 0.03, 0.2],
      [f * 0.5, 0.05, 0.3],
    ]),
  );
  d.mix(out, burst(d, 'bp', 2500, 1.5, 0.003), 0.3);
  return d.norm(out, 0.8);
}

/** Two brassy swells a tritone apart over a low drone: the wall is about to move. */
function zoneWarn(d: Dsp): Rendered {
  const dur = 1.7;
  const dry = d.zeros(dur);
  const swell = (at: number, f: number, len: number): void => {
    const x = d.osc(len, 'saw', (t) => f * (1 - 0.02 * Math.exp(-t / 0.05)));
    d.mix(x, d.osc(len, 'saw', f * 1.007), 0.7);
    d.mix(x, d.osc(len, 'square', f * 0.5), 0.5);
    d.lp(x, (t) => 500 + 2600 * hump(len)(t), 1.4);
    d.mix(dry, d.norm(d.env(x, hump(len, 0.7)), 1), 0.8, at);
  };
  swell(0, 220, 0.6);
  swell(0.62, 155.56, 0.95);
  d.mix(dry, d.env(d.osc(dur, 'sine', 55), hump(dur)), 0.5);
  return d.norm(d.verb(dry, { time: 1.2, mix: 0.3 }), 0.85);
}

/** The wall closing: a sub that climbs, wind drawn in behind it and static along its edge. */
function zoneShrink(d: Dsp): Rendered {
  const dur = 2.8;
  const out = d.stereo(dur);
  // Audible from the first instant, then it grows.
  const rise = (t: number): number => (0.15 + 0.85 * Math.min(1, t / 1.9) ** 2) * Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.7);
  const climb = (t: number): number => (t / dur) ** 2;
  d.mixS(
    out,
    d.env(
      d.osc(dur, 'sine', (t) => 38 + 46 * climb(t)),
      rise,
    ),
    0.9,
  );
  d.mixS(
    out,
    d.env(
      d.lp(
        d.osc(dur, 'saw', (t) => 76 + 92 * climb(t)),
        700,
      ),
      rise,
    ),
    0.5,
  );
  for (const ch of out) {
    const wind = d.bp(d.pink(dur), (t) => 250 + 1900 * climb(t), 1.6);
    d.mix(ch, d.env(wind, rise), 4.5);
    const spark = d.hp(
      d.dust(dur, (t) => 30 + 500 * climb(t)),
      2500,
    );
    d.mix(ch, d.env(spark, rise), 0.35);
  }
  return d.norm(out, 0.9);
}

function thunder(d: Dsp, v: number): Rendered {
  const dur = 5.2;
  const out = d.stereo(dur);
  // The strike: a few cracks close together.
  const strikes: readonly (readonly [number, number])[] =
    v === 0
      ? [
          [0, 1],
          [0.07, 0.7],
          [0.19, 0.5],
        ]
      : [
          [0, 0.8],
          [0.12, 1],
          [0.3, 0.4],
          [0.42, 0.6],
        ];
  for (const [at, level] of strikes) {
    d.mixS(out, burst(d, 'hp', 900, 0.7, 0.03, 0.001), level * 0.8, at, d.rand(-0.6, 0.6));
    d.mixS(out, burst(d, 'bp', 320, 0.7, 0.12, 0.002), level, at, d.rand(-0.4, 0.4));
  }
  d.mixS(out, thump(d, 60, 28, 0.2, 0.5, 0.01), 0.7, 0.02);
  // The roll: dark noise that swells and fades at random as it dies away.
  for (const ch of out) {
    const rumble = d.lp(d.brown(dur), (t) => 90 + 600 * Math.exp(-t / 0.8));
    const roll = d.norm(d.lp(d.white(dur), 3), 1);
    for (let i = 0; i < rumble.length; i++) {
      const t = i / d.sr;
      rumble[i] = rumble[i]! * (0.45 + 0.55 * Math.abs(roll[i]!)) * Math.min(1, t / 0.02) * Math.exp(-t / 1.5);
    }
    d.mix(ch, rumble, 5, 0.03);
  }
  return d.norm(out, 0.95);
}

/** The "go" for the drop: a fast rising run into a held note, with air rushing up underneath. */
function jumpCue(d: Dsp): Rendered {
  const dry = d.zeros(1);
  const stab = (at: number, f: number, len: number, level: number): void => {
    const x = d.osc(len, 'saw', f);
    d.mix(x, d.osc(len, 'saw', f * 1.008), 0.8);
    d.mix(x, d.osc(len, 'square', f * 0.5), 0.4);
    d.lp(x, (t) => 900 + 5000 * Math.exp(-t / 0.08), 1.2);
    d.env(x, (t) => Math.min(1, t / 0.004) * Math.exp(-t / (len * 0.45)));
    d.mix(dry, d.norm(x, 1), level, at);
  };
  stab(0, 587.33, 0.12, 0.7);
  stab(0.09, 739.99, 0.12, 0.8);
  stab(0.18, 880, 0.12, 0.9);
  stab(0.27, 1174.66, 0.7, 1);
  const riser = d.bp(d.white(0.34), (t) => 600 + 78000 * t * t, 2);
  d.mix(
    dry,
    d.env(riser, (t) => (t / 0.34) ** 2),
    0.8,
  );
  d.mix(dry, thump(d, 140, 50, 0.03, 0.08), 0.8, 0.27);
  return d.norm(d.verb(dry, { time: 0.9, mix: 0.3 }), 0.85);
}

// ---------------------------------------------------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------------------------------------------------

function def(render: Recipe['render'], gain: number, range: readonly [number, number], o: Partial<Omit<SoundDef, 'render' | 'gain' | 'range'>> = {}): SoundDef {
  return { render, gain, range, jitter: 0.02, bus: 'sfx', priority: 1, ...o };
}

const UI = { bus: 'ui', priority: 4, jitter: 0 } as const;
const STEP = { variants: 4, jitter: 0.07, priority: 0.6 } as const;
const IMPACT = { variants: 3, jitter: 0.06 } as const;
const HEARD_ANYWHERE = [400, 4000] as const;

/** Every one-shot: how it is made and how it is played. */
export const SOUNDS: Record<SoundName, SoundDef> = {
  shot_pistol: def(shotPistol, 0.85, [8, 110], { priority: 2, jitter: 0.03 }),
  shot_smg: def(shotSmg, 0.8, [8, 100], { priority: 2, jitter: 0.035 }),
  shot_rifle: def(shotRifle, 0.9, [10, 125], { priority: 2, jitter: 0.025 }),
  shot_shotgun: def(shotShotgun, 0.95, [10, 120], { priority: 2, jitter: 0.025 }),
  shot_sniper: def(shotSniper, 1, [12, 160], { priority: 2.5, jitter: 0.02 }),
  reload: def(reload, 0.5, [2, 22]),
  dry_fire: def(dryFire, 0.45, [2, 14], { jitter: 0.04 }),
  equip: def(equip, 0.4, [2, 14], { jitter: 0.04 }),
  shell: def(shell, 0.28, [1.5, 14], { variants: 3, jitter: 0.08, priority: 0.4 }),
  bullet_whiz: def(bulletWhiz, 0.7, [3, 30], { variants: 3, jitter: 0.1, priority: 1.5 }),
  explosion: def(explosion, 1, [14, 260], { priority: 3, jitter: 0.05 }),

  impact_concrete: def(impactConcrete, 0.55, [3, 45], IMPACT),
  impact_metal: def(impactMetal, 0.5, [3, 50], IMPACT),
  impact_wood: def(impactWood, 0.55, [3, 40], IMPACT),
  impact_sand: def(impactSand, 0.5, [3, 30], IMPACT),
  impact_water: def(impactWater, 0.42, [3, 35], IMPACT),
  impact_glass: def(impactGlass, 0.5, [3, 45], { variants: 2, jitter: 0.06 }),
  impact_body: def(impactBody, 0.6, [3, 35], IMPACT),
  headshot: def(headshot, 0.65, [3, 40], { priority: 2 }),
  hit_marker: def(hitMarker, 0.45, [2, 20], UI),
  kill_confirm: def(killConfirm, 0.55, [2, 20], UI),
  damage: def(damage, 0.6, [2, 25], { priority: 3, jitter: 0.04 }),
  shield_break: def(shieldBreak, 0.65, [4, 45], { priority: 2 }),

  step_concrete: def(stepConcrete, 0.38, [2, 25], STEP),
  step_sand: def(stepSand, 0.4, [2, 22], STEP),
  step_wood: def(stepWood, 0.42, [2, 25], STEP),
  step_grass: def(stepGrass, 0.36, [2, 22], STEP),
  step_metal: def(stepMetal, 0.38, [2, 28], STEP),
  step_water: def(stepWater, 0.42, [2, 25], STEP),
  jump: def(jump, 0.35, [2, 20], { jitter: 0.06, priority: 0.6 }),
  land: def(land, 0.5, [2, 28], { jitter: 0.06 }),
  splash: def(splash, 0.7, [4, 60], { jitter: 0.05 }),
  swim_stroke: def(swimStroke, 0.4, [2, 25], { variants: 3, jitter: 0.07, priority: 0.6 }),
  parachute_open: def(parachuteOpen, 0.75, [6, 90], { priority: 2 }),
  cloth_flap: def(clothFlap, 0.35, [3, 35], { variants: 3, jitter: 0.1, priority: 0.5 }),

  car_door: def(carDoor, 0.6, [3, 40], { jitter: 0.04 }),
  horn: def(horn, 0.55, [8, 140], { jitter: 0 }),
  crash: def(crash, 0.9, [6, 110], { priority: 2, jitter: 0.06 }),
  glass_break: def(glassBreak, 0.65, [4, 60], { variants: 2, jitter: 0.06 }),
  boat_slap: def(boatSlap, 0.6, [4, 60], { variants: 3, jitter: 0.08 }),

  pickup: def(pickup, 0.45, [2, 18], { jitter: 0, priority: 2 }),
  chest_open: def(chestOpen, 0.55, [3, 30], { jitter: 0, priority: 2 }),
  heal: def(heal, 0.45, [2, 18], { jitter: 0, priority: 2 }),
  cash: def(cash, 0.45, [2, 20], { jitter: 0.02, priority: 2 }),
  door_bell: def(doorBell, 0.4, [3, 30], { jitter: 0.015 }),
  jukebox_coin: def(jukeboxCoin, 0.5, [2, 20], { jitter: 0.02 }),
  vending: def(vending, 0.55, [3, 25], { jitter: 0.02 }),
  ui_click: def(uiClick, 0.4, [2, 20], UI),
  ui_hover: def(uiHover, 0.22, [2, 20], UI),
  ui_back: def(uiBack, 0.4, [2, 20], UI),
  countdown: def(countdown, 0.5, [2, 20], UI),
  zone_warn: def(zoneWarn, 0.55, HEARD_ANYWHERE, UI),
  zone_shrink: def(zoneShrink, 0.65, HEARD_ANYWHERE, UI),
  thunder: def(thunder, 0.9, HEARD_ANYWHERE, { variants: 2, jitter: 0.08, priority: 2 }),
  jump_cue: def(jumpCue, 0.55, HEARD_ANYWHERE, UI),
};

/** Every one-shot name, for tooling and tests. */
export const SOUND_NAMES = Object.keys(SOUNDS) as SoundName[];
