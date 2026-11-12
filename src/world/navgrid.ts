import { GROUP, groups, WORLD } from '../core/config';
import type { Rng } from '../core/rng';
import type { Physics } from '../physics/physics';
import { Cell, type WorldField } from './field';
import { type Layout, STAIR } from './layout';

/** What a navigation cell is to someone on foot. */
export const enum Nav {
  /** Buildings, walls, planters, quay edges: no way through. */
  Blocked = 0,
  Land = 1,
  /** Walkable, but cars use it: paths prefer the pavement. */
  Road = 2,
  /** Deep enough to swim. Nobody walks into it on purpose. */
  Water = 3,
  /** Where a swimmer can get out: canal stairs and the beach. */
  Exit = 4,
}

const SIZE = 512;
const CELLS = SIZE * SIZE;
/** Things that stop a walker and never move: the city, street furniture, doors and windows. */
const OBSTACLES = groups(0xffff, GROUP.world | GROUP.prop | GROUP.door | GROUP.glass);
/** Step cost per cell kind, in tenths of a cell. */
const COST = [0, 10, 15, 42, 12];
/** Extra cost for a cell that touches something solid, so paths keep off walls. */
const WALL_COST = 14;
const DIAGONAL = Math.SQRT2;
/** Longest straight leg a smoothed path keeps, metres. */
const MAX_LEG = 45;
const STAIR_LENGTH = STAIR.steps * STAIR.run;

const NX = [1, -1, 0, 0, 1, 1, -1, -1];
const NZ = [0, 0, 1, -1, 1, -1, 1, -1];

/**
 * A coarse grid of where people on foot can go, built once from the finished city. It answers
 * "is this spot open", "where is open ground near here" and "how do I walk from A to B".
 */
export class NavGrid {
  readonly size = SIZE;
  readonly cell = (WORLD.half * 2) / SIZE;
  readonly kind = new Uint8Array(CELLS);
  /** Distance in metres to the nearest cell that is not open ground, capped at 30. */
  readonly open = new Float32Array(CELLS);
  private readonly cost = new Uint8Array(CELLS);
  /** 1 where the ground is a bridge or pier deck over water. */
  private readonly under = new Uint8Array(CELLS);
  // Search state, reused between searches; `stamp` says which search a cell's numbers belong to.
  private readonly g = new Float32Array(CELLS);
  private readonly parent = new Int32Array(CELLS);
  private readonly stamp = new Uint32Array(CELLS);
  private readonly closed = new Uint32Array(CELLS);
  private search = 0;
  private readonly heap: number[] = [];
  private readonly heapF: number[] = [];
  private readonly chain: number[] = [];
  /** Milliseconds the build took, and counts per kind, for the load report and tests. */
  buildMs = 0;
  readonly counts = [0, 0, 0, 0, 0];
  /** Searches run and cells expanded since the start, for the performance report. */
  searches = 0;
  expanded = 0;
  /**
   * Ways out of the water: swim to (x, z), then walk straight to (inX, inZ) on dry ground.
   * Canal stairs and stretches of beach.
   */
  readonly exits: { x: number; z: number; inX: number; inZ: number }[] = [];
  /** Which canal stair a cell belongs to, plus one; zero for none. */
  private readonly stairOf = new Int16Array(CELLS);
  private readonly stairs: { x: number; z: number; topX: number; topZ: number }[] = [];

  constructor(
    private readonly field: WorldField,
    layout: Layout,
    physics: Physics,
  ) {
    const t0 = performance.now();
    const n = SIZE;
    const c = this.cell;
    const q = c / 4;
    const kind = this.kind;
    for (let j = 0; j < n; j++) {
      const z = (j + 0.5) * c - WORLD.half;
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * c - WORLD.half;
        let water = 0;
        let road = 0;
        let sand = 0;
        let blocked = false;
        // The four quarters of the cell: all of them must be clear for the cell to be.
        for (let s = 0; s < 4 && !blocked; s++) {
          const qx = x + (s & 1 ? q : -q);
          const qz = z + (s & 2 ? q : -q);
          const k = field.index(qx, qz);
          const t = field.type[k]! as Cell;
          if (t === Cell.Water) {
            water++;
            // Water by the map, but near a shore something may stand in it: a bank, the side of the
            // steps, a pile. A gentle sand bed is only the shallows.
            if (field.isWater(qx - 2.6, qz) && field.isWater(qx + 2.6, qz) && field.isWater(qx, qz - 2.6) && field.isWater(qx, qz + 2.6)) continue;
            const hit = physics.raycast(qx, 2.4, qz, 0, -1, 0, 3.6, OBSTACLES);
            // (The lip of a quay overhead does not count.)
            if (hit && hit.distance > 0.5 && (hit.owner?.surface !== 'sand' || Math.abs(hit.normal.y) < 0.7)) blocked = true;
            continue;
          }
          if (t === Cell.Building || t === Cell.Pool) {
            blocked = true;
            break;
          }
          if (t === Cell.Road || t === Cell.Yard) road++;
          else if (t === Cell.Sand) sand++;
          // Standing room: the ground is where the map says, with nothing on it up to head height.
          const h = field.height[k]!;
          const hit = physics.raycast(qx, h + 2.2, qz, 0, -1, 0, 3.4, OBSTACLES);
          if (!hit || hit.distance < 1.6 || hit.distance > 3.1) blocked = true;
        }
        // A parapet, a fence or a post can stand between the four quarters: feel across the cell at
        // knee height, both ways. Ramps and steps do not count.
        if (!blocked && water === 0) {
          const y = field.height[field.index(x, z)]! + 0.6;
          const across = physics.raycast(x - c / 2, y, z, 1, 0, 0, c, OBSTACLES);
          if (across && Math.abs(across.normal.y) < 0.4) blocked = true;
          else {
            const along = physics.raycast(x, y, z - c / 2, 0, 0, 1, c, OBSTACLES);
            if (along && Math.abs(along.normal.y) < 0.4) blocked = true;
          }
        }
        let v: Nav;
        if (blocked) v = Nav.Blocked;
        else if (water === 4) v = Nav.Water;
        // Half in the water: a beach is a way out, a quay edge is a drop.
        else if (water > 0) v = sand + water === 4 ? Nav.Exit : Nav.Blocked;
        else v = road >= 2 ? Nav.Road : Nav.Land;
        kind[j * n + i] = v;
      }
    }
    this.computeOpen();
    // Along the beach, one way out every few cells of waterline.
    for (let j = 0; j < n; j += 3) {
      for (let i = 0; i < n; i += 3) {
        const k = j * n + i;
        if (kind[k] !== Nav.Exit) continue;
        const x = this.cellX(k);
        const z = this.cellZ(k);
        if (this.nearestOpen(x, z, 2.5, 30, _spot)) this.exits.push({ x, z, inX: _spot.x, inZ: _spot.z });
      }
    }
    // Canal stairs run from the quay down into the water. Only the last steps are deep enough to swim
    // onto: those are the way out, and the rest is ground that nobody reaches from the water beside it.
    const stairOf = this.stairOf;
    for (let n = 0; n < layout.stairs.length; n++) {
      const st = layout.stairs[n]!;
      const dx = st.dir === 'e' ? 1 : st.dir === 'w' ? -1 : 0;
      const dz = st.dir === 's' ? 1 : st.dir === 'n' ? -1 : 0;
      for (let s = STAIR_LENGTH + 1.2; s >= -2.2; s -= 0.6) {
        const k = this.index(st.x + dx * s, st.z + dz * s);
        if (s >= STAIR_LENGTH - 1) kind[k] = Nav.Exit;
        else if (stairOf[k] !== n + 1) kind[k] = Nav.Land;
        stairOf[k] = n + 1;
      }
      // The flanks of the steps stand in the water beside them like a wall, down to the last few.
      for (let s = 0; s < STAIR_LENGTH - 1.6; s += 0.6) {
        for (let off = -st.width / 2; off <= st.width / 2 + 0.01; off += st.width / 6) {
          const k = this.index(st.x + dx * s - dz * off, st.z + dz * s + dx * off);
          if (stairOf[k] !== n + 1 && kind[k] === Nav.Water) kind[k] = Nav.Blocked;
        }
      }
      // Line up beyond the foot, then straight up the middle to a stride onto the quay.
      this.stairs.push({ x: st.x + dx * (STAIR_LENGTH + 0.6), z: st.z + dz * (STAIR_LENGTH + 0.6), topX: st.x - dx * 1.2, topZ: st.z - dz * 1.2 });
    }
    // Decks with water underneath: a walker's ground, a swimmer's water.
    for (let k = 0; k < CELLS; k++) {
      const t = field.type[field.index(this.cellX(k), this.cellZ(k))];
      if (t === Cell.Bridge || t === Cell.Pier) this.under[k] = 1;
    }
    for (const st of layout.stairs) {
      const dx = st.dir === 'e' ? 1 : st.dir === 'w' ? -1 : 0;
      const dz = st.dir === 's' ? 1 : st.dir === 'n' ? -1 : 0;
      // The foot of the steps, and a couple of strides in from the top.
      this.exits.push({ x: st.x + dx * (STAIR_LENGTH + 0.6), z: st.z + dz * (STAIR_LENGTH + 0.6), inX: st.x - dx * 3, inZ: st.z - dz * 3 });
    }
    for (let k = 0; k < CELLS; k++) this.counts[kind[k]!]!++;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        const v = kind[k]!;
        let cost = COST[v]!;
        if (v === Nav.Land || v === Nav.Road) {
          for (let d = 0; d < 8; d++) {
            const ni = i + NX[d]!;
            const nj = j + NZ[d]!;
            if (ni < 0 || nj < 0 || ni >= n || nj >= n || kind[nj * n + ni] === Nav.Blocked) {
              cost += WALL_COST;
              break;
            }
          }
        }
        this.cost[k] = cost;
      }
    }
    this.buildMs = performance.now() - t0;
  }

  /** Chamfer distance from every open land cell to the nearest cell that is anything else. */
  private computeOpen(): void {
    const n = SIZE;
    const d = this.open;
    const kind = this.kind;
    const cap = 30 / this.cell;
    for (let k = 0; k < CELLS; k++) d[k] = kind[k] === Nav.Land || kind[k] === Nav.Road ? cap : 0;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        if (i > 0) v = Math.min(v, d[k - 1]! + 1);
        else v = Math.min(v, 1);
        if (j > 0) {
          v = Math.min(v, d[k - n]! + 1);
          if (i > 0) v = Math.min(v, d[k - n - 1]! + DIAGONAL);
          if (i < n - 1) v = Math.min(v, d[k - n + 1]! + DIAGONAL);
        } else v = Math.min(v, 1);
        d[k] = v;
      }
    }
    for (let j = n - 1; j >= 0; j--) {
      for (let i = n - 1; i >= 0; i--) {
        const k = j * n + i;
        let v = d[k]!;
        if (v === 0) continue;
        if (i < n - 1) v = Math.min(v, d[k + 1]! + 1);
        if (j < n - 1) {
          v = Math.min(v, d[k + n]! + 1);
          if (i < n - 1) v = Math.min(v, d[k + n + 1]! + DIAGONAL);
          if (i > 0) v = Math.min(v, d[k + n - 1]! + DIAGONAL);
        }
        d[k] = v;
      }
    }
    for (let k = 0; k < CELLS; k++) d[k] = d[k]! * this.cell;
  }

  index(x: number, z: number): number {
    const c = this.cell;
    const i = Math.min(SIZE - 1, Math.max(0, Math.floor((x + WORLD.half) / c)));
    const j = Math.min(SIZE - 1, Math.max(0, Math.floor((z + WORLD.half) / c)));
    return j * SIZE + i;
  }

  cellX(k: number): number {
    return ((k % SIZE) + 0.5) * this.cell - WORLD.half;
  }

  cellZ(k: number): number {
    return (Math.floor(k / SIZE) + 0.5) * this.cell - WORLD.half;
  }

  kindAt(x: number, z: number): Nav {
    return this.kind[this.index(x, z)]! as Nav;
  }

  /** True where someone can stand and walk. */
  walkable(x: number, z: number): boolean {
    const v = this.kind[this.index(x, z)]!;
    return v === Nav.Land || v === Nav.Road || v === Nav.Exit;
  }

  /** Metres of open ground around a point, capped at 30. */
  openness(x: number, z: number): number {
    return this.open[this.index(x, z)]!;
  }

  /**
   * The closest cell to a point that has at least `room` metres of open ground around it.
   * Writes its centre to `out` and returns true, or returns false when none is within `reach`.
   */
  nearestOpen(x: number, z: number, room: number, reach: number, out: { x: number; z: number }): boolean {
    const n = SIZE;
    const c = this.cell;
    const ci = Math.min(n - 1, Math.max(0, Math.floor((x + WORLD.half) / c)));
    const cj = Math.min(n - 1, Math.max(0, Math.floor((z + WORLD.half) / c)));
    const rings = Math.ceil(reach / c);
    const open = this.open;
    const kind = this.kind;
    const ok = (k: number): boolean => (room > 0 ? open[k]! >= room : kind[k] === Nav.Land || kind[k] === Nav.Road || kind[k] === Nav.Exit);
    let best = -1;
    let bestD = Infinity;
    for (let r = 0; r <= rings; r++) {
      // Once something is found, one more ring is enough to be sure nothing nearer was missed.
      if (best >= 0 && r * c > Math.sqrt(bestD) + c) break;
      for (let j = cj - r; j <= cj + r; j++) {
        if (j < 0 || j >= n) continue;
        const edge = j === cj - r || j === cj + r;
        for (let i = ci - r; i <= ci + r; i += edge ? 1 : 2 * r || 1) {
          if (i < 0 || i >= n) continue;
          const k = j * n + i;
          if (!ok(k)) continue;
          const dx = (i + 0.5) * c - WORLD.half - x;
          const dz = (j + 0.5) * c - WORLD.half - z;
          const d = dx * dx + dz * dz;
          if (d < bestD) {
            bestD = d;
            best = k;
          }
        }
      }
    }
    if (best < 0) return false;
    out.x = this.cellX(best);
    out.z = this.cellZ(best);
    return true;
  }

  /** The way out of the water closest to a point, or null on a map with none. */
  nearestExit(x: number, z: number): { x: number; z: number; inX: number; inZ: number } | null {
    let best = null;
    let bestD = Infinity;
    for (const e of this.exits) {
      const d = (e.x - x) * (e.x - x) + (e.z - z) * (e.z - z);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  /** Index of the closest cell of one kind within `rings` cells of a point, or -1. */
  private nearestKind(x: number, z: number, want: Nav, rings: number): number {
    const n = SIZE;
    const c = this.cell;
    const ci = Math.min(n - 1, Math.max(0, Math.floor((x + WORLD.half) / c)));
    const cj = Math.min(n - 1, Math.max(0, Math.floor((z + WORLD.half) / c)));
    let best = -1;
    let bestD = Infinity;
    for (let j = Math.max(0, cj - rings); j <= Math.min(n - 1, cj + rings); j++) {
      for (let i = Math.max(0, ci - rings); i <= Math.min(n - 1, ci + rings); i++) {
        const k = j * n + i;
        if (this.kind[k] !== want) continue;
        const d = Math.hypot((i + 0.5) * c - WORLD.half - x, (j + 0.5) * c - WORLD.half - z);
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }
    }
    return best;
  }

  /** A random open spot within `r` metres of a point, or false when a dozen tries find none. */
  randomOpen(rng: Rng, x: number, z: number, r: number, room: number, out: { x: number; z: number }): boolean {
    for (let i = 0; i < 14; i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = r * Math.sqrt(rng.next());
      const px = x + Math.cos(a) * d;
      const pz = z + Math.sin(a) * d;
      const k = this.index(px, pz);
      const v = this.kind[k]!;
      if (v !== Nav.Land && v !== Nav.Road) continue;
      if (this.open[k]! < room) continue;
      out.x = this.cellX(k);
      out.z = this.cellZ(k);
      return true;
    }
    return this.nearestOpen(x, z, room, r, out);
  }

  /**
   * True when the straight line between two points stays on walkable ground, with shoulder room.
   * Between two points in the water it must stay in the water; `swimming` counts the water under a
   * bridge or a pier too.
   */
  lineOpen(ax: number, az: number, bx: number, bz: number, swimming = false): boolean {
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) return true;
    const kind = this.kind;
    const under = this.under;
    const ka = this.index(ax, az);
    const kb = this.index(bx, bz);
    const swim = (kind[ka] === Nav.Water || (swimming && under[ka] === 1)) && (kind[kb] === Nav.Water || (swimming && under[kb] === 1));
    const ux = dx / len;
    const uz = dz / len;
    // Two more lines half a metre to each side, so the leg does not clip a corner.
    const sx = -uz * 0.55;
    const sz = ux * 0.55;
    const steps = Math.ceil(len / 1.1);
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * len;
      const px = ax + ux * t;
      const pz = az + uz * t;
      for (let side = -1; side <= 1; side++) {
        const k = this.index(px + sx * side, pz + sz * side);
        const v = kind[k]!;
        if (swim) {
          if (v !== Nav.Water && !(swimming && under[k] === 1)) return false;
        } else if (v === Nav.Blocked || v === Nav.Water) return false;
      }
    }
    return true;
  }

  private push(k: number, f: number): void {
    const heap = this.heap;
    const hf = this.heapF;
    let i = heap.length;
    heap.push(k);
    hf.push(f);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (hf[p]! <= f) break;
      heap[i] = heap[p]!;
      hf[i] = hf[p]!;
      i = p;
    }
    heap[i] = k;
    hf[i] = f;
  }

  private pop(): number {
    const heap = this.heap;
    const hf = this.heapF;
    const top = heap[0]!;
    const k = heap.pop()!;
    const f = hf.pop()!;
    const n = heap.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let c = i * 2 + 1;
        if (c >= n) break;
        if (c + 1 < n && hf[c + 1]! < hf[c]!) c++;
        if (hf[c]! >= f) break;
        heap[i] = heap[c]!;
        hf[i] = hf[c]!;
        i = c;
      }
      heap[i] = k;
      hf[i] = f;
    }
    return top;
  }

  /**
   * Walk from A to B: fills `out` with waypoints (x, z pairs, the last one the goal or the closest
   * reachable point to it) and returns true when the goal itself was reached. A start in the water
   * swims to the nearest way out; nobody is sent into the water from land. Pass `swimming` for
   * someone in the water, who may be under a bridge and cannot use its deck.
   */
  findPath(ax: number, az: number, bx: number, bz: number, out: number[], swimming = false, maxExpand = 30000): boolean {
    out.length = 0;
    const n = SIZE;
    const kind = this.kind;
    const under = this.under;
    const spot = _spot;
    let start = this.index(ax, az);
    if (swimming && under[start] === 0 && kind[start] !== Nav.Water && kind[start] !== Nav.Exit) {
      // In the water beside a quay, on a cell the grid calls solid: start from the water next to it.
      const w = this.nearestKind(ax, az, Nav.Water, 6);
      if (w < 0) return false;
      start = w;
    } else if (kind[start] === Nav.Blocked) {
      // Standing somewhere the grid calls solid (a roof, a pier, a quay edge): leave by the nearest open cell.
      if (!this.nearestOpen(ax, az, 0, 60, spot)) return false;
      start = this.index(spot.x, spot.z);
    }
    let goal = this.index(bx, bz);
    let exact = true;
    if (kind[goal] === Nav.Blocked || (kind[goal] === Nav.Water && kind[start] !== Nav.Water)) {
      if (!this.nearestOpen(bx, bz, 0, 40, spot)) return false;
      goal = this.index(spot.x, spot.z);
      exact = false;
    }
    this.searches++;
    if (start === goal) {
      out.push(exact ? bx : this.cellX(goal), exact ? bz : this.cellZ(goal));
      return true;
    }
    const id = ++this.search;
    const g = this.g;
    const parent = this.parent;
    const stamp = this.stamp;
    const closed = this.closed;
    const cost = this.cost;
    const gi = goal % n;
    const gj = Math.floor(goal / n);
    this.heap.length = 0;
    this.heapF.length = 0;
    g[start] = 0;
    parent[start] = -1;
    stamp[start] = id;
    this.push(start, 0);
    let best = start;
    let bestH = Infinity;
    let found = false;
    let count = 0;
    while (this.heap.length > 0) {
      const k = this.pop();
      if (closed[k] === id) continue;
      closed[k] = id;
      if (k === goal) {
        found = true;
        break;
      }
      if (++count > maxExpand) break;
      const i = k % n;
      const j = (k - i) / n;
      const from = swimming && under[k] === 1 ? Nav.Water : kind[k]!;
      const gk = g[k]!;
      for (let d = 0; d < 8; d++) {
        const ni = i + NX[d]!;
        const nj = j + NZ[d]!;
        if (ni < 0 || nj < 0 || ni >= n || nj >= n) continue;
        const nk = nj * n + ni;
        if (closed[nk] === id) continue;
        const to = swimming && under[nk] === 1 ? Nav.Water : kind[nk]!;
        if (to === Nav.Blocked) continue;
        // Into the water only from the water; out of it only by a way out.
        if (to === Nav.Water && from !== Nav.Water) continue;
        if ((to === Nav.Land || to === Nav.Road) && from === Nav.Water) continue;
        // No squeezing past a corner: of a wall, or of a quay or a deck with water beside it.
        if (d >= 4) {
          const a = kind[j * n + ni]!;
          const b = kind[nj * n + i]!;
          if (a === Nav.Blocked || b === Nav.Blocked) continue;
          if (from !== Nav.Water && (a === Nav.Water || b === Nav.Water)) continue;
        }
        const ng = gk + cost[nk]! * (d >= 4 ? DIAGONAL : 1);
        if (stamp[nk] === id && g[nk]! <= ng) continue;
        stamp[nk] = id;
        g[nk] = ng;
        parent[nk] = k;
        const di = Math.abs(ni - gi);
        const dj = Math.abs(nj - gj);
        const h = 10 * (Math.max(di, dj) + (DIAGONAL - 1) * Math.min(di, dj));
        if (h < bestH) {
          bestH = h;
          best = nk;
        }
        this.push(nk, ng + h);
      }
    }
    this.expanded += count;
    const end = found ? goal : best;
    if (end === start) return false;
    // Back along the parents, then keep only the corners.
    const chain = this.chain;
    chain.length = 0;
    for (let k = end; k !== -1; k = parent[k]!) chain.push(k);
    chain.reverse();
    let anchorX = ax;
    let anchorZ = az;
    let prev = 0;
    const stairOf = this.stairOf;
    for (let s = swimming && stairOf[start]! > 0 ? 0 : 1; s < chain.length; s++) {
      const k = chain[s]!;
      const x = this.cellX(k);
      const z = this.cellZ(k);
      const st = stairOf[k]!;
      if (swimming && st > 0 && kind[k] === Nav.Exit) {
        // Out of the water by canal steps: line up beyond the foot, then straight up the middle.
        const e = this.stairs[st - 1]!;
        if (s > prev + 1) out.push(this.cellX(chain[s - 1]!), this.cellZ(chain[s - 1]!));
        out.push(e.x, e.z, e.topX, e.topZ);
        while (s + 1 < chain.length && stairOf[chain[s + 1]!] === st) s++;
        anchorX = e.topX;
        anchorZ = e.topZ;
        prev = s;
        swimming = false;
        continue;
      }
      const far = Math.hypot(x - anchorX, z - anchorZ) > MAX_LEG;
      if (s > prev + 1 && (far || !this.lineOpen(anchorX, anchorZ, x, z, swimming))) {
        const p = chain[s - 1]!;
        anchorX = this.cellX(p);
        anchorZ = this.cellZ(p);
        out.push(anchorX, anchorZ);
        prev = s - 1;
      }
    }
    if (found && exact) out.push(bx, bz);
    else out.push(this.cellX(end), this.cellZ(end));
    return found;
  }
}

const _spot = { x: 0, z: 0 };
