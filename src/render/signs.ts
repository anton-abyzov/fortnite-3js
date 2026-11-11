import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, MeshBasicMaterial, SRGBColorSpace } from 'three';

export type UvRect = readonly [number, number, number, number];

export interface SignSlot {
  /** Atlas rectangle [u0, v0, u1, v1], v0 at the bottom. */
  uv: UvRect;
  /** Width divided by height of the lettering. */
  aspect: number;
}

const FONT = '"Futura", "Century Gothic", "Avenir Next", "Gill Sans", "Trebuchet MS", "DejaVu Sans", sans-serif';
const SCRIPT = '"Brush Script MT", "Snell Roundhand", "Segoe Script", "URW Chancery L", cursive';

/**
 * One texture that holds every sign's lettering in white. Signs are quads tinted by vertex colour,
 * so a whole district of neon is a single draw call.
 */
export class SignAtlas {
  readonly size = 2048;
  readonly texture: CanvasTexture;
  readonly material: MeshBasicMaterial;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private x = 2;
  private y = 2;
  private rowH = 0;
  private cache = new Map<string, SignSlot>();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.minFilter = LinearMipmapLinearFilter;
    this.texture.magFilter = LinearFilter;
    this.texture.anisotropy = 4;
    this.material = new MeshBasicMaterial({ map: this.texture, vertexColors: true, alphaTest: 0.32, toneMapped: true });
  }

  private alloc(w: number, h: number): [number, number] {
    if (this.x + w + 2 > this.size) {
      this.x = 2;
      this.y += this.rowH + 4;
      this.rowH = 0;
    }
    if (this.y + h + 2 > this.size) {
      // Atlas full: reuse the first slot rather than fail. Layouts stay far below this.
      return [2, 2];
    }
    const pos: [number, number] = [this.x, this.y];
    this.x += w + 4;
    this.rowH = Math.max(this.rowH, h);
    return pos;
  }

  private slot(x: number, y: number, w: number, h: number): SignSlot {
    const s = this.size;
    return { uv: [x / s, 1 - (y + h) / s, (x + w) / s, 1 - y / s], aspect: w / h };
  }

  /** Lettering on one line. `style` picks block capitals, a script hand, or outlined capitals. */
  horizontal(text: string, style: 'block' | 'script' | 'outline' = 'block'): SignSlot {
    const key = `h:${style}:${text}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const ctx = this.ctx;
    const h = 72;
    const font = style === 'script' ? `italic 600 ${h * 0.86}px ${SCRIPT}` : `800 ${h * 0.8}px ${FONT}`;
    ctx.font = font;
    const label = style === 'script' ? text : text.toUpperCase();
    const spacing = style === 'script' ? 0 : 5;
    let w = 0;
    for (const ch of label) w += ctx.measureText(ch).width + spacing;
    w = Math.ceil(w + 20);
    const [x, y] = this.alloc(w, h);
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.2;
    ctx.lineJoin = 'round';
    let cx = x + 10;
    for (const ch of label) {
      if (style === 'outline') ctx.strokeText(ch, cx, y + h / 2 + 2);
      else ctx.fillText(ch, cx, y + h / 2 + 2);
      cx += ctx.measureText(ch).width + spacing;
    }
    if (style === 'script') {
      // Underline flourish.
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + h - 8);
      ctx.quadraticCurveTo(x + w / 2, y + h - 2, x + w - 12, y + h - 12);
      ctx.stroke();
    }
    this.texture.needsUpdate = true;
    const slot = this.slot(x, y, w, h);
    this.cache.set(key, slot);
    return slot;
  }

  /** Upright capitals stacked top to bottom, as on a hotel fin. */
  vertical(text: string): SignSlot {
    const key = `v:${text}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const ctx = this.ctx;
    const label = text.toUpperCase().replace(/\s+/g, ' ');
    const cell = 46;
    const w = 54;
    const h = label.length * cell + 12;
    const [x, y] = this.alloc(w, h);
    ctx.font = `800 ${cell * 0.92}px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    let i = 0;
    for (const ch of label) {
      if (ch !== ' ') ctx.fillText(ch, x + w / 2, y + 6 + i * cell + cell / 2);
      i++;
    }
    this.texture.needsUpdate = true;
    const slot = this.slot(x, y, w, h);
    this.cache.set(key, slot);
    return slot;
  }

  /** A solid white rectangle, for plain glowing panels that share the sign material. */
  solid(): SignSlot {
    const key = 'solid';
    const hit = this.cache.get(key);
    if (hit) return hit;
    const [x, y] = this.alloc(16, 16);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, y, 16, 16);
    this.texture.needsUpdate = true;
    const s = this.size;
    const slot: SignSlot = { uv: [(x + 4) / s, 1 - (y + 12) / s, (x + 12) / s, 1 - (y + 4) / s], aspect: 1 };
    this.cache.set(key, slot);
    return slot;
  }
}
