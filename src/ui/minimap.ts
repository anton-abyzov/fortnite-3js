import type { Character } from '../character/character';
import { WORLD } from '../core/config';
import { damp, lerp, smoothstep } from '../core/math';
import type { Game } from '../game';
import { Cell, type WorldField } from '../world/field';
import { el } from './dom';

/** Metres across the small map once the player is on the ground. */
const NEAR_SPAN = 520;
/** Metres across the whole chart. */
const FULL_SPAN = WORLD.half * 2;
/** Side of the small map on the page, in CSS pixels (hud.css says the same). */
const MINI_PX = 208;
const TAU = Math.PI * 2;

const INK = 'rgba(6, 16, 26, 0.8)';
const DEEP = '#0e2f43';
/** The wall as it stands, and where it will stand next. The page legend uses the same two colours. */
const EYE = '#35e0c8';
const NEXT = '#ffd166';
const STORM = 'rgba(40, 24, 78, 0.5)';
const FOAM = '#f4fbfa';
const CORAL = '#ff7a59';

/** Chart colours by cell type, three numbers each, in the order of `Cell`. */
const CHART: readonly number[] = [
  14, 47, 67, // water
  43, 58, 70, // road
  134, 153, 162, // sidewalk
  232, 238, 240, // building
  217, 197, 143, // sand
  79, 168, 122, // grass
  176, 158, 196, // plaza
  168, 130, 90, // pier
  96, 114, 128, // bridge
  104, 120, 130, // yard
  74, 168, 255, // pool
  88, 104, 116, // lot
];

/** Metres the seaplane flies from one side of the bay to the other. */
const RUN = 1800;

/** How many gunshots the map remembers at once. */
const BLIPS = 12;
/** Seconds a gunshot stays on the map, and how near it has to be to show at all. */
const BLIP_LIFE = 2.4;
const BLIP_REACH = 140;

/** Paint the city once, one pixel per cell of the world grid: water, sand, streets, roofs. */
function paintChart(field: WorldField): HTMLCanvasElement {
  const n = field.size;
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(n, n);
  const d = image.data;
  const { type, shore, height } = field;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const t = type[k]!;
      let r = CHART[t * 3] ?? 0;
      let g = CHART[t * 3 + 1] ?? 0;
      let b = CHART[t * 3 + 2] ?? 0;
      if (t === Cell.Water) {
        // Lighter in the shallows, so the shore reads without an outline.
        const deep = Math.min(1, shore[k]! / 34);
        r = lerp(27, r, deep);
        g = lerp(88, g, deep);
        b = lerp(108, b, deep);
      } else if (t === Cell.Building) {
        const edge = (i > 0 && type[k - 1] !== t) || (i < n - 1 && type[k + 1] !== t) || (j > 0 && type[k - n] !== t) || (j < n - 1 && type[k + n] !== t);
        // Towers are paler than low roofs; every roof has a dark edge.
        const tall = edge ? 0.56 : lerp(0.8, 1.04, Math.min(1, Math.max(0, (height[k]! - 6) / 70)));
        r *= tall;
        g *= tall;
        b *= tall;
      }
      const o = k * 4;
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = b;
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** What the last drawing of a map put on it, for tests. */
export interface MapShown {
  /** World point at the middle of the map, and the metres it spans. */
  cx: number;
  cz: number;
  span: number;
  /** Canvas pixels along one side. */
  size: number;
  /** The wall, the next circle, the line to it, the seaplane's route. */
  eye: boolean;
  next: boolean;
  guide: boolean;
  route: boolean;
  blips: number;
  /** How many times this map has been drawn. */
  draws: number;
}

const newShown = (): MapShown => ({ cx: 0, cz: 0, span: FULL_SPAN, size: 0, eye: false, next: false, guide: false, route: false, blips: 0, draws: 0 });

/**
 * The map in the corner and the full chart on M. The city is painted once from the world grid;
 * each frame adds what moves: the player, the eye of the storm and where it will close to, the
 * seaplane's run, and rivals who give themselves away by firing nearby. North is up.
 */
export class Minimap {
  readonly root = el('div', 'minimap');
  readonly full = el('div', 'fullmap');
  /** The full chart is up. */
  open = false;
  readonly shown = newShown();
  readonly fullShown = newShown();
  private readonly canvas = el('canvas', 'minimap-canvas');
  private readonly ctx: CanvasRenderingContext2D;
  private readonly fullCanvas = el('canvas', 'fullmap-canvas');
  private readonly fullCtx: CanvasRenderingContext2D;
  private readonly chart = el('div', 'fullmap-chart');
  private base: HTMLCanvasElement | null = null;
  /** Everything a drawing depends on, rounded: a map is drawn again only when one of these moves. */
  private readonly now = new Float64Array(24);
  private readonly drawn = new Float64Array(24).fill(Number.NaN);
  private readonly fullDrawn = new Float64Array(24).fill(Number.NaN);
  /** 1 while the player is up in the air and the small map shows the whole bay, 0 on the ground. */
  private air = -1;
  private readonly blipX = new Float32Array(BLIPS);
  private readonly blipZ = new Float32Array(BLIPS);
  private readonly blipUntil = new Float64Array(BLIPS);
  private blipNext = 0;
  private focus: Character | null = null;
  private fallen: Character | null = null;
  private yaw = 0;
  /** Dash patterns for the canvas scale in use, kept so a drawing makes no new arrays. */
  private dashScale = 0;
  private dashNext: number[] = [];
  private dashRoute: number[] = [];
  private readonly solid: number[] = [];

  constructor(
    private readonly game: Game,
    private readonly ui: HTMLElement,
  ) {
    this.ctx = this.canvas.getContext('2d')!;
    this.fullCtx = this.fullCanvas.getContext('2d')!;
    const hint = el('span', 'minimap-key');
    hint.append(el('kbd', 'key key-small', 'M'), ' Map');
    this.root.append(this.canvas, el('span', 'minimap-north', 'N'), hint);

    const panel = el('div', 'fullmap-panel');
    const head = el('header', 'fullmap-head');
    const legend = el('div', 'fullmap-legend');
    for (const [cls, text] of [
      ['you', 'You'],
      ['eye', 'The eye now'],
      ['next', 'Where it closes to'],
    ] as const) {
      const item = el('span', 'legend-item');
      item.append(el('i', `legend-mark ${cls}`), text);
      legend.append(item);
    }
    const close = el('span', 'fullmap-close');
    close.append(el('kbd', 'key key-small', 'M'), ' Close');
    head.append(el('h2', 'fullmap-title', 'Marazul Bay'), legend, close);
    this.chart.append(this.fullCanvas, el('span', 'fullmap-north', 'N'));
    const layout = game.world.layout;
    const place = (name: string, x: number, z: number, cls: string): void => {
      const label = el('span', cls, name);
      label.style.left = `${((x + WORLD.half) / FULL_SPAN) * 100}%`;
      label.style.top = `${((z + WORLD.half) / FULL_SPAN) * 100}%`;
      this.chart.append(label);
    };
    for (const p of layout.pois) place(p.name, p.x, p.z, p.r < 70 ? 'map-label minor' : 'map-label');
    for (const i of layout.islets) place(i.name, i.x, i.z, 'map-label minor');
    panel.append(head, this.chart);
    this.full.append(panel);

    window.addEventListener('keydown', (e) => {
      if (e.repeat || game.phase !== 'match' || !game.input.enabled) return;
      if (e.code === 'KeyM') this.toggle();
      else if (e.code === 'Escape' && this.open) {
        this.toggle(false);
        // The key closed the chart: it is not also a request to pause.
        e.stopImmediatePropagation();
      }
    });
    window.addEventListener('resize', () => {
      this.drawn.fill(Number.NaN);
      this.fullDrawn.fill(Number.NaN);
    });
    game.events.on('phase', (phase) => {
      if (phase !== 'match') this.toggle(false);
      this.reset();
    });
    game.events.on('shot', ({ by, x, z }) => {
      const focus = this.focus;
      if (!focus || by === focus || by === game.player) return;
      if (Math.hypot(x - focus.visual.x, z - focus.visual.z) > BLIP_REACH) return;
      const i = this.blipNext;
      this.blipNext = (i + 1) % BLIPS;
      this.blipX[i] = x;
      this.blipZ[i] = z;
      this.blipUntil[i] = game.engine.time + BLIP_LIFE;
    });
  }

  /** Put the full chart up or away. */
  toggle(open = !this.open): void {
    if (open === this.open) return;
    this.open = open;
    this.full.classList.toggle('show', open);
    this.ui.classList.toggle('map-open', open);
    this.fullDrawn.fill(Number.NaN);
  }

  /** A new round, or a fresh start: forget what was on the map. */
  private reset(): void {
    this.air = -1;
    this.blipUntil.fill(0);
    this.drawn.fill(Number.NaN);
    this.fullDrawn.fill(Number.NaN);
  }

  /**
   * Bring the maps up to date. `focus` is who the map follows (the player, or whoever they are
   * watching), `fallen` the player once they are out, `yaw` the way the view faces.
   */
  update(dt: number, focus: Character, fallen: Character | null, yaw: number): void {
    const g = this.game;
    if (!this.base) this.base = paintChart(g.world.field);
    this.focus = focus;
    this.fallen = fallen;
    this.yaw = yaw;
    const p = focus.visual;
    // From the air the whole bay is in view; coming down, the map closes in around the player.
    const high = focus.state === 'plane' || focus.state === 'freefall' ? 1 : 0;
    this.air = this.air < 0 ? high : damp(this.air, high, 2.4, dt);
    if (Math.abs(this.air - high) < 0.004) this.air = high;
    const k = smoothstep(0, 1, this.air);
    const span = lerp(NEAR_SPAN, FULL_SPAN, k);
    const cx = lerp(p.x, 0, k);
    const cz = lerp(p.z, 0, k);

    const zone = g.zone;
    const drop = g.drop;
    const time = g.engine.time;
    let blips = 0;
    for (let i = 0; i < BLIPS; i++) if (this.blipUntil[i]! > time) blips++;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const n = this.now;
    n[0] = Math.round(cx * 2);
    n[1] = Math.round(cz * 2);
    n[2] = Math.round(span);
    n[3] = Math.round(p.x * 2);
    n[4] = Math.round(p.z * 2);
    n[5] = Math.round(yaw * 40);
    const storm = zone.stage !== 'idle';
    n[6] = storm ? Math.round(zone.x * 2) : 0;
    n[7] = storm ? Math.round(zone.z * 2) : 0;
    n[8] = storm ? Math.round(zone.radius * 2) : -1;
    n[9] = storm ? Math.round(zone.nextX * 2) : 0;
    n[10] = storm ? Math.round(zone.nextZ * 2) : 0;
    n[11] = storm ? Math.round(zone.nextRadius * 2) : -1;
    n[12] = zone.stage === 'idle' ? 0 : zone.stage === 'hold' ? 1 : zone.stage === 'shrink' ? 2 : 3;
    n[13] = drop.flying ? Math.round(drop.travelled / 3) : -1;
    // A gunshot fades: while one is showing, the map is drawn a dozen times a second.
    n[14] = blips > 0 ? Math.floor(time * 12) : -1;
    n[15] = focus.alive ? 1 : 0;
    n[16] = fallen ? Math.round(fallen.visual.x) * 4096 + Math.round(fallen.visual.z) : -1;
    n[17] = dpr;
    n[18] = focus.id;

    if (this.changed(this.drawn)) {
      const size = Math.round(MINI_PX * dpr);
      if (this.canvas.width !== size) {
        this.canvas.width = size;
        this.canvas.height = size;
      }
      this.draw(this.ctx, this.shown, size, size / MINI_PX, cx, cz, span);
    }
    if (this.open && this.changed(this.fullDrawn)) {
      const css = this.chart.clientWidth || 560;
      const size = Math.round(css * dpr);
      if (this.fullCanvas.width !== size) {
        this.fullCanvas.width = size;
        this.fullCanvas.height = size;
      }
      this.draw(this.fullCtx, this.fullShown, size, size / css, 0, 0, FULL_SPAN);
    }
  }

  /** True when what a map depends on has moved since `seen`; `seen` is brought up to date. */
  private changed(seen: Float64Array): boolean {
    const n = this.now;
    let moved = false;
    for (let i = 0; i < n.length; i++) {
      if (seen[i] !== n[i]) {
        moved = true;
        seen[i] = n[i]!;
      }
    }
    return moved;
  }

  /** Draw one map: `size` canvas pixels a side, `u` canvas pixels to a CSS pixel, centred on a world point. */
  private draw(ctx: CanvasRenderingContext2D, shown: MapShown, size: number, u: number, cx: number, cz: number, span: number): void {
    const g = this.game;
    const s = size / span;
    const half = size / 2;
    if (u !== this.dashScale) {
      this.dashScale = u;
      this.dashNext = [6 * u, 5 * u];
      this.dashRoute = [2 * u, 5 * u];
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setLineDash(this.solid);
    ctx.globalAlpha = 1;
    ctx.fillStyle = DEEP;
    ctx.fillRect(0, 0, size, size);

    // The city: the part of the chart this map covers.
    const base = this.base!;
    const cell = FULL_SPAN / base.width;
    const sx = (cx - span / 2 + WORLD.half) / cell;
    const sy = (cz - span / 2 + WORLD.half) / cell;
    const sw = span / cell;
    const x0 = Math.max(0, sx);
    const y0 = Math.max(0, sy);
    const x1 = Math.min(base.width, sx + sw);
    const y1 = Math.min(base.height, sy + sw);
    if (x1 > x0 && y1 > y0) {
      const f = size / sw;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(base, x0, y0, x1 - x0, y1 - y0, (x0 - sx) * f, (y0 - sy) * f, (x1 - x0) * f, (y1 - y0) * f);
    }

    const focus = this.focus!;
    const fx = (focus.visual.x - cx) * s + half;
    const fy = (focus.visual.z - cz) * s + half;
    const zone = g.zone;
    shown.eye = false;
    shown.next = false;
    shown.guide = false;
    if (zone.stage !== 'idle') {
      // Everything outside the wall is storm.
      const ex = (zone.x - cx) * s + half;
      const ey = (zone.z - cz) * s + half;
      const er = Math.max(0, zone.radius * s);
      ctx.fillStyle = STORM;
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      ctx.arc(ex, ey, er, 0, TAU);
      ctx.fill('evenodd');
      if (zone.stage !== 'closed') {
        // Where the wall is going: a broken line, or a mark when it closes to nothing.
        const nx = (zone.nextX - cx) * s + half;
        const ny = (zone.nextZ - cz) * s + half;
        const nr = zone.nextRadius * s;
        ctx.setLineDash(this.dashNext);
        this.ring(ctx, nx, ny, Math.max(nr, 3 * u), NEXT, 2.2 * u);
        ctx.setLineDash(this.solid);
        shown.next = true;
        // Outside it: a line from the player to its nearest edge.
        const out = zone.outsideNext(focus.visual.x, focus.visual.z);
        if (out > 2 && focus.alive && focus.state !== 'plane') {
          const dx = nx - fx;
          const dy = ny - fy;
          const d = Math.hypot(dx, dy) || 1;
          const reach = out * s;
          this.line(ctx, fx, fy, fx + (dx / d) * reach, fy + (dy / d) * reach, NEXT, 2.4 * u);
          shown.guide = true;
        }
      }
      this.ring(ctx, ex, ey, er, EYE, 2.6 * u);
      shown.eye = true;
    }

    // The seaplane's run across the bay, while it is still in the air.
    const drop = g.drop;
    shown.route = drop.flying;
    if (drop.flying) {
      const ax = (drop.start.x - cx) * s + half;
      const ay = (drop.start.z - cz) * s + half;
      const run = RUN * s;
      ctx.globalAlpha = 0.7;
      ctx.setLineDash(this.dashRoute);
      this.line(ctx, ax, ay, ax + drop.dir.x * run, ay + drop.dir.z * run, FOAM, 1.6 * u);
      ctx.setLineDash(this.solid);
      ctx.globalAlpha = 1;
      if (focus.state !== 'plane') this.arrow(ctx, (drop.planePos.x - cx) * s + half, (drop.planePos.z - cz) * s + half, Math.atan2(drop.dir.x, -drop.dir.z), u * 0.8, NEXT);
    }

    // Gunfire nearby gives a rival away for a moment.
    const time = g.engine.time;
    shown.blips = 0;
    for (let i = 0; i < BLIPS; i++) {
      const left = this.blipUntil[i]! - time;
      if (left <= 0) continue;
      shown.blips++;
      const bx = (this.blipX[i]! - cx) * s + half;
      const by = (this.blipZ[i]! - cz) * s + half;
      ctx.globalAlpha = Math.min(1, left / (BLIP_LIFE * 0.6));
      ctx.fillStyle = CORAL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2 * u;
      ctx.beginPath();
      ctx.arc(bx, by, 3.4 * u, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Where the player fell, once they are watching someone else.
    const fallen = this.fallen;
    if (fallen && fallen !== focus) {
      const px = (fallen.visual.x - cx) * s + half;
      const py = (fallen.visual.z - cz) * s + half;
      const a = 4.5 * u;
      this.line(ctx, px - a, py - a, px + a, py + a, CORAL, 2 * u);
      this.line(ctx, px - a, py + a, px + a, py - a, CORAL, 2 * u);
    }
    // Yaw turns left for positive angles; on a north-up map that is anticlockwise. Someone out
    // past the edge of the chart is shown at its edge.
    const edge = 9 * u;
    this.arrow(ctx, Math.min(size - edge, Math.max(edge, fx)), Math.min(size - edge, Math.max(edge, fy)), -this.yaw, u, fallen && fallen !== focus ? EYE : FOAM);

    shown.cx = cx;
    shown.cz = cz;
    shown.span = span;
    shown.size = size;
    shown.draws++;
  }

  /** A circle with a dark edge under it, so it shows over pale roofs and dark water alike. */
  private ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width: number): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.strokeStyle = INK;
    ctx.lineWidth = width * 1.9;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  private line(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, color: string, width: number): void {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = width * 1.9;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  /** A pointer at a spot, turned clockwise from north by `turn` radians. */
  private arrow(ctx: CanvasRenderingContext2D, x: number, y: number, turn: number, u: number, color: string): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.beginPath();
    ctx.moveTo(0, -8.5 * u);
    ctx.lineTo(6 * u, 6.5 * u);
    ctx.lineTo(0, 3 * u);
    ctx.lineTo(-6 * u, 6.5 * u);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6 * u;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}
