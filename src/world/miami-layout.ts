import type { Vec3Like } from '../types/game';

export const ISLAND_GROUND_Y = 2.2;
export const CANAL_BED_Y = -4.2;
export const OCEAN_BED_Y = -6.8;
export const BRIDGE_DECK_Y = 5.4;
export const DOCK_DECK_Y = 0.68;

export interface IslandPlateSpec {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY: number;
}

export interface BridgeSpec {
  id: string;
  name: string;
  axis: 'x' | 'z';
  centerX: number;
  centerZ: number;
  spanLength: number;
  rampLength: number;
  width: number;
  deckY: number;
  baseY: number;
}

export interface MarinaDockSpec {
  id: string;
  name: string;
  centerX: number;
  centerZ: number;
  sizeX: number;
  sizeZ: number;
  stairAttachSide: 'west' | 'east';
}

export const MIAMI_ISLANDS: readonly IslandPlateSpec[] = [
  // West Brickell North & South (split by Cross-Town Venetian Canal Z in [-14, 14])
  { id: 'brickell_north', minX: -136, maxX: -24, minZ: -136, maxZ: -14, topY: ISLAND_GROUND_Y },
  { id: 'brickell_south', minX: -136, maxX: -24, minZ: 14, maxZ: 136, topY: ISLAND_GROUND_Y },
  // Barrier Island: North Plaza, Central Ocean Drive Strip, South Point Park
  // Split by North Marina Inlet Z in [-100, -72] and South Inlet Z in [72, 100]
  { id: 'barrier_north', minX: 6, maxX: 50, minZ: -136, maxZ: -100, topY: ISLAND_GROUND_Y },
  { id: 'ocean_drive_central', minX: 6, maxX: 48, minZ: -72, maxZ: 72, topY: ISLAND_GROUND_Y },
  { id: 'south_point', minX: 6, maxX: 50, minZ: 100, maxZ: 136, topY: ISLAND_GROUND_Y },
];

export const MIAMI_BRIDGES: readonly BridgeSpec[] = [
  // Bridges crossing the Main Intracoastal Waterway (X in [-24, 6], width 30m)
  {
    id: 'venetian_north_bridge',
    name: 'Venetian Causeway North',
    axis: 'x',
    centerX: -9,
    centerZ: -38,
    spanLength: 26,
    rampLength: 17,
    width: 10.5,
    deckY: BRIDGE_DECK_Y,
    baseY: ISLAND_GROUND_Y,
  },
  {
    id: 'bayside_south_bridge',
    name: 'Bayside Causeway South',
    axis: 'x',
    centerX: -9,
    centerZ: 38,
    spanLength: 26,
    rampLength: 17,
    width: 10.5,
    deckY: BRIDGE_DECK_Y,
    baseY: ISLAND_GROUND_Y,
  },
  // Bridge crossing West Venetian Cross-Canal (Z in [-14, 14], width 28m)
  {
    id: 'brickell_canal_bridge',
    name: 'Brickell Avenue Canal Bridge',
    axis: 'z',
    centerX: -66,
    centerZ: 0,
    spanLength: 24,
    rampLength: 16,
    width: 10.5,
    deckY: BRIDGE_DECK_Y,
    baseY: ISLAND_GROUND_Y,
  },
  // Bridges along Ocean Blvd crossing North & South Ocean Inlets
  {
    id: 'ocean_blvd_north_inlet_bridge',
    name: 'Ocean Blvd North Inlet Bridge',
    axis: 'z',
    centerX: 35,
    centerZ: -86,
    spanLength: 24,
    rampLength: 15,
    width: 10.0,
    deckY: BRIDGE_DECK_Y,
    baseY: ISLAND_GROUND_Y,
  },
  {
    id: 'ocean_blvd_south_inlet_bridge',
    name: 'Ocean Blvd South Inlet Bridge',
    axis: 'z',
    centerX: 35,
    centerZ: 86,
    spanLength: 24,
    rampLength: 15,
    width: 10.0,
    deckY: BRIDGE_DECK_Y,
    baseY: ISLAND_GROUND_Y,
  },
];

export const MIAMI_DOCKS: readonly MarinaDockSpec[] = [
  {
    id: 'bayside_marina_dock',
    name: 'Bayside Marina Pier',
    centerX: -19.5,
    centerZ: 23,
    sizeX: 8.5,
    sizeZ: 14,
    stairAttachSide: 'west',
  },
  {
    id: 'ocean_drive_yacht_slip',
    name: 'Ocean Drive Yacht Slip',
    centerX: 1.8,
    centerZ: -16,
    sizeX: 8.0,
    sizeZ: 14,
    stairAttachSide: 'east',
  },
  {
    id: 'brickell_canal_dock',
    name: 'Venetian Canal Slip',
    centerX: -46,
    centerZ: -9.8,
    sizeX: 12,
    sizeZ: 7.5,
    stairAttachSide: 'west',
  },
];

export const AIRCRAFT_FLIGHT_PATH = {
  start: { x: 82, y: 142, z: -58 } satisfies Vec3Like,
  end: { x: -72, y: 142, z: 78 } satisfies Vec3Like,
  speedMps: 24,
};

export function sampleWaterBedHeight(x: number, z: number): number {
  // Sloping Atlantic sandy beach along Central Ocean Drive (X from 48 to 95, Z in [-72, 72])
  if (x >= 46 && z >= -72 && z <= 72) {
    const t = Math.max(0, Math.min(1, (x - 48) / 44));
    return ISLAND_GROUND_Y * (1 - t) + OCEAN_BED_Y * t;
  }
  if (x > 52) {
    return OCEAN_BED_Y;
  }
  return CANAL_BED_Y;
}
