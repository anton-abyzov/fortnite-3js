import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { ITEMS, type ItemId } from '../gameplay/items';
import type { ShopType } from './layout';

/** A rectangle of the atlas in UV space, v0 at the bottom. */
export interface Region {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

interface Px {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SIZE = 2048;
const FONT = '"Futura", "Century Gothic", "Avenir Next", "Gill Sans", "Trebuchet MS", "DejaVu Sans", sans-serif';
const SCRIPT = '"Brush Script MT", "Snell Roundhand", "Segoe Script", "URW Chancery L", cursive';

/** What each kind of shop sells, in the order the counter lists it. The gacha pull is the arcade's own. */
export const STOCK: Record<ShopType, readonly (ItemId | 'gacha')[]> = {
  market: ['bandage', 'cola', 'medkit'],
  ammo: ['pistol', 'smg', 'shotgun', 'rifle', 'sniper', 'ammo_light', 'ammo_medium', 'ammo_shells', 'ammo_heavy', 'grenade'],
  pharmacy: ['bandage', 'medkit', 'vest'],
  surf: ['vest', 'cola'],
  cafe: ['cola', 'bandage'],
  arcade: ['gacha', 'cola'],
};

export const GACHA_PRICE = 40;
/** One can from a drinks machine. The counter sells the same cola by the pair. */
export const VENDING_PRICE = 20;

const BOARD_TITLE: Record<ShopType, string> = {
  market: 'Fresh today',
  ammo: 'Range stock',
  pharmacy: 'Care counter',
  surf: 'Beach gear',
  cafe: 'La carta',
  arcade: 'Prizes and play',
};

export const ARCADE_TITLES = ['TIDE RACER', 'STAR MANGO', 'REEF RUN', 'EYE STORM', 'COCO DROP', 'PALM PANIC'] as const;

/**
 * One texture for everything inside the shops: the furniture kits' colour charts, the wall posters
 * and the signs, screens and floor patterns drawn here. Every interior is then a single material, and
 * one shop's furniture, walls and signs are a single draw call.
 */
export class ShopAtlas {
  readonly texture: CanvasTexture;
  readonly white: Region;
  readonly tile: Region;
  readonly plank: Region;
  readonly carpet: Region;
  readonly concrete: Region;
  readonly posters: Region[] = [];
  readonly boards = {} as Record<ShopType, Region>;
  readonly screens: Region[] = [];
  readonly marquees: Region[] = [];
  readonly boardsSurf: Region[] = [];
  readonly cross: Region;
  readonly open: Region;
  readonly jukebox: Region;
  readonly vending: Region;
  readonly mirror: Region;
  readonly curtain: Region;
  readonly target: Region;
  readonly till: Region;
  readonly mat: Region;
  readonly clock: Region;
  readonly crate: Region;
  readonly espresso: Region;
  readonly speaker: Region;
  readonly signs = {} as Record<'fitting' | 'pay' | 'cold' | 'prizes' | 'gacha' | 'rx' | 'order' | 'boards', Region>;
  /** Each shop's name on a plate, for the glass over its door. */
  readonly names = new Map<string, Region>();
  /** Top-left pixel of each kit's 512 px colour chart. */
  private kits = new Map<string, Px>();
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  /** Rows of the atlas: where each starts, how tall it is and how much of its width is taken. */
  private shelves: { y: number; h: number; x: number }[] = [];
  private y = 0;

  constructor(kitImages: { name: string; image: CanvasImageSource }[], posterImages: CanvasImageSource[], shopNames: readonly string[] = []) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    const ctx = this.canvas.getContext('2d')!;
    this.ctx = ctx;

    for (const kit of kitImages) {
      const r = this.alloc(512, 512, 0);
      ctx.drawImage(kit.image, r.x, r.y, 512, 512);
      this.kits.set(kit.name, r);
    }
    // Tallest first: the packer fills rows, and a row is as tall as the first thing put in it.
    for (const img of posterImages) {
      this.posters.push(
        this.draw(288, 432, (c, w, h) => {
          c.drawImage(img, 0, 0, w, h);
        }),
      );
    }
    this.vending = this.draw(200, 400, drawVending);
    for (let i = 0; i < 4; i++) this.boardsSurf.push(this.draw(88, 360, (c, w, h) => drawSurfboard(c, w, h, i)));
    for (const type of Object.keys(STOCK) as ShopType[]) this.boards[type] = this.draw(448, 300, (c, w, h) => drawBoard(c, w, h, type));
    this.jukebox = this.draw(200, 300, drawJukebox);
    this.curtain = this.draw(128, 256, drawCurtain, 1);
    this.cross = this.draw(224, 224, drawCross);
    this.mirror = this.draw(96, 224, drawMirror);
    this.tile = this.draw(128, 128, drawTile, 3);
    this.plank = this.draw(128, 128, drawPlank, 1);
    this.carpet = this.draw(128, 128, drawCarpet, 1);
    this.concrete = this.draw(128, 128, drawConcrete, 1);
    this.crate = this.draw(128, 128, drawCrate, 1);
    this.target = this.draw(128, 128, drawTarget);
    this.mat = this.draw(256, 128, drawMat);
    this.open = this.draw(256, 120, drawOpen);
    for (let i = 0; i < 6; i++) this.screens.push(this.draw(128, 112, (c, w, h) => drawScreen(c, w, h, i)));
    this.espresso = this.draw(160, 96, drawEspresso);
    this.clock = this.draw(96, 96, drawClock);
    this.speaker = this.draw(64, 64, drawSpeaker, 1);
    this.white = this.draw(40, 40, (c, w, h) => {
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, w, h);
    }, 8);
    this.till = this.draw(64, 48, drawTill);
    for (let i = 0; i < 6; i++) this.marquees.push(this.draw(160, 44, (c, w, h) => drawMarquee(c, w, h, i)));
    const sign = (text: string, bg: string, fg: string): Region => this.draw(256, 60, (c, w, h) => drawSign(c, w, h, text, bg, fg));
    this.signs.fitting = sign('FITTING ROOMS', '#12303f', '#ffd166');
    this.signs.pay = sign('PAY HERE', '#0b1d2a', '#35e0c8');
    this.signs.cold = sign('COLD DRINKS', '#0e3a5c', '#bfeaff');
    this.signs.prizes = sign('PRIZE COUNTER', '#2a1b52', '#ff8ac0');
    this.signs.gacha = sign(`GACHA  $${GACHA_PRICE}`, '#3a1140', '#ffd166');
    this.signs.rx = sign('PRESCRIPTIONS', '#0f3b33', '#b6ffe6');
    this.signs.order = sign('ORDER HERE', '#40170f', '#ffd9a0');
    this.signs.boards = sign('BOARDS AND RENTALS', '#0e3a5c', '#ffd166');
    for (const name of shopNames) {
      if (!this.names.has(name)) this.names.set(name, this.draw(288, 56, (c, w, h) => drawSign(c, w, h, name.toUpperCase(), '#101c26', '#fff3d6')));
    }

    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.minFilter = LinearMipmapLinearFilter;
    this.texture.magFilter = LinearFilter;
    this.texture.anisotropy = 4;
  }

  /** Where a kit model's texture coordinate lands in the atlas. `v` runs down the kit's image, as in glTF. */
  kitUv(kit: string, u: number, v: number, out: [number, number]): void {
    const r = this.kits.get(kit)!;
    // Kit coordinates point into flat swatches; keep them off the very edge of the chart.
    const cu = Math.min(0.998, Math.max(0.002, u - Math.floor(u === 1 ? 0 : u)));
    const cv = Math.min(0.998, Math.max(0.002, v - Math.floor(v === 1 ? 0 : v)));
    out[0] = (r.x + cu * r.w) / SIZE;
    out[1] = 1 - (r.y + cv * r.h) / SIZE;
  }

  /** A free slot: in the lowest row that is tall enough and has the width left, or in a new row. */
  private alloc(w: number, h: number, pad = 3): Px {
    const fw = w + pad * 2;
    const fh = h + pad * 2;
    let shelf: { y: number; h: number; x: number } | null = null;
    for (const s of this.shelves) if (s.h >= fh && s.x + fw <= SIZE && (!shelf || s.h < shelf.h)) shelf = s;
    if (!shelf) {
      if (this.y + fh > SIZE) throw new Error('shop atlas is full');
      shelf = { y: this.y, h: fh, x: 0 };
      this.shelves.push(shelf);
      this.y += fh;
    }
    const r = { x: shelf.x + pad, y: shelf.y + pad, w, h };
    shelf.x += fw;
    return r;
  }

  /**
   * Draw a picture into a free slot. `bleed` repeats the picture's edge outward, for patterns that
   * are tiled in the world: without it distant tiles would pick up their neighbours in the atlas.
   */
  private draw(w: number, h: number, paint: (c: CanvasRenderingContext2D, w: number, h: number) => void, bleed = 0): Region {
    const pad = 3 + bleed * 4;
    const r = this.alloc(w, h, pad);
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    paint(ctx, w, h);
    ctx.restore();
    if (bleed > 0) {
      const p = pad - 1;
      // Smear the outermost pixels into the padding.
      ctx.drawImage(this.canvas, r.x, r.y, w, 1, r.x, r.y - p, w, p);
      ctx.drawImage(this.canvas, r.x, r.y + h - 1, w, 1, r.x, r.y + h, w, p);
      ctx.drawImage(this.canvas, r.x, r.y - p, 1, h + p * 2, r.x - p, r.y - p, p, h + p * 2);
      ctx.drawImage(this.canvas, r.x + w - 1, r.y - p, 1, h + p * 2, r.x + w, r.y - p, p, h + p * 2);
    }
    const inset = 0.5;
    return { u0: (r.x + inset) / SIZE, v0: 1 - (r.y + h - inset) / SIZE, u1: (r.x + w - inset) / SIZE, v1: 1 - (r.y + inset) / SIZE };
  }
}

type Ctx2 = CanvasRenderingContext2D;

/** Small repeatable noise for the hand-drawn patterns. */
function dice(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function rounded(c: Ctx2, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function text(c: Ctx2, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', weight = 800, font = FONT): void {
  c.font = `${weight} ${size}px ${font}`;
  c.textAlign = align;
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(s, x, y);
}

/** One floor tile: near white so the shop's own colours tint it, with a grout line round the edge. */
function drawTile(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#c9c9c4';
  c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#eeeeea');
  c.fillStyle = g;
  c.fillRect(2, 2, w - 4, h - 4);
  const r = dice(7);
  c.globalAlpha = 0.05;
  c.fillStyle = '#6b6b66';
  for (let i = 0; i < 90; i++) c.fillRect(3 + r() * (w - 8), 3 + r() * (h - 8), 2 + r() * 3, 1 + r() * 2);
  c.globalAlpha = 1;
}

function drawPlank(c: Ctx2, w: number, h: number): void {
  const r = dice(11);
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const tone = 222 + Math.floor(r() * 30);
    c.fillStyle = `rgb(${tone},${tone - 6},${tone - 16})`;
    c.fillRect(0, (i * h) / rows, w, h / rows);
    c.fillStyle = 'rgba(70,50,30,0.16)';
    c.fillRect(0, (i * h) / rows, w, 1.5);
    // Board ends, staggered row to row.
    c.fillRect(((i * 0.37 + 0.2) % 1) * w, (i * h) / rows, 1.5, h / rows);
    c.globalAlpha = 0.07;
    c.fillStyle = '#5a3d22';
    for (let k = 0; k < 9; k++) c.fillRect(r() * w, (i * h) / rows + 3 + r() * (h / rows - 6), 14 + r() * 30, 1);
    c.globalAlpha = 1;
  }
}

/** Arcade carpet: dark, with bright scraps scattered over it. */
function drawCarpet(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#b9b3d6';
  c.fillRect(0, 0, w, h);
  const r = dice(23);
  const hues = ['#ff5fa8', '#35e0c8', '#ffd166', '#8a5cf5', '#ffffff'];
  for (let i = 0; i < 34; i++) {
    const x = r() * w;
    const y = r() * h;
    c.save();
    c.translate(x, y);
    c.rotate(r() * 6.28);
    c.fillStyle = hues[Math.floor(r() * hues.length)]!;
    const kind = Math.floor(r() * 3);
    if (kind === 0) c.fillRect(-5, -1.5, 10, 3);
    else if (kind === 1) {
      c.beginPath();
      c.moveTo(-4, 3);
      c.lineTo(4, 3);
      c.lineTo(0, -4);
      c.closePath();
      c.fill();
    } else {
      c.beginPath();
      c.arc(0, 0, 2.6, 0, 6.28);
      c.fill();
    }
    c.restore();
  }
}

function drawConcrete(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#e9e9e6';
  c.fillRect(0, 0, w, h);
  const r = dice(31);
  for (let i = 0; i < 160; i++) {
    c.globalAlpha = 0.03 + r() * 0.04;
    c.fillStyle = r() > 0.5 ? '#ffffff' : '#70706c';
    c.beginPath();
    c.arc(r() * w, r() * h, 3 + r() * 12, 0, 6.28);
    c.fill();
  }
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(80,80,76,0.3)';
  c.fillRect(0, 0, w, 1.5);
  c.fillRect(0, 0, 1.5, h);
}

/** A chalkboard listing what the shop sells and for how much, from the item table itself. */
function drawBoard(c: Ctx2, w: number, h: number, type: ShopType): void {
  c.fillStyle = '#16252c';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = '#c99a5b';
  c.lineWidth = 10;
  c.strokeRect(5, 5, w - 10, h - 10);
  text(c, BOARD_TITLE[type], w / 2, 44, 34, '#ffd166', 'center', 600, SCRIPT);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(60, 68, w - 120, 2);
  const stock = STOCK[type];
  const rows = stock.length;
  const two = rows > 5;
  const perCol = two ? Math.ceil(rows / 2) : rows;
  const rowH = Math.min(40, (h - 100) / perCol);
  const size = Math.min(22, rowH * 0.62);
  stock.forEach((id, i) => {
    const col = two ? Math.floor(i / perCol) : 0;
    const x0 = two ? 26 + col * (w / 2 - 6) : 70;
    const x1 = two ? x0 + w / 2 - 40 : w - 70;
    const y = 92 + (i % perCol) * rowH + rowH / 2;
    const name = id === 'gacha' ? 'Gacha pull' : ITEMS[id].name;
    const price = id === 'gacha' ? GACHA_PRICE : ITEMS[id].price;
    text(c, name, x0, y, size, '#f4fbfa', 'left', 600);
    text(c, `$${price}`, x1, y, size, '#7ff0dc', 'right', 800);
    const nameW = c.measureText(`$${price}`).width;
    c.font = `600 ${size}px ${FONT}`;
    const from = x0 + c.measureText(name).width + 8;
    c.fillStyle = 'rgba(244,251,250,0.3)';
    for (let x = from; x < x1 - nameW - 8; x += 7) c.fillRect(x, y + size * 0.3, 2, 2);
  });
}

/** Attract screens for the arcade cabinets: small scenes of this game's own invention. */
function drawScreen(c: Ctx2, w: number, h: number, i: number): void {
  const r = dice(100 + i * 13);
  const px = (x: number, y: number, s: number, color: string): void => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), s, s);
  };
  if (i === 0) {
    // A road running into a setting sun.
    const sky = c.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#2a1b52');
    sky.addColorStop(1, '#ff5fa8');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd166';
    c.beginPath();
    c.arc(w / 2, h * 0.55, 26, Math.PI, 0);
    c.fill();
    c.fillStyle = '#12092b';
    c.fillRect(0, h * 0.55, w, h * 0.45);
    c.fillStyle = '#3b2f6e';
    c.beginPath();
    c.moveTo(w / 2 - 4, h * 0.55);
    c.lineTo(w / 2 + 4, h * 0.55);
    c.lineTo(w * 0.86, h);
    c.lineTo(w * 0.14, h);
    c.closePath();
    c.fill();
    for (let k = 0; k < 5; k++) {
      const t = (k + 0.5) / 5;
      c.fillStyle = '#35e0c8';
      c.fillRect(w / 2 - 1 - t * 2, h * 0.55 + t * t * h * 0.45, 2 + t * 4, 3 + t * 6);
    }
    c.fillStyle = '#ff7a59';
    c.fillRect(w / 2 - 9, h - 22, 18, 9);
    c.fillStyle = '#fff6e4';
    c.fillRect(w / 2 - 6, h - 26, 12, 5);
  } else if (i === 1) {
    // Fruit among the stars.
    c.fillStyle = '#060b1e';
    c.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) px(r() * w, r() * h, 1 + Math.floor(r() * 2), r() > 0.7 ? '#ffd166' : '#9fb4ff');
    for (let k = 0; k < 6; k++) {
      const x = 14 + k * 18;
      const y = 18 + (k % 2) * 12;
      px(x, y, 8, '#ffb347');
      px(x + 2, y - 3, 4, '#35e0c8');
    }
    c.fillStyle = '#35e0c8';
    c.beginPath();
    c.moveTo(w / 2, h - 30);
    c.lineTo(w / 2 + 9, h - 14);
    c.lineTo(w / 2 - 9, h - 14);
    c.closePath();
    c.fill();
    px(w / 2 - 1, h - 46, 3, '#ffffff');
    px(w / 2 - 1, h - 58, 3, '#ffffff');
  } else if (i === 2) {
    // A reef, side on.
    const sea = c.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#19b8d4');
    sea.addColorStop(1, '#0b2a52');
    c.fillStyle = sea;
    c.fillRect(0, 0, w, h);
    for (let k = 0; k < 9; k++) {
      const x = k * 15 + r() * 6;
      const hh = 10 + r() * 22;
      c.fillStyle = ['#ff7a59', '#ff5fa8', '#ffd166'][k % 3]!;
      c.fillRect(x, h - hh, 7, hh);
      c.fillRect(x - 4, h - hh * 0.6, 5, 4);
    }
    for (let k = 0; k < 5; k++) {
      const x = 12 + r() * (w - 30);
      const y = 14 + r() * (h * 0.5);
      c.fillStyle = k === 0 ? '#ffd166' : '#f4fbfa';
      c.fillRect(x, y, 12, 6);
      c.fillRect(x - 4, y + 1, 4, 4);
      px(x + 9, y + 1, 2, '#0b1d2a');
    }
  } else if (i === 3) {
    // The storm seen from above.
    c.fillStyle = '#0b1d2a';
    c.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) {
      const a = r() * 6.28;
      const d = 14 + r() * 46;
      const col = d < 22 ? '#f4fbfa' : d < 40 ? '#35e0c8' : '#19788a';
      px(w / 2 + Math.cos(a + d * 0.09) * d, h / 2 + Math.sin(a + d * 0.09) * d * 0.8, 2, col);
    }
    px(w / 2 - 2, h / 2 - 2, 5, '#ffd166');
  } else if (i === 4) {
    // Coconuts to catch.
    c.fillStyle = '#16335c';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd9a0';
    c.fillRect(0, h - 14, w, 14);
    for (let k = 0; k < 3; k++) {
      const x = 20 + k * 42;
      c.fillStyle = '#7a4a2a';
      c.fillRect(x, 26, 5, h - 40);
      c.fillStyle = '#35c98a';
      c.fillRect(x - 14, 16, 33, 7);
      c.fillRect(x - 8, 9, 21, 7);
    }
    for (let k = 0; k < 5; k++) px(18 + r() * (w - 36), 34 + r() * 44, 6, '#b5794f');
    c.fillStyle = '#ff5fa8';
    c.fillRect(w / 2 - 12, h - 24, 24, 6);
  } else {
    // The score table every cabinet shows between plays.
    c.fillStyle = '#12092b';
    c.fillRect(0, 0, w, h);
    text(c, 'HIGH TIDES', w / 2, 14, 13, '#ffd166');
    const names = ['SOL', 'MAR', 'IBIS', 'CAY', 'LUZ'];
    names.forEach((n, k) => {
      const y = 34 + k * 15;
      text(c, `${k + 1}  ${n}`, 14, y, 11, k === 0 ? '#ff5fa8' : '#9fe8ff', 'left', 700);
      text(c, String(98000 - k * 17350), w - 12, y, 11, k === 0 ? '#ff5fa8' : '#9fe8ff', 'right', 700);
    });
  }
  // Scan lines, so a flat picture reads as a tube.
  c.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
}

function drawMarquee(c: Ctx2, w: number, h: number, i: number): void {
  const pairs: [string, string][] = [
    ['#ff3d8b', '#ffd166'],
    ['#19b8d4', '#b6ffe6'],
    ['#8a5cf5', '#ff8ac0'],
    ['#ff7a59', '#fff6e4'],
    ['#35e0c8', '#12092b'],
    ['#ffd166', '#2a1b52'],
  ];
  const [a, b] = pairs[i % pairs.length]!;
  const g = c.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, a);
  g.addColorStop(1, '#2a1b52');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  text(c, ARCADE_TITLES[i % ARCADE_TITLES.length]!, w / 2, h / 2 + 1, 19, b, 'center', 900);
}

/** A surfboard, nose up, on a clear background so the quad it is drawn on reads as the board. */
function drawSurfboard(c: Ctx2, w: number, h: number, i: number): void {
  const schemes: [string, string, string][] = [
    ['#fff6e4', '#ff5fa8', '#19b8d4'],
    ['#ffd166', '#ff7a59', '#fff6e4'],
    ['#35e0c8', '#fff6e4', '#2a1b52'],
    ['#8ad3ff', '#ffd166', '#ff3d8b'],
  ];
  const [base, stripe, pin] = schemes[i % schemes.length]!;
  const outline = (): void => {
    c.beginPath();
    c.moveTo(w / 2, 3);
    c.bezierCurveTo(w * 0.98, h * 0.22, w * 0.98, h * 0.74, w * 0.7, h - 4);
    c.lineTo(w * 0.3, h - 4);
    c.bezierCurveTo(w * 0.02, h * 0.74, w * 0.02, h * 0.22, w / 2, 3);
    c.closePath();
  };
  outline();
  c.fillStyle = base;
  c.fill();
  c.save();
  outline();
  c.clip();
  c.fillStyle = stripe;
  if (i % 2 === 0) {
    c.fillRect(w * 0.42, 0, w * 0.16, h);
    c.fillStyle = pin;
    c.fillRect(0, h * 0.62, w, h * 0.07);
  } else {
    c.beginPath();
    c.moveTo(0, h * 0.5);
    c.lineTo(w, h * 0.3);
    c.lineTo(w, h * 0.46);
    c.lineTo(0, h * 0.66);
    c.closePath();
    c.fill();
    c.fillStyle = pin;
    c.beginPath();
    c.arc(w / 2, h * 0.2, w * 0.14, 0, 6.28);
    c.fill();
  }
  c.restore();
  outline();
  c.strokeStyle = 'rgba(20,30,40,0.55)';
  c.lineWidth = 2;
  c.stroke();
}

/**
 * The pharmacy's own mark: a cross with a wave through it (the shops are named for tides and reefs),
 * drawn as glowing tube on a clear background.
 */
function drawCross(c: Ctx2, w: number, h: number): void {
  const cx = w / 2;
  const cy = h / 2;
  const arm = w * 0.15;
  const len = w * 0.4;
  const shape = (): void => {
    c.beginPath();
    c.moveTo(cx - arm, cy - len);
    c.lineTo(cx + arm, cy - len);
    c.lineTo(cx + arm, cy - arm);
    c.lineTo(cx + len, cy - arm);
    c.lineTo(cx + len, cy + arm);
    c.lineTo(cx + arm, cy + arm);
    c.lineTo(cx + arm, cy + len);
    c.lineTo(cx - arm, cy + len);
    c.lineTo(cx - arm, cy + arm);
    c.lineTo(cx - len, cy + arm);
    c.lineTo(cx - len, cy - arm);
    c.lineTo(cx - arm, cy - arm);
    c.closePath();
  };
  c.lineJoin = 'round';
  // A faint halo in the same colour, so the cut-out edge does not go dark.
  shape();
  c.strokeStyle = 'rgba(60,240,170,0.3)';
  c.lineWidth = 26;
  c.stroke();
  shape();
  c.fillStyle = '#1fbf86';
  c.fill();
  shape();
  c.strokeStyle = '#b6ffe6';
  c.lineWidth = 7;
  c.stroke();
  c.strokeStyle = '#f4fffb';
  c.lineWidth = 6;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - len * 0.78, cy + 2);
  c.bezierCurveTo(cx - len * 0.4, cy - 20, cx - len * 0.1, cy + 22, cx + len * 0.25, cy);
  c.bezierCurveTo(cx + len * 0.45, cy - 12, cx + len * 0.62, cy - 6, cx + len * 0.78, cy + 2);
  c.stroke();
}

function drawOpen(c: Ctx2, w: number, h: number): void {
  c.lineJoin = 'round';
  rounded(c, 10, 10, w - 20, h - 20, 26);
  c.strokeStyle = 'rgba(40,220,230,0.3)';
  c.lineWidth = 16;
  c.stroke();
  c.strokeStyle = '#7ff3ff';
  c.lineWidth = 6;
  c.stroke();
  c.font = `800 62px ${FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.strokeStyle = 'rgba(255,80,160,0.3)';
  c.lineWidth = 14;
  c.strokeText('OPEN', w / 2, h / 2 + 3);
  c.fillStyle = '#ff8ac0';
  c.fillText('OPEN', w / 2, h / 2 + 3);
}

/** Front of the jukebox: a lit arch over a record window, a row of selector keys and a grille. */
function drawJukebox(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#3a1410';
  c.fillRect(0, 0, w, h);
  const bands = ['#ff3d8b', '#ff7a59', '#ffd166', '#35e0c8', '#19b8d4'];
  bands.forEach((col, i) => {
    c.strokeStyle = col;
    c.lineWidth = 9;
    c.beginPath();
    c.arc(w / 2, 104, 92 - i * 11, Math.PI, 0);
    c.stroke();
    c.fillStyle = col;
    c.fillRect(w / 2 - 92 + i * 11 - 4.5, 104, 9, 46);
    c.fillRect(w / 2 + 92 - i * 11 - 4.5, 104, 9, 46);
  });
  // The record behind its window.
  c.fillStyle = '#0b0d14';
  c.beginPath();
  c.arc(w / 2, 108, 36, 0, 6.28);
  c.fill();
  c.strokeStyle = '#2b2f3a';
  c.lineWidth = 1.5;
  for (const r of [30, 24, 18]) {
    c.beginPath();
    c.arc(w / 2, 108, r, 0, 6.28);
    c.stroke();
  }
  c.fillStyle = '#ffd166';
  c.beginPath();
  c.arc(w / 2, 108, 11, 0, 6.28);
  c.fill();
  c.fillStyle = '#0b0d14';
  c.beginPath();
  c.arc(w / 2, 108, 2.5, 0, 6.28);
  c.fill();
  // Title strips and keys.
  c.fillStyle = '#fff6e4';
  c.fillRect(22, 158, w - 44, 30);
  c.fillStyle = '#b23a2e';
  for (let i = 0; i < 4; i++) c.fillRect(28 + i * 38, 163, 32, 8);
  c.fillStyle = '#2b2f3a';
  for (let i = 0; i < 4; i++) c.fillRect(28 + i * 38, 175, 32, 8);
  for (let i = 0; i < 8; i++) {
    c.fillStyle = i % 2 ? '#ffd166' : '#f4fbfa';
    c.fillRect(24 + i * 19.5, 194, 15, 12);
  }
  // Grille.
  c.fillStyle = '#1a0b09';
  rounded(c, 22, 214, w - 44, h - 232, 10);
  c.fill();
  c.strokeStyle = '#c99a5b';
  c.lineWidth = 3;
  for (let x = 34; x < w - 28; x += 12) {
    c.beginPath();
    c.moveTo(x, 220);
    c.lineTo(x, h - 24);
    c.stroke();
  }
  text(c, 'SOL-O-MATIC', w / 2, 20, 15, '#ffd166', 'center', 900);
}

/** Front of a drinks machine. The cola is the one the shops sell. */
function drawVending(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#c21f3a';
  c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, 86);
  g.addColorStop(0, '#ff4f6a');
  g.addColorStop(1, '#a3142c');
  c.fillStyle = g;
  c.fillRect(0, 0, w, 86);
  text(c, 'Cascabel', w / 2, 30, 34, '#fff6e4', 'center', 600, SCRIPT);
  text(c, 'COLA', w / 2, 64, 24, '#ffd166', 'center', 900);
  // Lit window with rows of cans.
  c.fillStyle = '#eaf7ff';
  rounded(c, 14, 96, w - 74, 216, 6);
  c.fill();
  const cans = ['#c21f3a', '#19b8d4', '#ffd166', '#35c98a'];
  for (let row = 0; row < 5; row++) {
    c.fillStyle = '#9db4c2';
    c.fillRect(14, 96 + row * 43 + 39, w - 74, 4);
    for (let col = 0; col < 4; col++) {
      c.fillStyle = cans[(row + col) % cans.length]!;
      rounded(c, 22 + col * 28, 96 + row * 43 + 8, 20, 31, 4);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.75)';
      c.fillRect(25 + col * 28, 96 + row * 43 + 18, 14, 5);
    }
  }
  // Coin slot, keys and the price.
  c.fillStyle = '#2b2f3a';
  rounded(c, w - 52, 100, 40, 150, 5);
  c.fill();
  c.fillStyle = '#9ff0c8';
  c.fillRect(w - 46, 108, 28, 16);
  text(c, `$${VENDING_PRICE}`, w - 32, 117, 12, '#0b1d2a', 'center', 900);
  for (let i = 0; i < 8; i++) {
    c.fillStyle = '#d9dee6';
    c.fillRect(w - 46 + (i % 2) * 15, 132 + Math.floor(i / 2) * 15, 12, 11);
  }
  c.fillStyle = '#0b0d14';
  c.fillRect(w - 38, 204, 12, 30);
  // Delivery hatch.
  c.fillStyle = '#1a1d26';
  rounded(c, 20, 330, w - 40, 52, 6);
  c.fill();
  c.fillStyle = '#3b4252';
  c.fillRect(28, 338, w - 56, 6);
}

function drawMirror(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#e8d2a6';
  c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f4fdff');
  g.addColorStop(0.5, '#bfe3ee');
  g.addColorStop(1, '#8fc4d6');
  c.fillStyle = g;
  c.fillRect(6, 6, w - 12, h - 12);
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.beginPath();
  c.moveTo(w * 0.2, 6);
  c.lineTo(w * 0.42, 6);
  c.lineTo(6, h * 0.5);
  c.lineTo(6, h * 0.28);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(w * 0.62, 6);
  c.lineTo(w * 0.7, 6);
  c.lineTo(6, h * 0.86);
  c.lineTo(6, h * 0.76);
  c.closePath();
  c.fill();
}

/** Curtain folds in light and shade; the shop's colour tints it. */
function drawCurtain(c: Ctx2, w: number, h: number): void {
  const folds = 8;
  for (let i = 0; i < folds; i++) {
    const g = c.createLinearGradient((i * w) / folds, 0, ((i + 1) * w) / folds, 0);
    g.addColorStop(0, '#b9b9b9');
    g.addColorStop(0.45, '#ffffff');
    g.addColorStop(1, '#9a9a9a');
    c.fillStyle = g;
    c.fillRect((i * w) / folds, 0, w / folds + 1, h);
  }
  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.fillRect(0, h - 10, w, 10);
}

function drawTarget(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#f2ead8';
  c.fillRect(0, 0, w, h);
  const rings = ['#22303a', '#f2ead8', '#22303a', '#f2ead8', '#22303a', '#e63946'];
  rings.forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(w / 2, h / 2, (w * 0.46 * (rings.length - i)) / rings.length, 0, 6.28);
    c.fill();
  });
  c.fillStyle = '#0b0d14';
  for (const [x, y] of [
    [0.56, 0.44],
    [0.47, 0.57],
    [0.62, 0.6],
    [0.38, 0.36],
  ] as const) {
    c.beginPath();
    c.arc(w * x, h * y, 2.4, 0, 6.28);
    c.fill();
  }
}

function drawTill(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#0d2a26';
  c.fillRect(0, 0, w, h);
  text(c, '$ 0.00', w / 2, 16, 15, '#7ff0dc', 'center', 800);
  c.fillStyle = '#35e0c8';
  for (let i = 0; i < 3; i++) c.fillRect(6, 28 + i * 6, 18 + ((i * 13) % 26), 3);
}

function drawMat(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#6b4a2b';
  c.fillRect(0, 0, w, h);
  const r = dice(5);
  c.globalAlpha = 0.25;
  for (let i = 0; i < 700; i++) {
    c.fillStyle = r() > 0.5 ? '#8a6238' : '#4a321c';
    c.fillRect(r() * w, r() * h, 3, 1);
  }
  c.globalAlpha = 1;
  c.strokeStyle = '#2b1d10';
  c.lineWidth = 8;
  c.strokeRect(4, 4, w - 8, h - 8);
  text(c, 'BIENVENIDOS', w / 2, h / 2 + 2, 30, '#22160b', 'center', 900);
}

function drawClock(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#22303a';
  c.beginPath();
  c.arc(w / 2, h / 2, w / 2 - 1, 0, 6.28);
  c.fill();
  c.fillStyle = '#fff6e4';
  c.beginPath();
  c.arc(w / 2, h / 2, w / 2 - 7, 0, 6.28);
  c.fill();
  c.fillStyle = '#22303a';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.28;
    c.fillRect(w / 2 + Math.sin(a) * (w / 2 - 14) - 1.5, h / 2 - Math.cos(a) * (h / 2 - 14) - 1.5, 3, 3);
  }
  c.strokeStyle = '#22303a';
  c.lineCap = 'round';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(w / 2, h / 2);
  c.lineTo(w / 2 + 14, h / 2 - 12);
  c.stroke();
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(w / 2, h / 2);
  c.lineTo(w / 2 - 6, h / 2 - 28);
  c.stroke();
}

/** A plain packing crate face: boards, a frame and a brace. */
function drawCrate(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#e9e2d2';
  c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(60,45,25,0.22)';
  for (let i = 1; i < 5; i++) c.fillRect(0, (i * h) / 5 - 1, w, 2);
  c.strokeStyle = 'rgba(70,52,30,0.5)';
  c.lineWidth = 12;
  c.strokeRect(6, 6, w - 12, h - 12);
  c.lineWidth = 10;
  c.beginPath();
  c.moveTo(10, h - 10);
  c.lineTo(w - 10, 10);
  c.stroke();
  c.fillStyle = 'rgba(40,30,18,0.6)';
  for (const [x, y] of [
    [9, 9],
    [w - 9, 9],
    [9, h - 9],
    [w - 9, h - 9],
  ] as const) {
    c.beginPath();
    c.arc(x, y, 2.2, 0, 6.28);
    c.fill();
  }
}

function drawEspresso(c: Ctx2, w: number, h: number): void {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f1f3f5');
  g.addColorStop(1, '#aab2bd');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#22303a';
  c.fillRect(0, h - 26, w, 26);
  for (let i = 0; i < 2; i++) {
    const x = 44 + i * 72;
    c.fillStyle = '#2b2f3a';
    c.fillRect(x - 14, 44, 28, 12);
    c.fillRect(x - 3, 56, 6, 10);
    c.fillStyle = '#fff6e4';
    c.beginPath();
    c.arc(x, 24, 11, 0, 6.28);
    c.fill();
    c.strokeStyle = '#e63946';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, 24);
    c.lineTo(x + 6, 18);
    c.stroke();
  }
  c.fillStyle = '#ff7a59';
  for (let i = 0; i < 4; i++) c.fillRect(12 + i * 9, 8, 6, 6);
}

function drawSpeaker(c: Ctx2, w: number, h: number): void {
  c.fillStyle = '#22262b';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#4a515c';
  for (let y = 4; y < h; y += 6) for (let x = 4 + ((y / 6) % 2) * 3; x < w; x += 6) c.fillRect(x, y, 2, 2);
}

/** A lightbox sign: a word on a dark plate with a thin bright rule. */
function drawSign(c: Ctx2, w: number, h: number, label: string, bg: string, fg: string): void {
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = fg;
  c.globalAlpha = 0.55;
  c.lineWidth = 2;
  c.strokeRect(5, 5, w - 10, h - 10);
  c.globalAlpha = 1;
  let size = 28;
  c.font = `800 ${size}px ${FONT}`;
  while (c.measureText(label).width > w - 30 && size > 12) {
    size -= 1;
    c.font = `800 ${size}px ${FONT}`;
  }
  text(c, label, w / 2, h / 2 + 1, size, fg);
}
