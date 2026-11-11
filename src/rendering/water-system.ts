import * as THREE from 'three';
import { clamp, saturate } from '../core/math';
import type { WaveSample } from '../types/game';
import type { SolarState } from './time-of-day';

interface WaveBand {
  dirX: number;
  dirZ: number;
  amplitude: number;
  wavelength: number;
  steepness: number;
  speed: number;
}

const WAVE_BANDS: readonly WaveBand[] = [
  { dirX: -0.92, dirZ: 0.39, amplitude: 0.24, wavelength: 22.0, steepness: 0.42, speed: 1.35 },
  { dirX: -0.78, dirZ: -0.62, amplitude: 0.14, wavelength: 13.5, steepness: 0.36, speed: 1.65 },
  { dirX: -0.35, dirZ: 0.93, amplitude: 0.075, wavelength: 7.4, steepness: 0.3, speed: 2.05 },
  { dirX: 0.58, dirZ: 0.81, amplitude: 0.04, wavelength: 4.1, steepness: 0.24, speed: 2.4 },
];

export const SEA_LEVEL_Y = 0.0;

/**
 * Canal attenuation: waves in the Atlantic Ocean (X > 68) have full swell,
 * while sheltered Intracoastal canals have calmer chop so boats dock cleanly.
 */
export function computeWaveAttenuation(x: number): number {
  return 0.28 + 0.72 * saturate((x - 42) / 48);
}

export function sampleWaterWave(
  x: number,
  z: number,
  timeSec: number,
  bedHeight = -4.0,
): WaveSample {
  const atten = computeWaveAttenuation(x);
  let height = SEA_LEVEL_Y;
  let dHx = 0;
  let dHz = 0;
  let crestAccum = 0;

  for (const band of WAVE_BANDS) {
    const k = (Math.PI * 2) / band.wavelength;
    const amp = band.amplitude * atten;
    const omega = Math.sqrt(9.81 * k) * band.speed * 0.45;
    const phase = k * (band.dirX * x + band.dirZ * z) - omega * timeSec;
    const s = Math.sin(phase);
    const c = Math.cos(phase);

    height += amp * s;
    dHx += k * amp * band.dirX * c;
    dHz += k * amp * band.dirZ * c;
    crestAccum += Math.max(0, s) * band.steepness;
  }

  const invLen = 1 / Math.hypot(dHx, 1, dHz);
  const normalX = -dHx * invLen;
  const normalY = invLen;
  const normalZ = -dHz * invLen;

  const waterDepth = Math.max(0, height - bedHeight);
  const shoreFoam = waterDepth < 1.15 ? (1 - waterDepth / 1.15) * (0.55 + 0.45 * Math.sin(timeSec * 3.4 + x * 0.7)) : 0;
  const foam = clamp(shoreFoam + Math.max(0, crestAccum - 0.52) * 0.9, 0, 1);

  return { height, normalX, normalY, normalZ, foam };
}

const WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vCrest;

  struct Band {
    vec2 dir;
    float amp;
    float wl;
    float steep;
    float spd;
  };

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float atten = 0.28 + 0.72 * clamp((wp.x - 42.0) / 48.0, 0.0, 1.0);

    Band bands[4];
    bands[0] = Band(vec2(-0.92, 0.39), 0.24, 22.0, 0.42, 1.35);
    bands[1] = Band(vec2(-0.78, -0.62), 0.14, 13.5, 0.36, 1.65);
    bands[2] = Band(vec2(-0.35, 0.93), 0.075, 7.4, 0.30, 2.05);
    bands[3] = Band(vec2(0.58, 0.81), 0.04, 4.1, 0.24, 2.40);

    float h = 0.0;
    vec2 grad = vec2(0.0);
    float crest = 0.0;
    vec2 horizDisp = vec2(0.0);

    for (int i = 0; i < 4; i++) {
      float k = 6.2831853 / bands[i].wl;
      float a = bands[i].amp * atten;
      float w = sqrt(9.81 * k) * bands[i].spd * 0.45;
      float ph = k * dot(bands[i].dir, wp.xz) - w * uTime;
      float s = sin(ph);
      float c = cos(ph);
      h += a * s;
      horizDisp += bands[i].dir * (bands[i].steep * a * c * 0.35);
      grad += bands[i].dir * (k * a * c);
      crest += max(0.0, s) * bands[i].steep;
    }

    wp.xz += horizDisp;
    wp.y += h;
    vWorldPos = wp.xyz;
    vNormalW = normalize(vec3(-grad.x, 1.0, -grad.y));
    vCrest = crest;

    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyZenith;
  uniform vec3 uSkyHorizon;
  uniform float uNightFactor;

  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vCrest;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float causticPattern(vec2 uv, float t) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float minDist = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        float h = hash2(i + neighbor);
        vec2 pt = neighbor + 0.5 + 0.42 * sin(t * 1.45 + 6.2831 * vec2(h, fract(h * 17.3)));
        minDist = min(minDist, length(pt - f));
      }
    }
    return pow(clamp(1.0 - minDist, 0.0, 1.0), 3.4);
  }

  // Approximate coastal bathymetry matching Miami layout (beach slope at X=58..92, canals)
  float estimateDepth(vec2 xz) {
    if (xz.x > 56.0) {
      return clamp((xz.x - 56.0) * 0.22 + 0.35, 0.15, 9.0);
    }
    return 3.4;
  }

  void main() {
    // High-frequency capillary micro-ripples
    vec2 uv1 = vWorldPos.xz * 0.36 + vec2(uTime * 0.18, -uTime * 0.14);
    vec2 uv2 = vWorldPos.xz * 0.67 + vec2(-uTime * 0.22, uTime * 0.19);
    vec3 ripple = vec3(
      sin(uv1.x * 4.2 + uv2.y * 2.7) * 0.045 + cos(uv2.x * 5.1) * 0.03,
      1.0,
      cos(uv1.y * 4.5 - uv2.x * 2.3) * 0.045 + sin(uv2.y * 4.9) * 0.03
    );
    vec3 N = normalize(mix(vNormalW, normalize(ripple), 0.36));
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 R = reflect(-V, N);

    // Schlick Fresnel for water (F0 = 0.02)
    float NoV = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - NoV, 5.0);

    // Sky + Miami warm city reflection approximation
    float reflY = clamp(R.y, 0.0, 1.0);
    vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(reflY, 0.55));
    float sunGlow = pow(max(0.0, dot(R, normalize(uSunDir))), 240.0);
    skyRefl += uSunColor * sunGlow * (2.8 * (1.0 - uNightFactor * 0.7));

    // Subtle neon district bounce in canals at dusk/night
    if (vWorldPos.x < 58.0 && uNightFactor > 0.15) {
      float neonWave = 0.5 + 0.5 * sin(vWorldPos.z * 0.12 + N.x * 6.0);
      vec3 neonColor = mix(vec3(0.06, 0.78, 0.86), vec3(1.0, 0.34, 0.48), neonWave);
      skyRefl += neonColor * uNightFactor * 0.38;
    }

    // Beer-Lambert turquoise water absorption + underwater sandbar caustics
    float depth = estimateDepth(vWorldPos.xz);
    vec3 shallowTeal = vec3(0.11, 0.76, 0.74);
    vec3 deepAtlantic = vec3(0.02, 0.19, 0.33);
    float absorb = 1.0 - exp(-depth * 0.38);
    vec3 bodyColor = mix(shallowTeal, deepAtlantic, absorb);

    float caust = causticPattern(vWorldPos.xz * 0.42 + N.xz * 0.8, uTime) * exp(-depth * 0.32);
    bodyColor += uSunColor * caust * 0.42 * (1.0 - uNightFactor * 0.8);
    bodyColor *= mix(1.0, 0.22, uNightFactor);

    vec3 color = mix(bodyColor, skyRefl, clamp(fresnel * 0.92, 0.04, 0.94));

    // Shoreline surf & wave-crest whitewater foam
    float shoreMask = smoothstep(1.25, 0.15, depth);
    float surfPulse = 0.5 + 0.5 * sin(vWorldPos.x * 2.2 - uTime * 3.6 + sin(vWorldPos.z * 0.25) * 2.0);
    float foam = clamp(shoreMask * surfPulse * 0.85 + max(0.0, vCrest - 0.55) * 0.9, 0.0, 1.0);
    vec3 foamColor = mix(vec3(0.94, 0.97, 0.99), vec3(0.26, 0.34, 0.44), uNightFactor);
    color = mix(color, foamColor, foam);

    float alpha = clamp(0.76 + depth * 0.08 + foam * 0.22, 0.78, 0.98);
    gl_FragColor = vec4(color, alpha);
  }
`;

export class WaterSystem {
  public readonly realtimeMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  public readonly pathTracerMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;

  private readonly uniforms: {
    uTime: { value: number };
    uSunDir: { value: THREE.Vector3 };
    uSunColor: { value: THREE.Color };
    uSkyZenith: { value: THREE.Color };
    uSkyHorizon: { value: THREE.Color };
    uNightFactor: { value: number };
  };

  constructor(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(560, 560, 180, 180);
    geo.rotateX(-Math.PI * 0.5);

    this.uniforms = {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0.5, 0.6, 0.4) },
      uSunColor: { value: new THREE.Color(0xfff1dc) },
      uSkyZenith: { value: new THREE.Color(0x1668c4) },
      uSkyHorizon: { value: new THREE.Color(0x9be2f5) },
      uNightFactor: { value: 0 },
    };

    const shaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: WATER_VERTEX_SHADER,
      fragmentShader: WATER_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });

    this.realtimeMesh = new THREE.Mesh(geo, shaderMat);
    this.realtimeMesh.position.set(45, SEA_LEVEL_Y, 0);
    this.realtimeMesh.name = 'miami_water_realtime';
    this.realtimeMesh.renderOrder = 2;
    scene.add(this.realtimeMesh);

    const ptGeo = new THREE.PlaneGeometry(560, 560, 128, 128);
    ptGeo.rotateX(-Math.PI * 0.5);
    const ptMat = new THREE.MeshPhysicalMaterial({
      color: 0xbaf8ff,
      roughness: 0.045,
      metalness: 0.0,
      ior: 1.333,
      transmission: 0.9,
      thickness: 2.8,
      attenuationColor: new THREE.Color(0x12a8b8),
      attenuationDistance: 4.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    });

    this.pathTracerMesh = new THREE.Mesh(ptGeo, ptMat);
    this.pathTracerMesh.position.copy(this.realtimeMesh.position);
    this.pathTracerMesh.name = 'miami_water_pathtraced';
    this.pathTracerMesh.visible = false;
    scene.add(this.pathTracerMesh);
  }

  update(timeSec: number, solar: SolarState): void {
    this.uniforms.uTime.value = timeSec;
    this.uniforms.uSunDir.value.copy(solar.sunDirection);
    this.uniforms.uSunColor.value.copy(solar.sunColor);
    this.uniforms.uSkyZenith.value.copy(solar.skyZenithColor);
    this.uniforms.uSkyHorizon.value.copy(solar.skyHorizonColor);
    this.uniforms.uNightFactor.value = solar.nightFactor;
  }

  bakePathTracerWaveSurface(timeSec: number): void {
    const pos = this.pathTracerMesh.geometry.attributes.position as THREE.BufferAttribute;
    const offsetX = this.pathTracerMesh.position.x;
    const offsetZ = this.pathTracerMesh.position.z;

    for (let i = 0; i < pos.count; i++) {
      const wx = pos.getX(i) + offsetX;
      const wz = pos.getZ(i) + offsetZ;
      const sample = sampleWaterWave(wx, wz, timeSec);
      pos.setY(i, sample.height);
    }
    pos.needsUpdate = true;
    this.pathTracerMesh.geometry.computeVertexNormals();
  }
}
