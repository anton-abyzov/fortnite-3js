import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  type PerspectiveCamera,
  RGBAFormat,
  type Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  Vector4,
} from 'three';
import { WORLD } from '../core/config';
import { clamp01, smoothstep } from '../core/math';
import type { QualityPreset } from '../core/settings';
import { Cell, type WorldField } from '../world/field';
import { SKY_GLSL, type Sky } from './sky';
import { waterNormalTexture } from './textures';

/**
 * Gerstner wave set, shared by the shader and the CPU so that boats, swimmers and the picture agree.
 * Each wave: direction (x, z), wavelength in metres, amplitude in metres.
 */
const WAVES: [number, number, number, number][] = [
  [-0.94, 0.34, 46, 0.34],
  [-0.78, -0.62, 27, 0.2],
  [-0.55, 0.83, 15.5, 0.115],
  [-0.99, -0.12, 8.7, 0.06],
  [-0.3, -0.95, 5.1, 0.032],
];
const STEEPNESS = 0.42;
const G = 9.81;

interface WaveConst {
  dx: number;
  dz: number;
  k: number;
  a: number;
  w: number;
  /** Horizontal amplitude. */
  q: number;
  phase: number;
}

const CONST: WaveConst[] = WAVES.map(([dx, dz, len, a], i) => {
  const n = Math.hypot(dx, dz);
  const k = (Math.PI * 2) / len;
  return { dx: dx / n, dz: dz / n, k, a, w: Math.sqrt(G * k), q: STEEPNESS / (k * WAVES.length), phase: i * 1.7 };
});

export const WAVE_MAX_HEIGHT = WAVES.reduce((s, w) => s + w[3], 0);

const VERT = /* glsl */ `
  #define NW ${WAVES.length}
  uniform vec4 uWave[NW];
  uniform vec3 uWave2[NW];
  uniform vec3 uCenter;
  uniform float uRadius;
  uniform float uPow;
  uniform float uTime;
  uniform sampler2D uShore;
  uniform float uWorldHalf;
  varying vec3 vWorld;
  varying vec2 vBase;
  varying float vAmp;
  varying float vHeight;

  void main() {
    vec2 p = position.xz;
    float r = max(abs(p.x), abs(p.y));
    vec2 base = uCenter.xz + p * pow(max(r, 1e-4), uPow - 1.0) * uRadius;
    vec2 suv = base / (uWorldHalf * 2.0) + 0.5;
    float amp = texture2D(uShore, suv).g;
    float dist = length(base - cameraPosition.xz);
    amp *= 1.0 - smoothstep(260.0, 900.0, dist);

    vec3 disp = vec3(0.0);
    for (int i = 0; i < NW; i++) {
      vec2 d = uWave[i].xy;
      float ph = uWave[i].z * dot(d, base) - uWave2[i].x * uTime + uWave2[i].z;
      disp.xz += d * (uWave2[i].y * amp * cos(ph));
      disp.y += uWave[i].w * amp * sin(ph);
    }
    vec3 world = vec3(base.x + disp.x, disp.y, base.y + disp.z);
    vWorld = world;
    vBase = base;
    vAmp = amp;
    vHeight = disp.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FRAG = /* glsl */ `
  #define NW ${WAVES.length}
  ${SKY_GLSL}
  uniform vec4 uWave[NW];
  uniform vec3 uWave2[NW];
  uniform float uTime;
  uniform sampler2D uShore;
  uniform sampler2D uNormalMap;
  uniform float uWorldHalf;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uLight;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFar;
  uniform float uMaxHeight;
  varying vec3 vWorld;
  varying vec2 vBase;
  varying float vAmp;
  varying float vHeight;

  void main() {
    vec2 suv = vBase / (uWorldHalf * 2.0) + 0.5;
    vec4 shore = texture2D(uShore, suv);
    float shoreDist = shore.r * 60.0;
    float depth = shore.b * 10.0;
    float dist = length(vWorld - cameraPosition);

    // Analytic normal of the wave field at this pixel.
    vec3 n = vec3(0.0, 1.0, 0.0);
    for (int i = 0; i < NW; i++) {
      vec2 d = uWave[i].xy;
      float ph = uWave[i].z * dot(d, vBase) - uWave2[i].x * uTime + uWave2[i].z;
      float wa = uWave[i].z * uWave[i].w * vAmp;
      n.xz -= d * wa * cos(ph);
      n.y -= uWave[i].z * uWave2[i].y * vAmp * sin(ph);
    }

    // Small ripples from two scrolling layers of a detail normal map.
    vec2 uv1 = vBase * 0.043 + uTime * vec2(0.011, 0.017);
    vec2 uv2 = vBase * 0.117 - uTime * vec2(0.023, 0.008);
    vec2 uv3 = vBase * 0.39 + uTime * vec2(-0.03, 0.041);
    vec3 d1 = texture2D(uNormalMap, uv1).xyz * 2.0 - 1.0;
    vec3 d2 = texture2D(uNormalMap, uv2).xyz * 2.0 - 1.0;
    vec3 d3 = texture2D(uNormalMap, uv3).xyz * 2.0 - 1.0;
    float near = 1.0 - smoothstep(40.0, 260.0, dist);
    float ripple = mix(0.16, 0.42, vAmp) * (1.0 - smoothstep(500.0, 2200.0, dist) * 0.75);
    n.xz += (d1.xy + d2.xy * 0.8) * ripple + d3.xy * ripple * 0.5 * near;
    n = normalize(n);

    vec3 V = normalize(cameraPosition - vWorld);
    bool under = !gl_FrontFacing;
    if (under) n = -n;
    float ndv = max(dot(n, V), 0.0);
    float fres = 0.02 + 0.98 * pow(clamp(1.0 - ndv, 0.0, 1.0), 5.0);

    vec3 R = reflect(-V, n);
    R.y = abs(R.y) + 0.02;
    R = normalize(R);
    vec3 refl = skyGradient(R);
    float sunHit = max(dot(R, uSunDir), 0.0);
    float spec = pow(sunHit, 420.0) * 14.0 + pow(sunHit, 48.0) * 0.32;
    spec *= uGlow;

    // Water body colour: turquoise in the shallows, deep blue offshore.
    float depthF = smoothstep(0.0, 5.5, depth);
    vec3 body = mix(uShallow, uDeep, depthF) * uLight;
    // Light scattering through wave crests when looking toward the sun.
    float crest = clamp(vHeight / max(uMaxHeight, 0.01) * 0.5 + 0.5, 0.0, 1.0);
    float sss = pow(max(dot(V, -uSunDir) * 0.5 + 0.5, 0.0), 3.0) * crest * vAmp;
    body += uShallow * uSunColor * sss * 0.45 * uGlow;

    vec3 col = mix(body, refl, fres) + uSunColor * spec;

    // Foam: lapping bands near the shore plus whitecaps on the highest crests.
    float wob = texture2D(uNormalMap, vBase * 0.021 + uTime * 0.006).b;
    float tex = texture2D(uNormalMap, vBase * 0.19 + vec2(uTime * 0.02, 0.0)).r;
    float band = sin(shoreDist * 0.85 - uTime * 1.25 + wob * 7.0);
    // Lapping bands belong to shelving beaches; against a seawall only a thin wash line remains.
    float beach = 1.0 - smoothstep(0.4, 2.6, depth);
    float nearShore = (1.0 - smoothstep(0.0, 11.0, shoreDist)) * beach;
    float foam = smoothstep(0.62, 0.98, band) * nearShore * 0.75;
    foam += (1.0 - smoothstep(0.0, mix(0.55, 1.5 + wob * 1.6, beach), shoreDist)) * mix(0.55, 0.95, beach);
    // Whitecaps only where the grid is fine enough to resolve a crest.
    foam += smoothstep(0.7, 1.0, crest) * smoothstep(0.55, 1.0, vAmp) * 0.5 * (1.0 - smoothstep(160.0, 520.0, dist));
    foam *= smoothstep(0.25, 0.62, tex + foam * 0.35);
    foam = clamp(foam, 0.0, 1.0) * step(0.001, shoreDist + depth);
    col = mix(col, uFoam * (uLight * 0.9 + 0.1), foam);

    // Clear water over sand in the first half metre of depth.
    float alpha = mix(smoothstep(0.0, 0.55, depth) * 0.9 + 0.1, 1.0, max(fres, foam));
    if (under) {
      col = mix(uShallow * uLight * 1.3, refl * 0.5, 0.25);
      alpha = 0.82;
    }

    float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    // Sea haze: the surface dissolves into the horizon colour before the far plane cuts it.
    fog = max(fog, smoothstep(uFar * 0.4, uFar * 0.9, dist));
    col = mix(col, uFogColor, fog);
    alpha = max(alpha, fog);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** One animated surface for the ocean, bay, creek and canals, plus the CPU copy of its wave field. */
export class Water {
  readonly mesh: Mesh;
  private material: ShaderMaterial;
  private shoreTexture: DataTexture;
  private time = 0;
  private lightColor = new Color();

  constructor(
    scene: Scene,
    private field: WorldField,
    private sky: Sky,
    quality: QualityPreset,
  ) {
    this.shoreTexture = this.buildShoreTexture();
    this.material = new ShaderMaterial({
      uniforms: {
        ...sky.uniforms,
        uWave: { value: CONST.map((c) => new Vector4(c.dx, c.dz, c.k, c.a)) },
        uWave2: { value: CONST.map((c) => new Vector3(c.w, c.q, c.phase)) },
        uCenter: { value: new Vector3() },
        uRadius: { value: 2600 },
        uPow: { value: 2.4 },
        uTime: { value: 0 },
        uShore: { value: this.shoreTexture },
        uNormalMap: { value: waterNormalTexture() },
        uWorldHalf: { value: WORLD.half },
        uShallow: { value: new Color(0.06, 0.6, 0.58) },
        uDeep: { value: new Color(0.008, 0.085, 0.18) },
        uFoam: { value: new Color(0.95, 0.98, 1) },
        uLight: { value: new Color(1, 1, 1) },
        uFogColor: { value: new Color() },
        uFogDensity: { value: 0.0005 },
        uFar: { value: 2200 },
        uMaxHeight: { value: WAVE_MAX_HEIGHT },
        uRes: { value: new Vector2() },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: true,
      side: DoubleSide,
    });
    this.mesh = new Mesh(Water.grid(quality.waterGrid), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
    this.mesh.name = 'water';
    scene.add(this.mesh);
  }

  private static grid(n: number): BufferGeometry {
    const verts = new Float32Array((n + 1) * (n + 1) * 3);
    let v = 0;
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        verts[v++] = (i / n) * 2 - 1;
        verts[v++] = 0;
        verts[v++] = (j / n) * 2 - 1;
      }
    }
    const idx = new Uint32Array(n * n * 6);
    let k = 0;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i;
        const b = a + 1;
        const c = a + n + 1;
        const d = c + 1;
        idx[k++] = a;
        idx[k++] = c;
        idx[k++] = b;
        idx[k++] = b;
        idx[k++] = c;
        idx[k++] = d;
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(verts, 3));
    g.setIndex(new BufferAttribute(idx, 1));
    return g;
  }

  setGrid(n: number): void {
    this.mesh.geometry.dispose();
    this.mesh.geometry = Water.grid(n);
  }

  /**
   * Shore map, one texel per 2.5 m: R distance to land (0..60 m), G wave amplitude factor, B water depth (0..10 m).
   * Depth is spread from water cells into the land, piers and bridge decks next to them, so seawalls and
   * bridges do not show a pale shallow fringe.
   */
  private buildShoreTexture(): DataTexture {
    const f = this.field;
    const n = 512;
    const data = new Uint8Array(n * n * 4);
    const depth = new Float32Array(n * n);
    const known = new Uint8Array(n * n);
    const step = (WORLD.half * 2) / n;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * step - WORLD.half;
        const z = (j + 0.5) * step - WORLD.half;
        const k = j * n + i;
        const type = f.typeAt(x, z);
        const h = f.heightAt(x, z);
        // Cells under piers and bridges take their depth from the water around them in the passes below.
        if (type === Cell.Water || (type === Cell.Sand && h < 0.25)) {
          // Offshore the real bed is flat; deepen the colour with distance for a darker open sea.
          const bed = type === Cell.Sand || h > -3.9 ? -h : 4 + clamp01((f.shoreDistance(x, z) - 14) / 46) * 6;
          depth[k] = Math.max(0, bed);
          known[k] = 1;
        }
      }
    }
    // Push depth a few texels into dry land.
    for (let pass = 0; pass < 7; pass++) {
      const next = known.slice();
      for (let j = 1; j < n - 1; j++) {
        for (let i = 1; i < n - 1; i++) {
          const k = j * n + i;
          if (known[k]) continue;
          let sum = 0;
          let cnt = 0;
          for (const o of [-1, 1, -n, n]) {
            if (known[k + o]) {
              sum += depth[k + o]!;
              cnt++;
            }
          }
          if (cnt) {
            depth[k] = sum / cnt;
            next[k] = 1;
          }
        }
      }
      known.set(next);
    }
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * step - WORLD.half;
        const z = (j + 0.5) * step - WORLD.half;
        const k = j * n + i;
        data[k * 4] = Math.round(clamp01(f.shoreDistance(x, z) / 60) * 255);
        data[k * 4 + 1] = Math.round(clamp01(f.waveAmp(x, z)) * 255);
        data[k * 4 + 2] = Math.round(clamp01(depth[k]! / 10) * 255);
        data[k * 4 + 3] = 255;
      }
    }
    const t = new DataTexture(data, n, n, RGBAFormat, UnsignedByteType);
    t.wrapS = ClampToEdgeWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.needsUpdate = true;
    return t;
  }

  update(time: number, camera: PerspectiveCamera): void {
    this.time = time;
    const u = this.material.uniforms;
    u['uTime']!.value = time;
    // Snap the grid centre so vertices do not slide under the camera every frame.
    const snap = 4;
    (u['uCenter']!.value as Vector3).set(Math.round(camera.position.x / snap) * snap, 0, Math.round(camera.position.z / snap) * snap);
    u['uRadius']!.value = Math.max(1800, camera.far * 1.05);
    u['uFar']!.value = camera.far;
    const sky = this.sky;
    // Light on the water body: ambient plus sun, as one colour.
    const sunUp = smoothstep(-0.05, 0.25, sky.uniforms.uSunDir.value.y);
    this.lightColor.copy(sky.hemi.color).multiplyScalar(sky.hemi.intensity * 0.55);
    this.lightColor.r += sky.sun.color.r * sky.sun.intensity * 0.2 * sunUp;
    this.lightColor.g += sky.sun.color.g * sky.sun.intensity * 0.2 * sunUp;
    this.lightColor.b += sky.sun.color.b * sky.sun.intensity * 0.2 * sunUp;
    (u['uLight']!.value as Color).copy(this.lightColor);
    (u['uFogColor']!.value as Color).copy(sky.fog.color);
    u['uFogDensity']!.value = sky.fog.density;
  }

  /** Wave height (metres above sea level) at a world position, now or at time `t`. */
  height(x: number, z: number, t = this.time): number {
    const amp = this.field.waveAmp(x, z);
    if (amp <= 0.001) return 0;
    // Gerstner waves move points sideways too. One correction step finds the surface point above (x, z).
    let ox = 0;
    let oz = 0;
    for (const c of CONST) {
      const ph = c.k * (c.dx * x + c.dz * z) - c.w * t + c.phase;
      const cs = Math.cos(ph) * c.q * amp;
      ox += c.dx * cs;
      oz += c.dz * cs;
    }
    const px = x - ox;
    const pz = z - oz;
    let y = 0;
    for (const c of CONST) {
      const ph = c.k * (c.dx * px + c.dz * pz) - c.w * t + c.phase;
      y += Math.sin(ph) * c.a * amp;
    }
    return y;
  }

  /** Surface normal at a world position, for aligning floating things. */
  normal(x: number, z: number, out: Vector3, t = this.time): Vector3 {
    const amp = this.field.waveAmp(x, z);
    let nx = 0;
    let nz = 0;
    for (const c of CONST) {
      const ph = c.k * (c.dx * x + c.dz * z) - c.w * t + c.phase;
      const wa = c.k * c.a * amp * Math.cos(ph);
      nx -= c.dx * wa;
      nz -= c.dz * wa;
    }
    return out.set(nx, 1, nz).normalize();
  }

  /** Horizontal drift of the surface at a point, in m/s. Pushes floating things gently with the swell. */
  drift(x: number, z: number, out: Vector3, t = this.time): Vector3 {
    const amp = this.field.waveAmp(x, z);
    let vx = 0;
    let vz = 0;
    for (const c of CONST) {
      const ph = c.k * (c.dx * x + c.dz * z) - c.w * t + c.phase;
      const s = Math.sin(ph) * c.q * amp * c.w;
      vx += c.dx * s;
      vz += c.dz * s;
    }
    return out.set(vx, 0, vz);
  }

  get now(): number {
    return this.time;
  }
}
