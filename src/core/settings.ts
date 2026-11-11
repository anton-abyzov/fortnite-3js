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
    anisotropy: 4,
  },
  high: {
    label: 'High',
    pixelRatio: 1,
    shadowMapSize: 3072,
    shadows: true,
    msaa: 4,
    bloom: true,
    ao: false,
    waterGrid: 224,
    drawDistance: 2200,
    animLodNear: 40,
    particles: 1,
    propDensity: 1,
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

const DEFAULTS: SettingsData = {
  quality: 'high',
  masterVolume: 0.8,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  sensitivity: 1,
  invertY: false,
  fov: 62,
  showFps: false,
};

const KEY = 'eyewall.settings.v1';

export class Settings {
  data: SettingsData;
  private listeners = new Set<(data: SettingsData, changed: keyof SettingsData) => void>();

  constructor() {
    this.data = { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SettingsData>;
        for (const k of Object.keys(DEFAULTS) as (keyof SettingsData)[]) {
          if (typeof saved[k] === typeof DEFAULTS[k]) (this.data as unknown as Record<string, unknown>)[k] = saved[k];
        }
        if (!(this.data.quality in QUALITY)) this.data.quality = DEFAULTS.quality;
      }
    } catch {
      // Storage can be blocked; defaults are fine.
    }
  }

  get quality(): QualityPreset {
    return QUALITY[this.data.quality];
  }

  set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    if (this.data[key] === value) return;
    this.data[key] = value;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Ignore: settings then last for the session only.
    }
    for (const l of this.listeners) l(this.data, key);
  }

  onChange(listener: (data: SettingsData, changed: keyof SettingsData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
