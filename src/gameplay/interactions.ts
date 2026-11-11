import { Vector3 } from 'three';
import type { Character } from '../character/character';

/** Something a character can use by walking up to it and pressing the interact key. */
export interface Interactable {
  /** Short tag for bots, tests and sounds: 'vehicle', 'door', 'shop-item', 'loot', 'chest'... */
  kind: string;
  /** Where it is. Keep the vector and move it if the thing moves. */
  position: Vector3;
  /** Reach in metres, measured from the character's chest. */
  radius: number;
  /** Words after the key hint, e.g. "Drive" or "Buy medkit ($40)". */
  label: string | ((c: Character) => string);
  /** Return false to hide it for this character (a full car, an empty fridge). */
  available?(c: Character): boolean;
  use(c: Character): void;
  /** The object behind it (a vehicle, a shop item), for lookups. */
  ref?: unknown;
  /** Larger wins when several are in reach. Default 0. */
  priority?: number;
}

const _chest = new Vector3();
const _to = new Vector3();

/** Everything that can be used, and the rule for which one a character is offered. */
export class Interactions {
  readonly items: Interactable[] = [];

  add(item: Interactable): Interactable {
    this.items.push(item);
    return item;
  }

  remove(item: Interactable): void {
    const i = this.items.indexOf(item);
    if (i >= 0) this.items.splice(i, 1);
  }

  /**
   * The one to offer: in reach, available, and of those the highest priority, then the one closest to
   * where the character is looking (`look` is a unit vector, usually the camera's forward).
   */
  find(c: Character, look?: Vector3): Interactable | null {
    _chest.copy(c.position);
    _chest.y += 1.0;
    let best: Interactable | null = null;
    let bestScore = -Infinity;
    for (const item of this.items) {
      _to.subVectors(item.position, _chest);
      const d = _to.length();
      if (d > item.radius) continue;
      if (item.available && !item.available(c)) continue;
      let score = (item.priority ?? 0) * 100 - d;
      if (look && d > 0.4) score += (_to.dot(look) / d) * 2.5;
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    return best;
  }

  labelOf(item: Interactable, c: Character): string {
    return typeof item.label === 'string' ? item.label : item.label(c);
  }
}
