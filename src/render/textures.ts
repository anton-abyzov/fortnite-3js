import { CanvasTexture, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three';
import { fbm2, hash2, noise2 } from '../core/rng';

/** Textures drawn at start-up on 2D canvases, so the game ships no texture files for its surfaces. */

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return [c, c.getContext('2d')!];
}

function finish(c: HTMLCanvasElement, srgb = true, anisotropy = 8): CanvasTexture {
  const t = new CanvasTexture(c);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = anisotropy;
  t.generateMipmaps = true;
  return t;
}

/** Fill a canvas per pixel from a function returning [r, g, b] in 0..255. Coordinates are 0..1 and tile. */
function paint(size: number, fn: (u: number, v: number, x: number, y: number) => [number, number, number]): HTMLCanvasElement {
  const [c, ctx] = canvas(size);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fn(x / size, y / size, x, y);
      const i = (y * size + x) * 4;
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Tileable fractal noise in 0..1: blends four offset samples so the edges match. */
function tile(u: number, v: number, freq: number, octaves: number, seed: number): number {
  const a = fbm2(u * freq, v * freq, octaves, seed);
  const b = fbm2((u - 1) * freq, v * freq, octaves, seed);
  const c = fbm2(u * freq, (v - 1) * freq, octaves, seed);
  const d = fbm2((u - 1) * freq, (v - 1) * freq, octaves, seed);
  const wu = u * u * (3 - 2 * u);
  const wv = v * v * (3 - 2 * v);
  return (a * (1 - wu) + b * wu) * (1 - wv) + (c * (1 - wu) + d * wu) * wv;
}

export function asphaltTexture(aniso: number): CanvasTexture {
  const c = paint(512, (u, v, x, y) => {
    const n = tile(u, v, 6, 4, 11);
    const speck = hash2(x, y, 3);
    const patch = tile(u, v, 2, 2, 29);
    let g = 58 + n * 22 + (speck > 0.92 ? 16 : speck < 0.06 ? -12 : 0) + (patch - 0.5) * 16;
    g = Math.max(30, Math.min(110, g));
    return [g * 0.98, g, g * 1.04];
  });
  return finish(c, true, aniso);
}

export function sidewalkTexture(aniso: number): CanvasTexture {
  // One tile is 4 m: a 2 x 2 grid of pavers with fine joints.
  const c = paint(512, (u, v, x, y) => {
    const n = tile(u, v, 8, 3, 5);
    const speck = hash2(x, y, 9);
    const ju = Math.min(Math.abs(((u * 2) % 1) - 0.5), 1) * 2;
    const jv = Math.min(Math.abs(((v * 2) % 1) - 0.5), 1) * 2;
    const joint = ju > 0.975 || jv > 0.975 ? -34 : 0;
    const paver = hash2(Math.floor(u * 2), Math.floor(v * 2), 7) * 10 - 5;
    const g = 196 + n * 26 + (speck > 0.95 ? -18 : 0) + joint + paver;
    return [g * 1.0, g * 0.975, g * 0.93];
  });
  return finish(c, true, aniso);
}

export function plazaTexture(aniso: number): CanvasTexture {
  // Terrazzo-style checker in two warm tones with chips.
  const c = paint(512, (u, v, x, y) => {
    const cu = Math.floor(u * 4);
    const cv = Math.floor(v * 4);
    const check = (cu + cv) % 2 === 0;
    const n = tile(u, v, 10, 3, 13);
    const chip = hash2(x >> 1, y >> 1, 21);
    const fu = (u * 4) % 1;
    const fv = (v * 4) % 1;
    const joint = fu < 0.02 || fv < 0.02 ? -26 : 0;
    const base: [number, number, number] = check ? [236, 214, 196] : [226, 150, 138];
    const k = 0.9 + n * 0.14 + (chip > 0.965 ? 0.12 : chip < 0.03 ? -0.12 : 0);
    return [base[0] * k + joint, base[1] * k + joint, base[2] * k + joint];
  });
  return finish(c, true, aniso);
}

export function sandTexture(aniso: number): CanvasTexture {
  const c = paint(512, (u, v, x, y) => {
    const n = tile(u, v, 5, 4, 2);
    const ripple = Math.sin((v + tile(u, v, 3, 2, 8) * 0.12) * Math.PI * 2 * 14) * 0.5 + 0.5;
    const grain = hash2(x, y, 5);
    const k = 0.9 + n * 0.14 + ripple * 0.035 + (grain - 0.5) * 0.06;
    return [240 * k, 222 * k, 180 * k];
  });
  return finish(c, true, aniso);
}

export function grassTexture(aniso: number): CanvasTexture {
  const c = paint(512, (u, v, x, y) => {
    const n = tile(u, v, 7, 4, 17);
    const blade = hash2(x, y, 23);
    const k = 0.78 + n * 0.34 + (blade - 0.5) * 0.16;
    return [88 * k, 164 * k, 86 * k];
  });
  return finish(c, true, aniso);
}

export function woodTexture(aniso: number): CanvasTexture {
  // Planks run along V; one tile holds six planks across U.
  const c = paint(512, (u, v, x) => {
    const plank = Math.floor(u * 6);
    const fu = (u * 6) % 1;
    const tone = hash2(plank, 1, 31) * 0.22 + 0.86;
    const grain = noise2(u * 90, v * 6 + plank * 3.1, 41) * 0.12;
    const gap = fu < 0.035 || fu > 0.965 ? 0.55 : 1;
    const nail = Math.abs(((v * 2) % 1) - 0.5) < 0.012 && Math.abs(fu - 0.5) > 0.36 ? 0.7 : 1;
    const k = (tone - grain) * gap * nail + hash2(x, plank, 4) * 0.02;
    return [176 * k, 132 * k, 86 * k];
  });
  return finish(c, true, aniso);
}

export function concreteTexture(aniso: number): CanvasTexture {
  const c = paint(512, (u, v, x, y) => {
    const n = tile(u, v, 5, 4, 51);
    const stain = Math.pow(tile(u, v * 0.5, 9, 2, 61), 2.2);
    const speck = hash2(x, y, 6);
    const g = 150 + n * 36 - stain * 42 * (1 - v) + (speck > 0.96 ? -14 : 0);
    return [g, g * 0.985, g * 0.95];
  });
  return finish(c, true, aniso);
}

export function stuccoTexture(aniso: number): CanvasTexture {
  // Near-white with soft mottling: the wall tint comes from vertex colours.
  const c = paint(256, (u, v, x, y) => {
    const n = tile(u, v, 9, 4, 71);
    const g = 226 + n * 26 + (hash2(x, y, 8) - 0.5) * 8;
    return [g, g, g];
  });
  return finish(c, true, aniso);
}

export function roofTexture(aniso: number): CanvasTexture {
  const c = paint(256, (u, v, x, y) => {
    const n = tile(u, v, 10, 3, 81);
    const g = 150 + n * 40 + (hash2(x, y, 2) - 0.5) * 30;
    return [g * 0.98, g * 0.97, g * 0.94];
  });
  return finish(c, true, aniso);
}

/**
 * Tileable water detail normal map (tangent space, Z up), built from the gradient of fractal noise.
 * Sampled twice at different scales and speeds by the water shader.
 */
export function waterNormalTexture(): CanvasTexture {
  const size = 256;
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) h[y * size + x] = tile(x / size, y / size, 7, 5, 91) + 0.5 * tile(x / size, y / size, 19, 3, 97);
  }
  const at = (x: number, y: number): number => h[((y + size) % size) * size + ((x + size) % size)]!;
  const c = paint(size, (_u, _v, x, y) => {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 9;
    const dy = (at(x, y + 1) - at(x, y - 1)) * 9;
    const len = Math.hypot(dx, dy, 1);
    return [(-dx / len) * 127 + 128, (-dy / len) * 127 + 128, (1 / len) * 127 + 128];
  });
  return finish(c, false, 4);
}

/** Soft round sprite for particles: white with radial alpha falloff. */
export function softDotTexture(): CanvasTexture {
  const [c, ctx] = canvas(64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.62)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Palm frond: a tapered leaf with a midrib and serrated edge, alpha-tested. */
export function frondTexture(): CanvasTexture {
  const [c, ctx] = canvas(256);
  ctx.clearRect(0, 0, 256, 256);
  // Leaf runs along +X from the stem at the left edge.
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#3f7d32');
  grad.addColorStop(0.6, '#4c9a3c');
  grad.addColorStop(1, '#7fc24e');
  ctx.strokeStyle = grad;
  ctx.lineCap = 'round';
  const leaflets = 26;
  for (let i = 0; i < leaflets; i++) {
    const t = i / (leaflets - 1);
    const x = 10 + t * 236;
    const len = Math.sin(Math.min(1, t * 1.25 + 0.12) * Math.PI) * 92 + 10;
    ctx.lineWidth = 7 - t * 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, 128);
      ctx.quadraticCurveTo(x + 14, 128 + side * len * 0.55, x + 26 + t * 8, 128 + side * len);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#2f5f27';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(252, 128);
  ctx.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
