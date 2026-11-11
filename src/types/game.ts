export type DropPhase = 'aircraft' | 'freefall' | 'canopy' | 'grounded' | 'swimming' | 'driving';

export type VehicleKind = 'convertible' | 'suv' | 'jetski' | 'speedboat';

export type WeaponId = 'carbine' | 'shotgun' | 'smg' | 'marksman';

export type TimePreset = 'dawn' | 'noon' | 'sunset' | 'night';

export type RenderMode = 'realtime' | 'pathtraced';

export type SurfaceMaterial = 'asphalt' | 'concrete' | 'sand' | 'wood' | 'tile' | 'grass' | 'water' | 'metal';

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface WeaponSpec {
  id: WeaponId;
  name: string;
  rpm: number;
  damage: number;
  pellets: number;
  spreadRad: number;
  muzzleSpeed: number;
  range: number;
  magSize: number;
  reloadSec: number;
  recoilKick: number;
  colorHex: number;
}

export interface ShopItemSpec {
  id: string;
  label: string;
  kind: 'weapon' | 'medkit' | 'shield' | 'cafecito' | 'ammo' | 'register';
  weaponId?: WeaponId;
  position: Vec3Like;
  collected: boolean;
}

export interface ShopDefinition {
  id: string;
  name: string;
  subtitle: string;
  themeColor: string;
  accentHex: number;
  center: Vec3Like;
  size: Vec3Like;
  doorSide: 'north' | 'south' | 'east' | 'west';
  hasRooftopStairs: boolean;
  items: ShopItemSpec[];
}

export interface WaveSample {
  height: number;
  normalX: number;
  normalY: number;
  normalZ: number;
  foam: number;
}

export interface InputState {
  forward: number;
  right: number;
  jump: boolean;
  jumpJustPressed: boolean;
  sprint: boolean;
  crouch: boolean;
  interactJustPressed: boolean;
  fire: boolean;
  aim: boolean;
  reloadJustPressed: boolean;
  handbrake: boolean;
  weaponSlot: number | null;
  yawDelta: number;
  pitchDelta: number;
}

export interface TelemetrySnapshot {
  ready: boolean;
  phase: DropPhase;
  renderMode: RenderMode;
  pathTracerSamples: number;
  timeHours: number;
  sunElevationDeg: number;
  fps: number;
  playerPos: Vec3Like;
  playerVel: Vec3Like;
  health: number;
  shield: number;
  stamina: number;
  speedBoostSec: number;
  activeWeapon: WeaponId;
  ammoInMag: number;
  reserveAmmo: number;
  aliveBots: number;
  eliminations: number;
  activeVehicleId: string | null;
  activeVehicleKind: VehicleKind | null;
  activeVehicleSpeedKmh: number;
  currentShopId: string | null;
  currentShopName: string | null;
  stormRadius: number;
  outsideStorm: boolean;
  matchEnded: boolean;
  victory: boolean;
  gaitCadenceHz: number;
  leftFootPlanted: boolean;
  rightFootPlanted: boolean;
}
