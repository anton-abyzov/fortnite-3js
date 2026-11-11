import { ITEMS, type ItemId } from './items';

/** What one combatant carries: a count per item (a weapon counts once). */
export class Inventory {
  readonly counts: Partial<Record<ItemId, number>> = {};

  count(id: ItemId): number {
    return this.counts[id] ?? 0;
  }

  has(id: ItemId): boolean {
    return this.count(id) > 0;
  }

  /** Add up to `n`, limited by what can be carried. Returns how many were taken. */
  add(id: ItemId, n: number = ITEMS[id].stack): number {
    const have = this.count(id);
    const take = Math.max(0, Math.min(n, ITEMS[id].max - have));
    if (take > 0) this.counts[id] = have + take;
    return take;
  }

  /** Remove up to `n`. Returns how many were removed. */
  remove(id: ItemId, n = 1): number {
    const have = this.count(id);
    const take = Math.min(have, n);
    if (take > 0) this.counts[id] = have - take;
    return take;
  }

  clear(): void {
    for (const k of Object.keys(this.counts)) delete this.counts[k as ItemId];
  }
}
