export type AssetModelKey =
  | 'miami_convertible'
  | 'miami_jetski'
  | 'miami_speedboat'
  | 'coastal_aircraft';

export interface AssetNormalizationSpec {
  key: AssetModelKey;
  url: string;
  targetLengthZ: number;
  targetWidthX: number;
  targetHeightY: number;
  yawOffsetRad: number;
  groundOffsetY: number;
  roughnessScale: number;
  metalnessFloor: number;
}

export const MODEL_ASSET_MANIFEST: Record<AssetModelKey, AssetNormalizationSpec> = {
  miami_convertible: {
    key: 'miami_convertible',
    url: '/assets/models/miami_convertible.glb',
    targetLengthZ: 4.55,
    targetWidthX: 2.02,
    targetHeightY: 1.32,
    yawOffsetRad: Math.PI,
    groundOffsetY: -0.14,
    roughnessScale: 0.65,
    metalnessFloor: 0.35,
  },
  miami_jetski: {
    key: 'miami_jetski',
    url: '/assets/models/miami_jetski.glb',
    targetLengthZ: 3.15,
    targetWidthX: 1.22,
    targetHeightY: 1.12,
    yawOffsetRad: 0,
    groundOffsetY: -0.18,
    roughnessScale: 0.55,
    metalnessFloor: 0.2,
  },
  miami_speedboat: {
    key: 'miami_speedboat',
    url: '/assets/models/miami_speedboat.glb',
    targetLengthZ: 7.8,
    targetWidthX: 2.55,
    targetHeightY: 2.35,
    yawOffsetRad: 0,
    groundOffsetY: -0.35,
    roughnessScale: 0.58,
    metalnessFloor: 0.22,
  },
  coastal_aircraft: {
    key: 'coastal_aircraft',
    url: '/assets/models/coastal_aircraft.glb',
    targetLengthZ: 15.6,
    targetWidthX: 18.4,
    targetHeightY: 4.6,
    yawOffsetRad: 0,
    groundOffsetY: 0,
    roughnessScale: 0.5,
    metalnessFloor: 0.3,
  },
};
