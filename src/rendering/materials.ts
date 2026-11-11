import * as THREE from 'three';

function createNoiseDataTexture(
  width: number,
  height: number,
  generator: (x: number, y: number) => [number, number, number, number],
  repeatX = 1,
  repeatY = 1,
  srgb = true,
): THREE.DataTexture {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = generator(x, y);
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      data[idx + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

export interface MiamiMaterialSet {
  asphalt: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  sand: THREE.MeshStandardMaterial;
  canalWall: THREE.MeshStandardMaterial;
  woodDock: THREE.MeshStandardMaterial;
  terrazzo: THREE.MeshPhysicalMaterial;
  glassTower: THREE.MeshPhysicalMaterial;
  shopGlass: THREE.MeshPhysicalMaterial;
  grass: THREE.MeshStandardMaterial;
  palmBark: THREE.MeshStandardMaterial;
  palmFrond: THREE.MeshStandardMaterial;
  createStucco(hex: number, roughness?: number): THREE.MeshStandardMaterial;
  createNeon(hex: number, intensity?: number): THREE.MeshStandardMaterial;
}

export function createMiamiMaterialSet(): MiamiMaterialSet {
  const asphaltTex = createNoiseDataTexture(
    128,
    128,
    (x, y) => {
      const grain = (hash2d(x, y) - 0.5) * 18;
      const centerDash = Math.abs(x - 64) <= 2 && y % 32 < 18;
      if (centerDash) return [236, 194, 78, 255];
      const edgeLine = Math.abs(x - 8) <= 1 || Math.abs(x - 120) <= 1;
      if (edgeLine) return [225, 228, 232, 255];
      const base = 46 + grain;
      return [base, base + 2, base + 5, 255];
    },
    1,
    14,
  );

  const asphaltRough = createNoiseDataTexture(
    64,
    64,
    (x, y) => {
      const puddle = Math.sin(x * 0.19) * Math.cos(y * 0.17);
      const val = puddle > 0.62 ? 55 : 195 + (hash2d(x, y) - 0.5) * 30;
      return [val, val, val, 255];
    },
    4,
    24,
    false,
  );

  const sandTex = createNoiseDataTexture(
    128,
    128,
    (x, y) => {
      const ripple = Math.sin(x * 0.35 + Math.sin(y * 0.12) * 2.0) * 7;
      const speck = (hash2d(x, y) - 0.5) * 14;
      return [236 + ripple + speck, 221 + ripple + speck, 192 + ripple + speck, 255];
    },
    18,
    18,
  );

  const woodTex = createNoiseDataTexture(
    128,
    128,
    (x, y) => {
      const plankGap = y % 16 === 0 ? -38 : 0;
      const streak = Math.sin(x * 0.09 + hash2d(0, Math.floor(y / 16)) * 6.2) * 12;
      const g = (hash2d(x, y) - 0.5) * 8;
      return [154 + streak + plankGap + g, 114 + streak * 0.8 + plankGap + g, 78 + plankGap + g, 255];
    },
    4,
    8,
  );

  const terrazzoTex = createNoiseDataTexture(
    128,
    128,
    (x, y) => {
      const chip = hash2d(Math.floor(x / 3), Math.floor(y / 3));
      if (chip > 0.92) return [228, 128, 108, 255];
      if (chip < 0.07) return [64, 158, 168, 255];
      const tileLine = x % 32 === 0 || y % 32 === 0 ? -16 : 0;
      return [242 + tileLine, 237 + tileLine, 228 + tileLine, 255];
    },
    6,
    6,
  );

  const stuccoBump = createNoiseDataTexture(
    64,
    64,
    (x, y) => {
      const v = 128 + (hash2d(x, y) - 0.5) * 60;
      return [v, v, v, 255];
    },
    6,
    6,
    false,
  );

  const neonMaterials: THREE.MeshStandardMaterial[] = [];

  return {
    asphalt: new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughnessMap: asphaltRough,
      roughness: 0.82,
      metalness: 0.06,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: 0xe8e2d5,
      bumpMap: stuccoBump,
      bumpScale: 0.015,
      roughness: 0.78,
      metalness: 0.02,
    }),
    sand: new THREE.MeshStandardMaterial({
      map: sandTex,
      roughness: 0.9,
      metalness: 0.0,
    }),
    canalWall: new THREE.MeshStandardMaterial({
      color: 0xcbc5b8,
      bumpMap: stuccoBump,
      bumpScale: 0.03,
      roughness: 0.84,
      metalness: 0.04,
    }),
    woodDock: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.72,
      metalness: 0.04,
    }),
    terrazzo: new THREE.MeshPhysicalMaterial({
      map: terrazzoTex,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.14,
    }),
    glassTower: new THREE.MeshPhysicalMaterial({
      color: 0x76c7d8,
      roughness: 0.06,
      metalness: 0.18,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.8,
    }),
    shopGlass: new THREE.MeshPhysicalMaterial({
      color: 0xbaf2f8,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.78,
      ior: 1.5,
      transparent: true,
      opacity: 0.42,
    }),
    grass: new THREE.MeshStandardMaterial({
      color: 0x3b8c52,
      bumpMap: stuccoBump,
      bumpScale: 0.03,
      roughness: 0.86,
      metalness: 0.0,
    }),
    palmBark: new THREE.MeshStandardMaterial({
      color: 0x7c624c,
      bumpMap: stuccoBump,
      bumpScale: 0.04,
      roughness: 0.88,
      metalness: 0.0,
    }),
    palmFrond: new THREE.MeshStandardMaterial({
      color: 0x2e8544,
      roughness: 0.56,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
    createStucco(hex: number, roughness = 0.72): THREE.MeshStandardMaterial {
      return new THREE.MeshStandardMaterial({
        color: hex,
        bumpMap: stuccoBump,
        bumpScale: 0.02,
        roughness,
        metalness: 0.03,
      });
    },
    createNeon(hex: number, intensity = 2.6): THREE.MeshStandardMaterial {
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        emissive: new THREE.Color(hex),
        emissiveIntensity: intensity,
        roughness: 0.22,
        metalness: 0.1,
      });
      neonMaterials.push(mat);
      return mat;
    },
  };
}
