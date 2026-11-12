export type QualityName = 'low' | 'medium' | 'high' | 'ultra';

export interface QualityPreset {
  label: string;
  /** Upper bound for devicePixelRatio. */
  pixelRatio: number;
  shadowMapSize: number;
  shadows: boolean;
  msaa: number;
  bloom: boolean;
  ao: boolean;
  /** Vertices per side of the water grid. */
  waterGrid: number;
  drawDistance: number;
  /** Distance inside which characters get full-rate animation and IK. */
  animLodNear: number;
  particles: number;
  propDensity: number;
  /** Real point lights that follow the player between street lamps at night. */
  streetLights: number;
  anisotropy: number;
}

export const QUALITY: Record<QualityName, QualityPreset> = {
  low: {
    label: 'Low',
    pixelRatio: 0.75,
    shadowMapSize: 1024,
    shadows: false,
    msaa: 0,
    bloom: false,
    ao: false,
    waterGrid: 96,
    drawDistance: 900,
    animLodNear: 20,
    particles: 0.4,
    propDensity: 0.5,
    streetLights: 0,
    anisotropy: 2,
  },
  medium: {
    label: 'Medium',
    pixelRatio: 1,
    shadowMapSize: 2048,
    shadows: true,
    msaa: 0,
    bloom: true,
    ao: false,
    waterGrid: 160,
    drawDistance: 1400,
    animLodNear: 30,
    particles: 0.7,
    propDensity: 0.8,
    streetLights: 3,
    anisotropy: 4,
  },
  high: {
    label: 'High',
    pixelRatio: 1,
    shadowMapSize: 3072,
    shadows: true,
    // Four-sample targets at 1080p cost an integrated GPU most of its frame (7 frames a second over the
    // whole city on a Radeon 780M, 50 without). High smooths edges in the post chain; Ultra multisamples.
    msaa: 0,
    bloom: true,
    ao: false,
    waterGrid: 224,
    drawDistance: 2200,
    animLodNear: 40,
    particles: 1,
    propDensity: 1,
    streetLights: 5,
    anisotropy: 8,
  },
  ultra: {
    label: 'Ultra',
    pixelRatio: 1.5,
    shadowMapSize: 4096,
    shadows: true,
    msaa: 4,
    bloom: true,
    ao: true,
    waterGrid: 288,
    drawDistance: 3000,
    animLodNear: 60,
    particles: 1.3,
    propDensity: 1,
    streetLights: 8,
    anisotropy: 16,
  },
};

export interface SettingsData {
  quality: QualityName;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  sensitivity: number;
  invertY: boolean;
  fov: number;
  showFps: boolean;
}

/** What a fresh install starts with, and what "Reset" goes back to. */
export const DEFAULTS: Readonly<SettingsData> = {
  quality: 'high',
  masterVolume: 0.8,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  sensitivity: 1,
  invertY: false,
  fov: 62,
  showFps: false,
};

/** Presets from the lightest to the heaviest, in the order a menu lists them. */
export const QUALITY_NAMES: readonly QualityName[] = ['low', 'medium', 'high', 'ultra'];

/** Slider ends. Values from storage are held to them too, so a hand-edited entry cannot break the game. */
export const LIMITS = {
  masterVolume: [0, 1],
  sfxVolume: [0, 1],
  musicVolume: [0, 1],
  sensitivity: [0.2, 3],
  fov: [50, 100],
} as const satisfies Partial<Record<keyof SettingsData, readonly [number, number]>>;

function within(key: keyof SettingsData, value: number): number {
  const limit = (LIMITS as Partial<Record<keyof SettingsData, readonly [number, number]>>)[key];
  if (!limit) return value;
  return Number.isFinite(value) ? Math.min(limit[1], Math.max(limit[0], value)) : (DEFAULTS[key] as number);
}

const KEY = 'eyewall.settings.v2';
/** The first release saved the engine's own step-downs as if the player had picked them. */
const OLD_KEY = 'eyewall.settings.v1';

export class Settings {
  /** What is in effect now. */
  data: SettingsData;
  /** What the player chose, which is what storage holds. The engine's own step-downs are not in it. */
  private chosen: SettingsData;
  private listeners = new Set<(data: SettingsData, changed: keyof SettingsData) => void>();

  constructor() {
    this.data = { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(KEY);
      const old = raw ? null : localStorage.getItem(OLD_KEY);
      const text = raw ?? old;
      if (text) {
        const saved = JSON.parse(text) as Partial<SettingsData>;
        // An old save's quality may be a step-down nobody asked for: it starts again from the default.
        if (old) delete saved.quality;
        for (const k of Object.keys(DEFAULTS) as (keyof SettingsData)[]) {
          const v = saved[k];
          if (typeof v === typeof DEFAULTS[k]) (this.data as unknown as Record<string, unknown>)[k] = typeof v === 'number' ? within(k, v) : v;
        }
        if (!(this.data.quality in QUALITY)) this.data.quality = DEFAULTS.quality;
      }
    } catch {
      // Storage can be blocked; defaults are fine.
    }
    this.chosen = { ...this.data };
  }

  get quality(): QualityPreset {
    return QUALITY[this.data.quality];
  }

  /** Change a setting. `keep: false` is for this sitting only (the engine shedding quality on a busy GPU). */
  set<K extends keyof SettingsData>(key: K, value: SettingsData[K], keep = true): void {
    if (typeof value === 'number') value = within(key, value) as SettingsData[K];
    if (keep && this.chosen[key] !== value) {
      this.chosen[key] = value;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.chosen));
      } catch {
        // Ignore: settings then last for the session only.
      }
    }
    if (this.data[key] === value) return;
    this.data[key] = value;
    for (const l of this.listeners) l(this.data, key);
  }

  /** Back to the defaults. Listeners hear about each value that changed. */
  reset(): void {
    for (const k of Object.keys(DEFAULTS) as (keyof SettingsData)[]) this.set(k, DEFAULTS[k]);
  }

  onChange(listener: (data: SettingsData, changed: keyof SettingsData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
