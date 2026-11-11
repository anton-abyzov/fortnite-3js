/** Everything a combatant can carry. Names are this game's own. */
export type WeaponId = 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'sniper';
export type AmmoId = 'ammo_light' | 'ammo_medium' | 'ammo_shells' | 'ammo_heavy';
export type ConsumableId = 'bandage' | 'medkit' | 'cola' | 'vest' | 'grenade';
export type ItemId = WeaponId | AmmoId | ConsumableId;

export interface ItemDef {
  id: ItemId;
  name: string;
  kind: 'weapon' | 'ammo' | 'heal' | 'armor' | 'throwable';
  /** Shop price in dollars. */
  price: number;
  /** How many one pickup or one purchase gives. */
  stack: number;
  /** Most a combatant can carry. */
  max: number;
  blurb: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  pistol: { id: 'pistol', name: 'Coral 9', kind: 'weapon', price: 120, stack: 1, max: 1, blurb: 'Sidearm. Quick and accurate.' },
  smg: { id: 'smg', name: 'Mosquito', kind: 'weapon', price: 260, stack: 1, max: 1, blurb: 'Fast-firing, best up close.' },
  rifle: { id: 'rifle', name: 'Tradewind', kind: 'weapon', price: 380, stack: 1, max: 1, blurb: 'Automatic rifle for any range.' },
  shotgun: { id: 'shotgun', name: 'Breakwater 12', kind: 'weapon', price: 320, stack: 1, max: 1, blurb: 'Pump shotgun. Stand close.' },
  sniper: { id: 'sniper', name: 'Longshore', kind: 'weapon', price: 520, stack: 1, max: 1, blurb: 'Bolt-action. One careful shot.' },
  ammo_light: { id: 'ammo_light', name: 'Light rounds', kind: 'ammo', price: 30, stack: 36, max: 240, blurb: 'For the Coral 9 and the Mosquito.' },
  ammo_medium: { id: 'ammo_medium', name: 'Rifle rounds', kind: 'ammo', price: 45, stack: 30, max: 180, blurb: 'For the Tradewind.' },
  ammo_shells: { id: 'ammo_shells', name: 'Shells', kind: 'ammo', price: 40, stack: 10, max: 50, blurb: 'For the Breakwater 12.' },
  ammo_heavy: { id: 'ammo_heavy', name: 'Heavy rounds', kind: 'ammo', price: 60, stack: 8, max: 32, blurb: 'For the Longshore.' },
  bandage: { id: 'bandage', name: 'Bandage', kind: 'heal', price: 25, stack: 3, max: 9, blurb: 'Restores 20 health, up to 75.' },
  medkit: { id: 'medkit', name: 'Medkit', kind: 'heal', price: 90, stack: 1, max: 3, blurb: 'Restores full health.' },
  cola: { id: 'cola', name: 'Cascabel Cola', kind: 'armor', price: 35, stack: 2, max: 6, blurb: 'Adds 25 armor.' },
  vest: { id: 'vest', name: 'Storm vest', kind: 'armor', price: 150, stack: 1, max: 2, blurb: 'Adds 60 armor.' },
  grenade: { id: 'grenade', name: 'Coco frag', kind: 'throwable', price: 70, stack: 2, max: 6, blurb: 'Thrown explosive.' },
};

export const WEAPON_IDS: readonly WeaponId[] = ['pistol', 'smg', 'rifle', 'shotgun', 'sniper'];

export function isItemId(id: string): id is ItemId {
  return id in ITEMS;
}
