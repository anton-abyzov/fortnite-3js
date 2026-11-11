/** Game-wide constants. The title is a working title: change it here and it changes everywhere. */
export const GAME_TITLE = 'EYEWALL';
export const GAME_SUBTITLE = 'Marazul Bay';
export const GAME_TAGLINE = 'Drop in. Stay inside the eye. Be the last one standing.';

export const FIXED_DT = 1 / 60;
export const MAX_STEPS_PER_FRAME = 4;

/** World scale in metres. X is east, Z is south, Y is up. Sea level is y = 0. */
export const WORLD = {
  half: 640,
  seaLevel: 0,
  /** Street surface height above sea level. */
  streetY: 2.0,
  /** Kerb height: sidewalks and lots sit this far above the street. */
  kerb: 0.16,
  canalBedY: -3.6,
  seaBedY: -9,
  /** Hard boundary for anything that moves. */
  bound: 760,
} as const;

export const GRAVITY = 15;
export const CHARACTER_GRAVITY = 24;

export const MATCH = {
  combatants: 24,
  planeAltitude: 330,
  planeSpeed: 62,
  autoDeployHeight: 75,
} as const;

/** Rapier collision group bits. */
export const GROUP = {
  world: 1 << 0,
  character: 1 << 1,
  vehicle: 1 << 2,
  prop: 1 << 3,
  sensor: 1 << 4,
  loot: 1 << 5,
  door: 1 << 6,
  glass: 1 << 7,
  ragdoll: 1 << 8,
} as const;

export function groups(membership: number, filter: number): number {
  return ((membership & 0xffff) << 16) | (filter & 0xffff);
}

const SOLID = GROUP.world | GROUP.vehicle | GROUP.prop | GROUP.door | GROUP.glass;

export const CG = {
  world: groups(GROUP.world, 0xffff),
  glass: groups(GROUP.glass, 0xffff),
  door: groups(GROUP.door, 0xffff),
  character: groups(GROUP.character, SOLID),
  vehicle: groups(GROUP.vehicle, SOLID | GROUP.character | GROUP.loot | GROUP.ragdoll),
  prop: groups(GROUP.prop, SOLID | GROUP.character),
  loot: groups(GROUP.loot, GROUP.world | GROUP.vehicle),
  sensor: groups(GROUP.sensor, GROUP.character | GROUP.vehicle),
  /** Query masks (membership is "everything", filter selects what a ray or shape can hit). */
  queryWorld: groups(0xffff, GROUP.world | GROUP.door | GROUP.glass),
  querySolid: groups(0xffff, SOLID),
  queryBullet: groups(0xffff, SOLID | GROUP.character),
  queryCharacters: groups(0xffff, GROUP.character),
  queryCamera: groups(0xffff, GROUP.world | GROUP.door),
} as const;
