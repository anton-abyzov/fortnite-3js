import {
  BackSide,
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import { clamp, clamp01, DEG, lerp, smoothstep } from '../core/math';
import type { QualityPreset } from '../core/settings';

/** Uniforms shared by the sky dome and anything that reflects the sky (water). */
export interface SkyUniforms {
  uSunDir: { value: Vector3 };
  uZenith: { value: Color };
  uHorizon: { value: Color };
  uGround: { value: Color };
  uSunColor: { value: Color };
  uGlow: { value: number };
  uNight: { value: number };
  uSkyTime: { value: number };
}

/** GLSL for the sky gradient, reused by the water shader for reflections. */
export const SKY_GLSL = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSunColor;
  uniform float uGlow;
  uniform float uNight;

  vec3 skyGradient(vec3 dir) {
    float h = dir.y;
    float up = clamp(h, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.42));
    float sd = max(dot(dir, uSunDir), 0.0);
    // Warm belt around the sun near the horizon, and the forward-scatter glow.
    float belt = pow(sd, 3.0) * pow(1.0 - up, 6.0);
    col += uSunColor * belt * 0.55 * uGlow;
    col += uSunColor * (pow(sd, 12.0) * 0.22 + pow(sd, 90.0) * 0.5) * uGlow;
    // Below the horizon fades to a darker ground tone.
    float below = clamp(-h * 14.0, 0.0, 1.0);
    col = mix(col, uGround, below);
    return col;
  }
`;

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w;
  }
`;

const SKY_FRAG = /* glsl */ `
  ${SKY_GLSL}
  uniform float uSkyTime;
  uniform float uSunDisc;
  uniform float uCloudCover;
  uniform vec3 uCloudLit;
  uniform vec3 uCloudShade;
  varying vec3 vDir;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      s += a * vnoise(p);
      p = p * 2.02 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return s;
  }
  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vDir);
    vec3 col = skyGradient(dir);
    float sd = max(dot(dir, uSunDir), 0.0);

    // Stars.
    if (uNight > 0.01 && dir.y > 0.0) {
      vec3 p = dir * 220.0;
      vec3 ip = floor(p);
      vec3 fp = fract(p) - 0.5;
      float h = hash31(ip);
      float star = step(0.9965, h) * smoothstep(0.32, 0.0, length(fp));
      float twinkle = 0.7 + 0.3 * sin(uSkyTime * 3.0 + h * 80.0);
      col += vec3(0.9, 0.95, 1.0) * star * twinkle * uNight * smoothstep(0.0, 0.25, dir.y) * 1.6;
    }

    // Sun disc, bright enough to bloom.
    float disc = smoothstep(0.99965, 0.99985, sd);
    col += uSunColor * disc * 28.0 * uSunDisc;

    // Cloud layer on a plane above the viewer.
    if (dir.y > 0.012) {
      vec2 uv = dir.xz / (dir.y + 0.16);
      vec2 wind = vec2(0.012, 0.004) * uSkyTime;
      float base = fbm(uv * 0.85 + wind);
      float detail = fbm(uv * 2.6 + wind * 1.7 + 4.0);
      float d = base * 0.72 + detail * 0.28;
      float cover = smoothstep(1.0 - uCloudCover, 1.0 - uCloudCover + 0.26, d);
      // Light from the sun side: thinner parts glow, thick parts shade.
      float thick = smoothstep(1.0 - uCloudCover + 0.05, 1.0 - uCloudCover + 0.5, d);
      vec3 cl = mix(uCloudLit, uCloudShade, thick * 0.75);
      cl += uSunColor * pow(sd, 6.0) * (1.0 - thick) * 0.7 * uGlow;
      float horizonFade = smoothstep(0.012, 0.16, dir.y);
      col = mix(col, cl, cover * horizonFade * 0.92);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface Key {
  /** Sun elevation in degrees. */
  e: number;
  zenith: [number, number, number];
  horizon: [number, number, number];
  sun: [number, number, number];
  sunIntensity: number;
  ambient: number;
  cloudLit: [number, number, number];
  cloudShade: [number, number, number];
}

/** Colour keys from high sun to night, in linear RGB. */
const KEYS: Key[] = [
  { e: 40, zenith: [0.11, 0.3, 0.74], horizon: [0.55, 0.76, 0.95], sun: [1, 0.96, 0.88], sunIntensity: 3.4, ambient: 1.0, cloudLit: [1, 1, 1], cloudShade: [0.62, 0.68, 0.78] },
  { e: 18, zenith: [0.13, 0.3, 0.7], horizon: [0.78, 0.74, 0.72], sun: [1, 0.86, 0.66], sunIntensity: 3.2, ambient: 0.92, cloudLit: [1, 0.95, 0.86], cloudShade: [0.6, 0.6, 0.72] },
  { e: 8, zenith: [0.16, 0.27, 0.62], horizon: [1.0, 0.62, 0.36], sun: [1, 0.66, 0.36], sunIntensity: 2.7, ambient: 0.78, cloudLit: [1, 0.74, 0.52], cloudShade: [0.52, 0.4, 0.56] },
  { e: 2, zenith: [0.14, 0.17, 0.46], horizon: [1.0, 0.4, 0.26], sun: [1, 0.42, 0.2], sunIntensity: 1.7, ambient: 0.6, cloudLit: [1, 0.5, 0.38], cloudShade: [0.4, 0.25, 0.45] },
  { e: -4, zenith: [0.05, 0.06, 0.22], horizon: [0.6, 0.22, 0.4], sun: [0.9, 0.3, 0.3], sunIntensity: 0.0, ambient: 0.42, cloudLit: [0.7, 0.3, 0.42], cloudShade: [0.16, 0.12, 0.3] },
  { e: -12, zenith: [0.012, 0.016, 0.06], horizon: [0.07, 0.07, 0.2], sun: [0.5, 0.6, 1], sunIntensity: 0.0, ambient: 0.3, cloudLit: [0.12, 0.13, 0.26], cloudShade: [0.03, 0.03, 0.09] },
];

function sample(e: number): Key {
  if (e >= KEYS[0]!.e) return KEYS[0]!;
  for (let i = 0; i + 1 < KEYS.length; i++) {
    const a = KEYS[i]!;
    const b = KEYS[i + 1]!;
    if (e <= a.e && e >= b.e) {
      const t = smoothstep(0, 1, (a.e - e) / (a.e - b.e));
      const mix3 = (p: [number, number, number], q: [number, number, number]): [number, number, number] => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
      return {
        e,
        zenith: mix3(a.zenith, b.zenith),
        horizon: mix3(a.horizon, b.horizon),
        sun: mix3(a.sun, b.sun),
        sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
        ambient: lerp(a.ambient, b.ambient, t),
        cloudLit: mix3(a.cloudLit, b.cloudLit),
        cloudShade: mix3(a.cloudShade, b.cloudShade),
      };
    }
  }
  return KEYS[KEYS.length - 1]!;
}

/**
 * Sky dome, sun and moon light, ambient light, fog, the reflection environment and the sun shadow.
 * One number drives all of it: the hour of day.
 */
export class Sky {
  readonly uniforms: SkyUniforms;
  readonly sun: DirectionalLight;
  readonly hemi: HemisphereLight;
  readonly fog: FogExp2;
  /** Direction from the scene toward the sun or the moon, whichever is lighting it. */
  readonly lightDir = new Vector3(0.4, 0.8, 0.3);
  /** 0 by day, 1 at night. Drives neon, lamps and lit windows. */
  night = 0;
  /** Hour of day, 0..24. */
  hour = 16.5;
  /** Extra fog and darkness inside the squall, 0..1. */
  storm = 0;
  private dome: Mesh;
  private material: ShaderMaterial;
  private pmrem: PMREMGenerator;
  private envScene = new Scene();
  private envTarget: WebGLRenderTarget | null = null;
  private envHour = -99;
  private envStorm = -1;
  private shadowExtent = 80;
  private readonly tmp = new Vector3();
  private readonly tmp2 = new Vector3();
  private readonly horizonColor = new Color();

  constructor(
    private renderer: WebGLRenderer,
    private scene: Scene,
    private quality: QualityPreset,
  ) {
    this.uniforms = {
      uSunDir: { value: new Vector3(0, 1, 0) },
      uZenith: { value: new Color() },
      uHorizon: { value: new Color() },
      uGround: { value: new Color() },
      uSunColor: { value: new Color() },
      uGlow: { value: 1 },
      uNight: { value: 0 },
      uSkyTime: { value: 0 },
    };
    this.material = new ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uSunDisc: { value: 1 },
        uCloudCover: { value: 0.46 },
        uCloudLit: { value: new Color(1, 1, 1) },
        uCloudShade: { value: new Color(0.6, 0.65, 0.75) },
      },
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });
    this.dome = new Mesh(new SphereGeometry(1, 48, 24), this.material);
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -1000;
    this.dome.name = 'sky';
    scene.add(this.dome);

    // The environment scene renders the same dome without the sun disc.
    const envDome = new Mesh(this.dome.geometry, this.material);
    envDome.scale.setScalar(50);
    this.envScene.add(envDome);
    this.pmrem = new PMREMGenerator(renderer);

    this.sun = new DirectionalLight(0xffffff, 3);
    this.sun.castShadow = quality.shadows;
    this.sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 1600;
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.06;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.hemi = new HemisphereLight(0xffffff, 0x886644, 1);
    scene.add(this.hemi);

    this.fog = new FogExp2(0xffffff, 0.0006);
    scene.fog = this.fog;
    this.setHour(this.hour, true);
  }

  applyQuality(quality: QualityPreset): void {
    this.quality = quality;
    this.sun.castShadow = quality.shadows;
    if (this.sun.shadow.mapSize.x !== quality.shadowMapSize) {
      this.sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  /** Sun elevation in degrees for an hour of day. The sun crosses from the ocean (east) to the bay (west). */
  private static sunAngles(hour: number): { elevation: number; azimuth: number } {
    // Noon at 13:00, sunset near 19:15, full night by 20:30.
    const t = (hour - 13) / 6.25;
    const elevation = 68 * Math.cos(clamp(t, -1.6, 1.6) * (Math.PI / 2));
    const below = t > 1 ? -(t - 1) * 46 : t < -1 ? (t + 1) * 46 : 0;
    // Azimuth swings from south-east in the morning to due west in the evening.
    const azimuth = lerp(-60, 96, clamp01((hour - 7) / 12.5));
    return { elevation: t > 1 || t < -1 ? below : elevation, azimuth };
  }

  setHour(hour: number, force = false): void {
    this.hour = hour;
    const { elevation, azimuth } = Sky.sunAngles(hour);
    const k = sample(elevation);
    const u = this.uniforms;

    // Direction to the sun. Azimuth 0 is south (+Z), 90 is west (-X).
    const el = elevation * DEG;
    const az = azimuth * DEG;
    u.uSunDir.value.set(-Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();

    const stormDim = 1 - this.storm * 0.45;
    u.uZenith.value.setRGB(k.zenith[0] * stormDim, k.zenith[1] * stormDim, k.zenith[2] * stormDim);
    u.uHorizon.value.setRGB(k.horizon[0] * stormDim, k.horizon[1] * stormDim, k.horizon[2] * stormDim);

    u.uSunColor.value.setRGB(k.sun[0], k.sun[1], k.sun[2]);
    u.uGlow.value = smoothstep(-8, 4, elevation) * (1 - this.storm * 0.6);
    this.night = 1 - smoothstep(-7, 6, elevation);
    u.uNight.value = this.night;

    const mu = this.material.uniforms;
    (mu['uCloudLit']!.value as Color).setRGB(k.cloudLit[0], k.cloudLit[1], k.cloudLit[2]);
    (mu['uCloudShade']!.value as Color).setRGB(k.cloudShade[0], k.cloudShade[1], k.cloudShade[2]);
    mu['uCloudCover']!.value = 0.46 + this.storm * 0.3;
    mu['uSunDisc']!.value = elevation > -1 ? 1 : 0;

    // Below the horizon the moon takes over as the shadow-casting light.
    const moonMix = smoothstep(1.5, -5, elevation);
    if (elevation > -1.5) this.lightDir.copy(u.uSunDir.value);
    else this.lightDir.set(0.42, 0.74, -0.52).normalize();
    // Keep the light off the horizon so shadows stay finite.
    if (this.lightDir.y < 0.1) {
      this.lightDir.y = 0.1;
      this.lightDir.normalize();
    }
    const sunI = k.sunIntensity * (1 - moonMix) * stormDim;
    const moonI = 0.62 * smoothstep(-2, -7, elevation);
    if (elevation > -1.5) {
      this.sun.color.setRGB(k.sun[0], k.sun[1], k.sun[2]);
      this.sun.intensity = sunI;
    } else {
      this.sun.color.setRGB(0.55, 0.66, 1);
      this.sun.intensity = moonI;
    }

    const amb = k.ambient * stormDim;
    // A blue floor under the night sky keeps unlit streets readable, as moonlit haze does.
    const nb = this.night;
    this.hemi.color.setRGB(lerp(k.zenith[0], k.horizon[0], 0.55) + nb * 0.1, lerp(k.zenith[1], k.horizon[1], 0.55) + nb * 0.14, lerp(k.zenith[2], k.horizon[2], 0.55) + nb * 0.3);
    this.hemi.groundColor.setRGB(0.42 * k.sun[0] + 0.1, 0.36 * k.sun[1] + 0.1, 0.28 * k.sun[2] + 0.12);
    this.hemi.intensity = 0.9 * amb + 0.25;
    this.scene.environmentIntensity = 0.55 * amb + 0.12;

    this.horizonColor.setRGB(k.horizon[0], k.horizon[1], k.horizon[2]).multiplyScalar(stormDim);
    this.fog.color.copy(this.horizonColor).lerp(u.uZenith.value, 0.25);
    // Below the horizon the dome is the haze colour, so distant sea and sky meet without a seam.
    u.uGround.value.copy(this.fog.color);
    this.fog.density = 0.00042 + this.storm * 0.0045 + this.night * 0.0002;

    if (force || Math.abs(hour - this.envHour) > 0.03 || Math.abs(this.storm - this.envStorm) > 0.08) this.bakeEnvironment();
  }

  private bakeEnvironment(): void {
    this.envHour = this.hour;
    this.envStorm = this.storm;
    const mu = this.material.uniforms;
    const disc = mu['uSunDisc']!.value as number;
    mu['uSunDisc']!.value = 0;
    const target = this.pmrem.fromScene(this.envScene, 0, 0.1, 200);
    mu['uSunDisc']!.value = disc;
    this.scene.environment = target.texture;
    this.envTarget?.dispose();
    this.envTarget = target;
  }

  /**
   * Per-frame update: keeps the dome on the camera and fits the shadow frustum around `focus`.
   * The frustum widens with camera height so the city is shadowed during the drop and detailed on foot.
   */
  update(time: number, camera: PerspectiveCamera, focus: Vector3, heightAboveGround: number): void {
    this.uniforms.uSkyTime.value = time;
    this.dome.position.copy(camera.position);
    this.dome.scale.setScalar(camera.far * 0.95);

    if (!this.quality.shadows) return;
    const wanted = clamp(70 + heightAboveGround * 1.9, 70, 720);
    // Change the extent in steps so the shadow texels do not crawl every frame.
    if (Math.abs(wanted - this.shadowExtent) > this.shadowExtent * 0.12) this.shadowExtent = wanted;
    const s = this.shadowExtent;
    const cam = this.sun.shadow.camera;
    if (cam.right !== s) {
      cam.left = -s;
      cam.right = s;
      cam.top = s;
      cam.bottom = -s;
      cam.updateProjectionMatrix();
      const texel = (2 * s) / this.sun.shadow.mapSize.x;
      this.sun.shadow.bias = -0.00012 - texel * 0.0016;
      this.sun.shadow.normalBias = 0.03 + texel * 0.9;
    }
    // Snap the shadow centre to whole texels in light space to stop shimmer when the camera moves.
    const texel = (2 * s) / this.sun.shadow.mapSize.x;
    const dir = this.lightDir;
    const right = this.tmp.set(dir.z, 0, -dir.x).normalize();
    const up = this.tmp2.crossVectors(dir, right).normalize();
    const cx = Math.round(focus.dot(right) / texel) * texel;
    const cy = Math.round(focus.dot(up) / texel) * texel;
    const cz = focus.dot(dir);
    const tx = right.x * cx + up.x * cy + dir.x * cz;
    const ty = right.y * cx + up.y * cy + dir.y * cz;
    const tz = right.z * cx + up.z * cy + dir.z * cz;
    this.sun.target.position.set(tx, ty, tz);
    this.sun.position.set(tx + dir.x * 800, ty + dir.y * 800, tz + dir.z * 800);
    this.sun.target.updateMatrixWorld();
  }

  dispose(): void {
    this.envTarget?.dispose();
    this.pmrem.dispose();
  }
}
