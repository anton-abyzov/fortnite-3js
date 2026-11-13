/**
 * Messages between the browsers of a friends room. Guests talk to the host only; the host relays
 * what the others need. Everything is JSON. `slot` is a player's seat in the room (0 is the host)
 * and survives a reconnect; signaling peer ids do not.
 */

/** Motor modes, by number on the wire. */
export const MODES = ['ground', 'air', 'swim', 'slide', 'off'] as const;

/** One player's body, 20 times a second, from the browser that simulates it. */
export interface StateMsg {
  k: 'st';
  slot: number;
  /** Sender's clock, seconds. */
  t: number;
  /** Feet position. */
  p: [number, number, number];
  v: [number, number, number];
  /** Body facing, aim yaw and aim pitch. */
  f: number;
  ay: number;
  ap: number;
  /** Index into MODES. */
  m: number;
  /** Crouched. */
  c: 0 | 1;
  /** Weapon in hand, or ''. */
  w: string;
  /** Aiming down the sights, 0..1. */
  a: number;
  /** Vehicle index in `game.vehicles` and seat, or -1. */
  veh: number;
  seat: number;
  /** The vehicle's body when this player drives it: position, rotation, linear and angular velocity. */
  vb?: number[];
}

export interface PlayerInfo {
  slot: number;
  name: string;
  /** Lost the connection; the slot is kept for a while. */
  away: boolean;
  /** In the current round and still standing. */
  alive: boolean;
}

export interface RoundInfo {
  round: number;
  seed: number;
  /** Start point name, for the place banner. */
  place: string;
  /** Feet position and yaw for each slot. */
  spawns: Record<number, [number, number, number]>;
  kit: [string, number, number][];
}

export type EventMsg =
  | { k: 'roster'; players: PlayerInfo[]; you: number; round: number; running: boolean }
  | { k: 'start'; info: RoundInfo }
  /** Back into a running round after a reconnect: where the player was and how they were. */
  | { k: 'resume'; info: RoundInfo; at: [number, number, number, number]; hp: number; ar: number; alive: boolean; dead: number[] }
  | { k: 'shot'; slot: number; w: string; f: [number, number, number]; e: [number, number, number]; hit: string }
  /** A guest asks the host to apply damage it caused (or took from a fall). */
  | { k: 'claim'; target: number; by: number; amount: number; cause: string; w: string; head: boolean; dir: [number, number] }
  /** The host's verdict on damage, to everyone: absolute health and armor afterwards. */
  | { k: 'hurt'; target: number; by: number; amount: number; cause: string; w: string; head: boolean; dir: [number, number]; hp: number; ar: number }
  /** Healing or armor used by a guest; the host applies it. */
  | { k: 'used'; item: string }
  | { k: 'vitals'; slot: number; hp: number; ar: number }
  /** Getting in (`seat` >= 0) or out (-1) of a vehicle. Guest to host is a request; host to all is the verdict. */
  | { k: 'seat'; slot: number; v: number; seat: number }
  | { k: 'seat-deny'; v: number }
  | { k: 'over'; winner: number; time: number }
  | { k: 'leave' }
  | { k: 'refused'; reason: string };

export type NetMsg = StateMsg | EventMsg;

/** Round to centimetres (and milliradians) to keep messages short. */
export function q(n: number, k = 100): number {
  return Math.round(n * k) / k;
}
